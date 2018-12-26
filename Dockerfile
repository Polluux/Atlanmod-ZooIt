FROM jimador/docker-jdk-8-maven-node
COPY . /Capstone_Moulinette
WORKDIR /Capstone_Moulinette
RUN groupadd -r nodejs && useradd -m -r -s /bin/bash -g nodejs nodejs
RUN npm run initialize
RUN node tests/test_create_artifact.js
USER nodejs
CMD [ "npm", "start" ]