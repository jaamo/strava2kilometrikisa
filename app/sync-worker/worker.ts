import { CronJob } from 'cron';
import { syncAllUsers } from './cron';
import logger from '../helpers/logger';

const time = process.env.CRON_TIME_SYNC || '0 4 * * *';

logger.info(`Worker running [${time}]...`);

new CronJob(
  time,
  function () {
    syncAllUsers();
  },
  null,
  true,
  'Europe/Helsinki',
);
