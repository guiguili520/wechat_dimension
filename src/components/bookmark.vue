<template>
  <div>
  <div class="item" :title="title" @click="showBookmark">
    <i class="fa fa-edit"></i>&nbsp;
    <span ref="bookmark">{{title}}</span>
  </div>
    <expand v-show="showPrint" :name="title">
      <template slot="head">
        <sg-form :rules="ruleValidate" ref="bookmarkform" :model="formItem" class="bookmarkHead"
                 style="text-align: center;" inline>
          <sg-form-item prop="name">
            <sg-input v-model="formItem.name" placeholder="请输入书签名称" style="width: 195px;"></sg-input>
          </sg-form-item>
          <sg-form-item>
            <sg-button @click="addBookmark()">新增</sg-button>
          </sg-form-item>
        </sg-form>
      </template>
      <template slot="list">
        <ul>
          <li v-for="item in listData" @click="findPosition(item.rid)">
            {{item.name}}
            <span style="float: right">
              <i class="esri-icon-trash" @click.stop="trashItem(item.rid)"></i>
            </span>

          </li>

        </ul>
      </template>
    </expand>
  </div>
</template>

<script>
  import expand from './common/expand'
  import bus from '../assets/eventBus';
  import {Get_BookMark,SaveUpdata_BookMark,Delete_BookMark} from '../config/api.js'
  import {formatDate} from '../assets/method.js'
  import {toolClass, toolsData} from "../config/config";

  export default {
    name: "SBookmark",
    data() {
      return {
        listData: [],
        extent: {},
        toolState:{},
        toolClass:{},
        showPrint:false,
        title:'',
        name:'',
        formItem: {
        },
        bookmark: null,
        ruleValidate: {
          name: [
            {required: true, message: '书签名称不能为空', trigger: 'blur'}
          ]
        }
      }
    },
    components: {
      expand
    },
    mounted() {
      this.getData();
      this.bookmark = new SgMap.Bookmarks()
      this.toolState=toolsData
      this.toolClass=toolClass
      let _this=this
    _this.toolState.bookmark=true;
      bus.$on("close",(name) => {
        _this.name=name
        if(_this.name==_this.$refs.bookmark.innerHTML)
        _this.showPrint=false
      });
      _this.ToolText();
    },
    methods: {
      getData(){
        this.listData = [];
        this.$get(Get_BookMark + userId).then((res)=>{
          if(res.length > 0){
            this.listData = res
          }
        }).catch((error) => {
          console.log("获取书签接口报错："+ error)
        })
      },
      trashItem(rid){
        this.$get(Delete_BookMark+rid).then((res)=>{
            this.getData()

        }).catch((error) => {
          console.log(error)
          this.getData()
        })
      },
      addBookmark() {
        this.$refs.bookmarkform.validate((valid) => {
          if (valid) {

            this.extent = this.bookmark.getExtent();
            let date = formatDate(new Date(),'-')

            let data = {
              "rid": "",
              "createTime": date,
              "createUser": userId,
              "descript": "",
              "extent": JSON.stringify(this.extent),
              "name":  this.formItem.name,
              "markType": "0",

            }
            this.$post(SaveUpdata_BookMark,data).then((res)=>{
              this.getData()
            }).catch((error) => {
              console.log("保存书签接口报错："+ error)
            })

            this.listData.push(this.singleData);
          }
        })
      },
      showBookmark() {
        this.showPrint = !this.showPrint
      },
      ToolText(){
        let config=window.roleToolkits;
        for (let i = 0; i <config.data.length ; i++) {
          let toolPath=JSON.stringify(config.data[i].toolPath)
          if(toolPath.indexOf('bookmark')!=-1){
            this.title=config.data[i].toolName
          }
        }
      },
      findPosition(rid) {
        for (let i = 0; i < this.listData.length; i++) {
          if (rid === this.listData[i].rid) {
            this.extent = this.listData[i].extent;
          }
        }
        if(typeof(this.extent)=='string') {
          this.extent = JSON.parse(this.extent)
        }
        this.bookmark.position(this.extent)
      }
    }
  }
</script>

<style lang="scss">
  .book-head {
    background-color: #f4f5f6;
    margin-bottom: 20px;
    padding: 15px 0;
    .sg-form-item {
      margin-bottom: 0;
    }
  }
  .bm{
    position: absolute;
    white-space: nowrap;
    margin: 0px;
    padding:0px;
    bottom:4px;
    font-size:0.8em;
  }

  .bmBtn{
    margin-bottom: 15px;
    font-size: 20px;
  }
  .bookmark{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);z-index:100;width:50px;
    height:50px;
  }
  .expandDialog {
    width: 325px;
    z-index: 100;
    position:fixed;
    right: 210px !important;
  }
</style>
