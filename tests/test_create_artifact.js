const artifactService = require('../services/create_artifact.js');
const path = require('path')
const fs = require('fs')

const body = { 
				file: path.join(__dirname,'/upload_fe2ff9462c4431649af32f002e4fc314')+'#Java.xcore',
				artifactID: 'monid',
				groupID: 'mongroupe',
				version: '12',
				artifactName: 'monnom',
				artifactDescription: 'madescription',
				artifactURL: 'http://monurl.com',
				developers: '<developers>\r\n<developer>\r\n  <name> ... </name>\r\n  <email> ... </email>\r\n  <organization> ... </organization>\r\n  <organizationUrl> ... </organizationUrl>\r\n</developer>\r\n</developers>',
				scm: '<scm>\r\n<connection>\r\n  scm:git:git://github.com/ ...\r\n</connection>\r\n<developerConnection>\r\n  scm:git:ssh://github.com: ...\r\n</developerConnection>\r\n<url>\r\n  http://github.com/ ...\r\n</url>\r\n</scm>',
				organization: 'monorganization',
				year: '1969',
				submit: 'Submit Query'
			}

console.log('==== Test of function "createArtifact" ===')
console.log('Start test ...')
var error = false
artifactService.createArtifact(body,function(err,res){
	if(err){
		console.log("--- [ERROR] An error occured during the execution of the function : \n"+err)
	}else{
		console.log("--- [INFO] No error raised, now testing validity of the artifact generated...")
		if (!fs.existsSync(path.join(__dirname,'../services/monid/monid/src/main/model/Java.xcore'))) {
			console.log("--- [ERROR] Architecture doesn't seem to be correct (File "+path.join(__dirname,'../services/monid/monid/src/main/model/Java.xcore')+" cannot be accessed.")
			error = true
		}
		if (!fs.existsSync(path.join(__dirname,'../services/monid/monid/pom.xml'))) {
			console.log("--- [ERROR] Architecture doesn't seem to be correct (File "+path.join(__dirname,'../services/monid/monid/pom.xml')+" cannot be accessed.")
			error = true
		}else{
			var generatedPomBuffer = fs.readFileSync(path.join(__dirname,'../services/monid/monid/pom.xml'))
			var expectedPomBuffer = fs.readFileSync(path.join(__dirname,'/expected_pom.xml'))
			if(!expectedPomBuffer.equals(generatedPomBuffer)){
				console.log("--- [ERROR] Well ... seems that the pom generated is a full load of bullshit")
				error = true
			}else{
				console.log("--- [INFO] The pom generated is as expected")
			}
		}
		console.log("--- [INFO] Testing existence of the zip file ...")
		if (!fs.existsSync(path.join(__dirname,'../services/'+res))) {
			console.log("--- [ERROR] The zip file doesn't seem to exist at path : "+path.join(__dirname,'../services/'+res))
			error = true
		}else{
			console.log("--- [INFO] Zip file exists.")
		}
		console.log( (!error ? "--- [VALIDATE] Everything worked fine." : "--- [FAILURE] Some errors occured during the test." ) )
	}
})