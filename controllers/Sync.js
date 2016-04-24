var Kilometrikisa = require('../lib/kilometrikisa.js');
var SyncModel = require('../models/SyncModel.js');
var strava = require('strava-v3');

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


        SyncModel.getStravaActivities(
            req.session.stravaToken,
            function(activities) {

                res.render('sync-index', {
                    activities: activities,
                    stravaToken: req.session.stravaToken,
                    kilometrikisaToken: req.session.kilometrikisaToken,
                    kilometrikisaSessionId: req.session.kilometrikisaSessionId,
                });

            },
            function() {

                res.render('sync-index', {
                    activities: false,
                    stravaToken: req.session.stravaToken,
                    kilometrikisaToken: req.session.kilometrikisaToken,
                    kilometrikisaSessionId: req.session.kilometrikisaSessionId,
                });

            }
        )


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

        SyncModel.doSync(
            req.session.stravaToken,
            req.session.kilometrikisaToken,
            req.session.kilometrikisaSessionId,
            function(activities) {

                res.render('sync-dosync', {
                    success: true
                });

            },
            function() {

                res.render('sync-dosync', {
                    success: false
                });

            }
        )

    }


};
module.exports = SyncController;
