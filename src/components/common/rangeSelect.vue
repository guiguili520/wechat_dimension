<template>
  <div class="iq-wrap">
    <sg-form-item  style="margin-left: -55px">
      <sg-button-group v-model="formItem.radio_region" @on-change="getRangeType" class="flex">
        <sg-button label="XZQH" v-if="XZQHIsShow == true" style="padding:5px;margin:4px;height: 32px;background-color: #3b86e0" @click="Xzqh">行政区划</sg-button>
        <div style="float: left;width: 82px">
        <import-cad-shp label="import"  name="文件导入" :div-flag="false" v-if="importIsShow == true" v-on:rangeOfCadShp="rangeOfCadShp"></import-cad-shp>
        </div>
        <div style="float: left;">
        <sg-button label="draw"  v-if="drawIsShow == true" style="padding:5px;margin:4px 0px 4px 0;height: 32px;background-color: #3b86e0;color: white;border-radius:5px"><div :id="drawId+'_polygon'">图形绘制</div></sg-button>
        </div>
        <div style="float: left;">
          <sg-button label="identify" v-if="identifyIsShow == true" style="padding:5px;margin:4px;height: 32px;background-color: #3b86e0;color: white;border-radius:5px"  @click="identifyStart">图上点选</sg-button>
        </div>
        <div style="float: left;">
          <sg-button label="clear" v-if="isCleanable == true" style="padding:5px;margin:4px;height: 32px;background-color: red;color: white;border-radius:5px"  @click="clearBtnEvent">清 除</sg-button>
        </div>
      </sg-button-group>
    </sg-form-item>
    <sg-form-item label="所属范围" v-show="xzqhIsShow == true">
      <sg-radio-group v-model="formItem.regionLevel" @on-change='getRegionLevel'>
        <sg-radio label="city" style="margin-right: 10px">全市</sg-radio>
        <sg-radio label="county" style="margin-right: 10px">区县</sg-radio>
        <sg-radio label="town" style="margin-right: 10px">街镇</sg-radio>
      </sg-radio-group>
    </sg-form-item>
    <sg-form-item v-show="formItem.regionLevel=='county' && xzqhIsShow == true">
      <sg-select v-model="formItem.county_select" @on-change="countyLocation">
        <sg-option v-for="(field,index) in countyOptions" :value="field.value" :key="index">{{field.label}}</sg-option>
      </sg-select>
    </sg-form-item>
    <sg-form-item v-show="formItem.regionLevel=='town' && xzqhIsShow == true">
      <sg-select v-model="formItem.town_select" @on-change="townLocation">
        <!-- <sg-select v-model="formItem.town_select" > -->
        <sg-option v-for="(field,index) in townOptions" :value="field.value" :key="index">{{field.label}}</sg-option>
      </sg-select>
    </sg-form-item>
    <slot name="buffer"></slot>
    <span v-if="spatialReferenceNote != '' && spatialReferenceNote != undefined" style="text-align: center;font-size: smaller;color: red">{{spatialReferenceNote}}</span>
  </div>
</template>

<script>
  import {getLocation,} from '../../assets/method';
  import configDataInfo from '../../../public/web/config.json'

  import ImportCadShp from "./importCadShp";
  import bus from '../../assets/eventBus';
  import Draw from '../../classic/common/Draw'

  export default {
    name: "range",
    props: {
      "drawId": {
        type: String,
        default: ""
      },
      "type": {
        type: Array,
        default: []
      },
      "isClearPreGeos":{
        type:Boolean,
        default:false
      },
      "isCleanable":{
        type:Boolean,
        default:true
      }
    },
    data(){
      return {
        //默认配置格式
        defaultConfig:[{
          "id":"county",
          "url":"http://192.168.10.115:6080/arcgis/rest/services/DG/AreaData/MapServer/2",
          "showField":"NAME","regionCode":"CODE"
        },{"id":"town",
          "url":"http://192.168.10.115:6080/arcgis/rest/services/DG/AreaData/MapServer/1",
          "showField":"NAME",
          "regionCode":"CODE"
        }],
        fieldToGetCountyRegion: [],
        fieldToGetTownRegion: [],
        importIsShow: false,
        townFeatures: '',
        countyFeatures: '',
        countyOptions: [],
        townOptions: [],
        countyUrl: "",
        townUrl: "",
        countyFeatures: '',
        Statistic: '',
        rectangle: '',
        circle: '',
        polygon: '',
        geometry: {},
        identifyIsShow:false,
        drawIsShow: false,
        XZQHIsShow: false,
        xzqhIsShow:false,
        formItem: {
          rangeCode: '',
          radio_region: '',
          regionLevel: '',
          county_select: '',
          town_select: '',
          checkbox: [],
          switch: true,
          date: '',
          time: '',

        },
        spatialReferenceNote:""
      }
    },
    components: {ImportCadShp},
    created() {
      let config
      if (g_MapConfig.baseConfig.webgisSpatialExtent) {
        config = g_MapConfig.baseConfig.webgisSpatialExtent
        config.forEach((item, index) => {
          if (item.id == "county") {
            this.countyUrl = item.url;
            this.fieldToGetCountyRegion = [];
            this.fieldToGetCountyRegion.push(item.showField);
            this.fieldToGetCountyRegion.push(item.regionCode);
          }
          if (item.id == "town") {
            this.townUrl = item.url;
            this.fieldToGetTownRegion = [];
            this.fieldToGetTownRegion.push(item.showField);
            this.fieldToGetTownRegion.push(item.regionCode);
          }
        });
      } else {
        console.log("缺少街镇与区县的服务地址配置：analysisurl_kjfw")
      }
    },
    mounted() {
      this.identifyTask = new SgMap.Identify();
      // console.log(this.type,'区域范围类型');
      if (this.type.indexOf("identify") >= 0) {
        this.identifyIsShow = true;
      }
      if (this.type.indexOf("XZQH") >= 0) {
        this.XZQHIsShow = true;
      }
      if (this.type.indexOf("draw") >= 0) {
        this.drawIsShow = true;
      }
      if (this.type.indexOf("import") >= 0) {
        this.importIsShow = true;
      }
      if(this.XZQHIsShow == true) {
        this.Statistic = new SgMap.InfoStatistic();
        let temp = setTimeout(function () {
          if (this.Statistic != undefined) {
            this.Statistic.getCounty(this.countyUrl, this.fieldToGetCountyRegion);
            this.Statistic.getTown(this.townUrl, this.fieldToGetTownRegion);
            this.Statistic.event.on({
              'getCountyComplete': (res) => {
                if (this.countyOptions != []) {
                  let fields = res.features;
                  this.countyFeatures = fields;
                  this.arrayMethod(fields, this.fieldToGetCountyRegion, "countyOptions")
                }
              }
            });

            this.Statistic.event.on({
              'getTownComplete': (res) => {
                if (this.townOptions != []) {
                  let fields = res.features;
                  this.townFeatures = fields;
                  this.arrayMethod(fields, this.fieldToGetTownRegion, "townOptions")
                }
              }
            })
          }
        }.bind(this), 1000)
      }
      this.polygon = new Draw(this.drawId + '_polygon', 'polygon')
      this.polygon.event.on({
        'drawComplete': (res) => {
          this.geometry = res.geometry;
          this.$emit('draw-geometry', res);
        }
      })

      let _this = this
      bus.$on('importRange', (res) => {

        _this.geometry = res.geometry;
        _this.clearBtn()
        _this.$emit('import-cadShp', res);
      })
      bus.$on('identifyRangeComplete', (res) => {
        _this.geometry = res.geometry;
        _this.$emit('draw-geometry', res);
      })

      this.spatialReferenceNote = configDataInfo.UploadSpatialReferenceNote;
    },
    methods: {
      Xzqh(){
        this.xzqhIsShow=!this.xzqhIsShow
      },

      identifyStart(){
        this.identifyTask.singleActive(0,this.isClearPreGeos);
      },

      clearBtn() {
        this.formItem.rangeCode = '';
        this.formItem.regionLevel = "";
        this.formItem.radio_region = ""
      },

      rangeOfCadShp(value) {
        this.geometry = value.geometry;
        this.$emit('import-cadShp', value);
      },

      getRangeCode(type) {
        if (type == 'county') {
          this.formItem.rangeCode = this.formItem.county_select;
        } else if (type == 'town') {
          this.formItem.rangeCode = this.formItem.town_select;
        }

        this.$emit('get-range-code', this.formItem.rangeCode);
      },

      getRangeType() {
        this.clearAll()
        this.$emit('get-range-type', this.formItem.radio_region);
      },

      getRegionLevel() {
        this.clearAll()
        this.$emit('get-regionLevel', this.formItem.regionLevel);
      },

      countyLocation(value) {
        this.formItem.county_select = value
        this.geometry = getLocation(value, this.countyFeatures, this.Statistic, this.countyUrl, this.geometry, this.fieldToGetCountyRegion[1])
        this.$emit('county-location', this.geometry);
        this.Statistic.regionLocation(this.geometry);
        this.getRangeCode('county');
      },

      townLocation(value) {
        this.formItem.town_select = value
        this.geometry = getLocation(value, this.townFeatures, this.Statistic, this.townUrl, this.geometry, this.fieldToGetTownRegion[1])
        this.$emit('town-location', this.geometry);
        this.Statistic.regionLocation(this.geometry);
        this.getRangeCode('town');
      },

      arrayMethod(fields, fieldToGetRegion, target) {
        let tempArray = [];
        let result = [];
        for (let i = 0; i < fields.length; i++) {
          if (tempArray.indexOf(fields[i].attributes[fieldToGetRegion[0]]) < 0) {
            tempArray.push(fields[i].attributes[fieldToGetRegion[0]]);
            result.push({
              value: fields[i].attributes[fieldToGetRegion[1]],
              label: fields[i].attributes[fieldToGetRegion[0]]
            })
          }
        }
        if (target == "countyOptions") {
          this.countyOptions = result;
        } else if (target == "townOptions") {
          this.townOptions = result;
        }
      },

      clearDrawGraphics() {

        if (this.polygon.tempGraphicsLayer) {
          this.polygon.clear();
        }
        if (this.rectangle.tempGraphicsLayer) {
          this.rectangle.clear();
        }
        if (this.circle.tempGraphicsLayer) {
          this.circle.clear();
        }
      },

      clearAll() {
        this.$emit('clear-all', '')
      },

      clearBtnEvent(){
        this.$emit('clear-all', '');
      }
    },
  }
</script>

<style scoped lang="scss">
</style>
