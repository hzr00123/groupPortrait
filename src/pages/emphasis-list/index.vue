<template>
    <div class="emphasis-list">
        <Search :search-config="searchConfig"
        :searchForm="searchForm"
        :rowNum="5"
        @queryClick="queryClick"
        @resetClick="resetClick"
        @selectChange="selectChange"/>

        <div class="cards-box mg-b20">
            <MiniCard v-for="item in cardList"
            :key="item.title"
            :item="item">
                <template #icon>
                    <el-progress type="circle"
                    :percentage="percentage"
                    :stroke-width="8"
                    color="#1D548D"
                    :width="70"
                    style="margin-right: 22px;" />
                </template>
            </MiniCard>
        </div>

        <input ref="uploadFiles"
        type="file"
        name="files"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel "
        multiple="multiple"
        style="display:none"
        @change="uploadFile">

        <c-card>
            <div class="batch-operate mg-b20">
                <c-button icon="add-icon" color="#E9F0FF"
                borderColor="#005DA7" :plain="true"
                @click="batchOperate('add')">
                    新增
                </c-button>

                <el-dropdown @command="handleDropdown">
                    <c-button icon="import-icon" color="#E9F0FF"
                    borderColor="#005DA7" :plain="true">
                        批量导入
                    </c-button>
                    <template #dropdown>
                        <el-dropdown-menu class="dropdown-style">
                            <el-dropdown-item command="uploadFiles">选取文件</el-dropdown-item>
                            <el-dropdown-item command="templateDownload">模版下载</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>



                <c-button icon="derive-icon" color="#E9F0FF"
                borderColor="#005DA7" :plain="true"
                @click="batchOperate('import')">
                    批量导出
                </c-button>
            </div>
            <c-table align="center"
            :selection="true"
            :columnList="columnList"
            :data="tableData"
            :pages="pages"
            height="400"
            @changeSelection="changeSelection"
            @changeCurrent="changeCurrent"
            @changeSize="changeSize"
            >
                <template #index="{ data }">{{ data.$index + 1 }}</template>
                <template #operation="{ data }">
                    <el-button style="color:#005DA7" link @click="singleOperate('look', data)">学生个像</el-button>
                    <el-button type="primary" link @click="singleOperate('remove', data)">移除重点名单</el-button>
                    <el-button style="color:#005DA7" link @click="singleOperate('attention', data)" v-if="data.involvedType == 2">关注</el-button>
                    <el-button style="color:#005DA7" link @click="attentionFun(data.id, 2)" v-else>取消</el-button>
                </template>
            </c-table>
        </c-card>

        <el-dialog
        v-model="dialogVisible"
        title="关注"
        width="30%"
        @closed="closed(ruleFormRef)">
            <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-width="190px">
                <el-form-item label="请输入关注该学生的原因：" prop="reason"
                style="display: flex;flex-direction: column;">
                    <el-input :rows="3" type="textarea"
                     v-model="ruleForm.reason" placeholder="请输入关注该学生原因" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm(ruleFormRef)">
                        关注
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog v-model="dialogVisible2" width="1300px" title="新增" v-if="dialogVisible2"  @closed="closed">
            <c-transfer ref="ctransfer"
            :selection="transferSelection"
            @transferSearch="transferSearch"
            @removeTags="transferRemoveTags">
                <c-table ref="transferTabl"
                    size="small"
                    align="center"
                    v-loading="transLoading"
                    :selection="true"
                    :columnList="transferColumnList"
                    :data="transferTableData"
                    :pages="transPages"
                    maxHeight="350"
                    @changeSelection="transferChangeSelection"
                    @changeCurrent="transChangeCurrent"
                    @changeSize="transChangeSize"
                    >
                </c-table>
            </c-transfer>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible2 = false">取消</el-button>
                    <el-button type="danger" @click="submitTransfer">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Search from '@/components/common/Search.vue'
import MiniCard from '@/pages/attention-group/components/MiniCard.vue'
import Progress from '@/pages/attention-group/components/Progress.vue'
import { FormInstance, FormRules, ElMessageBox, ElMessage  } from 'element-plus'
import { downloadFile } from '@/hooks'
import {
getImportantNameList,
getFocusGroupData,
getWarningStrategy,
getOrgType,
removeImportantName,
downTemplate,
getStudentInfo,
addImportantName,
involvedImportantName,
exportImportantNameData,
importImportantNameData
} from '@/api/modules/emphasisList'

interface StudentInfo {
    name: string
    campusName: string
    userName: string
}

const uploadFiles = ref();
const dialogVisible = ref(false)
const dialogVisible2 = ref(false)
const ctransfer = ref(null);
const transLoading = ref(false)
const transferTabl = ref();
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive({
    reason: ''
})
const rules = reactive<FormRules>({
    reason: [{required: true, message: '请输入关注该学生原因', trigger: 'blur'}]
})
const ID = ref()
const multipleSelection = ref([])
const transferSelection = ref<StudentInfo[]>([])

const searchConfig = reactive(
    [
        {
            label: '重点名单类型：',
            labelWidth: '110px',
            inputWidth: '150px',
            type: 'select',
            placeholder: '请重点名单类型',
            key: 'importantNameListType',
            opKey: 'value',
            opLabel: 'label',
            options: [
                { label: '关注人群', value: '关注人群' },
                { label: '预警策略名单', value: '预警策略名单' },
                { label: '批量导入', value: '批量导入' },
                { label: '单个新增', value: '单个新增' }
            ],
        },
        {
            label: '关注人群：',
            labelWidth: '84px',
            inputWidth: '150px',
            type: 'select',
            placeholder: '请选择关注人群',
            key: 'focusGroup',
            opKey: 'value',
            opLabel: 'label',
            options: [],
        },
        {
            label: '预警策略名单：',
            labelWidth: '110px',
            inputWidth: '150px',
            type: 'select',
            placeholder: '请选择预警策略名单',
            key: 'warningName',
            opKey: 'value',
            opLabel: 'label',
            options: [],
        },
        {
            label: '性别：',
            labelWidth: '55px',
            inputWidth: '120px',
            type: 'select',
            placeholder: '请选择性别',
            key: 'sex',
            opKey: 'value',
            opLabel: 'label',
            options: [
                { label: '男', value: '男' },
                { label: '女', value: '女' }
            ]
        },
        {
            label: '校区：',
            labelWidth: '55px',
            inputWidth: '150px',
            type: 'select',
            placeholder: '请选择校区',
            key: 'campusId',
            opKey: 'value',
            opLabel: 'label',
            options: [],
        },
        {
            label: '学院：',
            labelWidth: '55px',
            inputWidth: '150px',
            type: 'select',
            placeholder: '请选择学院',
            key: 'collegeId',
            opKey: 'value',
            opLabel: 'label',
            options: [],
        },
        {
            label: '专业：',
            labelWidth: '55px',
            inputWidth: '150px',
            type: 'select',
            placeholder: '请选择专业',
            key: 'majorId',
            opKey: 'value',
            opLabel: 'label',
            options: [],
        },
        {
            label: '年级：',
            labelWidth: '55px',
            inputWidth: '150px',
            type: 'select',
            placeholder: '请选择年级',
            key: 'gradeId',
            opKey: 'value',
            opLabel: 'label',
            options: [],
        },
        {
            label: '班级：',
            labelWidth: '55px',
            inputWidth: '150px',
            type: 'select',
            placeholder: '请选择班级',
            key: 'classId',
            opKey: 'value',
            opLabel: 'label',
            options: [],
        },
        {
            inputWidth: '180px',
            type: 'input',
            placeholder: '请输入姓名或学号搜索',
            key: 'searchKey'
        },
    ]
)

const searchForm = reactive({
    importantNameListType: '',
    focusGroup: '',
    warningName: '',
    sex: '',
    campusId: '',
    collegeId: '',
    majorId: '',
    gradeId: '',
    classId: '',
    searchKey: ''
});

const searchData = ref({})

const cardList = reactive(
    [
        {
            title: '重点名单人数',
            titColor: '#1D558D',
            num: 0,
            numColor: '#063565',
            unit: '人',
            unitColor: '#628AB0',
            bg:  'mini-card2.png'
        },
        {
            icon: 'gender-icon',
            title: '男女比例',
            titColor: '#6376DD',
            num: 5,
            numColor: '#3848A6',
            ratio: 4,
            ratioColor: '#6477DD',
            bg: 'mini-card3.png'
        }
    ]
)

const percentage = ref(0)

const columnList = [
    {
        slot: 'index',
        label: '序号',
        width: '100'
    },
    {
        prop: 'studentName',
        label: '姓名',
        width: '110'
    },
    {
        prop: 'sex',
        label: '性别',
        width: '100'
    },
    {
        prop: 'studentCode',
        label: '学号',
        width: '180'
    },
    {
        prop: 'campusName',
        label: '校区',
        width: '150'
    },
    {
        prop: 'collegeName',
        label: '学院',
        width: '150'
    },
    {
        prop: 'majorName',
        label: '专业',
        width: '150'
    },
    {
        prop: 'gradeName',
        label: '年级',
        width: '150'
    },
    {
        prop: 'className',
        label: '班级',
        width: '100'
    },
    {
        prop: 'importantNameListType',
        label: '重点名单类型',
        width: '150'
    },
    {
        prop: 'focusGroup',
        label: '关注群体',
        width: '120'
    },
    {
        prop: 'warningNameList',
        label: '预警名单',
        width: '120'
    },
    {
        prop: 'involvedReason',
        label: '关注原因',
        width: '150'
    },
    {
        slot: 'operation',
        label: '操作',
        width: '300',
        fixed: 'right'
    }
]

const tableData = ref([])

const transferColumnList = [
    {
        prop: 'name',
        label: '姓名',
        width: '110'
    },
    {
        prop: 'userName',
        label: '学号'
    },
    {
        prop: 'campusName',
        label: '组织机构'
    },
]

const transferTableData = ref([])

const transferSearch = (val: string) => {
    transPages.current = 1;
    searchKey.value = val;
    initStudentInfo();
}

const transferRemoveTags = (index: number) => {
    transferTabl.value.checkSelection([transferSelection.value[index]], false);
}

const transferChangeSelection = (selection: StudentInfo[]) => {
    transferSelection.value = selection;
}

const pages = {
    current: 1,
    size: 10,
    total: 0,
}

const queryClick = (form: object) => {
    let props = ['campusId', 'classId', 'collegeId', 'gradeId', 'majorId'];
    searchData.value['orgDataInfoEntity'] = {}
    for(let key in form) {
        if(form[key]) {
            if(props.includes(key)) {
                searchData.value['orgDataInfoEntity'][key] = form[key]
            } else {
                searchData.value[key] = form[key]
            }
        }
    }
    initList();
}

const resetClick = () => {
    searchData.value = {}
    for(let key in OrgTypeParams) {
        OrgTypeParams[key] = undefined
    }
    initList();
    initSelect();
}

const OrgTypeParams = reactive({})

const selectChange = (key: string) => {
    let conditions = ['campusId', 'collegeId', 'majorId', 'gradeId', 'classId']
    if(conditions.includes(key)) {
        OrgTypeParams[key] = searchForm[key] || undefined
        if(key === 'campusId') {
            OrgTypeParams['collegeId'] = undefined;
            OrgTypeParams['majorId'] = undefined;
            OrgTypeParams['gradeId'] = undefined;
            OrgTypeParams['classId'] = undefined;
            searchForm['collegeId'] = '';
            searchForm['majorId'] = '';
            searchForm['gradeId'] = '';
            searchForm['classId'] = '';
        } else if(key === 'collegeId') {
            OrgTypeParams['majorId'] = undefined;
            OrgTypeParams['gradeId'] = undefined;
            OrgTypeParams['classId'] = undefined;
            searchForm['majorId'] = '';
            searchForm['gradeId'] = '';
            searchForm['classId'] = '';
        } else if(key === 'majorId') {
            OrgTypeParams['gradeId'] = undefined;
            OrgTypeParams['classId'] = undefined;
            searchForm['gradeId'] = '';
            searchForm['classId'] = '';
        } else if(key === 'gradeId') {
            OrgTypeParams['classId'] = undefined;
            searchForm['classId'] = '';
        }

        initSelect()
    }
}

const handleDropdown = async (type: string) => {
    if(type === 'uploadFiles') {
        uploadFile()
    } else {
        const res = await downTemplate();
        await downloadFile(res)
    }
}

const transPages = reactive({
    current: 1,
    size: 10,
    total: 0,
})

const searchKey = ref('')

const changeSelection = (val: []) => {
    multipleSelection.value = val;
}
const changeCurrent = (current: number) => {
    pages.current = current;
    initList()
}
const changeSize = (size: number) => {
    pages.current = 1;
    pages.size = size;
    initList()
}
const batchOperate = async (type: string) => {
    if(type === 'add') {
        dialogVisible2.value = true;
        initStudentInfo()
    } else {
        if(!multipleSelection.value.length) {
            ElMessage.warning('请勾选后再导出！')
            return;
        }
        let rowList = multipleSelection.value.map((it: any) => it.id)
        exportImportantNameData(rowList).then(async (res) => {
           await downloadFile(res);
           ElMessage.success('导出成功！')
        })
    }
    console.log(type);
}

const submitTransfer = async () => {
    let userNameList = transferSelection.value.map((it: any) => it.userName);
    const res = await addImportantName(userNameList);
    if(res.code === 1) {
        dialogVisible2.value = false;
        initList();
    }
}

const singleOperate = (type: string, row: object) => {
    if(type === 'attention') {
        dialogVisible.value = true;
        ID.value = row.id
    } else if(type === 'remove') {
        ElMessageBox.confirm(
            '确认将已选学生移除重点名单?',
            '移除重点名单',
            {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
            }
        )
        .then(() => {
            removeImportantName({ id: row.id }).then(res => {
                if(res.code === 1) {
                    ElMessage.success('删除成功！')
                    initList()
                }
            })
        })
        .catch(() => {

        })
    }
    console.log(type, row);
}

const attentionFun = async (id: number, type: number, involvedReason?: string) => {
    let params = {
        id: id,
        involvedType: type,
        involvedReason: involvedReason
    }
    const res = await involvedImportantName(params);
    if(res.code === 1) {
        if(type == 1) {
            ElMessage.success('关注成功！')
        } else {
            ElMessage.success('已取消关！')
        }
        dialogVisible.value = false;
        initList();
    }
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
    await formEl.validate((valid, fields) => {
    if (valid) {
        attentionFun(ID.value , 1, ruleForm.reason)
    } else {
      console.log('error submit!', fields)
    }
  })
}

const closed = (formEl: FormInstance | undefined) => {
    transferSelection.value = []
    if (!formEl) return;
    ruleForm.reason = ''
    formEl.clearValidate()
}

const uploadFile = () => {
    uploadFiles.value.click();
    uploadFiles.value.addEventListener('change', async (event: any) => {
        let formData = new FormData();
        let file = event.target.files[0];
        formData.append('file', file);
        event.target.value = ""
        importImportantNameData(formData).then(res => {
            if(res.code === 1) {
                ElMessage.success('导入成功！');
                initList();
            }
        })
    })
}

onMounted(() => {
    initList();
    initSelect()
})

const initList = async () => {
    let params = {
        pageNum: pages.current,
        pageSize: pages.size,
        ...searchData.value
    }
    let { data } = await getImportantNameList(params);
    tableData.value = data.dataList;
    pages.total = data.total;
    percentage.value = Number(data.percentage);
    cardList.forEach((it, index) => {
        if(it.title === '重点名单人数') {
            cardList[index].num = data.importantNameNum
        } else {
            let ratio = typeof data.scale === 'string' ? data.scale.split(':') : [0, 0];
            cardList[index].num = ratio[0]
            cardList[index].ratio = ratio[1]
        }
    })

}

const initStudentInfo = async () => {
    transLoading.value =  true;
    let params = {
        searchKey: searchKey.value,
        pageNum: transPages.current,
        pageSize: transPages.size,
    }
    const { data } = await getStudentInfo(params)
    transferTableData.value = data.dataList;
    transPages.total = data.total;
    transLoading.value = false;
}

const transChangeCurrent = (current: number) => {
    transPages.current = current
    initStudentInfo()
}

const transChangeSize = (size: number) => {
    transPages.current = 1
    transPages.size = size
    initStudentInfo()
}

const initSelect = async () => {
    Promise.all([getFocusGroupData(),getWarningStrategy(), getOrgType(OrgTypeParams)])
    .then(res => {
        const focusGroupItem =  searchConfig.find(it => it.key === 'focusGroup');
        const warningItem =  searchConfig.find(it => it.key === 'warningName');
        const campusItem =  searchConfig.find(it => it.key === 'campusId');
        const collegeItem =  searchConfig.find(it => it.key === 'collegeId');
        const majorItem =  searchConfig.find(it => it.key === 'majorId');
        const gradeItem =  searchConfig.find(it => it.key === 'gradeId');
        const classItem =  searchConfig.find(it => it.key === 'classId');

        focusGroupItem!.options = handleOptions(res[0].data)
        warningItem!.options = handleOptions(res[1].data)
        campusItem!.options = handleOptions(res[2].data.campusOrgList, 'orgName', 'id')
        collegeItem!.options = handleOptions(res[2].data.collegeOrgList, 'orgName', 'id')
        majorItem!.options = handleOptions(res[2].data.majorOrgList, 'orgName', 'id')
        gradeItem!.options = handleOptions(res[2].data.gradeOrgList, 'orgName', 'id')
        classItem!.options = handleOptions(res[2].data.classOrgList, 'orgName', 'id')
    })

}

const handleOptions = (list: [] , key?: string, val?: string) => {
    const newList = list.map((it) => {
        if(key && val) {
            return {
                label: it[key],
                value: it[val]
            }
        } else {
            return {
                label: it,
                value: it
            }
        }
    })
    return newList
}
</script>

<style lang="scss" scoped>
.emphasis-list {
    .cards-box {
        display: flex;
        justify-content: center;
        :deep(.mini-card) {
            &:first-child {
                margin-right: 30px;
            }
        }
    }
    :deep(.el-dropdown) {
        margin: 0 15px;
        .el-button {
            &:focus-visible {
                outline: 2px solid #005DA7;
            }
        }

    }
}
</style>