<template>
  <div class="form-box">
     <StepForm :key="active" ref="form_ref_step" :model-value="formStep" :is-label="false" @update:model-value="updateForm" />
     <ElButton color="#005DA7" @click="submitEvt">{{ formStep.id  ? '保存' : '创建' }}</ElButton>
     <ElButton plain @click="jump.back()">取消</ElButton>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, FormInstance } from 'element-plus';
import { onMounted, reactive, ref } from 'vue'
import StepForm from '@/pages/label-seting/components/StepForm4.vue';
import { useRouter, useRoute } from 'vue-router';
import {
  addWarningRule,
  getWarningRuleList,
  editWarningRule
} from '@/api/modules/advancedSetting'
import { WarningRuleEntity } from '@/api/types/labelManagement';
const jump = useRouter()
const router = useRoute()
let active = ref(4)
/**
 * 第四步表单值
 */
let formStep = ref<WarningRuleEntity>({
  id: '',
  is_warning: 1,
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

const form_ref_step = ref<FormInstance>()


const updateForm = (k: string | symbol, v: any) => {
  formStep.value[k] = v
}

onMounted(() => {
  if (router.query.id) {
    getWarningRuleList({ id: router.query.id }).then((res) => {
      formStep.value = res.data
      formStep.value.is_warning = 1
      formStep.value.warning_level = JSON.parse(res.data.warning_level)
    })
  }
})


const submitEvt = () => {
  form_ref_step.value?.validate((valid) => {
    if (valid) {
      let subForm = {
        ...formStep.value,
        warning_level: JSON.stringify(formStep.value.warning_level)
      }
      if (subForm.id) {
        editWarningRule(subForm).then((res) => {
          if (res.code === 1) {
            ElMessage.success('编辑成功')
            jump.back()
          }
        })
      } else {
        addWarningRule(subForm).then((res) => {
          if (res.code === 1) {
            ElMessage.success('新增成功')
            jump.back()
          }
        })
      }
    }
  })
}
</script>

<style scoped>
  .form-box {
    background: #FFFFFF;
    padding: 25px 0 25px 25px;
  }

</style>