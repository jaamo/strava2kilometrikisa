FROM node:5.11.0-wheezy

RUN mkdir -p /srv/www/app

WORKDIR /srv/www/app

COPY ./app/package.json /srv/www/app
RUN npm install

EXPOSE 3000

#CMD [ "nodemon", "app.js" ]

CMD ping localhost