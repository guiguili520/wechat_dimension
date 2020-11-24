import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";
import bus from "../../assets/eventBus";

/**
 * @Description: 重点项目查询类
 * @param: url 查询服务
 * @return:
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class MajorProjectQuery {
  constructor(url) {
    this.event = new Event(this);
    loadModules([
      "esri/tasks/QueryTask",
      "esri/tasks/support/Query",
      "esri/Graphic"
    ], options).then(([QueryTask, Query ,Graphic ]) =>{
      this.QueryTask = QueryTask;
      this.Query = Query;
      this.view = g_view;
      this.Graphic = Graphic;
      this.idenGraphicsLayer=g_highLightLayer; //定位时的高亮图层
      this.tempGraphicsLayer = g_drawLayer;//绘制缓冲区临时图层
      this.getField(url);//获取字段
    })
  }

  /**
   * @Description: 获取字段
   * @param: url查询图层
   * @return: layerFields 图层字段
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getField(url) {
    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    query.returnGeometry = true;
    //query.outFields = ['BSM','XMMC','JSNR','ZTZ','XMLB','FWXLY','QTDW'];
    query.outFields = ['*'];
    query.where = "1=1";
    queryTask.execute(query).then((results) =>{
      let layerFields = results.fields;
      this.event.triggerEvent('getFieldComplete', layerFields);
    });
  }

  /**
   * @Description: 符号化和定位
   * @param: geometry 定位图斑
   * @return:
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  regionLocation(geometry){
    //this.clearGraphics()
    let symbol = {
      type: "simple-fill",  // autocasts as new SimpleFillSymbol()
      style: "none",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: "red",
        width: 1.5
      }
    };
    var graphic = new this.Graphic({
      geometry: geometry,   // Add the geometry
      symbol: symbol,   // Add the symbol
    });
    this.idenGraphicsLayer.graphics.add(graphic);
    g_view.goTo(graphic);

  }
  getbuildprojectRes(url,option){
    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    query.geometry = option.geometry;
    query.returnGeometry = true;
    query.outFields =  ['*'];
    // query.outFields =  ['BSM','XMMC','XMLB','QTDW','ZTZ','SSXZQ'];
    if (option.fieldType != "string") {
      query.where =option.field+"="+option.KeyWord;
    } else{
      query.where =""+option.field+" LIKE'%"+option.KeyWord+"%'" ;
    }
    bus.$emit('setLoad',{
      statue:true,
      msg:'查询中...'
    });
    queryTask.execute(query).then((results)=>{
      bus.$emit('setLoad',{
        statue:false,
        msg:'加载中...'
      });
      let searchRes = results;
      this.event.triggerEvent('getbuildprojectResComplete', searchRes);
    }).catch((error)=>{
      bus.$emit('setLoad',{
        statue:false,
        msg:'加载中...'
      });
      console.log("错误信息: " + error.message);
    });
  }
  clearGraphics() {
    if (this.tempGraphicsLayer != undefined) {
      this.tempGraphicsLayer.removeAll();
    }
    if (this.idenGraphicsLayer != undefined) {
      this.idenGraphicsLayer.removeAll();
    }
  }
}
