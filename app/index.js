//include basic requirments
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const path = require("path");

// Connect to MongoDB.
mongoose.connect(
  "mongodb://" +
    process.env.KILOMETRIKISA_DBUSER +
    ":" +
    process.env.KILOMETRIKISA_DBPASSWORD +
    "@" +
    process.env.KILOMETRIKISA_DBHOST +
    "/" +
    process.env.KILOMETRIKISA_DB
);

// Controllers
const Home = require("./controllers/Home");
const Friends = require("./controllers/Friends");
const Activities = require("./controllers/Activities");
const User = require("./controllers/User");
const Kilometrikisa = require("./controllers/Kilometrikisa");
const StravaAuth = require("./controllers/StravaAuth");
const Sync = require("./controllers/Sync");
const Cron = require("./cron");

var CronJob = require("cron").CronJob;

//only run cron if on production
if (
  typeof process.env.KILOMETRIKISA_ENV !== "undefined" &&
  process.env.KILOMETRIKISA_ENV == "production"
) {
  //everyhour on the hour
  new CronJob(
    "0 4 * * *",
    function() {
      Cron.run();
    },
    null,
    true,
    "Europe/Helsinki"
  );
}

// Serve static files.
app.use(express.static(path.join(__dirname, "assets/dist")));

// Logger.
app.use(morgan(process.env.KILOMETRIKISA_LOGGING));

//set out template engine
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Init sessions.
app.use(
  session({
    secret: "mAs03dfsfokdqpFsd34sdfq0dqjlknmae",
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

//lets start a server and listens on port 3000 for connections
app.listen(process.env.PORT, () => {
  console.log(`Server listening on http://localhost:${process.env.PORT}`);
});

//some basic routes to controllers
app.get("/", (req, res, next) => {
  //  Home.index(req, res, next);
  StravaAuth.auth(req, res, next);
});

app.get("/admin/friends", (req, res, next) => {
  Friends.index(req, res, next);
});

app.get("/admin/activities", (req, res, next) => {
  Activities.index(req, res, next);
});

app.get("/admin/dev", (req, res, next) => {
  Home.dev(req, res, next);
});

app.get("/admin/styleguide", (req, res, next) => {
  Home.styleguide(req, res, next);
});

app.get("/faq", (req, res, next) => {
  Home.faq(req, res, next);
});

// app.get('/kilometrikisa', (req, res, next) => {
//    Kilometrikisa.index(req, res, next);
// });

app.get("/admin/users", (req, res, next) => {
  User.index(req, res, next);
});

app.get("/admin/users/:id", (req, res, next) => {
  User.show(req, res, next);
});

app.get("/admin/users/:id/logs", (req, res, next) => {
  User.logs(req, res, next);
});

// Application flow:

// 1. Home: Information about the app.

// 2. Strava authentication.
app.get("/strava/auth", (req, res, next) => {
  StravaAuth.auth(req, res, next);
});

// 2. Strava authentication ok.
app.get("/strava/authcomplete", (req, res, next) => {
  StravaAuth.authComplete(req, res, next);
});

// 3. Kilometrikisa authentication.
app.get("/kilometrikisa/auth", (req, res, next) => {
  Kilometrikisa.auth(req, res, next);
});

// 4. Kilometrikisa authentication.
app.get("/kilometrikisa/authhandler", (req, res, next) => {
  Kilometrikisa.authHandler(req, res, next);
});

// 5. Success page!
app.get("/account", (req, res, next) => {
  Sync.index(req, res, next);
});

app.get("/kampiapina", (req, res, next) => {
  Sync.kampiapina(req, res, next);
});

// Manual sync.
app.get("/manualsync", (req, res, next) => {
  Sync.manualSyncPreview(req, res, next);
});

// Manual sync.
app.get("/dosync", (req, res, next) => {
  Sync.doSync(req, res, next);
});

// Disable autosync.
app.get("/enableautosync", (req, res, next) => {
  Sync.enableAutosync(req, res, next);
});

// Disable autosync.
app.get("/disableautosync", (req, res, next) => {
  Sync.disableAutosync(req, res, next);
});

// isAuthenticated
app.get("/isauthenticated", (req, res, next) => {
  Sync.isAuthenticated(req, res, next);
});

// Log out.
app.get("/logout", (req, res, next) => {
  Home.logout(req, res, next);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});
