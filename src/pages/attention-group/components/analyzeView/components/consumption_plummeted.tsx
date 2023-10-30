import { _getMaxValue } from '@/utils';
import { PropType, defineComponent, getCurrentInstance, onMounted, nextTick } from 'vue'

const consumptionPlummeted = defineComponent({ name: 'consumptionPlummeted'})

const leftView = defineComponent({
    name: 'leftView',
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
        const initLeftCharts = () => {
            const datas = data.chartData
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
                    top: '5%',
                    right: '0',
                    bottom: '0%',
                    textStyle: {
                        color: "#3E5463",
                        fontSize: 14,
                        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                        rich: {
                            a: {
                                width: 60,
                                padding: [0, 0, 0, 0],
                                color: '#3E5463',
                                fontWeight: 'bold'
                            },
                            c: {
                                width: 100,
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
                    data: datas.map((item: any) => item.name),
                    formatter: (name: string) => {
                        let cNum = datas.find((v: any) => v.name === name)?.num;
                        let rate = datas.find((v: any) => v.name === name)?.value;
                        return `{c|${name}} {a| ${rate} %} {b| ${cNum}人}`;
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
                        data: datas
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
                        data: datas
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
            return <div class='consume-too-much-left' ref="leftCharts" style="height: 250px"></div>
        }
    }
})

const rightView = defineComponent({
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
        const initRightCharts = () => {
            const el: HTMLElement = instance?.refs.rightCharts as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let datas = data
            const max1 = _getMaxValue(datas.map((item: any) => item.num))
            const max2 = _getMaxValue(datas.map((item: any) => item.value))
            let option = {
                color:['#6477DD','#FFCC00'],
                title: {
                text: '单位：元',
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
                    formatter: function(res: any) {
                        return `<div>
                            ${res[0].axisValue}<br>
                            <p>
                            <i style="display: inline-block;
                            background: #6477DD;
                            width: 10px;
                            height: 10px;
                            margin-right: 5px;
                            border-radius: 50%;"></i>消费金额：${res[0].value} 元
                            </p>
                            <p>
                            <i style="display: inline-block;
                            background: #FFCC00;
                            width: 10px;
                            height: 10px;
                            margin-right: 5px;
                            border-radius: 50%;"></i>消费占比：${res[1].value} %
                            </p>
                        </div>
                        `
                    }
                },
                legend: {
                    right: '16%',
                    top: '1%',
                    itemWidth: 10,
                    itemHeight: 5,
                    tooltip: {
                        show: true
                    },
                    data: ['消费金额','消费占比']
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
                        data: data.map((item: { name: string; }) => ({ value: item.name })),
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
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        name:'消费金额',
                        barWidth: '20%',
                        data: data.map((item: { num: number; }) => ({ value: item.num })),
                        itemStyle: {
                            borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
                        },
                    },
                    {
                        name: '消费占比',
                        type: 'line',
                        smooth: true,
                        // symbol: 'none',
                        symbolSize: 8,
                        yAxisIndex: 1,
                        data: data.map((item: { value: number; }) => ({ value: item.value })),
                    }
                ]
            };
            myChart?.setOption(option);
        }
        onMounted(() => {
            nextTick(() => {
                initRightCharts();
            })
        })
        return () => {
            return <div class='consume-too-much-right' ref="rightCharts" style="height: 250px"></div>
        }
    }
})

consumptionPlummeted.leftView = leftView;
consumptionPlummeted.rightView = rightView;
export default consumptionPlummeted