import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";
export default class ConflictDetection {
  constructor() {
    // this.event = new Event(this);
    // loadModules([
    //   "esri/tasks/QueryTask",
    //   "esri/tasks/support/Query",
    //   "esri/Graphic",
    //   "esri/geometry/geometryEngineAsync",
    // ], options).then(([QueryTask, Query ,Graphic ,geometryEngineAsync]) =>{
    //   this.QueryTask = QueryTask;
    //   this.Query = Query;
    //   this.view = g_view;
    //   this.Graphic = Graphic;
    //   this.idenGraphicsLayer=g_highLightLayer; //定位时的高亮图层
    //   this.tempGraphicsLayer = g_drawLayer;//绘制缓冲区临时图层
    // })
  }
  // clearGraphics() {
  //   if (this.tempGraphicsLayer != undefined) {
  //     this.tempGraphicsLayer.removeAll();
  //   }
  //   if (this.idenGraphicsLayer != undefined) {
  //     this.idenGraphicsLayer.removeAll();
  //   }
  // }

}
