import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";

/**
 * @Description: 控制线检测类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class ControlLineDetection {
  constructor() {
    loadModules(
      [ "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
        "esri/tasks/QueryTask",
        "esri/tasks/support/Query",
        "esri/geometry/Polygon",
        "esri/geometry/SpatialReference"      ], options
    ).then(([ Graphic, GraphicsLayer,FeatureLayer,QueryTask, Query,Polygon,SpatialReference]) => {
      //事件发布
      this.event = new Event(this);
      this.Graphic = Graphic;
      this.GraphicsLayer = GraphicsLayer;
      this.QueryTask = QueryTask;
      this.Query = Query;
      this.FeatureLayer =FeatureLayer;
      this.idenGraphicsLayer = g_highLightLayer;//定位时的高亮图层
      this.tempGraphicsLayer = g_bufferLayer;//绘制缓冲区临时图层
      this.Polygon = Polygon;
      this.SpatialReference = SpatialReference
    });
  }

  /**
   * @Description: 符号化和定位要素
   * @param: features 要素,symbol 符号
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  locationMulti(features,symbol){
    this.clearGraphics()
    if(symbol == undefined){
      symbol = {
        type: "simple-fill",  // autocasts as new SimpleFillSymbol()
        style: "none",
        outline: {  // autocasts as new SimpleLineSymbol()
          color: "#00F5FF",
          width: 1.5
        }
      };
    }
    for(let i =0;i<features.length;i++){
      let geometry = features[i].geometry
      let poylgon = {
        type:geometry.type,
        spatialReference:g_spatialReference,
        rings:geometry.rings
      }
      var graphic = new this.Graphic({
        geometry: poylgon,   // Add the geometry
        symbol: symbol,   // Add the symbol
      });
      this.idenGraphicsLayer.graphics.add(graphic);
    }

  }

  /**
   * @Description: 符号化和定位图斑
   * @param: geometry 图斑,symbol 符号
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  locationOne(geometry,symbol){
    this.clearGraphics()
    if(symbol == undefined){
      symbol = {
        type: "simple-fill",  // autocasts as new SimpleFillSymbol()
        style: "none",
        outline: {  // autocasts as new SimpleLineSymbol()
          color: "#00F5FF",
          width: 1.5
        }
      };
    }
    // for(let i = 0;i<geometry.rings.length;i++){
      let poylgon = {
        type:geometry.type,
        spatialReference:g_spatialReference,
        rings:geometry.rings
      }
      var graphic = new this.Graphic({
        geometry: poylgon,   // Add the geometry
        symbol: symbol,   // Add the symbol
      });
      this.idenGraphicsLayer.graphics.add(graphic);
    // }

  }

  /**
   * @Description: 清除临时图层
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

  /**
   * @Description: 清除定位图层
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  clearHighlightLayer(){
    if (this.idenGraphicsLayer != undefined) {
      this.idenGraphicsLayer.removeAll();
    }
  }

}
