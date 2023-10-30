<template>
    <div>
        <div class="title mg-b30" v-if="isLabel">请设置标签的预警策略：</div>
        <ElForm label-suffix=":" ref="formRef" label-width="130" :model="form" :rules="roles">
            <ElFormItem label="设置预警策略" prop="is_warning" v-if="isLabel">
                <ElRadioGroup v-model="form.is_warning" @change="warningChange">
                    <ElRadio :label="1">是</ElRadio>
                    <ElRadio :label="0">否</ElRadio>
                </ElRadioGroup>
            </ElFormItem>

            <div v-if="form.is_warning == 1">
                <Title title="基础信息" class="mg-b20" />
                <ElFormItem label="策略名称" prop="warning_policy_name">
                    <ElInput maxlength="150" show-word-limit style="width: 400px;" clearable
                        v-model="form.warning_policy_name" />
                </ElFormItem>

                <Title title="策略对象" class="mg-b20" />
                <ElFormItem label="策略对象" prop="warning_policy_target">
                    <ElTreeSelect :max-collapse-tags="3" collapse-tags-tooltip collapse-tags clearable default-expand-all
                        @change="treeSelectChange" v-model="warning_policy_targetVal" multiple :render-after-expand="false"
                        show-checkbox check-strictly check-on-click-node :data="warning_policyOptions"
                        ref="treeSelectRef" />
                </ElFormItem>
                <ElFormItem label="排除对象">
                    <ElTooltip trigger="click" effect="light" :visible="tooltipRefShow" ref="tooltipRef">
                        <template #default>
                            <ElSelect value-key="id" :max-collapse-tags="3" collapse-tags-tooltip collapse-tags
                                popper-class="cutom-select-exclude-target" :teleported="false" multiple
                                v-model="exclude_targetVal" @click="() => tooltipRefShow = true"/>
                        </template>
                        <template #content>
                            <div style="width: 900px;">
                                <c-transfer ref="ctransfer" :title="['待选名单', '已选名单']" :width="['49%', '49%']"
                                    :selection="transferSelection" @transferSearch="transferSearch"
                                    @removeTags="transferRemoveTags">
                                    <c-table row-key="id" ref="transferTabl" size="small" align="center" :selection="true"
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
                                <el-button size="default" @click="tooltipRefShow = false">取消</el-button>
                                <el-button size="default" type="primary" @click="submitTransfer">确定</el-button>
                            </span>
                        </template>
                    </ElTooltip>

                </ElFormItem>

                <Title title="预警指标/标签内容" class="mg-b20" />
                <ElFormItem label="预警内容" prop="gp_label_id">
                    <ElTreeSelect clearable :disabled="isLabel" v-model="gp_label_idVal" :render-after-expand="false"
                        @node-click="changeLevelContent" :data="warning_contentOptions" />
                </ElFormItem>
                <ElFormItem label="预警等级" required>
                    <template v-for="(item, index) in form.warning_level">
                        <ElFormItem style="margin-bottom: 20px;" :error="warning_levelError[index]">
                            <template v-for="(it, index) in item.level_rule" :key="it.warnLevel + it.levelInfo">
                                <span :class="{'mr-l15': index !== 0}">{{ it.levelInfo }}&nbsp;</span>
                                <ElFormItem class="mg-r10">
                                    <ElSelect clearable style="width: 130px;" v-model="it.levelValueRule">
                                        <ElOption v-for="item in warning_levelOptions" :key="item.label" :label="item.label"
                                            :value="item.value" />
                                    </ElSelect>
                                </ElFormItem>

                                <ElFormItem class="mg-r10">
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
                    <ElFormItem class="mg-r10">
                        <ElRadioGroup v-model="form.trigger_type">
                            <ElRadio :label="1">数据同步后触发</ElRadio>
                            <ElRadio :label="2">定时触发</ElRadio>
                        </ElRadioGroup>
                    </ElFormItem>

                    <ElFormItem v-if="form.trigger_type === 2">
                        <ElFormItem class="mg-r10">
                            <ElSelect clearable style="width: 130px;" v-model="form.trigger_freq">
                                <ElOption :value="1" label="每天" />
                                <ElOption :value="2" label="每周" />
                                <ElOption :value="3" label="每月" />
                            </ElSelect>
                        </ElFormItem>

                        <ElFormItem v-if="form.trigger_freq === 2" class="mg-r10">
                            <ElSelect clearable style="width: 130px;" v-model="form.trigger_freq_week">
                                <ElOption v-for="(it, index) in trigger_freq_weekOption" :key="it.label" :label="it.label"
                                    :value="it.value" />
                            </ElSelect>
                        </ElFormItem>

                        <ElFormItem v-if="form.trigger_freq === 3" class="mg-r10">
                            <ElSelect clearable style="width: 100px;" v-model="form.trigger_freq_day">
                                <ElOption v-for="it in 30" :key="it" :value="it" :label="it < 10 ? `0${it}日` : `${it}日`" />
                            </ElSelect>
                        </ElFormItem>

                        <ElFormItem prop="trigger_freq_hour" class="mg-r10">
                            <ElSelect clearable style="width: 100px;" default-first-option v-model="form.trigger_freq_hour">
                                <ElOption v-for="it in 24" :key="it" :value="it-1" :label="it-1 < 10 ? `0${it-1}` : it-1" />
                            </ElSelect>
                            &nbsp; 时
                        </ElFormItem>

                        <ElFormItem prop="trigger_freq_minutes">
                            <ElSelect clearable style="width: 100px;" v-model="form.trigger_freq_minutes">
                                <ElOption v-for="it in 60" :key="it" :value="it-1" :label="it-1 < 10 ? `0${it-1}` : it-1" />
                            </ElSelect>
                            &nbsp; 分
                        </ElFormItem>
                    </ElFormItem>
                </ElFormItem>
                <ElFormItem required :error="policy_timeError">
                    <template #label>
                        <ElTooltip trigger="hover" effect="light" content="如果不设置开始时间则以当前创建时间为开始时间">
                            <span class="flex align-items-c">策略时间<el-icon style="margin-left: 5px;" color="#409eff">
                                    <InfoFilled />
                                </el-icon></span>
                        </ElTooltip>
                    </template>
                    <ElFormItem prop="policy_start_time">
                        <ElDatePicker clearable value-format="YYYY-MM-DD HH:mm:ss" v-model="form.policy_start_time" />
                    </ElFormItem>
                    <ElFormItem>-</ElFormItem>
                    <ElFormItem prop="policy_end_time">
                        <ElDatePicker clearable value-format="YYYY-MM-DD HH:mm:ss" v-model="form.policy_end_time" />
                    </ElFormItem>
                </ElFormItem>

                <Title title="预警消息设置" class="mg-b20" />
                <ElFormItem label="提醒人员" prop="remind_person_id">
                    <ElTooltip trigger="click" effect="light" ref="remindTootip">
                        <template #default>
                            <ElSelect value-key="userId" :max-collapse-tags="3" collapse-tags-tooltip collapse-tags
                                clearable v-model="remind_personVal" multiple popper-class="cutom-select-exclude-target"
                                :teleported="false" />
                        </template>
                        <template #content>
                            <div style="width: 500px">
                                <ElInput class="mg-b10" placeholder="请输入姓名/工号搜索" v-model="remind_personSearch"
                                    @keyup.enter.native="searchRemindName" clearable>
                                    <template #append>
                                        <el-button @click="searchRemindName" :icon="Search" />
                                    </template>
                                </ElInput>
                                <c-table v-tooltipEffc row-key="userId" layout="prev, pager, next" size="small"
                                    align="center" :selection="true" height="200px" :columnList="[
                                        { label: '姓名', prop: 'name' },
                                        { label: '工号', prop: 'userName' },
                                        { label: '组织机构', prop: 'org_name' },
                                    ]" :data="remind_personTableData" :pages="remind_personPages" ref="remind_Table"
                                    @changeSelection="remind_personSelection"
                                    @changeCurrent="(v: number) => remind_personPages.current = v"
                                    @changeSize="(v: number) => remind_personPages.size = v">
                                </c-table>
                            </div>
                        </template>
                    </ElTooltip>

                </ElFormItem>
                <ElFormItem label="预警消息" prop="remind_message">
                    <ElInput maxlength="150" show-word-limit clearable v-model="form.remind_message"
                        style="width: 400px;" />
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
                <ElFormItem label="预警位置" prop="warning_position_arr">
                    <ElCascader style="width: 400px;" clearable :options="warning_positionOptions"
                        :props="{ label: 'catalog_name', value: 'id', expandTrigger: 'hover' as const }"
                        v-model="form.warning_position_arr" @change="cascaderChange" ref="cascaderRef" />
                </ElFormItem>
            </div>
        </ElForm>
    </div>
</template>

<script setup lang="ts">
import { FormInstance, FormValidateCallback } from 'element-plus';
import { ref, computed, watch, reactive, toRef, onMounted, nextTick, toRaw } from 'vue';
import Title from '@/pages/label-management/components/Title.vue';
import { Search } from '@element-plus/icons-vue'
import { WarningRuleEntity, warning_levelType } from '@/api/types/labelManagement';
import { getGPCatalogList, getLabelTree, orgTree, pageTeacher } from '@/api/modules/labelManagement';
import { Column } from '@/components/Table';
import { getBlackAndWriteList, warnLevel } from '@/api/modules/advancedSetting';
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
const form = new Proxy(props.modelValue, {
    get(_target, p) {
        return props.modelValue[p]
    },
    set(_target, p, newValue) {
        emit('update:modelValue', p, newValue)
        return true
    },
})

const warning_policyOptions = ref<Array<{ children: any[], [key: string]: any }>>([])
const formRef = ref<FormInstance>()
const cascaderRef = ref()
const treeSelectRef = ref()
const warning_levelError = reactive({})
const trigger_freqError = ref('')
const policy_timeError = ref('')
const messageTypeError = ref('')
const tooltipRef = ref()
const tooltipRefShow = ref(false)


const transferSelection = ref<any[]>([])
const remind_Table = ref()
const warning_contentOptions = ref<Array<{ children: any[], [key: string]: any }>>([])
const warning_positionOptions = ref<Array<{ children: any[], [key: string]: any }>>([])
/**
 * 预警位置选项变化事件
 */
const cascaderChange = (_v: any) => {
    if (_v && _v.length > 0) {
        const res = cascaderRef.value.getCheckedNodes()[0]
        form.warning_position = res.text
    } else {
        form.warning_position = ''
    }
}

const gp_label_idVal = computed({
    get() {
        //如果是字符串就是新建的标签
        if (form.gp_label_id && typeof form.gp_label_id === 'string') {
            return form.gp_label_id
        }
        // 高级设置新增策略时
        if (!form.gp_label_id) {
            return ''
        }
        return 'table-' + form.gp_label_id
    },
    set(v) {
        if (v) {
            form.gp_label_id = Number(v.replace(/table-/, ''))
        } else form.gp_label_id = null
    }
})
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
const remind_personTableData = ref<any[]>([])
/**
 * 策略对象输入框的值
 */
const warning_policy_targetVal = computed({
    get() {
        if (!form.warning_policy_target) return []
        if (!!form.warning_policy_target) return form.warning_policy_target.split(',')
        else return []
    },
    set(v) {
        form.warning_policy_target = v.join(',')
    }
})

/**
 * 策略对象选中变化事件
 */
const treeSelectChange = () => {
    const vals = treeSelectRef.value.getCheckedNodes()
    form.warning_policy_content = vals.map((i: { org_name: string; }) => i.org_name).join(',')
}

/**
 * 提醒人员的值
 */
const remind_personVal = computed({
    get() {
        if (!form.remind_person) return []
        if (form.remind_person.includes(','))
            return form.remind_person?.split(',')?.map((i, index) => ({ label: i, userId: Number(form.remind_person_id?.split(',')[index]) }))
        return [{ label: form.remind_person, userId: Number(form.remind_person_id) }]
    },
    set(v) {
        if (v.length < 1) {
            form.remind_person = ''
            form.remind_person_id = ''
        } else {
            form.remind_person_id = v.map(i => i.userId).join(',')
            form.remind_person = v.map(i => i.label).join(',')
        }
    }
})
/**
 * 排除对象的值
 */
const exclude_targetVal = computed({
    get() {
        if (!form.excludeTargetContent) return []
        if (form.excludeTargetContent.includes(','))
            return form.excludeTargetContent?.split(',').map((i, index) => ({ label: i, id: Number(form.exclude_target?.split(',')[index]) }))

        return [{ label: form.excludeTargetContent, id: Number(form.exclude_target) }]
    },
    set(v) {
        if (v.length < 1) {
            form.exclude_target = ''
            form.excludeTargetContent = ''
        } else {
            form.exclude_target = v.map(i => i.id).join(',')
            form.excludeTargetContent = v.map(i => i.label).join(',')
        }
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

const searchRemindName = () => {
    remind_personPages.current = 1
    remind_personPages.size = 10
    getRemindNameList()
}

// 开始用的change事件 后考虑到要保存当前的内容改用click事件
const changeLevelContent = (v: any) => {
    if (v.type === 'table') {
        form.warning_content = v.label
        warnLevel({ "gp_label_id": v.id, "id": form.id }).then((res) => {
            form.warning_level = res.data || []
        })
    }
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
    const getName = (name: string, nameListStatus: 1 | 2) => {
        const str = nameListStatus === 1 ? '黑名单: ' : '白名单: '
        return str + name
    }
    transferSelection.value = selection.map(i => ({ ...i, name: getName(i.nameListContent, i.nameListStatus) }));
}

const submitTransfer = () => {
    form.exclude_target = transferSelection.value.map(i => i.id).join(',')
    form.excludeTargetContent = transferSelection.value.map(i => i.name).join(',')
    transferSelection.value = []
    transferActive.value = 1
    // tooltipRef.value.hide()
    tooltipRefShow.value = false
}

const remind_personSelection = (selection: any[]) => {
    form.remind_person = selection.map(i => i.name).join(',')
    form.remind_person_id = selection.map(i => i.userId).join(',')
}

const vTooltipEffc = {
    unmounted: () => {
        remind_personSearch.value = ''
        remind_personPages.current = 1
        remind_personPages.size = 10
    },
    mounted: () => {
        nextTick(() => {
            const keys = remind_personVal.value.map(i => i.userId)
            const selecttions = remind_personTableData.value.filter((i) => keys.includes(i.userId))
            const _data = selecttions.concat(remind_personVal.value.map(i => ({ ...i, name: i.label })))
            function hash<T, K extends keyof T>(arr: Array<T>, attribute: K): Array<T> {
                const _hash: any = {};
                return arr.reduce((item: Array<T>, next) => {
                    _hash[next[attribute] as unknown as K] ? '' : _hash[next[attribute]] = true && item.push(next);
                    return item;
                }, []);
            }
            remind_Table.value.checkSelection(hash(_data, 'userId'), true)
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

form.warning_level.forEach((_i, index) => {
    warning_levelError[index] = ''
})


const warningChange = (v: string | number | boolean) => {
    if (v === 1) {
        nextTick(clearValidate)
    }
}

/**
 * 校验预警等级
 */
const validWarning_level = (v: warning_levelType) => {
    if (v && v.length > 0) {
        v.forEach((i, index) => {
            const vali = i.level_rule.every(it => it.color && it.levelValue && it.levelValueRule)
            if (!vali) {
                warning_levelError[index] = '预警等级为必填项'
            } else warning_levelError[index] = ''
        })
    }
}
/**
 * 校验触发时间
 */
const validTrigger = (v: (string | number)[]) => {

    if (!v[0]) {
        trigger_freqError.value = '触发时间为必填项'
        return
    }
    if (v[0] === 2) {
        let h = !v[4] && v[4] !== 0;  
        let m = !v[5] && v[5] !== 0;  
        if (v[1] === 1) {
          if (h || m)  trigger_freqError.value = '请将触发时间补充完整'
            else trigger_freqError.value = ''
        } else if (v[1] === 2) {
          if (!v[2] || h || m) trigger_freqError.value = '请将触发时间补充完整'
            else trigger_freqError.value = ''
        } else if (v[1] === 3) {
          if (!v[3] || h || m) trigger_freqError.value = '请将触发时间补充完整'
            else trigger_freqError.value = ''
        }
    } else {
        trigger_freqError.value = ''
    }
}
/**
 * 校验策略时间
 */
const validPolicyTime = (v: [string, string]) => {
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
}
/**
 * 校验预警消息
 */
const validMessage = (v: number[]) => {
    if (v.some(i => !!i)) messageTypeError.value = ''
    else messageTypeError.value = '预警消息为必选项'
}

//校验预警等级
watch(() => form.warning_level, (v) => {
    validWarning_level(v)
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
    validTrigger(v)
}, { immediate: true })

//校验策略时间
watch([toRef(form, 'policy_start_time'), toRef(form, 'policy_end_time')], v => {
    validPolicyTime(v)
}, { immediate: true })

//校验预警消息
watch([toRef(form, 'text_message'), toRef(form, 'mail_message'), toRef(form, 'official_account_message')], v => {
    validMessage(v)
}, { immediate: true })

watch(() => form.is_warning, v => {
    if (!v) clearValidate()
})
const validate = (callback: FormValidateCallback) => {
    let valid = true
    if (!!form.is_warning) {
        validWarning_level(form.warning_level)
        validTrigger([
            form.trigger_type,
            form.trigger_freq,
            form.trigger_freq_week,
            form.trigger_freq_day,
            form.trigger_freq_hour,
            form.trigger_freq_minutes
        ])
        validPolicyTime([form.policy_start_time, form.policy_end_time])
        validMessage([form.text_message, form.mail_message, form.official_account_message])
        for (const key in warning_levelError) {
            if (Object.prototype.hasOwnProperty.call(warning_levelError, key)) {
                const item = warning_levelError[key];
                if (item) valid = false
            }
        }
        if (trigger_freqError.value) valid = false
        if (policy_timeError.value) valid = false
        if (messageTypeError.value) valid = false
    }

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
    function deepTree(data: Array<{ children: any[], [key: string]: any }>, keys = { label: 'org_name', value: 'org_code' }, isTablesview = false) {
        return data.map(i => {
            i.label = i[keys.label]
            if (isTablesview) i.value = `${i.type}-${i[keys.value]}`
            else i.value = i[keys.value]
            if (i.children && i.children.length > 0) {
                i.children = deepTree(i.children, keys, isTablesview)
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
    getLabelTree({ search: '', attribute: '' }).then(res => {
        if (res.code == 1) {
            const tree = deepTree(res.data as any[], { label: 'name', value: 'id' }, true)
            warning_contentOptions.value = tree
        }
    })
    getGPCatalogList().then(res => {
        if (res.code == 1) {
            warning_positionOptions.value = res.data
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
.mg-r10{
    margin-right: 10px;
}
.mr-l15{
    margin-left: 15px;
}
.dialog-footer {
    margin-top: 20px;
}

:deep(.cutom-select-exclude-target) {
    position: absolute;
    top: -99999px;
    display: none;
}

:deep(.c-table) {
   .el-pagination {
    width: 400px;
    overflow-x: auto;
    justify-content:initial
   }

}

</style>