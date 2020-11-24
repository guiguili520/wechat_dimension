import echarts from "echarts";
import bus from "../../assets/eventBus";

/**
 * @Description: 统计图表
 */
export default class StatisticalChart {
  constructor(newData, options) {
    this.mapDiv = document.getElementById("map");
    this.result = newData;
    this.options = options;
    this.chartDivArray = [];
    this.houseStatistical();
    this.setView(g_view);
  }

  setView(view) {
    this.view = view;
    if (view) {
      view.watch("scale", newValue => {
        this.changeView();
      })
      view.watch("animation", response => {
        if (response && response.state === "running") {
        } else {
          this.changeView();
        }
      })
      view.on("drag", e => {
        this.changeView();
      })
    }
  }

  changeView() {
    try {
      for (let i = 0; i < this.result.length; i++) {
        let point = {};
        point = {
          type: "point",
          x: this.result[i].pointx,
          y: this.result[i].pointy,
          spatialReference: g_spatialReference
        };
        let div = document.getElementById("div" + i);
        let screenPoint = g_view.toScreen(point);
        div.style.left = parseInt(screenPoint.x) - 75 + "px";
        div.style.top = parseInt(screenPoint.y) - 75 + "px";
      }
    } catch (r) {
      console.log(r);
    }
  }

  houseStatistical() {
    for (let i = 0; i < this.result.length; i++) {
      let point = {
        type: "point",
        x: this.result[i].pointx,
        y: this.result[i].pointy,
        spatialReference: g_spatialReference
      };
      this.createMapChartDiv(point, i);
      this.setMapChartOption(i);
    }
  }

  createMapChartDiv(point, i) {
    let oCarouselBox = document.getElementById("div" + i);
    if (oCarouselBox) {
      this.mapDiv.removeChild(oCarouselBox);
    }
    let div = document.createElement("div");
    div.setAttribute("id", "div" + i);
    div.setAttribute("class", "barDiv");
    div.style.cssText =
      "    position: absolute;\n" +
      "    box-shadow: rgba(0,0,0,0) 0px 1px 2px;\n" +
      "    z-index: 100;\n" +
      "    width: 450px;height:450px;";
    let screenPoint = g_view.toScreen(point);
    div.style.left = parseInt(screenPoint.x) - 225 + "px";
    div.style.top = parseInt(screenPoint.y) - 225 + "px";
    div.addEventListener("click", res => {
      console.log(res);
    });
    this.mapDiv.appendChild(div);
    this.chartDivArray.push("div" + i);
    window.g_tempDiv.push(div);
  }

  setMapChartOption(i) {
    let myChart = echarts.init(document.getElementById("div" + i),'light');
    myChart.setOption(this.options);
  }

  //清理
  clearChart(){
    for(let i=0;i<this.chartDivArray.length;i++){
      let oCarouselBox = document.getElementById(this.chartDivArray[i]);
      if (oCarouselBox) {
        this.mapDiv.removeChild(oCarouselBox);
      }
    }
  }
}
