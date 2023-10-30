<template>
    <el-row :gutter="40" style="padding: 0 20px;">
      <el-col :span="12">
        <div class="academic-level-three">
          <div class="sb">
            <c-title title="基本信息画像" />
            <RedTab :btnList="selfStudy" :isRed="isRed" :isActive="isSelfStudyActive" @redTabChange="clickSelfStudy" />
          </div>
          <div class="c-title mt12">图书借阅变化趋势</div>
          <div class="chart-dom" ref="BookBorrowing"></div>
          <div class="c-title mt12">学习门禁变化趋势</div>
          <div class="chart-dom" ref="LearningAccessControl"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="content-three">
          <c-title title="自修自习特征"/>
          <div class="content-three-body">
            <div class="c-title">图书借阅</div>
            <div class="card-box sb">
              <CustomCard :cardConfig="threeLeftCard" />
              <CustomCard :cardConfig="threeRightCard" />
            </div>
            <div class="text mg-b20"><span>520</span>人 总计借阅<span>5200</span>次</div>
            <div class="c-title">学习门禁</div>
            <div class="card-box sb">
              <CustomCard :cardConfig="threeLeftCard2" />
              <CustomCard :cardConfig="threeRightCard2" />
            </div>
            <div class="text mg-b20"><span>520</span>人 总计进入自习室<span>5200</span>次</div>
          </div>
        </div>
      </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, getCurrentInstance, computed, onMounted, nextTick } from 'vue'
import RedTab from '@/components/common/RedTab.vue'
import CustomCard from '@/components/common/CustomCard.vue'
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const isRed = ref(true)
const isSelfStudyActive = ref<string | number>(0)
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

const threeLeftCard = ref({
  width: '280px',
  height: '80px',
  color: '#1B528B',
  title: '最大借阅数',
  value: 15,
  isUnit: true,
  unit: '本(册)',
  fontSize: '22px'
})
const threeRightCard = ref({
  width: '280px',
  height: '80px',
  color: '#F39702',
  title: '最小借阅数',
  value: 2,
  isUnit: true,
  unit: '本(册)',
  fontSize: '28px'
})
const threeLeftCard2 = ref({
  width: '280px',
  height: '80px',
  color: '#B22924',
  title: '最大进入次数',
  value: 15,
  isUnit: true,
  unit: '次',
  fontSize: '28px'
})
const threeRightCard2 = ref({
  width: '280px',
  height: '80px',
  color: '#45A0E6',
  title: '最小进入次数',
  value: 2,
  isUnit: true,
  unit: '次',
  fontSize: '28px'
})
const clickSelfStudy = (val: number | string) => {
  isSelfStudyActive.value = val;
}
const initBookBorrowing = () => {
  const el: HTMLElement = instance?.refs.BookBorrowing as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = [
    {
      name: '专业1',
      value: 60,
      value2: 60,
    },
    {
      name: '专业2',
      value: 80,
      value2: 80,
    },
    {
      name: '专业3',
      value: 90,
      value2: 90,
    },
    {
      name: '专业4',
      value: 100,
      value2: 110,
    },
    {
      name: '专业5',
      value: 100,
      value2: 60,
    },
    {
      name: '专业6',
      value: 100,
      value2: 60,
    },
  ]
  const values = data.map(item => item.value).concat(data.map(item => item.value2));
  const max = Math.ceil(Math.max(...values) / 10) * 10;
  const interval = Math.ceil(max / 5);
  let option = {
    color:['#45A0E6','#F39D12'],
    title: {
      text: '单位/本(册)',
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
      data: ['借阅数量', '借阅人数']
    },
    grid: {
      top: '20%',
      left: 0,
      right: 0,
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
          // rotate: 0, //代表逆时针旋转
          interval: 'auto',
          formatter: function (value: string) {
            if (value.length > 6) {
              return `${value.slice(0, 6)}...`;
            }
            return value
          }
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
        min: 0,
        interval: interval,
        max: max,
      },
      { 
        name:'单位：人',
        nameLocation:'end',
        nameTextStyle:{
          color: '#333333',
          fontSize: 14,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        type: 'value',
        splitLine: {
          show: false,
          lineStyle: {
            type: 'dashed'
          }
        },
        min: 0,
        interval: interval,
        max: max,
      

      },

    ],
    series: [
      {
        type: 'line',
        name:'借阅数量',
        smooth: true,
        symbol: 'none',
        data: data.map(item => ({ value: item.value })),
      },
      {
        name: '借阅人数',
        type: 'line',
        smooth: true,
        symbol: 'none',
        yAxisIndex: 1,
        data: data.map(item => ({ value: item.value2 })),
      },
    ]
  };
  myChart?.setOption(option);
}
const initLearningAccessControl = () => {
  const el: HTMLElement = instance?.refs.LearningAccessControl as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = [
    {
      name: '专业1',
      value: 60,
      value2: 60,
    },
    {
      name: '专业2',
      value: 80,
      value2: 80,
    },
    {
      name: '专业3',
      value: 90,
      value2: 90,
    },
    {
      name: '专业4',
      value: 100,
      value2: 110,
    },
    {
      name: '专业5',
      value: 100,
      value2: 60,
    },
    {
      name: '专业6',
      value: 100,
      value2: 60,
    },
  ]
  const values = data.map(item => item.value).concat(data.map(item => item.value2));
  const max = Math.ceil(Math.max(...values) / 10) * 10;
  const interval = Math.ceil(max / 5);
  let option = {
    color:['#005DA7','#B22924'],
    title: {
      text: '单位/本(册)',
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
      data: ['借阅数量', '借阅人数']
    },
    grid: {
      top: '20%',
      left: 0,
      right: 0,
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
          // rotate: 0, //代表逆时针旋转
          interval: 'auto',
          formatter: function (value: string) {
            if (value.length > 6) {
              return `${value.slice(0, 6)}...`;
            }
            return value
          }
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
        min: 0,
        interval: interval,
        max: max,
      },
      { 
        name:'单位：人',
        nameLocation:'end',
        nameTextStyle:{
          color: '#333333',
          fontSize: 14,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        type: 'value',
        splitLine: {
          show: false,
          lineStyle: {
            type: 'dashed'
          }
        },
        min: 0,
        interval: interval,
        max: max,
      

      },

    ],
    series: [
      {
        type: 'line',
        name:'借阅数量',
        smooth: true,
        symbol: 'none',
        data: data.map(item => ({ value: item.value })),
      },
      {
        name: '借阅人数',
        type: 'line',
        smooth: true,
        symbol: 'none',
        yAxisIndex: 1,
        data: data.map(item => ({ value: item.value2 })),
      },
    ]
  };
  myChart?.setOption(option);
}

watch(() => isSelfStudyActive.value, (val) => {

}, { immediate: true })
onMounted(() => {
  nextTick(() => {
    initBookBorrowing();
    initLearningAccessControl();
  })

})
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>