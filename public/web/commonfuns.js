function formatDate(now, symbol){
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  month = month<10?'0'+month : month
  let date = now.getDate();
  date = date<10?'0'+date : date
  let hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
  let minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
  let second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
  if (!symbol) {
    return year +""+ month + ""+date + ""+hour  + ""+minute + "" + second ;
  }else{
    return year + symbol + month + symbol + date + ' ' + hour + ':' + minute + ':' + second;
  }
}

function toChinesNum(num){
  let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let unit = ["", "十", "百", "千", "万"];
  num = parseInt(num);
  let getWan = (temp) => {
    let strArr = temp.toString().split("").reverse();
    let newNum = "";
    for (var i = 0; i < strArr.length; i++) {
      newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
    }
    return newNum;
  }
  let overWan = Math.floor(num / 10000);
  let noWan = num % 10000;
  if (noWan.toString().length < 4) noWan = "0" + noWan;
  return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
}
