# Strava2kilometrikisa

An application to fill the gap between [Strava](https://strava.com/) and [Kilometrikisa](https://www.kilometrikisa.fi/).

Live at [https://strava2kilometrikisa.com](https://strava2kilometrikisa.com)

## Development

1. Grab yourself some [Strava API credentials](https://developers.strava.com)
1. Copy and configure `app/.env.example` to `app/.env`
1. `$ source .env`
1. `$ npm install`
1. `$ npm run dev`

## Database

This app uses MondoDB database for storing logs users. Mongoose is used as a database driver.

MondoDB Atlas free tier is used on production:  
https://cloud.mongodb.com

## Production on Heroku

Production application is hosted on Heroku:  
https://dashboard.heroku.com

## How to contribute

We would love your input! Check out how to contribute [here](./.github/CONTRIBUTING.md).

## Contributors

- Jaakko Alajoki
- Paul Stewart
