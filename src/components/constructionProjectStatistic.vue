<template>
  <div class="constructionProjectStatistic iq-content">
    <sg-form ::label-width="60">
      <div class="iq-wrap">
        <sg-form-item :label-width="70" label="统计方式">
        <sg-select v-model="formItem.project">
          <sg-option v-for="project in projectOption" :value="project.value">{{project.label}}</sg-option>
        </sg-select>
        </sg-form-item>
      </div>
      <p class="iq-title">统计空间范围</p>
      <s-range :type="rangeType"
               :drawId="drawId"
               ref="range"
                @county-location="countyLocation"
               @draw-geometry="drawGeometry"
                @town-location="townLocation"
               @clear-all="clear"
      ></s-range>
    </sg-form>
    <div class="iq-button">
      <sg-button type="primary" @click="startStatistic()">开始统计</sg-button>
      <sg-button @click="clear()">清除结果</sg-button>
    </div>
    <s-respane v-show="resultPanelIsShow" name="按建设项目统计结果" @pane-close="closePane" :w="800" :h="600" :x="233" :y="-24">
      <sg-tab type="card" :animated="false">
        <sg-tab-pane :label-width="70" label="表格">
          <sg-table :show-page="false" :columns="columns" :data="showResult" @on-row-click=""></sg-table>
          <!--<sg-page :total=""-->
                   <!--show-total=""-->
                   <!--show-elevator=""-->
                   <!--:page-size="7"-->
                   <!--size="small"-->
                   <!--@on-change="changePage"-->
                   <!--class="result_page"-->
                   <!--style="padding: 10px 0;"></sg-page>-->
        </sg-tab-pane>
        <sg-tab-pane :label-width="70" label="饼状图">
          <canvas id="myChart"></canvas>
        </sg-tab-pane>
        <sg-tab-pane :label-width="70" label="柱状图">
          <canvas id="myBarChart"></canvas>
        </sg-tab-pane>
      </sg-tab>
    </s-respane>
  </div>
</template>

<script>
    import SRange from '@/components/common/range'
    import SRespane from '@/components/common/resultPanel'
    import bus from '../assets/eventBus';
    export default {
      name: "constructionProjectStatistic",
      components: {SRespane,SRange},
      data() {
        return {
          drawId: 'constructionProjectStatistic',
          geometry:'',
          countyOptions:[],
          townOptions:[],
          rangeType:['XZQH',"draw"],
          columns: [
            {
              title: '名称',
              key: 'name'
            },
            {
              title: '数量',
              key: 'total'
            }
          ],
          showResult:[],
          resultPanelIsShow:false,
          formItem:{
            statisticalMethod:'',
            project:'projectType',
            statisticalLevel:'',
            region:'HuiCheng'

          },
          projectOption:[
            {
              value:'projectType',
              label:'项目类别'
            },            {
              value:'projectDepartment',
              label:'项目部门'
            }
          ],
        }
      },
      methods: {
        drawGeometry(gra) {
          this.geometry = gra.geometry
        },
        countyLocation(geo){
          this.geometry = geo
        },
        townLocation(geo){
          this.geometry = geo
        },
        startStatistic(){
          this.resultPanelIsShow = true
        },
        clear(){
          this.$refs.range.clearDrawGraphics();
        },
        closePane(val) {
          this.resultPanelIsShow = val
        }
      }
    }
</script>

<style scoped>

</style>
