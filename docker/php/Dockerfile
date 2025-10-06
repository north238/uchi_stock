FROM php:8.2-fpm-alpine AS php-fpm

EXPOSE 9000

# PHPの依存関係をインストール
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    zlib-dev \
    icu-libs \
    icu-dev \
    libzip-dev \
    libxml2-dev \
    oniguruma-dev \
    curl-dev \
    tzdata \
    php-mysqli \
    mysql-client \
    linux-headers \
    bash \
    nodejs \
    npm

# PHP拡張機能をインストール
RUN pecl install redis xdebug && \
    docker-php-ext-configure intl &&\
    docker-php-ext-enable redis xdebug && \
    docker-php-ext-install zip \
    intl \
    pdo_mysql \
    ctype \
    dom \
    fileinfo \
    filter \
    mbstring \
    pdo \
    session \
    xml

# 不要なパッケージを削除
RUN apk del $PHPIZE_DEPS

# Composer install 2.7.2
COPY --from=composer:2.7.2 /usr/bin/composer /usr/local/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_HOME=/composer
ENV PATH=$PATH:/composer/vendor/bin

COPY ./htdocs ./
COPY ./docker/php/php.ini /usr/local/etc/php/
COPY ./docker/php/www.conf /usr/local/etc/php-fpm.d/www-custom.conf

# node_modulesをインストール
RUN npm install

# xdebugを稼働させるために必要
RUN mkdir -p /var/log && chmod -R 777 /var/log

# nginxからのアクセスを可能にするため
RUN chown -R www-data:www-data /var/www/html/ && \
    chmod 755 -R /var/www/html/storage/ /var/www/html/public/ /var/www/html/bootstrap/cache/

CMD ["php-fpm", "-F"]
