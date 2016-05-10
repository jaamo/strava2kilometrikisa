const config = require('./config')();

const mongoose = require('mongoose');
const strava = require('strava-v3');

const Kilometrikisa = require('./lib/kilometrikisa.js');
const SyncModel = require('./models/SyncModel.js');
const User = require('./models/UserModel.js');
const Log = require('./models/LogModel.js');
const Email = require('./lib/email');

var cron = {

    run: function(){
        // Find all user having autosync enabled.
        User.find({autosync:true}, function(err, users) {

            console.log('cron sync');

            var usersLength = users.length;
            var usersSynced = 0;

            users.forEach(function(user) {

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

                        Email.send('paul.stewart@evermade.fi, jaakko@evermade.fi', 'Automatic sync failed! '+user.stravaUserId, error, error);

                        if (++usersSynced == usersLength) process.exit();

                    }
                )

            });

        });
    }

};

module.exports = cron;
