const fs = require("fs");
const {gitCommitPush} = require("git-commit-push-via-github-api");
const request = require('request');

const API_URL = 'https://api.github.com';
const ZOO_REPO = "Polluux/capstoneatlanmodzoosandbox";


function requestNewArtifact(token, artifactID, xcoreFile, callback){    

    getUser(token, function(username){
        var options = {
            url: API_URL+'/repos/'+ZOO_REPO+'/forks?access_token='+token.access_token,
            headers: {
              'User-Agent': 'request'
            }
          };
    
        request(options, (err, res, body) => {
            if (err) { return console.log(err); }
    
            var forkExists = false;
            var forkName = null;
        
            JSON.parse(body).forEach(function(element){
                if(element.owner.login==username){
                    forkExists = true;
                    forkName = element.name;
                }                
            });

            if(!forkExists){                
            
                request.post(options, (err, res, body) => {
                    if (err) { return console.log(err); }
                    forkName = JSON.parse(body).source.name;
                    commitPushPullRequest(username, forkName,token, artifactID, xcoreFile);
                });

            }
            else{
                commitPushPullRequest(username, forkName,token, artifactID, xcoreFile);
            } 
        });       
    
        callback(null);
    });
    
}

function getUser(token, callback){
    var options = {
        url: API_URL+'/user?access_token='+token.access_token,
        headers: {
          'User-Agent': 'request'
        }
      };

    request(options, (err, res, body) => {
        if (err) { return console.log(err); }
        callback(JSON.parse(body).login);
    });
}

function commitPushPullRequest(username, forkName, token, artifactID, xcoreFile){
    gitCommitPush({
        owner: username,
        repo: forkName,
        token : token.access_token,
        files: [
            { path: artifactID+"/pom.xml", content: fs.readFileSync(__dirname + "/"+artifactID+"/"+artifactID+"/pom.xml", "utf-8") },
            { path: artifactID+"/src/main/model/"+xcoreFile, content: fs.readFileSync(__dirname + "/"+artifactID+"/"+artifactID+"/src/main/model/"+xcoreFile, "utf-8") }
            ],
        fullyQualifiedRef: "heads/master",
        forceUpdate: false, // optional default = false
        commitMessage: "Added a new xcore model artifact in the zoo : "+artifactID
        }).then(res => {

            var options = {
                url: API_URL+'/repos/'+ZOO_REPO+'/pulls?access_token='+token.access_token,
                headers: {
                  'User-Agent': 'request'
                },
                json: {
                    "title": "New xcore model artifact : "+artifactID,
                    "body": "Auto-generated from Moulinette",
                    "head": username+":master",
                    "base": "master"
                  }
              };


            request.post(options, (err, res, body) => {
                if (err) { return console.log(err); }                   
            });
        }).catch(err => {
            console.error(err);
        });
}

module.exports = {requestNewArtifact}