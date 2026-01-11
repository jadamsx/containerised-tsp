# docker build . --tag brute-force-tsp-service:v1
# docker tag brute-force-tsp-service:v1 jadams410/brute-force-tsp-service:v1
# docker push jadams410/brute-force-tsp-service:v1
# master
# docker run --publish 3030:3030 --publish 3031:3031 --name brute-force-tsp-service-master --rm jadams410/brute-force-tsp-service:v1
# docker stop brute-force-tsp-service-master
# worker
# docker run --name brute-force-tsp-service-worker --rm -e NODE_ENV=worker jadams410/brute-force-tsp-service:v1
# docker stop brute-force-tsp-service-worker


FROM node:15

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
