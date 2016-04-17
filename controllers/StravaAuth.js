var strava = require('strava-v3');


/**
 * Handle Strava authentication.
 * @type {Object}
 */
var StravaAuthController = {


	/**
	 * Display login button.
	 *
	 * @param  {[type]}   req  [description]
	 * @param  {[type]}   res  [description]
	 * @param  {Function} next [description]
	 * @return {[type]}		[description]
	 */
	auth: function(req, res, next) {

		// Get strava authorize url.
		var url = strava.oauth.getRequestAccessURL({
			scope: "view_private"
		});
		res.render('strava-auth', { url: url });

	},

	authComplete: function(req, res, next) {

		// Not get access token from Strava.
		strava.oauth.getToken(req.query.code, function(err, payload) {

			// Save token to session.
			req.session.stravaToken = payload.access_token;

			// Redirect to Kilometrikisa login.
			res.redirect('/kilometrikisa/auth');

			// Error template.
			// res.render('strava-authcomplete', {});
		})

	}

};
module.exports = StravaAuthController;
