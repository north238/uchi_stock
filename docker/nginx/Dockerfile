FROM nginx:stable-alpine

# 設定ファイルをコンテナ内のNginx設定フォルダへコピー
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./backend /var/www/html
# COPY ./frontend/build /usr/share/nginx/html

# Laravelの権限設定（Nginxユーザーでアクセス可能に）
RUN adduser -s /bin/sh -D -G www-data www-data \
  && chown -R www-data:www-data /var/www/html \
  && chmod -R 755 /var/www/html

WORKDIR /var/www/html
