function multiOverflowhidden(id,rows,str){
    var el=document.querySelector(id);

    el.addEventListener('mouseover',function () {
        this.title=str;
    })
    var lineHeight=window.getComputedStyle(el,null).lineHeight;
    var at = rows* parseInt(lineHeight);
    var tempstr =str;
    el.innerHTML =tempstr;

    var len =tempstr.length;
    var i=0;
    if(el.offsetHeight <= at){

    }else{
      var temp ="";
      el.innerHTML =temp;
      while(el.offsetHeight <= at){
        temp =tempstr.substring(0,i+1);
        i++;
        el.innerHTML =temp;
      }

      var slen =temp.length;
      tempstr =temp.substring(0,slen-1);
      len =tempstr.length;
      el.innerHTML =tempstr.substring(0,len-3) +"...";
      el.height=at+'px';
    }
}
module.exports={
    multiOverflowhidden
}