<!--
Element UI Demo
带有滚动条的表格展示
-->
<template>
	<div id="ElementUIDemo">
    <el-table
      :data="tableData"
      height="250"
      border
      style="width: 100%">
      <el-table-column
        prop="date"
        label="日期"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="address"
        label="地址">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
    export default {
        // 组件名称：对象
        name: "ElementUIDemo",
        // 自定义可用组件，如果你要用组件，且组件没有全局引入，就需要import后，再声明出来。
        components: {},
        // 组件内部数据
        data() {
            return {
                tableData: [{
                    date: '2016-05-03',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                }, {
                    date: '2016-05-02',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                }, {
                    date: '2016-05-04',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                }, {
                    date: '2016-05-01',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                }, {
                    date: '2016-05-08',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                }, {
                    date: '2016-05-06',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                }, {
                    date: '2016-05-07',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                }]
            }
        },
        // 组件传递属性
        props: {},
        // 计算属性
        computed: {},
        // 组件方法
        methods: {},
        // 组件监听器
        watch: {},

        // 自定义指令
        directives: {},
        // 自定义过滤器
        filters: {},

        //* **************生命周期钩子**************** *//
        beforeCreate() {
        },
        created() {
        },

        beforeMount() {
        },
        mounted() {
        },

        beforeRouteUpdate(to, from, next) {
            next();
        },
        updated() {
        },

        activated() {
        },
        deactivated() {
        },

        becomponentsforeDestroy() {
        },
        destroyed() {
        },

        // https://cn.vuejs.org/v2/api/#errorCaptured
        errorCaptured(err, vm, info) {
        }
    };
</script>

<style scoped></style>
