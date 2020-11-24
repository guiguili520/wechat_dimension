/**
 * @Description: 此类实现点，线，面的定位且高亮
 * @author: Guixiang Tang
 * @date: 2019/3/13
 */
import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";

export default class Sketch{
  constructor(container) {
    this.event = new Event(this);
    loadModules([
      "esri/widgets/Sketch",
      'esri/widgets/Sketch/SketchViewModel',
    ], options).then(([Sketch,SketchViewModel]) => {
      g_drawLayer.removeAll();

      let _this=this;
      _this.sketch = new Sketch({
        layer: g_drawLayer,
        view: g_view,
        container: container,
        defaultUpdateOptions:{
          tool:"",
          enableRotation:false,
          enableScaling:false,
          multipleSelectionEnabled:false,
        },
        viewModel:new SketchViewModel({
          layer: g_drawLayer,
          view: g_view,
          pointSymbol: {
            type: "simple-marker",
            style: "circle",
            color: "red",
            size: "10px",
            outline: {
              color: [255, 255, 0],
              width: 1
            }
          },
          polylineSymbol: {
            type: 'simple-line',
            color: '#FF3030',
            width: 1,
            style: 'solid'
          },
          polygonSymbol: {
            type: "simple-fill",
            style: "solid",
            color: [0,0,0,0],
            outline: {
              color: [255,0,0],
              width: 1
            }
          }
        })
      });

      _this.sketch.on("create", function (event) {
        if (event.state === "complete") {
          _this.event.triggerEvent('sketchComplete', event.graphic.geometry);
        }
      });
      // _this.sketch.on("update", function (event) {
      //   if (event.state === "complete") {
      //     _this.event.triggerEvent('sketchComplete', event.graphics[0].geometry);
      //   }
      // });
    })
  }
}

