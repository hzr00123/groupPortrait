import { defineComponent, getCurrentInstance, inject, nextTick, onMounted, PropType, ref,watch } from "vue"
import ColorCard from '@/components/common/ColorCard.vue';
import { getImageUrl } from '@/utils';
import { reactive } from 'vue';
import './styles/Scholarship.scss'
import { BaseParams } from "../../types";
import RedTab from "@/components/common/RedTab.vue";
import { color, EChartsType } from "echarts";
type EChartsOption = echarts.EChartsOption;
import { MultiSegmentConf } from '@/components/common/Search';
import BarMultiSegment from '@/components/common/BarMultiSegment.vue';
import BarLegend from '@/components/common/BarLegend.vue';
import { changeChartData,getAllChartData,getChartDataDetail,getChartDataDetailAny,exportGetChartDataDetail,getSelectData } from "@/api/modules/studentPortrait";
import Search from '@/components/common/Search.vue'
import { getOrgType } from "@/api/modules/emphasisList"
import { ElLoading } from 'element-plus'
import { downloadFile } from '@/hooks'
import { useChildrenData, usePortraitRequest } from "@/hooks";
import WarningSeal from "@/components/WarningSeal";
const LeftView = defineComponent({
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
    },
    setup(props, content) {
        // 监听数据
        watch(props, () => {
            console.log('修改参数', props)
                getAllChartData({ ...props.params, ident: 'Award_certificate' }).then((res: any) => {
                   if(res.data.totalMap) {
                        colorConfig.value = [
                            {
                                color: '#4D5FC1',
                                title: '获奖人数',
                                value: res.data.totalMap.stuCount,
                                isUnit: true,
                                icon: getImageUrl('hjrs-icon'),
                                unit: '人',
                                width: '180px',
                                isClick:true
                            },
                            {
                                color: '#45A0E6',
                                title: '获奖次数',
                                value: res.data.totalMap.awardCount,
                                isUnit: true,
                                icon: getImageUrl('hjcs-icon'),
                                unit: '次',
                                width: '180px',
                                isClick:false
                            },
                        ]
                    }

                    if (res.data.chartData) {
                        MajorOption.colorList = []
                        MajorOption.list = []
                        let colors = ['#F39D12','#B22924','#8C6C4E','#00C9F2','#005DA7']
                        res.data.chartData.legend.map((itm: any, idx:any) => {
                        MajorOption.colorList.push({
                            color:colors[idx % 5],
                            label:itm,
                        })
                        })
                        MajorOption.list = res.data.chartData.series
                    }
               })
        }, { immediate: true, deep: true })
        // 默认请求一次
        const data = getAllChartData({...props.params, ident: 'Award_certificate'})
        interface User {
            color: string
            title: string
            value: number
            isUnit: boolean
            isClick: boolean
            icon: any
            unit:string
            width:string
        }
        let colorConfig = ref<User[]>([])

        const MajorOption = reactive<MultiSegmentConf>({
            list: [],
            colorList:[],
            unit:'次',
            lableAlign:'right',
            lableWidth:'160px'
        })

        data.then((res: any) => {
            if(res.data.totalMap) {
                colorConfig.value = [
                    {
                        color: '#4D5FC1',
                        title: '获奖人数',
                        value: res.data.totalMap.stuCount,
                        isUnit: true,
                        icon: getImageUrl('hjrs-icon'),
                        unit: '人',
                        width: '180px',
                        isClick:true
                    },
                    {
                        color: '#45A0E6',
                        title: '获奖次数',
                        value: res.data.totalMap.awardCount,
                        isUnit: true,
                        icon: getImageUrl('hjcs-icon'),
                        unit: '次',
                        width: '180px',
                        isClick:false
                    },
                ]
            }

            if (res.data.chartData) {
                MajorOption.colorList = []
                MajorOption.list = []
                let colors = ['#F39D12','#B22924','#8C6C4E','#00C9F2','#005DA7']
                res.data.chartData.legend.map((itm: any, idx:any) => {
                   MajorOption.colorList.push({
                       color:colors[idx % 5],
                       label:itm,
                   })
                })
                MajorOption.list = res.data.chartData.series
            }
        })

        let dialogTableVisible = ref(false)

        // 切换专业和学院
        let changeTab = (val: any) => {
            isActive.value = val
            changeChartData({ ...props.params,category: val, ident: 'Award_certificate' }).then((res) => {
              if (res.data) {
                MajorOption.colorList = []
                MajorOption.list = []
                let colors = ['#F39D12','#B22924','#8C6C4E','#00C9F2','#005DA7']
                res.data.legend.map((itm: any, idx:any) => {
                   MajorOption.colorList.push({
                       color:colors[idx % 5],
                       label:itm,
                   })
                })
                MajorOption.list = res.data.series
            }
           })
        }

        let isActive = ref('按学院')
        const btnList = [
            {
                value: '按学院',
                label: "按学院"
            },
            {
                value: "按专业",
                label: "按专业"
            },
        ]

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
                    placeholder: '等级',
                    key: 'category',
                    opKey: 'value',
                    opLabel: 'name',
                    options: categoryList,
                },
                {
                    inputWidth: '200px',
                    type: 'input',
                    label: '',
                    placeholder: '请输入证书名称、姓名、学号搜索',
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

            let se = await getSelectData({ident:'Award_certificate'});
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

        const pages = reactive({
            current: 1,
            size: 10,
            total: 0,
        })

        onMounted(() => {
           initSelect()
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
           getChartDataDetailAny({ ...props.params,...searchForm, ident: 'Award_certificate',pageNum: pages.current,pageSize: pages.size }).then((res) => {
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
                ident: 'Award_certificate'
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
            prop: 'certificateName',
            label: '证书名称',
        },
        {
            prop: 'certificateLevel',
            label: '等级',
            },
            {
            prop: 'certificateMoney',
            label: '金额',
        },
        ]

        return () => {
            return <div class='scholarship left' {...content.attrs}>
                <section class={'left-section'}>
                    <c-title title="基本信息画像" class='mg-b20'  />
                    <div class="flex just-b card-box">
                        {
                            colorConfig.value.map(i => (
                                <ColorCard cardConfig={i} key={i.color} onClick={() => clickOn(i.isClick)} class={i.isClick?'cursor-pointer' :''} />
                            ))
                        }

                    </div>
                </section>

                <div class="student-distribution-left-content-top">
                    <BarLegend legendList={MajorOption.colorList} />
                    <RedTab btnList={btnList}
                        isRed={true}
                        isActive={isActive.value}
                        onRedTabChange={changeTab} />
                </div>

                <BarMultiSegment options={MajorOption} />

                <el-dialog v-model={dialogTableVisible.value} title="获奖证书详情" close-on-click-modal={false} append-to-body={true} width="80%"
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

const RightView = defineComponent({
     props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
    },
    setup(props, content) {
        const data = getAllChartData({ ...props.params, ident: 'Award_certificate' })
        let count = ref(0)
        let countType = ref(0)
        let levelMax = ref('')
        data.then((res: any) => {
            count.value = res.datas2.countMap.count
            countType.value = res.datas2.countMap.type
            levelMax.value = res.datas2.levelMax
            if (res.datas2.levelPie) {
                nextTick(() => {
                    initChart(topChart.value, res.datas2.levelPie, topChartInstence)
                })
            }
        })

        watch(props, () => {
            getAllChartData({ ...props.params, ident: 'Award_certificate' }).then((res: any) => {
                count.value = res.datas2.countMap.count
                countType.value = res.datas2.countMap.type
                if (res.datas2.levelPie) {
                    nextTick(() => {
                        initChart(topChart.value, res.datas2.levelPie, topChartInstence)
                    })
                }
            })
        }, { immediate: true, deep: true })
        const instence = getCurrentInstance()
        const echarts = instence?.proxy?.$echarts
        let topChartInstence: EChartsType | undefined
        const topChart = ref()
        const initChart = (el: HTMLElement, datas: Array<any>, chart: EChartsType | undefined) => {
            // console.log('渲染', levelMax)
            if (!chart) {
                chart = echarts?.init(el);
            }
            const colors = ['#005DA7', '#00C9F2', '#F39702', '#E3493E', '#231815', '#45A0E6'];
            let txt = datas.length ? datas[0].name : ''
            const option: EChartsOption = {
                color: colors,
                title: {
                    bottom: 0,
                    left: '10%',
                    text: `主要获奖等级：${levelMax.value || ''}`,
                    textStyle: {
                        fontSize: 16,
                    },
                },
                legend: {
                  type: "scroll",
                  orient: 'vertical',
                  top: 'middle',
                  right:'10%',
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
                        width: 100,
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
                    const p = total ? ((tarValue / total) * 100).toFixed(2) : 0;
                    return `{c|${name}} {b|${tarValue}次} {a| ${p}}%`;
                }

                },
                tooltip: {
                    formatter: '{b} : {c} 次 ({d}%)'
                },
                series: [
                    {
                        radius: ['45%', '60%'],
                        center: ['20%', '50%'],
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
                            // formatter: '{total|' + 200 + '}' + '人',
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

        onMounted(() => {
            // nextTick(() => {
            //     initChart(topChart.value, [], topChartInstence)
            // })

        })
        return () => {
            return <div class='Certificate' {...content.attrs}>
                <section class='sch-right'>
                    <c-title title="特征分析" class='mg-b10' />
                    <div class='sch-chart'>
                        <div class='sch-r-top'>
                            <div class="c-title">获奖等级</div>
                            <div class='chart-lineBar' ref={topChart} />
                        </div>
                        <div style="background: #F7F7F7;padding:20px">
                            <div class="c-title">获奖证书</div>
                            <div class="txt-content-box">
                              <div class="txt-content">
                                    获得证书 <span class="bold">{count.value}本</span>
                                </div>
                                <div class="txt-content">
                                    获奖类别 <span class="bold">{countType.value}类</span>
                                </div>
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
                />
                <RightView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}
                    params={props.params}
                />
                  <WarningSeal name="获奖证书" ident='Award_certificate'/>
            </div>
        }
    }
})

Scholarship.Left = LeftView
Scholarship.Right = RightView
export default Scholarship