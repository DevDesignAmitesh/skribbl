FROM oven/bun:1

WORKDIR /usr/src/app

# copy neccessayr package.jsons and lock file
COPY package.json bun.lock /
COPY /apps/ws-backend/package.json /apps/ws-backend
COPY /packages/common/package.json /packages/common

# install dependencies
RUN bun install

COPY . .

ENV NODE_ENV=production
ENV DOCKER_CONTAINER=true

WORKDIR /usr/src/app/apps/ws-backend
RUN bun install

# run the app
EXPOSE 8080

# absolute path
CMD [ "bun", "run", "start:ws"]