import {mkdirSync, readFileSync, writeFileSync} from 'fs'
import {readFile} from 'fs/promises'
import args from './args.js'
import {importerClient, tellerClient} from './axios.js'
import db from './db.js'
import {getActiveAccounts, lastNDays} from './util.js'
import {stringify} from 'csv/sync'
import path from 'path'

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
        console.log(
          `ERROR: ${error.response.data.error.message}`,
          `(${account.name} ${account.last_four})`,
          `Enrollment ID: ${account.enrollment_id}`,
        )

      return []
    })

  if (write) {
    mkdirSync(basePath, {recursive: true})
    writeFileSync(
      path.join(basePath, `${account.id}.json`),
      JSON.stringify({data}, null, 2),
    )
  }

  return data
    .filter(({status}) => status === 'posted')
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
    writeFileSync(path.join(basePath, `${fileName}.csv`), payload)
  }

  if (sync) {
    const formData = new FormData()
    formData.append('importable', new Blob([payload]))
    formData.append('json', new Blob([readFileSync('data/import_config.json')]))

    try {
      await importerClient.post(importerUrl, formData)
      console.log('Complete')
    } catch (error) {
      console.log(error)
    }
  }
}
