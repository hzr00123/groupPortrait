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
                return '210px'
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
                //backgroundColor: 'rgba(0,0,0,0)',
                title: [
                    {
                        text: "{a|" + myStore.sumUpConfig["right"].integrality.rate + "%}", //主标题文本，支持使用 \n 换行。
                        textStyle: {  //主标题文字
                            // color: '#333',
                            // fontSize: 16,
                            rich: {  //在 rich 里面，可以自定义富文本样式。利用富文本样式，可以在标签中做出非常丰富的效果。
                                a: {
                                    fontSize: 20,
                                    color: "#3E5463",
                                    fontWeight: "bold",
                                    fontFamily: 'DINPro-Bold, DINPro',
                                },
                            },
                        },

                        subtext: myStore.sumUpConfig["right"].integrality.value + '人',  //副标题文本
                        subtextStyle: {
                        color: '#3E5463',
                        fontSize: 14,
                        fontFamily: 'Regular'
                        },
                        //   itemGap: 10, // 主副标题距离
                        x: "50%",  //left (center |  20%)
                        y: "38%",  //top (center |  20%)
                        textAlign: "center"
                    },
                    { // 副标题
                        text: '完整性',     // '/n'代表换行
                        //borderColor: '#999', 
                        //borderWidth: 1, // 边框宽度（默认单位px）
                        textStyle: { // 标题样式
                            fontFamily:"Medium",
                            fontSize: 16,
                            color:"#203449"
                        },
                        left: '50%', // 位置
                        bottom: '0%', // 位置
                        textAlign: "center"
                    },
                ],
                legend: {},
                angleAxis: { //极坐标系的角度轴。
                    max: 100, // 坐标轴刻度最大值,如：100。
                    clockwise: true, // 逆时针,刻度增长是否按顺时针，默认顺时针
                    axisLine: {// 是否显示坐标轴轴线。隐藏刻度线false
                        show: false,
                    },
                    axisTick: {//是否显示坐标轴刻度。
                        show: false,
                    },
                    axisLabel: { //是否显示刻度标签。
                        show: false,
                    },
                    splitLine: {//是否显示分隔线。默认数值轴显示，类目轴不显示。
                        show: false,
                    },
                },
                radiusAxis: {//极坐标系的径向轴。
                    type: 'category',
                    axisLine: {//是否显示坐标轴轴线。隐藏刻度线false
                        show: false,
                    },
                    axisTick: {//是否显示坐标轴刻度。
                        show: false,
                    },
                    axisLabel: {//是否显示刻度标签。
                        show: false,
                    },
                    splitLine: {//是否显示分隔线。默认数值轴显示，类目轴不显示。
                        show: false,
                    },
                },
                polar: {//极坐标系，每个极坐标系拥有一个角度轴和一个半径轴。
                    center: ["50%", "50%"],//极坐标系的中心（圆心）坐标，用于调整位置,数组的第一项是横坐标，第二项是纵坐标。支持设置成百分比，设置成百分比时第一项是相对于容器宽度，第二项是相对于容器高度。
                    radius: ["50%", "65%"], //极坐标系的半径。控制图形大小
                },
                series: [
                    {
                        type: 'bar',
                        data: [
                            {
                                name: '',
                                value: myStore.sumUpConfig["right"].integrality.rate,
                                itemStyle: {
                                    normal: {
                                        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [//设置渐变色
                                            {
                                                offset: 0,
                                                color: 'rgba(247, 181, 0, 1)',
                                            },

                                            {
                                                offset: 1,
                                                color: 'rgba(247, 181, 0, 1)',
                                            },
                                        ]),
                                    },
                                },
                            },
                        ],
                        backgroundStyle: {//展示背景阴影的颜色
                            color: "rgba(240, 240, 240, 1)",
                        },
                        coordinateSystem: 'polar', // 使用极坐标坐标系
                        roundCap: true, // 两端变成 圆角
                        barWidth: 10, // 柱子粗细
                        showBackground: true,// 展示背景阴影
                        //barGap: '-100%', // 两环重叠
                        //z: 2, 
                    },
                ],
            }
            return option;
        }

        return {
            myEchartsId,echartsMain,drawLine,baseOption,myChart
        }
    }
})
</script>

<style scoped>

</style>