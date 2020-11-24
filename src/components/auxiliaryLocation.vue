<template>
  <div :style="{'max-height': maxHeight+'px'}">
    <div class="auxiliaryLocation iq-content">
      <sg-form :model="formItem" :label-width="60" @submit.native.prevent>

        <div class="iq-wrap">
          <sg-form-item label="项目名称">
            <sg-input placeholder="" v-model="formItem.projectName"></sg-input>
          </sg-form-item>
          <sg-form-item label="项目编号">
            <sg-input placeholder="" v-model="formItem.projectID"></sg-input>
          </sg-form-item>
          <sg-form-item label="项目性质">
            <sg-select v-model="formItem.bigClass" @on-change="getMiddleClass">
              <sg-option v-for="field in bigClassOptions" :value="field.value">{{field.label}}</sg-option>
            </sg-select>
          </sg-form-item>
          <sg-form-item label="用地性质">
            <sg-select multiple="" multiple-ipt="" v-model="formItem.middleClass" @on-change="getSmallClass" :disabled="middleDisable">
              <sg-option v-for="field in middleClassOptions" :value="field.value">{{field.label}}</sg-option>
            </sg-select>
          </sg-form-item>
          <sg-form-item label="项目小类">
            <sg-select multiple="" multiple-ipt="" v-model="formItem.smallClass" @on-change="copySmallClass" :disabled="smallDisable">
              <sg-option v-for="field in smallClassOptions" :value="field.value">{{field.label}}</sg-option>
            </sg-select>
          </sg-form-item>
        </div>
        <div class="iq-wrap">
          <sg-form-item label="用地面积">
            <sg-radio-group v-model="formItem.radio_area">
              <sg-radio label="areaValue">面积值</sg-radio>
              <sg-radio label="areaInterval">面积区间</sg-radio>
            </sg-radio-group>
          </sg-form-item>
          <div class="areaValueBlock flex">
            <div label="" v-show="formItem.radio_area == 'areaValue'" class="flex" style="margin-left: 58px;">
              <sg-input v-model="formItem.area" placeholder="" style="width: 80px"></sg-input>
              <span style="margin: 10px 2px;">(㎡)</span>
              <sg-select style="width: 75px" v-model="formItem.torlerance">
                <sg-option v-for="field in torleranceOptions" :value="field.value">{{field.value}}</sg-option>
              </sg-select>
            </div>
          </div>
          <div class="areaIntervalBlock flex">
            <div label="" v-show="formItem.radio_area == 'areaInterval'" class="flex" style="margin-left: 58px;">
              <sg-input v-model="formItem.startValue" placeholder="" style="width: 80px"></sg-input>
              <span style="margin: 10px 2px;">(㎡)至</span>
              <sg-input v-model="formItem.endValue" placeholder="" style="width: 80px"></sg-input>
              <span style="margin:10px 2px;">(㎡)</span>
            </div>
          </div>
        </div>
        <s-range :type="rangeType"
                 :drawId="drawId"
                 ref="range"
                 @get-range-type="getRangeType"
                 @import-cadShp="importCadShp"
                 @get-regionLevel="getRegionLevel"
                 @county-location="countyLocation"
                 @town-location="townLocation"
                 @draw-geometry="drawGeometry"
                 @clear-all="clear"
        ></s-range>
        <div class="iq-button">
          <sg-button type="primary" @click="startAnalysis()">开始分析</sg-button>
          <sg-button @click="clearConditions()">清除</sg-button>
        </div>
      </sg-form>
    </div>
    <s-respane v-show="resultPanelIsShow" name="选址结果" @pane-close="closePane" :x="550" :w="800">
      <sg-table :show-page="false" :columns="resultColumns" :data="showResult" @on-row-click="location" height="376"></sg-table>

      <sg-page :total="resultData.length"
               show-total=""
               show-elevator=""
               :page-size="7"
               size="small"
               @on-change="changePage"
               class="result_page"
               slot="bottom" style="margin-top: 10px;margin-left: 10px"></sg-page>
    </s-respane>
    <s-respane v-show="featureInfoVisible" name="地块信息" @pane-close="closeFeatureInfoPane" :w="550" :h="400" :x="1175"
               :y="208">
      <sg-tab type="card" :animated="false">
        <sg-tab-pane label="控制线信息">
          <sg-table :show-page="false" :columns="HZColumns" :data="HZData"></sg-table>
        </sg-tab-pane>
        <sg-tab-pane label="差异信息">
          <sg-table :show-page="false" :columns="CYColumns" :data="CYData"></sg-table>
        </sg-tab-pane>
        <sg-tab-pane label="周边信息">
          <sg-table :show-page="false" :columns="ZBColumns" :data="ZBData"></sg-table>
        </sg-tab-pane>
        <sg-tab-pane label="审批信息">
          <sg-table :show-page="false" :columns="SPColumns" :data="SPData"></sg-table>
        </sg-tab-pane>
      </sg-tab>
      <sg-button @click.stop="exportBtn" style="margin-top: 5px">导出报告</sg-button>
    </s-respane>
  </div>
</template>

<script>
  import {ExportReport} from '../config/api.js'

  import SRespane from '@/components/common/resultPanel'
  import SRange from '@/components/common/range'
  import bus from '../assets/eventBus';
  import data from '../config/YDXZData.json'

  export default {

    name: "auxiliaryLocation",
    data() {
      return {
        maxHeight:0,
        middleDisable:true,
        smallDisable:true,
        auxiliaryLocation: {},
        PIC_MAPURL: "",
        resultPanel: [{
          label: '总体结果',
          value: 'HZDATA',
          columns: [{
            title: '序号',
            key: 'XH'
          }, {
            title: '控制线名称',
            key: 'KZXMC'
          }, {
            title: '图斑个数',
            key: 'TBGS'
          }, {
            title: '占用面积(㎡)',
            key: 'ZYMJ'
          }],
          attributes: [],
        }, {
          label: '产业区块控制线',
          value: 'CYQK',
          columns: [{
            title: '序号',
            key: 'ID'
          }, {
            title: '控制线名称',
            key: 'KZXMC'
          }, {
            title: '控制线代码',
            key: 'KZXDM'
          }, {
            title: '占用面积(㎡)',
            key: 'ZYMJ'
          }],
          attributes: [],
        }, {
          label: '基本农田控制线',
          value: 'JBNT',
          columns: [{
            title: '序号',
            key: 'ID'
          }, {
            title: '控制线名称',
            key: 'KZXMC'
          }, {
            title: '控制线代码',
            key: 'KZXDM'
          }, {
            title: '占用面积(㎡)',
            key: 'ZYMJ'
          }],
          attributes: [],
        }, {
          label: '城镇开发边界控制线',
          value: 'CZKFBJ',
          columns: [{
            title: '序号',
            key: 'ID'
          }, {
            title: '控制线名称',
            key: 'KZXMC'
          }, {
            title: '控制线代码',
            key: 'KZXDM'
          }, {
            title: '占用面积(㎡)',
            key: 'ZYMJ'
          },],
          attributes: [],
        }, {
          label: '生态控制线',
          value: 'STKZ',
          columns: [{
            title: '序号',
            key: 'ID'
          }, {
            title: '控制线名称',
            key: 'KZXMC'
          }, {
            title: '控制线代码',
            key: 'KZXDM'
          }, {
            title: '占用面积(㎡)',
            key: 'ZYMJ'
          }],
          attributes: [],
        }],
        clickedRowData: "",
        featureInfo: '',
        featureInfoVisible: false,
        // YDXZDMFieldName: 'GHYDXZDM', //多规的配置字段
        YDXZDMFieldName: 'YDXZDM', // 河源配置的字段
        drawId: 'auxiliaryLocation',
        rangeType: ["XZQH", "draw", "import"],
        data: [],//项目性质与用地性质关系（大类与中类对应关系表）
        bigClassOptions: [],
        MJField: 'MJ',
        MJFieldType: '',
        splitResult: [],
        pages: 0,
        showResult: [],
        locGeo: '',
        queryResult: [],
        url: "",//配置1
        resultData: [],
        SPData: [],
        ZBData: [],
        CYData: [],
        HZData: [],
        SPColumns: [{
          title: '项目名称',
          key: 'XMMC'
        }, {
          title: '用地单位',
          key: 'YDDW'
        }, {
          title: '用地证编号',
          key: 'YDZBH'
        }, {
          title: '发证时间',
          key: 'FZSJ'
        }],
        ZBColumns: [{
          title: '规划用地代码',
          key: 'GHYDDM'
        }, {
          title: '规划用地名称',
          key: 'GHYDMC'
        }, {
          title: '地块面积',
          key: 'DKMJ'
        }],
        CYColumns: [{
          title: '关联名称',
          key: 'GLMC'
        }, {
          title: '占用面积',
          key: 'ZYMJ'
        }],
        HZColumns: [{
          title: '序号',
          key: 'XH'
        }, {
          title: '控制线名称',
          key: 'KZXMC'
        },
          {
            title: '图斑个数',
            key: 'TBGS'
          },
          {
            title: '占用面积',
            key: 'ZYMJ'
          }],
        resultColumns:[
          {
            title: '标识码',
            key: 'BSM',
          },
          {
            title: '用地代码',
            key: 'GHYDXZDM'
          },
          {
            title: '地块面积',
            key: 'MJ'
          },
          {
            title: '用地性质',
            key: 'GHYDXZMC'
          }],
        resultColumnsActions:
          {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 350,
            render: (h, params) => {
              return h('div', [
                h('sg-button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style:{
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      console.log(params);
                      this.clickedRowData = params.row
                      console.log(params.row.BSM);
                      this.getLandInfo(params.row.BSM)
                    }
                  }
                }, '查看地块信息'),
                h('sg-button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style:{
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      console.log(params);
                      this.clickedRowData = params.row
                      console.log(params.row.BSM);
                      this.executeExportCadShp(params.row.BSM,'shp')
                    }
                  }
                }, '导出shp'),
                h('sg-button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      console.log(params);
                      this.clickedRowData = params.row
                      console.log(params.row.BSM);
                      this.executeExportCadShp(params.row.BSM,'cad')
                    }
                  }
                }, '导出cad')
              ]);
            }
          }
        ,
        countData: [],
        resultPanelIsShow: false,
        smallClassCopy: [],
        middleClassCopy: [],
        formItem: {
          regionLevel: 'city',
          rangeType: 'XZQH',
          county_select: '',
          town_select: '',
          smallClass: [],
          bigClass: '',
          middleClass: [],
          torlerance: "±10%",
          area: 10000,
          startValue: 10000,
          endValue: 120000,
          projectName: '',
          projectID: '',
          radio_area: 'areaInterval',
          layer_Select: '',
          radio_region: 'XZQH',
          type_select: 'count',
          checkbox: [],
          switch: true,
          date: '',
          time: '',
          bufferDistance: 1000,

        },
        panelVisible: false,
        exportGraphic:{},
        middleClassOptions: [],
        smallClassOptions: [],
        field: "",
        geometry: '',
        polygon: {},
        rectangle: {},
        circle: {},
        fieldInfos: [],
        torleranceOptions: [{
          value: "0",
        }, {
          value: "±10%"
        },
          {
            value: "±20%"
          }, {
            value: "±30%"
          },
          {
            value: "±40%"
          }, {
            value: "±50%"
          },
          {
            value: "±60%"
          }, {
            value: "±70%"
          },
          {
            value: "±80%"
          },
          {
            value: "±90%"
          }, {
            value: "±100%"
          },
        ],
      }
    },
    components: {SRespane, SRange},
    mounted() {
      if(!g_MapConfig.panelConfig.auxiliaryLocation){
        // this.$msg.error("缺少辅助选址功能相关数据的配置。功能标识：auxiliaryLocation")
        console.log("缺少辅助选址功能相关数据的配置。功能标识：auxiliaryLocation")
        return;
      }
      this.maxHeight = document.documentElement.clientHeight-305;
      let config = g_MapConfig.panelConfig.auxiliaryLocation;
      this.url = config.selectUrl;
      this.SPColumns = config.SPColumns;
      this.ZBColumns = config.ZBColumns;
      this.CYColumns = config.CYColumns;
      this.HZColumns = config.HZColumns;
      this.resultColumns = config.resultColumns;
      this.resultColumns.push(this.resultColumnsActions);
      this.Highlight = new SgMap.Highlight()
      this.Statistic = new SgMap.InfoStatistic();

      this.auxiliaryLocation = new SgMap.AuxiliaryLocation();
      this.auxiliaryLocation.event.on({
        'printTask': (res) => {
          this.PIC_MAPURL = res;
          if (this.PIC_MAPURL !== "") {
            this.exportReport();
          }
        }
      })
      this.auxiliaryLocation.event.on({
        'queryComplete': function (res) {

          if(res.hasOwnProperty("message")){
            bus.$emit('setLoad', {
              statue: false,
              msg: '加载中...'
            });
            this.$msg.error("查询出现错误："+res.message);
            console.log(res,'辅助选址查询出错');
            return;
          }
          let fieldAlias = res.fields;
          this.fieldInfos.length = [];
          for(let i = 0; i < fieldAlias.length; i++){
            this.fieldInfos.push({
              fieldName:fieldAlias[i].name,
              label:fieldAlias[i].alias
            })
          }
          this.queryResult = res.features;
          this.resultData = [];
          for (let i = 0; i < this.queryResult.length; i++) {
            if(this.queryResult[i].attributes.hasOwnProperty("MJ")){
              this.queryResult[i].attributes.MJ = this.queryResult[i].attributes.MJ.toFixed(2)
            }
            this.resultData.push(this.queryResult[i].attributes);
            let result = [];
            for (let i = 0, len = this.resultData.length; i < len; i += 7) {
              result.push(this.resultData.slice(i, i + 7));
              // this.geometry.push(arr.slice(i,i+7))
            }
            // console.log(this.serachResult);
            // console.log(result)
            this.splitResult = result;
            this.showResult = this.splitResult[0]
          }
          bus.$emit('setLoad', {
            statue: false,
            msg: '加载中...'
          });
          this.resultPanelIsShow = true;
          this.auxiliaryLocation.locationAll(this.queryResult);
          // this.geometry = res;
        }.bind(this)
      })
      this.data = data;
      for (let i = 0; i < data.length; i++) {
        this.bigClassOptions.push({
          value: data[i].code,
          label: data[i].name
        })
      }
    },
    methods: {
      constructData(thColumns, tbData, title) {
        let TB_DATA = {
          "datas": [{"rowData": []}],
          "headers": {
            "rowData": [],
            "mergeCellBool": true,
            "startCell": 0,
            "endCell": thColumns.length - 1
          }
        }
        TB_DATA.headers.rowData.push({"text": title})
        for (let k = 0; k < thColumns.length - 1; k++) {
          TB_DATA.headers.rowData.push({
            "text": ""
          })
        }
        ;

        for (let k = 0; k < thColumns.length; k++) {
          TB_DATA.datas[0].rowData.push({
            "text": thColumns[k].title
          })
        }
        ;
        for (let i = 0; i < tbData.length; i++) {
          let rowData = []

          for (let k = 0; k < thColumns.length; k++) {
            for (let m in tbData[i]) {
              if (m == thColumns[k].key) {
                rowData.push({
                  "text": tbData[i][m]
                })
              }
            }
            ;
          }
          TB_DATA.datas.push({
            "rowData": rowData
          })
        }
        console.log(TB_DATA)
        return TB_DATA
      },
      exportBtn() {
        bus.$emit('setLoad', {
          statue: true,
          msg: '正在导出...'
        });
        if(!g_MapConfig.baseConfig.webgisPrint){

          bus.$emit('setLoad', {
            statue: false,
            msg: '正在导出...'
          });
          this.$msg.error("请在地图基本设置中配置arcgis server打印服务的地址:webgisPrint")
          return;
        }else{
          this.auxiliaryLocation.print(g_MapConfig.baseConfig.webgisPrint);
        }

      },
      exportReport() {
        let TB_ZBDKXX = this.constructData(this.ZBColumns, this.ZBData, "周边信息")
        let TB_SPXX = this.constructData(this.HZColumns, this.HZData, "控制线信息")
        let TB_KZXJCJG = this.constructData(this.CYColumns, this.CYData, "差异信息")
        const tab = [TB_ZBDKXX, TB_SPXX, TB_KZXJCJG];
        let tablist = [];
        for (let i = 0; i < tab.length; i++) {
          if (tab[i].datas.length > 1) {
            tablist.push(tab[i])
          }
        }
        let data = {
          "templatePath": "FZXZPGReport.docx",
          "exportDataMap": {
            "DKBH": this.clickedRowData.BSM,
            "DKMJ": this.clickedRowData.DKMJ,
            "XMBH": this.formItem.projectID,
            "XMMC": this.formItem.projectName,
            "YDLX": this.clickedRowData.GHYDXZMC,
            "YDMJ": "48,715.4",
            "PICLIST": [
              {
                "data": [],
                "height": 320,
                "path": this.PIC_MAPURL,
                "width": 440
              }
            ],
            "SPZT": "",
            "TBLIST": tablist
          }
        }

        data = JSON.stringify(data)
        let formData = new FormData()
        formData.append('jsonData', data)
        let config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: "arraybuffer"
        }
        let _this = this;
        _this.$http.post(ExportReport, formData, config).then(function (res) {
          bus.$emit('setLoad', {
            statue: false,
            msg: '加载中...'
          });
          let url = window.URL.createObjectURL(new Blob([res.data], {
            type: 'application/word'
          }));  // new Blob([data])用来创建URL的file对象或者blob对象
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.download = _this.formatDate(new Date(),'') + _this.formItem.projectName+ '.docx'; // 动态文件名
          console.log(link.download)

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }).catch((error) => {
          bus.$emit('setLoad', {
            statue: false,
            msg: '加载中...'
          });
          console.log(error)
        })

      },

      importCadShp(graphic){
        if(graphic != '' && graphic != undefined && graphic.geometry != null && graphic.geometry != undefined){
          this.geometry = graphic.geometry;
        }
        // if(graphic.geometry.features.length>1){
        //   this.$msg.error({
        //     content: "不支持多个图形！",
        //     duration: 10,
        //     closable: true
        //   });
        // }else{
        //   this.geometry = geo;
        // }
      },

      //导出cad/shp按钮事件
      executeExportCadShp(BSM,type){
        this.findGeo(BSM);
        let formData = new FormData()
        let a = JSON.stringify(this.exportGraphic)
        formData.append('CoordJsonStr', a)
        if(type==='shp'){
          formData.append('FileType', 1)
        }else if(type==='dwg'){
          formData.append('FileType', 0)
        }
        //提交表单
        this.formSubmit(g_MapConfig.panelConfig.auxiliaryLocation.ExportShpCad_URL,formData);
      },
      //查找当前点击的图形
      findGeo(BSM){
        for (let i = 0; i < this.queryResult.length; i++) {
          if (BSM == this.queryResult[i].attributes.BSM) {
            this.exportGraphic = this.queryResult[i];
            this.locGeo = this.exportGraphic.geometry;
            break
          }
        }
      },
      formatDate(now, symbol){
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        month = month<10?'0'+month : month
        var date = now.getDate();
        date = date<10?'0'+date : date
        var hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
        var minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
        var second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
        if (!symbol) {
          return year +""+ month + ""+date + ""+hour  + ""+minute + "" + second ;
        }else{
          return year + symbol + month + symbol + date + ' ' + hour + ':' + minute + ':' + second;
        }
      },
      formSubmit(url, formData){
        let config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: "arraybuffer"
        }
        let _this = this;
        _this.$http.post(g_MapConfig.panelConfig.auxiliaryLocation.ExportShpCad_URL, formData, config).then(function (res) {
          let url = window.URL.createObjectURL(new Blob([res.data], {
            type: 'application/zip'
          }));  // new Blob([data])用来创建URL的file对象或者blob对象
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.download = _this.formatDate(new Date(),'') + _this.formItem.projectName+'.zip'; // 动态文件名
          console.log(link.download)

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
      },
      getLandInfo(BSM) {
        bus.$emit('setLoad', {
          statue: true,
          msg: '查询中...'
        });
        this.findGeo(BSM);
        console.log(this.locGeo)
        let geo = {
          geometry: {
            rings: this.locGeo.rings
          },
        }
        let param = {
          coordinateInfo: JSON.stringify(geo),
        }
        let resultPanel = this.resultPanel;
        this.$post(g_MapConfig.panelConfig.auxiliaryLocation.GetFeatureInfo_URL, param).then((res) => {
          this.featureInfo = JSON.parse(res);
          console.log(this.featureInfo)
          if (this.featureInfo.code == "1") {

            this.HZData = this.featureInfo.data.KZINFO.HZDATA;
            this.SPData = this.featureInfo.data.SPINFO;
            this.ZBData = this.featureInfo.data.ZBINFO;
            this.CYData = this.featureInfo.data.CYINFO;
            let KZData = this.featureInfo.data.KZINFO;
            for (let m = 0; m < KZData.HZDATA.length; m++) {
              for (let i = 0; i < resultPanel.length; i++) {
                if (resultPanel[i].label == KZData.HZDATA[m].KZXMC) {
                  for (let k = 0; k < KZData.HZDATA[m].DETAILINFO.length; k++) {
                    let attribute = KZData.HZDATA[m].DETAILINFO[k].attribute;
                    attribute.geometry = KZData.HZDATA[m].DETAILINFO[k].geometry;
                    resultPanel[i].attributes.push(attribute);
                  }
                }
                if (resultPanel[i].value == "HZDATA") {
                  resultPanel[i].attributes = KZData.HZDATA
                }
              }
            }
            bus.$emit('setLoad', {
              statue: false,
              msg: '加载中...'
            });
            this.featureInfoVisible = true;
          } else if (this.featureInfo.code == "-1") {
            bus.$emit('setLoad', {
              statue: false,
              msg: '加载中...'
            });
            this.$msg.error({
              content: this.featureInfo.excption,
              duration: 10,
              closable: true
            });

          }
        }).catch(error => console.log(error))

      },
      getRegionLevel(value) {
        this.formItem.regionLevel = value
        if (this.formItem.regionLevel === 'city' && this.formItem.rangeType == 'XZQH') {
          this.geometry = ''
        }
      },
      getRangeType(value) {
        this.formItem.rangeType == value
        if (this.formItem.regionLevel === 'city' && this.formItem.rangeType == 'XZQH') {
          this.geometry = ''
        }
      },
      drawGeometry(gra) {
        this.geometry = gra
      },
      countyLocation(geo) {
        this.geometry = geo
      },
      townLocation(geo) {
        this.geometry = geo
      },
      copySmallClass(res) {
        this.smallClassCopy = this.formItem.smallClass;
      },
      getSmallClass(res) {

        this.middleClassCopy = this.formItem.middleClass;
        this.smallClassCopy = this.formItem.smallClass;
        this.smallClassOptions = [];
        for (let i = 0; i < this.data.length; i++) {

          for (let k = 0; k < this.formItem.middleClass.length; k++) {
            for (let m = 0; m < this.data[i].children.length; m++) {
              if (this.formItem.middleClass[k] === this.data[i].children[m].code) {
                if (this.data[i].children[m].children != undefined) {
                  for (let n = 0; n < this.data[i].children[m].children.length; n++) {
                    let singleData = {
                      value: this.data[i].children[m].children[n].code,
                      label: this.data[i].children[m].children[n].name
                    }
                    if (this.smallClassCopy.indexOf(singleData.value) < 0) {
                      this.smallClassOptions.push(singleData)
                    }
                  }
                }
              }
            }


          }


        }

        this.formItem.smallClass = this.smallClassCopy;
        for (let r = 0; r < this.smallClassCopy.length; r++) {
          for (let i = 0; i < this.data.length; i++) {
            for (let m = 0; m < this.data[i].children.length; m++) {
              if (this.data[i].children[m].children != undefined) {
                for (let n = 0; n < this.data[i].children[m].children.length; n++) {

                  if (this.smallClassCopy[r] == this.data[i].children[m].children[n].code) {
                    this.smallClassOptions.push({
                      value: this.data[i].children[m].children[n].code,
                      label: this.data[i].children[m].children[n].name
                    })
                  }
                }
              }

            }
          }
        }
        this.smallDisable = false;
      },
      getMiddleClass() {
        this.middleClassCopy = this.formItem.middleClass;
        console.log(this.middleClassCopy)
        this.middleClassOptions = [];

        for (let i = 0; i < this.data.length; i++) {
          if (this.formItem.bigClass === this.data[i].code) {
            for (let m = 0; m < this.data[i].children.length; m++) {
              let singleData = {
                value: this.data[i].children[m].code,
                label: this.data[i].children[m].name
              }
              if (this.middleClassCopy.indexOf(singleData.value) < 0) {
                this.middleClassOptions.push(singleData)
              }
            }
          }
        }

        this.formItem.middleClass = this.middleClassCopy;
        for (let r = 0; r < this.middleClassCopy.length; r++) {
          for (let q = 0; q < this.data.length; q++) {
            for (let n = 0; n < this.data[q].children.length; n++) {
              if (this.middleClassCopy[r] == this.data[q].children[n].code) {
                this.middleClassOptions.push({
                  value: this.data[q].children[n].code,
                  label: this.data[q].children[n].name
                })
              }
            }
          }

        }
        this.middleDisable = false;


      },
      location(index) {
        let feature;
        for (let i = 0; i < this.queryResult.length; i++) {
          if (index.BSM == this.queryResult[i].attributes.BSM) {
            feature = this.queryResult[i];
            this.locGeo = this.queryResult[i].geometry;
            break
          }
        }
        let graphic = this.Highlight.geometryHighlight(this.locGeo);
        graphic.attributes = feature.attributes;
        graphic.popupTemplate = {
          title: "属性表",
          content: [{
            type: "fields",
            fieldInfos: this.fieldInfos
          }],
        }
        // this.auxiliaryLocation.locationSingle(this.locGeo);
      },
      //字符串拼接('水域','商业用地')
      //select * from sde_kzgh9 t where YDMJ>=1000 and YDMJ<=1100 and YDXZ IN ('水域','商业用地')
      arrToStr(arr) {
        let str = ''
        for (let i = 0; i < arr.length; i++) {
          str += "\'" + arr[i] + "\',"
        }
        str = str.substr(0, str.length - 1);
        return str

      },
      startAnalysis() {
        if(this.formItem.radio_area == "areaInterval" && (this.formItem.startValue == "" || this.formItem.endValue == "")){
          this.$msg.warning("面积区间不得为空！")
        }else if( this.formItem.radio_area == 'areaValue' && this.formItem.area == ""){
          this.$msg.warning("面积值不得为空！")
        }else{
          bus.$emit('setLoad', {
            statue: true,
            msg: '分析中...'
          });
          let queryStr

          this.showResult = [];
          this.resultData = [];
          let whereSql = "1=1", option

          //多规的硬编码，固定字段
          // if (this.formItem.radio_area == 'areaInterval' && this.formItem.startValue != '' && this.formItem.endValue != '') {
          //   whereSql = this.MJField + '>=' + this.formItem.startValue + ' and ' + this.MJField + '<=' + this.formItem.endValue
          // } else if (this.formItem.radio_area == 'areaValue' && this.formItem.area != '' && this.formItem.torlerance != '') {
          //   let str = this.formItem.torlerance.replace("±", '');
          //   let num = parseFloat(str)
          //   whereSql = this.MJField + '>=' + this.formItem.area * (100 - num) / 100 + ' and ' + this.MJField + '<=' + this.formItem.area * (100 + num) / 100
          // }
          if (this.formItem.smallClass.length > 0) {
            queryStr = this.arrToStr(this.formItem.smallClass);
            whereSql = whereSql + ' and ' + this.YDXZDMFieldName + ' IN (' + queryStr + ')'
          } else if (this.formItem.middleClass.length > 0) {
            queryStr = this.arrToStr(this.formItem.middleClass);
            whereSql = whereSql + ' and ' + this.YDXZDMFieldName + ' IN (' + queryStr + ')'
          } else if (this.formItem.bigClass.length > 0) {
            queryStr = this.arrToStr([this.formItem.bigClass]);
            whereSql = whereSql + ' and ' + this.YDXZDMFieldName + ' IN (' + queryStr + ')'
          }

          // if(this.regionLevel === 'city' && this.rangeType == 'XZQH' ){
          //   this.geometry = ''
          // }

          option = {
            geometry: this.geometry
          }

          this.auxiliaryLocation.query(this.url, whereSql, option);
        }



      },
      //区域选择切换的清空图层事件
      clear() {
        this.geometry = "";
        this.auxiliaryLocation.clearGraphics();
        this.$refs.range.clearDrawGraphics();
      },
      //清除按钮，清除所有条件
      clearConditions() {
        this.formItem.projectName = "";
        this.formItem.projectID = "";
        this.formItem.bigClass = [];
        this.formItem.middleClass = [];
        this.formItem.smallClass = [];
      },
      changePage(index) {
        console.log(index)
        this.pages = index - 1;
        //  this.splitResult
        this.showResult = this.splitResult[index - 1];
        //  this.serachResult;
        //  this.showResult

      },
      closePane(val) {
        this.resultPanelIsShow = val;

      },
      closeFeatureInfoPane() {
        this.featureInfoVisible = false;
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

  .iq-content {
    .iq-wrap {
      .sg-form-item {
        margin-bottom: 10px;
      }
    }
  }
</style>
