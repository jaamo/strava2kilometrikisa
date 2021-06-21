const logger = require('../helpers/logger');
var Kilometrikisa = require('../lib/kilometrikisa.js');
var User = require('../models/UserModel.js');

/**
 * Handle Kilometrikisa login flow.
 * @type {Object}
 */
var KilometrikisaController = {
  /**
   * Display login form.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  auth: function(req, res, next) {
    // Load user. There soulb be one at this point.
    User.findOne({ stravaUserId: req.session.stravaUserId }, function(err, user) {
      // Try logging in.
      Kilometrikisa.login(
        user.kilometrikisaUsername,
        user.kilometrikisaPassword,
        function(token, sessionId) {
          // Credentials works. Redirect to account page.
          logger.info('Login succesful', user.kilometrikisaUsername);
          res.redirect('/account');
        },
        function() {
          // No luck. Display login form.
          res.render('kilometrikisa-auth', { error: req.query.error });
        },
      );
    });
  },

  /**
   * Try logging in to Kilometrikisa.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  authHandler: function(req, res, next) {
    var username = req.query.username;
    var password = req.query.password;

    logger.info('Logging in', { username });

    // res.render('kilometrikisa-auth');
    Kilometrikisa.login(
      username,
      password,
      function(token, sessionId) {
        logger.info('Login complete', { username });

        // Find user.
        User.find({ stravaUserId: req.session.stravaUserId }, 'stravaUserId', function(err, u) {
          if (err) {
            res.redirect('/error?code=DATABASE_CONNECTION_FAILED');
            return;
          }

          // Save Kilometrikisa token and session id.
          var user = u[0];
          user.set('kilometrikisaToken', token);
          user.set('kilometrikisaSessionId', sessionId);
          user.set('kilometrikisaUsername', username);
          user.setPassword(password);
          user.save(function() {
            // Redirect to account page.
            res.redirect('/account');
          });
        });
      },
      function() {
        logger.info('Login failed', { username });
        res.redirect('/kilometrikisa/auth?error=true');
      },
    );
  },
};
module.exports = KilometrikisaController;
