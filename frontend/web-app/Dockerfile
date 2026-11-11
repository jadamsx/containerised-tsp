FROM node:22-alpine

WORKDIR /web-app

COPY --chown=node:node . .

RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

USER node

ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "start" ]