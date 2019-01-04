# Capstone Project Atlanmod-Zooit
[Deployed on Heroku](https://atlanmod-zooit.herokuapp.com/)

## Install and run

### Installation 
```
$ git clone https://github.com/Polluux/Atlanmod-ZooIt
$ cd Atlanmod-ZooIt
$ npm run initialize
```

### Lauching in debug mode
```
$ DEBUG=* npm start
```

### Start the local application
```
$ npm run start
```
You also can find the online version of it [here](https://atlanmod-zooit.herokuapp.com/) 

## Technologies and Code map
### Technologies used in the project
This project is based on the platform [Node.js](https://nodejs.org/en/) and is using the JavaScript framework [express](http://www.expressjs.com). 

The artefact generation is using Maven with two different `Maven archetypes` (a classic artefact archetype and a zoo request artefact archetype).

The application is containerized with Docker with a minimal Ubuntu image containing Java, Maven, Node.js and NPM (based on the image [jimador/docker-jdk-8-maven-node](https://hub.docker.com/r/jimador/docker-jdk-8-maven-node/))

### Code map of the project
Starting from `/`, the project is organised as follows :
 - `routes/index.js` : url routing file for the website
 - `services/` : js scripts called to execute services (artefact generation, github process, ...)
 - `maven_archetype/` and `maven_archetype_zoo/` : maven archetypes used to generate the new maven artefacts
 - `views/` : templates, written using [pug](https://pugjs.org/). 
 - `public/` : template assets, including pictures, js scripts, css stylesheets and librairies
 - `i18n/` : english and french translations, as json files
 - `node_modules/` and  `bin/` : generated and managed by the framework  
 - `logs` : folder for the server logs
 - `.m2` : maven prebuilt archetype catalog for container deployment
 - `temp` : temporary folder that contains generated artefacts
 - `tests` : testing process for artefact generation

## Online automatic artefact generation process :
The main goal of Atlanmod-Zooit is to provide an automatic online process to generate a complete maven artefact for an EMF XCore model. The generated artefact is able to generate the source code of the model and can be easily built to be deployed on the Maven Central Repository. The generation process is based on *maven archetypes*. 

The process to automatically generate a Maven artefact from an XCore, requires you to :
- Connect to the Atlanmod-Zooit website (https://atlanmod-zooit.herokuapp.com/)
- Choose the **Automatic** generation of artefact based on an XCore model
- Upload the XCore file containing your model
- Fill all required fields.
- *Optional* : fill the maven deployment required fields and the other optional fields
- Generate and download your artefact (the process can take multiple seconds)

## Local automatic artefact generation process :
There is also a way to generate an artefac without using the web application going through a script.

NOTE : NodeJS must be installed on the computer and the installation of the application must have been completed (see above in the section `Installation`).

This script is located in the `services/` directory, named `prompt_script.js` and is used as follow :
```
$ node prompt_script.js <file.xcore> [-parameter=value]*
```
**<file.xcore>** : is a relative or absolute path to the file.xcore to be transformed.

**[-parameter=value]\*** : is a list of parameters which can be passed to pre-fill the atributes of the artifact to be generated.

Here is a list of parameters you can use (NOTE : some of the parameters are mandatory and you will need to fill them afterward) :
 - -artifactID
 - -groupID
 - -version
 - -artifactName
 - -artifactDescription
 - -artifactURL
 - -year
 - -organization
 - -developers (Not implemented yet)
 - -scm (Not implemented yet)

Here is an exemple of utilisation of the script :
```
$ node prompt_script.js /home/user/Documents/File.xcore -artifactName=MyArtifact -artifactDescription="This is a description."
```

Once the script is started, it asks you to fill in the informations that you didn't mentionned in the command line. Optional informations can be skiped by simply typing enter. If an information is mentionned to be filled but you already pre-filled it, it means it was not correct.

The artifact generated is zipped and located in the `/temp` directory with the name : `<timestamp>_<artifactID>.zip`. (The full name is given by the script at the end of the execution).


## AtlanmodZoo : Github artifact request process :
Atlanmod-Zooit can perform an automatic request to add a newly generated artifact to the AtlanmodZoo Github repository (accessible at this [link](https://github.com/atlanmod/zoo)). The generation process to perform a request on the Zoo is different from the generation process of a standalone artifact and it requires the user to be authenticated with a Github account. The complete process uses the official Github REST API (available [here](https://developer.github.com/v3/)) and is discribed as follows :
 - Generation of the artifact as `child artifact` of the complete AtlanmodZoo Maven artifact.
 - Request and modification of the last AtlanmodZoo root `pom.xml` to add the newly generated artifact.
 - Creation of a fork based on the AtlanmodZoo repository for the current connected Github user (if a fork already exists, it is used).
 - Instantiation of a new branch on the user's fork based on the artifact name.
 - Commit and push of the newly generated artifact with the correct root `pom.xml` on the user's branch of the AtlanmodZoo fork.
 - Creation of a `pull request` of the user's branch on the AtlanmodZoo to suggest the new artifact.