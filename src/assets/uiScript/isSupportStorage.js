function isSupportStorage(){
    if (typeof(Storage) !== 'undefined') {
        return true;
    } else {
        alert('抱歉! 您的浏览器太老了，不支持 web 存储。');
        return false;
    }
}
module.exports={
    isSupportStorage
}