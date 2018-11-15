var express = require('express');
var router = express.Router();
var path = require('path')
var artifactService = require('../services/create_artifact.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/', function(req, res, next){
	console.log(req.body)

	var file = {name: "myXcoreFile"}//to recover
	var properties = {artifactName: req.body.artefact_name,
		artifactDescription: req.body.artefact_description}

	artifactService.createArtifact(file,properties,function(error,result){
		if(error){
			res.send('Error :\n'+error)
		}else{
			res.download(path.join(__dirname,"../services/",result),result)
		}
	});
})

module.exports = router;
