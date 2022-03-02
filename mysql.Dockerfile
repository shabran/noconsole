FROM mysql:5.7.36
ENV TZ=Asia/Jakarta
ENV MYSQL_ROOT_PASSWORD=secret
ENV MYSQL_DATABASE=noconsole
ENV MYSQL_USER=nocuser
ENV MYSQL_PASSWORD=n0cus3r
COPY ./noconsole.sql ./noconsole.sql
# RUN mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD}
# RUN USE noconsole;
# RUN \. noconsole.sql