import { defineComponent, getCurrentInstance, inject, nextTick, onMounted, onUnmounted, PropType, ref,watch } from "vue"
import ColorCard from '@/components/common/ColorCard.vue';
import InstanceManager, { getImageUrl } from '@/utils';
import { reactive } from 'vue';
import './styles/Scholarship.scss'
import { BaseParams } from "../../types";
import { usePortraitRequest, useChildrenData } from "@/hooks";
import { changeChartData,getAllChartData,getChartDataDetailAny,exportGetChartDataDetail,getSelectData} from "@/api/modules/studentPortrait";
import RedTab from "@/components/common/RedTab.vue";
import { EChartsType } from "echarts";
import Search from '@/components/common/Search.vue'
import { getOrgType } from "@/api/modules/emphasisList"
import { ElLoading } from 'element-plus'
import { downloadFile } from '@/hooks'
import WarningSeal from "@/components/WarningSeal";
type EChartsOption = echarts.EChartsOption;


const LeftView = defineComponent({
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        selectList: {
            type: [Array, undefined] as PropType<Array<{[key: string]: string}> | undefined>,
        },
        isActive: {
            type: String,
            default: 'overview__of_funding'
        },
    },
    setup(props, content) {
      const instanceManager = inject<InstanceManager>('InstanceManager')
      let rightObj = ref<
        {
            countAvgRatioTxtTop: string
            countAvgRatioTxtBottom: string
            mainTypeTxt: string
            mainPersonTxt: string
            mainTypeTxtContent: string
            mainPersonTxtContent: string
            title: string
            datas2:any
        }>({
        countAvgRatioTxtTop: '历年资助金额整体变化趋势',
        countAvgRatioTxtBottom: '历年资助人数整体变化趋势',
        mainTypeTxt:'主要资助类型',
        mainPersonTxt: '主要资助人群',
        mainTypeTxtContent:'',
        mainPersonTxtContent: '',
        title:'',
        datas2: {
            distributePie:[],
            poorPie:[],
            trendMap: {
                moneyTrend: 0,
                moneyAvgRatio: 0,
                countAvgRatio: 0,
                countTrend:0
            }
        }
      })
        const instance = getCurrentInstance();
        const echarts = instance?.proxy?.$echarts
        const LeftChart = ref()
        const LeftChart2 = ref()
        let topChartInstence: EChartsType | undefined
        let colorConfig = ref<Array<any>>([
            {
                color: '#4D5FC1',
                title: '获奖人数',
                value: 0,
                isUnit: true,
                icon: getImageUrl('hjrs-icon'),
                unit: '人',
                width: '180px',
                isClick:true
            },
            {
                color: '#45A0E6',
                title: '获奖次数',
                value: 0,
                isUnit: true,
                icon: getImageUrl('hjcs-icon'),
                unit: '次',
                width: '180px',
                isClick:false
            },
            {
                color: '#B22924',
                title: '获奖金额',
                value: 0,
                isUnit: true,
                icon: getImageUrl('hjje-icon'),
                unit: '万元',
                width: '180px',
                isClick:false
            },
        ])
        const PovertyLevelRiadio = ref('')
        const btnList2 = props.selectList || [
            {
                value: 'overview__of_funding',
                label: "资助总额"
            },
            {
                value: 'Financial_aid',
                label: "助学金"
            },
            {
                value: 'Work-study_program',
                label: "勤工俭学"
            },
            {
                value: 'student_loan',
                label: "助学贷款"
            },
            {
                value: 'Living_allowance',
                label: "生活补贴"
            },
        ]
        const isActive = ref(btnList2[0].value as string)
        // const isActive = ref<string>(props.isActive);


        const lineRender = (el: HTMLElement, datas:any, chart: EChartsType | undefined) => {
            if (!chart) {
                chart = echarts?.init(el);
            }
            let option = {
                color: datas.colors || ['#F39702', '#45A0E6'],
                title: {
                    text: datas.title,
                    left:'30%',
                    bottom: 0,
                    textStyle: {
                        color: '#203449',
                        fontSize: 16,
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        // console.log('qiehuan',params)
                        let result = `${params[0].name}<br>`;
                        params.forEach((item:any) => {
                            if (item.value) {
                                if (item.seriesName === '同比增长率') {
                                  result += `${item.marker} ${item.seriesName} : ${item.value}% </br>`
                                } else {
                                  result += `${item.marker} ${item.seriesName} : ${item.value} </br>`
                                }
                            }
                        })
                        return result
                    }
                },
                legend: {
                    top: '1%',
                    itemWidth: 10,
                    itemHeight: 5,
                    data: datas.legend || []
                },
                grid: {
                    top: '15%',
                    left: 50,
                    right: 50,
                    bottom: 50,
                    // containLabel: true
                },
                xAxis: [
                {
                    type: 'category',
                    data: datas.xAxis,
                    axisTick: { //刻度
                    alignWithLabel: true,
                    show: false,
                    },
                    triggerEvent: true,
                    axisLabel: {
                    // rotate: 0, //代表逆时针旋转
                    interval: 'auto',
                    formatter: function (value: string) {
                        if (value.length > 6) {
                        return `${value.slice(0, 6)}...`;
                        }
                        return value
                    }
                    },
                }
                ],
                yAxis: [
                    {
                        name: `单位：${datas.unit || ''}`,
                        axisLine: {
                          show: false,
                        },
                        axisTick: {
                        show: false,
                        },
                        type: 'value',
                        splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'dashed'
                        }
                        },
                        min: 0,
                    },
                    {
                        nameTextStyle: {
                            color: '#333333',
                            fontSize: 14,
                        },
                        axisLine: {
                         show: false,
                        },
                            axisTick: {
                            show: false,
                        },
                        type: 'value',
                        splitLine: {
                            show: false,
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                        min: 0,
                        axisLabel: {
                            formatter: function (value:any) {
                                return value + '%';
                            }
                        }

                    },
                ],
                series: [
                {
                    type: 'bar',
                    name: datas.legend ? datas.legend[0] : '',
                    barWidth: 10,
                    data: datas.series ? datas.series[0].data : [],
                    itemStyle: {
                    borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
                    },
                },
                {
                    name: datas.legend ? datas.legend[1] : '',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    symbolSize: 8,
                    yAxisIndex: 1,
                    data: datas.series ? datas.series[1].data : [],
                },
                ]
            };
            chart?.setOption(option);
        }

        onMounted(() => {
            initSelect()
            nextTick(() => {
                lineRender(LeftChart.value, {}, topChartInstence,);
                lineRender(LeftChart2.value, {}, topChartInstence,);
            })
        })
        let tabKey = ref(btnList2[0].value as string)
        let changeTab = (v: any) => {
            isActive.value = v
            tabKey.value = v
            resetData()
        }

        watch(props, () => {
            nextTick(() => {
                resetData()
            })

        }, { immediate: true, deep: true })
        instanceManager?.register('rightObj', rightObj)
        onUnmounted(() => {
          instanceManager?.clear('rightObj')
        })
        const resetData = () => {
            // console.log('当前渲染的1', props.isActive , isActive.value , props.isActive || isActive.value)
            getAllChartData({ ...props.params, ident:isActive.value,poorLevel:PovertyLevelRiadio.value }).then((res: any) => {
              switch (isActive.value) {
                    case 'overview__of_funding':
                        colorConfig.value = [
                            {
                                color: '#45A0E6',
                                title: '资助人数',
                                value: res.data.chartData.totalMap.stuCount,
                                isUnit: true,
                                icon: getImageUrl('zzze-pn'),
                                unit: '人',
                                width: '180px',
                                isClick: true
                            },
                            {
                                color: '#B22924',
                                title: '累积资助总额',
                                value: res.data.chartData.totalMap.money,
                                isUnit: true,
                                icon: getImageUrl('zzze-my'),
                                unit: res.data.chartData.totalMap.moneyUnit,
                                width: '180px',
                                isClick: false
                            },
                            {
                                color: '#4D5FC1',
                                title: '人均资助',
                                value: res.data.chartData.totalMap.avgMoney,
                                isUnit: true,
                                icon: getImageUrl('zzze-my-avg'),
                                unit: '元',
                                width: '180px',
                                isClick: false
                            },
                        ]
                        nextTick(() => {
                            let objOne = {
                                legend: ['资助人数', '同比增长率'],
                                unit: '人',
                                title: '历年资助人数',
                                colors: ['#E3493E', '#1B528B'],
                                ...res.data.chartData.countBar
                            }

                            let objOne2 = {
                                legend: ['资助金额', '同比增长率'],
                                unit: '万元',
                                title: '历年资助金额',
                                colors: ['#45A0E6', '#F39702'],
                                ...res.data.chartData.moneyBar
                            }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value, objOne2, topChartInstence);
                        })

                        rightObj.value = {
                            title: '资助总额',
                            countAvgRatioTxtTop: '历年资助金额整体变化趋势',
                            countAvgRatioTxtBottom: '历年资助人数整体变化趋势',
                            mainTypeTxt: '主要资助类型',
                            mainPersonTxt: '主要资助人群',
                            mainTypeTxtContent: '',
                            mainPersonTxtContent: '',
                            datas2: {
                                trendMap: {
                                    moneyTrend: 0,
                                    moneyAvgRatio: 0,
                                    countAvgRatio: 0,
                                    countTrend: 0
                                }
                            }
                        }
                        if (res.datas2) {
                            rightObj.value.mainTypeTxtContent = res.datas2.distributeMax
                            rightObj.value.mainPersonTxtContent = res.datas2.poorMax
                            rightObj.value.datas2 = res.datas2
                        }
                        break;
                    case 'Financial_aid':
                        console.log('助学金人数')
                        colorConfig.value = [
                            {
                                color: '#45A0E6',
                                title: '助学金人数',
                                value: res.data.chartData.totalMap.stuCount,
                                isUnit: true,
                                icon: getImageUrl('zxj-pr'),
                                unit: '人',
                                width: '180px',
                                isClick: false
                            },
                            {
                                color: '#B22924',
                                title: '助学金总额',
                                value: res.data.chartData.totalMap.money,
                                isUnit: true,
                                icon: getImageUrl('zxj-my'),
                                unit: res.data.chartData.totalMap.moneyUnit,
                                width: '180px',
                                isClick: false
                            },
                            {
                                color: '#4D5FC1',
                                title: '人均助学金',
                                value: res.data.chartData.totalMap.avgMoney,
                                isUnit: true,
                                icon: getImageUrl('zxj-my-avg'),
                                unit: '元',
                                width: '180px',
                                isClick: false
                            },
                        ]
                        nextTick(() => {
                            let objOne = {
                                legend: ['助学金人数', '同比增长率'],
                                unit: '人',
                                title: '历年助学金人数',
                                colors: ['#F39D12', '#1B528B'],
                                ...res.data.chartData.countBar
                            }

                            let objOne2 = {
                                legend: ['助学金金额', '同比增长率'],
                                unit: '万元',
                                title: '历年助学金金额',
                                colors: ['#45A0E6', '#F39702'],
                                ...res.data.chartData.moneyBar
                            }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value, objOne2, topChartInstence);
                        })
                        rightObj.value = {
                            title: '助学金',
                            countAvgRatioTxtTop: '历年助学金额整体变化趋势',
                            countAvgRatioTxtBottom: '历年助学人数整体变化趋势',
                            mainTypeTxt: '主要助学金类型等级',
                            mainPersonTxt: '主要助学金获得人群',
                            mainTypeTxtContent: '',
                            mainPersonTxtContent: '',
                            datas2: {
                                trendMap: {
                                    moneyTrend: 0,
                                    moneyAvgRatio: 0,
                                    countAvgRatio: 0,
                                    countTrend: 0
                                }
                            }
                        }

                        if (res.datas2) {
                            rightObj.value.mainTypeTxtContent = res.datas2.distributeMax
                            rightObj.value.mainPersonTxtContent = res.datas2.poorMax
                            rightObj.value.datas2 = res.datas2
                        }

                       break;
                   case 'Work-study_program':
                    colorConfig.value = [
                        {
                            color: '#B22924',
                            title: '勤工俭学人数',
                            value: res.data.chartData.totalMap.stuCount,
                            isUnit: true,
                            icon: getImageUrl('qgjx-pr'),
                            unit: '人',
                            width: '160px',
                            strSliceNum:5,
                            isClick:false
                        },
                        {
                            color: '#45A0E6',
                            title: '勤工俭学工资总额',
                            value: res.data.chartData.totalMap.money,
                            isUnit: true,
                            icon: getImageUrl('qgjx-my'),
                            unit: res.data.chartData.totalMap.moneyUnit,
                            width: '160px',
                            strSliceNum:5,
                            isClick:false
                        },
                        {
                            color: '#4D5FC1',
                            title: '勤工俭学次数',
                            value: res.data.chartData.totalMap.allCount,
                            isUnit: true,
                            icon: getImageUrl('qgjx-count'),
                            unit: '次',
                            width: '160px',
                            isClick:false
                        },
                        {
                            color: '#F39D12',
                            title: '次均工资',
                            value: res.data.chartData.totalMap.timesMoney,
                            isUnit: true,
                            icon: getImageUrl('qgjx-count-avg'),
                            unit: '元',
                            width: '160px',
                            isClick:false
                        },
                       ]
                       nextTick(() => {
                           let objOne = {
                               legend: ['勤工俭学人数', '同比增长率'],
                               unit: '人',
                               title: '历年勤工俭学人数',
                               colors:['#E3493E','#1B528B'],
                               ...res.data.chartData.countBar
                           }

                           let objOne2 = {
                               legend: ['勤工俭学金额', '同比增长率'],
                               unit: '万元',
                               title: '历年勤工俭学金额',
                               colors:['#F39702','#45A0E6'],
                               ...res.data.chartData.moneyBar
                           }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value,objOne2 , topChartInstence);
                       })
                       rightObj.value = {
                           title:'勤工俭学',
                           countAvgRatioTxtTop: '历年勤工俭学工资总额整体变化趋势',
                           countAvgRatioTxtBottom: '历年勤工俭学人数整体变化趋势',
                           mainTypeTxt: '主要勤工俭学单位',
                           mainPersonTxt: '主要勤工俭学人群',
                           mainTypeTxtContent: '',
                           mainPersonTxtContent: '',
                           datas2: {
                               trendMap: {
                                   moneyTrend: 0,
                                   moneyAvgRatio: 0,
                                   countAvgRatio: 0,
                                   countTrend: 0
                               }
                           }
                       }

                        if (res.datas2) {
                            rightObj.value.mainTypeTxtContent = res.datas2.distributeMax
                            rightObj.value.mainPersonTxtContent = res.datas2.poorMax
                            rightObj.value.datas2 = res.datas2
                        }

                       break;
                   case 'student_loan':
                    colorConfig.value = [
                        {
                            color: '#45A0E6',
                            title: '贷款人数',
                            value: res.data.chartData.totalMap.stuCount,
                            isUnit: true,
                            icon: getImageUrl('hjrs-icon'),
                            unit: '人',
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#B22924',
                            title: '贷款总额',
                            value: res.data.chartData.totalMap.money,
                            isUnit: true,
                            icon: getImageUrl('hjcs-icon'),
                            unit: res.data.chartData.totalMap.moneyUnit,
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#4D5FC1',
                            title: '人均贷款',
                            value: res.data.chartData.totalMap.avgMoney,
                            isUnit: true,
                            icon: getImageUrl('hjje-icon'),
                            unit: '元',
                            width: '180px',
                            isClick:false
                        },
                       ]
                       nextTick(() => {
                           let objOne = {
                               legend: ['贷款人数', '同比增长率'],
                               unit: '人',
                               title: '历年贷款人数',
                               colors:['#F39702','#45A0E6'],
                               ...res.data.chartData.countBar
                           }

                           let objOne2 = {
                               legend: ['贷款金额', '同比增长率'],
                               unit: '万元',
                               title: '历年贷款金额',
                               colors:['#45A0E6','#F39702'],
                               ...res.data.chartData.moneyBar
                           }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value,objOne2 , topChartInstence);
                       })
                       rightObj.value = {
                           title:'助学贷款',
                           countAvgRatioTxtTop: '历年助学贷款金额整体变化趋势',
                           countAvgRatioTxtBottom: '历年助学贷款人数整体变化趋势',
                           mainTypeTxt: '主要助学贷款金额区间',
                           mainPersonTxt: '主要资助人群',
                           mainTypeTxtContent: '',
                           mainPersonTxtContent: '',
                           datas2: {
                               trendMap: {
                                   moneyTrend: 0,
                                   moneyAvgRatio: 0,
                                   countAvgRatio: 0,
                                   countTrend: 0
                               }
                           }
                        }
                        if (res.datas2) {
                            rightObj.value.mainTypeTxtContent = res.datas2.distributeMax
                            rightObj.value.mainPersonTxtContent = res.datas2.poorMax
                            rightObj.value.datas2 = res.datas2
                        }

                       break;
                   case 'Living_allowance':
                    colorConfig.value = [
                        {
                            color: '#45A0E6',
                            title: '生活补贴人数',
                            value: res.data.chartData.totalMap.stuCount,
                            isUnit: true,
                            icon: getImageUrl('shbt-pr'),
                            unit: '人',
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#B22924',
                            title: '生活补贴总额',
                            value: res.data.chartData.totalMap.money,
                            isUnit: true,
                            icon: getImageUrl('shbt-my'),
                            unit: res.data.chartData.totalMap.moneyUnit,
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#4D5FC1',
                            title: '人均月补贴',
                            value: res.data.chartData.totalMap.avgMoney,
                            isUnit: true,
                            icon: getImageUrl('shbt-my-avg'),
                            unit: '元',
                            width: '180px',
                            isClick:false
                        },
                       ]
                       nextTick(() => {
                           let objOne = {
                               legend: ['生活补贴人数', '同比增长率'],
                               unit: '人',
                               title:'历年生活补贴人数',
                               colors:['#45A0E6','#F39702'],
                               ...res.data.chartData.countBar
                           }

                           let objOne2 = {
                               legend: ['生活补贴金额', '同比增长率'],
                               unit: '万元',
                               title: '历年生活补贴金额',
                               colors:['#E3493E','#00C9F2'],
                               ...res.data.chartData.moneyBar
                           }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value,objOne2 , topChartInstence);
                       })
                       rightObj.value = {
                           title:'生活补贴',
                           countAvgRatioTxtTop: '历年生活补贴金额整体变化趋势',
                           countAvgRatioTxtBottom: '历年生活补贴人数整体变化趋势',
                           mainTypeTxt: '主要月生活补贴金额',
                           mainPersonTxt: '主要资助人群',
                           mainTypeTxtContent: '',
                           mainPersonTxtContent: '',
                           datas2: {
                               trendMap: {
                                   moneyTrend: 0,
                                   moneyAvgRatio: 0,
                                   countAvgRatio: 0,
                                   countTrend: 0
                               }
                           }
                        }
                        if (res.datas2) {
                            rightObj.value.mainTypeTxtContent = res.datas2.distributeMax
                            rightObj.value.mainPersonTxtContent = res.datas2.poorMax
                            rightObj.value.datas2 = res.datas2
                        }
                    break;
                   default:
                       colorConfig.value = [
                            {
                                color: '#45A0E6',
                                title: '资助人数',
                                value: res.data.chartData.totalMap.stuCount,
                                isUnit: true,
                                icon: getImageUrl('zzze-pn'),
                                unit: '人',
                                width: '180px',
                                isClick: true
                            },
                            {
                                color: '#B22924',
                                title: '累积资助总额',
                                value: res.data.chartData.totalMap.money,
                                isUnit: true,
                                icon: getImageUrl('zzze-my'),
                                unit: res.data.chartData.totalMap.moneyUnit,
                                width: '180px',
                                isClick: false
                            },
                            {
                                color: '#4D5FC1',
                                title: '人均资助',
                                value: res.data.chartData.totalMap.avgMoney,
                                isUnit: true,
                                icon: getImageUrl('zzze-my-avg'),
                                unit: '元',
                                width: '180px',
                                isClick: false
                            },
                        ]
                        nextTick(() => {
                            let objOne = {
                                legend: ['资助人数', '同比增长率'],
                                unit: '人',
                                title: '历年资助人数',
                                colors: ['#E3493E', '#1B528B'],
                                ...res.data.chartData.countBar
                            }

                            let objOne2 = {
                                legend: ['资助金额', '同比增长率'],
                                unit: '万元',
                                title: '历年资助金额',
                                colors: ['#45A0E6', '#F39702'],
                                ...res.data.chartData.moneyBar
                            }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value, objOne2, topChartInstence);
                        })

                        rightObj.value = {
                            title: '资助总额',
                            countAvgRatioTxtTop: '历年资助金额整体变化趋势',
                            countAvgRatioTxtBottom: '历年资助人数整体变化趋势',
                            mainTypeTxt: '主要资助类型',
                            mainPersonTxt: '主要资助人群',
                            mainTypeTxtContent: '',
                            mainPersonTxtContent: '',
                            datas2: {
                                trendMap: {
                                    moneyTrend: 0,
                                    moneyAvgRatio: 0,
                                    countAvgRatio: 0,
                                    countTrend: 0
                                }
                            }
                        }
                        if (res.datas2) {
                            rightObj.value.mainTypeTxtContent = res.datas2.distributeMax
                            rightObj.value.mainPersonTxtContent = res.datas2.poorMax
                            rightObj.value.datas2 = res.datas2
                        }
                        break;
               }
            })
        }

        let changeLevel = (kk: any) => {
            // console.log('贫困登记')
            PovertyLevelRiadio.value = kk
            changeChartData({...props.params, poorLevel: kk,  ident: tabKey.value || 'overview__of_funding'}).then((res) => {
               switch (tabKey.value) {
                case 'overview__of_funding':
                    colorConfig.value = [
                        {
                            color: '#45A0E6',
                            title: '资助人数',
                            value: res.data.totalMap.stuCount,
                            isUnit: true,
                            icon: getImageUrl('zzze-pn'),
                            unit: '人',
                            width: '180px',
                            isClick:true
                        },
                        {
                            color: '#B22924',
                            title: '累积资助总额',
                            value: res.data.totalMap.money,
                            isUnit: true,
                            icon: getImageUrl('zzze-my'),
                            unit: res.data.totalMap.moneyUnit,
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#4D5FC1',
                            title: '人均资助',
                            value: res.data.totalMap.avgMoney,
                            isUnit: true,
                            icon: getImageUrl('zzze-my-avg'),
                            unit: '元',
                            width: '180px',
                            isClick:false
                        },
                       ]
                       nextTick(() => {
                           let objOne = {
                               legend: ['资助人数', '同比增长率'],
                               unit: '人',
                               title: '历年资助人数',
                               colors:['#E3493E', '#1B528B'],
                               ...res.data.countBar
                           }

                           let objOne2 = {
                               legend: ['资助金额', '同比增长率'],
                               unit: '万元',
                               title: '历年资助金额',
                               colors: ['#45A0E6', '#F39702'],
                               ...res.data.moneyBar
                           }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value,objOne2 , topChartInstence);
                       })
                    break;
                   case 'Financial_aid':
                    colorConfig.value = [
                        {
                            color: '#45A0E6',
                            title: '助学金人数',
                            value: res.data.totalMap.stuCount,
                            isUnit: true,
                            icon: getImageUrl('zxj-pr'),
                            unit: '人',
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#B22924',
                            title: '助学金总额',
                            value: res.data.totalMap.money,
                            isUnit: true,
                            icon: getImageUrl('zxj-my'),
                            unit: res.data.totalMap.moneyUnit,
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#4D5FC1',
                            title: '人均助学金',
                            value: res.data.totalMap.avgMoney,
                            isUnit: true,
                            icon: getImageUrl('zxj-my-avg'),
                            unit: '元',
                            width: '180px',
                            isClick:false
                        },
                       ]
                       nextTick(() => {
                           let objOne = {
                               legend: ['助学金人数', '同比增长率'],
                               unit: '人',
                               title: '历年助学金人数',
                               colors: ['#F39D12', '#1B528B'],
                               ...res.data.countBar
                           }

                           let objOne2 = {
                               legend: ['助学金金额', '同比增长率'],
                               unit: '万元',
                               title: '历年助学金金额',
                               colors: ['#45A0E6', '#F39702'],
                               ...res.data.moneyBar
                           }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value,objOne2 , topChartInstence);
                       })
                       break;
                   case 'Work-study_program':
                    colorConfig.value = [
                        {
                            color: '#B22924',
                            title: '勤工俭学人数',
                            value: res.data.totalMap.stuCount,
                            isUnit: true,
                            icon: getImageUrl('qgjx-pr'),
                            unit: '人',
                            width: '160px',
                            isClick:false
                        },
                        {
                            color: '#45A0E6',
                            title: '勤工俭学工资总额',
                            value: res.data.totalMap.money,
                            isUnit: true,
                            icon: getImageUrl('qgjx-my'),
                            unit: res.data.totalMap.moneyUnit,
                            width: '160px',
                            isClick:false
                        },
                        {
                            color: '#4D5FC1',
                            title: '勤工俭学次数',
                            value: res.data.totalMap.allCount,
                            isUnit: true,
                            icon: getImageUrl('qgjx-count'),
                            unit: '元',
                            width: '160px',
                            isClick:false
                        },
                        {
                            color: '#F39D12',
                            title: '次均工资',
                            value: res.data.totalMap.timesMoney,
                            isUnit: true,
                            icon: getImageUrl('qgjx-count-avg'),
                            unit: '元',
                            width: '160px',
                            isClick:false
                        },
                       ]
                       nextTick(() => {
                           let objOne = {
                               legend: ['勤工俭学人数', '同比增长率'],
                               unit: '人',
                               title: '历年勤工俭学人数',
                               colors:['#E3493E','#1B528B'],
                               ...res.data.countBar
                           }

                           let objOne2 = {
                               legend: ['勤工俭学金额', '同比增长率'],
                               unit: '万元',
                               title: '历年勤工俭学金额',
                               colors:['#F39702','#45A0E6'],
                               ...res.data.moneyBar
                           }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value,objOne2 , topChartInstence);
                       })
                       break;
                   case 'student_loan':
                    colorConfig.value = [
                        {
                            color: '#45A0E6',
                            title: '贷款人数',
                            value: res.data.totalMap.stuCount,
                            isUnit: true,
                            icon: getImageUrl('hjrs-icon'),
                            unit: '人',
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#B22924',
                            title: '贷款总额',
                            value: res.data.totalMap.money,
                            isUnit: true,
                            icon: getImageUrl('hjcs-icon'),
                            unit: res.data.totalMap.moneyUnit,
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#4D5FC1',
                            title: '人均贷款',
                            value: res.data.totalMap.avgMoney,
                            isUnit: true,
                            icon: getImageUrl('hjje-icon'),
                            unit: '元',
                            width: '180px',
                            isClick:false
                        },
                       ]
                       nextTick(() => {
                           let objOne = {
                               legend: ['贷款人数', '同比增长率'],
                               unit: '人',
                               title: '历年贷款人数',
                               colors:['#F39702','#45A0E6'],
                               ...res.data.countBar
                           }

                           let objOne2 = {
                               legend: ['贷款金额', '同比增长率'],
                               unit: '万元',
                               title: '历年贷款金额',
                               colors:['#45A0E6','#F39702'],
                               ...res.data.moneyBar
                           }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value,objOne2 , topChartInstence);
                       })
                       break;
                   case 'Living_allowance':
                    colorConfig.value = [
                        {
                            color: '#45A0E6',
                            title: '生活补贴人数',
                            value: res.data.totalMap.stuCount,
                            isUnit: true,
                            icon: getImageUrl('shbt-pr'),
                            unit: '人',
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#B22924',
                            title: '生活补贴总额',
                            value: res.data.totalMap.money,
                            isUnit: true,
                            icon: getImageUrl('shbt-my'),
                            unit: res.data.totalMap.moneyUnit,
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#4D5FC1',
                            title: '人均月补贴',
                            value: res.data.totalMap.avgMoney,
                            isUnit: true,
                            icon: getImageUrl('shbt-my-avg'),
                            unit: '元',
                            width: '180px',
                            isClick:false
                        },
                       ]
                       nextTick(() => {
                           let objOne = {
                               legend: ['生活补贴人数', '同比增长率'],
                               unit: '人',
                               title: '历年生活补贴人数',
                               colors:['#45A0E6','#F39702'],
                               ...res.data.countBar
                           }

                           let objOne2 = {
                               legend: ['生活补贴金额', '同比增长率'],
                               unit: '万元',
                               title: '历年生活补贴金额',
                               colors:['#E3493E','#00C9F2'],
                               ...res.data.moneyBar
                           }
                            lineRender(LeftChart.value, objOne, topChartInstence);
                            lineRender(LeftChart2.value,objOne2 , topChartInstence);
                       })
                    break;
                   default:
                       colorConfig.value = [
                        {
                            color: '#4D5FC1',
                            title: '获奖人数',
                            value: 0,
                            isUnit: true,
                            icon: getImageUrl('hjrs-icon'),
                            unit: '人',
                               width: '180px',
                            isClick:false
                        },
                        {
                            color: '#45A0E6',
                            title: '获奖次数',
                            value: 0,
                            isUnit: true,
                            icon: getImageUrl('hjcs-icon'),
                            unit: '次',
                            width: '180px',
                            isClick:false
                        },
                        {
                            color: '#B22924',
                            title: '获奖金额',
                            value:0,
                            isUnit: true,
                            icon: getImageUrl('hjje-icon'),
                            unit: '万元',
                            width: '180px',
                            isClick:false
                        },
                    ]
                    break;
               }
            })
        }

        let dialogTableVisible = ref(false)
        let tableData = ref([])
        const campusOrgList = ref([])
        const collegeOrgList = ref([])
        const majorOrgList = ref([])
        const gradeOrgList = ref([])
        const classOrgList = ref([])
        const searchForm = reactive({
            stuSchoolYear: "",
            stuSemester: "",
            stuCampusId: "",
            stuCollegeId: "",
            stuMajorId: "",
            stuGradeId: "",
            stuClassId: "",
            stuSex: "",
            stuNation: "",
            stuStudentType: "",
            stuPlaceOrigin: "",
            stuPolitics: "",
            stuEnrollType: "",
            keyWord: "",
        });
        const categoryList = ref<{}[]>([])

        const searchConfig = reactive(
            [
                {
                    labelWidth: '75px',
                    inputWidth: '100px',
                    type: 'select',
                    label: ' ',
                    placeholder: '性别',
                    key: 'stuSex',
                    opKey: 'value',
                    opLabel: 'label',
                    options: [
                        {
                        label: '男',
                        value: '男'
                        },
                        {
                        label: '女',
                        value: '女'
                        },
                    ],
                },
                {
                    inputWidth: '120px',
                    type: 'select',
                    label: '',
                    placeholder: '校区',
                    key: 'stuCampusId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: campusOrgList,
                },
                {
                    inputWidth: '120px',
                    type: 'select',
                    label: '',
                    placeholder: '学院',
                    key: 'stuCollegeId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: collegeOrgList,
                },
                {
                    inputWidth: '120px',
                    type: 'select',
                    label: '',
                    placeholder: '专业',
                    key: 'stuMajorId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: majorOrgList,
                },
                {
                    inputWidth: '120px',
                    type: 'select',
                    label: '',
                    placeholder: '年级',
                    key: 'stuGradeId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: gradeOrgList,
                },
                {
                    inputWidth: '120px',
                    type: 'select',
                    label: '',
                    placeholder: '班级',
                    key: 'stuClassId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: classOrgList,
                },
                {
                    inputWidth: '120px',
                    type: 'select',
                    label: '',
                    placeholder: '类型',
                    key: 'category',
                    opKey: 'value',
                    opLabel: 'name',
                    options: categoryList,
                },
                {
                    inputWidth: '200px',
                    type: 'input',
                    label: '',
                    placeholder: '请输入姓名、学号搜索',
                    key: 'name',
                },
            ]
            )



        let clickOn = (kk: any) => {
            if(!kk) return false
            getTableData()
            dialogTableVisible.value = true
        }



        const initSelect = async () => {
            // const loading = ElLoading.service({
            //     lock: true,
            //     text: '加载中...',
            //     background: 'rgba(0, 0, 0, 0.7)',
            // })
            let res = await getOrgType({});
            if (res.code == 1) {
                campusOrgList.value = res.data.campusOrgList;
                collegeOrgList.value = res.data.collegeOrgList;
                majorOrgList.value = res.data.majorOrgList;
                gradeOrgList.value = res.data.gradeOrgList;
                classOrgList.value = res.data.classOrgList;
            }
            let se = await getSelectData({ident:'overview__of_funding'});
            if (se.code == 1) {
                categoryList.value = []
                let arr: { name: any; value: any; }[] = []
                se.data.types.forEach((ff:any) => {
                   arr.push({
                        name:ff,
                        value:ff
                    })
                })
                categoryList.value = arr
            }
            getTableData();
            // loading.close()
        }

        const pages = reactive({
            current: 1,
            size: 10,
            total: 0,
        })

        const queryClick = () => {
          getTableData();
        }
        const resetClick = () =>{
          getTableData();
        }

        const changeCurrent = (v: number) =>{
            pages.current = v;
            getTableData();
        }
        const changeSize = (v: number) =>{
            pages.size = v;
            getTableData();
        }

        const selectChange = async (key: string, val: string | number) => {
            const list = ['stuCampusId', 'stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId',]
            if (list.includes(key)) {
                if (key === 'stuCampusId') {
                searchForm.stuCollegeId = '';
                searchForm.stuMajorId = '';
                searchForm.stuGradeId = '';
                searchForm.stuClassId = '';
                }
                if (key === 'stuCollegeId') {
                searchForm.stuMajorId = '';
                searchForm.stuGradeId = '';
                searchForm.stuClassId = '';
                }
                if (key === 'stuMajorId') {
                searchForm.stuGradeId = '';
                searchForm.stuClassId = '';
                }
                if (key === 'stuGradeId') {
                searchForm.stuClassId = '';
                }
                const params = {
                campusId: searchForm.stuCampusId,
                collegeId: searchForm.stuCollegeId,
                majorId: searchForm.stuMajorId,
                gradeId: searchForm.stuGradeId,
                classId: searchForm.stuClassId,
                }
                const res = await getOrgType(params);
                if (res.code == 1) {
                if (key == 'stuCampusId') {
                    collegeOrgList.value = res.data.collegeOrgList;
                    majorOrgList.value = res.data.majorOrgList;
                    gradeOrgList.value = res.data.gradeOrgList;
                    classOrgList.value = res.data.classOrgList;

                }
                if (key == 'stuCollegeId') {
                    majorOrgList.value = res.data.majorOrgList;
                    gradeOrgList.value = res.data.gradeOrgList;
                    classOrgList.value = res.data.classOrgList;
                }
                if (key == 'stuMajorId') {
                    gradeOrgList.value = res.data.gradeOrgList;
                    classOrgList.value = res.data.classOrgList;
                }
                if (key == 'stuGradeId') {
                    classOrgList.value = res.data.classOrgList;
                }
                }
            }
            }

        let getTableData = () => {
           getChartDataDetailAny({ ...props.params,...searchForm, ident: 'overview__of_funding',pageNum: pages.current,pageSize: pages.size }).then((res) => {
               if (res.data) {
                   pages.total = res.data.total;
                   tableData.value = res.data.rows
               }
           })
        }

        const handleClose = (done: () => void) => {
            done()
            dialogTableVisible.value = false
        }

        const exportClick = async () => {
            let params = {
                ...searchForm,
                ...props.params,
                expExcel:true,
                ident: 'overview__of_funding'
            }
            const res = await exportGetChartDataDetail(params)
            downloadFile(res)
        }

        const columnList = [
        {
            prop: 'name',
            label: '姓名',
        },
        {
            prop: 'sex',
            label: '性别',
        },
        {
            prop: 'userName',
            label: '学号',
            },
        {
            prop: 'campus_name',
            label: '校区',
            },
        {
            prop: 'college_name',
            label: '学院',
        },
        {
            prop: 'major_name',
            label: '专业',
        },
        {
            prop: 'grade_name',
            label: '年级',
        },
        {
            prop: 'className',
            label: '班级',
        },
        {
            prop: 'subsidiYear',
            label: '年份',
        },
        {
            prop: 'subsidiType',
            label: '类型',
            },
            {
            prop: 'subsidiMoney',
            label: '金额',
        },
        ]

        return () => {
            return <div class='LoanSupplement left' {...content.attrs}>
                <WarningSeal name={btnList2.find(i => i.value === isActive.value)!.label} ident={isActive.value}/>
                <section class={'left-section'}>
                    <div class={'sb mg-b20'}>
                      <c-title title="基本信息画像" />
                       <RedTab btnList={btnList2}
                        isRed={false}
                        isActive={isActive.value}
                        onRedTabChange={changeTab} />
                    </div>
                    <div class='right-text'>
                        贫困等级：
                        <el-radio-group v-model={PovertyLevelRiadio.value} onChange={changeLevel}>
                            <el-radio label={''}>全部学生</el-radio>
                            <el-radio label={1}>贫困生</el-radio>
                            <el-radio label={0}>非贫困生</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="flex just-b card-box">
                        {
                            colorConfig.value.map(i => (
                                <ColorCard cardConfig={i} key={i.color} onClick={() => clickOn(i.isClick)} class={i.isClick?'cursor-pointer' :''} />
                            ))
                        }
                    </div>
                </section>
                <div class="chart-box" style="margin-top:60px">
                    <div class='w50'>
                      <div class="chart-lineBar" ref={LeftChart}></div>
                    </div>
                     <div class='w50'>
                      <div class="chart-lineBar" ref={LeftChart2}></div>
                    </div>
                </div>

                <el-dialog v-model={dialogTableVisible.value} title="助勤贷补详情" close-on-click-modal={false} append-to-body={true} width="80%"
                before-close={ handleClose }>
                    <Search
                        isExport={true}
                        search-config={searchConfig}
                        searchForm={searchForm}
                        onQueryClick={queryClick}
                        onExportClick={exportClick}
                        onResetClick={resetClick}
                        onSelectChange={selectChange} />
                    <c-table
                        align="center"
                        columnList={columnList}
                        data={tableData.value}
                        pages={pages}
                        onChangeCurrent={changeCurrent}
                        onChangeSize={changeSize}
                        height="460">
                    </c-table>
                </el-dialog>
            </div>
        }
    }
})

const trendMapList = {
    '0': '持平',
    '1': '上涨',
    '-1': '下跌',
    '-2': '-'
}

const RightView = defineComponent({
    setup(props, content) {
        const instanceManager = inject<InstanceManager>('InstanceManager')!
        const instence = getCurrentInstance()
        const echarts = instence?.proxy?.$echarts
        let topChartInstence: EChartsType | undefined
        let bottomChartInstence: EChartsType | undefined
        const topChart = ref()
        const bottomChart = ref()
        const initChart = (el: HTMLElement, datas: Array<any>, chart: EChartsType | undefined) => {
            if (!chart) {
                chart = echarts?.init(el)!;
            }
            const option: EChartsOption = {
                color:['#005DA7','#00C9F2','#8C6C4E','#F39702','#E3493E','#231815','#4D5FC1','#45A0E6',],
                legend: {
                  type: "scroll",
                  orient: 'vertical',
                  top: 'middle',
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
                        color:'#3E5463',
                        fontWeight:600
                      },
                      b: {
                        width: 50,
                        padding: [0, 0, 0, 0],
                        color:'#3E5463',
                        fontWeight:600
                      },
                      c: {
                        width: 80,
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
                  data: datas.map((item) => item.name),
                  formatter: (name: string) => {
                    let total = 0;
                    let tarValue: number = 0; // 为 tarValue 赋一个默认值
                    for (let i = 0; i < datas.length; i++) {
                        total += datas[i].value;
                        if (name === datas[i].name) {
                            tarValue = datas[i].value;
                        }
                    }
                    const p = total !== 0 ? ((tarValue / total) * 100).toFixed(2) : '-';
                    let n = name.length>4? name.substring(0,4)+'...':name
                    return `{c|${n}} {b|${tarValue}万元} {a| ${p}}%`;
                }
                },
                tooltip: {
                  formatter: '{b} : {c}  ({d}%)'
                },
                series: [
                   {
                        radius: ['35%', '45%'],
                        center: ['17%', '50%'],
                        type: 'pie',
                        //roseType: 'radius',
                        emphasis: {
                            label: {
                                show: true
                            }
                        },
                        label: {
                            show: false,
                            position: 'center',
                            color: '#4c4a4a',
                            formatter(data) {
                                return `{total|${data.value}万元}`
                            },
                            rich: {
                                total: {
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
                            borderWidth: 2,

                        },
                        data: datas
                    },
                ]
            }
            chart?.setOption(option)
        }

        const initChart2 = (el: HTMLElement, datas: Array<any>, chart: EChartsType | undefined) => {
            if (!chart) {
                chart = echarts?.init(el);
            }
            const option: EChartsOption = {
                color:['#005DA7','#00C9F2','#8C6C4E','#F39702','#E3493E','#231815','#4D5FC1','#45A0E6'],
                legend: {
                    show:false,
                    orient: 'vertical',
                    top: 'center',
                    right: '6%',
                    textStyle: {
                        color: "#3E5463",
                        fontSize: 14,
                        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                    },
                    itemWidth: 10,
                    itemHeight: 6,
                    itemGap: 10,
                    icon: "rect",
                    pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
                    pageIconSize: 12,  //当然就是按钮的大小
                    pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
                    tooltip: {
                        show: true
                    },
                    data: datas.map((item) => item.name),
                    },
                    tooltip: {
                    formatter: '{b} : {c} 万元 ({d}%)'
                    },
                    series: [
                    {
                        // name: "",
                        type: "pie",
                        radius: ["28%", "38%"],
                        center: ['50%', '50%'],
                        labelLine: {
                        length: 18,//第一段线长
                        length2: 60, //第二段线长
                        lineStyle: {
                            width: 1,
                            type: 'solid',
                            color: '#005DA7'
                        }
                        },
                        label: {
                        // formatter: function(pram:any){
                        //     return '{a|'+pram.data.type+' '+pram.percent+'% }'
                        // },
                        formatter: '{name|{b}: }{num|{c}万元}\n\n{zb|{d}%}',
                        padding: [0, -80, -5, -80],
                        rich: {
                            name: {
                                fontSize: 14,
                                color: '#203449'
                            },
                            num: {
                                fontSize: 14,
                                color: '#203449'
                            },
                            zb: {
                                fontSize: 16,
                                color: '#203449'
                            }

                        },
                        },
                        data: datas,
                    },
                    ],
            }
            chart?.setOption(option)
        }
        const rightObj = instanceManager.get('rightObj')
        watch(rightObj, (vv) => {
            nextTick(() => {
                initChart(topChart.value, vv.datas2.distributePie, topChartInstence)
                initChart2(bottomChart.value, vv.datas2.poorPie, bottomChartInstence)
            })
        })

        onMounted(() => {
            nextTick(() => {
                initChart(topChart.value, [], topChartInstence)
                initChart2(bottomChart.value, [], bottomChartInstence)
            })

        })
        return () => {
            return <div class='LoanSupplement' {...content.attrs}>
                <section class='sch-right'>
                    <c-title title="特征分析" class='mg-b10' />
                    <div class='sch-chart'>
                        <div class='sch-r-top'>
                            <div class="c-title">{rightObj.value.title}</div>
                            <div class="list-item flex-start" >
                                <div class="tag" style="background: #45a0e6;">
                                    趋势
                                </div>
                                <div>
                                    <div class="msg-box msg-box-txt">
                                        {rightObj.value.countAvgRatioTxtTop}<span class="bold">{ trendMapList[rightObj.value.datas2.trendMap.moneyTrend] }</span>  平均同比增长率 <span class="bold">{ rightObj.value.datas2 ? rightObj.value.datas2.trendMap.moneyAvgRatio : 0}%</span>
                                    </div>
                                    <div class="msg-box msg-box-txt">
                                        {rightObj.value.countAvgRatioTxtBottom}<span class="bold">{ trendMapList[rightObj.value.datas2.trendMap.countTrend] }</span>  平均同比增长率 <span class="bold">{ rightObj.value.datas2 ? rightObj.value.datas2.trendMap.countAvgRatio : 0}%</span>
                                    </div>
                                    {/* <div class="msg-box msg-box-txt" >
                                        <span class="bold">80.21%</span> 缺勤人次集中在 <span class="bold">08:00~9:45</span>
                                    </div> */}
                                </div>
                            </div>
                            <div class="list-item flex-start" >
                                <div class='flex-start item-box'>
                                    <div class="tag" style="background: #005DA7;">
                                    分布
                                    </div>
                                    <div class="msg-box">
                                        {rightObj.value.mainTypeTxt} <span class="bold" title={rightObj.value.mainTypeTxtContent}>{rightObj.value.mainTypeTxtContent.length > 5 ? rightObj.value.mainTypeTxtContent.slice(0,3) +'..': rightObj.value.mainTypeTxtContent}</span>
                                    </div>
                                </div>
                                <div class='flex-start item-box'>
                                    <div class="tag" style="background: #B22924;">
                                    差异
                                    </div>
                                    <div class="msg-box">
                                        {rightObj.value.mainPersonTxt} <span class="bold">{rightObj.value.mainPersonTxtContent}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chart-box" style="background: #F7F7F7;padding:10px">
                            <div class='w50'>
                              <div class="chart-pie" ref={topChart}></div>
                            </div>
                            <div class='w50'>
                              <div class="chart-pie" ref={bottomChart}></div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        }
    }
})

const Scholarship = defineComponent({
    props: {
        direction: {
            type: String as PropType<'horizontal' | 'vertical'>,
            default: 'horizontal'
        },
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        }
    },
    setup(props, content) {
        return () => {
            return <div
                class={{
                    'scholarship': true,
                    'flex': true,
                    'horizontal': props.direction === 'horizontal',
                    'vertical': props.direction === 'vertical'
                }}
            >
                <LeftView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}
                     params={props.params}
                     {...content.attrs}
                />
                <RightView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}
                />
            </div>
        }
    }
})

Scholarship.Left = LeftView
Scholarship.Right = RightView
export default Scholarship