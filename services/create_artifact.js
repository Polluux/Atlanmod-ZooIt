const fs = require('fs')
const path = require('path')
const zipFolder = require('zip-folder')


function createFolder(dirPath){
	try{
		fs.mkdirSync(path.join(__dirname,"../services/",dirPath))
	}catch(err){
		if (err.code !== "EEXIST") throw err
	}
}

function createArchitecture(artifactMainFolder,xcoreFileName){
	createFolder(artifactMainFolder)
	createFolder(artifactMainFolder+"/"+xcoreFileName)
	createFolder(artifactMainFolder+"/"+xcoreFileName+"/src")
	createFolder(artifactMainFolder+"/"+xcoreFileName+"/src/main")
	createFolder(artifactMainFolder+"/"+xcoreFileName+"/src/main/model")
}

function createFile(){
	//Not implemented Yet
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
	createFolder("./"+propertiesObject.artefact_name)

	/*create artchitecture such as :
		|-{propertiesObject.artefact_name}
			|-{propertiesObject.xcoreFilePath} //Why ? idk.
				|-src
					|-main
						|-model
							|-file.xcore
				|-pom.xml
			|-pom.xml
	*/
	//The first artefact_name is the temporary file wich is about to be zipped
	createArchitecture("./"+propertiesObject.artefact_name+"/"+propertiesObject.artefact_name,propertiesObject.file.split('#')[1])

	//Copy the xcore file from the tmp directory to services
	//Ask Roxane about the #, her idea
	var ouch = propertiesObject.artefact_name+"/"+propertiesObject.artefact_name+"/"+propertiesObject.file.split('#')[1]+"/src/main/model/"
	fs.createReadStream(propertiesObject.file.split('#')[0]).pipe(fs.createWriteStream(path.join(__dirname,"../services/",ouch+propertiesObject.file.split('#')[1])));


	//zip the artifact
	zipArchitecture("./"+propertiesObject.artefact_name, function(err,res){
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