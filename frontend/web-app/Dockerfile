FROM node:22-alpine

WORKDIR /web-app

COPY . .

RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "start" ]