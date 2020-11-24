<template>
  <div id="catalogue">
    <sg-tab value="name1" @on-click="tabClick" :value="tabOpen">
      <sg-tab-pane label="图层目录" name="layers" @on-click="check">
        <div class="flex">
          <sg-input v-model="searchTxt" placeholder="搜索" @input ="queryEvent()" @on-clear="closeResultPanel" ref="searchTxt">
          </sg-input>
        </div>
        <sg-tree ref='tree' :data="data5" show-checkbox :render="renderContent"
                 @on-check-change="check" style="overflow-x: hidden;"></sg-tree>
      </sg-tab-pane>
      <sg-tab-pane label="专题目录" name="thematic" @on-click="checkThematic">
        <sg-tree ref='thematicData' :data="thematicData" show-checkbox :render="renderContentThematic"
                 @on-check-change="checkThematic"></sg-tree>
      </sg-tab-pane>
      <sg-tab-pane label="图例展示" name="legend">
        <div id="legendCon" style="font-size: large"></div>
      </sg-tab-pane>
    </sg-tab>
  </div>
</template>
<script>
  import {loadModules} from "esri-loader";
  import {options} from "../config";
  import bus from '@/assets/eventBus';
  import {GET_Tree_Thematic} from '../config/api.js'
  import ConfigJson from '.././../public/web/config.json'

  export default {
    data() {
      return {
        firstLevelIds:[],
        baseMap: [],
        tabOpen: "layers",
        checkThematicRes: [],
        checkRes: [],
        layerOptions: [],
        Slider: {},
        test1: null,
        checkedNodeKey: null,
        checkedUrl: [],
        checkedUrlThematic: [],
        data5: [],
        thematicData: [],
        data5Thematic: [],
        allMap: [],
        value: 20,
        title: '',
        Query: {},
        toIndex: null,
        initLayerOptions:[],
        searchTxt:"",//搜索内容
        searchResultList:[], //查询过滤结果
        isFirstSearch:true,
        copyLatestData:[], //拷贝的数据
        filterOpts:[],  //过滤时的操作
        currentExpandLever:0 ,// 0指的是不展开
      }
    },

    created() {
    },

    methods: {

      queryEvent() {
        if (this.searchTxt != "" && this.searchTxt != null) {
          if (this.isFirstSearch) {
            this.copyLatestData = JSON.parse(JSON.stringify(this.data5));
            this.isFirstSearch = false;
          }
          let filterArray = [];
          this.loopFilter(this.copyLatestData, filterArray);
          this.data5 = filterArray;
          console.log(filterArray, '过滤的数据');
        } else if (this.copyLatestData.length > 0) {
          this.closeResultPanel();
        }
      },

      loopFilter(nodes,filterArray) {
        if (!(nodes && nodes.length > 0))
          return;

        for (let i = 0; i < nodes.length; i++) {
          let node = nodes[i];
          if(node.attributes.serviceType != 'ArcGISSubLayer' && node.attributes.restURL != "" && node.text.indexOf(this.searchTxt) != -1) {
            filterArray.push(node);
          }else if(node.attributes.serviceType == "UnKnowLayer"){
            this.loopFilter(node.children,filterArray);
          }
        }
      },

      closeResultPanel(){
        if(this.filterOpts.length>0){
          this.loopSetCheckedState(this.copyLatestData);
        }
        this.data5 = this.copyLatestData;
      },

      //同步状态
      loopSetCheckedState(data){
        if(data != null && data.length>0){
          for(let i=0;i<data.length;i++){
            for(let j=0;j<this.filterOpts.length;j++){
              let tempId = this.filterOpts[j].id;
              if(data[i].id == tempId) {
                data[i].checked = this.filterOpts[j].isChecked;
                continue;
              }
            }
            if(data[i].children){
              this.loopSetCheckedState(data[i].children);
            }
          }
        }
      },

      renderContent(h, {root, node, data}) {
        return h('div', {
          style: {
            display: 'inline-block',
            width: '90%',
            height: data.opacity ? '75px' : '',
            position: 'relative'
          },
        }, [
          h('div',{
            style:{
              display:'flex'
            }
          },[
            h('span', {
              class:"mySpan",
              domProps: {
                innerHTML: data.title
              },
              on: {
                'click': () => {
                  this.data5 = this.clearOpacity(this.data5);
                  if (data.attributes.restURL != null && data.attributes.restURL != '') {
                    if (this.title == data.title) {
                      this.$set(data, "opacity", false);
                      this.title = ''
                    } else {
                      this.$set(data, "opacity", true);
                      this.title = data.title
                    }
                  }
                }
              }
            }),
            h('span', {
              style: {
                display: data.attributes.restURL!='' && data.opacity && data.checked  ? 'block' : 'none',
                borderRadius: '4px',
                verticalAlign: 'middle',
                textAlign: 'center',
                marginLeft: '50px',
                color:'red',
                cursor:'pointer',
                textDecoration:'underline'
              },domProps:{
                innerHTML:'置顶'
              },
              on:{
                'click':()=>{
                  if (data.attributes.restURL != null && data.attributes.restURL != '')
                    this.setTop(data);
                }
              }
            }),
            h('span', {
              style: {
                display: data.attributes.restURL!='' && data.opacity && data.checked  ? 'block' : 'none',
                borderRadius: '4px',
                verticalAlign: 'middle',
                textAlign: 'center',
                marginLeft: '20px',
                color:'red',
                cursor:'pointer',
                textDecoration:'underline'
              },domProps:{
                innerHTML:'缩放至图层'
              },
              on:{
                'click':()=>{
                  if (data.attributes.restURL != null && data.attributes.restURL != '')
                    this.zoomToLayer(data.attributes.restURL);
                }
              }
            }),
          ]),
          h('div', {
            style: {
              display: data.attributes.restURL != '' ? 'block' : 'none',
              width: '210px',
              position: 'absolute',
              left: '0px',
              top: '35px'
            },
          }, [
            h('sg-slider', {
              props: {
                value: data.x
              },
              style: {
                display: data.opacity ? 'block' : 'none'
              },
              on: {
                'on-change': (res) => {
                  this.$set(data, "x", res);
                  this.Slider.opacity('url', data.attributes.restURL, res / 100)
                }
              },
            })
          ])
        ]);
      },

      renderContentThematic(h, {root, node, data}) {
        return h('div', {
          style: {
            display: 'inline-block',
            width: '90%',
            height: data.opacity ? '60px' : '',
            position: 'relative'
          },
        }, [
          h('span', {
            domProps: {
              innerHTML: data.label
            },
            on: {
              'click': () => {
                this.thematicData = this.clearOpacity(this.thematicData);
                if (data.restURL != null && data.restURL != '') {
                  if (this.title == data.title) {
                    this.$set(data, "opacity", false);
                    this.title = ''
                  } else {
                    this.$set(data, "opacity", true);
                    this.title = data.title
                  }
                }
              }
            }
          }),
          h('span', {
            style: {
              display: data.children == undefined || data.children.length == 0 ? 'none' : 'inline-block',
              padding: data.children == undefined ? '0' : ' 0 9px',
              borderRadius: '4px',
              background: '#e65653',
              verticalAlign: 'middle',
              textAlign: 'center',
              lineHeight: '14px',
              color: '#fff',
              marginLeft: '32px'
            },
            domProps: {
              innerHTML: data.children != undefined ? data.children.length : ''
            }
          }),
          h('div', {
            style: {
              display: 'block',
              width: '210px',
              position: 'absolute',
              left: '0px',
              top: '35px'
            },
          }, [
            h('sg-slider', {
              props: {
                value: data.x
              },
              style: {
                display: data.opacity ? 'flex' : 'none'
              },
              on: {
                'on-change': (res) => {
                  this.$set(data, "x", res);
                  this.Slider.opacity('url', data.restURL, res / 100)
                }
              },
            })
          ])
        ]);
      },

      //设置为最上面的图层
      setTop(data){
        let otherIndex = g_map.allLayers.length -5;
        for(let j=0;j<g_map.allLayers.length;j++) {
          let cLayer = g_map.allLayers.items[j];
          let tempUrl = cLayer.url;
          if (tempUrl == "" || tempUrl == null)
            continue;

          if(tempUrl == data.attributes.restURL && cLayer.visible == true) {
            let desIndex = otherIndex > 0 ? (otherIndex - 1) : 0;
            g_map.reorder(cLayer, desIndex);
            break;
          }
        }
      },

      zoomToLayer(url){
        let path = url+"?f=json";
        this.$get(path).then((res)=>{
          if(res.hasOwnProperty("fullExtent")) {
            let evp = res.fullExtent;
            g_view.extent = evp;
          }else {
            this.$msg.error("获取当前图层的范围失败");
          }
        });
      },

      getThematicTree(userId) {
        let data = []
        this.$get(GET_Tree_Thematic + userId).then((res) => {
          // console.log(res);
          res.map((item) => {
            item.label = item.thematicName
            this.$set(item, "expanded", false);
            this.$set(item, "checked", false)
            item.childrenLayers.map((i) => {
              i.label = i.layerName
              this.$set(i, "expanded", false);
              this.$set(i, "checked", false)
              this.$set(i, "x", 100)
              return res.childrenLayers
            })
            data.push({
              label: item.thematicName,
              expanded: false,
              checked: false,
              children: item.childrenLayers
            })

            return res
          })
          this.thematicData = data;
          console.log(this.thematicData)
        })
      },

      test(value) {
        this.value = value
      },

      initRes(res) {
        res.map((item) => {

          this.$set(item, "title", item.text); //添加title属性
          this.$set(item, "label", item.text); //添加label属性

          if (this.firstLevelIds.indexOf(item.id) < 0) {
            this.$set(item, "expanded", false)
          } else {
            this.$set(item, "expanded", true)
          }
          this.$set(item, "checked", false); //添加checked属性

          this.baseMap.map((base) => {
            if (item.attributes.restURL === base.url) {
              this.$set(item, "checked", true);
              this.checkRes.push(item.attributes);
              this.checkedUrl.push(base.url);
              let obj = {
                value: base.url,
                label: item.attributes.layerName
              };
              if (JSON.stringify(this.layerOptions).indexOf(JSON.stringify(obj)) == -1) {
                this.layerOptions.push(obj)
              }
            }
          });
          if (item.attributes.restURL != '') {
            this.$set(item, "x", 100)
          }
          if (item.children && item.children.length > 0) {
            this.level++;
            this.initRes(item.children)
          } else if (item.attributes.restURL == '') {
            this.$set(item, "checked", false);
          } else {
            this.$set(item, "x", 100)
          }
        });
        return res
      },

      getAllMap(res) {
        res.map((item) => {
          if (item.attributes.restURL != '' && item.attributes.restURL != null && item.attributes.restURL != "http://192.168.10.115:6080/arcgis/rest/services/DG/Blank/MapServer") {
            this.allMap.push(item.attributes.restURL)
          }
          if (item.children && item.children.length > 0) {
            this.getAllMap(item.children)
          }
        })
      },

      getCheckedLayers(res) {
        res.map((item) => {
          if (item.attributes.restURL != '' && item.attributes.restURL != null && item.checked == true) {
            let obj = {
              value: item.attributes.restURL,
              label: item.attributes.layerName
            };
            if(JSON.stringify(this.layerOptions).indexOf(JSON.stringify(obj))==-1){
              this.layerOptions.push(obj)
            }
          }
          if (item.children && item.children.length > 0) {
            this.getCheckedLayers(item.children)
          }
        })
      },

      tabClick(name) {
        if (name == "layers") {
          this.getLayerOptions(this.checkRes, this.checkedUrl)
        } else if (name == "thematic") {
          this.getLayerOptions(this.checkThematicRes, this.checkedUrlThematic)
        }
      },

      clearOpacity(res) {
        res.map((item) => {
          if (item.children && item.children.length > 0) {
            this.clearOpacity(item.children)
          } else {
            this.$set(item, "opacity", false);
          }
        });
        return res
      },

      //在数组中获取某个包含多个属性的对象元素的index
      getArrIndex(arr, currentValue) {
        this.index = null;
        arr.find((value, index) => {
          if (value === currentValue) {
            this.index = index;
          }
        })
        return this.index;
      },

      //获取插入的index,即第一个graphics前面一个index
      getFirstGraphicsIndex(arr) {
        this.index = null;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].type == "graphics") {
            this.index = i - 1;
            break;
          }
        }
        return this.index;
      },

      traversalThematic(current) {
        if (current.length > 0) {
          for (let i = 0; i < current.length; i++) {
            if (current[i].restURL != "") {
              this.addLayerToMap(current[i].restURL); //添加还没有加入到地图的服务
              this.checkedUrlThematic.push(current[i].restURL)
            }
            if (current[i].children != undefined && current[i].children.length > 0) {
              this.traversal(current[i].children)
            }
          }
        }
      },

      checkThematic(res, current) {
        this.checkedUrlThematic = [];
        this.checkThematicRes = res;
        if (current.checked == true && current.children == undefined && current.restURL != "") {
          this.addLayerToMap(current.restURL);
          this.checkedUrlThematic.push(current.restURL)
        } else if (current.checked == true && current.children.length > 0) {
          this.traversalThematic(current.children)
        }
        let checkedUrl = this.checkedUrlThematic;
        this.getLayerOptions(this.checkThematicRes, checkedUrl)
      },

      //勾选节点的单选框
      check(res, current) {

        let subLayerParentName = "";
        let parentsLayers = []
        if (res.length > 0) {
          for (let i in res) {
            if (res[i].attributes.serviceType == "ArcGISSubLayer") {
              for (let m in g_mapUrl) {
                if (res[i].attributes.parentId == g_mapUrl[m].rid) {
                  let parentLayerUrl = g_mapUrl[m].url;
                  if (parentsLayers.indexOf(parentLayerUrl) < 0) {
                    parentsLayers.push(parentLayerUrl)
                  }
                }
              }
            }
          }
        }

        let toAddRestUrl = current.attributes.restURL;
        if(current.attributes.restURL == "" || current.attributes.serviceType == "ArcGISSubLayer"){
          let currentParentId = current.attributes.parentId;
          for(let i=0;i<g_mapUrl.length;i++){
            let info = g_mapUrl[i];
            if(info.rid == currentParentId){
              toAddRestUrl = info.url;
              subLayerParentName = info.title;
              break;
            }
          }
        }

        if(!this.isFirstSearch && toAddRestUrl){
          this.filterOpts.push({id:current.id,isChecked:current.checked});
        }
        this.addLayerToMap(toAddRestUrl); //添加还没有加入到地图的服务

        this.checkedUrl = [];
        this.checkRes = res;
        if (current.checked == true && current.attributes.restURL != "" && current.attributes.serviceType != "ArcGISSubLayer") {
          this.checkedUrl.push(current.attributes.restURL)
        } else if (current.checked == true && current.children.length > 0) {
          this.traversal(current.children);
        }
        let checkedUrl = this.checkedUrl;
        this.getLayerOptions(this.checkRes, checkedUrl, parentsLayers,current,toAddRestUrl,subLayerParentName);
      },

      //添加图层到地图
      addLayerToMap(currentUrl){
        let url= currentUrl;
        let exist = false;
        for(let i=0;i< g_map.allLayers.items.length;i++){
          if(g_map.allLayers.items[i].url == url){
            exist = true;
            break;
          }
        }
        if(!exist) {
          let index = window.allUrlArray.indexOf(url);
          if(index != -1){
            let layer = window.allSortMapLayers[index];
            let otherIndex = g_map.allLayers.length -5;
            let insertIndex = 0;
            let hasFound = false;
            for(let j=0;j<g_map.allLayers.length;j++){
                let tempUrl = g_map.allLayers.items[j].url;
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
            g_map.add(layer,insertIndex) ;
          }
        }
      },

      traversal(current) {
        if (current.length > 0) {
          for (let i = 0; i < current.length; i++) {
            if (current[i].attributes.restURL != "") {
              this.addLayerToMap(current[i].attributes.restURL); //添加还没有加入到地图的服务
              this.checkedUrl.push(current[i].attributes.restURL);
            }
            if (current[i].children.length > 0) {
              this.traversal(current[i].children);
            }
          }
        }
      },

      getLayerOptions(res, checkedUrl, parentsLayers,currentlayer,parentUrl,parentTitle) {

        let urlArr = []
        this.layerOptions = [];
        res.map(i => {
          if (i.restURL != undefined && i.restURL != "") {
            urlArr.push(i.restURL)
            let obj = {
              value: i.restURL,
              label: i.layerName
            };
            if(JSON.stringify(this.layerOptions).indexOf(JSON.stringify(obj))==-1){
              this.layerOptions.push(obj)
            }
          } else if (i.attributes != undefined && i.attributes.restURL != undefined && i.attributes.restURL != '' && i.attributes.restURL != null) {
            urlArr.push(i.attributes.restURL)
            let obj = {
              value: i.attributes.restURL,
              label: i.attributes.layerName
            }
            if(JSON.stringify(this.layerOptions).indexOf(JSON.stringify(obj))==-1){
              this.layerOptions.push(obj)
            }
          }else if(i.attributes != undefined && (i.attributes.restURL == '' || i.attributes.restURL == undefined) && i.attributes.serviceType == "ArcGISSubLayer"){
            if(!parentTitle){
              let find = res.find(function (w) {
                return w.attributes.restURL == parentUrl && w.attributes.serviceType !== "ArcGISSubLayer";
              });
              if(find){
                parentTitle = find.attributes.layerName;
              }
            }
            let obj = {
              value: parentUrl,
              label: parentTitle
            };
            if(JSON.stringify(this.layerOptions).indexOf(JSON.stringify(obj))==-1){
              this.layerOptions.push(obj)
            }
          }
        });

        if(currentlayer && currentlayer.checked == false)
          this.uncheckLayer(currentlayer,currentlayer.checked,parentUrl);

        if (urlArr.length > 0) {
          this.controlMap(urlArr, checkedUrl, true, parentsLayers); ////arr 与checkedUrl都为数组，长度一样，arr为勾选的所有图层的属性，checkedUrl 为勾选的所有图层的url
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
                  g_map.allLayers.find(function (layer) {
                    if (layer.url === parentLayerUrl) {
                      layer.visible = checked;
                      if(layer.capabilities == undefined || layer.capabilities.exportMap == null || layer.capabilities.exportMap.supportsSublayerVisibility) {
                        layer.allSublayers.find(function (sublayer) {
                          if (sublayer.id === tracksId) {
                            sublayer.visible = checked;
                          }
                        });
                      }
                    }
                  });
                }
              }
            }
          }
        }
        bus.$emit('get-layerOptions', this.layerOptions);
      },

      //去掉勾选项，关闭图层的显示
      uncheckLayer(currentLayer,checked,parentsLayers) {
        let _this = this;
        if (currentLayer.attributes.restURL == "" && currentLayer.attributes.serviceType == "ArcGISSubLayer" && parentsLayers!=undefined) {
          let tracksId = currentLayer.attributes.layerSort;
          for(let j=0;j<g_map.allLayers.length;j++) {
            let temp = g_map.allLayers.items[j];
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
          for(let k=0;k<g_map.allLayers.length;k++) {
            let temp = g_map.allLayers.items[k];
            if (temp.url == "" || temp.url == undefined)
              continue;

            if (temp.url === currentLayer.attributes.restURL) {
              temp.visible = checked;
              if(temp.capabilities == undefined || temp.capabilities.exportMap == null || temp.capabilities.exportMap.supportsSublayerVisibility) {
                if (temp.allSublayers != undefined && temp.allSublayers.length > 0) {
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
              _this.uncheckLayer(item,checked);
            });
          }else if(currentLayer.children != undefined && currentLayer.children.length>0){
            currentLayer.children.map((item)=>{
              _this.uncheckLayer(item,checked);
            });
          }
        }
      },

      parseQueryString(url) {
        url = url == null ? window.location.href : url
        let search = url.substring(url.lastIndexOf('?') + 1)
        if (!search) {
          return {}
        }
        // console.log('{"' + decodeURIComponent(search).replace(/"/g, '').replace(/&/g, '","').replace(/=/g, '":"') + '"}' + '图层管理')
        return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
      },

      ////按照图层目录顺序叠加模式（河源需求，勿删！）
      controlMap(arr, checkedUrl, isShow, parentsLayers) {

        let rr = arr.filter(function (x) {
          return x !== undefined;
        });

        if(parentsLayers!=undefined && parentsLayers.length>0){
          for (let i = 0; i < arr.length; i++) {
            if (rr[i] != undefined) {
              g_map.allLayers.find((layer) => {
                if (layer.url == rr[i]) {
                  layer.visible = isShow;
                  if(layer.capabilities == undefined || layer.capabilities.exportMap == null || layer.capabilities.exportMap.supportsSublayerVisibility) {
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
              g_map.allLayers.find((layer) => {
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

      ////按照勾选顺序叠加图层模式（多规需求，勿删！）
      // controlMap(arr, checkedUrl, isShow, parentsLayers) {
      //
      //
      //   let rr = arr.filter(function (x) {
      //     return x !== undefined;
      //   });
      //   if(parentsLayers!=undefined){
      //     for (let i = 0; i < arr.length; i++) {
      //       if (rr[i] != undefined) {
      //         g_map.allLayers.find((layer) => {
      //           console.log(parentsLayers)
      //
      //           if (layer.url == rr[i]) {
      //             layer.visible = isShow
      //             if (parentsLayers.indexOf(layer.url) >= 0 && isShow == false) {
      //               layer.allSublayers.find(function (sublayer) {
      //                 sublayer.visible = isShow;
      //               });
      //             }
      //           }
      //
      //
      //         })
      //       }
      //     }
      //   }else{
      //     for (let i = 0; i < arr.length; i++) {
      //       if (rr[i] != undefined) {
      //         g_map.allLayers.find((layer) => {
      //           if (layer.url == rr[i]) {
      //             layer.visible = isShow
      //           }
      //         })
      //       }
      //     }
      //   }
      //
      //   if (this.toIndex == null) {
      //     this.toIndex = this.getFirstGraphicsIndex(g_map.layers.items)
      //     console.log(this.toIndex)
      //   }
      //   for (let i = 0; i < checkedUrl.length; i++) {
      //     if (checkedUrl[i] != undefined) {
      //       let array2 = g_map.allLayers.items.filter(item => item.url === checkedUrl[i])
      //       if (array2.length > 0 && array2[0].visible != undefined && array2[0].visible == false) {
      //         var getIndex = this.getArrIndex(g_map.layers.items, array2[0]);
      //         var lyr = g_map.layers.getItemAt(getIndex);
      //         g_map.layers.reorder(lyr, this.toIndex);
      //       }
      //     }
      //   }
      // }

      setSpecialChecked(res, selLayer) {
        for(let i=0;i<res.length;i++){
          let item = res[i];
          if (item.children && item.children.length > 0 && item.attributes.restURL == '') {
            this.setSpecialChecked(item.children,selLayer);
          } else if (item.attributes != null && item.attributes != undefined && item.attributes.restURL == selLayer.restURL) {
            this.$set(item, "checked", selLayer.checked);
          }
        }
        return res
      },

      getExpandLever(dataarray,expandlever){
        if(dataarray && dataarray.length>0) {
          if (this.currentExpandLever == expandlever) {
            this.firstLevelIds.push(dataarray[0].attributes.parentId);
            for (let i = 0; i < dataarray.length; i++) {
              this.firstLevelIds.push(dataarray[i].id);
            }
          } else {
            this.currentExpandLever ++;
            for (let i = 0; i < dataarray.length; i++) {
              this.getExpandLever(dataarray[i].children, expandlever);
            }
          }
        }
      }
    },

    mounted() {

      this.getThematicTree(userId); //获取专题图

      this.baseMap = g_MapConfig.baseConfig.webgisBasemap;

      this.userId = window.userId;
      this.Slider = new SgMap.Slider();

      this.firstLevelIds = []; //第一层节点
      this.currentExpandLever = 0;//默认没有展开节点

      if(ConfigJson.LayerExpandLever){
        let expandlever = ConfigJson.LayerExpandLever;
        if(expandlever >0){
          this.currentExpandLever ++;
          if(expandlever >2){
            for(let i in window.g_tree){
              this.firstLevelIds.push(window.g_tree[i].id);
            }
          }
          this.getExpandLever(window.g_tree,expandlever)
        }
      }
      this.data5 = this.clearOpacity(this.initRes(window.g_tree));
      window.g_layerList = this.data5;
      this.getAllMap(this.data5);
      this.getCheckedLayers(this.data5);

      bus.$emit('get-layerOptions', this.layerOptions);

      loadModules([
          "esri/widgets/Legend"
        ],
        options
      ).then(([Legend]) => {
        let legend = new Legend({
          view: g_view,
          container: "legendCon"
        });  //创建图例（资源目录模块中的图例）
        legend.respectLayerVisibility = false;
      });

      let _this = this;
      bus.$on("openLayerEvent",function (current,lastLayer) {
        if(current != undefined && current.restURL != '' && current.restURL != null)
          _this.data5=_this.setSpecialChecked(_this.data5,current);
        if(lastLayer != undefined && lastLayer.restURL != '' && lastLayer.restURL != null)
          _this.data5=_this.setSpecialChecked(_this.data5,lastLayer);
      });
    }
  }
</script>
<style lang="scss">
  #catalogue {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0 20px;
    //margin-top: -10px;
    .timeLine-icon{
        background: url('../assets/images/shijian.png') no-repeat;
    }
    /*.sg-tab-tab{*/
      /*margin-left: 19px;*/
    /*}*/
  }

  .mySpan{
    word-break:normal;
    width:auto;
    display:block;
    white-space:pre-wrap;
    word-wrap : break-word ;
    overflow: hidden ;
  }

  .esri-legend__symbol{
    width: 25px;
    height: 25px;
  }

  .esri-legend__layer-cell--info{
    font-size: 14px !important;
  }
</style>

