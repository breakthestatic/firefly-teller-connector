import db from './db.js'

export const getActiveAccounts = () =>
  db
    .get('accounts')
    .filter(({enabled}) => enabled)
    .map(({account}) => account)

export const lastNDays = (days) => {
  // Return all when days isn't passed
  if (!days) return () => true

  const cutoff = new Date(new Date().setHours(0, 0, 0, 0)).setDate(
    new Date().getDate() - days
  )
  return ({date, status, details: {processing_status}}) =>
    new Date(date) >= cutoff &&
    status === 'posted' &&
    processing_status === 'complete'
}

export const log = (...args) => {
  console.log(
    new Date().toLocaleString('en-us', {timeZone: process.env.TZ}),
    ...args
  )
}
