var strava = require('strava-v3');

var HomeController = {
	index: function(req, res, next) {

		console.log(req.session.stravaToken);

		res.render('index', {});


		// strava.athlete.get({},function(err,payload) {
		// 	if(!err) {
		// 		res.render('index', {data: payload});
		// 	}
		// 	else {
		// 		res.render('index', {data: err});
		// 	}
		// });

	}
};
module.exports = HomeController;
