var fs = require('fs');
var express = require('express');
var router = express.Router();
var path = require('path');
var artifactService = require('../services/create_artifact.js');
var formidable = require('formidable');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/file', function(req, res, next){

	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files){
		res.send(files.file.path + "#" + files.file.name);
	});

})

router.post('/', function(req, res, next){

	artifactService.createArtifact(req.body,function(error,result){
		if(error){
			res.send('Error :\n'+error)
		}else{
			res.download(path.join(__dirname,"../services/",result),result)
		}
	});
	
})

module.exports = router;
