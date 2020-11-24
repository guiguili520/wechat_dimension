function isEmail(str){
    return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(str);

}


module.exports={
    isEmail
}