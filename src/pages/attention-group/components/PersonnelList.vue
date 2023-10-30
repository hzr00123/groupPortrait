<template>
    <div class="personnel-list">
        <Search :isExport="true" 
        :search-config="searchConfig" 
        :searchForm="searchForm" 
        :rowNum="4" 
        @queryClick="queryClick"
        @resetClick="resetClick"
        @exportClick="exportClick" />

        <c-table align="center" :columnList="columnList" :data="tableData" :pages="pages" height="400"
            @changeCurrent="(v: number) => pages.current = v" @changeSize="(v: number) => pages.size = v" v-loading="loading">
            <template #operation="{ data }">
                <el-button style="color:#005DA7" link>学生个像</el-button>
                <el-button v-if="data.state == 1" type="danger" link
                    @click="clickHandle(omit(data, '$index') as ListType, '2')">取消关注</el-button>
                <el-button v-else style="color:#005DA7" link
                    @click="clickHandle(omit(data, '$index') as ListType, '1')">关注</el-button>
            </template>
        </c-table>

        <ElDialog v-model="visible" width="460" title="关注" top="30vh">
            <ElForm :model="reasonFrom" label-suffix=":" label-position="top" ref="reasonFromRef">
                <ElFormItem prop="reason" label="请输入关注该学生的原因"
                    :rules="[{ required: true, message: '关注原因必填', trigger: 'bulr' }]">
                    <ElInput type="textarea" :rows="2" placeholder="请输入关注原因" v-model="reasonFrom.reason" />
                </ElFormItem>
            </ElForm>
            <template #footer>
                <ElButton type="primary" @click="visible = false">取消</ElButton>
                <ElButton type="primary" @click="editUserStateEvt('1')">关注</ElButton>
            </template>
        </ElDialog>
    </div>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted, toRef, watch } from 'vue'
import Search from '@/components/common/Search.vue'
import { userStore } from '@/store/user'
import { editUserState, exportUserList, getUserList } from '@/api/modules/attentionGroup';
import { ListType, UserListParams } from '@/api/types/attentionGroup';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import UserMessage from './UserMessage';
import { omit } from 'lodash';
import { downloadFile } from '@/hooks';

const userInfoStore = userStore();
const props = defineProps<{
    currentInfo: { [key: string]: string | number }
}>()


// console.log(userInfoStore.$state.orgType, 'userInfoStore');

const searchConfig = reactive([
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
        options: userInfoStore.$state.orgType.campusOrgList,
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
        options: userInfoStore.$state.orgType.collegeOrgList,
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
        options: userInfoStore.$state.orgType.majorOrgList,
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
        options: userInfoStore.$state.orgType.gradeOrgList,
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
        options: userInfoStore.$state.orgType.classOrgList,
    },
    {
        label: '状态：',
        labelWidth: '55px',
        inputWidth: '150px',
        type: 'select',
        placeholder: '请选择班级',
        key: 'state',
        opKey: 'value',
        opLabel: 'label',
        options: [
            { label: '未关注', value: '2' },
            { label: '关注', value: '1' }
        ],
    },
    {
        inputWidth: '180px',
        type: 'input',
        placeholder: '请输入姓名或学号搜索',
        key: 'searchKey'
    },
])

const searchForm = reactive<Omit<UserListParams, 'pageNumber' | 'pageSize'>>({
    calculate_time: '',
    campus: '',
    campusId: '',
    campus_org_id: '',
    classId: '',
    class_org_id: '',
    classes: '',
    college: '',
    collegeId: '',
    college_org_id: '',
    endTime: '',
    grade: '',
    gradeId: '',
    grade_org_id: '',
    ident: '',
    major: '',
    majorId: '',
    major_org_id: '',
    name: '',
    reason: '',
    searchKey: '',
    sex: '',
    startTime: '',
    state: '',
    userName: '',
    user_group_id: ''
})


const columnList = [
    {
        prop: 'name',
        label: '姓名',
        width: '110'
    },
    {
        prop: 'sex',
        label: '性别',
        width: '80'
    },
    {
        prop: 'userName',
        label: '学号',
        width: '180'
    },
    {
        prop: 'campus',
        label: '校区',
        width: '150'
    },
    {
        prop: 'college',
        label: '学院',
        width: '150'
    },
    {
        prop: 'major',
        label: '专业',
        width: '150'
    },
    {
        prop: 'grade',
        label: '年级',
        width: '150'
    },
    {
        prop: 'classes',
        label: '班级',
        width: '100'
    },
    {
        prop: 'stateName',
        label: '状态',
        width: '100'
    },
    {
        prop: 'reason',
        label: '关注原因',
        width: '180'
    },
    {
        slot: 'operation',
        label: '操作',
        width: '180',
        fixed: 'right'
    }
]

const tableData = ref<ListType[]>([])

const pages = reactive({
    current: 1,
    size: 10,
    total: 0,
})


const reasonFrom = ref<Omit<ListType, 'pageNumber' | 'pageSize'>>({
    reason: '',
    classId: '',
    gradeId: '',
    majorId: '',
    collegeId: '',
    campusId: '',
    user_group_id: '',
    userName: '',
    calculate_time: '',
    state: '',
    name: '',
    sex: '',
    campus: '',
    college: '',
    major: '',
    grade: '',
    classes: '',
    campus_org_id: '',
    college_org_id: '',
    major_org_id: '',
    grade_org_id: '',
    class_org_id: '',
    startTime: '',
    endTime: '',
    searchKey: '',
    ident: '',
})
const reasonFromRef = ref<FormInstance>()
const visible = ref(false)
const loading = ref(false)

/**
 * 获取表格数据
 */
const getTableData = () => {
    loading.value = true
    getUserList({
        ...searchForm,
        pageNumber: pages.current,
        pageSize: pages.size,
        user_group_id: props.currentInfo.id
    }).then(res => {
        if (res.code == 1) {
            const data = res.data
            pages.total = data.total
            tableData.value = data.list
            loading.value = false
        }
    })
}

const clickHandle = (data: Omit<ListType, 'pageNumber' | 'pageSize'>, type: '1' | '2') => {
    reasonFrom.value = data
    if (type == '1') {
        visible.value = true
        return
    }
    editUserStateEvt('2')
}

const editUserStateEvt = (state: '1' | '2') => {
    if (state == '1') {
        reasonFromRef.value?.validate(valid => {
            if (valid) {
                editUserState({ ...reasonFrom.value, state }).then(res => {
                    if (res.code == 1) {
                        visible.value = false
                        ElMessageBox.alert(
                            '关注成功',
                            {
                                title: '关注', confirmButtonText: '我知道了',
                                message: UserMessage
                            }
                        ).then(() => getTableData())
                    }
                })
            }
        })

    } else {
        ElMessageBox.confirm(
            '确定取消关注已选学生？',
            { type: 'warning', title: '取消关注' }
        ).then(() => {
            editUserState({ ...reasonFrom.value, state }).then(res => {
                if (res.code == 1) {
                    ElMessage.success('取消成功')
                    getTableData()
                }
            })
        })
    }
}

watch(
    [toRef(pages, 'current'), toRef(pages, 'size')],
    () => {
        getTableData()
    },
    { immediate: true }
)

const queryClick = (form: object) => {
    // console.log(form);
    getTableData()
}

const resetClick = () => {
    getTableData()
}

const exportClick = () => {
    exportUserList({
        ...searchForm,
        user_group_id: props.currentInfo.id
    }).then(res => {
        downloadFile(res)
    })
}

const handleSearchOptions = () => {
    console.log(userInfoStore.$state.orgType);

    // const campusItem = searchConfig.find(it => it.key === 'campusId');
    // const collegeItem = searchConfig.find(it => it.key === 'collegeId');
    // const majorItem = searchConfig.find(it => it.key === 'majorId');
    // const gradeItem = searchConfig.find(it => it.key === 'gradeId');
    // const classItem = searchConfig.find(it => it.key === 'classId');

    // campusItem!.options = userInfoStore.$state.orgType.campusOrgList
    // collegeItem!.options = userInfoStore.$state.orgType.collegeOrgList
    // majorItem!.options = userInfoStore.$state.orgType.majorOrgList
    // gradeItem!.options = userInfoStore.$state.orgType.gradeOrgList
    // classItem!.options = userInfoStore.$state.orgType.classOrgList
}

onMounted(() => {
    // handleSearchOptions();
})
</script>

<style></style>