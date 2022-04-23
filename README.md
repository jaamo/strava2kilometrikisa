# Strava2kilometrikisa

An application to fill the gap between [Strava](https://strava.com/) and [Kilometrikisa](https://www.kilometrikisa.fi/).

Live at [https://www.strava2kilometrikisa.com](https://www.strava2kilometrikisa.com)

## Development

1. Run `$ docker-compose up -d` to spin up local Mongodb instance
2. Grab yourself some [Strava API credentials](https://developers.strava.com)
3. Copy and configure `app/.env.example` to `app/.env`
3.`$ source .env`
4. `$ nvm use`
5. `$ npm install`
6. `$ npm run dev`

## Database

This app uses a MongoDB database hosted on MongoDB Atlas. Mongoose is used as a database driver.

## Production on Heroku

Production application is hosted on Heroku.

## How to contribute

We would love your input! Check out how to contribute [here](./.github/CONTRIBUTING.md).

## Contributors

- Jaakko Alajoki
- Paul Stewart
