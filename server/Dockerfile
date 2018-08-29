FROM node:carbon-slim

WORKDIR /appdir

COPY package*.json ./

RUN npm config set proxy http://www-cache.reith.bbc.co.uk:80/ && \
npm config set https-proxy http://www-cache.reith.bbc.co.uk:80/ && \
npm install

COPY . .

EXPOSE 8080

CMD ["node", "/appdir/server.js"]
