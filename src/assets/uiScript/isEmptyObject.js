function isEmptyObject(obj){
    for (var key in obj) {
        return false;
    }
    return ture;
}
module.exports={
    isEmptyObject
}