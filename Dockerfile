FROM node:20.15-alpine3.19

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install
RUN npm install pm2 -g

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["pm2" ,"start", "ecosystem.config.js","--no-daemon"]
