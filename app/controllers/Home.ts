import { Request, Response } from 'express';
import { isLoggedIn } from '../helpers/helpers';

export default {
  Home: function (req: Request, res: Response) {
    if (isLoggedIn(req)) {
      res.redirect('/account');
    } else {
      res.render('index', {});
    }
  },

  faq: function (req: Request, res: Response) {
    //need to put these behind http auth or something
    res.render('faq', {});
  },

  logout: function (req: Request, res: Response) {
    req.session.stravaUserId = null;
    req.session.stravaToken = null;
    req.session.kilometrikisaToken = null;
    req.session.kilometrikisaSessionId = null;
    res.redirect('/');
  },
};
