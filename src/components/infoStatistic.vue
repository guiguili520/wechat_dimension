<template>
  <div>
    <div class="statisticPanel iq-content">
      <sg-form :label-width="60" @submit.native.prevent>
        <p class="iq-title">图层选择</p>
        <div class="iq-wrap">
          <div class="iq-select-layer">
            <sg-select v-model="formItem.layer_Select">
              <sg-option v-for="(layer,index) in layerOption" :value="layer.value" :key="index">{{layer.label}}</sg-option>
            </sg-select>
          </div>
        </div>
        <p class="iq-title">条件设置</p>
        <div class="iq-wrap iq-setconf">
          <sg-form-item label="分组字段">
            <sg-select v-model="formItem.field_select">
              <sg-option v-for="(field,index) in showFields" :value="field.value" :key="index">{{field.label}}</sg-option>
            </sg-select>
          </sg-form-item>
          <sg-form-item label="统计方式">
            <sg-select v-model="formItem.type_select">
              <sg-option value="count">按数量</sg-option>
            </sg-select>
          </sg-form-item>
        </div>
        <p class="iq-title">统计空间范围</p>
       <s-range :type="rangeType"
                 :drawId="drawId"

                 ref="range"
                @get-range-type="getRangeType"
                @get-regionLevel="getRegionLevel"
                @import-cadShp="importCadShp"
                 @county-location="countyLocation"
                 @town-location="townLocation"
                 @draw-geometry="drawGeometry"
                @clear-all ="clear"
       >
         <div slot="buffer">
            <sg-form-item label="是否缓冲" v-show = "isBufferOrNot">
                <sg-checkbox-group v-model="formItem.buffer_checkbox" @on-change="isBuffer">
                <sg-checkbox label="buffer" >加入缓冲分析</sg-checkbox>
                </sg-checkbox-group>
            </sg-form-item>
           <div class="flex" v-show="formItem.buffer_checkbox[0] == 'buffer'">
             <span style="margin: 10px 2px;">缓冲距离：</span>
             <sg-input v-model="formItem.bufferDistance" placeholder="" style="width: 80px" @on-enter="reBuffer" ></sg-input>
             <span style="margin: 10px 2px;">(m)</span>
           </div>
            <!--<sg-form-item label="缓冲距离" v-show="formItem.buffer_checkbox[0] == 'buffer'">-->
                <!--<sg-input v-model="formItem.bufferDistance" placeholder="" style="width: 50px" @on-enter="reBuffer" ></sg-input>-->
                <!--(m)-->
            <!--</sg-form-item>-->
         </div>
       </s-range>

        <div class="iq-button">
          <sg-button type="primary" @click="statistic()">统计</sg-button>
          <sg-button @click="clearAll()">清除</sg-button>
        </div>
      </sg-form>
    </div>
    <s-respane v-show="resultPanelIsShow" name="统计结果" @pane-close="closePane" :w="800" :h="600">
      <sg-tab type="card" :animated="false" @on-click="getTabName">
        <sg-tab-pane label="表格" name="table">
          <sg-table :show-page="false"  ref = "table" :columns="countColumns" :data="countData" @on-row-click="location"></sg-table>
        </sg-tab-pane>
        <sg-tab-pane label="饼状图" name="pie">
          <div id="myChart" style="width: 660px;height: 480px" ></div>
        </sg-tab-pane>
        <sg-tab-pane label="柱状图" name="bar">
          <div id="myBarChart" style="width: 660px;height: 480px"></div>
        </sg-tab-pane>
      </sg-tab>
      <div  style="margin-top: 8px;margin-left: 14px;" slot="bottom" v-show="tabName=='table'">
        <sg-button @click="exportData">导出Excel</sg-button>
      </div>
    </s-respane>

  </div>
</template>

<script>
  import SRespane from '@/components/common/resultPanel'
  import bus from '../assets/eventBus';
  import SRange from '@/components/common/range'
  import {export2Excel} from '@/classic/common/export2Excel'


  export default {
    name: "sStatistic",
    data() {
      return {
        statisticValues:["三类工业用地", "二类工业用地", "交通场站用地", "体育用地","公园绿地", "公用设施用地", "农林用地", "区域交通设施用地",
        "医疗卫生用地", "商业服务业设施用地", "城市轨道交通用地", "城市道路用地","居住用地", "广场用地", "教育科研用地", "文化设施用地",
        "水域", "物流仓储用地", "行政办公用地", "防护绿地"],
        legendUrl:"",
        imagesUrl:"",
        legendData:[],
        tabName:'table',
        drawId:'informationStatistic',
        rangeType:["XZQH","draw"],
        queryData: [],
        countColumns: [
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
                    border:0,
                    opacity:1,
                    verticalAlign: "middle"
                  },
                  attrs: {
                    // src:params.row.imageData==""?"":'data:image/png;base64,'+params.row.imageData
                    src:params.row.imageData==""?"":(params.row.imageData.indexOf(":")>=0?params.row.imageData:this.imagesUrl+params.row.imageData)
                  },
                  class:'esri-legend__symbol'
                })
              ])
            }
          },
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '数量',
            key: 'value'
          }
        ],
        countData: [],
        bufferGeometry:'',
        resultPanelIsShow: false,
        isBufferOrNot:false,
        formItem: {
          regionLevel:'city',
          rangeType:'XZQH',
          buffer_checkbox:[],
          county_select:'',
          town_select:'',
          layer_Select: "",//配置一
          // layer_Select: CoreData_19,//配置一
          // field_select: 'YDXZ',//配置二
          field_select: "",//配置二
          type_select: 'count',
          checkbox: [],
          switch: true,
          date: '',
          time: '',
          bufferDistance: 1000
        },
        layerOption: [
          {
            value: "",//同配置一
            // value: CoreData_19,//同配置一
            label: "城市总体规划图层",
          }
        ],
        showFields: [
          {
            value: "YDXZ",//同配置二
            label: "用地性质",
          },
        ],
        field: "",
        geometry: '',
        Statistic: '',
        features:''
      }
    },
    components: {SRespane,SRange},
    created(){

    },
    mounted() {
      this.layerOption =[];
      this.showFields = [];
      let config
      if(g_MapConfig.panelConfig.infoStatistic){
        config = g_MapConfig.panelConfig.infoStatistic;
      }else{
        console.log("缺少信息统计功能相关数据配置:infoStatistic")
        return;
      }
      console.log(this)
      this.layerOption.push(config.statisticUrl);
      this.showFields.push(config.statisticField);
      this.statisticValues = config.statisticValues
      this.imagesUrl=config.imagesUrl;
      this.legendUrl = config.legendUrl;
      
      this.Statistic = new SgMap.InfoStatistic();
      this.getImageData()
    },
    methods: {
      getImageData(){
        this.$get(this.legendUrl).then((res)=>{
          if(res.layers[0].layerName == "城市总体规划"){
            this.legendData = res.layers[0].legend;
          }
        }).catch((error) => {
          console.log("获取城市总体规划图例接口报错："+ error)
        })
      },
      getTabName(name){
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
      exportData(){
        let tHeader =this.countColumns;
        let tbody =this.countData;
        for(let m =0;m<this.countData.length;m++){
          let att = this.countData[m]
          if(att.imageData!=""){
            att.imageData =  this.imagesUrl + att.imageData
          }
        }
        export2Excel(tHeader, tbody, '城乡空间布局规划统计')
      },
      // exportData(type){
      //   if (type === 1) {
      //     this.$refs.table.exportCsv({
      //       filename: '城市总体规划用地性质数量'
      //     });
      //   }
      // },
      isBuffer(){
        if (this.formItem.buffer_checkbox[0] == "buffer") {
          this.buffer()
        }else{
          this.bufferGeometry = '';
        }
      },
      buffer(){
        let buffer = this.Statistic.buffer(this.geometry, this.formItem.bufferDistance);
        this.Statistic.event.on({
          'bufferComplete':function (res){
          this.bufferGeometry = res;
        }.bind(this)
      })
      },
      reBuffer(){
        this.Statistic.clearGraphics();
        this.buffer()
      },
      drawGeometry(gra){
        this.geometry = drawGeometry
        this.isBufferOrNot = true;
      },
      getRegionLevel(value){
        this.formItem.regionLevel = value
        if(this.formItem.regionLevel === 'city' && this.formItem.rangeType == 'XZQH' ){
          this.geometry = ''
        }
      },
      getRangeType(value){
        this.formItem.rangeType == value
        if(this.formItem.regionLevel === 'city' && this.formItem.rangeType == 'XZQH' ){
          this.geometry = ''
        }
      },
      countyLocation(geo){
        this.geometry = geo
        this.isBufferOrNot = true;
      },
      townLocation(geo){
        this.geometry = geo
        this.isBufferOrNot = true;
      },
      importCadShp(gra){
        this.geometry = gra.geometry;
        this.isBufferOrNot = true;
      },
      //表格定位
      location(index){
        for(let i=0;i<this.queryData.length;i++){
          if(index.name == this.queryData[i].name){
            this.features = this.queryData[i].features;
            break
          }
        }
        this.Statistic.location(this.features);
      },
      clear() {
        this.isBufferOrNot = false;
        this.formItem.buffer_checkbox = [];
        this.Statistic.clearGraphics();
        this.$refs.range.clearDrawGraphics();
      },
      clearAll() {
        this.formItem.layer_Select = "";
        this.formItem.field_select = "";
        this.isBufferOrNot = false;
        this.formItem.buffer_checkbox = [];
        // this.Statistic.clearGraphics();
        // this.$refs.range.clearDrawGraphics();
        // this.$refs.range.clearBtn();
        // this.geometry = ""
      },
      statistic() {
        let geometry;
        if(this.bufferGeometry !=''){
          geometry = this.bufferGeometry
        }else{
          geometry = this.geometry
        }
        let param = {
          url: this.formItem.layer_Select,//图层配置
          parameters: {
            title: "用地数量",
            content: ["myChart", "myBarChart"],
            field: this.formItem.field_select,//字段配置
            values: this.statisticValues,
            geometry: geometry
          }
        }
        if(param.url==""){
          this.$msg.error("请选择图层！");
        }else if(param.parameters.field == ""){
          this.$msg.error("请选择分组字段！");
        }else{
          bus.$emit('setLoad',{
            statue:true,
            msg:'统计中...'
          });
         this.Statistic.count(param);
        }
        this.Statistic.event.on({
          'queryComplete': function(res){
            this.queryData = res;
            this.countData = [];
            for (let i = 0; i < this.queryData.length; i++) {
              let singleData = {
                name: this.queryData[i].name,
                value: this.queryData[i].total,
                imageData:""
              }
              let newParam = singleData.name.replace(/(^\s*)/g,"");
                for(let m = 0;m<this.legendData.length;m++){
                  if(newParam==this.legendData[m].label){
                    singleData.imageData=this.legendData[m].url
                  }
                }
              this.countData.push(singleData);
            }
            bus.$emit('setLoad', {
              statue: false,
              msg: '加载中...'
            });
            this.resultPanelIsShow = true;
          }.bind(this)
        })
      },
      closePane(val) {
        this.resultPanelIsShow = val
      }
    }
  }
</script>

<style scoped lang="scss">
  .draw {
    div {
      border-right: 1px solid #ccc;
      &:last-child {
        border: none;
      }
    }
  }
</style>
