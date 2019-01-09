function change_lang(lang){
    if (["en", "fr"].indexOf(lang) < 0){
        // not supported
        return
    }
    var url = window.location.toString();
    var clangIndex = url.indexOf("clang");
    if (clangIndex >= 0){
        // already here
        url = url.replace(url.substring(clangIndex, clangIndex+8), "");
        if (url[clangIndex] == "&"){
            url = url.replace(url.substring(clangIndex, clangIndex+1), "");
        } else {
            // nothing behind
            url = url.replace(url.substring(clangIndex-1, clangIndex), "");
        }
    }
    if (url.indexOf("?") < 0){
        window.location = url + "?clang=" + lang
    } else {
        window.location = url + "&clang=" + lang
    }
}