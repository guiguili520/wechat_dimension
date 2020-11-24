<template>
    <div id="contrast">
        分屏数量:
        <sg-select v-model="model1" style="width:200px">
            <sg-option v-for="item in 4" v-if="item>=2" :value="item" :key="item">{{ item }}</sg-option>
        </sg-select>
        <br>
      <div class="flex">
        <sg-button @click="sure" type="primary" class="sure" >确定</sg-button>
      <sg-button @click="cancel" style="margin-top: 20px;">取消</sg-button>
      </div>
    </div>
</template>

<script>
  import bus from '../assets/eventBus';
    export default {
        data() {
            return {
                model1: 2
            }
        },
        methods:{
            sure(){
                bus.$emit('toggleScreen',{show:true,screenLength:this.model1});
                bus.$emit('shandeSide',false);

                bus.$emit('toggleDialog', {isShow: false, name: ''});
                bus.$emit('showDialog', '');
                bus.$emit('leftPanelIsExpand',false);
            },
          cancel(){
            bus.$emit('toggleScreen',{show:false,screenLength:this.model1});
          }
        }
    }
</script>

<style scoped lang="scss">
#contrast{
    padding:0 20px;
  .sure{
    margin-left: 70px;
    margin-right:10px;
    margin-top: 20px;
  }
}
</style>
