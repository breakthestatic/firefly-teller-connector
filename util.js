import {createHash} from 'crypto'
import db from './db.js'

export const generateTransactionId = (...data) =>
  createHash('sha256').update(data.join()).digest('hex')

export const getActiveAccounts = () =>
  db
    .get('accounts')
    .filter(({enabled}) => enabled)
    .map(({account}) => account)

export const lastNDays = (days = 10) => {
  const cutoff = new Date(new Date().setHours(0, 0, 0, 0)).setDate(
    new Date().getDate() - days,
  )
  return ({date}) => new Date(date) >= cutoff
}
