import mongoose from 'mongoose';
import { isDev } from '../../helpers/helpers';

export function getDbConnection() {
  // Connect to MongoDB.
  return mongoose.connect(
    `${isDev() ? 'mongodb://' : 'mongodb+srv://'}` +
      process.env.KILOMETRIKISA_DBUSER +
      ':' +
      process.env.KILOMETRIKISA_DBPASSWORD +
      '@' +
      process.env.KILOMETRIKISA_DBHOST +
      '/' +
      process.env.KILOMETRIKISA_DB +
      '?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true, authSource: isDev() ? 'admin' : undefined },
  );
}

export function disconnectDb() {
  return mongoose.disconnect();
}
