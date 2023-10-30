import { exportGetChartDataDetail, getChartDataDetail } from '@/api/modules/studentPortrait'
import { Column } from '@/components/Table'
import { PagesType, requestResType, searchConfigType } from '@/components/Table-plus/index.d'
import WarningSeal from '@/components/WarningSeal'
import { BaseParams } from '@/components/group-image/types'
import { downloadFile, usePortraitRequest } from '@/hooks'
import InstanceManager from '@/utils'
import { ElProgress } from 'element-plus'
import { PropType, defineComponent, getCurrentInstance, onMounted, reactive, ref, watch, nextTick, onUnmounted, inject, provide, toRefs } from 'vue'
import '../../index.scss'

const CareerPlanning = defineComponent({
    name: 'careerPlanning',
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        direction: {
            type: String as PropType<'horizontal' | 'vertical'>,
            default: 'horizontal'
        }
    },
    setup(props, content) {
        provide('params', props.params)
        provide('InstanceManager', new InstanceManager())
        return () => {
            return <div class={{
                'career-planning': true,
                'scholarship': true,
                'flex': true,
                'horizontal': props.direction === 'horizontal',
                'vertical': props.direction === 'vertical'
            }}>
                <LeftView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}/>
                <RightView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }} />
            </div>
        }
    }
})

const LeftView = defineComponent({
    setup(props, content) {
        const params = inject<BaseParams>('params',  {} as any);
        const instanceManager = inject<InstanceManager>('InstanceManager')
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts;
        const visible = ref<boolean>(false);
        const activityData = ref([])
        const courseData = ref([])
        const response = ref({})
        const totalNum1 = ref<number>(0)
        const totalNum2 = ref<number>(0)
        const category = ref<string>('activity')
        const title = ref<string>('')
        const searchConfig: searchConfigType = reactive([
            {
              type: 'input',
              placeholder: '活动名称',
              label: '',
              inputWidth: '160px',
              key: 'name'
            }
        ])
        let columns: Column = [
            {
                slot: 'index',
                label: '序号',
                width: '60',
                align: 'center'
            },
            {
                prop: 'count',
                label: '参与人数',
                align: 'center'
            },
            {
                prop: 'time',
                label: '时间',
                align: 'center'
            }
        ]

        const initCharts1 = () => {
            const el: HTMLElement = instance?.refs.charts1 as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data: any[] = activityData.value;
            let option = {
            title: {
                show: true,
                text: `${totalNum1.value}场`,
                x: 'center',
                left: '27%',
                y: 'center',
            },
            color:['#00C9F2','#E3493E','#005DA7'],
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
                    // width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                    },
                    b: {
                    width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
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
                return `{c|${name}} {b|${tarValue} 场} {a| ${p}} %`;
            }

            },
            tooltip: {
                formatter: '{b} : {c}场  ({d}%)'
            },
            series: [
                {
                z: 2,
                // radius: ['35%', '50%'],
                radius: ['75%', '90%'],
                center: ['30%', '50%'],
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
                    borderWidth: 2,

                },
                data: data
                },
            ]
            }
            myChart?.setOption(option);
            myChart?.off('click');
            myChart?.on('click', (params) => {
                title.value = '职业指导活动参与情况'
                searchConfig[0].placeholder = '活动名称'
                category.value = 'activity'
                columns.splice(1, 0, {
                    prop: 'name',
                    label: '活动名称',
                    align: 'center'
                },)
                visible.value = true
            })
        }

        const initCharts2 = () => {
            const el: HTMLElement = instance?.refs.charts2 as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data: any[] = courseData.value
            let option = {
            title: {
                show: true,
                text: `${totalNum2.value}场`,
                x: 'center',
                left: '27%',
                y: 'center'
            },
            color:['#00C9F2','#E3493E','#005DA7'],
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
                    // width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                    },
                    b: {
                    width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
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
                return `{c|${name}} {b|${tarValue} 场} {a| ${p}}%`;
            }

            },
            tooltip: {
                formatter: '{b} : {c}场  ({d}%)'
            },
            series: [
                {
                z: 2,
                // radius: ['35%', '50%'],
                radius: ['75%', '90%'],
                center: ['30%', '50%'],
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
                    borderWidth: 2,

                },
                data: data
                },
            ]
            }
            myChart?.setOption(option);
            myChart?.off('click');
            myChart?.on('click', (params) => {
                title.value = '职业指导课程参与情况'
                searchConfig[0].placeholder = '课程名称'
                category.value = 'course'
                columns.splice(1, 0, {
                    prop: 'name',
                    label: '课程名称',
                    align: 'center'
                },)
                visible.value = true
            })
        }
        
        const tableRequest = (params1: any, pages: PagesType): Promise<requestResType> => {
            return getChartDataDetail({
                ...params,
                ...params1,
                pageNum: pages.current,
                pageSize: pages.size,
                ident: 'Career_Planning',
                category: category.value,
                startTime: params.startTime,
                endTime: params.endTime
            })
        }

        const exportEvt = async(form: any, pages: PagesType) => {
            const res = await exportGetChartDataDetail({
                ...form,
                category: category.value,
                pageNum: pages.current,
                pageSize: pages.size,
                ident: 'Career_Planning',
                startTime: params.startTime,
                endTime: params.endTime,
                expExcel: true
            })
            downloadFile(res)
        }

        const closed = () => {
            visible.value = false;
            columns = [
                {
                    slot: 'index',
                    label: '序号',
                    width: '60',
                    align: 'center'
                },
                {
                    prop: 'count',
                    label: '参与人数',
                    align: 'center'
                },
                {
                    prop: 'time',
                    label: '时间',
                    align: 'center'
                }
            ]
        }

        instanceManager?.register('CdataSource', response)
        onUnmounted(() => {
            instanceManager?.clear('CdataSource')
        })

        const dataSource = usePortraitRequest({...toRefs(params!) as any, ident: 'Career_Planning', category: '' })

        watch(dataSource, (res) => {
            const { data, datas2 } = res;
            try {
                response.value = datas2;
                totalNum1.value = 0 
                totalNum2.value = 0 
                activityData.value = data.activityData.map((it: any) => {
                    let keys = Object.keys(it)[0]
                    totalNum1.value += it[keys]
                    return {
                        name: keys,
                        value: it[keys]
                    }
                    
                })
                courseData.value = data.courseData.map((it: any) => {
                    let keys = Object.keys(it)[0]
                    totalNum2.value += it[keys]
                    return {
                        name: keys,
                        value: it[keys]
                    }
                    
                })
                nextTick(() => {
                    initCharts1()
                    initCharts2()
                })
            } catch (error) {
                console.log(error);
            }
        })

        return () => {
            return <div class="career-planning-left" {...content.attrs}>
                <WarningSeal name="职业规划" ident="Career_Planning"/>
                { !content.attrs.view && <c-title class="mg-b20" title="基本信息画像" /> }
                <div class="career-planning-charts" ref="charts1"></div>
                <div class="text-hint mg-b30">职业指导活动</div>
                <div class="career-planning-charts" ref="charts2"></div>
                <div class="text-hint">职业指导课程</div>

                <c-table-plus title={title.value}
                dialogWidth="50%"
                height="350px"
                visible={ visible.value }
                searchConfig={ searchConfig }
                columns={ columns }
                request={ tableRequest }
                exportBtn={ exportEvt }
                closed={ closed }
                v-slots={{
                    index:(arg:any) =>{
                        const {data} = arg
                        return <div>{ data.$index + 1 }</div>
                    }
                }}
                >

                </c-table-plus>
            </div>
        }
    }
})

const RightView = defineComponent({
    setup(props, content) {
        const activityList = ref([])
        const instanceManager = inject<InstanceManager>('InstanceManager')
        const courseList = ref([])

        const attendActivityCondition = reactive<{count: number , proportion: number}>({
            count: 0,
            proportion: 0
        })
        const attendCourseCondition = reactive<{count: number , proportion: number}>({
            count: 0,
            proportion: 0
        })

        const dataSource = instanceManager!.get('CdataSource')

        watch(dataSource, (res) => {
            if(res && Object.keys(res).length) {
                try {
                    attendActivityCondition.count = res.attendActivityCondition && res.attendActivityCondition.count
                    attendActivityCondition.proportion = res.attendActivityCondition.proportion && Number(res.attendActivityCondition.proportion.split('%')[0])
                    activityList.value = res.activityTop
                    attendCourseCondition.count = res.attendCourseCondition && res.attendCourseCondition.count
                    attendCourseCondition.proportion = res.attendCourseCondition.proportion && Number(res.attendCourseCondition.proportion.split('%')[0])
                    courseList.value = res.courseTop
                } catch (error) {
                    console.log(error);
                }
            }
        })
        return () => {
            return <div class="career-planning-right" {...content.attrs}>
                <c-title class="mg-b15" title="特征分析" />
                <section>
                    <div class="container-box">
                        <div class="c-title mg-b30">职业指导活动参与情况</div>
                        <div style="display: flex;justify-content: center;">
                            <ElProgress class="Progress-1 mg-b15"  type="circle" width={ 110 } stroke-width={ 10 } color="#B22924" percentage={ attendActivityCondition.proportion }>
                                {{
                                    default:(arg:{percentage:number}) =>{
                                        return <span class="percentage-value" style="color:#B22924;">{ arg.percentage || 0 }<span>%</span></span>
                                    }
                                }}
                            </ElProgress>
                        </div>
                        <p class="hint-text mg-b20"><span class="bold">{attendActivityCondition.count}人</span> 参与活动 占比 <span class="bold">{attendActivityCondition.proportion || 0}%</span></p>
                        <div class="c-title mg-b20">职业指导活动Top5</div>
                        <ul class="branch-progress-bar">
                            {
                                activityList.value.map((it: any, ix: number) => {
                                    return (
                                        <li class="mg-b10">
                                        <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                        <span class="text" title={ it.careerGuidanceName }>{ it.careerGuidanceName }</span>
                                        <div class="progress-bar-box">
                                            <div class="out-rect">
                                            <div class="in-rect" style={{ width: it.proportion }} />
                                            </div>
                                        </div>
                                        <span class="num">{ it.count }人</span>
                                        </li>
                                    )
                                })
                            }
                            <li class="hint-text">职业指导活动Top5 
                                {
                                    activityList.value.map((it:any, ix: number) => {
                                        return (
                                            <span class="bold"> {it.careerGuidanceName}{ix < activityList.value.length - 1 &&  <span>、</span>}</span>
                                        )
                                    })
                                }
                            </li>
                        </ul>
                    </div>
                    <div class="container-box">
                        <div class="c-title mg-b30">职业指导课程参与情况</div>
                        <div style="display: flex;justify-content: center;">
                            <ElProgress class="Progress-2 mg-b15"  type="circle" width={ 110 } stroke-width={ 10 } color="#005DA7" percentage={ attendCourseCondition.proportion }>
                                {{
                                    default:(arg:{percentage:number}) =>{
                                        return <span class="percentage-value" style="color:#005DA7;">{ arg.percentage || 0 }<span>%</span></span>
                                    }
                                }}
                            </ElProgress>
                        </div>
                        <p class="hint-text mg-b20"><span class="bold">{attendCourseCondition.count}人</span> 参与课程 占比 <span class="bold">{attendCourseCondition.proportion || 0}%</span></p>
                        <div class="c-title mg-b20">职业指导课程Top5</div>
                        <ul class="branch-progress-bar">
                            {
                                courseList.value.map((it: any, ix) => {
                                    return (
                                        <li class="mg-b10">
                                        <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                        <span class="text" title={ it.careerGuidanceName }>{ it.careerGuidanceName }</span>
                                        <div class="progress-bar-box">
                                            <div class="out-rect">
                                            <div class="in-rect" style={{ width: it.proportion }} />
                                            </div>
                                        </div>
                                        <span class="num">{ it.count }人</span>
                                        </li>
                                    )
                                })
                            }
                            <li class="hint-text">职业指导课程Top5 
                                {
                                    courseList.value.map((it:any, ix: number) => {
                                        return (
                                            <span class="bold"> {it.careerGuidanceName}{ix < courseList.value.length - 1 &&  <span>、</span>}</span>
                                        )
                                    })
                                }
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        }
    }
})

CareerPlanning.Left = LeftView;
CareerPlanning.Right = RightView;

export default CareerPlanning