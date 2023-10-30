<template>
  <div class="flex" :class="['appraisal-results', {
    'flex': true,
    'horizontal': direction === 'horizontal',
    'vertical': direction === 'vertical'
    }]" style="padding: 0 20px;">
    <div :class="direction === 'horizontal'?'w50':'w100'" style="padding-right: 20px;">
      <div class="ScientificResearch-one">
        <c-title title="基本信息画像" />
        <div class="up flex just-c align-items-c">
          <ColorCard class="mr50" :cardConfig="colorConfig"/>
          <ColorCard  :cardConfig="colorConfig2"/>
        </div>
        <div class="chart" ref="Result"></div>
        <div class="text">
          每年鉴定成果数量变化趋势
        </div>
      </div>
    </div>
    <div v-if="$attrs.view !== 'left'" :class="direction === 'horizontal'?'w50':'w100'" style="padding-left: 20px;">
      <div class="content-three">
        <c-title title="特征分析"></c-title>
        <div class="content-three-box">
          <div class="sb">
            <div class="c-title">水平</div>
            <div class="text">主要成果水平 <span>{{ rightData.mostSituation }}</span></div>
          </div>
          <ProgressBar style="margin-top: 30px;" :option="progressBarOption" />
        
          <div class="three-box-bottom" >
            <div class="sb" style="margin-top: 20px;">
              <div class="c-title">类型</div>
              <div class="text">主要成果类型 <span>{{ rightData.mostSituationType }}</span></div>
            </div>
            <div class="pie-chart" ref="MainPie"></div>
          </div>
        </div>
        
      </div>
    </div>
    <WarningSeal name="鉴定成果" ident='Appraisal_results'/>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject, watch, getCurrentInstance, computed, onMounted, nextTick, toRefs } from 'vue'

import ColorCard from '@/components/common/ColorCard.vue';
import ProgressBar from '@/components/common/ProgressBar.vue'
import { BaseParams } from '../../types';
import { usePortraitRequest } from '@/hooks'
import WarningSeal from "@/components/WarningSeal";
import { _getMaxValue, } from '@/utils';
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const props = withDefaults(defineProps<{
  params: BaseParams, direction?: 'horizontal' | 'vertical',
}>(), { 
  direction:'horizontal'
}) 
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const leftData =  ref<{detail: Array<any>,[key: string | symbol]: any}>({
  detail:[],
})
const rightData =  ref<{situationTypes: Array<any>,situations:Array<any>,[key: string | symbol]: any}>({
  situationTypes:[],
  situations:[],
})
const colorConfig = reactive({
  color: '#6477DD',
  title:'成果数量',
  value:'',
  isUnit:true,
  icon:getImageUrl('cgsl'),
  unit:'项',
})
const colorConfig2 = reactive({
  color: '#00C9F2',
  title:'鉴定通过率',
  value:'',
  isUnit:true,
  icon:getImageUrl('jdtgl'),
  unit:'%',
})
const colors = ['#005DA7','#6477DD','#FD5145','#F39D12']
const progressBarOption = reactive({
  list: [],
  valuePosition:'right',
  lableWidth: 100,
  lableAlign:'right',
  valueWidth: 55,
  unit:'项'
})
const initResult = () => {
  const el: HTMLElement = instance?.refs.Result as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = leftData.value.detail
  const max1 = _getMaxValue(data.map(item => item.total))
  const max2 = _getMaxValue(data.map(item => item.passingRate))
  let option = {
    color:['#6477DD','#00C9F2'],
    title: {
      text: '单位：项',
      top: 0,
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
        fontWeight:'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params:any) {
        let name = params[0].name
        if(params.length&&params.length==2){
          return `${name}<br/>${params[0].marker}${params[0].seriesName}:  ${params[0].value} 项<br/>
        ${params[1].marker}${params[1].seriesName}:  ${params[1].value} %`;
        }
        if(params.length&&params.length==1){
          let unit = params[0].seriesName=="成果数量"?'项':'%'
          return `${name}<br/>${params[0].marker}${params[0].seriesName}:  ${params[0].value} ${unit}`;
        }
      },
    },
    legend: {
      right: '15%',
      top: '1%',
      itemWidth: 10,
      itemHeight: 5,
      data: ['成果数量', '鉴定通过率']
    },
    grid: {
      top: '12%',
      left: 0,
      right: '2%',
      bottom: '4%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.map(item => ({ value: item.year })),
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
        max: max1, 
        splitNumber: 5, 
        interval: max1 / 5, 
      },
      { 
        name:'单位：%',
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
        max: max2, 
        splitNumber: 5, 
        interval: max2 / 5, 
      },

    ],
    series: [
    {
        type: 'bar',
        name:'成果数量',
        barWidth: '20%',
        data: data.map(item => ({ value: item.total })),
        itemStyle: {
          borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
        },
      },
      {
        name: '鉴定通过率',
        type: 'line',
        smooth: true,
        // symbol: 'ntwo',
        symbolSize: 8,
        yAxisIndex: 1,
        data: data.map(item => ({ value: item.passingRate })),
      },
    ]
  };
  myChart?.setOption(option);
}
const initMainPie = () => {
  const el: HTMLElement = instance?.refs.MainPie as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = rightData.value.situationTypes
  let option = {
        color:['#FD5145','#1B528B','#00C9F2','#F7B500',],
        legend: {
          type: "scroll",
          orient: 'vertical',
          top: 'middle',
          right: '15%',
          bottom: '0%',
          textStyle: {
            color: "#3E5463",
            fontSize: 14,

            backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
            rich: {
              a: {
                // width: 60,
                padding: [0, 0, 0, 0],
                color:'#3E5463',
                fontWeight:'bold'
              },
              b: {
                width: 60,
                padding: [0, 0, 0, 10],
                color:'#3E5463',
                fontWeight:'bold'
              },
              c: {
                width: 60,
                padding: [0, 0, 0, 0],
              },
            },
          },
          itemWidth: 10,
          itemHeight: 4,
          itemGap: 10,
          icon: "rect",
          pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
          pageIconSize: 12,  //当然就是按钮的大小
          pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
          tooltip: {
            show: true
          },
          data: data.map((item) => item.name),
          formatter: (name: string) => {
            let total = 0;
            let tarValue: number = 0; // 为 tarValue 赋一个默认值
            for (let i = 0; i < data.length; i++) {
                total += data[i].value;
                if (name === data[i].name) {
                    tarValue = data[i].value;
                }
            }
            const p = tarValue!=0? ((tarValue / total) * 100).toFixed(2): 0;
            return `{c|${name}} {b|${tarValue}项} {a| ${p}}%`;
        }

        },
        tooltip: {
          formatter : function(param:any){
            return `${param.marker}${param.name} : ${param.value} 项 (${param.percent}%)`
          }
        },
        series: [
          {
            z: 2,
            radius: ['60%', '70%'],
            center: ['26%', '50%'],
            type: 'pie',
            //roseType: 'radius',
            emphasis: {
              label: {
                show: false
              }
            },
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 4,
              normal: {
              }
            },
            data: data
          },
          {
            z: 1,
            radius: ['70%', '80%'],
            center: ['26%', '50%'],
            type: 'pie',
            //roseType: 'radius',
            emphasis: {
              label: {
                show: false
              }
            },

            //animation: false,
            itemStyle: {
              normal: {
                opacity: 0.2,
              }
            },
            label: {
              show: false,
            },
            labelLine: {
              show: false
            },
            tooltip: {
              show: false
            },
            silent: true,
            data: data
          },
        

        ]
  }
  myChart?.setOption(option);
}

const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Appraisal_results' })
watch(dataSource, (res: any)=>{
    if(res.code != 1){
      return
    }
    let { data,datas2 } = res;
    leftData.value = {...data}
    rightData.value = {...datas2}
    colorConfig.value = data.total
    colorConfig2.value = data.passingRate || '0'
    progressBarOption.list = datas2.situations
    progressBarOption.list.forEach((item:any,index)=>{
      item.color = colors[index]
    })
    nextTick(() => {
      initResult();
      initMainPie();
    })
},{immediate:true})
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>