<template>
  <div class="flex" :class="['academic-works', {
    'flex': true,
    'horizontal': direction === 'horizontal',
    'vertical': direction === 'vertical'
    }]" style="padding: 0 20px;">
    <div :class="direction === 'horizontal'?'w50':'w100'" style="padding-right: 20px;">
      <div class="ScientificResearch-one">
        <c-title title="基本信息画像" />
        <div class="up flex just-c align-items-c">
          <ColorCard  :cardConfig="colorConfig"/>
          <ColorCard class="mlr20" :cardConfig="colorConfig2"/>
          <ColorCard :cardConfig="colorConfig3"/>
        </div>
        <div class="chart" ref="Result"></div>
        <div class="text">
          每年参编著作数量变化趋势
        </div>
      </div>
    </div>
    <div v-if="$attrs.view !== 'left'" :class="direction === 'horizontal'?'w50':'w100'" style="padding-left: 20px;">
      <div class="content-three">
        <c-title title="特征分析"></c-title>
        <div class="content-three-box">
          <div class="sb">
            <div class="c-title">著作参编率</div>
            <div class="text">参编率 <span>{{ rightData.participationRate }}</span>&nbsp;人均参与<span>{{ rightData.perCapitaParticipation }}</span>次 &nbsp;主要参与次数分布<span>{{ rightData.mostPublish }}</span></div>
          </div>
          <div class="pie-chart" ref="MainPie"></div>
          <div class="three-box-bottom">
            <div class=" sb">
              <div class="c-title">著作出版社级别</div>
              <div class="text">{{ rightData.mostWorksPublish?.name }} <span>{{ rightData.mostWorksPublish?.value  }}</span>本/册&nbsp;占 <span>{{ rightData.mostWorksPublish?.proportion }}</span></div>
            </div>
            <ProgressBar style="margin-top: 30px;" :option="progressBarOption" />
          </div>
        </div>
        
      </div>
    </div>
    <WarningSeal name="学术著作" ident='Academic_works'/>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject, watch, getCurrentInstance, computed, onMounted, nextTick, toRefs } from 'vue'

import ColorCard from '@/components/common/ColorCard.vue';
import ProgressBar from '@/components/common/ProgressBar.vue'
import { BaseParams } from '../../types';
import { usePortraitRequest } from '@/hooks'
import WarningSeal from "@/components/WarningSeal";
import { _getMaxValue } from '@/utils';
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
const rightData =  ref<{detail: Array<any>,worksPublish:Array<any>,[key: string | symbol]: any}>({
  detail:[],
  worksPublish:[],

})
const colorConfig = reactive({
  color: '#00C9F2',
  title:'参编著作数量',
  value:'',
  isUnit:true,
  icon:getImageUrl('cbzzsl'),
  unit:'本/册',
})
const colorConfig2 = reactive({
  color: '#F39D12',
  title:'参编人次',
  value:'',
  isUnit:true,
  icon:getImageUrl('cbrc'),
  unit:'人次',
})
const colorConfig3 = reactive({
  color: '#6477DD',
  title:'参编人数',
  value:'',
  isUnit:true,
  icon:getImageUrl('cbrs'),
  unit:'人',
})
const progressBarOption = reactive({
  list: [],
  valuePosition:'right',
  lableWidth: 148,
  lableAlign:'right',
  unit:'本/册',
  height:'200px'
})
const initResult = () => {
  const el: HTMLElement = instance?.refs.Result as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = leftData.value.detail
  const max1 = _getMaxValue(data.map(item => item.works))
  const max2 = _getMaxValue(data.map(item => item.personTime))
  let option = {
    color:['#00C9F2','#F7B500'],
    title: {
      text: '单位：本/册',
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
          return `${name}<br/>${params[0].marker}${params[0].seriesName}:  ${params[0].value} 本/册<br/>
        ${params[1].marker}${params[1].seriesName}:  ${params[1].value} 人次`;
        }
        if(params.length&&params.length==1){
          let unit = params[0].seriesName=="著作数量"?'本/册':'人次'
          return `${name}<br/>${params[0].marker}${params[0].seriesName}:  ${params[0].value} ${unit}`;
        }
      },
    },
    legend: {
      right: '15%',
      top: '1%',
      itemWidth: 10,
      itemHeight: 5,
      data: ['著作数量', '参编人次']
    },
    grid: {
      top: '12%',
      left: 0,
      right: '5%',
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
        name:'单位：人次',
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
        name:'著作数量',
        barWidth: '20%',
        data: data.map(item => ({ value: item.works })),
        itemStyle: {
          borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
        },
      },
      {
        name: '参编人次',
        type: 'line',
        smooth: true,
        // symbol: 'ntwo',
        symbolSize: 8,
        yAxisIndex: 1,
        data: data.map(item => ({ value: item.personTime })),
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
  let data = rightData.value.detail
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
            const p = tarValue!=0?((tarValue / total) * 100).toFixed(2):0;
            return `{c|${name}} {b|${tarValue}人} {a| ${p}}%`;
        }

        },
        tooltip: {
          formatter : function(param:any){
            return `${param.marker}${param.name} : ${param.value} 人 (${param.percent}%)`
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

const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Academic_works' })
watch(dataSource, (res: any)=>{
    if(res.code != 1){
      return
    }
    let { data,datas2 } = res;
    leftData.value = {...data}
    rightData.value = {...datas2}
    colorConfig.value = data.works
    colorConfig2.value = data.personTime
    colorConfig3.value = data.value
    const colors = ['#1B528B', '#FD5145', '#F39D12']
    progressBarOption.list = datas2.worksPublish?.map((i: any, index: number) => ({...i, color: colors[index % 3]}))
    nextTick(() => {
      initResult();
      initMainPie();
    })
},{immediate:true})
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>