const config = require('./config')();

const mongoose = require('mongoose');
const strava = require('strava-v3');

mongoose.connect('mongodb://localhost/strava2kilometrikisa');

const Kilometrikisa = require('./lib/kilometrikisa.js');
const SyncModel = require('./models/SyncModel.js');
const User = require('./models/UserModel.js');

console.log("Syncing users...");

User.find(function(err, users) {

    var usersLength = users.length;
    var usersSynced = 0;

    users.forEach(function(user) {

        SyncModel.doSync(
            user.stravaToken,
            user.kilometrikisaToken,
            user.kilometrikisaSessionId,
            function(activities) {

                console.log("User " + user.stravaToken + " synced.");

                if (++usersSynced == usersLength) process.exit();

            },
            function() {

                console.log("Failed to sync user " + user.stravaToken + "!");

                if (++usersSynced == usersLength) process.exit();

            }
        )

    });

});
