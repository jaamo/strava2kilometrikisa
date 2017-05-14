const config = require('./config')();

const mongoose = require('mongoose');
const strava = require('strava-v3');

const Kilometrikisa = require('./lib/kilometrikisa.js');
const SyncModel = require('./models/SyncModel.js');
const User = require('./models/UserModel.js');
const Log = require('./models/LogModel.js');
const Email = require('./lib/Email');

var cron = {

    users: [],

    run: function() {
        // Find all user having autosync enabled.
        User.find({autosync:true}, function(err, users) {

            var usersLength = users.length;
            var usersSynced = 0;

            // DEBUG:
            // users = users.slice(0, 5);

            this.users = users;

            // Start syncing.
            console.log('Found ' + users.length + ' users.');
            this.syncNextUser();

            // Loop through users.
            // users.forEach(function(user) {
            // });

        }.bind(this));
    },



    /**
     * Get next user from the list and sync it. If users doesn't exist, we are done!
     */
    syncNextUser: function() {
    
        // All done!
        if (this.users.length == 0) {
            return false;
        }

        // Get next.
        var user = this.users.pop();

        console.log(this.users.length + ' users left in queue.');

        // Sync!
        this.syncUser(user, function() { this.syncNextUser(); }.bind(this));

    },



    /**
     * Sync given user.
     */
    syncUser: function(user, callback) {

        // Login.
        Kilometrikisa.login(
            user.kilometrikisaUsername,
            user.getPassword(),
            function(token, sessionId) {

                console.log("Syncing for user " + user.kilometrikisaUsername + ". Login complete: " + token + " / " + sessionId);

                // Save login token.
                user.set("kilometrikisaToken", token);
                user.set("kilometrikisaSessionId", sessionId);

                // Do sync.
                SyncModel.doSync(
                    user.stravaUserId,
                    user.stravaToken,
                    user.kilometrikisaToken,
                    user.kilometrikisaSessionId,
                    function(activities) {

                        Log.log("Activities synced automatically.", JSON.stringify(activities), user.stravaUserId);
                        console.log("Activities synced for user " + user.kilometrikisaUsername);

                        callback();
                        // if (++usersSynced == usersLength) process.exit();

                    }.bind(this),
                    function(error) {

                        Log.log(
                            "Automatic sync failed!",
                            "stravaToken " + user.stravaToken + ", " +
                            "stravaToken " + user.kilometrikisaToken + ", " +
                            "stravaToken " + user.kilometrikisaSessionId + ", message: " + error,
                            user.stravaUserId
                        );

                        console.log("Activities sync failed for user " + user.kilometrikisaUsername);

                        //Email.send('strava2kilometrikisa@evermade.fi', 'Automatic sync failed! '+user.stravaUserId, error, error);

                        callback();
                        // if (++usersSynced == usersLength) process.exit();

                    }.bind(this)
                )

            }.bind(this),
            function() {

                Log.log('User ' + user.kilometrikisaUsername + ' login failed.');
                callback();

            }.bind(this)
        );

    }



};

module.exports = cron;
