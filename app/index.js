const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const logger = require('./helpers/logger');
const { isDev } = require('./helpers/Helpers');

// Connect to MongoDB.
mongoose.connect(
  `${isDev() ? 'mongodb://' : 'mongodb+srv://'}` +
    process.env.KILOMETRIKISA_DBUSER +
    ':' +
    process.env.KILOMETRIKISA_DBPASSWORD +
    '@' +
    process.env.KILOMETRIKISA_DBHOST +
    '/' +
    process.env.KILOMETRIKISA_DB +
    '?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true, authSource: isDev() ? 'admin' : undefined },
);

// Controllers
const Home = require('./controllers/Home');
const Kilometrikisa = require('./controllers/Kilometrikisa');
const StravaAuth = require('./controllers/StravaAuth');
const Sync = require('./controllers/Sync');

// Serve static files.
app.use('/img', express.static(path.join(__dirname, 'assets/img')));
app.use(express.static(path.join(__dirname, 'assets/dist')));

//set out template engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Init sessions.
app.use(
  session({
    secret: process.env.KILOMETRIKISA_SESSION_SECRET,
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
app.get('/', (req, res) => {
  StravaAuth.auth(req, res);
});

app.get('/faq', (req, res) => {
  Home.faq(req, res);
});

// Application flow:

// 1. Home: Information about the app.

// 2. Strava authentication.
app.get('/strava/auth', (req, res) => {
  return StravaAuth.auth(req, res);
});

// 2. Strava authentication ok.
app.get('/strava/authcomplete', (req, res) => {
  return StravaAuth.authComplete(req, res);
});

// 3. Kilometrikisa authentication.
app.get('/kilometrikisa/auth', (req, res) => {
  Kilometrikisa.auth(req, res);
});

// 4. Kilometrikisa authentication.
app.get('/kilometrikisa/authhandler', (req, res) => {
  return Kilometrikisa.authHandler(req, res);
});

// 5. Success page!
app.get('/account', (req, res) => {
  return Sync.index(req, res);
});

// Manual sync.
app.get('/manualsync', (req, res) => {
  return Sync.manualSyncPreview(req, res);
});

// Manual sync.
app.get('/dosync', (req, res) => {
  return Sync.doSync(req, res);
});

// Enable autosync.
app.get('/enableautosync', (req, res) => {
  return Sync.enableAutosync(req, res);
});

// Disable autosync.
app.get('/disableautosync', (req, res) => {
  return Sync.disableAutosync(req, res);
});

// Enable e-bike sync.
app.get('/enableebike', (req, res) => {
  return Sync.enableEBikeSync(req, res);
});

// Disable e-bike sync.
app.get('/disableebike', (req, res) => {
  return Sync.disableEBikeSync(req, res);
});

// isAuthenticated
app.get('/isauthenticated', (req, res) => {
  return Sync.isAuthenticated(req, res);
});

// Log out.
app.get('/logout', (req, res) => {
  return Home.logout(req, res);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (isDev()) {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});
