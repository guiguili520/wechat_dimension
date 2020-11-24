<template>
  <div class="constructionProjectStatistic iq-content">
    <sg-form :label-width="60">
      <p class="iq-title">检测项目</p>
      <div class="iq-wrap iq-setconf" >
        <sg-form-item label="项目名称">
            <sg-input v-model="formItem.projectName"></sg-input>
        </sg-form-item>
        <sg-form-item label="建设单位" style="margin-bottom: 8px;">
            <sg-input v-model="formItem.organization"></sg-input>
        </sg-form-item>
        <sg-form-item label="立案类别">
          <sg-input v-model="formItem.category"></sg-input>
        </sg-form-item>
      </div>
      <p class="iq-title">检测范围</p>
      <s-range :type="rangeType"
               :drawId="drawId"
               ref="range"
               @import-cadShp="importCadShp"
               @draw-geometry="drawGeometry"
               @clear-all ="clear"
      ></s-range>
      <div class="iq-button">
        <sg-button type="primary" @click="analysis()">开始分析</sg-button>
        <sg-button @click="clearBtn()">清除</sg-button>
      </div>
    </sg-form>
    <s-respane v-show="resultPanelIsShow" name="检测结果" @pane-close="closePane" :w="550" :h="390" :x="980" :y="208">

      <sg-tab type="card" :animated="false">
        <sg-tab-pane :label="item.label" v-for="item in resultPanel">
          <sg-table :show-page="false" :columns="item.columns" :data="item.attributes" @on-row-click="location"></sg-table>
        </sg-tab-pane>
      </sg-tab>
      <div slot="bottom" style="margin-top: 10px;margin-left: 10px">
      <sg-button @click="exportBtn"  >导出报告</sg-button>
      <span style="margin-left: 92px;">导入地块面积：{{totalArea}}㎡</span>
      </div>
    </s-respane>

  </div>

</template>

<script>
  import SRespane from '@/components/common/resultPanel'
  import bus from '../assets/eventBus';
  import SRange from '@/components/common/range'
  import {ExportReport} from '../config/api.js'

  import SgMap from "../classic";
  let AuxiliaryLocation
  export default {

    name: "controlLineDetection",
    components: {SRespane,SRange},
    data() {
      return {
        PIC_MAPURL:"",
        ControlLine_Detection:{},
        totalArea:0,
        resultPanel: [{
          label: '汇总信息',
          value: 'HZDATA',
          columns: [{
            title: '序号',
            key: 'XH'
          },{
            title: '控制线名称',
            key: 'KZXMC'
          }, {
            title: '图斑个数',
            key: 'TBGS'
          },{
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
          },{
            title: '控制线代码',
            key: 'KZXDM'
          },{
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
          },{
            title: '控制线代码',
            key: 'KZXDM'
          },{
            title: '占用面积(㎡)',
            key: 'ZYMJ'
          }],
          attributes: [],
        },{
          label: '城镇开发边界控制线',
          value: 'CZKFBJ',
          columns: [{
            title: '序号',
            key: 'ID'
          }, {
            title: '控制线名称',
            key: 'KZXMC'
          },{
            title: '控制线代码',
            key: 'KZXDM'
          },{
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
          },{
            title: '控制线代码',
            key: 'KZXDM'
          },{
            title: '占用面积(㎡)',
            key: 'ZYMJ'
          }],
          attributes: [],
        }],
        resultPanelIsShow: false,
        geometry:{},
        drawId:'controlLineDetection',
        rangeType:["import","draw"],
        // showFields: [
        //   {
        //     value: "GHYDXZMC",
        //     label: "规划用地性质",
        //   },
        // ],
        // CGLayerOption: [
        //   {
        //     value: smallerData3,
        //     label: "城市空间布局规划图层",
        //   }
        // ],
        // TGLayerOption: [
        //   {
        //     value: smallerData0,
        //     label: "土地利用总体规划图层",
        //   }
        // ],
        formItem:{
          CGSelected:"",
          TGSelected:"",
          // CGSelected:smallerData3,
          // TGSelected:smallerData0,
          layer_Select:[],
          statisticalMethod:'',
          project:'projectType',
          statisticalLevel:'',
          region:'HuiCheng',
          projectName:"",
          organization:"",
          category:""

        },
      }
    },
    created(){

    },
    mounted(){
      if(!g_MapConfig.panelConfig.controlLineDetection){
        // this.$msg.error("缺少控制线检测功能相关数据配置。功能标识：controlLineDetection")
        console.log("缺少控制线检测功能相关数据配置。功能标识：controlLineDetection")
        return;
      }

      let config = g_MapConfig.panelConfig.controlLineDetection
      this.resultPanel = config.resultPanel;
      this.ControlLine_Detection = new SgMap.ControlLineDetection();
      AuxiliaryLocation = new SgMap.AuxiliaryLocation();
      AuxiliaryLocation.event.on({
        'printTask': function (res) {
          this.PIC_MAPURL = res;
          this.exportReport();
        }.bind(this)
      })
    },
    methods:{
      //清除按钮
      clearBtn(){
        this.formItem.projectName = "";
        this.formItem.organization = "";
        this.formItem.category = "";
      },
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
            "endCell":thColumns.length-1
          }
        }
        TB_DATA.headers.rowData.push({"text": title})
        for (let k = 0; k < thColumns.length-1; k++) {
          TB_DATA.headers.rowData.push({
            "text": ""
          })
        };

        for (let k = 0; k < thColumns.length; k++) {
          TB_DATA.datas[0].rowData.push({
            "text": thColumns[k].title
          })
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
      formatDate(now, symbol){
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var date = now.getDate();
        var hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
        var minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
        var second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
        if (!symbol) {
          return year + '年' + month + '月' + date +'日'+ ' ' + hour + '时' + minute + '分' + second +'秒';
        }else{
          return year + symbol + month + symbol + date + ' ' + hour + ':' + minute + ':' + second;
        }
      },
      exportBtn() {
        bus.$emit('setLoad', {
          statue: true,
          msg: '正在导出...'
        });
        if(!g_MapConfig.baseConfig.webgisPrint){
          this.$msg.error("请在地图基本设置中配置arcgis server打印服务的地址:webgisPrint")
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
        let date = this.formatDate(new Date(),'-')
        const tab = [TB_FLJG,TB_LGJWJSYD,TB_TGFJSYD_CGJSYD,TB_TGJSYD_CGFJSYD,TB_LGJWFJSYD];
        let tablist = [];
        for(let i = 0;i<tab.length;i++){
          if (tab[i].datas.length>1){
            tablist.push(tab[i])
          }
        }
        let data = {
          "templatePath": "KZXJCReport.docx",
          "exportDataMap": {
            "JCBH": "20180510091502",
            "XMMC": this.formItem.projectName,
            "JSDW": this.formItem.organization,
            "LALB": this.formItem.category,
            "JCSJ": date,
            "JCMJ": this.totalArea + "㎡",
            "PICLIST": [
              {
                "data": [],
                "height": 320,
                "path": this.PIC_MAPURL,
                "width": 440
              }
            ],
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
      location(item){
        console.log(item);
        if(item.DETAILINFO != undefined){//总表
          if(item.DETAILINFO.length != 0){
                this.ControlLine_Detection.locationMulti(item.DETAILINFO)

          }else{
            this.ControlLine_Detection.clearHighlightLayer()
          }
        }else{
          this.ControlLine_Detection.locationOne(item.geometry)
        }
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
      closePane(val) {
        this.resultPanelIsShow = val
      },
      drawGeometry(gra){
        this.geometry = gra.geometry
      },
      clear() {
        // this.Statistic.clearGraphics();
        this.$refs.range.clearDrawGraphics();
        this.geometry =""
      },
      alertErrorMessage(msg){
        this.$msg.error({
          content: msg,
          duration: 10,
          closable: true
        });
      },
      setLoad(msg,statue){
        bus.$emit('setLoad', {
          statue: statue,
          msg: msg
        });
      },
      analysis(){
        for(let i =0 ;i<this.resultPanel.length;i++){
          this.resultPanel[i].attributes = [];
        }
        if (this.geometry.rings == undefined) {
          this.alertErrorMessage("请先绘制范围！")
        } else {
          this.setLoad("检测中...",true);
          let geo = {
            geometry: {
              rings: this.geometry.rings
            },
          }
          let param = {
            coordinateInfo: JSON.stringify(geo),
          }
          let resultPanel = this.resultPanel;
          let featureInfo
          this.$post(g_MapConfig.panelConfig.controlLineDetection.ControlLineDetection_URL, param).then((res) => {
            featureInfo = JSON.parse(res);
            if (featureInfo.code == 1) {
              this.totalArea = featureInfo.data.totalArea
              for(let m = 0;m< featureInfo.data.HZDATA.length;m++){
                for(let i = 0;i<resultPanel.length;i++){
                  if(resultPanel[i].label == featureInfo.data.HZDATA[m].KZXMC) {
                    for (let k = 0; k < featureInfo.data.HZDATA[m].DETAILINFO.length; k++) {
                      let attribute = featureInfo.data.HZDATA[m].DETAILINFO[k].attribute;
                      attribute.geometry = featureInfo.data.HZDATA[m].DETAILINFO[k].geometry;
                      resultPanel[i].attributes.push(attribute);
                    }
                  }
                  if ( resultPanel[i].value == "HZDATA"){
                    resultPanel[i].attributes = featureInfo.data.HZDATA
                  }
                }
              }

              console.log(resultPanel);
              this.resultPanelIsShow = true;
              // this.resultPanel[0].attributes = featureInfo.data.HZDATA;
              this.setLoad("加载中...",false);
            } else if (featureInfo.code == -1) {
              this.setLoad("加载中...",false);
              this.alertErrorMessage(featureInfo.excption);
            }
          }).catch((error) => {
            this.setLoad("加载中...",false);
            this.alertErrorMessage(error)
          });
          this.resultPanel = resultPanel;
          // this.featureInfo = featureInfo;

        }
      }
    }
  }
</script>

<style scoped>

</style>
