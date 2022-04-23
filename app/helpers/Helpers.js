module.exports = {
  /**
   * Check existense of login cookies from session.
   *
   * @param  {[type]} req Reqeust.
   * @return {[type]}     Return true if logged in.
   */
  isLoggedIn: function (req) {
    if (req.session.stravaUserId) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Are we in development environment?
   * @returns {boolean}
   */
  isDev: function () {
    return process.env.STRAVA2KILOMETRIKISA_ENV === 'development';
  }
};
