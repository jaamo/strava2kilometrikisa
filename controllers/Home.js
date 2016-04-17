var strava = require('strava-v3');

var HomeController = {
	index: function(req, res, next) {

		strava.athlete.get({},function(err,payload) {
			if(!err) {
				res.render('index', {data: payload});
			}
			else {
				res.render('index', {data: err});
			}
		});

	}
};
module.exports = HomeController;