var Kilometrikisa = require('../lib/kilometrikisa.js');

var KilometrikisaController = {
	index: function(req, res, next) {

		Kilometrikisa.login(
			"jaamo",
			"KissaKoira2",
			function(token, sessionId) {

				console.log("Login complete: " + token + " / " + sessionId);

			    Kilometrikisa.updateLog(token, sessionId, 17, 66, "2016-04-05", function() {
			        console.log("ok");
			    })


			},
			function() {
				console.log("Not logged in...");
			}
		);

		res.render('kilometrikisa', {data: 'check the terminal log'});
	}
};
module.exports = KilometrikisaController;