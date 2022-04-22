const strava = require('strava-v3');

interface StravaActivity {
  type: 'Ride' | 'EBikeRide';
  trainer: boolean;
  start_date_local: string;
  distance: number;
  moving_time: number;
}

interface Activity {
  date: string;
  distance: number;
  seconds: number;
  isEBike: boolean;
}

type ActivityByDate = Record<
  string,
  {
    distance: number;
    seconds: number;
    isEBike: boolean;
  }
>;

export type KilometrikisaActivityByDate = Record<
  string,
  {
    distance: number;
    hours: number;
    minutes: number;
    isEBike: boolean;
  }
>;

/**
 * Get cycling activities from Strava and calculate daily sum for distance and time.
 * Return in a format suitable for posting to Kilometrikisa:
 *
 * Example return value:
 *
 * {
 *   "2016-04-05": {
 *      distance: 1.5,
 *      isEBike: false,
 *      hours: 1,
 *      minutes: 23
 *  }
 * }
 *
 * Date format: YYYY-MM-DD, example: 2016-04-05
 *
 * @param stravaToken
 * @param syncEBike
 */

export async function getStravaActivities(
  stravaToken: string,
  syncEBike: boolean,
): Promise<KilometrikisaActivityByDate> {
  const activityByDate: ActivityByDate = await strava.athlete
    .listActivities({ access_token: stravaToken, after: lastFiveDaysDate() })
    .filter((activity: StravaActivity) => {
      return (activity.type === 'Ride' || (syncEBike && activity.type === 'EBikeRide')) && !activity.trainer;
    })
    .map((activity: StravaActivity) => {
      const dateFormatted = activity.start_date_local.replace(/T.*/, '');
      return {
        date: dateFormatted,
        distance: activity.distance / 1000,
        seconds: activity.moving_time,
        isEBike: activity.type === 'EBikeRide',
      };
    })
    .reduce((collection: ActivityByDate, activity: Activity) => {
      if (!collection[activity.date]) {
        collection[activity.date] = {
          distance: activity.distance,
          seconds: activity.seconds,
          isEBike: activity.isEBike,
        };
      } else {
        collection[activity.date].distance += activity.distance;
        collection[activity.date].seconds += activity.seconds;
        // There is no possibility to add 'acoustic' and e-bike rides for same day so if there is e-bike ride for a day,
        // all rides are marked as e-bike ride
        collection[activity.date].isEBike = activity.isEBike || collection[activity.date].isEBike;
      }
      return collection;
    }, {});

  // Convert to hours and minutes
  return Object.entries(activityByDate).reduce<KilometrikisaActivityByDate>((collection, activityByDate) => {
    const [date, activity] = activityByDate;
    const hours = Math.floor(activity.seconds / 3600);
    const minutes = Math.floor((activity.seconds - hours * 3600) / 60);

    collection[date] = {
      distance: activity.distance,
      isEBike: activity.isEBike,
      hours,
      minutes,
    };

    return collection;
  }, {});
}

/**
 * Get activities from last five days but not before 1st of may.
 */
function lastFiveDaysDate() {
  const d = new Date();
  let after = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 5).getTime() / 1000;
  const earliestTime = 1462060800; // 1st of may

  if (after < earliestTime) {
    after = earliestTime;
  }

  return after;
}
