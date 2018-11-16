const fs = require('fs')
const path = require('path')
const zipFolder = require('zip-folder')
const spawn = require('child_process');


function createFolder(dirPath){
	try{
		fs.mkdirSync(path.join(__dirname,"../services/",dirPath))
	}catch(err){
		if (err.code !== "EEXIST") throw err
	}
}

function generateMavenArtifact(artifactID, groupID, version){	
	// Generate the Maven artifact with the 
	try{			
		var cd = spawn.spawn('cd', [artifactID]);
		var yes = spawn.spawn('yes');
		var mvn = spawn.spawn('mvn', ["archetype:generate", "-DarchetypeCatalog=local", "-DarchetypeGroupId=com.atlanmod.zoo", "-DarchetypeArtifactId=xcore-generation-archetype", "-DarchetypeVersion=1.0", "-DgroupId="+groupID, "-DartifactId="+artifactID, "-Dversion="+version]);

		yes.stdout.pipe(mvn.stdin);	

		cd.on('error', function(err) {
			console.log(err);
		});

		yes.on('error', function(err) {
			console.log(err);
		});

		mvn.on('error', function(err) {
			console.log(err);
		});
	}
	catch (err){
		throw err;
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
	createFolder("./"+propertiesObject.artifactID)
	generateMavenArtifact(propertiesObject.artifactID, propertiesObject.groupID, propertiesObject.version);

	
	//Copy the xcore file from the tmp directory to services
	//Ask Roxane about the #, her idea
	var ouch = propertiesObject.artifactID+"/"+propertiesObject.artefact_name+"/src/main/model/"
	fs.createReadStream(propertiesObject.file.split('#')[0]).pipe(fs.createWriteStream(path.join(__dirname,"../services/",ouch+propertiesObject.file.split('#')[1])));


	//zip the artifact
	zipArchitecture("./"+propertiesObject.artifactID, function(err,res){
		if(err){
			console.log(err); //Maybe do something else there (throw ?)
		}else{
			//return the artifact
			callback(err,res)//the .zip file
		}
	})
	

	//Execute maven + send to maven repo ???
}


module.exports = { createArtifact }