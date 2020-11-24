<template>
  <div>
    <div class="item" :title="title" @click="showLabels">
      <i class="fa fa-tags"></i>&nbsp;
      <span ref="showLabels">{{title}}</span>
    </div>
    <expand v-show="showPrint" :name="title">
      <template slot="head">

        <div class="flex" style="margin-bottom: 10px" id="labelSketch">
          <!--<div class="esri-icon-blank-map-pin action-button esri-widget--button" :id="drawId+'_point'"-->
               <!--title="点标注"></div>-->
          <!--<div class="esri-icon-polyline action-button esri-widget--button" :id="drawId+'_polyline'"-->
               <!--title="线标注"></div>-->
          <!--<div class="esri-icon-polygon action-button esri-widget--button" :id="drawId+'_polygon'"-->
               <!--title="面标注"></div>-->
        </div>
        <!--<sg-button @click="init" style="margin-bottom: 15px;">添加标注</sg-button>-->
      </template>

      <template slot="list">
        <ul>
          <li @click="findPosition(item.rid)" class="flex" v-for="item in listData" >
            <p class="flex-item" >
              名称：{{item.name}}
            </p>
            <p>
              内容：{{item.descript}}
            </p>
            <span style="float: right">
            <!--<i class="esri-icon-edit" style="margin-right: 10px;" @click="editItem"></i>-->
            <i class="esri-icon-trash" @click.stop="trashItem(item.rid)" style="margin-left: 10px"></i>
          </span>
          </li>
        </ul>
      </template>
    </expand>
    <sg-modal v-model="labelPanelVisible" :mask-closable="false" title="保存" :closable="false" @on-ok="addLabel()" :width="330" style="z-index: 9999">
      <sg-form :model="formItem" ::label-width="50" class="labelHead" style="text-align: center;">
        <sg-form-item :label-width="70" label="名称">
          <sg-input v-model="labelName" placeholder="请输入标注名称" style="width: 200px"></sg-input>
        </sg-form-item>
        <sg-form-item :label-width="70" label="内容" style="text-align: center;">
          <sg-input v-model="labelContent" placeholder="请输入标注内容" style="width: 200px"></sg-input>
        </sg-form-item>
      </sg-form>
    </sg-modal>
  </div>
</template>

<script>
  import {Get_Label, SaveUpdata_BookMark, Delete_BookMark} from '../config/api.js'
  // import {modal} from "southgisui"
  import expand from './common/expand'
  import {toolClass, toolsData} from "../config/config";
  import bus from '../assets/eventBus';


  export default {
    name: "SLabel",
    data() {
      return {
        drawId:"label",
        result: '',
        labelName: "",
        addName: "",
        labelPanelVisible: false,
        listData: [],
        formItem: {},
        labelContent: "",
        // url: CoreData,
        label: null,
        geometry:{},
        toolClass:{},
        toolState:{},
        showPrint:false,
        title:'',
        name:''
      }
    },
    components: {expand},
    mounted() {
      this.label = new SgMap.Label();
      this.toolClass=toolClass;
      this.toolState=toolsData;
      this.getData();
      this.sketchWidget = new SgMap.Sketch("labelSketch");
      bus.$on("close",(name) => {
        this.name=name
        console.log(this.name)
        if(this.name==this.$refs.showLabels.innerHTML)
          this.showPrint=false
      });
      this.ToolText();
      this.sketchWidget.event.on({
        'sketchComplete': (res) => {
              this.geometry = res;
              this.labelName = "";
              this.labelContent = "";
              this.labelPanelVisible = true;
        }
      })
      // this.polygon = new SgMap.Draw(this.drawId+'_polygon', 'polygon')
      // this.polygon.event.on({
      //   'drawComplete': (res) => {
      //     this.geometry = res;
      //     this.labelName = "";
      //     this.labelContent = "";
      //     this.labelPanelVisible = true;
      //
      //   }
      // })
      // this.point = new SgMap.Draw(this.drawId+'_point', 'point')
      // this.point.event.on({
      //   'drawComplete': (res) => {
      //     this.geometry = res;
      //     this.labelName = "";
      //     this.labelContent = "";
      //     this.labelPanelVisible = true;
      //
      //   }
      // })
      // this.polyline = new SgMap.Draw(this.drawId+'_polyline', 'polyline')
      // this.polyline.event.on({
      //   'drawComplete': (res) => {
      //
      //     this.geometry = res;
      //     this.labelName = "";
      //     this.labelContent = "";
      //     this.labelPanelVisible = true;
      //   }
      // })


    },
    methods: {
      getData() {
        this.listData = [];
        this.$get(Get_Label + userId).then((res) => {
          if (res.code == "-1") {

            this.$msg(res.exceptionMsg)
          } else {
            this.result = res;
            if (res.length > 0) {
              res.map((item) => {
                this.listData.push({
                  name: item.name,
                  descript: item.descript,
                  rid: item.rid
                })
              });

            }
          }

        }).catch((error) => {
          console.log("获取标注接口报错：" + error)
        })
      },
      trashItem(rid) {
        this.$get(Delete_BookMark + rid).then((res) => {
          this.getData();
        }).catch((error) => {
          // console.log(error)
          //  this.getData();
        })

      },
      init() {
        this.label.active();
      },
      showLabels(){
        this.showPrint = !this.showPrint
      },
      addLabel() {
        this.label.label(this.geometry, this.labelName);
        this.addLabelMethod(this.geometry);
        this.labelPanelVisible = false;
      },
      ToolText(){
        let config=window.roleToolkits;
        for (let i = 0; i <config.data.length ; i++) {
          let toolPath=JSON.stringify(config.data[i].toolPath)
          if(toolPath.indexOf('label')!=-1){
            this.title=config.data[i].toolName
          }
        }
      },
      findPosition(rid) {
        let geo;
        let text;
        for (let i = 0; i < this.result.length; i++) {
          if (this.result[i].rid == rid) {
            geo = JSON.parse(this.result[i].extent)
            text = this.result[i].name;
          }
        }
        this.label.position(geo, text);
      },
      addLabelMethod(geo) {
        let extent
        let userId = window.userId
        if(geo.type=="polygon"){
          let centroid = geo.centroid
          extent = {
            "centroid": {
              "x": centroid.x,
              "y": centroid.y,
              "spatialReference": centroid.spatialReference,
              "type": centroid.type
            },
            "rings": geo.rings,
            "spatialReference": geo.spatialReference,
            "type": geo.type
          }
        }else if(geo.type=="polyline"){
          extent = {
            "paths": geo.paths,
            "spatialReference": geo.spatialReference,
            "type": geo.type
          }
        }else if(geo.type=="point"){
          extent = {
            "x": geo.x,
            "y":geo.y,
            "spatialReference": geo.spatialReference,
            "type": geo.type
          }
        }


        let param = {
          rid: "",
          createTime: "",
          createUser:userId,
          descript: this.labelContent,
          extent: JSON.stringify(extent),
          name: this.labelName,
          markType: "1"
        }

        this.$post(SaveUpdata_BookMark, param).then((res) => {

          if (res.code == "-1") {
            // this.$msg.error(res.exceptionMsg)
            this.$msg.error({
              content: res.exceptionMsg,
              duration: 10,
              closable: true
            });
          } else {
            this.getData();
          }


        }).catch((error) => {
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .labelPanel {
    background: #fff;
    padding: 10px;
    position: fixed;
    top: 290px;
    right: 75px;
  }

  #labelTool {
    background: #fff;
    position: fixed;
    top: 270px;
    right: 15px;
  }

  .action-button {
    font-size: 16px;
    background-color: transparent;
    border: 1px solid #D3D3D3;
    color: #6e6e6e;
    height: 32px;
    width: 32px;
    text-align: center;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
  }

  .action-button:hover,
  .action-button:focus {
    background: #0079c1;
    color: #e4e4e4;
  }

  .active {
    background: #0079c1;
    color: #e4e4e4;
  }
  .labels{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);z-index:100;width:50px;
    height:50px;
  }
  .title{
    position: absolute;
    white-space: nowrap;
    margin: 0px;
    padding:0px;
    bottom:4px;
    font-size:0.5em;
  }

  .btn{
    margin-bottom: 15px;
    font-size: 20px;
  }
</style>
