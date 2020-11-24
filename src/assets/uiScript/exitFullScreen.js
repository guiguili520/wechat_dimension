function exitFullScreen(el){
    var el= document,
    cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen,
    wscript;

    if (typeof cfs != "undefined" && cfs) {
    cfs.call(el);
    return;
    }

    if (typeof window.ActiveXObject != "undefined") {
        wscript = new ActiveXObject("WScript.Shell");
        if (wscript != null) {
            wscript.SendKeys("{F11}");
        }
    }
}
module.exports={
    exitFullScreen
}