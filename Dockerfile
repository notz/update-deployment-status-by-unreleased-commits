FROM node:slim

RUN apt update
RUN apt install -y git

RUN mkdir -p /app

COPY dist/. /app/

ENTRYPOINT ["node", "/app/index.js"]