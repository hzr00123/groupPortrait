export default {
    leftTitle: '人均月消费减少分布',
    rightTitle: '消费结构分布',
    leftOpt(data: Array<{ [key: string]: any }>) {
        return {
            color: ['#FD5145', '#1B528B', '#00C9F2', '#F7B500',],
            legend: {
                type: "scroll",
                orient: 'vertical',
                top: '25%',
                right: '15%',
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
                        b: {
                            width: 60,
                            padding: [0, 0, 0, 0],
                            color: '#3E5463',
                            fontWeight: 'bold'
                        },
                        c: {
                            width: 90,
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
                data: data?.map((item) => item.name),
                formatter: (name: string) => {
                    let total = 0;
                    let num = 0
                    let tarValue: number = 0; // 为 tarValue 赋一个默认值
                    for (let i = 0; i < data.length; i++) {
                        total += data[i].value;
                        if (name === data[i].name) {
                            tarValue = data[i].value;
                            num = data[i].num
                        }
                    }
                    const p = ((tarValue / total) * 100).toFixed(2);
                    return `{c|${name}} {a| ${p}}% {b|${num}次} `;
                }

            },
            tooltip: {
                formatter: '{b} : {d}%'
            },
            series: [
                {
                    z: 2,
                    radius: [70, 80],
                    center: [150, '40%'],
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
                    center: [150, '40%'],
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
    },
    rightOpt(data: Array<{ [key: string]: any }>) {
        return {
            // color:['#6477DD','#FFCC00'],
            // title: {
            // text: '单位：项',
            // top: 0,
            // left: 0,
            // textStyle: {
            //     color: '#333333',
            //     fontSize: 14,
            //     fontWeight:'normal'
            // }
            // },
            // tooltip: {
            //     trigger: 'axis'
            // },
            // legend: {
            //     right: '14%',
            //     top: '0',
            //     itemWidth: 10,
            //     itemHeight: 5,
            //     data: data.map(item => ({ value: item.name }))
            // },
            // grid: {
            //     top: '12%',
            //     left: 0,
            //     right: 0,
            //     bottom: '4%',
            //     containLabel: true
            // },
            // xAxis: [
            //     {
            //         type: 'category',
            //         show: true,
            //         data: data.map(item => ({ value: item.name })),
            //         axisTick: { //刻度
            //         alignWithLabel: true,
            //             show: false,
            //         },
            //         triggerEvent: true,
            //         axisLabel: {
            //         // rotate: 0, //代表逆时针旋转
            //         interval: 'auto',
            //         formatter: function (value: string) {
            //             if (value.length > 6) {
            //                 return `${value.slice(0, 6)}...`;
            //             }
            //             return value
            //         }
            //     },
            // }
            // ],
            // yAxis: [
            //     { 
            //     axisLine: {
            //     show: false,
            //     },
            //     axisTick: {
            //     show: false,
            //     },
            //     type: 'value',
            //     splitLine: {
            //     show: true,
            //     lineStyle: {
            //         type: 'dashed'
            //     }
            //     },
            //         // min: 0,
            //         // interval: interval,
            //         // max: max,
            //     },
            //     { 
            //         name:'单位：次',
            //         nameLocation:'end',
            //         nameTextStyle:{
            //         color: '#333333',
            //         fontSize: 14,
            //         },
            //         axisLine: {
            //         show: false,
            //         },
            //         axisTick: {
            //         show: false,
            //         },
            //         type: 'value',
            //         splitLine: {
            //         show: false,
            //         lineStyle: {
            //             type: 'dashed'
            //         }
            //         },
            //         // min: 0,
            //         // interval: interval,
            //         // max: max,
                

            //     },
            // ],
            // series: [
            //     {
            //         type: 'bar',
            //         barWidth: '20%',
            //         data: data.map(item => ({ value: item.value })),
            //         itemStyle: {
            //             borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
            //         },
            //     },
            // ]
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
                trigger: 'axis'
            },
            legend: {
                right: '14%',
                top: '0',
                itemWidth: 10,
                itemHeight: 5,
                data: ['消费金额', '消费占比']
            },
            xAxis: {
                type: 'category',
                data: data.map(item => ({value: item.name}))
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '消费金额',
                    data: data.map(item => ({ value: item.value })),
                    barWidth: '20%',
                    type: 'bar'
                },
                {
                    name: '消费占比',
                    type: 'line',
                    // smooth: true,
                    // // symbol: 'none',
                    // symbolSize: 8,
                    // yAxisIndex: 1,
                    data: data.map(item => ({ value: item.num })),
                },
            ]
        }
    }
}