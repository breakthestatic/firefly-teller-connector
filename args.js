import yargs from 'yargs'

export default yargs(process.argv)
  .option('write', {
    description: 'Skip writing files',
    type: 'boolean',
    default: true,
  })
  .option('sync', {
    description: 'Skip syncing with Firefly III',
    type: 'boolean',
    default: true,
  })
  .option('days', {
    description: 'Number of days to fetch',
    type: 'number',
    default: 5,
  })
  .option('use-local-data', {
    description: 'Use local file data instead of fetching',
    type: 'boolean',
    default: false,
  })
  .help().argv
