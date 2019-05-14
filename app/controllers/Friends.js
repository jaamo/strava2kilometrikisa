var strava = require('strava-v3');

var FriendsController = {
	index: function(req, res, next) {

		strava.athlete.listFriends({},function(err,payload) {
			if(!err) {
				res.render('friends', {data: payload});
			}
			else {
				res.render('friends', {data: err});
			}
		});
	}
};
module.exports = FriendsController;