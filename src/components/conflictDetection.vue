//两规冲突检测
<template>
  <div class="constructionProjectStatistic iq-content">
    <sg-form :label-width="60">
      <!--<p class="iq-title">图层选择</p>-->
      <!--<div class="iq-wrap iq-setconf">-->
        <!--<sg-form-item label="城规图层">-->
          <!--<sg-select v-model="formItem.CGSelected">-->
            <!--<sg-option v-for="(field,index) in CGLayerOption" :value="field.value" :key="index">{{field.label}}-->
            <!--</sg-option>-->
          <!--</sg-select>-->
        <!--</sg-form-item>-->
        <!--<sg-form-item label="土规图层">-->
          <!--<sg-select v-model="formItem.TGSelected">-->
            <!--<sg-option v-for="(field,index) in TGLayerOption" :value="field.value" :key="index">{{field.label}}-->
            <!--</sg-option>-->
          <!--</sg-select>-->
        <!--</sg-form-item>-->
      <!--</div>-->
      <p class="iq-title">检测范围</p>
      <s-range :type="rangeType"
               :drawId="drawId"
               ref="range"
               @import-cadShp="importCadShp"
               @draw-geometry="drawGeometry"
               @clear-all="clear"
      ></s-range>
      <div class="iq-button">
        <sg-button type="primary" @click="analysis()">分析</sg-button>
        <sg-button @click="clearBtn()">清除</sg-button>
        <!--<sg-button @click="clear()">开启协调</sg-button>-->
      </div>
    </sg-form>
    <s-respane v-show="resultPanelIsShow" name="检测结果" @pane-close="closePane" :w="550" :h="390" :x="980" :y="208">
      <sg-tab type="card" :animated="false">
        <sg-tab-pane :label="item.label" v-for="item in resultPanel">
          <sg-table :show-page="false" :columns="item.columns" :data="item.attributes" @on-row-click="location"></sg-table>
        </sg-tab-pane>
      </sg-tab>
      <sg-button @click="exportBtn" style="margin-top: 10px;margin-left: 10px" slot="bottom">导出报告</sg-button>
    </s-respane>
  </div>

</template>

<script>

  import SRespane from '@/components/common/resultPanel'
  import bus from '../assets/eventBus';
  import SRange from '@/components/common/range'
  import {ExportReport} from '../config/api.js'

  let AuxiliaryLocation

  export default {

    name: "conflictDetection",
    components: {SRespane, SRange},
    data() {
      return {
        PIC_MAPURL:"",
        ControlLine_Detection:{},
        resultPanel: [{
          label: '汇总信息',
          value: 'HZDATA',
          columns: [{
            title: '差异类型',
            key: 'GLMC'
          }, {
            title: '面积(平方米)',
            key: 'ZYMJ'
          }],
          attributes: [],
        }, {
          label: '两规均为建设用地',
          value: 'bothJS',
          columns: [{
            title: '城规用地性质',
            key: 'CGMC'
          }, {
            title: '城规用地代码',
            key: 'CGDM'
          },{
            title: '土地用途分区名称',
            key: 'TGMC'
          }, {
            title: '土地用途分区代码',
            key: 'TGDM'
          },{
            title: '要素个数',
            key: 'COUNT'
          }, {
            title: '地块面积(平方米)',
            key: 'ZMJ1'
          },{
            title: '地块面积（公顷）',
            key: 'ZMJ2'
          }],
          attributes: [],
        }, {
          label: '两规均为非建设用地',
          value: 'bothFJS',
          columns: [{
            title: '城规用地性质',
            key: 'CGMC'
          }, {
            title: '城规用地代码',
            key: 'CGDM'
          },{
            title: '土地用途分区名称',
            key: 'TGMC'
          }, {
            title: '土地用途分区代码',
            key: 'TGDM'
          },{
            title: '要素个数',
            key: 'COUNT'
          }, {
            title: '地块面积(平方米)',
            key: 'ZMJ1'
          },{
            title: '地块面积（公顷）',
            key: 'ZMJ2'
          }],
          attributes: [],
        }, {
          label: '土规建设用地，城规非建设用地',
          value: 'TGJS_CGFJS',
          columns: [{
            title: '城规用地性质',
            key: 'CGMC'
          }, {
            title: '城规用地代码',
            key: 'CGDM'
          },{
            title: '土地用途分区名称',
            key: 'TGMC'
          }, {
            title: '土地用途分区代码',
            key: 'TGDM'
          },{
            title: '要素个数',
            key: 'COUNT'
          }, {
            title: '地块面积(平方米)',
            key: 'ZMJ1'
          },{
            title: '地块面积（公顷）',
            key: 'ZMJ2'
          }],
          attributes: [],
        }, {
          label: '土规非建设用地，城规建设用地',
          value: 'TGFJS_CGJS',
          columns: [{
            title: '城规用地性质',
            key: 'CGMC'
          }, {
            title: '城规用地代码',
            key: 'CGDM'
          },{
            title: '土地用途分区名称',
            key: 'TGMC'
          }, {
            title: '土地用途分区代码',
            key: 'TGDM'
          },{
            title: '要素个数',
            key: 'COUNT'
          }, {
            title: '地块面积(平方米)',
            key: 'ZMJ1'
          },{
            title: '地块面积（公顷）',
            key: 'ZMJ2'
          }],
          attributes: [],
        }],
        resultPanelIsShow: false,
        geometry: {},
        drawId: 'conflictDetection',
        rangeType: ["draw","import"],
        // showFields: [
        //   {
        //     value: "GHYDXZMC",
        //     label: "规划用地性质",
        //   },
        // ],
        CGLayerOption: [
          {
            value: "cg",
            label: "城市空间布局规划图层",
          }
        ],
        TGLayerOption: [
          {
            value: "tg",
            label: "土地利用总体规划图层",
          }
        ],
        formItem: {
          CGSelected: "",
          TGSelected: "",
          // CGSelected: smallerData3,
          // TGSelected: smallerData0,
          layer_Select: [],
          statisticalMethod: '',
          project: 'projectType',
          statisticalLevel: '',
          region: 'HuiCheng'

        },
      }
    },
    created(){


    },
    mounted(){
      if(!g_MapConfig.panelConfig.conflictDetection){
        // this.$msg.error("缺少两规冲突检测功能相关数据配置。功能标识：conflictDetection")
        console.log("缺少两规冲突检测功能相关数据配置。功能标识：conflictDetection")
        return;
      }

      let config = g_MapConfig.panelConfig.conflictDetection

      this.resultPanel = config.resultPanel;
      this.CGLayerOption = config.CGLayerOption;
      this.TGLayerOption = config.TGLayerOption;

      this.ControlLine_Detection = new SgMap.ControlLineDetection()
      AuxiliaryLocation = new SgMap.AuxiliaryLocation();
      AuxiliaryLocation.event.on({
        'printTask': function (res) {
          this.PIC_MAPURL = res;
          this.exportReport();
        }.bind(this)
      })
    },
    methods: {
      clearBtn(){
        this.formItem.CGSelected = "";
        this.formItem.TGSelected = "";

      },
        constructData(data){
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
          "templatePath": "LGCTFXReport.docx",
          "exportDataMap": {
            "JCDL": "建设用地",
            "JCSJ": date,
            "JCTC": this.CGLayerOption[0].label+"-"+this.TGLayerOption[0].label,
            "JCMJ": "588419.74㎡",
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
      importCadShp(gra){
        this.geometry = gra.geometry;
        // this.isBufferOrNot = true;
      },
      closePane(val) {
        this.resultPanelIsShow = val
      },
      drawGeometry(gra) {
        this.geometry = gra.geometry
      },
      clear() {
        // this.Statistic.clearGraphics();
        this.geometry = "";
        this.$refs.range.clearDrawGraphics();
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
      analysis() {
        //清除结果
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

          this.$post(g_MapConfig.panelConfig.conflictDetection.ConflictDetection_URL, param).then((res) => {
            featureInfo = JSON.parse(res);
            if (featureInfo.code == 1) {
              for(let m = 0;m< featureInfo.data.HZDATA.length;m++){
                for(let i = 0;i<resultPanel.length;i++){
                  if(resultPanel[i].label == featureInfo.data.HZDATA[m].GLMC) {
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
