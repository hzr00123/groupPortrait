import { PropType, defineComponent, getCurrentInstance, nextTick, onMounted } from "vue";

const irregularly_eat = defineComponent({name: 'defineComponent'})

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
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts;
        const initLeftCharts = () => {
            const el: HTMLElement = instance?.refs.leftCharts as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let option = {
                color: ['#FD5145', '#1B528B', '#00C9F2', '#F7B500',],
                legend: {
                    type: "scroll",
                    orient: 'vertical',
                    top: '20%',
                    right: '10%',
                    bottom: '0%',
                    textStyle: {
                        color: "#3E5463",
                        fontSize: 14,
                        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                        rich: {
                            a: {
                                // width: 60,
                                padding: [0, 0, 0, 0],
                                color: '#3E5463',
                                fontWeight: 'bold'
                            },
                            c: {
                                width: 60,
                                padding: [0, 0, 0, 0],
                            },
                            b: {
                                width: 60,
                                padding: [0, 0, 0, 0],
                            }
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
                    data: data.map((item: any) => item.name),
                    formatter: (name: string) => {
                        let cNum = data.find((v: any) => v.name === name)?.num
                        let total = 0;
                        let tarValue: number = 0; // 为 tarValue 赋一个默认值
                        for (let i = 0; i < data.length; i++) {
                            total += data[i].value;
                            if (name === data[i].name) {
                                tarValue = data[i].value;
                            }
                        }
                        console.log((tarValue / total));
                        const t = tarValue == 0 && total == 0 ? 0 : (tarValue / total)
                        const p = (t * 100).toFixed(2);
                        return `{c|${name}} {b| ${cNum}人} {a| ${p}}%`;
                    }

                },
                tooltip: {
                    formatter: '{b} : {d}%'
                },
                series: [
                    {
                        z: 2,
                        radius: [70, 80],
                        center: [150, '38%'],
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
                        radius: [80, 90],
                        center: [150, '38%'],
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
                            show: false
                        },
                        labelLine: {
                            show: false
                        },
                        tooltip: {
                            show: false
                        },
                        silent: true,
                        data: data
                    }
                ]
            }
            myChart?.setOption(option);
        }
        onMounted(() => {
            nextTick(() => {
                initLeftCharts()
            })
        })
        return () => {
            return <div class='irregularly_eat-left' ref="leftCharts" style="height: 250px"></div>
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
            return <div class='irregularly-eat-right' ref='lineCharts' style="height: 250px"></div>
        }
    }
})

irregularly_eat.leftView = leftView;
irregularly_eat.rightView = rightView;
export default irregularly_eat