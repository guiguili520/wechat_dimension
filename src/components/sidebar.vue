<template>
  <div ref="sidebarDiv" :class="['sidebar',{expand:isExpand}]" :style="{'top': siderbarClassTop}">
    <div class="logo" style="display: none;"></div>

    <div class="navBox">
      <div class="toolIcon">
        <li @click="showTool()">
          <a class="fa fa-paper-plane"></a>
        </li>
      </div>
      <ul v-show="showToolFlag">
        <li v-for="(item,index) in tools" :key="index"
            :class="['activeIndex'+index,{active:checkIndex==index+1?true:false}]"
            @click="oncheck(index,item)">

          <p style="margin-top:10px" :class="toolicon(index)"></p>
          <p>{{item.title}}</p>
        </li>
      </ul>
    </div>
    <div :class="['viewNav',{isExpand:!isExpand}]">
      <div class="viewNavBox">
      <ul class="viewNav_top" ref="viewNav_top">
        <li v-for="(item,index) in searchMode[checkIndex-1]" :key="index"
            @click="checkSearch(index,item.name,item.code)">
          <span class="view_icon_box" :style="{backgroundImage:'url('+item.img+')'}"></span>
          <p :style="{'color':searchIndex==index?'#3385ff':'#2e3334'}">{{item.name}}</p>
        </li>
      </ul>

      <div class="viewNav_content" :style="{'max-height': viewNav_content_H+ 'px' }">
        <s-project v-if="showName=='projectManage'"></s-project>
        <!--信息查询-->
        <s-searchquery v-if="showName=='infoQuery'"></s-searchquery>
        <major-project-query v-if="showName=='majorProjectQuery'"></major-project-query>
        <s-statistic v-if="showName=='infoStatistic'"></s-statistic>
        <!--自定义查询-->
        <s-customquery v-if="showName=='customQuery'"></s-customquery>
        <s-auxiliary-location v-if="showName=='auxiliaryLocation'"></s-auxiliary-location>
        <urban-rural-statistic v-if="showName=='urbanRuralStatistic'"></urban-rural-statistic>
        <construction-project-statistic v-if="showName=='constructionProject'"></construction-project-statistic>
        <land-use-statistic v-if="showName=='landUseStatistic'"></land-use-statistic>
        <import-shp v-if="showName=='importShp'"></import-shp>
        <compliance-review v-if="showName=='complianceReview'"></compliance-review>
        <s-catalogue v-show="showName=='catalogue'"></s-catalogue>
        <ancillary-analysis v-show="showName=='fzfx'"></ancillary-analysis>
        <conflict-detection v-if="showName=='conflictDetection'"></conflict-detection>
        <control-line-detection v-if="showName=='controlLineDetection'"></control-line-detection>
        <s-contrast v-if="showName=='multiScreenContrast'"></s-contrast>
        <import-cad v-if="showName=='importCad'"></import-cad>
        <import-txt v-if="showName=='importTxt'"></import-txt>
        <!--以下为河源需求-->
        <s-fuzzy-search v-if="showName=='fuzzy'"></s-fuzzy-search>
        <!-- 高级查询 -->
        <advanced-query v-show="showName =='gjcx'"></advanced-query>
        <!-- 新的打印 -->
        <new-print v-show="showName =='ctdy'"></new-print>
        <!-- 通用查询统计-->
        <common-statics v-show="showName == 'commonStatics'"></common-statics>
        <!--市政道路统计-->
        <municipal-road-statics v-show="showName == 'szdltj'"></municipal-road-statics>
      </div>
        <div class="closeSide" @click="close" v-if="isExpand"></div>
    </div>
    </div>
  </div>
</template>

<script>
  import bus from '../assets/eventBus';
  import {GET_RoleFunsInfo} from '../config/api.js'//加权限
  import configDataInfo from '../../public/web/config.json'
  import sidebar from '../assets/style/sidebar.scss'
  import commonStatics from "./staticsinfo/commonStatics";

  export default {
    components: {
      ImportCad: resolve => {
        require(['./importCad'], resolve)
      },
      ImportTxt: resolve => {
        require(['./importTxt'], resolve)
      },
      sSearchquery: resolve => {
        require(['./infoQuery'], resolve)
      },
      MajorProjectQuery: resolve => {
        require(['./majorProjectQuery'], resolve)
      },
      SStatistic: resolve => {
        require(['./infoStatistic'], resolve)
      },
      sCustomquery: resolve => {
        require(['./customQuery'], resolve)
      },
      sAuxiliaryLocation: resolve => {
        require(['./auxiliaryLocation'], resolve)
      },
      urbanRuralStatistic: resolve => {
        require(['./urbanRuralStatistic'], resolve)
      },
      constructionProjectStatistic: resolve => {
        require(['./constructionProjectStatistic'], resolve)
      },
      landUseStatistic: resolve => {
        require(['./landUseStatistic'], resolve)
      },
      importShp: resolve => {
        require(['./importShp'], resolve)
      },
      SCoordinate: resolve => {
        require(['./coordinateExport'], resolve)
      },
      complianceReview: resolve => {
        require(['./complianceReview'], resolve)
      },
      conflictDetection: resolve => {
        require(['./conflictDetection'], resolve)
      },
      controlLineDetection: resolve => {
        require(['./controlLineDetection'], resolve)
      },
      sContrast: resolve => {
        require(['./multiScreenContrast'], resolve)
      },
      sCatalogue: resolve => {
        require(['./catalogue'], resolve)
      },
      ancillaryAnalysis: resolve => {
        require(['./ancillaryAnalysis'], resolve)
      },
      SProject: resolve => {
        require(['./projectManage'], resolve)
      },
      SFuzzySearch: resolve => {
        require(['./fuzzySearch'], resolve)
      },
      advancedQuery: resolve => {
        require(['./advancedQuery'], resolve)
      },
      newPrint:resolve=>{
        require(['./newPrint'],resolve)
      },
      commonStatics:resolve=>{
        require(['../components/staticsinfo/commonStatics'],resolve)
      },
      municipalRoadStatics:resolve=>{
        require(['../components/staticsinfo/municipalRoadStatics'],resolve)
      }
    },
    props:['tools','searchMode'],
    data() {
      return {
        addMode:'',
        siderbarClassTop:"0px",
        checkIndex: 0,
        isExpand: false,
        searchIndex: 0,
        clickRecord: {
          checkIndex: 0,
          searchIndex: 0
        },
        showName: '',
        winH: null,
        viewNav_content_H:0,
        showToolFlag:false
      }
    },
    watch:{
      checkIndex:function(newCheckIndex,oldCheckIndex){
         let clientHeight = document.documentElement.clientHeight;
        let navh = 5;
         if(this.checkIndex >0) {
           let navLength = this.searchMode[this.checkIndex - 1].length;
           if (navLength > 0) {
             let navRows = Math.floor(navLength / 4);
             navh = navRows * 107;
           }
         }
         this.viewNav_content_H=clientHeight-93-navh;
      }
    },
    methods: {
      toolicon(index) {
        //按钮图标配置 图标查询网址 http://fontawesome.dashgame.com/#basic
        let classes = ["fa fa-newspaper-o", "fa fa-object-group", "fa fa-laptop", "fa fa-print", "fa fa-search-plus", "fa fa-paper-plane", 'fa fa-star-o', 'fa fa-pagelines'];
        return classes[index];
      },
      showTool() {
        let _this = this;
        if (_this.showToolFlag) {
          _this.showToolFlag = false;
          _this.close();
        } else {
          _this.showToolFlag = true;
          _this.checkIndex = 0;
        }
      },
      oncheck(idx, item) {
        console.log(item);
        let name = item.mapPanelName;
        let code = item.panelPath;
        // console.log(idx)
        this.clickRecord = {
          checkIndex: idx,
          searchIndex: 0
        }
        if (this.checkIndex == idx + 1) {
          this.checkIndex = 0;
          this.isExpand = false
          bus.$emit('toggleDialog', {isShow: false, name: ''});
          bus.$emit('showDialog', '');

        } else {
          this.checkIndex = idx + 1;
          this.isExpand = true;

          bus.$emit('showFuzzyBody', false);
          // this.computedHeight();
          this.showDialog(name, code);
          if(item.panelChildren.length){
            let name = item.panelChildren[0].mapPanelName;
            let code = item.panelChildren[0].panelPath;
            this.showDialog(name, code);
          }
          this.searchIndex = 0
        }
        bus.$emit('leftPanelIsExpand', this.isExpand);
        // console.log(this.clickRecord)
        bus.$emit('indexRecord', this.clickRecord);
      },

      checkSearch(idx, name, code) {
        // console.log(idx);
        this.searchIndex = idx;
        this.clickRecord.searchIndex = idx
        // console.log(this.clickRecord)
        bus.$emit('indexRecord', this.clickRecord);
        this.showDialog(name, code);
      },

      showDialog(name, code) {
        this.GLOBAL.dialog = {code: code, name: name};
        this.showName = code;
        // console.log(this.GLOBAL);
        bus.$emit('showDialog', code);
        bus.$emit('toggleDialog', {isShow: true, name: name});
      },

      // computedHeight() {
      //   let arr = [0, 108, 108, 0, 217];
      // },

      showDialog(name, code) {
        this.GLOBAL.dialog = {code: code, name: name};
        this.showName = code
        bus.$emit('showDialog', code);
        bus.$emit('toggleDialog', {isShow: true, name: name});
      },

      // computedHeight() {
      //   let arr = [0, 108, 108, 0, 217];
      //   let clientHeight = document.documentElement.clientHeight;
      //   this.winH = clientHeight - arr[this.clickRecord.checkIndex];
      //   console.log(clientHeight)
      // },

      close() {
        this.isExpand = false;
        bus.$emit('leftPanelIsExpand', this.isExpand);
        this.checkIndex = 0;
      },

      parseQueryString(url) {
        url = (url == null || url == undefined) ? window.location.href : url;
        let qIndex = url.lastIndexOf('?');
        if (qIndex != -1) {
          let search = url.substring(qIndex + 1)
          if (!search) {
            return {}
          }
          return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
        } else
          return {};
      },

      //默认展开功能
      expandDefaultFunc() {
        // console.log(window.location.href, '当前地址URL');
        let funCode;
        let params = this.parseQueryString(window.location.href);
        if (JSON.stringify(params) != "{}" && params.hasOwnProperty("showFunc")) {
          // console.log(params.showFunc, '当前地址URL默认打开的功能');
          funCode = params.showFunc;
        } else if (configDataInfo.DefaultShowFunc) {
          // console.log(configDataInfo.DefaultShowFunc, '配置文件默认打开的功能');
          funCode = configDataInfo.DefaultShowFunc;
        }
        this.openFuncPanel(funCode);
      },

      openFuncPanel(funCode) {
        console.log("当前功能的code:"+funCode);

        if (funCode != undefined && funCode != '' && funCode != null) {
          let searchRs, dIndex;
          for (let i = 0; i < this.tools.length; i++) {
            let current = this.tools[i];
            if (current.panelPath == funCode) {
              searchRs = current;
              dIndex = i;
              break;
            }
          }
          // console.log("找到的功能序号：index:"+dIndex);
          if (searchRs != null) {
            this.showToolFlag = true;
            this.oncheck(dIndex, searchRs);
          }
        }
      },

      parseQueryString2() {
        let name, value;
        let str = location.href; //取得整个地址栏
        // var str='http://192.168.10.32:8090/webgis/index.html?sel=1,0'; //取得整个地址栏
        let num = str.indexOf("?")
        str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]
        let arr = str.split("&"); //各个参数放到数组里
        for (let i = 0; i < arr.length; i++) {
          num = arr[i].indexOf("=");
          if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            this[name] = decodeURIComponent(value);
          }
        }
      }
    },

    mounted() {
      let _this = this;
      let clientHeight = document.documentElement.clientHeight;
      _this.viewNav_content_H = clientHeight
      _this.addMode = window.addMode;

      if (_this.addMode == "independentMap") {
        //独立地图需求：需要最全的地图功能，地图图层权限、图层树、查询、书签等功能；
        console.log('独立地图模式');
        g_view.when(() =>{
          setTimeout(()=>{
            _this.expandDefaultFunc(); //默认展开功能，获取地址栏配置的参数
          },1500);
        });

        if(window.roleFuncs != null && window.roleFuncs != undefined){
          let res = window.roleFuncs;
          if (res.code == -1 && res.exceptionMsg == "当前用户没有功能权限") {
            let sd = document.getElementsByClassName("navBox");
            if (sd != null && sd != undefined && sd.length > 0)
              sd[0].style.display = "none";
          } else {
            for (let resChild of res) {
              if (resChild.panelPath == "fuzzySearch") {
                _this.siderbarClassTop = "78px"
                _this.viewNav_content_H = clientHeight - 98;
              }
            }
          }
          window.roleFuncs = null;
        }else {
          _this.$get(GET_RoleFunsInfo + userId).then(res => {
            if (res.code == -1 && res.exceptionMsg == "当前用户没有功能权限") {
              let sd = document.getElementsByClassName("navBox");
              if (sd != null && sd != undefined && sd.length > 0)
                sd[0].style.display = "none";
            } else {
              for (let resChild of res) {
                if (resChild.panelPath == "fuzzySearch") {
                  _this.siderbarClassTop = "78px"
                  _this.viewNav_content_H = clientHeight - 48;
                }
              }
            }
            window.roleFuncs = null;
          })
        }
        window.g_view.on("pointer-down",(evt)=>{
          if(!this.isExpand){
            this.showToolFlag=false;
          }
        });

      } else if (_this.addMode == "businessInteraction") {
        //地图交互功能需求：预览、定位、落图与业务进行交互，需要地图图层权限控制，加上放大缩小功能，另外加上I查询（点查询）功能（查询输出结果以列表展示，就2列就行），不需要加载图层树服务；
        // console.log('业务交互地图模式')
        let sd = document.getElementsByClassName("navBox");
        if (sd != null && sd != undefined && sd.length > 0)
          sd[0].style.display = "none";
      } else if (this.addMode == "homeMap") {
        //首页地图需求：需要展示统计图标（功能暂时未添加），不需要调用图层树服务，只需要图层权限的数据。
        // console.log('首页地图模式')
        let sd = document.getElementsByClassName("navBox");
        if (sd != null && sd != undefined && sd.length > 0)
          sd[0].style.display = "none";
      }

      bus.$on('displayFuzzySearch', (res) => {
        _this.$nextTick(() => {
          console.log(_this.$refs.sidebarDiv)
        })
      })
      bus.$on('shandeSide', (res) => {
        _this.isExpand = res;
      });
      bus.$on('initSideIndex', () => {
        _this.checkIndex = 0
      })
      bus.$on('resetIndex', (res) => {
        _this.checkIndex = res.checkIndex + 1
        _this.searchIndex = res.searchIndex
      })
      bus.$on('isExpand', () => {
        _this.isExpand = false;
        _this.checkIndex = 0;
      })
      // window.onresize = () => {
      //   this.computedHeight();
      // }
    }
  }
</script>

<style scoped lang="scss">
  $arr: (
    (normal:'module.png', on:'module-active.png', class: item1),
    (normal:'search.png', on:'search-active.png', class: item2),
    (normal:'search2.png', on:'search2-active.png', class: item3),
    (normal:'file.png', on:'file-active.png', class: item4),
    (normal:'map.png', on:'map-active.png', class: item5),
    (normal:'map.png', on:'map-active.png', class: item6),
    (normal:'map.png', on:'map-active.png', class: item7)
  );
  $site: (
    (normal:'fuzhu.png'),
    (normal:'xiangmu.png'),
    (normal:'chenggui.png'),
    (normal:'tugui.png'),
    (normal:'yijian.png'),
    (normal:'lianggui.png'),
    (normal:'shencha.png'),
  );
  @mixin background($img) {
    background-image: url('../assets/images/' +$img);
    background-position: center;
    background-repeat: no-repeat;
  }



  .viewNav {
    width: 350px;
    // height:200px;
    background: transparent;
    // flex-shrink: 0;
    // flex-grow: 1;
    position: fixed;
    top: 73px;
    left: 88px;
    &.isExpand{
      display: none;
    }

    .closeSide {
      width: 30px;
      height: 81px;
      position: absolute;
      left: 346px;
      top: 50%;
      transform: translateY(-40px);
      @include background('sidebtn.png');
      cursor: pointer;
      z-index: -1;
    }
    .viewNav_content{
      background: white;
      padding-bottom: 10px;
      border-bottom: 1px solid #dfdfdf;
      border-right: 1px solid #dfdfdf;
      border-left: 1px solid #dfdfdf;
      border-radius:0 0 5px 5px;
      min-height: 80px;
      overflow: auto;
    }
    .viewNav_top {
      padding: 0 10px;
      margin-bottom: 0;
      text-align:center;
      list-style: none;
      border-right: 1px solid #dfdfdf;
      border-left: 1px solid #dfdfdf;
      border-top: 1px solid #dfdfdf;
      border-radius:5px 5px 0 0;
      min-height: 5px;
      background: #fff;
      &:after{
        display:block;
        clear:both;
        height:0;
        content: "";
        visibility: hidden;
        overflow:hidden;
      }

      li {
        list-style: none;
        width: 82px;
        height: 90px;
        overflow: hidden;
        position: relative;
        float: left;
        text-align: center;
        span {
          display: block;
          width: 40px;
          height: 40px;
          margin: 20px 20px 0 20px;
          background: #3b86e0;
          border-radius: 100%;
          background-position: center;
          background-repeat: no-repeat;
        }

        p {
          top: 75px;
          left: 10px;
          width: 58px;
          color: #2e3334;
          margin: 0 auto;
        }



        .viewNav_top:after {
          content: "";
          height: 0;
          line-height: 0;
          display: block;
          visibility: hidden;
          clear: both;
        }
      }

      .isExpand {
        position: absolute;
        left: -500px;
        //    transition: left .5s;
      }

      .expand {
        // transition: width .5s;
        width: 410px;
      }
    }
  }
 .viewNavBox{
    position: relative;
    max-height: calc(100% - 160px);
    background-color: white;
  }

</style>
