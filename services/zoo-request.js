const fs = require("fs");
const {gitCommitPush} = require("git-commit-push-via-github-api");
const request = require('request');
const path = require('path')
const { winstonLogger } = require('./winston_logger.js');

const API_URL = 'https://api.github.com';
const ZOO_REPO = "Polluux/capstoneatlanmodzoosandbox";


// Request a new Maven artifact on the AtlanmodZoo Github
function requestNewArtifact(token, artifactID, folderName, xcoreFile, callback){  
    
    // Retrieve the last pom.xml from the AtlanmodZoo github repository
    getPomFromZoo(artifactID, folderName, function(err){           
        if(err){ callback(err); }

        // Get the connected user's username
        getUser(token, function(username, err){          
            if(err){ callback(err); }

            var options = {
                url: API_URL+'/repos/'+ZOO_REPO+'/forks?access_token='+token,
                headers: {
                    'User-Agent': 'request'
                }
            };

            // Retrieve or create an AtlanmodZoo fork
            request(options, (err, res, body) => {
                if (err) { 
                    winstonLogger.error(err);
                    callback("Unable to retrieve AtlanmodZoo fork list.");
                }

                var forkExists = false;
                var forkName = null;
                
                if(JSON.parse(body).message)
                    callback("Unable to access AtlanmodZoo fork : "+JSON.parse(body).message)
                else{    

                    JSON.parse(body).forEach(function(element){
                        if(element.owner.login==username){
                            forkExists = true;
                            forkName = element.name;
                        }                
                    });

                    if(!forkExists){                
                        
                        // Create the fork
                        request.post(options, (err, res, body) => {
                            if (err) { 
                                winstonLogger.error(err);
                                callback("Unable to create a fork for the current user.");
                            }

                            forkName = JSON.parse(body).source.name;

                            // Create a new branch on the fork
                            makeNewBranch(token, artifactID, forkName, username, function(branchName, err){   
                                if(err){ callback(err); }
                                // Commit, push and make a pull request on the branch                     
                                commitPushPullRequest(username, forkName,token, artifactID, folderName, xcoreFile, branchName, function(err){
                                    if(err){ callback(err); }
                                });

                            });
                        });

                    }
                    else{
                        // Create a new branch
                        makeNewBranch(token, artifactID, forkName, username, function(branchName, err){ 
                            if(err){ callback(err); }
                            // Commit, push and make a pull request on the branch
                            commitPushPullRequest(username, forkName,token, artifactID, folderName, xcoreFile, branchName, function(err){
                                if(err){ callback(err); }                          
                            });
                        });
                    } 
                }
            });       

            callback(null);
                
        });

    });
    
}

// Request on the Github API the username of the current connected user
function getUser(token, callback){
    var options = {
        url: API_URL+'/user?access_token='+token,
        headers: {
          'User-Agent': 'request'
        }
      };

    request(options, (err, res, body) => {
        if (err) {
            winstonLogger.error(err);
            callback(null, "Unable to get current user's username.");
        }
        callback(JSON.parse(body).login, null);
    });
}

// Perform a CommitPush of the artifact on the new fork's branch and the pull request from the user's fork to the AtlanmodZoo repository
function commitPushPullRequest(username, forkName, token, artifactID, folderName, xcoreFile, branchName, callback){

    // Perform a the commit and push action on the user's branch for the artifact
    gitCommitPush({
        owner: username,
        repo: forkName,
        token : token,
        fullyQualifiedRef : "heads/"+branchName,
        files: [
            { path: artifactID+"/pom.xml", content: fs.readFileSync(path.join(__dirname,folderName+"/"+artifactID+"/pom.xml"), "utf-8") },
            { path: "pom.xml", content: fs.readFileSync(path.join(__dirname,folderName+"/pom.xml"), "utf-8") },
            { path: artifactID+"/src/main/model/"+xcoreFile, content: fs.readFileSync(path.join(__dirname,folderName+"/"+artifactID+"/src/main/model/"+xcoreFile), "utf-8") }
            ],        
        forceUpdate: false, // optional default = false
        commitMessage: "Added a new xcore model artifact in the zoo : "+artifactID
    }).then(res => {

        // Perform the pull request
        var options = {
            url: API_URL+'/repos/'+ZOO_REPO+'/pulls?access_token='+token,
            headers: {
                'User-Agent': 'request'
            },
            json: {
                "title": "New xcore model artifact : "+artifactID,
                "body": "Auto-generated from Atlanmod-Zooit",
                "head": username+":"+branchName,
                "base": "master"
                }
            };

        request.post(options, (err, res, body) => {
            if (err) { 
                winstonLogger.error(err);
                callback("Unable to perform the pull request from user's fork to AtlanmodZoo repository.");
             }                   
        })
    }).catch(err => {
        winstonLogger.error(err);
        callback("Unable to perform the commit and push on the user's fork.");
    });
    callback(null);
}


// Create a new branch on the user's fork
function makeNewBranch(token, artifactID, forkName, username, callback){
    
    var options = {
        url: API_URL+'/repos/'+ZOO_REPO+'/git/refs/heads?access_token='+token,
        headers: {
          'User-Agent': 'request'
        }
      };

    request(options, (err, res, body) => {
        if (err) { 
            winstonLogger.error(err);
            callback(null, "Unable to create a new branch on the user's fork.");
        }
        
        var branchSha = null;
        
        JSON.parse(body).forEach(function(element){
            if(element.ref=="refs/heads/master"){                
                branchSha = element.object.sha;                
            }                
        });

        var branchName = "zoo-"+artifactID+"-artifact";

        var options = {
            url: API_URL+'/repos/'+username+'/'+forkName+'/git/refs?access_token='+token,
            headers: {
              'User-Agent': 'request'
            },
            json: {
                "ref" : "refs/heads/"+branchName,
                "sha": branchSha            
              }
          };

        request.post(options, (err, res, body) => {
            if (err) { 
                winstonLogger.error(err);
                callback(null, "Unable to get the newly created branch name.");
            }  
            callback(branchName, null);
        });               
    });   
}


// Get the last updated pom.xml from the AtlanmodZoo repository
function getPomFromZoo(artifactID, folderName, callback){

    var options = {
        url: API_URL+'/repos/'+ZOO_REPO+'/contents/pom.xml',
        headers: {
          'User-Agent': 'request'
        },
        json: {
            "ref" : "refs/heads/master/",            
          }
      };

    request.get(options, (err, res, body) => {
        if (err) { 
            winstonLogger.error(err);
            callback("Unable to get the root pom.xml from the AtlanmodZoo repository.");
        }  

        var pomPath = path.join(__dirname,folderName+"/pom.xml");
        var pomSplit = Buffer.from(body.content, 'base64').toString("utf-8").split("\n")       

        var modulesArrayIndex = pomSplit.findIndex(function(element) {
            return element.includes('</modules>');
        });

        var moduleSpacing = pomSplit[modulesArrayIndex-1].search('<');

        pomSplit.splice(modulesArrayIndex, 0, pomSplit[modulesArrayIndex-1].substring(0,moduleSpacing)+"<module>"+artifactID+"</module>");
        var text = pomSplit.join("\n");

        fs.writeFile(pomPath, text, function (err) {
            if (err){
                winstonLogger.error(err);
                callback("Unable to generate the artifact.");
            };
        });
 
        callback(null);
    });               

}

module.exports = {requestNewArtifact}