FROM node:slim

RUN apt update
RUN apt install -y git

RUN mkdir -p /app
WORKDIR /app

COPY dist/. .

ENTRYPOINT ["node", "/app/index.js"]