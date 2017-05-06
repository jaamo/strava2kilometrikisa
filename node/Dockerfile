FROM phusion/baseimage:0.9.21

RUN apt-get update && apt-get install -y \
  wget \
  curl \
  sudo \
  git

RUN curl -sL https://deb.nodesource.com/setup_7.x | sudo bash - && \
    apt-get -y install python build-essential nodejs

#make a app dir
RUN mkdir -p /srv/www/app

#now lets use that dir for the following commands
WORKDIR /srv/www/app

#copy over packages.json and npm install
COPY ./app/package.json /srv/www/app
#RUN npm install

#install nodemon globally
RUN bash -c "npm install -g nodemon"
RUN bash -c "npm install -g gulp"
RUN bash -c "npm install -g bower"

#expose port 3000 as stated from the node app, maybe should be dynamic to play nicely with the node config
EXPOSE 3000

#copy entrypoint script and set permissions so we can execute
COPY entrypoint.sh /entrypoint.sh
RUN chmod 0755 /entrypoint.sh

#run that bad boy
CMD ["/entrypoint.sh"]
