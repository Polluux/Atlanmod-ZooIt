maven_required_fields = document.getElementsByClassName('mvn_required');
textarea_developpers = document.getElementById('textarea_developpers');
textarea_scm = document.getElementById('textarea_scm');

// Toggle maven required

document.addEventListener('DOMContentLoaded',function() {
    document.getElementById('checkbox_maven_toggler').onchange=toggleRequired;
},false);


function toggleRequired(event) {
    for (field of maven_required_fields){
    	field.required = this.checked;
    }
}

// add default values

developpers = "<developers>\n<developer>\n  <name> ... </name>\n  <email> ... </email>\n  <organization> ... </organization>\n  <organizationUrl> ... </organizationUrl>\n</developer>\n</developers>"
scm = "<scm>\n<connection>\n  scm:git:git://github.com/ ...\n</connection>\n<developerConnection>\n  scm:git:ssh://github.com: ...\n</developerConnection>\n<url>\n  http://github.com/ ...\n</url>\n</scm>"
textarea_developpers.placeholder=developpers;
textarea_scm.placeholder=scm;

function fill_textarea(textarea, text){
	if (textarea.value==""){
		textarea.value = text
	}
}

textarea_developpers.addEventListener("click", function(){fill_textarea(textarea_developpers, developpers)});
textarea_scm.addEventListener("click", function(){fill_textarea(textarea_scm, scm)});

// validate textarea

textarea_developpers.addEventListener("keyup", validate_developers);
textarea_scm.addEventListener("keyup", validate_scm);

function validate_developers(){
	if (textarea_developpers.value=="" && !textarea_developpers.required){
		textarea_developpers.setCustomValidity("");
		return true
	}

	var devParser = new DOMParser();
	var devDOM = devParser.parseFromString(textarea_developpers.value, "application/xml");

	dev_root_node = devDOM.documentElement
	if (dev_root_node.nodeName != "developers"){
		textarea_developpers.setCustomValidity("XML malformé")
		return false
	}
	if (dev_root_node.childElementCount < 1){
		textarea_developpers.setCustomValidity("Au moins un developpeur")
		return false
	}
	for (dev_node of dev_root_node.children){
		if (dev_node.textContent.indexOf('...') != -1){
			textarea_developpers.setCustomValidity("Vous n'avez pas tout rempli");
			return false
		}
		if (dev_node.getElementsByTagName('name').length != 1){
			textarea_developpers.setCustomValidity("Le developpeur doit avoir un et un seul <name>");
			return false
		}
		if (dev_node.getElementsByTagName('email').length == 1 && dev_node.getElementsByTagName('email')[0].textContent.indexOf('@') == -1){
			textarea_developpers.setCustomValidity("Les email doivent être valides");
			return false
		}
		if (dev_node.getElementsByTagName('organizationUrl').length == 1 && dev_node.getElementsByTagName('organizationUrl')[0].textContent.indexOf('http') == -1){
			textarea_developpers.setCustomValidity("Les addresses doivent commencer par http");
			return false
		}
	}
	textarea_developpers.setCustomValidity("")
	return true;
}

function validate_scm(){
	if (textarea_scm.value=="" && !textarea_scm.required){
		textarea_scm.setCustomValidity("")
		return true
	}

	textarea_scm.setCustomValidity("")
	var scmParser = new DOMParser();
	var scmDOM = scmParser.parseFromString(textarea_scm.value, "application/xml");

	scm_root_node = scmDOM.documentElement
	if (scm_root_node.nodeName != "scm"){
		textarea_scm.setCustomValidity("XML malformé")
		return false
	}
	if (scm_root_node.childElementCount > 4){
		textarea_scm.setCustomValidity("XML malformé")
		return false
	}
	if (scm_root_node.textContent.indexOf('...') != -1){
		textarea_scm.setCustomValidity("Vous n'avez pas tout rempli");
		return false
	}
	if (scm_root_node.getElementsByTagName('connection').length != 1){
		textarea_scm.setCustomValidity("Il manque <connection>");
		return false
	}
	if (scm_root_node.getElementsByTagName('connection')[0].textContent.indexOf("scm:") == -1){
		textarea_scm.setCustomValidity("<connection> malformée");
		return false
	}
	if (scm_root_node.getElementsByTagName('developerConnection').length != 1){
		textarea_scm.setCustomValidity("Il manque <developerConnection>");
		return false
	}
	if (scm_root_node.getElementsByTagName('developerConnection')[0].textContent.indexOf("scm:") == -1){
		textarea_scm.setCustomValidity("<developerConnection> malformée");
		return false
	}
	if (scm_root_node.getElementsByTagName('url').length != 1){
		textarea_scm.setCustomValidity("Il manque <url>");
		return false
	}
	if (scm_root_node.getElementsByTagName('url')[0].textContent.indexOf("http") == -1){
		textarea_scm.setCustomValidity("<url> malformée, doit commencer par http");
		return false
	}
	return true;
}

