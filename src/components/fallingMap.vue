<template>
    <div>
      <span id="to_top" v-show="isShowPointerText">点击地图开始绘制</span> <!-- 鼠标跟随提醒 -->

      <!--  压占模态框 -->
      <sg-modal transfer draggable modal-type="confirm" title="提示" v-model="isShowYZModel" @on-ok="doContinueAdd">
        <div style="width: 360px;text-align: center;">
          <span style="color:red;font-weight: bold;font-size: larger">要落图的地块压占检查图层相关图形,是否忽略继续落图？</span>
        </div>
      </sg-modal>

      <!--  压占模态框 -->
      <sg-modal transfer draggable modal-type="alert" title="提示" ok-text="确 定" v-model="isShowLTYZModel" @on-ok="analyseQueryResult" :closable="false" :width="300" style="z-index: 9999">
        <div style="width: 360px;text-align: center;">
          <span style="color:red;font-weight: bold;font-size: larger">要落图的地块压占落图图层相关图形,请选择后续操作：</span>
            <select style="width: 200px;height: 30px;margin-top: 10px" id="optSelect">
              <option value="0" selected>忽略压占情况，继续落图</option>
              <option value="1">删除压占图形，重新落图</option>
              <option value="2">更新图形（包括属性、图形）</option>
              <option value="3">中止落图</option>
            </select>
        </div>
      </sg-modal>

      <!--  属性检测模态框 -->
      <sg-modal transfer draggable modal-type="alert" title="提示" ok-text="确 定" v-model="isShowGJZModel" @on-ok="cfFieldQueryResult" :closable="false" :width="300" style="z-index: 9999">
        <div style="width: 360px;text-align: center;">
          <span style="color:red;font-weight: bold;font-size: larger">图层已经存在相同关键字的图形,请选择后续操作：</span>
          <select style="width: 200px;height: 30px;margin-top: 10px" id="optFieldSelect">
            <option value="0" selected>忽略存在情况，继续落图</option>
            <option value="1">删除存在关键字图形，重新落图</option>
            <option value="2">更新图形（属性）</option>
            <option value="3">中止落图</option>
          </select>
        </div>
      </sg-modal>

      <!-- 绘制的图形JSON串展示 -->
      <s-respane v-show="isDrawedGeometryShow" name="获取坐标" @pane-close="closeWin" :w="360" :h="600" :x="200" :y="60" :exportReport="true" style="height:350px;width:300px;z-index: 201">
        <table style="width:100%;">
          <tr><td>
            <textarea rows="5" cols="20" class="labelValueControlStyle"
              style="border:1px solid gray;height: 200px;margin-top: 5px;width:100%" v-model="currentDrawedContent"></textarea>
          </td></tr>
          <tr><td style="text-align: center;padding-top:10px;">
            <sg-button  type="primary" size="small" style="margin-right:15px;width:70px;margin-top: 20px;padding: 10px" @click="confirmDrawedGeometry">确 定</sg-button>
            <sg-button  type="success" size="small" style="margin-right:15px;width:70px;margin-top: 20px;padding: 10px;" @click="reDrawEvent">重新绘制</sg-button>
            <sg-button  type="info" size="small" style="width:70px;margin-top: 20px;padding: 10px;" @click="closeWin">取 消</sg-button>
          </td></tr>
        </table>
      </s-respane>
    </div>
</template>

<script>
  import bus from '@/assets/eventBus'
  import {loadModules} from "esri-loader";
  import {options} from "@/config";
  import {GET_POSITION,GET_coordinatelocate,GET_Map,GET_synthesis} from '../config/api'
  import SRespane from '@/components/common/resultPanel'

  export default {
    name: "fallingMap",
    components: {SRespane},
    data() {
      return {
        url: '',
        geometrys: [], //所有的图形
        symbol: '',
        FeatureLayer: {},
        Graphic: {},
        wkt: '',
        wkit: null,
        SpatialReference: null,
        GeometryService: null,
        ProjectParameters: null,
        Point: null,
        Polyline: null,
        Polygon: null,
        isDrawedGeometryShow:false,
        isShowPointerText:false,
        currentDrawedContent:"",
        drawType:"polygon",
        totalCount:0,
        executedCount:0,
        currentRes:null,
        isShowYZModel:false, //压占的模态框
        isShowLTYZModel:false, //落图图层压占
        isShowGJZModel:false,//关键字存在情况
        currentFeaturelayer:null,//当前落图的图层
        featurelayerQueryResult:null,//落图图层查询结果
        fieldQueryResult:null, //关键字查询结果
        totalUnionGeo:null, //合并的图形
      }
    },
    methods: {
      createMap() {
        let _this = this;
        loadModules(
          [
            "esri/Graphic",
            "esri/layers/FeatureLayer",
            "esri/tasks/QueryTask",
            "esri/tasks/support/Query",
            "esri/geometry/SpatialReference",
            "esri/tasks/GeometryService",
            "esri/tasks/support/ProjectParameters",
            "esri/geometry/Point",
            "esri/geometry/Polygon",
            "esri/geometry/Polyline",
            "esri/widgets/Sketch/SketchViewModel",
            "esri/geometry/geometryEngine"
          ],
          options
        ).then(([Graphic, FeatureLayer, QueryTask, Query, SpatialReference, GeometryService, ProjectParameters, Point, Polygon, Polyline,SketchViewModel,geometryEngine]) => {
          _this.QueryTask = QueryTask;
          _this.Query = Query;
          _this.Graphic = Graphic;
          _this.FeatureLayer = FeatureLayer;
          _this.SpatialReference = SpatialReference;
          _this.GeometryService = GeometryService;
          _this.ProjectParameters = ProjectParameters;
          _this.Point = Point;
          _this.Polygon = Polygon;
          _this.Polyline = Polyline;
          _this.SketchViewModel = SketchViewModel;
          _this.geometryEngine = geometryEngine;

          g_view.when(() => {
            _this.wkt = g_map.layers.items[0].spatialReference.wkt; //获取图层服务wkt
            _this.wkid = g_map.layers.items[0].spatialReference.wkid; //获取图层服务wkt
            let nowUrl = location.href, apiArr = [GET_coordinatelocate, GET_POSITION, GET_Map, GET_synthesis];  //对应mode 0 坐标串预览 1 图形定位 2 落图  3综合预览  4 交互获取坐标
            let params = this.parseQueryString(nowUrl);
            if(JSON.stringify(params) == "{}"){
              console.log(nowUrl,'当前URL路径');
              this.$msg.warning('URL参数缺失，落图或者预览无参数，操作终止！');
              return;
            }
            let mode = params.mode;
            if(mode <=4) { //定位、落图
              _this.dealLocateAddOpt(apiArr,params);
            }else{ //进行绘制图形
              _this.drawGraphicForOutside(params.geometryType);
            }
          })
        });
      },

      //为外部绘制坐标,geometryType 0面，1线，2点
      drawGraphicForOutside(geometryType){
        this.isShowPointerText = true;
        let _this = this;
        if (geometryType == undefined || geometryType == null)
          geometryType = "0";
        this.sketchView = new this.SketchViewModel({
          view: g_view,
          layer:g_tempLayer,
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
        let type = "polygon";
        if(geometryType == "1")
          type = "polyline";
        else if(geometryType == "2")
          type = "point";

        this.drawType = type;
        this.sketchView.create(type,{mode: "click"});
        this.sketchView.on("create", function(event) {
          if (event.state === "complete") {
            let geo = event.graphic.geometry;
            let result = geo.toJSON();
            _this.currentDrawedContent = JSON.stringify(result);
            _this.isDrawedGeometryShow = true;
            _this.isShowPointerText = false;
            document.onmousemove = null;
          }
        });
        this.followEvent();
      },

      followEvent(){
        this.isShowPointerText = true;
        let oTop = document.getElementById("to_top");
        document.onmousemove = null;
        document.onmousemove = function(evt) {
          let oEvent = evt || window.event;
          let scrollleft = document.documentElement.scrollLeft || document.body.scrollLeft;
          let scrolltop = document.documentElement.scrollTop || document.body.scrollTop;
          oTop.style.left = oEvent.clientX + scrollleft + 10 + "px";
          oTop.style.top = oEvent.clientY + scrolltop + 10 + "px";
        }
      },

      confirmDrawedGeometry(){
        debugger;
        if(window.parent.returnBackGeometry)
          window.parent.returnBackGeometry(this.currentDrawedContent);
        else if(window.parent.parent.returnBackGeometry)
          window.parent.parent.returnBackGeometry(this.currentDrawedContent);
        else if(window.returnBackGeometry)
          window.returnBackGeometry(this.currentDrawedContent);
        else
          alert("找不到回调的方法！");
      },

      //定位、落图的处理
      dealLocateAddOpt(apiArr,params){
        let mode = params.mode;
        let _this = this;
        let modeIndex = params.mode;
        if(modeIndex == 4)
          modeIndex = 1;
        let url = apiArr[modeIndex];

        let obj = Object.assign({}, params);
        delete (obj.mode);
        let ajaxUrl = url + "?" + _this.stringfyQueryString(obj); //重组请求地址
        console.log('重组请求地址+' + ajaxUrl)
        if (url != undefined) {
          this.$fetch(url, obj).then(res => {
            if(res.code == "-1"){
              console.log(res,'请求参数操作')
              this.$SgMessage.error('请求参数操作出现异常：'+res.exceptionMsg);
              return;
            }
            if (mode == 0) {
              _this.viewPoint(res) //坐标串预览
            } else if (mode == 1 || mode == 4) {
              _this.viewPosition(res) //图形定位
            } else if (mode == 2) {
              _this.dropMap(res) //落图
            } else if (mode == 3) {
              console.log(res, '综合预览')
              if (res.locateCoordinate) {
                _this.viewPoint(res) //坐标串预览
              } else {
                _this.viewPosition(res) //图形定位
              }
            }
          })
        }
      },

      reDrawEvent() {
        g_tempLayer.removeAll();
        this.followEvent();
        this.currentDrawedContent = "";
        if (this.sketchView == undefined || this.sketchView == null)
          return;
        this.sketchView.create(this.drawType, {mode: "click"});
      },

      stringify(obj) {
        let nObj = {};
        for (let i in obj) {
          if (typeof (obj[i]) == 'object') {
            nObj[i] = JSON.stringify(obj[i])
          } else {
            nObj[i] = obj[i]
          }
        }
        return nObj;
      },

      parseQueryString(url) {
        url = (url == null || url == undefined) ? window.location.href : url;
        let qIndex = url.lastIndexOf('?');
        if(qIndex != -1) {
          let search = url.substring(url.lastIndexOf('?') + 1)
          if (!search) {
            return {}
          }
          return JSON.parse('{"' + (search).replace(/"/g, '').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
        }else
          return {};
      },

      stringfyQueryString(obj) {
        if (!obj) return '';
        let pairs = [];

        for (let key in obj) {
          let value = obj[key];
          if (value instanceof Array) {
            for (let i = 0; i < value.length; ++i) {
              pairs.push((key + '[' + i + ']') + '=' + (value[i]));
            }
            continue;
          }
          pairs.push((key) + '=' + (obj[key]));
        }
        return pairs.join('&');
      },

      viewPoint(res) {
        console.log('坐标串预览')
        let _this = this;
        g_tempLayer.removeAll();
        res.locateCoordinate.map(i => {
          let type = i.type;
          let geo;
          if (res.projectInfo && (res.projectInfo.isNeed == true || res.projectInfo.isNeed == "true")) {
            console.log(res.projectInfo.spatialReference,'坐标串预览投影坐标系');

            let wkid, wkt;
            if (typeof (res.projectInfo.spatialReference) == 'string') {
              wkt = res.projectInfo.spatialReference
            } else {
              wkid = res.projectInfo.spatialReference
            }
            _this.conversion([i], type, wkid, wkt).then(response => {
              _this.createGeo(type, response)
            });
          } else {
            geo = i
            this.createGeo(type, [geo])
          }
        })
      },

      viewPosition(res) {
        let _this = this;
        console.log(res,'图形条件定位')
        g_tempLayer.removeAll();

        let relatedInfos = res.conditionLocate.relatedLocatorInfos;
        if(relatedInfos == null || relatedInfos == undefined || relatedInfos.length <=0){
          this.$SgMessage.error('查询定位条件');
          return;
        }

        this.totalCount = relatedInfos.length;
        this.executedCount = 0;
        for(let i=0;i < relatedInfos.length;i++){
          let currentInfo = relatedInfos[i];
          let queryTask = new this.QueryTask({
            url: currentInfo.layerRestUrl
          });
          let query = new this.Query();
          query.returnGeometry = true;
          query.where = currentInfo.whereCondition;
          queryTask.execute(query).then((results) => {
            this.executedCount ++;
            console.log(results,'查询定位返回值')
            if (results.features.length == 0) {
              if (_this.executedCount == _this.totalCount)
                _this.$SgMessage.error('未找到关联图形，无法定位预览');
              return;
            }
            let type = results.geometryType;
            for (let i = 0; i < results.features.length; i++) {
              let geo = results.features[i].geometry;
              this.createGeo(type, [geo])
            }
          });
        }
      },

      //创建图形
      createGeo(type, graphics) {
        this.geometrys =[];
        let spatialReference = {
          wkt: this.wkt,
          wkid: this.wkid
        };
        if (type === "point") {
          for (let i = 0; i < graphics.length; i++) {
            this.geometrys.push({
              "type": "point",
              "spatialReference": spatialReference,
              "x": graphics[i].x,
              "y": graphics[i].y
            });
          }
          this.symbol = {
            type: 'simple-marker',
            style: 'square',
            color: '#8A2BE2',
            size: '16px',
            outline: {
              color: [255, 255, 255],
              width: 3
            }
          }
        } else if (type === "polyline") {
          for (let i = 0; i < graphics.length; i++) {
            this.geometrys.push({
              "type": "polyline",
              "spatialReference": spatialReference,
              "paths": graphics[i].paths
            });
          }
          this.symbol = {
            type: 'simple-line',
            color: '#8A2BE2',
            width: '4',
            style: 'dash'
          }
        } else if (type === "polygon") {
          for (let i = 0; i < graphics.length; i++) {
            this.geometrys.push({
              "type": "polygon",
              "spatialReference": spatialReference,
              "rings": graphics[i].rings
            });
          }
          this.symbol = {
            type: 'simple-fill',
            color: 'rgba(138,43,226, 0.8)',
            style: 'solid',
            outline: {
              color: 'white',
              width: 1
            }
          }
        }
        let manyGraphics = [];
        for (let k = 0; k < this.geometrys.length; k++) {
          let graphic = new this.Graphic({
            geometry: this.geometrys[k],
            symbol: this.symbol,
          });
          g_tempLayer.graphics.add(graphic);
          manyGraphics.push(graphic);
        }
        g_view.goTo(manyGraphics,{
          duration: 2000
        });
        g_view.zoom = 20
      },

      //落图操作
      dropMap(res) {
        this.currentRes = res;
        console.log(res, '落图参数');
        g_tempLayer.removeAll();
        if (!res.addGraphics || res.addGraphics.length <= 0) {
          this.$SgMessage.error('落图的图形数量为0，操作中止！')
          return;
        }
        let type = res.addGraphics[0].geometry.type;
        if (res.projectInfo && (res.projectInfo.isNeed == true || res.projectInfo.isNeed == "true")) {
          this.doNeedProject(res);
        } else {
          let tempGeos = [];
          for (let i = 0; i < res.addGraphics.length; i++) {
            tempGeos.push(res.addGraphics[i].geometry);
          }
          this.createGeo(type, tempGeos)
          this.doCheck(res);
        }
      },

      //投影转换
      doNeedProject(res){
        let type = res.addGraphics[0].geometry.type;
        let _this = this;
        if (res.projectInfo && (res.projectInfo.isNeed == true || res.projectInfo.isNeed == "true")) {
          let wkid, wkt;
          if (typeof (res.projectInfo.spatialReference) == 'string') {
            wkt = res.projectInfo.spatialReference
          } else {
            wkid = res.projectInfo.spatialReference
          }
          let tempGeos = [];
          for (let i=0;i<res.addGraphics.length;i++){
            tempGeos.push(res.addGraphics[i].geometry);
          }
          this.conversion(tempGeos, type, wkid, wkt).then(response => {
            _this.createGeo(type, response);
            _this.doCheck(res);
          });
        }
      },

      //合并所有的图形
      unionAllGeometrys(){
        let unonGeo = null;
        if (this.geometrys.length > 1) {
          unonGeo = this.geometryEngine.union(this.geometrys);
        } else {
          unonGeo = this.geometrys[0];
        }
        unonGeo = this.geometryEngine.simplify(unonGeo);
        this.totalUnionGeo = unonGeo;
      },

      //压占检查图层情况
      doCheck(res) {
        this.unionAllGeometrys();//合并图形
        let _this = this;
        if (res.overlayerLayers != null && res.overlayerLayers.length > 0) {
          let queryTask = new this.QueryTask({
            url: res.overlayerLayers[0].restUrl
          });
          let unionGeo = this.totalUnionGeo; //使用合并之后的图形进行查询是否有压占检查图层
          let query = new this.Query();
          query.spatialRelationship = "intersects";
          query.geometry = unionGeo;
          query.returnGeometry = true;
          query.where = "1=1";
          queryTask.execute(query).then((results) => {
            console.log('落图信息：' + results)
            if (results.features.length > 0) {
              console.log(results, "压占相关图形!");
              _this.isShowYZModel = true;  //增加条件判断，是忽略压占情况，或者中止
            } else {
              _this.doAddOpt(res);
            }
          }).catch(err => {
            _this.$SgMessage.error('检查压占过程出现异常：'+err.message);
            console.log(err,'检查压占过程出现异常')
          });
        } else {
          this.doAddOpt(res);
        }
      },

      //忽略压占，继续落图
      doContinueAdd(){
        this.isShowYZModel = false;
        this.doAddOpt(this.currentRes);
      },

      //执行落图操作
      doAddOpt(res) {
        let url = res.addLayer.restUrl;
        let f0 = new this.FeatureLayer({
          url: url
        });
        this.currentFeaturelayer = f0;
        let checkFields = res.checkFields; //关键字段的检查
        if (checkFields) {
          this.checkFieldInfo(res, f0);
        } else {
          this.checkAddLayer(res, f0);
        }
      },

      //落图图层检查
      checkAddLayer(res,f0){
        let _this = this;
        let queryParams = f0.createQuery();
        queryParams.geometry = this.totalUnionGeo;
        f0.where = "1=1";
        f0.queryFeatures(queryParams).then(results => {
          console.log(results, '落图图层查询情况');
          let searchResult = results.features;
          if (searchResult != null && searchResult.length > 0) {  //有压占，进行拆分，哪些是更新，哪些是增加
            _this.featurelayerQueryResult = searchResult;
            _this.isShowLTYZModel = true;
          } else {
            _this.directAddMap(f0, res); //直接全部落图
          }
        }, function (res) {
          this.$msg.error(res);
          console.log(res, '落图查询失败');
        });
      },

      //关键字段查询
      checkFieldInfo(res,featurelayer) {
        let checkFields = res.checkFields;
        if (checkFields) {
          let splitFields = checkFields.split(',');
          let attr = res.addGraphics[0].attribute;
          let sWhere = "1=1";
          for (let i = 0; i < splitFields.length; i++) {
            let field = splitFields[i];
            if (field && attr.hasOwnProperty(field)) {
              sWhere += " and " + field + "='" + attr[field] + "'";
            }
          }
          let _this = this;
          if (sWhere != "1=1") {
            let queryParams = featurelayer.createQuery();
            queryParams.where = sWhere;
            featurelayer.queryFeatures(queryParams).then(results => {
              console.log(results, '落图图层查询情况');
              let searchResult = results.features;
              if (searchResult != null && searchResult.length > 0) {  //有压占，进行拆分，哪些是更新，哪些是增加
                _this.isShowGJZModel = true; //弹出提示属性存在情况
                _this.fieldQueryResult = searchResult;
              } else {
                _this.checkAddLayer(res, featurelayer); //直接全部落图
              }
            }, function (res) {
              this.$msg.error(res);
              console.log(res, '落图查询失败');
            });
          } else {
            this.checkAddLayer(res, featurelayer);
          }
        }
      },

      //拆分属性字段查询结果
      cfFieldQueryResult(){
        let featurelayer = this.currentFeaturelayer;
        let searchResult = this.fieldQueryResult;
        let res = this.currentRes;
        let selOpt = document.getElementById("optFieldSelect");
        let selIndex = selOpt.selectedIndex;
        let sValue = selOpt.options[selIndex].value;
        console.log(sValue, '属性查询落图选择的操作行为')

        if (sValue == "0") {
          this.directAddMap(featurelayer, res);
        } else if (sValue == "1") {
          this.deleteSameIdToAdd(featurelayer, res, searchResult);
        } else if (sValue == "2") {
          this.updateFieldInfo(featurelayer, res, searchResult);
        } else if (sValue == "3") {
          this.$SgMessage.success('落图操作取消！');
        }
        this.isShowGJZModel = false;
      },

      //拆分压占情况
      analyseQueryResult() {
        let featurelayer = this.currentFeaturelayer;
        let searchResult = this.featurelayerQueryResult;
        let res = this.currentRes;

        let selOpt = document.getElementById("optSelect");
        let selIndex = selOpt.selectedIndex;
        let sValue = selOpt.options[selIndex].value;
        console.log(sValue, '落图选择的操作行为')

        if (sValue == "0") {
          this.directAddMap(featurelayer, res);
        } else if (sValue == "1") {
          this.deleteYZToAdd(featurelayer, res, searchResult, this.totalUnionGeo)
        } else if (sValue == "2") {
          this.updateYZInfo(featurelayer, res, searchResult);
        } else if (sValue == "3") {
          this.$SgMessage.success('落图操作取消！');
        }
        this.isShowLTYZModel = false;
      },

      //直接落图
      directAddMap(f0,res){
        let addFeatures = [];
        addFeatures.push(new this.Graphic({
          geometry: this.totalUnionGeo,
          attributes: res.addGraphics[0].attribute
        }));
        // for (let i = 0; i < this.geometrys.length; i++) {
        //   addFeatures.push(new this.Graphic({
        //     geometry: this.geometrys[i],
        //     attributes: res.addGraphics[i].attribute
        //   }));
        // }
        let optParam = {addFeatures: addFeatures};
        this.optFeaturesAction(f0, optParam);
      },

      //根据关键字属性删除
      deleteSameIdToAdd(featurelayer,res,searchResult){
        let toDeletes = [];
        let addFeatures = [];
        addFeatures.push(new this.Graphic({
          geometry: this.totalUnionGeo,
          attributes: res.addGraphics[0].attribute
        }));
        // for (let i = 0; i < this.geometrys.length; i++) {
        //   addFeatures.push(new this.Graphic({
        //     geometry: this.geometrys[i],
        //     attributes: res.addGraphics[i].attribute
        //   }));
        // }
        for (let i = 0; i < searchResult.length; i++) {
          toDeletes.push(searchResult[i]);
        }
        let optParam = {addFeatures: addFeatures, deleteFeatures: toDeletes};
        this.optFeaturesAction(featurelayer, optParam);
      },

      //删除压占，再落图
      deleteYZToAdd(featurelayer,res,searchResult,unionGeo) {
        let toDeletes = [];
        let addFeatures = [];
        for (let i = 0; i < searchResult.length; i++) {
          let geo = searchResult[i].geometry;
          let intersectResult = this.geometryEngine.intersect(geo, unionGeo);
          if (intersectResult != null && intersectResult != undefined) {
            console.log(intersectResult);
            if((intersectResult.rings != undefined && intersectResult.rings.length > 0) ||
              (intersectResult.paths != undefined && intersectResult.paths.length >0))
              toDeletes.push(searchResult[i]);
          }
        }

        addFeatures.push(new this.Graphic({
          geometry: this.totalUnionGeo,
          attributes: res.addGraphics[0].attribute
        }));

        // for (let i = 0; i < this.geometrys.length; i++) {
        //   addFeatures.push(new this.Graphic({
        //     geometry: this.geometrys[i],
        //     attributes: res.addGraphics[i].attribute
        //   }));
        // }
        let optParam = {addFeatures: addFeatures, deleteFeatures: toDeletes};
        this.optFeaturesAction(featurelayer, optParam);
      },

      //更新属性字段
      updateFieldInfo(featurelayer,res,searchResult) {
        let updateFeatures = [];
        let newAttr = res.addGraphics[0].attribute;
        for (let i = 0; i < searchResult.length; i++) {
          let gra = searchResult[i];
          let attr = gra.attributes;
          for (let item in attr) {
            if (newAttr.hasOwnProperty(item))
              this.$set(attr, item, newAttr[item]);
          }
          updateFeatures.push({
            geometry: gra.geometry,
            attributes: attr
          });
        }
        let optParam = {updateFeatures: updateFeatures};
        this.optFeaturesAction(featurelayer, optParam);
      },

      //更新图形
      updateYZInfo(featurelayer,res,searchResult) {
        let oid = featurelayer.objectIdField;
        if (oid == "" || oid == undefined || oid == null)
          oid = "OBJECTID";
        let updateFeatures = [];
        let addFeatures = [];
        let yzUnionGeo = null;
        let checkRs = false;

        if (searchResult.length > 1) {
          let yzGeoArray = [];
          for (let i = 0; i < searchResult.length; i++) {
            yzGeoArray.push(searchResult[i].geometry);
          }
          yzUnionGeo = this.geometryEngine.union(yzGeoArray);
        } else {
          yzUnionGeo = searchResult[0].geometry;
        }

        checkRs = this.geometryEngine.equals(this.totalUnionGeo, yzUnionGeo);
        if (!checkRs)
          checkRs = this.geometryEngine.overlaps(this.totalUnionGeo, yzUnionGeo);
        if (!checkRs)
          checkRs = this.geometryEngine.contains(this.totalUnionGeo, yzUnionGeo);
        if (checkRs) {
          updateFeatures.push({
            geometry: this.totalUnionGeo,
            attributes: this.resetAttributes(res.addGraphics[0].attribute, searchResult[0], oid)
          });
        } else {
          addFeatures.push({
            geometry: this.totalUnionGeo,
            attributes: res.addGraphics[0].attribute
          });
        }
        // for (let k = 0; k < this.geometrys.length; k++) {
        //   let checkRs = false;
        //   let originalGeo = this.geometrys[k];
        //   for (let i = 0; i < searchResult.length; i++) {
        //     let geo = searchResult[i].geometry;
        //     checkRs = this.geometryEngine.equals(originalGeo,geo);
        //     if(!checkRs)
        //       checkRs = this.geometryEngine.overlaps(originalGeo, geo);
        //     if(!checkRs)
        //       checkRs = this.geometryEngine.contains(originalGeo,geo);
        //     if (checkRs) {
        //       updateFeatures.push({
        //         geometry: originalGeo,
        //         attributes: this.resetAttributes(res.addGraphics[k].attribute, searchResult[i],oid)
        //       });
        //       break;
        //     }
        //   }
        //   if (!checkRs) {
        //     addFeatures.push({
        //       geometry: originalGeo,
        //       attributes: res.addGraphics[k].attribute
        //     });
        //   }
        // }
        let optFeatures = {};
        if (addFeatures.length > 0) {
          this.$set(optFeatures, "addFeatures", addFeatures);
        }
        if (updateFeatures.length > 0) {
          this.$set(optFeatures, "updateFeatures", updateFeatures);
        }
        this.optFeaturesAction(featurelayer, optFeatures);
      },

      //设置属性值
      resetAttributes(attributes,queryGraphic,oid) {
        let attr = attributes;
        this.$set(attr, oid, queryGraphic.attributes[oid]);
        return attr;
      },

      //落图操作
      optFeaturesAction(featurelayer,optParams) {
        featurelayer.applyEdits(optParams).then(response => {
          console.log(response, '落图返回结果');
          if (response.hasOwnProperty("addFeatureResults") && response.addFeatureResults.length >0) {
            let addResult = response.addFeatureResults[0];
            if (addResult.hasOwnProperty("error") && addResult.error != null) {
              this.$SgMessage.success('落图失败：' + addResult.error.message);
            } else {
              this.$SgMessage.success('落图成功')
            }
          } else if (response.hasOwnProperty("updateFeatureResults") && response.updateFeatureResults.length >0) {
            let addResult = response.updateFeatureResults[0];
            if (addResult.hasOwnProperty("error") && addResult.error != null) {
              this.$SgMessage.success('落图失败：' + addResult.error.message);
            } else {
              this.$SgMessage.success('落图成功')
            }
          }
        },function (rs) {
          this.$SgMessage.success('落图过程发生错误！');
          console.log(rs,'落图结果');
        });
      },

      //坐标转换
      conversion(graphics, type, wkid, wkt) {
        let importPosition = [];
        console.log('地图【'+this.wkt+','+this.wkid+'】，坐标【'+wkt+','+wkid+'】,图形类型：'+type,'投影转换');

        const cs1 = new this.SpatialReference({
          wkid: wkid,
          wkt: wkt
        });
        const cs2 = new this.SpatialReference({
          wkt: this.wkt,
          wkid: this.wkid
        });
        let geomSer = new this.GeometryService({
          url: g_MapConfig.baseConfig.webgisGeo + "/project"
        });
        if (type === 'point') {
          for (let i = 0; i < graphics.length; i++) {
            importPosition.push(new this.Point({
              spatialReference: cs1,
              x: graphics[i].x,
              y: graphics[i].y
            }));
          }
        } else if (type === "polygon") {
          for (let i = 0; i < graphics.length; i++) {
            importPosition.push(new this.Polygon({
              spatialReference: cs1,
              rings: graphics[i].rings
            }));
          }
        } else if(type === "polyline") {
          for (let i = 0; i < graphics.length; i++) {
            importPosition.push(new this.Polyline({
              spatialReference: cs1,
              paths: graphics[i].paths
            }));
          }
        }
        let params = new this.ProjectParameters({
          geometries: importPosition,
          outSpatialReference: cs2,
        });
        return geomSer.project(params)
      },

      closeWin(){
        document.onmousemove = null;
        g_tempLayer.removeAll();
        this.currentDrawedContent = "";
        this.isDrawedGeometryShow = false;
      }
    },

    mounted() {
      let nowUrl = location.href;
      console.log(nowUrl,'落图、预览时的URL');
      let params = this.parseQueryString(nowUrl);
      if(JSON.stringify(params) == "{}"){
        return;
      }
      if (params.mode != undefined && params.mode != '') {
        this.createMap();
      }
    }
  }
</script>

<style scoped lang="scss">
  #to_top
  {
    width:200px;
    height:30px;
    text-align:center;
    position:absolute;
    color:#fff;
  }
</style>
