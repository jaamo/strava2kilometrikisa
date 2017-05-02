# stava2kilometrikisa

An application to fill the gap between Strava and Kilometrikisa. A docker setup with a node application running in 1 container with nginx running to create a reverse proxy in another container.

Visit the site to use it: http://strava2kilometrikisa.com

## Installation

1. Clone this project
2. Go to node/app folder.
3. Run `npm install -g nodemon`.
4. Set these env variables: KILOMETRIKISA_DB, KILOMETRIKISA_DBUSER, KILOMETRIKISA_DBPASSWORD, KILOMETRIKISA_DBHOST,
STRAVA_ACCESS_TOKEN, STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI
5. Run `bower install`
5. Run `npm run build`
6. Visit your localhost/dev environment on port 3000
7. enjoy.

## Usage

The default dev port for this node application is 3000.

## Credits

Jaakko Alajoki & Paul Stewart

## License

What license? :)
