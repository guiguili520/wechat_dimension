<template>
  <div class="landUseStatistic iq-content">
    <sg-form ::label-width="60">
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
      <!--<div class="iq-wrap">-->
      <!--<sg-form-item :label-width="70" label="统计方式">-->
      <!--<sg-radio-group v-model="formItem.statisticalMethod">-->
      <!--<sg-radio :label-width="70" label="importShp">自定义范围</sg-radio>-->
      <!--<sg-radio :label-width="70" label="XZQH">区域统计</sg-radio>-->
      <!--</sg-radio-group>-->
      <!--</sg-form-item>-->
      <!--<sg-form-item :label-width="70" label="统计范围" v-show="formItem.statisticalMethod=='XZQH'">-->
      <!--<sg-radio-group v-model="formItem.regionLevel">-->
      <!--<sg-radio :label-width="70" label="city">全市</sg-radio>-->
      <!--<sg-radio :label-width="70" label="county">区县</sg-radio>-->
      <!--<sg-radio :label-width="70" label="town">街镇</sg-radio>-->
      <!--</sg-radio-group>-->
      <!--</sg-form-item>-->
      <!--</div>-->
    </sg-form>

    <div class="iq-button">
      <sg-button type="primary" @click="startStatistic()">开始统计</sg-button>
      <sg-button @click="clear()">清除结果</sg-button>
    </div>
    <s-respane v-show="resultPanelIsShow" name="按土地利用总体规划用途分区统计结果" @pane-close="closePane" :w="800" :h="600" :x="450"
               :y="24">
      <sg-tab type="card" :animated="false" value="table" @on-click="getTabName">
        <sg-tab-pane :label-width="70" label="统计表" name="table">
          <sg-table :show-page="false" ref="land" :columns="resultPanel[0].columns" :data="resultPanel[0].attributes"
                    @on-row-click="location"></sg-table>
          <!--<sg-page :total="resultPanel[0].attributes.length"-->

          <!--show-total=""-->
          <!--show-elevator=""-->
          <!--:page-size="7"-->
          <!--size="small"-->

          <!--@on-change="changePage"-->
          <!--class="result_page"-->
          <!--style="padding: 10px 0;"></sg-page>-->
        </sg-tab-pane>

        <sg-tab-pane :label-width="70" label="柱状图" name="bar">
          <div id="landUseStatistic_bar" style="width: 765px;height: 483px;"></div>
        </sg-tab-pane>
        <sg-tab-pane :label-width="70" label="饼状图" name="pie">
          <div id="landUseStatistic_pie" style="width: 765px;height: 483px;"></div>
        </sg-tab-pane>
      </sg-tab>
      <div style="margin-top: 8px;margin-left: 14px;" slot="bottom" v-show="tabName=='table'">
        <sg-button @click="exportData(1)">导出Excel</sg-button>
      </div>
    </s-respane>
  </div>
</template>

<script>
  import SRange from '@/components/common/range'
  import SRespane from '@/components/common/resultPanel'

  import bus from '../assets/eventBus';

  let AuxiliaryLocation
  export default {

    name: "landUseStatistic",
    data() {
      return {
        tabName: 'table',
        geometry: '',
        options: {},
        Statistic: {},
        result: "",
        rangeType: ['XZQH', "draw", 'import'],
        drawId: 'landUseStatistic',
        countData: [],
        splitResult: [],
        pages: 0,
        showResult: [],
        queryData: [],
        resultColumns: [
          {
            title: '代码',
            key: 'DLDM'
          }, {
            title: '地类名称',
            key: 'DLMC'
          }, {
            title: '数量',
            key: 'SL'
          }, {
            title: '总面积（公顷）',
            key: 'ZMJGQ'
          }, {
            title: '总面积（平方米）',
            key: 'ZMJPF'
          }
        ],
        resultPanel: [{
          label: '土地利用总体规划',
          value: 'TDLY',
          visible: false,
          columns: [
            // {
            //   title: '图例',
            //   key: 'icon',
            //   width: 150,
            //   align: 'center',
            //   render: (h, params) => {
            //     return h('div', [
            //       h('img', {
            //         style: {
            //           height: "20",
            //           width: "20",
            //           border:0,
            //           opacity:1,
            //           verticalAlign: "middle"
            //         },
            //         attrs: {
            //           src:params.row.imageData==""?"":'data:image/png;base64,'+params.row.imageData
            //         },
            //         class:'esri-legend__symbol'
            //       })
            //     ])
            //   }
            // },
          ],
          attributes: [],
        }],
        Statistic: '',
        resultPanelIsShow: false,
        formItem: {
          // statisticalMethod:'',
          regionLevel: '',
          rangeSelect: '',
          selectType: '',
          rangeCode: ''
        }
      }
    },
    components: {SRespane, SRange},
    created() {

    },
    mounted() {
      if(!g_MapConfig.panelConfig.landUseStatistic){
        // this.$msg.error("缺少土地利用总体规划统计功能相关数据配置。功能标识：landUseStatistic")
        console.log("缺少土地利用总体规划统计功能相关数据配置。功能标识：landUseStatistic")
        return;
      }

      let config = g_MapConfig.panelConfig.landUseStatistic
      this.resultColumns = config.resultColumns;
      this.resultPanel[0].columns = this.resultPanel[0].columns.concat(this.resultColumns);
      this.InfoStatistic = new SgMap.InfoStatistic();
      AuxiliaryLocation = new SgMap.AuxiliaryLocation();
      this.Statistic = new SgMap.LandUseStatistic();
      // this.getImageData()
    },
    methods: {
      // getImageData(){
      //   this.$get(legendUrl).then((res)=>{
      //     if(res.layers[0].layerName == "土地利用总体规划"){
      //       this.legendData = res.layers[0].legend;
      //     }
      //   }).catch((error) => {
      //     console.log("获取土地利用规划图层图例接口报错："+ error)
      //   })
      // },
      getTabName(name) {
        this.tabName = name
      },
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
      getRangeCode(value) {
        this.formItem.rangeCode = value
      },
      getRangeType(value) {
        this.formItem.rangeSelect = value;
        if (value !== "XZQH") {
          this.formItem.selectType = "";
          this.formItem.rangeCode = ""
        }
      },
      getRegionLevel(value) {
        this.formItem.regionLevel = value

      },
      exportData(type) {
        if (type === 1) {
          this.$refs.land.exportCsv({
            filename: '城乡空间布局规划统计'
          });
        }
      },
      // getRegionLevel(value){
      //   this.formItem.regionLevel = value
      //   if(this.formItem.regionLevel === 'city' && this.formItem.rangeType == 'XZQH' ){
      //     this.geometry = ''
      //   }
      // },
      drawGeometry(gra) {
        this.geometry = gra.geometry
      },
      // countyLocation(geo){
      //   this.geometry = geo
      // },
      // townLocation(geo){
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

        bus.$emit('setLoad', {
          statue: true,
          msg: '分析中...'
        });
        this.$post(g_MapConfig.panelConfig.landUseStatistic.LanduseStatistic_URL, param).then((res) => {
          this.result = JSON.parse(res)
          bus.$emit('setLoad', {
            statue: false,
            msg: '加载中...'
          });
          if (this.result.code == 1) {
            this.resultPanel[0].attributes = this.result.data
            console.log(this.result.data);
            // console.log(this.legendData);
            //   for (let n = 0; n < this.resultPanel[0].attributes.length; n++) {
            //     for(let m = 0;m<this.legendData.length;m++){
            //
            //       if(this.resultPanel[0].attributes[n].DLMC===this.legendData[m].label){
            //         this.resultPanel[0].attributes[n].imageData=this.legendData[m].imageData
            //       }
            //     }
            // }

            console.log(this.resultPanel);

            this.resultPanelIsShow = true;
            this.getEcharts();
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

      },
      getEcharts() {

        let seriesData = [];
        let nameData = [];
        let valueData = [];
        for (let i = 0; i < this.resultPanel[0].attributes.length; i++) {
          seriesData.push({
            "value": this.resultPanel[0].attributes[i].ZMJGQ,
            "name": this.resultPanel[0].attributes[i].DLMC
          });
          nameData.push(this.resultPanel[0].attributes[i].DLMC);
          valueData.push(this.resultPanel[0].attributes[i].ZMJGQ);
        }
        this.options = {
          title: "用地总面积（公顷）",
          content: ["landUseStatistic_pie", "landUseStatistic_bar"],
          seriesData: seriesData,
          nameData: nameData,
          valueData: valueData
          // field: this.formItem.field_select,//字段配置
          // values: ['E1_水域', 'M1_一类工业用地', 'R2_二类居住用地', 'G22_防护绿地'],
          // geometry: geometry
        }
        this.InfoStatistic.updateChart(this.options)
      },
      // startStatistic(){
      //   bus.$emit('setLoad',{
      //     statue:true,
      //     msg:'统计中...'
      //   });
      //   let param = {
      //     type: 'statisticsLayer',
      //     url: "http://192.168.10.115:6080/arcgis/rest/services/DG/CoreData/MapServer/2",
      //     parameters: {
      //       title: "用地面积",
      //       content: ["landUseStatistic_bar","landUseStatistic_pie"],
      //       // field: this.formItem.field_select,
      //       // values: ['公园绿地', '商业用地', '居住用地', '水域'],//492,89,219,147
      //       // backgroundColor: ["#9e549c", "#f789d8", "#FF6EB4", '#FFBBFF'],
      //       //geometry: {"type":"polygon","spatialReference":{"wkt":"PROJCS[\"CGCS2000 TL\",GEOGCS[\"GCS_China_Geodetic_Coordinate_System_2000\",DATUM[\"D_China_2000\",SPHEROID[\"CGCS2000\",6378137.0,298.257222101]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Gauss_Kruger\"],PARAMETER[\"False_Easting\",500000.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",117.8],PARAMETER[\"Scale_Factor\",1.0],PARAMETER[\"Latitude_Of_Origin\",0.0],UNIT[\"Meter\",1.0]]"},"rings":[[[509127.55880864634, 3414586.1288857763],[494193.2731703878, 3425159.074470384],[505305.7953954323, 3434485.6556235463],[509127.55880864634, 3414586.1288857763]]]},
      //     }
      //   }
      //   this.Statistic.sum(param);
      //   this.Statistic.event.on({
      //     'queryComplete': function(res){
      //       //
      //       this.queryData = res;
      //
      //       this.countData = [];
      //       let singleData
      //       for (let i = 0; i < this.queryData.length; i++) {
      //
      //           singleData = {
      //             COUNT_TDYTFQDM: this.queryData[i].attributes.COUNT_TDYTFQDM,
      //             SUM_YDMJ: this.queryData[i].attributes.SUM_TDYTFQMJ,
      //             TDYTFQDM:this.queryData[i].attributes.TDYTFQDM,
      //             TDYTFQMC:this.queryData[i].attributes.TDYTFQMC,
      //           }
      //
      //         this.countData.push(singleData);
      //
      //       }
      //       this.Statistic.updateChart(this.countData);
      //
      //       let result = [];
      //       for(let i=0,len=this.countData.length;i<len;i+=8){
      //         result.push(this.countData.slice(i,i+8));
      //         // this.geometry.push(arr.slice(i,i+7))
      //       }
      //       this.splitResult=result;
      //       this.showResult=this.splitResult[0]
      //
      //       console.log(this.countData);
      //       this.resultPanelIsShow = true;
      //       bus.$emit('setLoad',{
      //         statue:false,
      //         msg:'加载中...'
      //       });
      //     }.bind(this)
      //   })
      // },
      clear() {
        this.geometry = ""
        this.$refs.range.clearDrawGraphics();
      },

      closePane(val) {
        this.resultPanelIsShow = val
      },
      location(geo) {
        geo = JSON.parse(geo.ZBINFO)
        if (geo !== null) {

          AuxiliaryLocation.locationSingle(geo.geometry);
        }
      },

    }
  }
</script>

<style scoped>

</style>
