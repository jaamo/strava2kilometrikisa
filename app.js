var kilometrikisa = require('./kilometrikisa.js');


kilometrikisa.login(
	"jaamo",
	"KissaKoira2",
	function(token, sessionId) {

		console.log("Login complete: " + token + " / " + sessionId);

	    kilometrikisa.updateLog(token, sessionId, 17, 66, "2016-04-05", function() {
	        console.log("ok");
	    })


	},
	function() {
		console.log("Not logged in...");
	}
);


	//
	// kilometrikisa.isLoggedIn(
	// 	token,
	// 	sessionId,
	// 	function() {
	// 		console.log("Logged in");
	// 	},
	// 	function() {
	// 		console.log("Not logged in.");
	// 	}
	// );


// kilometrikisa.login("jaamo", "KissaKoira", function() {
//
//     kilometrikisa.updateLog(17, 66, "2016-04-05", function() {
//         console.log("ok");
//     })
//
// });
