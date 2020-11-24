import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from '../core/Event'

/**
 * @Description: 标注
 * @author: Guixiang Tang
 * @date: 2019/3/13
 */
export default class Label {

  constructor() {
    this.event = new Event(this);
    loadModules(
      [
        "esri/tasks/IdentifyTask",
        "esri/Graphic",
        "esri/tasks/support/IdentifyParameters",
        'esri/geometry/Extent',
        "dojo/on",
        "dojo/dom"
      ],
      options
    ).then(([IdentifyTask, Graphic, IdentifyParameters,Extent, on, dom]) => {
      this.Graphic = Graphic;
      this.ExpandExtent = Extent;
    })
  }

  /**
   * @Description: 图形颜色标记和定位
   * @param: geometry 标记图形, text 标记文字
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */
  position(geometry,text) {
    let symbol
    if(geometry.type == "polygon"){ //面
       symbol = {
        type: "simple-fill",
        style: "solid",
        color: [255,215,0],
        outline: {
          color: [255,0,0],
          width: 1
        }
      };
    }else if(geometry.type == "polyline"){ //线
      symbol = {
        type: "simple-line",  // autocasts as new SimpleLineSymbol()
        color: [255,0,0],  // RGB color values as an array
        width: 1
      };
    }else if(geometry.type == "point"){ //点
      symbol = {
        type: "simple-marker",
        style: "circle",
        color: "red",
        size: "10px",
        outline: {
          color: [255, 255, 0],
          width: 1
        }
        // type: "picture-marker",  // autocasts as new SimpleFillSymbol()
        // url: require("../../assets/images/pointPosition.png"),
        // width: "18px",
        // height: "18px"
      };
    }
    let graphic = new this.Graphic({ //创建一个Graphic
      geometry: geometry,
      symbol: symbol,
    });
    g_tempLayer.graphics.add(graphic);

    this.label(geometry,text) //文字标记
  }

  /**
   * @Description: 文字标记和定位
   * @param: geometry 标记图形, text 标记文字
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */
  label(geom, text) {
    let graphic
    if(geom.type=="polygon"){ //面
      graphic = new this.Graphic({
        geometry: geom.centroid, //面的中心点
        symbol: {
          type: "text",
          color: "red",//"black",
          // haloColor: "black",
          // haloSize: "1px",
          text: text,
          xoffset: 4,
          yoffset: 4,
          font: {
            size: 14,
            family: "SimSun"
          }
        }
      });
    }else if(geom.type=="polyline"){ //线
      let labelPoint = { //标记位置为线的第一个点
        type: "point",
        x: geom.paths[0][0][0],//点的x坐标
        y: geom.paths[0][0][1],//点的y坐标
        spatialReference: geom.spatialReference
      }
      graphic = new this.Graphic({ //创建一个Graphic
        geometry: labelPoint,
        symbol: {
          type: "text",
          color:  "red",//"black",
          // haloColor: "red",
          // haloSize: "1px",
          text: text,
          xoffset: -5,
          yoffset: 10,
          font: {
            size: 14,
            family: "SimSun"
          }
        }
      });
    }else if(geom.type=="point"){ //点
      let labelPoint = {
        type: "point",
        x: geom.x, //点的x坐标
        y: geom.y,//点的y坐标
        spatialReference: geom.spatialReference
      }
      graphic = new this.Graphic({
        geometry: labelPoint,
        symbol: {
          type: "text",
          color: "red",
          // haloColor: "red",
          // haloSize: "1px",
          text: text,
          xoffset: 0,
          yoffset: -20,
          font: {
            size: 14,
            family: "SimSun"
          }
        }
      });
    }

    g_tempLayer.graphics.add(graphic);
    g_view.goTo(graphic) //定位
  }
}
