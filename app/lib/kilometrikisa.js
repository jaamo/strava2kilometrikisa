var curl = require('curlrequest');

/**
 * Kilometrikisa client.
 *
 * Currently updating kilometers for given date.
 */
var kilometrikisa = {
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
   * @param  {Integer}   ebike   Is daily ride added as e-bike ride
   * @param  {String}   date      Date. YYYY-MM-DD, example: 2016-04-05
   * @param  {Function} callback  Called on success.
   */
  updateLog: function (token, sessionId, contestId, distance, ebike, date, successCallback, errorCallback) {
    // curl -X POST
    // -e https://www.kilometrikisa.fi/contest/log/
    // -d "contest_id=17&km_amount=10&km_date=2016-04-05&csrfmiddlewaretoken=9Jw5rFmg4LGYr9sT23oOZNQtzFFluWWF"
    // -b "csrftoken=9Jw5rFmg4LGYr9sT23oOZNQtzFFluWWF; sessionid=oj1ueczy2uhw764vyo6kbhpw6sj7way1"
    // --trace-ascii - https://www.kilometrikisa.fi/contest/log-save/

    // Submit username, password and CSFR token to login form.
    var options = {
      url: 'https://www.kilometrikisa.fi/contest/log-save/',
      method: 'POST',
      referer: 'https://www.kilometrikisa.fi/contest/log/',
      headers: {
        Cookie: 'csrftoken=' + token + '; sessionid=' + sessionId + ';',
      },
      data: {
        contest_id: contestId,
        km_amount: distance,
        is_electric: ebike,
        km_date: date,
        csrfmiddlewaretoken: token,
      },
      verbose: true,
      include: true,
      useragent: 'strava2kilometrikisa-agen',
      location: false, // do not follow header location
    };
    curl.request(
      options,
      function (err, stdout, meta) {
        // Check for header location header. If header exists, user is not
        // logged in.
        var rows = stdout.split('\n');
        var loggedIn = true;
        for (var i in rows) {
          if (rows[i].indexOf('403 FORBIDDEN') != -1) {
            loggedIn = false;
          }
        }

        if (loggedIn) {
          setTimeout(function () {
            successCallback();
          }, 500);
        } else {
          errorCallback('Session timeout.');
        }
      }.bind(this),
    );
  },

  /**
   * Update time.
   *
   * @param  {String}   token     Session token.
   * @param  {String}   sessionId Session id.
   * @param  {Integer}   contestId Contest id. Changes every year.
   * @param  {Float}   hours  Hours.
   * @param  {Float}   minutes  Minutes.
   * @param  {Integer}   ebike   Is daily ride added as e-bike ride
   * @param  {String}   date      Date. YYYY-MM-DD, example: 2016-04-05
   * @param  {Function} callback  Called on success.
   */
  updateMinuteLog: function (token, sessionId, contestId, hours, minutes, ebike, date, successCallback, errorCallback) {
    // curl -X POST
    // -e https://www.kilometrikisa.fi/contest/log/
    // -d "contest_id=17&km_amount=10&km_date=2016-04-05&csrfmiddlewaretoken=9Jw5rFmg4LGYr9sT23oOZNQtzFFluWWF"
    // -b "csrftoken=9Jw5rFmg4LGYr9sT23oOZNQtzFFluWWF; sessionid=oj1ueczy2uhw764vyo6kbhpw6sj7way1"
    // --trace-ascii - https://www.kilometrikisa.fi/contest/log-save/

    // Submit username, password and CSFR token to login form.
    var options = {
      url: 'https://www.kilometrikisa.fi/contest/minute-log-save/',
      method: 'POST',
      referer: 'https://www.kilometrikisa.fi/contest/log/',
      headers: {
        Cookie: 'csrftoken=' + token + '; sessionid=' + sessionId + ';',
      },
      data: {
        contest_id: contestId,
        hours: hours,
        minutes: minutes,
        is_electric: ebike,
        date: date,
        csrfmiddlewaretoken: token,
      },
      verbose: true,
      include: true,
      useragent: 'strava2kilometrikisa-agen',
      location: false, // do not follow header location
    };
    curl.request(
      options,
      function (err, stdout, meta) {
        // Check for header location header. If header exists, user is not
        // logged in.
        var rows = stdout.split('\n');
        var loggedIn = true;
        for (var i in rows) {
          if (rows[i].indexOf('403 FORBIDDEN') != -1) {
            loggedIn = false;
          }
        }

        if (loggedIn) {
          setTimeout(function () {
            successCallback();
          }, 500);
        } else {
          errorCallback('Session timeout.');
        }
      }.bind(this),
    );
  },
};

module.exports = kilometrikisa;
