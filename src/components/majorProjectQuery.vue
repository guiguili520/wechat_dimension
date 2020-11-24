<template>
  <div>
    <div class="statisticPanel iq-content">
      <sg-form :model="formItem" :label-width="60" >
        <p class="iq-title">查询方式</p>
        <div class="iq-wrap">
          <div class="iq-select-layer">
            <sg-select v-model="formItem.query_Method" >
              <sg-option v-for="mode in modeSelection" :value="mode.value" >{{ mode.label }}</sg-option>
            </sg-select>
          </div>
        </div>
        <p class="iq-title">查询图层 (<span style="color: #999999;"> 单选 </span>)</p>
        <div class="iq-wrap">
          <div class="iquery-queryLayer">
            <sg-radio v-model="formItem.single_query" true-value="0" >建设项目</sg-radio>
          </div>
        </div>
        <p class="iq-title">查询关键字 (<span style="color: #999999;"> 按关键字段模糊查询 </span>)</p>
        <div class="iq-wrap">
          <sg-form-item label="查询字段:" style="margin-bottom: 8px;">
            <sg-select v-model="formItem.field_query" :disabled="fieldDisable" :placeholder="loadingText" style="width: 235px;" >
              <sg-option v-for="field in fieldSelection" :value="field.value" >{{field.label}}</sg-option>
            </sg-select>
          </sg-form-item>
          <sg-form-item label="关键字:" >
            <sg-input v-model="formItem.value" placeholder="请输入要查询的关键字，例如:中学" style="width: 235px"></sg-input>
          </sg-form-item>
        </div>

        <p class="iq-title">查询空间范围</p>
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
            <sg-form-item label="缓冲距离" v-show="formItem.buffer_checkbox[0] == 'buffer'">
              <sg-input v-model="formItem.bufferDistance" placeholder="" style="width: 50px" @on-enter="reBuffer" ></sg-input>
              (m)
            </sg-form-item>
          </div>
        </s-range>
        <div class="iq-button">
          <sg-button @click="clearBtn()">清除</sg-button>
          <sg-button type="primary" @click="majorProjectQuery()">查询</sg-button>
        </div>
      </sg-form>
    </div>
    <s-respane v-show="keyprojectShow" name="按建设项目查询结果" @pane-close="closePane" :w="700" :h="470">
      <sg-table :show-page="false" :columns="columnQuery" :data="showResult" height="376" @on-row-click="rowClickEvent"></sg-table>
      <sg-page :total="queryResult.length"
               show-total=""
               show-elevator=""
               :page-size="7"
               size="small"
               @on-change="changePage"
               class="result_page"
               style="padding: 10px 0;"></sg-page>
    </s-respane>
  </div>
</template>

<script>
  import SRespane from '@/components/common/resultPanel'
  import SRange from '@/components/common/range'
  import bus from '../assets/eventBus'
  export default {
    name: "MajorProjectQuery",
    components:{SRespane,SRange},
    data () {
      return {
        loadingText:"请选择",
        fieldDisable:true,
        fieldsFromQuery:[],
        bufferGeometry:'',
        geometry:{},
        isBufferOrNot:false,
        drawId:'MajorProjectQuery',
        rangeType:["XZQH","draw"],
        districtFeatures:'',
        townFeatures:'',
        fieldToGetRegion:["NAME"],
        // districtUrl:countyUrl,
        // townUrl:townUrl,
        queryUrl:"",
        formItem:{
          buffer_checkbox:[],
          bufferDistance: 1000,
          regionLevel:'city',
          rangeType:'XZQH',
          query_Method:'mode',
          single_query:'0',
          field_query:'',
          value:'',
          select_checkbox: 'XZQH',
          select_checkbox2: 'city',
          geometry: '',
          district_select:'',
          town_select:'',
        },
        modeSelection: [
          {
            value:"mode",
            label:"按建设项目查询"
          }
        ],
        fieldSelection:[],
        districtSelection:[],
        townSelection:[],
        keyproject:{},
        field:"",
        KeyWord:"",
        keyprojectShow:false,
        columnQuery:[
          {
            title:'标识码',
            key:'BSM'
          },
          {
            title: '项目名称',
            key: 'XMMC'
          },
          {
            title: '项目类别',
            key: 'XMLB'
          },
          {
            title: '牵头单位',
            key: 'QTDW'
          },
          {
            title: '所属行政区',
            key: 'SSXZQ'
          },
          {
            title: '总投资',
            key: 'ZTZ'
          }
        ],
        showResult:[],
        queryResult:[],
        pages:0,
        geoLoc:{},
        fieldInfos: []
      }
    },
    created(){


    },
    mounted(){
      if(!g_MapConfig.panelConfig.majorProjectQuery){
        // this.$msg.error("缺少重点项目查询功能相关数据配置。功能标识：majorProjectQuery")
        console.log("缺少重点项目查询功能相关数据配置。功能标识：majorProjectQuery")
        return;
      }else{
        let config = g_MapConfig.panelConfig.majorProjectQuery
        this.columnQuery = config.showFields;
        this.queryUrl = config.url;
      }

      this.Statistic = new SgMap.InfoStatistic();
      this.fieldDisable = true;
      this.loadingText = "加载中...";
      this.keyproject=new SgMap.MajorProjectQuery(this.queryUrl);

      this.Highlight = new SgMap.Highlight()
      this.keyproject.event.on({
        'getFieldComplete': (res)=>{
          this.fieldsFromQuery = res;
          this.fieldDisable = false;
          this.loadingText = "请选择";
          //
          let fields = res;
          let tempArray = [];
          for (let i = 0; i < fields.length; i++) {
            if (tempArray.indexOf(fields[i].alias) < 0) {
              tempArray.push(fields[i].alias);
              this.fieldSelection.push({
                value: fields[i].name,
                label: fields[i].alias
              })
              this.fieldInfos.push({
                fieldName: fields[i].name,
                label: fields[i].alias
              })
            }
          };
        }
      })
      this.keyproject.event.on({
        'getbuildprojectResComplete' :(res)=>{
          this.buildprojectRes(res.features)
          this.keyprojectShow=true
        }
      })
    },
    methods: {
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
      // districtLocation(){
      //   for(let i=0; i<this.districtFeatures.length;i++){
      //     if(this.formItem.district_select==this.districtFeatures[i].attributes[this.fieldToGetRegion[0]]){
      //       this.geometry=this.districtFeatures[i].geometry;
      //     }
      //   }
      //   this.keyproject.regionLocation(this.districtUrl,this.geometry);
      // },
      // townLocation(){
      //   for(let i=0; i<this.townFeatures.length;i++){
      //     if(this.formItem.town_select==this.townFeatures[i].attributes[this.fieldToGetRegion[0]]){
      //       this.geometry=this.townFeatures[i].geometry;
      //     }
      //   }
      //   this.keyproject.regionLocation(this.townUrl,this.geometry);
      // },
      majorProjectQuery(){
        let url=this.queryUrl;
        let selectdistrict='';
        if(this.formItem.select_checkbox2 =='district'){
          selectdistrict=this.formItem.district_select
        }else if(this.formItem.select_checkbox2 =='town'){
          selectdistrict=this.formItem.town_select
        }
        let geometry;
        if(this.bufferGeometry !=''){
          geometry = this.bufferGeometry
        }else{
          geometry = this.geometry
        }
        let selectedvalue={
          field: this.formItem.field_query,
          KeyWord:this.formItem.value,
          // region:this.formItem.select_checkbox,
          geometry:geometry,
          // selectdistrict:selectdistrict,
          fieldType:''
        }

        if(selectedvalue.field == ""){
          this.$msg.error("请选择查询字段！")
        }else if(selectedvalue.KeyWord == ""){
          this.$msg.error("请输入关键字！")
        }else{
          for(let i=0;i<this.fieldsFromQuery.length;i++){
            if (selectedvalue.field == this.fieldsFromQuery[i].name){
              selectedvalue.fieldType = this.fieldsFromQuery[i].type
            }
          }

          this.keyproject.getbuildprojectRes(url,selectedvalue);
        }
        //console.log(selectedvalue);



      },
      closePane(val){
        this.keyprojectShow=val;
      },
      buildprojectRes(res) {
        //
        this.showResult = [];
        this.queryData = res;
        this.queryResult = [];

        for (let i = 0; i < this.queryData.length; i++) {
          this.queryResult.push(this.queryData[i].attributes);
          let result = [];
          for (let i = 0, len = this.queryResult.length; i < len; i += 7) {
            result.push(this.queryResult.slice(i, i + 7));
          }
          this.splitResult = result;
          this.showResult = this.splitResult[0]
        }
        this.keyprojectShow = true;
        bus.$emit('setLoad', {
          statue: false,
          msg: '加载中...'
        });
      },
      changePage(index){
        //console.log(index)
        this.pages=index-1;
        this.showResult=this.splitResult[index-1]

      },
      rowClickEvent(index){

        let feature;
        for(let i=0;i<this.queryData.length;i++){
          if(index.XMMC == this.queryData[i].attributes.XMMC){
            feature = this.queryData[i]
            this.geoLoc = this.queryData[i].geometry;
            break
          }
        }
        let graphic = this.Highlight.geometryHighlight(this.geoLoc);
        graphic.attributes = feature.attributes;
        graphic.popupTemplate = {
          title: "属性表",
          content: [{
            type: "fields",
            fieldInfos: this.fieldInfos
          }],
        }
      },
      clear(){
        this.keyprojectShow=false;
        this.isBufferOrNot = false;
        this.formItem.buffer_checkbox = [];
      },
      clearBtn(){
        this.formItem.value = ""
      }
    }
  }
</script>

<style scoped lang="scss" >
  .iquery-content {
    .iquery-title {
      margin: 0 0 12px 20px;
      font-size: 14px;
    }
    .iquery-setconf {
      .sg-form-item:first-child {
        margin-bottom: 10px;
      }
    }
    .iquery-queryMode {
      .sg-form-item-content {
        margin: 0 !important;
        font-size: 14px;
      }
    }
    .iquery-wrap {
      background-color: #f4f5f6;
      padding: 15px 10px;
      margin: 0 10px 18px 10px;
      .sg-form-item {
        margin-bottom: 0;
      }
    }
    .iquery-button {
      padding: 10px 15px;
      text-align: center;
      .sg-btn {
        padding: 7px 45px;
        margin: 5px;
      }
    }
  }
</style>
