import { Request, Response } from 'express';
import * as kilometrikisa from 'kilometrikisa-client';
import { getStravaActivities } from '../services/strava/strava';
import { doSync } from '../services/sync/sync';
import { findUser } from '../models/UserModel';
import logger from '../helpers/logger';

/**
 * Handle syncing from Stara to Kilometrikisa.
 * @type {Object}
 */
export default {
  /**
   * Main page.
   */
  index: async function (req: Request, res: Response) {
    // Load user.
    const user = await findUser({ stravaUserId: req.session.stravaUserId });
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
   */
  manualSyncPreview: async function (req: Request, res: Response) {
    const user = await findUser({ stravaUserId: req.session.stravaUserId });
    if (!user) {
      logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
      res.redirect('/?error=usernotfound');
      return;
    }

    await user.updateToken();

    // Get activities.
    try {
      const activities = await getStravaActivities(user.stravaToken, user.ebike);
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
   */
  doSync: async function (req: Request, res: Response) {
    // Load user.
    const user = await findUser({ stravaUserId: req.session.stravaUserId });
    if (!user) {
      logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
      res.redirect('/?error=usernotfound');
      return;
    }

    // Sync all activities.
    try {
      const activities = await doSync(
        parseInt(req.session.stravaUserId ?? ''),
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
   */
  enableAutosync: async function (req: Request, res: Response) {
    const user = await findUser({ stravaUserId: req.session.stravaUserId });
    user.set('autosync', true);
    await user.save();
    res.redirect('/account');
  },

  /**
   * Set autosync to false and redirect to account page.
   */
  disableAutosync: async function (req: Request, res: Response) {
    const user = await findUser({ stravaUserId: req.session.stravaUserId });

    user.set('autosync', false);
    await user.save();
    res.redirect('/account');
  },

  /**
   * Set e-bike sync to true and redirect to account page
   */
  enableEBikeSync: async function (req: Request, res: Response) {
    const user = await findUser({ stravaUserId: req.session.stravaUserId });
    user.set('ebike', true);
    await user.save();
    res.redirect('/account');
  },

  /**
   * Set e-bike sync to false and redirect to account page
   */
  disableEBikeSync: async function (req: Request, res: Response) {
    const user = await findUser({ stravaUserId: req.session.stravaUserId });
    user.set('ebike', false);
    user.save();
    res.redirect('/account');
  },

  /**
   * Check is user is logged in to kilometrikisa.
   */
  isAuthenticated: async function (req: Request, res: Response) {
    const user = await findUser({ stravaUserId: req.session.stravaUserId });
    if (user) {
      res.setHeader('Content-Type', 'application/json');
      const session = await kilometrikisa.kilometrikisaSession({
        token: user.kilometrikisaToken,
        sessionId: user.kilometrikisaSessionId,
      });

      const isValid = await session.isSessionValid();
      res.send(JSON.stringify({ kilometrikisa: isValid }));
    } else {
      logger.info('SyncController.isAuthenticated: No user for Strava ID ' + req.session.stravaUserId);
      res.redirect('/?error=usernotfound');
    }
  },
};
