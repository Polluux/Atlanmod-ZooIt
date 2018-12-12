var fs = require('fs');
var express = require('express');
var router = express.Router();
var path = require('path');
var artifactService = require('../services/create_artifact.js');
var zooRequest = require('../services/zoo-request.js');
var formidable = require('formidable');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home');
});

/* GET PR form page after github callback. */
router.get('/form', function(req, res, next) {
  return githubOAuth.callback(req, res);
});
/* GET maven form page. */
router.get('/form-maven', function(req, res, next) {
  return res.render('form_maven');
});


/* GET manual page. */
router.get('/manual', function(req, res, next) {
  res.render('manual');
});

router.post('/file', function(req, res, next){

	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files){
		res.send(files.file.path + "#" + files.file.name);
	});

})

router.post('/', function(req, res, next){

	var archetype = "xcore-generation-archetype"

	artifactService.createArtifact(req.body, archetype, true, function(error,result){
		if(error){
			res.send('Error :\n'+error)
		}else{
			res.download(path.join(__dirname,"../services/",result),result)
		}
	});
	
})


var githubOAuth = require('github-oauth')({
	githubClient: '8159ce6e362677e0103d',
	githubSecret: '2045b4a83a4ace85976601be88508fc5c98422de',
	baseURL: 'http://localhost:3000',
	loginURI: '/github-oauth',
	callbackURI: '/form',
	scope: 'repo',
})

router.get('/github-oauth', function(req, res){
	return githubOAuth.login(req, res);
})

router.post('/zoo-request', function(req, res){		
	var archetype = "xcore-generation-archetype-zoo"

	artifactID = req.body.artifactID;
	filename = req.body.file;

	artifactService.createArtifact(req.body, archetype, false, function(error,result){
		if(error){
			res.send('Error :\n'+error)
		}else{
			zooRequest.requestNewArtifact(req.body.githubtoken, artifactID, filename.split('#')[1] ,function(){});
		}
	});
})



githubOAuth.on('error', function(err) {
	console.error('there was a login error', err)
})

githubOAuth.on('token', function(token, res) {
	res.render('form_pr', {token:token.access_token});
})

module.exports = router;
