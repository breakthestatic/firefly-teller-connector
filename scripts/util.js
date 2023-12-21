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
    new Date().getDate() - days,
  )
  return ({date}) => new Date(date) >= cutoff
}

export const log = (...args) => {
  const date = new Date()
  console.log(
    `${date.toISOString().split('T')[0]} ${date.toLocaleTimeString()}`,
    ...args,
  )
}
