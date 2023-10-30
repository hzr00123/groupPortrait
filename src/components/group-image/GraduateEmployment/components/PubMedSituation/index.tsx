import { defineComponent, getCurrentInstance, onMounted, onUnmounted, reactive, ref, watch, nextTick, PropType, defineAsyncComponent, provide, inject, toRefs } from "vue"
import { downloadFile, usePortraitRequest } from "@/hooks";
import InstanceManager, { _getMaxValue, getImageUrl } from "@/utils"
import { ElLink, ElProgress } from "element-plus";
import { getOrgType } from "@/api/modules/emphasisList";
import { Column } from "@/components/Table";
import { exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import { searchConfigType, PagesType, requestResType } from "@/components/Table-plus/index.d";
import { BaseParams } from "@/components/group-image/types";
import RedTab from "@/components/common/RedTab.vue";
import ColorCard from '@/components/common/ColorCard.vue';
import ChinaMap from "@/components/common/ChinaMap.vue"
import '../../index.scss'
import { RedTabConfig } from "@/components/common/Search";

const PubMedSituation = defineComponent({
    name: 'pubMedSituation',
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        direction: {
            type: String as PropType<'horizontal' | 'vertical'>,
            default: 'horizontal'
        },
        selectList: {
            type: Array as PropType<RedTabConfig[]>,
            default: () => [
                {
                    value: 'Number_of_candidates_for_postgraduate_entrance_examination',
                    label: "考研人数"
                },
                {
                    value: 'Intention_to_take_the_postgraduate_entrance_examination',
                    label: "考研意向"
                },
                {
                    value: 'Destination_of_postgraduate_entrance_examination',
                    label: "考研去向"
                }
            ]
        }
    },
    setup(props, content) {
        provide('params', props.params)
        provide('InstanceManager', new InstanceManager())
        return () => {
            return <div class={{
                'pubMed-situation': true,
                'scholarship': true,
                'flex': true,
                'horizontal': props.direction === 'horizontal',
                'vertical': props.direction === 'vertical'
            }}>
                <LeftView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}
                selectList={ props.selectList }/>
                <RightView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }} />
            </div>
        }
    }
})

const LeftView = defineComponent({
    props: {
        selectList: {
            type: Array as PropType<RedTabConfig[]>,
            default: () => [
                {
                    value: 'Number_of_candidates_for_postgraduate_entrance_examination',
                    label: "考研人数"
                },
                {
                    value: 'Intention_to_take_the_postgraduate_entrance_examination',
                    label: "考研意向"
                },
                {
                    value: 'Destination_of_postgraduate_entrance_examination',
                    label: "考研去向"
                }
            ]
        }
    },
    setup(props, content) {
        const params = inject<BaseParams>('params',  {} as any);

        const instanceManager = inject<InstanceManager>('InstanceManager')
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts
        const selectList = reactive(props.selectList)
        const isActive = ref<string>(props.selectList[0].value as string)
        const activeLable = ref(props.selectList[0].label as string)
        const colorConfig = reactive({
            color: '#45A0E6',
            title:'考研总人数',
            value:0,
            isUnit:true,
            icon:getImageUrl('peopleNum2'),
            unit:'人'
        })

        const visible = ref<boolean>(false);
        const isClsActive = ref<string>('按学院')
        const formerYearsList = ref([])
        const MapDatas = ref<any>([])

        const legendList = [
            {
                color: "#F39D12",
                label: "女性"
            },
            {
                color: "#005DA7",
                label: "男性"
            }
        ]

        const clsList = [
            {
                value: '按学院',
                label: "按学院"
            },
            {
                value: '按专业',
                label: "按专业"
            },
            {
                value: '历年人数',
                label: "历年人数"
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

        const columns: Column = [
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
              prop: 'intentionalVolunteer',
              label: '意向学校专业',
              align: 'center'
            },
            {
                prop: 'finalVolunteer',
                label: '去向学校专业',
                align: 'center'
            },
            {
              slot: 'action',
              label: '操作',
              fixed: 'right',
              align: 'center'
            }
        ]

        const list = ref([])

        const response = ref({})

        const redTabChange = (index: string) => {
            isActive.value = index;
            activeLable.value = selectList.find((it:any) => it.value === index)!.label;
            isClsActive.value = '按学院';
        }

        const redClsTabChange = (name: string) => {
            isClsActive.value = name;
        }

        const cardClick = () => {
            visible.value = true
        }

        const tableRequest = (params1: any, pages: PagesType): Promise<requestResType> => {
            return getChartDataDetail({
                ...params,
                ...params1,
                pageNum: pages.current,
                pageSize: pages.size,
                ident: isActive.value,
                startTime: params.startTime,
                endTime: params.endTime
            })
        }

        const exportEvt = async(form: any, pages: PagesType) => {
            const res = await exportGetChartDataDetail({
              ...form,
              pageNum: pages.current,
              pageSize: pages.size,
              ident: isActive.value,
              startTime: params.startTime,
              endTime: params.endTime,
              expExcel: true
            })
            downloadFile(res)
        }

        const initChartsNum = () => {
            const el: HTMLElement = instance?.refs.chartsNum as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data = formerYearsList.value
            const max1 = _getMaxValue(data.map((item: any) => item.allPostgraduateNum))
            const max2 = _getMaxValue(data.map((item: any) => item.scale))

            let option = {
                color:['#F39D12', '#6477DD','#FFCC00'],
                title: {
                text: '单位：人',
                top: 0,
                left: 0,
                textStyle: {
                    color: '#333333',
                    fontSize: 14,
                    fontWeight:'normal'
                }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(res: any) {
                        return `${res[0].axisValue}<br>
                        <p>
                          <i style="display: inline-block;
                          background: #F39D12;
                          width: 10px;
                          height: 10px;
                          margin-right: 5px;
                          border-radius: 50%;"></i>考研人数：${res[0].value} 人
                        </p>
                        <p>
                          <i style="display: inline-block;
                          background: #6477DD;
                          width: 10px;
                          height: 10px;
                          margin-right: 5px;
                          border-radius: 50%;"></i>考研成功人数：${res[1].value} 人
                        </p>
                        <p>
                          <i style="display: inline-block;
                          background: #FFCC00;
                          width: 10px;
                          height: 10px;
                          margin-right: 5px;
                          border-radius: 50%;"></i>考研人数占比：${res[2].value} %
                        </p>
                        `
                    }
                },
                legend: {
                    right: '16%',
                    top: '1%',
                    itemWidth: 10,
                    itemHeight: 5,
                    tooltip: {
                        show: true
                    },
                    data: ['考研人数','考研成功人数', '考研人数占比']
                },
                grid: {
                    top: '12%',
                    left: 0,
                    right: '4%',
                    bottom: '4%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: data.map((item: { year: any; }) => ({ value: item.year })),
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
                        max: max1, 
                        splitNumber: 5, 
                        interval: max1 / 5, 
                    },
                    { 
                        name:'单位：%',
                        nameLocation:'end',
                        nameTextStyle:{
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
                        max: max2, 
                        splitNumber: 5, 
                        interval: max2 / 5, 
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        name:'考研人数',
                        barWidth: '20%',
                        data: data.map((item: { allPostgraduateNum: any; }) => ({ value: item.allPostgraduateNum })),
                        itemStyle: {
                            borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
                        },
                    },
                    {
                        type: 'bar',
                        name:'考研成功人数',
                        barWidth: '20%',
                        data: data.map((item: { successPostgraduateNum: any; }) => ({ value: item.successPostgraduateNum })),
                        itemStyle: {
                            borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
                        },
                    },
                    {
                        name: '考研人数占比',
                        type: 'line',
                        smooth: true,
                        // symbol: 'none',
                        symbolSize: 8,
                        yAxisIndex: 1,
                        data: data.map((item: { scale: any; }) => ({ value: item.scale })),
                    }
                ]
            };
            myChart?.setOption(option);
        }

        const WarningSeal = defineAsyncComponent({
            loader: () => import('@/components/WarningSeal'),
            delay: 1000
        })

        instanceManager?.register('PisActive', isActive);
        instanceManager?.register('PdataSource', response)
        onUnmounted(()=>{
            instanceManager?.clear('PisActive')
            instanceManager?.clear('PdataSource')
        })
        
        const dataSource = usePortraitRequest({...toRefs(params!) as any, ident: isActive, category: isClsActive }, [isClsActive, isActive])
        watch(dataSource, (res) => {
            const { data, datas2 } = res;
            response.value = datas2;
            try {
                if(isActive.value === 'Number_of_candidates_for_postgraduate_entrance_examination') {
                    colorConfig.value =  data.count
                    if(isClsActive.value === '历年人数') {
                        formerYearsList.value = data.postgraduateExamNum.map((it: any) => {
                            return {
                                ...it,
                                scale: it.scale.split('%')[0]
                            }
                        });
                        nextTick(() => {
                            initChartsNum()
                        })
                    } else {
                        list.value = data.collegePostgraduate || data.majorPostgraduate
                    }
                } else {
                    MapDatas.value = data.data
                }
            } catch (error) {
                console.log(error);
            }
        })

        return () => {
            return <div class="pubMed-situation-left" {...content.attrs}>
                <WarningSeal name={activeLable.value} ident={isActive.value}/>
                { !content.attrs.view &&
                    <div class="pubMed-situation-header mg-b20">
                        <c-title title="基本信息画像" />
                        <RedTab btnList={ selectList } isActive={ isActive.value } onRedTabChange={ redTabChange } />
                    </div>
                }

                {
                    isActive.value === 'Number_of_candidates_for_postgraduate_entrance_examination' ?
                    <>
                        <div class="pubMed-situation-top mg-b20">
                            <ColorCard class="mr50" cardConfig={ colorConfig } onHandleClick={ cardClick } />
                        </div>
                        <div class="pubMed-filter-strip mg-b15" style={{ 'justify-content':  isClsActive.value !== '历年人数' ? 'space-between': 'flex-end'}}>
                            { isClsActive.value !== '历年人数' && <div class="legend-box">
                                {
                                    legendList.map((it, ix) => {
                                        return (
                                            <div class="legend" key={ ix }>
                                                <div class="tag" style={{background: it.color}}></div>
                                                <div class="text">{ it.label }</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>}
                            <RedTab btnList={ clsList } isRed={ true } isActive={ isClsActive.value } onRedTabChange={ redClsTabChange } />
                        </div>
                        <section key={ isClsActive.value }>
                                {
                                    isClsActive.value !== '历年人数' &&
                                    <ul class="bar-box">
                                        {
                                            list.value.map((it: any, ix) => {
                                                return (
                                                    <li class="bar-item" key={ ix }>
                                                        <div class="y-title">{ it.collegeName || it.majorName }</div>
                                                        <ul class="item-ul">
                                                            <li class="item-ul-li" style={{ width: `${it.girlProportion}`, '--bgColor': '#F39D12' }}>
                                                                <div class="zb">{ it.girlProportion }</div>
                                                            </li>
                                                            <li class="item-ul-li" style={{ width: `${it.boyProportion}`, '--bgColor': '#005DA7' }}>
                                                                <div class="zb">{ it.boyProportion }</div>
                                                            </li>
                                                        </ul>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                }

                                {
                                    isClsActive.value === '历年人数' &&
                                    <>
                                        <div class="chartsNum" ref="chartsNum"></div>
                                        <p style="text-align: center">每年考研情况变化趋势</p>
                                    </>
                                }
                        </section>
                    </> :
                    <ChinaMap datas={ MapDatas.value } style="height: 600px"/>
                }


                <c-table-plus title="考研情况" 
                dialogWidth="1460px" 
                height="350px"
                visible={ visible.value }
                searchConfig={ searchConfig }
                columns={ columns }
                request={ tableRequest }
                exportBtn={ exportEvt }
                closed={ () => visible.value = false }
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
            </div>
        }
    }
})

const RightView = defineComponent({
    setup(props, content) {
        
        const instanceManager = inject<InstanceManager>('InstanceManager')!
        const isActive = instanceManager.get('PisActive');
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts;

        const postgraduateProportion = ref<number>(0)
        const collegePostgraduateTop = ref<any>([])
        const majorPostgraduateTop = ref<any>([])

        const boyAndGirlNumMap = reactive<{boyCount: number, girlCount: number, scale: string}>({
            boyCount: 0,
            girlCount: 0,
            scale: ''
        })

        const IntentionMajorTop = ref([])
        const IntentionSchoolTop = ref([])
        const boyMajorTop = ref([])
        const girlMajorTop = ref([])
        const ourSchoolProportion = ref<number>(0)

        const initSexContrastCharts = () => {
            const el: HTMLElement = instance?.refs.sexContrastCharts2 as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data = [
                {
                    name: '男',
                    value: boyAndGirlNumMap.boyCount,
                },
                {
                    name: '女',
                    value: boyAndGirlNumMap.girlCount
                }
            ]
            let option = {
                color: ['#005DA7', '#E3493E',],
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
                  show: false,
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
                  data: data.map((item) => item.name),
                },
                tooltip: {
                  formatter: '{b} : {c} 人 ({d}%)'
                },
                series: [
                  {
                    name: "创新创业男女人数对比",
                    type: "pie",
                    // radius: ['45%', '60%'],
                    // radius: ['70%', '90%'],
                    // radius: ['55%', '70%'],
                    // center: ['50%', '50%'],
                    radius: ['40%', '55%'],
                    center: ['50%', '50%'],
                    labelLine: {
                      length: 14,//第一段线长
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
                      formatter: '{name|{b} } {num|{c}人 }\n\n{zb|{d}%}',
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

        }

        onMounted(() => {
            nextTick(() => {
                initSexContrastCharts()
            })
        })

        const dataSource = instanceManager.get('PdataSource')
        watch(dataSource, (res) => {
            if(res && Object.keys(res).length) {
                console.log(res, 'res11111');
                
                try {
                    if(isActive.value === 'Number_of_candidates_for_postgraduate_entrance_examination') {
                        postgraduateProportion.value = res.postgraduateProportion && Number(res.postgraduateProportion.scale.split('%')[0]);
                        collegePostgraduateTop.value = res.collegePostgraduateTop
                        majorPostgraduateTop.value = res.majorPostgraduateTop
                        boyAndGirlNumMap.boyCount = res.boyAndGirlNumMap && res.boyAndGirlNumMap.boyCount
                        boyAndGirlNumMap.girlCount = res.boyAndGirlNumMap && res.boyAndGirlNumMap.girlCount
                        boyAndGirlNumMap.scale = res.boyAndGirlNumMap && res.boyAndGirlNumMap.scale
                        nextTick(() => {
                            initSexContrastCharts()
                        })
        
                    } else if(isActive.value === 'Intention_to_take_the_postgraduate_entrance_examination') {
                        IntentionMajorTop.value = res.IntentionMajorTop
                        IntentionSchoolTop.value = res.IntentionSchoolTop
                        boyMajorTop.value = res.boyMajorTop
                        girlMajorTop.value = res.girlMajorTop
                        ourSchoolProportion.value = res.ourSchoolProportion && Number(res.ourSchoolProportion.scale.split('%')[0]) || 0;
                    } else {
                        IntentionMajorTop.value = res.finalMajorTop
                        IntentionSchoolTop.value = res.finalSchoolTop
                        boyMajorTop.value = res.boyMajorTop
                        girlMajorTop.value = res.girlMajorTop
                        ourSchoolProportion.value = res.RetentionInSchool && Number(res.RetentionInSchool.scale.split('%')[0]) || 0;
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }, { immediate: true,  deep: true})

        return () => {
            return <div class="pubMed-situation-right" key={ isActive.value } {...content.attrs}>
                <c-title class="mg-b20" title="特征分析" />
                {
                    isActive.value === 'Number_of_candidates_for_postgraduate_entrance_examination' ?
                    <section>
                        <div class="container-box">
                            <div class="c-title" style="margin-bottom: 35px;">考研人数占比</div>
                            <div style="display: flex;justify-content: center;">
                                <ElProgress class="innovation-proportion mg-b15"  type="circle" width={ 110 } stroke-width={ 10 } color="#45A0E6" percentage={ postgraduateProportion.value }>
                                    {{
                                        default:(arg:{percentage:number}) =>{
                                            return <span class="percentage-value" style="color:#45A0E6;">{ arg.percentage || 0}<span>%</span></span>
                                        }
                                    }}
                                </ElProgress>
                            </div>
                            <p class="hint-text mg-b20">考研人数占毕业人数占比 <span class="bold">{postgraduateProportion.value || 0}%</span></p>
                            <div class="c-title mg-b20">考研人数学院Top5</div>
                            <ul class="branch-progress-bar">
                                {
                                    collegePostgraduateTop.value.map((it:any, ix:number) => {
                                        return (
                                            <li class="mg-b10">
                                            <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                            <span class="text" title={it.collegeName}>{ it.collegeName }</span>
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
                                <li class="hint-text">考研人数学院Top5 
                                    {
                                        collegePostgraduateTop.value.map((it:any, ix: number) => {
                                            return (
                                                <span class="bold"> {it.collegeName}{ix < collegePostgraduateTop.value.length - 1 &&  <span>、</span>}</span>
                                            )
                                        })
                                    }
                                </li>
                            </ul>
                        </div>
                        <div class="container-box">
                            <div class="c-title">考研男女人数对比</div>
                            <div class="sexContrast mg-b15" ref="sexContrastCharts2"></div>
                            <p class="hint-text mg-b20">男女比 <span class="bold">{boyAndGirlNumMap.scale}</span></p>
                            <div class="c-title mg-b20">考研人数专业Top5</div>
                            <ul class="branch-progress-bar">
                                {
                                    majorPostgraduateTop.value.map((it:any, ix: number) => {
                                        return (
                                            <li class="mg-b10">
                                            <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                            <span class="text" title={it.majorName}>{ it.majorName }</span>
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
                                <li class="hint-text">考研人数专业Top5
                                    {
                                        majorPostgraduateTop.value.map((it:any, ix: number) => {
                                            return (
                                                <span class="bold"> {it.majorName}{ix < majorPostgraduateTop.value.length - 1 &&  <span>、</span>}</span>
                                            )
                                        })
                                    }
                                </li>
                            </ul>
                        </div>
                    </section>
                    :
                    <el-row gutter={20} class="content-box" style="padding: 20px;background: #F7F7F7">
                        <el-col span={12}>
                            <div class="container-feature-box">
                                <div class="c-title mg-b10">{isActive.value === 'Destination_of_postgraduate_entrance_examination' ? '考研留校' : '考研留校意向'}</div>
                                <p class="hint-text mg-b30" style="text-align: left">{isActive.value === 'Destination_of_postgraduate_entrance_examination' ? '被本校人录取数占比' : '报考本校人数占比'} <span class="bold">{ourSchoolProportion.value}%</span></p>
                                <div style="display: flex;justify-content: center;">
                                    <ElProgress class="three mg-b20" type="circle" width={ 140 } stroke-width={ 10 } color="#F39702" percentage={ ourSchoolProportion.value }>
                                    {{
                                        default:(arg:{percentage:number}) =>{
                                            return <span class="percentage-value" style="color:#9B6D23;">{ arg.percentage || 0 }<span>%</span></span>
                                        }
                                    }}
                                </ElProgress>
                                </div>

                                <div class="c-title mg-b10">{isActive.value === 'Destination_of_postgraduate_entrance_examination' ? '去向专业Top5' : '报考专业Top5'}</div>
                                <p class="hint-text mg-b30" style="text-align: left">{isActive.value === 'Destination_of_postgraduate_entrance_examination' ? '去向专业TOP5' : '报考专业TOP5'} 
                                    {
                                        IntentionMajorTop.value.map((it:any, ix: number) => {
                                            return (
                                                <span class="bold"> {it.intentionMajorName}{ix < IntentionMajorTop.value.length - 1 &&  <span>、</span>}</span>
                                            )
                                        })
                                    }
                                </p>
                                <ul class="branch-progress-bar">
                                    {
                                        IntentionMajorTop.value.map((it:any, ix) => {
                                            return (
                                                <li class="mg-b10">
                                                <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                                <span class="text" title={it.intentionMajorName}>{ it.intentionMajorName }</span>
                                                <div class="progress-bar-box">
                                                    <div class="out-rect">
                                                    <div class="in-rect" style={{ width: it.proportion }} />
                                                    </div>
                                                </div>
                                                <span class="num">{ it.peopleNum }人</span>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </el-col>
                        <el-col span={12}>
                            <div class="container-feature-box2">
                                <div class="c-title mg-b10">{isActive.value === 'Destination_of_postgraduate_entrance_examination' ? '去向学校Top5' : '报考学校Top5'}</div>
                                <p class="hint-text mg-b30" style="text-align: left">{isActive.value === 'Destination_of_postgraduate_entrance_examination' ? '去向学校Top5' : '报考学校Top5'} 
                                    {
                                        IntentionSchoolTop.value.map((it:any, ix: number) => {
                                            return (
                                                <span class="bold"> {it.intentionSchoolName}{ix < IntentionSchoolTop.value.length - 1 &&  <span>、</span>}</span>
                                            )
                                        })
                                    }
                                </p>
                                <ul class="branch-progress-bar" style={{ '--featureBgColor': '#45A0E6' }}>
                                    {
                                        IntentionSchoolTop.value.map((it:any, ix) => {
                                            return (
                                                <li class="mg-b10">
                                                <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                                <span class="text" title={it.intentionSchoolName}>{ it.intentionSchoolName }</span>
                                                <div class="progress-bar-box">
                                                    <div class="out-rect">
                                                    <div class="in-rect" style={{ width: it.proportion }} />
                                                    </div>
                                                </div>
                                                <span class="num">{ it.peopleNum }人</span>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                                
                                <div class="c-title mg-b10">{isActive.value === 'Destination_of_postgraduate_entrance_examination' ? '男女去向专业差异' : '男女报考专业差异'}</div>
                                <p class="hint-text mg-b20" style="text-align: left; color:#005DA7">男性 <span>专业Top3 
                                    {
                                        boyMajorTop.value.map((it:any, ix: number) => {
                                            return (
                                                <span class="bold"> {it.intentionMajorName || it.finalMajorName}{ix < boyMajorTop.value.length - 1 &&  <span>、</span>}</span>
                                            )
                                        })
                                    }
                                </span></p>
                                <ul class="branch-progress-bar mg-b20" style={{ '--featureBgColor': '#005DA7', 'min-height': '86px' }}>
                                    {
                                        boyMajorTop.value.map((it:any, ix) => {
                                            return (
                                                <li class="mg-b10">
                                                <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                                <span class="text" title={it.intentionMajorName || it.finalMajorName}>{ it.intentionMajorName || it.finalMajorName}</span>
                                                <div class="progress-bar-box">
                                                    <div class="out-rect">
                                                    <div class="in-rect" style={{ width: it.proportion }} />
                                                    </div>
                                                </div>
                                                <span class="num">{ it.peopleNum }人</span>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>

                                <p class="hint-text mg-b20" style="text-align: left;color:#FD5145">女性 <span>专业Top3 
                                    {
                                        girlMajorTop.value.map((it:any, ix: number) => {
                                            return (
                                                <span class="bold"> {it.intentionMajorName || it.finalMajorName}{ix < girlMajorTop.value.length - 1 &&  <span>、</span>}</span>
                                            )
                                        })
                                    }
                                </span></p>
                                <ul class="branch-progress-bar" style={{ '--featureBgColor': '#FD5145', 'min-height': '86px' }}>
                                    {
                                        girlMajorTop.value.map((it:any, ix) => {
                                            return (
                                                <li class="mg-b10">
                                                <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                                <span class="text" title={it.intentionMajorName || it.finalMajorName}>{ it.intentionMajorName || it.finalMajorName }</span>
                                                <div class="progress-bar-box">
                                                    <div class="out-rect">
                                                    <div class="in-rect" style={{ width: it.proportion }} />
                                                    </div>
                                                </div>
                                                <span class="num">{ it.peopleNum }人</span>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </el-col>
                    </el-row>
                }
            </div>
        }
    }
})

PubMedSituation.Left = LeftView;
PubMedSituation.Right = RightView;
export default PubMedSituation