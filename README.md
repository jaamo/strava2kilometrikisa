# Strava2kilometrikisa-2
A fork from original Strava2Kilometrikisa app. Goal is to modernize the code and port the project to Typescript.

An application to fill the gap between [Strava](https://strava.com/) and [Kilometrikisa](https://www.kilometrikisa.fi/).

## Development

1. Run `$ docker-compose up -d` to spin up local Mongodb instance
2. Grab yourself some [Strava API credentials](https://developers.strava.com)
3. Copy and configure `app/.env.example` to `app/.env`
3.`$ source .env`
4. `$ nvm use`
5. `$ npm install`
6. `$ npm run dev`

## Database

This app uses a MongoDB database.

## How to contribute

We would love your input! Check out how to contribute [here](./.github/CONTRIBUTING.md).
