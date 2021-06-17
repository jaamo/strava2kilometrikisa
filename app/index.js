const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const logger = require('./helpers/logger');

let protocol = 'mongodb+srv://';

// srv has to be omitted with local database host
if (app.get('env') === 'development') {
    protocol = 'mongodb://';
}

// Connect to MongoDB.
mongo_URI = protocol +
    process.env.KILOMETRIKISA_DBUSER +
    ':' +
    process.env.KILOMETRIKISA_DBPASSWORD +
    '@' +
    process.env.KILOMETRIKISA_DBHOST +
    '/' +
    process.env.KILOMETRIKISA_DB +
    '?retryWrites=true&w=majority&ssl=false';

mongoose.connect(
    mongo_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
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
app.get('/', (req, res, next) => {
  StravaAuth.auth(req, res, next);
});

app.get('/faq', (req, res, next) => {
  Home.faq(req, res, next);
});

// Application flow:

// 1. Home: Information about the app.

// 2. Strava authentication.
app.get('/strava/auth', (req, res, next) => {
  StravaAuth.auth(req, res, next);
});

// 2. Strava authentication ok.
app.get('/strava/authcomplete', (req, res, next) => {
  StravaAuth.authComplete(req, res, next);
});

// 3. Kilometrikisa authentication.
app.get('/kilometrikisa/auth', (req, res, next) => {
  Kilometrikisa.auth(req, res, next);
});

// 4. Kilometrikisa authentication.
app.get('/kilometrikisa/authhandler', (req, res, next) => {
  Kilometrikisa.authHandler(req, res, next);
});

// 5. Success page!
app.get('/account', (req, res, next) => {
  Sync.index(req, res, next);
});

// Manual sync.
app.get('/manualsync', (req, res, next) => {
  Sync.manualSyncPreview(req, res, next);
});

// Manual sync.
app.get('/dosync', (req, res, next) => {
  Sync.doSync(req, res, next);
});

// Enable autosync.
app.get('/enableautosync', (req, res, next) => {
  Sync.enableAutosync(req, res, next);
});

// Disable autosync.
app.get('/disableautosync', (req, res, next) => {
  Sync.disableAutosync(req, res, next);
});

// Enable e-bike sync.
app.get('/enableebike', (req, res, next) => {
  Sync.enableEBikeSync(req, res, next);
});

// Disable e-bike sync.
app.get('/disableebike', (req, res, next) => {
  Sync.disableEBikeSync(req, res, next);
});

// isAuthenticated
app.get('/isauthenticated', (req, res, next) => {
  Sync.isAuthenticated(req, res, next);
});

// Log out.
app.get('/logout', (req, res, next) => {
  Home.logout(req, res, next);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});
