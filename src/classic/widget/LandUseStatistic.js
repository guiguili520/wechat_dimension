import {loadModules} from "esri-loader";
import {options} from "../../config";
// import Chart from 'chart.js';
import Chart from 'echarts';
import Event from "../core/Event";

/**
 * @Description: 土地利用规划统计类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class LandUseStatistic {
  constructor() {
    loadModules(
      [ "esri/Graphic",
        "esri/layers/FeatureLayer",
        "esri/tasks/QueryTask",
        "esri/tasks/support/Query",
        "esri/tasks/support/StatisticDefinition"
      ], options
    ).then(([ Graphic,FeatureLayer,QueryTask,Query,StatisticDefinition]) => {
      //事件发布
      this.event = new Event(this)
      this.Graphic = Graphic;
      this.FeatureLayer =FeatureLayer;
      this.QueryTask =QueryTask;
      this.Query =Query;
      this.StatisticDefinition = StatisticDefinition;
      //统计的图层
      this.url = ''
      //要素地图
      this.fl = null
      this.title = ""
      let idenGraphicsLayer = g_highLightLayer;//定位时的高亮图层
      // this.tempGraphicsLayer = g_bufferLayer;//缓冲区图层
    });
  }

  /**
   * @Description: 符号化要素
   * @param: features 要素
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  location(features){
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

  /**
   * @Description: 清除图层
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  clearGraphics() {
    // if (this.tempGraphicsLayer != undefined) {
    //   this.tempGraphicsLayer.removeAll();
    // }
    if (this.idenGraphicsLayer != undefined) {
      this.idenGraphicsLayer.removeAll();
    }
  }
  // sum(option) {
  //   this.parameters = option.parameters, this.url = option.url;
  //   this.fl = new this.FeatureLayer({
  //     url: this.url,
  //   });
  //   var queryStatesTask  = new this.QueryTask({
  //     url: this.url  // URL of a feature layer representing U.S. states
  //   });
  //   let query = new this.Query();
  //
  //   let statisticDefinition1 = new this.StatisticDefinition({
  //     statisticType: "sum",
  //     onStatisticField: "MJ",
  //     outStatisticFieldName: "SUM_TDYTFQMJ"
  //   });
  //   let statisticDefinition2 = new this.StatisticDefinition({
  //     statisticType: "count",
  //     onStatisticField: "TDYTFQDM",
  //     outStatisticFieldName: "COUNT_TDYTFQDM"
  //   });
  //
  //   // if(this.parameters.geometry !=''){
  //   //   query.geometry = this.parameters.geometry;
  //   // }
  //   query.returnGeometry = true;
  //   query.groupByFieldsForStatistics = ["TDYTFQDM","TDYTFQMC"];
  //   query.outStatistics = [ statisticDefinition1,statisticDefinition2];
  //
  //   queryStatesTask.execute(query).then((result)=>{
  //
  //     let newData = result.features;
  //     this.event.triggerEvent('queryComplete', newData);
  //   });
  // }


}

