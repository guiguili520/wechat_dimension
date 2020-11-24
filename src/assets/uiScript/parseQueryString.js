function parseQueryString(url){
    url = url == null ? window.location.href : url
    var search = url.substring(url.lastIndexOf('?') + 1)
    if (!search) {
        return {}
    }
    return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
}

module.exports={
    parseQueryString
}