<!-- 新的版面制图 -->
<template>
  <div>
    <div class="newPrint">
      <div class="iq-content flex" style="margin-left: 0px">
        <sg-form :label-width="60" style="width:100%;">
          <s-range
            :type="rangeType"
            :drawId="drawId" :isClearPreGeos="true"
            @draw-geometry="drawGeometry"
            @import-cadShp="importCadShp"
            @clear-all="clear">
          </s-range>
        </sg-form>
      </div>
      <div class="flex" style="margin-left: 90px">
        <sg-button @click="beginPrint" type="primary"  style="margin-top: 10px;margin-left: 10px;padding: 8px">开始制图</sg-button>
        <sg-button @click="clear" type="primary"  style="margin-top: 10px;margin-left: 10px;padding: 8px">清除图形</sg-button>
      </div>
    </div>

    <max-win v-show="showPreviewWin" name="出图打印" :canDrag="false" style="width: 100%;height: 100%;z-index:1000" @pane-close="closeWin">
      <div class="flex" style="width: 100%;height: 100%;background:white">
          <div class="leftMenuStyle">
            <sg-tab style="height: 100%;width:330px;overflow-y: auto" v-model="selectedTabName">
              <sg-tab-pane label="属性设置" name="tab1">
                <div>
                  <table class="printTableStyle">
                    <tr><td><span class="printLabelStyle">选择模板：</span></td>
                      <td>
                        <select id="printTemplatesId" class="labelValueControlStyle" v-model="selectTemplateInfo" @change="selectTemplate">
                          <option v-for="(template,index) in allTemplates" :value="template.rid">{{template.templateName}}</option>
                        </select>
                      </td>
                    </tr>
                    <tr><td><span class="printLabelStyle">比例尺：</span></td>
                      <td>
                      <div id="list-name-input" class="list-name-input labelValueControlStyle">
                        <select type="text" class="list-select" id="list-select">
                          <option value="500">500</option>
                          <option value="1000">1000</option>
                          <option value="2000">2000</option>
                          <option value="5000">5000</option>
                          <option value="10000">10000</option>
<!--                          <option value="50000">50000</option>-->
<!--                          <option value="100000">100000</option>-->
                        </select>
                        <input type="text" class="name item-width list-name-for-select" id="list-name-for-select" v-model="currentScale">
                    </div>
                    </td>
                    </tr>
                    <tr><td><span class="printLabelStyle">纸张大小：</span></td><td> <select id="paperSizeId" class="labelValueControlStyle" v-model="selectStyle" @change="changeSelectStyle">
                      <option value="A4_S">A4 竖打</option>
                      <option value="A4_H">A4 横打</option>
                      <option value="A4_S">A3 竖打</option>
                      <option value="A3_H">A3 横打</option>
                    </select></td></tr>
                    <tr><td><span class="printLabelStyle">标题：</span></td><td>
                      <input type="text" class="labelValueControlStyle"  style="border:1px solid gray;" :title="printTitle"
                             v-model="printTitle" :disabled="controlState">
                    </td></tr>
                    <tr><td><span class="printLabelStyle">图件编号：</span></td><td>
                      <sg-input  v-model="mapNum" :disabled="true" class="labelValueControlStyle" style="margin-left:8px">
                      <sg-button type="primary" size="mini" slot="append" style="padding-right:10px;padding-left:10px;display: none;" @click="generateNewNo">生成</sg-button>
                    </sg-input></td></tr>
                    <tr>
                      <td><span class="printLabelStyle">打印日期：</span>
                      </td>
                      <td>
                        <vue-datepicker-local v-model="select_time" format="YYYY年MM月DD日" style="margin-top: 10px" disabled
                                              placeholder="选择日期" @input="getTime" class="labelValueControlStyle"></vue-datepicker-local>
                      </td>
                    </tr>
                    <tr v-if=" selectedTemplate.isDraft == 0">
                      <td><span class="printLabelStyle">申请方：</span></td>
                      <td><input type="text" class="labelValueControlStyle" style="border:1px solid gray;" v-model="applyName"/></td>
                    </tr>
                    <tr v-if=" selectedTemplate.isDraft == 0">
                      <td><span class="printLabelStyle">图件用途：</span></td>
                      <td><select name="useType" id="select_useType"  class="labelValueControlStyle" v-model="select_useType">
                      <option v-for="(item,index) in useType" :key="index" :value="item.value">{{item.value}}</option>
                      </select></td>
                    </tr>
                    <tr v-if=" selectedTemplate.isDraft == 0">
                      <td><span class="printLabelStyle">土地坐落：</span></td>
                      <td><input type="text" class="labelValueControlStyle" style="border:1px solid gray;" v-model="landAddrress"></input> </td>
                    </tr>
                    <tr v-if="selectedTemplate.isOverLayer == 1">
                      <td> <span class="printLabelStyle">压占详情：</span></td>
                      <td><textarea rows="5" cols="20" class="labelValueControlStyle"
                                    style="border:1px solid gray;height: 120px;margin-top: 10px" v-model="currentAnalyseContent" :disabled="controlState"></textarea>
                      </td>
                    </tr>
                  </table>
                  <div class="flex" style="float:right;margin-right:10px;margin-bottom:10px;margin-top:15px;">
                    <sg-button type="primary" style="margin:0px 10px;padding:8px" @click="printMap">打印</sg-button>
                    <sg-button type="primary" @click="closeWin" style="padding:8px">退出</sg-button>
                  </div>
                </div>
              </sg-tab-pane>
              <sg-tab-pane label="图层控制" name="tab2" v-if="isLayerCatalogShow">
                <sg-tree :data="layerData" show-checkbox :render="renderContent" @on-check-change="check" class="sgTreeStyle">
                </sg-tree>
              </sg-tab-pane>
            </sg-tab>
          </div>

          <div id="previewDivId" class="previewDiv">
            <div id="previewMapContentDiv" class="contentStyle" :style="{'width':mapContentWidth+'px','left':leftContentMargin+'px'}">
              <table style="height:100%;width:100%" class="previewTable">
                <tr style="height:24px;">
                  <td colspan="2">
                    <div style="text-align: center;width:100%">
                      <span style="top:6px;left:0px;right:0px;font-size: 14px;font-weight: bold">{{printTitle}}</span>
                    </div>
                  </td>
                </tr>
                <tr style="height:24px;" v-if="selectedTemplate.isDraft == 0">
                  <td style="text-align: left">
                    <div class="sqf">申请方：{{applyName}}</div></td>
                  <td style="text-align: left;width:180px"><div class="tjyt">图件用途：{{select_useType}}</div></td>
                </tr>
                <tr style="height:24px;" v-if="selectedTemplate.isDraft == 0">
                  <td style="text-align:left" colspan="2"><div class="tdzl">土地坐落：{{landAddrress}}</div></td>
                </tr>
                <tr>
                  <td colspan="2">
                    <!-- 地图部分 -->
                    <div style="width:100%;height:3px"></div>
                    <div id="mapDiv" class="mapDivStyle">
                      <table style="position:absolute;right:1px;top:1px;color:black;font-weight:bold;">
                        <tr><td><img src="../assets/images/zbz.png" style="width:100px;height:100px;"></td></tr>
                        <tr><td><span >1:{{currentScale}}</span></td></tr>
                      </table>
                      <div class="analyseDivStyle">
                        <div v-html="currentAnalyseContent"></div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr style="height:24px;" v-if="selectedTemplate.isDraft == 1">
                  <td colspan="2">
                    <div class="bottom-flex" style="left:3px;">
                      <span>&nbsp;打印编号：</span><span>{{mapNum}}</span>
                    </div>
                    <div class="bottom-flex printDateStyle" >
                      <span>打印日期：</span><span>{{selectDateValue}}</span>
                    </div>
                    <div class="bottom-flex" style="right:3px;text-align: right;">
                      <span>打印人：</span><span>{{realName}}</span>
                    </div></td>
                </tr>
                <tr v-if="selectedTemplate.isDraft == 0" style="height:24px;">
                  <td style="text-align: left"><span >&nbsp;制图员：{{realName}}</span></td>
                  <td style="text-align: left"><span>盖章单位：</span></td>
                </tr>
                <tr v-if="selectedTemplate.isDraft == 0" style="height:24px;">
                  <td></td>
                    <td style="text-align: left"><span>盖章日期：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</span></td>
                </tr>
                <tr v-if="selectedTemplate.isDraft == 0" style="height:24px;">
                  <td style="text-align: left">
                    <span>&nbsp;打印编号：</span><span>{{mapNum}}</span></td>
                    <td style="text-align: left"><span>坐标系：</span><span></span></td>
                </tr>
                <tr v-if="selectedTemplate.isDraft == 0" style="height:24px;">
                  <td style="text-align: left">
                    <span style="left:3px;">&nbsp;制图单位：</span></td>
                    <td style="text-align: left">
                      <span style="right:3px">比例尺：1:{{currentScale}}</span>
                    </td>
                </tr>
              </table>

              

            </div>
        </div>
      </div>
    </max-win>

  </div>
</template>

<script>
  import SRange from "@/components/common/rangeSelect";
  import maxWin from "@/components/common/maxWin";
  import {getTemplatesByRole,getMapPMDetails, getExpFlaByName} from '../config/api.js';
  import {loadModules} from "esri-loader";
  import {options} from "../config";
  import bus from '@/assets/eventBus';
  import VueDatepickerLocal from 'vue-datepicker-local';
  import configDataInfo from '../../public/web/config.json'

  export default {
    name: "newPrint",
    components: {
      maxWin,
      SRange,
      VueDatepickerLocal
    },

    data() {
      return {
        drawId: 'newPrint',
        redLineExtentGraphics: [],
        rangeType: ["draw", "import","identify"],
        allTemplates:[],
        selectedTemplate:{},
        showPreviewWin:false,
        previewWidth:100,
        previewHeight:100,
        mapContentWidth:100,
        leftContentMargin:500,
        layerData:[],
        myMapView:null,
        baseMap:null,
        myMap:null,
        myGraphicsLayer:null,
        selectStyle:"A4_S",
        selectTemplateInfo:"",
        printTitle:"",
        currentScale:10000,  //当前比例尺
        mapNum:"",
        select_time:"",
        selectDateValue:"",
        currentAnalyseContent:"",  //当前分析的内容
        currentAnalyseGeo:null,
        currentGeoCenter:null,//中心点
        inputData:[], //详细
        analysisurl_overlayer:"", //出图打印压占分析服务
        analysisurl_print:"",  //打印服务地址
        isInfoCenter:false,   //判断是否是信息中心
        controlState:true,   //控件状态，默认是不可用
        realName:"", //打印人
        costomFormat:"PDF", //打印的格式
        selectedTabName:"tab1",  //当前选择的tab标签
        useType:[], //用途类型集合
        select_useType:'',//当前的用途类型
        currentTopHeight:30,
        currentBottomHeight:50,
        applyName:'',//申请方
        landAddrress:'',//土地坐落
        currentIsDraft:true, //当前的模板是否是草图
        isLayerCatalogShow:false
      }
    },

    mounted() {
      if(configDataInfo.IsShowPrintLayersCatalog)
        this.isLayerCatalogShow = configDataInfo.IsShowPrintLayersCatalog;

      if (!g_MapConfig.panelConfig.ctdy || !g_MapConfig.panelConfig.ctdy.OverLayer_URL) {
        console.log("缺少出图打印功能相关数据配置。功能标识：ctdy")
        return;
      } else {
        this.analysisurl_overlayer = g_MapConfig.panelConfig.ctdy.OverLayer_URL;
      }
      this.analysisurl_print = g_MapConfig.baseConfig.webgisPrint;
      this.previewHeight = document.documentElement.clientHeight - 60;
      this.previewWidth = document.documentElement.clientWidth;
      let contentWidth = this.previewWidth - 230;
      this.mapContentWidth = contentWidth;
      let currentDate = new Date();
      this.select_time = currentDate.getFullYear()+"-"+(currentDate.getMonth()+1)+"-"+currentDate.getDate();
      this.selectDateValue = currentDate.getFullYear()+"年"+(currentDate.getMonth()+1)+"月"+currentDate.getDate()+"日";

      if (window.parent.realName == null || window.parent.realName == undefined) {
        this.realName = window.parent.parent.realName == undefined ? '测试打印员' : window.parent.parent.realName;
      } else {
        this.realName = window.parent.realName == undefined ? '测试打印员' : window.parent.realName;
      }

      let _this = this;
      let listName = document.getElementById('list-name-for-select');
      document.getElementById('list-select').onchange = function(e){
        if(this.value){
          listName.value = this.value;
          _this.currentScale = this.value;
        }else{
          listName.value = ''
        }
      };
    },

    watch:{
      currentScale: function () {
        if (this.myMapView != null && this.myMapView != undefined) {
          this.myMapView.scale = this.currentScale;
        }
      }
    },

    methods: {
      renderContent(h, {root, node, data}) {
        return h('div', {
          style: {
            display: 'inline-block',
            width: '90%',
            height: data.opacity ? '75px' : '',
            position: 'relative'
          },
        }, [
          h('div',{
            style:{
              display:'flex'
            }
          },[
            h('span', {
              domProps: {
                innerHTML: data.title
              },
              on: {
                'click': () => {
                  this.data5 = this.clearOpacity(this.data5);
                  if (data.attributes.restURL != null && data.attributes.restURL != '') {
                    if (this.title == data.title) {
                      this.$set(data, "opacity", false);
                      this.title = ''
                    } else {
                      this.$set(data, "opacity", true);
                      this.title = data.title
                    }
                  }
                }
              }
            })
          ]),
          h('div', {
            style: {
              display: data.attributes.restURL != '' ? 'block' : 'none',
              width: '210px',
              position: 'absolute',
              left: '0px',
              top: '35px'
            },
          }, [
            h('sg-slider', {
              props: {
                value: data.x
              },
              style: {
                display: data.opacity ? 'block' : 'none'
              },
              on: {
                'on-change': (res) => {
                  this.$set(data, "x", res);
                  this.Slider.opacity('url', data.attributes.restURL, res / 100)
                }
              },
            })
          ])
        ]);
      },

      drawGeometry(gra) {
        if(gra != undefined && gra.geometry != undefined){
          this.copyGraphic(gra);
        }
      },

      importCadShp(gra) {
        if (gra != '' && gra != undefined && gra.geometry != undefined && gra.geometry.rings != undefined) {
          this.copyGraphic(gra);
        }
      },

      copyGraphic(gra) {
        let cloneGra = gra.clone();
        this.redLineExtentGraphics.push(cloneGra);
      },

      clear() {
        this.redLineExtentGraphics = [];
        this.currentGeoCenter = null;
        this.currentAnalyseGeo = null;
        this.currentAnalyseContent = "";
        window.g_drawLayer.removeAll();
        window.g_regionLayer.removeAll();
      },

      beginPrint() {

        this.selectedTabName = "tab1";
        this.selectStyle ="A4_S";
        if (this.allTemplates == null || this.allTemplates.length <= 0) {
          let layerList = JSON.parse(JSON.stringify(window.g_layerList));
          this.layerData = layerList;

          bus.$emit('setLoad', {
            statue: true,
            msg: '获取模板中...'
          });

          this.getNum();
          this.$fetch(getTemplatesByRole).then(res => {
            if (res.length > 0 && res[0].hasOwnProperty("templateName")) {
              this.allTemplates = res;
              this.selectTemplateInfo = res[0].rid;
              this.printTitle = res[0].title;
              this.selectedTemplate = res[0];
              this.getUseTypeInfo();
              this.getIsInfoCenter();
              this.createMap();
              this.changePrintAreaSize();
              this.currentScale = parseInt(g_view.scale);
              this.showPreviewWin = true;

            }else {
              this.$msg.error("加载打印模板失败！");
            }
            bus.$emit('setLoad', {
              statue: false,
              msg: '获取模板中...'
            });
          });
        } else {

          this.showPreviewWin = true;
          this.selectTemplateInfo = this.allTemplates[0].rid;
          this.printTitle = this.allTemplates[0].title;
          this.selectedTemplate = this.allTemplates[0];

          this.changePrintAreaSize();//打印尺寸
          this.showChangeTemplate();//模板调整地图加载
          this.addOutsideGraphicPrintMap();//外部图形
          this.currentScale = parseInt(g_view.scale);
          if(this.currentGeoCenter == null)
            this.myMapView.extent = g_view.extent.clone();
        }
      },

      //获取当前是否是信息中心权限
      getIsInfoCenter(){
        if(this.allTemplates != null && this.allTemplates.length>0){
          let findResult = this.allTemplates.find((item)=>{  return item.isDraft ==0; });
          if(findResult != null && findResult.length>0)
            this.isInfoCenter = true;
          else
            this.isInfoCenter = false;
        }
        this.controlState = !this.isInfoCenter;
      },

      getUseTypeInfo(){
        this.useType = [];
        if (this.selectedTemplate.useType != null &&  this.selectedTemplate.isOverLayer !=0) {
          let useTypeData = this.selectedTemplate.useType.split(',')
          for (let i in useTypeData) {
            this.useType.push({value: useTypeData[i]});
          }
          this.select_useType = this.useType[0].value;
        }else{
          this.select_useType = null;
        }
      },

      //压占分析
      doAnalyse() {
        this.currentAnalyseContent = "";
        if(this.currentAnalyseGeo == null || this.selectedTemplate.isOverLayer != "1")
          return;

        bus.$emit('setLoad', {
          statue: true,
          msg: '压占分析中...'
        });

        this.$post(this.analysisurl_overlayer, {
          coordinateInfo: "{\"geometry\":" + JSON.stringify(this.currentAnalyseGeo) + "}",
          overlayerName: this.selectedTemplate.overLayerName,
          year: this.select_year
        }).then(res => {

          if (JSON.parse(res).code == 1) {
            let hzinfo = JSON.parse(res).hzinfo, str = '';
            let splitsInfo = hzinfo.split(/[，；。]/);
            let mjInfo = ""
            for(let k=0;k<splitsInfo.length;k++) {
              let info = splitsInfo[k].replace(/^\s*|\s*$/g,"");
              if(info == null || info == "")
                continue;

              if(info.indexOf("土地总面积") != -1 || info.indexOf("地块总面积") != -1) {
                info = info.replace("土地总面积", "地块总面积");
                mjInfo = info.substring(5);
              }
              if(splitsInfo.length <= 4) {
                info = info.replace("其中：", "均属");
                if (info.indexOf("均属") != -1) {
                  if(mjInfo != "") {
                    info = info.replace(mjInfo, "");
                    mjInfo = "";
                  }
                }
              }
              str += info;
              if(k != splitsInfo.length-1 && k !=0 && splitsInfo[k+1] != ""){
                str += "、";
              }
              if ((k == 0 || k % 2 == 0) && k != splitsInfo.length-1) {
                if (splitsInfo.length > 4)
                  str += "\n"
                else
                  str += "，"
              }
            }
            if(str.endsWith("\n")){
              str = str.substring(0,str.length-1);
            }
            str += "。";

            this.currentAnalyseContent = str;
          } else {
            this.$SgMessage.error(JSON.parse(res).excption);
          }

          bus.$emit('setLoad', {
            statue: false,
            msg: ''
          })
        }).catch(err => {
          console.log(err)
          bus.$emit('setLoad', {
            statue: false,
            msg: ''
          })
        })
      },

      //将红线范围加入打印地图
      addOutsideGraphicPrintMap(){
        if(this.redLineExtentGraphics.length>0 && this.myGraphicsLayer != null) {
          this.myGraphicsLayer.addMany(this.redLineExtentGraphics);
          if (this.redLineExtentGraphics.length > 1) {
            loadModules(["esri/geometry/geometryEngine"], options).then(([geometryEngine]) => {
              let geomarray = [];
              for (let i = 0; i < this.redLineExtentGraphics.length; i++) {
                geomarray.push(this.redLineExtentGraphics[i].geometry);
              }
              let unionGeo = geometryEngine.union(geomarray);
              this.currentAnalyseGeo = {
                rings: unionGeo.rings
              };
              this.currentGeoCenter = unionGeo.extent.center;
              if(this.currentGeoCenter != null && this.currentGeoCenter != undefined) {
                this.myMapView.extent = unionGeo.extent.expand(2.5);
                this.myMapView.center = this.currentGeoCenter;
              }
              this.doAnalyse();//可能需要的分析
            });
          } else {
            this.currentAnalyseGeo = {
              rings: this.redLineExtentGraphics[0].geometry.rings
            };
            this.currentGeoCenter = this.redLineExtentGraphics[0].geometry.extent.center;
            if(this.currentGeoCenter != null && this.currentGeoCenter != undefined) {
              this.myMapView.extent = this.redLineExtentGraphics[0].geometry.extent.expand(2.5);
              this.myMapView.center = this.currentGeoCenter;
            }
            this.doAnalyse();//可能需要的分析
          }
        }
      },

      //获取图件编号
      getNum(isShow) {
        if(isShow == true) {
          bus.$emit('setLoad', {
            statue: true,
            msg: '获取编号中...'
          });
        }
        this.$fetch(getExpFlaByName, {
          name: ""
        }).then(rs => {
          this.mapNum = rs[0].serialNumber;
          if(isShow == true) {
            bus.$emit('setLoad', {
              statue: false,
              msg: '获取编号中...'
            });
          }
        }).catch(err => {
          console.log(err);
          bus.$emit('setLoad', {
            statue: false,
            msg: '获取编号中...'
          });
        })
      },

      generateNewNo(){
        this.getNum(true);
      },

      getTime(val) {
        console.log(val)
        this.select_time = val;
        let currentDate = new Date(val);
        this.selectDateValue = currentDate.getFullYear()+"年"+(currentDate.getMonth()+1)+"月"+currentDate.getDate()+"日";
      },

      changePrintAreaSize(selStyle){
        if(selStyle == undefined || selStyle == "A4_S"){
          // 297/210;
          this.mapContentWidth = this.previewHeight *210/297 + 120;
          this.leftContentMargin = (this.previewWidth-330)/2 - this.mapContentWidth/2;
        }else if(selStyle == "A4_H"){
          this.mapContentWidth = this.previewHeight *297/210;
          this.leftContentMargin = (this.previewWidth-330)/2 - this.mapContentWidth/2;
        }else if(selStyle == "A3_S"){
          // 420/297;
          this.mapContentWidth = this.previewHeight *297/420 + 120;
          this.leftContentMargin = (this.previewWidth-330)/2 - this.mapContentWidth/2;
        }else if(selStyle == "A3_H"){
          this.mapContentWidth = this.previewHeight *420/297;
          this.leftContentMargin = (this.previewWidth-330)/2 - this.mapContentWidth/2;
        }
        if(this.currentGeoCenter != null)
          this.myMapView.center = this.currentGeoCenter;
      },

      //加载地图
      createMap() {
        if (g_MapConfig.baseConfig.webgisBasemap) {
          this.baseMap = g_MapConfig.baseConfig.webgisBasemap;
        } else {
          this.$msg.error("请在地图基本设置中设置底图:webgisBasemap");
          return;
        }

        if(this.selectedTemplate.displayLayers){
          let defaultDispalyLayers =JSON.parse(this.selectedTemplate.displayLayers)
          if(defaultDispalyLayers != null && defaultDispalyLayers.length>0){
            this.baseMap = defaultDispalyLayers;
          }
        }

        let _this = this;
        loadModules(
          [
            "esri/layers/TileLayer",
            "esri/layers/MapImageLayer",
            "esri/layers/GraphicsLayer",
            "esri/Map",
            "esri/views/MapView",
          ],
          options
        ).then(
          ([
             TileLayer,
             MapImageLayer,
             GraphicsLayer,
             Map,
             MapView,
           ]) => {

            let myGraphicLayer = new GraphicsLayer();
            let defaultLayers = [];
            for (let i = 0; i < this.baseMap.length; i++) {
              for (let j = 0; j < window.g_mapUrl.length; j++) {
                if (this.baseMap[i].url == window.g_mapUrl[j].url) {
                  let layer = window.g_mapUrl[j];
                  let cloneLayer = null;
                  if (layer.type == 'ArcGISDynamicMapServiceLayer' && layer.url != "" && layer.sublayers.length == 0) {
                    cloneLayer = new MapImageLayer({
                      url: layer.url,
                      title: layer.title
                    });
                  } else if (layer.type == 'ArcGISDynamicMapServiceLayer' && layer.url != "" && layer.sublayers.length > 0) {
                    cloneLayer = new MapImageLayer({
                      url: layer.url,
                      title: layer.title,
                      sublayers: layer.sublayers
                    });
                  } else if (layer.url != "" && layer.sublayers.length > 0) {
                    cloneLayer = new TileLayer({
                      url: layer.url,
                      title: layer.title,
                      sublayers: layer.sublayers
                    });
                  } else if (layer.url != "" && layer.sublayers.length == 0) {
                    cloneLayer = new TileLayer({
                      url: layer.url,
                      title: layer.title
                    });
                  }
                  defaultLayers.push(cloneLayer);
                  break;
                }
              }
            }
            defaultLayers.push(myGraphicLayer);

            let map = new Map({});
            map.addMany(defaultLayers);
            let mapView = new MapView({
              map: map,
              container: 'mapDiv',
              ui: {
                components: []
              },
              constraints: {
                rotationEnabled: false,
                maxScale: 0,
                snapToZoom:false
              }
            });
            _this.myMap = map;
            _this.myMapView = mapView;
            _this.myGraphicsLayer = myGraphicLayer;
            mapView.watch("scale", function (newValue, oldValue, propertyName, target) {
              let scale = parseInt(newValue)
              _this.currentScale = scale;
            });
            mapView.when(function () {
              if(_this.redLineExtentGraphics.length<=0)
                _this.myMapView.extent = g_view.extent.clone();
              _this.addOutsideGraphicPrintMap();
            }, function (error) {
              console.log(error, '出图地图初始化出错');
            });
          });
      },

      //勾选节点的单选框
      check(res, current) {
        let subLayerParentName = "";
        let parentsLayers = []
        if (res.length > 0) {
          for (let i in res) {
            if (res[i].attributes.serviceType == "ArcGISSubLayer") {
              for (let m in g_mapUrl) {
                if (res[i].attributes.parentId == g_mapUrl[m].rid) {
                  let parentLayerUrl = g_mapUrl[m].url;
                  if (parentsLayers.indexOf(parentLayerUrl) < 0) {
                    parentsLayers.push(parentLayerUrl)
                  }
                }
              }
            }
          }
        }

        let toAddRestUrl = current.attributes.restURL;
        if(current.attributes.restURL == "" || current.attributes.serviceType == "ArcGISSubLayer"){
          let currentParentId = current.attributes.parentId;
          for(let i=0;i<g_mapUrl.length;i++){
            let info = g_mapUrl[i];
            if(info.rid == currentParentId){
              toAddRestUrl = info.url;
              subLayerParentName = info.title;
              break;
            }
          }
        }

        this.addLayerToMap(toAddRestUrl); //添加还没有加入到地图的服务

        this.checkedUrl = [];
        this.checkRes = res;
        if (current.checked == true && current.attributes.restURL != "" && current.attributes.serviceType != "ArcGISSubLayer") {
          this.checkedUrl.push(current.attributes.restURL)
        } else if (current.checked == true && current.children.length > 0) {
          this.traversal(current.children);
        }
        let checkedUrl = this.checkedUrl;
        this.getLayerOptions(this.checkRes, checkedUrl, parentsLayers,current,toAddRestUrl,subLayerParentName);
      },

      //添加图层到地图
      addLayerToMap(currentUrl){
        let url= currentUrl;
        let exist = false;
        for(let i=0;i< this.myMap.allLayers.items.length;i++){
          if(this.myMap.allLayers.items[i].url == url){
            exist = true;
            this.myMap.allLayers.items[i].visible = true;
            break;
          }
        }
        if(!exist) {
          let index = window.allUrlArray.indexOf(url);
          if(index != -1){
            let layer = window.allSortMapLayers[index];
            let otherIndex = this.myMap.allLayers.length -1;
            let insertIndex = 0;
            let hasFound = false;
            for(let j=0;j<this.myMap.allLayers.length;j++){
              let tempUrl = this.myMap.allLayers.items[j].url;
              if(tempUrl == "" || tempUrl == null)
                continue;

              let tempIndex = window.allUrlArray.indexOf(tempUrl);
              if(tempIndex > index) {
                insertIndex = j > 0 ? j : 0;
                hasFound = true;
                break;
              }
            }
            if(!hasFound)
              insertIndex = otherIndex;
            this.myMap.add(layer,insertIndex) ;
          }
        }
      },

      traversal(current) {
        if (current.length > 0) {
          for (let i = 0; i < current.length; i++) {
            if (current[i].attributes.restURL != "") {
              this.addLayerToMap(current[i].attributes.restURL); //添加还没有加入到地图的服务
              this.checkedUrl.push(current[i].attributes.restURL);
            }
            if (current[i].children.length > 0) {
              this.traversal(current[i].children);
            }
          }
        }
      },

      controlMap(arr, checkedUrl, isShow, parentsLayers) {

        let rr = arr.filter(function (x) {
          return x !== undefined;
        });

        if(parentsLayers!=undefined && parentsLayers.length>0){
          for (let i = 0; i < arr.length; i++) {
            if (rr[i] != undefined) {
              this.myMap.allLayers.find((layer) => {
                if (layer.url == rr[i]) {
                  layer.visible = isShow;
                  if (parentsLayers.indexOf(layer.url) >= 0 && isShow == false) {
                    layer.allSublayers.find(function (sublayer) {
                      sublayer.visible = isShow;
                    });
                  }
                }
              });
            }
          }
        }else{
          for (let i = 0; i < arr.length; i++) {
            if (rr[i] != undefined) {
              this.myMap.allLayers.find((layer) => {
                if (layer.url == rr[i]) {
                  layer.visible = isShow;
                  if(layer.allSublayers != null && layer.allSublayers.length >0){
                    layer.allSublayers.map((sub)=>{
                      sub.visible = isShow;
                    });
                  }
                }
              });
            }
          }
        }
      },

      getLayerOptions(res, checkedUrl, parentsLayers,currentlayer,parentUrl,parentTitle) {
        let urlArr = []
        res.map(i => {
          if (i.restURL != undefined && i.restURL != "") {
            urlArr.push(i.restURL)
          } else if (i.attributes != undefined && i.attributes.restURL != undefined && i.attributes.restURL != '' && i.attributes.restURL != null) {
            urlArr.push(i.attributes.restURL)
          }
        });

        if(currentlayer.checked == false)
          this.uncheckLayer(currentlayer,currentlayer.checked,parentUrl);

        if (urlArr.length > 0) {
          this.controlMap(urlArr, checkedUrl, true, parentsLayers); ////arr 与checkedUrl都为数组，长度一样，arr为勾选的所有图层的属性，checkedUrl 为勾选的所有图层的url
        }
        //子图层处理
        if (res.length > 0) {
          for (let i in res) {
            if (res[i].attributes.serviceType == "ArcGISSubLayer") {
              let tracksId = res[i].attributes.layerSort;
              let checked = res[i].checked;

              for (let m in g_mapUrl) {
                if (res[i].attributes.parentId == g_mapUrl[m].rid) {
                  let parentLayerUrl = g_mapUrl[m].url;
                  this.myMap.allLayers.find(function (layer) {
                    if (layer.url === parentLayerUrl) {
                      layer.visible = checked
                      layer.allSublayers.find(function (sublayer) {
                        if (sublayer.id === tracksId) {
                          sublayer.visible = checked;
                        }
                      });
                    }
                  });
                }
              }
            }
          }
        }
      },

      //去掉勾选项，关闭图层的显示
      uncheckLayer(currentLayer,checked,parentsLayers) {
        let _this = this;
        if (currentLayer.attributes.restURL == "" && currentLayer.attributes.serviceType == "ArcGISSubLayer" && parentsLayers!=undefined) {
          let tracksId = currentLayer.attributes.layerSort;
          for(let j=0;j<this.myMap.allLayers.length;j++) {
            let temp = this.myMap.allLayers.items[j];
            if (temp.url == "" || temp.url == undefined)
              continue;

            if (temp.url === parentsLayers) {
              temp.allSublayers.find(function (sublayer) {
                if (sublayer.id === tracksId) {
                  sublayer.visible = checked;
                }
              });

              let isAllHide = true;
              for (let j = 0; j < temp.allSublayers.length; j++) {
                let mysublayer = temp.allSublayers.items[j];
                if (mysublayer.visible) {
                  isAllHide = false;
                  break;
                }
              }
              if (temp.allSublayers.length > 0 && isAllHide) {
                temp.visible = checked;
              }
              break;
            }
          }
        } else if (currentLayer.attributes.restURL != '' && currentLayer.attributes.restURL != undefined) {
          for(let k=0;k<this.myMap.allLayers.length;k++) {
            let temp = this.myMap.allLayers.items[k];
            if (temp.url == "" || temp.url == undefined)
              continue;

            if (temp.url === currentLayer.attributes.restURL) {
              temp.visible = checked;
              if (temp.allSublayers != undefined && temp.allSublayers.length > 0) {
                temp.allSublayers.find(function (sublayer) {
                  sublayer.visible = checked;
                });
              }
              break;
            }
          }
        } else if (currentLayer.attributes.restURL == '' && currentLayer.attributes.serviceType == 'UnKnowLayer') {
          if (currentLayer.attributes.children != undefined && currentLayer.attributes.children.length > 0) {
            currentLayer.attributes.children.map((item)=>{
              _this.uncheckLayer(item,checked);
            });
          }else if(currentLayer.children != undefined && currentLayer.children.length>0){
            currentLayer.children.map((item)=>{
              _this.uncheckLayer(item,checked);
            });
          }
        }
      },

      //关闭窗口
      closeWin(){
        this.showPreviewWin = false;
        this.currentAnalyseGeo = null;
        if(this.myGraphicsLayer != null)
          this.myGraphicsLayer.removeAll();
        this.clear();
      },

      //改变打印样式
      changeSelectStyle(){
        this.changePrintAreaSize(this.selectStyle);
      },

      //重新选择模板
      selectTemplate(){
        if(this.selectTemplateInfo != null && this.selectTemplateInfo != ""){
          for(let i=0;i<this.allTemplates.length;i++){
            let tempTemplate = this.allTemplates[i];
            if(tempTemplate.rid == this.selectTemplateInfo){
              this.selectedTemplate = tempTemplate;
              this.printTitle = tempTemplate.title;
              this.showChangeTemplate();
              if(tempTemplate.isOverLayer == "1" && this.currentAnalyseGeo != null){
                this.doAnalyse();
              }
              break;
            }
          }
        }
      },

      //重新选择模板之后加载图层的变化
      showChangeTemplate(){
        if(this.selectedTemplate.displayLayers == null || this.selectedTemplate.displayLayers == undefined)
          return;

        this.getUseTypeInfo();
        let defaultShowLayers = JSON.parse(this.selectedTemplate.displayLayers);
        if(defaultShowLayers.length>0){
          if(this.myMap != null){
            this.myMap.allLayers.find((layer) => {
              if (layer.type != "graphics") {
                layer.visible = false;
                if (layer.allSublayers != undefined && layer.allSublayers.lenght>0) {
                  layer.allSublayers.find(function (sublayer) {
                    sublayer.visible = false;
                  });
                }
              }
            });
            this.baseMap = defaultShowLayers;
            for(let i=0;i< defaultShowLayers.length;i++){
              let url = defaultShowLayers[i].url;
              this.addLayerToMap(url);
            }
            this.initRes(this.layerData);
          }
        }else{
          this.baseMap = this.baseMap = g_MapConfig.baseConfig.webgisBasemap;
          for(let i=0;i< this.baseMap.length;i++){
            let url = this.baseMap[i].url;
            this.addLayerToMap(url);
          }
          this.initRes(this.layerData);
        }
      },

      //设置图层目录的勾选清空
      initRes(res) {
        let _this = this;
        res.map((item) => {
          this.$set(item, "checked", false); //添加checked属性
          _this.baseMap.map((base) => {
            if (item.attributes.restURL === base.url) {
              this.$set(item, "checked", true)
            }
          });

          if (item.children && item.children.length > 0) {
            _this.initRes(item.children);
          } else if (item.attributes.restURL == '') {
            this.$set(item, "checked", false);
          }
        });
      },

      //打印地图
      printMap() {
        let _this = this;
        let printData = [];
        let printTemplateName = this.selectedTemplate.templateName+"_"+this.selectStyle;
        let scaletext = "1:"+this.currentScale.toString();
        printData.push({tjNo:this.mapNum});
        printData.push({titleText:this.printTitle});
        printData.push({scaletext: scaletext});
        printData.push({author:this.realName});
        printData.push({ctrq: this.selectDateValue});
        printData.push({analyseText: this.currentAnalyseContent});

        loadModules(
          [
            "esri/tasks/PrintTask",
            "esri/tasks/support/PrintParameters",
            "esri/tasks/support/PrintTemplate",
          ],
          options
        ).then(([PrintTask, PrintParameters, PrintTemplate]) => {

          bus.$emit('setLoad', {
            statue: true,
            msg: '打印生成中...'
          });
          let printTask = new PrintTask({
            url: _this.analysisurl_print
          });

          let template = new PrintTemplate({
            format: _this.costomFormat,
            exportOptions: {
              dpi: 200
            },
            layout: printTemplateName,
            layoutOptions: {
              titleText: this.printTitle,
              customTextElements: printData
            }
          });

          let params = new PrintParameters({
            view: this.myMapView,
            template: template
          });

          printTask.execute(params).then(function (evt) {
            console.log(evt);
            bus.$emit('setLoad', {
              statue: false,
              msg: '打印生成中...'
            });
            window.open(`./pdf.html?${_this.costomFormat}&&${evt.url}&&${_this.mapNum}&&${_this.selectedTemplate.templateName}`);
            _this.getNum(false);
          }, function (evt) {
            bus.$emit('setLoad', {
              statue: false,
              msg: '打印生成中...'
            });
            console.log(evt, '打印错误');
            alert("请检查模板:【"+printTemplateName+".mxd】是否存在！");
          });
        });
      },

      exportMap(){
        // html2canvas(document.getElementById('mapDiv'),{
        //   useCORS : true,
        //   foreignObjectRendering : true,
        //   allowTaint :false
        // }).then(canvas => {
        //   this.imgmap = canvas.toDataURL('image/png')
        //   if (window.navigator.msSaveOrOpenBlob) {
        //     let bstr = atob(this.imgmap.split(',')[1])
        //     let n = bstr.length
        //     let u8arr = new Uint8Array(n)
        //     while (n--) {
        //       u8arr[n] = bstr.charCodeAt(n)
        //     }
        //     let blob = new Blob([u8arr])
        //     window.navigator.msSaveOrOpenBlob(blob, 'chart-download' + '.' + 'png')
        //   } else {
        //     // 这里就按照chrome等新版浏览器来处理
        //     const a = document.createElement('a')
        //     a.href = this.imgmap
        //     a.setAttribute('download', '导出图片')
        //     a.click()
        //   }
        // });
      }
    }
  }
</script>

<style scoped lang="scss">

  .sgTreeStyle{
    margin-bottom: 5px;
    overflow-y:auto;
    overflow-x:hidden;
  }
  .newPrint {
    width: 100%;
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 5px;
    position: relative;
  }

  .printTableStyle{
    width:100%;
    height:100%;
    line-height: 35px;
    text-align: center;
    vertical-align: center;
    horiz-align: right;
    padding: 2px 2px;
    margin:2px 2px
  }

  .tableStyle tr{
    width:100%;
    height:33px;
  }

  .tableStyle tr td{
    width:80px;
    height:33px;
    text-align: right;
    vertical-align: center;
    padding-right:3px;
  }

  .analyseDivStyle{
    position:absolute;
    left:0px;
    right:0px;
    bottom: 0px;
    background-color:lightgoldenrodyellow;
    text-align: justify;
    max-height: 50%;
    padding: 2px;
    word-break:break-all;
  }

  .mapHeadStyle{
    position:absolute;
    width:100%;
    background-color: white
  }

  .mapHeadStyle2{

  }

  .mapDivStyle{
    border:1px solid #000;
    left: 0px;
    right: 0px;
    height:100%;
    position: relative;
    border:1px solid gray;
    margin:5px 5px
  }

  .leftMenuStyle{
    border:1px solid gray;
    margin-left:-10px;
    width:330px;
    height:calc(100% - 35px);
  }

  .previewDiv{
    border-top:1px solid gray;
    border-right:1px solid gray;
    border-bottom:1px solid gray;
    width:calc(100% - 330px);
    height:calc(100% - 35px);
    margin-bottom: 5px;
    text-align:center;
    position: relative;
    background-color: #8d8d8e;
  }

  .printDateStyle{
    width: 34% !important;
  }

  .contentStyle {
    position: absolute;
    height: 100%;
    border: 1px solid black;
    text-align: center;
    background-color: white;
  }

  .printLabelStyle{
    /*width: 100px;*/
    /*text-align: center;*/
    /*margin-left: -16px;*/
  }

  .selectStyle{
    width: 180px;/*比上面设置的略宽*/
    color: black;
  }

  .labelValueControlStyle{
    width:235px;
    height:30px;
    border-radius: 4px;
    vertical-align: center;
  }

  .divstyle{
    margin:5px 2px;
  }

  .list-name-input{
    color: #333;
    font-family: tahoma, 'Microsoft YaHei', 'Segoe UI', Arial, 'Microsoft Yahei', Simsun, sans-serif;
    position: relative;
    width: 245px;
  }
  .list-name-for-select{
    border: 0;
    color: #555;
    height: 20px;
    lighting-color: rgb(255, 255, 255);
    line-height: 25px;
    margin:0 0 10px 0;
    outline-offset: 0px;
    outline: #555 none 0px;
    padding: 4px 6px;
    position: absolute;
    top: 3px;
    left: 12px;
    vertical-align: middle;
    width: 219px;
  }
  .list-name-input-for-select:focus{
    border: 0;
    border-radius: 0;
  }
  .list-select {
    background-color: #FFF;
    border: 1px #ccc solid;
    border-radius: 4px;
    color: #555;
    cursor: pointer;
    height: 30px;
    left: 10px;
    margin: 0 0 10px 0;
    padding: 4px 6px;
    position: absolute;
    top: 0px;
    vertical-align: middle;
    white-space: pre;
    width: 235px;
  }
  .sqf{
    height: 100%;
    border-left: #000 1px solid;
    border-top: #000 1px solid;
    margin: 0 0 0 5px;
    width: calc(100% - 5px);
  }
  .tjyt{
    height: 100%;
    border-right: #000 1px solid;
    border-top: #000 1px solid;
    margin: 0 5px 0 0;
    width: calc(100% - 5px);
    text-align: right;
  }
  .tdzl{
    height: 100%;
    border-right: #000 1px solid;
    border-bottom: #000 1px solid;
    border-left: #000 1px solid;
    margin: 0 5px 0 5px;
    width: calc(100% - 10px);
  }
  .previewTable tr td{
    padding: 0;
    margin: 0;
  }
  .bottom-flex{
    float: left;
    width: 33%;
  }
</style>
