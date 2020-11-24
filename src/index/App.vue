<template>
  <div id="app">

    <div class="app_side">
      <s-side v-if="temp" :tools="tools" :searchMode="searchMode"></s-side>
    </div>

    <!-- v-if 为懒加载，在默认设置为false的情况下，没有初始化，生命周期钩子不会执行，所以整个先执行的是 map.vue 模块 -->
    <div class="app_map">
      <s-map></s-map>
    </div>

    <div v-if="temp">
      <s-huidong></s-huidong> <!-- 预览、落图 -->
    </div>

    <div v-if="temp && addMode=='independentMap'">

      <!-- 模糊查询 -->
      <s-fuzzy-Search v-if="fuzzy"></s-fuzzy-Search>

      <s-faquery v-if="toolsData.quickLook"></s-faquery>

      <!-- 分屏 --> <!-- <s-screen :screenLength="screenLength" v-if="toolsData.screen"></s-screen> -->
      <s-screen :screenLength="screenLength"></s-screen>
      <identify-out></identify-out> <!-- 多屏对比里面的I查询 -->
      <case-manager></case-manager> <!-- 方案管理 -->

      <!-- 属性查询 -->
      <identify v-if="toolsData.identify"></identify>

      <!-- 时间轴 -->
      <new-time-line v-if="toolsData.timeLine" class="new-time-line" :timeLineData="timeLineData" :style="{left:timeLineLeft}"></new-time-line>

      <!--全屏-->
      <Fullscreen v-if="toolsData.fullscreen"></Fullscreen>

    </div>

    <div class="loading" v-if="statue">
      <div class="layer"></div>
      <Spinner class="load" :message="msg" text-fg-color="#fff"></Spinner>
    </div>

  </div>
</template>

<script>
import sHuidong from "../components/fallingMap";
import SMap from "../components/map";
import SSide from "../components/sidebar";
import SStatistic from "../components/infoStatistic";
import SProject from "../components/projectManage";
import SDialog from "../components/dialog";
import SFaquery from "../components/quickLook";
import topTool from "../components/topTool";
import sAuxiliaryLocation from "../components/auxiliaryLocation";
import urbanRuralStatistic from "../components/urbanRuralStatistic";
import constructionProjectStatistic from "../components/constructionProjectStatistic";
import landUseStatistic from "../components/landUseStatistic";
import Spinner from "vue-simple-spinner";
import bus from "../assets/eventBus";
import importShp from "../components/importShp";
import MajorProjectQuery from "../components/majorProjectQuery";
import sSearchquery from "../components/infoQuery";
import sCatalogue from "../components/catalogue";
import sAncillaryAnalysis from "../components/ancillaryAnalysis";
import complianceReview from "../components/complianceReview";
import conflictDetection from "../components/conflictDetection";
import controlLineDetection from "../components/controlLineDetection";
import sContrast from "../components/multiScreenContrast";
import importCad from "../components/importCad";
import importTxt from "../components/importTxt";
//   import baiduStreetView from '../components/baiduStreetView'
import SFuzzySearch from "../components/fuzzySearch";
// import timeSlider from '../components/timeSlider'
// import {res, Ctools, CsearchMode} from '../test'
import { GET_RoleFunsInfo,GET_YTimeLayerTrees } from "../config/api.js"; //加权限
import { toolsData, Ctools, CsearchMode } from "../config/config.js";
import timeLine from "../components/timeLine";
import newTimeLine from "../components/newTimeLine";

export default {
  data() {
    return {
      timeLineLeft:"40px",
      addMode: "",
      fuzzy: false,
      temp: false,
      showName: "catalogue",
      msg: "加载中...",
      statue: false,
      screenLength: 0,
      /**
       * @param tools  一级菜单数组
       * @param searchMode 二级菜单数组
       */
      tools: [],
      toolbars: [], //右侧工具
      searchMode: [],
      toolsData: {},
      timeLineTitle: "",
      timeLintData: [],
      showLine: true,
      timeLineData:[],
    };
  },

  mounted() {
    let _this = this;
    bus.$on('leftPanelIsExpand', (res) => {
      if(res == true){
        this.timeLineLeft = "40px"
      }else{
        this.timeLineLeft = "40px"
      }
    });

    this.toolsData = toolsData;
    let toolsArr = [], searchArr = [];
    this.addMode = window.addMode;
    if (this.addMode == "independentMap")
    {
        this.$get(GET_YTimeLayerTrees + userId).then(res => {   //获取时间轴数据
          if(res.code == "-1"){
            this.toolsData.timeLine = false;
            console.log(res,'获取时间轴数据')
          }else {
            this.timeLineData = res
          }
        });

      //独立地图需求：需要最全的地图功能，地图图层权限、图层树、查询、书签等功能；
      console.log("独立地图模式");
      for (let toolsChild of Ctools) {
        toolsArr.push(toolsChild.code);
      }
      for (let searchChild of CsearchMode) {
        searchArr.push(searchChild.code);
      }

      //加载当前用户的功能权限（面板功能）
      if( window.roleFuncs != null && window.roleFuncs != undefined){
        // console.log("根据已经获得权限加载")
        this.dealResult(window.roleFuncs,toolsArr,searchArr);
      }else {
        this.$get(GET_RoleFunsInfo + userId).then(res => {
          // console.log(res, '根据服务面板功能权限');
          window.roleFuncs = res;
          _this.dealResult(res, toolsArr, searchArr);
        });
      }
    } else if (this.addMode == "businessInteraction") {
      //地图交互功能需求：预览、定位、落图与业务进行交互，需要地图图层权限控制，加上放大缩小功能，另外加上I查询（点查询）功能（查询输出结果以列表展示，就2列就行），不需要加载图层树服务；
      // console.log("业务交互地图模式");
    } else if (this.addMode == "homeMap") {
      //首页地图需求：需要展示统计图标（功能暂时未添加），不需要调用图层树服务，只需要图层权限的数据。
      // console.log("首页地图模式");
    }

    bus.$on("showDialog", name => {
      console.log(name);
      _this.showName = name;
    });
    bus.$on("setLoad", res => {
      this.statue = res.statue;
      this.msg = res.msg;
    });
    bus.$on("mapOnload", res => {
      this.temp = res.temp;
      this.statue = res.statue;
    });
    bus.$on("toggleScreen", res => {
      _this.screenLength = res.screenLength;
    });
  },

  methods: {

    //处理获取面板权限结果
    dealResult(res,toolsArr,searchArr){
      for (let resChild of res) {
        if (resChild.panelPath == "fuzzySearch") {
          //如果是模糊查询
          this.fuzzy = true;
        } else {
          const index = toolsArr.indexOf(resChild.panelPath);
          if (index != -1) {
            resChild.title = resChild.mapPanelName;
            this.tools.push(Object.assign(Ctools[index], resChild));
          } else {
            resChild.title = resChild.mapPanelName;
            this.tools.push(resChild);
          }
          if (resChild.panelChildren.length > 0) {
            let tempArr = [];
            for (let child of resChild.panelChildren) {
              const searchIndex = searchArr.indexOf(child.panelPath);
              if (searchIndex != -1) {
                resChild.name = child.mapPanelName;
                tempArr.push(
                  Object.assign(CsearchMode[searchIndex], resChild)
                );
              } else {
                child.title = child.mapPanelName;
                tempArr.push(resChild);
              }
              let obj = {};
              obj.name = child.mapPanelName;
            }
            this.searchMode.push(tempArr);
          } else {
            this.searchMode.push([]);
          }
        }
      }
    },

    parseQueryString(url) {
      url = url == null ? window.location.href : url;
      var search = url.substring(url.lastIndexOf("?") + 1);
      if (!search) {
        return {};
      }
      return JSON.parse(
        '{"' +
          decodeURIComponent(search)
            .replace(/"/g, "")
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
          '"}'
      );
    },

    close() {
      this.showLine = false;
    }
  },

  components: {
    SMap,
    SStatistic,
    SSide,
    SProject,
    SDialog,
    SFaquery,
    topTool,
    sAuxiliaryLocation,
    urbanRuralStatistic,
    landUseStatistic,
    constructionProjectStatistic,
    Spinner,
    importShp,
    MajorProjectQuery,
    sSearchquery,
    complianceReview,
    sCatalogue,
    sAncillaryAnalysis,
    conflictDetection,
    controlLineDetection,
    sContrast,
    importCad,
    SFuzzySearch,
    timeLine,
    importTxt,
    newTimeLine,
    sHuidong,
    baiduStreetView: resolve => {
      require(["../components/baiduStreetView"], resolve);
    },
    identify: resolve => {
      require(["../components/identify"], resolve);
    },
    identifyOut: resolve => {
      require(["../components/identifyOutsideMap"], resolve);
    },
    caseManager: resolve => {
      require(["../components/caseManager"], resolve);
    },
    SScreen: resolve => {
      require(["../components/screen"], resolve);
    },
    SCoordinate: resolve => {
      require(["../components/coordinateExport"], resolve);
    },
    SLabel: resolve => {
      require(["../components/label"], resolve);
    },
    SBookmark: resolve => {
      require(["../components/bookmark"], resolve);
    },
    SMeasure:resolve =>{
      require(["../components/measure"],resolve);
    },
    Fullscreen:resolve =>{
      require(["../components/fullscreen"],resolve);
    },
    printExpand:resolve =>{
      require(["../components/printExpand"],resolve);
    },
    controlStyle:resolve =>{
      require(["../components/controlStyle"],resolve);
    },
  }
};
</script>

<style lang="scss">
@import "../assets/style/index.scss";

.sg-form-item-label {
  white-space: nowrap !important;
}

.new-time-line {
  position: absolute;
  bottom: 10px;
}
</style>

