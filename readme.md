# stava2kilometrikisa

An application to fill the gap between Strava and Kilometrikisa. A docker setup with a node application running in 1 container with nginx running to create a reverse proxy in another container.

## Installation

1. clone this project
2. Create data/strava_config file:
   ```{
     "access_token": "",
     "client_id": "",
     "client_secret": "",
     "redirect_uri": ""
  }```
3. npm run build
4. Visit your localhost/dev environment on port 3000
5. enjoy.

## Usage

The default dev port for this node application is 3000.

## Credits

Jaakko Alajoki & Paul Stewart

## License

What license? :)
