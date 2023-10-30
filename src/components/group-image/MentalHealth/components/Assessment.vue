<template>
  <el-row :gutter="40" style="padding: 0 20px;">
    <el-col :span="direction === 'horizontal' ? 12 : 24">
      <div class="MentalHealth-one">
        <div class="MentalHealth-left-top sb">
          <c-title title="基本信息画像" />
          <RedTab :btnList="list" :isActive="isClsActive" @redTabChange="clickCls" />
        </div>
        <div class="speciality column" v-if="isClsActive == 'Distribution_of_Big_Five_Personality_Traits'">
          <div class="round-box column">
            <div class="round"></div>
            <div class="top-l flex-end">
              <div class="text">
                <span>6500</span>人，<span>65</span>%
              </div>
              <div class="tag ml16">开放性</div>
            </div>
            <div class="top-r flex-start">
              <div class="tag">尽责性</div>
              <div class="text">
                <span>6500</span>人，<span>65</span>%
              </div>
            </div>
            <div class="center-l flex-end">
              <div class="text">
                <span>6500</span>人，<span>65</span>%
              </div>
              <div class="tag">神经质</div>
            </div>
            <div class="center-r flex-start">
              <div class="tag">外倾性</div>
              <div class="text">
                <span>6500</span>人，<span>65</span>%
              </div>
            </div>
            <div class="bottom-c column">
              <div class="tag">宜人性</div>
              <div class="text">
                <span>6500</span>人，<span>65</span>%
              </div>
            </div>
          </div>
        </div>

        <div class="difference" v-if="isClsActive == 'Difference_analysis'">

        </div>

      </div>
    </el-col>
    <el-col :span="direction === 'horizontal' ? 12 : 24">
      <div class="content-one">
        <c-title title="特征分析"></c-title>
        <div class="content-one-speciality" v-if="isClsActive == 'Distribution_of_Big_Five_Personality_Traits'">
          <div class="c-title">大五人格特质分布</div>
          <div class="speciality-box">
            <div class="list-item flex-start" style="background: #fff;">
              <div class="tag" style="background: #45A0E6;">
                主要特质
              </div>
              <div class="msg-box">
                主要特质 <span class="bold">尽责性、外倾性</span>
              </div>
            </div>
            <div class="list-item flex-start" style="background: #fff;">
              <div class="tag" style="background: #B22924;">
                总体评分
              </div>
              <div class="msg-box">
                <span class="bold">神经质、外倾性、宜人性</span>评分高于全国常模
              </div>
            </div>
          </div>
          <div class="radar" ref="radar"></div>
        </div>
        <div class="content-one-difference" v-if="isClsActive == 'Difference_analysis'">
          <div class="c-title">男女差异分析</div>
          <div class="speciality-box">
            <div class="list-item flex-start" style="background: #fff;">
              <div class="tag" style="background: #45A0E6;">
                主要特质
              </div>
              <div class="msg-box">
                主要特质 <span class="bold">尽责性、外倾性</span>
              </div>
            </div>
            <div class="list-item flex-start" style="background: #fff;">
              <div class="tag" style="background: #B22924;">
                总体评分
              </div>
              <div class="msg-box">
                <span class="bold">神经质、外倾性、宜人性</span>评分高于全国常模
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, watch, getCurrentInstance, onMounted, nextTick } from 'vue'
import RedTab from '@/components/common/RedTab.vue'
import { BaseParams } from '../../types';

const props = withDefaults(defineProps<{
  params: BaseParams, selectList?: any[], direction?: 'horizontal' | 'vertical',
}>(), {
  selectList: [
    {
      value: 'Distribution_of_Big_Five_Personality_Traits',
      label: "大五人格特质分布"
    },
    {
      value: 'Difference_analysis',
      label: "差异性分析"
    },
  ] as any,
  isActive: 'scholarship',
  direction: 'horizontal',
})
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts

const isClsActive = ref<string | number>(props.selectList![0].value)
const list = ref(props.selectList!)
const radar = ref<HTMLElement>()

const initRadarChart = () => {
  const el = radar.value;
  if(!el) return
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let datas = [
    {
      value: [4200, 3000, 20000, 35000, 50000],
      name: '全国常模'
    },
    {
      value: [5000, 14000, 28000, 26000, 42000],
      name: '已选学生'
    }
  ]
  let option = {
    color: ['#00C9F2', '#F39702'],
    legend: {
      orient: 'vertical',
      top: 'center',
      right: '12%',
      textStyle: {
        color: "#3E5463",
        fontSize: 14,
        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
      },
      itemWidth: 10,
      itemHeight: 6,
      itemGap: 10,
      icon: "rect",
      pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
      pageIconSize: 12,  //当然就是按钮的大小
      pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
      tooltip: {
        show: true
      },
      data: ['全国常模', '已选学生'],
    },
    tooltip: {
      // formatter: '{b} : {c} 人 ({d}%)'
    },
    radar: {
      // shape: 'circle',
      center: ['50%', '55%'],
      radius: '70%',
      axisName: {
        color: '#333333',
        fontSize: 14,
      },
      indicator: [
        { name: '神经质', },
        { name: '尽责性', },
        { name: '宜人性', },
        { name: '开放性', },
        { name: '外倾性', },

      ]
    },
    series: [
      {
        type: 'radar',
        areaStyle: {
          opacity: 0.2
        },
        symbol: 'none',
        showLegendSymbol: false,
        data: datas
      }
    ],

  }
  myChart?.setOption(option)
}
const clickCls = (index: number | string) => {
  isClsActive.value = index;
  if (index == 'Distribution_of_Big_Five_Personality_Traits') {
    nextTick(() => {
      initRadarChart();
    })
  } else {
    nextTick(() => {

    })
  }

}




watch(() => isClsActive.value, (val) => {
  if (val == 'Distribution_of_Big_Five_Personality_Traits') {
    nextTick(() => {
      initRadarChart();
    })
  } else {
    nextTick(() => {

    })
  }

}, { immediate: true })
onMounted(() => {
  nextTick(() => {
    initRadarChart();
  })

})
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>