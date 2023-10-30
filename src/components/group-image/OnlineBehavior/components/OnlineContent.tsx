import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, provide, toRefs, onUnmounted } from "vue"
import { BaseParams } from "../../types";
import { usePortraitRequest,useChildrenData } from "@/hooks";
import InstanceManager, { getImageUrl, _getMaxValue, } from '@/utils';
import '../index.scss'
import ColorCard from '@/components/common/ColorCard.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import WarningSeal from "@/components/WarningSeal";

const LeftView = defineComponent({
  setup(props, content) {
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const params = inject<BaseParams>('params',  {} as any)
    const instanceManager = inject<InstanceManager>('InstanceManager')
    const LeftChart = ref()
    const colorConfig = ref([
      {
        color: '#005DA7',
        title: '累计使用频次',
        value: '',
        isUnit: true,
        icon: getImageUrl('swzsc'),
        unit: '万次',
        width: '180px'
      },
      {
        color: '#00C9F2',
        title: '累计逗留时长',
        value: '',
        isUnit: true,
        icon: getImageUrl('yjsc'),
        unit: '万小时',
        width: '180px'
      },
    ])
    const LeftData = ref<{freqSeries:Array<any>,duraSeries:Array<any>,xAxis:Array<any>}>({
      freqSeries:[],
      duraSeries:[],
      xAxis:[],
    })
    const initLeftChart = () => {
      const el: HTMLElement = LeftChart.value;
      let myChart = echart?.getInstanceByDom(LeftChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const max1 = _getMaxValue(LeftData.value.freqSeries)
      const max2 = _getMaxValue(LeftData.value.duraSeries)
      let option = {
        color: ['#F39702', '#45A0E6'],
        title: {
          text: '单位：次',
          top: 0,
          left: 0,
          textStyle: {
            color: '#333333',
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params:any) {
            let name = params[0].name
            return `${name}<br/>${params[0].marker}${params[0].seriesName}:  ${params[0].value} 次<br/>
            ${params[1].marker}${params[1].seriesName}:  ${params[1].value} 小时`;
          },
        },
        legend: {
          left: '12%',
          top: '1%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['使用频次', '逗留时长']
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: LeftData.value.xAxis,
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
            name: '单位：小时',
            nameLocation: 'end',
            nameTextStyle: {
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
            name: '使用频次',
            barWidth: '20%',
            data: LeftData.value.freqSeries,
            itemStyle: {
              borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
            },
          },
          {
            name: '逗留时长',
            type: 'line',
            smooth: true,
            symbol: 'none',
            symbolSize: 8,
            yAxisIndex: 1,
            data: LeftData.value.duraSeries,
          },
        ]
      };
      myChart?.setOption(option);
    }
    const dataSource = usePortraitRequest({...toRefs(params) as any, ident: 'Online_behavior_content' })
    onMounted(() => {
      instanceManager?.register('dataSource', dataSource)
      nextTick(() => {
        initLeftChart();
      })
    })

    watch(dataSource, (res) => {
      if(res.code !=1){
        LeftData.value = { freqSeries:[], duraSeries:[], xAxis:[], }
        colorConfig.value[0].value = ''
        colorConfig.value[1].value = ''
        return
      }
      const { chart, freqTotal, duraTotal } = res.data
      LeftData.value = chart
      colorConfig.value[0].value = freqTotal
      colorConfig.value[1].value = duraTotal
      nextTick(() => {
        initLeftChart();
      })
    }, { immediate:true, deep: true })
    onUnmounted(() => {
      instanceManager?.clear('dataSource')
    })
    return () => {
      return <div class='duration-flow-rate-left'  {...content.attrs}>
        <section class='left-content'>
          <div class='sb'>
            <c-title title="基本信息画像" />
          </div>
          <div class="card-box flex just-c align-items-c">
            {
              colorConfig.value.map((i, index) => (
                <ColorCard class={{ 'mr50': index == 0 }} cardConfig={i} key={i.color} />
              ))
            }
          </div>
          <div class="chart" ref={LeftChart}></div>
          <div class='text'>上网内容使用频次及逗留时长变化趋势</div>
        </section>
      </div>

    }
  }
})

const RightView = defineComponent({
  setup(props, content) {
    const instanceManager = inject<InstanceManager>('InstanceManager')!
    const barOption = reactive({
      list: [],
      color: '#005DA7',
      lableWidth: 90,
      valueWidth: 70,
      lableAlign: 'left',
      valuePosition: 'right',
      unit: '人次',
      needTag: true,
      margin:'8px',
      height:'220px'
    })
    const barOption2 = reactive({
      list: [],
      color: '#005DA7',
      lableWidth: 90,
      valueWidth: 70,
      lableAlign: 'left',
      valuePosition: 'right',
      unit: 'h',
      needTag: true,
      margin:'8px',
      height:'220px'
    })
    const leftTop = ref()
    const rightTop = ref()
    const dataSource = instanceManager.get('dataSource')
    watch(dataSource, (res) => {
      if(res.code !=1){
        barOption.list = []
        barOption2.list = []
        leftTop.value = ''
        rightTop.value = ''
        return
      }
      const { freq, dura } = res.datas2
      barOption.list = freq.data
      barOption2.list = dura.data
      leftTop.value = freq.top5
      rightTop.value = dura.top5
    }, { deep: true })
    return () => {
      return <div class="right" {...content.attrs}>
        <section class='right-content'>
          <c-title title="上网内容分析" />
          <div class="right-content-box">
            <div class="right-content-two sb">
              <div class="content-two-left">
                <div class='c-title'>使用频次分析</div>
                <ProgressBar class='mt12 mb30' option={barOption} />
                <div class='text'>使用频次Top5 <span>{leftTop.value}</span></div>
              </div>
              <div class="content-two-right">
                <div class='c-title'>逗留时长分析</div>
                <ProgressBar class='mt12 mb30' option={barOption2} />
                <div class='text'>逗留时长Top5 <span>{rightTop.value}</span></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    }
  }
})


const OnlineContent = defineComponent({
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
  },
  setup(props, content) {
    provide('params', props.params)
  
    return () => {
      return <div
        class={{
          'DurationFlowRate':true,
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}
      >
        <LeftView class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }}/>
        <RightView class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} {...content.attrs}/>
        <WarningSeal name="上网内容" ident='Online_behavior_content'/>
      </div>
    }
  }
})

OnlineContent.Left = LeftView
OnlineContent.Right = RightView


export default OnlineContent


