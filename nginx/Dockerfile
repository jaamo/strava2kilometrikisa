FROM nginx:1.11.6

#copy the nginx conf
COPY ./default.conf /etc/nginx/conf.d/default.conf

#copy some basic nginx security and caching
COPY ./conf /etc/nginx

# install certbot
RUN cd /root \
    && apt-get update \
    && apt-get install -y wget \
    && wget https://dl.eff.org/certbot-auto \
    && chmod a+x ./certbot-auto
