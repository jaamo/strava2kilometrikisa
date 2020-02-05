const CronJob = require('cron').CronJob;
const Cron = require('./cron');

const time = process.env.CRON_TIME_SYNC || '0 4 * * *';

console.log(`Worker running [${time}]...`);

new CronJob(
  time,
  function() {
    Cron.run();
  },
  null,
  true,
  'Europe/Helsinki',
);
