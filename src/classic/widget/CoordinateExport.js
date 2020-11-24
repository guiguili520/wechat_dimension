import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";

/**
 * @Description: 坐标输出类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class CoordinateExport {
  constructor() {
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
    })
  }

  /**
   * @Description: 清除图层
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
