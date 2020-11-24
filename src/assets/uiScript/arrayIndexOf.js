function arrayIndexOf(arr, el){
    for (var i = 0, n = arr.length; i < n; i++) {
        if (arr[i] === el) {
            return i;
        }
    }
    return -1;
}

module.exports={
    arrayIndexOf
}