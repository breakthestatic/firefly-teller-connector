import express from 'express'
import path from 'path'
import {readFileSync} from 'fs'
import compression from 'compression'
import appRoot from 'app-root-path'
import settings from './api/settings.js'

const clientRoot = appRoot.resolve('/dist')
const port = 8080

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(compression())

// serve static assets normally
app.use(express.static(clientRoot))

app.use('/api/settings', settings)

// serve all other requests with app main entry point
app.get('*', function (request, response) {
  response.send(readFileSync(path.join(clientRoot, 'index.html'), 'utf8'))
})

app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
