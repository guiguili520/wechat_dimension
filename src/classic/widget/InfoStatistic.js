//   parameters: {
//     title: "用地数量",
//     content: ["myChart", "myBarChart"],
//     field: this.formItem.field_select,//字段配置
//     values: ['E1_水域', 'M1_一类工业用地', 'R2_二类居住用地', 'G22_防护绿地'],
//     geometry: geometry
//   }
import {loadModules} from "esri-loader";
import {options} from "../../config";
import bus from '../../assets/eventBus';
import echarts from 'echarts';
import Event from "../core/Event";

/**
 * @Description: 信息统计类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class InfoStatistic {
  constructor() {
    this.event = new Event(this);
    loadModules(
      ["esri/Graphic",
        "esri/layers/FeatureLayer",
        "esri/tasks/QueryTask",
        "esri/tasks/support/Query",
        "esri/geometry/geometryEngineAsync",
      ], options
    ).then(([Graphic, FeatureLayer, QueryTask, Query, geometryEngineAsync]) => {
      this.Graphic = Graphic;
      this.QueryTask = QueryTask;
      this.Query = Query;
      this.FeatureLayer = FeatureLayer;
      this.geometryEngineAsync = geometryEngineAsync;
      this.parameters = ''
      //统计的图层
      this.url = ''
      //要素地图
      this.fl = null
      this.title = ""
      this.idenGraphicsLayer = g_highLightLayer;//定位时的高亮图层
      this.tempGraphicsLayer = g_bufferLayer;//绘制缓冲区临时图层
      this.options = {};
      this.loaded = true;
      this.event.triggerEvent('loadedCompleted',this.loaded);
    });
  }

  /**
   * @Description: 统计
   * @param: option 统计参数(url 统计图层，parameters.values 统计值，parameters.field 统计字段，parameters.geometry 统计的几何范围，
             parameters.title 柱状图和饼图的标题，this.parameters.content  柱状图和饼图的容器id)
   * @return:
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  count(option) {
    this.parameters = option.parameters, this.url = option.url;
    if (this.url == "") {
      console.log("请选择图层！");
    } else if (this.parameters.field == "") {
      console.log("请选择分组字段！");
    } else {
      this.fl = new this.FeatureLayer({
        url: this.url,
      });
      this.queryLayerViewStats(this.fl)
    }
  }

  /**
   * @Description: 查询和构造柱状图或饼图的数据
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  queryLayerViewStats() {
    let fields = this.parameters.values;
    const sta = fields.map((fieldName) => {
      return this.parameters.field + "= '" + fieldName + "'"
    })
    let newData = []
    for (let i = 0; i < sta.length; i++) {
      const query = this.fl.createQuery();
      if (this.parameters.geometry.rings != undefined) {
        query.geometry = this.parameters.geometry;
      }
      query.where = sta[i];
      this.fl.queryFeatures(query).then((response) => {
        let str = query.where.substring(query.where.indexOf("=") + 1, query.where.length);
        let name = str.replace(/\'/ig, function () {
          return '';
        });
        let singleField = {
          name: name,
          total: response.features.length,
          features: response.features,
          geometryType: response.geometryType
        }
        newData.push(singleField);
        if (newData.length === sta.length) {

          let seriesData = [];
          let nameData = [];
          let valueData = [];
          for (let i = 0; i < newData.length; i++) {
            seriesData.push({
              "value": newData[i].total,
              "name": newData[i].name
            });
            nameData.push(newData[i].name);
            valueData.push(newData[i].total);
          }
          //展示柱状图或饼图的数据
          this.options = {
            title: this.parameters.title,//标题
            content: this.parameters.content, //柱状图和饼图容器id集合
            seriesData: seriesData, //所有数据
            nameData: nameData, //名称
            valueData: valueData //值
          }
          // this.options = {
          //   title:"用地数量",
          //   content:["myChart","myBarChart"],
          //   seriesData:[{"value":88,"name":" E1_水域"},{"value":11,"name":" G22_防护绿地"},{"value":123,"name":" R2_二类居住用地"},{"value":30,"name":" M1_一类工业用地"}],
          //   nameData:[" E1_水域"," G22_防护绿地"," R2_二类居住用地"," M1_一类工业用地"],
          //   valueData:[88,11,123,30]
          // }
          this.updateChart(this.options)
          this.event.triggerEvent('queryComplete', newData);
        }
      }).catch((error) => {
        bus.$emit('setLoad', {
          statue: false,
          msg: '加载中...'
        });
        console.log("错误信息: " + error.message);
      });

    }
  }

  /**
   * @Description: 更新柱状图和饼图
   * @param: options 展示柱状图或饼图的数据（
      example:
          options = {
            title:"用地数量",
            content:["myChart","myBarChart"],
            seriesData:[{"value":88,"name":" E1_水域"},{"value":11,"name":" G22_防护绿地"},{"value":123,"name":" R2_二类居住用地"},{"value":30,"name":" M1_一类工业用地"}],
            nameData:[" E1_水域"," G22_防护绿地"," R2_二类居住用地"," M1_一类工业用地"],
            valueData:[88,11,123,30]
          }）
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  updateChart(options) {
    console.log(options)
    let myPie = echarts.init(document.getElementById(options.content[0]));
    let myBar = echarts.init(document.getElementById(options.content[1]));
    let pieOption = {
      title: {
        text: "",
        subtext: '',
        x: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      toolbox: {
        feature: {
          saveAsImage: {
            show: true
          },
        },
        top: '0%',
        right: '8%',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: options.nameData
      },
      series: [
        {
          name: options.title,
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: options.seriesData,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    let barOption = {
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      toolbox: {
        feature: {
          saveAsImage: {
            show: true
          },
        },
        top: '0%',
        right: '8%',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '0%',
        top: '20%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: options.nameData,
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            rotate: 40
          }

        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: options.title,
          type: 'bar',
          barWidth: '60%',
          data: options.valueData
        }
      ]
    };

    myPie.setOption(pieOption);
    myBar.setOption(barOption);

  }

  /**
   * @Description: 缓冲区分析
   * @param: geometry 分析图形, distance 分析距离
   * @return: bufferGeo 分析结果
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  buffer(geometry, distance) {
    if (this.QueryTask == undefined || this.QueryTask == null){
      setTimeout(this.buffer,1000,geometry, distance);
      return;
    }

    this.geometryEngineAsync.buffer(geometry, distance, "meters").then((response) => {
      let bufferGeo = response;
      let symbol = {
        type: "simple-fill",
        color: "rgba(255,0,0,0.3)",
        style: "solid",
        outline: {
          color: "red",
          width: 1
        }
      };
      let graphic = new this.Graphic({
        geometry: bufferGeo,
        symbol: symbol,
      });
      this.tempGraphicsLayer.graphics.add(graphic);
      this.event.triggerEvent('bufferComplete', bufferGeo);
    });
  }

  /**
   * @Description: 获取区县数据
   * @param: url区县图层, outField 区县字段
   * @return: queryResult 区县数据
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getCounty(url, outField) {
    if (this.QueryTask == undefined || this.QueryTask == null){
      setTimeout(this.getCounty,1000,url, outField);
      return;
    }

    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    query.returnGeometry = true;
    query.outFields = [outField];
    query.where = "1=1";
    queryTask.execute(query).then((results) => {
      let queryResult = results;
      this.event.triggerEvent('getCountyComplete', queryResult);
    });
  }

  /**
   * @Description: 获取街镇数据
   * @param: url 街镇图层, outField 街镇字段
   * @return: queryResult 街镇数据
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getTown(url, outField) {
    if (this.QueryTask == undefined || this.QueryTask == null){
      setTimeout(this.getCounty,1000,url, outField);
      return;
    }

    let layerUrl = url;
    let queryTask = new this.QueryTask({
      url: layerUrl
    });
    let query = new this.Query();
    query.returnGeometry = true;
    query.outFields = outField;
    query.where = "1=1";
    queryTask.execute(query).then((results) => {
      let queryResult = results;
      this.event.triggerEvent('getTownComplete', queryResult);
    });
  }

  /**
   * @Description: 符号化要素
   * @param: features 符号化要素
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  location(features) {
    this.clearGraphics()
    let symbol = {
      type: "simple-fill",  // autocasts as new SimpleFillSymbol()
      style: "none",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: "#00F5FF",
        width: 1.5
      }
    };
    for (let i = 0; i < features.length; i++) {
      let geometry = features[i].geometry
      var graphic = new this.Graphic({
        geometry: geometry,   // Add the geometry
        symbol: symbol,   // Add the symbol
      });
      this.idenGraphicsLayer.graphics.add(graphic);
    }
  }
  /**
   * @Description: 多边形定位和符号化
   * @param: geometry 符号化图形, symbol 多边形标记样式
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  regionLocation(geometry, symbol) {
    this.clearGraphics()
    if (symbol == undefined) {
      symbol = {
        type: "simple-fill",  // autocasts as new SimpleFillSymbol()
        style: "none",
        outline: {  // autocasts as new SimpleLineSymbol()
          color: "red",
          width: 1.5
        }
      };
    }

    var graphic = new this.Graphic({
      geometry: geometry,   // Add the geometry
      symbol: symbol,   // Add the symbol
    });
    this.idenGraphicsLayer.graphics.add(graphic);
    g_view.goTo(graphic);
  }
  /**
   * @Description: 点定位和符号化
   * @param: geometry 符号化图形, symbol 点标记样式
   * @return: null
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  pointLocation(geometry) {
    this.clearGraphics()
    let symbol = {
      type: "picture-marker",  // autocasts as new SimpleFillSymbol()
      url: require("../../assets/images/pointPosition.png"),
      width: "18px",
      height: "18px"
    };
    var graphic = new this.Graphic({
      geometry: geometry,   // Add the geometry
      symbol: symbol,   // Add the symbol
    });
    this.idenGraphicsLayer.graphics.add(graphic);
    g_view.goTo(graphic);
  }

  /**
   * @Description: 清除图层
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  clearGraphics() {
    if (this.tempGraphicsLayer != undefined) {
      this.tempGraphicsLayer.removeAll();
    }
    if (this.idenGraphicsLayer != undefined) {
      this.idenGraphicsLayer.removeAll();
    }
  }
}

