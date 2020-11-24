<template>
  <div>
    <vue-draggable-resizable :resizable="false" v-show="isPanelShow" :x="400" :y="150" style="height:405px;z-index: 200;width:800px" >
      <div style="background-color: white;border: 1px solid #a9a9a929;height:400px;width:100%">
        <div class="header flex">
          <p class="flex-item">{{titleName}}</p>
          <div class="col" @click="close">
            <sg-icon type="icon-close"></sg-icon>
          </div>
        </div>
        <div style="width: 100%" v-show="isManageShow">
        <sg-table border  :show-page="false" :columns="columns" :data="data" style="max-height:400px;width:100%"></sg-table>
      </div>
        <div v-show="isEditShow" style="width: 800px;height:400px;border: 1px solid lightgray"> <!-- 新增编辑 -->
        <table style="width:100%;height:400px;overflow-x:hidden !important;background-color: #f5f6f8">
          <tr style="height: 40px">
            <td style="line-height: 35px;width:20%;text-align: center">窗口数目：</td>
            <td style="width: 30%;text-align:left">
              <select style="width: 95%" @change="selectWinNumsEvent" v-model="selectedWinNums">
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="6">6</option>
              </select>
            </td>
            <td style="margin-left: 20px;width:20%;text-align: center">方案名称：</td>
            <td style="width: 30%;text-align:left">
              <input type="text" style="width:95%;" v-model="currentCaseName">
            </td>
          </tr>
        <tr style="vertical-align: top">
          <td colspan="4">
            <sg-table :show-page="false" border :columns="editColumns" :data="editDatas"
                      style="overflow-x:hidden !important;border: none !important;" :height="320" width="795"></sg-table>
          </td>
        </tr>
        <tr style="text-align: center;height: 28px">
          <td colspan="4" style="padding-bottom: 5px">
            <sg-button  type="primary" size="small" style="margin-right:25px;width:70px" @click="saveInfo">保 存</sg-button>
            <sg-button  type="info" size="small" style="width:70px">取 消</sg-button>
          </td>
        </tr>
        </table>
      </div>
    </div>
    </vue-draggable-resizable>

    <s-respane v-show="isTreeShow" name="选择图层" @pane-close="closeDetails" :w="360" :h="600" :x="550" :y="125" :exportReport="true" style="height:450px;width:300px;z-index: 201">
      <table style="width:100%;">
        <tr><td>
          <sg-tree :data="treeData" show-checkbox filter
                   @on-check-change="check" style="overflow-x: hidden;max-height: 330px"></sg-tree>
        </td></tr>
        <tr><td style="text-align: center;padding-top:10px;">
          <sg-button  type="primary" size="small" style="margin-right:25px;width:70px;margin-top: 30px" @click="confirmSelectedLayer">确 定</sg-button>
          <sg-button  type="info" size="small" style="width:70px;margin-top: 30px" @click="closeDetails">取 消</sg-button>
        </td></tr>
      </table>
    </s-respane>

  </div>
</template>

<script>
    import {deleteMultiCompareSettings,saveMultiCompareSettings} from '../config/api'
    import bus from '../assets/eventBus'
    import VueDraggableResizable from 'vue-draggable-resizable'
    import SRespane from '@/components/common/resultPanel'

    export default {
      name: "caseManager",
      components: {VueDraggableResizable,SRespane},
      data() {
        return {
          isPanelShow: false,
          isManageShow:true,
          isEditShow:false,
          isTreeShow:false,
          columns: [
            {
            key: "rowIndex",
            title: "序号",
            width: 60,
              align: "center",
          }, {
            key: 'caseName',
            title: '方案名称',
              align: "center",
          }, {
            key: 'screenLength',
            title: "窗口数",
              align: "center",
            width: 80
          },{
            title:"操作",
            width:140,
            align: "center",
            render: (h, params) => {
                return h("div", [
                  h(
                    "sg-button",
                    {
                      style: {
                        width: "50px",
                        "padding-left": "13px",
                        height: "30px",
                        "padding-top": "7px",
                        marginRight:"10px"
                      },
                      attrs:{
                        disabled:params.row.caseName.indexOf("默认方案") != -1 ? true:false
                      },domProps:{
                        title:params.row.caseName.indexOf("默认方案") != -1 ? "默认方案不能修改":"修改"
                      },
                      props: {
                        type: "primary",
                        size: "small"
                      },
                      on: {
                        click: () => {
                          this.editSelectedCase(params);
                        }
                      }
                    },
                    "编辑"
                  ),h(
                    "sg-button",
                    {
                      style: {
                        width: "50px",
                        "padding-left": "13px",
                        height: "30px",
                        "padding-top": "7px"
                      },
                      attrs:{
                        disabled:params.row.caseName.indexOf("默认方案") != -1 ? true:false
                      },
                      domProps:{
                        title:params.row.caseName.indexOf("默认方案") != -1 ? "默认方案不能删除":"删除"
                      },
                      props: {
                        type: "error",
                        size: "small"
                      },
                      on: {
                        click: () => {
                          this.deleteSelectedCase(params);
                        }
                      }
                    },
                    "删除"
                  )
                ]);
              }
            }],
          editColumns:[
            {
              title:"窗口",
              key:'winIndex',
              align: "center",
              width:100,
            },{
              title:"图层名称",
              key:"layerName",
              align: "center",
            },{
            title:"图层选择",
              key: "action",
              width: 150,
              align: "center",
              render: (h, params) => {
                return h("div", [
                  h(
                    "sg-button",
                    {
                      style: {
                        width: "70px",
                        "padding-left": "13px",
                        height: "30px",
                        "padding-top": "7px"
                      },
                      props: {
                        type: "primary",
                        size: "small"
                      },
                      on: {
                        click: () => {
                          this.openSelectTreeWin(params);
                        }
                      }
                    },
                    "图层选择"
                  )
                ]);
              }
            }
          ],
          data: [],
          editDatas:[],
          caseWidth:100,
          titleName:'方案管理',
          selectedWinNums:4,
          currentSelWin:1,
          treeData:[],
          selectedLayersInfo:null,
          currentCaseName:""
        }
      },

      mounted() {
        let _this = this;
        bus.$on("OpenCaseManageEvent", res => {
          _this.titleName = res.name;
          _this.isPanelShow = true;
          _this.isManageShow = true;
          _this.isEditShow = false;
          _this.data = _this.filterDefaultCases(res.allList);
        });

        bus.$on("OpenAddCaseEvent", res => {
          _this.selectWinNumsEvent();
          _this.isPanelShow = true;
          _this.isManageShow = false;
          _this.isEditShow = true;
          _this.titleName = res;
        });

        bus.$on("toggleScreen",res=>{
          if(res.show == false) {
            _this.isPanelShow = false;
            _this.isManageShow = false;
            _this.isEditShow = false;
          }
        });

        let copyData = JSON.parse(JSON.stringify(window.g_layerList));
        this.initLayerListData(copyData);
        this.treeData = copyData;
      },

      methods: {

        close() {
          this.isPanelShow = false;
        },

        filterDefaultCases(res) {
          for (let i = 0; i < res.length; i++) {
            this.$set(res[i], 'rowIndex', (i + 1));
          }
          return res;
        },

        //编辑已经存在的方案
        editSelectedCase(params) {
          this.editDatas= [];
          let allName = params.row.caseName;
          let currentScrrenLength = params.row.screenLength;
          this.selectedWinNums = currentScrrenLength;
          let index = allName.lastIndexOf("（");
          this.currentCaseName = allName.substring(0,index);
          let selectedInfo = this.data.find((item)=>{
            return item.caseName == allName;
          });
          for(let i=0;i<selectedInfo.containCompareInfos.length;i++) {
            let formList = selectedInfo.containCompareInfos[i];
            let allContainList = formList.containLayerList;
            let layerInfo = allContainList!=null && allContainList.length>0 ? allContainList[0]:null;
            this.editDatas.push({
              winIndex: "窗口" + toChinesNum(Number(formList.winIndex)),
              layerName: layerInfo!=null?layerInfo.layerName:"",
              rid: formList.rid,
              winIndexNum: Number(formList.winIndex),
              layerRid:layerInfo!=null?layerInfo.rid:""
            });
          }
          this.isPanelShow = true;
          this.isManageShow = false;
          this.isEditShow = true;
        },

        selectWinNumsEvent() {
          this.editDatas = [];
          for (let i = 1; i <= this.selectedWinNums; i++) {
            this.editDatas.push({winIndex: "窗口" + toChinesNum(i), layerName: "",rid:"",winIndexNum:i});
          }
        },

        openSelectTreeWin(params) {
          this.isTreeShow = true;
          this.currentSelWin = params.index;
          console.log(params.index)
        },

        closeDetails() {
          this.isTreeShow = false;
        },

        //勾选
        check(res, current) {
          this.selectedLayersInfo = current;
        },

        confirmSelectedLayer() {
          this.isTreeShow = false;
          this.editDatas[this.currentSelWin].layerName = this.selectedLayersInfo.attributes.layerName;
          this.editDatas[this.currentSelWin].layerRid = this.selectedLayersInfo.attributes.rid;
          this.editDatas[this.currentSelWin].url = this.selectedLayersInfo.attributes.restURL;
          this.initLayerListData(this.treeData);
        },

        initLayerListData(data) {
          data.map(r => {
            this.$set(r, "checked", false);
            if (r.children.length > 0) {
              this.initLayerListData(r.children);
            }
          });
        },

        deleteSelectedCase(params){
          let _this = this;
          if(params){
            this.$modal.confirm({
              title: '提示',
              content:'确定删除?',
              closable: true,
              onOk: () => {
                this.$modal.remove();
                bus.$emit("setLoad", {
                  statue: true,
                  msg: "正在删除..."
                });
                let url = deleteMultiCompareSettings + "?caseName=" + params.row.caseName + "&caseMakerId=" + params.row.caseMakerId;
                this.$get(url).then(res => {
                  if (res.code == "1") {
                    _this.data.splice(params.index,1);
                    this.$msg.info("删除成功！");
                  }else{
                    this.$msg.error(res.exceptionMsg);
                  }
                  bus.$emit("setLoad", {
                    statue: false,
                    msg: "正在删除..."
                  });
                });
              }
            });
          }
        },

        saveInfo() {
          if(this.currentCaseName == ""){
            this.$msg.error("方案名称不能为空！");
            return;
          }

          let findNull = this.editDatas.find((item)=>{
            return item.layerRid == "" || item.layerRid == null;
          });
          if(findNull) {
            this.$msg.error(findNull.winIndex + "设置的图层不能为空！");
            return;
          }

          let saveDatas = [];
          for (let i = 0; i < this.editDatas.length; i++) {
            saveDatas.push({
              caseMakerId: window.userId,
              winNumbers: this.selectedWinNums + '-' + this.editDatas[i].winIndexNum,
              caseName: this.currentCaseName+"（"+ toChinesNum(this.selectedWinNums) +"窗口）",
              sortValue: this.editDatas[i].winIndexNum,
              layerRids: this.editDatas[i].layerRid,
              rid: this.editDatas[i].rid
            });
          }

          bus.$emit("setLoad", {
            statue: true,
            msg: "保存中..."
          });
          let config = {
            headers: {
              "Content-Type": "application/json"
            },
            responseType: "text/html;charset=utf-8"
          };
          this.$http.post(saveMultiCompareSettings, saveDatas, config).then(res => {
            if (res.status == 200) {
              bus.$emit("setLoad", {
                statue: false,
                msg: "保存中..."
              });

              this.doAfaterSave();

            }else {
              this.$msg.error({
                content: res.statusText,
                duration: 10,
                closable: true
              });
              return;
            }
          });
        },

        doAfaterSave(){
          this.data.unshift({
            rowIndex: this.data.length+1,
            caseName:this.currentCaseName+"（"+ toChinesNum(this.selectedWinNums) +"窗口）",
            screenLength:this.selectedWinNums
          });
          this.isEditShow = false;
          this.isPanelShow = false;
          bus.$emit("SaveReloadEvent");
        }
      }
    }
</script>

<style scoped lang="scss">

  .header {
    height: 30px;
    line-height: 30px;
    padding: 0 15px 0 10px;
    background-color: #3b86e0;

    > p {
      color: #fff;
    }

    .col {
      width: 30px;
      height: 24px;
      line-height: 24px;
      margin-top: 3px;
      margin-right: -10px;
      border-radius: 3px;
      cursor: pointer;
      display: block;
      color: #fff;
      text-align: center;

      &:hover {
        background-color: #2076dd;
      }
    }
  }
</style>
