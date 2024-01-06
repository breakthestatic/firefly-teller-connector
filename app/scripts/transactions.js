import path from 'path'
import {readFile, mkdir, writeFile} from 'fs/promises'
import {stringify} from 'csv/sync'
import db from './db.js'
import args from './args.js'
import {importerClient, tellerClient} from './axios.js'
import {
  getActiveAccounts,
  log,
  withinDays,
  getAccountName,
  byLastDays,
} from './util.js'

const {days, write, sync, useLocalData} = args
const institutions = db.get('institutions')
const importerUrl = db.get('importerUrl')
const accounts = getActiveAccounts()
const basePath = './data/transactions'

if (write) await mkdir(basePath, {recursive: true})

log('Starting sync')

const requests = accounts.map(async (account) => {
  const source = useLocalData
    ? readFile(path.join(basePath, `${account.id}.json`)).then(JSON.parse)
    : tellerClient.get(account.links.transactions, {
        auth: {username: institutions[account.institution.id].token},
      })

  const data = await source
    .then(({data}) => data)
    .catch((error) => {
      if (error?.response?.data?.error?.message) {
        log(`ERROR: ${error.response.data.error.message}`)
        log(`Enrollment ID: ${account.enrollment_id}`)
      }
      return []
    })

  if (write && !useLocalData) {
    writeFile(
      path.join(basePath, `${account.id}.json`),
      JSON.stringify({data}, null, 2)
    )
  }

  return data
    .filter(({status}) => status === 'posted')
    .filter(byLastDays(days))
    .map(({amount, ...transaction}) => ({
      ...transaction,
      // Invert amount for credit accounts because Firefly treats them as assets.
      amount: amount * (account.type === 'credit' ? -1 : 1),
    }))
})

const transactionsWithOpposing = (await Promise.all(requests))
  .flat()
  .reduce((acc, transaction, _, transactions) => {
    const {id, date, amount} = transaction
    const exists = acc.some((entries) => entries.map(({id}) => id).includes(id))
    const opposingTransaction = transactions.find(
      (cursor) => cursor.amount === -amount && withinDays(cursor.date, date, 4)
    )

    if (!exists) acc.push([transaction, opposingTransaction])

    return acc
  }, [])

const transactions = transactionsWithOpposing.map(
  ([
    {id, account_id, type, date, amount, description, details},
    opposingTransaction,
  ]) => [
    date,
    amount,
    description,
    opposingTransaction ? 'transfer' : details.category,
    type,
    id,
    getAccountName(account_id),
    opposingTransaction
      ? getAccountName(opposingTransaction.account_id)
      : details.counterparty?.name,
  ]
)

const duplicates = transactionsWithOpposing
  .map(([, opposingTransaction]) => opposingTransaction?.id)
  .filter(Boolean)

log('Duplicates:', duplicates)

if (transactions.length) {
  const payload = stringify(
    transactions.sort(([a], [b]) => new Date(b) - new Date(a))
  )

  if (write) {
    writeFile(path.join(basePath, `${Date.now()}.csv`), payload)
  }

  if (sync) {
    const data = new FormData()
    data.append('importable', new Blob([payload]))
    data.append('json', new Blob([await readFile('data/import_config.json')]))

    try {
      await importerClient.post(importerUrl, data)
    } catch (error) {
      log(error)
    }
  }
}

log('Sync complete')
