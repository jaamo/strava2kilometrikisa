var Kilometrikisa = require('../lib/kilometrikisa.js');
var strava = require('strava-v3');

var SyncModel = {
  /**
   * Get cycling activities from Strava and calculate daily sum for distance and time.
   * Return in a format suitable for posting to Kilometrikisa:
   *
   * Example return value:
   *
   * {
   *   "2016-04-05": {
   *      distance: 1,5,
   *      hours: 1,
   *      minutes: 23
   *  }
   * }
   *
   * Date format: YYYY-MM-DD, example: 2016-04-05
   *
   * @param Function Callback.
   * @return {[type]} [description]
   */
  getStravaActivities: function (stravaToken, syncEBike, successCallback, errorCallback) {
    // Example input:
    // var activities = [ { id: 540164876,
    //     resource_state: 2,
    //     external_id: 'A07BF513-B26D-416F-A1C7-6946CFA00E9C',
    //     upload_id: 593065117,
    //     athlete: { id: 2914941, resource_state: 1 },
    //     name: 'Afternoon Ride',
    //     distance: 63905.3,
    //     moving_time: 9831,
    //     elapsed_time: 10933,
    //     total_elevation_gain: 946.6,
    //     type: 'Ride',
    //     start_date: '2016-04-09T11:05:15Z',
    //     start_date_local: '2016-04-09T14:05:15Z',
    //     timezone: '(GMT+02:00) Europe/Helsinki',
    //     start_latlng: [ 60.223029, 24.816933 ],
    //     end_latlng: [ 60.223178, 24.81664 ],
    //     location_city: 'Espoo',
    //     location_state: 'Uusimaa',
    //     location_country: 'Finland',
    //     start_latitude: 60.223029,
    //     start_longitude: 24.816933,
    //     achievement_count: 12,
    //     kudos_count: 0,
    //     comment_count: 0,
    //     athlete_count: 2,
    //     photo_count: 0,
    //     map:
    //      { id: 'a540164876',
    //        summary_polyline: '{hqnJy`nvCfMlGzEzsAaRjg@yB_@cB`hAaKxe@qAna@hCr|BcAl~@~GliBgBtt@fNrfH~Jb`@rXpUbElKb]rpAvHto@rA`CtI_O|Bt@rJjZ|EpDvVxs@lRhy@~OjYjj@zxB`BrPoH|PmQhqAtI|q@fWfQjDpYlJxLxRrr@jj@{BlUtd@zo@hX`[de@oI`^gHdu@fQriA`@zw@sFblA~Ajc@`Mxm@zJ`PvHdn@hZrMh[yV`GfZzD|DJ|PnJxe@|ZnVsAn_AtEta@oIvc@{KhJiLoEcPjSgLrAk\\lk@cQxLyO~l@mW|g@_{@dJob@s]{PosAdFiv@o@}PtEyPiAcSqGqIkLbHkNyFsFuj@oHsFqGiYaXidCk^kw@_NiyAya@qn@yBsX{HgJxB}a@qCk]rTkiBp@u`CvUqgBZkY_KglAxVyn@dEou@bFmTCcUaE_]}M{Tmk@arBgGmF{IqYqCq@mI|N_Msy@k\\ynA}Ze[wOqc@bAul@wN_}FjB{v@mGicBjBiz@kE_{BdAu`@tL{s@dCw}ArLkq@aAsNkOvDcAeVnE{DM_K',
    //        resource_state: 2 },
    //     trainer: false,
    //     commute: false,
    //     manual: false,
    //     private: false,
    //     flagged: false,
    //     gear_id: null,
    //     average_speed: 6.5,
    //     max_speed: 16.4,
    //     average_watts: 252.4,
    //     kilojoules: 2481.3,
    //     device_watts: false,
    //     has_heartrate: false,
    //     elev_high: 57,
    //     elev_low: 4.9,
    //     total_photo_count: 0,
    //     has_kudoed: false,
    //     workout_type: 10 } ];

    // Get activities from last five days but not before 1st of may.
    var d = new Date();
    var after = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 5).getTime() / 1000;
    var earliestTime = 1462060800; // 1st of may
    if (after < earliestTime) after = earliestTime;

    strava.athlete.listActivities({ access_token: stravaToken, after: after }, function (err, activities) {
      if (!err && activities) {
        var response = {};
        for (var i in activities) {
          if (
            (activities[i]['type'] == 'Ride' || (syncEBike && activities[i]['type'] == 'EBikeRide')) &&
            activities[i]['trainer'] == false
          ) {
            // Format date.
            var date = new Date(activities[i]['start_date_local']);
            var dateFormatted =
              date.getFullYear() + '-' + ('0' + date.getMonth()).slice(-2) + '-' + ('0' + date.getDay()).slice(-2);

            dateFormatted = activities[i]['start_date_local'].replace(/T.*/, '');

            // Init date.
            if (typeof response[dateFormatted] == 'undefined') {
              response[dateFormatted] = {
                distance: 0,
                seconds: 0,
                isEBike: false,
              };
            }

            // Append kilometers.
            response[dateFormatted].distance += parseFloat(activities[i]['distance']) / 1000;

            // Append time in seconds.
            response[dateFormatted].seconds += activities[i]['moving_time'];

            // There is no possibility to add 'acoustic' and e-bike rides for same day so if there is e-bike ride for a day,
            // all rides are marked as e-bike ride
            if (activities[i]['type'] == 'EBikeRide') {
              response[dateFormatted].isEBike = true;
            }
          }
        }

        // Round distance to 2 decimals and
        // convert seconds into hours and minutes.
        for (var date in response) {
          response[date].distance = Math.round(response[date].distance * 100) / 100;
          response[date].hours = Math.floor(response[date].seconds / 3600);
          response[date].minutes = Math.floor((response[date].seconds - response[date].hours * 3600) / 60);
        }

        successCallback(response);
      } else {
        errorCallback(JSON.stringify(activities));
      }
    });
  },

  /**
   * Sync items from Strava to Kilometrikisa.
   *
   * @param  {[type]} stravaUserId           Strava user id.
   * @param  {[type]} stravaToken            Kilometrikisa token.
   * @param  {[type]} stravaToken            Kilometrikisa token.
   * @param  {[type]} kilometrikisaToken     Kilometrikisa token.
   * @param  {[type]} kilometrikisaSessionId Kilometrikisa session id.
   * @param  {[type]} successCallback        Success callback.
   * @param  {[type]} errorCallback          Connection to Strava failed.
   */
  doSync: function (
    stravaUserId,
    stravaToken,
    kilometrikisaToken,
    kilometrikisaSessionId,
    syncEBike,
    successCallback,
    errorCallback,
  ) {
    // Check that tokens are set.
    if (!stravaToken) {
      errorCallback('SyncModel.doSync: stravaToken is not set');
      return;
    }
    if (!kilometrikisaToken) {
      errorCallback('SyncModel.doSync: kilometrikisaToken is not set');
      return;
    }
    if (!kilometrikisaSessionId) {
      errorCallback('SyncModel.doSync: kilometrikisaSessionId is not set');
      return;
    }

    // Get activities from Strava.
    SyncModel.getStravaActivities(
      stravaToken,
      syncEBike,
      function (activities) {
        // Counters. We do two requests per each activity. One for distance
        // and one for time.
        var amount = Object.keys(activities).length * 2;
        var count = 0;

        // List of failed activities.
        var failedActivities = {};

        // No activities, just quit.

        if (Object.keys(activities).length == 0) {
          successCallback(activities);
        }

        // Add each activity to Kilometrikisa.
        for (var date in activities) {
          // Update distance to kilometrikisa.
          Kilometrikisa.updateLog(
            kilometrikisaToken,
            kilometrikisaSessionId,
            process.env.KILOMETRIKISA_COMPETITION_ID,
            activities[date].distance,
            activities[date].isEBike ? 1 : 0,
            date,
            function () {
              cb();
            },
            function (error) {
              failedActivities[date] = activities[date];
              cb();
            },
          );

          // Update duration to kilometrikisa.
          Kilometrikisa.updateMinuteLog(
            kilometrikisaToken,
            kilometrikisaSessionId,
            process.env.KILOMETRIKISA_COMPETITION_ID,
            activities[date].hours,
            activities[date].minutes,
            activities[date].isEBike ? 1 : 0,
            date,
            function () {
              cb();
            },
            function (error) {
              failedActivities[date] = activities[date];
              cb();
            },
          );

          // Inline callback function to handle kilometrikisa response.
          function cb() {
            // Increase counter.
            count++;

            // All activities synced.
            if (count == amount) {
              // No errors!
              if (Object.keys(failedActivities).length == 0) {
                successCallback(activities);
              } else {
                errorCallback(
                  'SyncModel.doSync: Failed to sync following activities: ' + JSON.stringify(failedActivities),
                );
              }
            }
          }
        }
      },
      function (error) {
        errorCallback('SyncModel.doSync: Cannot get activities: ' + error);
      },
    );
  },
};
module.exports = SyncModel;
