//include basic requirments
const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const logger = require('morgan');
const config = require('./config')();

//controllers
const Home = require('./controllers/Home');
const Friends = require('./controllers/Friends');
const Activities = require('./controllers/Activities');
const Stats = require('./controllers/Stats');
const Kilometrikisa = require('./controllers/Kilometrikisa');

//set out template engine
app.set('view engine', 'ejs');

//lets use morgan to HTTP request logging
app.use(logger('dev'));

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

app.get('/kilometrikisa', (req, res, next) => {
   Kilometrikisa.index(req, res, next);
});

app.get('/stats/:id', (req, res, next) => {
   Stats.index(req, res, next);
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