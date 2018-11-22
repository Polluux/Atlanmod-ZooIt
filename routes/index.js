var fs = require('fs');
var express = require('express');
var router = express.Router();
var path = require('path');
var artifactService = require('../services/create_artifact.js');
var zooRequest = require('../services/zoo-request.js');
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


var githubOAuth = require('github-oauth')({
	githubClient: '8159ce6e362677e0103d',
	githubSecret: '2045b4a83a4ace85976601be88508fc5c98422de',
	baseURL: 'http://localhost:3000',
	loginURI: '/github-oauth',
	callbackURI: '/zoo-request',
	scope: 'repo',
})

router.get('/github-oauth', function(req, res){
	return githubOAuth.login(req, res);
})

router.get('/zoo-request', function(req, res){	
	return githubOAuth.callback(req, res);
})



githubOAuth.on('error', function(err) {
	console.error('there was a login error', err)
})

githubOAuth.on('token', function(token, serverResponse) {
	// TODO : make artifactID and filename great again
	var artifactID = "kraken"
	var fileName = "Kraken.xcore"
	
	zooRequest.requestNewArtifact(token, artifactID, fileName ,function(){});		
	serverResponse.render('zoo-request');	
})

module.exports = router;
