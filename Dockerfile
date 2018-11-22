FROM jimador/docker-jdk-8-maven-node
RUN npm install
RUN ./maven_archetype/install_archetype.sh
RUN node tests/test_create_artifact.js
