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

