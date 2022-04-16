const mongoose = require('mongoose');

const kilometrikisa = require('kilometrikisa-client');
const SyncModel = require('./models/SyncModel.js');
const User = require('./models/UserModel.js');

const logger = require('./helpers/logger');
const { isDev } = require('./helpers/Helpers');

var cron = {
  users: [],

  run: async function () {
    logger.info('Cronjob running...');

    // Connect to MongoDB.
    await mongoose.connect(
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

    logger.info('Connected to DB.');

    // Find all user having autosync enabled.
    const users = await User.find({
      autosync: true,
      kilometrikisaUsername: { $exists: true },
      kilometrikisaPassword: { $exists: true },
    });
    // DEBUG:
    // users = users.slice(0, 5);

    this.users = users;

    // Start syncing.
    logger.info('Found ' + users.length + ' users to sync...');

    await this.syncNextUser();

    // Loop through users.
    // users.forEach(function(user) {
    // });
  },

  /**
   * Get next user from the list and sync it. If users doesn't exist, we are done!
   */
  syncNextUser: async function () {
    // All done!
    if (this.users.length == 0) {
      mongoose.disconnect();
      logger.info(this.users.length + ' users left in queue.');
      logger.info('Disconnected from DB.');
      return false;
    }

    logger.info(this.users.length + ' users left in queue.');

    // Get next.
    var user = this.users.pop();

    // Sync!
    await this.syncUser(
      user,
      function () {
        setTimeout(
          async function () {
            await this.syncNextUser();
          }.bind(this),
          3500,
        );
      }.bind(this),
    );
  },

  /**
   * Sync given user.
   */
  // TODO: Remove callbacks
  syncUser: async function (user, callback) {
    logger.info('!! Syncing for user ' + user.kilometrikisaUsername);

    try {
      const session = await kilometrikisa.kilometrikisaSession({
        username: user.kilometrikisaUsername,
        password: user.getPassword(),
      });

      logger.info('Login complete: ' + user.kilometrikisaUsername);

      // Save login token.
      user.set('kilometrikisaToken', session.sessionCredentials.token);
      user.set('kilometrikisaSessionId', session.sessionCredentials.sessionId);
      await user.updateToken();

      // Do sync.
      SyncModel.doSync(
        user.stravaUserId,
        user.stravaToken,
        user.kilometrikisaToken,
        user.kilometrikisaSessionId,
        user.ebike,
        function (activities) {
          logger.info(Object.keys(activities).length + ' activities synced');

          callback();
        }.bind(this),
        function (error) {
          logger.warn('Activities sync failed for user ' + user.kilometrikisaUsername, error);

          callback();
        }.bind(this),
      );
    } catch (err) {
      logger.warn('User ' + user.kilometrikisaUsername + ' login failed.');
      callback();
    }
  },
};

module.exports = cron;
