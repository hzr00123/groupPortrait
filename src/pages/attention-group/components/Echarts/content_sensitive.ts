export default {
    leftTitle: '异常敏感内容类型分布',
    rightTitle: '异常敏感内容排行',
    subLeftTitle: '主要敏感内容类型 _%d',
    subRightTitle: '主要敏感内容为 _%d',
    leftOpt(data: Array<{ [key: string]: any }>) {
        return {
            color: ['#FD5145', '#1B528B', '#00C9F2', '#F7B500',],
            legend: {
                type: "scroll",
                orient: 'vertical',
                top: '25%',
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
                            tarValue = data[i].num;
                        }
                    }
                    const p = ((tarValue / total) * 100).toFixed(2);
                    return `{c|${name}} {b|${tarValue}次} {a| ${p}}%`;
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
                        show: true,
                        position: 'center',
                        color:'#4c4a4a',
                        formatter: '{total|' + data[0].total +'}'+'次',
                        rich: {
                            total:{
                                fontSize: 16,         
                                color: '#203449',
                            }
                        },
                        padding: [5, 0, 0, 0],
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
                    color: '#B22924',
                    // color: function() {
                    //   return 'rgb(' +
                    //       Math.round(Math.random() * 255) +
                    //       ', ' + Math.round(Math.random() * 255) +
                    //       ', ' + Math.round(Math.random() * 255) + ')'
                    // }
                },
                data: data.map(i => ({...i, value: i.num}))
            }]
        }
    }
}