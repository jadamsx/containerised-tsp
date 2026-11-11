FROM node:22-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ .

RUN npm ci --omit=dev

USER node

EXPOSE 3000

CMD [ "npm", "start" ]
