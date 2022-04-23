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
   * @return {[type]}        [description]
   */
  index: async function (req, res) {
    // Load user.
    const user = await User.findOne({ stravaUserId: req.session.stravaUserId });
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
  },
  /**
   * Display a preview.
   *
   * @return {[type]} [description]
   */
  manualSyncPreview: async function (req, res, next) {
    const user = await User.findOne({ stravaUserId: req.session.stravaUserId });
    if (!user) {
      logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
      res.redirect('/?error=usernotfound');
      return;
    }

    await user.updateToken();

    // Get activities.
    try {
      const activities = await SyncModel.getStravaActivities(user.stravaToken, user.ebike);
      res.render('sync-preview', {
        activities: activities,
      });
    } catch (err) {
      res.render('sync-preview', {
        activities: [],
      });
    }
  },

  /**
   * Sync kilometers.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  doSync: async function (req, res) {
    // Load user.
    const user = await User.findOne({ stravaUserId: req.session.stravaUserId });
    if (!user) {
      logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
      res.redirect('/?error=usernotfound');
      return;
    }

    // Sync all activities.
    try {
      const activities = await SyncModel.doSync(
        req.session.stravaUserId,
        user.stravaToken,
        user.kilometrikisaToken,
        user.kilometrikisaSessionId,
        user.ebike,
      );

      // Sync success.
      logger.info('Activities synced manually.', JSON.stringify(activities), user.stravaUserId);

      res.render('sync-dosync', {
        success: true,
      });
    } catch (err) {
      logger.warn('Manual activity sync failed!', user.stravaUserId, err);

      res.render('sync-dosync', {
        success: false,
      });
    }
  },

  /**
   * Set autosync to true and redirect to account page.
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   */
  enableAutosync: async function (req, res, next) {
    const user = await User.findOne({ stravaUserId: req.session.stravaUserId });
    user.set('autosync', true);
    await user.save();
    res.redirect('/account');
  },

  /**
   * Set autosync to false and redirect to account page.
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   */
  disableAutosync: async function (req, res) {
    const user = await User.findOne({ stravaUserId: req.session.stravaUserId });
    user.set('autosync', false);
    await user.save();
    res.redirect('/account');
  },

  /**
   * Set e-bike sync to true and redirect to account page
   * @param {*} req
   * @param {*} res
   */
  enableEBikeSync: async function (req, res) {
    const user = await User.findOne({ stravaUserId: req.session.stravaUserId });
    user.set('ebike', true);
    await user.save();
    res.redirect('/account');
  },

  /**
   * Set e-bike sync to false and redirect to account page
   * @param {*} req
   * @param {*} res
   */
  disableEBikeSync: async function (req, res) {
    const user = await User.findOne({ stravaUserId: req.session.stravaUserId });
    user.set('ebike', false);
    user.save();
    res.redirect('/account');
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
