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



	/**
	 * Handle response form Strava Oauth2 flow. Redirect to Kilometrikisa login on success.
	 *
	 * @param req
	 * @param res
	 * @param next
     */
	authComplete: function(req, res, next) {

		// Not get access token from Strava.
		strava.oauth.getToken(req.query.code, function(err, payload) {

			console.log(err);
			console.log(payload);

			// If error is set, show error message.
			if (typeof(req.query.error) != 'undefined') {

				res.render('strava-autherror', {});

			}
			// Otherwise save token and continue.
			else {

				// Save token to session.
				req.session.stravaToken = payload.access_token;
				req.session.stravaUserId = payload.athlete.id;

				// Update session token to database.
				//var user = mongoose

				// Redirect to Kilometrikisa login.
				res.redirect('/kilometrikisa/auth');


			}

		})

	}




};
module.exports = StravaAuthController;
