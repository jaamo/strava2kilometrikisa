const CronJob = require('cron').CronJob;
const Cron = require('./cron');

console.log('Worker running...');

new CronJob(
  '0 4 * * *',
  function() {
    Cron.run();
  },
  null,
  true,
  'Europe/Helsinki',
);
