FROM node:slim

RUN apt update
RUN apt install -y git

RUN git config --global --add safe.directory /github/workspace

RUN mkdir -p /app

COPY dist/. /app/

ENTRYPOINT ["node", "/app/index.js"]