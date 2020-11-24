

<template>
  <div>
      <!-- 百度街景位置 -->
    <div class="item" @click="active" :title="title">
      <i class="fa fa-globe"></i>&nbsp;
      <span>{{title}}</span>
    </div>
    <s-respane :h="h" :w="w"   @pane-close="closePane" name="街景查询结果" v-show="resultPanelIsShow" :y="10" :x="x">

    <div :style="styles" id="streetView">
    <!--<s-respane :h="866" :w="1633"   @pane-close="closePane" name="街景查询结果" v-show="resultPanelIsShow">-->

    <!--<div style="width:1600px;height:800px;float:left;position:absolute" id="streetView">-->
    </div>
    </s-respane>
  </div>
</template>

<script>
   // import {project} from '../config/api.js'
  import {toolClass} from '../config/config.js'
  import SRespane from '@/components/common/resultPanel'
  import {loadModules} from "esri-loader";
  import {options} from "../config";
  // import bus from '../assets/eventBus';
  // import SRespane from '@/components/common/resultPanel'
  export default {
    name: "baiduStreetView",
    data() {
      return {
        projectUrl:"",
        columns: [
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '值',
            key: 'value'
          }
        ],
        data: [],
        layerSelection:[],
        identifyTask: null,
        listData: [],
        resultPanelIsShow:false,

        mapClickEvent:{},
        dom:{},
        SpatialReference:{},
        Graphic:{},
        GeoProjectParameters:{},
        on:{},
        id:"map",
        width:'',
        height:'',
        toolClass:{},
        title:''


      }
    },
    components: {SRespane},

    mounted() {
      if(g_MapConfig.baseConfig.webgisGeo){
        this.projectUrl = g_MapConfig.baseConfig.webgisGeo+"/project";
      }else{
        this.$msg.error("请在地图基本设置中配置arcgis server几何服务的地址:webgisGeo");
        console.log("请在地图基本设置中配置arcgis server几何服务的地址:webgisGeo")
        return;
      }
        this.toolClass=toolClass
        // let baiduAPI = document.createElement('script');
        //      baiduAPI.setAttribute('type', 'text/javascript');
        //      baiduAPI.setAttribute('src','http://api.map.baidu.com/api?v=2.0&ak=zgXdM2fzmBow6R6rAF2xMlKvqNqnGQyr');
        //      document.head.appendChild(baiduAPI);
      this.width = 0.83*window.screen.width + 'px';
      this.height = 0.725*window.screen.height + 'px';
      this.createMap();
      this.ToolText();


    },
    methods: {
      active() {
        // this.data =[]
        // this.listData = [];

        this.mapClick()
      },
      createMap(){
        loadModules(
          [
            "esri/tasks/IdentifyTask",
            "esri/Graphic",
            "esri/tasks/support/IdentifyParameters",
            "dojo/on",
            "dojo/dom",
            "esri/layers/GraphicsLayer",
            "esri/core/watchUtils",
            "esri/geometry/SpatialReference",
            "esri/tasks/GeometryService",
            "esri/tasks/support/ProjectParameters",
          ],
          options
        ).then(([IdentifyTask,Graphic, IdentifyParameters, on, dom, GraphicsLayer,watchUtils,SpatialReference,GeometryService,ProjectParameters]) => {
          this.dom = dom
          this.on = on;
          // this.GraphicsLayer = GraphicsLayer;
          // this.watchUtils = watchUtils;
          this.mapClickEvent = '';
          // this.identifyAllResult=[];
          this.SpatialReference = SpatialReference;
          this.GeometryService = GeometryService;
          this.ProjectParameters = ProjectParameters;
          this.Graphic = Graphic;

        })
      },
      ToolText(){
        let config=window.roleToolkits;
        for (let i = 0; i <config.data.length ; i++) {
          let toolPath=JSON.stringify(config.data[i].toolPath)
          if(toolPath.indexOf('streetView')!=-1){
            this.title=config.data[i].toolName
          }
        }
      },
      mapClick() {
        g_highLightLayer.removeAll();
        this.mapClickEvent = this.on(g_view, "click", this.executeIdentifyTask.bind(this));
        this.dom.byId(this.id).style.cursor = "crosshair";
      },
      executeIdentifyTask() {
        this.dom.byId(this.id).style.cursor = "auto";
        let point = arguments[0].mapPoint;
        this.marker(point);
        let geomSer = new this.GeometryService({url: this.projectUrl});
        let outSpatialReference = new this.SpatialReference({wkid: 4326})
        let params = new this.ProjectParameters({
          geometries: [point],
          outSpatialReference: outSpatialReference,
        });
        let convertor = new BMap.Convertor();
        let pointArr = [];
        // this.resultPanelIsShow = true;
        geomSer.project(params).then((res) => {
          console.log(res[0])
          let x = res[0].x;
          let y = res[0].y;
          let ggPoint = new BMap.Point(x, y);
          pointArr.push(ggPoint);
          convertor.translate(pointArr, 1, 5, this.translateCallback.bind(this))
        });
        if (point) {
          this.mapClickEvent.remove();
        }
      },
      //坐标转换完之后的回调函数
      translateCallback(data){
        let _this = this;
        let point = data.points[0]
        if(data.status === 0) {

          var panoramaService = new BMap.PanoramaService();     //1
          panoramaService.getPanoramaByLocation(point, function(data){      //2
            if (data == null) {
              console.log('no data');
              _this.$msg.info('该点没有全景图数据！')
              return;
            }else{
              _this.resultPanelIsShow = true
              var panorama = new BMap.Panorama('streetView', {
                albumsControl: true,
                albumsControlOptions:{
                  offset:new BMap.Size(0, )  ////设置偏移量，距离上面15px，距离左边100px（距离那边受anchor位置的影响）
                },
                navigationControl: true, //显示导航控件

              });
              panorama.setPosition(point);
            }
          });
        }
      },
      marker(point){

        let symbol = {
          type: "picture-marker",  // autocasts as new SimpleFillSymbol()
          url: require("../assets/images/pointPosition.png"),
          width: "18px",
          height: "18px"
        };
        let graphic = new this.Graphic({
          geometry: point,   // Add the geometry
          symbol: symbol,   // Add the symbol
        });

        g_highLightLayer.graphics.add(graphic);
      },
      closePane(){
        this.resultPanelIsShow = false;
        // g_drawLayer.removeAll();
        // g_tempLayer.removeAll();
        // this.listData = [];
      }
    },
    computed:{
      styles(){
        let style = {}
        style['float'] = 'left'
        style['position'] = 'absolute'
        style['width'] = this.width
        style['height'] = this.height
        return style
    },
      h(){
        let H = 0.8*window.screen.height;
        return H;
      },
      w(){
        let W = 0.85 *window.window.screen.width;
        return W;
      },
      x(){
        let X = 0.07*window.window.screen.width;
        return X;
      },
      // y(){
      //   let Y = 0.8*window.screen.height;
      //   return Y;
      // },


  }
  }
</script>

<style scoped lang="scss">
  .baiduStreetViewBtn{
    position: fixed;
    right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    width:50px;
    height:50px;
  }
  .btn{
    margin-bottom: 15px;
    font-size: 20px;
  }
  .title{
    position: absolute;
    white-space: nowrap;
    margin: 0px;
    padding:0px;
    bottom:4px;
    font-size:0.5em;
  }
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
  .header {
    height: 30px;
    line-height: 30px;
    padding: 0 15px 0 10px;
    background-color: #3b86e0;
    color: #fff;
    > i {
      width: 30px;
      height: 24px;
      line-height: 24px;
      margin-top: 3px;
      border-radius: 3px;
      background-size: 12px 12px;
      text-align: center;
      cursor: pointer;
      margin-right: -10px;
      &:hover {
        background-color: #2076dd;
      }
    }
  }
  .dialog-wrap{
    height:520px;
    overflow:auto;
    overflow-x:hidden;
    border-right: 1px solid #a9a9a929;
  }
  .res-pane {
    background-color: #fff;
    z-index: 10000;
    position: fixed !important;
    // visibility: hidden;

    border:1px solid #e4e4e4;
    box-shadow: 0 2px 10px 0px rgba(0,0,0,0.2);

  }
</style>
