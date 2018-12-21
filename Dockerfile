FROM jimador/docker-jdk-8-maven-node
COPY . /Capstone_Moulinette
WORKDIR /Capstone_Moulinette
RUN npm run initialize
RUN node tests/test_create_artifact.js
CMD [ "DEBUG=*", "npm", "start" ]