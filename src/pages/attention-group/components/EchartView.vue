<template>
    <div class="flex echart-view just-b">
        <div>
            <Title :title="titles.left" class="mg-b15" />
            <!-- <div class="subTitle" v-if="data.ident === 'irregular_schedule'">
                <span>{{ MaxValue(viewData.leftData).value }}%</span>人群起床时间在<span>{{ MaxValue(viewData.leftData).name }}</span>
            </div>
            <div class="subTitle mg-b15" v-if="data.ident === 'absenteeism'">
                平均出勤率<span>{{ viewData.leftData.rate }}%</span>
            </div> -->
            <!-- <div class="subTitle">{{ titles.subLeftTitle }}</div> -->
            
            <div class="chart" ref="leftEchart">
                <div v-if="data.ident === 'absenteeism'" class="absenteeism mg-t40">
                    <div class="absence-duty">
                        <h4>缺勤次数</h4>
                        <span>{{ viewData.leftData.total }} <span class="unit">次</span></span>
                    </div>
                    <el-progress type="circle" color="#1B528B" :percentage="viewData.leftData.rate">
                        <template #default="{ percentage }">
                            <div class="internal-style">{{percentage}}%</div>
                        </template>
                    </el-progress>
                </div>

                <!-- <div v-if="data.ident === 'suddenly_poor'" class="suddenly_poor">
                    <div class="header">
                        <h4 class="title">贫困前</h4>
                        <h4 class="title">贫困后</h4>
                    </div>
                    <div class="section">
                        <div class="left-progress">
                            <div class="box">
                                <span>70</span>
                                <div class="progress">
                                    <div class="item-style" :style="{ width: `${70}%`, '--bgColor': '#F39D12' }" />
                                </div>
                            </div>
                        </div>
                        <div class="center">食堂</div>
                        <div class="right-progress">
                            <div class="box">
                                <div class="progress">
                                    <div class="item-style" :style="{ width: `${60}%`, '--bgColor': '#F39D12' }" />
                                </div>
                                <span>70</span>
                            </div>
                        </div>
                    </div>
                </div> -->

                <div class="empty-box" v-if="['irregularly_eat','college_failure', 'isolated_people', 'sudden_abnormal_behavior', 'poor_people', 'anxiety_people', 'depressed_people', 'physical_not_standard', 'suddenly_poor'].includes(data.ident)">
                    <img src="@/assets/imgs/empty.png" alt="">
                    <p>暂无数据</p>
                </div>
            </div>
        </div>
        <div>
            <Title :title="titles.right" class="mg-b15" />
            <!-- <div class="subTitle" v-if="data.ident === 'irregular_schedule'">
                <span>{{ MaxValue(viewData.rightData).value }}%</span>人群归寝时间在<span>{{  MaxValue(viewData.rightData).name }}</span>
            </div>
            <div class="subTitle" v-if="data.ident === 'absenteeism'">
                缺勤课程主要特征为<span>{{ MaxValue(viewData.rightData).name }}</span>
            </div> -->
            <!-- <div class="subTitle">{{ titles.subRightTitle }}</div> -->
            <div class="chart" :class="data.ident === 'irregular_schedule' ? 'mg-t40' : ''" ref="rightEchart">
                <ul class="bar-box" v-if="data.ident === 'irregular_schedule'">
                    <li class="bar-item" v-for="item in viewData.rightData" :key="item.name">
                        <div class="y-title">{{ item.name }}</div>
                        <div class="line-box flex just-b">
                            <ul class="item-ul">
                                <li class="item-ul-li" :style="{ width: `${item.value}%`, '--bgColor': '#F39D12' }">
                                </li>
                            </ul>
                            <div class="zb">
                                {{ item.value }}%
                            </div>
                        </div>
                    </li>
                </ul>
                <ul class="list-body" v-if="data.ident === 'internet_addiction'">
                    <li class="item mg-b10" v-for="(item, index) in viewData.rightData" :key="index + 'hot'">
                        <div class="title-box">
                            <div class="tag" :class="index > 3 ? 'tag-s' : ''">{{ index + 1 }}</div>
                            <div class="text">{{ item.name }}</div>
                        </div>
                        <div class="out-rect">
                            <div class="in-rect" :style="{ width: item.value + '%' }"></div>
                        </div>
                    </li>
                </ul>
                <div class="empty-box" v-if="['irregularly_eat','college_failure', 'isolated_people', 'sudden_abnormal_behavior', 'poor_people', 'anxiety_people', 'depressed_people', 'physical_not_standard', 'suddenly_poor'].includes(data.ident)">
                    <img src="@/assets/imgs/empty.png" alt="">
                    <p>暂无数据</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getGroupBehavioralAnalysis } from '@/api/modules/attentionGroup';
import { EchartData } from '@/api/types/attentionGroup';
import Title from '@/pages/label-management/components/Title.vue';
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import irregular_schedule from './Echarts/irregular_schedule'
import college_failure from './Echarts/college_failure'
import absenteeism from './Echarts/absenteeism'
import content_sensitive from './Echarts/content_sensitive'
import missing_people from './Echarts/missing_people'
import internet_addiction from './Echarts/internet_addiction'
import consume_too_much from './Echarts/consume_too_much'
import suddenly_poor from './Echarts/suddenly_poor'
import irregularly_eat from './Echarts/irregularly_eat'
import isolated_people from './Echarts/isolated_people'
import sudden_abnormal_behavior from './Echarts/sudden_abnormal_behavior'
import consume_too_little from './Echarts/consume_too_little'
import consumption_skyrocketing from './Echarts/consumption_skyrocketing'
import consumption_plummeted from './Echarts/consumption_plummeted'
import poor_people from './Echarts/poor_people'
import anxiety_people from './Echarts/anxiety_people'
import depressed_people from './Echarts/depressed_people'
import physical_not_standard from './Echarts/physical_not_standard'
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const optionsHook = {
    irregular_schedule,
    college_failure,
    content_sensitive,
    missing_people,
    absenteeism,
    internet_addiction,
    consume_too_much,
    suddenly_poor,
    irregularly_eat,
    isolated_people,
    sudden_abnormal_behavior,
    consume_too_little,
    consumption_skyrocketing,
    consumption_plummeted,
    poor_people,
    anxiety_people,
    depressed_people,
    physical_not_standard
}
const props = defineProps<{ data: { ident: string, user_group_id: string, startTime: string, endTime: string, } }>()
const titles = reactive({
    left: '',
    right: '',
    subLeftTitle: '',
    subRightTitle: ''
})
const leftEchart = ref<HTMLElement>()
const rightEchart = ref<HTMLElement>()
const viewData = ref<{ rightData: EchartData[], leftData: EchartData[] }>({
    rightData: [],
    leftData: []
})
const getData = () => {
    getGroupBehavioralAnalysis(props.data).then(res => {
        console.log(res);
        if (res.code == 1) {
            viewData.value = res.data;
            initEchart()
        }
    })
}

const initEchart = () => {
    let leftOption = {}
    let rightOption = {}
    if(props.data.ident === 'consume_too_much') {
        leftOption = optionsHook[props.data.ident].leftOpt(viewData.value.leftData.chartData)
    } else {
        leftOption = optionsHook[props.data.ident].leftOpt(viewData.value.leftData)
    }
    rightOption = optionsHook[props.data.ident].rightOpt(viewData.value.rightData)
    
    titles.left = optionsHook[props.data.ident].leftTitle
    titles.right = optionsHook[props.data.ident].rightTitle
    titles.subLeftTitle = optionsHook[props.data.ident].subLeftTitle
    titles.subRightTitle = optionsHook[props.data.ident].subRightTitle

    // const leftView = echart?.init(leftEchart.value!)
    // leftView?.setOption(leftOption)
    if(!['absenteeism', 'suddenly_poor', 'irregularly_eat', 'college_failure', 'isolated_people', 'sudden_abnormal_behavior', 'poor_people', 'anxiety_people', 'depressed_people', 'physical_not_standard', 'suddenly_poor'].includes(props.data.ident)) {
        const leftView = echart?.init(leftEchart.value!)
        leftView?.setOption(leftOption)
    }
    if(!['irregular_schedule', 'internet_addiction', 'irregularly_eat', 'college_failure', 'isolated_people', 'sudden_abnormal_behavior', 'poor_people', 'anxiety_people', 'depressed_people', 'physical_not_standard', 'suddenly_poor'].includes(props.data.ident)) {
        const rightView = echart?.init(rightEchart.value!)
        rightView?.setOption(rightOption)
    }
    
}

const MaxValue = (list: any) => {
    if(list && list.length) {
        const Item = list.reduce((prev, current) => {
            return prev.value > current.value ? prev : current
        })
        return Item
    } else {
        return {}
    }
}

defineExpose({getData})
onMounted(() => {
    getData()
})
</script>

<style lang="scss" scoped>
.echart-view {
    height: 380px;

    >div {
        width: 49%;
        height: 100%;

        >.chart {
            width: 100%;
            height: 100%;

            &.mg-t40 {
                margin-top: 10%;
            }
        }
    }

    .bar-box {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        overflow-x: hidden;
        padding-top: 20px;

        .bar-item {
            width: 533px;
            margin-bottom: 10px;
            padding-right: 20px;

            .y-title {
                margin-bottom: 10px;
                height: 16px;
                font-size: 16px;
                font-family: Regular;
                color: #000000;
                line-height: 16px;
                max-width: 160px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .item-ul {
                width: 455px;
                height: 16px;
                border-radius: 100px;
                border: 1px solid #c9dcec;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 4px;

                .item-ul-li {
                    height: 8px;
                    background: var(--bgColor);
                    display: flex;

                    .zb {
                        font-size: 16px;
                        font-family: Bold;
                        color: #203449;
                        line-height: 20px;
                    }
                }
            }
        }
    }
    .subTitle {
        font-size: 16px;
        font-family: AlibabaPuHuiTi_2_65_Medium;
        color: #1B528B;
        line-height: 22px;
        > span {
            color: #B22A25;
            margin-right: 5px;
            &:last-child {
                margin-right: 0;
                margin-left: 5px;
            }
        }
    }
    .empty-box {
        text-align: center;
        font-size: 20px;
        font-family: Medium;
        font-weight: 500;
        color: #785151;
        line-height: 28px;
        width: 200px;
        img {
            height: 180px;
        }
    }
}

.absenteeism {
    display: flex;
    :deep(.el-progress) {
        // display: flex;
        // justify-content: center;
        .el-progress__text {
            width: 85px;
            height: 85px;
            left: 17%;
            top: 45%;
            .internal-style {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
                // background: red;
                font-size: 24px;
                font-family: YouSheBiaoTiHei;
                color: #000000;
                line-height: 90px;
            }
        }
    }
}
.absence-duty {
    background: url(@/assets/imgs/qqcs.png);
    background-size: 100% 100%;
    width: 220px;
    height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 24px;
    margin-right: 60px;
    h4 {
        font-size: 18px;
        font-family: Medium;
        color: #FFFFFF;
        line-height: 25px;
        margin-bottom: 15px;
    }
    span {
        font-size: 40px;
        font-family: Bold;
        font-weight: bold;
        color: #FFFFFF;
        line-height: 47px;
        .unit {
            font-size: 18px;
            font-family: Medium;
            font-weight: 500;
            color: #FFFFFF;
            line-height: 25px;
        }
    }
}

.list-body {
    .item {
        width: 100%;
        display: flex;
        align-items: center;
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
                width: 50px;
                height: 26px;
                text-align: center;
                margin-right: 5px;
                font-size: 16px;
                font-family: Medium;
                color: #FFFFFF;
                line-height: 26px;
                background: url(@/assets/imgs/ranking-red.png);
                background-size: 100% 100%;
            }
            .tag-s {
                background: url(@/assets/imgs/ranking.png);
                background-size: 100% 100%;
            }

            .text {
                font-size: 16px;
                font-family: Regular;
                color: #3E5463;
                line-height: 22px;
                margin-right: 14px;
            }
        }

        .out-rect {
            width: 70%;
            height: 15px;
            padding: 0 4px;
            clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 15px, 100% calc(100% - 0px),
                    calc(100% - 0px) 100%, 0px 100%, 0 calc(100% - 0px), 0 0px);
            background: linear-gradient(-45deg, #C6DAEB 0px, rgba(248, 248, 248, 0) 0) bottom right,
                linear-gradient(45deg, #C6DAEB 0px, rgba(216, 236, 255, 0) 0) bottom left,
                linear-gradient(135deg, #C6DAEB 0px, rgba(216, 236, 255, 0) 0) top left,
                linear-gradient(-115deg, #C6DAEB 6px, rgba(216, 236, 255, 0) 0) top right;
            background-repeat: no-repeat;
            border: solid 1px #C6DAEB;
            border-radius: 15px 0 0 15px;
            display: flex;
            align-items: center;
        }

        .in-rect {
            width: 0%;
            height: 7px;
            background: linear-gradient(250deg, transparent 4px, #005DA7 0);
        }
    }
}

.suddenly_poor {
    .header {
        display: flex;
        justify-content: center;
        margin-bottom: 5px;
        .title {
            margin: 0 5%;
        }
    }
    .section {
        display: flex;
        .left-progress {
            width: 45%;
            .box {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                .progress {
                    
                }
                span {
                    font-size: 14px;
                    font-family: Medium;
                    color: #203449;
                    line-height: 20px;
                    margin-right: 5px;
                }
            }
        }
        .center {
            width: 9%;
            text-align: center;
        }
        .right-progress {
            width: 45%;
            .box {
                display: flex;
                align-items: center;
                span {
                    font-size: 14px;
                    font-family: Medium;
                    color: #203449;
                    line-height: 20px;
                    margin-left: 5px;
                }
            }
        }
        .progress {
            width: 70%;
            // width: 455px;
            height: 16px;
            border-radius: 100px;
            border: 1px solid #c9dcec;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 4px;
            .item-style {
                height: 8px;
                background: var(--bgColor);
            }
        }

    }
}

</style>