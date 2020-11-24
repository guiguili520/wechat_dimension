function getBase64(data){
    this.init=function(img){
        var canvas = document.createElement("canvas");
        let screen = document.getElementById("screen");
        canvas.width = screen.offsetWidth;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL
    }
    if(typeof(data)==='object'){
        return this.init(data);
    }else{
        var image =  new Image();
        image.src=data;

        if(image.fileSize>0 || (image.width > 0 && image.height > 0)){
            return  this.init(image)
        }else{
            console.log('图片不存在，或图片地址有误');
        }
    }
}
module.exports={
    getBase64
}
