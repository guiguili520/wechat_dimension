import {
  loadModules
} from "esri-loader";
import {
  options
} from "../../config";
import {
  Blank
} from "../../config/api.js";


/**
 * @Description: 工具包类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */
export default class ToolBar {
  constructor(exportUrl,toolsData={}) {
    loadModules(
      [
        "esri/widgets/ScaleBar",
        "esri/widgets/Fullscreen",
        "esri/widgets/Print",
        "esri/widgets/Locate",
        "esri/widgets/CoordinateConversion",
        "esri/widgets/Expand",
        "esri/widgets/Legend"

      ],
      options
    ).then(([ScaleBar, Fullscreen, Print, Locate, CoordinateConversion, Expand, Legend]) => {
      console.log(window.addMode)
      if(window.addMode == "homeMap" || window.addMode == "businessInteraction"){
        return
      }
      //全屏、打印
      let toolArr=[]
        this.printUrl = exportUrl
        if(toolsData.printExpand){
          //创建打印
          this.print = new Print({
            view: g_view,
            printServiceUrl: this.printUrl,
          });
          //右侧打印按钮
          let printExpand = new Expand({
            expandIconClass: "esri-icon-printer",
            expandTooltip: "打印",
            view: g_view,
            content: this.print,
            group: "toolBar"
          });
          toolArr.push({
            component: printExpand,
            position: "top-right"
          })
        }


      //图例过滤空图层
      g_map.allLayers.find((layer) => {
        if (layer.url === Blank || layer.url === null) {
          layer.legendEnabled = false;
        }
      })
      // //创建图例（资源目录模块中的图例）
      // let legend = new Legend({
      //   view: g_view,
      //   container: "legendCon"
      // });
      // //创建图例（右侧工具图例按钮）
      // this.legend = new Legend({
      //   view: g_view,
      // });

      // if(toolsData.coordinate) {
      //   //创建坐标转换
      //   this.ccWidget = new CoordinateConversion({
      //     view: g_view
      //   });
      //   toolArr.push({
      //     component: this.ccWidget,
      //     position: "bottom-left"
      //   })
      // }
      //创建定位
      // this.locateBtn = new Locate({
      //   view: g_view
      // });


      //测量
      // if(toolsData.measure){
      //   new SgMap.Measure()
      // }
      //比例尺
      // if(toolsData.scaleBar) {
      //   //创建比例尺
      //   this.scaleBar = new ScaleBar({
      //     view: g_view,
      //     unit: "metric"
      //   })
      //   toolArr.push({
      //     component: this.scaleBar,
      //     position: "bottom-left"
      //   })
      // }
      //全图
      // if(toolsData.fullscreen){
      //   //创建全图
      //   this.fullscreen = new Fullscreen({
      //     view: g_view
      //   });
      //   toolArr.push({
      //       component: this.fullscreen,
      //       position: "top-right"
      //   })
      // }
      // g_view.ui.add(toolArr, 'toolBar')

    //   g_view.ui.add([
    //     {
    //         component: this.scaleBar,
    //         position: "bottom-right"
    //     },
    //     {
    //       component: this.fullscreen,
    //       position: "top-right"
    //     },
    //     // {
    //     //   component: this.locateBtn,
    //     //   position: "top-right"
    //     // },
    //     // {
    //     //   component: this.ccWidget,
    //     //   position: "bottom-left"
    //     // },
    //     {
    //       component: printExpand,
    //       position: "top-right"
    //     },
    //     // {
    //     //   component: legendExpand,
    //     //   position: "top-right"
    //     // }
    //   ], 'toolBar')
    });
  }
}
