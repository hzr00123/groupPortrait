import { PropType, defineComponent, getCurrentInstance, nextTick, onMounted } from "vue";

const isolated_people = defineComponent({name: 'isolated_people'})

const leftView = defineComponent({
    name: 'leftView',
    props: {
        data: {
            type: Array as PropType<any[]>,
            default:() => ([])
        }
    },
    setup(props, content) {
        const { data } = props;
        return () => {
            return <div class='isolated-people-left'>
                <ul class='isolated-people-left-box'>
                    {
                        data.map((it, ix) => {
                            return <li class='isolated-people-left-item' key={ix}>
                                <img class='user-avatar' src={it.avatar} alt="头像" />
                                <span class='user-name'>{it.name}</span>
                            </li>
                        })
                    }
                </ul>
            </div>
        }
    }
})

const rightView = defineComponent({
    name: 'rightView',
    props: {
        data: {
            type: Object as PropType<{ [k: string]: any}>,
            default:() => ({})
        }
    },
    setup(props, content) {
        const { data } = props;
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts;
        
        const initRightCharts = () => {
            const el: HTMLElement = instance?.refs.lineCharts as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let option = {
                title: {
                  text: '单位/元',
                  top: '5%',
                  left: 0,
                  textStyle: {
                    color: '#333333',
                    fontSize: 14,
                  }
                },
                legend: {
                  right: '3%',
                  top: '5%',
                  itemWidth: 10,
                  itemHeight: 5,
                  data: data.series.map((i: { name: string }) => i.name)
                },
                // tooltip: {
                //   trigger: 'axis',
                //   axisPointer: {
                //     type: 'shadow'
                //   },
                //   formatter: '{b}: {c}人次',
                // },
                tooltip: {
                  trigger: 'axis'
                },
                grid: {
                  top: '20%',
                  left: 0,
                  right: '3%',
                  bottom: '4%',
                  containLabel: true
                },
                xAxis: [
                  {
                    type: 'category',
                    data: data.xAxis,
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
                    type: 'value',
                    axisLine: { show: false },
                    splitLine: {
                      show: true,
                      lineStyle: {
                        type: 'dashed'
                      }
                    }
                  },
                ],
                series: data.series.map((i: { name: string, data: Array<number> }, index) => {
                  return {
                    type: 'line',
                    name: i.name,
                    data: i.data.map(i => ({ value: i })),
                    itemStyle: {
                      color: index == 0 ? '#1B528B' : index == 1 ? '#B22A25' : '#F7B500',
                      borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
                    },
                  }
                })
            };
            myChart?.setOption(option)
        }
        onMounted(() => {
            nextTick(() => {
                initRightCharts()
            })
        })
        return () => {
            return <div class='isolated-people-right' ref='lineCharts' style="height: 250px"></div>
        }
    }
})


isolated_people.leftView = leftView;
isolated_people.rightView = rightView;
export default isolated_people