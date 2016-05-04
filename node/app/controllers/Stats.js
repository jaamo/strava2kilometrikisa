var strava = require('strava-v3');
const User = require('../models/UserModel.js');

var StatsController = {
	athelete: function(req, res, next) {

		strava.athletes.stats({id: req.params.id},function(err,payload) {
			if(!err) {
				res.render('index', {data: payload});
			}
			else {
				res.render('index', {data: err});
			}
		});
	},

	index: function(req, res, next) {
		return null;
	}
};
module.exports = StatsController;