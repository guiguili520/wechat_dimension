<template>
  <div>
    <!--全屏-->
    <div class=" esri-widget--button  fullscreen esri-icon" ref="fullscreen" :style="{top:topheight+'px'}">
    </div>
    <!--全屏 -->
  </div>
</template>

<script>
  import {toolClass, toolsData} from "../config/config";
  import {loadModules} from "esri-loader";
  import {options} from "../config";

    export default {
        name: "fullscreen",
      data(){
        return{
          toolState:{},
          toolClass:{},
          fullscreen:{},
          title:'',
          topheight:0
        }
      },
      mounted() {
        this.toolState=toolsData;
        if(toolsData.tools){
          let newToolclass=["","",""];
          let oldToolClass=toolClass.custom;
          let defaultTools=["fullscreen","identify","clear"]
            for(var i in oldToolClass){
              if(defaultTools.indexOf(oldToolClass[i])>-1){
                newToolclass.push(oldToolClass[i]);
              }
            }
          this.toolClass.custom=newToolclass
        }else{
          let newToolclass=[];
          let oldToolClass=toolClass.custom;
          let defaultTools=["fullscreen","identify","clear"]
            for(var i in oldToolClass){
              if(defaultTools.indexOf(oldToolClass[i])>-1){
                newToolclass.push(oldToolClass[i]);
              }
            }
          this.toolClass.custom=newToolclass
        }
        this.toolClass.system=toolClass.system;
        this.topheight=this.toolClass.custom.indexOf("fullscreen")>-1?28+(this.toolClass.custom.indexOf("fullscreen"))*32+(5*this.toolClass.custom.indexOf("fullscreen")):-999;
        //this.toolClass=toolClass;
        this.ToolText();
        console.log(toolClass.system)
        loadModules(
          [
            "esri/widgets/Fullscreen"
          ],
          options
        ).then(([Fullscreen]) => {
          this.fullscreen = new Fullscreen({
            view: g_view,
            container:this.$refs.fullscreen,
          });
        })
      },
      methods:{
        ToolText(){
          let config=window.roleToolkits;
          for (let i = 0; i <config.data.length ; i++) {
            let toolPath=JSON.stringify(config.data[i].toolPath)
            if(toolPath.indexOf('fullscreen')!=-1){
              this.title=config.data[i].toolName
            }
          }
        },
      },
    }
</script>

<style lang="scss">
  .fullscreen{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);z-index:100;width:32px;
    height:32px;
  }
</style>
