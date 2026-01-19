FROM node:20

WORKDIR /app

COPY package*.json ./
COPY src/ .

RUN npm install

EXPOSE 3030
EXPOSE 3031

# Set a default environment variable for running as master
ENV NODE_ENV=master

# Command to run the application based on the environment variable
CMD [ "sh", "-c", "if [ \"$NODE_ENV\" = 'master' ]; then npm start; else node worker.js; fi" ]
