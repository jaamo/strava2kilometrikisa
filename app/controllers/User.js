var strava = require('strava-v3');
const User = require('../models/UserModel.js');
const Log = require('../models/LogModel.js');

var UsersController = {
  show: function(req, res, next) {
    var id = req.params.id;

    //query for user from mongodb
    User.find({ stravaUserId: req.params.id }, function(err, user) {
      strava.athletes.get({ id: req.params.id }, function(err, payload) {
        if (!err) {
          res.render('athelete', { data: payload });
        } else {
          res.render('athelete', { data: err });
        }
      });
    });
  },

  logs: function(req, res, next) {
    Log.find({ stravaUserId: req.params.id }, function(err, logs) {
      res.render('users/logs', { data: logs });
    });
  },

  index: function(req, res, next) {
    var data = {};

    User.find({ autosync: true }, function(err, users) {
      data.users = users;
      res.render('users/index', { data: data });
    });
  },
};
module.exports = UsersController;
