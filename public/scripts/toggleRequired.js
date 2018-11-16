document.addEventListener('DOMContentLoaded',function() {
    document.getElementById('checkbox_maven_toggler').onchange=toggleRequired;
},false);

maven_required_fields = document.getElementsByClassName('mvn_required');

function toggleRequired(event) {
    for (field of maven_required_fields){
    	field.required = this.checked;
    }
}
