<template>
    <div>
        <ElForm label-suffix=":" ref="formRef" :model="form" :rules="roles">
            <Title title="基础信息" class="mg-b20" />
            <ElFormItem label="策略名称" prop="warning_policy_name">
                <ElInput style="width: 220px;" clearable v-model="form.warning_policy_name" />
            </ElFormItem>

            <Title title="策略对象" class="mg-b20" />
            <ElFormItem label="策略对象" prop="warning_policy_target">
                <ElTreeSelect clearable v-model="warning_policy_targetVal" multiple :render-after-expand="false"
                    show-checkbox check-strictly check-on-click-node :data="warning_policyOptions" />
            </ElFormItem>
            <ElFormItem label="排除对象">
                <ElTooltip trigger="click" effect="light" ref="tooltipRef">
                    <template #default>
                        <ElSelect clearable popper-class="cutom-select-exclude-target" :teleported="false" multiple
                            v-model="exclude_targetVal" />
                    </template>
                    <template #content>
                        <div style="width: 900px;">
                            <c-transfer ref="ctransfer" :title="['待选名单', '已选名单']" :width="['49%', '49%']"
                                :selection="transferSelection" @transferSearch="transferSearch"
                                @removeTags="transferRemoveTags">
                                <c-table ref="transferTabl" size="small" align="center" :selection="true"
                                    height="300px" :columnList="transferColumnList" :data="transferTableData"
                                    :pages="transPages" maxHeight="350" @changeSelection="transferChangeSelection"
                                    @changeCurrent="(v: number) => transPages.current = v"
                                    @changeSize="(v: number) => transPages.size = v">

                                </c-table>
                                <template #top>
                                    <ElButton size="default" :type="transferActive === 1 ? 'primary' : ''"
                                        @click="activeEvt(1)">
                                        黑名单
                                    </ElButton>
                                    <ElButton size="default" :type="transferActive === 2 ? 'primary' : ''"
                                        @click="activeEvt(2)">
                                        白名单
                                    </ElButton>
                                </template>
                            </c-transfer>
                        </div>
                        <span class="dialog-footer flex-end">
                            <el-button size="default" @click="tooltipRef.hide()">取消</el-button>
                            <el-button size="default" type="primary" @click="submitTransfer">确定</el-button>
                        </span>
                    </template>
                </ElTooltip>

            </ElFormItem>

            <Title title="预警指标/标签内容" class="mg-b20" />
            <ElFormItem label="预警内容" prop="gp_label_id">
                <ElTreeSelect clearable :disabled="isLabel" v-model="form.gp_label_id" :render-after-expand="false"
                    :data="warning_contentOptions" />
            </ElFormItem>
            <ElFormItem label="预警等级" required>
                <template v-for="(item, index) in form.warning_level">
                    <ElFormItem style="margin-bottom: 10px;" :error="warning_levelError[index]">
                        <template v-for="it in item.level_rule" :key="it.warnLevel + it.levelInfo">
                            {{ it.levelInfo }}&nbsp;
                            <ElFormItem>
                                <ElSelect clearable style="width: 130px;" v-model="it.levelValueRule">
                                    <ElOption v-for="item in warning_levelOptions" :key="item.label"
                                        :label="item.label" :value="item.value" />
                                </ElSelect>
                            </ElFormItem>

                            <ElFormItem>
                                <ElInput clearable style="width: 80px;" v-model="it.levelValue" />
                            </ElFormItem>

                            <ElFormItem>
                                <ElColorPicker v-model="it.color" />
                            </ElFormItem>
                        </template>
                    </ElFormItem>

                </template>

            </ElFormItem>

            <Title title="触发规则设置" class="mg-b20" />
            <ElFormItem label="触发时间" required :error="trigger_freqError">
                <ElFormItem>
                    <ElRadioGroup v-model="form.trigger_type">
                        <ElRadio :label="1">数据同步后触发</ElRadio>
                        <ElRadio :label="2">定时触发</ElRadio>
                    </ElRadioGroup>
                </ElFormItem>

                <ElFormItem v-if="form.trigger_type === 2">
                    <ElFormItem>
                        <ElSelect clearable style="width: 130px;" v-model="form.trigger_freq">
                            <ElOption :value="1" label="每天" />
                            <ElOption :value="2" label="每周" />
                            <ElOption :value="3" label="每月" />
                        </ElSelect>
                    </ElFormItem>

                    <ElFormItem v-if="form.trigger_freq === 2">
                        <ElSelect clearable style="width: 130px;" v-model="form.trigger_freq_week">
                            <ElOption v-for="(it, index) in trigger_freq_weekOption" :key="it.label"
                                :label="it.label" :value="it.value" />
                        </ElSelect>
                    </ElFormItem>

                    <ElFormItem v-if="form.trigger_freq === 3">
                        <ElSelect clearable style="width: 100px;" v-model="form.trigger_freq_day">
                            <ElOption v-for="it in 30" :key="it" :value="it"
                                :label="it < 10 ? `0${it}日` : `${it}日`" />
                        </ElSelect>
                    </ElFormItem>

                    <ElFormItem prop="trigger_freq_hour">
                        <ElSelect clearable style="width: 100px;" default-first-option
                            v-model="form.trigger_freq_hour">
                            <ElOption v-for="it in 23" :key="it" :value="it" :label="it < 10 ? `0${it}` : it" />
                        </ElSelect>
                        &nbsp; 时
                    </ElFormItem>

                    <ElFormItem prop="trigger_freq_minutes">
                        <ElSelect clearable style="width: 100px;" v-model="form.trigger_freq_minutes">
                            <ElOption v-for="it in 59" :key="it" :value="it" :label="it < 10 ? `0${it}` : it" />
                        </ElSelect>
                        &nbsp; 分
                    </ElFormItem>
                </ElFormItem>
            </ElFormItem>
            <ElFormItem label="策略时间" required :error="policy_timeError">
                <ElFormItem prop="policy_start_time">
                    <ElDatePicker clearable value-format="YYYY-MM-DD" v-model="form.policy_start_time" />
                </ElFormItem>
                <ElFormItem>-</ElFormItem>
                <ElFormItem prop="policy_end_time">
                    <ElDatePicker clearable value-format="YYYY-MM-DD" v-model="form.policy_end_time" />
                </ElFormItem>
            </ElFormItem>

            <Title title="预警消息设置" class="mg-b20" />
            <ElFormItem label="提醒人员" prop="remind_person_id">
                <ElTooltip trigger="click" effect="light">
                    <template #default>
                        <ElSelect clearable v-model="remind_personVal" multiple
                            popper-class="cutom-select-exclude-target" :teleported="false" />
                    </template>
                    <template #content>
                        <KeepAlive>
                            <div v-tooltipEffc style="width: 500px">
                                <ElInput class="mg-b10" placeholder="请输入姓名/工号搜索" v-model="remind_personSearch"
                                    @keyup.enter.native="searchRemindName" clearable>
                                    <template #append>
                                        <el-button @click="searchRemindName" :icon="Search" />
                                    </template>
                                </ElInput>
                                <c-table row-key="userId" layout="prev, pager, next" size="small" align="center"
                                    :selection="true" height="200px" :columnList="[
                                        { label: '姓名', prop: 'name' },
                                        { label: '工号', prop: 'userName' },
                                        { label: '组织机构', prop: 'org_name' },
                                    ]" :data="remind_personTableData" :pages="remind_personPages"
                                    ref="remind_Table" @changeSelection="remind_personSelection"
                                    @changeCurrent="(v: number) => remind_personPages.current = v"
                                    @changeSize="(v: number) => remind_personPages.size = v">
                                </c-table>
                            </div>
                        </KeepAlive>

                    </template>
                </ElTooltip>

            </ElFormItem>
            <ElFormItem label="预警消息" prop="remind_message">
                <ElInput clearable v-model="form.remind_message" style="width: 400px;" />
            </ElFormItem>
            <ElFormItem label="消息类型" :error="messageTypeError" required>
                <ElRow :gutter="20">
                    <ElCol :span="8">
                        <ElFormItem>
                            <ElCheckbox v-model="form.text_message" :true-label="1" :false-label="0">短信</ElCheckbox>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem>
                            <ElCheckbox v-model="form.mail_message" :true-label="1" :false-label="0">邮件</ElCheckbox>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem>
                            <ElCheckbox v-model="form.official_account_message" :true-label="1" :false-label="0">
                                公众号消息
                            </ElCheckbox>
                        </ElFormItem>
                    </ElCol>
                </ElRow>
            </ElFormItem>

            <Title title="预警位置" class="mg-b20" />
            <ElFormItem label="预警位置" prop="warning_position">
                <ElCascader clearable :options="[]" :props="{ expandTrigger: 'hover' as const }"
                    v-model="form.warning_position" />
            </ElFormItem>
        </ElForm>
    </div>
</template>

<script setup lang="ts">
import { FormInstance, FormValidateCallback } from 'element-plus';
import { ref, computed, watch, reactive, toRef, onMounted, nextTick, watchEffect, toRaw } from 'vue';
import Title from '@/pages/label-management/components/Title.vue';
import { Search } from '@element-plus/icons-vue'
import { WarningRuleEntity } from '@/api/types/labelManagement';
import { getTablesViews, orgTree, pageTeacher } from '@/api/modules/labelManagement';
import { Column } from '@/components/Table';
import { getBlackAndWriteList, getBlackAndWriteListInfo } from '@/api/modules/advancedSetting';
import { TableData } from '@/api/types/advancedSetting';

const props = withDefaults(defineProps<{ modelValue: WarningRuleEntity, isLabel?: boolean }>(), { isLabel: true })
const emit = defineEmits<{ (e: 'update:modelValue', key: string | symbol, val: string): void }>()
const trigger_freq_weekOption = [
    { label: '星期一', value: '2' },
    { label: '星期二', value: '3' },
    { label: '星期三', value: '4' },
    { label: '星期四', value: '5' },
    { label: '星期五', value: '6' },
    { label: '星期六', value: '7' },
    { label: '星期天', value: '1' },
]

const warning_levelOptions = [
    { label: '等于', value: '等于' },
    { label: '不等于', value: '不等于' },
    { label: '包含', value: '包含' },
    { label: '为空', value: '为空' },
    { label: '不为空', value: '不为空' },
    { label: '大于', value: '大于' },
    { label: '小于', value: '小于' },
    { label: '大于等于', value: '大于等于' },
    { label: '小于等于', value: '小于等于' },
    { label: '为真', value: '为假' },
]

const roles = {
    is_warning: [{ required: true, message: '预警策略为必选项', trigger: 'change' }],
    warning_policy_name: [{ required: true, message: '策略名称为必填项', trigger: 'change' }],
    warning_policy_target: [{ required: true, message: '策略对象为必选项', trigger: 'change' }],
    gp_label_id: [{ required: true, message: '预警内容为必选项', trigger: 'change' }],
    remind_person_id: [{ required: true, message: '提醒人员为必选项', trigger: 'change' }],
    remind_message: [{ required: true, message: '预警消息为必填项', trigger: 'change' }],
    warning_position: [{ required: true, message: '预警位置为必选项', trigger: 'change' }],
}

const warning_policyOptions = ref<Array<{ children: any[], [key: string]: any }>>([])
const formRef = ref<FormInstance>()
const warning_levelError = reactive({})
const trigger_freqError = ref('')
const policy_timeError = ref('')
const messageTypeError = ref('')
const tooltipRef = ref()
const transferSelection = ref<any[]>([])
const personSelection = ref<any[]>([])
const remind_Table = ref()
const warning_contentOptions = ref<Array<{ children: any[], [key: string]: any }>>([])
/**
 * 排除对象表格数据
 */
const transferTableData = ref<TableData[]>([])
const transferTabl = ref()
const searchKey = ref('')
const transferActive = ref<1 | 2>(1)
const transferColumnList = reactive<Column>([
    {
        label: '黑名单',
        prop: 'nameListContent'
    }
])
/**
 * 排除对象分页
 */
const transPages = reactive({
    current: 1,
    size: 10,
    total: 0,
})
/**
 * 提醒人员分页
 */
const remind_personPages = reactive({
    current: 1,
    size: 10,
    total: 0,
})
/**
 * 提醒人员表格数据
 */
const remind_personTableData = ref<TableData[]>([])
/**
 * 策略对象输入框的值
 */
const warning_policy_targetVal = computed({
    get() {
        if (!!form.warning_policy_target) return form.warning_policy_target.split(',')
        else return []
    },
    set(v) {
        form.warning_policy_target = v.join(',')
    }
})
/**
 * 提醒人员的值
 */
const remind_personVal = computed({
    get() {
        if (!form.remind_person) return []
        if (form.remind_person.includes(',')) return form.remind_person.split(',')
        return [form.remind_person]
    },
    set() {

    }
})
/**
 * 排除对象的值
 */
const exclude_targetVal = computed({
    get() {
        if (!form.exclude_target) return []
        if (form.exclude_target.includes(',')) return form.exclude_target.split(',')
        return [form.exclude_target]
    },
    set() {

    }
})
/**
 * 提醒人员搜索框值
 */
const remind_personSearch = ref('')

const getRemindNameList = () => {
    pageTeacher({
        pageNum: remind_personPages.current,
        pageSize: remind_personPages.size,
        nameOrUserName: remind_personSearch.value
    }).then(res => {
        if (res.code == 1 && res.data) {
            remind_personPages.total = res.data.total
            remind_personTableData.value = res.data.list
        }
    })
}

// watch(remind_personTableData, ()=> {
//     nextTick(()=>{
//                 remind_Table.value?.checkSelection(personSelection.value, true)
//                 console.log(222222222222,toRaw(remind_Table.value), toRaw(personSelection.value));
//             })
// }, {deep: true})

const searchRemindName = () => {
    remind_personPages.current = 1
    remind_personPages.size = 10
    getRemindNameList()
}

watch(
    [toRef(remind_personPages, 'current'), toRef(remind_personPages, 'size')],
    () => {
        getRemindNameList()
    },
    { immediate: true }
)
const activeEvt = (v: 1 | 2) => {
    transferActive.value = v
}
const transferSearch = (val: string) => {
    transPages.current = 1;
    searchKey.value = val;
}

const transferRemoveTags = (index: number) => {
    transferTabl.value.checkSelection([transferSelection.value[index]], false);
}

const transferChangeSelection = (selection: any[]) => {
    transferSelection.value = selection.map(i => ({ ...i, name: i.nameListContent }));
}

const submitTransfer = () => {
    console.log('submit', toRaw(transferSelection.value));
    form.exclude_target = transferSelection.value.map(i => i.id).join(',')
}

const remind_personSelection = (selection: any[]) => {
    selection.forEach((i, index) => {
        const item = personSelection.value.find(v => v.userId === i.userId)
        if (!item) {
            personSelection.value.push(i)
        }
    })
    console.log(toRaw(personSelection.value));


    form.remind_person = personSelection.value.map(i => i.name).join(',')
    form.remind_person_id = personSelection.value.map(i => i.userId).join(',')
}


const vTooltipEffc = {
    unmounted: () => {
        remind_personSearch.value = ''
        remind_personPages.current = 1
        remind_personPages.size = 10
    },
    mounted: () => {
        nextTick(() => {
            remind_Table.value.checkSelection(personSelection.value, true)
        })
    }
}

watch(transferActive, v => {
    transferColumnList[0].label = v === 1 ? '黑名单' : '白名单'
    getBlackAndWriteList({
        pageNum: transPages.current,
        pageSize: transPages.size,
        nameListStatus: v,
        nameListContent: searchKey.value
    }).then(res => {
        if (res.code == 1) {
            transferTableData.value = res.data.dataList
            transPages.total = res.data.total
        }
    })
}, { immediate: true })

const form = new Proxy(props.modelValue, {
    get(_target, p) {
        return props.modelValue[p]
    },
    set(_target, p, newValue) {
        emit('update:modelValue', p, newValue)
        return true
    },
})

form.warning_level.forEach((_i, index) => {
    warning_levelError[index] = ''
})


const warningChange = (v: string | number | boolean) => {
    if (v === 1) {
        nextTick(clearValidate)
    }
}
//校验预警等级
watch(() => form.warning_level, (v) => {
    if (v && v.length > 0) {
        v.forEach((i, index) => {
            const vali = i.level_rule.every(it => it.color && it.levelValue && it.levelValueRule)
            if (!vali) {
                warning_levelError[index] = '预警等级为必填项'
            } else warning_levelError[index] = ''
        })
    }
}, { deep: true, immediate: true })

//校验触发时间
watch([
    toRef(form, 'trigger_type'),
    toRef(form, 'trigger_freq'),
    toRef(form, 'trigger_freq_week'),
    toRef(form, 'trigger_freq_day'),
    toRef(form, 'trigger_freq_hour'),
    toRef(form, 'trigger_freq_minutes'),
], (v) => {
    if (!v[0]) {
        trigger_freqError.value = '触发时间为必填项'
        return
    }
    if (v[0] === 2) {
        if (v[1] === 1) {
            if (!v[4] || !v[5]) trigger_freqError.value = '请将触发时间补充完整'
            else trigger_freqError.value = ''
        } else if (v[1] === 2) {
            if (!v[2] || !v[4] || !v[5]) trigger_freqError.value = '请将触发时间补充完整'
            else trigger_freqError.value = ''
        } else if (v[1] === 3) {
            if (!v[3] || !v[4] || !v[5]) trigger_freqError.value = '请将触发时间补充完整'
            else trigger_freqError.value = ''
        }
    } else {
        trigger_freqError.value = ''
    }
}, { immediate: true })

//校验策略时间
watch([toRef(form, 'policy_start_time'), toRef(form, 'policy_end_time')], v => {
    // 产品要求可以只填开始时间或者结束时间
    if (!v[0] && !v[1]) {
        policy_timeError.value = '策略时间为必填项'
        return
    }
    if (v[0] && v[1]) {
        const start = new Date(v[0])
        const end = new Date(v[1])
        if (start.getTime() >= end.getTime()) policy_timeError.value = '策略时间结束时间须大于开始时间'
        else policy_timeError.value = ''
        return
    }
    if (v.some(i => !!i)) policy_timeError.value = ''
}, { immediate: true })

watch([toRef(form, 'text_message'), toRef(form, 'mail_message'), toRef(form, 'official_account_message')], v => {
    if (v.some(i => !!i)) messageTypeError.value = ''
    else messageTypeError.value = '预警位置为必选项'
}, { immediate: true })

const validate = (callback: FormValidateCallback) => {
    let valid = true
    for (const key in warning_levelError) {
        if (Object.prototype.hasOwnProperty.call(warning_levelError, key)) {
            const item = warning_levelError[key];
            if (item) valid = false
        }
    }
    if (trigger_freqError.value) valid = false
    if (policy_timeError.value) valid = false
    if (messageTypeError.value) valid = false
    if (valid) formRef.value?.validate(callback)
    else callback(valid)
}

const resetFields = () => {
    formRef.value?.resetFields()
}

const clearValidate = () => {
    formRef.value?.clearValidate()
    for (const key in warning_levelError) {
        if (Object.prototype.hasOwnProperty.call(warning_levelError, key)) {
            warning_levelError[key] = '';
        }
    }
    trigger_freqError.value = ''
    policy_timeError.value = ''
    messageTypeError.value = ''
}

onMounted(() => {
    clearValidate()
    function deepTree(data: Array<{ children: any[], [key: string]: any }>, keys = { label: 'org_name', value: 'org_code' }) {
        return data.map(i => {
            i.label = i[keys.label]
            i.value = i[keys.value]
            if (i.children && i.children.length > 0) {
                i.children = deepTree(i.children, keys)
            }
            return i
        })
    }
    orgTree().then(res => {
        if (res.code == 1) {
            const tree = deepTree(res.data)
            warning_policyOptions.value = tree
        }
    })
    props.isLabel && getTablesViews(3, '').then(res => {
        if (res.code == 1) {
            const tree = deepTree(res.data as any[], { label: 'name', value: 'id' })
            warning_contentOptions.value = tree
        }
    })
})

defineExpose({ validate, resetFields, clearValidate })
</script>

<style lang="scss" scoped>
.title {
    color: #000000;
    font-size: 20px;
}

.dialog-footer {
    margin-top: 20px;
}

:deep(.cutom-select-exclude-target) {
    position: absolute;
    top: -99999px;
    display: none;
}
</style>