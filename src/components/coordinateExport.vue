//坐标输出
<template>
  <div>
  <div class="item" :title="title" @click="showCoordinate">
    <i class="fa fa-pencil"></i>&nbsp;
    <span ref="coordinate">{{title}}</span>
  </div>
  <expand v-show="showPrint" :name="title">
    <template slot="head">
      <div class="flex draw" id="coordinateExportSketch">
<!--                <div class="action-button esri-icon-polygon esri-widget--button" id="polygon_tool"-->
<!--                    title="面"></div>-->
<!--                <div class="action-button esri-icon-checkbox-unchecked esri-widget--button" id="rectangle_tool"-->
<!--                    title="矩形"></div>-->
        <div class="esri-sketch__button esri-icon-authorize clickBtn" @click="identifySingleStart" title="图上点选"
             :style="{'backgroundColor':bgColor,'color':color}"></div>
      </div>


    </template>
    <template slot="list">
            <div class="inputvalue">
                <textarea v-model="formItem.coordinates"  placeholder="输出坐标" rows="10" cols="38"></textarea>
            </div>
            <div class="coordinate-button" v-if="formItem.coordinates!=''">
                <sg-button @click="exportCoordinates()" >导出坐标</sg-button>
                <sg-button type="primary" @click="clearData()" >清除结果</sg-button>
            </div>
    </template>
  </expand>
  </div>
</template>

<script>
 import expand from './common/expand'
 import {exportCoordinate} from '../config/api.js'
 import bus from '../assets/eventBus';
 import {toolsData,toolClass} from "../config/config";

    export default {
      name: "SCoordinate",
      components: {expand},
      data() {
        return {
          formItem: {
            coordinates: '',
          },
          polygon: {},
          rectangle: {},
          circle: {},
          listData: [1],
          toolState: {},
          toolClass: {},
          showPrint: false,
          title: '',
          name: '',
          geometry: {},
          bgColor: "",
          color: "",
        }
      },
      mounted() {
        new SgMap.Coordinate();
        this.identifyTask = new SgMap.Identify();
        this.toolState = toolsData;
        this.toolClass = toolClass;
        this.sketchWidget = new SgMap.Sketch("coordinateExportSketch");
        bus.$on("close", (name) => {
          this.name = name
          console.log(this.name)
          if (this.name == this.$refs.coordinate.innerHTML)
            this.showPrint = false
        });
        this.sketchWidget.event.on({
          'sketchComplete': (res) => {
            console.log(res)
            this.getcoordinate(res)
          }
        })

        this.ToolText();
        bus.$on('getGraphic', (res) => {
          this.geometry = res.geometry;
          this.getcoordinate(this.geometry);
          this.bgColor = "#fff";
          this.color = "#4c4c4c";
        })

        //     this.polygon = new SgMap.Draw('polygon_tool', 'polygon')
        //     this.polygon.event.on({
        //   'drawComplete': (res) => {
        //     console.log(res)
        //     this.geometry = res;
        //     this.getcoordinate(res)
        //   }
        // })
        //  this.rectangle = new SgMap.Draw('rectangle_tool', 'rectangle')
        //  this.rectangle.event.on({
        //   'drawComplete': (res) => {
        //     console.log(res)
        //     this.geometry = res;
        //     this.getcoordinate(res)
        //
        //   }
        // })
        //  this.circle = new SgMap.Draw('circle_tool', 'circle')
        //  this.circle.event.on({
        //   'drawComplete': (res) => {
        //     console.log(res)
        //     this.geometry = res;
        //     this.getcoordinate(res)
        //   }
        // })
      },
      methods: {

        identifySingleStart() {
          this.identifyTask.singleActive(1);
          this.bgColor = "#4c4c4c";
          this.color = "#fff";
        },

        getcoordinate(res) {
          this.formItem.coordinates = [];
          if (res.type == "polygon") {
            let rings = res.rings[0];
            let tempstr = [];
            for (let i = 0; i < rings.length; i++)
              tempstr.push(rings[i][0].toFixed(3) + "," + rings[i][1].toFixed(3));
            this.formItem.coordinates = tempstr.join("\r\n");
          } else if (res.type == "polyline") {
            let paths = res.paths[0];
            let tempstr = [];
            for (let i = 0; i < paths.length; i++)
              tempstr.push(paths[i][0].toFixed(3) + "," + paths[i][1].toFixed(3));
            this.formItem.coordinates = tempstr.join("\r\n");
          } else if (res.type == "point") {
            this.formItem.coordinates = res.x.toFixed(3) + "," + res.y.toFixed(3);
          }
        },

        exportCoordinates() {
          let data = {text: this.formItem.coordinates};
          let exportUrl = exportCoordinate;
          this.usePostMethodExportFile(data, exportUrl);
        },

        usePostMethodExportFile(params, url) {  //params是post请求需要的参数，url是请求url地址
          let form = document.createElement("form");
          form.style.display = 'none';
          form.action = url;
          form.method = "POST";
          form.acceptCharset = "UTF-8";
          document.body.appendChild(form);
          for (let key in params) {
            var input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
          }
          form.submit();
          form.remove();
        },

        showCoordinate() {
          this.showPrint = !this.showPrint
        },

        ToolText() {
          let config = window.roleToolkits;
          for (let i = 0; i < config.data.length; i++) {
            let toolPath = JSON.stringify(config.data[i].toolPath)
            if (toolPath.indexOf('coordinate') != -1) {
              this.title = config.data[i].toolName
            }
          }
        },
        clearData() {
          this.formItem.coordinates = [];
          g_drawLayer.removeAll();
        }
      }
    }
</script>

<style scoped lang="scss">
  .inputvalue{
    margin-left: 16px;
    textarea{
        border:none;
        outline:none;
        resize:none;
        margin-top:10px;
    }
  }
  .coordinate-button {
    padding: 10px 15px;
    text-align: center;
    .sg-btn {
      margin: 5px;
    }
  }
  .coordinate{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);z-index:100;width:50px;
    height:50px;
  }
.clickBtn {
  position: absolute;
  margin-left: 181px;
  margin-top:6px;
  transition: all 0.2s;
}
</style>
