
<template>
  <div class="constructionProjectStatistic iq-content">
    <sg-form :label-width="60">
      <!--<div class="iq-wrap">-->
      <s-range :type="rangeType"
               :drawId="drawId"
               ref="range"
               @import-cadShp="importCadShp"
               @draw-geometry="drawGeometry"
               @clear-all ="clear"
      ></s-range>
        <!--<sg-form-item label="项目列表">-->
          <!--<sg-select v-model="formItem.project">-->
            <!--<sg-option v-for="project in projectOption" :value="project.value">{{project.label}}</sg-option>-->
          <!--</sg-select>-->
        <!--</sg-form-item>-->
        <!--<sg-form-item label="范围选择">-->
          <!--<sg-radio-group v-model="formItem.graphicSelection">-->
            <!--<sg-radio label="import">从外部导入文件</sg-radio>-->
            <!--<sg-radio label="draw">手绘范围</sg-radio>-->
          <!--</sg-radio-group>-->
        <!--</sg-form-item>-->
        <!--<div class="flex draw" v-show="formItem.graphicSelection=='draw'">-->
          <!--<div class="action-button esri-icon-polygon esri-widget--button" id="complianceReview_polygon"-->
               <!--title="面"></div>-->
          <!--&lt;!&ndash;<div class="action-button esri-icon-checkbox-unchecked esri-widget--button" id="statistic_rectangle"&ndash;&gt;-->
               <!--&lt;!&ndash;title="矩形"></div>&ndash;&gt;-->
          <!--&lt;!&ndash;<div class="action-button esri-icon-radio-unchecked esri-widget--button" id="statistic_circle"&ndash;&gt;-->
               <!--&lt;!&ndash;title="圆形"></div>&ndash;&gt;-->
        <!--</div>-->
      <!--</div>-->
      <div style="margin:0 10px 10px 10px;">
        <p >图层选择</p>
          <sg-table :show-page="false" :columns="layerColumns" :data="showLayerResult" @on-selection-change="getSelection" border ref="selection"></sg-table>
        <div style="margin-top: 3px">
          <sg-button @click="handleSelectAll(true)">设置全选</sg-button>
          <sg-button @click="handleSelectAll(false)" style="margin-left: 2px">取消全选</sg-button>
        </div>
      </div>
    </sg-form>
    <div class="iq-button">
      <sg-button type="primary" @click="startAnalysis()">开始分析</sg-button>
      <sg-button @click="clear()">清除结果</sg-button>
    </div>
    <s-respane v-show="resultPanelIsShow" name="检测结果" @pane-close="closePane" :w="550" :h="558" :x="980" :y="208" :exportReport="true">
      <sg-tab type="card" :animated="false">
        <sg-tab-pane :label="item.label" v-for="item in resultPanel" v-if = "item.visible == true">
          <sg-table :show-page="false" :columns="item.columns" :data="item.attributes"  @on-row-click="location"></sg-table>
        </sg-tab-pane>
      </sg-tab>
      <sg-button @click="exportBtn" style="margin-top: 10px;margin-left: 10px" slot="bottom">导出报告</sg-button>
    </s-respane>
  </div>

</template>

<script>
  import SRange from '@/components/common/range'
  import {ExportReport} from '../config/api.js'
  import SRespane from '@/components/common/resultPanel'
  import {loadModules} from "esri-loader";
  import {options} from "@/config";
  import bus from '../assets/eventBus';
  import Draw from '../classic/common/Draw'
  let AuxiliaryLocation

  export default {
    name: "complianceReview",
    components: {SRespane,SRange},
    data() {
      return {
        ZGColumns:[{
          title:'序号',
          key:'OBJECTID'
        },{
          title:'用地代码',
          key:'GHYDXZDM'
        },{
          title:'用地性质',
          key:'GHYDXZMC'
        },{
          title:'占用面积',
          key:'DKMJ'
        }],
        KGColumns:[
          {
            title:'序号',
            key:'OBJECTID'
          },{
            title:'用地代码',
            key:'GHYDXZDM'
          },{
            title:'用地性质',
            key:'GHYDXZMC'
          },{
            title:'占用面积',
            key:'DKMJ'
          }
        ],
        TGColumns:[{
          title:'序号',
          key:'OBJECTID'
        },{
          title:'土地用途分区代码',
          key:'TDYTFQDM'
        },{
          title:'土地用途分区名称',
          key:'TDYTFQMC'
        },{
          title:'占用面积',
          key:'MJ'
        }],
        STHXColumns:[{
          title:'序号',
          key:'OBJECTID'
        },{
          title:'占用面积',
          key:'MJ'
        }],
        JBNTColumns:[{
          title:'序号',
          key:'OBJECTID'
        },{
          title:'占用面积',
          key:'MJ'
        }],
        CSKFBJColumns:[            {
          title:'序号',
          key:'XH'
        },
          {
            title:'占用面积',
            key:'area'
          }],
        drawId:'complianceReview',
        rangeType:["draw","import"],
        resultPanel:[{
          label:'总规',
          value:'ZG',
          visible:false,
          columns:[{
              title: '结果',
              key: 'icon',
              width: 150,
              align: 'center',
              render: (h, params) => {
                console.log(params.row.result)
                return h('div', [
                  h('i', {
                    'class':params.row.result=='预警'?{'esri-icon-error2 orange':true}:(params.row.result=='不通过'?{'esri-icon-error red':true}:''),

                  })
                ])

              }
            }
          ],
          attributes:[],
        },{
          label:'控规',
          value:'KG',
          visible:false,
          columns:[{
            title: '结果',
            key: 'icon',
            width: 150,
            align: 'center',
            render: (h, params) => {
              console.log(params.row.result)
              return h('div', [
                h('i', {
                  'class':params.row.result=='预警'?{'esri-icon-error2 orange':true}:(params.row.result=='不通过'?{'esri-icon-error red':true}:''),

                })
              ])

            }
          }],
          attributes:[],
        },{
          label:'土规',
          value:'TG',
          visible:false,
          columns:[{
            title: '结果',
            key: 'icon',
            width: 150,
            align: 'center',
            render: (h, params) => {
              console.log(params.row.result)
              return h('div', [
                h('i', {
                  'class':params.row.result=='预警'?{'esri-icon-error2 orange':true}:(params.row.result=='不通过'?{'esri-icon-error red':true}:''),

                })
              ])

            }
          }],
          attributes:[],
        },{
          label:'生态控制线',
          value:'STHX',
          visible:false,
          columns:[{
            title: '结果',
            key: 'icon',
            width: 150,
            align: 'center',
            render: (h, params) => {
              console.log(params.row.result)
              return h('div', [
                h('i', {
                  'class':params.row.result=='预警'?{'esri-icon-error2 orange':true}:(params.row.result=='不通过'?{'esri-icon-error red':true}:''),

                })
              ])

            }
          }],
          attributes:[],
        },{
          label:'基本农田',
          value:'JBNT',
          visible:false,
          columns:[{
            title: '结果',
            key: 'icon',
            width: 150,
            align: 'center',
            render: (h, params) => {
          /*    console.log(params.row.result)*/
              return h('div', [
                h('i', {
                  'class':params.row.result=='预警'?{'esri-icon-error2 orange':true}:(params.row.result=='不通过'?{'esri-icon-error red':true}:''),

                })
              ])

            }
          }],
          attributes:[],
        },{
          label:'城市开发边界',
          value:'CSKFBJ',
          visible:false,
          columns:[
            {
            title: '结果',
            key: 'icon',
            width: 150,
            align: 'center',
            render: (h, params) => {
              // console.log(params.row.result)
              return h('div', [
                h('i', {
                  'class':params.row.result=='预警'?{'esri-icon-error2 orange':true}:(params.row.result=='不通过'?{'esri-icon-error red':true}:''),
                })
              ])

            }
          }],
          attributes:[],
        }],
        mapUrl:[],
        geometry:[],
        selection:[],
        file: [],
        res: {
          data: null,
          name: ''
        },
        polygon: {},
        layerColumns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '图层名称',
            key: 'name'
          },
        ],
        showLayerResult: [
          {
            name: '总规',
            value: 'ZG',
          },
          {
            name: '控规',
            value: 'KG',
          },
          {
            name: '土规',
            value: 'TG',
          },
          {
            name: '生态红线',
            value: 'STHX',
          },
          {
            name: '基本农田',
            value: 'JBNT',
          },
          {
            name: '城市开发边界',
            value: 'CSKFBJ',
          }
        ],
        // showLayerResult: [
        //   {
        //     name: '总规',
        //     value: 'ZG',
        //    // url:'http://192.168.10.115:6080/arcgis/rest/services/DGOneMap/smallerData/MapServer/3'
        //   },
        //   {
        //     name: '控规',
        //     value: 'KG',
        //    // url:'http://192.168.10.115:6080/arcgis/rest/services/DGOneMap/smallerData/MapServer/3'
        //   },
        //   {
        //     name: '土规',
        //     value: 'TG',
        //    // url:'http://192.168.10.115:6080/arcgis/rest/services/DGOneMap/smallerData/MapServer/0'
        //   },
        //   {
        //     name: '生态红线',
        //     value: 'STHX',
        //    // url:'http://192.168.10.115:6080/arcgis/rest/services/DG/CoreData/MapServer/8'
        //   },
        //   {
        //     name: '基本农田',
        //     value: 'JBNT',
        //    // url:'http://192.168.10.115:6080/arcgis/rest/services/DG/CoreData/MapServer/15'
        //   },
        //   {
        //     name: '城市开发边界',
        //     value: 'CSKFBJ',
        //   }
        // ],
        resultPanelIsShow: false,
        formItem: {
          graphicSelection: 'draw',
          project: 'projectType',

        },
        projectOption: [
          {
            value: '',
            label: ''
          }
        ],
      }
    },

  mounted(){
    if(!g_MapConfig.panelConfig.complianceReview){
      // this.$msg.error("缺少合规性审查功能相关数据配置。功能标识：complianceReview")
      console.log("缺少合规性审查功能相关数据配置。功能标识：complianceReview")
      return;
    }else{
      let config = g_MapConfig.panelConfig.complianceReview

      this.showLayerResult = config.layerOptions;
      this.ZGColumns = config.resultColumns.ZGColumns;
      this.KGColumns = config.resultColumns.KGColumns;
      this.TGColumns = config.resultColumns.TGColumns;
      this.STHXColumns = config.resultColumns.STHXColumns;
      this.JBNTColumns = config.resultColumns.JBNTColumns;
      this.CSKFBJColumns = config.resultColumns.CSKFBJColumns;
      this.resultPanel[0].columns = this.ZGColumns.concat(this.resultPanel[0].columns);
      this.resultPanel[1].columns = this.KGColumns.concat(this.resultPanel[1].columns);
      this.resultPanel[2].columns = this.TGColumns.concat(this.resultPanel[2].columns);
      this.resultPanel[3].columns = this.STHXColumns.concat(this.resultPanel[3].columns);
      this.resultPanel[4].columns = this.JBNTColumns.concat(this.resultPanel[4].columns);
      this.resultPanel[5].columns = this.CSKFBJColumns.concat(this.resultPanel[5].columns);
    }


    AuxiliaryLocation = new SgMap.AuxiliaryLocation();
      AuxiliaryLocation.event.on({
        'printTask': function (res) {
          this.PIC_MAPURL = res;
          this.exportReport();
        }.bind(this)
      })




    this.complianceReview = new SgMap.ComplianceReview();
    this.polygon = new Draw('complianceReview_polygon', 'polygon')
    this.polygon.event.on({
    'drawComplete': (res) => {
      this.geometry = res.geometry;
    }
  })
},
    methods: {
      constructData(data) {
        let thColumns = data.columns;
        let tbData = data.attributes
        let title = data.label
        let TB_DATA = {
          "datas": [{"rowData": []}],
          "headers": {
            "rowData": [],
            "mergeCellBool":true,
            "startCell":0,
            "endCell":thColumns.length-2
          }
        }
        TB_DATA.headers.rowData.push({"text": title})
        for (let k = 0; k < thColumns.length-2; k++) {
          TB_DATA.headers.rowData.push({
            "text": ""
          })
        };

        for (let k = 0; k < thColumns.length; k++) {
          if(thColumns[k].title!="结果"){
          TB_DATA.datas[0].rowData.push({
            "text": thColumns[k].title
          })
          }
        };
        for (let i = 0; i < tbData.length; i++) {
          let rowData = []
            for (let k = 0; k < thColumns.length; k++) {
              for (let m in tbData[i]) {
              if (m == thColumns[k].key) {
                rowData.push({
                  "text": tbData[i][m]
                })
              }
            };
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
          this.$msg.error("请在地图基本设置中配置arcgis server打印服务的地址:webgisPrint")
          console.log("请在地图基本设置中配置arcgis server打印服务的地址:webgisPrint")
          return;
        }else{
          AuxiliaryLocation.print(g_MapConfig.baseConfig.webgisPrint);
        }


      },
      exportReport() {
        let TB_FLJG = this.constructData(this.resultPanel[0])
        let TB_LGJWJSYD = this.constructData(this.resultPanel[1])
        let TB_TGFJSYD_CGJSYD = this.constructData(this.resultPanel[2])
        let TB_TGJSYD_CGFJSYD = this.constructData(this.resultPanel[3])
        let TB_LGJWFJSYD = this.constructData(this.resultPanel[4])
        let TB_CSKFBJ = this.constructData(this.resultPanel[5])
        const tab = [TB_FLJG,TB_LGJWJSYD,TB_TGFJSYD_CGJSYD,TB_TGJSYD_CGFJSYD,TB_LGJWFJSYD,TB_CSKFBJ];
        let tablist = [];
        for(let i = 0;i<tab.length;i++){
          if (tab[i].datas.length>1){
            tablist.push(tab[i])
            }
        }
        let data = {
          "templatePath": "HGXSCReport.docx",
          "exportDataMap": {
            "XMDZ": "厦门市湖里区",
            "JSDW": "厦门市土地开发总公司",
            "XMXZ": "未知",
            "YDGM": "960平方米",
            "ZTZ": "1000万元",
            "PICLIST": [
              {
                "data": [],
                "height": 320,
                "path": this.PIC_MAPURL,
                "width": 440
              }
            ],
            "TBLIST":tablist,
            "SCJL": "项目“测试”用地检测未通过审查!",
            "JCSJ": "2018年05月31日",
            "JCDW": "厦门金融城开发有限公司"
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


        this.$http.post(ExportReport, formData, config).then(function (res) {
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
          link.download = new Date().getTime() + '.docx'; // 动态文件名
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

      drawGeometry(gra){
        this.geometry = gra.geometry
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
      location(geo) {
        AuxiliaryLocation.locationSingle(geo.geometry);
      },
      getSelection(selection){
        this.selection = selection
        for(let m in this.resultPanel){
            this.resultPanel[m].visible = false;
        }
      },
      handleSelectAll (status) {
        for(let m in this.resultPanel){
          this.resultPanel[m].visible = false;
        }
        this.$refs.selection.selectAll(status);
        // if(status == false){
        //   this.complianceReview.remove();
        // }
      },
      startAnalysis() {
        for(let i =0 ;i<this.resultPanel.length;i++){
          this.resultPanel[i].attributes = [];
        }
        //this.complianceReview.remove();
        console.log(this.selection)
        for(let i in this.selection){
            for(let m in this.resultPanel){
              if(this.selection[i].value == this.resultPanel[m].value){
                this.resultPanel[m].visible = true;
              }
            }

        }

        let extent
        let layerIds = []
        if(this.geometry.rings != undefined){
          extent = {
            "geometry":{
              "rings":this.geometry.rings
            }
          }
          if(this.selection.length > 0){
            this.selection.map((item) =>{
              layerIds.push(item.value)
            });
            layerIds = layerIds.join(",")
          }else{
            this.$msg.error({
              content: "请选择分析图层！",
              duration: 10,
              closable: true
            });
          }
          let param = {
            coordinateInfo:JSON.stringify(extent),
            layerIds: layerIds,
          }

          bus.$emit('setLoad',{
            statue:true,
            msg:'分析中...'
          });
          this.$post(g_MapConfig.panelConfig.complianceReview.HGAnalysis_URL,param).then((res)=>{
            this.result = JSON.parse(res)
            console.log(this.result)
            bus.$emit('setLoad',{
              statue:false,
              msg:'加载中...'
            });
            if(this.result.code == 1){
              for(let i in this.result.data){
                this.result.data[i].map((a,index,arr)=>{
                  for(let m in this.resultPanel){
                    if(i == this.resultPanel[m].value){
                      if(i !== "CSKFBJ"){
                        a.attributes.result = a.result
                        a.attributes.geometry = a.geometry
                        this.resultPanel[m].attributes.push(a.attributes);
                      }else{
                        let area = this.complianceReview.areaCalculation(a.geometry)

                        this.resultPanel[m].attributes.push({
                          result:a.result,
                          geometry:a.geometry,
                          XH:index+1,
                          area:area.toFixed(3)
                        })
                      }

                      console.log(this.resultPanel[m].attributes)
                      // this.resultPanel[m].geometry.push(a.geometry);
                    }
                  }
                  // this.data[i].push(a.attributes)
                })
              }

              this.resultPanelIsShow = true;
              console.log(this.resultPanel);

            }else{
              this.$msg.error({
                content: this.result.excption,
                duration: 10,
                closable: true
              });
            }
          }).catch((error) => {
            bus.$emit('setLoad',{
              statue:false,
              msg:'加载中...'
            });
            console.log(error)
          })
        }else{
          this.$msg.error({
            content: "请手绘范围或者导入范围！",
            duration: 10,
            closable: true
          });
        }
      },
      //区域选择切换的清空图层事件
      clear() {
        this.geometry = '';
        this.handleSelectAll(false);
        // this.complianceReview.remove();
        AuxiliaryLocation.clearGraphics();
        g_drawLayer.removeAll();
        this.resultPanelIsShow = false
        for(let i=0;i<this.resultPanel.length;i++){
          this.resultPanel[i].visible = false;
        }
      },
      beforeUpload(file) {
        this.file.push(file)
        return false
      },
      isInArray(arr, value) {
        for (let i = 0; i < arr.length; i++) {
          if (value === arr[i]) {
            return true;
          }
        }
        return false;
      },
      closePane(val) {
        this.resultPanelIsShow = val
      },

    }
  }
</script>

<style>
.red {
  color: red;
}
  .orange{
    color: orange;
  }
</style>
