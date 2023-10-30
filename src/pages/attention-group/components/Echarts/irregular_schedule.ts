export default {
    leftTitle: '早起习惯',
    rightTitle: '晚归习惯',
    subLeftTitle: '_%s% 人群起床时间在 _%d',
    subRightTitle: '_%s% 人群归寝时间在 _%d',
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
                            tarValue = data[i].value;
                        }
                    }
                    const p = ((tarValue / total) * 100).toFixed(2);
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
    rightOpt(data: Array<{ [key: string]: any }>){

    }
}