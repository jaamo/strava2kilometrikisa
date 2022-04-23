import { Request } from 'express';
/**
 * Check existense of login cookies from session.
 *
 * @param  req
 * @return Return true if logged in.
 */
export function isLoggedIn(req: Request) {
  return !!req.session.stravaUserId;
}

/**
 * Are we in development environment?
 * @returns {boolean}
 */
export function isDev() {
  return process.env.STRAVA2KILOMETRIKISA_ENV === 'development';
}
