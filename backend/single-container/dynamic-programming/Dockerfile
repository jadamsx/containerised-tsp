FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY src/ .

RUN npm install

EXPOSE 3020

CMD [ "npm", "start" ]
