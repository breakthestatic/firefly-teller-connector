import {JsonDB, Config} from 'node-json-db'
import appRoot from 'app-root-path'

export default new JsonDB(
  new Config(appRoot.resolve('/data/config.json'), true, true)
)
