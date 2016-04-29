var strava = require('strava-v3');

var ActivitiesController = {
	index: function(req, res, next) {

		strava.athlete.listActivities({},function(err,payload) {
			if(!err) {
				res.render('activities', {data: payload});
			}
			else {
				res.render('activities', {data: err});
			}
		});
	}
};
module.exports = ActivitiesController;