<script>
import { loadModules } from "esri-loader";
import { options } from "../config";
import bus from "../assets/eventBus";
import { layersCompare,mergePrintImages,getMultiCompareSettings } from "../config/api.js";
import configDataInfo from '../../public/web/config.json'

export default {
  name: "screen",

  render(h) {
    let width = (this.screenLength ==2 || this.screenLength == 3) ? "50%": 100/(this.screenLength/2) +"%";
    let arr = []; //整体的元素集合
    let innerArr = []; //包裹对比窗口集合
    let winArr = []; //对比窗口元素集合
    arr.push(
      h('div',{
        style:{
          width:"100%",
        }
      },[
        h('div',{
          class:"header flex",
          style:{
            width:'100%',
          }
        },[
          h('p',{
            class:"flex-item",
            domProps: {
              innerText: '多屏对比'
            }
          }),
          h('div', {
            class: "col",
            domProps: {
              title: "关闭窗口"
            },
            on: {
              click: () => {
                this.lastScreenLength = this.screenLength;
                bus.$emit("toggleScreen", {show: false, screenLength: 2});
              }
            }
          },[
            h('sg-icon',{
              props:{
                type:"icon-close"
              }
            })
           ])
        ]),

        h('div',{
          style:{
            width:"100%",
            height:"40px",
            backgroundColor:"lightgray"
          },
          class:'flex',
        },[
          h('div',{
            class:"flex",
            style:{
              verticalAlign:'middle'
            }
          },[
            h('span',{
              style:{
                verticalAlign: 'middle',
                textAlign: 'center',
                fontWeight:'bold',
                marginTop:'12px',
                marginLeft:"5px"
              }, domProps: {
                innerHTML: '窗口切换：'
              }
            }),
            h('sg-button',{
              props:{
                type:"primary",
                size:"small"
              },style:{
                padding:"8px",
                height:'28px',
                marginRight:"10px",
                marginTop:'5px',
                marginLeft:"10px"
              },domProps:{
                innerText:"二窗口",
              },on:{
                click:()=>{
                  this.changeMapWinNums(2);
                }
              }
            }),
            h('sg-button',{
              props:{
                type:"primary",
                size:"small"
              },style:{
                padding:"8px",
                height:'28px',
                marginRight:"10px",
                marginTop:'5px',
                marginLeft:"10px"
              },domProps:{
                innerText:"三窗口",
              },on:{
                click:()=>{
                  this.changeMapWinNums(3);
                }
              }
            }),
            h('sg-button',{
              props:{
                type:"primary",
                size:"small"
              },style:{
                padding:"8px",
                height:'28px',
                marginRight:"10px",
                marginTop:'5px',
              },domProps:{
                innerText:"四窗口",
              },on:{
                click:()=>{
                  this.changeMapWinNums(4);
                }
              }
            }),
            h('sg-button',{
              props:{
                type:"primary",
                size:"small"
              },style: {
                padding: "8px",
                height: '28px',
                marginRight: "10px",
                marginTop: '5px',
                display: this.isSixWinsDisplay
              },domProps:{
                innerText:"六窗口",
              },on:{
                click:()=>{
                  this.changeMapWinNums(6);
                }
              }
            })
          ]),

          h('div',{
            class:'flex',
            style:{
              verticalAlign:'middle',
              marginLeft:"20px",
              marginTop:'12px',
              left: "calc(50% - 270px)",
              position: "absolute"
            }
          },[
            h('span',{
              style:{
                verticalAlign: 'middle',
                textAlign: 'center',
                fontWeight:'bold',
                marginLeft:"10px",
              }, domProps: {
                innerHTML: '操作工具：'
              }
            }),
            h('div',{
              class:'flex',
              style:{
                  marginTop:'-7px',
              }
            },[
              h('sg-button',{
                attrs:{
                  id:"qtBtn"
                },
                props:{
                  type:"primary",
                  size:"small"
                },style:{
                  padding:"8px",
                  height:"28px",
                  marginLeft:"10px"
                },domProps:{
                  innerText:"全图",
                  title:"全图"
                },
                on:{
                  click:()=>{
                    this.onAllMap();
                  }
                }
              }),
              h('sg-button',{
                attrs: {
                  id: "systBtn"
                },
                props:{
                  type:"primary",
                  size:"small"
                },style:{
                  padding:"8px",
                  height:"28px",
                  marginLeft:"10px"
                },domProps:{
                  innerText:"上一视图",
                  title:"上一视图"
                },
                on:{
                  click:()=>{
                    this.preExtent();
                  }
                }
              }),
              h('sg-button',{
                attrs: {
                  id: "xystBtn"
                },
                props:{
                  type:"primary",
                  size:"small"
                },style:{
                  padding:"8px",
                  height:"28px",
                  marginLeft:"10px"
                },domProps:{
                  innerText:"下一视图",
                  title:"下一视图"
                },
                on:{
                  click:()=>{
                    this.nextExtentView();
                  }
                }
              }),
              h('sg-button',{
                props:{
                  type:"primary",
                  size:"small"
                },style:{
                  padding:"8px",
                  height:"28px",
                  marginLeft:"10px"
                },domProps:{
                  innerText:"I查询",
                  title:"I查询"
                },
                on:{
                  click:()=>{
                    this.ISearch();
                  }
                }
              }),
              h('sg-button',{
                props:{
                  type:"primary",
                  size:"small"
                },style:{
                  padding:"8px",
                  height:"28px",
                  marginLeft:"10px"
                },domProps:{
                  innerText:"面积测量",
                  title:"面积测量"
                },
                on:{
                  click:()=>{
                    this.startDrawEvent();
                  }
                }
              }),
              h('sg-button',{
                props:{
                  type:"primary",
                  size:"small"
                },style:{
                  padding:"8px",
                  height:"28px",
                  marginLeft:"10px"
                },domProps:{
                  innerText:"导出",
                  title:""
                },
                on:{
                  click: () => {
                    this.mergePrintImgs();
                  }
                }
              })
            ])
          ]),

          h('div',{
            class:'flex',
            style:{
              verticalAlign:'middle',
              marginLeft:"20px",
              marginTop:'12px',
              marginRight:"0px",
              position:'absolute',
              right:'5px'
            }
          },[
            h('span',{
              style:{
                verticalAlign: 'middle',
                textAlign: 'center',
                fontWeight:'bold',
                marginLeft:"30px"
              }, domProps: {
                innerHTML: '窗口方案：'
              }
            }),

            h('select', {
              attrs:{
                id:'caseSelectId'
              },
              style: {
                width: "150px",
                verticalAlign: "middle",
                height: "28px",
                marginTop: "-7px"
              }, props: {
                value: this.selectedCaseName
              }
            },this.caseNameList.map((item) => {
              let selected ="";
              if(item == this.selectedCaseName)
                selected = "selected";
              return h('option', {
                domProps: {
                  value: item,
                  label: item,
                  selected:selected
                }
              })
            })),

            h('sg-button',{
              props:{
                type:"primary",
                size:"small"
              },style:{
                padding:"8px",
                height:"28px",
                marginLeft:"10px",
                marginTop:"-7px"
              },domProps:{
                innerText:"添加方案",
                title:"添加方案"
              },
              on:{
                click:()=>{
                  this.openAddCase();
                }
              }
            }),
            h('sg-button',{
              props:{
                type:"primary",
                size:"small"
              },style:{
                padding:"8px",
                height:"28px",
                marginLeft:"5px",
                marginTop:"-7px"
              },domProps:{
                innerText:"方案管理",
                title:"方案管理"
              },
              on:{
                click:()=>{
                  this.openCaseManager();
                }
              }
            }),
          ])
        ])
      ]),
    );

    this.length.map((i, index) => {
      let layerList = this.allMapLayerDatas[index];
      this.initLayerListData(layerList, index);

      winArr.push(
        h('div',{
          style:{
            width:width,
            height:this.screenLength == 2?"100%":"50%",
            float:'left'
          }
        },[
          h("div",{
              attrs: {
                id: this.id + (index + 1)
              },
              style: {
                position: "relative",
                width: "100%",
                height:"100%",
                border: "1px solid #dfdfdf",
                padding:"2px 2px"
              }
            },[
              h('div',{
                style:{
                  height:"25px",
                  position:"absolute",
                  left:"0px",
                  right:'0px',
                  width:"100%",
                  backgroundColor:"#f0f0f0"
                }
              },[
                h('span',{
                  style:{
                    position:"absolute",
                    left:"0px",
                    top:'0px',
                    marginTop:'5px',
                    marginLeft:'5px'
                  },domProps:{
                    innerText:'窗口'+toChinesNum(index + 1)
                  }
                }),
                h('span', {
                    style: {
                      borderRadius: '4px',
                      lineHeight: '14px',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      marginTop:'5px',
                      left: '40%',
                      color: 'red',
                      position: "absolute",
                    }, domProps: {
                      innerHTML: ''
                    }, attrs: {
                      id: "headTitle" + (index + 1)
                    }
                  }
                )]) ,
              h("div", {
                class: "esri-widget--button esri-icon-layer-list",
                style: {
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                  position: "absolute",
                  top: "3px",
                  right: "3px",
                  width:"25px",
                  height:"25px"
                },
                on: {
                  mouseenter:()=>{
                    this.showCatalog(index);
                  }
                }
              }),
              h("div",
                {
                  attrs: {
                    id: "layerListPanel" + (index + 1)
                  },
                  style: {
                    display:index== 0 ? this.panle0: (index== 1 ? this.panle1: (index== 2 ? this.panle2:(index ==3?this.panle3:(index ==4 ? this.panle4:this.panle5)))),
                    position: "absolute",
                    top: "3px",
                    backgroundColor: "white",
                    right: "28px",
                    minHight: "32px",
                    maxHight: "540px",
                    width: "250px",
                    border: "1px solid #dfdfdf",
                    overflowX:"hidden",
                    overflowY:"auto",
                    height:"auto"
                  },on:{
                    mouseleave:()=>{
                      this.closeLayerCatalog(index);
                    }
                  }
                },
                [
                  h("sg-tree", {
                    props: {
                      data: layerList
                    },
                    attrs: {
                      "show-checkbox": ""
                    },
                    style: {
                      padding: "6px",
                      overflow:"hidden auto",
                      maxHeight:"250px"
                    },
                    on: {
                      "on-check-change": (res,current) => {
                        this.changeMap(res,current, index);
                      }
                    }
                  })
                ]
              )
            ]
          )
        ]),
      );
    });

    innerArr.push(
      h('div',{
        style:{
          width:'100%',
          height:'calc(100% - 70px)'
        }
      },winArr)
    );

    arr.push(innerArr);

    return h(
      "div",
      {
        class: "flex",
        attrs: {
          id: this.id
        },
        style: {
          zIndex:200,
          display: this.isShow ? "flex" : "none",
          width: "100%",
          height: "100%",
          background: "#fff",
          position: "absolute",
          right: "0px",
          top: "0px",
          border: "4px solid #e4e4e4",
          boxSizing: "border-box",
          flexDirection: "column",
          flexWrap: "wrap"
        }
      },
      arr
    );
  },

  props: {
    screenLength: {
      type: Number,
      default: 2
    },
    id: {
      type: String,
      default: "screen"
    }
  },

  data() {
    return {
      views: [],
      panle0:"none",
      panle1:"none",
      panle2:"none",
      panle3:"none",
      panle4:"none",
      panle5:"none",
      layerListPanelIsShow: false,
      layerCompareData: [],
      isShow: false,
      LayerList: null,
      length: [],
      Expand: null,
      count: 1,
      clientWidth: 0,
      lastScreenLength:0,
      templateName:"simplePrint",
      analysisurl_print:"",//打印服务地址
      currentScale:10000, //当前比例
      costomFormat:"JPG",
      imgsPath:[],
      initMapExtent:null,
      allHistoryExtents:[], //移动的范围
      extentIndex:0,
      mapClickEvent:[],
      params:null,
      IdentifyTask:null,
      executeLayers:[],
      resultPanelIsShow:false,
      columns: [
        {
          title: '名称',
          key: 'name',
          width:100
        },
        {
          title: '值',
          key: 'value',
          width: 180
        }
      ],
      listData: [],
      data: [],
      sketchVMs:[],
      SketchViewModel:null,
      geometryEngine:null,
      baseMap:[],
      allMapLayerDatas:[],
      checkedPerMaps:[],
      selectedCaseName:"默认方案（四窗口）",
      caseNameList:[],
      allCaseData:[],
      isSixWinsDisplay:"none"
    };
  },

  methods: {

    //打开方案管理
    openCaseManager(){
      bus.$emit("OpenCaseManageEvent",{name:'方案管理',allList:this.allCaseData});
    },

    openAddCase(){
      bus.$emit("OpenAddCaseEvent",'添加方案');
    },

    showCatalog(index){
      let panelIsShow = document.getElementById("layerListPanel"+ (index + 1)).style.display=="none"?"block":"none"
      switch(index) {
        case 0:
          this.panle0=panelIsShow
          break;
        case 1:
          this.panle1=panelIsShow
          break;
        case 2:
          this.panle2=panelIsShow
          break;
        case 3:
          this.panle3=panelIsShow
          break;
        case 4:
          this.panle4 = panelIsShow;
          break;
        case 5:
          this.panle5 = panelIsShow;
          break;
        default:
      }
    },

    traversal(current,myMap,index) {
      if (current.length > 0) {
        for (let i = 0; i < current.length; i++) {
          let myUrl = current[i].attributes.restURL;
          if (myUrl != "") {
            this.addLayerToMap(myUrl,myMap); //添加还没有加入到地图的服务
            this.checkedUrl.push(myUrl);

            let result = this.checkedPerMaps.find((r) => {
              return r.id == index && r.url == myUrl && r.name == current[i].attributes.layerName;
            });
            if (!result)
              this.checkedPerMaps.push({
                id: index,
                checked: current.checked,
                url: myUrl,
                name: current[i].attributes.layerName
              });
            else
              result.checked = current[i].checked;
          }
          if (current[i].children.length > 0) {
            this.traversal(current[i].children,myMap,index);
          }
        }
      }
    },

    controlMap(arr, checkedUrl, isShow, parentsLayers,myMap) {

      let rr = arr.filter(function (x) {
        return x !== undefined;
      });

      if(parentsLayers!=undefined && parentsLayers.length>0){
        for (let i = 0; i < arr.length; i++) {
          if (rr[i] != undefined) {
            myMap.allLayers.find((layer) => {
              if (layer.url == rr[i]) {
                layer.visible = isShow;
                if(layer.capabilities == undefined || layer.capabilities.exportMap == null || layer.capabilities.exportMap.supportsSublayerVisibility){
                  if (parentsLayers.indexOf(layer.url) >= 0 && isShow == false) {
                    layer.allSublayers.find(function (sublayer) {
                      sublayer.visible = isShow;
                    });
                  }
                }
              }
            });
          }
        }
      }else{
        for (let i = 0; i < arr.length; i++) {
          if (rr[i] != undefined) {
            myMap.allLayers.find((layer) => {
              if (layer.url == rr[i]) {
                layer.visible = isShow;
                if(layer.capabilities == undefined || layer.capabilities.exportMap == null || layer.capabilities.exportMap.supportsSublayerVisibility) {
                  if (layer.allSublayers != null && layer.allSublayers.length > 0) {
                    layer.allSublayers.map((sub) => {
                      sub.visible = isShow;
                    });
                  }
                }
              }
            });
          }
        }
      }
    },

    getLayerOptions(res, checkedUrl, parentsLayers,currentlayer,parentUrl,parentTitle,myMap) {
      let urlArr = []
      res.map(i => {
        if (i.restURL != undefined && i.restURL != "") {
          urlArr.push(i.restURL)
        } else if (i.attributes != undefined && i.attributes.restURL != undefined && i.attributes.restURL != '' && i.attributes.restURL != null) {
          urlArr.push(i.attributes.restURL)
        }
      });

      if(currentlayer.checked == false)
        this.uncheckLayer(currentlayer,currentlayer.checked,parentUrl,myMap);

      if (urlArr.length > 0) {
        this.controlMap(urlArr, checkedUrl, true, parentsLayers,myMap); ////arr 与checkedUrl都为数组，长度一样，arr为勾选的所有图层的属性，checkedUrl 为勾选的所有图层的url
      }
      //子图层处理
      if (res.length > 0) {
        for (let i in res) {
          if (res[i].attributes.serviceType == "ArcGISSubLayer") {
            let tracksId = res[i].attributes.layerSort;
            let checked = res[i].checked;

            for (let m in g_mapUrl) {
              if (res[i].attributes.parentId == g_mapUrl[m].rid) {
                let parentLayerUrl = g_mapUrl[m].url;
                myMap.allLayers.find(function (layer) {
                  if (layer.url === parentLayerUrl) {
                    layer.visible = checked
                    layer.allSublayers.find(function (sublayer) {
                      if (sublayer.id === tracksId) {
                        sublayer.visible = checked;
                      }
                    });
                  }
                });
              }
            }
          }
        }
      }
    },

    //去掉勾选项，关闭图层的显示
    uncheckLayer(currentLayer,checked,parentsLayers,myMap) {
      let _this = this;
      if (currentLayer.attributes.restURL == "" && currentLayer.attributes.serviceType == "ArcGISSubLayer" && parentsLayers!=undefined) {
        let tracksId = currentLayer.attributes.layerSort;
        for(let j=0;j<myMap.allLayers.length;j++) {
          let temp = myMap.allLayers.items[j];
          if (temp.url == "" || temp.url == undefined)
            continue;

          if (temp.url === parentsLayers) {
            if(temp.capabilities == undefined || temp.capabilities.exportMap == null || temp.capabilities.exportMap.supportsSublayerVisibility) {
              temp.allSublayers.find(function (sublayer) {
                if (sublayer.id === tracksId) {
                  sublayer.visible = checked;
                }
              });
            }

            let isAllHide = true;
            for (let j = 0; j < temp.allSublayers.length; j++) {
              let mysublayer = temp.allSublayers.items[j];
              if (mysublayer.visible) {
                isAllHide = false;
                break;
              }
            }
            if (temp.allSublayers.length > 0 && isAllHide) {
              temp.visible = checked;
            }
            break;
          }
        }
      } else if (currentLayer.attributes.restURL != '' && currentLayer.attributes.restURL != undefined) {
        for(let k=0;k<myMap.allLayers.length;k++) {
          let temp = myMap.allLayers.items[k];
          if (temp.url == "" || temp.url == undefined)
            continue;

          if (temp.url === currentLayer.attributes.restURL) {
            temp.visible = checked;
            if (temp.allSublayers != undefined && temp.allSublayers.length > 0) {
              if(temp.capabilities == undefined || temp.capabilities.exportMap == null || temp.capabilities.exportMap.supportsSublayerVisibility) {
                temp.allSublayers.find(function (sublayer) {
                  sublayer.visible = checked;
                });
              }
            }
            break;
          }
        }
      } else if (currentLayer.attributes.restURL == '' && currentLayer.attributes.serviceType == 'UnKnowLayer') {
        if (currentLayer.attributes.children != undefined && currentLayer.attributes.children.length > 0) {
          currentLayer.attributes.children.map((item)=>{
            _this.uncheckLayer(item,checked,undefined,myMap);
          });
        }else if(currentLayer.children != undefined && currentLayer.children.length>0){
          currentLayer.children.map((item)=>{
            _this.uncheckLayer(item,checked,undefined,myMap);
          });
        }
      }
    },

    //添加图层到地图
    addLayerToMap(currentUrl,myMap){
      if(currentUrl == "" || currentUrl == undefined)
        return;

      let url= currentUrl;
      let exist = false;
      for(let i=0;i< myMap.allLayers.items.length;i++){
        if(myMap.allLayers.items[i].url == url){
          exist = true;
          myMap.allLayers.items[i].visible = true;
          break;
        }
      }
      if(!exist) {
        let index = window.allUrlArray.indexOf(url);
        if(index != -1){
          let layer = window.allSortMapLayers[index];
          let otherIndex = myMap.allLayers.length -1;
          let insertIndex = 0;
          let hasFound = false;
          for(let j=0;j<myMap.allLayers.length;j++){
            let tempUrl = myMap.allLayers.items[j].url;
            if(tempUrl == "" || tempUrl == null)
              continue;

            let tempIndex = window.allUrlArray.indexOf(tempUrl);
            if(tempIndex > index) {
              insertIndex = j > 0 ? j : 0;
              hasFound = true;
              break;
            }
          }
          if(!hasFound)
            insertIndex = otherIndex;
          let copyLayer = this.copyLayerInfo(layer);
          myMap.add(copyLayer,insertIndex) ;
        }
      }
    },

    copyLayerInfo(layer){
      let copyLayer;
      if(layer.type == "map-image"){
        if(layer.sublayers && layer.sublayers.length >0) {
          copyLayer = new this.MapImageLayer({
            url: layer.url,
            title: layer.title,
            sublayers: layer.sublayers
          });
        }else{
          copyLayer = new this.MapImageLayer({
            url: layer.url,
            title: layer.title,
          });
        }
      }else if(layer.type == "tile"){
        if(layer.sublayers && layer.sublayers.length >0) {
          copyLayer = new this.TileLayer({
            url: layer.url,
            title: layer.title,
            sublayers: layer.sublayers
          });
        }else {
          copyLayer = new this.TileLayer({
            url: layer.url,
            title: layer.title,
          });
        }
      }
      return copyLayer;
    },

    changeMap(checkedLayers,current, index) {
      let subLayerParentName = "";
      let parentsLayers = [];
      this.checkedUrl = [];
      this.checkRes = checkedLayers;
      if (checkedLayers.length > 0) {
        for (let i in checkedLayers) {
          if (checkedLayers[i].attributes.serviceType == "ArcGISSubLayer") {
            for (let m in g_mapUrl) {
              if (checkedLayers[i].attributes.parentId == g_mapUrl[m].rid) {
                let parentLayerUrl = g_mapUrl[m].url;
                if (parentsLayers.indexOf(parentLayerUrl) < 0) {
                  parentsLayers.push(parentLayerUrl);
                }
              }
            }
          }
        }
      }

      let toAddRestUrl = current.attributes.restURL;
      if (current.attributes.restURL == "" || current.attributes.serviceType == "ArcGISSubLayer") {
        let currentParentId = current.attributes.parentId;
        if(currentParentId != "-1") {
          for (let i = 0; i < g_mapUrl.length; i++) {
            let info = g_mapUrl[i];
            if (info.rid == currentParentId) {
              toAddRestUrl = info.url;
              subLayerParentName = info.title;
              break;
            }
          }
        }
      }
      if (current != undefined && current != null && current.checked == true) {
        let titleDom = document.getElementById("headTitle" + (index + 1));
        if (titleDom != undefined && titleDom != null) {
          titleDom.innerText = current.title;
        }
      }

      if(toAddRestUrl != "" && toAddRestUrl != undefined) {
        let result = this.checkedPerMaps.find((r) => {
          return r.id == index && r.url == toAddRestUrl && r.name == current.attributes.layerName;
        });
        if (!result)
          this.checkedPerMaps.push({
            id: index,
            checked: current.checked,
            url: toAddRestUrl,
            name: current.attributes.layerName
          });
        else
          result.checked = current.checked;
      }

      let map = this.views[index].map;
      this.addLayerToMap(toAddRestUrl, map);
      if (current.checked == true && current.attributes.restURL != "" && current.attributes.serviceType != "ArcGISSubLayer") {
        this.checkedUrl.push(current.attributes.restURL)
      } else if (current.checked == true && current.children.length > 0) {
        this.traversal(current.children,map,index);
      }
      let checkedUrl = this.checkedUrl;
      this.getLayerOptions(this.checkRes, checkedUrl, parentsLayers, current, toAddRestUrl, subLayerParentName, map);

    },

    initLayerListData(data, index) {
      let _this = this;
      data.map(r => {
        this.$set(r, "checked", false);
        if (r.attributes.restURL != "" && r.attributes.serviceType != "UnKnowLayer") {
          for (let m in this.layerCompareData) {
            if ( this.screenLength ==  parseInt(this.layerCompareData[m].screenLength) && parseInt(this.layerCompareData[m].winIndex) == index + 1 ) {
              for (let x in this.layerCompareData[m].containLayerList) {
                if ( r.attributes.restURL == this.layerCompareData[m].containLayerList[x].restURL && r.attributes.layerName == this.layerCompareData[m].containLayerList[x].layerName ) {
                  this.$set(r, "checked", true);
                }
              }
            }
          }
          if(_this.checkedPerMaps.length >0) {
            _this.checkedPerMaps.find((k) => {
              if (k.id == index && k.url == r.attributes.restURL && k.name == r.attributes.layerName)
                this.$set(r, "checked", k.checked);
            });
          }
        }
        if (r.children.length > 0) {
          this.initLayerListData(r.children, index);
        }
      });
    },

    initMap() {
      this.length = [];
      this.allMapLayerDatas =[];
      this.checkedPerMaps =[];
      for (let i = 0; i < this.screenLength; i++) {
        this.length.push({});
        let layerList = JSON.parse(JSON.stringify(window.g_layerList));
        this.allMapLayerDatas.push(layerList);
      }
    },

    //从绘制图层里面复制图形到对比窗口，直接将下面地图的图形放到对比窗口，关闭窗口之后，导致下面地图的图形消失
    copyGraphicsToLayer(graphicslayer,graphics){
      if(graphics != null && graphics != undefined && graphics.length>0){
          let copyArray = [];
          for(let i=0;i<graphics.length;i++){
            let current=graphics.items[i];
            let gra = current.clone();
            copyArray.push(gra);
          }
          graphicslayer.addMany(copyArray);
      }
    },

    createMapInfo(){
      let _this = this;
      loadModules(
        [
          "esri/layers/TileLayer",
          "esri/widgets/LayerList",
          "esri/layers/MapImageLayer",
          "esri/layers/GraphicsLayer",
          "esri/Map",
          "esri/views/MapView",
          "esri/widgets/Expand"
        ],
        options
      ).then(
        ([
           TileLayer,
           LayerList,
           MapImageLayer,
           GraphicsLayer,
           Map,
           MapView,
           Expand
         ]) => {
          this.views = [];
          this.LayerList = LayerList;
          this.Expand = Expand;
          //定义一个数据来存放创建多个view，以便后面来批量进行进行操作
          let allDrawedGraphics= window.g_drawLayer.graphics; //所有绘制的图形
          let allImportGraphics = window.g_regionLayer.graphics; //导入的图形
          //根据需要来创建多个视图并绑定地图容器div的id
          for (let i = 0; i < _this.screenLength; i++) {
            let winIndex = i + 1;
            //创建一个map
            let map = new Map({
            });
            let myGraphicLayer = new GraphicsLayer();
            if(allDrawedGraphics != undefined && allDrawedGraphics.length>0) {
              _this.copyGraphicsToLayer(myGraphicLayer,allDrawedGraphics);
            }
            if(allImportGraphics != undefined && allImportGraphics.length>0) {
              _this.copyGraphicsToLayer(myGraphicLayer,allImportGraphics);
            }
            _this.showDefaultBaseMap(winIndex);

            let titleDom = document.getElementById("headTitle"+(winIndex));
            if(titleDom != undefined && titleDom != null){
              titleDom.innerText = _this.baseMap[0].name;
            }
            let defaultLayers = [];
            for (let i = 0; i < _this.baseMap.length; i++) {
              for (let j = 0; j < window.g_mapUrl.length; j++) {
                if (_this.baseMap[i].url == window.g_mapUrl[j].url) {
                  let layer = window.g_mapUrl[j];
                  let cloneLayer = null;
                  if (layer.type == 'ArcGISDynamicMapServiceLayer' && layer.url != "" && layer.sublayers.length == 0) {
                    cloneLayer = new MapImageLayer({
                      url: layer.url,
                      title: layer.title
                    });
                  } else if (layer.type == 'ArcGISDynamicMapServiceLayer' && layer.url != "" && layer.sublayers.length > 0) {
                    cloneLayer = new MapImageLayer({
                      url: layer.url,
                      title: layer.title,
                      sublayers: layer.sublayers
                    });
                  } else if (layer.url != "" && layer.sublayers.length > 0) {
                    cloneLayer = new TileLayer({
                      url: layer.url,
                      title: layer.title,
                      sublayers: layer.sublayers
                    });
                  } else if (layer.url != "" && layer.sublayers.length == 0) {
                    cloneLayer = new TileLayer({
                      url: layer.url,
                      title: layer.title
                    });
                  }
                  defaultLayers.push(cloneLayer);
                  break;
                }
              }

              //设置到要展示的图层列表里面
              let result = _this.checkedPerMaps.find((r) => {
                return r.id == i && r.url == _this.baseMap[i].url && r.name == _this.baseMap[i].name;
              });
              if(!result) {
                _this.checkedPerMaps.push({
                  id: i,
                  checked: true,
                  url: _this.baseMap[i].url,
                  name: _this.baseMap[i].name
                });
              }else
                result.checked = true;
            }
            defaultLayers.push(myGraphicLayer);
            map.layers.addMany(defaultLayers);

            //特别添加，删除之前div里面的内容
            let currenId = _this.id + (i+1);
            // document.getElementById(currenId).innerHTML = "";
            //清除

            let view = new MapView({
              map: map,
              container: currenId,
              extent: window.g_view.extent,
              ui: {
                components: []
              },
              constraints: {
                rotationEnabled: false,
                snapToZoom:false,
                maxScale: 0,
              }
            });
            _this.views.push(view);
            view.on("pointer-down",(evt)=>{
              _this.closeLayerCatalog(i);
            });
            _this.createDrawInfo(view,myGraphicLayer);
          }
          _this.views.forEach(function(view) {
            //定义一个范围变量
            let fullextent = null;
            //监听动画事件
            view.watch("animation", (response)=> {
              if(response && response.state === "running"){}
              else{
                //获取操作图层的范围
                fullextent = view.extent;
                //遍历所有视图来设置这个范围
                _this.views.forEach(function(nview) {
                  nview.extent = fullextent;
                });
              }
            });
            //设置鼠标滚轮事件
            view.on("mouse-wheel", function(e) {
              //延迟获取范围的函数
              window.setTimeout(function() {
                //获取操作图层的范围
                fullextent = view.extent;
                _this.addExtent(view.extent);
                _this.currentScale = view.scale;

                //遍历所有视图来设置这个范围
                _this.views.forEach(function(nview) {
                  nview.extent = fullextent;
                });
              }, 100);
            });
            //设置鼠标拖拽事件
            view.on("drag", function(e) {
              //获取操作图层的范围
              fullextent = view.extent;
              _this.addExtent(view.extent);
              //遍历所有视图来设置这个范围
              _this.views.forEach(function(nview) {
                nview.extent = fullextent;
              });
            });
          });
        }
      );
    },

    //默认显示的底图
    showDefaultBaseMap(winIndex) {
      this.baseMap =[];
      if(this.layerCompareData != null && this.layerCompareData.length>0) {
        for (let m in this.layerCompareData) {
          if (this.screenLength == parseInt(this.layerCompareData[m].screenLength) && winIndex == parseInt(this.layerCompareData[m].winIndex)) {
            let layerList = this.layerCompareData[m].containLayerList;
            for (let x in layerList) {
              this.baseMap.push({url: layerList[x].restURL, type: layerList[x].serviceType, name: layerList[x].layerName});
            }
            break;
          }
        }
      }
      if(this.baseMap.length<=0){
        if (g_MapConfig.baseConfig.webgisBasemap) {
          this.baseMap = g_MapConfig.baseConfig.webgisBasemap;
        } else {
          this.$msg.error("请在地图基本设置中设置底图:webgisBasemap");
          console.log("请在地图基本设置中设置底图:webgisBasemap");
        }
      }
    },

    closeLayerCatalog(index){
      let panelIsShow ="none";
      switch(index) {
        case 0:
          this.panle0=panelIsShow
          break;
        case 1:
          this.panle1=panelIsShow
          break;
        case 2:
          this.panle2=panelIsShow
          break;
        case 3:
          this.panle3=panelIsShow
          break;
        case 4:
          this.panle4 = panelIsShow;
          break;
        case 5:
          this.panle5 = panelIsShow;
          break;
      }
    },

    //窗口数目一样的时候，只复制图形
    onlyCopyGraphics() {
      if (this.isShow && this.lastScreenLength == this.screenLength) {
        let allDrawedGraphics = window.g_drawLayer.graphics; //所有绘制的图形
        let allImportGraphics = window.g_regionLayer.graphics; //导入的图形
        let _this = this;
        this.views.map((subview) => {
          for (let i = 0; i < subview.map.allLayers.length; i++) {
            let layer = subview.map.allLayers.items[i];
            if((layer.url == null || layer.url == '') && layer.type == 'graphics'){
              layer.removeAll();
              if(allDrawedGraphics != undefined && allDrawedGraphics.length>0) {
                _this.copyGraphicsToLayer(layer,allDrawedGraphics);
              }
              if(allImportGraphics != undefined && allImportGraphics.length>0) {
                _this.copyGraphicsToLayer(layer,allImportGraphics);
              }
            }
          }
          subview.extent = window.g_view.extent; //范围复制
        });
      }
    },

    mergePrintImgs(){
      this.imgsPath = [];
      this.print(0);
    },

    //导出图片
    executeMergeImages(){
        bus.$emit('setLoad', {
          statue: false,
          msg: '打印生成中...'
        });
      if(this.imgsPath.length>0){
        let temp_form = document.createElement("form");
        document.body.appendChild(temp_form);
        temp_form.action = mergePrintImages;
        temp_form.method = "post";
        temp_form.style.display = "none";
        for(let i=0;i<this.imgsPath.length;i++) {
          let paramField = this.generateHideElement("fileList", this.imgsPath[i]);
          temp_form.appendChild(paramField);
        }
        temp_form.submit();
        document.body.removeChild(temp_form);
      }
    },

    generateHideElement(name, value) {
      let tempInput = document.createElement("input");
      tempInput.type = "hidden";
      tempInput.name = name;
      tempInput.value = value;
      return tempInput;
    },

    print(index) {
      if(index>= this.screenLength) {
        this.executeMergeImages();
        return;
      }

      let _this = this;
      let printData = [];
      let printTemplateName = this.templateName;
      let scaletext = "1:" + this.currentScale.toString();
      let printTitle = document.getElementById("headTitle"+(index+1)).innerText;
      printData.push({titleText: printTitle});
      printData.push({scaletext: scaletext});
      printData.push({author: this.realName});

      loadModules(
        [
          "esri/tasks/PrintTask",
          "esri/tasks/support/PrintParameters",
          "esri/tasks/support/PrintTemplate",
        ],
        options
      ).then(([PrintTask, PrintParameters, PrintTemplate]) => {

        let currentView = _this.views[index];
        bus.$emit('setLoad', {
          statue: true,
          msg: '打印生成中...'
        });
        let printTask = new PrintTask({
          url: _this.analysisurl_print
        });

        let template = new PrintTemplate({
          format: _this.costomFormat,
          exportOptions: {
            dpi: 96
          },
          layout: printTemplateName,
          layoutOptions: {
            titleText: printTitle,
            customTextElements: printData
          }
        });

        let params = new PrintParameters({
          view: currentView,
          template: template
        });

        printTask.execute(params).then(function (evt) {
          let myUrl = evt.url;
          if(myUrl.startsWith("http://localhost:8080"))
            myUrl = myUrl.replace("http://localhost:8080","http://192.168.10.115:6080");
          _this.imgsPath.push(myUrl);
          _this.print(index + 1);

        }, function (evt) {
          bus.$emit('setLoad', {
            statue: false,
            msg: '打印生成中...'
          });
          console.log(evt, '打印错误');
          alert("请检查模板:【" + printTemplateName + ".mxd】是否存在！");
        });
      });
    },

    //切换窗口数
    changeMapWinNums(mapWins) {
      this.views = [];
      this.mapClickEvent = [];
      if (mapWins == 2)
        this.selectedCaseName = "默认方案（二窗口）";
      if (mapWins == 3)
        this.selectedCaseName = "默认方案（三窗口）";
      else if (mapWins == 4)
        this.selectedCaseName = "默认方案（四窗口）";
      else if (mapWins == 6)
        this.selectedCaseName = "默认方案（六窗口）";
      bus.$emit('toggleScreen', {show: true, screenLength: mapWins});
    },

    //计算所有外部带入的图形
    computeAllGraphicExtent(){
      let allDrawedGraphics= window.g_drawLayer.graphics; //所有绘制的图形
      let allImportGraphics = window.g_regionLayer.graphics; //导入的图形
      let allExtent = null;
      let allGs =[allDrawedGraphics,allImportGraphics];

      for(let j=0;j<allGs.length;j++) {
        let currentGraphics = allGs[j];
        if (currentGraphics != null && currentGraphics.length > 0) {
          for (let i = 0; i < currentGraphics.length; i++) {
            let currentGra = currentGraphics[i];
            let extent = currentGra.geometry.extent;
            if (allExtent == null)
              allExtent = extent;
            else
              allExtent = allExtent.union(extent);
          }
        }
      }
      if(allExtent != null)
        this.initMapExtent = allExtent;
      else
        this.initMapExtent = g_view.extent;
    },

    onAllMap() {
      if (this.initMapExtent != null) {
        for (let i = 0; i < this.views.length; i++)
          this.views[i].extent = this.initMapExtent;
      }
    },

    //添加历史记录
    addExtent(currentExtent){
      if(JSON.stringify(this.allHistoryExtents).indexOf(JSON.stringify(currentExtent))==-1){
        this.allHistoryExtents.push(currentExtent); // 进行动态的操作
        if(this.allHistoryExtents.length>10){
          this.allHistoryExtents.shift();
        }
        this.extentIndex = this.allHistoryExtents.length-1
      }
    },

    preExtent(){
      if (this.extentIndex >= 1 && this.extentIndex <= this.allHistoryExtents.length - 1) {
        this.extentIndex--
      } else if (this.extentIndex < 1) {
        this.extentIndex = 0
      } else if (this.extentIndex > this.allHistoryExtents.length - 1) {
        this.extentIndex = this.allHistoryExtents.length - 1
      }
      if (this.extentIndex >= 0 && this.extentIndex <= this.allHistoryExtents.length - 1) {
        for (let i = 0; i < this.views.length; i++)
          this.views[i].extent = this.allHistoryExtents[this.extentIndex]
      }
    },

    nextExtentView(){
      if (this.extentIndex >= 0 && this.extentIndex < this.allHistoryExtents.length - 1) {
        this.extentIndex++
      } else if (this.extentIndex < 0) {
        this.extentIndex = 0
      } else if (this.extentIndex >= this.allHistoryExtents.length - 1) {
        this.extentIndex = this.allHistoryExtents.length - 1
      }
      if (this.extentIndex >= 0 && this.extentIndex <= this.allHistoryExtents.length - 1) {
        for (let i = 0; i < this.views.length; i++)
          this.views[i].extent = this.allHistoryExtents[this.extentIndex]
      }
    },

    ISearch(){
      let _this = this;
      for(let i= 0 ;i<this.views.length;i++) {
        let mapView = this.views[i];
        let mapId = this.id + (i + 1);
        let myEvent = this.on(mapView, "click", (e) => {
          if (e.button == 2) { //2为鼠标右键
            document.getElementById(mapId).style.cursor = "auto"; //还原指针
            for (let k = 0; k < _this.mapClickEvent.length; k++)
              _this.mapClickEvent[k].remove(); //移除地图点击事件
            return
          } else if (e.button == 0) {
            _this.executeSingleIdentifyTask(e, mapView); //执行属性查询
          }
        });
        this.mapClickEvent.push(myEvent);
        document.getElementById(mapId).style.cursor = "crosshair"; //改变指针样式
        this.params.tolerance = 3;
        this.params.layerOption = "top";
        this.params.width = mapView.width;
        this.params.height = mapView.height;
        this.params.returnGeometry = true;
      }
    },

    executeSingleIdentifyTask(e,mapView) {
      let layers = mapView.map.allLayers;
      let url = "";
      for (let i = 0; i < layers.length; i++) {
        if (layers.items[i].type == 'graphics')
          continue;
        if (layers.items[i].url != '' && layers.items[i].visible) {
          url = layers.items[i].url;
          break;
        }
      }
      if(url =="" || url== null){
        this.$msg.error("没有可查询的图层")
        return;
      }
      this.params.geometry = e.mapPoint;
      this.params.mapExtent = mapView.extent;
      this.params.layerIds = null;
      this.identifyTask = new this.IdentifyTask(url);
      this.identifyTask.execute(this.params).then((res) => {
        let results = res.results[0].feature;
        this.showSingleIdentifySymbol(results,mapView);
      });
    },

    showSingleIdentifySymbol(feature,mapView){
      let symbol = {
        type: "simple-fill",
        style: "solid",
        color: [0,0,0,0],
        outline: {
          color: [255,0,0],
          width: 3
        }
      };
      let gra
      gra = new this.Graphic({
        geometry: feature.geometry,
        symbol: symbol,
      });

      let graphicsLayer = mapView.map.allLayers.items[mapView.map.allLayers.length-1];
      graphicsLayer.graphics.add(gra);

      for(let k=0;k<this.mapClickEvent.length;k++) {
        this.mapClickEvent[k].remove(); //移除地图点击事件
        let mapId = this.id +(k+1);
        document.getElementById(mapId).style.cursor = "auto"; //改变指针样式
      }
      this.mapClickEvent = [];
      this.showFeatureResult(feature,graphicsLayer,gra);
    },
    //结果展示
    showFeatureResult(feature,graphicslayer,gra){
      bus.$emit("EmitOutsideMapIResult",{geo:feature,layer:graphicslayer,gra:gra});
    },

    createDrawInfo(mapView,graphicsLayer){
      let sketchVM = new this.SketchViewModel({
        view: mapView,
        layer: graphicsLayer,
        polygonSymbol: {
          type: "simple-fill",
          style: "solid",
          color: [0,0,0,0],
          outline: {
            color: [255,0,0],
            width: 1
          }
        }
      });
      this.sketchVMs.push(sketchVM);
      let _this = this;
      sketchVM.on("create", function(event) {
        if (event.state === "complete") {
          _this.endDrawEvent();
          _this.drawLables(event.graphic,graphicsLayer);
        }
      });
    },

    endDrawEvent(){
      for(let i=0;i<this.sketchVMs.length;i++){
        this.sketchVMs[i].cancel();
      }
    },

    //启动绘制图形
    startDrawEvent(){
      for(let i=0;i<this.sketchVMs.length;i++){
        this.sketchVMs[i].create("polygon");
      }
    },

    drawLables(graphic,graphicsLayer) {
      this.computeArea(graphic.geometry,graphicsLayer)
      for(let i=0;i<this.views.length;i++){
        let layerArray = this.views[i].map.allLayers;
        let graLayer = layerArray.items[layerArray.length-1];
        if(graLayer != graphicsLayer){
          let copy = graphic.clone();
          graLayer.add(copy);
        }
      }
    },

    computeArea(geo,graphicsLayer){
      let area;
      let geoSR = geo.spatialReference;
      if (geoSR.isGeographic == true) {
        area = this.geometryEngine.geodesicArea(geo, "square-meters");
      } else {
        area = this.geometryEngine.planarArea(geo, "square-meters");
      }
      if (area < 0) {
        let simplifiedPolygon = this.geometryEngine.simplify(geo);
        if (simplifiedPolygon) {
          if (geoSR.isGeographic == true) {
            area = this.geometryEngine.geodesicArea(simplifiedPolygon, "square-meters");
          } else {
            area = this.geometryEngine.planarArea(simplifiedPolygon, "square-meters");
          }
        }
      }
      this.labelAreas(geo, area,graphicsLayer);
    },

    labelAreas(geom, area,graphicsLayer) {
      let graphic = new this.Graphic({
        geometry: geom.centroid,
        symbol: {
          type: "text",
          color: "black",
          haloColor: "black",
          haloSize: "1px",
          text: area.toFixed(2) + "平方米",
          xoffset: 3,
          yoffset: 3,
          font: {
            size: 14,
            family: "Simsun",//"sans-serif"
          }
        }
      });
      graphicsLayer.add(graphic);
      for(let i=0;i<this.views.length;i++){
        let layerArray = this.views[i].map.allLayers;
        let graLayer = layerArray.items[layerArray.length-1];
        if(graLayer != graphicsLayer){
          let copy = graphic.clone();
          graLayer.graphics.add(copy);
        }
      }
    },

    dealSelectedCase(){
      let selectedInfo =this.allCaseData.find((item)=>{
        return item.caseName == this.selectedCaseName;
      });
      if(selectedInfo) {
        this.layerCompareData = selectedInfo.containCompareInfos;
        this.changeMapWinNums(Number(selectedInfo.screenLength));
      }
    },

    getCaseNameList(res) {
      this.caseNameList = [];
      for (let i = 0; i < res.length; i++) {
        if (this.isSixWinsDisplay == "none" && res[i].caseName.indexOf("六窗口") != -1)
          continue;
        this.caseNameList.push(res[i].caseName);
      }
    },

    reloadCaseInfo(){
      let urlPath = getMultiCompareSettings + "?caseMakerId=" + window.userId;
      this.$get(urlPath).then(res => {  //获取多屏对比默认显示图层
        if (res.length > 0) {
          this.getCaseNameList(res);
          this.allCaseData = res;
        } else {
          console.log("获取多屏对比配置接口异常！");
        }
      });
    }
  },

  mounted() {

    if(configDataInfo.IsNeedSixWinsCompare){
      this.isSixWinsDisplay = "block";
    }
    this.analysisurl_print = g_MapConfig.baseConfig.webgisPrint;
    if (window.parent.realName == null || window.parent.realName == undefined) {
      this.realName = window.parent.parent.realName == undefined ? '测试打印员' : window.parent.parent.realName;
    } else {
      this.realName = window.parent.realName == undefined ? '测试打印员' : window.parent.realName;
    }

    let _this = this;
    this.reloadCaseInfo(); //获取所有多屏对比方案

    document.getElementById("caseSelectId").onchange = function (e) {
      if (this.value) {
        _this.selectedCaseName = this.value;
        _this.dealSelectedCase();
      } else {
        _this.selectedCaseName = ''
      }
    };

    _this.initMap();

    bus.$on("toggleScreen", res => {
      _this.isShow = res.show;

      if (_this.views != null && _this.views.length > 0) {
        for (let i = 0; i < _this.views.length; i++) {
          _this.views[i].destroy();
        }
        _this.views = [];
      }

      if(res.show) {
        //初始化从菜单进来，调用的窗口配置
        if (res.defaultWinInfo) {
          let selectedInfo = this.allCaseData.find((item) => {
            return item.caseName == this.selectedCaseName;
          });
          if (selectedInfo) {
            this.layerCompareData = selectedInfo.containCompareInfos;
          }
        }
        if (_this.screenLength == _this.lastScreenLength) {
          _this.initMap();
          _this.createMapInfo();
        }
        _this.computeAllGraphicExtent();
        if (_this.lastScreenLength == 0) {
          _this.lastScreenLength = res.screenLength;
        }
      }
    });

    //案件保存之后，重新加载方案
    bus.$on("SaveReloadEvent",res=>{
      _this.reloadCaseInfo(); //获取所有多屏对比方案
    });

    loadModules([
        "esri/tasks/IdentifyTask",
        "esri/Graphic",
        "esri/tasks/support/IdentifyParameters",
        "dojo/on",
        "dojo/dom",
        'esri/widgets/Sketch/SketchViewModel',
        "esri/geometry/geometryEngine",
        "esri/layers/TileLayer",
        "esri/layers/MapImageLayer",
      ],
      options
    ).then(([IdentifyTask, Graphic, IdentifyParameters, on, dom, SketchViewModel, geometryEngine, TileLayer, MapImageLayer]) => {
      this.identifyResult = [];
      this.identifyTask = []
      this.params = new IdentifyParameters();
      this.dom = dom
      this.Graphic = Graphic
      this.IdentifyTask = IdentifyTask;
      this.on = on;
      this.SketchViewModel = SketchViewModel;
      this.geometryEngine = geometryEngine;
      this.TileLayer = TileLayer;
      this.MapImageLayer = MapImageLayer;
    })
  },

  watch: {
    screenLength() {
      if(!this.isShow)
        return;

      this.initMap();
      this.createMapInfo();
    }
  }
};
</script>

<style lang="scss" scoped>
#screen {
  width: 100%;
  height: 100%;
  background: #fff;
  position: absolute;
  right: 0px;
  top: 0;
  border: 1px solid #e4e4e4;
  box-sizing: border-box;
  flex-direction: column;
  flex-wrap: wrap;
  /*#screen1,*/
  /*#screen2 {*/
  /*  //   width: 500px;*/
  /*  //   height: 50%;*/
  /*  // .esri-expand__container--expanded{*/
  /*  //     height:350px !important;*/
  /*  // }*/
  /*}*/
  // #screen2 {
  //   box-sizing: border-box;
  //   border-top: 1px solid #e4e4e4;

  // }
  .esri-expand__container.esri-expand__container--expanded {
    // height:350px !important;
    // margin-left:-280px !important;
  }
}

.header {
  height: 30px;
  line-height: 30px;
  padding: 0 15px 0 10px;
  background-color: #3b86e0;

  > p {
    color: #fff;
  }

  .col {
    width: 30px;
    height: 24px;
    line-height: 24px;
    margin-top: 3px;
    margin-right: -10px;
    border-radius: 3px;
    cursor: pointer;
    display: block;
    color: #fff;
    text-align: center;

    &:hover {
      background-color: #2076dd;
    }
  }

}
</style>
