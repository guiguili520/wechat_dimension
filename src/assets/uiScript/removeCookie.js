function removeCookie(name){
    setCookie(name, '1', -1);
}

module.exports={
    removeCookie
}