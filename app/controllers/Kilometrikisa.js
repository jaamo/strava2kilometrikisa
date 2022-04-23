const kilometrikisa = require('kilometrikisa-client');
const logger = require('../helpers/logger');
const User = require('../models/UserModel.js');

/**
 * Handle Kilometrikisa login flow.
 * @type {Object}
 */
const KilometrikisaController = {
  /**
   * Display login form.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @return {[type]}        [description]
   */
  auth: async function (req, res) {
    try {
      const user = await User.findOne({ stravaUserId: req.session.stravaUserId });
      await kilometrikisa.kilometrikisaSession({
        username: user.kilometrikisaUsername,
        password: user.kilometrikisaPassword,
      });

      // Credentials works. Redirect to account page.
      logger.info('Login succesful', user.kilometrikisaUsername);
      res.redirect('/account');
    } catch (err) {
      // No luck. Display login form.
      res.render('kilometrikisa-auth', { error: req.query.error });
    }
  },

  /**
   * Try logging in to Kilometrikisa.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @return {[type]}        [description]
   */
  authHandler: async function (req, res) {
    const username = req.query.username;
    const password = req.query.password;

    logger.info('Logging in', { username });

    try {
      const session = await kilometrikisa.kilometrikisaSession({ username, password });
      logger.info('Login complete', { username });

      try {
        const user = (await User.find({ stravaUserId: req.session.stravaUserId }, 'stravaUserId'))[0];
        const { token, sessionId } = session.sessionCredentials;

        // Save Kilometrikisa token and session id.
        user.set('kilometrikisaToken', token);
        user.set('kilometrikisaSessionId', sessionId);
        user.set('kilometrikisaUsername', username);
        user.setPassword(password);
        await user.save();

        // Redirect to account page.
        res.redirect('/account');
      } catch (err) {
        if (err) {
          res.redirect('/error?code=DATABASE_CONNECTION_FAILED');
        }
      }
    } catch (err) {
      logger.info('Login failed', { username });
      res.redirect('/kilometrikisa/auth?error=true');
    }
  },
};
module.exports = KilometrikisaController;
