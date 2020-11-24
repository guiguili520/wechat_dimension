
/**
 * @Class SgMap.Draw()
 * @Description: 绘制类，包括绘制点、线、面、矩形、圆形、清除功能
 * @extends 无
 * @param view
 * @example new SgMap.Draw('#id',{
 *     point:true,
 *     polyline:true,
 *     polygon:true,
 *     rectangle:true,
 *     circle:true
 * })
 */

import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";

export default class Draw {
  constructor(id, type) {
    this.event = new Event(this);
    loadModules(
      [
        'esri/widgets/Sketch/SketchViewModel',
        'esri/Graphic',
        "esri/layers/GraphicsLayer",
      ],
      options
    ).then(([SketchViewModel, Graphic,GraphicsLayer]) => {
      this.loopInitInfo(SketchViewModel, Graphic,GraphicsLayer, id, type);
    })
  }

  loopInitInfo(SketchViewModel,Graphic,GraphicsLayer,id,type){
    this.updateGraphic = null;
    this.tempGraphicsLayer = window.g_drawLayer;
    this.view = g_view;
    this.sketchVM = new SketchViewModel({
      view: this.view,
      layer: this.tempGraphicsLayer,
      pointSymbol: {
        type: "simple-marker",
        style: "circle",
        color: "red",
        size: "10px",
        outline: {
          color: [255, 255, 0],
          width: 3
        }
      },
      polylineSymbol: {
        type: 'simple-line',
        color: '#FF3030',
        width: 3,
        style: 'solid'
      },
      polygonSymbol: {
        type: "simple-fill",
        style: "solid",
        color: [0,0,0,0],
        outline: {
          color: [255,0,0],
          width: 3
        }
      }
    });
    this.Graphic=Graphic
    // this.setUpClickHandler();
    let _this = this;

    _this.sketchVM.on("create", function(event) {
      if (event.state === "complete") {
        _this.event.triggerEvent('drawComplete', event.graphic);
      }
    });
    // _this.sketchVM.on("update", function (event) {
    //   if (event.state === "complete") {
    //     _this.event.triggerEvent('drawComplete', event.graphics[0]);
    //   }
    // });
    if(id != undefined && id != null) {
      let target = document.getElementById(id);
      if(target != undefined) {
        target.onclick = () => {
          _this.sketchVM.create(type);
          _this.setActiveButton(target);
        };
      }
    }
  }

  setUpClickHandler() {
    this.view.on('click', (event) => {
      this.view.hitTest(event).then((response) => {
        let results = response.results;
        if (results.length && results[results.length - 1]
          .graphic) {
          if (!this.updateGraphic) {
            this.updateGraphic = results[results.length - 1].graphic;
            this.tempGraphicsLayer.remove(this.updateGraphic);
            this.sketchViewModel.update(this.updateGraphic);
          }
        }
      });
    });
  }

  setActiveButton(selectedButton) {
    this.view.focus();
    // g_drawLayer.removeAll();
    let elements = document.getElementsByClassName('active');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    if (selectedButton) {
      selectedButton.classList.add('active');
    }
  }

  removeGraphic(graphic){
    g_drawLayer.remove(graphic)
  }

  addGraphicToDrawLayer(geometry) {
    if (geometry == undefined)
      return;

    let gra = new this.Graphic();
    gra.geometry = geometry;
    gra.spatialReference = g_MapConfig.baseConfig.webgisSr;
    gra.symbol = this.sketchVM.polygonSymbol;
    g_drawLayer.graphics.add(gra);
  }

  updateGraphicForDrawLayer(geometry,index){
    if (geometry == undefined || index> g_drawLayer.graphics.length)
      return;

    let gra = new this.Graphic();
    gra.geometry = geometry;
    gra.spatialReference = g_MapConfig.baseConfig.webgisSr;
    gra.symbol = this.sketchVM.polygonSymbol;
    g_drawLayer.graphics[index]=gra;
  }

  clear(){
    this.tempGraphicsLayer.removeAll();
  }
}
