<template>
  <div style="margin-left: 20px" class="my_print">
    <div style="margin-top: 0px;vertical-align: center" class="flex">
      <span style="margin-top: 8px">选择数据来源：</span>
      <sg-upload class="flex-item" ref="upload" multiple :action="importShpUrl" style="margin-left: 10px"
                 accept=".shp,.dwg,.txt" :format="['shp','dwg','txt']" :on-success="uploadSuccess" :before-upload="beforeUpload">
        <sg-button type="primary" size="small">导入数据</sg-button>
      </sg-upload>
    </div>
    <div class="flex-center" style="margin-top: 10px">
      <span> 选择落图图层：</span>
      <select style="width: 150px;height:30px;margin-left: 10px" v-model="selectedLayerUrl">
        <option v-for="(item,i) in this.addLayerInfos" :value="item.url">{{item.name}}</option>
      </select>
    </div>
    <div>
      <sg-button @click="clear" type="info" class="tooltip" size="small" style="margin-top:20px;margin-right: 10px;margin-bottom: 5px;">清空
        <span class="tooltiptext">清空上临时图层上所有数据</span></sg-button>
      <sg-button @click="ISearch" type="info" size="small" class="tooltip" style="margin-top:20px;margin-right: 10px;margin-bottom: 5px;padding: 10px 10px">点选删除
        <span class="tooltiptext">删除临时图层点选的数据</span></sg-button>
      <sg-button @click="save" size="small" style="margin-top:20px;margin-right: 10px;margin-bottom: 5px;" type="primary">保存</sg-button>
    </div>
  </div>
</template>

<script>

  import {saveGeometryService,handinvoke} from '../config/api.js'
  //   import {Upload} from 'southgisui'
  import bus from '@/assets/eventBus'
  import {loadModules} from "esri-loader";
  import {options} from "@/config";
  import {UrlSearch} from '../assets/method';


  export default {
    name: "addLayer",
    data() {
      return {
        cadFormat: ['DWG', 'dwg', 'dxf', 'DXF'],
        shpFormat: ['shp'],
        txtFormat:['TXT','txt'],
        importShpUrl:"http://192.168.10.115:8086/Rest/ImportShpSimple.ashx",
        analysisurl_txt:"http://192.168.10.115:8086/Rest/ImportTxt.ashx",
        analysisurl_shp: 'http://192.168.10.115:8086/Rest/ImportShpSimple.ashx',
        analysisurl_cad: 'http://192.168.10.115:8086/Rest/ImportCadSimple.ashx',
        isTxt:false,
        analysisurl_print: '',
        url: "/webgis/index.html?sel=4,6&positionFilePath=%%jobfiles%/201811/201811010004/&positionFiles=" +
          "563ad23d-db2d-44c7-9e51-21af1f7f8e17.dbf,b31a577e-159e-4abd-8a85-7e53d6200be7.prj," +
          "d1bd2e29-8222-4883-a8b9-3a39be59a7ce.sbn," +
          "86745d83-d43b-4d03-b163-99b4f4385943.sbx," +
          "e2b8f93b-20f9-40a3-a7dc-13a5a561ee80.shp," +
          "5efe2fe7-e3fb-4afe-b1f4-f9dccf1456c9.shx" +
          "&mode=2&jid=201811010004&configId=webgisadd&roleId=00000001-0000-0000-0010-000000000001",
        file: [],
        keyArr: [],
        polygon: null,
        columns: [],
        showPane: false,
        costomFormat: '',
        isAnalyze: "false",
        res: {
          data: null,
          name: ''
        },
        nowGeo: null,
        resBtn: false,
        mapNum: 2,
        saveGeo:[],
        Hightlight:null,
        addLayerInfos:[],
        selectedLayerUrl:'',
        identifyResult:[],
        mapClickEvent:null
      }
    },

    mounted() {
      this.Hightlight = new SgMap.Highlight();
      this.analysisurl_cad = g_MapConfig.baseConfig.webgisCad;
      this.analysisurl_shp = g_MapConfig.baseConfig.webgisShp;
      this.analysisurl_txt = g_MapConfig.baseConfig.webgisTxt;
      if (!g_MapConfig.toolsConfig.temporary)
      {
        console.log("缺少临时数据落图功能相关数据配置。功能标识：temporary");
        return;
      }else{
        this.addLayerInfos = g_MapConfig.toolsConfig.temporary;
        this.selectedLayerUrl = this.addLayerInfos[0].url;
      }

      loadModules([
          "esri/tasks/IdentifyTask",
          "esri/Graphic",
          "esri/tasks/support/IdentifyParameters",
          "dojo/on",
          "dojo/dom",
          "esri/geometry/geometryEngine"
        ],
        options
      ).then(([IdentifyTask, Graphic, IdentifyParameters, on, dom, geometryEngine]) => {
        this.identifyResult = [];
        this.identifyTask = []
        this.params = new IdentifyParameters();
        this.dom = dom
        this.Graphic = Graphic
        this.IdentifyTask = IdentifyTask;
        this.on = on;
        this.geometryEngine = geometryEngine;
      })
    },

    methods: {

      save() {
        //保存临时图层
        if (this.saveGeo.length == 0) {
          this.$msg.info('请先导入图层再保存。')
        } else {
          let config = {
            headers: {
              "Content-Type": "application/json"
            },
            responseType: "text/html;charset=utf-8"
          };
          let saveInfo = {
            geometryInfo: JSON.stringify(this.saveGeo),
            servicePath: this.selectedLayerUrl
          }
          this.$post(saveGeometryService, saveInfo, config).then(res => {
            console.log(res)
            if (res.addResults[0].success) {
              this.$msg.info('入库成功')
            }
          }).catch(err => {
            this.$msg.warning('入库失败')
          })
        }
      },

      openAs() {
        this.showPane = true
        this.resBtn = false
      },

      close() {
        this.showPane = false
        this.resBtn = true
      },

      ISearch() {
        let _this = this;
        if (this.mapClickEvent != null) {
          this.mapClickEvent.remove();
          this.mapClickEvent = null;
        }
        this.mapClickEvent = this.on(g_view, "click", (e) => {
          if (e.button == 2) { //2为鼠标右键
            document.getElementById("map").style.cursor = "auto"; //还原指针
            _this.mapClickEvent.remove(); //移除地图点击事件
            _this.mapClickEvent = null;
          } else if (e.button == 0) {
            _this.executeSingleIdentifyTask(e, g_view); //执行属性查询
          }
        });
        document.getElementById("map").style.cursor = "crosshair"; //改变指针样式
        this.params.tolerance = 3;
        this.params.layerOption = "all";
        this.params.width = g_view.width;
        this.params.height = g_view.height;
        this.params.returnGeometry = true;
      },

      executeSingleIdentifyTask(e, mapView) {
        let subIndex = this.selectedLayerUrl.lastIndexOf("/");
        let lastNumber = this.selectedLayerUrl.substring(subIndex + 1);
        let fSignIndex = this.selectedLayerUrl.substring(0, subIndex).lastIndexOf("/");
        let searchService = this.selectedLayerUrl.substring(0, fSignIndex) + "/MapServer";
        //截取服务地址
        console.log(searchService,'点查询删除图层服务地址');
        this.params.geometry = e.mapPoint;
        this.params.mapExtent = mapView.extent;
        this.params.layerIds = [lastNumber];
        this.identifyTask = new this.IdentifyTask(searchService);
        this.identifyTask.execute(this.params).then((res) => {
          if (res.results.length <= 0 || res.results[0].feature == null) {
            this.$msg.error("没有找到可删除的图形！");
            return;
          }
          let results = res.results[0].feature;
          this.showSingleIdentifySymbol(results);
        }).catch((er)=>{
          console.log(er,'错误');
          this.$msg.error("查询出现异常："+er.message);
        });
      },

      showSingleIdentifySymbol(feature) {
        let symbol = {
          type: "simple-fill",
          style: "solid",
          color: [0, 0, 0, 0],
          outline: {
            color: [255, 0, 0],
            width: 3
          }
        };
        let gra = new this.Graphic({
          geometry: feature.geometry,
          symbol: symbol,
        });
        g_drawLayer.graphics.add(gra);
        this.mapClickEvent.remove(); //移除地图点击事件
        document.getElementById("map").style.cursor = "auto"; //改变指针样式
        this.mapClickEvent = null;
        this.showFeatureResult(feature);
      },

      //结果展示
      showFeatureResult(feature) {
        let id  = feature.attributes["OBJECTID"];
        let where = "OBJECTID = "+id;
        this.$modal.confirm({
          title: '提示',
          content: '确定要删除选择的图形?',
          closable: true,
          onOk: () => {
            this.deleteOpt(where);
          }
        });
      },

      clear() {
        this.$modal.confirm({
          title: '提示',
          content: '确定要删除，临时图层的所有数据?',
          closable: true,
          onOk: () => {
            this.deleteOpt("1=1");
          }
        })
      },

      //直接操作
      deleteOpt(whereCondition) {
        let config = {
          headers: {
            "Content-Type": "application/json"
          },
          responseType: "text/html;charset=utf-8"
        };
        let deleteInfo = {
          whereCondition: whereCondition,
          targetService: this.selectedLayerUrl
        };
        this.$post(handinvoke, deleteInfo, config).then(res => {
          this.$modal.remove();
          if (!res.hasOwnProperty("code") && !res.hasOwnProperty("error")) {
            this.$emit("rangeOfCadShp", "")
            this.file = []
            this.res.data = null;
            this.res.name = ""
            this.resBtn = false
            g_highLightLayer.removeAll();
            g_drawLayer.removeAll();
            g_bufferLayer.removeAll();
            g_tempLayer.removeAll();
            this.nowGeo = null;
            this.saveGeo = [];
            this.$msg.info('删除成功')
          }else{
            this.$msg.info('删除失败：'+res.error.message);
          }
        }).catch(err => {
          this.$modal.remove()
          this.$msg.warning(err.message)
        })
      },

      beforeUpload(file) {
        let arr = file.name.split(".")

        if (this.cadFormat.indexOf(arr[1]) >= 0) {//导入的是cad文件
          console.log('CAD')
          this.importShpUrl = this.analysisurl_cad
          this.isTxt = false
        } else if (this.shpFormat.indexOf(arr[1]) >= 0) {//导入的是shp文件
          console.log('shp')
          this.importShpUrl = this.analysisurl_shp
          this.isTxt = false
        } else if (this.txtFormat.indexOf(arr[1]) >= 0) { //导入的是txt文件
          this.importShpUrl = this.analysisurl_txt
          this.isTxt = true
        }
        this.$refs.upload.post(file, this.importShpUrl)
        return false
      },

      uploadSuccess(res) {
        bus.$emit('setLoad', {
          statue: false,
          msg: ''
        })
        // console.log(res)
        if (res.code == -1) {
          this.$SgMessage.error(res.exception)
        } else {
          this.$SgMessage.success('上传成功！')
          this.file = []
          this.res.data = res
          this.showSymbol(this.res)
        }
      },

      isInArray(arr, value) {
        for (let i = 0; i < arr.length; i++) {
          if (value === arr[i]) {
            return true;
          }
        }
        return false;
      },

      goAs() {
        this.analyze(this.nowGeo);
      },

      showSymbol(geo) {
        if (this.isTxt) {
          for (let i = 0; i < geo.data.length; i++) {
            this.nowGeo = {rings: geo.data[i].rings}
            this.saveGeo.push({
              geometry: this.nowGeo
            })
          }
        } else {
          for (let i = 0; i < geo.data.features.length; i++) {
            this.nowGeo = {rings: geo.data.features[i].geometry.rings}
            this.saveGeo.push({
              geometry: this.nowGeo
            })
          }
        }

        loadModules(
          [
            "esri/Graphic",
            "esri/geometry/SpatialReference"
          ],
          options
        ).then(([Graphic, SpatialReference]) => {

          g_highLightLayer.removeAll();
          let symbol = {
            type: 'simple-fill',
            color: 'rgba(255,225,255, 0)',
            style: 'solid',
            outline: {
              color: 'red',
              width: 3
            }
          };
          let wkid, wkt
          for (let i in g_map.allLayers.items) {
            if (g_map.allLayers.items[i].url != null) {
              wkid = g_map.allLayers.items[i].fullExtent.spatialReference.wkid
              wkt = g_map.allLayers.items[i].fullExtent.spatialReference.wkt
              break
            }
          }
          let graphic;
          if (this.isTxt) {
            for (let i = 0; i < geo.data.length; i++) {
              geo.data[i].type = 'polygon'
              geo.data[i].spatialReference = new SpatialReference({
                wkt: wkt,
                wkid: wkid
              })
              graphic = new Graphic({
                geometry: geo.data[i],
                symbol: symbol
              });
              g_highLightLayer.graphics.add(graphic)
              this.Hightlight.flash(graphic);
              this.$emit("rangeOfCadShp", graphic.geometry)
            }
          } else {
            for (let i = 0; i < geo.data.features.length; i++) {
              geo.data.features[i].geometry.type = 'polygon'
              geo.data.features[i].geometry.spatialReference = new SpatialReference({
                wkt: wkt,
                wkid: wkid
              })
              graphic = new Graphic({
                geometry: geo.data.features[i].geometry,
                symbol: symbol
              });
              g_highLightLayer.graphics.add(graphic)
              this.Hightlight.flash(graphic);
              this.$emit("rangeOfCadShp", graphic.geometry)
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss">

  .print {
    width: 100%;
    background: #0079c1;
    height: 32px;
    color: #fff;
    border: none;
    margin-bottom: 20px;
  }

  #custom_polygon1 {
    display: inline-block;
    line-height: 32px;
  }

  .custom_radio {
    margin: -24px 0 0 10px;

  }

  #goAs {
    margin: -24px 0 0 10px;
  }

  #openAs {
    margin: -24px 0 0 10px;
  }

  .tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: 180px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;

    /* 定位 */
    position: absolute;
    z-index: 1;
    left:2px;
    bottom:105%;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }
</style>
