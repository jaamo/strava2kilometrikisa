const config = require('./config')();

const mongoose = require('mongoose');
const strava = require('strava-v3');

const Kilometrikisa = require('./lib/kilometrikisa.js');
const SyncModel = require('./models/SyncModel.js');
const User = require('./models/UserModel.js');
const Log = require('./models/LogModel.js');
const Email = require('./lib/Email');

var cron = {

    run: function(){
        // Find all user having autosync enabled.
        User.find({kilometrikisaUsername:'jaamo'}, function(err, users) {
        //User.find({autosync:true}, function(err, users) {

            var usersLength = users.length;
            var usersSynced = 0;

            // Loop through users.
            users.forEach(function(user) {

                // Login.
                Kilometrikisa.login(
                    user.kilometrikisaUsername,
                    user.getPassword(),
                    function(token, sessionId) {

                        console.log("Login complete: " + token + " / " + sessionId);

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

                                if (++usersSynced == usersLength) process.exit();

                            },
                            function(error) {

                                Log.log(
                                    "Automatic sync failed!",
                                    "stravaToken " + user.stravaToken + ", " +
                                    "stravaToken " + user.kilometrikisaToken + ", " +
                                    "stravaToken " + user.kilometrikisaSessionId + ", message: " + error,
                                    user.stravaUserId
                                );

                                //Email.send('strava2kilometrikisa@evermade.fi', 'Automatic sync failed! '+user.stravaUserId, error, error);

                                if (++usersSynced == usersLength) process.exit();

                            }
                        )



                    },
                    function() {

                        Log.log('User ' + username + ' login failed.');

                    }
                );

            });

        });
    }

};

module.exports = cron;
