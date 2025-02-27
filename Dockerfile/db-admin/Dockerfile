FROM node:lts-alpine

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/edge/main' > /etc/apk/repositories
RUN apk update --allow-untrusted
RUN apk upgrade --allow-untrusted
RUN apk add postgresql${POSTGRES_VERSION%%-*}-client --allow-untrusted

WORKDIR /db-admin

RUN npm i -g graphile-migrate

COPY init-and-watch.sh /usr/local/bin/init-and-watch.sh

CMD ["init-and-watch.sh"]
