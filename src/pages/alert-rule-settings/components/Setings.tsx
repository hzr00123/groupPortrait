import './styles/common.scss'
import Search from '@/components/common/Search.vue'
import { defineComponent, onMounted, reactive, ref, toRef, watch, PropType } from 'vue'
import { getOrgType } from "@/api/modules/emphasisList"
import { ElButton, ElLink, ElTable, ElTableColumn,ElMessageBox,ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
    pageWarningRuleList,
    deleteWarningRuleList
} from '@/api/modules/advancedSetting'

const TableSetings = defineComponent({
    props: {
        type: {
            type: String as PropType<'black' | 'white'>
        }
    },
    setup(props, { emit }) {
        // const { type } = props
        let tableData = ref([])
        const jump = useRouter()
        const listTable = ref()

        const searchForm = reactive({

        });
        const searchConfig = reactive(
            [
                {
                    labelWidth:'100px',
                    inputWidth: '200px',
                    type: 'input',
                    label: '策略名称：',
                    placeholder: '策略名称',
                    key: 'warning_policy_name',
                },
                {
                    labelWidth: '66px',
                    inputWidth: '200px',
                    type: 'select',
                    label: '类型：',
                    placeholder: '类型',
                    key: 'add_method',
                    opKey: 'value',
                    opLabel: 'label',
                    options: [
                        {
                            label: '不限',
                            value: ''
                        },
                        {
                            label: '手动创建',
                            value: '手动创建'
                        },
                        {
                            label: '自动同步',
                            value: '自动同步'
                        },
                    ],
                },
                {
                    labelWidth:'100px',
                    inputWidth: '200px',
                    type: 'input',
                    label: '策略对象：',
                    placeholder: '策略对象',
                    key: 'warning_policy_content',
                },
                {
                    labelWidth:'100px',
                    inputWidth: '200px',
                    type: 'input',
                    label: '预警内容：',
                    placeholder: '预警内容',
                    key: 'warning_content',
                },
                {
                    labelWidth:'100px',
                    inputWidth: '200px',
                    type: 'date',
                    label: '策略时间：',
                    placeholder: '开始时间',
                    dataType:'datetime',
                    dataFormat:'YYYY-MM-DD HH:mm:ss',
                    key: 'policy_start_time',
                },
                {
                    labelWidth:'20px',
                    inputWidth: '200px',
                    type: 'date',
                    label:'-',
                    dataType:'datetime',
                    dataFormat:'YYYY-MM-DD HH:mm:ss',
                    placeholder: '结束时间',
                    key: 'policy_end_time',
                },
                {
                    labelWidth:'100px',
                    inputWidth: '200px',
                    type: 'input',
                    label: '提醒人员：',
                    placeholder: '提醒人员',
                    key: 'remind_person',
                },
            ]
            )

        const pages = reactive({
            current: 1,
            size: 10,
            total: 0,
        })

        onMounted(() => {
            getTableData();
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

        let getTableData = () => {
           pageWarningRuleList({ ...searchForm, pageNum: pages.current,pageSize: pages.size }).then((res) => {
               if (res.code === 1) {
                   let dataObj = JSON.parse(JSON.stringify(res.data))
                   pages.total = dataObj.total;
                   tableData.value = dataObj.list
                   listTable.value.checkSelection()
                   tableData.value.forEach((item:any) => {
                        item.timeStr = ''
                        if (item.trigger_type == 1) {
                           item.timeStr = '同步后触发'
                        } else {
                            let str = ''
                            if (item.trigger_freq === 1) str = '每天'
                            if (item.trigger_freq === 2) {
                                switch (item.trigger_freq_week) {
                                    case '1':
                                        str = '每周' + '星期天'
                                        break;
                                    case '2':
                                        str = '每周' + '星期一'
                                        break;
                                    case '3':
                                        str = '每周' + '星期二'
                                        break;
                                    case '4':
                                        str = '每周' + '星期三'
                                        break;
                                    case '5':
                                        str = '每周' + '星期四'
                                        break;
                                    case '6':
                                        str = '每周' + '星期五'
                                        break;
                                    case '7':
                                        str = '每周' + '星期六'
                                        break;
                                    default:
                                        break;
                                }
                            }
                            if (item.trigger_freq === 3) {
                                str = '每月' + item.trigger_freq_day + '日'
                            }
                            const hour = `${Number(item.trigger_freq_hour) < 10 ? '0' + item.trigger_freq_hour : item.trigger_freq_hour}`
                            const minu = `${Number(item.trigger_freq_minutes) < 10 ? '0' + item.trigger_freq_minutes : item.trigger_freq_minutes}`
                            str += hour + ':' + minu
                           item.timeStr = str
                       }
                       item.warnStr = ''
                       let arr = JSON.parse(item.warning_level)
                       let strWarn = ''
                       arr.forEach((kk:any) => {
                           strWarn += kk.fieldName + ':'
                           kk.level_rule.forEach((ff:any) => {
                             strWarn += ff.levelInfo + ff.levelValueRule + ff.levelValue + ';'
                           })
                       })
                       item.warnStr = strWarn

                       item.timeEnd = (item.policy_start_time || '' )  + '-' +  (item.policy_end_time || '')
                   })
               }
           })
        }


        const columnList = [
            {
                prop: 'warning_policy_name',
                label: '策略名称',
            },
            {
                prop: 'add_method',
                label: '类型',
            },
            {
                prop: 'warning_policy_content',
                label: '策略对象',
            },
            {
                prop: 'warning_content',
                label: '预警内容',
            },
            {
                prop: 'warnStr',
                label: '预警等级',
            },
            {
                prop: 'timeStr',
                label: '触发时间',
            },
            {
                prop: 'timeEnd',
                label: '策略时间',
            },
            {
                prop: 'remind_person',
                label: '提醒人员',
            },
            {
                prop: 'btn',
                label: '操作',
                slot:'btn'
            }
        ]

        let delArr = ref<any>([])

        let editDate = (row:any) => {
            jump.push({ path: `/alert-rule-edit`, query: { id: row.data.id } })
        }

        const changeSelection = (arr: any) => {
            let arrDel: any[] = []
            arr.forEach((ele: any) => {
                arrDel.push(ele.id)
            });
            delArr.value = arrDel
        }

        let delOne = (row: any) => {
             ElMessageBox.confirm(
                '确认删除该规则?',
                { type: 'warning', title: '删除规则' }
             ).then(() => {
                 let ids = []
                 ids.push(row.data.id)
                deleteWarningRuleList( {id:ids} ).then(res => {
                    if (res.code == 1) {
                        ElMessage.info(res.msg || '删除成功')
                        getTableData()
                    }
                })
            })
        }

        let delList = (row: any) => {
            if (delArr.value.length === 0) {
                ElMessage.error('请至少选中一个删除')
                return false
            }
             ElMessageBox.confirm(
                '确认删除选中的规则?',
                { type: 'warning', title: '删除规则' }
             ).then(() => {
                deleteWarningRuleList( {id:delArr.value} ).then(res => {
                    if (res.code == 1) {
                        ElMessage.info(res.msg || '删除成功')
                        getTableData()
                    }
                })
            })
        }

        let addDate = () => {
            jump.push({ path: `/alert-rule-add`,query: {} })
        }
                        // selection={true}

        return () => {
            return <div class='scholarship left'>
                <Search
                    search-config={searchConfig}
                    searchForm={searchForm}
                    onQueryClick={queryClick}
                    onResetClick={resetClick}
                    rowNum={3}
                />
                <c-card>
                    <div class='mg-b20'>
                        <ElButton onClick={addDate} type='primary' color='#005DA7' plain icon={'CirclePlus'}>新增预警策略</ElButton>
                        <ElButton icon={'Delete'} onClick={delList} type='danger' plain>批量删除</ElButton>
                    </div>
                    <c-table
                        ref={listTable}
                        align="center"
                        columnList={columnList}
                        data={tableData.value}
                        pages={pages}
                        onChangeCurrent={changeCurrent}
                        onChangeSize={changeSize}
                        onChangeSelection={changeSelection}
                        selection={true}
                        indexShow={true}
                        height="460"
                        v-slots={{
                            btn: (row:any) =>
                                <div>
                                    <el-button style="color:#005DA7" onClick={editDate.bind(null, row)} link>编辑</el-button>
                                    <el-button style="color:#B22924" onClick={delOne.bind(null, row)} link>删除</el-button>
                                </div>
                            }}
                        >
                    </c-table>
                </c-card>
            </div>
        }
    }
})

export default TableSetings