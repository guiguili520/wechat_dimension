function unique(arr){
    //数组去重
    if (arr && arr.length > 1) {
        var _res = [];
        var _json = {};
        for (var i = 0; i < arr.length; i++) {
            if (!_json[arr[i]]) {
                _res.push(arr[i]);
                _json[arr[i]] = 1;
            }
        }
        return _res;
    } else {
        return arr;
    }
}

module.exports={
    unique
}