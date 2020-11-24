import axios from 'axios'
import {loadModules} from "esri-loader";
import {options} from "../../config";

/**
 * @Description: 测量
 */
export default class BaseTools {

  constructor(initExtent) {
    loadModules(
      [
        "esri/widgets/Expand",
        "esri/core/watchUtils",
      ],
      options
    ).then(([Expand,watchUtils]) => {
      this.init(initExtent);
      this.extentArr = []
      g_view.when(() => {
        //监听动画事件
        g_view.watch("animation", (response)=> {
          if(response && response.state === "running"){}
          else{
            this.addExtent()
          }
        });
        //设置鼠标滚轮事件
        g_view.on("mouse-wheel", (e)=>  {
          if(g_view.stationary == true){
            this.addExtent()
          }
        })
        //设置鼠标拖拽事件
        g_view.on("drag",  (e)=> {
          if(g_view.stationary == true){
            this.addExtent()
          }
        });
      })
    })
  }

  init(initExtent) {
    //this.zoomInButton = document.getElementById("zoomInBtn")
    //this.zoomOutButton = document.getElementById("zoomOutBtn")
    this.previousViewButton = document.getElementById("previousViewBtn")
    this.nextViewButton = document.getElementById("nextViewBtn")
    this.initViewButton = document.getElementById("initViewBtn")
    this.initTools(initExtent)
  }

  addExtent(){
  if(this.extentIndex>=0 && this.extentIndex<this.extentArr.length-1){
    this.extentArr = this.extentArr.slice(0,this.extentIndex+1)
  }
  if(JSON.stringify(this.extentArr).indexOf(JSON.stringify(g_view.extent))==-1){
    this.extentArr.push(g_view.extent); // 进行动态的操作
    if(this.extentArr.length>10){
      this.extentArr.shift();
    }
  }
  this.extentIndex = this.extentArr.length-1
}

 addView(){
  if(this.extentIndex>=0 && this.extentIndex<this.extentArr.length-1){
    this.extentArr = this.extentArr.slice(0,this.extentIndex+1)
  }
  if(this.extentIndex>=0 && this.extentArr[this.extentIndex]!=g_view.extent){
    this.extentArr.push(g_view.extent); // 进行动态的操作
    if(this.extentArr.length>10){
      this.extentArr.shift();
    }
  }
  this.extentIndex = this.extentArr.length-1
}
  initTools(extent) {

    let initExtent = extent;
    //全图按钮
    this.initViewButton.onclick = () => {
      loadModules([
        "esri/geometry/Extent",
      ], options).then(([Extent]) => {
        initExtent.spatialReference = g_spatialReference;
        let allInitExtent = new Extent(initExtent);
        this.addView()
        g_view.extent = allInitExtent;
        this.addView()
      });
    };

    //放大按钮
    //this.zoomOutButton.onclick = () => {
    //this.addExtent()
    //g_view.scale=g_view.scale*2
    //this.addExtent()
    //};

    //缩小按钮
    //this.zoomInButton.onclick = () => {
    //this.addExtent()
    //g_view.scale=g_view.scale*0.5
    //this.addExtent()
    //};

    //上一视图按钮
    this.previousViewButton.onclick = () => {
      if (JSON.stringify(this.extentArr).indexOf(JSON.stringify(g_view.extent)) == -1) {
        this.extentArr.push(g_view.extent); // 进行动态的操作
        if (this.extentArr.length > 10) {//如果数组的长度超过10个
          this.extentArr.shift();//移除数组的第一个元素
        }
        this.extentIndex = this.extentArr.length - 2
      } else {
        if (this.extentIndex >= 1 && this.extentIndex <= this.extentArr.length - 1) {
          this.extentIndex--
        } else if (this.extentIndex < 1) {
          this.extentIndex = 0
        } else if (this.extentIndex > this.extentArr.length - 1) {
          this.extentIndex = this.extentArr.length - 1
        }
      }
      if (this.extentIndex >= 0 && this.extentIndex <= this.extentArr.length - 1) {
        g_view.extent = this.extentArr[this.extentIndex]
      }
    };

    //下一视图按钮
    this.nextViewButton.onclick = () => {
      // 如果数组里面本身不存在这个对象则把这个加进去
      if (JSON.stringify(this.extentArr).indexOf(JSON.stringify(g_view.extent)) == -1) {
        this.extentArr.push(g_view.extent); // 进行动态的操作
        if (this.extentArr.length > 10) {//如果数组的长度超过10个
          this.extentArr.shift();//移除数组的第一个元素
        }
        this.extentIndex = this.extentArr.length - 1
      } else {
        if (this.extentIndex >= 0 && this.extentIndex < this.extentArr.length - 1) {
          this.extentIndex++
        } else if (this.extentIndex < 0) {
          this.extentIndex = 0
        } else if (this.extentIndex >= this.extentArr.length - 1) {
          this.extentIndex = this.extentArr.length - 1
        }
      }
      if (this.extentIndex >= 0 && this.extentIndex <= this.extentArr.length - 1) {
        g_view.extent = this.extentArr[this.extentIndex]
      }
    };
  }
}
