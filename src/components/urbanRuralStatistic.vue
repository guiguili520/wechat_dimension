// 城乡规划统计
<template>
  <div class="urbanRuralStatistic iq-content">
    <sg-form ::label-width="60">
      <!--<div class="iq-wrap">-->
      <!--<sg-form-item :label-width="70" label="统计方式">-->
      <!--<sg-radio-group v-model="formItem.statisticalMethod">-->
      <!--<sg-radio :label-width="70" label="importShp">自定义范围</sg-radio>-->
      <!--<sg-radio :label-width="70" label="XZQH">区域统计</sg-radio>-->

      <!--</sg-radio-group>-->

      <!--</sg-form-item>-->
      <!--</div>-->
      <p class="iq-title">统计空间范围</p>
      <s-range :type="rangeType"
               :drawId="drawId"
               ref="range"
               @get-range-code="getRangeCode"
               @get-range-type="getRangeType"
               @get-regionLevel="getRegionLevel"
               @import-cadShp="importCadShp"
               @draw-geometry="drawGeometry"

               @clear-all="clear"
      ></s-range>
      <!--@county-location="countyLocation"-->
      <!--@town-location="townLocation"-->
      <!--<sg-form-item :label-width="70" label="统计范围" v-show="formItem.statisticalMethod=='XZQH'">-->
      <!--<sg-radio-group v-model="formItem.regionLevel">-->
      <!--<sg-radio :label-width="70" label="city">全市</sg-radio>-->
      <!--<sg-radio :label-width="70" label="county">区县</sg-radio>-->
      <!--<sg-radio :label-width="70" label="town">街镇</sg-radio>-->
      <!--</sg-radio-group>-->
      <!--</sg-form-item>-->

    </sg-form>
    <div class="iq-button">
      <sg-button type="primary" @click="startStatistic()">开始统计</sg-button>
      <sg-button @click="clearBtn()">清除结果</sg-button>
    </div>
    <s-respane v-show="resultPanelIsShow" name="按城乡空间布局规划统计结果" @pane-close="closePane" :w="800" :h="600" :x="233"
               :y="24">
      <sg-tab type="card" :animated="false" value="table" @on-click="getTabName">
        <sg-tab-pane :label="item.label" v-for="item in resultPanel" name="table">
          <sg-table :show-page="false" ref="urban" :columns="item.columns" :data="item.attributes"
                    @on-row-click="location"></sg-table>
        </sg-tab-pane>
        <sg-tab-pane label="柱状图[大类]" name="bar1">
          <div id="urbanRuralStatistic_bar1" style="width: 765px;height: 483px;"></div>
        </sg-tab-pane>
        <sg-tab-pane label="饼状图[大类]" name="pie1">
          <div id="urbanRuralStatistic_pie1" style="width: 765px;height: 483px;"></div>
        </sg-tab-pane>
        <sg-tab-pane label="柱状图[中类]" name="bar2">
          <div id="urbanRuralStatistic_bar2" style="width: 765px;height: 483px;"></div>
        </sg-tab-pane>
        <sg-tab-pane label="饼状图[中类]" name="pie2">
          <div id="urbanRuralStatistic_pie2" style="width: 765px;height: 483px;"></div>
        </sg-tab-pane>
      </sg-tab>
      <div style="margin-top: 8px;margin-left: 14px;" slot="bottom" v-show="tabName=='table'">
        <sg-button @click="exportData">导出Excel</sg-button>
      </div>
    </s-respane>
  </div>
</template>

<script>
  import SRange from '@/components/common/range'
  import SRespane from '@/components/common/resultPanel'
  import bus from '../assets/eventBus';
  import {export2Excel} from '@/classic/common/export2Excel'

  let AuxiliaryLocation
  export default {

    name: "urbanRuralStatistic",
    components: {SRespane, SRange},
    data() {
      return {
        legendUrl: "",
        legendData: [],
        imagesUrl: "",
        // imageData:"iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADFJREFUOI1jYaAyYKGZgf8Z/v+nxCBGBkZGFAOpBUYNHDVw1MBRA+lsIKw8o5qB1AIACDADVEGDN+gAAAAASUVORK5CYII=",
        tabName: 'table',
        bigClassContent: ["urbanRuralStatistic_pie1", "urbanRuralStatistic_bar1"],
        smallClassContent: ["urbanRuralStatistic_pie2", "urbanRuralStatistic_bar2"],
        drawId: 'urbanRuralStatistic',
        featureInfo: {},
        result: {},
        rangeType: ['XZQH', "draw", 'import'],
        largeClassData: '',
        middleSmallData: '',
        splitResult: [],
        pages: 0,
        showResult: [],
        queryData: [],
        resultColumns: [{
          title: '大类',
          key: 'CLASS1'
        }, {
          title: '中小类',
          key: 'CLASS2'
        }, {
          title: '代码',
          key: 'DM'
        }, {
          title: '个数',
          key: 'COUNT'
        }, {
          title: '总面积（平方米）',
          key: 'ZMJ1'
        }, {
          title: '总面积（公顷）',
          key: 'ZMJ2'
        }],
        resultPanel: [{
          label: '城市空间布局规划',
          value: 'CSKJ_BuJGH',
          visible: false,
          columns: [
            {
              title: '图例',
              key: 'imageData',
              width: 150,
              align: 'center',
              render: (h, params) => {
                return h('div', [
                  h('img', {
                    style: {
                      height: "20",
                      width: "20",
                      border: 0,
                      opacity: 1,
                      verticalAlign: "middle"
                    },
                    attrs: {
                      src: params.row.imageData == "" ? "" : this.imagesUrl + params.row.imageData
                      // http://192.168.10.115:6080/arcgis/rest/services/DG/CoreData_18/MapServer/0/images/a397b4ce7868913682925ec12ad9568c
                      // src:params.row.imageData==""?"":'data:image/png;base64,'+params.row.imageData
                      //data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADFJREFUOI1jYaAyYKGZgf8Z/v+nxCBGBkZGFAOpBUYNHDVw1MBRA+lsIKw8o5qB1AIACDADVEGDN+gAAAAASUVORK5CYII=
                    },
                    class: 'esri-legend__symbol'
                  })
                ])
              }
            }],
          attributes: [],
        }],
        countData: [],
        Statistic: '',
        resultPanelIsShow: false,
        formItem: {
          // statisticalMethod:'XZQH',
          regionLevel: '',//区县county，镇town
          rangeSelect: '',//范围选择，行政区划XZQH,导入import，绘制draw
          selectType: '',//统计接口参数，“市”,"县"，"镇"
          rangeCode: ''//区县或者镇的代码
        }
      }
    },
    created() {

    },
    mounted() {
      if(!g_MapConfig.panelConfig.urbanRuralStatistic){
        // this.$msg.error("缺少城乡规划统计功能相关数据配置。功能标识：urbanRuralStatistic")
        console.log("缺少城乡规划统计功能相关数据配置。功能标识：urbanRuralStatistic")
        return;
      }

      let config = g_MapConfig.panelConfig.urbanRuralStatistic

      this.resultColumns = config.resultColumns;
      this.imagesUrl = config.imagesUrl;
      this.legendUrl = config.legendUrl;
      this.legendLayerId = config.legendLayerId
      this.resultPanel[0].columns = this.resultPanel[0].columns.concat(this.resultColumns)

      this.InfoStatistic = new SgMap.InfoStatistic();

        AuxiliaryLocation = new SgMap.AuxiliaryLocation();


      this.Statistic = new SgMap.UrbanRuralStatistic();
      this.getImageData()
    },
    methods: {
      getImageData() {
        this.$get(this.legendUrl).then((res) => {
          if (res.layers[0].layerId == this.legendLayerId) {
            this.legendData = res.layers[0].legend;
          }
        }).catch((error) => {
          console.log("获取城市总体规划图例接口报错：" + error)
        })
      },
      getTabName(name) {
        this.tabName = name
      },
      getRangeCode(value) {
        this.formItem.rangeCode = value
      },
      getRangeType(value) {
        this.formItem.rangeSelect = value
        if (value !== "XZQH") {
          this.formItem.selectType = "";
          this.formItem.rangeCode = ""

        }


      },
      getRegionLevel(value) {
        this.formItem.regionLevel = value
      },
      exportData() {
        let tHeader = this.resultPanel[0].columns;
        let tbody = this.resultPanel[0].attributes;
        for (let m = 0; m < this.resultPanel[0].attributes.length; m++) {
          let att = this.resultPanel[0].attributes[m]
          if (att.imageData != "") {
            att.imageData = this.imagesUrl + att.imageData
          }
        }
        export2Excel(tHeader, tbody, '城乡空间布局规划统计')
      },
      // exportData(type){
      //   if (type === 1) {
      //     this.$refs.urban[0].exportCsv({
      //       filename: '城乡空间布局规划统计'
      //     });
      //   }
      // },
      importCadShp(gra){
        if(gra != '' && gra != undefined && gra.geometry != null && gra.geometry != undefined){
          this.geometry = gra.geometry;
        }
        // if(gra.geometry.features.length>1){
        //   this.$msg.error({
        //     content: "不支持多个图形！",
        //     duration: 10,
        //     closable: true
        //   });
        // }else{
        //   this.geometry = geo;
        // }

      },
      location(geo) {
        if (geo.geometry !== null) {
          AuxiliaryLocation.locationSingle(geo.geometry);
        }
      },
      drawGeometry(gra) {

        this.geometry = gra.geometry
      },
      // countyLocation(geo){
      //
      //   this.geometry = geo
      // },
      // townLocation(geo){
      //
      //   this.geometry = geo
      // },
      changePage(index) {
        console.log(index)
        this.pages = index - 1;
        this.showResult = this.splitResult[index - 1]
      },
      startStatistic() {
        this.resultPanel[0].attributes = []
        let param = {}
        if (this.formItem.regionLevel === 'city' && this.formItem.rangeSelect == 'XZQH') {
          this.formItem.selectType = "市";
          this.formItem.rangeCode = "";
        } else if (this.formItem.regionLevel === 'county' && this.formItem.rangeSelect == 'XZQH') {
          this.formItem.selectType = "县"
        } else if (this.formItem.regionLevel === 'town' && this.formItem.rangeSelect == 'XZQH') {
          this.formItem.selectType = "镇"
        }
        // if(this.geometry== undefined || this.geometry.rings == undefined || this.geometry.rings == '') {
        //   param = {
        //     coordinateInfo: "",
        //     selectType:"市",
        //     regionCode:""
        //   };//对整个市统计
        // }else{
        let coordinateInfo
        if (this.geometry == undefined || this.geometry.rings == undefined || this.geometry.rings == '') {
          coordinateInfo = ""
        } else {
          let geo = {
            geometry: {
              rings: this.geometry.rings
            },
          }
          coordinateInfo = JSON.stringify(geo)
        }

        param = {
          coordinateInfo: coordinateInfo,
          selectType: this.formItem.selectType,
          regionCode: this.formItem.rangeCode
        };//空间统计
        // }
        this.spatialStatistic(param);//空间统计

      },
      clear() {
        this.geometry = ""
        this.$refs.range.clearDrawGraphics();
      },
      clearBtn() {
        //this.$refs.range.clearDrawGraphics();
      },
      closePane(val) {
        this.resultPanelIsShow = val
      },
      // layerStatistic(){
      //   let param = {
      //     type: 'statisticsLayer',
      //     url: "http://192.168.10.115:6080/arcgis/rest/services/DGOneMap/smallDataEdited/MapServer/0",
      //     parameters: {
      //       title: "用地面积",
      //       content: ["bigClassBar", "middleSmallClassBar","bigClassPie", "middleSmallClassPie"],
      //       geometry:""
      //     }
      //   }
      //   this.Statistic.sum(param);
      //   this.Statistic.event.on({
      //     'queryComplete': function (res) {
      //       this.queryData = res;
      //
      //       this.countData = [];
      //       let singleData
      //       this.largeClassData = [];
      //       this.middleSmallData = [];
      //       let item;
      //
      //       for (let i = 0; i < this.queryData.length; i++) {
      //         if (this.queryData[i].attributes.GHYDXZDM.length == 1) {
      //           singleData = {
      //             COUNT_YDDM: this.queryData[i].attributes.COUNT_YDDM,
      //             SUM_YDMJ: this.queryData[i].attributes.SUM_YDMJ,
      //             YDDM: this.queryData[i].attributes.GHYDXZDM,
      //             largeClass: this.queryData[i].attributes.GHYDXZMC,
      //             middleSmallClass: ""
      //           }
      //           item = {
      //             largeClass: this.queryData[i].attributes.GHYDXZMC,
      //             SUM_YDMJ: this.queryData[i].attributes.SUM_YDMJ,
      //           }
      //           this.largeClassData.push(item)
      //         } else if (this.queryData[i].attributes.GHYDXZDM.length > 1) {
      //           singleData = {
      //             COUNT_YDDM: this.queryData[i].attributes.COUNT_YDDM,
      //             SUM_YDMJ: this.queryData[i].attributes.SUM_YDMJ,
      //             YDDM: this.queryData[i].attributes.GHYDXZDM,
      //             largeClass: "",
      //             middleSmallClass: this.queryData[i].attributes.GHYDXZMC
      //           }
      //           item = {
      //             middleSmallClass: this.queryData[i].attributes.GHYDXZMC,
      //             SUM_YDMJ: this.queryData[i].attributes.SUM_YDMJ,
      //           }
      //           this.middleSmallData.push(item)
      //         }
      //         this.countData.push(singleData);
      //
      //       }
      //       this.Statistic.updateChart(this.largeClassData, this.middleSmallData);
      //
      //       let result = [];
      //       for (let i = 0, len = this.countData.length; i < len; i += 8) {
      //         result.push(this.countData.slice(i, i + 8));
      //         // this.geometry.push(arr.slice(i,i+7))
      //       }
      //       this.splitResult = result;
      //       this.showResult = this.splitResult[0]
      //
      //       console.log(this.countData);
      //       this.resultPanelIsShow = true;
      //       bus.$emit('setLoad', {
      //         statue: false,
      //         msg: '加载中...'
      //       });
      //     }.bind(this)
      //   })
      // },
      spatialStatistic(param) {
        // let geo = {
        //   geometry: {
        //     rings:this.geometry.rings
        //   },
        // }
        // let param = {
        //   coordinateInfo: JSON.stringify(geo),
        //   selectType:"",
        //   regionCode:""
        // }
        let a = JSON.stringify(param)
        console.log(a)
        bus.$emit('setLoad', {
          statue: true,
          msg: '统计中...'
        });
        this.$post(g_MapConfig.panelConfig.urbanRuralStatistic.UrbanRuralStatistic_URL, param).then((res) => {
          this.result = JSON.parse(res)
          bus.$emit('setLoad', {
            statue: false,
            msg: '加载中...'
          });
          if (this.result.code == 1) {
            for (let i in this.result.data) {
              this.result.data[i].map((a) => {
                for (let m in this.resultPanel) {
                  if (i == this.resultPanel[m].value) {
                    a.attribute.geometry = a.geometry;
                    a.attribute.imageData = "";
                    console.log(a.attribute);
                    this.resultPanel[m].attributes.push(a.attribute);
                    console.log(this.resultPanel[m].attributes);
                    // this.resultPanel[m].geometry.push(a.geometry);
                  }
                }
                // this.data[i].push(a.attributes)
              })

            }
            let bigClassData = [];
            let smallClassData = [];
            for (let n = 0; n < this.resultPanel[0].attributes.length; n++) {
              for (let m = 0; m < this.legendData.length; m++) {

                if (this.resultPanel[0].attributes[n].CLASS2 === this.legendData[m].label || this.resultPanel[0].attributes[n].CLASS1 === this.legendData[m].label) {
                  this.resultPanel[0].attributes[n].imageData = this.legendData[m].url
                }
              }

              if (this.resultPanel[0].attributes[n].CLASS2 === "") {
                bigClassData.push(this.resultPanel[0].attributes[n])
              } else if (this.resultPanel[0].attributes[n].CLASS1 === "") {
                smallClassData.push(this.resultPanel[0].attributes[n])
              }
            }
            this.resultPanelIsShow = true;
            this.getEcharts(bigClassData, this.bigClassContent, "CLASS1");
            this.getEcharts(smallClassData, this.smallClassContent, "CLASS2")
            console.log(this.resultPanel[0].attributes);

          } else {
            this.$msg.error({
              content: this.result.excption,
              duration: 10,
              closable: true
            });
          }
        }).catch((error) => {
          bus.$emit('setLoad', {
            statue: false,
            msg: '加载中...'
          });
          console.log("错误信息: " + error.message);
        });
        console.log(this.resultPanel)
      },
      getEcharts(data, content, name) {
        let seriesData = [];
        let nameData = [];
        let valueData = [];
        for (let i = 0; i < data.length; i++) {
          seriesData.push({
            "value": data[i].ZMJ2,
            "name": data[i][name]
          });
          nameData.push(data[i][name]);
          valueData.push(data[i].ZMJ2);
        }
        this.options = {
          title: "用地总面积（公顷）",
          content: content,
          seriesData: seriesData,
          nameData: nameData,
          valueData: valueData
          // field: this.formItem.field_select,//字段配置
          // values: ['E1_水域', 'M1_一类工业用地', 'R2_二类居住用地', 'G22_防护绿地'],
          // geometry: geometry
        }
        this.InfoStatistic.updateChart(this.options)

      },


    }
  }
</script>

<style scoped>

</style>
