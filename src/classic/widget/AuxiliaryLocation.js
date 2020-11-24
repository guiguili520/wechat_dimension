import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";

/**
 * @Description: 辅助选址类
 * @param: ExporWebMapTask arcgis打印服务地址
 * @author: Guixiang Tang
 * @date: 2019/3/13
 */
export default class AuxiliaryLocation {
  constructor() {
    this.event = new Event(this);
    loadModules([
      "esri/tasks/QueryTask",
      "esri/tasks/support/Query",
      "esri/Graphic",
      "esri/tasks/PrintTask",
      "esri/tasks/support/PrintTemplate",
      "esri/tasks/support/PrintParameters"], options).then(([QueryTask, Query,Graphic,PrintTask,PrintTemplate,PrintParameters]) =>{
      this.QueryTask = QueryTask;
      this.Query = Query;
      this.Graphic= Graphic;
      this.idenGraphicsLayer = g_highLightLayer;//定位时的高亮图层
      this.PrintTask = PrintTask;
      this.PrintTemplate = PrintTemplate;
      this.PrintParameters = PrintParameters;

    })
  }

  /**
   * @Description: 打印
   * @param: this.printUrl 打印服务地址
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */
  print(exportUrl){
    this.printUrl = exportUrl
    let printTask = new this.PrintTask({
      url: this.printUrl
    });
    let template = new this.PrintTemplate({
      format: "PNG32",
      exportOptions: {
        dpi: 96,
        height:800,
        width:1100
      },
      layout: "map-only",
      layoutOptions: {
        titleText: "Warren Wilson College Trees",
        authorText: "Sam"
      }
    });
    let params = new this.PrintParameters({
      view: g_view,
      template: template
    });
    let _this = this;
      printTask.execute(params).then(res=>{
      _this.event.triggerEvent('printTask', res.url);
    }).catch(error=>{
      console.log(error)
    });
  }


  // getLayerFieldValue(url,outField) {
  //   let layerUrl = url;
  //   let queryTask = new this.QueryTask({
  //     url: layerUrl
  //   });
  //   let query = new this.Query();
  //   query.returnGeometry = false;
  //   query.outFields = [outField];
  //   query.where = "1=1";
  //   queryTask.execute(query).then((results)=>{
  //     let queryResult = results.features;
  //     this.event.triggerEvent('getLayerFieldValueComplete', queryResult);
  //   });
  // }
  query(url,where,option){
    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    if(option.geometry!=undefined && option.geometry !=""){
      query.geometry =option.geometry;
    }
    query.returnGeometry = true;
    query.outFields = ['*'];
    let whereCondition = where;
    if(where == undefined || where == '')
      whereCondition = "1=1";
    query.where = whereCondition;
    let _this = this;
    queryTask.execute(query).then(function (results){
      let analysisResults = results;
      _this.event.triggerEvent("queryComplete", analysisResults);
    },function (error) {
      _this.event.triggerEvent("queryComplete", error);
    });
  }

  locationAll(features){
    this.clearGraphics()
    let symbol = {
      type: "simple-fill",  // autocasts as new SimpleFillSymbol()
      style: "none",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: "#00F5FF",
        width: 1.5
      }
    };
    for(let i = 0;i<features.length;i++){
      let geometry = features[i].geometry
      var graphic = new this.Graphic({
        geometry: geometry,   // Add the geometry
        symbol: symbol,   // Add the symbol
      });
      this.idenGraphicsLayer.graphics.add(graphic);
    }
  }

  locationSingle(geo){
    geo.spatialReference = g_spatialReference
    this.clearGraphics()
    let symbol = {
      type: "simple-fill",  // autocasts as new SimpleFillSymbol()
      style: "none",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: "#00F5FF",
        width: 1.5
      }
    };
      let graphic = new this.Graphic({
        geometry: geo,   // Add the geometry
        symbol: symbol,   // Add the symbol
      });
      this.idenGraphicsLayer.graphics.add(graphic);
      g_view.goTo(graphic);
  }

  clearGraphics() {
    if (this.idenGraphicsLayer != undefined) {
      this.idenGraphicsLayer.removeAll();
    }
  }



}
