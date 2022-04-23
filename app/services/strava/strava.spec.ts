import { getStravaActivities } from './strava';

jest.mock('strava-v3', () => {
  const activities = [
    {
      name: 'Morning Ride',
      distance: 33905.3,
      moving_time: 4831,
      type: 'Ride',
      start_date_local: '2021-05-09T14:05:15Z',
      trainer: false,
    },
    {
      name: 'Afternoon Ride',
      distance: 63905.3,
      moving_time: 9831,
      type: 'Ride',
      start_date_local: '2021-05-09T14:05:15Z',
      trainer: false,
    },
    {
      name: 'Walking around',
      distance: 12000.3,
      moving_time: 12000,
      type: 'Walk',
      start_date_local: '2021-05-10T14:05:15Z',
      trainer: false,
    },
    {
      name: 'Ebike ride',
      distance: 73905.3,
      moving_time: 10831,
      type: 'EBikeRide',
      start_date_local: '2021-05-11T14:05:15Z',
      trainer: false,
    },
    {
      name: 'Ride after ebike',
      distance: 3905.3,
      moving_time: 831,
      type: 'Ride',
      start_date_local: '2021-05-11T18:05:15Z',
      trainer: false,
    },
    {
      name: 'Trainer ride',
      distance: 63905.3,
      moving_time: 9831,
      type: 'Ride',
      start_date_local: '2021-05-09T14:05:15Z',
      trainer: true,
    },
  ];
  const originalModule = jest.requireActual('strava-v3');

  return {
    __esModule: true,
    ...originalModule,
    athlete: {
      listActivities: jest.fn().mockReturnValue(activities),
    },
  };
});

describe('Strava integration', () => {
  it('should sum rides to daily activities while ignoring trainer activities', async () => {
    const result = await getStravaActivities('token', true);

    expect(result['2021-05-09'].distance).toBeCloseTo(97.81);
    expect(result['2021-05-09'].isEBike).toBeFalsy();
    expect(result['2021-05-09'].hours).toEqual(4);
    expect(result['2021-05-09'].minutes).toEqual(4);

    expect(result['2021-05-11'].distance).toBeCloseTo(77.81);
    expect(result['2021-05-11'].isEBike).toBeTruthy();
    expect(result['2021-05-11'].hours).toEqual(3);
    expect(result['2021-05-11'].minutes).toEqual(14);
  });
});
