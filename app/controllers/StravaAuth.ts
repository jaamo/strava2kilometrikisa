import { Request, Response } from 'express';
import strava from 'strava-v3';
import { UserModel } from '../models/UserModel';

/**
 * Handle Strava authentication.
 * @type {Object}
 */
export default {
  /**
   * Display login button.
   */
  auth: async function (req: Request, res: Response) {
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
  authComplete: async function (req: Request, res: Response) {
    try {
      const payload = await strava.oauth.getToken(req.query.code as string);

      // If error is set, show error message.
      if (typeof req.query.error != 'undefined' || typeof payload.athlete == 'undefined') {
        res.render('strava-autherror', {});
      } else {
        // Save token to session.
        req.session.stravaUserId = payload.athlete.id;

        try {
          // Create user object, if id doesn't exists.
          let user = await UserModel.findOne({ stravaUserId: req.session.stravaUserId as string }, 'stravaUserId');
          if (!user) {
            user = new UserModel();
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
