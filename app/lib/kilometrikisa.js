var curl = require('curlrequest');

/**
 * Kilometrikisa client.
 *
 * Currently supports login and updating kilometers for given date.
 */
var kilometrikisa = {

    // CSRF token set by Kilometrikisa python application.
    // token: "",

    // Session id.
    // sessionId: "",

    /**
     * Authenticate.
     *
     * Exammple:
     *
     * kilometrikisa.login(
     *         "username",
     *          "password",
     *           function(token, sessionId) {
     *           // SUCCESS!
     *        },
     *        function() {
     *           // fail...
     *        }
     * );
     **
     * @param  {String} username        Username.
     * @param  {String} password        Kilometrikisa.
     * @param  {Function} successCallback Called on success. Token and sessio id are passed as parameters.
     * @param  {Function} errorCallback   Called on failure.
     */
    login: function(username, password, successCallback, errorCallback) {

        var token = "";

        // First request a login page to get CSRF token.
        var options = {
            url: 'https://www.kilometrikisa.fi/accounts/login/',
            verbose: true,
            include: true
        };
        curl.request(options, function (err, stdout, meta) {

            // Get CSRF value from cookie header.
            var rows = stdout.split("\n");
            for (var i in rows) {
                if (rows[i].indexOf("Set-Cookie") != -1) {
                    token = rows[i].replace(/.*csrftoken=/, "").replace(/;.*/, "").replace(/\W/g, '');
                }
            }

            console.log("Token is: '" + token + "'");

            this.loginStep2(username, password, token, successCallback, errorCallback);

        }.bind(this));

    },


    /**
     * Submit username and password.
     */
    loginStep2: function(username, password, token, successCallback, errorCallback) {

        var sessionId;

        // curl
        //     —X POST
        //     -e https://www.kilometrikisa.fi/accounts/login/
        //     -d "username=jaamo&password=KissaKoira&csrfmiddlewaretoken=hqNidhseJ00ViJBwnnADnh4JRxsAO79o"
        //     -b "csrftoken=hqNidhseJ00ViJBwnnADnh4JRxsAO79o"
        //     --trace-ascii - https://www.kilometrikisa.fi/accounts/login/


        // Submit username, password and CSFR token to login form.
        var options = {
            url: "https://www.kilometrikisa.fi/accounts/login/",
            method: "POST",
            referer: "https://www.kilometrikisa.fi/accounts/login/", // referer
            headers: {
                // "Referer": "https://www.kilometrikisa.fi/accounts/login/",
                "Cookie": "csrftoken=" + token // cookie
            },
            data: {
                username: username,
                password: password,
                csrfmiddlewaretoken: token
            },
            verbose: true,
            include: true,
            location: false // do not follow header location
        };
        curl.request(options, function (err, stdout, meta) {

            console.log(meta.args);
            console.log('%s %s', meta.cmd, meta.args.join(' '));
            console.log(stdout);


            // // Get CSRF value from cookie header.
            var rows = stdout.split("\n");
            for (var i in rows) {
                if (rows[i].indexOf("Set-Cookie: csrftoken=") != -1) {
                    token = rows[i].replace(/.*csrftoken=/, "").replace(/;.*/, "").replace(/\W/g, '');
                }
                if (rows[i].indexOf("Set-Cookie: sessionid=") != -1) {
                    sessionId = rows[i].replace(/.*sessionid=/, "").replace(/;.*/, "").replace(/\W/g, '');
                }
            }

            console.log("New token '" + token + "'");
            console.log("New session id '" + sessionId + "'");

            if (!token || !sessionId) {
                errorCallback();
            } else {
                successCallback(token, sessionId);
            }

        }.bind(this));

    },



    /**
     * Check login status.
     * @param  {String} token               Session token.
     * @param  {String} sessionId            Session id.
     * @param  {Function} successCallback     Called if user is logged in.
     * @param  {Function} errorCallback       Called if user is not logged in.
     */
    isLoggedIn: function(token, sessionId, successCallback, errorCallback) {

        // Request account page and check if it redirects to login form.
        var options = {
            url: "https://www.kilometrikisa.fi/accounts/index/",
            method: "GET",
            referer: "https://www.kilometrikisa.fi/accounts/index/",
            headers: {
                "Cookie": "csrftoken=" + token + "; sessionid=" + sessionId + ";"
            },
            verbose: true,
            include: true,
            location: false // do not follow header location
        };
        curl.request(options, function (err, stdout, meta) {

            // console.log(meta.args);
            // console.log('%s %s', meta.cmd, meta.args.join(' '));
            // console.log(stdout);

            // Get session value from cookies.
            var rows = stdout.split("\n");
            var loggedIn = true;
            for (var i in rows) {
                // console.log(rows[i]);
                if (rows[i].indexOf("Location:") != -1 && rows[i].indexOf("login") != -1) {
                    loggedIn = false;
                }
            }

            if (loggedIn) {
                successCallback();
            } else {
                errorCallback();
            }


        }.bind(this));


    },


    /**
     * Update distance.
     *
     * Example:
     *
     * kilometrikisa.updateLog(token, sessionId, 17, 66, "2016-04-05", function() {
     *         // OK!
     * })
     *
     * @param  {String}   token     Session token.
     * @param  {String}   sessionId Session id.
     * @param  {Integer}   contestId Contest id. Changes every year.
     * @param  {Float}   distance  Distance for a day.
     * @param  {String}   date      Date. YYYY-MM-DD, example: 2016-04-05
     * @param  {Function} callback  Called on success.
     */
    updateLog: function(token, sessionId, contestId, distance, date, successCallback, errorCallback) {


        // curl -X POST
        // -e https://www.kilometrikisa.fi/contest/log/
        // -d "contest_id=17&km_amount=10&km_date=2016-04-05&csrfmiddlewaretoken=9Jw5rFmg4LGYr9sT23oOZNQtzFFluWWF"
        // -b "csrftoken=9Jw5rFmg4LGYr9sT23oOZNQtzFFluWWF; sessionid=oj1ueczy2uhw764vyo6kbhpw6sj7way1"
        // --trace-ascii - https://www.kilometrikisa.fi/contest/log-save/


        // Submit username, password and CSFR token to login form.
        var options = {
            url: "https://www.kilometrikisa.fi/contest/log-save/",
            method: "POST",
            referer: "https://www.kilometrikisa.fi/contest/log/",
            headers: {
                "Cookie": "csrftoken=" + token + "; sessionid=" + sessionId + ";"
            },
            data: {
                contest_id: contestId,
                km_amount: distance,
                km_date: date,
                csrfmiddlewaretoken: token
            },
            verbose: true,
            include: true,
            location: false // do not follow header location
        };
        curl.request(options, function (err, stdout, meta) {

            // Check for header location header. If header exists, user is not
            // logged in.
            var rows = stdout.split("\n");
            var loggedIn = true;
            for (var i in rows) {
                // console.log(rows[i]);
                if (rows[i].indexOf("403 FORBIDDEN") != -1) {
                    loggedIn = false;
                }
            }

            if (loggedIn) {
                successCallback();
            } else {
                errorCallback("Session timeout.");
            }

        }.bind(this));

    },


    /**
     * Get monthy entries from Kilometrikisa as an object.
     *
     * @param token
     * @param sessionId
     * @param startDate
     * @param endDate
     */
    getLog: function(token, sessionId, startDate, endDate) {


        // Submit username, password and CSFR token to login form.
        var options = {
            url: "http://www.kilometrikisa.fi/contest/log_list_json/17/?start=1459112400&end=1462136400&_=1461005550108",
            method: "GET",
            referer: "https://www.kilometrikisa.fi/contest/log/",
            headers: {
                "Cookie": "csrftoken=" + token + "; sessionid=" + sessionId + ";"
            },
            verbose: true,
            include: true,
            location: false // do not follow header location
        };
        curl.request(options, function (err, stdout, meta) {

            console.log('%s %s', meta.cmd, meta.args.join(' '));
            console.log(stdout);

//            callback();

        }.bind(this));


    }



}

module.exports = kilometrikisa;
