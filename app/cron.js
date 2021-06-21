const mongoose = require('mongoose');

const Kilometrikisa = require('./lib/kilometrikisa.js');
const SyncModel = require('./models/SyncModel.js');
const User = require('./models/UserModel.js');

const logger = require('./helpers/logger');

var cron = {
  users: [],

  run: function() {
    logger.info('Cronjob running...');

    // Connect to MongoDB.
    mongoose
      .connect(
        'mongodb+srv://' +
          process.env.KILOMETRIKISA_DBUSER +
          ':' +
          process.env.KILOMETRIKISA_DBPASSWORD +
          '@' +
          process.env.KILOMETRIKISA_DBHOST +
          '/' +
          process.env.KILOMETRIKISA_DB +
          '?retryWrites=true&w=majority',
        { useNewUrlParser: true, useUnifiedTopology: true },
      )
      .then(() => {
        logger.info('Connected to DB.');

        // Find all user having autosync enabled.
        return User.find(
          { autosync: true, kilometrikisaUsername: { $exists: true }, kilometrikisaPassword: { $exists: true } },
          function(err, users) {
            // DEBUG:
            // users = users.slice(0, 5);

            this.users = users;

            // Start syncing.
            logger.info('Found ' + users.length + ' users to sync...');

            this.syncNextUser();

            // Loop through users.
            // users.forEach(function(user) {
            // });
          }.bind(this),
        );
      });
  },

  /**
   * Get next user from the list and sync it. If users doesn't exist, we are done!
   */
  syncNextUser: function() {
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
    this.syncUser(
      user,
      function() {
        setTimeout(
          function() {
            this.syncNextUser();
          }.bind(this),
          3500,
        );
      }.bind(this),
    );
  },

  /**
   * Sync given user.
   */
  syncUser: function(user, callback) {
    logger.info('!! Syncing for user ' + user.kilometrikisaUsername);

    // Login.
    Kilometrikisa.login(
      user.kilometrikisaUsername,
      user.getPassword(),
      function(token, sessionId) {
        logger.info('Login complete: ' + user.kilometrikisaUsername);

        // Save login token.
        user.set('kilometrikisaToken', token);
        user.set('kilometrikisaSessionId', sessionId);

        // Update Strava token if expired
        user.updateToken().then(() => {
          // Do sync.
          SyncModel.doSync(
            user.stravaUserId,
            user.stravaToken,
            user.kilometrikisaToken,
            user.kilometrikisaSessionId,
            user.ebike,
            function(activities) {
              logger.info(Object.keys(activities).length + ' activities synced');

              callback();
            }.bind(this),
            function(error) {
              logger.warn('Activities sync failed for user ' + user.kilometrikisaUsername, error);

              callback();
            }.bind(this),
          );
        });
      }.bind(this),
      function() {
        logger.warn('User ' + user.kilometrikisaUsername + ' login failed.');
        callback();
      }.bind(this),
    );
  },
};

module.exports = cron;
