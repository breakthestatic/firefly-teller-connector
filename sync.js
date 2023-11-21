import {readFileSync} from 'fs'
import {importerClient, tellerClient} from './axios.js'
import db from './db.js'
import {generateTransactionId, getActiveAccounts, lastNDays} from './util.js'

const institutions = db.get('institutions')
const importerUrl = db.get('importerUrl')
const accounts = getActiveAccounts()

const transactionRequests = accounts.map(async (account) => {
  const {token} = institutions[account.institution.id]
  const {data} = await tellerClient
    .get(account.links.transactions, {auth: {username: token}})
    .catch(({response: {data}}) => {
      console.log(
        `ERROR: ${data.error?.message}`,
        `(${account.name} ${account.last_four})`,
        `Enrollment ID: ${account.enrollment_id}`,
      )
      return {data: []}
    })

  return data
    .filter(({status}) => status === 'posted')
    .filter(lastNDays(5))
    .map(({date, amount, description, details: {category}}) =>
      [
        date,
        // We need to invert the amount for credit accounts because Firefly
        // treats them as assets for some odd reason.
        amount * (account.type === 'credit' ? -1 : 1),
        description,
        category,
        generateTransactionId(date, amount, description),
        `${account.institution.name} ${account.name} (${account.last_four})`,
      ].join(),
    )
})

const importable = (await Promise.all(transactionRequests)).flat().join('\n')

if (importable.length) {
  const formData = new FormData()
  formData.append('importable', new Blob([importable]))
  formData.append('json', new Blob([readFileSync('data/import_config.json')]))

  try {
    await importerClient.post(importerUrl, formData)
    console.log('complete')
  } catch (error) {
    console.log(error)
  }
}
