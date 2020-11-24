function randomStr(str){
    if(typeof(str) === 'string' || typeof(str)==='number'){
        return str + '_' + (new Date()).getTime()
    }else{
        console.error('参数类型错误，请传入字符串或数字。')
    }
}

module.exports={
    randomStr
}