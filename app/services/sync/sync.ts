import * as kilometrikisa from 'kilometrikisa-client';
import { getStravaActivities, KilometrikisaActivityByDate } from '../strava/strava';

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
export async function doSync(
  stravaUserId: number,
  stravaToken: string,
  kilometrikisaToken: string,
  kilometrikisaSessionId: string,
  syncEBike: boolean,
) {
  const activities = await getStravaActivities(stravaToken, syncEBike);
  const session = await kilometrikisa.kilometrikisaSession({
    token: kilometrikisaToken,
    sessionId: kilometrikisaSessionId,
  });

  const contestId = parseInt(process.env.KILOMETRIKISA_COMPETITION_ID ?? '0');
  const failedActivities: KilometrikisaActivityByDate = {};
  const syncedActivities = Promise.all(
    Object.entries(activities).map(async ([date, activity]) => {
      try {
        return await session.updateContestLog(contestId, date, activity.distance, activity.isEBike);
      } catch (err) {
        failedActivities[date] = activity;
      }
    }),
  );

  if (Object.entries(failedActivities).length > 0) {
    throw new Error('SyncModel.doSync: Failed to sync following activities: ' + JSON.stringify(failedActivities));
  }

  return syncedActivities;
}
