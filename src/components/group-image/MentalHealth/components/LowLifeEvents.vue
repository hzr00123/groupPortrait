<template>
    <el-row :gutter="40" style="padding: 0 20px;">
      <el-col :span="12">
        <div class="academic-level-four">
          <div class="sb">
            <c-title title="基本信息画像" />
            <RedTab :btnList="selfStudy" :isRed="isRed" :isActive="isEffectActive" @redTabChange="clickEffect" />
          </div>
          <div class="c-title mt12">学期缺勤次数对必修课成绩平均分影响</div>
          <div class="chart-dom" ref="AbsenceEffect"></div>
          <div class="c-title mt12">学期专业书籍相关图书图书借阅次数对必修课成绩平均分影响</div>
          <div class="chart-dom" ref="BooksEffect"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="content-four">
          <c-title title="成绩影响分析"/>
          <div class="content-four-body">
            <div class="c-title">缺勤次数影响</div>
            <div class="chart-box flex-start">
              <div class="left-box column">
                <div class="up">缺勤 666人</div>
                <div class="down">挂科 400人</div>
              </div>
              <div class="right-box column">
                <div class="up sb">
                  <div class="l">
                    <div class="top">男： <span>333</span>人</div>
                    <div class="bottom"><span>20</span>%</div>
                  </div>
                  <div class="r">
                    <div class="top">女： <span>333</span>人</div>
                    <div class="bottom"><span>20</span>%</div>
                  </div>
                </div>
                <div class="down sb">
                  <div class="l">
                    <div class="ratio"><span>66.6</span>%</div>
                    <div class="top">男： <span>333</span>人</div>
                    <div class="bottom"><span>20</span>%</div>
                  </div>
                  <div class="r">
                    <div class="ratio"><span>66.6</span>%</div>
                    <div class="top">女： <span>333</span>人</div>
                    <div class="bottom"><span>20</span>%</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text mg-b20">
              缺勤 <span>666</span>人 挂科 <span>666</span>人
            </div>
            <div class="c-title">专业书籍相关图书借阅次数影响</div>
            <div class="gauge-box flex-start mg-b15">
              <div class="title">
                图书借阅人群内挂科人数占比
              </div>
              <ElProgress class="two" type="circle" :width="130" :stroke-width="10" color="#45A0E6" :percentage="80">
                <template #default="{ percentage }">
                  <div class="percentage-value" style="color:#45A0E6;">{{ percentage }}<span>%</span></div>
                  <div class="percentage-total">200人</div>
                </template>
              </ElProgress>
            </div>
            <div class="text">
              <span>500</span>人 参与图书借阅，挂科 <span>45</span>人
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, getCurrentInstance, computed, onMounted, nextTick } from 'vue'

import RedTab from '@/components/common/RedTab.vue'

const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts

const isRed = ref(true)
const isEffectActive = ref<string | number>(0)
const selfStudy = ref([
  {
    value: 0,
    label: "按月度"
  },
  {
    value: 1,
    label: "按季度"
  },

])

const clickEffect = (val: number | string) => {
  isEffectActive.value = val;
}

const initAbsenceEffect = () => {
  const el: HTMLElement = instance?.refs.AbsenceEffect as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = [
    {
      name: '专业1',
      value: 80,
      value2: 60,
      value3: 30,
    },
    {
      name: '专业2',
      value: 80,
      value2: 80,
      value3: 30,
    },
    {
      name: '专业3',
      value: 90,
      value2: 90,
      value3: 120,
    },
    {
      name: '专业4',
      value: 100,
      value2: 110,
      value3: 30,
    },
    {
      name: '专业5',
      value: 100,
      value2: 60,
      value3: 80,
    },
    {
      name: '专业6',
      value: 100,
      value2: 60,
      value3: 30,
    },
  ]
  let option = {
    color:['#B22924','#F39D12','#45A0E6'],
    title: {
      text: '单位/人',
      top: 0,
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
        fontWeight:'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      right: '14%',
      top: '0',
      itemWidth: 10,
      itemHeight: 5,
      icon:'roundRect',
      data: ['优秀', '良好','待改进']
    },
    grid: {
      top: '20%',
      left: 0,
      right: '15%',
      bottom: '4%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.map(item => ({ value: item.name })),
        axisTick: { //刻度
          alignWithLabel: true,
          show: false,
        },
        triggerEvent: true,
        axisLabel: {
          interval: 'auto',
          formatter: function (value: string) {
            if (value.length > 6) {
              return `${value.slice(0, 6)}...`;
            }
            return value
          }
        },
        name:'学期缺勤次数',
        nameLocation:'end',
        nameTextStyle:{
          color: '#333333',
          fontSize: 14,
        },
      }
    ],
    yAxis: [
      { 
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        },
      },

    ],
    series: [
      {
        type: 'line',
        name:'优秀',
        smooth: true,
        symbol: 'none',
        data: data.map(item => ({ value: item.value })),
      },
      {
        name: '良好',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: data.map(item => ({ value: item.value2 })),
      },
      {
        name: '待改进',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: data.map(item => ({ value: item.value3 })),
      },
    ]
  };
  myChart?.setOption(option);
}
const initBooksEffect = () => {
  const el: HTMLElement = instance?.refs.BooksEffect as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = [
    {
      name: '专业1',
      value: 80,
      value2: 60,
      value3: 30,
    },
    {
      name: '专业2',
      value: 80,
      value2: 80,
      value3: 30,
    },
    {
      name: '专业3',
      value: 90,
      value2: 90,
      value3: 120,
    },
    {
      name: '专业4',
      value: 100,
      value2: 110,
      value3: 30,
    },
    {
      name: '专业5',
      value: 100,
      value2: 60,
      value3: 80,
    },
    {
      name: '专业6',
      value: 100,
      value2: 60,
      value3: 30,
    },
  ]
  let option = {
    color:['#B22924','#F39D12','#45A0E6'],
    title: {
      text: '单位/人',
      top: 0,
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
        fontWeight:'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      right: '14%',
      top: '0',
      itemWidth: 10,
      itemHeight: 5,
      icon:'roundRect',
      data: ['优秀', '良好','待改进']
    },
    grid: {
      top: '20%',
      left: 0,
      right: '15%',
      bottom: '4%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.map(item => ({ value: item.name })),
        axisTick: { //刻度
          alignWithLabel: true,
          show: false,
        },
        triggerEvent: true,
        axisLabel: {
          interval: 'auto',
          formatter: function (value: string) {
            if (value.length > 6) {
              return `${value.slice(0, 6)}...`;
            }
            return value
          }
        },
        name:'图书借阅次数',
        nameLocation:'end',
        nameTextStyle:{
          color: '#333333',
          fontSize: 14,
        },
      }
    ],
    yAxis: [
      { 
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        },
      },

    ],
    series: [
      {
        type: 'line',
        name:'优秀',
        smooth: true,
        symbol: 'none',
        data: data.map(item => ({ value: item.value })),
      },
      {
        name: '良好',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: data.map(item => ({ value: item.value2 })),
      },
      {
        name: '待改进',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: data.map(item => ({ value: item.value3 })),
      },
    ]
  };
  myChart?.setOption(option);
}
watch(() => isEffectActive.value, (val) => {

}, { immediate: true })
onMounted(() => {
  nextTick(() => {
    initAbsenceEffect();
    initBooksEffect();
  })

})
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>