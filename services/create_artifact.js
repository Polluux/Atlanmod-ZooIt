const fs = require('fs')
const path = require('path')
const zipFolder = require('zip-folder')


function createFolder(dirPath){
	try{
		fs.mkdirSync(path.resolve(dirPath))
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
	zipFolder(dirPath,dirPath+'.zip',function(err,res){
		if(err){
			callback(err,null)
		}else{
			//Trigger the callback at the end of the zip
			//Returning the zip path (minus "./")
			callback(null,dirPath.substring(2)+".zip")
		}
	})
}

function createArtifact(xcoreFile,propertiesObject,callback){
	//create tmp folder with propertiesObject.artifactName
	createFolder("./"+propertiesObject.artifactName)

	/*create artchitecture such as :
		|-{propertiesObject.artifactName}
			|-{xcoreFile.name}
				|-src
					|-main
						|-model
							|-file.xcore
				|-pom.xml
			|-pom.xml
	*/
	//The first artifactName is the temporary file wich is about to be zipped
	createArchitecture("./"+propertiesObject.artifactName+"/"+propertiesObject.artifactName,xcoreFile.name)

	//edit content of both pom.xml with informations in propertiesObject

	//zip the artifact
	zipArchitecture("./"+propertiesObject.artifactName, function(err,res){
		if(err){
			console.log(err); //Maybe do something else there (throw ?)
		}else{
			//return the artifact
			callback(res)//the .zip file
		}
	})
	

	//Execute maven + send to maven repo ???
}


//Some tests
/*var file = {name: "myXcoreFile"}
var properties = {artifactName: "myArtifact"}
createArtifact(file,properties,function(zipFile){
	console.log("Zip file created : "+zipFile)
})*/

module.exports = { createArtifact }