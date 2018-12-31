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
router.get('/manual', function(req, res) {
  res.render('manual');
});

/* POST file input */
router.post('/file', function(req, res, next){

	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files){
		if(err){
			next(err)
		}else{
			res.send(files.file.path + "#" + files.file.name);
		}
	});

})

/* POST  maven form */
router.post('/', function(req, res, next){

	var archetype = "xcore-generation-archetype"

	artifactService.createArtifact(req.body, archetype, true, function(error,result){
		if(error){
			next(error)
		}else{
			res.download(path.join(__dirname,"../temp",result),result)
		}
	});
	
})

/* GITHUB API handling */


var githubOAuth = require('github-oauth')({
	githubClient: '8159ce6e362677e0103d',
	githubSecret: '2045b4a83a4ace85976601be88508fc5c98422de',
	baseURL: 'https://atlanmod-zooit.herokuapp.com/',
	loginURI: '/github-oauth',
	callbackURI: '/form',
	scope: 'repo',
})

/* On error */
githubOAuth.on('error', function (err) {
	console.error('there was a login error', err);
	next(err); // !
})

/* On valid token */
githubOAuth.on('token', function (token, res) {
	res.render('form_pr', { token: token.access_token });
})

/* GET first we auth, then the form will be rendered */
router.get('/github-oauth', function(req, res){
	return githubOAuth.login(req, res);
})

/* POST PR form */
router.post('/zoo-request', function(req, res, next){
	var archetype = "xcore-generation-archetype-zoo"

	artifactID = req.body.artifactID;
	filename = req.body.file;

	artifactService.createArtifact(req.body, archetype, false, function(error,result){
		if(error){
			next(error);
		}else{
			zooRequest.requestNewArtifact(req.body.githubtoken, artifactID, result, filename.split('#')[1] ,function(error){
				if(error){
					next(error);
				}
			});
		}
	});
})

module.exports = router;