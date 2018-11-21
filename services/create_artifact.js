const fs = require('fs')
const path = require('path')
const zipFolder = require('zip-folder')
const rimraf = require('rimraf')

const whitelist_regex = /^([A-Z]|[a-z]|[0-9]|\.|\-)+$/;


function createFolder(dirPath,callback){
	try{
		fs.mkdirSync(path.join(__dirname,"../services/",dirPath))
		callback(null)
	}catch(err){
		if (err.code == "EEXIST"){
			//Directory already exist, need to remove /!\
			rimraf(path.join(__dirname,"../services/",dirPath,dirPath),function(){
				callback(null)
			})
		}else{
			callback(err)
		}
	}
}

function generateMavenArtifact(artifactID, groupID, version, callback){	
	// Generate the Maven artifact with the 

	if (!whitelist_regex.test(artifactID))
		callback("Error : artifactID is invalid");
	else if (!whitelist_regex.test(groupID)) 
		callback("Error : groupID is invalid");
	else if (!whitelist_regex.test(version))
		callback("Error : version is invalid");
	else{

		var command = "yes |mvn archetype:generate -DarchetypeCatalog=local -DarchetypeGroupId=com.atlanmod.zoo -DarchetypeArtifactId=xcore-generation-archetype -DarchetypeVersion=1.0 -DgroupId="+groupID+" -DartifactId="+artifactID+" -Dversion="+version;
		
		const execSync = require('child_process').execSync;
		execSync(command, {cwd: path.join(__dirname,"../services/",artifactID)}, (e, stdout, stderr)=> {
			if (e instanceof Error) {	
				console.error(e);	
			}		
			console.log('stdout ', stdout);		
			console.log('stderr ', stderr);
		});
		//TODO : replace the "console.log(error)" into "callback(error)"

		callback(null);
	}

}


function zipArchitecture(dirPath, callback){
	zipFolder(path.join(__dirname,"../services/",dirPath),path.join(__dirname,"../services/",dirPath)+'.zip',function(err,res){
		if(err){
			callback(err,null)
		}else{
			//Trigger the callback at the end of the zip
			//Returning the zip path (minus "./")
			callback(null,dirPath.substring(2)+".zip")
		}
	})
}

function createArtifact(propertiesObject,callback){
	//create tmp folder with propertiesObject.artefact_name

	console.log(propertiesObject)

	if(!whitelist_regex.test(propertiesObject.artifactID)){
		//Yep, checked AGAIN !
		callback("Error, you tried interring an unauthorized character...",null)
	}else{
		createFolder("./"+propertiesObject.artifactID,function(errFolder){
			if(errFolder){
				callback(errFolder,null)
			}else{
				generateMavenArtifact(propertiesObject.artifactID, propertiesObject.groupID, propertiesObject.version, function(err){
			
					if(err){
						callback(err,null)
					}else{
						//Copy the xcore file from the tmp directory to services
						//Ask Roxane about the #, her idea
						var ouch = propertiesObject.artifactID+"/"+propertiesObject.artifactID+"/src/main/model/"
						fs.createReadStream(propertiesObject.file.split('#')[0]).pipe(fs.createWriteStream(path.join(__dirname,"../services/",ouch+propertiesObject.file.split('#')[1])));


						//zip the artifact
						zipArchitecture("./"+propertiesObject.artifactID, function(err2,res){
							if(err2){
								console.log(err2); //Maybe do something else there (throw ?)
							}else{
								//return the artifact
								callback(err2,res)//the .zip file
							}
						})
						

						//Execute maven + send to maven repo ???
					}
				
				});
			}
		})
	}
}


module.exports = { createArtifact }