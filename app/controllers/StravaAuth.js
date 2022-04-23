var strava = require('strava-v3');
var User = require('../models/UserModel.js');

/**
 * Handle Strava authentication.
 * @type {Object}
 */
var StravaAuthController = {
  /**
   * Display login button.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  auth: function (req, res, next) {
    // Get strava authorize url.
    var url = strava.oauth.getRequestAccessURL({
      scope: 'activity:read_all',
    });
    res.render('index', { url: url });
  },

  /**
   * Handle response form Strava Oauth2 flow. Redirect to Kilometrikisa login on success.
   *
   * @param req
   * @param res
   * @param next
   */
  authComplete: function (req, res, next) {
    // Not get access token from Strava.
    strava.oauth.getToken(req.query.code, function (err, payload) {
      // If error is set, show error message.
      if (typeof req.query.error != 'undefined' || typeof payload.body.athlete == 'undefined') {
        res.render('strava-autherror', {});
      }
      // Otherwise save token and continue.
      else {
        // Save token to session.
        // req.session.stravaToken = payload.body.access_token;
        req.session.stravaUserId = payload.body.athlete.id;

        // Create user object, if id doesn't exists.

        User.find({ stravaUserId: req.session.stravaUserId }, 'stravaUserId', function (err, u) {
          if (err) {
            res.redirect('/error?code=DATABASE_CONNECTION_FAILED');
            return;
          }

          // Create new user.
          if (u.length == 0) {
            var user = new User();
          } else {
            user = u[0];
          }

          // Save details.
          user.set('stravaUserId', req.session.stravaUserId);
          user.set('stravaToken', payload.body.access_token);

          user.set('tokenExpire', payload.body.expires_at * 1000);
          user.set('refreshToken', payload.body.refresh_token);

          user.save(function () {
            // Redirect to Kilometrikisa login.
            res.redirect('/kilometrikisa/auth');
          });
        });
      }
    });
  },
};
module.exports = StravaAuthController;
