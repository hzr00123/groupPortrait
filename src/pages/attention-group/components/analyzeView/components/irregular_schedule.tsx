import { defineComponent, PropType, onMounted, getCurrentInstance, computed, nextTick } from 'vue'
const IrregularSchedule = defineComponent({name: "IrregularSchedule"})

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
                    right: '20%',
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
                        return `{c|${name}} {a| ${p}}%`;
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
        onMounted(() => {
            nextTick(() => {
                initLeftCharts()
            })
        })
        return () => {
            return <div class='stencil-leftView' ref="leftCharts" style="height: 250px"></div>
        }
    }
})
const rightView = defineComponent({
    name: 'rightView',
    props: {
        data: {
            type: Array as PropType<any[]>,
            default:() => ([])
        }
    },
    setup(props, content) {
        const { data } = props;
        const progressColor = computed(() => {
            return (index: number) => {
                switch(index) {
                    case 0: return '#FD5145'; 
                    case 1: return '#1B528B';
                    case 2: return '#32D3A2';
                    case 3: return '#F7B500';
                }
            }
        })
        return () => {
            return <ul class="stencil-branch-progress-bar">
                {
                    data.map((it:any, ix:number) => {
                        return (
                            <li class="mg-b10">
                                <span class="name">{ it.name }</span>
                                <div class='p-box'>
                                    <div class="progress-bar-box">
                                        <div class="out-rect">
                                            <div class="in-rect" style={{ width: it.value + '%',  
                                            background: `linear-gradient(250deg, transparent 4px, ${progressColor.value(ix)} 0)`}} />
                                        </div>
                                    </div>
                                    <span class="num">{ it.value }%</span>
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        }
    }
})

IrregularSchedule.leftView = leftView;
IrregularSchedule.rightView = rightView;
export default IrregularSchedule