<template>
  <div class="iq-wrap">
    <sg-form-item label="空间范围">
      <sg-radio-group v-model="formItem.radio_region" @on-change="getRangeType" style="margin-left: 5px;">
        <sg-radio label="XZQH" style="margin-right: 10px" v-if="XZQHIsShow == true">行政区划</sg-radio>
        <sg-radio label="import" style="margin-right: 10px" v-if="importIsShow == true">文件导入</sg-radio>
        <sg-radio label="draw" style="margin-right: 10px" v-if="drawIsShow == true">绘制</sg-radio>
        <sg-radio label="identify" style="margin-right: 10px" v-if="identifyIsShow == true">图上点选</sg-radio>
      </sg-radio-group>
    </sg-form-item>
    <sg-form-item v-show="formItem.radio_region=='XZQH' && XZQHIsShow == true">
      <sg-radio-group v-model="formItem.regionLevel" @on-change='getRegionLevel'>
        <sg-radio label="city" style="margin-right: 10px">全市</sg-radio>
        <sg-radio label="county" style="margin-right: 10px">区县</sg-radio>
        <sg-radio label="town" style="margin-right: 10px">街镇</sg-radio>
      </sg-radio-group>
    </sg-form-item>
    <sg-form-item label="所属区县"
                  v-show="formItem.regionLevel=='county' && formItem.radio_region == 'XZQH' && XZQHIsShow == true">
      <sg-select v-model="formItem.county_select" @on-change="countyLocation">
        <sg-option v-for="(field,index) in countyOptions" :value="field.value" :key="index">{{field.label}}</sg-option>
      </sg-select>
    </sg-form-item>

    <sg-form-item label="所属街镇"
                  v-show="formItem.regionLevel=='town' && formItem.radio_region == 'XZQH' && XZQHIsShow == true">
      <sg-select v-model="formItem.town_select" @on-change="townLocation">
        <!-- <sg-select v-model="formItem.town_select" > -->
        <sg-option v-for="(field,index) in townOptions" :value="field.value" :key="index">{{field.label}}</sg-option>
      </sg-select>
    </sg-form-item>

    <div class="flex draw" v-show="formItem.radio_region=='draw'" style="margin-left: 100px;vertical-align: center;text-align: center">
      <div class="action-button esri-icon-polygon esri-widget--button" :id="drawId+'_polygon'"
           title="面"></div>
      <div class="action-button esri-icon-checkbox-unchecked esri-widget--button" :id="drawId+'_rectangle'"
           title="矩形"></div>
      <div class="action-button esri-icon-radio-unchecked esri-widget--button" :id="drawId+'_circle'"
           title="圆形"></div>
    </div>

    <div class="flex identify" v-show="formItem.radio_region=='identify' && identifyIsShow==true">
      <sg-button  style="padding:10px 10px;margin-left:40px;" @click="identifyStart">开始点击</sg-button>
    </div>

    <slot name="buffer"></slot>
    <import-cad-shp v-show="formItem.radio_region=='import' && importIsShow==true" style="margin-left: 107px" :div-flag="false"
                    v-on:rangeOfCadShp="rangeOfCadShp">
    </import-cad-shp>
  </div>
</template>

<script>
  import {getLocation,} from '../../assets/method';

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
      // "countyOptions": {
      //     type: Array,
      //     default:[]
      // }, "townOptions": {
      //     type: Array,
      //     default: []
      // }

    },
    data() {
      return {
        //默认配置格式
        // defaultConfig:[{
        //   "id":"county",
        //   "url":"http://192.168.10.115:6080/arcgis/rest/services/DG/AreaData/MapServer/2",
        //   "showField":"NAME","regionCode":"CODE"
        // },{"id":"town",
        //   "url":"http://192.168.10.115:6080/arcgis/rest/services/DG/AreaData/MapServer/1",
        //   "showField":"NAME",
        //   "regionCode":"CODE"
        // }],
        fieldToGetCountyRegion: [],
        fieldToGetTownRegion: [],
        importIsShow: false,
        townFeatures: [],
        // countyFeatures: '',
        countyOptions: [],
        townOptions: [],
        // fieldToGetRegion:["NAME","CODE"],
        // countyUrl:countyUrl,
        // townUrl:townUrl,
        countyUrl: "",
        townUrl: "",
        countyFeatures: [],
        Statistic: null,
        rectangle: '',
        circle: '',
        polygon: '',
        geometry: {},
        identifyIsShow:false,
        drawIsShow: false,
        XZQHIsShow: false,
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
        }
      }
    },
    components: {ImportCadShp},
    created() {
      let config;
      if (g_MapConfig.baseConfig.webgisSpatialExtent) {
        config = g_MapConfig.baseConfig.webgisSpatialExtent;
        // console.log(config,'配置的空间范围');
        if(config == undefined || config.length <=0){
          console.log('地图基本配置里面设置的空间范围没有设置，或者格式有问题')
          return;
        }
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
        console.log("缺少街镇与区县的服务地址配置：地图基本配置里面空间范围设置为空！")
      }
    },

    mounted() {
      this.identifyTask = new SgMap.Identify();
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
        this.Statistic.event.on({
          'loadedCompleted':(res)=>{
            this.Statistic.getCounty(this.countyUrl, this.fieldToGetCountyRegion);
            this.Statistic.getTown(this.townUrl, this.fieldToGetTownRegion);
          }
        });
        this.Statistic.event.on({
          'getCountyComplete': (res) => {
            console.log(res,'查询区县服务返回结果');
            if (this.countyOptions != []) {
              let fields = res.features;
              if(fields != null && fields.length >0) {
                this.countyFeatures = fields;
                this.arrayMethod(fields, this.fieldToGetCountyRegion, "countyOptions")
              }
            }else
              console.log('查询区县服务没有返回结果')
          }
        });
        this.Statistic.event.on({
          'getTownComplete': (res) => {
            console.log(res,'查询乡镇服务返回结果');
            if (this.townOptions != []) {
              let fields = res.features;
              if(fields != null && fields.length >0) {
                this.townFeatures = fields;
                this.arrayMethod(fields, this.fieldToGetTownRegion, "townOptions")
              }
            }else
              console.log('查询乡镇服务没有返回结果')
          }
        })
      }

      this.polygon = new Draw(this.drawId + '_polygon', 'polygon')
      this.polygon.event.on({
        'drawComplete': (res) => {
          this.geometry = res.geometry;
          this.$emit('draw-geometry', res);
        }
      })
      this.rectangle = new Draw(this.drawId + '_rectangle', 'rectangle')
      this.rectangle.event.on({
        'drawComplete': (res) => {
          this.geometry = res.geometry;
          this.$emit('draw-geometry', res);
        }
      })
      this.circle = new Draw(this.drawId + '_circle', 'circle')
      this.circle.event.on({
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

      this.formItem.radio_region = this.type[0];
    },
    methods: {
      identifyStart(){
        this.identifyTask.singleActive()
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
          let svalue = fieldToGetRegion[1];
          let slabel = fieldToGetRegion[0];
          if (tempArray.indexOf(fields[i].attributes[slabel]) < 0) {
            tempArray.push(fields[i].attributes[slabel]);
            result.push({
              value: fields[i].attributes[svalue],
              label: fields[i].attributes[slabel]
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
      }
      // countyLocation() {
      //     this.$emit('county-location', this.formItem.county_select);
      // },
      // townLocation() {
      //     this.$emit('town-location', this.formItem.town_select);
      // }
    },
  }
</script>

<style scoped lang="scss">

.sg-form-item{
  margin-bottom: 2px !important;
}
  .sg-select{
    width: 90% !important;
  }

.sg-form .sg-form-item-label{
  margin-right: 10px !important;
}
</style>
