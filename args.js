import yargs from 'yargs'

export default yargs(process.argv)
  .option('write', {
    description: 'Write to file',
    type: 'boolean',
  })
  .option('sync', {
    description: 'Sync with Firefly III',
    type: 'boolean',
  })
  .option('days', {
    description: 'Number of days to fetch',
    type: 'number',
  })
  .option('use-local-data', {
    description: 'Use local file data instead of fetching',
    type: 'boolean',
  })
  .help().argv
