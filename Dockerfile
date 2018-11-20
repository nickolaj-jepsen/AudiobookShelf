# Builder
FROM node:10-alpine AS builder
WORKDIR /srv

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++

COPY ./package* ./
RUN npm ci

COPY . /srv
RUN npm run build

# Runner
FROM node:10-alpine
ENV NODE_ENV production
WORKDIR /srv

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++

COPY ./package* ./
RUN npm ci
RUN npm cache clean --force
RUN apk del .gyp

COPY --from=builder /srv/dist ./dist

EXPOSE 8888

CMD [ "npm", "run", "start" ]