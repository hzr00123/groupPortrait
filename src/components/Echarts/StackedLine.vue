<template>
    <div class="c-stackedLine">
        <div class="hint">日均消费金额 <span>12.55元 低于</span> 学校平均水平 <span>15.22元</span></div>
        <div class="my-echarts" ref="myEcharts"></div>
    </div>
</template>
    
<script setup lang='ts'>
import { getCurrentInstance, onMounted, nextTick } from 'vue';

const instence = getCurrentInstance()
const echarts = instence?.proxy?.$echarts;
type option = echarts.EChartsOption;
const option = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    icon: 'rect',
    x:'right',
    itemWidth: 12,
    itemHeight: 4,
    top: 30,
    data: ['突发贫困人群', '学校平均'],
    textStyle: {
        color: "#3E5463",
        fontFamily: 'Regular',
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['0307', '0308', '0309', '0310', '0311', '0312', '0313']
  },
  yAxis: {
    type: 'value',
    name: "单位/元",
    nameTextStyle: {
        color: "#3E5463",
        fontFamily: 'Regular',
        nameLocation: "start",
    },
  },
  series: [
    {
      name: '突发贫困人群',
      type: 'line',
      stack: '',
      color: '#1B528B',
      data: [80, 40, 63, 60, 66, 62, 55],
    },
    {
      name: '学校平均',
      type: 'line',
      stack: '',
      color: '#B22A25',
      data: [25, 22, 50, 50, 66, 44, 60]
    }
  ]
};

onMounted(() => {
    nextTick(() => {
        const ele: HTMLElement = instence?.refs.myEcharts as any
        const myChart = echarts?.init(ele, undefined, {
            renderer: 'svg'
        });
        myChart?.setOption(option)
    })
})
console.log(echarts);

</script>
    
<style lang="scss" scoped>
.c-stackedLine {
    height: 300px;
    text-indent: 20px;
    .hint {
        font-size: 16px;
        font-family: Medium;
        color: #3E5463;
        line-height: 22px;
        span {
            color: #B22A25;
            padding: 0 5px;
        }
    }
    .my-echarts {
        width: 100%;
        height: 100%;
    }
}
    
</style>