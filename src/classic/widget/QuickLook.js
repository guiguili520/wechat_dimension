import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from "../core/Event";
import jsonp from 'jsonp'

/**
 * @Description: 快速查询类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class QuickLook {
  constructor() {
    this.event = new Event(this);
    loadModules(
      ["esri/tasks/QueryTask",
        "esri/tasks/support/Query",
        "esri/geometry/SpatialReference",
        "esri/tasks/GeometryService",
        "esri/tasks/support/ProjectParameters",
        "esri/geometry/Point",
      ],
      options
    ).then(([QueryTask, Query,SpatialReference,GeometryService,ProjectParameters,Point]) => {
      this.view = g_view;
      this.QueryTask = QueryTask;
      this.Query = Query;
      this.index = 0;
      this.SpatialReference = SpatialReference;
      this.GeometryService = GeometryService;
      this.ProjectParameters = ProjectParameters;
      this.Point = Point;
    })
  }

  /**
   * @Description: where语句查询
   * @param: options 查询参数（url 查询图层,fieldName 查询字段）, searchText 查询值
   * @return: results 查询结果
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getsearchList(options, searchText) {
    var queryTask = new this.QueryTask({
      url: options.url
    });
    var query = new this.Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.where = options.fieldName + " LIKE '%" + searchText + "%' OR "+options.fieldName +" like '*"+searchText+"*'";
    queryTask.execute(query).then((results) => {
      console.log(results);
      this.event.triggerEvent('getListData', results);
    });
  }

  //百度位置查询
  getBDSearchList(bdservice,searchText,JWDSpatialreference){
    let url = bdservice+searchText;
    console.log("百度查询地址："+url);

    jsonp(url,null,(err,res)=>{
      if (err) {
        console.error(err.message);
      } else {
        if(res.message == "ok" && res.results.length >0){
          this.constructPrj(res.results,JWDSpatialreference);
        }else {
          let info = {code: -1, message: "无结果"};
          this.event.triggerEvent('getBDListData', info);
        }
      }
    });
  }

  constructPrj(result,JWDSpatialreference){
    let pointCollection = [];
    const cs1 = new this.SpatialReference({
      wkid: JWDSpatialreference
    });
    for(let i=0;i<result.length;i++){
      let item = result[i];
      let tempPoint = new this.Point({
        spatialReference: cs1,
        x: item.location.lng,
        y: item.location.lat
      });
      pointCollection.push(tempPoint);
    }
    let params = new this.ProjectParameters({
      geometries: pointCollection,
      outSpatialReference: window.g_spatialReference,
    });
    let geomSer = new this.GeometryService({
      url: g_MapConfig.baseConfig.webgisGeo + "/project"
    });
    geomSer.project(params).then(res=> {
      this.dealPrjResult(res,result);
    });
  }

  dealPrjResult(graphics,results){
    let geosArray = [];
    for (let i = 0; i < graphics.length; i++) {
      let item = results[i];
      delete item.location;
      geosArray.push({attributes: item, geometry: graphics[i]});
    }
    console.log(results);
    let info = {code:0,message:"成功",results:geosArray};
    this.event.triggerEvent('getBDListData', info);
  }
}
