<template>
  <div class="flex" :class="['over-view',{
    'flex': true,
    'horizontal': direction === 'horizontal',
    'vertical': direction === 'vertical'
  }]" style="padding: 0 20px;">
    <div :class="direction === 'horizontal'?'w50':'w100'" style="padding-right: 20px;">
      <div class="ScientificResearch-one">
        <c-title title="基本信息画像" />
        <div class="up flex just-c align-items-c">
          <ColorCard style="cursor: pointer;" @click="clickCard" class="mr50" :cardConfig="colorConfig"/>
          <ColorCard :cardConfig="colorConfig2"/>
        </div>
        <div class="chart" ref="Result"></div>
        <div class="text">
          每年科研成果及获奖变化趋势
        </div>
      </div>
    </div>
    <div v-if="$attrs.view !== 'left'" :class="direction === 'horizontal'?'w50':'w100'" style="padding-left: 20px;">
      <div class="content-one">
        <c-title title="特征分析"></c-title>
        <div class="content-one-box">
          <div class="sb">
            <div class="c-title">科研成果分布</div>
            <div class="text">主要科研成果 <span>{{ rightData.mostAchievementsType }}</span></div>
          </div>
          <div class="pie-chart" ref="MainPie"></div>
          <div class="sb">
            <div class="c-title">科研获奖分布</div>
            <div class="text">主要科研获奖 <span>{{ rightData.mostAwardType }}</span></div>
          </div>
          <div class="pie-chart" ref="AwardsPie"></div>
          <div class="text">
            <span>《{{rightData.mostAwards&&rightData.mostAwards.name||''}}》</span> 累计获奖 <span class="color">{{rightData.mostAwards&&rightData.mostAwards.total||''}}</span>次
          </div>
        </div>
        
      </div>
    </div>
    <PageModal v-if="showPages" :param="params!" @closeModal="closeModal"/>
    <WarningSeal name="总览" ident='Overview'/>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, getCurrentInstance, computed, onMounted, nextTick, inject, toRefs } from 'vue'
import ColorCard from '@/components/common/ColorCard.vue';
import { BaseParams } from '../../types';
import { usePortraitRequest } from '@/hooks'
import PageModal from './PageModal.vue';
import WarningSeal from "@/components/WarningSeal";
import { _getMaxValue } from '@/utils';
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const props = withDefaults(defineProps<{
  params: BaseParams, direction?: 'horizontal' | 'vertical',
}>(), { 
  params: {} as any,
  direction:'horizontal'
}) 
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const leftData =  ref<{detail: Array<any>,[key: string | symbol]: any}>({
  detail:[],
})
const rightData =  ref<{detail: Array<any>,awardDetail:Array<any>,[key: string | symbol]: any}>({
  detail:[],
  awardDetail:[],
})
const showPages = ref(false)
const colorConfig = reactive({
  color: '#6477DD',
  title:'科研成果总数',
  value:'',
  isUnit:true,
  icon:getImageUrl('kycgzs'),
  unit:'项',
})
const colorConfig2 = reactive({
  color: '#F39D12',
  title:'科研获奖总数',
  value:'',
  isUnit:true,
  icon:getImageUrl('kyhjzs'),
  unit:'次',
})

const initResult = () => {
  const el: HTMLElement = instance?.refs.Result as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = leftData.value.detail
  const max1 = _getMaxValue(data.map(item => item.total))
  const max2 = _getMaxValue(data.map(item => item.awards))
  let option = {
    color:['#6477DD','#FFCC00'],
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
        ${params[1].marker}${params[1].seriesName}:  ${params[1].value} 次`;
        }
        if(params.length&&params.length==1){
          let unit = params[0].seriesName=="科研成果数"?'项':'次'
          return `${name}<br/>${params[0].marker}${params[0].seriesName}:  ${params[0].value} ${unit}`;
        }
      },
    },
    legend: {
      right: '15%',
      top: '1%',
      itemWidth: 10,
      itemHeight: 5,
      data: ['科研成果数', '科研获奖次数']
    },
    grid: {
      top: '12%',
      left: 0,
      right: '4%',
      bottom: '4%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.map((item: { year: any; }) => ({ value: item.year })),
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
        name:'单位：次',
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
        name:'科研成果数',
        barWidth: '20%',
        data: data.map((item: { total: any; }) => ({ value: item.total })),
        itemStyle: {
          borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
        },
      },
      {
        name: '科研获奖次数',
        type: 'line',
        smooth: true,
        // symbol: 'none',
        symbolSize: 8,
        yAxisIndex: 1,
        data: data.map((item: { awards: any; }) => ({ value: item.awards })),
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
const initAwardsPie = () => {
  const el: HTMLElement = instance?.refs.AwardsPie as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data:Array<any> = rightData.value.awardDetail
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
          data: data.map((item:{name:string}) => item.name),
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
const clickCard = () =>{
  showPages.value = true;
}
const closeModal = () => {
  showPages.value = false;
}

const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Overview' })
watch(dataSource, (res: any)=>{
    if(res.code != 1){
      return
    }
    let { data,datas2 } = res;
    leftData.value = {...data}
    rightData.value = {...datas2}
    colorConfig.value = data.total
    colorConfig2.value = data.awards
    nextTick(() => {
      initResult();
      initMainPie();
      initAwardsPie();
    })
},{immediate:true})
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>