export default class Slider {

  /**
   *Creates an instance of Slider.
   * @param {string} key 查询字段名
   * @param {string or number} value 字段值
   * @param {number} opacity 设置透明度
   * @memberof Slider
   */
  constructor() {
       this.g_map=g_map
  
  }
  opacity(key,value,opacity){
     let layer = this.g_map.allLayers.find(function(layer) {
        return layer[key] === value;
      });
         layer.opacity = opacity;
 }
  visible(key,value,visible){
     let layer = this.g_map.allLayers.find(function(layer) {
        return layer[key] === value;
      });
        layer.visible = visible;
   }
   toolBarConfig(toolBar){
     let config=window.roleToolkits;
     console.log(window.roleToolkits)
     for (let i = 0; i <toolBar.length ; i++) {
       let id=document.getElementById(toolBar[i])
       for (let j = 0; j <config.data.length ; j++) {
         if(toolBar[i].indexOf(config.data[j].toolPath)!=-1){
           id.innerHTML=config.data[j].toolName
           console.log(id.innerHTML)
           break;
         }
       }
     }
   }
}
