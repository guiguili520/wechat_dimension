<template>
  <div style="margin-left: 20px" class="my_print">
    <div>
      <p style="height:14px;font-size:14px;line-height:14px;">选择模板<span style="color: red;">（必选）</span></p>
      <div style="width:270px;height:32px;margin-bottom:12px;">
        <sg-select name="setting" style="width:270px;height:32px;line-height:32px;" @on-change="selectTemplate">
          <sg-option v-for="(i,index) in option" :value="JSON.stringify(option[index])" :key="index">
            {{i.templateName}}
          </sg-option>
        </sg-select>

      </div>
      <p style="height:14px;font-size:14px;line-height:14px;" v-if="isYear">请选择年份</p>
      <div style="width:270px;height:32px;margin-bottom:12px;" v-if="isYear">
        <sg-select name="year" id="select_year" v-model="select_year">
          <sg-option v-for="(item,index) in year" :key="index" :value="item.value">{{item.value}}</sg-option>
        </sg-select>
      </div>
      <div v-show="!(nowSelect==null || nowSelect.isOverLayer==0)">
      <p style="height:14px;font-size:14px;line-height:14px;" v-if="produceUser_data.length!=0">项目信息</p>
      <div style="width:270px;height:80px;margin-bottom:12px;" v-if="produceUser_data.length!=0">
        <div style="width:100%;float:left;height:32px;">
          <sg-select name="year" id="produceUser_data" v-model="produceUser" @on-change="changeProduceUser">
            <sg-option v-for="(item,index) in produceUser_data" :key="index" :value="item.value">{{item.value}}
            </sg-option>
          </sg-select>
        </div>
        <div style="width:100%;height:32px;float:left;">
          <sg-input placeholder="请输入信息" v-model="projectName"></sg-input>
        </div>
      </div>
      <p style="height:14px;font-size:14px;line-height:14px;" v-if="useType.length!=0">用途类型</p>
      <div style="width:270px;height:32px;margin-bottom:12px;" v-if="useType.length!=0">
        <sg-select name="useType" id="select_useType" v-model="select_useType">
          <sg-option v-for="(item,index) in useType" :key="index" :value="item.value">{{item.value}}</sg-option>
        </sg-select>
      </div>
      <p style="height:14px;font-size:14px;line-height:14px;" v-if="layerData.length!=0">图层名称</p>
      <div style="width:270px;height:32px;margin-bottom:12px;" v-if="layerData.length!=0">
        <sg-select name="select_layerName" id="select_layer" v-model="set_layer">
          <sg-option v-for="(item,index) in layerData" :key="index" :value="item.value">{{item.value}}</sg-option>
        </sg-select>
      </div>
      </div>
      <p style="height:14px;font-size:14px;line-height:14px;"
         v-if="(nowSelect!='' && nowSelect!=null) && nowSelect.isDraft==1">请选择日期</p>
      <div style="width:270px;height:32px;margin-bottom:12px;"
           v-if="(nowSelect!='' && nowSelect!=null) && nowSelect.isDraft==1">
        <sg-date-picker @on-change="getTime" v-model="selectDateValue"></sg-date-picker>
      </div>
      <p style="height:14px;font-size:14px;line-height:14px;" v-if="useType.length!=0">标题</p>
      <div style="width:270px;height:32px;margin-bottom:12px;" v-if="useType.length!=0">
        <sg-input v-model="set_title"/>
      </div>
      <p style="height:14px;font-size:14px;line-height:14px;" v-if="nowSelect!=null">比例尺</p>
      <div style="width:270px;height:32px;margin-bottom:12px;" v-if="nowSelect!=null">
        <div style="width:80px;float:left;height:32px;">
          <sg-select name="scale" id="select_scale" @on-change="select_scale_data" v-model="selectScaleValue" >
            <sg-option value="500">500</sg-option>
            <sg-option value="1000">1000</sg-option>
            <sg-option value="2000">2000</sg-option>
            <sg-option value="5000">5000</sg-option>
            <sg-option value="10000">10000</sg-option>
            <sg-option value="50000">50000</sg-option>
            <sg-option value="100000">100000</sg-option>
          </sg-select>
        </div>
        <div style="width:190px;height:32px;float:left;">
          <sg-input placeholder="请输入比例尺" v-model="select_scale">
            <sg-button slot="append" type="primary" style="padding:9px;" @click="setScale">确定</sg-button>
          </sg-input>
        </div>

      </div>
      <p style="height:14px;font-size:14px;line-height:14px;">文件格式</p>
      <div style="width:270px;height:32px;margin-bottom:12px;">
        <sg-select name="format" id="custom_format" v-model="costomFormat">
          <sg-option value="PDF">PDF</sg-option>

          <sg-option value="JPG">JPG</sg-option>

        </sg-select>
      </div>
      <div class="flex" style="vertical-align: center;">
      <div class="action-button esri-icon-polygon esri-widget-button" id="custom_polygon"
           title="多边形"></div>
      <div class="action-button esri-icon-checkbox-unchecked esri-widget--button" id="print_rectangle"
           title="矩形"></div>
<!--        <div class="action-button esri-icon-edit  esri-widget&#45;&#45;button" id="print_select" title="点选" @click="startIndentify"></div>-->
           </div>
<!--      <sg-button type="primary" id="goAs" @click="goAs" v-show="!(nowSelect==null || nowSelect.isOverLayer==0)"-->
<!--                 :disabled="nowSelect==null || nowSelect.isOverLayer==0 || nowGeo==null">开始分析-->
<!--      </sg-button>-->
<!--      <sg-button type="primary" id="openAs" @click="openAs"-->
<!--                 v-show="!(nowSelect==null || nowSelect.isOverLayer==0 || nowGeo==null) && resBtn">分析结果-->
<!--      </sg-button>-->
      <div class="flex" style="vertical-align: center;">
        <sg-button type="primary" id="goAs" @click="goAs" style="padding:7px;" v-show="!(nowSelect==null || nowSelect.isOverLayer==0)"
                   :disabled="nowSelect==null || nowSelect.isOverLayer==0 || nowGeo==null">开始分析
        </sg-button>
        <sg-button type="primary" id="openAs" @click="openAs" style="padding:7px;"
                   v-show="!(nowSelect==null || nowSelect.isOverLayer==0 || nowGeo==null) && resBtn">分析结果
        </sg-button>
      </div>
      <!-- <sg-radio-group v-model="isAnalyze" class="custom_radio">
          <sg-radio label="true">进行压占分析</sg-radio>
          <sg-radio label="false">不分析</sg-radio>
      </sg-radio-group> -->


    </div>
    <!-- <div class="flex" v-show="nowSelect.isOverLayer==0"> -->
    <div style="margin-top:20px;" class="flex">

      <sg-upload class="flex-item" ref="upload" multiple :action="importShpUrl"
                 accept=".shp,.dwg,.txt" :format="['shp','dwg','txt']" :on-success="uploadSuccess" :before-upload="beforeUpload">
        <sg-button  :disabled="nowSelect==null">导入cad/shp/txt</sg-button>
        <!--
                  <sg-upload class="flex-item" ref="upload" multiple :action="importShpUrl"
                        :before-upload="beforeUpload" :on-success="uploadSuccess">
                  <sg-button>导入cad/shp</sg-button> -->

      </sg-upload>
      <!-- <sg-button @click="upload" style="margin:0 20px 10px 20px;">上传</sg-button> -->
      <sg-button @click="clear" style="margin-right: 15px;margin-bottom: 10px;">清空</sg-button>
    </div>
    <!-- <ul style="color: #ff0000ed;">
      <li v-for="(item,index) in file" :key="index">{{item.name}}</li>
    </ul> -->
    <p @click="showSymbol(res)" style="line-height: 35px;color: #ff0000ed;">{{res.name}}</p>
    <div v-for="(item,index) in inputData" :key="index">
      <div v-if="item.fieldName!='项目名称'">
        <p style="height:14px;font-size:14px;line-height:14px;">{{item.fieldName}}</p>
        <div style="width:270px;margin-bottom:12px;">
          <sg-input v-if="item.fieldCode=='tjNo'" type="text" :id="item.fieldCode" :ref="item.fieldCode"
                    v-model="mapNum" readonly>
            <sg-button slot="append" @click="getNum">获取编号</sg-button>
          </sg-input>
          <sg-input v-else-if="item.fieldCode=='analyseText'" type="textarea" :id="item.fieldCode"
                    v-model="formData[item.fieldCode]" :ref="item.fieldCode"/>
          <sg-input v-else-if="item.fieldCode=='author'" type="text" :id="item.fieldCode" :ref="item.fieldCode"
                    v-model="realName"/>
          <sg-input v-else type="text" :id="item.fieldCode" :ref="item.fieldCode" v-model="formData[item.fieldCode]"/>

        </div>
      </div>
    </div>
    <sg-button @click="print" class="print" type="primary" style="width:270px;">打印</sg-button>

    <!-- <div class="expandDialog" style="position: absolute;top:0; left:-600px;width:500px;padding-bottom:20px;background:#fff;">
        <div class="header flex">
            <p class="flex-item" style="height:30px;line-height:30px;background:#3b86e0;padding:0 15px 0 10px;color:#fff;">压占结果</p>
        </div>
        <div class="dialog-wrap" style="padding:0 15px 0 10px;">

        </div>
    </div> -->
    <res-pane name="压占结果" :w="500" :x="-600" :y="0" @pane-close="close" v-if="showPane">
      <sg-table :columns="columns" :data="tableData" show-page :page-size="5"></sg-table>
    </res-pane>
  </div>
</template>

<script>

  import {getMapPMDetails, getExpFlaByName, getAllMapProduceMaps} from '../config/api.js'
  import bus from '@/assets/eventBus'
  import {loadModules} from "esri-loader";
  import {options} from "@/config";
  import {UrlSearch} from '../assets/method';
  import resPane from './resPane'
  import {setTimeout} from 'timers';
  import Draw from '../classic/common/Draw'

  export default {
    name: "printMap",
    data() {
      return {
        TFH:"",
        config:{},
        addedGeometry:{},
        selectScaleValue:"10000",
        selectDateValue:{},
        mapScale:"10000",
        center: {},
        cadFormat: ['DWG', 'dwg', 'dxf', 'DXF'],
        shpFormat: ['shp'],
        txtFormat:['TXT','txt'],
        // shpFormat:['dbf','prj','shp','shx','sbn','sbx'],
        // importShpUrl: "http://192.168.10.115:8080/rest/ImportShp.ashx",
        // importShpUrl:"http://192.168.10.115:8080/rest/ImportCad.ashx"
        importShpUrl: "http://192.168.10.115:8086/Rest/ImportShpSimple.ashx",

        analysisurl_shp: 'http://192.168.10.115:8086/Rest/ImportShpSimple.ashx',
        analysisurl_cad: 'http://192.168.10.115:8086/Rest/ImportCadSimple.ashx',
        analysisurl_txt:"http://192.168.10.115:8087/Rest/ImportTxt.ashx",
        analysisurl_overlayer: '',
        analysisurl_print: '',
        url: "/webgis/index.html?sel=4,6&positionFilePath=%%jobfiles%/201811/201811010004/&positionFiles=" +
        "563ad23d-db2d-44c7-9e51-21af1f7f8e17.dbf,b31a577e-159e-4abd-8a85-7e53d6200be7.prj," +
        "d1bd2e29-8222-4883-a8b9-3a39be59a7ce.sbn," +
        "86745d83-d43b-4d03-b163-99b4f4385943.sbx," +
        "e2b8f93b-20f9-40a3-a7dc-13a5a561ee80.shp," +
        "5efe2fe7-e3fb-4afe-b1f4-f9dccf1456c9.shx" +
        "&mode=2&jid=201811010004&configId=webgisadd&roleId=00000001-0000-0000-0010-000000000001",
        file: [],
        option: [{
          isOverLayer: null,
          overLayerName: null,
          templateDes: null,
          templateName: null,
          tjNoFormat: null,
          tjNoFormatName: null,
          uuid: null
        }],
        keyArr: [],
        nowSelect: null,
        inputData: [],
        tableData: [],
        polygon: null,
        columns: [],
        showPane: false,
        costomFormat: 'PDF',
        isAnalyze: "false",
        res: {
          data: null,
          name: ''
        },
        nowGeo: null,
        resBtn: false,
        mapNum: "",
        year: [],
        select_year: '',
        useType: [],
        select_useType: null,
        select_scale: null,
        set_title: '',
        set_layer: null,
        layerData: [],
        produceUser: '',
        produceUser_data: [],
        projectName: '',
        select_time: '',
        realName: '',
        isYear: 0,
        //生成字段form
        formData: {},
        isTxt:false,
        Hightlight:null,
      }
    },
    components: {resPane},

    mounted() {

      this.Hightlight = new SgMap.Highlight();
      if (!g_MapConfig.toolsConfig.customPrint || !g_MapConfig.toolsConfig.customPrint.OverLayer_URL) {
        console.log("缺少自定义打印功能相关数据配置。功能标识：customPrint")
        return;
      } else {
        this.analysisurl_overlayer = g_MapConfig.toolsConfig.customPrint.OverLayer_URL;
      }
      this.analysisurl_shp = g_MapConfig.baseConfig.webgisShp;
      this.analysisurl_print = g_MapConfig.baseConfig.webgisPrint;
      this.analysisurl_txt = g_MapConfig.baseConfig.webgisTxt;
      this.analysisurl_cad = g_MapConfig.baseConfig.webgisCad;

      let realName = "";
      if (window.parent.realName == null || window.parent.realName == undefined) {
        realName = window.parent.parent.realName == undefined ? '测试打印员1' : window.parent.parent.realName;
      } else {
        realName = window.parent.realName == undefined ? '测试打印员1' : window.parent.realName;
      }
      this.selectDateValue = new Date();
      this.select_time = this.selectDateValue.getFullYear() + "-" + (this.selectDateValue.getMonth() + 1) + "-" + this.selectDateValue.getDate();

      this.realName = realName;
      //获取选项
      this.$fetch(getAllMapProduceMaps).then(res => {
        this.option = res;
        console.log(this.option)
      })

      this.rectangle = new Draw('print_rectangle', 'rectangle');
      this.rectangle.event.on({
        'drawComplete': (res) => {
          this.addedGeometry = res.geometry
          this.center = res.geometry.extent.center
          console.log(this.center)
          console.log(this.nowGeo)
          if (this.nowGeo == null) {
            this.nowGeo = {
              rings: res.geometry.rings
            }
          } else {
            this.nowGeo.rings.push(res.geometry.rings[0])
          }
          console.log(this.nowGeo)
        }
      });
      this.polygon = new Draw('custom_polygon', 'polygon')
      this.polygon.event.on({
        'drawComplete': (res) => {
          this.addedGeometry = res.geometry;
          this.center = res.geometry.extent.center;
          console.log(this.center)
          console.log(this.nowGeo)
          if (this.nowGeo == null) {
            this.nowGeo = {
              rings: res.geometry.rings
            }
          } else {
            this.nowGeo.rings.push(res.geometry.rings[0])
          }
          console.log(this.nowGeo)
        }
      })
    },

    methods: {

      changeProduceUser(){
        this.projectName = this.produceUser
      },
      select_scale_data(val) {
        this.mapScale = val
        g_view.scale = val
      },
      setScale() {
        this.mapScale = this.select_scale
        g_view.scale = this.select_scale
      },
      getTime(val) {
        console.log(val)
        this.select_time = val
      },
      selectTemplate(value) {
        g_view.scale = 10000
        this.select_year = "";
        this.nowSelect = JSON.parse(value);
        console.log(this.nowSelect)
        this.set_title = this.nowSelect.title
        this.isYear = this.nowSelect.isYear
        this.year = []
        this.useType = []
        this.produceUser_data = []
        this.layerData = []
        if (this.nowSelect.drawingYears != '' || this.nowSelect.drawingYears != null) {
          let yearData = this.nowSelect.drawingYears.split(',')
          for (let i in yearData) {
            this.year.push({
              value: yearData[i]
            })
          }
        }
        if (this.nowSelect.produceUser != '' || this.nowSelect.produceUser != null) {
          let produceUserData = this.nowSelect.produceUser.split(',')
          for (let i in produceUserData) {
            this.produceUser_data.push({
              value: produceUserData[i]
            })
          }
        }

        if (this.nowSelect.useType != null && this.nowSelect.useType != "" && this.nowSelect.isOverLayer !=0) {
          let useTypeData = this.nowSelect.useType.split(',')
          for (let i in useTypeData) {
            this.useType.push({
              value: useTypeData[i]
            })
          }
          this.select_useType = this.useType[0].value;
        }else{
          this.select_useType = null;
        }

        if (this.nowSelect.layerNames != null && this.nowSelect.layerNames != "") {
          let layersData = this.nowSelect.layerNames.split(',')
          for (let i in layersData) {
            this.layerData.push({
              value: layersData[i]
            })
          }
        }

        this.inputData = [];

        this.$fetch(getMapPMDetails + '?pid=' + this.nowSelect.rid).then(res => {

          this.inputData = res;
          console.log(this.inputData)
          for (let i in res) {
            this.formData[res[i].fieldCode] = ''
          }
        })
        this.getNum();
      },

      openAs() {
        this.showPane = true
        this.resBtn = false
      },
      getNum() {
        // if (this.select_useType == '' || this.select_useType == null) {
        //   this.$SgMessage.warning('请先选择用途类型')
        //   return
        // }
        bus.$emit('setLoad', {
          statue: true,
          msg: '获取编号中...'
        });
        // console.log(this.nowSelect.tjNoFormatName)
        this.$fetch(getExpFlaByName, {
          name: this.select_useType
        }).then(rs => {

          console.log(rs)
          //设置图件编号 tjNo

          this.$refs.tjNo[0].$refs.input.value = rs[0].serialNumber
          this.mapNum = rs[0].serialNumber
          bus.$emit('setLoad', {
            statue: false,
            msg: '获取编号中...'
          });

        }).catch(err => {
          bus.$emit('setLoad', {
            statue: false,
            msg: '获取编号中...'
          });
        })
      },
      close() {
        this.showPane = false
        this.resBtn = true
      },
      print() {
        console.log(this.center)
        if(this.mapScale!=""){
          g_view.scale = this.mapScale
        }
        g_view.center = this.center
        //组装打印请求数据
        console.log(this.nowSelect)
        //组装title

        let printTitle = '';
        let _this = this
        if (this.nowSelect == null) {
          this.$SgMessage.error('请选择打印模板')
        }else if (this.costomFormat == '') {
          this.$SgMessage.error('请先选择文件格式')
        }
        else {
          if (this.$refs.tjNo!=undefined && this.$refs.tjNo[0]!=undefined && this.$refs.tjNo[0].$refs.input.value == '') {
             _this.getNum()
        }
          if (this.nowSelect.isDraft == 1) {
            printTitle = `${this.nowSelect.title}${this.set_layer}${this.select_year}局部`
          } else {
            printTitle = `${this.set_title}${this.set_layer}${this.select_year}局部`
          }
          console.log(printTitle)
          let printData = []
          for (let i in this.inputData) {
            let obj = {}
            obj[this.inputData[i].fieldCode] = this.formData[this.inputData[i].fieldCode]
            if (Object.keys(obj).length != 0) {
              printData.push(obj)
            }
          }
          for (let m in printData) {
            if (printData[m].tjNo == "") {
              printData[m].tjNo = this.mapNum
            }
            if (printData[m].author == "") {
              printData[m].author = this.realName
            }
            if (printData[m].projectName == "") {
              printData[m].projectName = this.projectName
            }
            if (printData[m].analyseText == "") {
              printData[m].analyseText = this.$refs['analyseText'][0].$refs.textarea.value
            }
          }
          let scaletext = g_view.scale.toString()
          printData = printData.concat([
            {produceUser: this.produceUser},
            {TJYT: this.select_useType},
            {titleText: printTitle},
            {scaletext:scaletext},
          ]);
          if (this.nowSelect.isDraft == 1) {
            printData.push({
              ctrq: this.select_time
            })
          }

          console.log(printData)
          loadModules(
            [
              "esri/widgets/Print",
              "esri/tasks/PrintTask",
              "esri/tasks/support/PrintParameters",
              "esri/tasks/support/PrintTemplate",
              "esri/tasks/QueryTask",
              "esri/tasks/support/Query"
            ],
            options
          ).then(([Print, PrintTask, PrintParameters, PrintTemplate,QueryTask,Query]) => {
            let configFlag = _this.config.TFHServicePath;
            let addedGeometryFlag = _this.addedGeometry.rings;
            if((configFlag != undefined && configFlag != '') &&  (addedGeometryFlag != undefined && addedGeometryFlag != '')){
                let layerUrl = _this.config.TFHServicePath;
                let queryTask = new QueryTask({
                  url: layerUrl
                });
                let query = new Query();
                query.geometry = _this.addedGeometry;
                query.geometryType = "esriGeometryPolygon";
                query.returnGeometry = false;
                query.outFields = _this.config.outPutField;
                let TFHArr = [];
                queryTask.execute(query).then((results) => {
                  if(!results.hasOwnProperty('code')) {
                    for (let item in results.features) {
                      let obj = results.features[item].attributes[_this.config.outPutField];
                      if (TFHArr.indexOf(obj) == -1) {
                        TFHArr.push(obj)
                      }
                    }
                    _this.TFH = TFHArr.join(",")
                    printData = printData.concat([{TFH: _this.TFH}])
                  };

                bus.$emit('setLoad', {
                  statue: true,
                  msg: '打印生成中...'
                });
              let printTask = new PrintTask({
                url: _this.analysisurl_print
              });
              console.log(printData)

              let template = new PrintTemplate({
                format: _this.costomFormat,
                exportOptions: {
                  dpi: 300
                },
                layout: this.nowSelect.templateName,
                layoutOptions: {
                  titleText: printTitle,
                  customTextElements: printData
                }
              });

              let params = new PrintParameters({
                view: g_view,
                template: template
              });
            printTask.execute(params).then(function (evt) {

              bus.$emit('setLoad', {
                statue: false,
                msg: '打印生成中...'
              });
              //打印完成
              window.open(`./pdf.html?${_this.costomFormat}&&${evt.url}&&${_this.mapNum}`)

            }, function (evt) {
              bus.$emit('setLoad', {
                statue: false,
                msg: '打印生成中...'
              });
              console.log(evt,'打印错误');
              alert(evt);
            });
          });
            }
            else {
              bus.$emit('setLoad', {
                statue: true,
                msg: '打印生成中...'
              });
              let printTask = new PrintTask({
                url: _this.analysisurl_print
              });
              console.log(printData)

              let template = new PrintTemplate({
                format: _this.costomFormat,
                exportOptions: {
                  dpi: 300
                },
                layout: this.nowSelect.templateName,
                layoutOptions: {
                  titleText: printTitle,
                  customTextElements: printData
                }
              });

              let params = new PrintParameters({
                view: g_view,
                template: template
              });

              printTask.execute(params).then(function (evt) {
                console.log(evt)
                bus.$emit('setLoad', {
                  statue: false,
                  msg: '打印生成中...'
                });
                window.open(`./pdf.html?${_this.costomFormat}&&${evt.url}&&${_this.mapNum}`)
              }, function (evt) {
                bus.$emit('setLoad', {
                  statue: false,
                  msg: '打印生成中...'
                });
                console.log(evt,'打印错误');
                alert(evt);
              });
            }
          })
        }
      },

      clear() {
        this.$emit("rangeOfCadShp", "")
        this.file = []
        this.res.data = null;
        this.res.name = ""
        this.resBtn = false
        g_highLightLayer.removeAll();
        g_drawLayer.removeAll();
        g_bufferLayer.removeAll();
        g_tempLayer.removeAll();
        //清空绘制
        this.nowGeo = null;
      },

      beforeUpload(file) {

        let arr = file.name.split(".")

        if (this.cadFormat.indexOf(arr[1]) >= 0) {//导入的是cad文件
          console.log('CAD')
          this.isTxt=false;
          this.importShpUrl = this.analysisurl_cad
        } else if (this.shpFormat.indexOf(arr[1]) >= 0) {//导入的是shp文件
          console.log('shp')
          this.isTxt=false;
          this.importShpUrl = this.analysisurl_shp
        }else if(this.txtFormat.indexOf(arr[1]>=0)){//导入的是txt文件
          console.log('txt');
          this.isTxt=true;
          this.importShpUrl=this.analysisurl_txt;
        }
        this.$refs.upload.post(file, this.importShpUrl)
        return false
      },

      // upload() {
      //   if (this.file.length === 0) {
      //     this.$SgMessage.info('请选择文件')
      //     return false
      //   }
      //
      //   let checkResult = this.checkFileFormat();
      //   if(checkResult !== false){
      //     bus.$emit('setLoad', {
      //       statue: true,
      //       msg: '上传中...'
      //     })
      //     this.$refs.upload.upload(this.file)
      //     let arr = this.file[0].name.split('.'), name = ''
      //     name = arr[0]
      //     this.res.name = name
      //   }else{}
      //
      //
      //
      // },
      // checkFileFormat(){
      //   let fileType = []
      //   for (let i = 0; i < this.file.length; i++) {
      //     let arr=this.file[i].name.split(".")
      //     fileType.push(arr[1])
      //   }
      //   let a = [];
      //   for (let i = 0; i < fileType.length; i++) {
      //
      //     if(this.shpFormat.indexOf(fileType[i])<0 && this.cadFormat.indexOf(fileType[i])<0 ){
      //       //既不是shp,也不是cad
      //       this.$SgMessage.error('请选择shp或者cad文件！')
      //       return false;
      //     }else if(this.shpFormat.indexOf(fileType[i])<0){
      //       //不是shp
      //       a.push("isCad")
      //     }else if(this.cadFormat.indexOf(fileType[i])<0){
      //       //不是cad
      //       a.push("isShp")
      //     }
      //   }
      //
      //   if(a.indexOf("isCad")>=0 && a.indexOf("isShp")>=0){
      //     this.$SgMessage.error('不能同时上传shp或者cad文件！')
      //     return false;
      //   }else if(a.indexOf("isShp")>=0 && a.indexOf("isCad")<0){
      //     for (let i = 0; i < this.shpFormat.length; i++) {
      //       if(fileType.indexOf(this.shpFormat[i])<0){
      //         this.$SgMessage.error('上传SHP文件(*.shp)')
      //         // this.$SgMessage.error('文件不全,请同时上传SHP关联的所有文件(*.dbf *.prj *.shp *.shx *.sbn *.sbx)')
      //         return false;
      //       }
      //     }
      //   }
      // },
      uploadSuccess(res) {
        bus.$emit('setLoad', {
          statue: false,
          msg: ''
        })
        console.log(res)
        if (res.code == -1) {
          this.$SgMessage.error(res.exception)
        } else {
          this.$SgMessage.success('上传成功！')
          this.file = []
          this.res.data = res
          this.showSymbol(this.res)
        }
      },

      isInArray(arr, value) {
        for (let i = 0; i < arr.length; i++) {
          if (value === arr[i]) {
            return true;
          }
        }
        return false;
      },
      analyze(geo) {
        if(this.$refs['analyseText']!=undefined && this.$refs['analyseText'][0]!=undefined){
          this.$refs['analyseText'][0].$refs.textarea.value = ""
        }
        console.log(geo)
        bus.$emit('setLoad', {
          statue: true,
          msg: '压占分析中...'
        })

        this.$post(this.analysisurl_overlayer, {
          coordinateInfo: "{\"geometry\":" + JSON.stringify(geo) + "}",
          overlayerName: this.nowSelect.overLayerName,
          year:this.select_year
        }).then(res => {
          // console.log(JSON.parse(res));
          if (JSON.parse(res).code == 1) {
            this.tableData = JSON.parse(res).data
            this.columns = [];
            for (let i in this.tableData[0]) {
              this.columns.push({
                title: i,
                key: i
              })
            }
            console.log(this.columns)
            //处理 hzinfo
            let hzinfo = JSON.parse(res).hzinfo, str = '';
            let splitsInfo = hzinfo.split(/[，；。]/);
            for(let k=0;k<splitsInfo.length;k++) {
              let info = splitsInfo[k];
              if(info == null || info == "")
                continue;

              str += info;
              if(k != splitsInfo.length-1 && k !=0){
                str += "；";
              }
              if ((k == 0 || k % 2 == 0) && k != splitsInfo.length-1) {
                str += "\n"
              }
            }
            str += "。";
            this.$refs['analyseText'][0].$refs.textarea.value = str
            this.showPane = true

          } else {
            this.$SgMessage.error(JSON.parse(res).excption);
          }

          bus.$emit('setLoad', {
            statue: false,
            msg: ''
          })
        }).catch(err => {
          console.log(err)
          bus.$emit('setLoad', {
            statue: false,
            msg: ''
          })
        })
      },

      goAs() {
        this.analyze(this.nowGeo);
      },

      showSymbol(geo) {
        console.log(geo)
        if (this.nowSelect == null) {
          this.$msg.error('请先选择模板！')
        } else if (this.nowSelect.isOverLayer == 1) {
          if(this.isTxt) {
            this.nowGeo = {rings: geo.data[0].rings}
          }else{
            this.nowGeo = {rings: geo.data.features[0].geometry.rings}
          }

        } else {
          this.nowGeo = {}
        }
        // if (this.nowSelect == null || this.nowSelect.hasOwnProperty('isOverLayer')==false){
        //   this.$msg.error('请先选择模板！')
        // } else if(this.nowSelect.isOverLayer == 1) {
        //  this.nowGeo = {rings: geo.data.features[0].geometry.rings}
        // } else{
        //   this.nowGeo = {}
        // }

        loadModules(
          [
            "esri/Graphic",
            "esri/geometry/SpatialReference"
          ],
          options
        ).then(([Graphic, SpatialReference]) => {

          g_highLightLayer.removeAll();
          let symbol = {
            type: 'simple-fill', // autocasts as new SimpleFillSymbol()
            color: 'rgba(255,225,255, 0)',
            style: 'solid',
            outline: {
              color: 'red',
              width: 3
            }
          };
          let wkid, wkt
          for (let i in g_map.allLayers.items) {
            if (g_map.allLayers.items[i].url != null) {

              wkid = g_map.allLayers.items[i].fullExtent.spatialReference.wkid
              wkt = g_map.allLayers.items[i].fullExtent.spatialReference.wkt
              break
            }
          }
          let graphic;
          if (this.isTxt) {
            for (let i = 0; i <geo.data.length ; i++) {
              geo.data[i].type = 'polygon'
              geo.data[i].spatialReference=new SpatialReference({
                wkt: wkt,
                wkid: wkid
              })
               graphic = new Graphic({
                geometry: geo.data[i],
                symbol: symbol
              });
              g_highLightLayer.graphics.add(graphic)
              g_view.center = graphic.geometry.extent.center
              this.center = g_view.center
              console.log(this.center)

              g_view.zoom = 3
              this.addedGeometry = graphic.geometry;
              this.$emit("rangeOfCadShp", graphic.geometry)
              this.Hightlight.flash(graphic)
            }
          } else {
            for (let i = 0; i < geo.data.features.length; i++) {
              geo.data.features[i].geometry.type = 'polygon'
              geo.data.features[i].geometry.spatialReference = new SpatialReference({
                wkt: wkt,
                wkid: wkid
              })
                graphic = new Graphic({
                geometry: geo.data.features[i].geometry,
                symbol: symbol
              });
              g_highLightLayer.graphics.add(graphic)
              g_view.center = graphic.geometry.extent.center
              this.center = g_view.center
              console.log(this.center)

             // g_view.zoom = 3
              this.addedGeometry = graphic.geometry;
              this.$emit("rangeOfCadShp", graphic.geometry)
              this.Hightlight.flash(graphic)
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss">

  .print {
    width: 100%;
    background: #0079c1;
    height: 32px;
    color: #fff;
    border: none;
    margin-bottom: 20px;
  }

  #custom_polygon {
    display: inline-block;
    line-height: 32px;
  }

  .custom_radio {
    margin: -24px 0 0 10px;

  }

  #goAs {
    margin: -24px 0 0 83px;
  }

  #openAs {
    margin: -24px 0 0 10px;
  }
</style>
