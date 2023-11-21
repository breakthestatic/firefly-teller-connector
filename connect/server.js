import express from 'express'
import path from 'path'
import db from '../db.js'

const __dirname = new URL('.', import.meta.url).pathname
const port = 8080

const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.join(new URL('.', import.meta.url).pathname, '/views'))

app.get('/', (req, res) => {
  res.render('pages/index', {
    applicationId: db.get('teller_app_id'),
  })
})

app.use('/static', express.static(path.join(__dirname, '/static')))

app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
