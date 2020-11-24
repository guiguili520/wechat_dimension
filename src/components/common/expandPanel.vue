<template>
  <div class="expandDialog" ref="expandDialog" style="z-index: 20000000" v-drag>
    <div class="header flex">
      <p class="flex-item">{{name}}</p>
    </div>
    <div class="dialog-wrap">
      <slot name="head"></slot>
      <div class="body">
        <slot name="list"></slot>
        <p v-if="callData" class="empty">暂无内容</p>
      </div>
    </div>
  </div>
</template>

<script>
  import {loadModules} from "esri-loader";
  import {options} from "../../config/index";

  export default {
    name: "expandDialog",
    computed: {
      callData() {
        if (this.$parent.listData&&this.$parent.listData.length > 0) {
          return false
        }
        return true
      }
    },
    props: {
      'name': {
        type: String,
        default: '名称'
      },
      'icon': {
        type: String,
        default: 'esri-icon-printer'
      }
    },
    mounted() {
      loadModules(["esri/widgets/Expand"],
        options
      ).then(([Expand]) => {
        let expand = new Expand({
          expandIconClass: this.icon,
          expandTooltip: this.name,
          autoCollapse:true,
          view: g_view,
          content: this.$refs.expandDialog,
          group:'toolBar',
        });
        g_view.ui.add(expand, 'top-right')
        expand.
         this.$load.hide()
      })
    }
  }
</script>

<style lang="scss" scoped>
  .expandDialog {
    width: 350px;
  }

  .header {
    height: 30px;
    line-height: 30px;
    padding: 0 15px 0 10px;
    background-color: #3b86e0;
    > p {
      color: #fff;
    }
  }

  .empty {
    text-align: center;
    line-height: 100px;
    color: #444;
  }

  .dialog-wrap {
    padding: 20px 10px;
    background-color: #fff;
  }

  .body {
    border: 1px solid #dfdfdf;
    height: 250px;
    overflow: auto;
    ul {
      list-style: none;
      > li {
        line-height: 32px;
        padding: 8px 12px;
        border-bottom: 1px solid #dfdfdf;
        cursor: pointer;
        &:hover {
          background-color: #f4f5f6;
        }
      }
    }
  }
</style>
