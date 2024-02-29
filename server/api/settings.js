import {Router} from 'express'
import config from '../config.js'

const router = new Router()

router.get('/', async (req, res) => {
  const data = await config.getData('/')
  res.send(data)
})

export default router
