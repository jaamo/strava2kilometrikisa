const config = require('./config')();

const mongoose = require('mongoose');
const strava = require('strava-v3');

mongoose.connect('mongodb://localhost/strava2kilometrikisa');

const Kilometrikisa = require('./lib/kilometrikisa.js');
const SyncModel = require('./models/SyncModel.js');
const User = require('./models/UserModel.js');
const Log = require('./models/LogModel.js');

console.log("Syncing users...");

// Find all user having autosync enabled.
User.find({autosync:true}, function(err, users) {

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
            function() {

                Log.log(
                    "Automatic sync failed!",
                    "stravaToken " + user.stravaToken + ", " +
                    "stravaToken " + user.kilometrikisaToken + ", " +
                    "stravaToken " + user.kilometrikisaSessionId + ", message: " + error,
                    user.stravaUserId
                );

                if (++usersSynced == usersLength) process.exit();

            }
        )

    });

});
