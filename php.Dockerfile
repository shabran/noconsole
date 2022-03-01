FROM php:7.4.3-apache
COPY ./php.ini /usr/local/etc/php/conf.d
COPY ./html/ /var/www/html/
WORKDIR /var/www/html/
RUN apt-get update -y --fix-missing && apt-get upgrade -y
RUN apt-get install -y libldb-dev libldap2-dev && docker-php-ext-install -j$(nproc) ldap
RUN docker-php-ext-install mysqli pdo pdo_mysql
RUN chown www-data /var/www/html/uploads/
RUN chmod -R 0755 /var/www/html/uploads/
RUN chown www-data /var/www/html/uploads/tmp/
RUN chmod -R 0755 /var/www/html/uploads/tmp/



