<template>
  <vue-draggable-resizable ref="resPane" class="res-pane" :w="w" :resizable="false" :x="x" :y="y" :h="h">
    <div class="header flex">
      <p class="flex-item">{{name}}</p>
      <i class="esri-icon-close" @click="close"></i>
    </div>
    <div class="dialog-wrap" :style="{'max-height':h-30+'px',overflow:'auto'}">
      <slot></slot>
    </div>
  </vue-draggable-resizable>
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
        default: 500
      }, "h": {
        type: Number,
        default: 350
      }, "x": {
        type: Number,
        default: document.body.clientWidth -450
      }, "y": {
        type: Number,
        default: 150
      }
    },
    data() {
      return {
        winH: '',
      }
    },
    mounted() {
      this.winH = document.documentElement.clientHeight - 250
      window.onresize = () => {
        this.winH = document.documentElement.clientHeight - 250
      }
    },
    methods: {
      close() {
        this.$emit('pane-close', false);
      }
    },
    components: {VueDraggableResizable}
  }
</script>

<style scoped lang="scss">
  .res-pane {
    background-color: #fff;
    z-index: 100;
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
        margin-right: -10px;
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
  }
</style>
