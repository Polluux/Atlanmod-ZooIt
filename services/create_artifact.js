const fs = require('fs')
const path = require('path')
const zipFolder = require('zip-folder')


function createFolder(dirPath){
	try{
		fs.mkdirSync(path.join(__dirname,"../services/",dirPath))
	}catch(err){		
		//if (err.code !== "EEXIST") throw err	
		console.log("OOpsi doopsi ça exist déjà")	
	}
}

function generateMavenArtifact(artifactID, groupID, version, callback){	
	// Generate the Maven artifact with the 

	var whitelist_regex = /^([A-Z]|[a-z]|[0-9]|\.|\-)+$/;

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
	createFolder("./"+propertiesObject.artifactID)
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


module.exports = { createArtifact }