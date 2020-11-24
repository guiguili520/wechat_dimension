<template>
  <div>
    <!--默认打印-->
    <div class="item" @click="Print" ref="printExpand" :title="title">
      <i class="fa fa-print"></i>
      <span ref="printExtend" >{{title}}</span>
    </div>
<!--    <div ref="print" v-drag style=" position: fixed;top: 50px;right: 210px;width:325px;-->
<!--    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3)" v-show="showPrint"></div>-->
<!--    &lt;!&ndash;默认打印&ndash;&gt;-->
<!--    <div class="collapse">-->
<!--      <sg-icon type="icon-close"></sg-icon>-->
<!--    </div>-->
<!--  </div>-->
    <div  v-drag class="expandDialog" style="position: fixed;top: 50px;right: 210px;" v-show="showPrint">
      <div class="header flex">
        <p class="flex-item">{{title}}</p>
          <div class="col" @click="Print">
          <sg-icon type="icon-close"></sg-icon>
          </div>
      </div>
      <div class="dialog-wrap" ref="print">
      </div>
    </div>
    </div>
</template>
<script>
  import {toolClass, toolsData} from "../config/config";
  import {loadModules} from "esri-loader";
  import {options} from "../config";
  import expand from "../components/common/expand"
  import bus from '../assets/eventBus';

  export default {
    name: "printExpand",
    components:{
      expand
    },
    data(){
      return{
        toolState:{},
        toolClass:{},
        showPrint:false,
        printExpand:{},
        print:'',
        title:'',
        exportUrl:"",
        name:'',
      }
    },
    mounted() {
      this.toolState=toolsData
      this.toolClass=toolClass
      bus.$on("close",(name) => {
        this.name=name
        if(this.name==this.$refs.printExtend.innerHTML)
          this.showPrint=false
      });
      this.exportUrl=g_MapConfig.baseConfig.webgisPrint;
      console.log(toolClass.system)
      this.ToolText();
      this.constructor(this.exportUrl,this.toolState);
    },
    methods:{
      ToolText(){
        let config=window.roleToolkits;
        for (let i = 0; i <config.data.length ; i++) {
          let toolPath=JSON.stringify(config.data[i].toolPath)
          if(toolPath.indexOf('printExpand')!=-1){
            this.title=config.data[i].toolName;
          }
        }
      },
        constructor(exportUrl,toolsData={}) {
          loadModules(
            [
              "esri/widgets/Print",
              "esri/widgets/Expand",
            ],
            options
          ).then(([ Print,Expand]) => {
            console.log(window.addMode)
            if (window.addMode == "homeMap" || window.addMode == "businessInteraction") {
              return
            }
            if (toolsData.printExpand) {
              //创建打印
              this.print = new Print({
                container:this.$refs.print,
                view: g_view,
                printServiceUrl: exportUrl,
              });
              //右侧打印按钮
              //this.printExpand = new Expand({
               // container:this.$refs.printExpand,
               // view: g_view,
                //content: this.print,
              //});
            }
          })
      },
      Print(){
      this.showPrint=!this.showPrint
      }
    },
  }
</script>

<style lang="scss" scoped>
  .book-head {
    background-color: #f4f5f6;
    margin-bottom: 20px;
    padding: 15px 0;
    .sg-form-item {
      margin-bottom: 0;
    }
  }
  .title{
    position: absolute;
    white-space: nowrap;
    margin: 0px;
    padding:0px;
    bottom:4px;
    line-height: 10px;
    float: bottom;
    z-index: 100;
    font-size:0.5em;
  }

  .peBtn{
    position: absolute;
    font-size: 20px;
    width: 32px;
    height: 32px;
    margin-bottom: 15px;
    z-index: 100;
    background-color: inherit;
  }
  .printExpand{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);z-index:100;width:50px;
    height:50px;
  }
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

  .empty {
    text-align: center;
    line-height: 100px;
    color: #444;
  }

  .dialog-wrap {
    padding: 20px 10px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-top: none;
    max-height: 480px;
    overflow: auto;
  }
</style>
