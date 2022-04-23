var Kilometrikisa = require('../lib/kilometrikisa.js');
var SyncModel = require('../models/SyncModel.js');
var User = require('../models/UserModel.js');
const logger = require('../helpers/logger');

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
  index: function (req, res, next) {
    // Load user.
    User.findOne({ stravaUserId: req.session.stravaUserId }, function (err, user) {
      if (!user) {
        logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
        res.redirect('/?error=usernotfound');
        return;
      }

      // Render template.
      res.render('sync-index', {
        autosync: user.autosync,
        ebike: user.ebike,
      });
    });
  },

  /**
   * Display a preview.
   *
   * @return {[type]} [description]
   */
  manualSyncPreview: function (req, res, next) {
    // Cron.run();

    // Load user.
    User.findOne({ stravaUserId: req.session.stravaUserId }, function (err, user) {
      if (!user) {
        logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
        res.redirect('/?error=usernotfound');
        return;
      }

      user.updateToken().then(() => {
        // Get activities.
        SyncModel.getStravaActivities(
          user.stravaToken,
          user.ebike,
          function (activities) {
            res.render('sync-preview', {
              activities: activities,
            });
          },
          function () {
            res.render('sync-preview', {
              activities: [],
            });
          },
        );
      });
    });
  },

  /**
   * Sync kilometers.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  doSync: function (req, res, next) {
    // Load user.
    User.findOne({ stravaUserId: req.session.stravaUserId }, function (err, user) {
      if (!user) {
        logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
        res.redirect('/?error=usernotfound');
        return;
      }

      // Sync all activities.
      SyncModel.doSync(
        req.session.stravaUserId,
        user.stravaToken,
        user.kilometrikisaToken,
        user.kilometrikisaSessionId,
        user.ebike,

        // Sync success.
        function (activities) {
          logger.info('Activities synced manually.', JSON.stringify(activities), user.stravaUserId);

          res.render('sync-dosync', {
            success: true,
          });
        },

        // Sync failed.
        function (error) {
          logger.warn('Manual activity sync failed!', user.stravaUserId, error);

          res.render('sync-dosync', {
            success: false,
          });
        },
      );
    });
  },

  /**
   * Set autosync to true and redirect to account page.
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  enableAutosync: function (req, res, next) {
    User.findOne({ stravaUserId: req.session.stravaUserId }, function (err, user) {
      user.set('autosync', true);
      user.save(function () {
        res.redirect('/account');
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
  disableAutosync: function (req, res, next) {
    User.findOne({ stravaUserId: req.session.stravaUserId }, function (err, user) {
      user.set('autosync', false);
      user.save(function () {
        res.redirect('/account');
      });
    });
  },

  /**
   * Set e-bike sync to true and redirect to account page
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  enableEBikeSync: function (req, res, next) {
    User.findOne({ stravaUserId: req.session.stravaUserId }, function (err, user) {
      user.set('ebike', true);
      user.save(function () {
        res.redirect('/account');
      });
    });
  },

  /**
   * Set e-bike sync to false and redirect to account page
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  disableEBikeSync: function (req, res, next) {
    User.findOne({ stravaUserId: req.session.stravaUserId }, function (err, user) {
      user.set('ebike', false);
      user.save(function () {
        res.redirect('/account');
      });
    });
  },

  /**
   * Check is user is logged in to kilometrikisa.
   */
  isAuthenticated: function (req, res, next) {
    User.findOne({ stravaUserId: req.session.stravaUserId }, function (err, user) {
      if (user) {
        res.setHeader('Content-Type', 'application/json');
        Kilometrikisa.isLoggedIn(
          user.kilometrikisaToken,
          user.kilometrikisaSessionId,
          function () {
            res.send(JSON.stringify({ kilometrikisa: true }));
          },
          function () {
            res.send(JSON.stringify({ kilometrikisa: false }));
          },
        );
      } else {
        logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
        res.redirect('/?error=usernotfound');
      }
    });
  },
};
module.exports = SyncController;
