<template>
    <div class="add-seting">
        <ElForm label-suffix=":" label-width="121" ref="formRef" :rules="rules" :model="form" >
            <c-title :title="router.meta.title" />
            <ElFormItem :label="`${label}名称`" prop="name" >
                <ElInput v-model="form.name"  placeholder="名称" style="width: 830px;" maxlength="50"/>
            </ElFormItem>
            <ElFormItem :label="`${ label }内容`" prop="nameListContent">
                <div class="already-select">
                    <div v-if="form.nameListContent.length > 0" class="tag" v-for="(it, ix) in form.nameListContent">
                        {{ it.name }}
                        <!-- <el-icon size='16' color='#B1C1CF' style="cursor: pointer;" @click="transferRemoveTags(ix, it)" ><Close /></el-icon> -->
                    </div>
                    <p v-else class="placeholder">请点击右侧“+”按钮新增名单</p>
                </div>
                <svg-icon  @click="addNameListContent" style="margin-left:29px;cursor:pointer" icon-class="square-add"/>
            </ElFormItem>

            <ElFormItem label="关联功能模块" prop="relatedFunctionModule" >
                <!-- <ElInput v-model="form.selecedVal" :rows="3" type="textarea" placeholder="请点击右侧“+”按钮新增关联模块" style="width: 830px;"/> -->
                <div class="already-select">
                    <div v-if="form.relatedFunctionModule.length > 0" class="tag" v-for="(it, ix) in form.relatedFunctionModule">
                        {{ it.name }}
                        <!-- <el-icon size='16' color='#B1C1CF' style="cursor: pointer;" @click="transferRemoveTags(ix, it)" ><Close /></el-icon> -->
                    </div>
                    <p v-else class="placeholder">请点击右侧“+”按钮新增关联模块</p>
                </div>
                <svg-icon  @click="addRelatedFunctionModule" style="margin-left:29px;cursor:pointer" icon-class="square-add"/>
            </ElFormItem>
            <ElFormItem label="原因" prop="reason">
                <ElRadioGroup v-model="form.reason">
                    <ElRadio :label="itm" v-for="itm in reasonList[label]"/>
                    <ElRadio label="其他">
                        其他
                        <ElInput :disabled="form.reason !== '其他'" v-model="inputVal" maxlength="50"/>
                    </ElRadio>
                </ElRadioGroup>
            </ElFormItem>
            <ElFormItem label="生效时段">
                <ElFormItem prop="effectivePeriodStartTime">
                    <ElDatePicker clearable value-format="YYYY-MM-DD HH:mm:ss" v-model="form.effectivePeriodStartTime" type="datetime" placeholder="请选择生效开始时间"/>
                </ElFormItem>
                <span class="text">-</span>
                <ElFormItem prop="effectivePeriodEndTime">
                    <ElDatePicker clearable value-format="YYYY-MM-DD HH:mm:ss" v-model="form.effectivePeriodEndTime" type="datetime" placeholder="请选择生效结束时间"/>
                </ElFormItem>
                <el-tooltip
                placement="right-start"
                effect="customized"
                raw-content
                :content="`<div><h1>预警时间段说明</h1><p>不选择“开始时间”及“结束时间”：${label}生效时间段不限<br/>
                        选择“开始时间”，不选择“结束时间”：${label}生效时间段从已选择的开始时间开始计算，无结束时间<br/>
                        不选择“开始时间”，选择“结束时间”：${label}生效时间段为成功保存时的系统时间至已选择的结束时间<br/>
                        选择“开始时间”及“结束时间”：${label}生效时间段为已选择的开始时间至选择的结束时间</p></div>`">
                    <el-icon color="#FFCC00" style="margin-left: 20px;font-size: 15px;"><WarningFilled /></el-icon>
                </el-tooltip>
            </ElFormItem>
        </ElForm>
        <el-dialog v-model="dialogTableVisible" :title="label" style="width: 1300px;">
            <div style="width: 1200px;">
                <c-transfer ref="ctransfer" :title="['待选名单', '已选名单']" :width="['59%', '39%']"
                    :selection="transferSelection" @transferSearch="transferSearch"
                    @removeTags="transferRemoveTags">
                    <c-table v-if="transferActive === 1" row-key="id" ref="transferTabl" size="small" align="center" :selection="true"
                        height="300px" :columnList="transferColumnList" :data="transferTableData"
                        :pages="transPages" maxHeight="350" @changeSelection="transferChangeSelection"
                        @changeCurrent="changeCurrent"
                        @changeSize="changeSize">
                    </c-table>

                    <!-- <ElTreeSelect v-if="transferActive === 2 || transferActive === 3" :max-collapse-tags="3" collapse-tags-tooltip collapse-tags clearable default-expand-all
                            @change="treeSelectChange" v-model="warning_policy_targetVal" multiple :render-after-expand="false"
                            show-checkbox check-strictly check-on-click-node :data="treeOptions"
                            ref="treeSelectRef" /> -->
                    <el-tree v-if="transferActive === 2 || transferActive === 3 || transferActive === 5 " :data="treeOptions" :props="defaultProps" @node-click="handleNodeClick" />
                    <template #top v-if="transferActive === 2 || transferActive === 3 || transferActive === 1">
                        <ElButton size="default" :type="transferActive === 1 ? 'primary' : ''"
                            @click="activeEvt(1)">
                            学生列表
                        </ElButton>
                        <ElButton size="default" :type="transferActive === 2 ? 'primary' : ''"
                            @click="activeEvt(2)">
                            标签列表
                        </ElButton>
                        <ElButton size="default" :type="transferActive === 3 ? 'primary' : ''"
                            @click="activeEvt(3)">
                            关注人群
                        </ElButton>
                    </template>
                </c-transfer>
            </div>
            <span class="dialog-footer flex-end">
                <el-button size="default" @click="dialogTableVisible = false">取消</el-button>
                <el-button size="default" type="primary" @click="submitTransfer">确定</el-button>
            </span>
        </el-dialog>


        <ElButton plain @click="jump.back()" style="margin-left: 109px;">取消</ElButton>
        <ElButton color="#005DA7" @click="submitEvt">保存</ElButton>
    </div>
</template>

<script setup lang="ts">
import { FormInstance, ElMessage } from 'element-plus';
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    getStudentInfo,
} from '@/api/modules/emphasisList'
import {
    getFocusGroupList,
    getStudentGroupPortraitList,
    addBlackAndWriteList,
    getBlackAndWriteListInfo,
    editBlackAndWriteList
} from '@/api/modules/advancedSetting'
import { getLabel, getLabelTree } from '@/api/modules/labelManagement';



const router = useRoute()
const jump = useRouter()
const inputVal = ref('')
const formRef = ref<FormInstance>()
const transferActive = ref(1)
const dialogTableVisible = ref(false)
const transferSelection = ref<any[]>([])
let searchKey = ref('')

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
interface Tree {
    label: string,
    level:number
    children?: Tree[]
}

const changeCurrent = (v:any) => {
    transPages.current = v
    getStudentList()
}


const changeSize = (v:any) => {
    transPages.size = v
    getStudentList()
}
// 验证时间段
const validatePassTime = (rule: any, value: any, callback: any) => {
    if (form.value.effectivePeriodStartTime && form.value.effectivePeriodEndTime) {
        if (form.value.effectivePeriodStartTime < form.value.effectivePeriodEndTime) {
            callback()
        } else {
            callback(new Error(`开始时间不能大于结束时间`))
        }
    } else {
        callback()
    }
}

const rules = reactive({
    name: [
        { required: true, message: '请输入名单名称', trigger: 'blur' },
    ],
    nameListContent: [
        { required: true, message: '请选择名单', trigger: 'blur' },
    ],
    relatedFunctionModule: [
        { required: true, message: '请选择关联模块', trigger: 'blur' },
    ],
    effectivePeriodStartTime: [
        { validator: validatePassTime, trigger: 'blur' }
    ],
    effectivePeriodEndTime: [
        { validator: validatePassTime, trigger: 'blur' }
    ]
})

// 点击树形
const handleNodeClick = (data: any) => {
    if (data.pid !== null) {
        switch (transferActive.value) {
            case 1:
                let result = transferSelection.value.findIndex(item => item.code == data.id)
                if (result < 0) {
                    transferSelection.value.push({
                        name: data.name,
                        code: data.id,
                        type:'people'
                    })
                }
                break;
            case 2:
                console.log('编辑时', transferSelection.value)
                if (!data.children) {
                    let result = transferSelection.value.findIndex(item => item.code == data.id)
                        if (result < 0) {
                            transferSelection.value.push({
                            name: data.name,
                            code: data.id,
                            type:'label'
                        })
                    }
                }
                break;
            case 3:
                if (data.children === null) {
                    let result = transferSelection.value.findIndex(item => item.code == data.id)
                    if (result < 0) {
                        transferSelection.value.push({
                            name: data.name,
                            code: data.id,
                            type: 'focusGroup'
                        })
                    }
                }
                break;
            case 5:
                if (data.children === null) {
                    let result = transferSelection.value.findIndex(item => item.code == data.id)
                    if (result < 0) {
                        transferSelection.value.push({
                            name: data.name,
                            code: data.id
                        })
                    }
                }
                break;
            default:
                break;
        }

    }
}


// 树形结构数据data
const treeOptions = ref<any>([])
// 树形的赋值
const defaultProps = {
    children: 'children',
    label: 'name',
}
const treeSelectChange = () => {
    // const vals = treeSelectRef.value.getCheckedNodes()
    // form.warning_policy_content = vals.map((i: { org_name: string; }) => i.org_name).join(',')
}

// 表单
const form = ref<any>({
    name:'',
    "id": null,
    "reason": "",
    "effectivePeriodStartTime": "",
    "effectivePeriodEndTime": "",
    "nameListStatus": router.name?.toString().includes('black') ? 1 : 2,
    nameListContent: [],
    relatedFunctionModule:[]
})

// 弹窗搜索
const transferSearch = (val: string) => {
    // transPages.current = 1;
    searchKey.value = val;
    getTableTreeData()
}

// 删除弹窗右边选中
const transferRemoveTags = (index: number, itm: object) => {
    transferSelection.value.splice(index, 1)
}

onMounted(() => {
    initData()
    if (router.query.id) {
        getBlackAndWriteListInfo(Number(router.query.id)).then(res => {
            if (res.code == 1) {
                form.value = JSON.parse(JSON.stringify(res.data))
                form.value.nameListContent = res.data.nameListContentList
                form.value.relatedFunctionModule = res.data.relatedFunctionModuleList
                if (res.data.nameListStatus === 1) {
                    if (['违法', '犯罪', '违纪', '违规'].indexOf(res.data.reason) < 0) {
                        form.value.reason = '其他'
                        inputVal.value = res.data.reason
                    }
                }
                if (res.data.nameListStatus === 2) {
                    if (['休学','实习','请假','对外交流'].indexOf(res.data.reason) < 0) {
                        form.value.reason = '其他'
                        inputVal.value = res.data.reason
                    }
                }
            }
        })
    }
})

// 区分选中那个表格
const activeEvt = (val:any) => {
    transferActive.value = val
    getTableTreeData()
}

const getTableTreeData = () => {
  switch (transferActive.value) {
    case 1:
        getStudentList()
        break;
    case 2:
        getLabelTree({ search: searchKey.value, attribute: '' }).then((res) => {
            treeOptions.value = res.data
        })
        break;
    case 3:
        getFocusGroupList({ name: searchKey.value }).then((res) => {
            treeOptions.value = res.data
        })
          break;
    case 5:
        getStudentGroupPortraitList({ name: searchKey.value }).then((res) => {
            treeOptions.value = res.data
        })
        break;
    default:
        break;
}
}

// 弹窗提交
const submitTransfer = () => {
  switch (transferActive.value) {
        case 1:
        case 2:
        case 3:
            form.value.nameListContent = transferSelection.value
            dialogTableVisible.value = false
            break;
        case 5:
            form.value.relatedFunctionModule = transferSelection.value
            dialogTableVisible.value = false
            break;
        default:
            dialogTableVisible.value = false
            break;
    }
}

// 添加黑白名单
const addNameListContent = () => {
    transferActive.value = 1
    transferSelection.value = form.value.nameListContent
    dialogTableVisible.value = true
}

// 添加关联模块
const addRelatedFunctionModule = () => {
    transferActive.value = 5
    transferSelection.value = form.value.relatedFunctionModule
    getStudentGroupPortraitList({ name: searchKey.value }).then((res) => {
        treeOptions.value = res.data
        dialogTableVisible.value = true
    })
}

// 区分黑白名单
const label = router.name?.toString().includes('black') ? '黑名单' : '白名单'

// 表单提交
const submitEvt = () => {
    formRef.value?.validate((valid) => {
        if (valid) {
            let formSub = {
                ...form.value,
                nameListContent: JSON.stringify(form.value.nameListContent),
                relatedFunctionModule: JSON.stringify(form.value.relatedFunctionModule),
                reason:form.value.reason === '其他' ? inputVal.value : form.value.reason
            }

            delete formSub.relatedFunctionModuleList
            delete formSub.nameListContentList
            if (formSub.id) {
              editBlackAndWriteList(formSub).then((res) => {
                    if (res.code == 1) {
                        ElMessage.success('编辑成功')
                        jump.back()
                    }
                })
            } else {
              addBlackAndWriteList(formSub).then((res) => {
                if (res.code == 1) {
                    ElMessage.success('新增成功')
                    jump.back()
                }
              })
            }

        }
    })
}

// 弹窗表格 列表项
const transferColumnList = reactive<any>([
    {
        label: '姓名',
        prop: 'name'
    },
    {
        label: '学号',
        prop: 'userName'
    },
    {
        label: '组织机构',
        prop: 'campusName'
    },
])

// 弹窗表格数据
const transferTableData = ref<any>([])

// 弹窗表格分页
const transPages = reactive({
    current: 1,
    size: 10,
    total: 0,
})

// 弹窗表格选中
const transferChangeSelection = (selection: any[]) => {
    selection.forEach((ele) => {
        let result = transferSelection.value.findIndex(item => item.code == ele.id)
        if (result < 0) {
            transferSelection.value.push({
                name: ele.name,
                code: ele.userName,
                type: 'people'
            })
        }
    });
}

// 获取学生列表
const getStudentList = () => {
    let params = {
        searchKey: searchKey.value,
        pageNum: transPages.current,
        pageSize: transPages.size,
    }
    getStudentInfo(params).then((res) => {
        transferTableData.value = res.data.dataList
        transferTableData.value.forEach((kk:any) => {
            kk.id = kk.userName
        })
        transPages.total = res.data.total
    })
}

const initData = () => {
    getStudentList()
}

</script>

<style lang="scss" scoped>
.add-seting {
     padding: 20px 430px 0 20px;
     background-color: #FFFFFF;
     height: 100%;
    .text {
        padding: 0 8px;
    }
}

.already-select {
    width: 830px;
    height: 122px;
    border: 1px solid #D6DCE0;
    // display: flex;
    padding: 10px;
    overflow: auto;
}

.tag {
    width: auto;
    height: 40px;
    background: #E9F0FF;
    border: 1px solid #EFEFEF;
    border-radius: 3px;
    font-size: 14px;
    font-family: Medium;
    color: #005DA7;
    line-height: 20px;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 5px 10px;
    display: inline-block;
}

.placeholder {
    height: 22px;
    font-size: 16px;
    font-weight: 400;
    color: #B7BFC6;
    line-height: 22px;
}

</style>

<style>
    .el-popper.is-customized {
        padding: 6px 12px;
        background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
    }

    .el-popper.is-customized .el-popper__arrow::before {
        background: linear-gradient(45deg, #b2e68d, #bce689);
        right: 0;
    }
</style>