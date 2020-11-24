import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";
import bus from "../../assets/eventBus";

/**
 * @Description: 自定义查询类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class CustomQuery {
  constructor() {
    this.event = new Event(this);
    loadModules([
      "esri/tasks/QueryTask",
      "esri/tasks/support/Query",
      "esri/Graphic"
    ], options).then(([QueryTask, Query, Graphic]) => {
      this.QueryTask = QueryTask;
      this.Query = Query;
      this.Graphic = Graphic;
      this.view = g_view;
      this.idenGraphicsLayer = g_highLightLayer; //定位时的高亮图层

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
    let layerUrl = url; //图层服务地址
    let queryTask = new this.QueryTask({ //创建一个QueryTask
      url: layerUrl
    });
    let query = new this.Query();
    query.returnGeometry = false;
    query.outFields = ["*"];
    query.where = "1=1";
    queryTask.execute(query).then((results) => {
      let layerFields = results.fields;
      this.event.triggerEvent('getLayerFieldComplete', layerFields);
    });
  }

  /**
   * @Description: 获取字段的所有值
   * @param: url 图层服务地址,outField 输出字段
   * @return: LayerFieldValues 字段的所有值
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getLayerFieldValue(url, outField) {
    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    query.returnGeometry = false;
    query.outFields = outField;
    query.where = "1=1";
    queryTask.execute(query).then((results) => {
      let LayerFieldValues = results.features;
      this.event.triggerEvent('getLayerFieldValueComplete', LayerFieldValues);
    });
  }

  /**
   * @Description: where 语句查询
   * @param: url 查询图层, where SQL语句查询
   * @return: searchRes 查询结果
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getSerachRes(url, where) {
    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.where = where;
    bus.$emit('setLoad', {
      statue: true,
      msg: '查询中...'
    });
    queryTask.execute(query).then((results) => {
      bus.$emit('setLoad', {
        statue: false,
        msg: '查询中...'
      });
      let searchRes = results.features;
      this.event.triggerEvent('getSerachResComplete', searchRes);
    }).catch((error) => {
      bus.$emit('setLoad', {
        statue: false,
        msg: '加载中...'
      });
      console.log("错误信息: " + error.message);
    });
  }

  /**
   * @Description: 符号化和定位
   * @param: geometry 符号化图斑
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  mapMark(geometry) {
    let symbol
    this.clearGraphics()
    if (geometry.type == "polygon") {
      symbol = {
        type: "simple-fill",
        style: "none",
        outline: {
          color: "#00F5FF",
          width: 1.5
        }
      }
    } else if (geometry.type == "point") {
      symbol = {
        type: "picture-marker",  // autocasts as new SimpleFillSymbol()
        url: require("../../assets/images/pointPosition.png"),
        width: "18px",
        height: "18px"
      };
    }
    let graphic = new this.Graphic({
      geometry: geometry,   // Add the geometry
      symbol: symbol,   // Add the symbol
    });

    this.idenGraphicsLayer.graphics.add(graphic);
    g_view.goTo(graphic);//定位

  }

  /**
   * @Description: 移除图层
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  clearGraphics() {
    if (this.idenGraphicsLayer != undefined) {
      this.idenGraphicsLayer.removeAll();
    }
  }

}
