import './styles/common.scss'
import { getBlackAndWriteList, deleteBlackAndWriteList, convertBlackAndWriteList } from '@/api/modules/advancedSetting'
import { TableData } from '@/api/types/advancedSetting'
import Search from '@/components/common/Search.vue'
import { ElButton, ElLink, ElTable, ElTableColumn,ElRadioGroup,ElRadio,ElInput,ElMessageBox,ElMessage } from 'element-plus'
import { defineComponent, onMounted, reactive, ref, toRef, watch, PropType } from 'vue'
import { useRouter } from 'vue-router'

const TableSetings = defineComponent({
    props: {
        type: {
            type: String as PropType<'black' | 'white'>
        }
    },
    setup(props, { emit }) {
        const { type } = props
        const label = type === 'black' ? '黑名单' : '白名单'
        const jump = useRouter()
        const searchConfig = [
            {
                type: 'input', // 类型
                label: `${label}:`,
                placeholder: `请输入${label}名称`, // 提示信息
                key: 'nameListContent', // 绑定数据
                labelWidth: '65px',
                inputWidth: '280px'
            },
            {
                type: 'input', // 类型
                label: '关联功能模块:',
                placeholder: `请输入关联功能模块`, // 提示信息
                key: 'relatedFunctionModule', // 绑定数据
                labelWidth: '110px',
                inputWidth: '280px'
            },
            {
                type: 'input', // 类型
                label: `原因:`,
                placeholder: `请输入设置${label}原因`, // 提示信息
                key: 'reason', // 绑定数据
                labelWidth: '65px',
                inputWidth: '280px'
            },
            {
                type: 'date', // 类型
                dataType:'datetime',
                label: `生效时段:`,
                placeholder: `请选择开始时间`,
                dataFormat:'YYYY-MM-DD HH:mm:ss',
                key: 'effectivePeriodStartTime', // 绑定数据
                labelWidth: '80px',
                inputWidth: '200px'
            },
            {
                type: 'date', // 类型
                label: `-`,
                dataType:'datetime',
                placeholder: `请选择结束时间`,
                dataFormat:'YYYY-MM-DD HH:mm:ss',
                key: 'effectivePeriodEndTime', // 绑定数据
                labelWidth: '20px',
                inputWidth: '280px'
            },
        ]

        const form = ref({})
        let resonDialog = ref(false)

        const pages = reactive({
            current: 1,
            size: 10,
            total: 0,
            small: true
        })
        const tableData = ref<TableData[]>([])

        const getData = () => {
            getBlackAndWriteList({
                nameListStatus: type === 'black' ? 1 : 2,
                pageNum: pages.current,
                pageSize: pages.size,
                ...form.value
            }).then(res => {
                if (res.code == 1) {
                    const data = res.data
                    pages.total = data.total
                    tableData.value = data.dataList
                }
            })
        }

        watch(
            [toRef(pages, 'current'), toRef(pages, 'size')],
            () => {
                getData()
            },
            { immediate: true }
        )

        const editEvt = (data: TableData | undefined, t: 'edit' | 'add') => {
            jump.push({ path: `/${type}-${t}`, query: { id: data?.id } })
        }

        let delList = (row: any) => {
            if (delArr.value.length === 0) {
                ElMessage.error('请至少选中一个删除')
                return false
            }
             ElMessageBox.confirm(
                `确定删除已选中${label}？`,
                { type: 'warning', title: `删除${label}` }
             ).then(() => {
                deleteBlackAndWriteList( {id:delArr.value} ).then(res => {
                    if (res.code == 1) {
                        ElMessage.success('删除成功')
                        getData()
                    }
                })
            })
        }

        let delArr = ref<any>([])
        const changeSelection = (arr: any) => {
            let arrDel: any[] = []
            arr.forEach((ele: any) => {
                arrDel.push(ele.id)
            });
            delArr.value = arrDel
        }


        const delEvt = (row:any) => {
            ElMessageBox.confirm(
                `确定删除已选中${label}？`,
                { type: 'warning', title: `删除${label}` }
             ).then(() => {
                 let ids = []
                 ids.push(row.id)
                deleteBlackAndWriteList( {id:ids} ).then(res => {
                    if (res.code == 1) {
                        ElMessage.success('删除成功')
                        getData()
                    }
                })
            })
        }


        let tableId = ref(null)
        const openDialog = (row:any) => {
            tableId.value = row.id
            resonDialog.value = true
        }

        const convertBtn = () => {
            let reason = resonVal.value === '其他' ? inputVal.value : resonVal.value
            convertBlackAndWriteList({id:Number(tableId.value),reason, nameListStatus:type === 'black' ? 2 : 1}).then((res) => {
                if (res.code == 1) {
                    ElMessage.success('转换成功')
                    resonDialog.value = false
                    getData()
                }
            })
        }

        const inputVal = ref('')
        const resonVal = ref('')

        const reasonList = reactive({
            '黑名单': [
                '违法',
                '犯罪',
                '违纪',
                '违规'
            ],
            '白名单': [
                '休学',
                '实习',
                '请假',
                '对外交流'
            ]
        })

        return () => {

            return <div class='table-seting'>
                <Search
                    search-config={searchConfig}
                    searchForm={form.value}
                    rowNum={3}
                    onQueryClick={getData}
                    onResetClick={getData}
                />
                <c-card>
                    <div class='mg-b20'>
                        <ElButton onClick={editEvt.bind(null, undefined, 'add')} type='primary' color='#005DA7' plain icon={'CirclePlus'}>{'新增' + label}</ElButton>
                        <ElButton icon={'Delete'} onClick={delList} type='danger' plain>批量删除</ElButton>
                    </div>
                    <c-table
                        height={500}
                        pages={pages}
                        data={tableData.value}
                        stripe
                        onChangeCurrent={(v: number) => pages.current = v}
                        onChangeSize={(v: number) => pages.size = v}
                        onChangeSelection={changeSelection}
                        headerCellStyle={{
                            background: '#E4E7ED',
                            color: '#000000',
                            fontWeight: 'bold',
                            fontFamily: 'Medium',
                        }}
                    >
                        <ElTableColumn type='selection' width={40} align='center' />
                        <ElTableColumn label='序号' type='index' width={60} align='center' />
                        <ElTableColumn showOverflowTooltip label={`${label}名称`} align='center' prop='name' />
                        <ElTableColumn showOverflowTooltip label={`${label}内容`} align='center' prop='nameListContent' />
                        <ElTableColumn showOverflowTooltip label='关联功能模块' align='center' prop='relatedFunctionModule' />
                        <ElTableColumn showOverflowTooltip label='原因' align='center' prop='reason' />
                        <ElTableColumn showOverflowTooltip label='生效时段' align='center' prop='effectivePeriod' />
                        <ElTableColumn showOverflowTooltip label='操作' width={200} align='center'>
                            {{
                                default: (scope: { row: TableData }) => {
                                    return <div class='flex just-b'>
                                        <ElLink underline={false} onClick={editEvt.bind(null, scope.row, 'edit')}>
                                            <span style='color: #005DA7;'>编辑</span>
                                        </ElLink>
                                        <ElLink type='danger' onClick={delEvt.bind(null, scope.row)} underline={false}>删除</ElLink>
                                        <ElLink underline={false} >
                                            <span style='color: #005DA7;' onClick={ openDialog.bind(null, scope.row) }>转为{type === 'black' ? '白名单' : '黑名单'}</span>
                                        </ElLink>
                                    </div>
                                }
                            }}
                        </ElTableColumn>
                    </c-table>
                </c-card>
                 <el-dialog
                    v-model={resonDialog.value}
                    title="转化原因"
                    width="30%"
                    align-center
                >
                    <span>请选择转换为{ type === 'black' ? '白名单' : '黑名单' }的原因</span>
                    <ElRadioGroup v-model={resonVal.value} class='selects'>
                        {
                            type === 'white' &&
                            <>
                                <ElRadio label="违法" />
                                <ElRadio label="犯罪" />
                                <ElRadio label="违规" />
                                <ElRadio label="违纪" />
                            </>
                        }
                        {
                            type === 'black' &&
                            <>
                                <ElRadio label="休学" />
                                <ElRadio label="实习" />
                                <ElRadio label="请假" />
                                <ElRadio label="对外交流" />
                            </>
                        }
                        <ElRadio label="其他">
                            其他
                            <ElInput disabled={resonVal.value !== '其他'} v-model={ inputVal.value } />
                        </ElRadio>
                    </ElRadioGroup>
                    <ElButton style="margin-top:10px;float:right;margin-left:10px;margin-bottom:10px" onClick={ () => resonDialog.value = false}>取消</ElButton>
                    <ElButton style="margin-top:10px;float:right;margin-bottom:10px" type="primary" onClick={ convertBtn }> 保存 </ElButton>
                </el-dialog>
            </div>
        }
    }
})

export default TableSetings