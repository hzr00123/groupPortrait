import './styles/common.scss'
import Search from '@/components/common/Search.vue'
import { defineComponent, onMounted, reactive, ref, toRef, watch, PropType } from 'vue'
import { ElButton, ElLink, ElTable, ElTableColumn, ElMessageBox, ElMessage, ElForm } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
    addSpecialDate,
    getSpecialDateList,
    deleteSpecialDateList,
    editSpecialDate
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

        const searchForm = reactive({
            specialDateName: '',
            startTime: '',
            endTime:''
        });

        const form = reactive({
            specialDateName: '',
            startTime:'',
            endTime: '',
            id:null
        })

        const searchConfig = reactive(
            [
                {
                    labelWidth:'100px',
                    inputWidth: '200px',
                    type: 'input',
                    label: '特殊日期：',
                    placeholder: '特殊日期',
                    key: 'specialDateName',
                },
                {
                    labelWidth:'100px',
                    inputWidth: '200px',
                    type: 'date',
                    label: '开始时间：',
                    placeholder: '开始时间',
                    dataType:'datetime',
                    format:'YYYY-MM-DD HH:mm:ss',
                    dataFormat:'YYYY-MM-DD HH:mm:ss',
                    key: 'startTime',
                },
                {
                    labelWidth:'100px',
                    inputWidth: '200px',
                    type: 'date',
                    dataType:'datetime',
                    label: '结束时间：',
                    dataFormat:'YYYY-MM-DD HH:mm:ss',
                    format:'YYYY-MM-DD HH:mm:ss',
                    placeholder: '结束时间',
                    key: 'endTime',
                },
            ]
            )

        const initSelect = async () => {
            // let res = await getOrgType({});
            // if (res.code == 1) {
            //     campusOrgList.value = res.data.campusOrgList;
            //     collegeOrgList.value = res.data.collegeOrgList;
            //     majorOrgList.value = res.data.majorOrgList;
            //     gradeOrgList.value = res.data.gradeOrgList;
            //     classOrgList.value = res.data.classOrgList;
            // }

            // let se = await getSelectData({ident:'Award_certificate'});
            // if (se.code == 1) {
            //     categoryList.value = []
            //     let arr: { name: any; value: any; }[] = []
            //     se.data.levels.forEach((ff:any) => {
            //        arr.push({
            //             name:ff,
            //             value:ff
            //         })
            //     })
            //     categoryList.value = arr
            // }
            getTableData();
        }

        const pages = reactive({
            current: 1,
            size: 10,
            total: 0,
        })
        const formRef = ref<FormInstance>()



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

        let getTableData = () => {
            getSpecialDateList({ ...searchForm,pageNum: pages.current,pageSize: pages.size }).then((res) => {
               if (res.data) {
                   pages.total = res.data.total;
                   tableData.value = res.data.list
               }
            })
        }


        const columnList = [
            {
                prop: 'specialDateName',
                label: '特殊日期',
            },
            {
                prop: 'startTime',
                label: '开始时间',
            },
            {
                prop: 'endTime',
                label: '结束时间',
            },
            {
                prop: 'btn',
                slot:'btn',
                label: '操作',
            },
        ]
        let formDialog = ref<boolean>(false)
        let titleTxt = ref('新增')
        const addDate = () => {
           form.specialDateName = ''
           form.startTime =''
           form.endTime = ''
           titleTxt.value = '新增'
           formDialog.value = true
        }

        const close = () => {
           formDialog.value = false
        }

        const editDate = (row: any) => {
            form.specialDateName = row.data.specialDateName
            form.startTime = row.data.startTime
            form.endTime = row.data.endTime
            form.id = row.data.id
            titleTxt.value = '编辑'
            formDialog.value = true
            formRef.value?.clearValidate()
        }





        const submitTransfer = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    if (form.id) {
                        editSpecialDate(form).then((res) => {
                            if (res.code === 1) {
                                ElMessage.success('编辑成功')
                                formDialog.value = false
                                getTableData()
                            }
                        })
                    } else {
                        addSpecialDate(form).then((res) => {
                            if (res.code === 1) {
                                ElMessage.success('新增成功')
                                formDialog.value = false
                                getTableData()
                            }
                        })
                    }
                }
            })
        }


        let delOne = (row: any) => {
             ElMessageBox.confirm(
                '确定删除已选中特殊日期?',
                { type: 'warning', title: '删除特殊日期' }
             ).then(() => {
                 let ids = []
                 ids.push(row.data.id)
                deleteSpecialDateList( {id:ids} ).then(res => {
                    if (res.code == 1) {
                        ElMessage.success(res.msg || '删除成功')
                        getTableData()
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

        let delList = (row: any) => {
            if (delArr.value.length === 0) {
                ElMessage.error('请至少选中一个删除')
                return false
            }
             ElMessageBox.confirm(
                '确认删除选中的特殊日期',
                { type: 'warning', title: '删除日期' }
             ).then(() => {
                deleteSpecialDateList( {id:delArr.value} ).then(res => {
                    if (res.code == 1) {
                        ElMessage.success(res.msg ||'删除成功')
                        getTableData()
                    }
                })
            })
        }
        // 验证时间段
        const validatePassTime = (rule: any, value: any, callback: any) => {
            if (form.startTime && form.endTime) {
               if(form.startTime < form.endTime) {
                    callback()
                } else {
                    callback(new Error(`开始时间不能大于结束时间`))
                }
            } else {
               // 不存在其中一个不用去验证 因为规则的必填已经有错误信息返回
               callback()
            }

        }
        const rules = reactive({
            specialDateName: [
                { required: true, message: '请输入特殊日期名称', trigger: 'blur' },
            ],
            startTime: [
                {
                    required: true, message: '请选择特殊日期的开始时间', trigger: 'blur',
                },
                { validator: validatePassTime, trigger: 'blur' }
            ],
            endTime: [
                { required: true, message: '请选择特殊日期的结束时间', trigger: 'blur' },
                { validator: validatePassTime,required: true, trigger: 'blur' }
            ],
        })

        return () => {
            return <div class='scholarship left'>
                <Search
                    search-config={searchConfig}
                    searchForm={searchForm}
                    onQueryClick={queryClick}
                    onResetClick={resetClick}
                />
                <c-card>
                    <div class='mg-b20'>
                        <ElButton onClick={addDate} type='primary' color='#005DA7' plain icon={'CirclePlus'}>新增特殊日期</ElButton>
                        <ElButton icon={'Delete'} type='danger' onClick={delList} plain>批量删除</ElButton>
                    </div>
                    <c-table
                        align="center"
                        columnList={columnList}
                        data={tableData.value}
                        pages={pages}
                        selection={true}
                        indexShow={true}
                        onChangeCurrent={changeCurrent}
                        onChangeSize={changeSize}
                        onChangeSelection={changeSelection}
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
                <el-dialog v-model={formDialog.value} title={titleTxt.value + `特殊日期`} width="30%">
                    <el-form model={form} rules={rules} ref={formRef} >
                        <el-form-item label="特殊日期" prop="specialDateName">
                            <el-input v-model={[form.specialDateName,['trim']]} maxlength='20' autocomplete="off" style='width:200px'/>
                        </el-form-item>
                        <el-form-item label="开始时间" prop="startTime">
                            <el-date-picker
                                v-model={form.startTime}
                                type="datetime"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请选择特殊日期的开始时间"
                            />
                        </el-form-item>
                        <el-form-item label="结束时间" prop="endTime">
                            <el-date-picker
                                v-model={form.endTime}
                                type="datetime"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请选择特殊日期的结束时间"
                            />
                        </el-form-item>
                    </el-form>
                    <el-button size="default" onClick={ close }>取消</el-button>
                    <el-button size="default" type="primary" onClick={ submitTransfer }>确定</el-button>
                </el-dialog>
            </div>
        }
    }
})

export default TableSetings