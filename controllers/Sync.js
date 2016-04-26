var Kilometrikisa = require('../lib/kilometrikisa.js');
var SyncModel = require('../models/SyncModel.js');
var strava = require('strava-v3');
var User = require('../models/UserModel.js');
var Log = require('../models/LogModel.js');

/**
 * Handle syncing from Stara to Kilometrikisa.
 * @type {Object}
 */
var SyncController = {



    /**
     * Main page.
     *
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    index:  function(req, res, next) {

        // Load user.
        User.findOne({stravaUserId: req.session.stravaUserId}, function(err, user) {

            // Render template.
            res.render('sync-index', {
                autosync: user.autosync
            });

        })

    },



    /**
     * Sync kilometers.
     *
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    doSync: function(req, res, next) {

        // Load user.
        User.findOne({stravaUserId: req.session.stravaUserId}, function(err, user) {

            // Sync all activities.
            SyncModel.doSync(
                req.session.stravaUserId,
                user.stravaToken,
                user.kilometrikisaToken,
                user.kilometrikisaSessionId,

                // Sync success.
                function(activities) {

                    Log.log("Activities synced manually.", JSON.stringify(activities), user.stravaUserId);

                    res.render('sync-dosync', {
                        success: true
                    });

                },

                // Sync failed.
                function(error) {

                    Log.log(
                        "Manual activity sync failed!",
                        "stravaToken " + user.stravaToken + ", " +
                        "stravaToken " + user.kilometrikisaToken + ", " +
                        "stravaToken " + user.kilometrikisaSessionId + ", message: " + error,
                        user.stravaUserId
                    );

                    res.render('sync-dosync', {
                        success: false
                    });

                }
            )

        });

    },



    /**
     * Set autosync to true and redirect to account page.
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    enableAutosync: function(req, res, next) {

        User.findOne({stravaUserId: req.session.stravaUserId}, function(err, user) {
            user.set("autosync", true);
            user.save(function() {
                res.redirect("/account");
            });
        });

    },



    /**
     * Set autosync to false and redirect to account page.
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    disableAutosync: function(req, res, next) {

        User.findOne({stravaUserId: req.session.stravaUserId}, function(err, user) {
            user.set("autosync", false);
            user.save(function() {
                res.redirect("/account");
            });
        });

    }



};
module.exports = SyncController;
