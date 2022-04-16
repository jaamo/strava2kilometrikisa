const CronJob = require('cron').CronJob;
const Cron = require('./cron');
const logger = require('./helpers/logger');

const time = process.env.CRON_TIME_SYNC || '0 4 * * *';

logger.info(`Worker running [${time}]...`);

new CronJob(
  time,
  function () {
    Cron.run();
  },
  null,
  true,
  'Europe/Helsinki',
);
