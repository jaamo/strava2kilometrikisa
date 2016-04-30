var strava = require('strava-v3');

strava.athlete.get({},function(err,payload) {
	if(!err) {
		console.log(payload);
	}
	else {
		console.log(err);
	}
});