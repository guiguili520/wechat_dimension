function formatDate(now, symbol){
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
    var minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    var second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
    if (!symbol) {
        return year + '年' + month + '月' + date +'日'+ ' ' + hour + '时' + minute + '分' + second +'秒';
    }else{
        return year + symbol + month + symbol + date + ' ' + hour + ':' + minute + ':' + second;
    }
}
module.exports={
    formatDate
}
