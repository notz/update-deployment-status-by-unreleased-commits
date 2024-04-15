FROM node:slim

RUN mkdir -p /app
WORKDIR /app

COPY dist/. .

ENTRYPOINT ["node", "/app/index.js"]