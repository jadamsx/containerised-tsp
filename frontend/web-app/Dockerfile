FROM node:18

WORKDIR /app

COPY package*.json ./
COPY src/ .

RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]
