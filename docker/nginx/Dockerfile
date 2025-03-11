FROM nginx:stable-alpine

WORKDIR /var/www/html

# 設定ファイルをコンテナ内のNginx設定フォルダへコピー
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

# アプリケーションファイルをコピー
COPY ./htdocs /var/www/html

# Laravelの権限設定（Nginxユーザーでアクセス可能に）
RUN adduser -s /bin/sh -D -G www-data www-data \
  && chown -R www-data:www-data /var/www/html \
  && chmod -R 755 /var/www/html

CMD ["nginx", "-g", "daemon off;"]
