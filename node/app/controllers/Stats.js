var strava = require('strava-v3');
var async = require('async');
const User = require('../models/UserModel.js');
const Log = require('../models/LogModel.js');

var StatsController = {
	athelete: function(req, res, next, stravaToken) {

		var id = req.params.id;

		//query for user from mongodb
		User.find({stravaUserId:req.params.id}, function(err, user) {

			strava.athletes.get({id: req.params.id},function(err,payload) {
				if(!err) {
					res.render('athelete', {data: payload});
				}
				else {
					res.render('athelete', {data: err});
				}
			});

		});
	},

	index: function(req, res, next) {

		var data = {};

		async.waterfall([
		  function(callback){
		    // code a
		    User.find({autosync:true}, function(err, users) {
		    	callback(null, users)
		    });
		    
		  },
		  function(users, callback){

		  	var data = {};
		  	data.users = users;
		  	data.logs = [123];
		    
		    users.forEach(function(user) {
		    	Log.find({stravaUserId:user.stravaUserId}, function(err, logs) {
            		data.logs[user.stravaUserId] = logs;
            	});
		    });

		    callback(null, data)
		  }], 
		  function (err, result) {
		   res.render('stats', {data: result});   
		  }
		);

		//User.find({autosync:true}, function(err, users) {

			// data.users = users;
			// data.usersFromStrava = [];
			// data.logs = [];

   //          users.forEach(function(user) {

   //              // strava.athletes.get({id: user.stravaUserId},function(err,payload) {
   //              // 	data.usersFromStrava.push(payload);
   //              // });

   //          	// Log.find({stravaUserId:user.stravaUserId}, function(err, logs) {
   //          	// 	data.logs[user.stravaUserId] = logs;
   //          	// });

   //          });

            //res.render('stats', {data: data});

        //});
	}
};
module.exports = StatsController;