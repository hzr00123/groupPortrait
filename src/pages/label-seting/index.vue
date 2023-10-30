<template>
    <c-card class="label-seting" v-loading="loading">
        <Step :active="active" />
        <div v-if="active == 1" class="p-220">
            <div class="title mg-b30">请选择标签所属标签体系：</div>
            <Title title="标签体系" class="mg-b20" />
            <ElForm :rules="rules['step_1']" ref="form_ref_step_1" :model="formStep_1" label-width="100">
                <ElFormItem label="一级标签:" prop="firstLabel_id">
                    <ElSelect v-model="formStep_1.firstLabel_id" placeholder="请选择所属一级标签" clearable
                        @change="getSsecondOptions">
                        <ElOption v-for="it in step_1_options.optFist" :key="it.id" :label="it.name" :value="it.id" />
                    </ElSelect>
                </ElFormItem>
                <ElFormItem label="二级标签:" prop="label_group_id">
                    <ElSelect v-model="formStep_1.label_group_id" placeholder="请选择所属二级标签" clearable>
                        <ElOption v-for="it in step_1_options.optSecond" :key="it.id" :label="it.name" :value="it.id" />
                    </ElSelect>
                </ElFormItem>
            </ElForm>
        </div>
        <div class="p-220" v-if="active == 2">
            <div class="title mg-b30">请设置标签的基础属性：</div>

            <ElForm :rules="rules['step_2']" ref="form_ref_step_2" :model="formStep_2" label-width="100">
                <Title title="基础信息" class="mg-b20" />
                <ElFormItem label="标签名称:" prop="name">
                    <ElInput clearable v-model="formStep_2.name" show-word-limit maxlength="10"/>
                </ElFormItem>
                <ElFormItem label="标签说明:" prop="label_explain">
                    <ElInput v-model="formStep_2.label_explain" type="textarea" show-word-limit :rows="2" maxlength="255"/>
                </ElFormItem>
                <Title title="标签属性" class="mg-b20" />
                <ElFormItem label="行为特征:" prop="attribute">
                    <ElSelect placeholder="请选择行为特征" clearable v-model="formStep_2.attribute">
                        <ElOption value="特征">特征</ElOption>
                        <ElOption value="行为">行为</ElOption>
                        <ElOption value="预警">预警</ElOption>
                    </ElSelect>
                </ElFormItem>
            </ElForm>
        </div>

        <div class="p-220" v-if="active == 3">
            <StepForm3 :model-value="formStep_3" ref="form_ref_step_3" @update:model-value="updateForm_3" />
        </div>
        <div class="p-220" v-if="active == 4" style="padding-right: 0;">
            <StepForm4 :key="active" ref="form_ref_step_4" :model-value="formStep_4" @update:model-value="updateForm_4" />
        </div>
        <div v-if="active == 5" style="padding: 0 120px;">
            <div class="title mg-b30">请预览标签：</div>
            <TagPreView preview :config="submitForm">
                <template #default v-if="empty">
                    <div class="w-100">
                        <ElEmpty />
                    </div>
                </template>
            </TagPreView>
        </div>
        <RenderFooterBtns :active="active" :prev="prev" :back="back" :next="next" :submit="submit" />
    </c-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRaw } from 'vue';
import Step from './components/Step.vue';
import Title from '@/pages/label-management/components/Title.vue';
import RenderFooterBtns from './components/FooterBtns';
import { dayjs, ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import StepForm3 from './components/StepForm3.vue';
import StepForm4 from './components/StepForm4.vue';
import TagPreView from '@/pages/label-management/components/TagPreview';
import { getFirstLabel, getLabel, getSsecondLabel, updateLabel } from '@/api/modules/labelManagement';
import { ConditionPart, LevelType, OptionsType, WarningRuleEntity } from '@/api/types/labelManagement';
import { useRoute, useRouter } from 'vue-router';
import { cloneDeep, omit } from 'lodash';

const router = useRoute()
const jump = useRouter()
const loading = ref(false)
/**
 * 当前步骤
 */
const active = ref<number>(Number(router.query.step))

/**
 * 当前步骤form实例
 */
const form_ref_step_1 = ref<FormInstance>()
const form_ref_step_2 = ref<FormInstance>()
const form_ref_step_3 = ref<{validate: (call: (v: boolean, f: boolean) => void)=> void}>()
const form_ref_step_4 = ref<FormInstance>()

/**
 * 5个步骤中表单验证rules合集
 */
const rules = {
    step_1: {
        firstLabel_id: [
            { required: true, message: '一级标签是必填项', trigger: 'blur' },
        ],
        label_group_id: [
            { required: true, message: '二级标签是必填项', trigger: 'blur' },
        ]
    },
    step_2: {
        attribute: [{ required: true, message: '行为特征是必填项', trigger: 'change' }],
        name: [{ required: true, message: '标签名称是必填项', trigger: 'blur' }]
    }
}
/**
 * 第一步表单值
 */
const formStep_1 = reactive<{ firstLabel_id: number | undefined, label_group_id: number | undefined }>({
    firstLabel_id: undefined,
    label_group_id: undefined
})
/**
 * 第二步表单值
 */
const formStep_2 = reactive({
    name: '',
    label_explain: '',
    attribute: ''
})
/**
 * 第三步表单值
 */
const formStep_3 = reactive<{
    conditions: Array<ConditionPart>, freq: number | undefined, freq_custom_day: string
}>({
    conditions: [],
    freq: undefined,
    freq_custom_day: ''
})
const getLevelArr = (): LevelType[] => {
    return [
        {
            levelInfo: "一级预警",
            levelValueRule: "",
            color: "#FF0000",
            warnLevel: "1",
            levelValue2: null,
            levelValue: ""
        }, {
            levelInfo: "二级预警",
            levelValueRule: "",
            color: "#FF0000",
            warnLevel: "2",
            levelValue2: null,
            levelValue: ""
        }, {
            levelInfo: "三级预警",
            levelValueRule: "",
            color: "#FF0000",
            warnLevel: "3",
            levelValue2: null,
            levelValue: ""
        }]
}
/**
 * 第四步表单值
 */
const formStep_4 = reactive<WarningRuleEntity>({
    id: '',
    is_warning: 0,
    warning_policy_content: '',
    gp_label_id: null,
    add_method: "",
    create_time: "",
    exclude_target: "",
    excludeTargetContent: '',
    mail_message: 1,
    official_account_message: 1,
    policy_end_time: "",
    policy_start_time: "",
    remind_message: "你有一条预警提醒消息!",
    remind_person: "",
    remind_person_id: '',
    text_message: 1,
    trigger_freq: 1,
    trigger_freq_cron: null,
    trigger_freq_day: "",
    trigger_freq_hour: "",
    trigger_freq_minutes: "",
    trigger_freq_week: '',
    trigger_type: 1,
    warning_content: "",
    warning_level: [],
    warning_policy_name: "",
    warning_policy_target: "",
    warning_position: '',
    warning_position_arr: []
})
/**
 * 第五步的标签生成时间等值
 */
const formStep_5 = reactive({
    createDate: '',
    createUser: '',
})

/**
 * 第五步要提交的值
 */
const submitForm = ref()

const empty = computed(() => {
    let visible = true
    const warningInfo = { ...submitForm.value.warningInfo }
    const fields = Object.keys(omit(warningInfo, ['id', 'is_warning']))
    for (const key in warningInfo) {
        if (fields.includes(key) && !!warningInfo[key]) visible = false
    }

    return visible
})

/**
 * 步骤一options选项
 */
const step_1_options = reactive<{ optFist: OptionsType[], optSecond: OptionsType[] }>({
    optFist: [],
    optSecond: []
})


const getFistOptions = async () => {
    const res = await getFirstLabel()
    if (res.code == 1) {
        step_1_options.optFist = res.data
    }
}

const getSsecondOptions = async () => {
    if(formStep_1.firstLabel_id){
        const res = await getSsecondLabel(formStep_1.firstLabel_id as number)
        if (res.code == 1) {
            step_1_options.optSecond = res.data
        }
    } else {
        step_1_options.optSecond = []
    }
    !step_1_options.optSecond.some(i => i.id === formStep_1.label_group_id) && (formStep_1.label_group_id = undefined)
}

onMounted(async () => {
    getFistOptions()
    // 如果有列表tree的id代表是编辑，从接口获取数据分发至表单
    if (router.query.id) {
        loading.value = true
        getLabel(Number(router.query.id)).then(res => {
            if (res.code == 1) {
                // console.log('标签详细信息数据', res.data);
                const data = res.data
                // 分发第一步表单值
                Object.keys(formStep_1).forEach(i => {
                    formStep_1[i] = data[i]
                })
                getSsecondOptions()

                //分发第二步表单值
                Object.keys(formStep_2).forEach(i => {
                    formStep_2[i] = data[i]
                })
                // 分发第三步表单值
                // formStep_3 = data.conditions
                Object.keys(formStep_3).forEach(i => {
                    formStep_3[i] = data[i]
                })
                formStep_3.conditions.forEach(i => {
                    if (i.type == 3) i.relation = i.trueOrFalse === 'true' ? '为真' : '为假'
                })
                // 分发第四步表单值
                formStep_4.is_warning = data.is_warning
                formStep_4.warning_level = data.conditions.map(i => {
                    return {
                        level_rule: getLevelArr(),
                        dataSourceId: i.dataSourceId,
                        fieldName: i.fieldName,
                        fieldCode: i.fieldCode,
                        dataType: i.dataType,
                        tableId: i.tableId,
                        tableCode: i.tableCode,
                        type: i.type,
                        tableName: i.tableName,
                        fieldId: i.fieldId
                    }
                })
                formStep_4.gp_label_id = Number(router.query.id) || formStep_2.name as unknown as number
                Object.keys(formStep_4).forEach(i => {
                    if (data.warningInfo && i in data.warningInfo) {
                        if (i === 'is_warning') return
                        if (i === 'warning_level') {
                            formStep_4[i] = JSON.parse(data.warningInfo[i] as unknown as string)
                        } else formStep_4[i] = data.warningInfo[i]
                    }
                })
                formStep_4.warning_content = formStep_2.name

                formStep_5.createUser = data.createUser
            }
        }).finally(() => loading.value = false)
    }
})

const updateForm_3 = (key: string | symbol, val: any, type: 'edit' | 'remove') => {
    if (key === 'conditions') {
        const index = formStep_3.conditions.findIndex(i => i.id === val.id)
        if (type === 'edit') {
            if (index !== -1) {
                formStep_3.conditions[index] = val
            } else {
                formStep_3.conditions.push(val)
            }
        }
        if (type === 'remove') {
            formStep_3.conditions.splice(index, 1)
        }
    } else {
        formStep_3[key] = val
    }
}

const updateForm_4 = (k: string | symbol, v: any) => {
    formStep_4[k] = v
}

const prev = () => {
    if (router.query.id) {//如果是编辑标签不清空form
        active.value -= 1
        return
    }
    if (active.value == 1) return
    if (active.value == 5) {
        active.value -= 1
        return
    }
    ElMessageBox.confirm(
        '离开将丢失已编辑的内容，是否离开？',
        '离开此页面',
        {
            confirmButtonText: '离开',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        if (active.value == 2) form_ref_step_2.value?.resetFields()
        if (active.value == 3) {
            formStep_3.conditions = []
            formStep_3.freq = undefined
            formStep_3.freq_custom_day = ''
        }
        if (active.value == 4) form_ref_step_4.value?.resetFields()
        active.value -= 1
    }).catch(() => { })
}

const back = () => {
    ElMessageBox.confirm(
        '离开将丢失已编辑的内容，是否离开？',
        '离开此页面',
        {
            confirmButtonText: '离开',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        jump.back()
    }).catch(() => { })
}
const levelRuleFormat = () => {
    if (formStep_4.warning_level && formStep_4.warning_level.length > 0) {
        const resArr: any[] = []
        formStep_3.conditions.forEach((i, index) => {
            let fund = true
            const v = formStep_4.warning_level[index];
            if(v){
                if (
                    v.dataSourceId == i.dataSourceId &&
                    v.dataType == i.dataType &&
                    v.fieldCode == i.fieldCode &&
                    v.fieldId == i.fieldId &&
                    v.fieldName == i.fieldName &&
                    v.tableCode == i.tableCode &&
                    v.tableName == i.tableName &&
                    v.tableId == i.tableId &&
                    v.type == i.type
                ) {
                    fund = false
                    resArr.push(v)
                }
            }
            
            // for (let index = 0; index < formStep_4.warning_level.length; index++) {
            //     const v = formStep_4.warning_level[index];
            //     if (
            //         v.dataSourceId == i.dataSourceId &&
            //         v.dataType == i.dataType &&
            //         v.fieldCode == i.fieldCode &&
            //         v.fieldId == i.fieldId &&
            //         v.fieldName == i.fieldName &&
            //         v.tableCode == i.tableCode &&
            //         v.tableName == i.tableName &&
            //         v.tableId == i.tableId &&
            //         v.type == i.type
            //     ) {
            //         fund = false
            //         resArr.push(v)
            //         break
            //     }
            // }
            if (fund) {
                resArr.push({
                    level_rule: getLevelArr(),
                    dataSourceId: i.dataSourceId,
                    fieldName: i.fieldName,
                    fieldCode: i.fieldCode,
                    dataType: i.dataType,
                    tableId: i.tableId,
                    tableCode: i.tableCode,
                    type: i.type,
                    tableName: i.tableName,
                    fieldId: i.fieldId
                })
            }
        })
        return resArr
    } else {
        return formStep_3.conditions.map(i => {
            return {
                level_rule: getLevelArr(),
                dataSourceId: i.dataSourceId,
                fieldName: i.fieldName,
                fieldCode: i.fieldCode,
                dataType: i.dataType,
                tableId: i.tableId,
                tableCode: i.tableCode,
                type: i.type,
                tableName: i.tableName,
                fieldId: i.fieldId
            }
        })
    }
}
const next = () => {
    if (active.value == 5) return
    if (active.value == 1) {
        form_ref_step_1.value?.validate((valid) => {
            if (valid) {
                active.value += 1
            }
        })
    }
    if (active.value == 2) {
        form_ref_step_2.value?.validate((valid) => {
            if (valid) {
                formStep_4.warning_content = formStep_2.name
                active.value += 1
            }
        })
    }
    if (active.value == 3) {
        form_ref_step_3.value?.validate((valid, filed: boolean) => {
          console.log(valid, filed);
            if (valid) {
                formStep_3.conditions.forEach((i: any) => {
                    if (i.type == 3 || i.type == 4) {
                        i['trueOrFalse'] = `${i.relation === '为真'}`
                    }
                    return i
                })
                formStep_4.warning_level = levelRuleFormat()
                formStep_4.gp_label_id = Number(router.query.id) || formStep_2.name as unknown as number
                active.value += 1
            } else {
                !filed && ElMessage.warning('请将规则信息补充完整！')
            }
        })
    }
    if (active.value == 4) {
        form_ref_step_4.value?.validate((valid) => {
            if (valid) {
                formStep_5.createDate = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
                const res = {
                    id: router.query.id,
                    ...formStep_1,
                    ...formStep_2,
                    ...toRaw(formStep_3),
                    warningInfo: formStep_4.is_warning ? omit(formStep_4, 'is_warning') : null,
                    is_warning: formStep_4.is_warning,
                    ...formStep_5,
                    firstLabel: step_1_options.optFist.find(i => i.id === formStep_1.firstLabel_id)?.name,
                    secondLabel: step_1_options.optSecond.find(i => i.id === formStep_1.label_group_id)?.name
                }
                submitForm.value = res
                active.value += 1
            }
        })
    }
}

const submit = () => {
    loading.value = true
    const type_2 = ['type', "operator", "relation", "tableId", "tableCode", "tableName", "fieldId", "fieldCode", "fieldName", "dataTypeNum", "dataType", "dataSourceId", "value1", "value2"]
    const type_4 = ['type', "group_attention_id", "group_attention_name"]
    const _data = cloneDeep(toRaw(submitForm.value))
    _data.conditions = _data.conditions.map((i: any) => {
        const s = {}

        if (i.type == 1) type_2.forEach(it => s[it] = i[it])
        if (i.type == 2) type_2.forEach(it => s[it] = i[it])
        if (i.type == 3) {
            s['type'] = i.type
            s['label_id'] = i.label_id ? i.label_id : i.id
            s['label_name'] = i.label_name ? i.label_name : i.name
            s['trueOrFalse'] = `${i.relation === '为真'}`
        }
        if (i.type == 4) {
            type_4.forEach(it => s[it] = i[it])
            s['trueOrFalse'] = `${i.relation === '为真'}`
        }
        return s
    })
    if (_data.warningInfo && _data.warningInfo.warning_level) {
        _data.warningInfo.warning_level = JSON.stringify(_data.warningInfo.warning_level)
    }
    //关闭预警策略不提交预警规则
    if (!_data.is_warning) _data.warningInfo = null
    //标签的类型都为自动同步
    if(_data.is_warning && _data.warningInfo) _data.warningInfo.add_method = '自动同步'
    if(!router.query.id && _data.is_warning && _data.warningInfo) _data.warningInfo.gp_label_id = null
    // console.log('提交', _data);
    updateLabel(_data).then(res => {
        if (res.code == 1) {
            ElMessage.success(res.msg)
            jump.push('/label-management')
        }
        loading.value = false
    }).catch(() => {
        loading.value = false
    })
}

</script>

<style lang="scss" scoped>
.label-seting {
    min-height: 100%;

    .w-100 {
        width: 100%;
    }

    .p-220 {
        padding: 0 120px 0 220px;
    }

    .title {
        color: #000000;
        font-size: 20px;
    }
}
</style>