import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import HttpException from './helpers/exceptions';
import logger from './helpers/logger';
import { isDev } from './helpers/helpers';
import { getDbConnection } from './services/database/database';

const app = express();
const MongoStore = connectMongo(session);

// Controllers
import Home from './controllers/Home';
import Kilometrikisa from './controllers/Kilometrikisa';
import StravaAuth from './controllers/StravaAuth';
import Sync from './controllers/Sync';

// Extend Express request typings with session data
declare module 'express-session' {
  interface SessionData {
    stravaUserId: string | null;
    stravaToken: string | null;
    kilometrikisaToken: string | null;
    kilometrikisaSessionId: string | null;
  }
}

getDbConnection();

// Serve static files.
app.use('/img', express.static(path.join(__dirname, '../app/assets/img')));
app.use(express.static(path.join(__dirname, '../app/assets/dist')));

// set out template engine
app.set('views', __dirname + '/../app/views');
app.set('view engine', 'ejs');

// Init sessions.
app.use(
  session({
    secret: process.env.KILOMETRIKISA_SESSION_SECRET ?? '',
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  }),
);

//lets start a server and listens on port 3000 for connections
app.listen(process.env.PORT, () => {
  logger.info(`Server listening on http://localhost:${process.env.PORT}`);
});

//some basic routes to controllers
app.get('/', (req: Request, res: Response) => {
  StravaAuth.auth(req, res);
});

app.get('/faq', (req: Request, res: Response) => {
  Home.faq(req, res);
});

// Application flow:

// 1. Home: Information about the app.

// 2. Strava authentication.
app.get('/strava/auth', (req: Request, res: Response) => {
  return StravaAuth.auth(req, res);
});

// 2. Strava authentication ok.
app.get('/strava/authcomplete', (req: Request, res: Response) => {
  return StravaAuth.authComplete(req, res);
});

// 3. Kilometrikisa authentication.
app.get('/kilometrikisa/auth', (req: Request, res: Response) => {
  Kilometrikisa.auth(req, res);
});

// 4. Kilometrikisa authentication.
app.get('/kilometrikisa/authhandler', (req: Request, res: Response) => {
  return Kilometrikisa.authHandler(req, res);
});

// 5. Success page!
app.get('/account', (req: Request, res: Response) => {
  return Sync.index(req, res);
});

// Manual sync.
app.get('/manualsync', (req: Request, res: Response) => {
  return Sync.manualSyncPreview(req, res);
});

// Manual sync.
app.get('/dosync', (req: Request, res: Response) => {
  return Sync.doSync(req, res);
});

// Enable autosync.
app.get('/enableautosync', (req: Request, res: Response) => {
  return Sync.enableAutosync(req, res);
});

// Disable autosync.
app.get('/disableautosync', (req: Request, res: Response) => {
  return Sync.disableAutosync(req, res);
});

// Enable e-bike sync.
app.get('/enableebike', (req: Request, res: Response) => {
  return Sync.enableEBikeSync(req, res);
});

// Disable e-bike sync.
app.get('/disableebike', (req: Request, res: Response) => {
  return Sync.disableEBikeSync(req, res);
});

// isAuthenticated
app.get('/isauthenticated', (req: Request, res: Response) => {
  return Sync.isAuthenticated(req, res);
});

// Log out.
app.get('/logout', (req: Request, res: Response) => {
  return Home.logout(req, res);
});

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(new HttpException(404, 'Not Found'));
});

// error handlers

// development error handler
// will print stacktrace
if (isDev()) {
  app.use(function (err: HttpException, req: Request, res: Response) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err: HttpException, req: Request, res: Response) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});
