import {fork} from 'child_process'
import {CronJob} from 'cron'

const {CRON_TIME, TZ, DAYS, WRITE, USE_LOCAL_DATA, SYNC} = process.env

const args = [
  `--days=${DAYS}`,
  SYNC?.toLowerCase() === 'true' && '--sync',
  WRITE && '--write',
  USE_LOCAL_DATA && '--use-local-data',
].filter(Boolean)

export default CronJob.from({
  cronTime: CRON_TIME,
  onTick: function () {
    fork('scripts/transactions.js', args)
  },
  timeZone: TZ,
})
