import {loadModules} from "esri-loader";
import {options} from "../../config";

export default class LayerList {
  constructor() {
    loadModules(
      [
        "esri/widgets/Expand",
        "esri/widgets/LayerList"
      ],
      options
    ).then(([Expand, LayerList]) => {
      let view = g_view;
      view.when(function () {
        let layerList = new LayerList({
          container: document.createElement("div"),
          view: view
        });
        let layerListExpand = new Expand({
          expandIconClass: "esri-icon-layer-list",
          view: view,
          expandTooltip: "图层列表",
          content: layerList.domNode
        });
        view.ui.add(layerListExpand, "top-right");
      }, function (err) {
        console.log(err)
      })
    })
  }
}
