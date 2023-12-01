import {mkdirSync, readFileSync, readdirSync, writeFileSync} from 'fs'
import args from './args.js'
import {importerClient, tellerClient} from './axios.js'
import db from './db.js'
import {generateTransactionId, getActiveAccounts, lastNDays} from './util.js'
import {stringify} from 'csv/sync'

const {days, write, sync, useLocalData} = args
const institutions = db.get('institutions')
const importerUrl = db.get('importerUrl')
const accounts = getActiveAccounts()

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
  'Unique Id',
  'Transaction Id',
  'Account Id',
  'Account Name',
  'Counterparty',
]

const transactionRequests = accounts.map(async (account) => {
  let data

  if (useLocalData) {
    const path = `data/import/${account.id}`
    const files = readdirSync(path)
    data = files
      .map((file) => JSON.parse(readFileSync(`${path}/${file}`)))
      .flat()
  } else {
    const {token} = institutions[account.institution.id]
    data = await tellerClient
      .get(account.links.transactions, {auth: {username: token}})
      .then(({data}) => data)
      .catch(({response: {data}}) => {
        console.log(
          `ERROR: ${data.error?.message}`,
          `(${account.name} ${account.last_four})`,
          `Enrollment ID: ${account.enrollment_id}`,
        )
        return []
      })
  }

  const transactions = data
    .filter(({status}) => status === 'posted')
    .filter(lastNDays(days))

  if (write) {
    const path = `data/export/${account.id}`
    mkdirSync(path, {recursive: true})
    writeFileSync(
      `${path}/${fileName} ${account.name} (${account.last_four}).json`,
      JSON.stringify(transactions, null, 2),
    )
  }

  return transactions.map(({id, type, date, amount, description, details}) => [
    date,
    // Invert the amount for credit accounts because Firefly treats them as assets.
    amount * (account.type === 'credit' ? -1 : 1),
    description,
    details.category,
    type,
    generateTransactionId(date, amount, description),
    id,
    account.id,
    `${account.name} (...${account.last_four})`,
    details.counterparty?.name,
  ])
})

const transactions = (await Promise.all(transactionRequests)).flat()

if (transactions.length) {
  const payload = stringify([headers, ...transactions])

  if (write) {
    writeFileSync(`data/export/${fileName}.csv`, payload)
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
