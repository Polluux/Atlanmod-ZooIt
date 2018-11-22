const fs = require('fs')
const path = require('path')
const zipFolder = require('zip-folder')
const rimraf = require('rimraf')
const xml2js = require('xml2js')

const whitelist_regex = /^([A-Z]|[a-z]|[0-9]|\.|\-)+$/;


function createFolder(dirPath,callback){
	try{
		fs.mkdirSync(path.join(__dirname,dirPath))
		callback(null)
	}catch(err){
		if (err.code == "EEXIST"){
			//Directory already exist, need to remove /!\
			rimraf(path.join(__dirname,dirPath,dirPath),function(){
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
		execSync(command, {cwd: path.join(__dirname,artifactID)}, (e, stdout, stderr)=> {
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
	zipFolder(path.join(__dirname,dirPath),path.join(__dirname,dirPath)+'.zip',function(err,res){
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
	console.log(propertiesObject)

	//Check validity of the artifactID, to prevent a name such as "../artifact" which would cause issues
	if(!whitelist_regex.test(propertiesObject.artifactID)){
		callback("Error, you tried interring an unauthorized character...",null)
	}else{

		//Create a folder with propertiesObject.artefactID, used as a root folder for the zip
		createFolder("./"+propertiesObject.artifactID,function(errFolder){
			if(errFolder){
				callback(errFolder,null)
			}else{

				//Generate the maven artifact (architecture + pom.xml)
				generateMavenArtifact(propertiesObject.artifactID, propertiesObject.groupID, propertiesObject.version, function(err){			
					if(err){
						callback(err,null)
					}else{

						//Copy the xcore file from the tmp directory to services
						//Ask Roxane about the #, her idea (Split in 2 parts ->  [0] : The location of the file downloaded (in tmp) // [1] : The real name of the file)
						var artifactArchitecturePath = propertiesObject.artifactID+"/"+propertiesObject.artifactID+"/src/main/model/"
						fs.createReadStream(propertiesObject.file.split('#')[0]).pipe(fs.createWriteStream(path.join(__dirname,artifactArchitecturePath+propertiesObject.file.split('#')[1])));


						//Modify the pom.xml to add facultatives properties
						var parser = new xml2js.Parser()
						var pomDir = path.join(__dirname,propertiesObject.artifactID+"/"+propertiesObject.artifactID+"/pom.xml")
						fs.readFile(pomDir, function(readFileError, data) {
							if(readFileError){
								callback(readFileError,null)
							}else{
								parser.parseString(data, function (xmlParseError, xmlParseResult) {
									if(xmlParseError){
										callback(xmlParseError, null)
									}else{
										console.log(xmlParseResult);

								    	//Adding the facultatives properties specified in the form
								    	if(propertiesObject.artifactName) xmlParseResult.project.name = propertiesObject.artifactName
								    	if(propertiesObject.artifactDescription) xmlParseResult.project.description = propertiesObject.artifactDescription
								    	if(propertiesObject.artifactURL) xmlParseResult.project.url = propertiesObject.artifactURL
								    	if(propertiesObject.year) xmlParseResult.project.inceptionYear = propertiesObject.year
								    	if(propertiesObject.organization) xmlParseResult.project.organization = { name: propertiesObject.organization }
								    	var parseError = ""
								    	if(propertiesObject.developers){
								    		xml2js.parseString(propertiesObject.developers, function(devParseError,devParseResult){
									    		if(devParseError){
									    			parseError += "An error occured during parse of developers field :\n"+devParseError+"\n"
									    		}else{
									    			xmlParseResult.project.developers = devParseResult.developers
									    		}
									    	})
								    	}
								    	if(propertiesObject.scm){
								    		xml2js.parseString(propertiesObject.scm, function(scmParseError,scmParseResult){
									    		if(scmParseError){
									    			parseError += "An error occured during parse of scm field :\n"+scmParseError+"\n"
									    		}else{
									    			xmlParseResult.project.scm = scmParseResult.scm
									    		}
									    	})
								    	}

								    	//NOTE : To avoid some more callbacks, we store eventual errors of parsing in the variable parseError
								    	if(parseError !== ""){
								    		callback(parseError,null)
								    	}else{

								    		//Rebuild the xml file
									    	var builder = new xml2js.Builder()
									    	var xml = builder.buildObject(xmlParseResult)

									    	//Rewrite the xml file
									    	fs.writeFile(pomDir, xml, function(writeFileError, data){
								            	if (writeFileError){
								            		callback(writeFileError,null)
								            	}else{

								            		//Zip the artifact
													zipArchitecture("./"+propertiesObject.artifactID, function(zipError,zipResult){
														if(zipError){
															console.log(zipError,null);
														}else{
															//return the artifact
															callback(null,zipResult)//the .zip file
														}
													})
													

													//Execute maven + send to maven repo ???
								            	}
			        						})
								    	}
									}
							    });
							}
						});
					}
				
				});
			}
		})
	}
}


module.exports = { createArtifact }