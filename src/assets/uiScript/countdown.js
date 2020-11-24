function countdown(id,endDate){
    var showTime=function(){

        var date = new Date();
        var now = date.getTime();
        var end = endDate.getTime();
        var leftTime = end-now;
        var d,h,m,s;
        if (leftTime>=0) {
            d = Math.floor(leftTime/1000/60/60/24);
            h = Math.floor(leftTime/1000/60/60%24);
            m = Math.floor(leftTime/1000/60%60);
            s = Math.floor(leftTime/1000%60);
        } else{
            clearInterval(t);
        }
        document.getElementById(id).innerHTML=d+'天'+h+'时'+m+'分'+s+'秒';
    }
    var t = setInterval(showTime,1000);
}

module.exports={
    countdown
}