import {loadModules} from "esri-loader";
import {options} from "../../config";
import Event from '../core/Event'
import bus from '@/assets/eventBus'

/**
 * @Description: 属性查询，实现点击查询
 * @author: Guixiang Tang
 * @date: 2019/3/13
 */
export default class Identify {
  constructor() {
    this.isClearPreSelAction = false;
    this.event = new Event(this);
    this.layerSelection=[]
    bus.$on('get-layerOptions', (res) => {

      console.log(res)
      this.layerSelection = []
      res.map((item, index, arr) => {
        let obj = {
          value: item.value,
          label: item.label
        }
        if(item.value !=undefined && JSON.stringify(this.layerSelection).indexOf(JSON.stringify(obj))==-1){
          this.layerSelection.push(obj);
        }
      })
    })
    loadModules(
      [
        "esri/tasks/IdentifyTask",
        "esri/Graphic",
        "esri/tasks/support/IdentifyParameters",
        "dojo/on",
        "dojo/dom"
      ],
      options
    ).then(([IdentifyTask, Graphic, IdentifyParameters, on, dom]) => {
      this.identifyResult = [];
      this.identifyTask = []
      this.params = new IdentifyParameters();
      this.id = map; //地图的容器id
      this.dom = dom
      this.Graphic = Graphic
      this.IdentifyTask = IdentifyTask;
      this.on = on;
      this.mapClickEvent = '';
      this.identifyAllResult = [];
      this.layerIds = [];
      this.index = 0;
    })
  }

  /**
   * @Description: 右上角关闭事件，指针样式还原，移除地图点击事件
   * @param: this.id 为地图的容器id
   * @return:
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */
  clear() {
    this.dom.byId(this.id).style.cursor = "auto"; //指针样式还原
    if(this.mapClickEvent != undefined && this.mapClickEvent != "")
      this.mapClickEvent.remove();//移除地图点击事件
  }

  /**
   * @Description: 激活属性查询
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */
  active() {
    this.event.triggerEvent('clearListData', []);
    this.identifyAllResult = []
    g_drawLayer.removeAll();
    g_tempLayer.removeAll();
    // this.mapClickEvent = this.on(g_view, "click", this.executeIdentifyTask.bind(this));
    this.mapClickEvent = this.on(g_view, "click", (e) => { //绑定地图点击事件
      if (e.button == 2) { //2为鼠标右键
        this.dom.byId(this.id).style.cursor = "auto"; //还原指针
        this.mapClickEvent.remove(); //移除地图点击事件
        return;
      }else if(e.button == 0){
        this.executeIdentifyTask(e); //执行属性查询
      }
    });
    this.dom.byId(this.id).style.cursor = "crosshair"; //改变指针样式
    //属性查询参数
    this.params.tolerance = 10;
    this.params.layerOption = "visible";//"all"; //查询该点的所有图层
    this.params.width = g_view.width;
    this.params.height = g_view.height;
    this.params.returnGeometry = true;
    this.poGraphicsLayer = g_tempLayer;
    this.idenGraphicsLayer = g_drawLayer;
  }

  //地图单次点选，获取最顶层的图斑
  singleActive(index,isClearPreSelect) {
    this.isClearPreSelAction = isClearPreSelect;
    if(!this.isClearPreSelAction)
      g_drawLayer.removeAll();
    this.index = index;
    this.mapClickEvent = this.on(g_view, "click", (e) => { //绑定地图点击事件
      if (e.button == 2) { //2为鼠标右键
        this.dom.byId(this.id).style.cursor = "auto"; //还原指针
        this.mapClickEvent.remove(); //移除地图点击事件
        return
      } else if (e.button == 0) {
        this.executeSingleIdentifyTask(e); //执行属性查询
      }
    });
    this.dom.byId(this.id).style.cursor = "crosshair"; //改变指针样式
    //属性查询参数
    this.params.tolerance = 3;
    this.params.layerOption = "top"; //查询该点的顶层图层
    this.params.width = g_view.width;
    this.params.height = g_view.height;
    this.params.returnGeometry = true;
  }

  executeSingleIdentifyTask(e) {
    if(!this.isClearPreSelAction)
      g_drawLayer.removeAll();
    this.params.geometry = e.mapPoint;
    this.params.mapExtent = g_view.extent;
    this.layerIds = [];
    this.params.layerIds = null;
    this.layerSelection =[];

    if (this.layerSelection.length == 0) {
      g_map.allLayers.find((layer) => {
        if (layer.visible == true && layer.url != null) {
          let obj = {
            value: layer.url,
            label: layer.title
          }
          if (JSON.stringify(this.layerSelection).indexOf(JSON.stringify(obj)) == -1) {
            this.layerSelection.push(obj)
          }
        }
      })
    }

    this.layerSelection.reverse(); //图层反序，先查最上层的服务
    this.layerSelection.map((url, index, arr) => {
      if (index === 0) {
        this.identifyTask = new this.IdentifyTask(url.value);
        this.identifyTask.execute(this.params).then((res) => { //属性查询方法
          let results = res.results[0].feature;
          this.identifyResult = results;
        }).then(() => {
          this.showSingleIdentifySymbol(this.identifyResult);
          this.mapClickEvent.remove(); //移除地图点击事件
          this.dom.byId(this.id).style.cursor = "auto"; //改变指针样式
          return
        });
      }
    });
  }

  showSingleIdentifySymbol(feature){
    let symbol = { //绘制多边形符号
      type: "simple-fill",
      style: "solid",
      // color: "rgba(204,204,204, 0.5)",
      color: [0,0,0,0],
      outline: {
        color: [255,0,0],
        width: 3
      }
    };
    let gra
      gra = new this.Graphic({ //创建graphic
        geometry: feature.geometry,
        symbol: symbol,
        attributes:feature.attributes
      });

    g_drawLayer.graphics.add(gra); //将该graphic新增至高亮图层g_highLightLayer
    if(this.index==0)
    bus.$emit('identifyRangeComplete',gra)
    else
    bus.$emit('getGraphic',gra)
    return gra; //返回graphic
  }

  /**
   * @Description: 执行属性查询
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */
  executeIdentifyTask(e) {
    this.identifyAllResult = [];
    this.identifyResult = [];
    g_drawLayer.removeAll();
    g_tempLayer.removeAll();
    this.params.geometry = e.mapPoint;
    this.params.mapExtent = g_view.extent;
    let a = 0;
    if (this.layerSelection.length == 0) {
      g_map.allLayers.find((layer) => {
        if (layer.visible == true && layer.url != null) {
          let obj = {
            value: layer.url,
            label: layer.title
          };
          if (JSON.stringify(this.layerSelection).indexOf(JSON.stringify(obj)) == -1) {
            this.layerSelection.push(obj)
          }
        }
      })
    }

    let _this = this;
    this.layerSelection.map((url, index, arr) => {
      _this.layerIds = [];
      let visible = true;
      g_map.allLayers.find((layer) => {
        if (layer.url == url.value) {
          visible = layer.visible;
          if (layer.allSublayers != undefined && layer.allSublayers.length > 0) {
            layer.allSublayers.map((sub) => {
              if (sub.visible)
                _this.layerIds.push(sub.id);
            });
          }
          _this.params.layerIds = _this.layerIds;
        }
      });

      if (visible) {
        if (_this.layerIds.length <= 0)
          _this.params.layerIds = null;
        this.identifyTask = new this.IdentifyTask(url.value);
        this.identifyTask.execute(_this.params).then((res) => { //属性查询方法
          let results = res.results;
          _this.identifyResult = results;
          a++;
          return a
        }).then((a) => {
          this.showSymbol(a, arr.length);//a为从0开始，序增1，执行第a个url；arr.length为url的总个数
        });
      } else {
        a++;
        this.showSymbol(a, arr.length);
      }
    });
  }

  /**
   * @Description: 添加标志
   * @param: index 当前查询的url的序号, length 为查询的url的总个数
   * @return: this.identifyAllResult 所有查询结果
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */
  showSymbol(index, length) {
    let symbol = {
      type: "simple-fill",
      style: "none",
      outline: {
        color: "red",
        width: 3
      }
    };
    for (let i = 0; i < this.identifyResult.length; i++) {
      let geo = this.identifyResult[i].feature.geometry;
      let graphic = new this.Graphic({
        geometry: geo,   // Add the geometry
        symbol: symbol,   // Add the symbol
      });
      this.idenGraphicsLayer.graphics.add(graphic);
      this.identifyAllResult.push(this.identifyResult[i])
    }
    if (index == length) {
      this.event.triggerEvent('identifyComplete', this.identifyAllResult);
    }
  }

  /**
   * @Description: 定位
   * @param: feature 要素
   * @return:
   * @author: Guixiang Tang
   * @date: 2019/3/13
   */
  position(feature) {
    g_drawLayer.removeAll();
    g_tempLayer.removeAll();
    if (this.poGraphicsLayer != undefined) {
      this.poGraphicsLayer.removeAll(); //移除定位图层中的graphic
    }

    if (feature.geometry != null && feature.geometry != undefined) {
      let symbol = {
        type: "simple-fill",
        style: "solid",
        color: "rgba(204,204,204, 0.5)",
        outline: {
          color: "#00FFFF",//[255,0,0],
          width: 3
        }
      };
      let geotype = feature.geometry.type;
      if (geotype == "polyline") {
        symbol = {
          type: "simple-line",
          color: "#00F5FF",
          width: 1.5
        };
      } else if (geotype == "point") {
        symbol = {
          type: "picture-marker",
          url: require("../../assets/images/pointPosition.png"),
          width: "20px",
          height: "20px"
        };
      }
      let graphic = new this.Graphic({
        geometry: feature.geometry,
        symbol: symbol,
      });
      this.poGraphicsLayer.graphics.add(graphic); //graphic添加至定位图层
      this.zoomToMap(feature.geometry);
    }
    this.event.triggerEvent('getAttribute', feature);
  }

  zoomToMap(geometry){
    let expandExtent;
    if(geometry.type == 'point'){
      loadModules([
        'esri/geometry/Extent'
      ],options).then(([Extent])=>{

          let x = geometry.x;
          let y = geometry.y;
          let mySpatialReference = geometry.spatialReference;
          let changeValue = 100;
          if (geometry.x > -180 && geometry.x < 180)
            changeValue = 0.1;
          let evp = new Extent({xmin:x - changeValue,ymin:y - changeValue,xmax:x + changeValue,ymax:y + changeValue,spatialReference:mySpatialReference});
          expandExtent = evp.expand(5);
          g_view.extent = expandExtent;
        }
      );
    }else {
      expandExtent = geometry.extent.expand(3.3);
      g_view.goTo(expandExtent,{duration:1000});
    }
  }
}
