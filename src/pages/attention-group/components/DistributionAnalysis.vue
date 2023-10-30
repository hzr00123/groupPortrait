<template>
    <div class="distribution-analysis">
        <el-row :gutter="20">
            <el-col :span="14">
                <h4 class="c-title mg-b20">生源分布</h4>
                <container>
                    <el-row :gutter="20">
                        <el-col :span="14">
                            <div class="stu-chart" ref="stuChart"></div>
                        </el-col>
                        <el-col :span="10">
                            <c-table align="center"
                            border
                            :columnList="columnList"
                            :data="tableData"
                            maxHeight="250">
                                <template #customNum="{data}">
                                    <span>{{data.count}}({{data.rate}}%)</span>
                                </template>
                            </c-table>
                        </el-col>
                    </el-row>
                    
                    
                </container>
            </el-col>
            <el-col :span="10">
                <div class="top mg-b20">
                    <h4 class="c-title">学院/专业分布</h4>
                    <el-radio-group v-model="toggleValue" size="default" @change="toggleChange">
                        <el-radio-button label="collegeData">按学院</el-radio-button>
                        <el-radio-button label="majorData">按专业</el-radio-button>
                    </el-radio-group>
                </div>
                <ul class="list-body">
                    <li class="item mg-b10" v-for="(item, index) in hotList[toggleValue]" :key="index + 'hot'">
                        <div class="title-box">
                            <div class="text">{{ item.orgName }}</div>
                        </div>
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <div class="out-rect">
                                    <div class="in-rect" :style="{ width: item.ratio + '%' }"></div>
                                </div>
                            </el-col>
                            <el-col :span="4">
                                <div class="num">{{ item.count }}人</div>
                            </el-col>
                        </el-row>
                    </li>
                </ul>
            </el-col>
        </el-row>
    </div>
</template>
    
<script setup lang='ts'>
import { ref, getCurrentInstance, onMounted, nextTick } from 'vue'
import { getPersonDistributionAnalysis } from '@/api/modules/attentionGroup'
import { DistributionParams } from '@/api/types/attentionGroup'
import { distributionData } from '../index'
import china from "@/utils/china.json";

const props = defineProps<{
    params: DistributionParams
}>()
const toggleValue = ref('collegeData')
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

const mapDatas = ref([]);

const initMap = () => {
    echart?.registerMap("china", china as any);
    const el: HTMLElement = instance?.refs.stuChart as any;
    let myChart = echart?.getInstanceByDom(el)
    if (myChart == null) {
        myChart = echart?.init(el);
    }

    let option = {
        grid: {
            // width: '100%',
            // height: '100%',
            left: '0%',
            right: '0%',
            bottom: '0%',
            containLabel: true
        },
        // 视觉映射组件
        visualMap: {
            show: false
        },
        tooltip: {
            formatter: '{b} : {c} 人'
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
                itemStyle: {
                    // areaColor: '#7B68EE', // 地图区域的颜色 如果设置了visualMap，areaColor属性将不起作用
                    borderWidth: 0.5, // 描边线宽 为 0 时无描边
                    borderColor: '#E4E7ED', // 图形的描边颜色 支持的颜色格式同 color，不支持回调函数
                    borderType: 'solid' // 描边类型，默认为实线，支持 'solid', 'dashed', 'dotted'
                },
                // 高亮状态下的多边形和标签样式
                emphasis: {
                    label: {
                        show: true, // 是否显示标签
                        color: '#fff' // 文字的颜色 如果设置为 'auto'，则为视觉映射得到的颜色，如系列色
                    },
                    itemStyle: {
                        areaColor: '#FFCC00' // 地图区域的颜色
                    }
                },
                // 地图系列中的数据内容数组 数组项可以为单个数值
                data: mapDatas.value
            }
        ]
    };
    myChart?.setOption(option)
}

const columnList = [
    {
        prop: 'place_origin',
        label: '地域',
        width: '100'
    },
    {
        slot: 'customNum',
        label: '人数'
    },
]

const hotList = ref({})

let tableData = ref([])

const toggleChange = (value: string) => {
    toggleValue.value = value;
}

const initData = async () => {
    const { data } = await getPersonDistributionAnalysis(props.params);
    hotList.value = data.rightData;
    tableData.value = data.leftData.filter((it: {
        count: number
        place_origin: string
        rate: number
    }) => {
        return it.count
    });
    mapDatas.value = data.leftData.map((it: any) => {
        if(it.place_origin !== '未填写') {
            let name = it.place_origin.replace(/省|市/g, '');
            return {
                name,
                value: it.count
            }
        }
    }).filter((v: any) => v);
    nextTick(() => {
        initMap()
    })


}
onMounted( async () => {
    await initData()
    
})
</script>
    
<style lang="scss" scoped>
.distribution-analysis {
    container {
        display: flex;
        .stu-chart {
            height: 260px;
            width: 340px;
            margin-right: 20px;
        }
    }

    .list-body {
        .item {
            .num {
                font-size: 16px;
                font-family: Bold;
                color: #203449;
                line-height: 22px;
            }

            .title-box {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                margin-bottom: 5px;

                .tag {
                    width: 14px;
                    height: 14px;
                    color: #fff;
                    line-height: 14px;
                    font-size: 12px;
                    text-align: center;
                    margin-right: 12px;
                }

                .text {
                    font-size: 16px;
                    font-family: Regular;
                    color: #3E5463;
                    line-height: 22px;
                }
            }

            .out-rect {
                width: 100%;
                height: 15px;
                padding: 0 4px;
                clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 15px, 100% calc(100% - 0px),
                        calc(100% - 0px) 100%, 0px 100%, 0 calc(100% - 0px), 0 0px);
                background: linear-gradient(-45deg, #FDDDC7 0px, rgba(248, 248, 248, 0) 0) bottom right,
                    linear-gradient(45deg, #FDDDC7 0px, rgba(216, 236, 255, 0) 0) bottom left,
                    linear-gradient(135deg, #FDDDC7 0px, rgba(216, 236, 255, 0) 0) top left,
                    linear-gradient(-115deg, #FDDDC7 6px, rgba(216, 236, 255, 0) 0) top right;
                background-repeat: no-repeat;
                border: solid 1px #FDDDC7;
                border-radius: 15px 0 0 15px;
                display: flex;
                align-items: center;
            }

            .in-rect {
                width: 0%;
                height: 7px;
                background: linear-gradient(250deg, transparent 4px, #FA6400 0);
            }
        }
    }
    .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}</style>