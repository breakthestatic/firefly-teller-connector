import db from './db.js'
import {tellerClient} from './axios.js'

const institutions = db.get('institutions')
const accounts = db.get('accounts')

const updatedAccounts = await Promise.all(
  Object.values(institutions).map(({token}) =>
    tellerClient
      .get('/accounts', {auth: {username: token}})
      .then((response) => response.data),
  ),
)

db.set(
  'accounts',
  updatedAccounts.flat().map((account) => ({
    enabled:
      // Set to disabled initially but respect status for existing accounts
      accounts.find(({account: {id}}) => id === account.id)?.enabled ?? false,
    account,
  })),
)
