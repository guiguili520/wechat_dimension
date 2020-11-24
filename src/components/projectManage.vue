<template>
    <div class="project">
        <div  class="project_tabs">
            <sg-tab   value="2" width="auto" @on-click="onSelect">
                <sg-tab-pane name="1" label="审批">

                </sg-tab-pane>
                <sg-tab-pane name="2" label="储备">

                </sg-tab-pane>
                <sg-tab-pane name="3" label="收藏夹">

                </sg-tab-pane>
            </sg-tab>
        </div>
        <div class="search">
            <sg-form :model="formItem">
                <sg-form-item :label-width="70" label="项目名称："  ::label-width="78">
                    <sg-input v-model="formItem.name" placeholder="请输入项目名称"></sg-input>
                </sg-form-item>
                <sg-form-item :label-width="70" label="区域："  ::label-width="78">
                    <sg-select v-model="formItem.area" @on-change="getArea" placeholder="请输入项目区域">
                        <sg-option v-for="(i,index) in optionArr" :key="index" :value="i.code">{{i.showValue}}</sg-option>

                    </sg-select>
                </sg-form-item>
                <sg-form-item :label-width="70" label="分类"  ::label-width="78">
                    <sg-input v-model="formItem.classify" placeholder="请输入项目分类"></sg-input>
                </sg-form-item>

            </sg-form>
            <sg-button type="primary" size="large" @click="search">查询</sg-button>
        </div>
        <ul class="res_list">
            <li v-if="total==0" class="res_null">暂无数据</li>
            <li v-else v-for="(i,index) in resultArr" :key="index" @click="showPanel(i)">
                <p class="res_list_title">{{i.title}}</p>
                <p class="area">{{i.area}}</p>
                <i :class="['collect',{onCollect:i.collect}]" @click.stop="onCollect(i)"></i>
                <span class="management" >{{i.management}}</span>
            </li>

        </ul>
        <sg-page :total="total" :page-size="6"  show-total size="small" @on-change="changePage" ></sg-page>

        <s-respane v-show="resultPanel" :name="projectMsg.XMMC" @pane-close="closePane" :w="350" :h="752" :y="0" :x="450">
            <div class="project_message">
                <table>
                    <tr>
                        <td>项目编号：</td><td>{{projectMsg.XMBH}}</td>
                    </tr>
                    <tr>
                        <td>项目名称：</td><td>{{projectMsg.XMMC}}</td>
                    </tr>
                    <tr>
                        <td>建设单位：</td><td>{{projectMsg.YDDW}}</td>
                    </tr>
                </table>
            </div>
            <sg-tab   value="0"  @on-click="onSelect2">
                <sg-tab-pane name="0" label="审批记录">

                </sg-tab-pane>
                <sg-tab-pane name="1" label="基本信息">

                </sg-tab-pane>
                <sg-tab-pane name="2" label="所有附件">

                </sg-tab-pane>
            </sg-tab>
            <div class="content" v-show="showContent==0">
                <p class="content_title">
                    <sg-button>控制线检测</sg-button> <sg-button @click="viewmap">查看流程图</sg-button>
                </p>
                <ul class="process_list">
                    <li v-for="(i,index) in projectMsg.record.opinions" :key="index" @click.stop="extend(i)">
                        <div class="li_top">
                            <p>{{i.user}}</p>
                            <p>{{i.time}}</p>
                            <i :class="['esri-icon-up',{icon_extend:i.extend}]" ></i>
                            <b></b>
                        </div>
                        <div :class="['li_bottom_box',{box_extend:i.extend}]">
                              <table class="li_bottom">
                                <tr>
                                    <td colspan="2"> <em></em>{{i.isAgree}}</td>
                                </tr>
                                <tr>
                                    <td> <em></em>意见：</td><td>{{i.opinion}}</td>
                                </tr>
                                <tr>
                                    <td> <em></em>附件：</td><td>{{i.fileCount}}</td>
                                </tr>

                            </table>
                        </div>

                    </li>
                </ul>
            </div>
            <div class="content" v-show="showContent==1">
                <p class="basic_msg">项目编号：{{projectMsg.XMBH}} </p>
                <p class="basic_msg">建设单位：{{projectMsg.basicInfo.YDDW}} </p>
                <p class="basic_msg">建设开始年限： {{projectMsg.basicInfo.JSKSNX}}</p>
                <p class="basic_msg">用地面积： {{projectMsg.basicInfo.YDMJ}}㎡</p>
                <p class="basic_msg">用地性质： {{projectMsg.basicInfo.YDXZ}}</p>
                <p class="basic_msg">项目具体位置： {{projectMsg.basicInfo.XMJTWZ}}</p>
                <p class="basic_msg">建设性质： {{projectMsg.basicInfo.JSXZ}}</p>
                <p class="basic_msg">办件类型： {{projectMsg.basicInfo.BJLX}}</p>
                <p class="basic_msg">所属区域： {{projectMsg.basicInfo.SSQY}}</p>
                <p class="basic_msg">项目描述： {{projectMsg.basicInfo.XMMS}}</p>
                <p class="basic_msg">项目类型： {{projectMsg.basicInfo.XMDL}}</p>
                <p class="basic_msg">投资总额： {{projectMsg.basicInfo.TZZE}}</p>
                <p class="basic_msg">重点项目： {{projectMsg.basicInfo.ZDXM}}</p>
                <p class="basic_msg">资金来源： {{projectMsg.basicInfo.ZJLY}}</p>

            </div>
            <ul class="content attachment" v-show="showContent==2">
               <!-- <li>建设用地规划许可申请.pdf <sg-button size="small">下载</sg-button></li> -->
               <li v-if="projectMsg.attachment.length==0" style="text-align:center;">暂无数据</li>
               <li v-else v-for="(i,index) in projectMsg.attachment" :key="index">
                   <!-- {{i.name}} <sg-button size="small">下载</sg-button> -->
                   {{i.name}} <sg-button size="small" @click="downloadFile(i.name,i.url)">下载</sg-button>
                   <!-- {{i.name}} <a class="msg_down" :href="'http://192.168.10.32:8090/'+i.url" target="view_window">下载</a> -->
               </li>
            </ul>

            <!-- <form id="downloadFile" action="http://192.168.10.32:8090/mainWeb/comm/downFileByPath" method="post" target="blank" style="display:none;">
                    <input type="text" :name="downloadName" :id="downloadName" v-model="downloadName">
                    <input type="text" :name="downloadUrl" :id="downloadUrl" v-model="downloadUrl">
            </form> -->
        </s-respane>
    </div>
</template>

<script>
import Vue from 'vue'
import SRespane from '@/components/common/resultPanel'
import {loadModules} from "esri-loader";
import {options} from "@/config";
import {downFileByPath,showWorkFlowTraceDrawing} from '../config/api.js'

import bus from '../assets/eventBus';
import {GET_project_list,Change_collect,GET_message,GET_option,viewMap,projectLocation,get_position} from '../config/api.js'
    export default {

        components:{SRespane},
        data() {
            return {
                formItem:{
                    name:'',
                    area:'',
                    classify:''
                },
                resultArr:[
                    {
                        title:'小城镇综合改革项目郭山南路东段...',
                        area:'翔安区',
                        collect:false,
                        management:'各单位办理'
                    },
                    {
                        title:'小城镇综合改革项目郭山南路东段...',
                        area:'翔安区',
                        collect:false,
                        management:'各单位办理'
                    },
                    {
                        title:'小城镇综合改革项目郭山南路东段...',
                        area:'翔安区',
                        collect:false,
                        management:'各单位办理'
                    },
                    {
                        title:'小城镇综合改革项目郭山南路东段...',
                        area:'翔安区',
                        collect:false,
                        management:'各单位办理'
                    },
                    {
                        title:'小城镇综合改革项目郭山南路东段...',
                        area:'翔安区',
                        collect:false,
                        management:'各单位办理'
                    },
                    {
                        title:'小城镇综合改革项目郭山南路东段...',
                        area:'翔安区',
                        collect:false,
                        management:'各单位办理'
                    },
                ],
                resultPanel:false,
                flowArr:[
                    {
                        title:'集美规划分局',
                        time:'2015-04-22',
                        extend:false,
                        flow1:'打印盖章上传',
                        flow2:'材料齐全，已收全，进入审批流程',
                        flow3:'10个'
                    },
                    {
                        title:'集美规划分局',
                        time:'2015-04-22',
                        extend:false,
                        flow1:'打印盖章上传',
                        flow2:'材料齐全，已收全，进入审批流程',
                        flow3:'10个'
                    },
                    {
                        title:'集美规划分局',
                        time:'2015-04-22',
                        extend:false,
                        flow1:'打印盖章上传',
                        flow2:'材料齐全，已收全，进入审批流程',
                        flow3:'10个'
                    },
                    {
                        title:'集美规划分局',
                        time:'2015-04-22',
                        extend:false,
                        flow1:'打印盖章上传',
                        flow2:'材料齐全，已收全，进入审批流程',
                        flow3:'10个'
                    },
                    {
                        title:'集美规划分局',
                        time:'2015-04-22',
                        extend:false,
                        flow1:'打印盖章上传',
                        flow2:'材料齐全，已收全，进入审批流程',
                        flow3:'10个'
                    },
                    {
                        title:'集美规划分局',
                        time:'2015-04-22',
                        extend:false,
                        flow1:'打印盖章上传',
                        flow2:'材料齐全，已收全，进入审批流程',
                        flow3:'10个'
                    },
                    {
                        title:'集美规划分局',
                        time:'2015-04-22',
                        extend:false,
                        flow1:'打印盖章上传',
                        flow2:'材料齐全，已收全，进入审批流程',
                        flow3:'10个'
                    },
                    {
                        title:'集美规划分局',
                        time:'2015-04-22',
                        extend:false,
                        flow1:'打印盖章上传',
                        flow2:'材料齐全，已收全，进入审批流程',
                        flow3:'10个'
                    },
                ],
                showContent:0,
                menu:2,
                total:0,
                projectMsg:{
                    "XMBH": "",
                    "XMMC": "广州市天河区长兴路天鹅花苑小区扩建项目",
                    "YDDW": "",
                    "attachment": [{
                    "rid":"xxx",
                    "name":"xxx",
                    "url":"xxxx"
                    }
                    ],
                    "basicInfo": {
                        "JSKSNX": "",
                        "XMBH": "",
                        "YDDW": "",
                        "YDMJ": "1000"
                    },
                    "record": [
                        {
                            "fileCount": 0,
                            "isAgree": "拟同意",
                            "opinion": "申报材料按照办事指南要求基本符合，现已上传，请牵头单位初审。（备注：根据市文件要求，纸质材料已取消，请直接审核电子材料）",
                            "time": "2018-11-01 16:19:14",
                            "user": "窗口人员1"
                        },
                        {
                            "fileCount": 0,
                            "isAgree": "同意",
                            "opinion": "经初步审查报建材料符合要求，可以办理，请相关各单位进行初步审核并通过系统给出最终意见，可上传附件材料等。",
                            "time": "2018-11-01 16:39:22",
                            "user": "市规划局"
                        }
                    ],
                    "rid": "e5a36be5-eed7-4f30-8db6-b4cd417f3c65"
                },
                optionArr:[{code:'',showValue:'全部区域'}],
                nowRid:null,
                jsessionid:'',
                processInstanceId:'',
                downloadName:'',
                downloadUrl:'',
                positionUrl:''
            }
        },
        methods:{
            downloadFile(name,url){
              // window.open(encodeURI(`http://192.168.10.32:8090/mainWeb/comm/downFileByPath?fileName=${name}&macroPath=${url}`));
                window.open(encodeURI(`${downFileByPath}?fileName=${name}&macroPath=${url}`));



            },
            onSelect(name){
                console.log(name)
                this.menu=name
                this.getProjectList(name);
            },
            onSelect2(name){
                this.showContent=name
            },
           onCollect(i){

               this.$get(Change_collect,{
                   rid:i.rid,
                   sc:!i.collect
               }).then(res=>{
                   console.log(res)
                   i.collect=!i.collect;
               }).catch(err=>{
                   console.log(err)
               })
           },
           closePane(){
               this.resultPanel=false
           },
           search(){
            //    console.log(this.formItem);
                this.getProjectList(this.menu,1,this.formItem.name,this.formItem.classify,this.formItem.area)
           },
           showPanel(i){
               let _this=this;
                this.resultPanel=true;
                this.nowRid=i.rid;
                this.$get(GET_message,{
                    rid:i.rid
                }).then(res=>{

                    res.record.opinions.map(i=>{
                        i.extend=true
                    })
                    this.processInstanceId=res.record.processInstanceId
                    this.jsessionid=res.record.jsessionid
                     this.projectMsg=res;
                    console.log(this.projectMsg)
                }).catch(err=>{
                    console.log(err)
                })
                //下载文件并定位

                console.log('定位')
                this.$get(get_position,{rid:i.rid}).then(res=>{
                    console.log(res)
                   if(res.code==0){
                        //未获取到控件文件
                        this.$msg.warning(res.message)
                    }else if(res.code==1){
                        // let fileArr=res.result.positionFiles.split(',');
                        // for(let i in fileArr){
                        //     fileArr[i]=res.result.positionFilePath+fileArr[i]
                        // }
                        // let positionFiles=fileArr.join(',');
                        console.log(       {
                            positionFilePath:res.result.positionFilePath,
                            // positionFilePath:'%%jobfiles%/201811/201811210006/',
                            positionFiles:res.result.positionFiles
                            // positionFiles:"%%jobfiles%/201811/201811210006/b32d6033-e47c-4b59-a60e-c8728f05973d.dbf,%%jobfiles%/201811/201811210006/f675036d-9a9a-4c89-bd7c-1f9c1fc1ad8c.prj,%%jobfiles%/201811/201811210006/7f1f0c38-c75b-4471-9d9e-88dd7a70ebee.sbn,%%jobfiles%/201811/201811210006/f9ae9278-2718-4d91-8e6e-0bf8fb5d1461.sbx,%%jobfiles%/201811/201811210006/e0fcad40-de47-49fe-9c23-7f9ccce2efb2.shp,%%jobfiles%/201811/201811210006/2f63046a-3f46-4786-9917-58100c3259fd.shx"

                        })
                        _this.$get(g_MapConfig.panelConfig.projectManage.AnalysisPosition_URL,{
                            positionFilePath:res.result.positionFilePath,
                            // positionFilePath:'%%jobfiles%/201811/201811210006/',
                            positionFiles:res.result.positionFiles
                            // positionFiles:"%%jobfiles%/201811/201811210006/b32d6033-e47c-4b59-a60e-c8728f05973d.dbf,%%jobfiles%/201811/201811210006/f675036d-9a9a-4c89-bd7c-1f9c1fc1ad8c.prj,%%jobfiles%/201811/201811210006/7f1f0c38-c75b-4471-9d9e-88dd7a70ebee.sbn,%%jobfiles%/201811/201811210006/f9ae9278-2718-4d91-8e6e-0bf8fb5d1461.sbx,%%jobfiles%/201811/201811210006/e0fcad40-de47-49fe-9c23-7f9ccce2efb2.shp,%%jobfiles%/201811/201811210006/2f63046a-3f46-4786-9917-58100c3259fd.shx"

                        }).then(rs=>{

                                console.log(rs)
                              if(rs.code==-1){
                                   this.$msg.warning(rs.exception)
                              }else{
                                   this.showSymbol(rs)
                              }
                        }).catch(error=>{
                                console.log(error)
                        })


                    }
                }).catch(err=>{
                    console.log(err)
                })


           },
           getArea(value){
               console.log(value)
           },
           extend(i){
               console.log(i)
              i.extend=!i.extend;
           },
           changePage(page){
               console.log(page)
               this.getProjectList(this.menu,page)
           },
           getProjectList(name=2,page=1,proName='',proType='',ssqy=''){
             this.resultArr = [];
             let busTypeArr=['审批','储备','收藏夹']
             let collect;
            //  busType=项目&page=1&rows=10
            let data={
                    busType:busTypeArr[name-1],
                    page:page,
                    proName:proName,
                    proType:proType,
                    ssqy:ssqy,
                    rows:6
                };
                for(let i in data){
                    if(data[i]==''){
                        delete data[i]
                    }
                }
                this.$get(GET_project_list,data).then((res)=>{
                  console.log(res)
                  this.total=res.total
                  res.rows.map((item,index,arr)=>{
                    if(item.sc==true){
                      collect = true;
                    }else{
                      collect = false;
                    }
                    this.resultArr.push({
                      title:item.xmmc,
                      area:item.ssqy,
                      collect:collect,
                      management:item.hjmc,
                      rid:item.rid,
                    })
                  })
                }).catch(err=>{
                    alert(err)
                })
           },
           getOptions(){
                this.$get(GET_option).then(res=>{
                    console.log(res)
                    this.optionArr=this.optionArr.concat(res)
                }).catch(err=>{
                    console.log(err)
                })
           },
           viewmap(){
               console.log(222)
               let url=`${showWorkFlowTraceDrawing};jsessionid=${this.jsessionid}?processInstanceId=${this.processInstanceId}`;
               window.open(url)

           },
            showSymbol(geo) {
                //
                loadModules(
                ["esri/Graphic", "esri/geometry/SpatialReference"],
                options
                ).then(([Graphic, SpatialReference]) => {
                g_regionLayer.removeAll();
                let symbol = {
                    type: "simple-fill",
                    style: "solid",
                    color: "rgba(138,43,226, 0.8)",
                    outline: {
                    color: "rgba(138,43,226, 1)",
                    width: 1
                    }
                };

                geo.features[0].geometry.type = 'polygon'
                geo.features[0].geometry.spatialReference = g_spatialReference
                let graphic = new Graphic({
                    geometry: geo.features[0].geometry,
                    symbol: symbol
                });
                g_regionLayer.graphics.add(graphic)
                g_view.goTo(graphic.geometry)
                bus.$emit('importRange',graphic)
                })
            }
        },
        mounted(){
            this.getProjectList();
            this.getOptions()
            console.log('测试是否加载')
            console.log(g_MapConfig.panelConfig.projectManage.AnalysisPosition_URL)
            // this.positionUrl=this.AnalysisPosition_URL
        }
    }
</script>

<style lang="scss">
.project{
    // width:350px;
    height:700px;

    // position: absolute;
    // left:178px;
    // top:60px;
    background: #fff;

    // z-index:10;
    .title{
        height:40px;
        background:#3b86e0;
        color:#fff;
        line-height: 40px;
        text-indent:10px;
    }

    .project_tabs{
        margin-top:-20px;
         height:52px;
         .sg-tab-nav-scroll{
             height:52px;
             .sg-tab-nav{
                 width: 100%;
                 height:52px;
                 line-height: 52px;
                 .sg-tab-tab{
                     width:33%;
                     text-align: center;
                 }
             }
         }
        // .sg-menu-horizontal {
        //         height: 52px;
        //         line-height: 52px;
        // }
        // .sg-menu-light.sg-menu-horizontal .sg-menu-item, .sg-menu-light.sg-menu-horizontal .sg-menu-submenu {
        //     width:33.33%;
        //     text-align: center;
        // }
    }
    .search{
        width:329px;
        height:218px;
        margin:15px auto;
        background: #f4f5f6;
        box-sizing: border-box;
        padding:20px 10px 0;
        .sg-form-item{
            margin-bottom:10px;
        }
        .sg-form-item-label{
            text-align: left;
        }
        .sg-btn{
            width:306px;
            margin-top:10px;
        }
    }
    .res_list{
        width:330px;
        // height:348px;
        padding:0;
        margin:0 auto;
        box-sizing: border-box;
        border:1px solid #f0f0f0;
        .res_null{
            line-height: 57px;
            text-align:center;
        }
        li{
            height:57px;
             box-sizing: border-box;
            border-bottom:1px solid #dfdfdf;
            position: relative;
            color:#2e3334;
            font-size: 12px;
            .res_list_title{
                position: absolute;
                width:190px;
                height:12px;
                left:10px;
                top:15px;
                line-height: 12px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .area{
                 position: absolute;
                 width:80px;
                 height:12px;
                 top:36px;
                 left:10px;
                 line-height: 12px;
            }
            .management{
                display: block;
                position: absolute;
                width:100px;
                height:12px;
                line-height: 12px;
                text-align: right;
                color:#3b86e0;
                top:36px;
                right:10px;
            }
            .collect{
                position: absolute;
                display: block;
                width: 16px;
                height:16px;
                top:10px;
                right:24px;
                background:url('../assets/images/star.png') no-repeat;
                cursor: pointer;

            }
            .onCollect{
                background:url('../assets/images/fullStar.png') no-repeat;
            }
        }
        li:last-child{
            border:none;
        }
    }
    .sg-page{

    }
    .project_message{
        width: 329px;
        height: 108px;
        margin:20px 10px 0;
        background: #f4f5f6;
        box-sizing: border-box;
        padding:0 12px;
        overflow: hidden;
        table{
            width:309px;
            height:83px;
            margin:2px 0;
            tr{
                height:28px;

                td:nth-child(1){
                    width:98px;
                    text-indent:10px;
                }
            }
        }
    }
    .dialog-wrap{
        overflow: initial !important;
        padding:0 !important;
    }
    .res-pane{
        // .sg-menu-horizontal {
        //         height: 52px;
        //         line-height: 52px;
        // }
        // .sg-menu-light.sg-menu-horizontal .sg-menu-item, .sg-menu-light.sg-menu-horizontal .sg-menu-submenu {
        //     width:33.33%;
        //     text-align: center;
        // }
          .sg-tab-nav-scroll{
             height:52px;
             .sg-tab-nav{
                 width: 100%;
                 height:52px;
                 line-height: 52px;
                 .sg-tab-tab{
                     width:33%;
                     text-align: center;
                 }
             }
         }
    }
    .content{
        width: 329px;
        height: 506px;
        border: solid 1px #dfdfdf;
        margin:20px auto 0;
        .content_title{
            height:50px;
            border-bottom:solid 1px #dfdfdf;
            button{
                border-radius: 1px;
                margin:9px 0 0 9px;
            }
        }
        .process_list{
            padding-left:33px;
            height:456px;
            overflow-y: auto;
            overflow-x:hidden;
            list-style: none;
           li{
               border-left:1px dashed #dfdfdf;
               padding-bottom:23px;
               cursor: pointer;
                .li_top{
                    height:43px;
                    position: relative;

                    p{
                        text-indent: 35px;
                    }
                    p:nth-child(1){
                        height: 14px;
                        font-size: 14px;
                         line-height: 14px;
                        color: #252525;
                        color: #252525;
                    }
                    p:nth-child(2){
                        height: 12px;
                        font-size: 12px;
                        line-height: 12px;
                        color: #999999;
                        margin-top:11px;
                    }
                    i{
                        position: absolute;
                        top:12px;
                        right:30px;
                        transition: transform 0.5s ease-out;
                        transform: rotateZ(0);
                        cursor: pointer;
                    }
                    .icon_extend{
                        transition: transform 0.5s ease-out;
                        transform: rotateZ(180deg);
                    }
                    b{
                        position: absolute;
                        display: block;
                        width:30px;
                        height:30px;
                        top:0;
                        left:-16px;
                        background-image:url('../assets/images/flow-icon.png');
                        background-repeat: no-repeat;
                        background-position: center;
                    }

                }
                .li_bottom_box{
                    // height:98px;
                    // overflow-y: hidden;
                    width:300px;
                    margin-left:-8px;
                    height:0;
                    overflow: hidden;
                    transition:height .5s;

                    .li_bottom{
                        height:93px;
                        margin:10px 0 0 50px;
                        tr{
                            height:24px;
                            td:first-child{
                                min-width: 43px;
                                vertical-align: top;
                                position: relative;
                                em{
                                    display: block;
                                    width:10px;
                                    height:10px;
                                    background: #dfdfdf;
                                    position: absolute;
                                    left:-50px;
                                    top:5px;
                                    border-radius: 100%;
                                }
                            }
                        }

                    }
                }
                .box_extend{
                    height:auto;

                    transition:height .5s;
                }

           }
           li:first-child{
               margin-top:20px;
           }
        }
        .basic_msg{
            height:26px;
            line-height: 26px;text-indent: 9px;
        }
        .basic_msg:first-child{
            margin-top:10px;

        }
    }
    .attachment{
        padding:0 9px;
        list-style: none;
        li{
            height:39px;
            line-height: 39px;
            border-bottom:1px solid #dfdfdf;
            button{

                float:right;
                margin-top:5px;
            }
            .msg_down{
                float: right;
                padding: 0 5px;
                height: 30px;
                line-height: 30px;
                margin-top: 5px;
                border: 1px solid;
                border-radius: 4px;
            }
        }
    }
}
</style>
