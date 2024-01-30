import path from 'path'
import {readFile, mkdir, writeFile} from 'fs/promises'
import {stringify} from 'csv/sync'
import db from './db.js'
import args from './args.js'
import {importerClient, tellerClient} from './axios.js'
import {getActiveAccounts, lastNDays, log} from './util.js'

const {days, write, sync, useLocalData} = args
const institutions = db.get('institutions')
const importerUrl = db.get('importerUrl')
const accounts = getActiveAccounts()
const basePath = './data/transactions'
const fileName = new Date()
  .toISOString()
  .replaceAll(/[:.]/g, '-')
  .split('T')
  .join(' ')

const headers = [
  'Date',
  'Amount',
  'Description',
  'Category',
  'Transaction Type',
  'Transaction Id',
  'Account Name',
  'Counterparty',
]

if (write) await mkdir(basePath, {recursive: true})

log('Starting sync')

const transactionRequests = accounts.map(async (account) => {
  const source = useLocalData
    ? readFile(path.join(basePath, `${account.id}.json`)).then(JSON.parse)
    : tellerClient.get(account.links.transactions, {
        auth: {username: institutions[account.institution.id].token},
      })

  const data = await source
    .then(({data}) => data)
    .catch((error) => {
      if (error?.response?.data?.error?.message)
        log(
          `ERROR: ${error.response.data.error.message}`,
          `(${account.name} ${account.last_four})`,
          `Enrollment ID: ${account.enrollment_id}`
        )

      return []
    })

  if (write && !useLocalData) {
    writeFile(
      path.join(basePath, `${account.id}.json`),
      JSON.stringify({data}, null, 2)
    )
  }

  return data
    .filter(lastNDays(days))
    .map(({id, type, date, amount, description, details}) => [
      date,
      // Invert the amount for credit accounts because Firefly treats them as assets.
      amount * (account.type === 'credit' ? -1 : 1),
      description,
      details.category,
      type,
      id,
      `${account.name} (...${account.last_four})`,
      details.counterparty?.name,
    ])
})

const transactions = (await Promise.all(transactionRequests)).flat()

if (transactions.length) {
  const payload = stringify([
    headers,
    ...transactions.sort(([a], [b]) => new Date(b) - new Date(a)),
  ])

  if (write) {
    writeFile(path.join(basePath, `${fileName}.csv`), payload)
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
