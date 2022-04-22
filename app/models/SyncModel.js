const kilometrikisa = require('kilometrikisa-client');
const { getStravaActivities } = require('../services/strava');

var SyncModel = {
  /**
   * Sync items from Strava to Kilometrikisa.
   *
   * @param  stravaUserId           Strava user id.
   * @param  stravaToken            Kilometrikisa token.
   * @param  stravaToken            Kilometrikisa token.
   * @param  kilometrikisaToken     Kilometrikisa token.
   * @param  kilometrikisaSessionId Kilometrikisa session id.
   * @param syncEBike
   */
  doSync: async function (stravaUserId, stravaToken, kilometrikisaToken, kilometrikisaSessionId, syncEBike) {
    // TODO: refactor this to real async-await
    return new Promise(async function (resolve, reject) {
      // Check that tokens are set.
      if (!stravaToken) {
        reject('SyncModel.doSync: stravaToken is not set');
        return;
      }
      if (!kilometrikisaToken) {
        reject('SyncModel.doSync: kilometrikisaToken is not set');
        return;
      }
      if (!kilometrikisaSessionId) {
        reject('SyncModel.doSync: kilometrikisaSessionId is not set');
        return;
      }

      try {
        const activities = await getStravaActivities(stravaToken, syncEBike);
        // Counters. We do two requests per each activity. One for distance
        // and one for time.
        var amount = Object.keys(activities).length * 2;
        var count = 0;

        // List of failed activities.
        var failedActivities = {};

        // No activities, just quit.
        if (Object.keys(activities).length == 0) {
          resolve(activities);
        }

        const session = await kilometrikisa.kilometrikisaSession({
          token: kilometrikisaToken,
          sessionId: kilometrikisaSessionId,
        });

        // Add each activity to Kilometrikisa.
        for (var date in activities) {
          try {
            await session.updateContestLog(
              process.env.KILOMETRIKISA_COMPETITION_ID,
              date,
              activities[date].distance,
              activities[date].isEBike,
            );
            cb();
          } catch (err) {
            failedActivities[date] = activities[date];
            cb();
          }

          try {
            await session.updateMinuteContestLog(
              process.env.KILOMETRIKISA_COMPETITION_ID,
              date,
              activities[date].hours,
              activities[date].minutes,
              activities[date].isEBike,
            );
            cb();
          } catch (err) {
            failedActivities[date] = activities[date];
            cb();
          }
        }
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
      } catch (err) {
        reject('SyncModel.doSync: Cannot get activities: ' + error);
      }
    });
  },
};
module.exports = SyncModel;
