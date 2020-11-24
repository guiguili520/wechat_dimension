<template>
    <div>
      <div class="item" @click="active" :title="title" id="polylineHdmQueryButton">
        <i class="fa fa-edit"></i>&nbsp;
        <span>{{title}}</span>
      </div>

      <s-respane v-show="resultPanelIsShow" name="分析结果列表" @pane-close="closePane" :w="920" :h="450" :x="400" :y="10" :exportReport="true" style="z-index: 1999">
        <div>
          <div style="text-align: center;margin-bottom: 0px">
            <label>道路横断面视图</label>
          </div>
          <div style="text-align: right;margin-bottom: 5px">
            <sg-button @click="exportHdm()" type="primary" style="padding:8px">截图</sg-button>
          </div>
          <div style="margin: 0 auto;width:900px;">
            <canvas id="myCanvas" width="880" height="280" style="background-color: white;border:1px solid black">
              您的浏览器不支持画布功能！
            </canvas>
          </div>
        </div>
      </s-respane>
    </div>
</template>

<script>
  import Draw from "../../classic/common/Draw";
  import {loadModules} from "esri-loader";
  import {options} from "../../config";
  import {toolClass, toolsData} from "../../config/config";
  import SRespane from '@/components/common/resultPanel'
  import bus from '@/assets/eventBus';

    export default {
      name: "hdmQuery",
      components: {SRespane},
      data() {
        return {
          geometryEngine:null,
          Graphic:null,
          promiseUtils:null,
          QueryTask:null,
          Query:null,
          drawedLine:null,
          funcConfigs:[],
          startPoint:null,
          clipResults:[],
          resultPanelIsShow:false,
          title:"",
          drawTool:null,
        }
      },

      mounted() {
        if(!g_MapConfig.toolsConfig.hdmQuery){
          console.log("缺少快速查询功能相关配置。功能标识：hdmQuery");
          return;
        }
        this.toolState=toolsData;
        this.toolClass=toolClass;
        this.funcConfigs = g_MapConfig.toolsConfig.hdmQuery;

        loadModules(
          [
            "esri/geometry/geometryEngine",
            "esri/Graphic",
            "esri/geometry/Point",
            "esri/core/promiseUtils",
            "esri/tasks/QueryTask",
            "esri/tasks/support/Query"
          ],
          options
        ).then(([geometryEngine, Graphic,Point,promiseUtils,QueryTask,Query]) => {
          this.geometryEngine = geometryEngine;
          this.Graphic = Graphic;
          this.Point = Point;
          this.promiseUtils = promiseUtils;
          this.QueryTask = QueryTask;
          this.Query = Query;
          this.initDraw();
        });
        this.ToolText();
      },

      methods: {
        active() {
          this.drawTool.sketchVM.create('polyline');
        },

        //初始化绘图工具
        initDraw() {
          this.drawTool = new Draw('polylineHdmQueryButton', 'polyline');
          this.drawTool.event.on({
            'drawComplete': (res) => {
              this.drawedLine = res.geometry;
              let xyPoint = res.geometry.paths[0][0];
              this.startPoint = new this.Point({
                x: xyPoint[0],
                y: xyPoint[1],
                spatialReference: res.geometry.spatialReference
              });
              console.log(this.startPoint)
              this.compute(this.drawedLine);
            }
          });
        },

        //工具文本
        ToolText() {
          let config = window.roleToolkits;
          for (let i = 0; i < config.data.length; i++) {
            let toolPath = JSON.stringify(config.data[i].toolPath)
            if (toolPath.indexOf('hdmQuery') != -1) {
              this.title = config.data[i].toolName;
              break;
            }
          }
        },

        //循环计算
        compute(geo) {
          bus.$emit('setLoad', {
            statue: true,
            msg: '分析中...'
          });

          this.clipResults = [];
          this.clearCanvas();
          let allPromises = [];
          for (let i = 0; i < this.funcConfigs.length; i++) {
            let url = this.funcConfigs[i].url;
            let queryTask = new this.QueryTask({
              url: url
            });
            let query = new this.Query();
            query.returnGeometry = true;
            query.outFields = ["*"];
            query.geometry = geo;
            let promise = queryTask.execute(query);
            allPromises.push(promise);
          }
          let that = this;
          this.promiseUtils.eachAlways(allPromises).then(eachAlwaysResults => {
            let searchResults = [];
            eachAlwaysResults.forEach(function (result) {
              if (result.error) {
                console.log(result.error, '查询错误');
              } else {
                searchResults.push(result.value);
              }
            });
            if (searchResults.length > 0) {
              that.drawHDMCanvas(searchResults)
            } else {
              bus.$emit('setLoad', {
                statue: false,
                msg: '分析中...'
              });
              this.$msg.error("查询失败，无法进行横断面分析！");
            }
          });
        },

        //绘制横断面
        drawHDMCanvas(searchResults) {
          for (let i = 0; i < searchResults.length; i++) {
            let featureSet = searchResults[i].features;
            if (featureSet != null && featureSet.length > 0) {
              let myConfig = this.funcConfigs[i];
              for (let j = 0; j < featureSet.length; j++) {
                let gra = featureSet[j];
                let currentDistance = this.geometryEngine.distance(this.startPoint, gra.geometry, 'meters');
                currentDistance = Math.round(currentDistance*10)/10;
                let lengthNum = 0;
                let insect = this.geometryEngine.intersect(this.drawedLine, gra.geometry);
                if (insect != null) {
                  lengthNum = this.geometryEngine.planarLength(insect, 'meters');
                  lengthNum = Math.round(lengthNum*10)/10;
                }
                let displayField = myConfig.field;
                let value = "";
                if (displayField != undefined)
                  value = gra.attributes[displayField];
                else
                  value = myConfig.title;
                this.clipResults.push({name: value, width: lengthNum, startDitance: currentDistance});
              }
            }
          }
          this.clipResults.sort(this.compare("startDitance"));
          this.dealSortedResult();
          this.resultPanelIsShow = true;
          console.log(this.clipResults,'横断面分析结果');
          this.drawHDMLine();

          bus.$emit('setLoad', {
            statue: false,
            msg: '分析中...'
          });
        },

        dealSortedResult() {
          let clipDistance = 0;
          for (let i = 0; i < this.clipResults.length; i++) {
            let temp = this.clipResults[i];
            if (temp.width != 0) {
              clipDistance = temp.startDitance;
              break;
            }
          }
          for (let i = 0; i < this.clipResults.length; i++) {
            let temp = this.clipResults[i];
            temp.startDitance = Math.round(temp.startDitance - clipDistance);
          }
        },

        drawHDMLine() {
          let c = document.getElementById("myCanvas");
          let ctx = c.getContext("2d");
          ctx.font = "13px bold 黑体";
          //绘制整条横线
          ctx.beginPath();
          ctx.moveTo(10, 200);
          ctx.lineTo(860, 200);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#F5270B";
          ctx.stroke();
          this.drawTypes(ctx);
        },

        //循环绘制
        drawTypes(ctx) {
          let last = this.clipResults[this.clipResults.length - 1];
          let maxDistance = last.startDitance + last.width;
          let preInfo = null;
          for (let i = 0; i < this.clipResults.length; i++) {
            let temp = this.clipResults[i];
            let tempDistance = temp.startDitance;
            let x = (tempDistance / maxDistance) * 850;
            let y = 170;
            let endY = 200;
            if (x == 0)
              x = 10;
            if (temp.width == 0) {
              ctx.strokeStyle = "#0D25F6";
              endY = 200;
            }
            else {
              ctx.strokeStyle = "#FF00FF";
              endY = 200;
            }
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, endY);
            ctx.stroke();
            let textContent = temp.name;
            this.vShowText(textContent, x - 5, 60, ctx);
            this.hShowText(preInfo,temp,ctx,maxDistance);
            preInfo = temp;
          }
          this.hShowLastText(preInfo,maxDistance,ctx);
        },

        hShowLastText(info,maxDistance,ctx){
          let textContent= info.width;
          let currentDistance = info.startDitance;
          let x = (currentDistance/maxDistance)*850 +5;
          let y = 185;
          ctx.font = "12px bold 黑体";
          ctx.fillText(textContent, x, y);
        },

        //横向文字
        hShowText(preInfo,temp,ctx,maxDistance){
          if(preInfo == null || temp == null || temp.startDitance <=0)
            return;

          let currentDistance = preInfo.startDitance;
          let textContent= temp.startDitance - preInfo.startDitance;
          let tempTotal = (textContent / maxDistance) * 850;
          let x = (currentDistance/maxDistance)*850;
          let textLength = ctx.measureText(textContent+"").width;
          x = (tempTotal-textLength)/2 + x;
          let y = 185;
          ctx.font = "12px bold 黑体";
          ctx.fillText(textContent, x, y);
        },

        //竖排文字
        vShowText(textContent, x, y, ctx) {
          let letterSpacing = 0; // 设置字间距
          ctx.font = "15px bold 黑体";
          for (let i = 0; i < textContent.length; i++) {
            let str = textContent.slice(i, i + 1).toString();
            if (str.match(/[A-Za-z0-9]/) && (y < 576)) { // 非汉字 旋转
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(Math.PI / 180 * 90);
              ctx.textBaseline = 'bottom';
              ctx.fillText(str, 0, 0);
              ctx.restore();
              y += ctx.measureText(str).width + letterSpacing; // 计算文字宽度
            } else if (str.match(/[\u4E00-\u9FA5]/) && (y < 576)) {
              ctx.save();
              ctx.textBaseline = 'top';
              ctx.fillText(str, x, y);
              ctx.restore();
              y += ctx.measureText(str).width + letterSpacing; // 计算文字宽度
            }
          }
        },

        //排序比较
        compare(property) {
          return function (a, b) {
            let v1 = a[property];
            let v2 = b[property];
            return v1 - v2;
          };
        },

        //清空画布
        clearCanvas() {
          let c = document.getElementById("myCanvas");
          let cxt = c.getContext("2d");
          cxt.clearRect(0, 0, c.width, c.height);
        },

        closePane() {
          this.resultPanelIsShow = !this.resultPanelIsShow;
          this.drawTool.clear();
          this.clipResults = [];
          this.clearCanvas();
        },

        exportHdm() {
          let canvas = document.getElementById("myCanvas");
          this.imgmap = canvas.toDataURL('image/png')
          if (window.navigator.msSaveOrOpenBlob) {
            let bstr = atob(this.imgmap.split(',')[1])
            let n = bstr.length
            let u8arr = new Uint8Array(n)
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n)
            }
            let blob = new Blob([u8arr])
            window.navigator.msSaveOrOpenBlob(blob, 'chart-download' + '.' + 'png')
          } else {
            // 这里就按照chrome等新版浏览器来处理
            const a = document.createElement('a')
            a.href = this.imgmap
            a.setAttribute('download', '导出图片')
            a.click()
          }
        },
      }
    }
</script>

<style lang="scss">

</style>
