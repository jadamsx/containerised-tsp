FROM node:20

WORKDIR /app

COPY package*.json ./
COPY src/ ./src/

RUN npm install

ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "start" ]