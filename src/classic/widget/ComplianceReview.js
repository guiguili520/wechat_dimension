import {loadModules} from "esri-loader";
import {options} from "../../config";
/**
 * @Description: 合规性审查类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class ComplianceReview {
  constructor() {
    // this.event = new Event(this);
    loadModules(
      [
        "esri/layers/FeatureLayer",
        "esri/geometry/geometryEngine"
      ],
      options
    ).then(([FeatureLayer,geometryEngine]) => {
      this.layers=[];
      this.FeatureLayer = FeatureLayer;
      this.geometryEngine = geometryEngine;

    })

  }
  add(mapUrl){
    mapUrl.map((i,index)=>{
      this.layers.push(new this.FeatureLayer({
        url: i
      }))
    })
    g_map.layers.addMany(this.layers);
  }

  /**
   * @Description: 面积计算
   * @param: geo 计算图斑
   * @return: area 面积值
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  areaCalculation(geo){
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
    return area;
  }
}
