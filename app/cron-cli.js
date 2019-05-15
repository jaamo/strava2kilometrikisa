/**
 * This file is for testing the sync from the command line.
 */

const mongoose = require('mongoose');
mongoose.connect(
  'mongodb://' +
    process.env.KILOMETRIKISA_DBUSER +
    ':' +
    process.env.KILOMETRIKISA_DBPASSWORD +
    '@' +
    process.env.KILOMETRIKISA_DBHOST +
    '/' +
    process.env.KILOMETRIKISA_DB,
);
const Cron = require('./cron');
Cron.run();
