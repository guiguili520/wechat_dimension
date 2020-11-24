<template>
  <div class="infoQuery">
  <div class="statisticPanel iq-content">

    <sg-form :model="formItem" :label-width="60" @submit.native.prevent >
      <p class="iq-title">图层选择</p>
        <div class="iq-wrap">
          <div class="iq-select-layer">
          <sg-select v-model="formItem.layer_Select"  @on-change="getlayerOptions(formItem.layer_Select)">
            <sg-option v-for="layer in layerSelection" :value="layer.value" >{{ layer.label }}</sg-option>
          </sg-select>
            </div>
        </div>
      <p class="iq-title">条件设置</p>
      <div class="iq-wrap iq-setconf">
        <sg-form-item :label-width="70" label="查询字段:">
          <sg-select v-model="formItem.field_query" :disabled="fieldDisable" :placeholder="loadingText" style="width: 240px;"  @on-change="getCharacter(formItem.field_query)">
            <sg-option v-for="field in fieldSelection" :value="field.value" >{{field.label}}</sg-option>
          </sg-select>
        </sg-form-item>
        <sg-form-item :label-width="70" label="操作符号:">
          <sg-select v-model="formItem.symbol_select" style="width: 240px;margin-bottom: 10px" :disabled="charDisable">
            <sg-option v-for="symbol in symbolSelection" :value="symbol.value" >{{symbol.label}}</sg-option>
          </sg-select>
        </sg-form-item>
        <sg-form-item :label-width="70" label="字段值:" >
          <sg-input v-model="formItem.fieldvalue" placeholder="请输入字段值" style="width: 240px"></sg-input>
        </sg-form-item>
      </div>
      <p class="iq-title">查询空间范围</p>
      <div class = "queryRange">
      <s-range :type="rangeType"
               :drawId="drawId"
               ref="range"
               @get-range-type="getRangeType"
               @get-regionLevel="getRegionLevel"
               @county-location="countyLocation"
               @town-location="townLocation"
               @draw-geometry="drawGeometry"
               @import-cadShp="importCadShp"
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
        </div>
      </s-range>

      </div>
      <div class="iq-button">
        <sg-button @click="clearAll()">清除</sg-button>
        <sg-button type="primary" @click="informationQuery()">查询</sg-button>
      </div>
    </sg-form>
  </div>
   <s-respane v-show="resultPanelIsShow" name="信息查询结果" @pane-close="closePane" :w="700" :h="660">
      <sg-table :show-page="false" :columns="columnQuery"  :data="showResult" height="556" @on-row-click="mapDisplay" ></sg-table>
      <sg-page slot="bottom" :total="queryData.length"
              show-total=""
              show-elevator=""
              :page-size="10"
              size="small"
              @on-change="changePage"
              class="result_page"
              style="margin-top: 10px; margin-left: 84px;"></sg-page>
    </s-respane>
  </div>
</template>

<script>
  import {dateFormat} from '@/classic/common/date'

  // import {CoreData4} from '../config/api.js'
  import SRespane from '@/components/common/resultPanel'
   import bus from '../assets/eventBus'
  import SRange from '@/components/common/range'
    export default {
        name: "sSearchquery",
      components:{SRespane,SRange},
      data () {
        return {
          loadingText:"请选择",
          fieldDisable:true,
          charDisable:true,
          isBufferOrNot:false,
          drawId:'informationQuery',
          rangeType:["XZQH","draw"],
          queryResult:'',
          districtFeatures:'',
          townFeatures:'',
          layerResult:'',
          fieldToGetRegion:["NAME"],
          // districtUrl:countyUrl,
          // townUrl:townUrl,
          queryData:[],
          resultPanelIsShow:false,
          formItem:{
            regionLevel:'city',
            rangeType:'XZQH',
            buffer_checkbox:[],
            bufferDistance: 1000,
            layer_Select:null,
            field_query:'',
            symbol_select:'',
            fieldvalue:'',
            select_checkbox: 'XZQH',
            select_checkbox2: 'city',
            geometry: '',
            bufferDistance: 1000,
            district_select:'',
            town_select:'',
          },
          layerSelection: [
            {
              value: "",
              // value: CoreData4,
              label: "土地利用总体规划管制分区图层",
            }
          ],
          fieldSelection:[],
          symbolSelection:[],
          districtSelection:[],
          townSelection:[],
          columnQuery:[],
          // columnQuery:[
          //   {
          //      title: '行政区代码',
          //       key: 'XZQDM'
          //   },
          //   {
          //     title: '行政区名称',
          //     key: 'XZQMC'
          //   },
          //   {
          //     title: '用地面积',
          //     key: 'MJ'
          //   },
          //   {
          //     title: '管制分区代码',
          //     key: 'GZFQDM'
          //   },
          //   {
          //     title: '管制分区名称',
          //     key: 'GZFQMC'
          //   }
          // ],
          searchResult:[],
          showResult:[],
          informationResult:[],
          // index:'',
          field:"",
          symbol:"",
          fieldValue:"",
          region:"",
          selectdistrict:"",
           url: "",
          Query:{},
          pages:0,
          polygon: {},
          rectangle: {},
          circle: {},
          tempArray:[],
          type:"",
          geoLoc:{},
          fieldInfos: [{
            fieldName: "name"
          }, {
            fieldName: "address1",
            label: "address"
          }]
        }
      },
      mounted(){
        bus.$on('get-layerOptions', (res) => {
          this.layerSelection = []
          res.map((item,index,arr)=>{
            this.layerSelection.push({
              value:item.value+"/0",
              label:item.label
            });
          })
        })
        this.Highlight = new SgMap.Highlight()
        this.Statistic = new SgMap.InfoStatistic();
        this.layerSelection = []

        this.Query =  new SgMap.InfoQuery();
        this.Query.event.on({
          'getLayerFieldComplete': function(res){
            this.fieldDisable = false;
            this.loadingText = "请选择";
            this.queryResult = res;
            let fields = res;

            for (let i = 0; i < fields.length; i++) {
              if (this.tempArray.indexOf(fields[i].alias) < 0) {
                this.tempArray.push(fields[i].alias);
                this.fieldSelection.push({
                  value: fields[i].name,
                  label: fields[i].alias
                })
                this.fieldInfos.push({
                  fieldName: fields[i].name,
                  label: fields[i].alias
                })
                this.columnQuery.push({
                  title:fields[i].alias,
                  key:fields[i].name,
                  minWidth:100
                })
              }
            };
          }.bind(this)
        })
        this.Query.event.on({
          'getsearchResComplete' :(res)=>{
            this.searchRes(res)
            this.resultPanelIsShow=true
          }
        })
      },
      methods:{
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
        //区域选择切换的清空图层事件
        clear() {
          this.isBufferOrNot = false;
          this.formItem.buffer_checkbox = [];
          this.Statistic.clearGraphics();
          this.$refs.range.clearDrawGraphics();
        },
        clearAll() {
          this.resultPanelIsShow = false;
          this.formItem.layer_Select = "";
          this.emptyOption();
          this.isBufferOrNot = false;
          this.formItem.buffer_checkbox = [];
        },
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
          this.geometry = gra.geometry
          this.isBufferOrNot = true;
        },
        countyLocation(geo){
          this.geometry = geo
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
        townLocation(geo){
          this.geometry = geo
          this.isBufferOrNot = true;
        },
        informationQuery(){

          let geometry;
          if(this.bufferGeometry !='' && this.bufferGeometry !=undefined){
            geometry = this.bufferGeometry
          }else{
            geometry = this.geometry
          }
        let selectedvalue={
          field: this.formItem.field_query,
          symbol:this.formItem.symbol_select,
          fieldValue:this.formItem.fieldvalue,
          // region:this.formItem.select_checkbox,
          geometry:geometry,
          fieldType:this.type
          }
          //console.log(selectedvalue);
          if(this.formItem.layer_Select == ""){
            this.$msg.error("请选择图层！")
          }else if(selectedvalue.field == ""){
            this.$msg.error("请选择字段！")
          }else if(selectedvalue.symbol == ""){
            this.$msg.error("请选择操作符号！")
          }else if(selectedvalue.fieldValue == ""){
            this.$msg.error("请输入字段值！")
          }else{
            this.Query.getsearchRes(this.formItem.layer_Select,selectedvalue);
          }


        },
        getCharacter(){
          this.charDisable = true;
          this.symbolSelection=[];
          let res =this.queryResult;
          for (let i = 0; i < res.length; i++){
            if(this.formItem.field_query == res[i].name && res[i].type == 'string'){
              this.type = "string"
              let data =[{
                value:'LIKE',
                label:'包含'
              },{
                value:'=',
                label:'等于'
              },{
                value:'<>',
                label:'不等于'
              }]
              this.symbolSelection = data
              this.charDisable=false;
            }else if(this.formItem.field_query == res[i].name){
              this.type = "num"
              let data =[{
                value:'=',
                label:'等于'
              },{
                value:'>',
                label:'大于'
              }, {
                  value:'<',
                  label:'小于'
                },{
                value:'>=',
                label:'大于等于'
              },{
                value:'<=',
                label:'小于等于'
              },{
                value:'<>',
                label:'不等于'
              }]
              this.symbolSelection = data
              this.charDisable=false;
            }

          }

        },
        // districtLocation(){
        //   for(let i=0; i<this.districtFeatures.length;i++){
        //     if(this.formItem.district_select==this.districtFeatures[i].attributes[this.fieldToGetRegion[0]]){
        //      this.geometry=this.districtFeatures[i].geometry;
        //     }
        //   }
        //   this.Query.regionLocation(this.districtUrl,this.geometry);
        // },
        // townLocation(){
        //   for(let i=0; i<this.townFeatures.length;i++){
        //     if(this.formItem.town_select==this.townFeatures[i].attributes[this.fieldToGetRegion[0]]){
        //       this.geometry=this.townFeatures[i].geometry;
        //     }
        //   }
        //   this.Query.regionLocation(this.townUrl,this.geometry);
        // },
        getlayerOptions(value){
          this.charDisable = true;
          this.fieldDisable = true;
          this.loadingText = "加载中...";
          console.log(value)
          //清空选项
          this.emptyOption();
          // this.fieldSelection = []
          this.columnQuery = [];
          this.tempArray = [];
          this.showResult = []
          // this.index=this.getIndex(this.layerSelection,value);
          // this.Query.getLayerField(this.formItem.layer_Select);

          this.Query.getLayerField(value);
        },
        emptyOption(){
          this.formItem.fieldvalue = "";
          this.formItem.field_query = "";
          this.formItem.symbol_select = "";
          this.fieldSelection=[];
          this.fieldInfos = [];
          this.symbolSelection=[];
        },
        closePane(val){
          this.resultPanelIsShow=val;
        },
        searchRes(res) {
          this.showResult = [];
          this.queryData = res;
          //console.log(this.queryData);
          this.searchResult = [];

          for (let i = 0; i < this.queryData.length; i++) {
            if(this.queryData[i].attributes.RKSJ!=undefined){
              this.queryData[i].attributes.RKSJ = dateFormat(this.queryData[i].attributes.RKSJ)
            }

            this.searchResult.push(this.queryData[i].attributes);

            let result = [];
            for (let i = 0, len = this.searchResult.length; i < len; i += 10) {
              result.push(this.searchResult.slice(i, i + 10));
            }
            this.splitResult = result;
            this.showResult = this.splitResult[0];
          }
          //console.log(this.searchResult);
          this.resultPanelIsShow = true;
          bus.$emit('setLoad', {
            statue: false,
            msg: '加载中...'
          });
        },
        changePage(index){
          this.pages=index-1;
          this.showResult=this.splitResult[index-1]
        },
        mapDisplay(index){
         for(let i=0;i<this.queryData.length;i++){
            if(index.OBJECTID == this.queryData[i].attributes.OBJECTID){
              this.feature = this.queryData[i]
              this.geoLoc = this.queryData[i].geometry;
              break
            }
          }
          let graphic = this.Highlight.geometryHighlight(this.geoLoc);
          graphic.attributes = this.feature.attributes;
          graphic.popupTemplate = {
            title:"属性表",
            content:[{
              type: "fields",
              fieldInfos: this.fieldInfos
            }],
          }
        },
      }

    }
</script>

<style  lang="scss">
.infoQuery{
    .sg-select-dropdown {
    width:100% !important;
      top:35px !important;
}
}
</style>
