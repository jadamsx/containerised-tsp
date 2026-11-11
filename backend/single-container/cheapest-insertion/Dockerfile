FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY src/ .

RUN npm ci --omit=dev

EXPOSE 3010

CMD [ "npm", "start" ]
