FROM node:20

WORKDIR /app

COPY package*.json ./
COPY src/ .

RUN npm install

ENV PORT=3040
EXPOSE 3040

CMD [ "npm", "start" ]