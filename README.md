# Strava2kilometrikisa

An application to fill the gap between [Strava](https://strava.com/) and [Kilometrikisa](https://www.kilometrikisa.fi/).

Live at [https://www.strava2kilometrikisa.com](https://www.strava2kilometrikisa.com)

## Development

1. Grab yourself some [Strava API credentials](https://developers.strava.com)
1. Copy and configure `app/.env.example` to `app/.env`
1. `$ source .env`
1. `$ nvm use`
1. `$ npm install`
1. `$ npm run dev`

## Database

This app uses a MongoDB database hosted on MongoDB Atlas. Mongoose is used as a database driver.

Local development container for mongoDB can be started with
```language
docker-compose -f dev-mongo-stack.yml up
```

Local Mongo credentials can be found in `app/.env.example`.

## Production on Heroku

Production application is hosted on Heroku.

## How to contribute

We would love your input! Check out how to contribute [here](./.github/CONTRIBUTING.md).

## Contributors

- Jaakko Alajoki
- Paul Stewart
