<template>
  <div class="wordCloud">
    <div class="left-box" :style="{ left: wordCloudObj.position == 'center' ? '45px' : '0' }">
      <div class="left-chart" ref="leftWordCloud"></div>
      <div class="sex" v-if="wordCloudObj.position == 'bottom'">{{wordCloudObj.leftText?wordCloudObj.leftText:'男'}}</div>
    </div>
    <div class="center" ref="centerWordCloud"></div>
    <div class="right-box" :style="{ right: wordCloudObj.position == 'center' ? '45px' : '0' }">
      <div class="right-chart" ref="rightWordCloud"></div>
      <div class="sex" v-if="wordCloudObj.position == 'bottom'">{{wordCloudObj.rightText?wordCloudObj.rightText:'女'}}</div>
    </div>
    <div class="sex-man" v-if="wordCloudObj.position == 'center'">{{wordCloudObj.leftText?wordCloudObj.leftText:'男'}}</div>
    <div class="sex-woman" v-if="wordCloudObj.position == 'center'">{{wordCloudObj.rightText?wordCloudObj.rightText:'女'}}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, getCurrentInstance, watch, ref, reactive } from 'vue'
import { WordCloudConfig } from './Search'
const instance = getCurrentInstance();
import Bese64 from './wordCloudBese64.json';
const echart = instance?.proxy?.$echarts

const props = withDefaults(defineProps<{
  wordCloudObj: WordCloudConfig,
}>(), {
})

const leftMyChart = ref()
const centerMyChart = ref()
const rightMyChart = ref()
let LeftImage = new Image();
LeftImage.src = Bese64.left
const leftOption = reactive({
  series: [{
    type: 'wordCloud',
    maskImage: LeftImage,
    sizeRange: [14, 22],
    rotationRange: [0, 0],
    rotationStep: 45,
    gridSize: 10,
    shape: 'diamond',
    left: '-12.5%',
    top: 'center',
    width: '100%',
    height: '100%',
    textStyle: {
      color: function (params: { value: number }) {
        let opacity = params.value / Math.max(...props.wordCloudObj.data1.map(item => item.value));
        return 'rgba(27, 82, 139, ' + opacity + ')';
      }
    },
    data: props.wordCloudObj.data1
  }]
})
let rightImage = new Image();
rightImage.src = Bese64.right
const rightOption = reactive({
    series: [{
      type: 'wordCloud',
      maskImage: rightImage,
      sizeRange: [14, 22],
      rotationRange: [0, 0],
      rotationStep: 45,
      gridSize: 10,
      shape: 'diamond',
      left: '12.5%',
      top: 'center',
      width: '100%',
      height: '100%',
      textStyle: {
        color: function (params: { value: number }) {
          // 根据数值计算颜色透明度
          // let opacity =  params.value / 100; // 计算透明度
          let opacity = params.value / Math.max(...props.wordCloudObj.data3.map(item => item.value));
          return 'rgba(69, 160, 230, ' + opacity + ')'; // 返回颜色值
        }
      },
      data: props.wordCloudObj.data3
    }]
  })
  let centerImage = new Image();
  centerImage.src = Bese64.center
const centerOption = reactive({
    series: [{
      type: 'wordCloud',
      maskImage: centerImage,
      sizeRange: [14, 22],
      rotationRange: [0, 0],
      rotationStep: 45,
      gridSize: 5,
      shape: 'diamond',
      left: 'center',
      top: 'center',
      width: '100%',
      height: '100%',
      textStyle: {
        color: function (params: { value: number }) {
          // 根据数值计算颜色透明度
          // let opacity =  params.value / 100; // 计算透明度
          let opacity = params.value / Math.max(...props.wordCloudObj.data2.map(item => item.value));
          return 'rgba(178, 41, 36, ' + opacity + ')'; // 返回颜色值
        }

      },
      data: props.wordCloudObj.data2
    }]
  })
const initLeft = () => {
  const el: HTMLElement = instance?.refs.leftWordCloud as any;
  leftMyChart.value = echart?.getInstanceByDom(el)
  if (leftMyChart.value == undefined) {
    leftMyChart.value = echart?.init(el, undefined, { renderer: 'svg' });
  }
  let maskImage = new Image();
  maskImage.src = Bese64.left
  leftMyChart.value?.setOption(leftOption)
}
const initRight = () => {
  const el: HTMLElement = instance?.refs.rightWordCloud as any;
  rightMyChart.value = echart?.getInstanceByDom(el)
  if (rightMyChart.value == undefined) {
    rightMyChart.value = echart?.init(el, undefined, { renderer: 'svg' });
  }
  rightMyChart.value?.setOption(rightOption)
}
const initCenter = () => {
  const el: HTMLElement = instance?.refs.centerWordCloud as any;
  centerMyChart.value = echart?.getInstanceByDom(el)
  if (centerMyChart.value == undefined) {
    centerMyChart.value = echart?.init(el, undefined, { renderer: 'svg' });
  }
  centerMyChart.value?.setOption(centerOption)
}
watch(() => props.wordCloudObj, val => {
  leftOption.series[0].data = val.data1
  rightOption.series[0].data = val.data3
  centerOption.series[0].data = val.data2
  nextTick(() => {
    if (leftMyChart.value) {
      leftMyChart.value.setOption(leftOption);
      leftMyChart.value.resize();
    }
    if (centerMyChart.value) {
      centerMyChart.value.setOption(centerOption);
      centerMyChart.value.resize();
    }
    if (rightMyChart.value) {
      rightMyChart.value.setOption(rightOption);
      rightMyChart.value.resize();
    }
  })
}, { deep: true })
onMounted(() => {
  initLeft();
  initCenter();
  initRight();
})
</script>
<style lang="scss" >
.wordCloud {
  min-width: 380px;
  position: relative;

  .left-box {
    position: absolute;
    top: 0;

    // left: 45px;
    .left-chart {
      width: 250px;
      height: 146px;
      background: rgba(27, 82, 139, 0.06);
      border: 1px dashed #1B528B;
      border-radius: 50%;
    }

    .sex {
      width: 100%;
      text-align: center;
      font-size: 16px;
      font-family: Regular;
      color: #203449;
      height: 16px;
      line-height: 16px;
      margin-top: 20px;
    }
  }

  .right-box {
    position: absolute;
    top: 0;

    // right: 45px;
    .right-chart {
      width: 250px;
      height: 146px;
      background: rgba(178, 41, 36, 0.06);
      border: 1px dashed #B22924;
      border-radius: 50%;
    }

    .sex {
      width: 100%;
      text-align: center;
      font-size: 16px;
      font-family: Regular;
      color: #203449;
      height: 16px;
      line-height: 16px;
      margin-top: 20px;
    }
  }

  .center {
    width: 120px;
    height: 146px;
    margin: 0 auto;
  }

  .sex-man {
    width: 60px;
    height: 146px;
    text-align: right;
    line-height: 146px;
    font-size: 18px;
    font-family: Regular;
    color: #000000;
    position: absolute;
    left: -30px;
    top: 0;
  }

  .sex-woman {
    width: 60px;
    height: 146px;
    text-align: left;
    line-height: 146px;
    font-size: 18px;
    font-family: Regular;
    color: #000000;
    position: absolute;
    right: -30px;
    top: 0;
  }

}</style>