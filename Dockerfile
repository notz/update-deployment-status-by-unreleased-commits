FROM node:slim

RUN apt update
RUN apt install -y git

RUN mkdir -p /app

COPY dist/. /app/

ENTRYPOINT ["/bin/sh", "-c" , "git config --global --add safe.directory /github/workspace && node /app/index.js"]