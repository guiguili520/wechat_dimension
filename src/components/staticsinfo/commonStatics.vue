<template>
    <div id="rootDiv" :class="['commonStatics',{fold:isSearch}]">
      <div class="options-box">
        <ul class="options">
          <li v-for="(item,index) in options" :key="index" @click="check(item,index)" :title="item.sName">
            <p :class="{checkStyle:index==checkIndex}" >{{item.sName}}</p>
          </li>
        </ul>
      </div>

      <sg-tab :value="tabIndexName">

        <sg-tab-pane label="统计条件" name="tab1">
          <div>
            <div style="min-height: 80px">
              <label style="color: #3b86e0;margin-left:5px;font-weight: bold">空间范围</label>
              <sg-form :label-width="65">
                <s-range :type="rangeType"
                         :drawId="drawId"
                         ref="range" style="margin-left: 5px"
                         @get-regionLevel="getRegionLevel"
                         @import-cadShp="importCadShp"
                         @county-location="countyLocation"
                         @town-location="townLocation"
                         @draw-geometry="drawGeometry"
                         @clear-all="clear">
                </s-range>
              </sg-form>
            </div>

            <div style="margin-top: 10px" >
              <label style="color: #3b86e0;margin-left:5px;font-weight: bold" v-if="formData.length>0">属性条件</label>
              <sg-row style="margin-top:5px;margin-left: 2px" v-for="(item,index) in formData" :key="index" class="result-row">
                <sg-col :column="4" style="margin-left: 5px">{{item.aliseName}}</sg-col>
                <sg-col :column="7">
                  <sg-input v-if="item.fieldType!=2" v-model="submitData[item.fieldName]"></sg-input>
                  <sg-date-picker v-model="submitData[item.fieldName]" v-else-if="item.fieldType==2"
                              type="datetimerange" placeholder="选择日期范围" :ref="item.fieldName">

                  </sg-date-picker>
                  <sg-select v-else :ref="item.fieldName" v-model="submitData[item.fieldName]">
                    <sg-option v-for="(itm,idx) in item.options" :key="idx" :value="itm">{{itm}}</sg-option>
                  </sg-select>
                </sg-col>
              </sg-row>
            </div>

            <table style="width: 100%;text-align: center;margin-top: 20px">
              <tr>
                <td style="text-align: right"><sg-button type="primary"  style="padding: 8px;width:80px;margin-right: 5px" @click="searchResult">查询</sg-button></td>
                <td style="text-align: left"><sg-button type="info" style="padding: 8px;width:80px;margin-left: 5px" @click="clearOption">重置</sg-button></td>
              </tr>
            </table>

          </div>
        </sg-tab-pane>

        <sg-tab-pane label="统计结果" name="tab2">
          <div>
            <div style="text-align: right">
                <label style="margin-right: 5px">单位：</label>
              <select style="margin-right: 5px;" @change="changeAreaUnit" id="unit" v-model="selectedUnit">
                <option v-if=isPolygon value="0.0015">亩</option>
                <option v-if=isPolygon value="1">平方米</option>
                <option v-if=isPolygon value="0.0001">公顷</option>
                <option v-if=!isPolygon value="1">米</option>
                <option v-if=!isPolygon value="0.001">千米</option>
              </select>
                <sg-button type="primary"  style="padding: 6px;width:80px;margin-right: 5px" title="导出统计结果" @click="exportStaticsResult">导出结果</sg-button>
            </div>
            <sg-table :show-page="false" border="" :columns="columnQuery" :data="resultData" style="margin-left:2px;margin-right: 2px;margin-top:2px">
            </sg-table>
          </div>
        </sg-tab-pane>
      </sg-tab>
    </div>
</template>

<script>
  import {GET_STATICS_URL,findMapAsFieldsByPrid,GET_STATICS_EXECUTE} from '../../config/api.js'
  import SRange from '.././common/range'
  import bus from '../../assets/eventBus';
  import {export2Excel} from '@/classic/common/export2Excel';
  import StatisticalChart from '../../classic/widget/StatisticalChart'

    export default {
      name: "commonStatics",
      components: {SRange},
      data() {
        return {
          rangeType: ["XZQH", "draw", "import"],
          tabIndexName: "tab1",
          drawId: 'commonStatics',
          options: [],
          isSearch: false,
          searchRid: '',
          staticId: '',
          checkIndex: '',
          checkRid: '',
          searchData: [],
          currentGeometry: null,
          formData: [],
          submitData: [],
          columnQuery: [],
          resultData: [],
          copyResultData: [], //复制备份数据，应对单位切换
          defaultSelectItem: null,
          currentSelectItem: null,
          currentWhere: "",
          chartStatic: null,
          selectedUnit: '0.0015',
          isPolygon: true,
          selUnitName:'亩'
        }
      },

      mounted() {
        let url = GET_STATICS_URL + "?roleId=" + window.userId+"&isTempData=0";
        let _this = this;
        this.$get(url).then(res => {
          if(res.hasOwnProperty("code")){
            console.log("加载数据异常："+res.exceptionMsg)
            return;
          }
          _this.options = res;
          if(_this.options.length>0) {
            _this.defaultSelectItem = _this.options[0];
            _this.check(_this.defaultSelectItem,0);
          }
        });
      },

      methods:{
        importCadShp(graphic){
          if(graphic != '' && graphic != undefined && graphic.geometry != null && graphic.geometry != undefined){
            let analyseGeo = {type: 'polygon', 'rings': graphic.geometry.rings};
            this.currentGeometry = analyseGeo;
          }
        },

        getRegionLevel(value) {
          this.currentGeometry = null;
          this.clearOption();
          if (value == "city")
            this.currentWhere = "1=1";
          else
            this.currentWhere = "";
        },

        drawGeometry(gra) {
          let geo = gra.geometry;
          if(geo == undefined){
            return;
          }
          let analyseGeo = {type: 'polygon', 'rings': geo.rings};
          this.currentGeometry = analyseGeo;
        },

        countyLocation(geo) {
          let analyseGeo = {type: 'polygon', 'rings': geo.rings};
          this.currentGeometry = analyseGeo;
        },

        townLocation(geo) {
          let analyseGeo = {type: 'polygon', 'rings': geo.rings};
          this.currentGeometry = analyseGeo;
        },

        clearDraw() {
          this.currentGeometry = null
          g_regionLayer.removeAll();
          g_drawLayer.removeAll();
          g_highLightLayer.removeAll();
          g_bufferLayer.removeAll();
          g_tempLayer.removeAll();
        },

        clear() {
          this.geometry = "";
          this.$refs.range.clearDrawGraphics();
        },

        check(item, index) {
          this.tabIndexName = 'tab1';
          this.currentWhere = "";
          this.checkIndex = index
          this.isSearch = true
          this.getFileds(item.rid)
          this.searchRid = item.rid;
          this.columnQuery = [];
          this.resultData = [];
          this.currentSelectItem = item;
          this.staticId = item.staticId;
        },

        //表单模板请求
        getFileds(rid) {
          this.checkRid = rid;
          this.formData = [];
          this.searchData = [];
          this.submitData = {};

          this.$get(findMapAsFieldsByPrid, {pRid: rid}).then(res => {
            if (JSON.stringify(res) == '[]') {
              return;
            }
            this.formData = JSON.parse(JSON.stringify(res));
            this.searchData = JSON.parse(JSON.stringify(res));
            for (let i in this.formData) {
              if (this.formData[i].relatedValues) {
                this.formData[i].options = this.formData[i].relatedValues.split(',')
              }
              this.$set(this.submitData, this.formData[i].fieldName, '')
            }
          })
        },

        getFilterCondition() {
          let sWhere = "";
          for (let i in this.formData) {
            let field = this.formData[i].fieldName;
            let value = this.submitData[field];
            let fieldType = this.formData[i].fieldType;
            let fieldOpt = this.formData[i].fieldOpt;

            if (value == '' || value == undefined)
              continue;

            if (fieldType == "0")
              sWhere += field +" "+ fieldOpt + "'%" + value + "%' and ";
            else if (fieldType == "1")
              sWhere += field +" "+ fieldOpt + value + " and ";
          }
          if (sWhere != "")
            sWhere = sWhere.substring(0, sWhere.length - 4);

          if(this.currentWhere != '' && this.currentWhere != null)
            sWhere = this.currentWhere;
          return sWhere;
        },

        searchResult(){
          let config = {
            headers: {
              "Content-Type": "application/json"
            },
            responseType: "application/json;charset=utf-8"
          };
          this.tabIndexName = "tab1";
          let sWhere = this.getFilterCondition();
          let executeData = {
            id:this.staticId,
            where:sWhere,
            clipGeometry:this.currentGeometry
          };
          bus.$emit('setLoad', {
            statue: true,
            msg: '查询中...'
          });
          let _this = this;
          this.chartStatic = null;

          this.$post(GET_STATICS_EXECUTE, executeData,config).then(res => {

            bus.$emit('setLoad', {
              statue: false,
              msg: '查询中...'
            });

            if(res.code){
              console.log(res,'通用统计分析异常');
              this.$msg.error("查询无结果！");
            }else {
              if (_this.columnQuery.length <= 0)
                _this.columnQuery = res.headerInfo;
              _this.resultData = res.dataInfo;
              _this.copyOriginalData();
              if(_this.selectedUnit != "1"){
                _this.changeAreaUnit();
              }
              if (res.type == "polygon")
                _this.isPolygon = true;
              else if (res.type == "polyline")
                _this.isPolygon = false;
              _this.selectedUnit = '0.0015';
              _this.tabIndexName = "tab2";
              _this.addMapChart();
            }
          });
        },

        //图表处理
        addMapChart(){
          let groupFields = this.currentSelectItem.groupFields;
          let staticField = this.currentSelectItem.staticFields;
          let groupSplits = groupFields.split("::");
          let fieldArray = [];
          let sField = staticField.split("=")[0];
          for(let i=0;i<groupSplits.length;i++){
            let fieldAlise = groupSplits[i].split("=");
            fieldArray.push(fieldAlise[0]);
          }
          let valueData = [];
          for(let i=0;i<this.resultData.length;i++){
            let tempData = this.resultData[i];
            let tempNames = [];
            let name = "";
            for(let k=0;k<fieldArray.length;k++){
              tempNames.push(tempData[fieldArray[k]]);
            }
            name = tempNames.join("-");
            valueData.push({name:name,value:tempData[sField]});
          }

          let option = {
            tooltip : {
              trigger: 'item',
              formatter: "{b}<br/>{c} ({d}%)"
            },
            series : [
              {
                type: 'pie',
                radius : '45%',
                data:valueData,
                itemStyle: {
                  emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                },
                label: {
                  normal: {
                    fontSize: 20,
                    textBorderWidth:2,
                    textBorderColor:'white',
                    formatter: (params)=> {
                      let newParamsName = "";
                      let paramsNameNumber = params.name.length;
                      let provideNumber = 4; //一行显示几个字
                      let rowNumber = Math.ceil(paramsNameNumber / provideNumber);
                      if (paramsNameNumber > provideNumber) {
                        for (let p = 0; p < rowNumber; p++) {
                          let value= params.name;
                          let tempStr = "";
                          let start = p * provideNumber;
                          let end = start + provideNumber;
                          if (p == rowNumber - 1) {
                            tempStr = params.name.substring(start, paramsNameNumber);
                          } else {
                            tempStr = params.name.substring(start, end) + "\n";
                          }
                          newParamsName += tempStr;
                        }
                      } else {
                        newParamsName = params.name;
                      }
                      return newParamsName;
                    }
                  }
                }
              }
            ]
          };

          let currentCenter = g_view.center;
          let dataInfo = [{pointx:currentCenter.x,pointy:currentCenter.y}];
          this.chartStatic = new StatisticalChart(dataInfo,option);
        },

        clearOption() {
          if(this.chartStatic != null)
            this.chartStatic.clearChart();

          this.resultData = [];
          this.columnQuery = [];
          this.copyResultData=[];
          this.currentGeometry = null;
          g_tempLayer.removeAll();
          g_drawLayer.removeAll();
          if (this.formData.length>0) {
            for (let i in this.formData) {
              this.$set(this.submitData, this.formData[i].fieldName, '')
            }
          }
        },

        //导出统计的Excel数据
        exportStaticsResult() {
          if (this.resultData.length <= 0) {
            this.$msg.error("没有数据可以导出！");
            return;
          }
          export2Excel(this.columnQuery, this.resultData, this.currentSelectItem.sName+"("+this.selUnitName+")");
        },

        copyOriginalData() {
          this.copyResultData=[];
          for (let i = 0; i < this.resultData.length; i++) {
            if (this.resultData[i] == undefined)
              continue;
            let str = JSON.stringify(this.resultData[i]);
            this.copyResultData.push(JSON.parse(str));
          }
          console.log(this.copyResultData, '复制备份的数据')
        },

        //单位切换
        changeAreaUnit(){
          let selObj = document.getElementById("unit");
          let selIndex = selObj.selectedIndex;
          let value = selObj.options[selIndex].value;
          this.selUnitName = selObj.options[selIndex].label;
          let numValue = parseFloat(value);
          let fixNum = 4;
          if (value == "1")
            fixNum = 2;
          let header = this.columnQuery;
          let orginalData = this.copyResultData;
          let currentData = this.resultData;
          for (let i = 0; i < orginalData.length; i++) {
            let current = orginalData[i];
            let onUse = currentData[i];
            for (let j = 0; j < header.length; j++) {
              let tempHead = header[j];
              if (tempHead.key != '' && tempHead.key != null && tempHead.key != 'index'
                && typeof (current[tempHead.key]) == "number"
                && current[tempHead.key] != 0 && current[tempHead.key] != ''
                && current[tempHead.key] != undefined) {
                let computeValue = parseFloat(current[tempHead.key]) * numValue;
                let finalValue = computeValue.toFixed(fixNum);
                this.$set(onUse, tempHead.key, finalValue);
              }
            }
          }
        }
      }
    }
</script>

<style scoped lang="scss">

  .commonStatics {

    .dialog-wrap {
      height: auto;
      max-height: initial !important;
      overflow: initial !important;
    }

    .options-box {
      width: 100%;
      overflow-x: auto;
    }

    .options-box::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
  }

  .result-row{
    height:36px;
    line-height: 36px;
  }

  .iq-content .iq-wrap {
    margin-top: 10px;
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
      background: url('../../assets/images/gongdi.png') no-repeat center 10px;
    }

    li:nth-child(odd) {
      background: url('../../assets/images/caikuangquan.png') no-repeat center 10px;
    }

    li:hover {
      p {
        color: rgb(51, 133, 255);
      }
    }
  }

</style>
