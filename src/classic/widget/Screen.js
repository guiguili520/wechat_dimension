import {loadModules} from "esri-loader";
import {options} from "../../config";

export default class Screen {

  constructor(maps, doms, isTool) {
    loadModules(
      [
        'esri/widgets/LayerList',
        "esri/views/MapView",
      ],
      options
    ).then(([LayerList, MapView]) => {
      let views = [];
      //根据需要来创建多个视图并绑定地图容器div的id
      for (let i = 0; i <= doms.length; i++) {
        let view = new MapView({
          map: maps[i],
          container: doms[i],
          ui: {
            components: []
          }
        });
        if (isTool) {
          this.addLayerList(view);
        }
        views.push(view);
      }

      views.forEach(function (view) {
        //定义一个范围变量
        let fullextent = null;
        //设置鼠标滚轮事件
        view.on("mouse-wheel", function (e) {
          //延迟获取范围的函数
          window.setTimeout(function () {
            //获取操作图层的范围
            fullextent = view.extent
            //遍历所有视图来设置这个范围
            views.forEach(function (nview) {
              nview.extent = fullextent
            })
          }, 100)
        })
        //设置鼠标拖拽事件
        view.on("drag", function (e) {
          //获取操作图层的范围
          fullextent = view.extent
          //遍历所有视图来设置这个范围
          views.forEach(function (nview) {
            nview.extent = fullextent
          })
        })
      })
    })

  }

  addLayerList(view) {
    let layerList = new LayerList({
      view: view
    });
    view.ui.add(layerList, {
      position: "top-right"
    });
  }
}
