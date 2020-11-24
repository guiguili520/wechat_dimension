function timeAgo(time){
    var timeTest=time.getTime();
    var now=(new Date()).getTime();
    var rTime=now-timeTest;
    if(rTime<180000){
        return '刚刚'
    }else if(rTime<2592000000 && rTime>180000){

        if(rTime/86400000>1){
            return parseInt(rTime/86400000)+'天前';
        }else{

            if(rTime/3600000>1){
                return parseInt(rTime/3600000)+'小时前';
            }else{
                return parseInt(rTime/60000)+'分钟前';
            }
        }
    }else{
        return this.formatDate(new Date(timeTest),'-');
    }
    return (now-timeTest)/(1000 * 60 * 60 * 24)
}
module.exports={
    timeAgo
}