FROM nginx:stable-alpine

COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

WORKDIR /var/www/html

COPY ./frontend /usr/share/nginx/html
COPY ./backend /var/www/html

RUN adduser -s /bin/sh -D -G www-data www-data

RUN chmod -R 644 /var/www/html/
RUN chown -R www-data:www-data /var/www/html/
