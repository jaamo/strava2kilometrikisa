import { Request, Response } from 'express';
import * as kilometrikisa from 'kilometrikisa-client';
import logger from '../helpers/logger';
import { findUser } from '../models/UserModel';

/**
 * Handle Kilometrikisa login flow.
 * @type {Object}
 */
export default {
  /**
   * Display login form.
   */
  auth: async function (req: Request, res: Response) {
    try {
      const user = await findUser({ stravaUserId: req.session.stravaUserId as string });
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
   */
  authHandler: async function (req: Request, res: Response) {
    const username = req.query.username as string;
    const password = req.query.password as string;

    logger.info('Logging in', { username });

    try {
      const session = await kilometrikisa.kilometrikisaSession({ username, password });
      logger.info('Login complete', { username });

      try {
        const user = await findUser({ stravaUserId: req.session.stravaUserId as string });
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
