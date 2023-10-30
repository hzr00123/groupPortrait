<template>
  <div class="flex" :class="['research-report', {
    'flex': true,
    'horizontal': direction === 'horizontal',
    'vertical': direction === 'vertical'
    }]" style="padding: 0 20px;">
    <div :class="direction === 'horizontal'?'w50':'w100'" style="padding-right: 20px;">
      <div class="ScientificResearch-one">
        <c-title title="基本信息画像" />
        <div class="up flex just-c align-items-c">
          <ColorCard class="mr50" :cardConfig="colorConfig"/>
          <ColorCard :cardConfig="colorConfig2"/>
        </div>
        <div class="chart" ref="Result"></div>
        <div class="text">
          每年研究报告数量变化趋势
        </div>
      </div>
    </div>
    <div v-if="$attrs.view !== 'left'" :class="direction === 'horizontal'?'w50':'w100'" style="padding-left: 20px;">
      <div class="content-four">
        <c-title title="特征分析"></c-title>
        <div class="content-four-box">
          <div class="four-box-top sb">
            <div class="left">
              <div class="sb">
                <div class="c-title">频次</div>
                <div class="text">主要发表次数分布 <span>{{ rightData.mostPublish }}</span></div>
              </div>
              <div class="pie-chart" ref="MainPie"></div>
            </div>
            <div class="right">
              <div class="sb">
                <div class="c-title">核心</div>
                <div class="text">核心期刊发表 <span>{{ rightData.coreJournal?.coreJournalTotal }}</span>篇&nbsp;占<span>{{ rightData.coreJournal?.proportion }}</span></div>
              </div>
              <div class="pie-chart" ref="topCy"></div>
            </div>
          </div>
        
          <div class="four-box-bottom sb">
            <div class="left">
              <div class="sb">
                <div class="c-title">领域</div>
                <div class="text">主要领域分布 <span>{{ rightData.mostField }}</span></div>
              </div>
              <div class="docment-chart" ref="docmentPie"></div>
            </div>
            <div class="right">
              <div class="sb">
                <div class="c-title">关键词</div>
                <div class="text">关键词 <span>{{ rightData.keyword }}</span></div>
              </div>
              <div class="pie-chart" ref="BottomCy"></div>
            
            </div>
          </div>
        </div>
        
      </div>
    </div>
    <WarningSeal name="研究报告" ident='research_report'/>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject, watch, getCurrentInstance, computed, onMounted, nextTick, toRefs } from 'vue'
import ColorCard from '@/components/common/ColorCard.vue';
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
  params: {} as any,
  direction:'horizontal'
}) 
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const leftData =  ref<{detail: Array<any>,[key: string | symbol]: any}>({
  detail:[],
})
const rightData =  ref<{detail: Array<any>,thesisField:Array<any>,achievementsField:Array<any>,keywordSort:Array<any>,[key: string | symbol]: any}>({
  detail:[],
  thesisField:[],
  achievementsField:[],
  keywordSort:[],
})
const colorConfig = reactive({
  color: '#1B528B',
  title:'报告数量',
  value:'',
  isUnit:true,
  icon:getImageUrl('lwsl'),
  unit:'篇',
})
const colorConfig2 = reactive({
  color: '#F39D12',
  title:'作者人数',
  value:'',
  isUnit:true,
  icon:getImageUrl('cbrs'),
  unit:'人',
})

const initResult = () => {
  const el: HTMLElement = instance?.refs.Result as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = leftData.value.detail
  const max1 = _getMaxValue(data.map(item => item.paper))
  const max2 = _getMaxValue(data.map(item => item.auther))
  let option = {
    color:['#1B528B','#F39D12'],
    title: {
      text: '单位：篇',
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
          return `${name}<br/>${params[0].marker}${params[0].seriesName}:  ${params[0].value} 篇<br/>
        ${params[1].marker}${params[1].seriesName}:  ${params[1].value} 人`;
        }
        if(params.length&&params.length==1){
          let unit = params[0].seriesName=="报告数量"?'篇':'人'
          return `${name}<br/>${params[0].marker}${params[0].seriesName}:  ${params[0].value} ${unit}`;
        }
      },
    },
    legend: {
      right: '15%',
      top: '1%',
      itemWidth: 10,
      itemHeight: 5,
      data: ['报告数量', '作者人数']
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
        max: max2, 
        splitNumber: 5, 
        interval: max2 / 5, 
      },

    ],
    series: [
    {
        type: 'bar',
        name:'报告数量',
        barWidth: '20%',
        data: data.map(item => ({ value: item.paper })),
        itemStyle: {
          borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
        },
      },
      {
        name: '作者人数',
        type: 'line',
        smooth: true,
        // symbol: 'ntwo',
        symbolSize: 8,
        yAxisIndex: 1,
        data: data.map(item => ({ value: item.auther })),
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
          right: '0%',
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
                width: 50,
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
            const p =tarValue!=0? ((tarValue / total) * 100).toFixed(2):0;
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
            radius: ['40%', '50%'],
            center: ['17%', '50%'],
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
            radius: ['50%', '58%'],
            center: ['17%', '50%'],
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
const initTopCy = () => {
  const el: HTMLElement = instance?.refs.topCy as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let datas = rightData.value.coreJournal?.coreJournalsSort
  let maxVal = Math.max(...datas.map((item: { value: any; }) => item.value)); 
  let option = {
    series: [{
      type: 'wordCloud',
      sizeRange: [14, 30],
      rotationRange: [0, 0],
      rotationStep: 45,
      gridSize: 30,
      shape: 'diamond',
      width: '100%',
      height: '100%',
      textStyle: {
        color: function (params: { value: number }) {
            var opacity =  params.value / maxVal;
            return 'rgba(178, 41, 36, ' + opacity + ')'; 
        }
      },
      data: datas
    }]
  };
  myChart?.setOption(option);
}
const initDocmentPie = () => {
  const el: HTMLElement = instance?.refs.docmentPie as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = rightData.value.achievementsField
  let option = {
        color:['#005DA7','#00C9F2','#8C6C4E','#F39702','#E3493E','#231815','#4D5FC1','#45A0E6',],
        legend: {
          type: "scroll",
          orient: 'vertical',
          top: 'middle',
          right: '0%',
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
                width: 50,
                padding: [0, 0, 0, 10],
                color:'#3E5463',
                fontWeight:'bold',
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
            const p =tarValue!=0? ((tarValue / total) * 100).toFixed(2):0;
            return `{c|${name}} {b|${tarValue}篇} {a| ${p}}%`;
        }

        },
        tooltip: {
          formatter : function(param:any){
            return `${param.marker}${param.name} : ${param.value} 篇 (${param.percent}%)`
          }
        },
        series: [
          {
            z: 2,
            radius: ['35%', '50%'],
            center: ['17%', '50%'],
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
              borderWidth: 2,

            },
            data: data
          },
        ]
  }
  myChart?.setOption(option);
}
const initBottomCy = () => {
  const el: HTMLElement = instance?.refs.BottomCy as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let datas = rightData.value.keywordSort
  let maxVal = Math.max(...datas.map(item => item.value)); 
  let option = {
    series: [{
      type: 'wordCloud',
      sizeRange: [14, 30],
      rotationRange: [0, 0],
      rotationStep: 45,
      gridSize: 30,
      shape: 'diamond',
      width: '100%',
      height: '100%',
      textStyle: {
        color: function (params: { value: number }) {
            var opacity =  params.value / maxVal;
            return 'rgba(27, 82, 139, ' + opacity + ')'; 
        }
      },
      data: datas
    }]
  };
  myChart?.setOption(option);
}

const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'research_report'})
watch(dataSource, (res: any)=>{
    if(res.code != 1){
      return
    }
    let { data,datas2 } = res;
    leftData.value = {...data}
    rightData.value = {...datas2}
    colorConfig.value = data.paper
    colorConfig2.value = data.auther
    nextTick(() => {
      initResult();
      initMainPie();
      initTopCy();
      initDocmentPie();
      initBottomCy();
    })
},{immediate:true})
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>