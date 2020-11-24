<template>
  <div>
    <vue-draggable-resizable :resizable="false" v-show="resultPanelIsShow" :x="500" :y="150" style="height: 400px;z-index: 200;">
      <div style="position: fixed;background-color: white;border: 1px solid #a9a9a929; z-index: 1;height:400px">
      <div class="header flex">
        <p class="flex-item">属性查询结果</p>
        <i class="esri-icon-close" @click="closePane"></i>
      </div>
      <div style="width:300px;float:right;height:400px;">
          <sg-table :show-page="false" :columns="columns" :data="data" style="max-height: 400px"></sg-table>
      </div>
      </div>
    </vue-draggable-resizable>
  </div>
</template>

<script>
  import {alllist} from '../config/api'
  import bus from '../assets/eventBus'
  import VueDraggableResizable from 'vue-draggable-resizable'

  export default {
    name: "identifyOutside",
    data() {
      return {
        columns: [
          {
            title: '名称',
            key: 'name',
            width:100
          },
          {
            title: '值',
            key: 'value',
            width: 180
          }
        ],
        data: [],
        listData: [],
        resultPanelIsShow: false,
        getLayer: '',
        configData: [],
        totalName: "",
        filterName: "",
        filterFields: "",
        title:'',
        fileType:true,
        currentGra:null,
        currentGraphicsLayer:null
      }
    },

    components: {VueDraggableResizable},

    mounted() {
      let _this = this;
      this.$get(alllist).then(res => {
        _this.configData = res;
        _this.getConfigInfo();
      }).catch(err => {
        console.log(err);
      });
      bus.$on("EmitOutsideMapIResult",result=>{

        let res = result.geo;
        let targetLayer  = result.layer;
        let gra = result.gra;
        if(_this.currentGra != null && _this.currentGraphicsLayer != null){
          _this.currentGraphicsLayer.remove(_this.currentGra);
        }
        _this.currentGra = gra;
        _this.currentGraphicsLayer = targetLayer;

        _this.resultPanelIsShow = true;
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

      }); //监听事件

      bus.$on("toggleScreen",res=>{
        if(res.show == false) {
          _this.resultPanelIsShow = false;
        }
      });
    },

    methods: {
      ExportData(){
        this.fileType=!this.fileType;
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
          }
        }
      },
      closePane() {
        if(this.currentGra != null && this.currentGraphicsLayer != null){
          this.currentGraphicsLayer.remove(this.currentGra);
        }
        this.resultPanelIsShow = false;
        this.data = [];
      }
    }
  }
</script>

<style scoped lang="scss">

  .btn{
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
  .dialog-wrap{
    height:455px;
    overflow:auto;
    overflow-x:hidden;
    border-right: 1px solid #a9a9a929;
    .layerText{
      height: 41px;white-space: nowrap;overflow: hidden;background-color: #f8f8f9;line-height: 2;
    }
  }
  .res-pane {
    background-color: #fff;
    z-index: 10000;
    position: fixed !important;
    border:1px solid #e4e4e4;
    box-shadow: 0 2px 10px 0px rgba(0,0,0,0.2);
  }
</style>
