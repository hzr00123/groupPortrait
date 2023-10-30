import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, onUnmounted, toRef, unref, toRefs, provide } from "vue"
import { BaseParams } from "../../types";
import { downloadFile, useChildrenData, usePortraitRequest } from "@/hooks";
import './SleepAndRest.scss'
import InstanceManager from "@/utils";
import WarningSeal from "@/components/WarningSeal";

const LeftView = defineComponent({
  setup(props, content) {
    const params = inject<BaseParams>('params',  {} as any)
    const instance = getCurrentInstance();
    const instanceManager = inject<InstanceManager>('InstanceManager',new InstanceManager())
    const echart = instance?.proxy?.$echarts;
    const chartTr = ref()
    const list = ref([])
    const response = ref({})
    const initChart = () => {
      const el: HTMLElement = chartTr.value;
      let myChart = echart?.getInstanceByDom(chartTr.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let datas:any = list.value

      // 定义间隔刻度 目前为15分钟一个刻度
      let intervalScale = 15
      function linkFunc() {
        let linksData: any = [{
          source: "0",
          target: "750",
          lineStyle: {
            width: 2,
            color: {
              type: 'linear',
              x: 1,
              y: 0,
              x2: 0,
              y2: 0,
              colorStops: [
                {
                  offset: 0.2, color: 'white' // 100% 处的颜色
                },
                {
                  offset: 0.2, color: '#CCCCCC' // 100% 处的颜色
                },
                {
                  offset: 0.8, color: '#CCCCCC' // 100% 处的颜色
                },
                {
                  offset: 0.8, color: 'white' // 100% 处的颜色
                }
              ],
              global: false // 缺省为 false
            }
          },
        },
        {
          source: "375",
          target: "1125",
          lineStyle: {
            width: 2,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0.2, color: 'white' // 100% 处的颜色
                },
                {
                  offset: 0.2, color: '#CCCCCC' // 100% 处的颜色
                },
                {
                  offset: 0.8, color: '#CCCCCC' // 100% 处的颜色
                },
                {
                  offset: 0.8, color: 'white' // 100% 处的颜色
                }
              ],
              global: false // 缺省为 false
            }
          },
        },
        ]

        for (let i = 0; i < datas.length; i++) {
          let item: any = datas[i]
          let source = (Math.round((Number(item.leaveTime.split(':')[0] * 60) + Number(item.leaveTime.split(':')[1])) / intervalScale)) * intervalScale + ''
          let target = (Math.round((Number(item.returnTime.split(':')[0] * 60) + Number(item.returnTime.split(':')[1])) / intervalScale)) * intervalScale + ''
          let name = i
          let colorTime = (Number(item.leaveTime.split(':')[0]) > 21 || Number(item.leaveTime.split(':')[0]) < 7) ? {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0, color: '#F38072' // 100% 处的颜色
              },
              {
                offset: 1, color: '#E3493E' // 100% 处的颜色
              }
            ],
            global: false // 缺省为 false
          } : {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0, color: '#7BCEF4' // 100% 处的颜色
              },
              {
                offset: 1, color: '#45A0E6' // 100% 处的颜色
              }
            ],
            global: false // 缺省为 false
          }
          linksData.push({
            source,
            target,
            name,
            symbol: ['circle', 'arrow'],
            symbolSize: [1, 11],
            lineStyle: {
              width: 2,
              curveness: -0.5,
              color: colorTime
            },
            tooltip: {
              show: true,
              formatter(vv: any) {
                if (vv.data && vv.data.name !== '' && vv.data.name !== undefined) {
                  if (datas[vv.data.name]) {
                    return '出宿舍:' + datas[vv.data.name].leaveTime + '<br/>' + '入宿舍:' + datas[vv.data.name].returnTime + '<br/>' + '人次:' + datas[vv.data.name].num
                  }
                }
              }
            },
          })
        }
        return linksData
      }

      function roundDatas() {
        var datas = [];
        // 定义多少个点
        let numDrop = 24 * 60 / intervalScale
        for (var i = 0; i < numDrop; i++) {
          var x = Math.cos((360 / numDrop * i * Math.PI) / 180);
          var y = Math.sin((360 / numDrop * i * Math.PI) / 180);
          datas.push({
            name: 15 * i,
            x: -x,
            y: -y,
            itemStyle: {
              // color: "#FFFFFF",
              opacity:0
            },
            label: {
              show: false
            },
          });
        }
        return datas;
      }

      let option = {
        tooltip: {},
        series: [
          {
            name: "时间刻度线",
            type: "gauge",
            radius: "75%",
            center: ["50%", "50%"],
            max: 120,
            //圆形
            startAngle: 180,
            endAngle: -180,

            // 分成多少段
            splitNumber: 12,
            animation: 0,

            // 指针
            pointer: {
              show: false,
            },

            // 外圈
            axisLine: {
              //仪表盘轴线样式
              lineStyle: {
                color: [[1, "#B3B3B3"]],
                width: 1,
              },
            },

            splitLine: {
              //分割线样式长刻度
              length: -1,
              show: false,
              lineStyle: {
                color: "#4B96F3",
                width: 1,
              },
            },

            axisTick: {
              //仪表盘刻度小标记样式
              show: false,
            },

            axisLabel: {
              //刻度盘标签
              show: true,
              distance: -50, //标签与刻度线的距离,
              fontSize: 14,
              formatter: function (t: any) {
                switch (t) {
                  case 0:
                    return "00:00";
                  case 10:
                    return "02:00";
                  case 20:
                    return "04:00";
                  case 40:
                    return "08:00";
                  case 50:
                    return "10:00";
                  case 60:
                    return "12:00";
                  case 70:
                    return "14:00";
                  case 80:
                    return "16:00";
                  case 100:
                    return "20:00";
                  case 110:
                    return "22:00";
                  case 120:
                    return "";
                }
              },
            },
            detail: {
              show: false,
            },
            data: [{}],
          },
          {
            name: "时间刻度线-标题",
            type: "gauge",
            radius: "75%",
            center: ["50%", "50%"],
            max: 12,
            //圆形
            startAngle: 180,
            endAngle: -180,
            // 分成多少段
            splitNumber: 12,
            // 指针
            pointer: {
              show: false,
            },

            // 外圈
            axisLine: {
              //仪表盘轴线样式‘’
              show: false,
              lineStyle: {
                color: [[1, "#B3B3B3"]],
                width: 3,
              },
            },

            splitLine: {
              //分割线样式长刻度
              length: -35,
              show: false,
              lineStyle: {
                color: "#4B96F3",
                width: 3,
              },
            },

            axisTick: {
              //仪表盘刻度小标记样式
              show: false,
            },

            axisLabel: {
              //刻度盘标签
              show: true,
              distance: -85, //标签与刻度线的距离,
              fontWeight: "bold",
              fontSize: 18,
              formatter: function (t: any) {
                switch (t) {
                  case 1:
                    return "睡眠";
                  case 5:
                    return "上午";
                  case 7:
                    return "下午";
                  case 11:
                    return "晚间";
                }
              },
            },
            detail: {
              show: false,
            },
            data: [{}],
          },
          {
            // 单独加6点 18点 平移距离和位置矛盾
            name: "时间刻度线-时间点",
            type: "gauge",
            radius: "75%",
            show:false,
            center: ["50%", "50%"],
            max: 12,
            //圆形
            startAngle: 180,
            endAngle: -180,
            // 分成多少段
            splitNumber: 12,
            // 指针
            pointer: {
              show: false,
            },

            // 外圈
            axisLine: {
              //仪表盘轴线样式‘’
              show: false,
              lineStyle: {
                color: [[1, "#B3B3B3"]],
                width: 3,
              },
            },

            splitLine: {
              //分割线样式长刻度
              length: -3,
              show: false,
              lineStyle: {
                color: "#4B96F3",
                width: 3,
              },
            },

            axisTick: {
              //仪表盘刻度小标记样式
              show: false,
            },

            axisLabel: {
              //刻度盘标签
              show: true,
              distance: -35, //标签与刻度线的距离,
              fontSize: 14,
              formatter: function (t: any) {
                switch (t) {
                  case 3:
                    return "06:00";
                  case 9:
                    return "18:00";
                }
              },
            },
            detail: {
              show: false,
            },
            data: [{}],
          },
          {
            type: "graph",
            trigger: 'item',
            tooltip: {
              show: false
            },
            data: roundDatas(),
            links: linkFunc()
          },
        ]
      };
      myChart?.setOption(option)
    }
    instanceManager.register('sleepResponse', response)
    onUnmounted(() => {
      instanceManager.clear('sleepResponse')
    })
    const dataSource = usePortraitRequest({...toRefs(params) as any, ident: 'Sleep_and_rest' })
    watch(dataSource, (res) => {
      response.value = res
      if(res.code !=1){
        list.value = []
        return
      }
      list.value = res.data
      nextTick(() => {
        initChart()
      })

    }, { deep: true })
    return () => {
      return <div class='SleepAndRest-left'>
          <c-title title="基本信息画像" />
        <div class='SleepAndRest-left-chart' ref={chartTr}></div>
        <div class='text'>24h宿舍出入轨迹</div>
      </div>
    }
  }
})

const RightView = defineComponent({
  setup(props, content) {
    const instance = getCurrentInstance();
    const instanceManager = inject<InstanceManager>('InstanceManager',new InstanceManager())
    const echart = instance?.proxy?.$echarts;
    const TopChart = ref()
    const BottomChart = ref()
    const RightData = ref<{leave:Array<any>,laterBack:Array<any>, [key: string | symbol]: any }>({
      leave:[],
      laterBack:[]
    })
    const initTopChart = () => {
      const el: HTMLElement = TopChart.value;
      let myChart = echart?.getInstanceByDom(TopChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let color = ['#E3493E', '#1B528B', '#00C9F2', '#F39702',]
      let datas = RightData.value.leave ? RightData.value.leave : []
      
      datas.forEach((item: any) => {
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
      })
      let option = {
        color: color,
        legend: {
          // type: "scroll",
          // icon: "circle",
          orient: 'vertical',
          top: 'center',
          right: '15%',
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
          data: datas.map((item) => item.name),
        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value} 人 (${param.percent}%)`
          }
        },
        series: [
          {
            // name: "",
            type: "pie",
            radius: ["45%", "75%"],
            center: ['30%', '50%'],
            labelLine: {
              length: 20,//第一段线长
              length2: 60, //第二段线长
              lineStyle: {
                width: 1,
                type: 'solid',
                color: '#005DA7'
              },

            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 4,
            },
            label: {
              formatter: '{zb|{d}%}',
              padding: [0, -60, 20, -60],
              rich: {
                zb: {
                  fontSize: 16,
                  color: '#203449'
                }

              },
            },
            data: datas,
          },
        ],

      }
      myChart?.setOption(option)
    }
    const initBottomChart = () => {
      const el: HTMLElement = BottomChart.value;
      let myChart = echart?.getInstanceByDom(BottomChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let color = ['#E3493E', '#1B528B', '#00C9F2', '#F39702',]
      let datas =  RightData.value.laterBack ? RightData.value.laterBack : []
      datas.forEach((item: any) => {
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
      })
      let option = {
        color: color,
        legend: {
          // type: "scroll",
          // icon: "circle",
          orient: 'vertical',
          top: 'center',
          right: '15%',
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
          data: datas.map((item) => item.name),
        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value} 人 (${param.percent}%)`
          }
        },
        series: [
          {
            // name: "",
            type: "pie",
            radius: ["45%", "75%"],
            center: ['30%', '50%'],
            labelLine: {
              length: 20,//第一段线长
              length2: 60, //第二段线长
              lineStyle: {
                width: 1,
                type: 'solid',
                color: '#005DA7'
              },

            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 4,
            },
            label: {
              formatter: '{zb|{d}%}',
              padding: [0, -60, 20, -60],
              rich: {
                zb: {
                  fontSize: 16,
                  color: '#203449'
                }

              },
            },
            data: datas,
          },
        ],

      }
      myChart?.setOption(option)
    }

    const dataSource = instanceManager.get('sleepResponse')
    watch(dataSource, (res) => {
      if(res.code !=1){
        RightData.value = { leave:[], laterBack:[] }
        nextTick(() => {
          initTopChart()
          initBottomChart()
        })
        return
      }
      RightData.value = res.datas2
      nextTick(() => {
        initTopChart()
        initBottomChart()
      })
    }, { deep: true })
    const renderFn = () => {
      return <>
        <div class='c-title'>早起习惯</div>
        <div class='top-pie-chart' ref={TopChart}></div>
        <div class='text' style='margin-top:5px;'>学生起床时间主要集中于 <span>{RightData.value.leaveMax?.name}</span> <span>{RightData.value.leaveMax?.value}</span>% 有早起习惯</div>
        <div class='c-title' style='margin-top:5px;'>晚归习惯</div>
        <div class='bottom-pie-chart' ref={BottomChart}></div>
        <div class='text' style='margin-top:5px;'>学生归寝时间主要集中于 <span>{RightData.value.laterBackMax?.name}</span> <span>{RightData.value.laterBackMax?.value}</span>% 有晚归习惯</div>
      </>
    }
    return () => {
      return <div class="SleepAndRest-right">
        <c-title title="特征分析" />
        <section class='SleepAndRest-right-content'>
          {
            renderFn()
          }
        </section>
      </div>
    }
  }
})


const SleepAndRest = defineComponent({
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
        class={{ 'SleepAndRest': true, }}
      >
        <div class="sb">
      
        </div>
        <div class={{
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}>
          <LeftView class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
          <RightView class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
          <WarningSeal name='作息睡眠' ident='Sleep_and_rest'/>
        </div>
      </div>
    }
  }
})

SleepAndRest.Left = LeftView
SleepAndRest.Right = RightView


export default SleepAndRest


