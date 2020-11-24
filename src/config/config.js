import axios from 'axios'
import {loadModules} from "esri-loader";
import {options} from "../config";


//权限控制变量
const authPublic = "/public"; //调试用时去权限
//const authPublic = ""; //打包用时加权限

////打包用
const webgisWebService = "http://localhost:8081";
const supervisionWebService = "";
const ConfigUrl = "/webgisWebService/mapProduceMap/public/getAnalysisServiceUrl"; //获取配置
const roleTookits = "/webgisWebService/toolkit"+authPublic+"/roleTookits/" + userId; //获取工具栏权限
const getMapConfig = webgisWebService + "/webgisWebService/mapauthority"+authPublic+"/getRoleFunsInfo/"+ userId;//获取面板权限
const GetWebGisCatalog = webgisWebService + "/webgisWebService/config"+authPublic+"/get/WebGisCatalog"; //获取空间参考、空间范围等基础配置

////调试用
// const webgisWebService = 'http://localhost:8081';//图签，标注，专题树接口
// // // const webgisWebService = 'http://192.168.10.104:8080';//图签，标注，专题树接口
// // const webgisWebService = 'http://36.158.120.8:8090/';//图签，标注，专题树接口
// const supervisionWebService = "http://192.168.10.91:9080";//地图定位，项目列表类接口
// const ConfigUrl = webgisWebService + "/webgisWebService/mapProduceMap/public/getAnalysisServiceUrl"; //获取环境配置
// const GetWebGisCatalog = webgisWebService + "/webgisWebService/config/public/get/WebGisCatalog"; //获取地图基本配置，空间参考、空间范围等基础配置
// const roleTookits = webgisWebService + "/webgisWebService/toolkit/public/roleTookits/" + userId; //获取工具栏权限
// const getMapConfig = webgisWebService + "/webgisWebService/mapauthority/public/getRoleFunsInfo/" + userId;//获取左侧面板权限


window.g_MapConfig ={
  panelConfig:{},//左侧面板配置
  toolsConfig:{},//右侧工具配置
  baseConfig:{} //地图基本配置
}

//获取地图基本配置
axios.get(GetWebGisCatalog).then((res) => {
  let mapConfig = {};
    res.data.map((item) => {
      let configObj = {}
      let name = item.key

      if (item.value !== null)
      {
        try {
          let obj = JSON.parse(item.value)
          if(typeof obj == 'object'&& obj) {
            configObj[name] =obj;
          }else{
            configObj[name] =item.value;
          }
        } catch(e) {
          configObj[name] =item.value;
        }
        let mapConfig2 = Object.assign(mapConfig, configObj);
      }
      window.g_MapConfig.baseConfig = mapConfig //地图基本配置
    })

}).catch((error) => {
  console.log(error, '获取地图基本配置异常！');
  alert("调用地图基本配置异常，请检查接口服务是否正常");
});

//获取左侧面板配置
axios.get(getMapConfig).then(res => {
    let mapConfig = {};
    window.roleFuncs = res;

    if (res.code == -1 || res.exceptionMsg == "当前用户没有功能权限") {
      console.log("没有权限");
    } else {
        mapConfig = initMapConfig(res.data, mapConfig)
    }
});

function initMapConfig(res, mapConfig) {
  res.map((item) => {
    let configObj = {}
    let name = item.panelPath

    if (item.configFilePath !== "") {

      try {
        let obj = JSON.parse(item.configFilePath)
        if(typeof obj == 'object'&& obj) {
          configObj[name] =obj;
        }else{
          configObj[name] =item.configFilePath;
        }
      } catch(e) {
        configObj[name] =item.configFilePath;
      }
      Object.assign(mapConfig, configObj);
    }
    if (item.panelChildren.length > 0) {
      initMapConfig(item.panelChildren, mapConfig)
    }
    window.g_MapConfig.panelConfig = mapConfig //左边面板配置，以功能划分
    return mapConfig
  });
}

loadModules(
  [
    "esri/config",
    "esri/core/urlUtils"
  ],
  options
).then(([esriConfig, urlUtils]) => {

  esriConfig.request.proxyUrl = "/resource-arcgis-proxy/proxy.jsp"; //服务代理
  esriConfig.fontsUrl ="/arcgis_js_api/fonts"; //使用本地的字体库

  urlUtils.addProxyRule({
    urlPrefix: "http://192.168.10.115:6080/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"  //公司的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://192.168.10.91/ArcGIS/rest/services/",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"  //演示机的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://localhost:6080/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"  //演示机的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://192.168.2.40:6080/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://192.168.2.73:6080/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://19.73.12.60:6080/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://19.72.102.73:6080/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://19.72.7.29:6080/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });

  //惠东
  urlUtils.addProxyRule({
    urlPrefix: "http://172.16.223.51:6080/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://172.16.223.33/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://172.16.223.31/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://48.2.26.91/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
  urlUtils.addProxyRule({
    urlPrefix: "http://36.158.120.8:20002/arcgis/rest/services",
    proxyUrl: "/resource-arcgis-proxy/proxy.jsp"//河源现场的代理
  });
})

import fuzhu from '@/assets/images/fuzhu.png'
import xiangmu from '@/assets/images/xiangmu.png'
import chenggui from '@/assets/images/chenggui.png'
import tugui from '@/assets/images/tugui.png'
import yijian from '@/assets/images/yijian.png'
import lianggui from '@/assets/images/lianggui.png'
import shencha from '@/assets/images/shencha.png'
import jiben from '@/assets/images/jiben.png'
import zhongdian from '@/assets/images/zhongdian.png'
import xinxi from '@/assets/images/xinxi.png'
import zidingyi from '@/assets/images/zidingyi.png'
import cad from '@/assets/images/cad.png'
import shp from '@/assets/images/shp.png'
import duopin from '@/assets/images/duopin.png'

let toolClass = {
  system: 0,
  custom: []
}
let customArr = [
  'bookmark',
  'coordinate',
  'label',
  'fullscreen',
  'measure',
  'clear',
  'identify',
  'streetView',
  'screen',
  'customPrint',
  'temporary',
  'printExpand',
  'styleControl',
  'hdmQuery'
]
let systemArr = [
  'printExpand',
]

let toolFlag = false;
let toolsData = {
  bookmark: toolFlag,  //图签管理
  scaleBar: toolFlag,  //比例尺
  fullscreen: toolFlag, //全屏
  printExpand: toolFlag,//默认打印
  measure: toolFlag,//测量
  tools: toolFlag,//基本工具

  coordinate: toolFlag, //坐标输出
  label: toolFlag, //标注
  screen: toolFlag, //分屏
  identify: toolFlag,//属性查询
  streetView: toolFlag,//百度街景
  customPrint: toolFlag, //自定义打印
  temporary: toolFlag, //添加临时图层
  styleControl:toolFlag,//样式控制
  hdmQuery:toolFlag,//横断面分析
  quickLook: toolFlag,//快速查询
  fallingMap: toolFlag, //落图、预览功能
  timeLine:toolFlag, //时间轴
  clear: toolFlag  //清除按钮
}

axios.get(roleTookits).then(
  function (res) {
      if(res.status ==200) {
        window.roleToolkits = res;
        let mapConfig = {};
        res.data.map((item) => {
          toolsData[item.toolPath] = true;
          let configObj = {};
          let name = item.toolPath;
          if (item.configInfo !== null) {
            try {
              let obj = JSON.parse(item.configInfo)
              if (typeof obj == 'object' && obj) {
                configObj[name] = obj;
              } else {
                configObj[name] = item.configInfo;
              }
            } catch (e) {
              configObj[name] = item.configInfo;
            }
            Object.assign(mapConfig, configObj);
          }
          window.g_MapConfig.toolsConfig = mapConfig //地图基本配置
        });
        for (let i in toolsData) {
          if (toolsData[i] && customArr.includes(i)) {
            toolClass.custom.push(i)
          } else if (toolsData[i] && systemArr.includes(i)) {
            toolClass.system += 1
          }
        }
      }
      else {
        alert("获取配置接口出错！")
      }
  }).catch(function (error) {
    console.log(error, '获取地图工具栏接口出错');
    alert("调用地图工具栏接口出错，请检查接口服务是否正常！")
});


let Ctools = [
  {title: '资源目录', name: "资源目录", code: 'catalogue'},
  {title: '信息查询', name: "基本查询", code: './infoQuery'},
  {title: '数据加载', name: "加载CAD", code: './importCad'},
  {title: '项目管理', name: "综合项目管理", code: 'projectManage'},
  {title: '决策分析', name: "辅助选址", code: './auxiliaryLocation'},
  {title: '辅助分析', name: "辅助分析", code: 'fzfx'},
  {title: '高级查询', name: "高级查询", code: 'gjcx'},
  {title: '出图打印', name: "出图打印", code: 'ctdy'},
  {title:'通用查询统计',name:"查询统计",code:'commonStatics'},
  {title: '市政道路统计', name: "道路统计", code: 'szdltj'}
]

let CsearchMode = [
  {name: '基本查询', code: 'infoQuery', img: jiben},
  {name: '重点项目', code: 'majorProjectQuery', img: zhongdian},
  {name: '信息统计', code: 'infoStatistic', img: xinxi},
  {name: '自定义', code: 'customQuery', img: zidingyi},
  {name: '模糊查询', code: 'fuzzy', img: jiben}, // 河源需求
  {name: '加载CAD', code: 'importCad', img: cad},
  {name: '加载SHP', code: 'importShp', img: shp},
  {name: '加载TXT', code: 'importTxt', img: cad},
  {name: '多屏对比', code: 'multiScreenContrast', img: duopin},
  {name: '辅助选址', code: 'auxiliaryLocation', img: fuzhu},
  {name: '项目统计', code: 'constructionProject', img: xiangmu},
  {name: '城乡规划统计', code: 'urbanRuralStatistic', img: chenggui},
  {name: '土地规划统计', code: 'landUseStatistic', img: tugui},
  {name: '一键控制线检测', code: 'controlLineDetection', img: yijian},
  {name: '两规冲突检测', code: 'conflictDetection', img: lianggui},
  {name: '一键合规性审查', code: 'complianceReview', img: shencha},
]

export {webgisWebService, supervisionWebService, toolsData, Ctools, CsearchMode, toolClass, authPublic}

