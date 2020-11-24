<template>
  <div>
    <!-- 属性查询按钮位置 -->
    <div @click="active" class="esri-widget--button identifyBtn esri-icon-description btn" :title="title"
         :style="{top:topheight+'px'}"
    ></div>
    <vue-draggable-resizable :draggable="false" :resizable="false" v-show="resultPanelIsShow" :x="leftWidth" :y="56" style="height:420px;">
      <div style="position: fixed;background-color: white;border: 1px solid #a9a9a929; z-index: 105;height:420px">
        <div class="header flex">
          <p class="flex-item">查询结果</p>
          <i class="esri-icon-close" @click="closePane"></i>
        </div>
        <div style="float:left;">
          <!--<vue-draggable-resizable  class="res-pane" :w="300" :resizable="false"  :h="600" :x="500" :y="150">-->
          <div class="dialog-wrap" style="width: 140px;height:355px">
            <!--属性查询结果-->
            <el-tree ref='tree' :data="listData" :default-expand-all="defaultExpand" @node-click="findPosition" node-key="id" highlight-current>
              	<span class="span-ellipsis" slot-scope="{ node, data }">
                  <span :title="node.label">{{ node.label }}</span>
                </span>
            </el-tree>
          </div>
        </div>

        <div style="width:300px;float:right;height:355px;">
          <div>
            <sg-table :show-page="false" border :columns="columns" :data="data"
                      style="max-height: 355px;font-size: 12px !important;"></sg-table>
          </div>
        </div>

        <div class="export" @click="ExportData">导出空间数据
          <ul v-show="fileType">
            <li v-for="i in filetype" @click="exportRedLine(i.index)">{{i.title}}</li>
          </ul>
        </div>
        <div style="position: absolute;left: 320px;top: 380px;">
          <sg-button v-show="recordSqlEnable" type="text" size="small" @click="getArchivement">查看档案</sg-button>
        </div>
      </div>
    </vue-draggable-resizable>

    <s-respane v-show="showArchivePane" name="档案信息" @pane-close="closeArchivePane" :w="300" :h="420" :x=leftWidth-305
               :y="56" style="z-index: 999">
      <div v-for="(item,index) in archivementList" :key="index" class="search-result">
        <sg-row style="margin-top:5px;line-height:24px;">
          <sg-col :column="4">附件名称：</sg-col>
          <sg-col :column="8"> {{item.FILENAME}}</sg-col>
        </sg-row>
        <sg-button type="primary" style="margin-bottom:5px;padding: 5px;margin-left: 200px"
                   @click="downloadRecordFile(item)">查看附件
        </sg-button>
      </div>
    </s-respane>

    <vue-draggable-resizable :resizable="false" v-show="displayArchivement" style="height: 100%;width: 100%;z-index: 999">
      <div style="position: fixed;background-color: white;border: 1px solid #a9a9a929;width: 100%;height: 100%">
        <div class="header flex">
          <p class="flex-item">预览</p>
          <i class="esri-icon-close" @click="closeArchivement"></i>
        </div>
        <iframe :src="archiveUrl" frameborder="0" style="width: inherit;height: inherit"></iframe>
      </div>
    </vue-draggable-resizable>
  </div>
</template>

<script>
  import {toolClass, toolsData} from '../config/config.js'
  import {alllist,GET_ISEARCH_ARCHIVE,GET_ISEARCH_DOWNLOAD} from '../config/api'
  import bus from '../assets/eventBus'
  // import ResultPanel from './common/resultPanel'
  import VueDraggableResizable from 'vue-draggable-resizable'
  import SRespane from '@/components/resPane'

  export default {
    name: "identify",
    data() {
      return {
        filetype: [
          {title: "CAD格式", index: 0},
          {title: "SHP格式", index: 1},
        ],
        columns: [
          {
            title: '名称',
            key: 'name',
            width: 100
          },
          {
            title: '值',
            key: 'value',
            width: 180
          }
        ],
        data: [],
        layerSelection: [],
        identifyTask: null,
        defaultExpand:true,
        listData: [],
        resultPanelIsShow: false,
        toolClass: {},
        getLayer: '',
        configData: [],
        totalName: "",
        filterName: "",
        filterFields: "",
        title: '',
        topheight: 0,
        geo: {},
        geometryStringInfo: [],
        fileType: true,
        leftWidth: document.documentElement.clientWidth - 490,
        displayField: {},
        recordSqlEnable:false,//查看档案按钮是否可见
        showArchivePane: false,
        currentSearch: null,
        archivementList: [],
        displayArchivement:false,
        archiveUrl:""
      }
    },
    components: {VueDraggableResizable, SRespane},

    mounted() {
      if (toolsData.tools) {
        let newToolclass = ["", "", ""];
        let oldToolClass = toolClass.custom;
        let defaultTools = ["fullscreen", "identify", "clear"]
        for (let i in oldToolClass) {
          if (defaultTools.indexOf(oldToolClass[i]) > -1) {
            newToolclass.push(oldToolClass[i]);
          }
        }
        this.toolClass.custom = newToolclass
      } else {
        let newToolclass = [];
        let oldToolClass = toolClass.custom;
        let defaultTools = ["fullscreen", "identify", "clear"]
        for (var i in oldToolClass) {
          if (defaultTools.indexOf(oldToolClass[i]) > -1) {
            newToolclass.push(oldToolClass[i]);
          }
        }
        this.toolClass.custom = newToolclass
      }
      this.toolClass.system = toolClass.system;
      this.topheight = this.toolClass.custom.indexOf("identify") > -1 ? 28 + (this.toolClass.custom.indexOf("identify")) * 32 + (5 * this.toolClass.custom.indexOf("identify")) : -999;
      let _this = this;
      this.$get(alllist).then(res => {
        _this.configData = res;
        _this.getConfigInfo();
      }).catch(err => {
        console.log(err);
      });
      this.identifyTask = new SgMap.Identify();

      this.identifyTask.event.on({
        "clearListData": (res) => {
          _this.ListData = []
        }
      });

      this.identifyTask.event.on({
        "getAttribute": (res) => {
          _this.data = [];
          _this.geometryStringInfo = [];
          if(res.geometry != null && res.geometry != undefined) {
            _this.geo = {
              dkmc: "目标地块",
              geometryInfo: {geometry: {rings: res.geometry.rings}},
              attributes: res.attributes
            };
            _this.geometryStringInfo.push(_this.geo);
          }

          if (_this.totalName.indexOf(_this.getLayer) == -1 || _this.filterName.indexOf(_this.getLayer) != -1 || _this.totalName == '') {
            for (let item in res.attributes) {
              _this.data.push({
                name: item,
                value: res.attributes[item]
              })
            }
          } else {
            for (let i = 0; i < _this.configData.length; i++) {
              let layerName = _this.configData[i].MapISearch.layerName
              if (layerName.indexOf(_this.getLayer) != -1) {
                _this.currentSearch = _this.configData[i].MapISearch;
                let sql = _this.configData[i].MapISearch.recordSql;
                if (sql === undefined || sql == '')
                  this.recordSqlEnable = false;
                else
                  this.recordSqlEnable = true;

                if (_this.filterFields.indexOf(_this.getLayer) == -1) {
                  let getDicFields = _this.configData[i].MapISearch.dicFields.split('::');
                  for (let j = 0; j < getDicFields.length; j++) {
                    getDicFields[j] = getDicFields[j].split('=');
                  }
                  for (let j = 0; j < getDicFields.length; j++) {
                    let fl = getDicFields[j][0];//字段名称
                    if (res.attributes.hasOwnProperty(fl)) {
                      let getFields = _this.configData[i][fl];
                      let currentValue = res.attributes[fl];
                      for (let k = 0; k < getFields.length; k++) {
                        let code = getFields[k].code
                        let showValue = getFields[k].showValue
                        if (currentValue == code) {
                          res.attributes[fl] = showValue;
                          break;
                        }
                      }
                    }
                  }
                }
                let outputFields = _this.configData[i].MapISearch.outputFields.split('::');
                for (let j = 0; j < outputFields.length; j++) {
                  outputFields[j] = outputFields[j].split('=');
                }
                for (let item in res.attributes) {
                  for (let k = 0; k < outputFields.length; k++) {
                    if (item == outputFields[k][1] || item == outputFields[k][0]) {
                      _this.data.push({
                        name: outputFields[k][1],//字段
                        value: res.attributes[item],//字段值
                      })
                    }
                  }
                }
              }
            }
          }
        }
      });

      this.identifyTask.event.on({
        "identifyComplete": function (res) {
          if (res.length > 0) {
            let nodes = this.buildTree(res);
            if (nodes != null && nodes.length > 0) {
              this.listData = nodes;
              this.resultPanelIsShow = true;
            } else {
              this.listData=[];
              this.data = [];
              this.resultPanelIsShow = false;
              this.$msg.error("没有查询到数据")
            }
          } else {
            this.listData=[];
            this.data = [];
            this.resultPanelIsShow = false;
            this.$msg.error("没有查询到数据")
          }
          this.$nextTick(() => {
            if (this.listData != null && this.listData.length > 0) {
              this.$refs.tree.setCurrentKey(this.listData[0].children[0].id);
              this.findPosition(this.listData[0].children[0]);
            }
          })
        }.bind(this)
      })
      this.ToolText();
    },

    methods: {
      buildTree(list) {
        let tree = {};
        for (let i = 0; i < list.length; i++) {
          //剔除图层名称为空的
          let layerName = list[i].layerName;
          if (layerName == "" || layerName == null)
            continue;
          if (!tree.hasOwnProperty(layerName)) {
            let temp = {
              label: layerName,
              id: list[i].layerId,
              children: []
            };
            tree[layerName] = temp;
          }
          let displayField = null;
          for (let j = 0; j < this.configData.length; j++) {
            let configLayer = this.configData[j].MapISearch.layerName;
            if (configLayer.indexOf(layerName) != -1) {
              if (this.configData[j].MapISearch.displayField != null) {
                displayField = this.configData[j].MapISearch.displayField.split('=');
              }
              //字典转换
              if (this.filterFields.indexOf(layerName) == -1) {
                let getDicFields = this.configData[j].MapISearch.dicFields.split('::');
                for (let k = 0; k < getDicFields.length; k++) {
                  getDicFields[k] = getDicFields[k].split('=');
                }
                for (let k = 0; k < getDicFields.length; k++) {
                  let fl = getDicFields[k][0];//字段名称
                  if (list[i].feature.attributes.hasOwnProperty(fl)) {
                    let getFields = this.configData[j][fl];
                    let currentValue = list[i].feature.attributes[fl];
                    for (let l = 0; l < getFields.length; l++) {
                      let code = getFields[l].code
                      let showValue = getFields[l].showValue
                      if (currentValue == code) {
                        list[i].feature.attributes[fl] = showValue;
                        break;
                      }
                    }
                  }
                }
              }
              break;
            }
          }
          let label = '';
          if (displayField == null || displayField == '') {
            if (list[i].feature.attributes.hasOwnProperty("OBJECTID"))
              label = list[i].feature.attributes["OBJECTID"];
            else if (list[i].feature.attributes.hasOwnProperty("FID"))
              label = list[i].feature.attributes["FID"];
          } else if (list[i].feature.attributes.hasOwnProperty(displayField[0])) {
            label = list[i].feature.attributes[displayField[0]];
          } else if (list[i].feature.attributes.hasOwnProperty(displayField[1])) {
            label = list[i].feature.attributes[displayField[1]];
          }
          let node = {
            label: label,
            id: label,
            children: null,
            data: list[i]
          }
          tree[layerName].children.push(node);
        }
        return Object.values(tree);
      },

      ExportData() {
        this.fileType = !this.fileType;
      },
      exportRedLine(filetype) {
        if (this.geo == null || this.geo.length <= 0) {
          return;
        }
        let config = {
          headers: {
            "Content-Type": "application/json"
          },
          responseType: "arraybuffer"
        };
        let exportUrl = g_MapConfig.baseConfig.webgisExport;
        let splits = exportUrl.split('?');
        if (filetype == 1)
          exportUrl = splits[0] + "?FileType=1";
        else
          exportUrl = splits[0] + "?FileType=0";

        let _this = this;

        this.$http.post(exportUrl, _this.geometryStringInfo, config).then(function (res) {
          let url = window.URL.createObjectURL(new Blob([res.data], {
            type: 'application/zip'
          }));  // new Blob([data])用来创建URL的file对象或者blob对象
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.download = '红线范围' + _this.formatDate(new Date(), '') + '.zip'; // 动态文件名
          console.log(link.download)
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        event.stopPropagation();
      },

      formatDate(now, symbol) {
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        month = month < 10 ? '0' + month : month
        let date = now.getDate();
        date = date < 10 ? '0' + date : date
        let hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
        let minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
        let second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
        if (!symbol) {
          return year + "" + month + "" + date + "" + hour + "" + minute + "" + second;
        } else {
          return year + symbol + month + symbol + date + ' ' + hour + ':' + minute + ':' + second;
        }
      },
      getConfigInfo() {
        if (this.configData.length > 0) {
          for (let i = 0; i < this.configData.length; i++) {
            let layer = this.configData[i].MapISearch.layerName;
            let outputFields = this.configData[i].MapISearch.outputFields;
            let dicFields = this.configData[i].MapISearch.dicFields;
            this.totalName += layer;
            if (outputFields == '' || outputFields == null) {
              this.filterName += layer;
            }
            if (dicFields == '' || dicFields == null) {
              this.filterFields += layer
            }
            this.displayField[layer] = this.configData[i].MapISearch.displayField;
          }
        }
      },

      ToolText() {
        let config = window.roleToolkits;
        for (let i = 0; i < config.data.length; i++) {
          let toolPath = JSON.stringify(config.data[i].toolPath)
          if (toolPath.indexOf('identify') != -1) {
            this.title = config.data[i].toolName
          }
        }
      },

      active() {
        this.data = []
        this.listData = [];
        this.identifyTask.clear();
        this.identifyTask.active();
      },

      findPosition(item) {
        if (item.data == null)
          return;

        this.getLayer = item.data.layerName;
        let feature = item.data.feature;
        this.identifyTask.position(feature);
      },

      closePane() {
        this.resultPanelIsShow = false;
        this.showArchivePane = false;
        this.displayArchivement = false;
        g_drawLayer.removeAll();
        g_tempLayer.removeAll();
        this.listData = [];
        this.identifyTask.clear();
      },

      getArchivement(){
        if (this.currentSearch == null) {
          this.$msg.error("未查询到档案");
          return;
        }
        this.archivementList = [];
        let config = {
          headers: {
            "Content-Type": "application/json"
          },
          responseType: "application/json;charset=utf-8"
        };
        let data = {
          geometry: this.geo.attributes,
          searchrid: this.currentSearch.rid
        };
        this.$post(GET_ISEARCH_ARCHIVE, data, config).then(res=>{
          if (res.code) {
            console.log(res, '获取档案失败');
            this.$msg.error(res.exceptionMsg);
            return;
          }
          if(res.length<=0){
            this.$msg.error("未查询到档案");
            return;
          }
          this.archivementList=res;
          this.showArchivePane = true;
        });
      },
      downloadRecordFile(record) {//下载档案附件
        //组装查询数据
        if (record === undefined || record.length <= 0)
          return;

        let filePath = record.FILEPATH;
        let index = filePath.lastIndexOf(".");
        let ext = filePath.substring(index + 1).toUpperCase();
        let url = GET_ISEARCH_DOWNLOAD + "?searchRid=" + this.currentSearch.rid + "&recordPath=" + filePath;
        let isPrint = false;
        let nullParam = "";
        if (ext == "PDF" || ext == "JPG" || ext == "PNG" || ext =="GIF" || ext == "JPEG" || ext == "BMP") {
          console.log(`./pdf.html?${ext}&&${url}&&${nullParam}&&${isPrint}`,'预览模式')
          this.archiveUrl=`./pdf.html?${ext}&&${url}&&${nullParam}&&${isPrint}`;
          this.displayArchivement=true;
        }else{
          console.log(url,'下载模式');
          window.open(url);
        }
      },
      closeArchivePane() {
        this.showArchivePane = false;
        this.displayArchivement = false;
      },
      closeArchivement() {
        this.archiveUrl = null
        this.displayArchivement = false
      },
    }
  }
</script>

<style scoped lang="scss" scoped>
  .identifyBtn {
    position: fixed;
    right: 15px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    width: 32px;
    height: 32px;
    z-index: 100;
  }

  .btn {
    margin-bottom: 15px;
    font-size: 18px;
  }

  ul {
    list-style: none;

    > li {
      line-height: 33px;
      padding: 8px 12px;
      border-bottom: 1px solid #dfdfdf;
      cursor: pointer;

      &:hover {
        background-color: #f4f5f6;
      }
    }
  }

  .header {
    height: 30px;
    line-height: 30px;
    padding: 0 15px 0 10px;
    background-color: #3b86e0;
    color: #fff;

    > i {
      width: 30px;
      height: 24px;
      line-height: 24px;
      margin-top: 3px;
      border-radius: 3px;
      background-size: 12px 12px;
      text-align: center;
      cursor: pointer;
      margin-right: -10px;

      &:hover {
        background-color: #2076dd;
      }
    }
  }

  .dialog-wrap {
    height: 455px;
    overflow: auto;
    border-right: 1px solid #a9a9a929;

    .layerText {
      height: 41px;
      white-space: nowrap;
      overflow: hidden;
      background-color: #f8f8f9;
      line-height: 2;
    }
  }
  .dialog-wrap::-webkit-scrollbar {
    width: 7px;
    height: 7px;
  }

  .res-pane {
    background-color: #fff;
    z-index: 10000;
    position: fixed !important;
    // visibility: hidden;

    border: 1px solid #e4e4e4;
    box-shadow: 0 2px 10px 0px rgba(0, 0, 0, 0.2);

  }

  .export {
    position: absolute;
    width: 100px;
    top: 390px;
    left: 1px;
    white-space: nowrap;
    line-height: 25px;
    vertical-align: middle;
    text-align: center;
    background-color: #fff;
    box-shadow: 0 1px 2px gray;
    cursor: pointer;

    ul {
      list-style: none;
      margin: 0px;
      display: none;

      li {
        padding: 0px;
        height: 25px;
        line-height: 25px;
        border-bottom: none;

        &:hover {
          background-color: #bcbcbc;
        }
      }
    }

    &:hover ul {
      display: block;
    }
  }
  .search-result{
    /*background-color: #f4f5f6;*/
    padding: 0px 2px;
    margin: 0 0px 15px 0px;
    position: relative;
    .view-more{
      position: absolute;
      right:2px;
      top:2px;
    }
  }
  .sg-row{
    height:auto !important;
  }

  .span-ellipsis {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
  }

  /deep/.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content{
    background-color: #a3c2f1;
  }
</style>
