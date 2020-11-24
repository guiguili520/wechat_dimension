function arrayAwap(arr, index1, index2){
    if (index1 < index2 && index1 == arr.length - 1) {
        return
    } else if (index1 > index2 && index1 == 0) {
        return
    }
    if(arr[index1]==undefined || arr[index2]==undefined){
        return '选中元素或目标元素不存在'
    }
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
}
module.exports={
    arrayAwap
}