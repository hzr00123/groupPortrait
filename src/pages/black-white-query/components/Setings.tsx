import './styles/common.scss'
import { queryBlackAndWriteListInfo,queryBlackAndWriteNameList,deleteBlackAndWriteStudent } from '@/api/modules/advancedSetting'
import Search from '@/components/common/Search.vue'
import { ElButton, ElLink, ElTable, ElTableColumn } from 'element-plus'
import { defineComponent, onMounted, reactive, ref, toRef, watch, PropType } from 'vue'
import { getChartDataDetailAny,exportGetChartDataDetail,getSelectData } from "@/api/modules/studentPortrait";
import { getOrgType } from "@/api/modules/emphasisList"
import { ElLoading,ElMessageBox,ElMessage } from 'element-plus'
import BarMultiSegment from '@/components/common/BarMultiSegment.vue';
import ColorCard from '@/components/common/ColorCard.vue';
import MiniCard from '@/pages/attention-group/components/MiniCard.vue'

const TableSetings = defineComponent({
    props: {
        type: {
            type: String as PropType<'black' | 'white'>
        }
    },
    setup(props, { emit }) {
        // const { type } = props
        let dialogTableVisible = ref(false)
        let tableData = ref([])
        const campusOrgList = ref([])
        const collegeOrgList = ref([])
        const majorOrgList = ref([])
        const gradeOrgList = ref([])
        const classOrgList = ref([])
        const categoryList = ref<{}[]>([])
        const loading = ref(false)


        const searchForm = reactive({
            sex: '',
            campusId: '',
            collegeId: '',
            majorId: '',
            gradeId: '',
            classId: '',
            name: '',
            searchKey:''
        });
        const searchConfig = reactive(
            [
                {
                    labelWidth: '66px',
                    inputWidth: '100px',
                    type: 'select',
                    label: '性别：',
                    placeholder: '性别',
                    key: 'sex',
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
                    labelWidth: '66px',
                    inputWidth: '120px',
                    type: 'select',
                    label: '校区：',
                    placeholder: '校区',
                    key: 'campusId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: campusOrgList,
                },
                {
                    labelWidth: '66px',
                    inputWidth: '120px',
                    type: 'select',
                    label: '学院：',
                    placeholder: '学院',
                    key: 'collegeId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: collegeOrgList,
                },
                {
                    labelWidth: '66px',
                    inputWidth: '120px',
                    type: 'select',
                    label: '专业：',
                    placeholder: '专业',
                    key: 'majorId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: majorOrgList,
                },
                {
                    labelWidth: '66px',
                    inputWidth: '120px',
                    type: 'select',
                    label: '年级：',
                    placeholder: '年级',
                    key: 'gradeId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: gradeOrgList,
                },
                {
                    labelWidth: '66px',
                    inputWidth: '120px',
                    type: 'select',
                    label: '班级：',
                    placeholder: '班级',
                    key: 'classId',
                    opKey: 'id',
                    opLabel: 'orgName',
                    options: classOrgList,
                },
                {
                    inputWidth: '120px',
                    type: 'select',
                    label: '黑/白名单：',
                    placeholder: '黑/白名单',
                    key: 'name',
                    opKey: 'value',
                    opLabel: 'name',
                    labelWidth: '88px',
                    options: categoryList,
                },
                {
                    inputWidth: '200px',
                    type: 'input',
                    label: '',
                    placeholder: '请输入姓名、学号搜索',
                    key: 'searchKey',
                },
            ]
            )

        const initSelect = async () => {

            let res = await getOrgType({});
            if (res.code == 1) {
                campusOrgList.value = res.data.campusOrgList;
                collegeOrgList.value = res.data.collegeOrgList;
                majorOrgList.value = res.data.majorOrgList;
                gradeOrgList.value = res.data.gradeOrgList;
                classOrgList.value = res.data.classOrgList;
            }

            let se = await queryBlackAndWriteNameList({ status:activeName.value === 'two' ? 2 : 1});
            if (se.code == 1) {
                categoryList.value = []
                let arr: { name: any; value: any; }[] = []
                se.data.forEach((ff:any) => {
                   arr.push({
                        name:ff,
                        value:ff
                    })
                })
                categoryList.value = arr
            }
            getTableData();
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
          initSelect()
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
            const list = ['campusId', 'collegeId', 'majorId', 'gradeId', 'classId',]
            if (list.includes(key)) {
                if (key === 'campusId') {
                searchForm.collegeId = '';
                searchForm.majorId = '';
                searchForm.gradeId = '';
                searchForm.classId = '';
                }
                if (key === 'collegeId') {
                searchForm.majorId = '';
                searchForm.gradeId = '';
                searchForm.classId = '';
                }
                if (key === 'majorId') {
                searchForm.gradeId = '';
                searchForm.classId = '';
                }
                if (key === 'gradeId') {
                searchForm.classId = '';
                }
                const params = {
                campusId: searchForm.campusId,
                collegeId: searchForm.collegeId,
                majorId: searchForm.majorId,
                gradeId: searchForm.gradeId,
                classId: searchForm.classId,
                }
                const res = await getOrgType(params);
                if (res.code == 1) {
                    if (key == 'campusId') {
                        collegeOrgList.value = res.data.collegeOrgList;
                        majorOrgList.value = res.data.majorOrgList;
                        gradeOrgList.value = res.data.gradeOrgList;
                        classOrgList.value = res.data.classOrgList;
                    }
                    if (key == 'collegeId') {
                        majorOrgList.value = res.data.majorOrgList;
                        gradeOrgList.value = res.data.gradeOrgList;
                        classOrgList.value = res.data.classOrgList;
                    }
                    if (key == 'majorId') {
                        gradeOrgList.value = res.data.gradeOrgList;
                        classOrgList.value = res.data.classOrgList;
                    }
                    if (key == 'gradeId') {
                        classOrgList.value = res.data.classOrgList;
                    }
                }
            }
        }

        let titleFrom = reactive({
            blackCount: 0,
            writeCount: 0,
            scale: '0:0',
            blackStudentProportion: '',
            writeStudentProportion:''
        })



        let getTableData = () => {
        //    const loading = ElLoading.service({
        //         lock: true,
        //         text: '加载中...',
        //         background: 'rgba(0, 0, 0, 0.7)',
        //     })
        loading.value = true
           queryBlackAndWriteListInfo({ ...searchForm,pageNum: pages.current,pageSize: pages.size, nameListStatus: activeName.value === 'first' ? 1 : 2 }).then((res) => {
               if (res.data) {
                //    loading.close()
                   pages.total = res.data.total;
                   tableData.value = res.data.rows
                   const { blackCount, writeCount, scale, blackStudentProportion, writeStudentProportion } = res.data
                   titleFrom = { blackCount, writeCount, scale, blackStudentProportion, writeStudentProportion }
                   cardList.value = [
                            {
                                title: '黑名单人数',
                                titColor: '#630F0C',
                                num: titleFrom.blackCount,
                                numColor: '#B22924',
                                unit: '人',
                                unitColor: '#B8A1A0',
                                bg: 'black-list.png',
                                percentage:titleFrom.blackStudentProportion
                            },
                            {
                                title: '白名单人数',
                                titColor: '#1D558D',
                                num: titleFrom.writeCount,
                                numColor: '#1D538C',
                                unit: '人',
                                unitColor: '#B8A1A0',
                                bg: 'white-list.png',
                                percentage:titleFrom.writeStudentProportion
                            },
                            {
                                icon: 'set-blackwhite-icon',
                                title: '黑白名单比例',
                                titColor: '#654004',
                                num: titleFrom.scale.split(':')[0],
                                numColor: '#A56500',
                                ratio: titleFrom.scale.split(':')[1],
                                ratioColor: '#F39704',
                                bg: 'black-white-trend.png'
                            }
                        ]
                    loading.value = false
               } else {
                    loading.value = false
               }
           }).catch(e => loading.value = false)
        }


        const handleClose = (done: () => void) => {
            done()
            dialogTableVisible.value = false
        }

        const columnList = [
            {
                prop: 'studentName',
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
                prop: 'campusName',
                label: '校区',
                },
            {
                prop: 'collegeName',
                label: '学院',
            },
            {
                prop: 'majorName',
                label: '专业',
            },
            {
                prop: 'gradeName',
                label: '年级',
            },
            {
                prop: 'className',
                label: '班级',
            },
            {
                prop: 'NAME',
                label: '黑名单',
            },
            {
                prop: 'btn',
                slot: 'btn',
                label: '操作',
            },
        ]

        const columnListBlack = [
             {
                prop: 'studentName',
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
                prop: 'campusName',
                label: '校区',
                },
            {
                prop: 'collegeName',
                label: '学院',
            },
            {
                prop: 'majorName',
                label: '专业',
            },
            {
                prop: 'gradeName',
                label: '年级',
            },
            {
                prop: 'className',
                label: '班级',
            },
            {
                prop: 'NAME',
                label: '白名单',
            },
            {
                prop: 'btn',
                slot: 'btn',
                label: '操作',
            },
        ]

        const cardList = ref(
            [
                {
                    title: '黑名单人数',
                    titColor: '#630F0C',
                    num: titleFrom.blackCount,
                    numColor: '#B22924',
                    unit: '人',
                    unitColor: '#B8A1A0',
                    bg: 'black-list.png',
                    percentage:titleFrom.blackStudentProportion
                },
                {
                    title: '白名单人数',
                    titColor: '#1D558D',
                    num: titleFrom.writeCount,
                    numColor: '#1D538C',
                    unit: '人',
                    unitColor: '#B8A1A0',
                    bg: 'white-list.png',
                    percentage:titleFrom.writeStudentProportion
                },
                {
                    icon: 'set-blackwhite-icon',
                    title: '黑白名单比例',
                    titColor: '#654004',
                    num: titleFrom.scale.split(':')[0],
                    numColor: '#A56500',
                    ratio: titleFrom.scale.split(':')[1],
                    ratioColor: '#F39704',
                    bg: 'black-white-trend.png'
                }
            ]
        )

        let delOne = (row: any) => {
             ElMessageBox.confirm(
                `确定将已选择学生移除该${activeName.value === 'first' ? '黑' : '白'}名单?`,
                { type: 'warning', title: '移除名单' }
             ).then(() => {
                // let ids = []
                // ids.push(row.data.id)
                deleteBlackAndWriteStudent( {id:row.data.id} ).then(res => {
                    if (res.code == 1) {
                        ElMessage.success('移除成功')
                        getTableData()
                    }
                })
            })
        }



        const activeName = ref('first')

        const changeActive = (val: any) => {
            activeName.value = val.props.name
            getTableData()
            initSelect()
        }
        return () => {
            return <div class='scholarship left'>
                <Search
                    rowNum={6}
                    search-config={searchConfig}
                    searchForm={searchForm}
                    onQueryClick={queryClick}
                    onResetClick={resetClick}
                    onSelectChange={selectChange} />
                <div class="cards-box mg-b20">

                       {
                        cardList.value.map(i => (
                                <MiniCard
                                    key={i.title}
                                    item={i}
                                    v-slots={{
                                        icon: () => <el-progress type="circle"
                                        percentage={i.percentage}
                                        stroke-width="8"
                                        color="#1D548D"
                                        width="70"
                                        style="margin-right: 22px;" />
                                    }}
                                >
                                </MiniCard>
                                // <ColorCard cardConfig={i} key={i.color} onClick={() => clickOn(i.isClick)} class={i.isClick?'cursor-pointer' :''}/>
                            ))
                        }

                </div>
                <el-tabs v-model={activeName} onTabClick={changeActive}>
                    <el-tab-pane label="黑名单人员" name="first">
                        <c-table
                            align="center"
                            v-loading={loading.value}
                            columnList={columnList}
                            data={tableData.value}
                            pages={pages}
                            onChangeCurrent={changeCurrent}
                            onChangeSize={changeSize}
                            height="460"
                             v-slots={{
                                btn: (row:any) =>
                                    <div>
                                        <el-button style="color:#B22924" onClick={delOne.bind(null, row)} link>移除</el-button>
                                    </div>
                                }}
                            >
                        </c-table>
                    </el-tab-pane>
                    <el-tab-pane label="白名单人员" name="two">
                        <c-table
                            align="center"
                            v-loading={loading.value}
                            columnList={columnListBlack}
                            data={tableData.value}
                            pages={pages}
                            onChangeCurrent={changeCurrent}
                            onChangeSize={changeSize}
                            height="460"
                            v-slots={{
                                btn: (row:any) =>
                                    <div>
                                        <el-button style="color:#B22924" onClick={delOne.bind(null, row)} link>移除</el-button>
                                    </div>
                                }}
                            >
                        </c-table>
                    </el-tab-pane>
                </el-tabs>

            </div>
        }
    }
})

export default TableSetings