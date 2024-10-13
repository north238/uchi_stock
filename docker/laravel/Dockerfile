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
    bash

# PHP拡張機能をインストール
RUN pecl install redis && \
    docker-php-ext-configure intl &&\
    docker-php-ext-enable redis && \
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

ENV COMPOSER_ALLOW_SUPERUSER 1
ENV COMPOSER_HOME /composer
ENV PATH $PATH:/composer/vendor/bin

WORKDIR /var/www/html

COPY ./backend .
COPY ./docker/laravel/php.ini /usr/local/etc/php/

RUN chown -R www-data:www-data /var/www/html/ && \
    chmod 777 -R /var/www/html/storage/

CMD ["php-fpm", "-F"]
