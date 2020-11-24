<template>
  <div  ref="resPane" class="res-pane"  :style="style">
    <div class="header flex">
      <p class="flex-item">{{name}}</p>
      <i :class="iconCls" title="收缩" @click="close(1)"></i>
      <i class="el-icon-minus" v-show="showHidden" title="隐藏" @click="close(0)"></i>
      <i class="esri-icon-close" title="关闭" @click="close(2)"></i>
    </div>
    <div class="height_flex_next">
    <div class="dialog-wrap" :style="{'height':'100%','overflow':'auto'}">
      <slot></slot>
    </div>
      <slot name="bottom"></slot>
    </div>
  </div>

</template>

<script>
  import VueDraggableResizable from 'vue-draggable-resizable'

  export default {
    name: "resPane",
    props: {
      "name": {
        type: String,
        default: '结果'
      }, "w": {
        type: Number,
        default: 600
      }, "h": {
        type: Number,
        default: 500
      }, "x": {
        type: Number,
        default: 500
      }, "y": {
        type: Number,
        default: 150
      },"isShow":{
          type:Boolean,
          default:false
      },"exportReport":{
        type:Boolean,
        default:true
      },"canDrag":{
        type:Boolean,
        default:true
      }
    },
    data() {
      return {
        height_flex_next:'100%-30px',
        winH: '',
        index: 0,
        showHidden:true,
        width: this.w,
        height:this.h,
        iconCls:'el-icon-caret-left'
      }
    },
    mounted() {
      this.winH = document.documentElement.clientHeight - 250
      window.onresize = () => {
        this.winH = document.documentElement.clientHeight - 250
      }
    },
    methods: {
      close(item) {
        if(item==2){//关闭
          this.$emit('pane-close', false);
          this.index=0;
        }else if(item==0){//隐藏
          this.$emit('card-hidden', false);
          this.showHidden=false;
          this.width='175';
          this.height='30';
          this.index=1;
          this.iconCls='el-icon-caret-right'
        }else if(item==1){//缩小放大
          if(this.index==0){
            this.index=1
            let tempW=this.w/2;
            let tempH=this.h;
            this.width=tempW;
            this.height=tempH;
            this.iconCls='el-icon-caret-right'
          }else{
              this.index=0;
              this.$emit('card-hidden', true);
              let tempW=this.w;
              let tempH=this.h;
              this.width=tempW;
              this.height=tempH;
              this.iconCls='el-icon-caret-left';
          }
          this.showHidden=true;
        }else{

        }

      },

      //收缩
      shrink(){
        this.index=1;
        let tempW=this.w/2;
        let tempH=this.h;
        this.width=tempW;
        this.height=tempH;
        this.iconCls='el-icon-caret-right'
      },

      expand(){
        this.index=0;
        this.$emit('card-hidden', true);
        let tempW=this.w;
        let tempH=this.h;
        this.width=tempW;
        this.height=tempH;
        this.iconCls='el-icon-caret-left';
      }
    },
    components: {VueDraggableResizable},
    computed:{
      style(){
        //debugger;
        return {
          'top':this.y+'px',
          'left':'auto',
          'zIndex':this.z+'px',
          'width':this.width+'px',
          'height':this.height+'px'}
      }
    }
  }
</script>

<style scoped lang="scss">
  .res-pane {
    background-color: #fff;
    z-index: 10000;
    position: fixed !important;
    // visibility: hidden;
    .header {
      height: 30px;
      line-height: 30px;
      padding: 0 15px 0 10px;
      background-color: #3b86e0;
      color: #fff;
      > i {
        width: 30px;
        height: 24px;
        line-height: 24px;
        margin-top: 3px;
        border-radius: 3px;
        background-size: 12px 12px;
        text-align: center;
        cursor: pointer;
        margin-right: -2px;
        &:hover {
          background-color: #2076dd;
        }
      }
    }
    border:1px solid #e4e4e4;
    box-shadow: 0 2px 10px 0px rgba(0,0,0,0.2);
    .dialog-wrap{
        padding:15px 15px 0 15px;
    }
    .height_flex_next{
      height: calc(100% - 30px);
      overflow: auto;
    }
  }
  .isShow{
      visibility: visible;
  }
</style>
