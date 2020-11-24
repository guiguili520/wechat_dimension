<template>
  <div class="expandDialog" style="position: fixed;top:50px;right: 70px;" v-drag>
    <div class="header flex">
      <p class="flex-item" ref="name">{{name}}</p>
      <div class="collapse" @click="closeDialog">
        <sg-icon type="icon-close"></sg-icon>
    </div>
    </div>
    <div class="dialog-wrap">
      <slot name="head"></slot>
      <div class="body">
        <slot name="list"></slot>
      </div>
    </div>
  </div>
</template>



<script>
  import bus from '../../assets/eventBus';

    export default {
        name: "expand",
      data(){
        return{
          showPrint:false,
          title:'',
        }
      },
      computed: {
        callData() {
          if (this.$parent.listData&&this.$parent.listData.length > 0) {
            return false
          }
          return true
        }
      }, props: {
        'name': {
          type: String,
          default: '名称'
        },
      },
      mounted() {
         let title=this.$refs.name.innerHTML;
         this.title=title;
      },
      methods:{
        closeDialog() {
          bus.$emit('close',this.name)
        },
      }
    }
</script>

<style lang="scss" scoped>
  .expandDialog {
    width: 325px
  }

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
        line-height: 24px;
        margin-top: 3px;
        margin-right: -10px;
        border-radius: 3px;
        cursor: pointer;
        display: block;
        color: #fff;
        text-align: center;

        &:hover {
          background-color: #2076dd;
        }
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
