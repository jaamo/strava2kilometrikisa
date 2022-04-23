const Helpers = require('../helpers/Helpers.js');

const HomeController = {
  /**
   * Render home page.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @return {[type]}        [description]
   */
  index: function (req, res) {
    if (Helpers.isLoggedIn(req)) {
      res.redirect('/account');
    } else {
      res.render('index', {});
    }
  },

  faq: function (req, res) {
    //need to put these behind http auth or something
    res.render('faq', {});
  },

  /**
   * Logout.
   *
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @return {[type]}        [description]
   */
  logout: function (req, res) {
    req.session.stravaUserId = false;
    req.session.stravaToken = false;
    req.session.kilometrikisaToken = false;
    req.session.kilometrikisaSessionId = false;
    res.redirect('/');
  },
};
module.exports = HomeController;
