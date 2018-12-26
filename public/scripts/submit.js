function submit_form(form, submit_button){
    if (! form.reportValidity()){
        return
    }
    submit_button.classList.add('spinning');
    form.submit();
    submit_button.classList.remove('spinning');
}

function submit_ajax(form, submit_button){
    if (! form.reportValidity()){
        return
    }

    submit_button.classList.add('spinning');

    var xhr = new XMLHttpRequest();

    //This is a bit tricky, [].fn.call(form.elements, ...) allows us to call .fn
    //on the form's elements, even though it's not an array. Effectively
    //Filtering all of the fields on the form
    var params = [].filter.call(form.elements, function(el) {
        //Allow only elements that don't have the 'checked' property
        //Or those who have it, and it's checked for them.
        return typeof(el.checked) === 'undefined' || el.checked|| el.type !== 'checkbox' || el.type !== 'radio';
        //Practically, filter out checkboxes/radios which aren't checekd.
    })
    .filter(function(el) { return !!el.name; }) //Nameless elements die.
    .filter(function(el) { return !el.disabled; }) //Disabled elements die.
    .map(function(el) {
        //Map each field into a name=value string, make sure to properly escape!
        return encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value);
    }).join('&'); //Then join all the strings by &

    xhr.open("POST", "/");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.responseType = 'arraybuffer';

    // courtesy of https://nehalist.io/downloading-files-from-post-requests/
    //.bind ensures that this inside of the function is the XHR object.
    xhr.onload = function () {
        submit_button.classList.remove('spinning');
        // Only handle status code 200
        if(xhr.status === 200) {
        // Try to find out the filename from the content disposition `filename` value
            var disposition = xhr.getResponseHeader('content-disposition');
            var matches = /"([^"]*)"/.exec(disposition);
            var filename = (matches != null && matches[1] ? matches[1] : 'file.zip');

            // The actual download
            var blob = new Blob([xhr.response], { type: 'application/zip' });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
        }
    };

    //All preperations are clear, send the request!
    xhr.send(params);
}