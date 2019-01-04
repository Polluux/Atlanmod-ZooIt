const artifactService = require('../services/create_artifact.js');
const path = require('path')
const fs = require('fs')
const readline = require('readline')

const regex_XCORE = /^.*\.xcore+$/
const regex_property_parameter = /^-([A-Z]|[a-z]|[0-9]|\.|\-)+=([A-Z]|[a-z]|[0-9]|\.|\-)+$/
const regex_alternative_property_parameter = /^-([A-Z]|[a-z]|[0-9]|\.|\-)+=.*$/ //This is used for optional properties, "a property" is transformed to : a property (" are suppressed at the execution) 
const regex_valid_property = /^([A-Z]|[a-z]|[0-9]|\.|\-)+$/
const regex_valid_optional_property = /^(([A-Z]|[a-z]|[0-9]|\.|\-)*|".*")$/ //Note the * instead of +

const list_required_properties = ["artifactID","groupID","version"]
const list_facultative_properties = ["artifactName","artifactDescription","artifactURL","year","organization"]
const list_properties_not_supported = ["developers","scm"]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Test inputs

if(process.argv.length < 3){
	console.log('--- [INFO] Usage : node prompt_script.js <file.xcore> [-parameter=value]* \n Parameters such as : \n')
	list_required_properties.forEach(function(val){
		console.log('\t-'+val+'=<'+val+'>')
	})
	list_facultative_properties.forEach(function(val){
		console.log('\t-'+val+'=<'+val+'>')
	})
	list_properties_not_supported.forEach(function(val){
		console.log('\t-'+val+'=<'+val+'> (Not implemented yet)')
	})
	close()
	return
}

if(!regex_XCORE.test(process.argv[2])){
	console.log("--- [ERROR] The file specified must be a xcore file.")
	close()
	return
}

var filePath = (process.argv[2].charAt(0) == '/' ? process.argv[2] : path.join(__dirname,process.argv[2]))

if (!fs.existsSync(filePath)){
	console.log("--- [ERROR] The file specified doesn't seem to exist at path : "+filePath+".")
	close()
	return
}

// Get the potential parameters

var params = {}

process.argv.forEach(function (val, index, array) {
	if(index>2){
		if(regex_property_parameter.test(val)){
			params[val.split('=')[0].substring(1)] = val.split('=')[1]
		}else if(regex_alternative_property_parameter.test(val)){ //If there is spaces in the value, only allowed for facultative properties
			if(list_facultative_properties.includes(val.split('=')[0].substring(1))) params[val.split('=')[0].substring(1)] = val.substring(val.indexOf('=')+1)
		}
	}
})

//Complete the parameters

console.log("=== Generating the artifact for file "+filePath.split('/').pop()+" ===")

fillParameters(function(){
	params.file = filePath
	artifactService.createArtifact(params,"xcore-generation-archetype",true,function(err,res){
		if(err){
			console.log("--- [ERROR] An error occured during the generation :\n"+err)
		}else{
			console.log("--- [SUCCESS] Your generated zipped artifact is : "+res)
		}
	})
})







async function fillParameters(callback){
	for(var i=0; i<list_required_properties.length; i){
		if(!params[list_required_properties[i]]){
			params[list_required_properties[i]] = await ask("Enter "+list_required_properties[i]+" : ",regex_valid_property).catch(function(err){
				console.log("--- [INFO] Sorry, your input is invalid.")
			})
		}
		if(params[list_required_properties[i]]) i++
	} 

	for(var i=0; i<list_facultative_properties.length; i++){
		if(!params[list_facultative_properties[i]]){
			params[list_facultative_properties[i]] = await ask("(Optional for maven release only) Enter "+list_facultative_properties[i]+" : ",regex_valid_optional_property).catch(function(err){
				console.log("--- [INFO] Sorry, your input is invalid.")
				i--
			})
			if(params[list_facultative_properties[i]] == '') delete params[list_facultative_properties[i]]
			if(/^".*"$/.test(params[list_facultative_properties[i]])) params[list_facultative_properties[i]] = params[list_facultative_properties[i]].substring(1,params[list_facultative_properties[i]].length -1)
		}
	} 

	close()
	callback()
}

function ask(question,regex){
	return new Promise((resolve,reject) => {
	    rl.question(question,function(res){
			if(regex.test(res)){
				resolve(res)
			}else{
				reject(null)
			}
		})
	})
}

function close(){
	rl.close()
}
