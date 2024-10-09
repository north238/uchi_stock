FROM nginx:stable-alpine

WORKDIR /var/www/html

COPY . .
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

RUN adduser -s /bin/sh -D -G www-data www-data

RUN chmod -R 755 /var/www/html/
RUN chown -R www-data:www-data /var/www/html/
