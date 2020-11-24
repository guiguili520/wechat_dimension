import {webgisWebService,supervisionWebService,authPublic} from './config'
/**webgis服务接口 start**/
  /*权限控制的功能接口 start*/
export const GET_YTimeLayerTrees = webgisWebService + "/webgisWebService/mapauthority" + authPublic + "/getYTimeLayerTrees/"; //获取时间轴数据
export const GetWebGisCatalog = webgisWebService + "/webgisWebService/config" + authPublic + "/get/WebGisCatalog"; //获取空间参考、空间范围等基础配置
export const layersCompare = webgisWebService + "/webgisWebService/compare" + authPublic + "/all"; //多屏对比配置
export const getRoleAnalyseTree = webgisWebService + "/webgisWebService/mapAnalyse" + authPublic + "/roleAnalyseTree/"; //权限控制的辅助分析
export const GET_Tree_Thematic = webgisWebService + "/webgisWebService/mapauthority" + authPublic + "/getRoleThematicInfo/"; //获取专题图树
export const GET_Tree = webgisWebService + "/webgisWebService/mapauthority" + authPublic + "/getRoleLayerTreeInfo/"; //获取图层树
export const GET_RoleFunsInfo = webgisWebService + "/webgisWebService/mapauthority" + authPublic + "/getRoleFunsInfo/"; //获取权限接口
export const SaveUpdata_BookMark = webgisWebService + "/webgisWebService/mapbookmark" + authPublic + "/saveUpdateMapBookMark";  //保存和修改图签或标注
export const Get_BookMark = webgisWebService + "/webgisWebService/mapbookmark" + authPublic + "/getMapBookMarks/createUser/";  //获取图签或标注
export const Get_Label = webgisWebService + "/webgisWebService/mapbookmark" + authPublic +"/getMapLabel/createUser/";  //获取标注
export const Delete_BookMark = webgisWebService + "/webgisWebService/mapbookmark" + authPublic + "/deleteMapBookMark/";  //{rid}删除图签或标注
export const GetQueryCondition_ParentTable = webgisWebService + "/webgisWebService/mapSelfDefineSearch" + authPublic + "/getSelfDefineSearchList/";  //获取自定义查询条件（父表）
  /*权限控制的功能接口 end*/

// export const Get_QueryObject = webgisWebService + "/webgisWebService/globalsearch" + authPublic + "/mapKeyWordSearchList";//模糊查询关键字接口
export const Get_QueryObject = webgisWebService + "/webgisWebService/mapauthority" + authPublic + "/getRoleFuzzySearchInfo";//模糊查询关键字接口
export const Execute_Query = webgisWebService + "/webgisWebService/globalsearch" + authPublic + "/mapKeyWordSearcService";//模糊查询接口
export const GetQueryCondition_ChildTable = webgisWebService + "/webgisWebService/mapSelfDefineSearch" + authPublic + "/getConditionRules/";  //{mapSelfDefineSearchID}获取自定义查询条件（子表)
export const SaveUpdateQueryCondition = webgisWebService + "/webgisWebService/mapSelfDefineSearch" + authPublic + "/saveUpdateSelfDefineSearchRules";  //保存或修改自定义查询条件
export const DeleteQueryCondition = webgisWebService + "/webgisWebService/mapSelfDefineSearch" + authPublic + "/deleteSelfDefineSearchRules/";  //{rid}保存或修改自定义查询条件
export const getAllMapProduceMaps = webgisWebService + "/webgisWebService/mapProduceMap" + authPublic + "/getAllMapProduceMaps";//获取制图模板接口
export const getMapPMDetails = webgisWebService + "/webgisWebService/mapProduceMap" + authPublic + "/getMapPMDetails";//获取配置制图详细内容接口
export const ExportReport = webgisWebService + "/webgisWebService/maptool" + authPublic + "/exportWordService";  //word导出
export const exportCoordinate = webgisWebService + "/webgisWebService/maptool" + authPublic + "/exportText";  //导出坐标
//export const mapAdvanceSearchList  = webgisWebService + "/webgisWebService/mapAdvanceSearch" + authPublic + "/mapAdvanceSearchList";  //获取查询配置记录
export const mapAdvanceSearchList  = webgisWebService + "/webgisWebService/mapauthority" + authPublic + "/getRoleAdvanceSearchInfo";  //获取高级查询配置的关键字记录

export const findMapAsFieldsByPrid  = webgisWebService + "/webgisWebService/mapAdvanceSearch" + authPublic + "/findMapAsFieldsByPrid";  //获取配置查询的查询字段
export const mapAdvanceSearchService  = webgisWebService + "/webgisWebService/mapAdvanceSearch" + authPublic + "/mapAdvanceSearchService";  //高级查询执行服务接口
export const downloadRecordFile  = webgisWebService + "/webgisWebService/mapAdvanceSearch" + authPublic + "/downloadRecordFile";  //档案附件下载服务接口

export const saveMapExportRecords  = webgisWebService + "/webgisWebService/mapExportRecords" + authPublic + "/saveMapExportRecords";  //保存出图操作记录服务接口
export const getTemplatesByRole =webgisWebService+"/webgisWebService/mapProduceMap"+ authPublic +"/getTemplatesByRole"; //根据是否是“信息中心”角色，来分离草图模板和正式模板
export const mergePrintImages = webgisWebService+"/webgisWebService/maptool"+authPublic+"/mergeimgs"; //合并图片

export const getMultiCompareSettings = webgisWebService+"/webgisWebService/compare"+authPublic+"/getsettings"; //获取多屏对比的方案
export const deleteMultiCompareSettings = webgisWebService+"/webgisWebService/compare"+authPublic+"/deleteByCase"; //获取多屏对比的方案
export const saveMultiCompareSettings = webgisWebService+"/webgisWebService/compare"+authPublic+"/saveMore"; //保存多屏对比的方案


//惠东落图
export const GET_POSITION = webgisWebService + '/webgisWebService/webgis/public/conditionlocate';  //定位服务
export const GET_coordinatelocate = webgisWebService + '/webgisWebService/webgis/public/coordinatelocate';  //坐标串定位
export const GET_Map = webgisWebService + '/webgisWebService/webgis/public/addgraphics';  //落图
export const GET_synthesis  = webgisWebService + '/webgisWebService/webgis/public/complexlocate';  //坐标串条件综合预览

export const executeAnalyse = webgisWebService + "/webgisWebService/mapAnalyse/public/executeAnalyse";
export const getAnalysisServiceUrl  = webgisWebService + "/webgisWebService/mapProduceMap/public/getAnalysisServiceUrl";  //获取上传文件服务地址，图层分析地址
export const getExpFlaByName  = webgisWebService + "/webgisWebService/mapProduceMap/public/getExpFlaByName";  //获取编号
export const saveGeometryService  = webgisWebService + '/webgisWebService/maptool'+authPublic+'/saveGeometryService';  //保存临时图层
export const handinvoke  = webgisWebService + "/webgisWebService/maptool/public/handinvoke";  //删除临时图层

export const alllist = webgisWebService+"/webgisWebService/mapISearch"+authPublic+"/alllist";//属性查询
export const GET_ISEARCH_ARCHIVE = webgisWebService+"/webgisWebService/mapISearch"+authPublic+"/getArchive";//属性查询获取档案
export const GET_ISEARCH_DOWNLOAD = webgisWebService+"/webgisWebService/mapISearch"+authPublic+"/downloadFile";//属性查询获取档案
/**webgis服务接口 end**/

/** arcgis服务 start**/
export const Blank = "http://192.168.10.115:6080/arcgis/rest/services/DG/Blank/MapServer"  //厦门空白服务（过滤空白服务用）
/** arcgis服务 end**/

/** 通用模块接口 start**/
export const downFileByPath =supervisionWebService + "/mainWeb/comm/downFileByPath";
export const showWorkFlowTraceDrawing = supervisionWebService + "/workflowWebService/showWorkFlowTraceDrawing";
export const viewMap = supervisionWebService + '/workflowWebService/showWorkFlowTraceDrawing';  //查看流程图
export const projectLocation = supervisionWebService + '/workflowWebService/public/jobQuery/projectLocation';  //获取地图定位文件
/** 通用模块接口 end**/

/** 项目模块接口 start**/
export const GET_project_list = supervisionWebService + '/supervisionWebService/public/jobQuery/getProjectList' //获取项目列表
export const Change_collect = supervisionWebService + '/supervisionWebService/public/jobQuery/collectProject' //修改收藏
export const GET_message = supervisionWebService + '/supervisionWebService/public/jobQuery/getProjectInfo' //获取详情
export const GET_option = supervisionWebService +'/supervisionWebService/public/jobQuery/getChildItemByRootCode?code=ssqy' //获取区域
export const get_position = supervisionWebService + '/supervisionWebService/public/jobQuery/projectLocation' //获取地图定位文件
/** 项目模块接口 end**/

/***  查询统计接口  **/
export const GET_STATICS_URL = webgisWebService+"/webgisWebService/mapstatic"+authPublic+"/getstaticinfo"; //获取可使用的查询统计
export const GET_STATICS_EXECUTE = webgisWebService+"/webgisWebService/mapstatic"+authPublic+"/execute"; //查询统计的执行

/** 道路统计目录接口 **/
export  const GET_STATICS_CATLOG=webgisWebService+"/webgisWebService/mapstatic"+authPublic+"/getroadstaticstree";

