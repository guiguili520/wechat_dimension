<template>
  <div id="fuzzySearchTool">
  <div style="top: 21px; left: 92px;position: fixed;width:351px;background:white;z-index:99" >
    <div id="fuzzyHead" >
      <div class="inputsss" style="border-radius:3px;border-width: 0px;background-color: transparent">
        <div class="flex" style="background: white; border: 1px solid #dfdfdf;padding:5px 8px;border-radius:3px;" >
        <sg-select v-model="formItem.querySubject" style="width: 40%;" @on-clear="closeResultPanel" placeholder="全部">
          <sg-option v-for="field in formItem.querySubjectArr" :value="field.value" >{{field.label}}</sg-option>
        </sg-select>
        <sg-input v-model="formItem.queryValue" placeholder="请输入查询值"
                  @on-focus="searchList=true" @on-enter ="queryEvent()" @on-clear="closeResultPanel" ref="searchTxt"
                  style="width:55%;margin-left: 5px" >

          <!--<sg-button slot="append" type="primary" @click="queryEvent()" id="queryvalue"  style="margin-left: 2px">查询</sg-button>-->
        </sg-input>
          <img src="../assets/images/search-active.png" style="margin-left: 5px;margin-top:8px;height: 20px;width:20px;" alt="查询" @click="queryEvent()" />
        </div>
      </div>
    </div>
    <div  id="fuzzyBody"  v-show="fuzzyBodyIsShow" :style="{'max-height':winh-48+'px'}">
      <div class="closeSide" @click="fuzzyBodyIsShow=false" v-if="fuzzyBodyIsShow"></div>
      <div class="iq-content">
        <sg-form :model="formItem">
          <div class="iq-wrap" >
            <sg-form-item :label-width="70" label="专题图层：">
              <sg-select v-model="formItem.layerName" style="width: 240px;" @on-change="getResultArr">
                <sg-option v-for="field in result" :value="field.layerName">{{field.layerName}}</sg-option>
              </sg-select>
            </sg-form-item>
          </div>
        </sg-form>
      </div>
      <ul class="res_list" style="margin-bottom: 20px;">
        <li v-if="result.length==0 || resultArr.length==0" class="res_null">查询结果为空</li>
        <li v-else="result.length>0 && resultArr.length>0" v-for="(i,index) in resultArr" :key="index" @click="location(i.geometry)">
        <!--<li v-for="(i,index) in resultArr" :key="index" @click="location(i.geometry)">-->
          <p class="res_list_title">{{i.title}}</p>
          <p class="area">{{i.subTitle}}</p>
          <span class="management" @click="detailed(i.attributes)">详细</span>
        </li>

      </ul>
      <sg-page :total="total" :page-size="10" :current="currentPage" size="small"  @on-change="changePage" style="margin:5px"></sg-page>
    </div>

  </div>
    <vue-draggable-resizable :resizable="false" v-show="resultPanelIsShow" :x="500" :y="150">
      <div style="position: fixed;background-color: white;border: 1px solid #a9a9a929;">
        <div class="header flex">
          <p class="flex-item">详细</p>
          <i class="esri-icon-close" @click="closePane"></i>
        </div>
        <div style="width:200px;float:left;">
          <!--<vue-draggable-resizable  class="res-pane" :w="300" :resizable="false"  :h="600" :x="500" :y="150">-->
          <div class="dialog-wrap" >
            <!--属性查询结果-->
            <div style="width:300px;float:left;">
              <ul>
                <li style="height: 41px;white-space: nowrap;overflow: hidden;background-color: #f8f8f9;">
                  <span style="color: #495060;font-size: 12px;font-weight: bold;">图层</span>
                </li>
                <li>
                  {{formItem.layerName}} <br/>
                  <!--图层号：{{item.layerId}} <br />-->
                  <!--OBJECTID：{{item.OBJECTID}}-->
                </li>
              </ul>

            </div>

          </div>
        </div>
        <div style="width:323px;float:right;height:520px;overflow:auto;" >
          <sg-table :show-page="false" :columns="columns" :data="data"></sg-table>
        </div>
      </div>
    </vue-draggable-resizable>
  </div>
</template>

<script>
  import bus from '../assets/eventBus';
  import SRespane from '@/components/common/resultPanel'
  import {Get_QueryObject,Execute_Query} from '../config/api.js'
  import VueDraggableResizable from 'vue-draggable-resizable'

  export default {
    name: "fuzzySearch",
    components: {SRespane, VueDraggableResizable},
    data() {
      return {
        winh: 889,
        currentPage: 1,
        total: 0,
        splitResult: [],
        fuzzyBodyIsShow: false,
        tabName: "conditionPanel",
        columns: [
          {
            title: '名称',
            key: 'name',
            width: 123
          },
          {
            title: '值',
            key: 'value',
            width: 200
          }
        ],
        total: 0,
        splitResult: [],
        size: 0,
        data: [],
        result: [],
        resultArr: [],
        resultPanelIsShow: false,

        formItem: {
          layerName: "",
          querySubject: "",
          querySubjectArr: [{
            label: "全部",
            value: "all"
          }, {
            label: "1",
            value: "1"
          }],
          queryValue: "",
          exactQuery: ""
        }
      }

    },
    mounted() {
      this.winh = window.innerHeight;
      this.getQuerySubject();
      this.Highlight = new SgMap.Highlight();
      bus.$on('showFuzzyBody', (isShow) => {
        console.log(isShow)
        this.fuzzyBodyIsShow = isShow
      })
    },
    methods: {
      changePage(page) {

        this.pages = page - 1;
        if (page > this.splitResult.length) {
          this.resultArr = []
        } else {
          this.resultArr = this.splitResult[page - 1]
        }

      },
      getList(page) {

      },
      closeResultPanel() {
        this.fuzzyBodyIsShow = false
      },
      getResultArr() {
        this.splitResult = [];
        this.resultArr = [];
        this.total = 0;

        this.currentPage = 1;
        for (let m = 0; m < this.result.length; m++) {
          if (this.result[m].layerName == this.formItem.layerName) {

            this.total = this.result[m].features.length
            let result = [];
            if (this.result[m].features.length > 0) {
              for (let i = 0, len = this.result[m].features.length; i < len; i += 10) {
                result.push(this.result[m].features.slice(i, i + 10));
              }
            } else {

            }

            this.splitResult = result;
            if (this.splitResult.length > 0) {
              this.resultArr = this.splitResult[0];
            }

            break
          }
        }
      },
      detailed(attributes) {
        this.data = []
        for (let item in attributes) {
          this.data.push({
            name: item,
            value: attributes[item],
          })
        }
        this.resultPanelIsShow = true;
      },
      location(geometry) {

        this.$set(geometry, "spatialReference", g_spatialReference)
        // if(geometry.hasOwnProperty('rings')){
        //   this.$set(geometry, "type", "polygon")
        // }else if(geometry.hasOwnProperty('paths')){
        //   this.$set(geometry, "type", "polyline")
        // }else {
        //   this.$set(geometry, "type", "point")
        // }

        this.Highlight.geometryHighlight(geometry)
      },
      closePane() {
        this.resultPanelIsShow = false;
      },
      // queryEvent2(){
      //   this.total =this.resultArr.length;
      //   let result = [];
      //   for (let i = 0, len = this.resultArr.length; i < len; i += 1) {
      //     result.push(this.resultArr.slice(i, i + 1));
      //   }
      //   this.splitResult = result;
      //   this.resultArr = this.splitResult[0];
      //   this.fuzzyBodyIsShow = true;
      //
      // },
      queryEvent() {
        bus.$emit('isExpand', false);
        this.splitResult = [];
        this.resultArr = [];
        this.total = 0;
        if (this.formItem.queryValue == "") {
          this.$msg.error("请输入查询值！")
        } else {
          this.total = 0;
          this.formItem.layerName = ""
          this.splitResult = [];
          this.result = [];
          this.data = [];
          this.resultArr = [];
          let param = {
            rid: this.formItem.querySubject,
            searchText: this.formItem.queryValue,
          }

          bus.$emit('setLoad', {
            statue: true,
            msg: '查询中...'
          });
          // this.$load.show({
          //   text: '查询中...',
          // })
          this.$get(Execute_Query, param).then((res) => {
            // this.$load.hide()
            bus.$emit('setLoad', {
              statue: false,
              msg: '查询中...'
            });
            if (res.code != -1) {
              if (res.length > 0) {
                this.result = res;
                this.formItem.layerName = this.result[0].layerName;
                this.total = this.result[0].features.length;
                let result = [];
                if (this.result[0].features.length > 0) {
                  for (let i = 0, len = this.result[0].features.length; i < len; i += 10) {
                    result.push(this.result[0].features.slice(i, i + 10));
                  }
                }

                this.splitResult = result;
                if (this.splitResult.length > 0) {
                  this.resultArr = this.splitResult[0];
                  for (let item in this.resultArr[0].attributes) {
                    this.data.push({
                      name: item,
                      value: this.resultArr[0].attributes[item],
                    })
                  }
                }

                this.fuzzyBodyIsShow = true;

              } else {
                this.$msg.info("查询结果为空!")
              }
            } else {
              this.$msg.error(res.exceptionDetails)
            }
          })
        }
      },
      getQuerySubject() {
        this.formItem.querySubjectArr = [];
        let url = Get_QueryObject + "/" + window.userId;
        this.$get(url).then((res) => {

          if(res.hasOwnProperty("code")){
            this.$msg.error("加载数据异常："+res.exceptionMsg);
            return;
          }

          this.total = res.total;
          if (res.length > 0) {
            for (let i = 0; i < res.length; i++) {
              this.formItem.querySubjectArr.push({
                label: res[i].keyWord,
                value: res[i].rid
              })
            }
          }
        }).catch((error) => {
          console.log("获取查询项接口报错：" + error)
        })
      },
    }
  }
</script>

<style scoped lang="scss" >
  @mixin background($img) {
    background-image: url('../assets/images/' +$img);
    background-position: center;
    background-repeat: no-repeat;
  }
  .flex{
    border-radius:5px;
  }
  .closeSide {
    width: 30px;
    height: 81px;
    position: absolute;
    left: 346px;
    top: 50%;
    transform: translateY(-40px);
    @include background('sidebtn.png');
    cursor: pointer;
    z-index: -1;
  }
  .iq-content .iq-wrap {
    margin-top: 10px;
  }
  #fuzzyHead {

    .sg-input-group-append {
      .searchbutton {
        background-color: #3b86e0;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      .sg-btn {
        color: #fff;
        font-weight: 900;
      }
    }
    .sg-input-group-prepend {
      background-color: #fff;
      display: none;
    }
    .sg-select {
      background-position: 8% 50%;
      background-image: url("../assets/images/selectIcons.png");
      background-repeat: no-repeat;
      background-origin: content-box;
    }
    .sg-select-single {
      .sg-select-selection {
        span {
          padding-left: 25px;
        }
      }
    }
    #searchselect {
      max-height: 400px;
      overflow: auto;
      width: 335px;
      margin-left: 0px;
      outline: none;
      border-left: 1px solid #dddee1;
      border-right: 1px solid #dddee1;
      border-bottom: 1px solid #dddee1;
      background: #fff;
      .placeName {
        line-height: 28px;
        overflow-y: scroll;
        font-size: 12px;
        li {
          background-position: 1% 50%;
          padding-left: 20px;
          background-size: 16px 15px;
          background-image: url("../assets/images/pointPosition.png");
          background-repeat: no-repeat;
        }
        li:hover {
          background-color: #dddee1;
        }
      }
    }
    .emptybutton {
      position: relative;
      left: 310px;
      z-index: 3;
      top: 30px;
      cursor: pointer;
    }
  }
  #fuzzyBody{
    border: 1px solid #dfdfdf;position: relative
  }
  .res_list{
    overflow-y: auto;
    width:330px;
    max-height: 400px;
    padding:0;
    margin:0 auto;
    box-sizing: border-box;
    border:1px solid #f0f0f0;
  .res_null{
    line-height: 57px;
    text-align:center;
  }
  li{
    height:60px;
    box-sizing: border-box;
    border-bottom:1px solid #dfdfdf;
    position: relative;
    color:#2e3334;
    font-size: 12px;
  .res_list_title{
    position: absolute;
    width:190px;
    height:12px;
    left:10px;
    top:15px;
    line-height: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .area{
    position: absolute;
    width:190px;
    height:12px;
    top:36px;
    left:10px;
    line-height: 12px;
  }
  .management{
    display: block;
    position: absolute;
    width:100px;
    height:12px;
    line-height: 12px;
    text-align: right;
    color:#3b86e0;
    top:36px;
    right:10px;
  }
  .collect{
    position: absolute;
    display: block;
    width: 16px;
    height:16px;
    top:10px;
    right:24px;
    background:url('../assets/images/star.png') no-repeat;
    cursor: pointer;

  }
  .onCollect{
    background:url('../assets/images/fullStar.png') no-repeat;
  }
  }
  li:last-child{
    border:none;
  }
  }
  /*.checkBox{*/
    /*margin-top: -15px;*/
    /*margin-left: 206px;*/
  /*}*/
  .fuzzySearchBtn{
    margin-left: 122px;
  }
  .fuzzy {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0 20px;
    margin-top: -10px;
  }

  ul {
    list-style: none;
    > li {
      line-height: 32px;
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
    height:520px;
    overflow:auto;
    overflow-x:hidden;
    border-right: 1px solid #a9a9a929;
    ul {
      > li {
        width:206px
      }
    }
  }
  /*.res-pane {*/
    /*background-color: #fff;*/
    /*z-index: 10000;*/
    /*position: fixed !important;*/
    /*// visibility: hidden;*/

    /*border:1px solid #e4e4e4;*/
    /*box-shadow: 0 2px 10px 0px rgba(0,0,0,0.2);*/

  /*}*/
</style>
