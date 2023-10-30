<template>
    <el-dialog v-model="dialogVisible"
        :title="user_group_name + '人群名单'"
        width="65%">
        <section>
            <el-row :gutter="20">
                <el-col :span="4">
                    <div class="input-box">
                        <label>性别：</label>
                        <el-select v-model="formData.sex" class="m-2" placeholder="请选择" size="large">
                            <el-option label="男" value="男"/>
                            <el-option label="女" value="女"/>
                        </el-select>
                    </div>
                </el-col>

                <el-col :span="5">
                    <div class="input-box">
                        <label>学院：</label>
                        <el-select v-model="formData.collegeId" class="m-2" placeholder="请选择" size="large">
                            <el-option v-for="item in userInfoStore.$state.orgType.collegeOrgList"
                            :key="item.value"
                            :label="item.label" 
                            :value="item.value"/>
                        </el-select>
                    </div>
                </el-col>

                <el-col :span="4">
                    <div class="input-box">
                        <label>状态：</label>
                        <el-select v-model="formData.state" class="m-2" placeholder="请选择" size="large">
                            <el-option label="未关注" value="2"/>
                            <el-option label="关注" value="1"/>
                        </el-select>
                    </div>
                </el-col>

                <el-col :span="4">
                    <div class="input-box">
                        <el-input v-model="formData.searchKey" placeholder="请输入姓名、学号搜索" />
                    </div>
                </el-col>

                <el-col :span="6">
                    <div class="input-box">
                        <el-button size="large" @click="filtrOperation('reset')">重置</el-button>
                        <el-button class="query-btn" size="large" type="primary" @click="filtrOperation('search')">搜索</el-button>
                        <el-button size="large" @click="filtrOperation('export')">导出</el-button>
                    </div>
                </el-col>
            </el-row>
            <div class="search-box mg-b20">
                
                
                
                
                
                
            </div>
            <c-table align="center"
            :columnList="columnList"
            :data="tableData"
            :pages="pages"
            height="400"
            @changeCurrent="(v: number) => pages.current = v" 
            @changeSize="(v: number) => pages.size = v"
            v-loading="loading"
            >
                <template #state="{data}">
                    <span>{{ data.state == 1 ? '关注': '未关注' }}</span>
                </template>
                <template #operation="{ data }">
                    <el-button style="color:#005DA7" link>学生个像</el-button>
                    <el-button v-if="data.state == 1" type="danger" link
                    @click="clickHandle(omit(data, '$index') as ListType, '2')">取消关注</el-button>
                    <el-button v-else style="color:#005DA7" link
                        @click="clickHandle(omit(data, '$index') as ListType, '1')">关注</el-button>
                </template>
            </c-table>
        </section>

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
    </el-dialog>
</template>
    
<script setup lang='ts'>
import { ref, reactive, computed, onMounted, watch, toRef } from 'vue'
import { userStore } from '@/store/user'
import { editUserState, getUserList, exportUserList } from '@/api/modules/attentionGroup';
import { ListType } from '@/api/types/attentionGroup';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { omit } from 'lodash';
import { downloadFile } from '@/hooks/index'
import UserMessage from './UserMessage';

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

const props = defineProps<{
    visible: boolean,
    user_group_id: number,
    user_group_name: string
}>()

const userInfoStore = userStore();
 
const formData = reactive({
    sex: '',
    collegeId: '',
    state: '',
    searchKey: ''
})

const loading = ref(false)

const emits = defineEmits(['update:visible']);

const dialogVisible = computed({
    get:() => {
        return props.visible
    },
    set:(visible: boolean) => {
        emits('update:visible', visible);
    }
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
        width: '150'
    },
    {
        prop: 'college',
        label: '学院(所属学院)',
        width: '180'
    },
    {
        slot: 'state',
        label: '状态',
        width: '100'
    },
    {
        prop: 'reason',
        label: '关注原因'
    },
    {
        slot: 'operation',
        label: '操作',
        width: '200'
    },
]

const tableData = ref<ListType[]>([])

const pages = reactive({
    current: 1,
    size: 10,
    total: 0,
})

const clickHandle = (data: Omit<ListType, 'pageNumber' | 'pageSize'>, type: '1' | '2') => {
    console.log(data);
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

/**
 * 获取表格数据
 */
 const getTableData = () => {
    loading.value = true;
    
    getUserList({
        ...formData,
        user_group_id: props.user_group_id,
        pageNumber: pages.current,
        pageSize: pages.size,
    }).then(res => {
        if (res.code == 1) {
            const data = res.data
            pages.total = data.total
            tableData.value = data.list
            loading.value = false
        }
    })
}

const filtrOperation = (type: string) => {
    if(['reset', 'search'].includes(type)) {
        if(type == 'reset') {
            for(let key in formData) formData[key] = '';
        }
        getTableData()
    } else {
        exportUserList({...formData, user_group_id: props.user_group_id}).then(res => {
            downloadFile(res)
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

onMounted(() => {
    getTableData()
})
</script>
    
<style lang="scss" scoped>
section {
    .input-box {
        display: flex;
        align-items: center;
            // margin-right: 10px;
            label {
                font-size: 14px;
                font-family: Medium;
                color: #9A9A9A;
                line-height: 22px;
                width: 80px;
            }
            // :deep(.el-select)  {
            //     width: 150px;
            // }
        }
}
</style>