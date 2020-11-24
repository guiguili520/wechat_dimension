<template>
  <div id="rootDiv">
    <div>
      <sg-tab :value="tabIndexName">
        <sg-tab-pane label="分类目录" name="tab1">
          <sg-tree ref='tree' :data="catalogdata" @on-node-click="click"></sg-tree>
          <sg-button @click="beginCalculate" type="primary" size="small" style="margin-left: 220px;margin-top: 20px">
            开始统计
          </sg-button>
        </sg-tab-pane>
        <sg-tab-pane label="统计结果" name="tab2">
          <div>
            <div>
              <label>单位：千米/平方千米</label>
              <sg-button type="primary" style="padding: 6px;width:80px;margin-left: 45px;margin-right: 5px"
                         title="导出统计结果"
                         @click="exportData">导出结果
              </sg-button>
              <sg-button type="primary" style="padding: 6px;width:80px;margin-right: 5px" title="查看统计饼状图"
                         @click="updateChart">查看图表
              </sg-button>
            </div>
            <sg-table :show-page="false" id="road" :columns="columnQuery" :data="resultData"></sg-table>
          </div>
        </sg-tab-pane>
      </sg-tab>
    </div>
    <s-respane v-show="resultPanelIsShow" style="z-index: 10000" name="市政道路统计结果" @pane-close="closePane"
               :w="800" :h="600" :y="10">
      <sg-tab animated="false" value="pie1" @on-click="clickTab">
        <sg-tab-pane label-width="70" label="数量统计" name="pie1">
          <div id="CountStatistic" style="width: 765px;height: 240px;"></div>
        </sg-tab-pane>
        <sg-tab-pane label-width="70" label="里程统计" name="pie2">
          <div id="LengthStatistic" style="width: 765px;height: 240px;"></div>
        </sg-tab-pane>
        <sg-tab-pane label-width="70" label="面积统计" name="pie3">
          <div id="AreaStatistic" style="width: 765px;height: 240px;"></div>
        </sg-tab-pane>
      </sg-tab>
      <div style="height: 25px;">
        <label style="font-size: 12px;margin-left: 10px;">单位：米/平方米</label>
        <sg-button type="text" size="small" title="导出结果" style="margin-left: 560px" @click="exportDetail">导出列表
        </sg-button>
      </div>
      <sg-table :show-page="false" id="details" :columns="detailColumn" :data="detailData" height="210"></sg-table>
    </s-respane>
  </div>
</template>

<script>
  import {GET_STATICS_CATLOG, GET_STATICS_EXECUTE} from "../../config/api";
  import {export2Excel} from "../../classic/common/export2Excel";
  import bus from '../../assets/eventBus';
  import {loadModules} from "esri-loader";
  import {options} from "../../config";
  import SRespane from '@/components/common/resultPanel';
  import echarts from 'echarts';

  export default {
    name: "municipalRoadStatics",
    components: {SRespane},
    data() {
      return {
        tabIndexName: "tab1",
        catalogdata: [],
        selectItem: null,
        staticsId: "",
        staticsWidthField: "",
        currentOverLayer: {
          Url: "",
          TargetField: "",
          AreaField: "",
          geometry: null,
          Area: 0.0
        },
        columnQuery: [],
        resultData: [],
        QueryTask: null,
        Query: null,
        resultPanelIsShow: false,
        options: [{
          content: "CountStatistic", //饼状图id
          seriesData: [], //所有数据
          nameData: []//名称
        }, {
          content: "LengthStatistic",
          seriesData: [],
          nameData: []
        }, {
          content: "AreaStatistic",
          seriesData: [],
          nameData: [],
        }],
        detailColumn: [],
        detailData: [],
        currentPie: null,
        Highlight: null
      }
    },

    mounted() {
      if (!g_MapConfig.panelConfig.szdltj || !g_MapConfig.panelConfig.szdltj.StaticsId || !g_MapConfig.panelConfig.szdltj.WidthField
        || !g_MapConfig.panelConfig.szdltj.OverLayerTargetField || !g_MapConfig.panelConfig.szdltj.OverLayerAreaField
        || !g_MapConfig.panelConfig.szdltj.OverLayerUrl || !g_MapConfig.panelConfig.szdltj.DetailsColumn) {
        console.log("缺少市政道路统计相关数据配置。功能标识：szdltj");
        return;
      } else {
        this.staticsId = g_MapConfig.panelConfig.szdltj.StaticsId;
        this.staticsWidthField = g_MapConfig.panelConfig.szdltj.WidthField;
        this.currentOverLayer.Url = g_MapConfig.panelConfig.szdltj.OverLayerUrl;
        this.currentOverLayer.TargetField = g_MapConfig.panelConfig.szdltj.OverLayerTargetField;
        this.currentOverLayer.AreaField = g_MapConfig.panelConfig.szdltj.OverLayerAreaField;
        this.detailColumn = g_MapConfig.panelConfig.szdltj.DetailsColumn;
        this.setHeadData(this.detailColumn); //格式化列头
      }
      this.Highlight = new SgMap.Highlight();
      let _this = this;
      loadModules(
        ["esri/tasks/QueryTask",
          "esri/tasks/support/Query",
        ], options
      ).then(([QueryTask, Query]) => {
        _this.QueryTask = QueryTask;
        _this.Query = Query;
        this.$get(GET_STATICS_CATLOG).then(res => {
          console.log(res, '目录结构')
          _this.catalogdata = _this.initRes(res);
        });
      });
    },

    methods: {
      initRes(res) {
        res.map((item) => {
          this.$set(item, "label", item.text); //添加label属性
          if (item.id == "-1") {
            this.$set(item, "expanded", true)
          } else {
            this.$set(item, "expanded", false)
          }
          this.$set(item, "checked", false); //添加checked属性
          if (item.children && item.children.length > 0) {
            this.level++;
            this.initRes(item.children)
          }
        });
        return res
      },
      click(res, item) {
        this.selectItem = item;
      },
      beginCalculate() {
        if (this.selectItem == undefined || this.selectItem == null) {
          this.$msg.error("请选择一项分类进行统计");
          return;
        }
        bus.$emit('setLoad', {
          statue: true,
          msg: '分析中...'
        });
        if (this.QueryTask == undefined || this.QueryTask == null) {
          setTimeout(this.beginCalculate, 1000);
          return;
        }
        this.tabIndexName = "tab1";
        this.detailData = [];
        let queryTask = new this.QueryTask({
          url: this.currentOverLayer.Url
        });
        let query = new this.Query();
        query.outFields = [this.currentOverLayer.AreaField];
        query.returnGeometry = true;
        query.where = this.currentOverLayer.TargetField + "='" + this.selectItem.id + "'";
        queryTask.execute(query).then((results) => {
          if (results.code) {
            console.log(results, '市政道路统计分析异常');
            bus.$emit('setLoad', {
              statue: false
            });
            this.$msg.error(results.message);
          } else if (results.features != null && results.features.length > 0 && results.features[0].geometry != null) {
            this.currentOverLayer.Area = results.features[0].attributes[this.currentOverLayer.AreaField] / 1000000;//转换为平方千米
            let geometry = results.features[0].geometry;
            let analyseGeo = {type: 'polygon', 'rings': geometry.rings};
            this.currentOverLayer.geometry = analyseGeo;
            this.drawPosition(analyseGeo);
            this.Calculate();
          } else {
            console.log("未查询到数据", '市政道路统计分析异常');
            bus.$emit('setLoad', {
              statue: false
            });
            this.$msg.error("未查询到数据");
          }
        });
      },
      Calculate() {
        let config = {
          headers: {
            "Content-Type": "application/json"
          },
          responseType: "application/json;charset=utf-8"
        };
        let executeData = {
          id: this.staticsId,
          where: "",
          clipGeometry: this.currentOverLayer.geometry
        };
        this.$post(GET_STATICS_EXECUTE, executeData, config).then(res => {
          bus.$emit('setLoad', {
            statue: false
          });
          if (res.code) {
            console.log(res, '统计分析异常');
            this.$msg.error(res.exceptionMsg);
          } else {
            let names = [];
            let countData = [];
            let lengthData = [];
            let areaData = [];
            let columns = res.headerInfo;
            columns.splice(2, 0, {"key": "SL", "title": "数量", "align": "center"});
            columns.push({"key": "MJ", "title": "面积", "align": "center"}, {
              "key": "LWMD",
              "title": "路网密度",
              "align": "center"
            });
            if (this.columnQuery.length <= 0)
              this.columnQuery = columns;
            res.dataInfo.map((data) => {
              let details = data.details;
              this.$set(data, "SL", details.length);
              let lenCal = 0.0;
              let areaCal = 0.0;
              for (let i = 0; i < details.length; i++) {
                let detailData = details[i];
                this.$set(detailData, "index", i + 1);//添加序号
                let len = detailData[columns[3].key] / 1000;//单位转换为千米
                lenCal += len;
                let width = detailData[this.staticsWidthField] / 1000;//单位转换为千米
                areaCal += len * width;
              }
              lenCal = parseFloat(lenCal).toFixed(4);
              areaCal = parseFloat(areaCal).toFixed(4);
              this.$set(data, columns[3].key, lenCal);
              this.$set(data, "MJ", areaCal);
              //计算路网密度（千米每平方千米）
              let lwmd = lenCal / this.currentOverLayer.Area;
              lwmd = parseFloat(lwmd).toFixed(4);
              this.$set(data, "LWMD", lwmd);
              let name = data[columns[1].key];
              names.push(name);
              countData.push({
                value: details.length,
                name: name,
                details: details
              });
              lengthData.push({
                value: lenCal,
                name: name,
                details: details
              });
              areaData.push({
                value: areaCal,
                name: name,
                details: details
              });
            });
            this.options[0].nameData = names;
            this.options[0].seriesData = countData;
            this.options[1].nameData = names;
            this.options[1].seriesData = lengthData;
            this.options[2].nameData = names;
            this.options[2].seriesData = areaData;
            this.resultData = res.dataInfo;
            this.tabIndexName = "tab2";
          }
        });
      },
      exportData() {
        if (this.resultData.length <= 0) {
          this.$msg.error("没有数据可以导出！");
          return;
        }
        export2Excel(this.columnQuery, this.resultData, this.selectItem.label + "道路统计结果");
      },
      updateChart() {
        let _this = this;
        _this.options.map(option => {
          let myPie = echarts.init(document.getElementById(option.content));
          let pieOption = {
            toolbox: {
              feature: {
                saveAsImage: {
                  show: true
                },
              },
              top: '0%',
              right: '8%',
            },
            legend: {
              orient: 'vertical',
              left: 'left',
              data: option.nameData
            },
            series: [
              {
                type: 'pie',
                radius: '70%',
                center: ['50%', '50%'],
                selectedMode: 'single',
                data: option.seriesData,
                itemStyle: {
                  normal: {
                    label: {
                      show: true,
                      formatter: '{b}: {c} ({d}%)'
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
          // 处理点击事件
          myPie.on('click', function (params) {
            _this.detailData = params.data.details;
            _this.currentPie = params;
          });
        });
        _this.resultPanelIsShow = true;
      },
      clickTab() {
        this.detailData = []
      },
      closePane(val) {
        this.resultPanelIsShow = val
      },
      exportDetail() {
        if (this.detailData.length <= 0) {
          this.$msg.error("没有数据可以导出！");
          return;
        }
        let file = this.selectItem.label + this.currentPie.data.name + "列表";
        export2Excel(this.detailColumn, this.detailData, file);
      },
      drawPosition(geo) {
        let myGeo = geo;
        if (myGeo.hasOwnProperty("rings"))
          myGeo.type = "polygon";
        else if (myGeo.hasOwnProperty("paths"))
          myGeo.type = "polyline";
        else
          myGeo.type = "point";
        myGeo.spatialReference = g_spatialReference;
        this.Highlight.geometryHighlight(myGeo);
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
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .dialog-wrap {
    max-height: none !important;
    height: 570px;
  }

  /deep/ .sg-tree-title-selected {
    background-color: #a3c2f1 !important;
  }
</style>
