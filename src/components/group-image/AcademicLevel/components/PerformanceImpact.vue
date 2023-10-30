<template>
  <div style="padding: 0 20px;" :class="['performance-impact', {
    'scholarship': true,
    'flex': true,
    'horizontal': direction === 'horizontal',
    'vertical': direction === 'vertical'
    }]">
    <div :class="['academic-level-four', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
      <div class="sb">
        <c-title title="基本信息画像" />
        <!-- <RedTab :btnList="selfStudy" :isRed="isRed" :isActive="isEffectActive" @redTabChange="clickEffect" /> -->
      </div>
      <div class="c-title mt12">{{ leftData.absenteeism.name }}</div>
      <div class="chart-dom" ref="AbsenceEffect"></div>
      <div class="c-title mt12">{{ leftData.borrow.name }}</div>
      <div class="chart-dom" ref="BooksEffect"></div>
    </div>
    <div v-if="$attrs.view !== 'left'" :class="['content-four', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
      <c-title title="成绩影响分析" />
      <div class="content-four-body">
        <div class="c-title">缺勤次数影响</div>
        <div class="chart-box flex-start">
          <div class="left-box column">
            <div class="up">缺勤 {{ rightData.absenteeism.value }}人</div>
            <div class="down">挂科 {{ rightData.failure.value }}人</div>
          </div>
          <div class="right-box column">
            <div class="up sb">
              <div class="l">
                <div class="top">男： <span>{{ rightData.absenteeism.man }}</span>人</div>
                <div class="bottom"><span>{{ rightData.absenteeism.manRate }}</span>%</div>
              </div>
              <div class="r">
                <div class="top">女： <span>{{ rightData.absenteeism.woman }}</span>人</div>
                <div class="bottom"><span>{{ rightData.absenteeism.womanRate }}</span>%</div>
              </div>
            </div>
            <div class="down sb">
              <div class="l">
                <div class="ratio"><span>{{ rightData.manRate }}</span>%</div>
                <div class="top">男： <span>{{ rightData.failure.man }}</span>人</div>
                <div class="bottom"><span>{{ rightData.failure.manRate }}</span>%</div>
              </div>
              <div class="r">
                <div class="ratio"><span>{{ rightData.womanRate }}</span>%</div>
                <div class="top">女： <span>{{ rightData.failure.woman }}</span>人</div>
                <div class="bottom"><span>{{ rightData.failure.womanRate }}</span>%</div>
              </div>
            </div>
          </div>
        </div>
        <div class="text mg-b20">
          缺勤 <span>{{ rightData.absenteeism.value }}</span>人 挂科 <span>{{ rightData.failure.value }}</span>人
        </div>
        <div class="c-title">专业书籍相关图书借阅次数影响</div>
        <div class="gauge-box flex-start mg-b15">
          <div class="title">
            图书借阅人群内挂科人数占比
          </div>
          <ElProgress class="two" type="circle" :width="130" :stroke-width="10" color="#45A0E6"
            :percentage="rightData.bottom.rate">
            <template #default="{ percentage }">
              <div class="percentage-value" style="color:#45A0E6;">{{ percentage }}<span>%</span></div>
              <!-- <div class="percentage-total">{{ rightData.bottom.borrowFailure }}人</div> -->
              <div class="percentage-total">{{ rightData.bottom.failure }}人</div>
            </template>
          </ElProgress>
        </div>
        <div class="text">
          <span>{{ rightData.bottom.borrow }}</span>人 参与图书借阅，挂科 <span>{{ rightData.bottom.failure }}</span>人
        </div>
      </div>
    </div>

    <WarningSeal name="成绩影响" ident="Performance_Impact" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, getCurrentInstance, computed, onMounted, nextTick, toRefs } from 'vue'

import RedTab from '@/components/common/RedTab.vue'
import { usePortraitRequest } from '@/hooks';
import { BaseParams } from '../../types';
import WarningSeal from '@/components/WarningSeal'
import { changeChartData } from "@/api/modules/studentPortrait";
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const props = withDefaults(defineProps<{ params: BaseParams, direction: string }>(), {
  params: {} as any,
  direction: 'horizontal'
})
const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Performance_Impact' })
// const isRed = ref(true)
// const isEffectActive = ref<string | number>("按月度")
// const selfStudy = ref([
//   {
//     value: "按月度",
//     label: "按月度"
//   },
//   {
//     value: "按季度",
//     label: "按季度"
//   },

// ])

// const clickEffect = (val: number | string) => {
//   isEffectActive.value = val;
// }
const leftData = reactive({
  absenteeism: {
    name: '',
    series: [],
    xAxis: []
  },
  borrow: {
    name: '',
    series: [],
    xAxis: []
  }
})

const rightData = reactive({
  absenteeism: {
    woman: 0,
    womanRate: 0,
    name: '缺勤',
    manRate: 0,
    man: 0,
    value: 0
  },
  failure: {
    woman: 0,
    womanRate: 0,
    name: '挂科',
    manRate: 0,
    man: 0,
    value: 0
  },
  womanRate: 0,
  manRate: 0,
  bottom: {
    rate: 0,
    failure: 0,
    name: "专业书籍相关图书借阅次数影响",
    borrow: 0,
    borrowFailure: 0
  }
})
const initAbsenceEffect = () => {
  const el: HTMLElement = instance?.refs.AbsenceEffect as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let option = {
    color: ['#B22924', '#F39D12', '#45A0E6'],
    title: {
      text: '单位/人',
      top: 0,
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
        fontWeight: 'normal'
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
      icon: 'roundRect',
      data: leftData.absenteeism.series.map((i: { name: string }) => i.name)
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
        data: leftData.absenteeism.xAxis,
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
        name: '学期缺勤次数',
        nameLocation: 'end',
        nameTextStyle: {
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
    series: leftData.absenteeism.series.map((i: { name: string, value: number }) => {
      return {
        type: 'line',
        name: i.name,
        smooth: true,
        symbol: 'none',
        data: i.value,
      }
    })
  };
  myChart?.setOption(option);
}
const initBooksEffect = () => {
  const el: HTMLElement = instance?.refs.BooksEffect as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let option = {
    color: ['#B22924', '#F39D12', '#45A0E6'],
    title: {
      text: '单位/人',
      top: 0,
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
        fontWeight: 'normal'
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
      icon: 'roundRect',
      data: leftData.borrow.series.map((i: { name: string }) => i.name)
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
        data: leftData.borrow.xAxis,
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
        name: '图书借阅次数',
        nameLocation: 'end',
        nameTextStyle: {
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
    series: leftData.borrow.series.map((i: { name: string, value: number }) => {
      return {
        type: 'line',
        name: i.name,
        smooth: true,
        symbol: 'none',
        data: i.value,
      }
    })
  };
  myChart?.setOption(option);
}
// watch(() => isEffectActive.value, val => {
//   changeChartData({ ...props.params, ident: 'Performance_Impact', category: val }).then(res => {
//     if (res.code == 1) {
//       console.log(1111111, res);
//       const { series = [], xAxis = [] } = res.data?.borrow || {}

//     }
//   })
// })

watch(dataSource, val => {
  // console.log(333333333333, toRaw(val));
  if (val.code == 1) {
    if (val.data) {
      leftData.absenteeism = val.data.absenteeism
      leftData.borrow = val.data.borrow
      nextTick(() => {
        initAbsenceEffect();
        initBooksEffect();
      })
    }
    if (val.datas2) {
      const { absenteeismOrFailure = {}, borrowOrFailure = {} } = val.datas2
      for (const key in absenteeismOrFailure) {
        if (Object.prototype.hasOwnProperty.call(absenteeismOrFailure, key)) {
          const element = absenteeismOrFailure[key];
          rightData[key] = element
        }
      }

      for (const key in borrowOrFailure) {
        if (Object.prototype.hasOwnProperty.call(borrowOrFailure, key)) {
          const element = borrowOrFailure[key];
          rightData.bottom[key] = element
        }
      }
    }
  }
}, { immediate: true, deep: true })
// onMounted(() => {
//   nextTick(() => {
//     initAbsenceEffect();
//     initBooksEffect();
//   })

// })
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>