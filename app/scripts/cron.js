import {fork} from 'child_process'
import {CronJob} from 'cron'

const {
  CRON_TIME,
  TIME_ZONE,
  DAYS_TO_FETCH,
  WRITE_TO_FILE,
  USE_LOCAL_DATA,
  SYNC,
} = process.env

export default CronJob.from({
  cronTime: CRON_TIME,
  onTick: function () {
    fork(
      'scripts/transactions.js',
      [
        `--days ${DAYS_TO_FETCH}`,
        SYNC && '--sync',
        WRITE_TO_FILE && '--write',
        USE_LOCAL_DATA && '--use-local-data',
      ].filter(Boolean),
    )
  },
  timeZone: TIME_ZONE,
})
