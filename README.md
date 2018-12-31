# Capstone Project Atlanmod-Zooit
[Deployed on Heroku](https://atlanmod-zooit.herokuapp.com/)

## Install and run

### Installation 
```
$ git clone https://github.com/Polluux/Capstone_Moulinette
$ cd Capstone_Moulinette
$ npm run initialize
```

### Lauching in debug mode
```
$ DEBUG=* npm start
```

### Start the application
```
$ npm run start
```
You also can find it [here](https://atlanmod-zooit.herokuapp.com/) 

## Code map
This project is based on the javaScript framework [express](http://www.expressjs.com). 
Starting from `/`, the project is organised as follow :
 - `routes/index.js` : the router
 - `services/` : the js scripts called to execute services
 - `maven_archetype/` and `maven_archetype/` : the maven artefact template we use
 - `views/` : templates, written using [jade](http://jade-lang.com/). 
 - `public/` : template assets, including pictures, js scripts, css stylesheets and librairies
 - `node_modules/` et  `bin/` : generated and managed by the framework  

## AtlanmodZoo : Github artifact request process :
Atlanmod-Zooit can perform an automatic request to add a newly generated artifact to the AtlanmodZoo Github repository (accessible at this [link](https://github.com/atlanmod/zoo)). The generation process to perform a request on the Zoo is different from the generation process of a standalone artifact and it requires the user to be authenticated with a Github account. The complete process uses the official Github REST API (available [here](https://developer.github.com/v3/)) and is discribed as follows :
 - Generation of the artifact as `child artifact` of the complete AtlanmodZoo Maven artifact.
 - Request and modification of the last AtlanmodZoo root `pom.xml` to add the newly generated artifact.
 - Creation of a fork based on the AtlanmodZoo repository for the current connected Github user (if a fork already exists, it is used).
 - Instantiation of a new branch on the user's fork based on the artifact name.
 - Commit and push of the newly generated artifact with the correct root `pom.xml` on the user's branch of the AtlanmodZoo fork.
 - Creation of a `pull request` of the user's branch on the AtlanmodZoo to suggest the new artifact.