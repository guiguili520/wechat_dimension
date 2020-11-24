<template>
  <div id="Faquery">
    <div style="top: 27px;right: 320px;position: fixed;" class="inputsss"> <!-- v-if="toolsData.quickLook" -->
      <sg-input v-model="searchValue" placeholder="请输入地名或坐标点"
                 @on-focus="searchList=true" @on-enter ="enterEvent" @on-clear="close" ref="searchTxt"
                style="width: 125%;">
        <sg-button slot="append" type="primary" @click="queryBtn" id="queryvalue">搜索</sg-button>
      </sg-input>
      <div class="dialog-wrap" id="searchselect" v-show="resultPanleIsShow">
        <ul class="placeName" v-show="resultPanleIsShow" >
          <li v-for="(item) in queryList" @click="placeSelect(item)">{{item}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
  import {toolsData} from '../config/config.js'
  import Faquery from "../classic/widget/QuickLook";
  import configDataInfo from '../../public/web/config.json';

  export default {
    name: "SFaquery",
    data() {
      return {
        resultPanleIsShow:false,
        find:{
          url:"",
          // fieldAlias:"名称",
          fieldName:"名称",
          layerIds:[0]
      },
      //   find:{
      //     url:"http://192.168.10.115:6080/arcgis/rest/services/DG/CoreData/MapServer/",
      //     fieldAlias:"项目名称",
      //     fieldName:["XMMC"],
      //     layerIds:[10]
      //   },
        features: [],
        feature: {},
        searchValue: '',
        point: [],
        queryList: [],
        Faquery: '',// url: 'http://192.168.10.115:6080/arcgis/rest/services/DG/CoreData/MapServer/',
        searchList: false,
        fieldInfos:[],
        isAddFocus: true,
        toolsData:{},
        isLocalSeach:true,
        bdAddressService:""
      }
    },
    created(){

    },
    mounted() {
      if(!g_MapConfig.toolsConfig.quickLook){
        console.log("缺少快速查询功能相关配置。功能标识：quickLook")
        this.isLocalSeach = false;
      }
      if(configDataInfo.BDAddressService)
        this.bdAddressService = configDataInfo.BDAddressService;

      if((this.bdAddressService == undefined || this.bdAddressService == "") && this.isLocalSeach ==false){
        console.log("缺少快速查询功能相关配置。功能标识：quickLook，设置原生查询或者百度地名地址查询服务！")
        return;
      }

      this.Faquery = new Faquery(); //具体查询功能模块
      this.Highlight = new SgMap.Highlight();
      this.Statistic = new SgMap.InfoStatistic();

      //原生查询
      if(this.isLocalSeach) {
        this.find = g_MapConfig.toolsConfig.quickLook;
        this.toolsData = toolsData;
        this.Faquery.event.on({
          'getListData': (res) => {
            console.log(res)
            if (res.features.length > 0) {
              let fieldAlias = res.fields;
              this.fieldInfos.length = [];
              for (let i = 0; i < fieldAlias.length; i++) {
                this.fieldInfos.push({
                  fieldName: fieldAlias[i].name,
                  label: fieldAlias[i].alias
                })
              }
              this.features = res.features;
              let tempArray = [];
              for (let i = 0; i < this.features.length; i++) {
                if (tempArray.indexOf(this.features[i].attributes[this.find.fieldName.toUpperCase()]) < 0) {
                  tempArray.push(this.features[i].attributes[this.find.fieldName.toUpperCase()])
                }
              }
              this.queryList = tempArray;
              this.queryPlacename();
              this.resultPanleIsShow = true;
            } else {
              this.$msg.info("查询结果为空！");
              this.queryList = []
              this.resultPanleIsShow = false;
            }
          }
        })
      }else if(this.bdAddressService != "") {
        this.Faquery.event.on({
          'getBDListData': (res) => {
            console.log(res);
            if(res.code ==0) {
              this.constructBDResult(res);
            }else{
              this.$msg.info("查询结果为空！");
              this.queryList = []
              this.resultPanleIsShow = false;
            }
          }
        });
      }
    },

    methods: {
      constructBDResult(res){
        this.fieldInfos = [];
        this.fieldInfos.push({
          fieldName: "name",
          label: "名称"
        });
        this.fieldInfos.push({
          fieldName: "address",
          label: "地址"
        });
        this.fieldInfos.push({
          fieldName: "province",
          label: "省份"
        });
        this.fieldInfos.push({
          fieldName: "city",
          label: "城市"
        });
        this.fieldInfos.push({
          fieldName: "area",
          label: "区/县"
        });

        this.features = res.results;
        let tempArray = [];
        for (let i = 0; i < this.features.length; i++) {
          tempArray.push(this.features[i].attributes.name);
        }
        this.queryList = tempArray;
        this.queryPlacename();
        this.resultPanleIsShow = true;
      },

      enterEvent(event){
        if(event.keyCode===13){
          this.$refs.searchTxt.blur();
          this.searchList = false;
          this.queryBtn();
          return
        }
      },

      getOptions() {
        let search = this.searchValue;
        if (search != "") {//如果输入不为空
          if (this.isLocalSeach) {
            this.Faquery.getsearchList(this.find, search);
          } else {
            this.Faquery.getBDSearchList(configDataInfo.BDAddressService, search, configDataInfo.JWDSpatialreference);
          }
        } else {
          this.queryList = []
          this.resultPanleIsShow = false;
        }
      },

      queryBtn() {
        if (this.searchValue.indexOf(',') < 0) {
          this.getOptions();
        } else {
          this.point = this.searchValue.split(',');
          if (this.point.length == 2) {
            let isNumber;
            for (let i = 0; i < this.point.length; i++) {
              isNumber = this.checkNumber(this.Trim(this.point[i]))
              if (isNumber == false) {
                console.log("输入的值不符合规范,请重新输入！")
                break
              }
            }
            if (isNumber == true) {
              //经纬度坐标查询
              this.coordinatePointQuery()
            }
            ;
          }
        }
      },

      queryPlacename() {
        g_highLightLayer.removeAll() //移除高亮图层中所有的graphic
        let geometries=[];
        for (let i = 0; i < this.features.length; i++) {
          geometries.push(this.features[i].geometry)
        }
        let graphics = this.Highlight.geometriesFixedPosition(geometries);
        for (let i = 0; i < graphics.length; i++) {
          graphics[i].attributes = this.features[i].attributes;
          graphics[i].popupTemplate = {
            title: "属性表",
            content: [{
              type: "fields",
              fieldInfos: this.fieldInfos
            }],
          }
        }
      },

      coordinatePointQuery() {
        let geo = {
          "type": "point",
          "spatialReference": g_spatialReference,
          "x": parseFloat(this.Trim(this.point[0])),
          "y": parseFloat(this.Trim(this.point[1])),
        };
        this.Statistic.pointLocation(geo);
      },

      //去掉字符串前后空格
      Trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
      },

      //检验字符串是否是数字
      checkNumber(theObject) {
        var reg = /^[0-9]+.?[0-9]*$/;
        if (reg.test(theObject)) {
          return true;
        }
        return false;
      },

      placeSelect(data) {

        this.searchValue = data
        this.$refs.searchTxt.focus();
        this.searchList = false;
        this.queryBtn();
      },

      close() {
        this.queryList = []
        this.resultPanleIsShow = false;
        this.searchValue = ''
        this.Statistic.clearGraphics();

      }
    }
  }
</script>

<style lang="scss">
  #Faquery {
    .sg-input-group-append {
      .searchbutton {
        background-color: #3b86e0;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      .sg-btn {
        color: #fff;
        font-weight: 900;
      }
    }
    .sg-input-group-prepend {
      background-color: #fff;
      display: none;
    }
    .sg-select {
      background-position: 8% 50%;
      background-image: url("../assets/images/selectIcons.png");
      background-repeat: no-repeat;
      background-origin: content-box;
    }
    .sg-select-single {
      .sg-select-selection {
        span {
          padding-left: 25px;
        }
      }
    }
    #searchselect {
      max-height: 400px;
      overflow: auto;
      width: 335px;
      margin-left: 0px;
      outline: none;
      border-left: 1px solid #dddee1;
      border-right: 1px solid #dddee1;
      border-bottom: 1px solid #dddee1;
      background: #fff;
      .placeName {
        line-height: 28px;
        font-size: 12px;
        li {
          background-position: 1% 50%;
          padding-left: 20px;
          background-size: 16px 15px;
          background-image: url("../assets/images/pointPosition.png");
          background-repeat: no-repeat;
        }
        li:hover {
          background-color: #dddee1;
        }
      }
    }
    .emptybutton {
      position: relative;
      left: 310px;
      z-index: 3;
      top: 30px;
      cursor: pointer;
    }
  }

</style>

