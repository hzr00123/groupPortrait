import { defineComponent, getCurrentInstance, inject, nextTick, onMounted, PropType, provide, Ref, ref, toRefs, watch, watchEffect } from "vue"
import ColorCard from '@/components/common/ColorCard.vue';
import { getImageUrl } from '@/utils';
import { reactive } from 'vue';
import './styles/Scholarship.scss'
import { BaseParams } from "../../types";
import { useChildrenData, usePortraitRequest } from "@/hooks";
import RedTab from "@/components/common/RedTab.vue";
import { EChartsType } from "echarts";
import BarLegend from '@/components/common/BarLegend.vue';
import BarMultiSegment from '@/components/common/BarMultiSegment.vue';
import { changeChartData,getAllChartData,getChartDataDetail,getChartDataDetailAny,exportGetChartDataDetail,getSelectData } from "@/api/modules/studentPortrait";
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
    },
    setup(props, content) {
        const colorConfig = reactive([
            {
                ident: 'awardCount',
                color: '#4D5FC1',
                title: '获奖人数',
                value: '-',
                isUnit: true,
                icon: getImageUrl('hjrs-icon'),
                unit: '人',
                width: '180px',
                isClick:true
            },
            {
                ident: 'stuCount',
                color: '#45A0E6',
                title: '获奖次数',
                value: '-',
                isUnit: true,
                icon: getImageUrl('hjcs-icon'),
                unit: '次',
                width: '180px',
                isClick:false
            },
            {
                ident: 'money',
                color: '#B22924',
                title: '获奖金额',
                value: '-',
                isUnit: true,
                icon: getImageUrl('hjje-icon'),
                unit: '万元',
                width: '180px',
                isClick:false
            },
        ])
        const isActive = ref("按学院")
        const btnList = [
            {
                value: "按学院",
                label: "按学院"
            },
            {
                value: "按专业",
                label: "按专业"
            },
        ]
        const chartData = reactive({
            colorList: [],
            list: [],
            valuePosition: 'center',
            unit: '次',
            needTag: true,
            lableWidth: '110px',
            lableAlign: 'right',
        })
        // const data = useChildrenData({ ...props.params, ident: 'scholarship' })
        const colors = ['#F39D12', '#B22924', '#8C6C4E', '#00C9F2', '#005DA7']

        // watch(data, () => {
        //     if (data.value.code == 1) {
        //         chartData.list = data.value.data.chartData.series
        //         chartData.colorList = data.value.data.chartData.legend.map((i: string, index: number) => ({ color: colors[index] || '#F39D12', label: i }))
        //         colorConfig.forEach(i => {
        //             i.value = data.value.data.totalMap[i.ident]
        //         })
        //     }
        // }, { immediate: true, deep: true })

        watch(isActive, () => {
            changeChartData({ ...props.params, ident: 'scholarship', category: isActive.value }).then(res => {
                if (res.code == 1) {
                    chartData.list = res.data.series
                    chartData.colorList = res.data.legend.map((i: string, index: number) => ({ color: colors[index] || '#F39D12', label: i }))
                }
            })
        })

        watch(props, () => {
            getAllChartData({ ...props.params, ident: 'scholarship' }).then((res: any) => {
                if (res.code == 1) {
                    chartData.list = res.data.chartData.series
                    chartData.colorList = res.data.chartData.legend.map((i: string, index: number) => ({ color: colors[index] || '#F39D12', label: i }))
                    colorConfig.forEach(i => {
                        i.value = res.data.totalMap[i.ident]
                    })
                }
            })
        }, { immediate: true, deep: true })

        let dialogTableVisible = ref(false)
        let tableData = ref([])
        const campusOrgList = ref([])
        const collegeOrgList = ref([])
        const majorOrgList = ref([])
        const gradeOrgList = ref([])
        const classOrgList = ref([])
        const categoryList = ref<{}[]>([])
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
                    placeholder: '级别',
                    key: 'category',
                    opKey: 'value',
                    opLabel: 'name',
                    options: categoryList,
                },
                {
                    inputWidth: '200px',
                    type: 'input',
                    label: '',
                    placeholder: '请输入获奖名称、姓名、学号搜索',
                    key: 'name',
                    opKey: 'id',
                    opLabel: 'orgName',
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

            let se = await getSelectData({ident:'scholarship'});
            if (se.code == 1) {
                categoryList.value = []
                let arr: { name: any; value: any; }[] = []
                se.data.levels.forEach((ff:any) => {
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

        onMounted(() => {
            initSelect()
        })

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
           getChartDataDetailAny({ ...props.params,...searchForm, ident: 'scholarship',pageNum: pages.current,pageSize: pages.size }).then((res) => {
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
                ident: 'scholarship'
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
            prop: 'awardName',
            label: '获奖名称',
        },
        {
            prop: 'awardLevel',
            label: '级别',
            },
            {
            prop: 'awardMoney',
            label: '金额',
        },
        ]

        return () => {
            return <div class='scholarship left' {...content.attrs}>
                <section class={'left-section'}>
                    <c-title title="基本信息画像" class='mg-b20' />
                    <div class="flex just-b card-box">
                        {
                            colorConfig.map(i => (
                                <ColorCard cardConfig={i} key={i.color} onClick={() => clickOn(i.isClick)} style={{ cursor: i.isClick ? 'pointer' : 'default' }}/>
                            ))
                        }
                    </div>
                </section>

                <div class='sch-l-chart'>
                    <div class="student-distribution-left-content-top">
                        <BarLegend legendList={chartData.colorList} />
                        <RedTab btnList={btnList}
                            isRed={true}
                            isActive={isActive.value}
                            onRedTabChange={(v: string) => isActive.value = v}
                        />
                    </div>
                    <BarMultiSegment options={chartData} />
                    <el-dialog v-model={dialogTableVisible.value} title="奖学金获奖详情" close-on-click-modal={false} append-to-body={true} width="80%"
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
            </div>
        }
    }
})

const RightView = defineComponent({
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
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
        const initChart = (el: HTMLElement, datas: Array<any>, chart: Ref<EChartsType | undefined>, titleLeft = '18%') => {
            if (!chart.value) {
                chart.value = echarts?.init(el)!;
            }
            const colors = ['#005DA7', '#00C9F2', '#F39702', '#E3493E', '#231815', '#45A0E6'];
            const option: EChartsOption = {
                color: colors,
                title: {
                    bottom: 0,
                    left: titleLeft,
                    text: `${titleLeft === '18%' ? '主要获奖级别' : '单次奖学金金额主要分布'}: ${titleLeft === '18%' ? levelMax.value : moneyMax.value}`,
                    textStyle: {
                        fontSize: 16,
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
                        let p = total ? Math.round((tarValue! / total) * 100) : 0;
                        return `${name}{a|${tarValue}次}{a|${p}%}`;
                    },

                },
                tooltip: {
                    formatter: '{b} : {c} 次 ({d}%)'
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
                        label: {
                            show: false,
                            position: 'center',
                            color: '#4c4a4a',
                            formatter(data) {
                                return `{total|${data.value}次}`
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
            chart.value?.setOption(option)
        }

        // watch(data, v => {
        //     if (v.code == 1) {
        //         moneyMax.value = v.datas2.moneyMax
        //         levelMax.value = v.datas2.levelMax
        //         levelPie.value = v.datas2.levelPie
        //         moneyPie.value = v.datas2.moneyPie
        //         nextTick(() => {
        //             initChart(topChart.value, levelPie.value, topChartInstence)
        //             initChart(bottomChart.value, moneyPie.value, bottomChartInstence, '6%')
        //         })
        //     }
        // }, { deep: true })

        watch(props, () => {
            getAllChartData({ ...props.params, ident: 'scholarship' }).then((res: any) => {
                moneyMax.value = res.datas2.moneyMax
                levelMax.value = res.datas2.levelMax
                levelPie.value = res.datas2.levelPie
                moneyPie.value = res.datas2.moneyPie
                nextTick(() => {
                    initChart(topChart.value, levelPie.value, topChartInstence)
                    initChart(bottomChart.value, moneyPie.value, bottomChartInstence, '6%')
                })
            })
        }, { immediate: true, deep: true })

        onMounted(() => {
            nextTick(() => {
                initChart(topChart.value, levelPie.value, topChartInstence)
                initChart(bottomChart.value, moneyPie.value, bottomChartInstence, '6%')
            })
        })
        return () => {
            return <div class='scholarship' {...content.attrs}>
                <section class='sch-right'>
                    <c-title title="特征分析" class='mg-b10' />
                    <div class='sch-chart'>
                        <div class='sch-r-top'>
                            <div class="c-title">奖学金级别</div>
                            <div class='chart' ref={topChart} />
                        </div>
                        <div class='sch-r-bottom'>
                            <div class="c-title">奖学金金额</div>
                            <div class='chart' ref={bottomChart} />
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
        usePortraitRequest({...toRefs(props.params) as any, ident: 'scholarship' })
        return () => {
            return <div
                class={{
                    'scholarship': true,
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
                />
                <RightView
                    class={{
                        'w49': props.direction === 'horizontal',
                        'w100': props.direction === 'vertical'
                    }}
                    params={props.params}
                />
                <WarningSeal name="奖学金" ident='scholarship'/>
            </div>
        }
    }
})

Scholarship.Left = LeftView
Scholarship.Right = RightView
export default Scholarship