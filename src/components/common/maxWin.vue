<template>
  <vue-draggable-resizable  ref="resPane" class="res-pane" :draggable="canDrag">
    <div class="header flex">
      <p class="flex-item">{{name}}</p>
      <i class="esri-icon-close" @click="close"></i>
    </div>
    <div style="height: 100%">
    <div class="dialog-wrap2" style="height: 100%">
      <slot></slot>
    </div>
      <slot name="bottom"></slot>
    </div>
  </vue-draggable-resizable>

</template>

<script>
  import VueDraggableResizable from 'vue-draggable-resizable'

  export default {
    name: "maxWin",
    props: {
      "name": {
        type: String,
        default: '结果'
      },"canDrag":{
        type:Boolean,
        default:true
      }
    },
    data() {
      return {
      }
    },
    mounted() {

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
    z-index: 10000;
    position: fixed !important;
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
    .dialog-wrap2{
        padding:15px 15px 0 15px;
    }
  }
</style>
