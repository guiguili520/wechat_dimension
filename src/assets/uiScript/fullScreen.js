function fullScreen(el){
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen,
    wscript;

    if(typeof rfs != "undefined" && rfs) {
        rfs.call(el);
        return;
    }

    if(typeof window.ActiveXObject != "undefined") {
        wscript = new ActiveXObject("WScript.Shell");
        if(wscript) {
            wscript.SendKeys("{F11}");
        }
    }
}
module.exports={
    fullScreen
}