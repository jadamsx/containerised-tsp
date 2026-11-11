FROM node:22-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ .

RUN npm ci --omit=dev

USER node

EXPOSE 3030
EXPOSE 3031

# Set a default environment variable for running as master
ENV NODE_ENV=master

# Command to run the application based on the environment variable
CMD [ "sh", "-c", "if [ \"$NODE_ENV\" = 'master' ]; then npm start; else node worker.js; fi" ]
