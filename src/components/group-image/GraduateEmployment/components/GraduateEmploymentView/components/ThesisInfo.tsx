import { defineComponent, ref, reactive, getCurrentInstance, onMounted, nextTick, watch, onUnmounted, computed, PropType, inject, toRefs } from "vue";
import RedTab from "@/components/common/RedTab.vue";
import ColorCard from '@/components/common/ColorCard.vue';
import BarMultiSegment from '@/components/common/BarMultiSegment.vue';
import { MultiSegmentConf, RedTabConfig } from "@/components/common/Search";
import LiquidFill from "@/components/common/LiquidFill.vue"
import { ElProgress } from "element-plus";
import 'echarts-liquidfill'
import { BaseParams } from "@/components/group-image/types";
import { usePortraitRequest, downloadFile } from "@/hooks";
import { optionsConfig } from "@/components/common/LiquidFill";
import { searchConfigType, requestResType, PagesType } from "@/components/Table-plus/index.d";
import { getOrgType } from "@/api/modules/emphasisList";
import { exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import "../../../index.scss"
import { Column } from "@/components/Table";
import InstanceManager from "@/utils";


const ThesisInfo = defineComponent({
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        direction: {
            type: String as PropType<'horizontal' | 'vertical'>,
            default: 'horizontal'
        },
        isActive: {
            type: String,
            default: 'Paper_Information'
        },
        selectList: {
            type: Array as PropType<RedTabConfig[]>,
            default: () => [
                {
                    label: '论文开题',
                    value: 'Paper_Information'
                },
                {
                    label: '论文预答辩',
                    value: 'Thesis_Proposal'
                },
                {
                    label: '论文评阅',
                    value: 'Paper_Review'
                },
                {
                    label: '论文答辩',
                    value: 'Thesis_Defense'
                },
            ]
        }
    },
    setup(props, content) {
        return () => {
            return <div class={{
                'thesis-info': true,
                'scholarship': true,
                'flex': true,
                'horizontal': props.direction === 'horizontal',
                'vertical': props.direction === 'vertical'
            }}>
                <LeftView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}
                params={ props.params }
                isActive={ props.isActive }
                selectList={ props.selectList }
                />
                <LeftView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}/>
            </div>
        }
    }
})

const LeftView = defineComponent({
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        isActive: {
            type: String,
            default: 'Paper_Information'
        },
        selectList: {
            type: Array as PropType<RedTabConfig[]>,
            default: () => [
                {
                    label: '论文开题',
                    value: 'Paper_Information'
                },
                {
                    label: '论文预答辩',
                    value: 'Thesis_Proposal'
                },
                {
                    label: '论文评阅',
                    value: 'Paper_Review'
                },
                {
                    label: '论文答辩',
                    value: 'Thesis_Defense'
                },
            ]
        }
    },
    setup(props, content) {
        const tabs = reactive(props.selectList);
        
        const instanceManager = inject<InstanceManager>('InstanceManager')
        const active = ref<string>(props.isActive);

        const isRed = ref(true);

        const clsList = [
            {
              value: '按学院',
              label: "按学院"
            },
            {
              value: '按专业',
              label: "按专业"
            }
        ];
        const isClsActive = ref<string>('按学院');
        
        const list = ref([])

        const averageProportion = ref<string>('0%')

        const response = ref({})

        const MajorOption = reactive<MultiSegmentConf>({
            list: [],
            colorList:[
              {
                color: "#F39D12",
                label: "优秀"
              },
              {
                color: "#B22924",
                label: "良好"
              },
              {
                color: "#00C9F2",
                label: "一般"
              },
              {
                color: "#005DA7",
                label: "不合格"
              }
            ],
            unit:'人',
            lableAlign:'right',
            lableWidth:'138px'
        })

        const redTabChange = (value: string) => {
            isClsActive.value = value;
        }

        const handleTab = (value: string) => {
            isClsActive.value = '按学院'
            active.value = value;
        }

        onMounted(() => {
            instanceManager?.register('TthesisStep', active)
            instanceManager?.register('TdataSource', response)
        })
        
        onUnmounted(()=>{
            instanceManager?.clear('TthesisStep')
            instanceManager?.clear('TdataSource')
        })
        
        const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: active, category: isClsActive }, [isClsActive, active])
        watch(dataSource, (res) => {
            if(res) {
                const { data, datas2 } = res
                try {
                    if(active.value == 'Paper_Review') {
                        MajorOption.list = data.value.map((item: any, index: number) => {
                            item.arr.map((it: any, ix: number) => {
                                data.value[index].arr[ix].percentage = it.percentage.split('%')[0];
                            })
                            return item
                        });
                    } else {
                        list.value = data.value;
                        averageProportion.value = data.averageProportion;
                    }
                    response.value = datas2;
                } catch (error) {
                    console.log(error);
                }
            }
        })

        return () => {
            return <>
                <div class="thesisInfo-left" {...content.attrs}>
                    {/* { !content.attrs.view &&
                        <div class="thesisInfo-left-top mg-b20">
                            <div class="step-line-main flex-c">
                                {
                                    tabs.map((it, ix) => {
                                        return (
                                            <><div class={['step-line-step', active.value == it.value ? 'is-step': '']} onClick={() => handleTab(it.value as string)}>
                                                <div class="flex-c">
                                                    <div class="flex-c">
                                                        <div class="flex-c">{ix + 1}</div>
                                                    </div>
                                                </div>
                                                <span class="text">{it.label}</span>
                                            </div>
                                            { tabs.length > ix+1 && <svg-icon class="svg-icon step-line-line" icon-class="icon-line-gradient" />}
                                            </>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    } */}
                    <div class="thesisInfo-left-top mg-b20">
                        <div class="step-line-main flex-c">
                            {
                                tabs.map((it, ix) => {
                                    return (
                                        <><div class={['step-line-step', active.value == it.value ? 'is-step': '']} onClick={() => handleTab(it.value as string)}>
                                            <div class="flex-c">
                                                <div class="flex-c">
                                                    <div class="flex-c">{ix + 1}</div>
                                                </div>
                                            </div>
                                            <span class="text">{it.label}</span>
                                        </div>
                                        { tabs.length > ix+1 && <svg-icon class="svg-icon step-line-line" icon-class="icon-line-gradient" />}
                                        </>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div class="thesisInfo-left-filtration" isPaperReview={ active.value == 'Paper_Review' ? true : false }>
                        {
                            active.value !== 'Paper_Review' ?
                            <h4 class="title">
                                { active.value === 'Paper_Information' && `各${isClsActive.value == '按学院' ? '学院' : '专业'}学生论文开题率` }
                                { active.value === 'Thesis_Proposal' && `各${isClsActive.value == '按学院' ? '学院' : '专业'}学生论文预答辩通过率` }
                                { active.value === 'Thesis_Defense' && `各${isClsActive.value == '按学院' ? '学院' : '专业'}学生论文答辩通过率` }
                            </h4> :
                            <div class="thesisInfo-left-screen-top">
                                <h4 class="title mg-b15">{ `各${isClsActive.value == '按学院' ? '学院' : '专业'}学生论文评阅结果分布` }</h4>
                                <div class="legend-btn">
                                    {
                                        MajorOption.colorList.map((it: any) => {
                                            return (
                                                <span class="item-btn" style={{'--legendColor': it.color }}>{ it.label }</span>
                                            )
                                        })
                                    }
                                </div>

                            </div>
                        }
                        <RedTab btnList={ clsList } isRed={ isRed.value } isActive={ isClsActive.value } onRedTabChange={ redTabChange } />
                    </div>
         
                    <ul class="thesisInfo-left-progress-bar">
                        {
                            active.value == 'Paper_Review' ? (
                                <BarMultiSegment options={MajorOption} style="max-height: 320px" />    
                            ) :
                            (
                                list.value.map((it: any, ix) => {
                                    return (
                                        <li class="mg-b10" key={ix}>
                                            <span class="text">{ it.collegeName || it.majorName }</span>
                                            <div class="progress-bar-box">
                                                <span class="rate">{ it.proportion }</span>
                                                <div class="out-rect">
                                                    <div class="in-rect" style={{ width: it.proportion }} />
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })
                            )
                        }
                    </ul>
                    { active.value !== 'Paper_Review' && <p class="mean-value">学校平均 <span class="bold">{ averageProportion.value }</span></p>}
                </div>
            </>
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
        
        const instanceManager = inject<InstanceManager>('InstanceManager')!
        const thesisStep = instanceManager.get('TthesisStep')
        const dataSource = instanceManager.get('TdataSource')
        const getImageUrl = (name: string) => {
            return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
        }

        const passingRate = ref<number>(0)
        // 学位卡片配置
        const colorDegreeConfig = reactive({
            color: '#45A0E6',
            title:'授予学位',
            value:0,
            isUnit:true,
            icon:getImageUrl('degree-icon'),
            unit:'人'
        })
        // 答辩卡片配置
        const colorReplyConfig = reactive({
            color: '#B22924',
            title:'建议重新答辩',
            value:0,
            isUnit:true,
            icon:getImageUrl('degree-icon'),
            unit:'人'
        })

        const title = ref<string>('')
        const visible = ref<boolean>(false)
        const paramsObj = {
            campusId: 'stuCampusId',
            collegeId: 'stuCollegeId',
            majorId: 'stuMajorId',
            gradeId: 'stuGradeId',
            classId: 'stuClassId'
        }
        let searchConfig: searchConfigType = reactive([
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
            },
            {
                type: 'select',
                label: '评议',
                inputWidth: '110px',
                labelWidth: '40px',
                key: 'category',
                options: [{ label: '通过', value: '1' }, { label: '未通过', value: '2' }]
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
              prop: 'userName',
              label: '学号',
              align: 'center'
            },
            {
              prop: 'campusName',
              label: '校区',
              align: 'center'
            },
            {
              prop: 'collegeName',
              label: '学院',
              align: 'center'
            },
            {
              prop: 'majorName',
              label: '专业',
              align: 'center'
            },
            {
              prop: 'gradeName',
              label: '年级',
              align: 'center'
            },
            {
              prop: 'className',
              label: '班级',
              align: 'center'
            },
            {
              slot: 'action',
              label: '操作',
              fixed: 'right',
              align: 'center'
            }
        ]

        const proportion = ref<number>(0);
        const researchDirection = ref([])
        const stopwatchValue = ref(0)
        const paperReviewProportion = ref([])

        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts
        // const percentage = ref(32);
        const initCharts = () => {
            const el: HTMLElement = instance?.refs.rdirection as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let datas = researchDirection.value
            let maxVal = Math.max(...datas.map((item:any) => item.value)); 
            let option = {
                backgroundColor: '#FFFFFF',
                series: [{
                  type: 'wordCloud',
                  sizeRange: [14, 30],
                  rotationRange: [0, 0],
                  rotationStep: 45,
                  gridSize: 30,
                  shape: 'circle',
                  width: '100%',
                  height: '100%',
                  textStyle: {
                    color: function (params: { value: number }) {
                        var opacity =  params.value / maxVal;
                        return 'rgba(178, 41, 36, ' + opacity + ')';
                    }
                  },
                  data: datas
                }]
            };
            myChart?.setOption(option)
        }

        // 毕业论文预答辩
        const initTopGaugeChart = () => {
            const el: HTMLElement = instance?.refs.stopwatch as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            const gaugeData = [
                {
                    value: stopwatchValue.value || 0,
                    name: '通过率',
                }
            ];
            let option = {
                title: {
                    text: `论文预答辩通过率 ${stopwatchValue.value || 0}%`,
                    left: 'center',
                    bottom: '0',
                    textStyle: {
                        fontSize: 16,
                        color: '#203449',
                        fontFamily: 'Regular'
                    }
                },
                color: ['#F39702', '#005DA7'],
                tooltip: {
                    formatter: '{b} : {c}%'
                },
                series: [
                    {
                        type: 'gauge',
                        radius: "80%",
                        center: ["50%", "50%"],
                        progress: {
                            show: false,
                        },
                        axisLine: {
                            lineStyle: {
                                width: 20,
                                color: [
                                    [0, '#45A0E6'],
                                    [1, '#45A0E6']
                                ]
                            }
                        },
                        axisTick: {
                            show: false // 不显示坐标轴刻度线
                        },
                        splitLine: {            // 分隔线样式。
                            show: false
                        },
                        axisLabel: {
                            show: true,             // 是否显示标签,默认 true。
                            distance: 5,
                            color: '#203449',
                            fontSize: 14,
                            detail: {
                                formatter: '{value} %'
                            },
                        },
                        pointer: {              // 仪表盘指针。
                            show: true,             // 是否显示指针,默认 true。
                            length: "75%",          // 指针长度，可以是绝对数值，也可以是相对于半径的百分比,默认 80%。
                            width: 6,               // 指针宽度,默认 8。
                        },
                        itemStyle: {
                        borderCap: 'round',
                        borderMiterLimit: 5,
                        opacity: 1,             // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                        },
                        // detail: {
                        // show: false,
                        // },
                        title: {
                            show: false,
                        },
                        data: gaugeData
                    }
                ]
            };
            myChart?.setOption(option)
        }

        // 论文答辩通过率
        const initTopGaugeChart2 = () => {
            const el: HTMLElement = instance?.refs.stopwatchPass as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            const gaugeData = [
                {
                    value: passingRate.value || 0,
                    name: '答辩通过率',
                }
            ];
            let option = {
                title: {
                    text: `论文答辩通过率 ${passingRate.value || 0}%`,
                    left: 'center',
                    bottom: '0',
                    textStyle: {
                        fontSize: 16,
                        color: '#203449',
                        fontFamily: 'Regular'
                    }
                },
                color: ['#F39702', '#005DA7'],
                tooltip: {
                    formatter: '{b} : {c}%'
                },
                series: [
                    {
                        type: 'gauge',
                        radius: "80%",
                        center: ["50%", "50%"],
                        progress: {
                            show: false,
                        },
                        axisLine: {
                            lineStyle: {
                                width: 20,
                                color: [
                                    [0, '#4D5FC1'],
                                    [1, '#4D5FC1']
                                ]
                            }
                        },
                        axisTick: {
                            show: false // 不显示坐标轴刻度线
                        },
                        splitLine: {            // 分隔线样式。
                            show: false
                        },
                        axisLabel: {
                            show: true,             // 是否显示标签,默认 true。
                            distance: 5,
                            color: '#203449',
                            fontSize: 14,
                            detail: {
                                formatter: '{value} %'
                            },
                        },
                        pointer: {              // 仪表盘指针。
                            show: true,             // 是否显示指针,默认 true。
                            length: "75%",          // 指针长度，可以是绝对数值，也可以是相对于半径的百分比,默认 80%。
                            width: 6,               // 指针宽度,默认 8。
                        },
                        itemStyle: {
                        borderCap: 'round',
                        borderMiterLimit: 5,
                        opacity: 1,             // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                        },
                        // detail: {
                        // show: false,
                        // },
                        title: {
                            show: false,
                        },
                        data: gaugeData
                    }
                ]
            };
            myChart?.setOption(option)
        }

        const EchartsClick = (type: string) => {
            if(type === 'stopwatch') {
                title.value = '论文预答辩情况'
                searchConfig[searchConfig.length - 1].label = '结果';
                columns.splice(columns.length - 1, 0, {
                    prop: 'result',
                    label: '是否通过',
                    align: 'center'
                })
            } else {
                title.value = '论文答辩情况'
                searchConfig[searchConfig.length - 1].label = '结果';
                
                
                columns.splice(columns.length - 1, 0, {
                  prop: 'result',
                  label: '答辩结果',
                  align: 'center'
                })
            }
            visible.value = true
        }

        // 结果分布
        const initDistributionCharts = () => {
            const el: HTMLElement = instance?.refs.distributionCharts as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data = paperReviewProportion.value;
            let option = {
                color: ['#E3493E', '#1B528B', '#00C9F2', '#F39702'],
                // title: {
                //   text: '主要年龄区间',
                //   bottom:'0%',
                //   left: "30%",
                //   textStyle: {
                //     color: '#000000',
                //     fontSize: 16,
                //     fontWeight: '600'
                //   }
                // },
                legend: {
                  show: true,
                  // type: "scroll",
                  // icon: "circle",
                  orient: 'vertical',
                  top: 'center',
                  right: '8%',
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
                  data: data.map((item:any) => item.name),
                },
                tooltip: {
                  formatter: '{b} : {c} 人 ({d}%)'
                },
                series: [
                  {
                    name: "国外考试中心",
                    type: "pie",
                    // radius: ['45%', '60%'],
                    radius: ['40%', '55%'],
                    center: ['45%', '50%'],
                    labelLine: {
                      length: 20,//第一段线长
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
                      formatter: '{name|{b} }\n\n{zb|{d}%}',
                      padding: [0, -60, -5, -60],
                      rich: {
                        name: {
                          fontSize: 12,
                          color: '#203449'
                        },
                        num: {
                          fontSize: 12,
                          color: '#203449'
                        },
                        zb: {
                          fontSize: 14,
                          color: '#203449'
                        }
            
                      },
                    },
                    data: data,
                  },
                ],
            
            }
            myChart?.setOption(option);
            myChart?.off('click');
            myChart?.on('click', (params) => {
                title.value = '论文评阅情况'
                searchConfig[searchConfig.length - 1].label = '评阅';
                searchConfig[searchConfig.length - 1].options = [
                    { label: '优秀', value: '优秀' },
                    { label: '良好', value: '良好' },
                    { label: '一般', value: '一般' },
                    { label: '不合格', value: '不合格' },
                ];
                
                columns.splice(columns.length - 1, 0, {
                    prop: 'thesisReviewResult',
                    label: '评阅结果',
                    align: 'center'
                })
                visible.value = true
            })
        }
        

        const evaluatingIndicator = ref([])

        // 评价指标情况
        const liquidFillOptions = reactive([
            {
                title: '选题与综述',
                text: '得分率',
                value: 0,
                borderColor: '#146AAE',
                borderWidth: 1,
                backgroundColor: '#FFFFFF',
                wavyColor: ['#294D99', '#156ACF', '#1598ED'],
            },
            {
                title: '基础理论与专门知识',
                text: '得分率',
                value: 0,
                borderWidth: 1,
                borderColor: '#45A0E6',
                backgroundColor: '#FFFFFF',
                wavyColor: ['#45A0E6','#9DCBEE']
            },
            {
                title: '科研能力与创造性',
                text: '得分率',
                value: 0,
                borderWidth: 1,
                borderColor: '#B93D38',
                backgroundColor: '#FFFFFF',
                wavyColor: ['#B22924','#D38F8C']
            },
            {
                title: '写作能力与学风',
                text: '得分率',
                value: 0,
                borderWidth: 1,
                borderColor: '#f4b95a',
                backgroundColor: '#FFFFFF',
                wavyColor: ['#F39702','#F4C67C']
            },
        ])

        const handleClick = () => {
            title.value = '论文开题情况'
            searchConfig[searchConfig.length - 1].label = '评议';
            console.log(searchConfig);
            
            columns.splice(columns.length - 1, 0, {
                prop: 'result',
                label: '开题评议',
                align: 'center'
            })
            visible.value = true
        }

        const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
            return getChartDataDetail({
                ...props.params,
                ...params,
                pageNum: pages.current,
                pageSize: pages.size,
                ident: thesisStep.value,
                startTime: props.params.startTime,
                endTime: props.params.endTime
            })
        }

        const exportEvt = async(form: any, pages: PagesType) => {
            const res = await exportGetChartDataDetail({
              ...form,
              pageNum: pages.current,
              pageSize: pages.size,
              ident: thesisStep.value,
              startTime: props.params.startTime,
              endTime: props.params.endTime,
              expExcel: true
            })
            downloadFile(res)
        }

        const closed = () => {
            searchConfig[searchConfig.length - 1].options = [{ label: '通过', value: '1' }, { label: '未通过', value: '2' }]
            columns = [
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
                  prop: 'userName',
                  label: '学号',
                  align: 'center'
                },
                {
                  prop: 'campusName',
                  label: '校区',
                  align: 'center'
                },
                {
                  prop: 'collegeName',
                  label: '学院',
                  align: 'center'
                },
                {
                  prop: 'majorName',
                  label: '专业',
                  align: 'center'
                },
                {
                  prop: 'gradeName',
                  label: '年级',
                  align: 'center'
                },
                {
                  prop: 'className',
                  label: '班级',
                  align: 'center'
                },
                {
                  slot: 'action',
                  label: '操作',
                  fixed: 'right',
                  align: 'center'
                }
            ]
            visible.value = false
            
        }
        
        onMounted(() => {
            nextTick(() => {
                initCharts()
            })
        })

        watch(dataSource, (res) => {
            try {
                if(res && Object.keys(res).length) {
                    if(thesisStep.value === 'Paper_Information') {
                        researchDirection.value = res.researchDirection.map((it: any) => {
                            return {
                                name: it.researchDirection,
                                value: it.count
                            }
                        });
                        proportion.value = res.proportion && Number(res.proportion.split('%')[0]);
                        nextTick(() => {
                            initCharts();
                        })
                    } else if(thesisStep.value === 'Thesis_Proposal') {
                        stopwatchValue.value = res.proportion && Number(res.proportion.split('%')[0]);
                        nextTick(() => {
                            initTopGaugeChart();
                        })
                    } else if(thesisStep.value === 'Paper_Review') {
                        paperReviewProportion.value = res.paperReviewProportion.map((it: any) => {
                            return {
                                name: it.thesisReviewResult,
                                value: it.count
                            }
                        })
                        evaluatingIndicator.value = res.evaluatingIndicator;
                        liquidFillOptions.forEach((item: optionsConfig, index: number) => {
                            if(res.evaluatingIndicator && res.evaluatingIndicator.length) {
                                res.evaluatingIndicator.forEach((it: {proportion: string, reviewType: string}) => {
                                    if(it.reviewType === item.title) {
                                        liquidFillOptions[index].value = Number(it.proportion.split('%')[0]) / 100
                                    }
                                })
                            } else {
                                liquidFillOptions[index].value = 0
                            }
                        })
                        nextTick(() => {
                            initDistributionCharts();
                        })
                    } else {
                        passingRate.value = res.proportion && Number(res.proportion.split('%')[0]);
                        colorDegreeConfig.value = res.graduateStudentNum.count;
                        colorReplyConfig.value = res.reDefenseStudentNum.count;
                        nextTick(() => {
                            initTopGaugeChart2();
                        })
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })

        return () => {
            return <>
                <div class="thesisInfo-right" key={thesisStep.value}>
                    { thesisStep.value === 'Paper_Information' && 
                        <>
                            <div class="c-title mg-b15">论文开题率</div>
                            <div class="proposal-rate-section">
                                <ElProgress  onClick={ () => handleClick() }
                                class="thesis-rate-progress mg-b15" 
                                type="circle" 
                                width={110} 
                                stroke-width={10} 
                                color="#005DA7"
                                percentage={ proportion.value }
                                v-slots={{
                                    default: ({percentage}:any) => (
                                        <span class="percentage-value" style="color:#005DA7;">{ percentage || 0 }<span>%</span></span>
                                    )
                                }}>
                                </ElProgress>
                                <p class="name">论文开题率 { proportion.value || 0 }%</p>
                            </div>
                            <div class="c-title mg-b15">论文研究方向</div>
                            <div class="research-direction-section">
                                <div class="research-direction mg-b20" ref="rdirection"></div>
                                <p class="name">主要研究方向 { researchDirection.value.length && researchDirection.value[0].name  }</p>
                            </div>
                        </>
                    }

                    {
                        thesisStep.value === 'Thesis_Proposal' &&
                        <>
                            <div class="c-title">论文预答辩通过率</div>
                            <div class="percent-of-pass">
                                <div class="stopwatch" ref="stopwatch" onClick={() => EchartsClick('stopwatch')}></div>
                                <div class="gauge-box">
                                    <span class="txt">通过率</span>
                                    <span class="num">{stopwatchValue.value}%</span>
                                </div>
                            </div>
                        </>
                    }

                    {
                        thesisStep.value === 'Paper_Review' &&
                        <>
                            <div class="c-title">论文评阅结果分布</div>
                            <div class="result-distribution" ref="distributionCharts"></div>
                            <p class="hint-text">论文评阅结果主要为 <span class="bold">{paperReviewProportion.value.length && paperReviewProportion.value[0].name}</span></p>
                            <div class="c-title mg-b30">评价指标情况</div>
                            <div class="waterPolo mg-b30">
                                {
                                    liquidFillOptions.map((it: any) => {
                                        return <LiquidFill options={ it } />
                                    })
                                }
                                
                            </div>
                            <p class="hint-text">得分率最突出 <span class="bold">{evaluatingIndicator.value.length && evaluatingIndicator.value[0].reviewType}</span></p>
                        </>
                    }

                    {
                        thesisStep.value === 'Thesis_Defense' &&
                        <>
                            <div class="c-title">论文答辩通过率</div>
                            <div class="percent-of-pass2 mg-b60">
                                <div class="stopwatch" ref="stopwatchPass" onClick={() => EchartsClick('stopwatchPass')}></div>
                                <div class="gauge-box">
                                    <span class="txt">通过率</span>
                                    <span class="num">{passingRate.value}%</span>
                                </div>
                            </div>
                            <div class="percent-card-style">
                                <ColorCard class="mr50" cardConfig={ colorDegreeConfig } />
                                <ColorCard class="mr50" cardConfig={ colorReplyConfig } />
                            </div>
                        </>
                    }
                </div>

                <c-table-plus title={title.value}
                dialogWidth="1460px" 
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
                    },
                    action:(arg:any) =>{
                        const {data} = arg
                        return <el-button style="color:#005DA7" link>学生个像</el-button>
                    }
                }}  />
            </>
        }
    }
})


ThesisInfo.Left = LeftView;
ThesisInfo.Right = RightView;
export default ThesisInfo