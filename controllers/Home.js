var strava = require('strava-v3');
var Kilometrikisa = require('../lib/kilometrikisa.js');
var Sync = require('./Sync.js');

var HomeController = {
	index: function(req, res, next) {
        // Sync.getStravaActivities();

        // if (typeof(req.session.parsa) == "undefined") {
        //     req.session.parsa = Math.random();
        // }
        // console.log(req.session.parsa);

		res.render('index', {});

        // Kilometrikisa.mergeWithStrava();





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
