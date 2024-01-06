import db from './db.js'

export const getActiveAccounts = () =>
  db
    .get('accounts')
    .filter(({enabled}) => enabled)
    .map(({account}) => account)

export const byLastDays = (days) => {
  // Return all when days isn't passed
  if (!days) return () => true

  const cutoff = new Date(new Date().setHours(0, 0, 0, 0)).setDate(
    new Date().getDate() - days
  )
  return ({date}) => new Date(date) >= cutoff
}

export const withinDays = (a, b, days = 1) =>
  Math.abs(new Date(a) - new Date(b)) < days * 24 * 60 * 60 * 1000

export const getAccount = (id) =>
  db.get('accounts').find(({account}) => account.id === id)?.account

export const getAccountName = (id) => {
  const account = getAccount(id)

  return account ? `${account.name} (...${account.last_four})` : ''
}

export const log = (...args) => {
  console.log(
    new Date().toLocaleString('en-us', {timeZone: process.env.TZ}),
    ...args
  )
}
