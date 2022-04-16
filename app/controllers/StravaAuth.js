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
   * @return {[type]}        [description]
   */
  auth: async function (req, res) {
    // Get strava authorize url.
    const url = await strava.oauth.getRequestAccessURL({
      scope: 'activity:read_all',
    });
    res.render('index', { url: url });
  },

  /**
   * Handle response form Strava Oauth2 flow. Redirect to Kilometrikisa login on success.
   *
   * @param req
   * @param res
   */
  authComplete: async function (req, res) {
    // Not get access token from Strava.
    try {
      const payload = await strava.oauth.getToken(req.query.code);

      // If error is set, show error message.
      if (typeof req.query.error != 'undefined' || typeof payload.athlete == 'undefined') {
        res.render('strava-autherror', {});
      }
      // Otherwise save token and continue.
      else {
        // Save token to session.
        // req.session.stravaToken = payload.body.access_token;
        req.session.stravaUserId = payload.athlete.id;

        try {
          // Create user object, if id doesn't exists.
          let user = await User.findOne({ stravaUserId: req.session.stravaUserId }, 'stravaUserId');
          if (!user) {
            user = new User();
          }

          user.set('stravaUserId', req.session.stravaUserId);
          user.set('stravaToken', payload.access_token);

          user.set('tokenExpire', payload.expires_at * 1000);
          user.set('refreshToken', payload.refresh_token);

          await user.save();

          // Redirect to Kilometrikisa login.
          res.redirect('/kilometrikisa/auth');
        } catch (err) {
          res.redirect('/error?code=DATABASE_CONNECTION_FAILED');
        }
      }
    } catch (err) {
      // TODO: Is this really what we want to do here if oauth.getToken fails?
      res.render('strava-autherror', {});
    }
  },
};
module.exports = StravaAuthController;
