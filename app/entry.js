import {fork} from 'child_process'
import cron from './scripts/cron.js'

cron.start()
fork('./connect/server.js')
