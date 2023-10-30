import { defineComponent, getCurrentInstance, inject, nextTick, onMounted, onUnmounted, PropType, provide, reactive, Ref, ref, unref, watch } from "vue";
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
                    value: 'military_training',
                    label: "军训"
                },
                {
                    value: 'Party_and_Youth_League_School',
                    label: "党团校"
                },
                {
                    value: 'Collective_activities',
                    label: "集体活动"
                },
            ]
        }
    },
    setup(props, ctx) {
        const btnList = reactive(props.selectList)
        const isActive = ref(btnList[0].value as string)
        const tableVisible = ref(false)
        const colorConfig = reactive({
            ident: 'awardCount',
            color: '#45A0E6',
            title: '参与人数',
            value: '-',
            isUnit: true,
            icon: getImageUrl('hjrs-icon'),
            unit: '人',
            width: '220px',
            isClick: true
        })
        const LeagueCfg_l = reactive({
            ident: 'awardCount',
            color: '#4D5FC1',
            title: '活动次数',
            value: '-',
            isUnit: true,
            icon: getImageUrl('hjrs-icon'),
            unit: '次',
            width: '220px'
        })
        const LeagueCfg_r = reactive({
            ident: 'awardCount',
            color: '#B22924',
            title: '参与人次',
            value: '-',
            isUnit: true,
            icon: getImageUrl('hjrs-icon'),
            unit: '人次',
            width: '220px',
            isClick: true
        })
        /**
         * 按学院，按专业
         */
        const type = ref('按学院')

        const progressBarOpt = reactive({
            list: [
                {
                    name: '马克思主义学院',
                    rate: 20,
                    value: 20,
                },
                {
                    name: '马克思主义学院',
                    rate: 20,
                    value: 20,
                },
                {
                    name: '马克思主义学院',
                    rate: 20,
                    value: 20,
                },
            ],
            height: '450px',
            color: '#005DA7',
            lableWidth: 148,
            lableAlign: 'right',
            unit: '%'
        })

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

        const renderView = () => {
            if (isActive.value === 'military_training') {
                return <>
                    <div class={'flex just-c mg-b20'}>
                        <ColorCard cardConfig={colorConfig} onClick={ColorCardClick} style={{ cursor: colorConfig.isClick ? 'pointer' : 'default' }} />
                    </div>
                    <div class={'flex-end mg-b20'}>
                        <RedTab btnList={[
                            { label: '按学院', value: '按学院' },
                            { label: '按专业', value: '按专业' },
                        ]}
                            isRed={true}
                            isActive={type.value}
                            onRedTabChange={(v: string) => type.value = v}
                        />
                    </div>
                    <ProgressBar option={progressBarOpt} style="max-height: 310px;overflow: auto;" />
                    <div class="list-bottom">
                        学校平均
                    </div>
                </>
            }
            const act = ['Party_and_Youth_League_School', 'Collective_activities']
            if (act.includes(isActive.value)) {
                return <>
                    <div class={'flex just-c mg-b50'}>
                        <ColorCard cardConfig={LeagueCfg_l}/>
                        <ColorCard cardConfig={LeagueCfg_r} onClick={ColorCardClick} style={{ cursor: 'pointer', marginLeft: '50px'}} />
                    </div>
                    <c-table-plus 
                        dialog={false}
                        style={{maxHeight: '300px'}}
                        searchConfig={[]}
                        size='small'
                        columns={[
                            {
                                prop: 'name',
                                label: '排名',
                                slot: 'name',
                                width: 80,
                                align: 'center'
                            },
                            {
                                prop: 'des',
                                label: '活动',
                                width: 275,
                                align: 'center'
                            },
                            {
                                prop: 'num',
                                label: '参与人数',
                                align: 'center'
                            },
                            {
                                prop: 'time',
                                label: '时间',
                                width: 120,
                                align: 'center'
                            },
                        ]}
                        request={(params: any, pages: PagesType): Promise<requestResType> => {
                            const list = []
                            for (let index = 1; index < 6; index++) {
                                list.push({
                                    name: 1,
                                    des: '第' + index+'次党团校活动',
                                    num: 1000 + index,
                                    time: '2022-09-0' + index
                                })
                            }
                            return Promise.resolve({
                                code: 1,
                                data: { total: 5, rows: list },
                                datas: null,
                                datas2: null,
                                info: '',
                                msg: ''
                            })
                        }}
                        v-slots={{
                            name: (info: { data: { $index: number, name: number } }) => (
                                <span 
                                    style={{
                                        background: '#B22924',
                                        color: '#fff',
                                        padding: '0 5px',
                                        opacity: 1- info.data.$index / 10
                                    }}>
                                    {info.data.name}
                                </span>
                            ),
                        }}
                    ></c-table-plus>
                </>
            }
        }
        const instanceManager = inject<InstanceManager>('InstanceManager')
        onMounted(() => {
            instanceManager?.register('leftActive', isActive)
        })
        return () => {

            return (
                <div class={'military-left h100'} {...ctx.attrs}>
                    <div class={'flex align-items-c just-b mg-b20'}>
                        <c-title title={'基本信息画像'}></c-title>
                        <RedTab btnList={btnList}
                            isRed={false}
                            isActive={isActive.value}
                            onRedTabChange={(v: string) => isActive.value = v}
                        />
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
        const levelPie = ref([])
        const moneyPie = ref([])
        const moneyMax = ref('')
        const levelMax = ref('')
        const instence = getCurrentInstance()
        const echarts = instence?.proxy?.$echarts
        const topChartInstence = ref<EChartsType>()
        const bottomChartInstence = ref<EChartsType>()
        const topChart = ref()
        const bottomChart = ref()
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
            if(v === 'military_training'){
                nextTick(() => {
                    initChart(topChart, levelPie.value, topChartInstence, `参与率 ${levelMax.value || 0}%`)
                    initChart(bottomChart, moneyPie.value, bottomChartInstence, `军训合格率 ${levelMax.value || 0}%`)
                })
            } else {
                nextTick(()=>{
                    initChart(leagueChart, leaguePie.value, leagueChartInstance, '')
                })
            }
        }, { immediate: true })

        onUnmounted(() => {
            instanceManager?.clear('leftActive')
        })
        const progressBarOpt = reactive({
            list: [
                {
                    name: '第一次党团校活动',
                    rate: 20,
                    value: 20,
                },
                {
                    name: '第一次党团校活动',
                    rate: 20,
                    value: 20,
                },
                {
                    name: '第一次党团校活动',
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
            if (active.value === 'military_training') {
                return <section class='sch-right'>
                    <c-title title="特征分析" class='mg-b10' />
                    <div class='sch-chart'>
                        <div class='sch-r-top'>
                            <div class="c-title">军训</div>
                            <div class='chart' ref={topChart} />
                        </div>
                        <div class='sch-r-bottom'>
                            <div class='chart' ref={bottomChart} />
                        </div>
                    </div>
                </section>
            }
            const act = ['Party_and_Youth_League_School', 'Collective_activities']
            if (act.includes(active.value)) {
                const titles = []
                if (active.value !== 'Collective_activities') {
                    titles.push('党团校活动参与情况', '热门党团活动')
                } else {
                    titles.push('集体活动参与情况', '热门集体活动')
                }
                return <section class='sch-right' key={active.value}>
                        <c-title title="特征分析" class='mg-b10' />
                        <div class='sch-chart'>
                            <div class='sch-r-top'>
                                <div class="c-title">{ titles[0] }</div>
                                <div class='chart' ref={leagueChart} />
                                <div style={{textAlign: 'center'}}>参与率 100.00%  主要参与次数分布 1~3次</div>
                            </div>
                            <div class='sch-r-bottom'>
                                <div class="c-title">{ titles[1] }</div>
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
        }
        return () => {
            return <div class='military-right h100' {...content.attrs}>
                {renderView()}
            </div>
        }
    }
})


const MilitaryTraining = defineComponent({
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

MilitaryTraining.Left = LeftView
MilitaryTraining.Right = RightView

export default MilitaryTraining