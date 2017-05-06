FROM nginx:1.11.6

#copy the nginx conf
COPY ./default.conf /etc/nginx/conf.d/default.conf

#copy some basic nginx security and caching
COPY ./conf /etc/nginx