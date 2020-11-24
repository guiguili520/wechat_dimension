<template>
  <div class="customQuery">
        <sg-form :model="formItem" ::label-width="78" class="layerBox">
        <sg-form-item :label-width="70" label="图层:" class="selectLayer">
          <sg-select v-model="formItem.layer_Selected"  @on-change="getFieldOptions" label-in-value>
            <sg-option v-for="layer in layerSelection" :value="layer.value">{{layer.label}}</sg-option>
          </sg-select>
        </sg-form-item>
        <sg-form-item :label-width="70" label="操作符号:" ::label-width="78">
          <sg-select v-model="formItem.field_selected" >
            <sg-option v-for="field in showFields" :value="field.value">{{field.label}}</sg-option>
          </sg-select>
        </sg-form-item>
      </sg-form>
        <p class="btn_box">

            <sg-button  @click="addBtn()">增加</sg-button>
            <sg-button  @click="deleteBtn()">删除</sg-button>
            <sg-button  @click="saveBtn()">保存</sg-button>

        </p>
        <sg-table :show-page="false"
         :columns="upColumns"
         :data="upColumnsData"
          @on-row-click="checkRow"
          :highlight-row="true"
          @on-row-dblclick="onEdit"
          ></sg-table>
        <ul class="edit" v-show="isEdit" @dblclick="saveEdit" :style="{top:top+'px'}">
            <li>
                <sg-select v-model="edit.field" @on-change="setType" :label-in-value="true" >
                    <sg-option v-for="(i,index) in editFiledOption" :key="index" :value="i.value" >{{i.label}}</sg-option>
                </sg-select>
            </li>
            <li>
                <sg-select v-model="edit.symbol" v-if="type=='string'" @on-change="setSymbol" :label-in-value="true" >
                    <sg-option v-for="(i,index) in symbolObject1" :key="index" :value="i.value">{{i.label}}</sg-option>
                </sg-select>
                <sg-select v-model="edit.symbol" v-else @on-change="setSymbol" :label-in-value="true">
                    <sg-option v-for="(i,index) in symbolObject" :key="index" :value="i.value">{{i.label}}</sg-option>
                </sg-select>
            </li>
            <li>
                    <sg-select v-model="edit.value" >
                         <sg-option v-for="(i,index) in valueOptions" :key="index" :value="i.value">{{i.value}}</sg-option>
                    </sg-select>
            </li>

        </ul>
        <p class="btn_box">
            <sg-button @click="query()" >查询</sg-button>
        </p>

        <p>已保存查询条件</p>
        <sg-table :show-page="false" :columns="downColumns" :data="downColumnsData" @on-row-click="showSearchFiled"></sg-table>
         <!-- <sg-modal
            v-model="modal1"
            :closable="false"
            @on-ok="ok"
            @on-cancel="cancel"
            :styles="{width: '280px',height:'208px',top:'182px'}">
            <p slot="header" style="height:30px;line-height:30px;color:#fff;background:#3b86e0;text-indent:13px;font-size:12px;">
               <span>保存</span>
            </p>
            <div style="text-align:center">
                <sg-form :model="formItem2" ::label-width="78" class="layerBox">
                    <sg-radio-group v-model="formItem2.state">
                        <sg-radio :label-width="70" label="add">
                            <span>新增</span>
                        </sg-radio>
                        <sg-radio :label-width="70" label="change">
                            <span>修改</span>
                        </sg-radio>
                    </sg-radio-group>
                    <sg-form-item :label-width="70" label="备注:" ::label-width="45" style="margin-top:20px;">
                            <sg-input v-model="formItem2.remark"  />
                    </sg-form-item>

               </sg-form>
            </div>
            <p slot="footer">
                <sg-button  class="btn_cancel" @click="cancel">取消</sg-button>
                <sg-button  class="btn_ok" type="primary" @click="ok">确定</sg-button>
            </p>
        </sg-modal> -->
        <s-respane v-show="modal1" name="保存" @pane-close="cancel" :w="281" :h="207" class="saveSearch">
            <div style="text-align:center">
                <sg-form :model="formItem2" ::label-width="78">
                    <sg-radio-group v-model="formItem2.state">
                        <sg-radio :label-width="70" label="add">
                            <span>新增</span>
                        </sg-radio>
                        <sg-radio :label-width="70" label="change">
                            <span>修改</span>
                        </sg-radio>
                    </sg-radio-group>
                    <sg-form-item :label-width="70" label="备注:" ::label-width="45" style="margin-top:20px;">
                            <sg-input v-model="formItem2.remark"  />
                    </sg-form-item>

               </sg-form>
            </div>
            <p class="saveSearch_footer">
                <sg-button  class="btn_cancel" @click="cancel">取消</sg-button>
                <sg-button  class="btn_ok" type="primary" @click="ok">确定</sg-button>
            </p>

        </s-respane>
        <s-respane v-show="resultPanelIsShow" name="自定义查询结果" @pane-close="closePane" :w="700" :h="480">

                    <sg-table :show-page="false" :columns="columnsSearch" :data="showResult" height="376" @on-row-click="onMap"></sg-table>
                    <sg-page slot="bottom" :total="serachResult.length"
                        show-total=""
                        show-elevator=""
                        :page-size="7"
                        size="small"
                        @on-change="changePage"
                        class="result_page"
                             style="margin-top: 10px;
    margin-left: 84px;"></sg-page>
        </s-respane>

  </div>
</template>

<script>
import Vue from 'vue'
import CustomQuery from "../classic/widget/CustomQuery";
import SRespane from '@/components/common/resultPanel'
// import {Modal,Radio,RadioGroup,Input,Page} from 'southgisui'
import {SaveUpdateQueryCondition,GetQueryCondition_ParentTable,GetQueryCondition_ChildTable,DeleteQueryCondition} from '../config/api.js'
import bus from '../assets/eventBus'
 // Vue.use(Modal).use(Radio).use(RadioGroup).use(Input).use(Page)
  export default {
    name: "sCustomquery",
    components:{SRespane},
    data() {
      return {
        fieldType:'',
        fields:'',
        modal1:false,
        resultPanelIsShow:false,
        formItem2:{
            state:'',
            remark:''
        },
        type:'',
        pages:0,
        top:182,
        edit:{
            field:'',
            fieldName:'',
            symbol:'',
            symbolName:'',
            value:'',
        },
        onEditIndex:0,
        editFiledOption:[],
        editSymbolOption:[],
        editValueOption:[],
        columnsSearch:[
            {
                title: '行政区代码',
                key: 'XZQDM'
            },
            {
                title: '要素代码',
                key: 'OBJECTID'
            },
            {
                title: '行政区划名称',
                key: 'XZQMC'
            },
            {
                title: '土地用途分区名称',
                key: 'TDYTFQMC'
            },
            {
                title: '用地面积',
                key: 'MJ'
            },
            // {
            //     title: '用地性质',
            //     key: 'YDXZ'
            // }

        ],
        serachResult:[],
        showResult:[],
        splitResult:[],
        geometryArr:[],
        state:'',
        saveData:{},
        tableIndex:null,
        formItem: {
          layer_Selected: '',
          field_selected: ''
        },
        layerSelection: [
          // {
          //   value: "http://192.168.10.115:6080/arcgis/rest/services/DG/CoreData/MapServer/0",
          //   label: "土地利用总体规划规模调出",
          // },
          // {
          //   value: "http://192.168.10.115:6080/arcgis/rest/services/DG/CoreData/MapServer/1",
          //   label: "土地利用总体规划规模调入",
          // },
          {
            value: "",
            label: "土地利用总体规划用途分区",
          }
        ],
        showFields: [
          {
            value: "and",
            label: "全部",
          },
          {
            value: "or",
            label: "部分",
          },
        ],
        layerOption:[],
        layerName:'',
        isEdit:false,
        index:'',
        selectIndex:'',
        selectFiled:'',
        url: "",
        field: "",
        geometry: '',
        Query: '',
        fieldSelected:'',
        upColumnsData:[
        //   {
        //     field:'1',
        //     fieldName:''
        //     symbol:'2',
        //     symbolName:''
        //     value:'3'
        //   }
        ],
        upColumns: [
          {
            title: '字段',
            key: 'fieldName',
            // render: (h, params) => {
            //   return h('div', [
            //     h('sg-select', {
            //       props: {
            //         value:this.upColumnsData[params.index].field,
            //         placeholder: '请选择',
            //       },
            //       on: {
            //         'on-change': (event) => {

            //           this.upColumnsData[params.index].field = event;
            //           this.getFieldValueOptions(event,params.index);
            //           this.fieldSelected = event;
            //            this.getSymbolOptions(event,params.index);
            //         }
            //       }
            //     },
            //       this.fieldOptions[this.indexArr[params.index]].map(function(type) {
            //         return h('sg-option', {
            //           props: {value: type.value}
            //         }, type.label);
            //       })
            //     )
            //   ]);
            // }
          },
          {
            title: '符号',
            key: 'symbolName',
            // render: (h, params) => {
            //   return h('div', [
            //     h('sg-select', {
            //         props: {
            //           value:this.upColumnsData[params.index].symbol,
            //           placeholder: '请选择',
            //         },
            //         on: {
            //           'on-change': (event) => {
            //             this.upColumnsData[params.index].symbol = event
            //           }
            //         }
            //       },
            //       this.symbolOptions[params.index].map(function(type) {
            //         return h('sg-option', {
            //           props: {value: type.value}
            //         }, type.label);
            //       })
            //     )
            //   ]);
            // }
          },
          {
            title: '值',
            key: 'value',
            // render: (h, params) => {
            //   return h('div', [
            //     h('sg-select', {
            //         props: {
            //           value:this.upColumnsData[params.index].value,
            //           placeholder: '请选择',
            //         },
            //         on: {
            //           'on-change': (event) => {
            //             this.upColumnsData[params.index].value= event
            //           }
            //         }
            //       },
            //       this.valueOptions2[params.index].map(function(type) {
            //         return h('sg-option', {
            //           props: {value: type.value}
            //         }, type.label);
            //       })
            //     )
            //   ]);
            // }
          }
        ],
        fieldIndex:'',
        downColumns: [
          {
            title: '所属图层',
            key: 'layer'
          },
          {
            title: '备注',
            key: 'remark'
          },
          {
            title: '操作',
            key: 'handle',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('sg-button', {

                  on: {
                    click: (e) => {
                      console.log(e)
                      e.stopPropagation();//阻止冒泡
                    //   this.remove(params.index);
                      this.deleteDownColumnItem(params.row.rid,params.index)
                    }
                  }
                }, '删除')
              ]);
            }
          }
        ],
        downColumnsData: [

        ],
        countData: [],
        field:[],
        symbolOptions:[[]],
        //记录每一行使用哪一个图层渲染
        indexArr:[],
       valueOptions:[],
        valueOptions2:[[]],
        Query:{},
        parentData:[],
        childData:[],
        symbolObject:[
          {
            value:'=',
            label:'等于'
          },{
            value:'<>',
            label:'不等于'
          },{
            value:'>',
            label:'大于'
          },{
            value:'<',
            label:'小于'
          },{
            value:'<=',
            label:'小于等于'
          },{
            value:'>=',
            label:'大于等于'
          }
        ],
        symbolObject1:[
            {
                value:'=',
                label:'等于'
              },{
                value:'<>',
                label:'不等于'
            }
        ],
        rowRid:''
      }


    },
    mounted(){
      bus.$on('get-layerOptions', (res) => {
        console.log(res)
        this.layerSelection = []
        res.map((item,index,arr)=>{
          this.layerSelection.push({
            value:item.value+"/0",
            label:item.label
          });
        })
        this.layerOption=this.layerSelection
        console.log(this.layerSelection)
      })
      this.Query = new CustomQuery();
      this.getQueryCondition();

      this.Query.event.on({
        'getLayerFieldValueComplete':(res)=>{
          console.log(res)
          this.getFiled(res,this.selectIndex)
        }
      })
      this.Query.event.on({
        'getLayerFieldComplete': (res)=>{
          this.fields = res;
          console.log(res)
          this.getValue(res);
          this.columnsSearch = this.getAllFieldsColumns(this.fields)

        }

      })


      this.Query.event.on({
        'getSerachResComplete' :(res)=>{
          this.serachRes(res)
          this.resultPanelIsShow=true
        }
      })

    },
    methods: {
      getAllFieldsColumns(fields){
        let columns = []
        let tempArray = [];
        for (let i = 0; i < fields.length; i++) {
          if (tempArray.indexOf(fields[i].alias) < 0) {
            tempArray.push(fields[i].alias);
            columns.push({
              title:fields[i].alias,
              key:fields[i].name,
              minWidth:100
            })
          }
        };
        return columns;
      },
        onEdit(rows,index){
          this.isEdit=true
          this.top=182+(index+1)*48;

          this.onEditIndex=index
          this.edit=this.upColumnsData[index]
          //设置当前行符号渲染type
        //   this.type=this.editFiledOption[index].type
        },
        saveEdit(){
            this.isEdit=false

            // this.upColumnsData[this.onEditIndex] =this.edit
            for(let i in this.edit){
                 this.upColumnsData[this.onEditIndex][i]=this.edit[i]
            }

            console.log(this.upColumnsData)
        },
        setType(value){
            console.log(value)

            this.editFiledOption.map((i,idx)=>{
                if(i.value==value.value){
                    this.type=i.type
                     this.getFieldValueOptions(value.value,idx);
                }
            })
            this.edit.fieldName=value.label
            // this.edit.symbol=''
            // this.edit.symbolName=''
            // this.edit.value=''
        },
        setSymbol(value){
            this.edit.symbolName=value.label
        },
      deleteDownColumnItem(rid,index){
        //获取父表
        this.$get(DeleteQueryCondition+rid).then((res)=>{
        //
          console.log(res)
           this.remove(index)
        }).catch((error) => {
          console.log(error)
        })
      },
      getParentTable(){
        this.downColumnsData = []
        this.parentData.map((value,index,array)=>{
          let layer = this.getLabel(this.layerOption,value.restURL);
          this.downColumnsData.push({
            // layer: layer,
            layer: value.coverageName,
            remark: value.desciption,
            operationSymbol:value.operationSymbol,
            rid:value.rid,
            layerValue:value.restURL,
            // upColumnsData:this.upColumnsData,
            indexArr:index,
            fieldOptions:this.fieldOptions,
            valueOptions2:this.valueOptions2,
            // field_selected:this.formItem.field_selected
          })


        })
      },
      getQueryCondition(){
        //获取父表
        this.$get(GetQueryCondition_ParentTable + userId).then((res)=>{
          console.log(res)
          this.parentData = res;
          this.getParentTable();
        }).catch((error) => {
          console.log(error)
        })
      },
      resetOption(data){
        //

        // this.upColumnsData = [];
        this.upColumnsData = []
        this.upColumnsData = this.childData.map((value,index,arr)=>{
          return {
            field:value.conditionName,
            symbol:value.conditionSymbol,
            value:value.conditionValue,
            rid:value.RId
          }

        })
        console.log(this.upColumnsData)
        this.indexArr=data.indexArr
        this.fieldOptions=data.fieldOptions
        this.upColumnsData=this.upColumnsData
        this.valueOptions2=data.valueOptions2
        // this.formItem.layer_Selected=this.childData.conditionName
        this.formItem.field_selected=this.childData[0].restURL
      },
      initData(data){
            this.upColumnsData = []
            //将选项中文名称一并返回。

            this.upColumnsData = data.map((value,index,arr)=>{
                let fieldName,symbolName,type,checkSymbol;
                //还原type  fieldName
                this.fields.map(i=>{
                    if(value.conditionName==i.name){
                        fieldName=i.alias
                        type=i.type
                    }
                })
                // 还原symbolName

                if(type=='string'){
                     checkSymbol=this.symbolObject1
                }else{
                     checkSymbol=this.symbolObject
                }
                checkSymbol.map(i=>{
                    if(i.value==value.conditionSymbol){
                            symbolName=i.label
                    }
                })
                return {
                    field:value.conditionName,
                    fieldName:fieldName,
                    symbol:value.conditionSymbol,
                    symbolName:symbolName,
                    value:value.conditionValue,
                    type:type,
                    rid:value.RId
                }

            })
      },
      getChildTable(rid){
        this.$get(GetQueryCondition_ChildTable+rid).then((res)=>{
          console.log(res)

          this.childData = res;
          this.initData(res)
        }).catch((error) => {
          console.log(error)
        })
      },
      // showSearchFiled(value){
      //   this.resetOption(value);
      //
      // },
      showSearchFiled(item){
        console.log(item)
        this.isEdit=false
        this.rowRid=item.rid
        this.formItem.layer_Selected = item.layerValue
        this.formItem.field_selected = item.operationSymbol
        this.Query.getLayerField(this.formItem.layer_Selected);
        // console.log(value);
        this.getChildTable(item.rid);

        // this.resetOption(value);

      },

      getSymbolOptions(event,index){
        this.symbolOptions[index]=[];
        for(let i = 0;i<this.fields.length;i++){
          if(this.fields[i].name == this.fieldSelected){
            this.fieldType = this.fields[i].type;
            if(this.fieldType !='string'){
              this.symbolOptions[index]=this.symbolObject;
            }else{
              this.symbolOptions[index].push( {
                value:'=',
                label:'等于'
              },{
                value:'<>',
                label:'不等于'
              });
            }
          }
        }

      },
      query(){
          console.log(this.upColumnsData)
          //字段转换   //formItem.field_select 符号
          let str=''
          let url=this.formItem.layer_Selected;
          let temp = []
          for(var m=0;m<this.upColumnsData.length;m++){
            temp.push({
              field:this.upColumnsData[m].field,
              symbol:this.upColumnsData[m].symbol,
              value:this.upColumnsData[m].value
            })
          }
        temp.map((i,index,arr)=>{
              for(let j in i){
                  if(j=='value'){
                    let a= typeof i[j]
                    console.log(a)
                    if(typeof i[j] == 'number'){
                      str +=i[j]
                    }else{
                      str +="'" + i[j] +"'"
                    }

                  }else{
                       str +=i[j]
                  }
              }
              if(index!=arr.length-1){
                   str += " "+this.formItem.field_selected+" ";
              }

          })
        console.log(this.upColumnsData)
          this.Query.getSerachRes(url,str);


      },
      closePane(){
          this.resultPanelIsShow=false
      },
      getIndex(arr,item){
          for(let i in arr){
              if(arr[i].value==item){
                  return i
              }
          }
      },
      getFieldOptions(data){
          //清空选项
          console.log(data)
        this.initOption();
        this.isEdit=false
        //console.log(this.fieldOptions)
        this.layerName=data.label;
        this.index=this.getIndex(this.layerOption,data.value);
        // this.fieldOptions = [];
        this.Query.getLayerField(this.formItem.layer_Selected);

      },

      initOption(){
           this.indexArr=[];
            this.fieldOptions=[];
            this.upColumnsData=[];
            this.symbolOptions=[[]]
            this.valueOptions2=[[]];
            this.fieldOptions = [];
      },

      getFieldValueOptions(event,idx){

         this.selectIndex=idx;
         this.selectFiled=event;
        this.Query.getLayerFieldValue(this.formItem.layer_Selected,event);

      },
      addBtn(){
        if(this.formItem.layer_Selected==''){

           this.$msg.warning('请先选择图层。')
        }else{
            this.indexArr.push(this.index);
           this.symbolOptions.push([]);
            this.upColumnsData.push({
                field:'',
                fieldName:'',
                symbol:'',
                symbolName:'',
                value:''
            })
            this.valueOptions2.push([]);
        }



      },
      saveBtn(){
          this.modal1=true;

      },
      checkRow(res,index){

          this.tableIndex=index;

      },
      deleteBtn(){
          //删除 列表数据,值数据 ,字段图层

        if(this.tableIndex!=null){
            this.upColumnsData.splice(this.tableIndex,1)

            this.indexArr.splice(this.tableIndex,1)

            if(this.valueOptions2.length==1){
                this.valueOptions2[0]=[]
            }


        }

      },
      remove(index) {

        this.downColumnsData.splice(index, 1);
      },
      getFiled(res,index){
        //
         let layerFieldValues = res;

        let valueArray = [];
        // this.upColumnsData[index].value='';
        // this.valueOptions2[index]=[];
        this.valueOptions=[];
        for(let i = 0;i<layerFieldValues.length;i++){
            let fieldValue = layerFieldValues[i].attributes[this.selectFiled];
            if(valueArray.indexOf(fieldValue)<0){
                valueArray.push(fieldValue);

                // this.valueOptions2[index].push({
                //     value:fieldValue,
                // })
                this.valueOptions.push({
                      value:fieldValue,
                })
            }

        }

        console.log(this.valueOptions)
     },
     getValue(res){
        let layerFields = res;
            this.editFiledOption=[]
            for(let i = 0;i<layerFields.length;i++){
                this.editFiledOption.push({
                    value:layerFields[i].name,
                    label:layerFields[i].alias,
                    type:layerFields[i].type
                })
            }
             if(this.fieldOptions[this.index]==undefined){
                 this.fieldOptions[this.index]=[];
                 for(let i = 0;i<layerFields.length;i++){
                    this.fieldOptions[this.index].push({
                        value:layerFields[i].name,
                        label:layerFields[i].alias
                    })

                }
            }


     },
      getLabel(arr,value){
        for(let i in arr){
          if(arr[i].value==value){
            return arr[i].label
          }
        }
      },
     serachRes(res){

         let _this=this, result = [],geometry=[],arr=[];
        // this.serachResult
        //console.log(res)
        this.serachResult=[];
        this.geometry=[];
        res.map((i)=>{
            //   i.attributes.geometry=i.geometry
             _this.serachResult.push(i.attributes)
             arr.push(i.geometry)
        })

        for(let i=0,len=this.serachResult.length;i<len;i+=7){
            result.push(this.serachResult.slice(i,i+7));
            this.geometry.push(arr.slice(i,i+7))
        }
        //console.log(this.serachResult);
        //console.log(result)
        this.splitResult=result;
        this.showResult=this.splitResult[0]

     },
     //弹窗操作
      // ok(){
      //     this.modal1=false
      //     this.saveData={
      //          layer:this.layerOption[this.index],
      //          data:this.upColumnsData,
      //          remark:this.formItem2
      //      }
      //       this.downColumnsData.push({
      //            layer: this.layerOption[this.index].label,
      //            remark: this.formItem2.remark,
      //            layerValue:this.layerOption[this.index].value,
      //            upColumnsData:this.upColumnsData,
      //            indexArr:this.indexArr,
      //            fieldOptions:this.fieldOptions,
      //            valueOptions2:this.valueOptions2,
      //            field_selected:this.formItem.field_selected
      //
      //       })
      //       //console.log(this.downColumnsData)
      //
      //
      // },
      ok(){
        console.log(this.formItem2)
        if(this.formItem2.state=='add'){
            this.saveQueryCondition('');
        }else{
            this.saveQueryCondition(this.rowRid);
        }

        this.modal1=false
        this.saveData={
          layer:this.layerName,
          data:this.upColumnsData,
          remark:this.formItem2
        }
        // this.getQueryCondition()
        // this.downColumnsData.push({
        //   layer: this.layerOption[this.index].label,
        //   remark: this.formItem2.remark,
        //   layerValue:this.layerOption[this.index].value,
        //   upColumnsData:this.upColumnsData,
        //   indexArr:this.indexArr,
        //   fieldOptions:this.fieldOptions,
        //   valueOptions2:this.valueOptions2,
        //   field_selected:this.formItem.field_selected

        // })

        //console.log(this.downColumnsData)
      },
      saveQueryCondition(rid){
          console.log(this.formItem2)
        let mapConditionRulesList = []

        console.log(this.upColumnsData)
        this.upColumnsData.map((i,index,arr)=>{
          console.log(i,index,arr);
          mapConditionRulesList.push({
              rid:'',
              conditionName:i.field,
              conditionSymbol:i.symbol,
              conditionValue:i.value,
              conditionSymbolBAK:"",
              conditionValueBAK:"",
              mapSelfDefineSearchID:"",

            })


        })

        let data = {
          "mapSelfDefineSearch":{
            "rid":rid,
            "coverageName":this.layerName,
            "restURL":this.formItem.layer_Selected,
            "operationSymbol":this.formItem.field_selected,
            "desciption":this.formItem2.remark,
            "loginUser":"00000001-0000-0000-0010-000000000001",
            "createTime":"2018-10-25"
          },
          "mapConditionRulesList":mapConditionRulesList
        }
        //
        this.$post(SaveUpdateQueryCondition,data).then((res)=>{
          console.log(res)
          this.getQueryCondition();
          //上传成功后将 rid 存储到对应数组
          //    this.downColumnsData.push({
          //       layer: this.layerOption[this.index].label,
          //       remark: this.formItem2.remark,
          //       layerValue:this.layerOption[this.index].value,
          //       upColumnsData:this.upColumnsData,
          //       indexArr:this.indexArr,
          //       fieldOptions:this.fieldOptions,
          //       valueOptions:this.valueOptions,
          //       field_selected:this.formItem.field_selected,
          //       rid:res
          //   })

        }).catch((error) => {
          console.log(error)
        })
      },

     cancel(){
         this.modal1=false
     },

     changePage(index){
         //console.log(index)
         this.pages=index-1;
        //  this.splitResult
         this.showResult=this.splitResult[index-1]
        //  this.serachResult;
        //  this.showResult

     },
     onMap(value,index){
        //  //console.log(value);
        //  //console.log(this.geometry);
        //console.log(this.pages,index);
         //console.log(this.geometry[this.pages][index])
         this.Query.mapMark(this.geometry[this.pages][index])
    }



    }
  }
</script>

<style  lang="scss">

.customQuery{
    width:100%;
    // height:auto;
    height:500px;
    overflow-y: auto;
    padding:0 10px;
     position: relative;
  //自定义查询下拉选项宽度(无生效)
  .sg-select-dropdown .sg-select-dropdown-list>li{
    width: 128px;
    line-height: 40px;
    cursor: pointer;
  }
    .layerBox{
        padding:15px 10px 20px;
        background: #f5f6f7;
    }
    .sg-form-item{
        margin-bottom:0;

    }
    .selectLayer{
         margin-bottom:10px;
    }
     .sg-form-item-label{
         text-align: left  ;
    }
    .btn_box{
        padding:15px 10px 10px 10px;
        .sg-btn{
            margin-right:10px;
            border-radius: 0;
        }
    }
       .edit{
        width:328px;
        height:48px;
        position: absolute;
        top:182px;
        z-index: 100;
        >li{
            float:left;
            width:33%;
            height:48px;
            line-height: 48px;
            box-sizing: border-box;
            padding: 0 10px;
        }
    }

}
.saveSearch{
    z-index:200 !important;
    .dialog-wrap{
        max-height: initial !important;
    }

    .saveSearch_footer{
        margin-top:30px;
        height:34px;
        button{
        width:100px;
        height:34px;

        }
        .btn_cancel{
            float: left;
        }
        .btn_ok{
            float: right;
        }
    }



}



</style>
