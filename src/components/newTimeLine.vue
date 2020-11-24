<template>
  <div class="outside">
    <sg-button v-show="!isExpand" @click="close" style="cursor: pointer;background-color: rgba(0,0,0,0.8);color: white;border-radius: 6px;margin: 10px">快捷图层</sg-button>
    <div class="timeline" v-show="isExpand">
      <div style="width: 160px">
        <div>
          <div class="buttonLine">
            <div v-for="(item,i) in timeLineData"
                 :key="i"
                 :class="['ydot',{'ydot-active':item===activeItem}]"
                 @click="getItem(i)"
            >
              <div style="margin:10px 10px;cursor: pointer">
                <img v-show="item===activeItem" src="../assets/images/earth-target.png" alt="" style="display: inline-block;width: 20px;height: auto;margin-right: 10px;">
                <img v-show="item!==activeItem" src="../assets/images/earth.png" alt="" style="display: inline-block;width: 20px;height: auto;margin-right: 10px;">
                <span v-if="item != undefined && item != null" style="line-height: 100%">{{item.NodeName}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div :style="{display: displayName,flexDirection: displayDirect,width: displayWidth}">

          <div style="background-color: rgba(0,0,0,0.8);width: 160px;margin-right: 20px;border-radius: 6px;cursor:pointer;color: white;	text-align: center; line-height: 52px;"  @click="close">
            <span>关闭</span>
          </div>
          <div :column="10">
            <div class="x-axis" style="background-color: rgba(0,0,0,0.5);border-radius: 5px;border: 2px solid silver">
              <div style="position: relative;top:10px">
                <i :class="['esri-collapse__icon','left-arr',{'disabled':!hasPrev}]" @click="prev" title="上一页"></i>
                <ul>
                  <li
                    v-for="(item,i) in xAixsShow"
                    :key="i"
                    :class="['xdot',{'xdot-active':item===activeYear}]"
                    @click="getYear(i)">
                    {{item.layerYear}}
                    <i></i>
                  </li>
                </ul>
                <i :class="['esri-collapse__icon','right-arr',{'disabled':!hasNext}]" @click="next" title="下一页"></i>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
  import bus from '../assets/eventBus';
export default {
  name: "newTimeLine",
  data() {
    return {
      activeYear: {}, //x轴选中项
      lastActiveYear:{}, //上一个x轴选中项
      activeItem: {}, //y轴选中项
      xAxisData: [], //x轴的所有项
      xAixsShow: [], //x轴的显示项
      selIndex:0, //当前选择的X轴项序号
      isExpand: false, //是否展开功能
      hasPrev: false, //是否有上一个
      hasNext: false, //是否有下一个
      startIndex: 0, //截取 开始下标
      endIndex: 0, //截取 结束下标
      xAxisCount: 3,//x轴显示项数量
      displayName: 'flex',
      displayDirect: "row",
      displayWidth: "600px",
    };
  },
  watch: {
    activeItem: function(newValue) {
      if (newValue != undefined && newValue != null)
        this.xAxisData = newValue.ContainLayers;
    },
    xAxisData: function(newValue) {
      if (newValue.length > this.xAxisCount) {
        this.hasPrev = true;
        this.startIndex = newValue.length - this.xAxisCount;
        this.endIndex = newValue.length;
        this.xAixsShow = newValue.slice(this.startIndex, this.endIndex);
      } else {
        this.xAixsShow = newValue;
        this.pageSize = 1;
      }
    }
  },
  props: {
    timeLineData: {
      type: Array
    }
  },
  methods: {
    getItem(i) {
      this.xAxisData = this.timeLineData[i].ContainLayers.sort(
        this.compare("layerYear")
      );

      if(this.activeYear.hasOwnProperty("restURL")) {
        this.lastActiveYear = this.activeYear;
      }
      this.activeItem = this.timeLineData[i];
      this.activeYear = this.activeItem.ContainLayers[this.activeItem.ContainLayers.length - 1];
      //连续点击同一个
      if(this.activeYear.hasOwnProperty("restURL") && this.lastActiveYear.hasOwnProperty("restURL") && this.activeYear.restURL == this.lastActiveYear.restURL)
      {
        this.lastActiveYear = {};
      }

      this.addServiceToMap(this.activeYear.restURL);//添加服务到地图
      this.activeYear.checked = true;
      if (this.lastActiveYear != undefined && this.lastActiveYear.hasOwnProperty("restURL"))
        this.lastActiveYear.checked = false;
      this.turnbackView();
      this.hasPrev = false;
      this.hasNext = false;
      bus.$emit("openLayerEvent", this.activeYear, this.lastActiveYear); //触发事件
    },

    changeUrl(url){
       this.addLayer(url)
    },

    getYear(i) {
      if (this.activeYear.hasOwnProperty("restURL")) {
        this.lastActiveYear = this.activeYear;
        this.lastActiveYear.checked = false;
      }
      this.activeYear = this.xAixsShow[i];
      this.addServiceToMap(this.activeYear.restURL);//添加服务到地图
      this.turnbackView();
      this.selIndex = i;
      this.activeYear.checked = true;
      bus.$emit("openLayerEvent", this.activeYear, this.lastActiveYear);
    },

    turnbackView() {
      if (this.activeYear != undefined && this.activeYear.hasOwnProperty("restURL") && this.activeYear.restURL != '') {
        let currentUrl = this.activeYear.restURL;
        for(let i=0;i<g_map.allLayers.length;i++){
          let layer = g_map.allLayers.items[i];
          if (layer.url == currentUrl) {
            layer.visible = true;
            if(layer.capabilities == undefined || layer.capabilities.exportMap == null || layer.capabilities.exportMap.supportsSublayerVisibility) {
              if (layer.allSublayers != undefined && layer.allSublayers != null && layer.allSublayers.length > 0) {
                layer.allSublayers.map((sub) => {
                  sub.visible = true;
                });
              }
            }
            break;
          }
        }
      }
      if(this.lastActiveYear != undefined && this.lastActiveYear.hasOwnProperty("restURL") && this.lastActiveYear.restURL != ''){
        let lastUrl = this.lastActiveYear.restURL;
        for(let j=0;j<g_map.allLayers.length;j++) {
          let layer = g_map.allLayers.items[j];
          if(layer.url == lastUrl) {
            layer.visible = false;
            if(layer.capabilities == undefined || layer.capabilities.exportMap == null || layer.capabilities.exportMap.supportsSublayerVisibility) {
              if (layer.allSublayers != undefined && layer.allSublayers != null && layer.allSublayers.length > 0) {
                layer.allSublayers.map((sub) => {
                  sub.visible = false;
                });
              }
            }
            break;
          }
        }
      }
    },

    addLayer(url){
      this.xAixsShow.map((res)=>{
        g_map.allLayers.find((layer) => {
          if (layer.url == url && layer.visible==false) {
            layer.visible= true;
            if(layer.capabilities == undefined || layer.capabilities.exportMap == null || layer.capabilities.exportMap.supportsSublayerVisibility) {
              if (layer.allSublayers != undefined && layer.allSublayers != null && layer.allSublayers.length > 0) {
                layer.allSublayers.map((sub) => {
                  sub.visible = true;
                });
              }
            }
          }else if(this.lastActiveYear != null && this.lastActiveYear.restURL != undefined && layer.url == this.lastActiveYear.restURL && layer.visible==true){
            layer.visible = false;
            if(layer.capabilities == undefined || layer.capabilities.exportMap == null || layer.capabilities.exportMap.supportsSublayerVisibility) {
              if (layer.allSublayers != undefined && layer.allSublayers != null && layer.allSublayers.length > 0) {
                layer.allSublayers.map((sub) => {
                  sub.visible = false;
                });
              }
            }
          }
        });
      });
    },

    //x轴上一个下一个
    next() {
      this.startIndex++;
      this.endIndex++;
      this.xAixsShow = this.xAxisData.slice(this.startIndex, this.endIndex);
      this.hasPrev = true;
      if (this.endIndex === this.xAxisData.length) this.hasNext = false;
      this.getYear(this.selIndex);
    },

    prev() {
      this.startIndex--;
      this.endIndex--;
      this.xAixsShow = this.xAxisData.slice(this.startIndex, this.endIndex);
      this.hasNext = true;
      if (this.startIndex === 0) this.hasPrev = false;
      this.getYear(this.selIndex);
    },

    compare(property) {
      return function (a, b) {
        let v1 = a[property];
        let v2 = b[property];

        let reg = /[\u4e00-\u9fa5]/g; //判断是否包含中文，如果包含中文，则判断是相等
        if (reg.test(v1) || reg.test(v2)) {
          return 0;
        }

        if (v1.length == v2.length) {
          return v1 - v2;
        } else if (v1.length != v2.length) {
          let value1 = v1.length > 4 ? v1.substring(0, 4) : v1;
          let value2 = v2.length > 4 ? v2.substring(0, 4) : v2;
          let remain = value1 - value2;
          if (remain == 0)
            return v1 - v2;
          else
            return remain;
        }
      };
    },

    close(){
     this.isExpand = !this.isExpand;
    },

    //添加图层服务到地图里面
    addServiceToMap(restUrl) {
      let url = restUrl;
      let exist = false;
      for (let i = 0; i < g_map.allLayers.items.length; i++) {
        if (g_map.allLayers.items[i].url == url) {
          exist = true;
          break;
        }
      }
      if (!exist) {
        let index = window.allUrlArray.indexOf(url); //当前需要添加的服务，在总的集合中的索引位置
        if (index != -1) {
          let layer = window.allSortMapLayers[index]; //当前的图层对象
          let otherIndex = g_map.allLayers.length - 5; //排除添加的5个临时图层
          let insertIndex = 0;
          let hasFound = false;
          for (let j = 0; j < g_map.allLayers.length; j++) {
            let tempUrl = g_map.allLayers.items[j].url;
            if (tempUrl == "" || tempUrl == null)
              continue;

            let tempIndex = window.allUrlArray.indexOf(tempUrl);
            if (tempIndex > index) {
              insertIndex = j > 0 ? j : 0;
              hasFound = true;
              break;
            }
          }
          if (!hasFound)
            insertIndex = otherIndex;
          layer.visible = false;
          window.g_map.add(layer, insertIndex);
        }
      }
    }
  },

  mounted() {
    if(this.timeLineData == undefined || this.timeLineData.length <=0)
      return;

    this.activeItem = this.timeLineData[0];
    if(this.timeLineData[0].ContainLayers != null && this.timeLineData[0].ContainLayers != undefined && this.timeLineData[0].ContainLayers.length >0) {
      this.xAxisData = this.timeLineData[0].ContainLayers.sort(
        this.compare("layerYear")
      );
    }

    let width = document.documentElement.clientWidth * 0.92 - 270;
    let count = Math.floor((width - 300) / 60);
    if (count < 3) {
      count = 3;
      width = 600;
    }
    this.displayWidth = width + 'px';
    this.xAxisCount = count;
  }
};
</script>

<style lang="scss">
  .ydot-active {
    background-color: rgba(0,0,0,0.6);
  }
  .outside {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 99;
    .buttonLine{
      margin: 20px 0px;
      background: rgba(0,0,0,0.5);
    }
    .buttonLine>img{
      margin: 0 20px;
    }
      .buttonLine>div{
      color: white;
      min-height: 40px;
      border: 1px solid #b7b7b7;
    }
    .openStyle{
      background-image: url("../assets/images/open.png");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 34px 40px;
      padding-top: 0px;
      margin-top: 10px;
    }

    .closeStyle{
      background-image: url("../assets/images/cos.png");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 34px 40px;
      padding-top: 0px;
      margin-top: 10px;
    }

    .timeline {
      position:relative;
      padding: 10px 10px 10px 20px;
      border-radius:0px 6px 6px 6px;
      width: 200px;

      ul {
        margin: 0;

        li {
          cursor: pointer;
        }
      }
      .left-arr , .right-arr{
        display: inline-block;
        background: url(../assets/images/left2.png) no-repeat center;
        background-size: 80%;
      }
      .right-arr{
        display: inline-block;
        background: url(../assets/images/right2.png) no-repeat center;
        background-size: 80%;
      }
      .x-axis {
        ul {
          border-top: 2px solid white;
          display: inline-block;
          margin-right: 15px;
          padding: 15px 0px 0px 0px ;
          /*&::before,
          &::after {
            display: inline-block;
            content: "";
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #3d88e0;
            position: relative;
            top: -24px;
          }*/

          &::before {
            margin-right: 15px;
          }

          &::after {
            margin-left: 15px;
          }

          li {
            display: inline-block;
            margin: 0 15px;
            height: 30px;
            position: relative;
          }
          li.xdot{
            color: white;
          }
          li.xdot > i {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: url("../assets/images/location-blue-2.png") no-repeat center;
            background-size: 40%;
            position: absolute;
            top: -36px;
            left: 0px;
          }

          li.xdot-active > i {
            background: url("../assets/images/location-red2.png") no-repeat center;
            width: 40px;
            height: 40px;
            background-size: 40%;
            top: -36px;
            left: 0px;
          }
        }

        i.esri-collapse__icon {
          width: 30px;
          height: 30px;
          text-align: center;
          line-height: 30px;
          margin: 0px 10px;
          /*box-shadow: 0px 0px 5px #3d88e0;*/
          position: relative;
          top: -6px;
          cursor: pointer;
          z-index: 1;
          // &:hover {
          //   background: #3d88e0;
          //   color: #fff;
          // }
          &.disabled {
            pointer-events: none;
            opacity: 0.3;
          }
        }
      }

      .y-axis {
        ul {
          border-left: 3px solid #ddd;
          padding: 50px 0px 10px 5px;
          position: relative;
          left: 2px;
          top: 2px;
          font-size: 14px;

          li.ydot {
            height: 30px;
            margin-bottom: 10px;
            width:120px;

            &::before {
              display: inline-block;
              content: "";
              width: 15px;
              height: 15px;
              background: #fff;
              border: 2px solid #ddd;
              border-radius: 50%;
              position: relative;
              left: -13.5px;
              top: 2px;
              font-style: normal;
            }
          }

          li.ydot-active {
            &::before {
              background: #3d88e0;
              box-shadow: 0px 0px 5px #aaa;
              font-style: oblique;
              color: #FF5555;
            }
          }

          li.ydot-s {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #ddd;
            border-radius: 50%;
            position: absolute;
            bottom: 0px;
            left: -6px;
            cursor: none;
          }
        }
      }
    }
  }
</style>
