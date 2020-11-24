<!--辅助分析-->
<template>
  <div style="height:100%">
    <div class="ancillaryAnalysis">
      <div class="iq-content" style="background: #f5f5f5;">
        <sg-form :label-width="60" >
          <s-range
            :type="rangeType"
            ref="range"
            :drawId="drawId"
            @draw-geometry="drawGeometry"
            @import-cadShp="importCadShp"
            @clear-all="clear"></s-range>
        </sg-form>
        <div class="geoTable" style="overflow-x: hidden">
          <sg-table
            ref="selection"
            :show-page="false"
            :columns="columns"
            :data="data"
            @on-selection-change="handleSelectChange"
            @on-row-click="location" style="height:140px;overflow-x:hidden;"></sg-table>
        </div>
        <span style="margin-left: 12px;">分析类型：</span>
        <div class="treeContent" :style="{'max-height': tree_content_H+ 'px' }">
          <sg-tree ref="fzfxTree" :data="treeData" show-checkbox :render="renderContent"></sg-tree>
        </div>
      </div>
      <sg-button type="primary" @click="analysis()"
                 style="margin-top:5px;margin-left: 130px;">分析</sg-button>
    </div>
    <s-respane
      v-if="resultPanelIsShow" ref="refPanel"
      name="分析结果列表"
      @pane-close="closePane"
      @card-hidden="hiddenCard"
      :exportReport="true"
      style="z-index: 3;border:none"
      :h="h"
      :w="w"
      :y="10"
      :x="x">
      <div :style="styles" class="contentCls" v-show="resultCardShow">
        <sg-tab style="height: 100%;" type="card" :animated="false" v-model="tabClickedName" @on-click="tabChangeEvent(tabClickedName)">
          <sg-tab-pane :label="i.fxmc" v-for="(i,index) in resultData" :key="index" :name="i.fxmc">
            <div v-if="i.result.data!=undefined" style="height: 100%">
              <div style="text-align: center;width: 100%;height: 20px">
                <span style="font-size: large" v-if="i.result.title!=undefined">{{i.result.title}}</span>
              </div>
              <sg-tab :value="analysisTabName">
                <sg-tab-pane label="分析统计信息" name="analysisTab1">
                  <div style="text-align:right;width: 100%;height: 35px;margin-bottom: 5px;">
<!--                    <div class="flex" v-if="i.isShowFilter">-->
<!--                      <span style="margin-right: 10px;font-weight:bold">数据筛选</span>-->
<!--                      <span style="margin-right: 10px">地类名称 |</span>-->
<!--                      <sg-checkbox label="0" :indeterminate="false" :value="i.checkAll" style="margin-right: 5px" @click.prevent.native="showAllEvent">全部</sg-checkbox>-->
<!--                      <sg-checkbox-group v-for="fc in i.filterConfig" v-model="i.selFilter" @on-change="filterShowState">-->
<!--                        <sg-checkbox :label="fc.value" style="margin-right: 8px">{{fc.name}}</sg-checkbox>-->
<!--                      </sg-checkbox-group>-->
<!--                    </div>-->
                    <div style="horiz-align: center; vertical-align: center">
                      <sg-button style="height: 35px;width: 100px;margin-right: 15px;padding: 5px 5px" type="primary" v-show="i.result.geodata != undefined"
                                 @click="exportJBFXYZFun(i.result.geodata,2)">导出压占数据</sg-button>
                      <sg-button style="height: 35px;width: 100px;" type="primary"
                                 @click="exportExcelFun(i.tableHeader, i.result.data, i.result.title)">导出Excel</sg-button>
                      <span style="margin-left: 10px" v-if="i.result.unit!=undefined">单位：</span>
                      <select @change="changeAreaUnit(i)" :id="i.fxmc" v-model="selectedUnit" v-if="isNeedMoreUnit">
                        <option value="1">平方米</option>
                        <option value="0.0001">公顷</option>
                        <option value="0.0015">亩</option>
                      </select>
                      <span v-else>{{i.result.unit}}</span>
                    </div>
                  </div>
                  <div class="resultTable">
                    <sg-table id = "fxjgTable"
                              :show-page="false"
                              border
                              :columns="i.tableHeader"
                              :data="i.result.data"
                              @on-row-click="onSelectYzBlock"></sg-table>
<!--                    <sg-table v-if="!i.checkAll" id = "fxjgTable2"-->
<!--                              :show-page="false"-->
<!--                              border-->
<!--                              :columns="i.filterTableHeader"-->
<!--                              :data="i.result.data"-->
<!--                              @on-row-click="onSelectYzBlock"></sg-table>-->
                  </div>
                </sg-tab-pane>
                <sg-tab-pane v-if="i.result.yzdata != undefined" label="分析详细信息" name="analysisTab2">
                  <div class="flex" v-if="i.isShowFilter" style="margin-bottom: 3px">
                    <span style="margin-right: 10px;font-weight:bold">数据筛选</span>
                    <span style="margin-right: 10px">地类名称 |</span>
                    <sg-checkbox label="0" :indeterminate="false" :value="i.checkAll" style="margin-right: 5px" @click.prevent.native="showAllEvent">全部</sg-checkbox>
                    <div style="float: left;width:900px;height: 50px;">
                    <sg-checkbox-group v-for="fc in i.filterConfig" v-model="i.selFilter" @on-change="filterShowState">
                      <div style="float: left;margin-right: 5px;margin-bottom:5px">
                      <sg-checkbox :label="fc.value" style="margin-right: 8px">{{fc.name}}</sg-checkbox>
                      </div>
                    </sg-checkbox-group>
                    </div>
                  </div>
                  <div style="width: 100%;height: 45px">
                        <sg-button style="height: 35px;width: 110px;margin-left: 10px;float: right" type="primary" @click="removeLandBlock()">剔除地块</sg-button>
                        <sg-button style="height: 35px;width: 110px;margin-left: 10px;float: right" type="primary" @click="exportJBFXYZFun('all',0)">导出红线</sg-button>
                        <sg-button style="height: 35px;width: 127px;margin-left: 10px;float: right" type="primary" @click="exportJBFXYZFun(i.result.yzdata,1,i)" >导出压占地块</sg-button>
                  </div>
                  <div class="resultTable2">
                    <sg-table id = "fxxqTable" :show-page="false" border :columns="i.tableHeaderYZ"
                              :data="i.result.yzdata"
                              @on-select="onSelectLandBlock" @on-select-cancel="onSelectCancel"></sg-table>
                  </div>
                </sg-tab-pane>
                <sg-tab-pane label="统计图表展示" v-if="i.isShowEChart">
                  <div style="width: 100%;height:100%;text-align: center;horiz-align: center;margin:auto 0">
                    <div :id="'areasdiv'+index" style="width: 850px;height: 350px;margin-top: 50px;margin-left:100px"></div>
                  </div>
                </sg-tab-pane>
              </sg-tab>
            </div>
            <div v-else>
              <div v-if="i.result.Details!=null">
                <span style="font-size: initial;margin-left: 350px;color: red;">{{i.result.Details}}</span>
              </div>
              <div v-if="i.result.Message!=null">
                <span style="font-size: initial;margin-left: 350px;color: red;">{{i.result.Message}}</span>
              </div>
            </div>
          </sg-tab-pane>
        </sg-tab>
      </div>

      <!-- 1.0 分析剔除红线导出 -->
      <sg-modal transfer draggable modal-type="alert" :title="winTitleName" ok-text="导 出"
                v-model="isShowJBFXModel" @on-ok="exportJBFXData" :closable="true"
                :width="300" style="z-index: 9999">
        <div style="width: 360px;text-align: center;">
          <span style="color:red;font-weight: bold;font-size: larger">请选择导出数据格式：</span>
          <div style="height: 30px;margin-top: 10px;font-size:medium">
            <sg-radio-group v-model="selJBFXType">
              <sg-radio label="0" style="margin-right: 10px">cad格式</sg-radio>
              <sg-radio label="1" style="margin-right: 10px">shp格式</sg-radio>
              <sg-radio label="2">txt格式</sg-radio>
            </sg-radio-group>
          </div>
        </div>
      </sg-modal>

    </s-respane>
  </div>
</template>

<script>
import SRange from "@/components/common/rangeSelect";
import { getRoleAnalyseTree, executeAnalyse } from "../config/api.js";
import SRespane from "@/components/common/resultPanel";
import { loadModules } from "esri-loader";
import { options } from "@/config";
import bus from "../assets/eventBus";
import Highlight from "@/classic/common/Highlight";
import {export2Excel} from '@/classic/common/export2Excel';
import configDataInfo from '../../public/web/config.json';
import Draw from '../classic/common/Draw'
import echarts from 'echarts';

export default {
  name: "aucilaryAnalygis",

  components: {SRespane, SRange},

  data() {
    return {
      selectedUnit:'1',
      isNeedMoreUnit:false,
      Draw: {},
      graphics: [],
      geodata:null,
      attributes:"",
      width: "",
      tree_content_H:0,
      height: "",
      innerWi: 900,
      innerHe: 750,
      analysisTabName: "analysisTab1",
      tabClickedName: "",
      resultPanel: [],
      tableHeaderYZ: [],
      tableHeader: [],
      resultData:[],
      checkedArr: [],
      resultPanelIsShow: false,
      resultCardShow:true,//显示卡片
      cityList: [],
      calculate: {},
      drawId: "fzfx",
      rangeType: ["draw", "import", "identify"],
      geometry: {},
      index: 0,
      data: [],
      columns: [
        {
          type: "selection",
          width: 20,
          align: "center"
        },
        {
          title: "名称",
          key: "name",
          width: 70
        },
        {
          title: "面积（m²）",
          key: "area",
          width:140
        },
        {
          title: "操作",
          key: "action",
          width: 60,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "sg-button",
                {
                  style: {
                    width: "50px",
                    "padding-left": "13px",
                    height: "30px",
                    "padding-top": "7px"
                  },
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params.index);
                      for (let i in this.graphics) {
                        if (this.graphics[i].name == params.row.name) {
                          this.Draw.removeGraphic(this.graphics[i].graphic);
                          window.g_regionLayer.remove(this.graphics[i].graphic);
                          g_highLightLayer.removeAll();
                          this.graphics.splice(i, 1);
                          this.data.splice(params.index, 1);
                        }
                      }
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      treeData: [],
      mapAnalyseForms: [],
      geometryStringInfo: [],
      clipGeometries: [],
      showExportYZInfo:false,
      selectAnalyseUnits:[],
      copyResultData:[], //复制备份数据，应对单位切换
      copyYZResultData:[],//复制压占部分数据
      copyNameIndex:[],
      geometryEngine:null,
      isShowJBFXModel:false,
      selJBFXType:"1", //cad/shp/txt选择的格式
      selExportType:0, //红线、压占数据类型
      currentJBFXData:null,
      tokenData:null,
      winTitleName:'导出红线',
      filterConfig:[], //展示过滤
      selFilter:[], //选中的过滤属性
      currentRemainFields:[],
      chartList:[], //图表集合
    };
  },

  computed: {
    styles() {
      let style = {};
      style["float"] = "left";
      style["position"] = "static";
      style["width"] = '100%';
      style["height"] = '100%';
      return style;
    },
    h() {
      let H = 0.82 * window.screen.height;
      return H;
    },
    w() {//1080-0.72;1366-0.63
      let W='';
      //适应1920，1366分辨率 0.85/0.75
      if(window.window.screen.width==1920){
        W = 0.89 * window.window.screen.width;
      }else if(window.window.screen.width==1366){
        W = 0.89 * window.window.screen.width;
      }else{
        W = 0.89 * window.window.screen.width;
      }
      return W;
    },
    x() {//1920-0.235;1366-0.33
      let X='';
      //适应1920，1366分辨率
      if(window.window.screen.width==1920){
        X = 0.235 * window.window.screen.width
      }else if(window.window.screen.width==1366){
        X = 0.33 * window.window.screen.width
      }else{
        X = 0.235 * window.window.screen.width
      }
      return X;
    }
  },

  mounted() {
    let clientHeight = document.documentElement.clientHeight;
    this.tree_content_H = clientHeight - 410;
    this.Draw = new Draw();
    this.width = 0.83 * window.screen.width + "px";
    this.height = 0.725 * window.screen.height + "px";
    this.innerWi = document.documentElement.clientWidth - 400;
    this.innerHe = document.documentElement.clientHeight - 10;
    this.Highlight = new SgMap.Highlight();
    this.calculate = new SgMap.Calculate();
    if (configDataInfo.IsNeedUnitChange == true)
      this.isNeedMoreUnit = true;
    else
      this.isNeedMoreUnit = false;

    this.$get(getRoleAnalyseTree + userId)
      .then(res => {
        this.treeData = [];
        this.headData = [];
        if (res.length > 0) {

          res.map(item => {
            if (item.itemUrl != "" && item.itemYears != "") {
              let yearArr = item.itemYears.split(",");
              item.selectedYear = yearArr[0];
              this.$set(item, "placeholder", yearArr[0]);
            }
            this.$set(item, "label", item.itemName);
            this.$set(item, "expanded", true);
            this.$set(item, "checked", false);
            this.$set(item, "children", item.childrenForms);

            let headConfigData = [];
            if (item.itemFormat != "") {
              headConfigData = JSON.parse(item.itemFormat);
              if (headConfigData.length > 0) {
                this.setHeadData(headConfigData);
              }
            }
            let headYZ = [];
            if (item.subItemFormat != "") {
              headYZ = JSON.parse(item.subItemFormat);
              if (headYZ.length > 0) {
                this.setHeadData(headYZ);
              }
            }
            this.headData.push({
              fxmc: item.itemName,
              tableHeader: headConfigData,
              tableHeaderYZ: headYZ
            });
            if (item.children.length > 0) {
              this.initRes(item.children);
            }
            this.treeData = res;
          });

        } else {
          console.log("获取辅助分析目录接口异常！");
        }
      })
      .catch(error => {
        console.log(error);
      });

    let _this = this;
    loadModules([
        "esri/geometry/geometryEngine"],options).then(([geometryEngine]) => {
      _this.geometryEngine = geometryEngine;
    });
  },

  methods: {

    //数据统计
    staticChartInfo() {
      let title = this.tabClickedName;
      let rsfind = null;
      let resultIndex = -1;
      if(this.resultData) {
        for (let i = 0; i < this.resultData.length; i++) {
          if (this.resultData[i].fxmc == title) {
            resultIndex = i;
            rsfind = this.resultData[i];
            break;
          }
        }
        if (resultIndex != -1) {
          let chartfind = this.chartList.find(function (sel) {
            return sel.id == "areasdiv" + resultIndex;
          });
          if (chartfind != undefined && chartfind != null)
            return;
        }

        let find = this.checkedArr.find(function (sel) {  //获取配置
          return sel.itemName == title;
        });
        if (find && rsfind && find.staticFields) {
          let sfields = JSON.parse(find.staticFields);
          let gfs = sfields.GroupFields;
          let sf = sfields.StaticFields;
          let chartdata = [];
          let names = [];
          let dataArray = [];
          if (find.itemType == 2) {
            dataArray = rsfind.result.data;
          } else {
            if (rsfind.result.yzdata != undefined && rsfind.result.yzdata.length > 0)
              dataArray = rsfind.result.yzdata;
            else
              dataArray = rsfind.result.data;
          }
          for (let i = 0; i < dataArray.length - 1; i++) {
            let name = dataArray[i][gfs].trim();
            let value = this.toDecimal(dataArray[i][sf]);
            if (names.indexOf(name) == -1)
              names.push(name);
            let tempfind = chartdata.find(function (sel) {
              return sel.name == name;
            });
            if (tempfind == undefined || tempfind == null) {
              chartdata.push({
                name: name,
                value: value
              });
            } else {
              let totalValue = this.toDecimal((tempfind.value + value), 2);
              tempfind.value = totalValue;
            }
          }
          this.$nextTick(() => {
            this.updateChart(names, chartdata, resultIndex); //更新图表
          });
        }
      }
    },

    updateChart(nameData, seriesData,index) {
      let id = "areasdiv"+index;
      let myPie = echarts.init(document.getElementById(id));
      let pieOption = {
        toolbox: {
          feature: {
            saveAsImage: {
              show: true
            },
          },
          top: '0%',
          right: '5%',
        },
        legend: {
          formatter: function (name) {
            if (!name)
              return '';
            if (name.length > 10) {
              name =  name.slice(0,10) + '...';
            }
            return name;
          },
          tooltip: {
            show: true
          },
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 50,
          bottom: 10,
          data: nameData
        },
        series: [
          {
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            selectedMode: 'single',
            data: seriesData,
            // minAngle: 10,
            avoidLabelOverlap: true,
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: function (v) {
                    let text = v.percent+'%' + ' ' + v.name
                    let newParamsName = "";
                    let paramsNameNumber = text.length;
                    let provideNumber = 10;
                    let rowNumber = Math.ceil(paramsNameNumber / provideNumber);
                    if (paramsNameNumber > provideNumber)
                    {
                      for (let p = 0; p < rowNumber; p++) {
                        let tempStr = "";
                        let start = p * provideNumber;
                        let end = start + provideNumber;
                        if (p == rowNumber - 1) {
                          tempStr = text.substring(start, paramsNameNumber);
                        } else {
                          tempStr = text.substring(start, end) + "\n";
                        }
                        newParamsName += tempStr;// 最终拼成的字符串
                      }
                    } else {
                      newParamsName = text;
                    }
                    return newParamsName
                  }
                },
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                },
                labelLine: {show: true}
              }
            }
          }
        ]
      };
      myPie.setOption(pieOption);
      this.chartList.push({
        id:id,
        chart:myPie
      });
    },

    filterShowState() {
      let title = this.tabClickedName;
      let find = this.headData.find(function (sel) {
        return sel.fxmc == title;
      });
      let rsfind = this.resultData.find(function (sel) {
        return sel.fxmc == title;
      });
      if (find && rsfind) {
        let copyyzdata = this.copyYZResultData.find(function (sel) {
          return sel.title == title;
        });
        if (rsfind.selFilter.length > 0) {
          rsfind.checkAll = false;
          let orginalData = JSON.parse(JSON.stringify(copyyzdata.data));
          let filterKey = rsfind.currentFilterSetting.FilterFields;
          let remainValues = rsfind.selFilter; //当前勾选项 rsfind.selFilter
          let filtereddata = [];
          filtereddata = orginalData.filter(function (sel) {
            return remainValues.indexOf(sel[filterKey]) >-1;
          });
          // for (let k = 0; k < orginalData.length; k++) {
          //   let findindex = remainValues.indexOf(orginalData[k][filterKey]);
          //   if (findindex >= 0)
          //     filtereddata.push(orginalData[k]);
          // }
          rsfind.result.yzdata = filtereddata;
        } else {
          rsfind.checkAll = true;
          rsfind.result.yzdata = copyyzdata.data;
        }
      }
    },

    showAllEvent() {
      let title = this.tabClickedName;
      let rsfind = this.resultData.find(function (sel) {
        return sel.fxmc == title;
      });
      let copyyzdata = this.copyYZResultData.find(function (sel) {
        return sel.title == title;
      });
      if (rsfind && copyyzdata) {
        rsfind.checkAll = true;
        rsfind.selFilter = [];
        rsfind.result.yzdata = copyyzdata.data;
      }
    },

    //切换tab,不同的分析事项
    tabChangeEvent(selTitle) {
      let title = selTitle;
      let find = this.checkedArr.find(function (sel) {
        return sel.itemName == title;
      });
      let rsfind = this.resultData.find(function (sel) {
        return sel.fxmc == title;
      });

      if (rsfind && rsfind.isShowFilter == undefined) {
        let filterConfig = [];
        if (find != undefined && find.filterAttributes != null && find.filterAttributes != '') {
          try {
            let exportJson = JSON.parse(find.filterAttributes);  //{"ContainValues":"","FilterFields":""}
            this.$set(rsfind, "currentFilterSetting", exportJson);
            let filterKey = exportJson.FilterFields;
            let yzdata = rsfind.result.yzdata;
            let nameList = [];
            if(yzdata && yzdata.length >0){
              for(let j=0;j<yzdata.length;j++){
                let name = yzdata[j][filterKey];
                if(nameList.indexOf(name) <0){
                  nameList.push(name);
                  filterConfig.push({
                    name: name,  //字段别名
                    value: name  //字段名称
                  });
                }
              }
              this.$set(rsfind, "filterConfig", filterConfig);
              this.$set(rsfind, "selFilter", []);
              this.$set(rsfind, "isShowFilter", true);
            }else {
              this.$set(rsfind, "isShowFilter", false);
              this.$set(rsfind, "filterConfig", []);
              this.$set(rsfind, "selFilter", []);
              console.log('数据展示过滤配置当前配置：' + find.filterAttributes)
            }
            // let ffields = exportJson.ContainValues;
            // if (ffields != "" && ffields != null) {
            //   let splits = ffields.split(',');
            //   for (let i = 0; i < splits.length; i++) {
            //     let sinfos = splits[i];
            //     filterConfig.push({
            //       name: sinfos,  //字段别名
            //       value: sinfos  //字段名称
            //     });
            //   }
            //   this.$set(rsfind, "filterConfig", filterConfig);
            //   this.$set(rsfind, "selFilter", []);
            //   this.$set(rsfind, "isShowFilter", true);
            // } else {
            //   this.$set(rsfind, "isShowFilter", false);
            //   this.$set(rsfind, "filterConfig", []);
            //   this.$set(rsfind, "selFilter", []);
            //   console.log('数据展示过滤配置异常,当前配置：' + find.filterAttributes)
            // }
          } catch (e) {
            console.log('设置的过滤属性json格式异常');
            console.log(e);
          }
        } else {
          this.$set(rsfind, "isShowFilter", false);
          this.$set(rsfind, "filterConfig", []);
          this.$set(rsfind, "selFilter", []);
        }
        if(find!= undefined && find.staticFields != null && find.staticFields != '') {
          this.$set(rsfind, "isShowEChart", true);
          this.staticChartInfo(); //统计图表绘制
        }else {
          this.$set(rsfind, "isShowEChart", false);
        }
      }
    },

    //单位切换
    changeAreaUnit(data) {
      let fxmc = data.fxmc;
      let header = data.tableHeader;
      let index = this.copyNameIndex.indexOf(fxmc);
      if (index != -1) {
        let selObj = document.getElementById(fxmc);
        let selIndex = selObj.selectedIndex;
        let value = selObj.options[selIndex].value;
        let numValue = parseFloat(value);
        let fixNum = 4;
        if (value == "1")
          fixNum = 2;

        for (let j = 0; j < this.resultData.length; j++) {
          if (j === index) {
            let headInfo = this.copyResultData[j];
            let orginalData = JSON.parse(JSON.stringify(headInfo.data));
            let currentData = this.resultData[j].result.data;
            for (let i = 0; i < orginalData.length; i++) {
              let current = orginalData[i];
              let onUse = currentData[i];
              for (let k = 0; k < header.length; k++) {
                let tempHead = header[k];
                if (tempHead.type == "number" && tempHead.key != '' && tempHead.key != null && current[tempHead.key] != 0 && current[tempHead.key] != '' && current[tempHead.key] != undefined) {
                  let computeValue = parseFloat(current[tempHead.key]) * numValue;
                  let finalValue = computeValue.toFixed(fixNum);
                  this.$set(onUse, tempHead.key, finalValue);
                }
              }
            }
          }
        }
      }
    },

    renderContent(h, {root, node, data}) {
      let arr = [];
      if (data.itemUrl != "" && data.itemYears != "") {
        let yearArr = data.itemYears.split(",");
        yearArr.map(i => {
          arr.push(
            h("sg-option", {
              props: {
                value: i
              }
            })
          );
        });
      }

      return h(
        "span",
        {
          style: {
            display: "inline-block",
            width: "82%"
          }
        },
        [
          h("span", [
            h("Icon", {
              props: {
                type: "icon-success"
              },
              style: {
                marginRight: "8px"
              }
            }),
            h("span", {
              class: "sg-tree-title",
              domProps: {
                innerHTML: data.label
              },
              on: {
                click: event => {
                  this.treeData.map(item => {
                    if (item.label == event.currentTarget.innerText) {
                      this.$set(item, "checked", true);
                    }
                    if (item.children.length > 0) {
                      this.updateTreeData(
                        item.children,
                        event.currentTarget.innerText
                      );
                    }
                    return this.treeData;
                  });
                }
              }
            })
          ]),
          data.itemUrl == ""
            ? ""
            : h(
            "div",
            {
              style: {
                width: "72px",
                float: "right"
              }
            },
            [
              data.itemYears != ""
                ? h(
                "sg-select",
                {
                  props: {
                    placeholder: data.placeholder
                  },
                  on: {
                    "on-change": val => {
                      this.$set(data, "selectedYear", val);
                      this.updateMapAnalyseForms(data.rid, val);
                    }
                  }
                },
                arr
                )
                : ""
            ]
            )
        ]
      );
    },

    updateTreeData(res, label) {
      res.map(item => {
        if (item.label == label) {
          this.$set(item, "checked", true);
        }

        if (item.children.length > 0) {
          this.initRes(item.children);
        }
      });
    },

    location(geo) {
      let name = [];
      for (let i = 0; i < this.graphics.length; i++) {
        name.push(this.graphics[i].name);
      }
      if (name.indexOf(geo.name) != -1) {
        geo = JSON.parse(geo.geometry);
        this.$set(geo, "type", "polygon");
        let graphic = this.Highlight.geometryHighlight(geo);
        this.Highlight.flash(graphic, 1);
      }
    },

    //设置列表的列头
    setHeadData(res) {
      res.map(item => {
        if (!item.align)
          this.$set(item, "align", "center");
        if (!item.type)
          this.$set(item, "minWidth", 100);
        else
          this.$set(item, "width", 50);
        if (item.children && item.children.length > 0)
          this.setHeadData(item.children);
      })
    },

    initRes(res) {
      res.map(item => {
        if (item.itemUrl != "" && item.itemYears != "") {
          let yearArr = item.itemYears.split(",");
          item.selectedYear = yearArr[0];
          this.$set(item, "placeholder", yearArr[0]);
        }
        this.$set(item, "label", item.itemName);
        this.$set(item, "expanded", true);
        this.$set(item, "checked", false);

        this.$set(item, "children", item.childrenForms);
        let headConfigData = [];
        if (item.itemFormat != "") {
          headConfigData = JSON.parse(item.itemFormat);

          if (headConfigData.length > 0) {
            this.setHeadData(headConfigData);
          }
        }

        let headYZ = [];
        if (item.subItemFormat != "") {
          headYZ = JSON.parse(item.subItemFormat);
          if (headYZ.length > 0) {
            this.setHeadData(headYZ);
          }
        }

        this.headData.push({
          fxmc: item.itemName,
          tableHeader: headConfigData,
          tableHeaderYZ: headYZ
        });

        if (item.children.length > 0) {
          this.initRes(item.children);
        }
      });
    },

    exportExcelFun(theadData, tbodyData, tableName) {
      if (tbodyData == null || tbodyData == 'undefined')
        return;

      export2Excel(theadData, tbodyData, tableName);
    },

    exportYZDataFun(geodata, exportType, info) {
      console.log(geodata, "压占数据");
      if (geodata == null || geodata.length <= 0)
        return;

      bus.$emit("setLoad", {
        statue: true,
        msg: "数据生成中..."
      });

      let exportdata = JSON.stringify(geodata);
      let config = {
        headers: {
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      };
      let exportUrl = g_MapConfig.baseConfig.webgisExport;
      let splits = exportUrl.split('?');
      if (exportType == undefined)
        exportType = 0;
      if (exportType == 2) { //导出TXT格式
        this.exportTxt(geodata, info);
      } else {
        exportUrl = splits[0] + "?FileType=" + exportType; //目前只处理导出CAD
        let _this = this;
        this.$http.post(exportUrl, exportdata, config).then(function (res) {
          //关闭加载等待窗口
          bus.$emit("setLoad", {
            statue: false,
            msg: "数据生成中..."
          });

          if (res.hasOwnProperty("Code")) {
            this.$msg.error("生成目标数据包失败！");
            console.log(res, '导出CAD/shp出现异常');
            return;
          }

          let url = window.URL.createObjectURL(new Blob([res.data], {
            type: 'application/zip'
          }));
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.download = '压占范围' + _this.formatDate(new Date(), '') + '.zip'; // 动态文件名
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
    },

    //导出多文本压缩文件
    exportMutiTxt(exportConfig, exportdata, attributedata) {
      let url = window.g_MapConfig.baseConfig.webgisExpMutiTxt;
      let data = {
        geometryInfo: exportdata,
        attributeInfo: attributedata,
        exportConfigInfo: exportConfig,
        txtHeaderInfo: configDataInfo.ExportTxtAttributes
      };

      let config = {
        headers: {
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      };
      let postData = JSON.stringify(data);
      let _this = this;
      this.$http.post(url, postData, config).then(function (res) {
        //关闭加载等待窗口
        bus.$emit("setLoad", {
          statue: false,
          msg: "数据生成中..."
        });

        if (res.hasOwnProperty("Code")) {
          this.$msg.error("生成目标数据包失败！");
          console.log(res, '导出多文本出现异常');
          return;
        }

        let url = window.URL.createObjectURL(new Blob([res.data], {
          type: 'application/zip'
        }));
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = '压占范围' + _this.formatDate(new Date(), '') + '.zip'; // 动态文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    },

    //导出为标准勘测定界TXT格式
    exportTxt(exportdata, info) {
      let strArray = [];
      let isForOutsideService = false;
      if (info != undefined && info != null) {
        let title = info.result.title;
        let find = this.checkedArr.find(function (sel) {
          return sel.itemName == title;
        });

        if (find && find.exportAttributes) {
          let exportJson = JSON.parse(find.exportAttributes);
          if (!exportJson.keyField) {
            isForOutsideService = false;
            let data = info.result.data[0];
            let splits = find.exportAttributes.split(",");
            strArray.push("[项目信息]");
            for (let i = 0; i < splits.length; i++) {
              let fas = splits[i];
              let fs = fas.split("=");
              if (fs.length < 2 || !data.hasOwnProperty(fs[0]))
                continue;

              strArray.push(fs[1] + "=" + data[fs[0]]);
            }
          } else {
            isForOutsideService = true;
          }
        }
      }

      if (isForOutsideService) {

        this.exportMutiTxt(JSON.parse(find.exportAttributes), exportdata, info.result.data); //通过服务来下载多文本的形式

      } else {

        strArray.push("[属性描述]");
        if (configDataInfo.ExportTxtAttributes)
          strArray.push(configDataInfo.ExportTxtAttributes);
        strArray.push("[地块坐标]");
        for (let i = 0; i < exportdata.length; i++) {
          let dataInfo = null;
          if (info)
            dataInfo = info.result.data[i];
          let singleDK = exportdata[i];
          let geoInfo = singleDK.geometryInfo;
          let rings = geoInfo.geometry.rings;
          geoInfo.geometry.type = "polygon";
          let tempArray = [];
          let zbds = 0;
          let index = 1;
          for (let k = 0; k < rings.length; k++) {
            let ring = rings[k];
            for (let m = 0; m < ring.length; m++) {
              let str = index + "," + (k + 1) + "," + ring[m][1] + "," + ring[m][0] + "\n";
              tempArray.push(str);
              zbds++;
              index++;
            }
          }
          let area = '';
          if (geoInfo.attributes)
            area = geoInfo.attributes.SOUTH_MJ;
          else if (dataInfo != null)
            area = dataInfo.SOUTH_MJ;
          let dktotalInfo = zbds + "," + area + "," + singleDK.dkmc + "," + singleDK.dkmc + ",面,,,@\r";
          strArray.push(dktotalInfo);
          strArray.push(tempArray.join("\r\n"));
        }

        bus.$emit("setLoad", {
          statue: false,
          msg: "数据生成中..."
        });

        let name = '压占范围' + this.formatDate(new Date(), '') + '.txt'
        this.exportRaw(name, strArray.join("\r\n"));
      }
    },

    exportRaw(name, data) {
      let urlObject = window.URL || window.webkitURL || window;
      let export_blob = new Blob([data]);
      let save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
      save_link.href = urlObject.createObjectURL(export_blob);
      save_link.download = name;
      save_link.style.display = 'none';
      document.body.appendChild(save_link);
      save_link.click();
      document.body.removeChild(save_link);
    },

    closePane(val) {
      this.resultPanelIsShow = val;
      if (!val) {
        this.copyResultData.splice(0);
        this.copyNameIndex.splice(0);
        this.resultData.splice(0);
      }
      this.clearResult();
    },

    hiddenCard(item) {
      this.resultCardShow = item;
    },

    onSelectYzBlock(selection, row) {
      let title = this.tabClickedName;
      let selResult = this.resultData.find(function (sel) {
        return sel.fxmc == title;
      });
      if(selResult == undefined || selResult.result.geodata == undefined)
        return;

      this.geodata = selResult.result.geodata;
      if(this.geodata) {
        for (let i = 0; i < this.geodata.length; i++) {
          this.attributes = this.geodata[i].geometryInfo.attributes;
          let compareField = "OBJECTID"
          if (!this.attributes.hasOwnProperty(compareField) || this.attributes[compareField] == '')
            compareField = "SOUTHGIS_ID";

          if (selection[compareField] == this.attributes[compareField]) {
            let temprings = this.geodata[i].geometryInfo.geometry.rings;
            if (temprings == undefined) {
              temprings = JSON.parse(this.geodata[i].geometryInfo.geometry).rings;
            }
            let geo = {
              rings: temprings,
              type: "polygon",
              spatialReference: g_spatialReference,
            };
            this.Highlight.geometriesHighlight(geo, undefined, true);
            break;
          }
        }
        this.$refs.refPanel.shrink();
      }
    },

    analysis() {
      this.resultPanelIsShow = false;
      this.resultData = [];
      this.copyYZResultData = [];
      this.copyResultData = [];
      this.selectedUnit = "1";
      let checked = this.$refs.fzfxTree.getCheckedNodes();
      let analyseForms = [];
      checked.map(i => {
        if (i.itemUrl != "") {
          analyseForms.push(i);
        }
      });
      this.checkedArr = analyseForms;
      this.mapAnalyseForms = [];
      if (this.data.length != 0 && this.checkedArr.length != 0) {
        // console.log(this.graphics)
        this.handleSelectChange(this.data);

        this.checkedArr.map(i => {
          this.mapAnalyseForms.push({
            childrenForms: i.childrenForms,
            itemName: i.itemName,
            itemFormat: "",
            itemSort: i.itemSort,
            itemType: i.itemType,
            itemUrl: i.itemUrl,
            itemYears: i.itemYears,
            parentId: i.parentId,
            rid: i.rid,
            selectedTeams: i.selectedTeams,
            selectedYear: i.selectedYear,
            subItemFormat: ""
          });
        });
        let para = {
          geometryStringInfo: JSON.stringify(this.geometryStringInfo),
          mapAnalyseForms: this.mapAnalyseForms
        };
        para = JSON.stringify(para);

        bus.$emit("setLoad", {
          statue: true,
          msg: "分析中..."
        });
        let config = {
          headers: {
            "Content-Type": "application/json"
          },
          responseType: "text/html;charset=utf-8"
        };
        this.copyNameIndex = [];
        let _this = this;
        this.$http
          .post(executeAnalyse, para, config)
          .then(res => {
            if (res.status == 200) {
              bus.$emit("setLoad", {
                statue: false,
                msg: "加载中..."
              });

              console.log(res.data, '分析结果');

              for (let i in res.data) {
                if (typeof (res.data) != "object") {
                  console.log(res.data[i].result, '错误结果');
                  continue;
                }
                _this.copyNameIndex.push(res.data[i].fxmc);//添加所有的分析名称
                if (res.data[i].result == '') {
                  res.data[i].result = {Message: '分析无结果'};
                  continue;
                }

                res.data[i].checkAll = true;

                try {
                  res.data[i].result = JSON.parse(res.data[i].result);
                  if(res.data[i].result.data == null) {
                    res.data[i].result = {Message: '分析无结果'};
                    continue;
                  }
                }catch (e) {
                  res.data[i].result = {Message: res.data[i].result};
                  console.log(e);
                  continue;
                }

                for (let m in this.headData) {
                  if (res.data[i].fxmc === _this.headData[m].fxmc) {
                    if (this.headData[m].tableHeader != "") {
                      res.data[i].tableHeader = _this.headData[m].tableHeader;
                    } else {
                      res.data[i].tableHeader = [];
                    }
                    if (this.headData[m].tableHeaderYZ != "") {
                      res.data[i].tableHeaderYZ = _this.headData[m].tableHeaderYZ;
                    } else {
                      res.data[i].tableHeaderYZ = [];
                    }
                  }
                }
              }
              _this.resultData = res.data;
              _this.copyOriginalData();
              _this.tabClickedName = this.resultData[0].fxmc;
              _this.resultPanelIsShow = true;
              _this.tabChangeEvent(_this.tabClickedName);
            } else {
              this.$msg.error({
                content: res.statusText,
                duration: 10,
                closable: true
              });
            }
          })
          .catch(error => {
            bus.$emit("setLoad", {
              statue: false,
              msg: "加载中..."
            });
            console.log(error);
          });
      } else {
        this.$msg.error({
          content: "请选择分析区域或者分析类型！",
          duration: 10,
          closable: true
        });
      }
    },

    copyOriginalData() {
      for (let i = 0; i < this.resultData.length; i++) {
        if (this.resultData[i].result == undefined || this.resultData[i].result.data == undefined)
          continue;

        if (this.isNeedMoreUnit) {
          let str = JSON.stringify(this.resultData[i].result.data);
          let data = {
            data: JSON.parse(str),
          };
          this.copyResultData.push(data);
        }

        if (this.resultData[i].result.yzdata == undefined)
          continue;

        let jstr = JSON.stringify(this.resultData[i].result.yzdata);
        let yzdata = {
          title: this.resultData[i].fxmc,
          data: JSON.parse(jstr)
        };
        this.copyYZResultData.push(yzdata)
      }
    },

    handleSelectChange(selection) {
      let geoArr = [];
      let geo = {};
      selection.map(i => {
        if (i.geometry != "") {
          geo = JSON.parse(i.geometry);
          geo = {
            dkmc: i.name,
            geometryInfo: {geometry: {rings: geo.rings}}
          };
          geoArr.push(geo);
        }
      });
      this.geometryStringInfo = geoArr;
    },

    remove(index) {
      this.data.splice(index, 1);
    },

    updateMapAnalyseForms(rid, year) {
      if (this.checkedArr.length != 0) {
        this.checkedArr.map(i => {
          if (i.rid == rid) {
            i.selectedYear = year;
          }
          return this.checkedArr;
        });
      }
    },

    drawGeometry(gra) {
      this.index++;
      let area = this.calculate.computeArea(gra.geometry);
      area = area.toFixed(2);
      this.data.unshift({
        name: "地块" + this.index,
        area: area,
        _checked: false,
        geometry: JSON.stringify(gra.geometry)
      });
      this.graphics.push({
        name: "地块" + this.index,
        graphic: gra
      });
    },

    importCadShp(gra) {
      if (gra != '' && gra != undefined && gra.geometry != undefined && gra.geometry.rings != undefined) {
        this.index++;
        let area = this.calculate.computeArea(gra.geometry);
        area = area.toFixed(2);
        this.data.unshift({
          name: "地块" + this.index,
          area: area,
          _checked: false,
          geometry: JSON.stringify(gra.geometry)
        });
      }
      this.graphics.push({
        name: "地块" + this.index,
        graphic: gra
      });
    },

    clear() {
      this.geometry = {};
      this.data = [];
      this.graphics = [];
      g_drawLayer.removeAll();
      g_tempLayer.removeAll();
      g_regionLayer.removeAll();
      g_highLightLayer.removeAll();
      this.clearResult();
    },

    clearResult(){
      this.copyResultData.splice(0);
      this.resultData.splice(0);
      this.geometryStringInfo.splice(0);
      this.copyYZResultData.splice(0);
      g_highLightLayer.removeAll();
      if(this.chartList.length>0){
        for(let i=0;i<this.chartList.length;i++)
          this.chartList[i].chart.dispose();
      }
      this.chartList.splice(0);
    },

    //详细数据行的定位
    onSelectLandBlock(selection, row) {
      if (row == null || row.SOUTH_ZB == null || row.SOUTH_ZB == "")
        return;

      try {
        this.$refs.refPanel.shrink();
        let zb = JSON.parse(row.SOUTH_ZB);
        let geo = {rings: zb.rings};
        geo.spatialReference = g_MapConfig.baseConfig.webgisSr;
        geo.type = 'polygon';
        let zfc = JSON.stringify(geo);
        this.Highlight.geometriesHighlight(geo,undefined,true);
        this.clipGeometries.push(zfc);
      } catch (e) {
        console.log('详细压占json坐标不合法:' + row.SOUTH_ZB)
        console.log(e)
      }
    },

    onSelectCancel(selection, row) { //取消选中状态
      let zb = JSON.parse(row.SOUTH_ZB);
      let geo = {rings: zb.rings};
      let mapgeo = zb.rings;
      geo.spatialReference = g_MapConfig.baseConfig.webgisSr;
      geo.type = 'polygon'
      let zfc = JSON.stringify(geo)
      let index = this.clipGeometries.indexOf(zfc);
      if (index != -1) {
        this.clipGeometries.splice(index, 1);
        this.Highlight.removeSpecialGeometry(mapgeo);
      }
    },

    removeLandBlock() {
      if (this.clipGeometries != null && this.clipGeometries.length > 0) {
        let orgianlGeos = [];
        let clipGeos = [];
        for (let i = 0; i < this.clipGeometries.length; i++) {
          let geo = JSON.parse(this.clipGeometries[i]);
          clipGeos.push(geo);
        }
        for (let k = 0; k < this.data.length; k++) {
          let geoStr = this.data[k].geometry;
          let geo = JSON.parse(geoStr);
          orgianlGeos.push(geo);
        }
        let clipResult = this.calculate.clipGeometriesFun(orgianlGeos, clipGeos);
        for (let i = 0; i < this.data.length; i++) {
          let clipGeo = clipResult[i];
          if (clipGeo == null || clipGeo.rings == null || clipGeo.rings.length <= 0)
            continue;

          if (this.graphics[i].name == this.data[i].name) {
            this.Draw.updateGraphicForDrawLayer(clipGeo, i);
            this.graphics[i].graphic.geometry = clipGeo;
          }

          let orgeoStr = this.data[i].geometry;
          let ogeo = JSON.parse(orgeoStr);
          ogeo = ogeo.rings;
          this.data[i].geometry = JSON.stringify(clipGeo);
          this.Highlight.removeSpecialGeometry(ogeo, g_drawLayer); //移除原来的红线范围
          this.Highlight.removeSpecialGeometry(ogeo); //移除高亮图层里面的红线范围
          this.Draw.addGraphicToDrawLayer(clipGeo);
        }
      }
    },

    //1.0分析返回的数据导出（包括红线、压占分析数据）
    exportJBFXData() {
      this.isShowJBFXModel = false;
      let exportinfo = null;
      if (this.selExportType == "0") { //红线部分数据导出
        this.handleSelectChange(this.currentJBFXData);
        exportinfo = this.geometryStringInfo;
      } else if (this.selExportType == "1") { //压占部分
        exportinfo = this.dealDetailExportData(this.currentJBFXData)
      } else if (this.selExportType == "2") {
        exportinfo = this.currentJBFXData;
      } else {
        this.$msg.error("导出的数据类型错误，不是红线或者压占部分数据！");
        return;
      }
      this.exportYZDataFun(exportinfo, this.selJBFXType, this.tokenData);
    },

    //1.0分析返回的压占数据导出
    exportJBFXYZFun(exportdata, exportgeotype, otherdata) {
      if (exportdata == null || exportdata == undefined) {
        this.$msg.error("没有可以导出的数据！");
        return;
      }
      if (exportdata == "all")
        exportdata = this.data;

      if (exportgeotype == 0)
        this.winTitleName = "导出红线";
      else if (exportgeotype == 1 || exportgeotype == 2)
        this.winTitleName = "导出压占数据";
      this.currentJBFXData = exportdata;
      this.tokenData = otherdata;
      this.selExportType = exportgeotype;
      this.isShowJBFXModel = true;
    },

    dealDetailExportData(detailData) {
      let geoArr = [];
      let geo = {};
      for (let i = 0; i < detailData.length; i++) {
        let item = detailData[i];
        let geostr = item.SOUTH_ZB;
        try {
          geo = JSON.parse(geostr);
        } catch (e) {
          console.log('详细压占json坐标不合法:' + geostr)
          console.log(e)
        }
        let copyitem = JSON.parse(JSON.stringify(item));
        delete copyitem["SOUTH_ZB"]
        geo = {
          dkmc: "地块" + i,
          geometryInfo: {geometry: {rings: geo.rings}, attributes: copyitem}
        };
        geoArr.push(geo);
      }
      return geoArr;
    },

    formatDate(now, symbol) {
      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      month = month < 10 ? '0' + month : month
      let date = now.getDate();
      date = date < 10 ? '0' + date : date
      let hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
      let minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
      let second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
      if (!symbol) {
        return year + "" + month + "" + date + "" + hour + "" + minute + "" + second;
      } else {
        return year + symbol + month + symbol + date + ' ' + hour + ':' + minute + ':' + second;
      }
    },

    toDecimal(x) {
      let f = parseFloat(x);
      if (isNaN(f)) {
        return;
      }
      f = Math.round(x * 100) / 100;
      return f;
    }
  }
}
</script>
<style lang="scss" scoped>
.ancillaryAnalysis {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 5px;
  position: relative;
  .geoTable {
    width: 330px;
    position: relative;
    border-right: none;
    border-bottom: none;
    margin-top: -26px;
    margin-bottom: 10px;
    left: 7px;
    overflow-x: hidden;
  }
  .treeContent {
    overflow-y: auto;
    overflow-x: hidden;
    margin-top: 10px;
    border: 1px solid #dfdfdf;
    box-sizing: border-box;
    border-top: none;
    border-right: none;
    border-radius: 2px;
  }
}

#ancilaryAnalysisSketch {
  .esri-sketch__panel {
    .esri-sketch__section {
      .esri-icon-map-pin {
        display: none;
      }
      .esri-icon-polyline {
        display: none;
      }
    }
  }
}
.sg-table{
  height:145px !important;
  /*overflow-y: hidden;*/
  border: none !important;
}
.contentCls /deep/.sg-tab {
  .sg-tab-bar{
    height: 32px;
  }
  .sg-tab-content{
    height: calc(100% - 50px);
    .sg-tab-tabpane{
      height: 100%;
      div{
        .sg-tab{
          height: calc(100% - 20px);
        }
      }
      .resultTable{
        height: calc(100% - 50px) !important;
      }
      .resultTable2{
        height: calc(100% - 110px) !important;
      }
    }
  }
}
</style>
