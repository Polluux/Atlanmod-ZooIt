const fs = require("fs");
const {gitCommitPush} = require("git-commit-push-via-github-api");
const request = require('request');
const path = require('path')

const API_URL = 'https://api.github.com';
const ZOO_REPO = "Polluux/capstoneatlanmodzoosandbox";


// Request a new Maven artifact on the AtlanmodZoo Github
function requestNewArtifact(token, artifactID, xcoreFile, callback){  
    
    // Retrieve the last pom.xml from the AtlanmodZoo github repository
    getPomFromZoo(artifactID, function(){    

        // Get the connected user's username
        getUser(token, function(username){
            var options = {
                url: API_URL+'/repos/'+ZOO_REPO+'/forks?access_token='+token,
                headers: {
                    'User-Agent': 'request'
                }
            };

            // Retrieve or create an AtlanmodZoo fork
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
                    
                    // Create the fork
                    request.post(options, (err, res, body) => {
                        if (err) { return console.log(err); }

                        forkName = JSON.parse(body).source.name;

                        // Create a new branch on the fork
                        makeNewBranch(token, artifactID, forkName, username, function(branchName){   
                            // Commit, push and make a pull request on the branch                     
                            commitPushPullRequest(username, forkName,token, artifactID, xcoreFile, branchName);

                        });
                    });

                }
                else{
                    // Create a new branch
                    makeNewBranch(token, artifactID, forkName, username, function(branchName){ 
                        // Commit, push and make a pull request on the branch
                        commitPushPullRequest(username, forkName,token, artifactID, xcoreFile, branchName);
                    });
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
        if (err) { return console.log(err); }
        callback(JSON.parse(body).login);
    });
}

// Perform a CommitPush of the artifact on the new fork's branch and the pull request from the user's fork to the AtlanmodZoo repository
function commitPushPullRequest(username, forkName, token, artifactID, xcoreFile, branchName){

    // Perform a the commit and push action on the user's branch for the artifact
    gitCommitPush({
        owner: username,
        repo: forkName,
        token : token,
        fullyQualifiedRef : "heads/"+branchName,
        files: [
            { path: artifactID+"/pom.xml", content: fs.readFileSync(path.join(__dirname,"../temp/"+artifactID+"/"+artifactID+"/pom.xml"), "utf-8") },
            { path: "pom.xml", content: fs.readFileSync(path.join(__dirname,"../temp/"+artifactID+"/pom.xml"), "utf-8") },
            { path: artifactID+"/src/main/model/"+xcoreFile, content: fs.readFileSync(path.join(__dirname,"../temp/"+artifactID+"/"+artifactID+"/src/main/model/"+xcoreFile), "utf-8") }
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
            if (err) { return console.log(err); }                   
        })
    }).catch(err => {
        console.error(err);
    });
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
        if (err) { return console.log(err); }
        
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
            if (err) { return console.log(err); }  
            callback(branchName);
        });               
    });   
}


// Get the last updated pom.xml from the AtlanmodZoo repository
function getPomFromZoo(artifactID, callback){

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
        if (err) { return console.log(err); }  

        var pomPath = path.join(__dirname,"../temp/",artifactID+"/pom.xml");
        var pomSplit = Buffer.from(body.content, 'base64').toString("utf-8").split("\n")       

        var modulesArrayIndex = pomSplit.findIndex(function(element) {
            return element == '    </modules>';
        });

        pomSplit.splice(modulesArrayIndex, 0, "        <module>"+artifactID+"</module>");
        var text = pomSplit.join("\n");

        fs.writeFile(pomPath, text, function (err) {
            if (err) return console.log(err);
        });
 
        callback();
    });               

}

module.exports = {requestNewArtifact}