/**
 *
 *
 * @export
 * @param {*} value  选中值
 * @param {*} features
 * @param {*} Statistic
 * @param {*} countyUrl
 * @param {*} geometry
 */
export function getLocation(value,features,Statistic,countyUrl,geometry,fieldToGetRegion){

  for(let i = 0;i<features.length;i++){
      if(value == features[i].attributes[fieldToGetRegion]){
        geometry = features[i].geometry;
      }
    }
  Statistic.regionLocation(countyUrl,geometry);
return geometry
}
//url字符串解析
//url字符串解析
export function UrlSearch(str){
  var name,value;
  var str = str == undefined ? window.location.href : str
  //var str=location.href; //取得整个地址栏
  var num=str.indexOf("?")
  if(num >0){
  str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

  var arr=str.split("&"); //各个参数放到数组里
  for(var i=0;i < arr.length;i++){
    num=arr[i].indexOf("=");
    if(num>0){
      name=arr[i].substring(0,num);
      value=arr[i].substr(num+1);
      this[name]=value;
    }
  }
  }
}
export function formatDate(now, symbol){
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
