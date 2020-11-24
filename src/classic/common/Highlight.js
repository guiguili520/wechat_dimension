/**
 * @Description: 此类实现点，线，面的定位且高亮
 * @author: Guixiang Tang
 * @date: 2019/3/13
 */
import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";

export default class Highlight {
  constructor() {
    this.event = new Event(this);
    loadModules([
      "esri/Graphic",
      'esri/geometry/Extent',
      'esri/geometry/Point',
      'esri/geometry/geometryEngine'
    ], options).then(([Graphic,Extent,Point,geometryEngine]) => {
      this.Graphic = Graphic;
      this.Extent = Extent;
      this.Point = Point;
      this.geometryEngine = geometryEngine;
      // this.graphic = {};
      this.symbol = {};
    })
  }

  /**
   * @Description: 几何图形（点，线，面）定位且高亮
   * @param: geometry
   * @return: graphic
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */

  geometryHighlight(geometry) {
    g_highLightLayer.removeAll() //移除高亮图层中所有的graphic
    let graphic = this.heightLight(geometry)
    this.Location(geometry,graphic)
    return graphic
  }

  /**
   * 多图形定位
   * @param geometries
   */
  mutigeometryHightlight(geometries,isRightPosition){
    g_highLightLayer.removeAll() //移除高亮图层中所有的graphic
    for(let i=0;i<geometries.length;i++) {
      this.heightLight(geometry);
    }
    let union = this.geometryEngine.union(geometries);
    let graphic = new this.Graphic({geometry:union});
    this.Location(union,graphic,isRightPosition);
  }

  geometriesHighlight(geometry,symbol,isRightPosition) {
    let graphic = this.heightLight(geometry,symbol);
    this.Location(geometry,graphic,isRightPosition);
    return graphic
  }
  heightLight(geometry,symbol,attributes){
    if(symbol!=undefined){
      this.symbol=symbol
    }else{
      if (geometry.type === "point") { //点
        this.symbol = { //定位图标标记
          type: "picture-marker",
          url: require("../../assets/images/pointPosition.png"),
          width: "20px",
          height: "20px"
        };
      } else if (geometry.type === "polygon") { //面
        this.symbol = { //高亮多边形符号
          type: "simple-fill",
          style: "none",
          outline: {
            color: "#00F5FF",
            width: 1.5
          }
        };
      } else if (geometry.type === "polyline") { //线
        this.symbol = { //线符号
          type: "simple-line",
          color: "#00F5FF",
          width: 1.5
        };
      }
    }
    let gra
    if(attributes!=undefined){
        gra = new this.Graphic({ //创建graphic
        geometry: geometry,
        symbol: this.symbol,
        attributes:attributes
      });
    }else{
        gra = new this.Graphic({ //创建graphic
        geometry: geometry,
        symbol: this.symbol,
      });
    }

    g_highLightLayer.graphics.add(gra); //将该graphic新增至高亮图层g_highLightLayer
    console.log(gra)

    return gra; //返回graphic
  }

  Location(geometry,graphic,isRightPosition) {
    let expandExtent;
    if (geometry.type == 'point') {
      let x = geometry.x;
      let y = geometry.y;
      let mySpatialReference = geometry.spatialReference;
      let changeValue = 100;
      if (geometry.x > -180 && geometry.x < 180)
        changeValue = 0.1;
      let evp = new this.Extent({
        xmin: x - changeValue,
        ymin: y - changeValue,
        xmax: x + changeValue,
        ymax: y + changeValue,
        spatialReference: mySpatialReference
      });
      expandExtent = evp.expand(5);
      g_view.extent = expandExtent;
    } else {
      expandExtent = graphic.geometry.extent.expand(5);
      g_view.extent = expandExtent;
      if (isRightPosition) {
        let centerpoint = expandExtent.center;
        let movedistance = (expandExtent.xmax - expandExtent.xmin) / 3;
        let newcenter = new this.Point({
          x: centerpoint.x - movedistance,
          y: centerpoint.y, spatialReference: centerpoint.spatialReference
        });
        g_view.center = newcenter;
      }
    }
  }

  flash(graphic,multiple){
    if(multiple==undefined)
      this.multiple=2.5
    else
      this.multiple=multiple
    let count=0;
    let polygonSymbol = {
      type: "simple-fill",
      style: "solid",
      color: [0, 0, 0, 0.2],
      outline: {
        color: "red",
        width: 2
      }
    };
    let noFillSymbol = {
      type: "simple-fill",
      style: "solid",
      color: [0, 0, 0, 0],
      outline: {
        color: "red",
        width: 2
      }
    };
    let linesymbol = { //线符号
      type: "simple-line",
      color: "red",
      width: 1.5
    };

    let type = graphic.geometry.type;
    if(type == 'polygon' && graphic.geometry.rings.length <= 0)
      return;
    if(type == 'polyline' && graphic.geometry.paths.length <= 0)
      return;

    if(type == "polygon")
      graphic.symbol = polygonSymbol;
    else if(type == "polyline")
      graphic.symbol = linesymbol;

    g_view.extent=graphic.geometry.extent.expand(this.multiple);
    let animation = g_view.watch("animation", function (response) {
      if (response && response.state === "running") {
      } else {
        g_view.scale = g_view.scale * 3
        animation.remove();
      }
    });
    let handle=setInterval(()=>{
      graphic.visible=!graphic.visible
      if(graphic.visible) {
        count++
        if (count == 3) {
          clearInterval(handle);
          graphic.symbol = type=="polygon"? noFillSymbol:linesymbol;
        }
      }
    },200)
  }

  removeSpecialGeometry(geometry,graphicslayer) {
    if (geometry == null || geometry == 'undefined')
      return;

    if(graphicslayer == 'undefined' || graphicslayer == null)
      graphicslayer = g_highLightLayer;

    let geoStr = JSON.stringify(geometry);
    let allgraphics = graphicslayer.graphics;
    let graphic = null;
    if (allgraphics != null && allgraphics.length > 0) {
      for (let i = 0; i < allgraphics.length; i++) {
        let geo = allgraphics.items[i].geometry;
        let mygeo = null;
        if(geo.type == "polygon")
          mygeo = geo.rings;
        else if(geo.type == "poline")
          mygeo=geo.paths;
        else if(geo.type == "point")
          mygeo = geo.x +","+geo.y;
        let currentGeo = JSON.stringify(mygeo);
        if (currentGeo == geoStr) {
          graphic = allgraphics.items[i];
          break;
        }
      }
    }
    if (graphic != null) {
      graphicslayer.remove(graphic);
    }
  }

  /**
   * @Description: 几何图形（点，线，面）集合高亮且定位
   * @param: geometries
   * @return: graphics
   */
  geometriesFixedPosition(geometries) {
    let graphics=[];
    if (geometries != null && geometries != undefined && geometries.length > 0) {
      let mySpatialReference = geometries[0].spatialReference;
      let minx = null;
      let miny = null;
      let maxx = null;
      let maxy = null;
      for (let i = 0; i < geometries.length; i++) {
        let geometry=geometries[i];
        if (geometry.type === 'point') {
          if (minx == null || minx > geometry.x)
            minx = geometry.x;
          if (miny == null || miny > geometry.y)
            miny = geometry.y;
          if (maxx == null || maxx < geometry.x)
            maxx = geometry.x;
          if (maxy == null || maxy < geometry.y)
            maxy = geometry.y;
        }
        else{
          if (minx == null || minx > geometry.extent.xmin)
            minx = geometry.extent.xmin;
          if (miny == null || miny >  geometry.extent.ymin)
            miny = geometry.extent.ymin;
          if (maxx == null || maxx <  geometry.extent.xmax)
            maxx = geometry.extent.xmax;
          if (maxy == null || maxy <  geometry.extent.ymax)
            maxy = geometry.extent.ymax;
        }
        let graphic = this.heightLight(geometry);
        graphics.push(graphic);
      }
      if (minx != null && miny != null && maxx != null && maxy != null) {
        loadModules([
          'esri/geometry/Extent'
        ], options).then(([Extent]) => {
            let changeValue = 100;
            if (minx > -180 && minx < 180)
              changeValue = 0.1;
            let evp = new Extent({
              xmin: minx - changeValue,
              ymin: miny - changeValue,
              xmax: maxx + changeValue,
              ymax: maxy + changeValue,
              spatialReference: mySpatialReference
            });
            g_view.extent = evp.expand(2);
          }
        );
      }
    }
    return graphics
  }

}

