<template>
    <div class="timeLine">
        <span class="timeLine_title">{{title}}</span>
          <sg-radio-group class="line flex" v-model="selectedYear" @on-change="changeRadio" v-if="state">
              <sg-radio v-for="(item,index) in urls" :key="index" :label="item.year"  :style="{marginLeft:(680-72.03*url.length)/(url.length+1)/680*100+'%'}" ></sg-radio>
          </sg-radio-group>
             <!--<div v-for="(item,index) in url" :key="index" class="selectBtn" :style="{left:100*(index+1)/(url.length+1)+'%'}" @click.stop="checkLayer(item,index)" >-->
                <!--<div v-if="item.check" class="select_circle"></div>-->
                <!--<div v-else class=""></div>-->
                <!--&lt;!&ndash;<span @click.stop="checkOpcaity(item,index)" @mouseenter="enter(index)" @mouseleave="leave(index)">{{item.year}}</span>&ndash;&gt;-->
                <!--<div class="title" v-show="titleIndex==index">-->
                    <!--<i v-for="(itm,idx) in item.title" :key="idx" >{{itm}}</i>-->
                <!--</div>-->
             <!--</div>-->
        <!--<div class="slider_box" :style="{left:100*(idx+1)/(url.length+1)+'%'}">-->
            <!--<sg-slider v-model="opacityArr[idx]" @on-change="changeOpcaity" v-show="isShow" show-tip="never"></sg-slider>-->
        <!--</div>-->
        <span class="closeTimeLine" @click="close">关闭</span>
    </div>
</template>

<script>
    import bus from '../assets/eventBus';
    export default {
        name:'timeLine',
        data() {
            return {
              urls:[],
              selectedYear:null,
                // Slider:{},
                // val1:100,
                idx:0,
                // opacityArr:[],//时间轴数据透明度数组
                // isShow:false,
                // titleIndex:null
             selectedUrl:null,
             state:true
            }
        },
        watch:{
            url(newVal,oldVal){
                this.state=false
              this.$nextTick(()=>{
                this.state=true
              })
              this.idx=newVal.length-1
              this.selectedYear = newVal[this.idx]["year"]
              this.urls = newVal
              this.selectedUrl = newVal[this.idx]["url"]
              for(let i in oldVal){
                let url = oldVal[i]["url"]
                g_map.allLayers.find((layer) => {
                  if (layer.url == url && layer.visible==true) {
                    layer.visible= false
                  }
                })
              }
              g_map.allLayers.find((layer) => {
                if (layer.url == this.selectedUrl) {
                  layer.visible= true

                }
              })



                // this.opacityArr=[]
                // for(let i=0;i<newVal.length;i++){
                //     if(i<newVal.length-1){
                //         this.opacityArr.push(0)
                //     }else{
                //         this.opacityArr.push(100)
                //     }
                //
                // }
            }
        },
        props:{
            title:{
                type:String,
                default:''
            },
            url:{
                type:Array,
                default:[]
            }
            /* 示例数据
               [{
                   check:false,    是否默认展示url中的图层
                   year:2011,       所属年份
                   url:['http://********'] 图层地址
               }]
            */
        },
        methods: {
            //选中年份时的图层切换或展示
          changeRadio(year) {

            for(let i in this.urls){
                let url = this.urls[i]["url"]
                g_map.allLayers.find((layer) => {
                  if (layer.url == url && layer.visible==true) {
                    layer.visible= false
                  }
                })
            }
              for(let i in this.urls){
                if(this.urls[i]["year"] == year){
                  this.selectedUrl = this.urls[i]["url"]
                  g_map.allLayers.find((layer) => {
                    if (layer.url == this.selectedUrl && layer.visible==false ) {
                      layer.visible= true

                    }
                  })
                }

              }
                // for(let i in item.url){
                //     if(item.check){
                //         this.Slider.opacity('url', item.url[i], 100 / 100)
                //         this.Slider.visible('url', item.url[i], item.check)
                //     }else{
                //         this.Slider.opacity('url',item.url[i], 0 / 100)
                //         this.Slider.visible('url',item.url[i], item.check)
                //     }
                // }


            },
            // //透明度位置控制
            // checkOpcaity(item,index){
            //     this.isShow=item.check
            //     this.idx=index
            // },
            // //调整透明度
            // changeOpcaity(val){
            //     this.opacityArr[this.idx]=val
            //     for(let i in this.url[this.idx].url){
            //          this.Slider.opacity('url', this.url[this.idx].url[i], val / 100)
            //     }
            // },
            //关闭时间轴
            close() {
                this.$emit('time-line-close');
              g_map.allLayers.find((layer) => {
                if (layer.url == this.selectedUrl && layer.visible==true) {
                  layer.visible= false
                }
              })

            },
            // //鼠标移入年份事件
            // enter(index){
            //     this.titleIndex=index
            // },
            //鼠标移出年份事件
            // leave(index){
            //     this.titleIndex=null
            // }
        },
        mounted () {
            // this.Slider = new SgMap.Slider();
            // for(let i in this.url){
            //
            //     for(let j in this.url[i]){
            //         this.Slider.visible('url', this.url[i].url[j], this.url[i].check)
            //     }
            // }
            // this.idx=this.urls.length-1;
            // this.idx=this.url.length-1
            //
            //   this.selectedYear = this.url[this.idx]["url"]
            //   console.log(this.selectedYear)
        }
    }
</script>

<style lang="scss">
.timeLine{
    width:700px;
    height:78px;
    padding:0 10px;
    // background: #ccc;
     background: rgba(0,0,0,0.2);
    position: absolute;
    top:0px;
    left:390px;
    box-sizing: border-box;
    // border:1px solid #dfdfdf;
    border-radius: 2px;
    z-index: 1;
    .timeLine_title,.closeTimeLine{
        position: absolute;
        top:10px;
        left:10px;
        background: rgba(0,0,0,0.5);
        color:#fff;
        padding:5px 10px;
        border-radius: 4px;
    }
    .closeTimeLine{
        left:642px;
        cursor: pointer;
    }
    .line{
        width:100%;
        height:15px;
        background: #fff;
        border-radius: 5px;
        position: relative;
        top:47px;
        z-index: 1000;
        .title{
            position: absolute;
            width:150px;
            padding:2px;
            border-radius: 3px;
            text-align: center;
            margin-left:-70px;
            background: rgba(0,0,0,0.5);
            color:#fff;
            z-index: 10;
            i{
                display: inline-block;
                padding:5px;
                font-style: normal;
            }
        }
        .selectBtn{
            position: absolute;
            top:-3px;
            width:16px;
            height:16px;
            border: 1px solid #dfdfdf;
            border-radius: 100%;
            background: #fff;
            cursor: pointer;
            .select_circle{
                width:10px;
                height:10px;
                border-radius: 100%;
                background: #338cfd;
                cursor: pointer;
                position: absolute;
                left:2px;
                top:2px;
                pointer-events: none;
            }
            span{
                position: absolute;
                display: block;
                padding:2px 5px;
                background: #fff;
                color:#000;
                border-radius: 5px;
                top:-22px;
                left:-14px;
            }
        }
    }
    .slider_box{
        width:150px;
        position:absolute;
        top:80px;
        margin-left:-80px;
        z-index: 100;
    }
}
</style>
