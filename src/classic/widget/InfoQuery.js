import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";
import bus from '../../assets/eventBus';

/**
 * @Description: 信息查询类
 * @param:
 * @return:
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class InfoQuery {
  constructor() {
    this.event = new Event(this);
    loadModules([
      "esri/tasks/QueryTask",
      "esri/tasks/support/Query",
      "esri/Graphic",
      "esri/geometry/geometryEngineAsync",
    ], options).then(([QueryTask, Query ,Graphic ,geometryEngineAsync]) =>{
      this.QueryTask = QueryTask;
      this.Query = Query;
      this.view = g_view;
      this.Graphic = Graphic;
      //查询的图层
      this.url = '';
      this.geometryEngineAsync = geometryEngineAsync;
      this.idenGraphicsLayer=g_highLightLayer; //定位时的高亮图层
      this.tempGraphicsLayer = g_drawLayer;//绘制缓冲区临时图层
    })
  }
  /**
   * @Description: 获取图层的所有字段
   * @param: url 图层服务地址
   * @return: layerFields 图层字段
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getLayerField(url) {
    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.where = "1=1";
    queryTask.execute(query).then((results) =>{
      let layerFields = results.fields;
      this.event.triggerEvent('getLayerFieldComplete', layerFields);
    });
  }
  /**
   * @Description: where 语句查询
   * @param: url 查询图层, option where语句查询参数（symbol,fieldType）
   * @return: searchRes 查询结果
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getsearchRes(url,option){
   //
    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    if(option.geometry!=undefined){
      query.geometry =option.geometry;
    }

      query.returnGeometry = true;


    query.outFields =  ["*"];
    query.spatialRelationship = "contains"
    if(option.symbol=='LIKE'){
      query.where=option.field +" " +option.symbol +" '%"+option.fieldValue+"%' ";
    }else if(option.fieldType=="num"){
      query.where =option.field+option.symbol+option.fieldValue;
    }else if(option.fieldType=="string"){
      query.where =option.field+option.symbol+"\'"+option.fieldValue+"\'";
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
      let searchRes = results.features;
      this.event.triggerEvent('getsearchResComplete', searchRes);
    }).catch((error)=>{
      bus.$emit('setLoad',{
        statue:false,
        msg:'加载中...'
      });
      console.log("错误信息: " + error.message)
    });
  }

  /**
   * @Description: 符号化和定位
   * @param: geometry 符号化图斑
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  regionLocation(geometry){
    this.clearGraphics()
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
  // buffer(geometry, distance) {
  //   this.geometryEngineAsync.buffer(geometry, distance, "meters").then((response)=> {
  //     let bufferGeo = response;
  //     let symbol = {
  //       type: "simple-fill",
  //       color: "rgba(255,0,0,0.3)",
  //       style: "solid",
  //       outline: {
  //         color: "red",
  //         width: 1
  //       }
  //     };
  //     let graphic = new this.Graphic({
  //       geometry: bufferGeo,
  //       symbol: symbol,
  //     });
  //     this.tempGraphicsLayer.graphics.add(graphic);
  //     this.event.triggerEvent('bufferComplete', bufferGeo);
  //   });
  //
  // }

  /**
   * @Description: 移除图层
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  clearGraphics() {
    if (this.tempGraphicsLayer != undefined) {
      this.tempGraphicsLayer.removeAll();
    }
    if (this.idenGraphicsLayer != undefined) {
      this.idenGraphicsLayer.removeAll();
    }

  }

}
