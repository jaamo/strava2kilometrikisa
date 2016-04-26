//include basic requirments
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config')();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Connect to MongoDB.
mongoose.connect('mongodb://localhost/strava2kilometrikisa');

// Controllers
const Home = require('./controllers/Home');
const Friends = require('./controllers/Friends');
const Activities = require('./controllers/Activities');
const Stats = require('./controllers/Stats');
const Kilometrikisa = require('./controllers/Kilometrikisa');
const StravaAuth = require('./controllers/StravaAuth');
const Sync = require('./controllers/Sync');

// Logger.
app.use(morgan('combined'));
// app.use(morgan('dev'));

//set out template engine
app.set('view engine', 'ejs');

// Init sessions.
app.use(session({
    secret: 'mAs03dfsfokdqpFsd34sdfq0dqjlknmae',
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

//lets start a server and listens on port 3000 for connections
app.listen(config.port, () => {
  console.log('server listening on '+config.port)
});

//some basic routes to controllers
app.get('/', (req, res, next) => {
   Home.index(req, res, next);
});

app.get('/friends', (req, res, next) => {
   Friends.index(req, res, next);
});

app.get('/activities', (req, res, next) => {
   Activities.index(req, res, next);
});

// app.get('/kilometrikisa', (req, res, next) => {
//    Kilometrikisa.index(req, res, next);
// });

app.get('/stats/:id', (req, res, next) => {
   Stats.index(req, res, next);
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
app.get('/dosync', (req, res, next) => {
   Sync.doSync(req, res, next);
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
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
