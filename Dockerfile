FROM node:5.11.0-wheezy

RUN mkdir -p /srv/www/app

WORKDIR /srv/www/app

COPY ./app /srv/www/app
RUN npm install

EXPOSE 3000

CMD [ "node", "app.js" ]