var strava = require('strava-v3');

var StatsController = {
	index: function(req, res, next) {

		strava.athletes.stats({id: req.params.id},function(err,payload) {
			if(!err) {
				res.render('index', {data: payload});
			}
			else {
				res.render('index', {data: err});
			}
		});
	}
};
module.exports = StatsController;