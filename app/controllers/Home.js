var strava = require('strava-v3');
var Kilometrikisa = require('../lib/kilometrikisa.js');
var Sync = require('./Sync.js');
var Helpers = require('../helpers/Helpers.js');
var Log = require('../models/LogModel.js');

var HomeController = {



    /**
     * Render home page.
     *
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    index: function(req, res, next) {

        if (Helpers.isLoggedIn(req)) {

            res.redirect('/account');

        } else {

            res.render('index', {});

        }

    },



    /**
     * Logout.
     *
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    logout: function(req, res, next) {

        req.session.stravaUserId = false;
        req.session.stravaToken = false;
        req.session.kilometrikisaToken = false;
        req.session.kilometrikisaSessionId = false;
        res.redirect('/');

    }



};
module.exports = HomeController;
