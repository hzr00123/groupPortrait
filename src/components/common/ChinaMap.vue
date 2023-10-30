<template>
    <div class="china-map">
        <div class="map-echart" ref="mapEcharts"></div>
    </div>
</template>
    
<script setup lang='ts'>
import axios from 'axios';
import { getCurrentInstance, nextTick, onMounted, watch } from 'vue';
import { chinaMapConf } from './Search';
import chinaResponse from '@/utils/china5.json'
const props = withDefaults(
    defineProps<{
        activeColor?: string
        visualColors?: string[]
        datas: chinaMapConf
    }>(),
    {
        activeColor: '#E9C5C4',
        visualColors: ['#B22924', '#E9C5C4'] as any,
        // datas: [
        //     {
        //         name: '北京市',
        //         value: 50,
        //         data: [
        //             {
        //                 name: '总共',
        //                 rate: "30%",
        //                 value: 50,
        //             },
        //             {
        //                 name: '男性',
        //                 rate: "30%",
        //                 value: 20,
        //             },
        //             {
        //                 name: '女性',
        //                 rate: "30%",
        //                 value: 30,
        //             }
        //         ],
        //     },
        //     {
        //         name: '重庆市',
        //         value: 100000,
        //         data: [
        //             {
        //                 name: '总共',
        //                 rate: "30%",
        //                 value: 100000,
        //             },
        //             {
        //                 name: '男性',
        //                 rate: "30%",
        //                 value: 50000,
        //             },
        //             {
        //                 name: '女性',
        //                 rate: "30%",
        //                 value: 60000,
        //             }
        //         ],
        //     }
        // ],
    }
)
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

const initMapEcharts = () => {
    const el: HTMLElement = instance?.refs.mapEcharts as any;
        let myChart = echart?.getInstanceByDom(el);
        if (myChart == null) {
            myChart = echart?.init(el);
        }

        const option = {
            // 悬浮窗
            tooltip: {
                trigger: 'item',
                formatter: function(params: any) {
                  if(!params.data){
                    return 
                  }
                  let htm = `<div style="width:220px;height:80px;">
                    <div>${params.name}</div>
                    <div style="display: flex;justify-content: space-between;">
                        <div style="margin-left:22px">${params.data.data[0].name}</div>
                        <div style="width:33.33%;text-align:center;">${params.data.data[0].value}人</div>
                        <div style="width:25%;text-align:right;">${params.data.data[0].rate}</div>
                    </div>
                    <div style="display: flex;justify-content: space-between; align-items: center;">
                      
                        <div style="display: flex;justify-content: space-between; align-items: center;">
                          <div style="width:12px;height:4px;background:#005DA7;margin-right:10px;"></div>
                          ${params.data.data[1].name}
                        </div>
                        <div style="width:33.33%;text-align:center;">${params.data.data[1].value}人</div>
                        <div style="width:25%;text-align:right;">${params.data.data[1].rate}</div>
                    </div>
                    <div style="display: flex;justify-content: space-between;">
                      <div style="display: flex;justify-content: space-between; align-items: center;">
                          <div style="width:12px;height:4px;background:#E3493E;margin-right:10px;"></div>
                          ${params.data.data[2].name}
                        </div>
                        <div style="width:33.33%;text-align:center;">${params.data.data[2].value}人</div>
                        <div style="width:25%;text-align:right;">${params.data.data[2].rate}</div>
                    </div>
                    </div>`
                  return htm
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '0%',
                containLabel: true
            },
            visualMap: {
                type: "continuous",
                min: 0,
                max: 10000,
                realtime: false,
                calculable: false,
                // color: ['#C0534F' ,'#CC726F', '#D99694', '#E9C5C4'],
                color: props.visualColors,
                right: '0%',
                text: ['高', '低'],
                itemWidth: 15
            },
            series: [
                {
                    type: 'map', // 类型
                    // 系列名称，用于tooltip的显示，legend 的图例筛选 在 setOption 更新数据和配置项时用于指定对应的系列
                    name: '中国地图',
                    map: 'china', // 地图类型
                    // 是否开启鼠标缩放和平移漫游 默认不开启 如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move' 设置成 true 为都开启
                    roam: true,
                    // 图形上的文本标签
                    label: {
                        show: false // 是否显示对应地名
                    },
                    zoom: 1.2,
                    // 地图区域的多边形 图形样式
                    select: {
                        itemStyle: {
                            color: props.activeColor
                        } 
                    },
                    itemStyle: {
                        // areaColor: '#7B68EE', // 地图区域的颜色 如果设置了visualMap，areaColor属性将不起作用
                        borderWidth: 0.5, // 描边线宽 为 0 时无描边
                        borderColor: '#E4E7ED', // 图形的描边颜色 支持的颜色格式同 color，不支持回调函数
                        borderType: 'solid' // 描边类型，默认为实线，支持 'solid', 'dashed', 'dotted'
                    },
                    // 高亮状态下的多边形和标签样式
                    emphasis: { //对应的鼠标悬浮效果
                        label: {
                            show: true, // 是否显示标签
                            color: '#000' // 文字的颜色 如果设置为 'auto'，则为视觉映射得到的颜色，如系列色
                        },
                        itemStyle: {
                            areaColor: props.activeColor // 地图区域的颜色
                        }
                    },
                    // 地图系列中的数据内容数组 数组项可以为单个数值
                    data: props.datas
                }
            ]
        }

        echart?.registerMap('china', chinaResponse as any);
        myChart?.setOption(option)
        myChart?.off('click');
        myChart?.on('click', (params) => {
            emit('handleMapClick', params.data)
        })
}

const emit = defineEmits(['handleMapClick'])

// onMounted(() => {
//     console.log(props.datas);
//     nextTick(() => {
//         initMapEcharts();
//     })
// })

watch(() => props.datas, (newVal) => {
    nextTick(() => {
        initMapEcharts();
    })
}, { immediate: true, deep: true })
</script>
    
<style lang="scss" scoped>
.china-map {
    width: 100%;
    height: 100%;
    .map-echart {
        width: 100%;
        height: 100%;
    }
}
</style>