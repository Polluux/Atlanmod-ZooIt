document.addEventListener('DOMContentLoaded',function() {
    document.getElementById('checkbox_maven_toggler').onchange=toggleRequired;
},false);

maven_required_fields = document.getElementsByClassName('mvn_required');

function toggleRequired(event) {
    for (field of maven_required_fields){
    	field.required = this.checked;
    }
}

developpers = "<developers>\n<developer>\n  <name> ... </name>\n  <email> ... </email>\n  <organization> ... </organization>\n  <organizationUrl> ... </organizationUrl>\n</developer>\n</developers>"
scm = "<connection>\n  scm:git:git://github.com/ ...\n</connection>\n<developerConnection>\n  scm:git:ssh://github.com: ...\n</developerConnection>\n<url>\n  http://github.com/ ...\n</url>"

