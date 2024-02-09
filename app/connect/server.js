import express from 'express'
import path from 'path'
import db from '../scripts/db.js'
import {tellerClient} from '../scripts/axios.js'

const __dirname = new URL('.', import.meta.url).pathname
const port = 8080

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.join(new URL('.', import.meta.url).pathname, '/views'))

app.get('/', (req, res) => {
  const applicationId = db.get('tellerApplicationId')

  if (applicationId) {
    res.render('pages/index', {applicationId: db.get('tellerApplicationId')})
  } else {
    res.redirect('/settings')
  }
})

app.get('/settings', (_, res) => {
  const applicationId = db.get('tellerApplicationId')
  const fireflyToken = db.get('fireflyToken')
  const importerUrl = db.get('importerUrl')

  res.render('pages/settings', {applicationId, fireflyToken, importerUrl})
})

app.post('/settings', (req, res) => {
  const {applicationId, fireflyToken, importerUrl} = req.body

  db.set('tellerApplicationId', applicationId)
  db.set('fireflyToken', fireflyToken)
  db.set('importerUrl', importerUrl)

  res.render('pages/settings', {
    applicationId,
    fireflyToken,
    importerUrl,
    saved: true,
  })
})

app.post('/api/enrollments', async (req, res) => {
  const accounts = db.get('accounts') || []
  const {accessToken, enrollment} = req.body
  const institutionKey = enrollment.institution.name
    .toLowerCase()
    .replaceAll(/\s+/g, '_')

  const institutions = {
    ...db.get('institutions'),
    [institutionKey]: {token: accessToken},
  }

  const updatedAccounts = await Promise.all(
    Object.values(institutions).map(({token}) =>
      tellerClient
        .get('/accounts', {auth: {username: token}})
        .then((response) => response.data)
    )
  )

  db.set('institutions', institutions)
  db.set(
    'accounts',
    updatedAccounts.flat().map((account) => ({
      enabled:
        // Set to disabled initially but respect status for existing accounts
        accounts.find(({account: {id}}) => id === account.id)?.enabled ?? false,
      account,
    }))
  )

  res.send('success')
})

app.use('/static', express.static(path.join(__dirname, '/static')))

app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
