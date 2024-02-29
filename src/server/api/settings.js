import {Router} from 'express'
import config from '/src/server/config'

const router = new Router()

router.get('/', async (req, res) => {
  const data = await config.getData('/')
  res.send(data)
})

router.put('/', async (req, res) => {
  await config.push('/', req.body)
  res.send({})
})

export default router
