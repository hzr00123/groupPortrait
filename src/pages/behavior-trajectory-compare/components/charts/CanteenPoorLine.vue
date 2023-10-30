<template>
    <div>
        <div :id="myEchartsId" ref="echartsMain" class="echarts" :style="{ height: height }" />
    </div>
</template>

<script lang="ts">
import { defineComponent,computed,onMounted,ref } from 'vue'
import * as echarts from "echarts";
import {userStore} from "@/store/btc"

export default defineComponent({
    props: {
        height: {
            type: [String, Number],
            default() {
                return '280px'
            }
        },
        config: {
            type: Object,
            default() {
                return {}
            }
        },
    },
    setup (props) {
        let myStore = userStore();
        let myEchartsId = computed(() => {
            return 'echarts' + Math.random() * 100000;
        })

        onMounted(() => {
            drawLine();
        })

        let echartsMain = ref();
        let myChart:any = null;
        function drawLine() {
            if (myChart) myChart.dispose();
            myChart = echarts.init(echartsMain.value);

            myChart.setOption(baseOption())
            // window.addEventListener('resize', () => {
            //   this.myChart.resize()
            // })
        }
        function baseOption() {
            // const { legendDatas, xAxisDatas, seriesDatas } = props.config;
            // if (!props.config) return {}
            var option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: "axis",
                    backgroundColor: ' rgba(255,255,255,0.8)',
                    //borderColor: 'rgba(31, 56, 74, 1)',
                    formatter: function(param:any) {
                        var resultTooltip = ''
                        resultTooltip =
                        "<div style='padding:5px;border-radius:3px;width:140px;'>" +
                        '<div style="color:#000000;">' +
                        param[0].name +
                        '</div>' +
                        "<div style='padding-top:5px;'>"
                        for (var i = 0; i < param.length; i++) {
                        if (i > 0) {
                            resultTooltip += "<div style='padding-top:2px;'>"
                        }

                        resultTooltip +=
                            "<span style=color:'#1F384A'> " +
                            param[i].seriesName +
                            '  </span>' +
                            "<span style='color:" +param[i].color +"'>" +
                            param[i].value +
                            '</span>'
                        }
                        resultTooltip += '</div>' + '</div>'
                        return resultTooltip
                    }
                },
                grid: {
                    left: "10%",
                    top: "18%",
                    right: "5%",
                    bottom: "10%"
                },
                legend: {
                    data: []
                },
                xAxis: {
                    boundaryGap: false,//坐标轴两边留白策略
                    data: myStore.canteenConfig["right"].xAxis,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(224, 224, 224, 1)"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: true,
                        color: "#3E5463",
                        fontSize: 14,
                        fontFamily: "Regular",
                        interval:150
                    }
                },
                yAxis: {
                    name: "单位/人",
                    nameTextStyle: {
                        align: "right",
                        fontSize: 12,
                        color: "#3E5463"
                    },
                    axisLine: {//坐标轴轴线
                        show: true,
                        lineStyle: {
                            color: "rgba(224, 224, 224, 1)"
                        }
                    },
                    axisTick: {//坐标轴刻度
                        show: false
                    },
                    axisLabel: {//坐标轴刻度标签
                        show: true,
                        color: "#3E5463",
                        fontSize: 14,
                        fontFamily: "Regular"
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(224, 224, 224, 1)"
                        }
                    }
                },
                series: [
                    {
                        name: '就餐人数',
                        type: 'line',
                        symbol: "none",
                        showSymbol: false,
                        lineStyle: {
                            color: "rgba(107, 124, 250, 1)",
                            width: 3,
                            shadowBlur: 23,
                            shadowColor: "rgba(107, 124, 250, 1)",
                            shadowOffsetY: 25,
                            opacity: 0.7
                        },
                        itemStyle:{//折点
                            borderColor: 'rgba(107, 124, 250, 1)',
                            color: '#6B7CFA',
                            borderWidth: 1
                        },
                        data: myStore.canteenConfig["right"].series
                    }
                ]
            };
            return option;
        }

        return {
            myEchartsId,echartsMain,drawLine,baseOption,myChart,myStore
        }
    }
})
</script>

<style scoped>

</style>