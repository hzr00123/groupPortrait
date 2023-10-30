<template>
    <div>
        <div :id="myEchartsId" ref="echartsMain" class="echarts" :style="{ height: height }" />
    </div>
</template>

<script lang="ts">
import { defineComponent,computed,onMounted,ref } from 'vue'
import * as echarts from "echarts";
import {IChartLeft} from "../../types/restraint"
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
        let serData:IChartLeft[] = [];
        
        function baseOption() {
            var option = {
                title: [
                    { // 副标题
                        text: '睡眠',     // '/n'代表换行
                        //borderColor: '#999', 
                        //borderWidth: 1, // 边框宽度（默认单位px）
                        textStyle: { // 标题样式
                            fontFamily:"Medium",
                            fontSize: 16,
                            color:"#203449"
                        },
                        left: '20%', // 位置
                        top: '15%' // 位置
                    },
                    { // 副标题
                        text: '上午',     // '/n'代表换行
                        //borderColor: '#999', 
                        //borderWidth: 1, // 边框宽度（默认单位px）
                        textStyle: { // 标题样式
                            fontFamily:"Medium",
                            fontSize: 16,
                            color:"#203449"
                        },
                        right: '20%', // 位置
                        top: '15%' // 位置
                    },
                    { // 副标题
                        text: '晚间',     // '/n'代表换行
                        //borderColor: '#999', 
                        //borderWidth: 1, // 边框宽度（默认单位px）
                        textStyle: { // 标题样式
                            fontFamily:"Medium",
                            fontSize: 16,
                            color:"#203449"
                        },
                        left: '20%', // 位置
                        bottom: '15%' // 位置
                    },
                    { // 副标题
                        text: '下午',     // '/n'代表换行
                        //borderColor: '#999', 
                        //borderWidth: 1, // 边框宽度（默认单位px）
                        textStyle: { // 标题样式
                            fontFamily:"Medium",
                            fontSize: 16,
                            color:"#203449"
                        },
                        right: '20%', // 位置
                        bottom: '15%' // 位置
                    }
                ],
                polar: {
                    center: ["50%", "50%"],
                    radius: ["0%", "65%"]
                },
                tooltip: {},
                angleAxis: {//极坐标系的角度轴。
                    type: 'value',
                    min: 0,
                    max: 24,
                    interval:  2, 
                    startAngle: 180,
                    axisTick:{
                        show: false,
                    },
                    axisLabel:{
                        show: true,
                        color: "rgba(51, 51, 51, 1)",
                        fontSize: 14,
                        fontFamily: "PingFangSC-Regular, PingFang SC",
                        // 使用函数模板，函数参数分别为刻度数值（类目），刻度的索引
                        formatter: function (value:any, index:number) {
                            return value > 9 ? value + ':00' : '0'+value + ':00';
                        }
                        
                    },
                    splitLine:{
                        show: false,
                        lineStyle:{
                            type: "dashed",
                            color:"#CDCDCD"
                            
                        }
                    },
                    axisLine:{
                        lineStyle:{ 
                            type: "solid",
	                        color:'rgba(179, 179, 179, 1)'
                        }
                    }
                    
                },
                radiusAxis: {//极坐标系的径向轴。
                    interval: 100,   
                    axisLine:{ //坐标 轴线
                        show:false,//X 轴或者 Y 轴的轴线是否在另一个轴的 0 刻度上，只有在另一个轴为数值轴且包含 0 刻度时有效
                    },
                    splitLine:{//坐标轴在 grid 区域中的分隔线。
                        show:true, //是否显示分隔线。默认数值轴显示，类目轴不显示。
                        interval:"auto",//坐标轴分隔线的显示间隔，在类目轴中有效。默认会采用标签不重叠的策略间隔显示标签。可以设置成 0 强制显示所有标签。如果设置为 1，表示『隔一个标签显示一个标签』，可以用数值表示间隔的数据，也可以通过回调函数控制。回调函数格式如下：
                        lineStyle: {
                            type: "dashed",
                            color:"#CDCDCD"
                        },                  
                    }, 
                    axisTick :{//坐标轴刻度相关设置
                        show:false,//坐标轴刻度的显示间隔，在类目轴中有效。默认会采用标签不重叠的策略间隔显示标签。可以设置成 0 强制显示所有标签。如果设置为 1，表示『隔一个标签显示一个标签』，如果值为 2，表示隔两个标签显示一个标签，以此类推                       
                    }, 
                    axisLabel:{//坐标轴刻度标签的相关设置
                        show: false                 
                    },
                },
                series: serData
            };

            myStore.dormitoryConfig["left"].forEach((m:any) => {
                option.series.push({
                    type: 'graph',
                    coordinateSystem: 'polar', 
                    symbolSize: 1,
                    edgeSymbol: ['', 'arrow'],  
                    links: [
                        {
                            source:0,
                            target:1,
                            name:"kaishi",
                            chu:m.leaveTime,
                            hui:m.returnTime,
                            count:m.count
                        }
                    ],
                    label: {
                        normal: {
                            show: true
                        }
                    },
                    tooltip:{
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        borderColor: 'rgba(255,255,255,0.8)',
                        formatter: function (param:any) {
                            var resultTooltip = ''
                            resultTooltip =
                            "<div style='padding:5px;border-radius:3px;width:140px;'>" +
                            '<div style="color:#000000;"></div>' +
                            "<div style='padding-top:5px;'>"
                            resultTooltip += "<div style='padding-top:2px;'>"
                            resultTooltip +=
                                "<span style='color:#1F384A'>出宿舍：</span>" +
                                "<span style='color:#1F384A'>"+ param.data.chu +"</span>"
                            resultTooltip += "</div><div style='padding-top:2px;'>"
                            resultTooltip +=
                                "<span style=color:'#1F384A'>回宿舍：</span>"+
                                "<span style='color:'#1F384A'>" +param.data.hui +'</span>'
                            resultTooltip += '</div>'
                            resultTooltip +=
                                "<span style=color:'#1F384A'>人次：</span>"+
                                "<span style='color:'#1F384A'>" +param.data.count +'</span>'
                            resultTooltip += '</div>'
                            return resultTooltip
                        }
                    },
                    itemStyle: {
                        normal: {
                            label: {
                                position: ['500%', '500%'],
                                textStyle: {
                                    fontSize: 16
                                }
                            }
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 2,
                            color:new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                                {offset: 0, color: m.leaveStatus}, // 渐变起始颜色
                                {offset: 1, color: m.returnStatus}   // 渐变结束颜色
                            ]),
                            curveness: -0.5
                        }
                    }, 
                    data:[[10,zhuanhuan(m.leaveTime)],[10,zhuanhuan(m.returnTime)]],
                })
            })

            
            return option;
        }

        function zhuanhuan(val:any){
            var arr = val.split(":");
            var one = arr[0].replace(/\b(0+)/gi,"");
            var two = arr[1].replace(/\b(0+)/gi,"");
            var newTwo= (parseInt(two) / 60).toFixed(2);

            return parseFloat(one) + parseFloat(newTwo)
        }

        return {
            myEchartsId,echartsMain,drawLine,baseOption,myChart,zhuanhuan,serData
        }
    }
})
</script>

<style lang="scss" scoped>

</style>