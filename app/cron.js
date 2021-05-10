const mongoose = require('mongoose');

const Kilometrikisa = require('./lib/kilometrikisa.js');
const SyncModel = require('./models/SyncModel.js');
const User = require('./models/UserModel.js');
const Log = require('./models/LogModel.js');

var cron = {
  users: [],

  run: function() {
    console.log('Cronjob running...');

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
        console.log('Connected to DB.');

        // Find all user having autosync enabled.
        return User.find(
          { autosync: true, kilometrikisaUsername: { $exists: true }, kilometrikisaPassword: { $exists: true } },
          function(err, users) {
            var usersLength = users.length;
            var usersSynced = 0;

            // DEBUG:
            // users = users.slice(0, 5);

            this.users = users;

            // Start syncing.
            console.log('Found ' + users.length + ' users to sync...');

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
      console.log('\n' + this.users.length + ' users left in queue.');
      console.log('\nDisconnected from DB.');
      return false;
    }

    console.log('\n');
    console.log(new Date());
    console.log(this.users.length + ' users left in queue.');
    console.log('\n');

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
    console.log('!! Syncing for user ' + user.kilometrikisaUsername);

    // Login.
    Kilometrikisa.login(
      user.kilometrikisaUsername,
      user.getPassword(),
      function(token, sessionId) {
        console.log('Login complete: ' + token + ' / ' + sessionId);

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
            function(activities) {
              Log.log('Activities synced automatically.', JSON.stringify(activities), user.stravaUserId);
              console.log(Object.keys(activities).length + ' activities synced');

              callback();
              // if (++usersSynced == usersLength) process.exit();
            }.bind(this),
            function(error) {
              Log.log(
                'Automatic sync failed!',
                'stravaToken ' +
                  user.stravaToken +
                  ', ' +
                  'stravaToken ' +
                  user.kilometrikisaToken +
                  ', ' +
                  'stravaToken ' +
                  user.kilometrikisaSessionId +
                  ', message: ' +
                  error,
                user.stravaUserId,
              );

              console.log('Activities sync failed for user ' + user.kilometrikisaUsername);

              //Email.send('strava2kilometrikisa@evermade.fi', 'Automatic sync failed! '+user.stravaUserId, error, error);

              callback();
              // if (++usersSynced == usersLength) process.exit();
            }.bind(this),
          );
        });
      }.bind(this),
      function() {
        Log.log('User ' + user.kilometrikisaUsername + ' login failed.');
        callback();
      }.bind(this),
    );
  },
};

module.exports = cron;
