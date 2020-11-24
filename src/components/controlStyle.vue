<template>
  <div>
    <div class="flex">
      <span style="vertical-align: middle;text-align: center;margin:0px 0px 10px 0px">选择需要编辑样式的图形：</span>
      <div id="rectangle-button" class="esri-widget esri-widget--button esri-interactive" title="选择图形"
           style="border-bottom:1px solid grey;vertical-align: middle;text-align: center;margin-top: -10px">
        <span class="esri-icon-checkbox-unchecked"></span>
      </div>
    </div>

    <sg-tab style="padding:10px 0px 10px 0px" :value="tabIndexName" v-on:on-click="changeTabIndex">
      <sg-tab-pane label="面样式" name="name1">
        <div>
          <div style="margin:8px 5px">
            <span class="labelStyle">填充样式:</span>
            <select id="selector" v-model="fillstyle" style="margin-left:5px;width:200px;height:28px" @change="Selector">
              <option value="backward-diagonal">左斜线</option>
              <option value ="cross">十字网格</option>
              <option value="diagonal-cross">倾斜网格</option>
              <option value="forward-diagonal">右斜线</option>
              <option value="horizontal">横向线</option>
              <option value="none">无</option>
              <option value="solid">全填充</option>
              <option value="vertical">纵向线</option>
            </select>
          </div>
          <div style="margin:20px 5px 8px 5px; vertical-align: center; text-align: center" class="flex">
            <span class="labelStyle" style="text-align: center;margin-top: 14px;margin-left: -5px">填充颜色:</span>
            <Slider v-model="colors" style="width:200px" @input="updateFillColor"/>
          </div>
          <div style="margin:30px 5px 0px 0px" class="flex">
            <span class="labelStyle">边线宽度:</span>
            <sliderstyle :min=0 :max=10 :value=1 style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updatePolygonLineWidth"/>
          </div>
          <div style="margin:5px 5px 0px 5px;vertical-align: center; text-align: center" class="flex">
            <span class="labelStyle" style="margin-top: 13px;margin-left: -5px">边线颜色:</span>
            <Slider v-model="lineColors" style="width:200px" @input="updatePolygonLineColor"/>
          </div>
          <div style="margin:30px 5px 0px 5px" class="flex">
            <span class="labelStyle">透明度:</span>
            <sliderstyle :min=0 :max=100 :value=100 style="width:200px;margin-top:5px" v-on:onValueChangeEvent="fillOpacity"/>
          </div>
        </div>

      </sg-tab-pane>

      <sg-tab-pane label="线样式" name="name2">
        <div>
          <div style="margin:8px 5px" class="flex">
            <span class="labelStyle">边线样式:</span>
            <select id="lineStyleSelector" v-model="linestyle" style="margin-left:5px;width:200px;height:28px" @change="updateLineStyle">
              <option value="dash">断线</option>
              <option value="dash-dot">断线-点</option>
              <option value="dot">点</option>
              <option value="long-dash">长断线</option>
              <option value="long-dash-dot">长断线-点</option>
              <option value="long-dash-dot-dot">长断线-点-点</option>
              <option value="none">无</option>
              <option value="short-dash">短断线</option>
              <option value="short-dash-dot">短断线-点</option>
              <option value="short-dash-dot-dot">断线-点-点</option>
              <option value="short-dot">短点</option>
              <option value="solid">全填充</option>
            </select>
          </div>

          <div style="margin:20px 5px 8px 5px" class="flex">
            <span class="labelStyle" style="margin-top: 15px">边线颜色:</span>
            <Slider v-model="lineColors" style="width:200px" @input="updateLineColor"/>
          </div>
          <div style="margin:30px 5px 8px 5px"  class="flex">
            <span class="labelStyle">边线宽度:</span>
            <sliderstyle :min=0 :max=10 :value=1 style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updateLineWidth"/>
          </div>
          <div style="margin:20px 5px 8px 5px" class="flex">
            <span class="labelStyle">透明度:</span>
            <sliderstyle :min=0 :max=100 :value=100   style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updateLineOpacity"/>
          </div>

        </div>
      </sg-tab-pane>

      <sg-tab-pane label="点样式" name="name3">
        <div>
          <div style="margin:8px 5px" class="flex">
            <span class="labelStyle">样式:</span>
            <select id="pointStyleSelector" style="margin-left:5px;width:200px;height:28px" v-model="pointstyle" @change="updatePointStyle">
              <option value="circle">圆形</option>
              <option value="cross">十字形</option>
              <option value="diamond">棱形</option>
              <option value="square">方形</option>
              <option value="triangle">三角形</option>
              <option value="x">X形</option>
            </select>
          </div>

          <div style="margin:20px 5px 8px 5px" class="flex">
            <span class="labelStyle" style="margin-top: 15px">颜色:</span>
            <Slider v-model="lineColors" style="width:200px" @input="updatePointColor"/>
          </div>

          <div style="margin:30px 5px 8px 5px"  class="flex">
            <span class="labelStyle">大小:</span>
            <sliderstyle :min=0 :max=50 :value=10   style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updatePointSize"/>
          </div>
          <div style="margin:8px 5px" class="flex">
            <span class="labelStyle">透明度:</span>
            <sliderstyle :min=0 :max=100 :value=100   style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updatePointOpacity"/>
          </div>
          <div style="margin:8px 5px" class="flex">
            <span class="labelStyle">角度:</span>
            <sliderstyle :min=0 :max=360 :value=0   style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updatePointAngle"/>
          </div>

        </div>
      </sg-tab-pane>

      <sg-tab-pane label="文本标绘" name="name4">
        <div>
          <div class="flex" style="vertical-align: center;margin:8px 5px">
              <span class="labelStyle">文本内容:</span>
              <sg-input placeholder="请输入信息" v-model="textContent" style="width:200px;height:20px"></sg-input>
          </div>
          <div class="flex" style="vertical-align: center;margin:20px 5px 8px 5px">
            <span class="labelStyle" style="margin-top: 15px">字体颜色:</span>
            <Slider v-model="lineColors" style="width:200px" @input="updateAddPointColor"/>
          </div>
          <div style="margin:30px 5px 8px 5px"  class="flex">
            <span class="labelStyle">字体大小:</span>
            <sliderstyle :min=12 :max=30 :value=12   style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updateAddPointSize"/>
          </div>
          <div style="margin:8px 5px" class="flex">
            <span class="labelStyle">透明度:</span>
            <sliderstyle :min=0 :max=100 :value=0   style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updateAddPointOpacity"/>
          </div>
          <div style="margin:8px 5px" class="flex">
            <span class="labelStyle">角度:</span>
            <sliderstyle :min=0 :max=360 :value=0   style="width:200px;margin-top:5px" v-on:onValueChangeEvent="updateAddPointAngle"/>
          </div>
        </div>
        <div style="margin:8px 5px" class="flex">
          <sg-button id="pointDraw" type="primary" style="position:absolute;width:70px;padding:5px;right: 100px;font-size:12px">添加到地图</sg-button>
          <sg-button type="primary" style="position:absolute;width:70px;padding:5px;right: 10px;font-size:12px" @click="clearAdd">删除添加</sg-button>
        </div>
      </sg-tab-pane>
    </sg-tab>

    <div style="margin:0px 5px 0px 5px;horiz-align: center;vertical-align: center" class="flex" v-show="tabIndexName != 'name4'">
      <sg-button type="primary" style="position:absolute;width:80px;padding: 8px;font-size:12px;right:10px;margin-top: -18px" @click="turnBackState" title="还原原来样式">撤销修改</sg-button>
    </div>

  </div>
</template>

<script>

  import Draw from "../classic/common/Draw"
  import {loadModules} from "esri-loader";
  import {options} from "../config"

  import sliderstyle from "./common/slider/sliderstyle"
  import sSlider from "./common/slider/slider"
  import { Slider } from 'vue-color'

  export default {
    name: "controlStyle",

    data() {
      return {
        view: window.g_view,
        rectangle: {},
        pointDraw:{},
        name: '',
        extent: null,
        selectedGraphics: [],
        cloneSymbols:[], //复制样式
        width: 1,
        fillstyle: 'solid',
        linestyle:'solid',
        pointstyle:'circle',
        fillColor:"",
        colors: '#194d33',
        lineColors:'#194d33',
        textContent:"",
        currentSelType:"",
        tabIndexName:"name1",
        textlabelColor:null,
        textsize:12,
        textangle:0,
        textopacity:1,
        textgraphics:[],
        isaddedgraphic:false ,//已经添加过的上一个图形
      }
    },
    components: {
      sliderstyle,
      sSlider,
      Slider
    },

    mounted() {
      let _this = this;
      _this.rectangle = new Draw('rectangle-button', 'rectangle');
      _this.rectangle.event.on({'drawComplete': (res) => {
          _this.showResults(res);
          _this.removeSpecialGeometry(res.geometry.rings,g_drawLayer);
        }
      });

      _this.pointDraw = new Draw("pointDraw",'point');
      _this.pointDraw.event.on({'drawComplete': (res) => {
          _this.confirmSettingTextSymbol(res);
          _this.removeSpecialGeometry(res.geometry,g_drawLayer);
        }
      });
    },

    methods: {

      changeTabIndex(selIndex) {
        this.tabIndexName = selIndex;
      },

      //面的边线宽度
      updatePolygonLineWidth(selWidth){
        this.setFillStyle(undefined,undefined,selWidth);
      },

      //面填充颜色的透明度
      fillOpacity(selOpacityValue){
        this.setFillStyle(undefined,undefined,undefined,undefined,selOpacityValue);
      },

      //面的填充颜色
      updateFillColor(selColor){
        this.setFillStyle(undefined,selColor) ;
      },

      //面的边线颜色
      updatePolygonLineColor(selLineColor){
        this.setFillStyle(undefined,undefined,undefined,selLineColor) ;
      },

      //填充样式
      Selector() {
        let selector = document.getElementById("selector")
        for (let i = 0; i < selector.length; i++) {
          if (selector[i].selected == true) {
            this.fillstyle = selector[i].value;      //关键是通过option对象的innerText属性获取到选项文本
            break;
          }
        }
        this.setFillStyle(this.fillstyle);
      },

      //设置面的样式
      setFillStyle(setFillStyle,setFillColor,setLineWidth,setLineColor,setFillOpacity) {
        for (let i = 0; i < this.selectedGraphics.length; i++) {
          if (this.selectedGraphics[i].geometry.type == "polygon") {
            let cloneSym = this.selectedGraphics[i].symbol.clone();
            if (setFillStyle != undefined && setFillStyle != null) {
              cloneSym.style = setFillStyle;
            }
            if (setFillColor != undefined || setFillOpacity != undefined) {
              let cloneColor = cloneSym.color.clone();
              if (setFillColor != undefined) {
                cloneColor.r = setFillColor.rgba.r;
                cloneColor.g = setFillColor.rgba.g;
                cloneColor.b = setFillColor.rgba.b;
              }
              if (setFillOpacity != undefined)
                cloneColor.a = setFillOpacity / 100;
              cloneSym.color = cloneColor;
            }
            if (setLineWidth != undefined || setLineColor != undefined) {
              let cloneLine = cloneSym.outline.clone();
              if (setLineWidth != undefined) {
                cloneLine.width = setLineWidth;
              }
              if (setLineColor != undefined) {
                let cloneLineColor = cloneLine.color.clone();
                cloneLineColor.r = setLineColor.rgba.r;
                cloneLineColor.g = setLineColor.rgba.g;
                cloneLineColor.b = setLineColor.rgba.b;
                cloneLine.color = cloneLineColor;
              }
              cloneSym.outline = cloneLine;
            }
            this.selectedGraphics[i].symbol = cloneSym;
          }
        }
      },

      //拉框选择图形
      showResults(res) {
        let _this = this;
        this.turnBackState();
        loadModules([
          "esri/geometry/Extent"
        ], options).then(([Extent]) => {
          _this.currentSelType = null;
          _this.cloneSymbols = [];
          _this.selectedGraphics = [];
          _this.extent = new Extent();
          _this.extent = res.geometry.extent;

          let gLayers = [g_regionLayer, g_drawLayer]; //导入和绘制的临时图层都进行计算

          for (let k = 0; k < gLayers.length; k++) {
            let myLayer = gLayers[k];
            for (let i = 0; i < myLayer.graphics.length; i++) {
              if (_this.extent.intersects(myLayer.graphics.items[i].geometry)) {
                _this.cloneSymbols.push(myLayer.graphics.items[i].symbol.clone()); //复制原始样式

                let type = myLayer.graphics.items[i].geometry.type;
                if (_this.currentSelType == null)
                  _this.currentSelType = type;

                if (type == "polygon") {
                  myLayer.graphics.items[i].symbol =
                    {
                      type: "simple-fill",
                      style: "solid",
                      color: [0, 0, 0, 0.5],
                      outline: {
                        color: [255, 0, 0],
                        width: 2
                      }
                    };
                } else if (type == "polyline") {
                  myLayer.graphics.items[i].symbol = {
                    type: "simple-line",
                    color: [255, 0, 0],
                    width: "2px",
                    style: "short-dot"
                  }
                } else if (type == "point") {
                  if (myLayer.graphics.items[i].symbol.type == "text") {
                    myLayer.graphics.items[i].symbol = {
                      type: "text",
                      text: this.textContent,
                      color: [255, 0, 0],
                      haloColor: "black",
                      haloSize: "1px",
                      xoffset: 0,
                      yoffset: 0,
                      font: {
                        size: this.textsize,
                      },
                      angle: this.textangle,
                      verticalAlignment: 'middle'
                    }
                  } else {
                    myLayer.graphics.items[i].symbol = {
                      type: "simple-marker",
                      style: "x",
                      size: "8px",
                      outline: {
                        color: [255, 255, 0],
                        width: 3
                      }
                    }
                  }
                }
                _this.selectedGraphics.push(myLayer.graphics.items[i]);
              }
            }
          }

          if (_this.currentSelType == "polygon")
            _this.tabIndexName = "name1";
          else if (_this.currentSelType == "polyline")
            _this.tabIndexName = "name2";
          else if (_this.tabIndexName == "point")
            _this.tabIndexName = "name3";
        });
      },

      //线的样式
      updateLineStyle(){
        this.setLineStyle(this.linestyle);
      },

      //设置线的颜色
      updateLineColor(selLineColor){
        this.setLineStyle(undefined,selLineColor);
      },

      //设置线的宽度
      updateLineWidth(selLineWidth){
        this.setLineStyle(undefined,undefined,undefined,selLineWidth);
      },

      //设置线的透明度
      updateLineOpacity(selLineOpacity){
        this.setLineStyle(undefined,undefined,selLineOpacity,undefined);
      },

      //设置线的样式
      setLineStyle(lineStyle,lineColor,lineOpacity,lineWidth){
        for (let i = 0; i < this.selectedGraphics.length; i++) {
          if (this.selectedGraphics[i].geometry.type == "polyline") {
            let cloneSym = this.selectedGraphics[i].symbol.clone();
            if (lineStyle != undefined)
              cloneSym.style = lineStyle;
            if (lineWidth != undefined)
              cloneSym.width = lineWidth;
            if (lineColor != undefined || lineOpacity != undefined) {
              let cloneColor = cloneSym.color.clone();
              if (lineColor != undefined) {
                cloneColor.r = lineColor.rgba.r;
                cloneColor.g = lineColor.rgba.g;
                cloneColor.b = lineColor.rgba.b;
              }
              if (lineOpacity != undefined)
                cloneColor.a = lineOpacity / 100;
              cloneSym.color = cloneColor;
            }
            this.selectedGraphics[i].symbol = cloneSym;
          }
        }
      },

      //设置点的样式
      updatePointStyle(){
        this.setPointStyle(this.pointstyle);
      },

      updatePointColor(selPointColor){
        this.setPointStyle(this.pointstyle,selPointColor);
      },

      updatePointOpacity(selPointOpacity){
        this.setPointStyle(undefined,undefined,selPointOpacity);
      },

      updatePointAngle(selPointAngle){
        this.setPointStyle(undefined,undefined,undefined,selPointAngle);
      },

      //更新点的大小
      updatePointSize(selPointSize){
        this.setPointStyle(undefined,undefined,undefined,undefined,selPointSize);
      },

      //设置点的样式
      setPointStyle(pointStyle,pointColor,pointOpacity,pointAngle,pointSize){
        for (let i = 0; i < this.selectedGraphics.length; i++) {
          if (this.selectedGraphics[i].geometry.type == "point"&&this.selectedGraphics[i].symbol.type!="text") {
            let cloneSym = this.selectedGraphics[i].symbol.clone();
            if (pointStyle != undefined)
              cloneSym.style = pointStyle;
            if (pointColor != undefined || pointOpacity != undefined) {
              let cloneColor = cloneSym.color.clone();
              if (pointColor != undefined) {
                cloneColor.r = pointColor.rgba.r;
                cloneColor.g = pointColor.rgba.g;
                cloneColor.b = pointColor.rgba.b;
              }
              if (pointOpacity != undefined)
                cloneColor.a = pointOpacity / 100;
              cloneSym.color = cloneColor;
            }
            if (pointAngle != undefined)
              cloneSym.angle = pointAngle;
            if (pointSize != undefined)
              cloneSym.size = pointSize;

            this.selectedGraphics[i].symbol = cloneSym;
          }
        }
      },

      //获取文本的颜色标签
      updateAddPointColor(pointColor){
        this.textlabelColor = {r:pointColor.rgba.r,g:pointColor.rgba.g,b:pointColor.rgba.b,a:this.textopacity};
        this.setTextStyle(pointColor);
      },

      updateAddPointSize(selPointSize){
        this.textsize = selPointSize;
        this.setTextStyle(undefined,undefined,undefined,selPointSize);
      },

      updateAddPointAngle(selPointAngle){
        this.textangle = selPointAngle;
        this.setTextStyle(undefined,undefined,selPointAngle,undefined);
      },

      updateAddPointOpacity(selPointOpacity){
        this.textopacity = selPointOpacity/100;
        this.setTextStyle(undefined,selPointOpacity);
      },

      //确定文本样式
      confirmSettingTextSymbol(res){
        if(this.textgraphics.length>0)
          this.isaddedgraphic = true;

        let tColor = null;
        if(this.textlabelColor == null)
          tColor = this.lineColors;
        else {
          tColor = this.textlabelColor;
          tColor.a = this.textopacity;
        }

        let textSymbol = {
          type: "text",
          text:this.textContent,
          color:tColor,
          haloColor: "black",
          haloSize: "1px",
          xoffset: 0,
          yoffset: 0,
          font: {
            size: this.textsize,
            family: "SimSun"
          },
          angle:this.textangle,
          verticalAlignment:'middle'
        };

        loadModules([
            "esri/Graphic"
          ],options).then(([Graphic]) => {
          let gra = new Graphic();
          gra.geometry = res.geometry;
          gra.symbol = textSymbol;
          g_drawLayer.add(gra);

          this.isaddedgraphic = false;
          this.textgraphics.push(gra);
        });
      },
      //设置文本样式
      setTextStyle(textColor,textOpacity,textAngle,textSize){
        for (let i = 0; i <this.selectedGraphics.length ; i++) {
          if (this.selectedGraphics[i].geometry.type == "point" && this.selectedGraphics[i].symbol.type == "text") {
            let cloneSym = this.selectedGraphics[i].symbol.clone();
            if (textColor != undefined || textOpacity != undefined) {
              let cloneColor = cloneSym.color.clone();
              if (textColor != undefined) {
                cloneColor.r = textColor.rgba.r;
                cloneColor.g = textColor.rgba.g;
                cloneColor.b = textColor.rgba.b;
              }
              if (textOpacity != undefined)
                cloneColor.a = textOpacity / 100;
              cloneSym.color = cloneColor;
            }
            if (textAngle != undefined)
              cloneSym.angle = textAngle;
            if (textSize != undefined)
              cloneSym.font.size = textSize;

            this.selectedGraphics[i].symbol = cloneSym;
          }
        }
      },
      clearAdd(){
        for(let i=0;i<this.textgraphics.length;i++){
          this.removeSpecialGeometry(this.textgraphics[i].geometry,g_drawLayer);
        }
        this.textgraphics =[];
        this.isaddedgraphic = false;
      },

      //样式还原
      turnBackState(){
        if(this.cloneSymbols.length>0 && this.selectedGraphics.length>0){
          for(let i=0;i<this.selectedGraphics.length;i++){
            this.selectedGraphics[i].symbol = this.cloneSymbols[i];
          }
        }
      },

      removeSpecialGeometry(geometry,graphicslayer) {
        if (geometry == null || geometry == 'undefined')
          return;

        if(graphicslayer == undefined || graphicslayer == null)
          graphicslayer = g_drawLayer;

        let geoStr = "";
        if(geometry.hasOwnProperty("type") && geometry.type == "point")
          geoStr = geometry.x +","+geometry.y;
        else
          geoStr=JSON.stringify(geometry);

        let allgraphics = graphicslayer.graphics;
        let graphic = null;
        if (allgraphics != null && allgraphics.length > 0) {
          for (let i = 0; i < allgraphics.length; i++) {
            let geo = allgraphics.items[i].geometry;
            let mygeo = null;
            if(geo.type == "polygon")
              mygeo = geo.rings;
            else if(geo.type == "poline")
              mygeo=geo.paths;
            else if(geo.type == "point")
              mygeo = geo.x +","+geo.y;

            let currentGeo =null;
            if(geo.type =="point")
              currentGeo = mygeo;
            else
              currentGeo = JSON.stringify(mygeo);

            if (currentGeo == geoStr) {
              graphic = allgraphics.items[i];
              break;
            }
          }
        }
        if (graphic != null) {
          graphicslayer.remove(graphic);
        }
      }
    },
    watch:{

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
  .controlstyle{
    position: fixed;right: 15px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);z-index:100;width:50px;
    height:50px;
  }
  .expandDialog {
    width: 325px;
    z-index: 100;
  }
  .outer{
    position: relative;
    width:200px;
    height:15px;
    background-color: #ccc;
    margin-left: 8px;
    margin-top: 14px;
    border-radius: 2px;
  }
  .inner{
    position: absolute;
    width:14px;
    height:14px;
    background-color: #ffffff;
    cursor:pointer;
    border:2px solid #3b86e0;
    border-radius: 100%;
  }

  .labelStyle{
    width: 70px;
    margin: 5px 2px 2px 2px;
    vertical-align: middle;
    text-align: center;
    horiz-align: right;
  }
</style>
