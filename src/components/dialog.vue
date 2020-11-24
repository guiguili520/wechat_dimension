<template>
  <div :class="['dialog',{isShow:isShow}]" v-show="isShow" :style="{width:w+'px'}">
    <div class="header flex">
      <p class="flex-item">{{dialogName}}</p>
      <i class="collapse" @click="closeDialog"></i>
    </div>
    <div class="dialog-wrap" :style="{'max-height': winH + 'px' }">
      <slot></slot>
    </div>
  </div>

</template>

<script>
  import Vue from 'vue'
  import bus from '../assets/eventBus';
  import VueDraggableResizable from 'vue-draggable-resizable'
  export default {
    components: {VueDraggableResizable},
    props:{
       "w": {
        type: Number,
        default: 350
      },
    },
    data() {
      return {
        isShow: true,
        winH:'',
        dialogName:'资源目录',
        indexRecoed:{}
      }
    },
    methods:{
        closeDialog(){
            console.log(this.GLOBAL.dialog);
            
            this.isShow=false;
            if(this.GLOBAL.dialog==undefined){
                 bus.$emit('pushArr',[{code: "catalogue", name: "资源目录"},{checkIndex: 0,searchIndex: 0}]);
            }else{
                 bus.$emit('pushArr',[this.GLOBAL.dialog,this.indexRecoed]);
            }
           
            bus.$emit('shandeSide',false);
            bus.$emit('setTop',-1);
            bus.$emit('initSideIndex');
        }
    },
    mounted(){
            
        let _this=this;
        bus.$on('toggleDialog', (res) => {
            _this.isShow =res.isShow
            _this.dialogName=res.name
        })
        bus.$on('indexRecord', (res) => {
           _this.indexRecoed=res
        })
        this.winH = document.documentElement.clientHeight - 150
        window.onresize=() => {
            this.winH = document.documentElement.clientHeight - 150
        }

        
    }
    
  }
</script>

<style  lang="scss">
  .dialog {
    width: 350px;
    position: absolute;
    left: 178px;
    top: 60px;
    box-sizing: border-box;
    border: 1px solid #e4e4e4;
    background: #fff;
    z-index: 100;
    .header {
      height: 30px;
      line-height: 30px;
      padding: 0 15px 0 10px;
      background-color: #3b86e0;
      > p {
        color: #fff;
      }
      .collapse {
        width: 30px;
        height: 24px;
        margin-top: 3px;
        margin-right: -10px;
        border-radius: 3px;
        background: url("../assets/images/icon/collapse.png") center no-repeat;
        background-size: 12px 12px;
        cursor: pointer;
        &:hover {
          background-color: #2076dd;
        }
      }
    }
    .dialog-wrap {
      padding: 20px 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

      .vdr{
        position: fixed !important;
    }
  }
</style>
