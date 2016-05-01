#!/bin/bash

#change dir to the app folder
cd /srv/www/app

#install node packages
npm install

#install our bower deps
bower install --allow-root

#build dist css and js
gulp build

#run nodemon so we can watch for changes in the app files, important note, we musy use --legacy-watch to allow files to be watched over the network of containers
nodemon --legacy-watch app.js
