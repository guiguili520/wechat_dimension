<template>
  <div style="height: 100%;">
    <div id="map"></div>

    <div class="moduleItemBox" v-if="addMode=='independentMap' && maploaded">
      <!-- 图签管理-->
      <s-bookmark v-if="toolState.bookmark && maploaded" ref="bookmark"></s-bookmark>
      <!--默认打印-->
      <printExpand v-if="toolState.printExpand && maploaded" ref="printExpand"></printExpand>
      <!-- 坐标输出  arcgis UI-->
      <SCoordinate v-if="toolState.coordinate && maploaded" ref="coordinate"></SCoordinate>
      <!-- 标注  arcgis UI-->
      <s-label v-if="toolState.label && maploaded" ref="label"></s-label>
      <!--街景地图-->
      <baidu-street-view v-if="toolState.streetView" ref="streetView"></baidu-street-view>

      <!-- 横断面分析 -->
      <hdm-query v-if="toolState.hdmQuery" ref="hdmQuery"></hdm-query>
    </div>

    <div v-if="addMode=='independentMap'" class="toolBoxBar" @mouseenter="enter()" @mouseleave="leave()">
        <div class="tool-index">
          <span @click="toolItem">
          <i class="fa fa-suitcase"></i>
          &nbsp;工具箱
          <i v-if="showToolItem" class="fa fa-caret-up"></i>
          <i v-else class="fa fa-caret-down"></i>
          </span>
        </div>
        <ul v-show="showToolItem">
          <li v-if="toolState.styleControl" @click="closeControlStyle">
            <!-- 样式控制 -->
              <div class="item" :title="styleControl" >
              <i class="fa fa-code"></i>&nbsp;
              <span>{{styleControl}}</span>
              </div>
          </li>
          <li v-if="toolState.bookmark" @click="showBookmark">
            <!-- 图签管理-->
            <div class="item" :title="bookmark" >
              <i class="fa fa-edit"></i>&nbsp;
              <span>{{bookmark}}</span>
            </div>
          </li>
          <li v-if="toolState.printExpand" @click="Print">
            <!--默认打印-->
            <div class="item" :title="printExpand" >
              <i class="fa fa-print"></i>&nbsp;
              <span>{{printExpand}}</span>
            </div>
          </li>
          <!-- 测量 -->
          <SMeasure v-if="toolState.measure && maploaded"></SMeasure>
          <li v-if="toolState.coordinate"  @click="showCoordinate">
            <!-- 坐标输出  arcgis UI-->
            <div class="item" :title="coordinate" >
              <i class="fa fa-pencil"></i>&nbsp;
              <span>{{coordinate}}</span>
            </div>
          </li>
          <li v-if="toolState.label" @click="showLabels">
              <!-- 标注  arcgis UI-->
            <div class="item" :title="label" >
              <i class="fa fa-tags"></i>&nbsp;
              <span>{{label}}</span>
            </div>
          </li>
          <li class="item" v-if="toolState.screen" >
                <!--分屏按钮-->
            <div class="item" :title="screen" @click="splitScreen(4)">
              <i class="fa fa-clone"></i>&nbsp;
              <span >{{screen}}</span>
            </div>
          </li>
          <li v-if="toolState.customPrint">
              <!-- 自定义打印 -->
            <div class="item" :title="customPrint" @click="importFile">
              <i class="fa fa-print"></i>&nbsp;
              <span>{{customPrint}}</span>
            </div>
          </li>
          <li v-if="toolState.streetView">
            <div class="item" :title="streetView" @click="showStreetView">
              <i class="fa fa-edit"></i>&nbsp;
              <span>{{streetView}}</span>
            </div>
          </li>
          <li v-if="toolState.temporary">
            <!-- 添加临时图层 -->
            <div class="item" :title="temporary" @click="importData">
              <i class="esri-icon-directions2"></i>&nbsp;
              <span>{{temporary}}</span>
            </div>
          </li>

          <li v-if="toolState.hdmQuery"> <!-- 横断面分析 -->
            <div class="item" :title="hdmQuery" @click="showHdmQuery">
              <i class="fa fa-pencil"></i>&nbsp;
              <span>{{hdmQuery}}</span>
            </div>
          </li>

        </ul>
    </div>
    <div v-if ="addMode=='independentMap'">
    <!--清除图层按钮-->
    <div v-if="toolState.clear" class=" clearBtn esri-widget--button esri-icon-media  esri-icon-trash btn" :title="clear" @click="clearGraphics"
        :style="{top:cleartop+'px'}"></div>

      <div v-if="toolState.tools"  id="previousViewBtn" class="esri-widget--button addTempLayer esri-icon-left-arrow btn" style="top:28px;postion:flex" title="上一视图">
      </div>

      <div v-if="toolState.tools" id="nextViewBtn" class="esri-widget--button addTempLayer esri-icon-right-arrow btn" style="top:64px;postion:flex" title="下一视图">
      </div>
      <div v-if="toolState.tools" id="initViewBtn" class="esri-widget--button addTempLayer esri-icon-globe btn" style="top:100px;postion:flex" title="全图">
      </div>

    <!--打印窗口-->
    <div v-if="toolState.customPrint" v-drag class="expandDialog" style="position: fixed;top:50px;right: 70px;" v-show="showPrint">
      <div class="header flex">
        <p class="flex-item">{{customPrint}}</p>
        <div class="collapse" @click="closeDialog">
          <sg-icon type="icon-close"></sg-icon>
        </div>
      </div>
      <div class="dialog-wrap" >
        <print v-if="maploaded"></print>
      </div>
    </div>

    <!-- 临时图层弹窗 -->
    <div v-drag class="expandDialog" style="position: fixed;top: 100px;right: 70px;" v-if="toolState.temporary"
         v-show="isShowTemporary">
      <div class="header flex">
        <p class="flex-item">{{temporary}}</p>
        <div class="collapse" @click="closeTemporary">
          <sg-icon type="icon-close"></sg-icon>
        </div>
      </div>
      <div class="dialog-wrap">
        <add-layer v-if="maploaded"></add-layer>
      </div>
    </div>

      <!-- 样式控制 -->
    <div  v-drag class="expandDialog" style="position: fixed;top: 50px;right: 210px;" v-if="toolState.styleControl" v-show="isShowStyleControl">
        <div class="header flex">
          <p class="flex-item">{{styleControl}}</p>
          <div class="collapse" @click="closeControlStyle">
            <sg-icon type="icon-close"></sg-icon>
          </div>
        </div>
        <div class="dialog-wrap">
          <control-style v-if="maploaded"></control-style>
        </div>
      </div>

    </div>
    <!--比例尺-->
    <div v-if="toolState.scaleBar && maploaded" class="scalebarBtn" title="比例尺">比例尺 1 : {{scale}}</div>
    <!--坐标-->
    <div v-if="toolState.coordinate && maploaded" class="coordinateBtn" title="坐标">X={{x}}&nbsp&nbsp Y={{y}}</div>
  </div>
</template>
<script>
  import {toolsData,toolClass} from '../config/config.js'
  import {loadModules} from "esri-loader";
  import {options} from "../config";
  import bus from '../assets/eventBus';
  import {GET_Tree, proxyUrl,GetWebGisCatalog,GET_RoleFunsInfo,Blank} from '../config/api.js'
  import addLayer from "./addLayer";
  import measure from "./measure";
  import controlStyle from "./controlStyle"
  import toolbox from "../assets/style/toolbox.scss"
  import SBookmark from './bookmark'
  import printExpand from './printExpand'
  import SMeasure from './measure'
  import SCoordinate from './coordinateExport'
  import SLabel from './label'
  import baiduStreetView from './baiduStreetView'
  import HDMQuery from './hdmanalse/hdmQuery'

  export default {
    name: "sMap",
    components: {
      HdmQuery:resolve=>{
        require(['./hdmanalse/hdmQuery'], resolve)
      },
      print: resolve => {
        require(['./print'], resolve)
      },
      addLayer,measure,controlStyle,SBookmark,printExpand,SMeasure,SCoordinate,SLabel,baiduStreetView
    },
    data() {
      return {
        maploaded:false,
        baseMap: [],
        x: null,
        y: null,
        addMode: "",
        scale: null,
        initExtent: {},
        isShow: false,
        showPrint: false,
        toolState: {},
        toolClass: {},
        queryData: [],
        identifyResult: [],
        resultPanelVisible: false,
        identifyTask: null,
        result: null,
        mapUrl: [],
        isShowTemporary: false,
        isShowStyleControl:false,
        selectArr: [],
        toolBar:[],
        clear: '',
        screen: '',
        temporary: '',
        customPrint: '',
        styleControl:'',
        hdmQuery:'',
        showToolItem:false,
        cleartop:0,
        bookmark:'',
        printExpand:'',
        coordinate:'',
        label:'',
        streetView: ''
      }
    },
    created() {
      this.$load.show({
        text: '正在加载...',
      });
    },
    mounted() {
       let _this = this;
      let nowUrl = location.href;
      _this.toolState = toolsData;

      let urlParams = this.parseQueryString(nowUrl);
      if(nowUrl.indexOf('?') >0 && urlParams.showAllFuncs == 'true' && urlParams.mode > 0 && urlParams.mode < 100) {
        _this.addMode = "independentMap";
        _this.toolState.fallingMap = true;
      }else if (nowUrl.indexOf('?') < 0 || (nowUrl.indexOf('?') > 0 && urlParams.mode > 100) || ((nowUrl.indexOf('?') > 0 && urlParams.mode == undefined ))) {
        //独立地图需求：需要最全的地图功能，地图图层权限、图层树、查询、书签等功能；
        _this.addMode = "independentMap"
      } else if ((nowUrl.indexOf('?') > 0 && urlParams.mode > 0 && urlParams.mode < 100)) {
        //地图交互功能需求：预览、定位、落图与业务进行交互，需要地图图层权限控制，加上放大缩小功能，另外加上I查询（点查询）功能（查询输出结果以列表展示，就2列就行），不需要加载图层树服务；
        _this.addMode = "businessInteraction";
        _this.toolState.fallingMap = true;
        _this.toolState.identify = true;
        _this.toolState.scaleBar = true;
        _this.toolState.coordinate = true;
      } else if ((nowUrl.indexOf('?') > 0 && urlParams.mode <= -1)) {
        //首页地图需求：需要展示统计图标（功能暂时未添加），不需要调用图层树服务，只需要图层权限的数据。
        _this.addMode = "homeMap";
        _this.toolState.scaleBar = true;
        _this.toolState.coordinate = true;
      }
      window.addMode = _this.addMode;
      _this.toolClass = toolClass;
      bus.$emit('setLoad', {
        statue: true,
        msg: "努力加载中..."
      });
      this.getTree(userId, _this);
      bus.$on("toggleScreen", res => {
        _this.isShow = res.isShow;
      });
      bus.$on("close",(name) => {
        _this.showToolItem = false;
      });
    },

    methods: {
      showLabels(){
        this.$refs.label.showLabels();
      },

      showCoordinate(){
        this.$refs.coordinate.showCoordinate();
      },

      Print(){
        this.$refs.printExpand.Print();
      },

      showBookmark(){
        this.$refs.bookmark.showBookmark();
      },

      enter(){
        this.showToolItem=true;
      },

      leave(){
        this.showToolItem=false;
      },

      setclearTop(){
        let _this=this;
        if(_this.toolState.tools){
          let newToolclass=["","",""];
          let oldToolClass=toolClass.custom;
          let defaultTools=["fullscreen","identify","clear"]
            for(let i in oldToolClass){
              if(defaultTools.indexOf(oldToolClass[i])>-1){
                newToolclass.push(oldToolClass[i]);
              }
            }
          _this.toolClass.custom=newToolclass
        }else{
          let newToolclass=[];
          let oldToolClass=toolClass.custom;
          let defaultTools=["fullscreen","identify","clear"]
            for(let i in oldToolClass){
              if(defaultTools.indexOf(oldToolClass[i])>-1){
                newToolclass.push(oldToolClass[i]);
              }
            }
          _this.toolClass.custom=newToolclass
        }
        _this.toolClass.system=toolClass.system;
        _this.cleartop=_this.toolClass.custom.indexOf("clear")>-1?28+(_this.toolClass.custom.indexOf("clear"))*32+(5*_this.toolClass.custom.indexOf("clear")):-999;
      },

      toolItem(){
        if(this.showToolItem){
          this.showToolItem=false;
        }else{
          this.showToolItem=true;
        }
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

      importFile(name) {
        this.showPrint = !this.showPrint
        this.showToolItem = false;
      },

      closeDialog() {
        this.showPrint = false
        this.showToolItem = false;
      },

      importData() {
        this.isShowTemporary = !this.isShowTemporary;
        this.showToolItem = false;
      },

      closeTemporary() {
        this.isShowTemporary = false
        this.showToolItem = false;
      },

      closeControlStyle(){
        this.isShowStyleControl = !this.isShowStyleControl;
        this.showToolItem = false;
      },

      initMapUrl(res) {

        let _this = this;
        if (res.attributes.restURL != '' && res.attributes.serviceType != "ArcGISSubLayer" && res.attributes.restURL != Blank) {
          let sublayers = [];
          if (res.children.length > 0) {
            let reverseArray = res.children.reverse();
            reverseArray.map((item) => {
              sublayers.push({
                id: item.attributes.layerSort,
                title: item.text,
                visible: false
              });
            });
          };

          _this.mapUrl.push({
            url: res.attributes.restURL,
            title: res.attributes.layerName,
            type: res.attributes.serviceType,
            rid: res.attributes.rid,
            parentId: res.attributes.parentId,
            sublayers: sublayers
          });
        }

        if (res.children && res.children.length > 0) {
          res.children.map((item) => {
            _this.initMapUrl(item)
          })
        }

        window.g_mapUrl = _this.mapUrl
        return _this.mapUrl
      },

      createMap() {
        let _this = this;
        loadModules(
          [
            "esri/views/MapView",
            "esri/Map",
            "esri/layers/TileLayer",
            "esri/layers/MapImageLayer",
            "esri/layers/GraphicsLayer",
            "esri/geometry/SpatialReference",
            "esri/layers/BaseTileLayer",
            "esri/layers/support/TileInfo",
            "esri/request"
          ],
          options
        ).then(([MapView,Map,TileLayer,MapImageLayer, GraphicsLayer, SpatialReference,BaseTileLayer,TileInfo,request]) => {

          let ConfigSpatialReference;
          if (g_MapConfig.baseConfig.webgisSr) {
            ConfigSpatialReference = g_MapConfig.baseConfig.webgisSr;
          } else {
            this.$msg.error("请在地图基本设置中配置底图的坐标参考系:webgisSr");
            return;
          }
          window.g_spatialReference = new SpatialReference(ConfigSpatialReference);

          //初始化地图
          let g_map = new Map({});

          let g_view = new MapView({
            map: g_map,
            container: 'map',
            ui: {
              components: []
            },
            constraints: {
              rotationEnabled: false,
              snapToZoom:false,
              maxScale: 0,
            }
          });

          let g_regionLayer = new GraphicsLayer();//范围图层（导入cad,shp）
          let g_drawLayer = new GraphicsLayer();//绘制图层
          let g_highLightLayer = new GraphicsLayer();//高亮图层
          let g_bufferLayer = new GraphicsLayer();//缓冲区图层
          let g_tempLayer = new GraphicsLayer();//其他临时图层

          let addMany = [];
          let toAddUrl = [];

          _this.mapUrl.map((i) => {
            if (i.type == 'ArcGISDynamicMapServiceLayer' && i.url != "" && i.sublayers.length == 0) {
              addMany.push(new MapImageLayer({
                url: i.url,
                title: i.title
              }));
              toAddUrl.push(i.url);
            } else if (i.type == 'ArcGISDynamicMapServiceLayer' && i.url != "" && i.sublayers.length > 0) {
              addMany.push(new MapImageLayer({
                url: i.url,
                title: i.title,
                sublayers: i.sublayers
              }));
              toAddUrl.push(i.url);
            } else if (i.type == 'ArcGISTiledMapServiceLayer' && i.url != "" && i.sublayers.length > 0) {
              addMany.push(new TileLayer({
                url: i.url,
                title: i.title,
                sublayers: i.sublayers
              }));
              toAddUrl.push(i.url);
            } else if (i.type == 'ArcGISTiledMapServiceLayer' && i.url != "" && i.sublayers.length == 0) {
              addMany.push(new TileLayer({
                url: i.url,
                title: i.title
              }));
              toAddUrl.push(i.url);
            } else if(i.type == "TDTTileLayer" && i.url != ""){
              let tdt = _this.addTDTLayer(BaseTileLayer,TileInfo,SpatialReference,request,i.url);
              addMany.push(tdt);
              toAddUrl.push(i.url);
            }
          });
          addMany.reverse() ////按照图层目录顺序叠加模式（河源需求）
          toAddUrl.reverse();//反序

          window.allSortMapLayers = addMany; //全局保存
          window.allUrlArray = toAddUrl; //全局保存，所有的地图服务地址。

          //不能同时全部加入图层，否则所有的图层服务都进行初始化，加载的速度比较慢，只加载需要立马显示的图层
          let graphicLayerArray = [g_regionLayer, g_drawLayer, g_highLightLayer, g_bufferLayer, g_tempLayer];
          let defaultArray = this.showDefaultBaseMap(graphicLayerArray);

          g_map.layers.addMany(defaultArray);

          g_view.when(function () {
            _this.loadedEventDealer();
          }, function (error) {
            console.log(error, '地图初始化出错');
            _this.loadedEventDealer();
          });

          window.g_map = g_map
          window.g_view = g_view
          window.g_regionLayer = g_regionLayer //范围图层（导入cad,shp）
          window.g_drawLayer = g_drawLayer //绘制图层
          window.g_highLightLayer = g_highLightLayer //高亮定位图层
          window.g_bufferLayer = g_bufferLayer //缓冲区图层
          window.g_tempLayer = g_tempLayer  //临时图层
          window.g_tempDiv = []//mapDiv中添加的临时Div

          g_view.watch("scale", function (newValue, oldValue, propertyName, target) {
            let scale = parseInt(newValue)
            _this.scale = scale
          });

          g_view.on('pointer-move', (evt) => {
            let point = g_view.toMap({x: evt.x, y: evt.y});
            _this.x = point.x.toFixed(3);
            _this.y = point.y.toFixed(3);
          });

          g_view.watch("fatalError", function(error) {
            if(error) {
              g_view.tryFatalErrorRecovery();
            }
          });

          if (toolsData.printExpand) {
            if (!g_MapConfig.baseConfig.webgisPrint) {
              console.log("请在地图基本设置中配置arcgis server打印服务的地址:webgisPrint", '配置缺失');
            }
          }
          new SgMap.ToolBar(g_MapConfig.baseConfig.webgisPrint, toolsData, _this.addMode);
          if (this.toolState.tools && this.addMode == "independentMap") {
            new SgMap.BaseTools(g_MapConfig.baseConfig.webgisExtent);
          }
        });
        this.ToolText();
      },

      loadedEventDealer(){
        this.$load.hide();
        this.maploaded = true;
        this.setclearTop();
        //地图加载完，初始化基础工具。去除过渡组件
        bus.$emit('mapOnload', {
          temp: true,
          statue: false
        });
      },

      ToolText() {
        let config = window.roleToolkits;
        this.toolBar[this.clear, this.screen];
        if(config.data) {
          for (let i = 0; i < config.data.length; i++) {
            if (config.data[i].toolPath == 'clear') {
              this.clear = config.data[i].toolName
            } else if (config.data[i].toolPath == 'temporary') {
              this.temporary = config.data[i].toolName
            } else if (config.data[i].toolPath == 'customPrint') {
              this.customPrint = config.data[i].toolName
            } else if (config.data[i].toolPath == 'screen') {
              this.screen = config.data[i].toolName
            } else if (config.data[i].toolPath == 'styleControl') {
              this.styleControl = config.data[i].toolName
            } else if (config.data[i].toolPath == 'bookmark') {
              this.bookmark = config.data[i].toolName
            } else if (config.data[i].toolPath == 'printExpand') {
              this.printExpand = config.data[i].toolName
            } else if (config.data[i].toolPath == 'coordinate') {
              this.coordinate = config.data[i].toolName
            } else if (config.data[i].toolPath == 'label') {
              this.label = config.data[i].toolName
            } else if (config.data[i].toolPath == 'streetView') {
              this.streetView = config.data[i].toolName
            }else if (config.data[i].toolPath == 'hdmQuery') {
              this.hdmQuery = config.data[i].toolName
            }
          }
        }
      },

      getTree(userId, _this) {
        this.$get(GET_Tree + userId).then((res) => {
          if (res.length > 0) {
            _this.result = res
            window.g_tree = _this.result; //将专题图与图层树处理后的数据暴露到全局
            _this.mapUrl = [];
            _this.result.map((item) => {
              _this.initMapUrl(item)
            });
            _this.createMap();
          } else {
            console.log("获取图层目录接口异常！")
          }
        });
      },

      splitScreen(num) {
        this.isShow = !this.isShow;
        //分屏
        bus.$emit('toggleScreen', {show: this.isShow, screenLength: num,defaultWinInfo:true});
      },

      clearGraphics() {
        g_regionLayer.removeAll();
        g_drawLayer.removeAll();
        g_highLightLayer.removeAll();
        g_bufferLayer.removeAll();
        g_tempLayer.removeAll();
        let mapDiv = document.getElementById("map");
        for (let i = 0; i < g_tempDiv.length; i++) {
          mapDiv.removeChild(g_tempDiv[i]);
        }
        mapDiv = null;
        window.g_tempDiv = [];
        bus.$emit('importRange', "")
      },

      //默认显示的底图
      showDefaultBaseMap(defaultGraphicsLayers) {
        if (g_MapConfig.baseConfig.webgisBasemap) {
          this.baseMap = g_MapConfig.baseConfig.webgisBasemap;
        } else {
          this.$msg.error("请在地图基本设置中设置底图:webgisBasemap");
          return;
        }
        let defaultShowArray = [];
        for (let i = 0; i < this.baseMap.length; i++) {
          let tempIndex = window.allUrlArray.indexOf(this.baseMap[i].url);
          if (tempIndex > -1) {
            let tLayer = window.allSortMapLayers[tempIndex];
            if (tLayer.allSublayers != undefined && tLayer.allSublayers.length > 0) {
              if (tLayer.capabilities == undefined || tLayer.capabilities.exportMap == null || tLayer.capabilities.exportMap.supportsSublayerVisibility) {
                tLayer.allSublayers.find(function (sublayer) {
                  sublayer.visible = tLayer.visible;
                });
              }
            }else if(tLayer != null){
              tLayer.visible = true;
            }
            defaultShowArray.push(tLayer);
          }
        }
        defaultShowArray = defaultShowArray.concat(defaultGraphicsLayers);
        return defaultShowArray;
      },

      showStreetView(){
        this.$refs.streetView.mapClick();
      },

      showHdmQuery(){
        this.$refs.hdmQuery.active();
      },

      addTDTLayer(BaseTileLayer,TileInfo,SpatialReference,request,url){
          let OwnTileLayer = BaseTileLayer.createSubclass({
            properties: {
              urlTemplate: null
            },
            getTileUrl: function (level, row, col) {
              return this.urlTemplate
                .replace('{level}', level)
                .replace('{col}', col)
                .replace('{row}', row)
            },
            fetchTile: function (level, row, col) {
              let url = this.getTileUrl(level+1, row, col)
              return request(url, {
                responseType: 'image'
              }).then(
                function (response) {
                  let image = response.data;
                  let width = this.tileInfo.size[0];
                  let height = this.tileInfo.size[0];
                  let canvas = document.createElement('canvas')
                  let context = canvas.getContext('2d');
                  if (context != null && context != undefined) {
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(image, 0, 0, width, height)
                  }
                  return canvas
                }.bind(this)
              )
            }
          });
          let config = {};
          config['urlTemplate'] = url;
          let lods = [];
          let firstResolution = 0.703125 * 2;
          let firstScale = 295497593.05875003 * 2;
          for (let i = 0; i < 20; i++) {
            firstResolution = firstResolution / 2;
            firstScale = firstScale / 2;
            lods.push({
              level: i,
              levelValue: i + 1,
              resolution: firstResolution,
              scale: firstScale
            });
          }
          let titleInfo = new TileInfo({
            dpi: 90.71428571427429,//解析度，即像素
            rows: 256,
            cols: 256,
            compressionQuality: 0,//压缩像素值
            origin: {
              x: -180,
              y: 90
            },
            spatialReference: {
              wkid: 4490
            },
            lods: lods
          });
          config['tileInfo'] = titleInfo;
          config['spatialReference'] = {
            wkid: 4490
          };
          config['fullExtent'] = {
            xmin: -180,
            ymin: -90,
            xmax: 180,
            ymax: 90,
            spatialReference: {
              wkid: 4490
            }
          };
          let newLayer = new OwnTileLayer(config);
          return newLayer;
      }
    },
  }


</script>
<style scoped lang="scss">
  #map {
    height: 100%;
  }

  .legend {
    position: fixed;
    top: 470px;
    right: 15px;
    border: 0;
    width: 20px;
    height: 20px;


  }
  .addBorderRight{
    border-right:1px solid #ccc
  }
  .identifyBody {

    border: 1px solid #dfdfdf;
    height: 250px;

    ul {
      list-style: none;

      > li {
        line-height: 32px;
        padding: 8px 12px;
        border-bottom: 1px solid #dfdfdf;
        cursor: pointer;

        &:hover {
          background-color: #f4f5f6;
        }
      }
    }
  }
  .scalebarBtn{
    position: fixed;
    bottom: 5%;
    right: 4%;
    margin-bottom: 10px;
    padding:5px;
    background-color: antiquewhite;
    border-radius: 4px;
  }
  .coordinateBtn{
    position: fixed;
    bottom: 2%;
    right:4%;
    padding:5px;
    background-color: antiquewhite;
    border-radius: 4px;
  }
  .addBaseToolsBtn{
    position: fixed;bottom: 2%;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);left:50%;width:158px
  }
  .addTempLayer{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);width:32px;
    height:32px;
  }
  .customPrintBtn{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);z-index:100;width:50px;
    height:50px;
  }

  .styleControlBtn{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);width:50px;
    height:50px;
  }

  .splitScreen {
    position: fixed;
    // top: 310px;
    width:50px;
    height:50px;
    right: 15px;
    z-index: 100;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .clearBtn {
    position: fixed;
    // top: 432px;
    width:32px;
    height:32px;
    right: 15px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    z-index: 100;
  }

  .btn{
    margin-bottom: 15px;
    font-size: 16px;
  }
  .eagle {
    width: 350px;
    height: 350px;
    position: fixed;
    top: 500px;
    right: 15px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 1);
    background-color: #ffffff;

    .eagleIn {
      width: 346px;
      height: 346px;
      position: absolute;
      margin: 2px 2px;

      .eagleRange {
        background-color: rgba(255, 0, 0, 0.3);
        position: absolute;
      }
    }
  }

  .expandDialog {
    width: 325px;
    z-index: 100;
  }

  .header {
    height: 30px;
    line-height: 30px;
    padding: 0 15px 0 10px;
    background-color: #3b86e0;

    > p {
      color: #fff;
    }

    .collapse {
      width: 30px;
      height: 24px;
      line-height: 24px;
      margin-top: 3px;
      margin-right: -10px;
      border-radius: 3px;
      cursor: pointer;
      display: block;
      color: #fff;
      text-align: center;

      &:hover {
        background-color: #2076dd;
      }
    }
  }

  .empty {
    text-align: center;
    line-height: 100px;
    color: #444;
  }

  .dialog-wrap {
    padding: 20px 10px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-top: none;
    max-height: 480px;
    overflow: auto;
  }
</style>



