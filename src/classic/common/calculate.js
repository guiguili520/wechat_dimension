import {loadModules} from "esri-loader";
import {options} from "../../config";
/**
 * @Description: 计算面积和长度
 */
export default class Calculate {
  constructor() {
    loadModules(
      [
        "esri/geometry/geometryEngine",
        "esri/Graphic"
      ],
      options
    ).then(([ geometryEngine, Graphic]) => {
      this.geometryEngine = geometryEngine
      this.Graphic = Graphic
    })
  }

//计算长度
  computeLength(geo) {
    let length;
    let geoSR = geo.spatialReference;
    if (geoSR.isGeographic == true) {
      length = this.geometryEngine.geodesicLength(geo, "meters");
    } else {
      length = this.geometryEngine.planarLength(geo, "meters");
    }

    if (length < 0) {
      let simplifiedPolyline = this.geometryEngine.simplify(geo);
      if (simplifiedPolyline) {
        if (geoSR.isGeographic == true) {
          length = this.geometryEngine.geodesicLength(geo, "meters");
        } else {
          length = this.geometryEngine.planarLength(geo, "meters");
        }
      }
    }
    return length
    // this.labelLength(geo, length);
  }
  //计算面积
  computeArea(geo){
    let area;
    let geoSR = geo.spatialReference;
    if (geoSR.isGeographic == true) {
      area = this.geometryEngine.geodesicArea(geo, "square-meters");
    } else {
      area = this.geometryEngine.planarArea(geo, "square-meters");
    }
    if (area < 0) {
      let simplifiedPolygon = this.geometryEngine.simplify(geo);
      if (simplifiedPolygon) {
        if (geoSR.isGeographic == true) {
          area = this.geometryEngine.geodesicArea(simplifiedPolygon, "square-meters");
        } else {
          area = this.geometryEngine.planarArea(simplifiedPolygon, "square-meters");
        }
      }
    }
    return area
    // this.labelAreas(geo, area);
  }

  labelLength(geom, length) {

    if (geom.paths[0][1]) {
      let labelPoint = {
        type: "point",
        x: (geom.paths[0][0][0] + geom.paths[0][1][0]) / 2,
        y: (geom.paths[0][0][1] + geom.paths[0][1][1]) / 2,
        spatialReference: geom.spatialReference
      }
      let graphic = new this.Graphic({
        geometry: labelPoint,
        symbol: {
          type: "text",
          color: "black",
          haloColor: "black",
          haloSize: "1px",
          text: length.toFixed(2) + "米",
          xoffset: 3,
          yoffset: 3,
          font: {
            size: 14,
            family: "simsun",//"sans-serif"
          }
        }
      });
      g_drawLayer.add(graphic);
      // g_view.graphics.add(graphic);
    }
  }
  labelAreas(geom, area) {
    var graphic = new this.Graphic({
      geometry: geom.centroid,
      symbol: {
        type: "text",
        color: "black",
        haloColor: "black",
        haloSize: "1px",
        text: area.toFixed(2) + "平方米",
        xoffset: 3,
        yoffset: 3,
        font: { // autocast as Font
          size: 14,
          family: "simsun",//"sans-serif"
        }
      }
    });
    // g_view.graphics.add(graphic);
    g_drawLayer.add(graphic);
  }
  measureLength() {
    var geometryEngine = this.geometryEngine;
  }

  isSelfIntersecting(polyline) {
    if (polyline.paths[0].length < 3) {
      return false
    }
    var line = polyline.clone();

    //get the last segment from the polyline that is being drawn
    var lastSegment = getLastSegment(polyline);
    line.removePoint(0, line.paths[0].length - 1);

    // returns true if the line intersects itself, false otherwise
    return geometryEngine.crosses(lastSegment, line);
  }

  getIntersectingFeature(polyline) {
    if (isSelfIntersecting(polyline)) {
      return new Graphic({
        geometry: getLastSegment(polyline),
        symbol: {
          type: "simple-line", // autocasts as new SimpleLineSymbol
          style: "short-dot",
          width: 3.5,
          color: "yellow"
        }
      });
    }
    return null;
  }

  getLastSegment(polyline) {
    var line = polyline.clone();
    var lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
    var existingLineFinalPoint = line.getPoint(0, line.paths[0].length -
      1);

    return new Polyline({
      spatialReference: view.spatialReference,
      hasZ: false,
      paths: [
        [
          [existingLineFinalPoint.x, existingLineFinalPoint.y],
          [lastXYPoint.x, lastXYPoint.y]
        ]
      ]
    });
  }

  measureArea() {
    var draw = this.draw;
    var Draw = this.Draw;
    var Map = this.Map;
    var MapView = this.MapView;
    var Graphic = this.Graphic;
    var Polygon = this.Polygon;
    var geometryEngine = this.geometryEngine;
    var view = this.view;
    // view.graphics.removeAll();
    g_drawLayer.removeAll();
    enableCreatePolygon(draw, view);

    function enableCreatePolygon(draw, view) {
      // create() will return a reference to an instance of PolygonDrawAction
      var action = draw.create("polygon");

      // focus the view to activate keyboard shortcuts for drawing polygons
      view.focus();

      // listen to vertex-add event on the action
      action.on("vertex-add", drawPolygon);

      // listen to cursor-update event on the action
      action.on("cursor-update", drawPolygon);

      // listen to vertex-remove event on the action
      action.on("vertex-remove", drawPolygon);

      // *******************************************
      // listen to draw-complete event on the action
      // *******************************************
      action.on("draw-complete", drawPolygon);
    }

    // this function is called from the polygon draw action events
    // to provide a visual feedback to users as they are drawing a polygon
    function drawPolygon(evt) {
      var vertices = evt.vertices;

      //remove existing graphic
      // view.graphics.removeAll();
      g_drawLayer.removeAll();
      // create a new polygon
      var polygon = createPolygon(vertices);

      // create a new graphic representing the polygon, add it to the view
      var graphic = createGraphic(polygon);
      // view.graphics.add(graphic);
      g_drawLayer.add(graphic);

    }

    // create a polygon using the provided vertices
    function createPolygon(vertices) {
      return new Polygon({
        rings: vertices,
        spatialReference: view.spatialReference
      });
    }

    // create a new graphic representing the polygon that is being drawn on the view
    function createGraphic(polygon) {
      var graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill", // autocasts as SimpleFillSymbol
          color: [178, 102, 234, 0.8],
          style: "solid",
          outline: { // autocasts as SimpleLineSymbol
            color: [255, 255, 255],
            width: 2
          }
        }
      });
      return graphic;
    }
  }

  clipGeometriesFun(orginalGeometrys,clipGeometrys){
    if(orginalGeometrys != null && clipGeometrys != null && clipGeometrys.length>0) {
      let unionGeos = this.geometryEngine.union(clipGeometrys);
      let differencesResult = this.geometryEngine.difference(orginalGeometrys, unionGeos);
      return differencesResult;
    }
  }
}
