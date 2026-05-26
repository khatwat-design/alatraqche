FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    unzip \
    git \
    curl \
    nginx \
    supervisor

RUN docker-php-ext-install pdo pdo_pgsql pdo_mysql zip bcmath opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

COPY infra/nginx.conf /etc/nginx/http.d/default.conf
COPY infra/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY infra/php.ini /usr/local/etc/php/conf.d/custom.ini

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
