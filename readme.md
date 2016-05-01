Installation:
==========

1. Run: source openrc
2. Insert database credentials
3. Create file app/data/strava_config*
3. Run docker-compose -up -d
4. Open the site in your browser

Scheduled task
==============

Cron.js takes care of your scheduled task. It's set up automatically when you boot up your docker container, but in case you need to do it manually, I'll add it here for reference:
0 4 * * * node /path/to/app/cron.js
