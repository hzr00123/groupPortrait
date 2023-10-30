import { computed, defineComponent, getCurrentInstance, inject, nextTick, onMounted, onUnmounted, PropType, provide, reactive, Ref, ref, unref, watch } from "vue";
import { BaseParams } from "../../types";
import RedTab from "@/components/common/RedTab.vue";
import './styles/MilitaryTraining.scss'
import InstanceManager, { getImageUrl } from "@/utils";
import ColorCard from '@/components/common/ColorCard.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import { PagesType, requestResType, searchConfigType } from "@/components/Table-plus";
import { getOrgType } from "@/api/modules/emphasisList";
import { ElLink } from "element-plus";
import { getAllChartData } from "@/api/modules/studentPortrait";
import { EChartsType, EChartsOption } from "echarts";

const LeftView = defineComponent({
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        selectList: {
            type: Array as PropType<any[]>,
            default: () => [
                {
                    value: 'overview3',
                    label: "总览"
                },
                {
                    value: 'Student_Union_Activities',
                    label: "学生会活动"
                },
                {
                    value: 'Club_activities',
                    label: "社团活动"
                },
                {
                    value: 'Problem_entertainment_activities',
                    label: "文体娱乐活动"
                }
            ]
        }
    },
    setup(props, ctx) {
        const btnList = reactive(props.selectList)
        const isActive = ref(btnList[0].value as string)
        const tableVisible = ref(false)
        const chartRef = ref<HTMLElement>()
        const instence = getCurrentInstance()
        const echarts = instence?.proxy?.$echarts
        const chartInstance = ref<EChartsType>()
        const colorConfig = reactive([
            {
                ident: 'awardCount',
                color: '#B22924',
                title: computed(()=>{
                    const label = btnList.find(i => i.value === isActive.value).label
                    return label + '数量';
                }),
                value: '-',
                isUnit: true,
                icon: getImageUrl('hjrs-icon'),
                unit: '次',
                width: '200px',
                isClick: true
            },
            {
                ident: 'awardCount',
                color: '#45A0E6',
                title: '参与人次',
                value: '-',
                isUnit: true,
                icon: getImageUrl('hjrs-icon'),
                unit: '人次',
                width: '155px'
            },
            {
                ident: 'awardCount',
                color: '#4D5FC1',
                title: '参与人数',
                value: '-',
                isUnit: true,
                icon: getImageUrl('hjrs-icon'),
                unit: '人',
                width: '155px',
                isClick: true
            }
        ])

        const ColorCardClick = () => {
            tableVisible.value = true
        }

        const columns = [
            {
                slot: 'index',
                label: '序号',
                width: '60',
                align: 'center'
            },
            {
                prop: 'name',
                label: '姓名',
                width: 100,
                align: 'center'
            },
            {
                prop: 'sex',
                label: '性别',
                width: 80,
                align: 'center'
            },
            {
                prop: 'user_name',
                label: '学号',
                align: 'center'
            },
            {
                prop: 'campus_name',
                label: '校区',
                align: 'center'
            },
            {
                prop: 'college_name',
                label: '学院',
                align: 'center'
            },
            {
                prop: 'major_name',
                label: '专业',
                align: 'center'
            },
            {
                prop: 'grade_name',
                label: '年级',
                align: 'center'
            },
            {
                prop: 'className',
                label: '班级',
                align: 'center'
            },
            {
                prop: 'type',
                label: '类型',
                align: 'center'
            },
            {
                prop: 'res',
                label: '测评结果',
                align: 'center'
            },
            {
                slot: 'action',
                label: '操作',
                fixed: 'right',
                align: 'center',
                width: '150px'
            }
        ]
        const paramsObj = {
            campusId: 'stuCampusId',
            collegeId: 'stuCollegeId',
            majorId: 'stuMajorId',
            gradeId: 'stuGradeId',
            classId: 'stuClassId'
        }
        const searchConfig: searchConfigType = [
            {
                type: 'select',
                label: '性别',
                inputWidth: '80px',
                labelWidth: '40px',
                key: 'stuSex',
                options: [{ label: '男', value: '男' }, { label: '女', value: '女' }]
            },
            {
                type: 'select',
                label: '校区',
                inputWidth: '120px',
                labelWidth: '40px',
                key: 'stuCampusId',
                request: getOrgType as any,
                reqKey: 'campusOrgList',
                opKey: 'id',
                opLabel: 'orgName',
                params: paramsObj,
                target: ['stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId']
            },
            {
                type: 'select',
                label: '学院',
                inputWidth: '120px',
                labelWidth: '40px',
                key: 'stuCollegeId',
                request: getOrgType as any,
                reqKey: 'collegeOrgList',
                target: ['stuMajorId', 'stuGradeId', 'stuClassId'],
                opKey: 'id',
                opLabel: 'orgName',
                params: paramsObj
            },
            {
                type: 'select',
                label: '专业',
                inputWidth: '120px',
                labelWidth: '40px',
                key: 'stuMajorId',
                request: getOrgType as any,
                reqKey: 'majorOrgList',
                target: ['stuGradeId', 'stuClassId'],
                opKey: 'id',
                opLabel: 'orgName',
                params: paramsObj
            },
            {
                type: 'select',
                label: '年级',
                inputWidth: '120px',
                labelWidth: '40px',
                key: 'stuGradeId',
                request: getOrgType as any,
                reqKey: 'gradeOrgList',
                target: ['stuClassId'],
                opKey: 'id',
                opLabel: 'orgName',
                params: paramsObj
            },
            {
                type: 'select',
                label: '班级',
                inputWidth: '120px',
                labelWidth: '40px',
                key: 'stuClassId',
                request: getOrgType as any,
                reqKey: 'classOrgList',
                opKey: 'id',
                opLabel: 'orgName',
                params: paramsObj
            },
            {
                type: 'input',
                placeholder: '请输入姓名,学号搜索',
                label: '',
                inputWidth: '160px',
                key: 'name'
            }
        ]

        const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
            console.log(params, pages);

            return Promise.resolve({
                code: 1,
                data: { total: 0, rows: [] },
                datas: null,
                datas2: null,
                info: '',
                msg: ''
            })
        }

        const exportEvt = async (form: any, pages: PagesType) => {
            // const res = await exportWarnStuList({
            //   ...omit(params, ['endTime', 'startTime']),
            //   ...form,
            //   id: tableConfig.id,
            //   pageNum: pages.current,
            //   pageSize: pages.size,
            //   ident: props.ident,
            //   expExcel: true
            // })
            // downloadFile(res)
        }

        const initPieChart = (el: Ref<HTMLElement | undefined>, datas: Array<any>, chart: Ref<EChartsType | undefined>) => {
            if(!unref(el)) return
            chart.value = echarts?.init(unref(el)!)!;
            const colors = ['#005DA7', '#00C9F2', '#F39702', '#E3493E', '#231815', '#45A0E6', '#4D5FC1', '#8C6C4E'];
            //模拟数据 
            datas = [
                {
                  "name": "社会实践",
                  "value": 78
                },
                {
                  "name": "科创活动",
                  "value": 52
                },
                {
                  "name": "课外培训",
                  "value": 31
                },
                {
                  "name": "思想成长",
                  "value": 38
                },
                {
                  "name": "实践实习",
                  "value": 45
                }
              ]
            const option: EChartsOption = {
                color: colors,
                legend: {
                    type: "scroll",
                    orient: 'vertical',
                    top: 'middle',
                    right: '10%',
                    bottom: '0%',
                    textStyle: {
                        color: "#3E5463",
                        fontSize: 14,
                        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                        rich: {
                            a: {
                                padding: [0, 8, 0, 8],
                            },
                        },
                    },
                    itemWidth: 10,
                    itemHeight: 6,
                    itemGap: 10,
                    icon: "rect",
                    tooltip: {
                        show: true
                    },
                    data: datas.map((item) => item.name),
                    formatter: function (name: string) {
                        let total = 0;
                        let tarValue: number = 0;
                        for (let i = 0; i < datas.length; i++) {
                            total += datas[i].value;
                            if (name === datas[i].name) {
                                tarValue = datas[i].value;
                            }
                        }
                        // let p = total ? Math.round((tarValue! / total) * 100) : 0;
                        return `${name}{a|${tarValue}人}`;
                    },

                },
                tooltip: {
                    formatter: '{b} : {c} 人 ({d}%)'
                },
                series: [
                    {
                        radius: ['75%', '90%'],
                        center: ['30%', '50%'],
                        type: 'pie',
                        //roseType: 'radius',
                        emphasis: {
                            label: {
                                show: true
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        label: {
                            show: true,
                            position: 'center',
                            color: '#4c4a4a',
                            formatter() {
                                const num = datas.reduce((pre, cur)=>{
                                    return pre+= cur.value
                                }, 0)
                                return  `{text|${num}次}`
                            },
                            rich: {
                                text: {
                                    fontSize: 22,
                                    width: 150,
                                    fontWeight: 'bold',
                                    align: 'center',
                                }
                            },
                        },
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 2,

                        },
                        data: datas
                    },
                ]
            }
            chart.value?.setOption(option)
        }
        const initLineChart = (el: Ref<HTMLElement | undefined>, datas: [Array<any>, Array<any>], chart: Ref<EChartsType | undefined>, xAxis: string[]) => {
            if(!unref(el)) return
            chart.value = echarts?.init(unref(el)!)!;
            //模拟数据 
            datas = [[10, 50, 90, 60, 20, 80], [40, 99, 55, 63,54, 69]]
            xAxis = ['202201', '202202', '202203', '202204', '202205', '202206']
            const option: EChartsOption = {
                title: {
                  text: '单位: 次',
                  top: '5%',
                  left: 0,
                  textStyle: {
                    color: '#333333',
                    fontSize: 14,
                  }
                },
                legend: {
                    type: "plain",
                    show: true,
                    orient: 'horizontal',
                    top: 15,
                    left: '10%',
                    textStyle: {
                        color: "#3E5463",
                        fontSize: 14,
                        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                    },
                    itemWidth: 10,
                    itemHeight: 6,
                    itemGap: 10,
                    icon: "rect",
                },
                tooltip: {
                  trigger: 'axis'
                },
                grid: {
                  top: '20%',
                  left: 0,
                  right: '3%',
                  bottom: '4%',
                  containLabel: true
                },
                xAxis: [
                  {
                    type: 'category',
                    data: xAxis,
                    axisTick: { //刻度
                      alignWithLabel: true,
                      show: false,
                    },
                    triggerEvent: true,
                  }
                ],
                yAxis: [
                  {
                    type: 'value',
                    axisLine: { show: false },
                    splitLine: {
                      show: true,
                      lineStyle: {
                        type: 'dashed'
                      }
                    }
                  },
                ],
                series: [
                  // ..._servs,
                  {
                  type: 'bar',
                  name: '活动数量',
                  barWidth: '20%',
                  data: datas[0],
                  itemStyle: {
                    color: '#45A0E6',
                    borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
                  },
                  markLine: {
                    symbol: 'none',
                    lineStyle: {
                      color: 'blue',
                      type: 'solid',
                      width: 4,
                    }
                  }
                },
                  {
                    type: 'line',
                    name: '参与人次',
                    smooth: true,
                    symbol: 'none',
                    itemStyle: {
                        color: '#E3493E',
                    },
                    data: datas[1],
                  },
                ]
              };
            chart.value?.setOption(option)
        }

        watch(isActive, v => {
            nextTick(()=>{
                if(v === 'overview3'){
                    initPieChart(chartRef, [], chartInstance)
                } else {
                    initLineChart(chartRef, [[], []], chartInstance, [])
                }
            })
        }, { immediate: true })
        const renderView = () => {
            if (isActive.value === 'overview3') {
                return <>
                    <div style={{height: '250px'}} ref={chartRef} />
                </>
            } else {
                return <div style={{height: '350px'}} ref={chartRef} key={isActive.value}/>
            }
        }
        const instanceManager = inject<InstanceManager>('InstanceManager')
        onMounted(() => {
            instanceManager?.register('leftActive', isActive)
            instanceManager?.register('label', computed(()=> btnList.find(i => i.value === isActive.value).label))
        })
        return () => {

            return (
                <div class={'military-left h100'} {...ctx.attrs}>
                    <div class={'flex align-items-c just-b mg-b20'}>
                        <c-title title={'基本信息画像'}></c-title>
                        <RedTab 
                            btnList={btnList}
                            isRed={false}
                            isActive={isActive.value}
                            onRedTabChange={(v: string) => isActive.value = v}
                            class='mg-b20'
                        />
                    </div>
                    <div class={'flex just-a mg-b20'}>
                        {
                            colorConfig.map(i => {
                                return <ColorCard cardConfig={i} onClick={i.isClick && ColorCardClick} style={{ cursor: i.isClick ? 'pointer' : 'default' }} />
                            })
                        }
                    </div>
                    {renderView()}
                    <c-table-plus
                        columns={columns}
                        request={tableRequest}
                        searchConfig={searchConfig}
                        visible={tableVisible.value}
                        title={'军训参与情况'}
                        dialogWidth="1460px"
                        height="350px"
                        closed={() => tableVisible.value = false}
                        exportBtn={exportEvt}
                        v-slots={{
                            index: (info: { data: { $index: number } }) => info.data.$index + 1,
                            action: (_data: any) => <ElLink type="primary">学生个像</ElLink>
                        }}
                    >
                    </c-table-plus>
                </div>
            )
        }
    }
})

const RightView = defineComponent({
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        }
    },
    setup(props, content) {
        // const data = useChildrenData({ ...props.params, ident: 'scholarship' })
        const instence = getCurrentInstance()
        const echarts = instence?.proxy?.$echarts
        const leagueChart = ref()
        const leagueChartInstance = ref<EChartsType>()
        const leaguePie = ref([])
        const initChart = (el: Ref<HTMLElement>, datas: Array<any>, chart: Ref<EChartsType | undefined>, text: string) => {
            if(!unref(el)) return
            chart.value = echarts?.init(unref(el))!;
            const colors = ['#005DA7', '#00C9F2', '#F39702', '#E3493E', '#231815', '#45A0E6'];
            //模拟数据 
            datas = [
                {
                  "name": "0次",
                  "value": 4
                },
                {
                  "name": "1~3次",
                  "value": 5
                },
                {
                  "name": "4~6次",
                  "value": 3
                },
                {
                  "name": "7~9次",
                  "value": 3
                },
                {
                  "name": "10次以上",
                  "value": 4
                }
              ]
            const option: EChartsOption = {
                color: colors,
                title: {
                    bottom: 0,
                    left: '20%',
                    text,
                    textStyle: {
                        fontSize: 16,
                        width: 150,
                        align: 'center',
                    },
                },
                legend: {
                    type: "scroll",
                    orient: 'vertical',
                    top: 'middle',
                    right: '10%',
                    bottom: '0%',
                    textStyle: {
                        color: "#3E5463",
                        fontSize: 14,
                        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                        rich: {
                            a: {
                                padding: [0, 8, 0, 8],
                            },
                        },
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
                    formatter: function (name: string) {
                        let total = 0;
                        let tarValue: number = 0;
                        for (let i = 0; i < datas.length; i++) {
                            total += datas[i].value;
                            if (name === datas[i].name) {
                                tarValue = datas[i].value;
                            }
                        }
                        // let p = total ? Math.round((tarValue! / total) * 100) : 0;
                        return `${name}{a|${tarValue}人}`;
                    },

                },
                tooltip: {
                    formatter: '{b} : {c} 人 ({d}%)'
                },
                series: [
                    {
                        radius: ['45%', '70%'],
                        center: ['30%', '50%'],
                        type: 'pie',
                        //roseType: 'radius',
                        emphasis: {
                            label: {
                                show: true
                            }
                        },
                        labelLine: {
                            show: true,
                            showAbove: true,
                            length: 15,//第一段线长
                            length2: 60, //第二段线长
                            lineStyle: {
                                width: 1,
                                type: 'solid',
                                color: '#005DA7'
                            }
                        },
                        label: {
                            show: true,
                            position: 'outside',
                            color: '#4c4a4a',
                            formatter(data) {
                                return `{total|${data.percent}%}`
                            },
                            rich: {
                                total: {
                                    fontSize: 16,
                                    color: '#203449',
                                }
                            },
                            padding: [0, -30, 20, -30],
                        },
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 2,

                        },
                        data: datas
                    },
                ]
            }
            chart.value?.setOption(option)
        }

        watch(props, () => {
            getAllChartData({ ...props.params, ident: 'military_training' }).then((res: any) => {
                console.log(11111111, res);

                // moneyMax.value = res.datas2.moneyMax
                // levelMax.value = res.datas2.levelMax
                // levelPie.value = res.datas2.levelPie
                // moneyPie.value = res.datas2.moneyPie
                // nextTick(() => {
                //     initChart(topChart.value, levelPie.value, topChartInstence, `参与率 ${levelMax.value || 0}%` )
                //     initChart(bottomChart.value, moneyPie.value, bottomChartInstence, `军训合格率 ${levelMax.value || 0}%` )
                // })
            })
        }, { immediate: true, deep: true })

        const instanceManager = inject<InstanceManager>('InstanceManager')

        watch(instanceManager!.get('leftActive'), v => {
            nextTick(()=>{
                initChart(leagueChart, leaguePie.value, leagueChartInstance, '')
            })
        }, { immediate: true })

        onUnmounted(() => {
            instanceManager?.clear('leftActive')
            instanceManager?.clear('label')
        })
        const progressBarOpt = reactive({
            list: [
                {
                    name: '第一次活动',
                    rate: 20,
                    value: 20,
                },
                {
                    name: '第一次活动',
                    rate: 20,
                    value: 20,
                },
                {
                    name: '第一次活动',
                    rate: 20,
                    value: 20,
                },
            ],
            height: '450px',
            color: '#005DA7',
            lableWidth: 148,
            needTag: true,
            valuePosition: 'right',
            lableAlign: 'right',
            unit: '人'
        })
        const renderView = () => {
            const active = instanceManager!.get('leftActive')
            const label = instanceManager!.get('label')
            
            function getLabel(str: string, pre: boolean){
                 switch (active.value) {
                    case 'overview3':
                        if(pre) return str + '校园活动'
                        return '校园活动' + str;
                    default:
                        if(pre) return str + label.value
                        return label.value + str;
                }
            }
            return <section class='sch-right' key={active.value}>
                    <c-title title="特征分析" class='mg-b10' />
                    <div class='sch-chart'>
                        <div class='sch-r-top'>
                            <div class="c-title">{ getLabel('参与频次', false) }</div>
                            <div class='chart' ref={leagueChart} />
                            <div style={{textAlign: 'center'}}>参与率 100.00%  主要参与次数分布 1~3次</div>
                        </div>
                        <div class='sch-r-bottom'>
                            <div class="c-title">{ getLabel('热门', true) }</div>
                            <div class={'flex just-c mg-b20'}>
                                <ProgressBar option={progressBarOpt} style="max-height: 125px;overflow: auto; width: 80%;" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                热门活动Top3 <strong style={{fontWeight: 'bold'}}>第一次党团校活动、第二次党团校活动、第三次党团校活动</strong>
                            </div>
                        </div>
                    </div>
                </section>
        }
        return () => {
            return <div class='military-right h100' {...content.attrs}>
                {renderView()}
            </div>
        }
    }
})


const Campus = defineComponent({
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
    setup(props, ctx) {
        provide('InstanceManager', new InstanceManager())

        return () => {
            return (
                <div
                    class={{
                        'military': true,
                        'flex': true,
                        'horizontal': props.direction === 'horizontal',
                        'vertical': props.direction === 'vertical'
                    }}
                >
                    <LeftView
                        class={{
                            'w49': props.direction === 'horizontal',
                            'w100': props.direction === 'vertical'
                        }}
                        params={props.params}
                        {...ctx.attrs}
                    />
                    <RightView
                        class={{
                            'w49': props.direction === 'horizontal',
                            'w100': props.direction === 'vertical'
                        }}
                        params={props.params}
                    />
                </div>
            )
        }
    }
})

Campus.Left = LeftView
Campus.Right = RightView

export default Campus