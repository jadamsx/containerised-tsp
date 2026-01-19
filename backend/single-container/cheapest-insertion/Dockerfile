FROM node:20

WORKDIR /app

COPY package*.json ./
COPY src/ .

RUN npm install

EXPOSE 3010

CMD [ "npm", "start" ]
