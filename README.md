# stava2kilometrikisa

An application to fill the gap between Strava and Kilometrikisa. A docker setup with a node application running in 1 container with nginx running to create a reverse proxy in another container.

Visit the site to use it: [http://strava2kilometrikisa.com](http://strava2kilometrikisa.com)

## Installation

1. Copy `/node/app/.env.example` to `/node/app/.env` and configure
2. Run `docker-compose up -d` to boot up the stack and build the application.
3. View the site in your web browser, through the standard port 80, as we are using a proxy pass for the node server within nginx.

## Notes

* The default dev port for this node application is 3000.

## Contributors

* Jaakko Alajoki
* Paul Stewart
