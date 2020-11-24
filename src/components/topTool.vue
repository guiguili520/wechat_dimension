<template>
    <div class="topTool">
        <ul>
            <li v-for="(item,index) in toolArr" :key="index" @click="showDialog(item[0].code,item[0].name,index,item[1])" :class="{active:active==index}">
                {{item[0].name}}
                <span @click.stop="close(item[0].code,index)"></span>
            </li>
        </ul>
    </div>
</template>

<script>
import bus from '../assets/eventBus';
import {arrayIndexOf} from '../assets/uiScript/arrayIndexOf'
    export default {
        data() {
            return {
                toolArr: [],
                codeArr:[],
                active:-1
            }
        },
        methods: {
            close(code,index) {
                this.toolArr.splice(index,1)
                this.codeArr.splice(index,1)

                this.active=-1;
            },
            showDialog(code,name,index,record){
                this.GLOBAL.dialog={code:code,name:name};
                this.active=index;
                bus.$emit('showDialog',code);
                bus.$emit('toggleDialog',{isShow:true,name:name});
                if(code=='catalogue' || code == 'project'){
                    bus.$emit('shandeSide',false);
                }else{
                    bus.$emit('shandeSide',true);
                }

                bus.$emit('resetIndex',record)
            }
        },
        mounted(){
            let _this=this;

            bus.$on('pushArr', (res) => {

                if(arrayIndexOf(_this.codeArr,res[0].code)==-1 && _this.codeArr.length<5){

                    _this.toolArr.push(res)
                    _this.codeArr.push(res[0].code)

                }else if(arrayIndexOf(_this.codeArr,res[0].code)==-1 && _this.codeArr.length==5){
                    _this.toolArr.splice(0,1)
                    _this.codeArr.splice(0,1)
                    _this.toolArr.push(res)
                    _this.codeArr.push(res[0].code)
                }
                else{
                    console.log('存在重复')
                    console.log( _this.toolArr)
                    console.log( _this.codeArr)
                }
                 console.log( _this.toolArr)
                    console.log( _this.codeArr)

            })
            bus.$on('setTop', (res) => {
                _this.active=res
            })
        }
    }
</script>

<style scoped lang="scss">
    .topTool{
        /* width:600px; */
        height:32px;
        position: absolute;
        top:0;
        left:178px;
        background: #fff;
        z-index: 10;
        ul,li{
            list-style: none;
        }
        ul{
            overflow: hidden;
            li{
                min-width:120px;
                height:32px;
                float: left;
                box-sizing: border-box;
                // border-top:1px solid #dfdfe1;
                border-bottom:1px solid #dfdfe1;
                border-left:1px solid #dfdfe1;
                padding:0 28px 0 34px;
                font-size: 14px;
                line-height: 30px;
                position: relative;
                span{
                    display: block;
                    width:8px;
                    height:8px;
                    position: absolute;
                    right:9px;
                    top:11px;
                    background-image: url('../assets/images/close.png');
                    background-position: center;
                    background-repeat: no-repeat;
                }
            }
            li:last-child{
                border-right:1px solid #dfdfe1;
            }
            .active{
                background: #3b86e0;
                color:#fff;
                span{
                     background-image: url('../assets/images/close-white.png');
                }
            }
        }
    }
</style>
