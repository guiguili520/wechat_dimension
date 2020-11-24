<template>
    <div :class="['gjcx',{fold:isSearch}]">
        <div class="options-box">
          <div class="flex" style="height: 50px;margin-top: 5px">
            <label style="width:80px;margin-top: 10px;margin-left: 3px;text-align: center">查询类型:</label>
            <sg-select v-model="selQueryModel" filterable show-single-filter-input @on-change="check(selQueryModel)"
                       style="width: 75%;margin-right: 5px">
              <sg-option v-for="item in options" :value="item.rid" :key="item.rid">{{ item.searchName }}</sg-option>
            </sg-select>
          </div>

          <div :class="['search-options',{noMargin:!isSearch}]">
            <div style="margin-top:2px;line-height: 30px;" v-for="(item,index) in formData" :key="index" class="flex">
              <label style="width: 80px;text-align: center;margin-left: 2px;margin-right: 2px">{{item.aliseName}}</label>
              <div style="width: 85px">
                <sg-select v-model="submitData[item.fieldName+'opt']" @on-change="selOptChange(item)">
                  <sg-option v-for="opt in item.useOptList" :value="opt" :key="opt">{{opt}}</sg-option>
                </sg-select>
              </div>

              <div style="margin-left: 3px;margin-right: 5px" class="flex">

                <sg-input v-if="!item.options && item.fieldType!=2" v-model="submitData[item.fieldName]"></sg-input>

                <sg-date-picker v-model="submitData[item.fieldName]" format="yyyy年MM月dd日" value-format="yyyy-MM-dd"
                                v-else-if="item.fieldType==2" style="width:171px;height:30px;margin-left:-1px"
                                placeholder="选择日期范围" :type="submitData[item.fieldName+'dateopt']"></sg-date-picker>

                <sg-select v-else :ref="item.fieldName" v-model="submitData[item.fieldName]">
                  <sg-option v-for="(itm,idx) in item.options" :key="idx" :value="itm">{{itm}}</sg-option>
                </sg-select>
              </div>
            </div>
          </div>
        </div>

        <sg-row style="margin-top:2px;">
              <sg-col :column="12">
                <div class="iq-content">
                  <sg-form :label-width="60">
                     <s-range :type="rangeType" :drawId="drawId"
                          @draw-geometry="drawGeometry"
                          @import-cadShp="importCadShp"
                          @clear-all="clear">
                      </s-range>
                  </sg-form>
                  <sg-button class="clearBtn"  style="padding:8px 20px" @click="clearDraw" title="清除绘制范围">清除</sg-button>
                </div>
              </sg-col>
        </sg-row>

        <div style="margin:0 auto;width:180px;text-align: center" class="flex">
            <sg-button type="primary" @click="searchResult" style="margin-right: 10px">查询</sg-button>
            <sg-button type="primary" outline=""  @click="clearOption">重置</sg-button>
        </div>

        <s-respane v-show="showPane" name="查询结果" @pane-close="closePane" style="z-index: 3;border:none"
                 :h="h" :w="w" :y="10" :x="x" :exportReport="true" ref="refPanel">

        <div id="resultDiv" v-show="!isShowRecord">
              <sg-table :show-page="false" border stripe :columns="columnQuery" :data="showProjectRes"
                            height="525"></sg-table>
              <sg-page :total="tableProjectData.length" show-total show-elevator :page-size="10"
                       size="small" @on-change="changePage" style="margin-top: 5px;margin-bottom: 5px;">
              </sg-page>
        </div>

        <div v-if="isShowRecord">
          <sg-button type="primary" size="small" @click="backtoup" style="margin-bottom: 10px">返回上一级</sg-button>
          <div class="flex" >
            <sg-tree :data="treerecorddata" v-if="existRecordData && treerecorddata.length >0" ref="catalogtree" node-key="id" style="width:50%;border:1px dashed #000;max-height:500px;overflow-y: auto" default-expand-all v-model="selTreeNode" @on-node-click="getCatalogContent">
            </sg-tree>
            <div v-if="existRecordData" style="margin-left: 20px;border:1px dashed #000;width:50%;height:500px;overflow-y: auto;overflow-x: hidden">
              <div v-for="(midItem,midIndex) in searchResNode" :key="midIndex" class="search-result" style="margin-left: 5px">
                <sg-row style="margin-top:5px;line-height:24px;">
                  <sg-col :column="4">附件名称：</sg-col>
                  <sg-col :column="8"> {{midItem.filename}} </sg-col>
                </sg-row>
                <sg-button :type="midItem.btntype" size="small" style="margin-bottom:5px;padding: 5px;margin-left: 280px" :disabled="midItem.existfj" @click="downloadRecordFile(midItem)">查看附件</sg-button>
              </div>
            </div>
            <div v-else class="flex-center" style="margin:0 auto;text-align: center;width:300px;">
              <label style="color: #FF5555;text-align: center;vertical-align: center;font-size: 18px">没有查询到关联档案！</label>
            </div>
          </div>
        </div>
      </s-respane>
    </div>
</template>

<script>
import sRange from './common/range'
import {mapAdvanceSearchList,findMapAsFieldsByPrid,mapAdvanceSearchService,downloadRecordFile} from '../config/api.js'
import SRespane from "@/components/common/resultPanel";
import bus from '../assets/eventBus';

export default {
  name: 'advancedQuery',

  components: {sRange, SRespane},

  data() {
    return {
      options: [],
      isSearch: false,
      projectName: '',
      projectType: '',
      projectList: [],
      state: '',
      rangeType: ["draw", "import"],
      drawId: 'gjcx',
      checkIndex: -1,
      showPane: false,
      //表单模板数据源
      formData: [],
      //表单提交数据源
      submitData: {},
      //提交查询数据源
      searchData: [],
      checkRid: '',
      searchRes: {},
      showMore: false,
      showDetailsEnable: false,
      detailsData: [],
      moreData: {},
      Highlight: null,
      importGeometry: {},
      tabIndexName: 'tab1', // 控制tab标签切换
      pages: 0,
      tableProjectData: [],
      showProjectRes: [],
      pageProjectData: [],
      searchResNode: [],
      columnQuery: [],//列表展示
      searchRid: '',
      resultModelView: '',
      showProjectPanel: true,
      showArchivemntPanel: true,
      showArchivementGroup:true,
      isShowRecord:false, //当前是否展示档案
      featureColumns: [{title: '名称', key: 'name'}, {title: '值', key: 'value'}],
      resultTabChange: 'projectTab',
      baseUrl: process.env.BASE_URL,
      selQueryModel: '',
      treerecorddata:[],//档案分类数据
      existRecordData:true,
      selTreeNode:"",
      currentRecords:null,
    }
  },

  methods: {
    //选中类型生成表单模板
    check(rid) {
      this.isSearch = true;
      this.getFileds(rid);
      this.tabIndexName = 'tab1';
      this.searchRid = rid;
    },

    backtoup(){
      this.isShowRecord = false;
    },

    search() {
      this.isSearch = !this.isSearch
    },

    drawGeometry(geo) {
      this.importGeometry = geo.geometry
    },

    importCadShp(geo) {
      this.importGeometry = geo.geometry
    },

    clear() {

    },

    clearDraw() {
      this.importGeometry = {}
      g_regionLayer.removeAll();
      g_drawLayer.removeAll();
      g_highLightLayer.removeAll();
      g_bufferLayer.removeAll();
      g_tempLayer.removeAll();
    },

    clearOption() {
      for (let i in this.submitData) {
        this.submitData[i] = ''
      }
      this.showProjectRes = [];
      this.tableProjectData = [];
      this.searchResNode = [];
    },

    checkTime(i) {
      if (i < 10) {
        i = '0' + i;
      }
      return i
    },

    //查询
    searchResult() {
      bus.$emit('setLoad', {
        statue: true,
        msg: '查询中...'
      });

      this.showProjectRes = [];
      this.tableProjectData = [];
      this.searchResNode = [];
      this.showPane = false;
      this.showDetailsEnable = false;
      g_highLightLayer.removeAll();

      for (let i in this.submitData) {
        if (this.submitData[i] instanceof Array) {
          let str = '';
          for (let j in this.submitData[i]) {
            if (j == this.submitData[i].length - 1) {
              let date = this.submitData[i][j];
              let dateTime = date.getFullYear() + '-' + this.checkTime(date.getMonth() + 1) + '-' + this.checkTime(date.getDate());
              str += dateTime;
            } else {
              let date = this.submitData[i][j];
              let dateTime = date.getFullYear() + '-' + this.checkTime(date.getMonth() + 1) + '-' + this.checkTime(date.getDate());
              str += dateTime + ','
            }
          }
          this.submitData[i] = str
        } else if(this.submitData[i] instanceof Date){
          let date = this.submitData[i];
          let dateTime = date.getFullYear() + '-' + this.checkTime(date.getMonth() + 1) + '-' + this.checkTime(date.getDate());
          this.submitData[i] = dateTime;
        }
      }
      for (let i in this.searchData) {
        this.searchData[i].relatedValues = this.submitData[this.searchData[i].fieldName];
        this.searchData[i].fieldOpt = this.submitData[this.searchData[i].fieldName + "opt"];
      }
      let postList = [];
      for (let i in this.searchData) {
        if (this.searchData[i].relatedValues != '' && this.searchData[i].relatedValues != ',') {
          postList.push(this.searchData[i])
        }
      }
      //组装查询数据
      let postData = {
        geometry: this.importGeometry,
        mapAsFieldsList: postList,
        rid: this.checkRid
      };

      //查询请求
      this.$post(mapAdvanceSearchService, postData).then(res => {
        bus.$emit('setLoad', {
          statue: false,
          msg: '查询中...'
        });
        if (res.code == '-1') {
          this.$msg.error(res.exceptionMsg);
        } else {

          let sData = res;
          this.searchRes = sData.data;
          let arrProjectName = [];//表格显示的数据
          for (let i = 0; i < this.searchRes.length; i++) {
            if (!this.searchRes[i].project || !this.searchRes[i].project.length)
              continue;

            let addObj = this.searchRes[i].project;
            this.$set(addObj,"southgisindex",i);
            arrProjectName.push(addObj);
          }
          if (arrProjectName.length <= 0) {
            for (let i = 0; i < this.searchRes.length; i++) {
              let addObj = this.searchRes[i].features.attributes;
              this.$set(addObj,"southgisindex",i);
              arrProjectName.push(addObj);
            }
          }
          this.tableProjectData = arrProjectName;
          this.buildTableData(this.tableProjectData);
          this.resultModelView = "project";
          this.showPane = true;
          this.showArchivemntPanel = res.isUseRecord;
          this.showArchivementGroup = res.isUseRecordGroup;
        }
        this.addActionLink(res);
      }).catch((error) => {
        console.log("高级查询出错：" + error);
        bus.$emit('setLoad', {
          statue: false,
          msg: '查询中...'
        });
      });
    },

    //添加操作连接
    addActionLink(res) {
      let find = this.columnQuery.find(function (w) {
        return w.title == '操作' && w.key == "handle";
      });
      if(find)
        return;

      this.columnQuery.unshift({
        title: '操作',
        key: 'handle',
        align: 'center',
        width: 180,
        render: (h, params) => {
          return h("div",
            {
              class:'flex',
              textAlign:'center'
            },
            [
            h(
              "sg-button",
              {
                style: {
                  marginRight: '5px',
                  width:'60px'
                },
                props: {
                  type: "text",
                  size: this.size
                },
                on: {
                  click: () => {
                    this.drawPosition(params);
                  }
                }
              },
              "图形定位"
            ),
            h(
              "sg-button",
              {
                style: {
                  marginRight: '5px',
                  width:'60px',
                  display:this.showArchivemntPanel?"block":"none"
                },
                props: {
                  type: "text",
                  size: this.size
                },
                on: {
                  click: () => {
                    this.viewRecordsInfo(params);
                  }
                }
              },
              "档案查看"
            )
          ])
        }
      });
    },

    closePane() {
      this.showPane = false;
      this.isShowRecord = false;
    },

    closeDetails() {
      this.detailsData = [];
      this.showDetailsEnable = false;
    },

    //表单模板请求
    getFileds(rid) {
      this.checkRid = rid;
      this.$get(findMapAsFieldsByPrid, {pRid: rid}).then(res => {
        this.formData = JSON.parse(JSON.stringify(res));
        this.searchData = JSON.parse(JSON.stringify(res));
        for (let i in this.formData) {
          if (this.formData[i].relatedValues) {
            this.formData[i].options = this.formData[i].relatedValues.split(',')
          }
          this.$set(this.submitData, this.formData[i].fieldName, '');
          let fieldopt = this.formData[i].fieldName + "opt";
          this.$set(this.submitData, fieldopt, this.formData[i].fieldOpt);
          if (this.formData[i].fieldType == 2) {
            let fielddateopt = this.formData[i].fieldName + "dateopt";
            let type = "date";
            if (this.formData[i].fieldOpt == "范围")
              type = "daterange";
            this.$set(this.submitData, fielddateopt, type);
          }
        }
      });
      this.computerColumns(rid);
    },

    selOptChange(item) {
      if (item.fieldType == 2 && this.submitData[item.fieldName + "opt"] == "范围") {
        this.submitData[item.fieldName + 'dateopt'] = "daterange";
      } else {
        this.submitData[item.fieldName + 'dateopt'] = "date";
      }
    },

    //绘制到地图。
    drawPosition(params) {
      g_highLightLayer.removeAll();
      this.$refs.refPanel.shrink();

      let index = params.row["southgisindex"];
      let feature = this.searchRes[index].features;
      let geos = [];
      let myGeo = null;
      if (!feature.hasOwnProperty("geometry")) {
        for (let i = 0; i < feature.length; i++) {
          geos.push(feature[i].geometry);
        }
      } else
        myGeo = feature.geometry;

      if (myGeo != null) {
        if (myGeo.hasOwnProperty("rings"))
          myGeo.type = "polygon";
        else if (myGeo.hasOwnProperty("paths"))
          myGeo.type = "polyline";
        else
          myGeo.type = "point";
        myGeo.spatialReference = g_spatialReference;
        this.Highlight.geometriesHighlight(myGeo,undefined,true);
      } else {
        this.Highlight.mutigeometryHightlight(geos,true);
      }
    },

    ///查看档案附件
    viewRecordsInfo(params) {
      this.$refs.refPanel.expand();
      this.isShowRecord = true;
      let index = params.row["southgisindex"];
      let records = this.searchRes[index].archivements;
      this.searchResNode = [];
      this.treerecorddata =[];
      this.existRecordData = true;

      if (records && records.hasOwnProperty("WithNoGroup")) {
        let withnogrouprecords = records["WithNoGroup"];
        for (let i = 0; i < withnogrouprecords.length; i++) {
          let isexistfj = true;
          if (withnogrouprecords[i].SFCZFJ == "true") {
            isexistfj = false;
          }else if(withnogrouprecords[i].SFCZFJ == "false")
            isexistfj = true;

          this.searchResNode.push({
            filename: withnogrouprecords[i].FILENAME,
            filepath: withnogrouprecords[i].FILEPATH,
            existfj: isexistfj,
            btntype: isExistfj ? "info" : "primary"
          });
        }
        if(this.searchResNode.length <=0)
          this.existRecordData = false;
      } else if (records && records.hasOwnProperty("GroupList")) {
        let grouplist = records["GroupList"];
        this.currentRecords = records["GroupContent"];
        if(grouplist && grouplist.length>0) {
          let firstnode = grouplist[0];
          let firstfjs = this.currentRecords[firstnode];
          if(firstfjs.length <=0) {
            this.existRecordData = false;
            return;
          }

          let root = {
            label: '案卷名称',
            id: '-1',
            children: [],
            expanded: true
          };
          for (let j = 0; j < grouplist.length; j++) {
            root.children.push({
              label: grouplist[j],
              id: grouplist[j],
              children: [],
              expanded: true,
              selected: j == 0
            });
          }
          this.treerecorddata.push(root);
          this.selTreeNode = grouplist[0];
          this.getCatalogContent();
        }else {
          this.existRecordData = false;
        }
      } else {
        this.existRecordData = false;
      }
    },

    getCatalogContent(){
      this.searchResNode=[];
      if(this.$refs.catalogtree) {
        let selNodes = this.$refs.catalogtree.getSelectedNodes();
        if (selNodes) {
          this.selTreeNode = this.$refs.catalogtree.getSelectedNodes()[0].id;
        }
      }
      if(this.currentRecords){
        if(this.currentRecords.hasOwnProperty(this.selTreeNode)){
          let records = this.currentRecords[this.selTreeNode];
          for (let i = 0; i < records.length; i++) {
            let isExistfj = true;
            if (records[i].SFCZFJ == undefined || records[i].SFCZFJ == "true")
              isExistfj = false;

            this.searchResNode.push({
              filename: records[i].FILENAME,
              filepath: records[i].FILEPATH,
              existfj: isExistfj,
              btntype: isExistfj ? "info" : "primary"
            });
          }
        }else {
          console.log('this.currentRecords里面找不到：'+this.selTreeNode)
        }
      }
    },

    changePage(index) {
      this.pages = index - 1;
      this.showProjectRes = this.pageProjectData[index - 1];
    },

    buildTableData(res) {
      let result = [];
      let pageNumbers = parseInt(res.length / 10);
      let remain = res.length % 10;
      if (remain > 0)
        pageNumbers = pageNumbers + 1;

      for (let i = 0; i < pageNumbers; i++) {
        let start = i * 10;
        let end = (i + 1) * 10;
        if (end > res.length)
          end = res.length;
        result.push(res.slice(start, end));
      }
      this.pageProjectData = result;
      this.showProjectRes = this.pageProjectData[0];
    },

    downloadRecordFile(record) {
      //组装查询数据 //下载档案附件
      if (record === undefined || record.length <= 0)
        return;

      let filePath = record.filepath;
      let index = filePath.lastIndexOf(".");
      let ext = filePath.substring(index + 1).toUpperCase();
      let url = downloadRecordFile + "?searchRid=" + this.searchRid + "&recordPath=" + filePath;
      let isPrint = false;
      let nullParam = "";
      if (ext == "PDF" || ext == "JPG" || ext == "PNG" || ext == "GIF" || ext == "JPEG" || ext == "BMP") {
        console.log(`./pdf.html?${ext}&&${url}&&${nullParam}&&${isPrint}`, '预览模式')
        window.open(`./pdf.html?${ext}&&${url}&&${nullParam}&&${isPrint}`);
      } else {
        console.log(url, '下载模式');
        window.open(url);
      }
    },

    //处理列表展示头
    computerColumns(rid) {
      this.columnQuery = [];
      let selFind = this.options.find(function (sel) {
        return sel.rid == rid;
      });
      if (selFind && selFind.outPutFields) {
        let fieldinfos = selFind.outPutFields.split(",");
        for (let i = 0; i < fieldinfos.length; i++) {
          let fieldalise = fieldinfos[i].split("=");
          this.columnQuery.push({
            title: fieldalise[1],
            key: fieldalise[1],
            align: 'center',
            minWidth: 100
          });
        }
      }
    }
  },

  created() {
    let url = mapAdvanceSearchList + "/" + window.userId;
    let _this = this;
    this.$get(url).then(res => {
      if (res.hasOwnProperty("code")) {
        console.log("加载数据异常：" + res.exceptionMsg)
        return;
      }

      _this.options = res;
      if (_this.options.length > 0) {
        _this.selQueryModel = this.options[0].rid;
      }
    });
  },

  mounted() {
    this.Highlight = new SgMap.Highlight();
  },

  computed: {
    h() {
      let H = 0.82 * window.screen.height;
      return H;
    },
    w() {//1080-0.72;1366-0.63
      let W = '';
      //适应1920，1366分辨率 0.85/0.75
      if (window.window.screen.width == 1920) {
        W = 0.89 * window.window.screen.width;
      } else if (window.window.screen.width == 1366) {
        W = 0.89 * window.window.screen.width;
      } else {
        W = 0.89 * window.window.screen.width;
      }
      return W;
    },
    x() {//1920-0.235;1366-0.33
      let X = '';
      //适应1920，1366分辨率
      if (window.window.screen.width == 1920) {
        X = 0.235 * window.window.screen.width
      } else if (window.window.screen.width == 1366) {
        X = 0.33 * window.window.screen.width
      } else {
        X = 0.235 * window.window.screen.width
      }
      return X;
    }
  },
}

</script>

<style lang="scss" scoped>
.gjcx {
  .dialog-wrap {
    height: auto;
    max-height: initial !important;
    overflow: initial !important;
  }

  .options-box {
    width: 100%;
    /*overflow-x: auto;*/
  }

  .options-box::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .options {
    padding: 0 10px;
    height: 108px;
    margin: 0;

    li {
      float: left;
      width: 75px;
      height: 78px;
      position: relative;

      p {
        position: absolute;
        top: 52px;
        left: 10px;
        width: 60px;
        color: #2e3334;
        text-align: center;
        word-break: break-word;
        display: block;
        height: auto;
      }

      .checkStyle {
        color: rgb(51, 133, 255);
      }
    }

    li:nth-child(even) {
      background: url('../assets/images/gongdi.png') no-repeat center 10px;
    }

    li:nth-child(odd) {
      background: url('../assets/images/caikuangquan.png') no-repeat center 10px;
    }

    li:hover {
      p {
        color: rgb(51, 133, 255);
      }
    }
  }

  .search {
    text-align: center;
    color: rgb(51, 133, 255);
    cursor: pointer;
    position: relative;

    /*.search-icon {
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
    }*/
  }

  .search-options {
    background-color: #f4f5f6;
    .options-title {
      line-height: 30px;
      text-align: center;
    }
  }

  .noMargin {
    padding: 0;
  }

}
.fold{
        // height:500px;
        // transition: height .3s ease-out;
}
  .sg-col-12{
    .iq-content{
        position: relative;
        .clearBtn{
         position: absolute;
          top:20px;
          right: 20px;
        }
      .iq-wrap{
        background-color: rgba(0, 0, 0, 0);
        .sg-form-item{
          .sg-form-item-label{
            margin-left: -7px;
          }
        }
      }
    }
  }
  .result-row{
      height:30px;
      line-height: 30px;
  }

  .search-result {
    padding: 0px 2px;
    margin: 0 0px 15px 0px;
    position: relative;
  }
  .sg-row {
    height: auto !important;
  }

</style>
