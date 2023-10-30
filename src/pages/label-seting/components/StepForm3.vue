<template>
  <div>
    <div class="title mg-b30">请设置标签的创建规则：</div>
    <Title title="标签规则" class="mg-b30" />
    <div class="tag-rules flex  mg-b20">
      <label class="h-100">创建规则：</label>
      <section class="h-100">
        <div class="tag-header flex align-items-c">
          <el-icon class="tag-icon">
            <UserFilled />
          </el-icon>
          用户群满足以下条件
        </div>
        <div class="tag-main flex">
          <div class="left flex align-items-c just-c h-100">
            <div v-if="form.conditions.length !== 1" class="line"></div>
            <div v-if="form.conditions.length > 1">
              <el-dropdown @command="command">
                <el-button type="primary" color="#F4F7FF" class="dropdown-btn">
                  {{ dropdownVal }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="and">同时满足</el-dropdown-item>
                    <el-dropdown-item command="or">任一满足</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div v-if="form.conditions.length !== 1" class="line"></div>
          </div>
          <div class="right">
            <div class="right-form-item" v-for="(item, index) in form.conditions" :class="{ 'mg-b15': form.conditions.length !== 1 }" :key="item.id">
              <ElRow :gutter="13" class="flex align-items-c">
                <ElCol :span="7">
                  <!-- <ElSelect placeholder="请选择" v-model="item.condition"></ElSelect> -->
                  <CustomSelect v-model:value="form.conditions[index]" />
                </ElCol>
                <ElCol :span="7">
                  <ElSelect placeholder="请选择" v-model="item.relation">
                    <ElOption v-for="it in options(item)" :value="it.label" :label="it.label" :key="it.label" />
                  </ElSelect>
                </ElCol>
                <ElCol :span="7" v-if="item.relation !== '不为空'">
                  <div class="flex just-b align-items-c" v-if="item.type !== 3 && item.type !== 4">
                    <ElInput v-model="item.value1" v-if="item.dataTypeNum === 1" />
                    <ElInput type="number" v-model="(item.value1)" v-if="item.dataTypeNum === 2" />
                    <ElDatePicker value-format="YYYY-MM-DD" v-model="item.value1" v-if="item.dataTypeNum === 3" />

                    <span v-if="item.relation === '区间'" style="margin: 0 5px;">至</span>

                    <ElInput type="number" v-model="(item.value2)" v-if="item.dataTypeNum === 2 && item.relation === '区间'" />
                    <ElDatePicker value-format="YYYY-MM-DD" v-model="item.value2" v-if="item.dataTypeNum === 3 && item.relation === '区间'" />
                  </div>
                </ElCol>
                <ElCol :span="3">
                  <ElButton :icon="Delete" type="danger" text @click="removeClick(item.id)" />
                </ElCol>
              </ElRow>
            </div>

          </div>
        </div>
        <ElButton text @click="addClick" style="margin-left: 160px;">
          <span style="color: #1C538B;" class="flex align-items-c">
            <el-icon style="margin-right: 5px;">
              <Plus />
            </el-icon>
            添加条件
          </span>
        </ElButton>
      </section>
    </div>
    <div class="tag-rules">
      <label class="h-100 no">频率/周期：</label>
      <ElRadioGroup v-model="form.freq" @change="radioChange">
        <ElRadioButton :label="1" @click="radioClick(1)">每日</ElRadioButton>
        <ElRadioButton :label="2" @click="radioClick(2)">每周</ElRadioButton>
        <ElRadioButton :label="3" @click="radioClick(3)">每月</ElRadioButton>
        <ElRadioButton :label="4" @click="radioClick(4)">每学期</ElRadioButton>
        <ElRadioButton :label="5" @click="radioClick(5)">每学年</ElRadioButton>
        <ElRadioButton :label="6" @click="radioClick(6)">自定义</ElRadioButton>
        <ElFormItem v-if="form.freq == 6" prop="freq_custom_day" style="margin-bottom: 0;" :error="freqError">
          <ElInput type="number" :max="100" :min="1" style="width: 200px;" v-model="form.freq_custom_day">
            <template #append>天</template>
          </ElInput>
        </ElFormItem>
      </ElRadioGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref, toRef, watch, watchEffect } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import Title from '@/pages/label-management/components/Title.vue';
import CustomSelect from './CustomSelect.vue';
import { ConditionPart } from '@/api/types/labelManagement';

const props = defineProps<{ modelValue: { conditions: Array<ConditionPart>, freq: number | undefined, freq_custom_day: string } }>()
const emit = defineEmits<{ (e: 'update:modelValue', key: string | symbol, val: any, type: 'edit' | 'remove'): void }>()
const freqError = ref('')
const form = new Proxy(props.modelValue, {
  get(_target, p) {
    return props.modelValue[p]
  },
  set(_target, p, newValue) {
    emit('update:modelValue', p, newValue, 'edit')
    return true
  }
})

const operator = ref<'and' | 'or'>(form.conditions.length > 1 ? form.conditions[0].operator : 'and')
const dropdownVal = ref('同时满足')

const selectOptions = [
  [{ label: '等于' }, { label: '不等于' }, { label: '包含' }, { label: '不为空' }, { label: '为空' }],
  [{ label: '等于' }, { label: '不等于' }, { label: '大于' }, { label: '小于' }, { label: '大于等于' }, { label: '小于等于' }, { label: '区间' }, { label: '不为空' }, { label: '为空' }],
  [{ label: '为真' }, { label: '为假' }]
]

const options = computed(() => {
  return (data: ConditionPart) => {
    if (data.type == 3 || data.type == 4) {
      return selectOptions[2]
    }
    if (data.dataTypeNum == 2 || data.dataTypeNum == 3) {
      return selectOptions[1]
    }
    if (data.dataTypeNum == 1) {
      return selectOptions[0]
    }
    return selectOptions[2]
  }
})

const radioClick = (v: number) => {
  if (v == form.freq) form.freq = undefined
}

const radioChange = (v: string | number | boolean) => {
  if (v !== 6) form.freq_custom_day = ''
}

const command = (key: 'and' | 'or') => {
  operator.value = key
  if (key === 'and') dropdownVal.value = '同时满足'
  if (key === 'or') dropdownVal.value = '任一满足'
}

watch(
  () => operator.value,
  () => {
    form.conditions.forEach(i => {
      i.operator = operator.value
    })
  }
)

watchEffect(() => {
  if (props.modelValue.freq !== 6) {
    form.freq_custom_day = ''
  }
})
const addClick = () => {
  form.conditions.push({
    id: Date.now(),
    type: 1,
    operator: operator.value,
    relation: '',
    tableId: 0,
    tableCode: '',
    tableName: '',
    fieldId: 0,
    fieldCode: '',
    fieldName: '',
    name: '',
    dataTypeNum: 1,
    dataType: '',
    dataSourceId: 0,
    value1: '',
    value2: '',
    label_id: null,
    label_name: null,
    group_attention_id: null,
    group_attention_name: null,
    trueOrFalse: null
  })
}
const removeClick = (key: number | string) => {
  emit('update:modelValue', 'conditions', { id: key }, 'remove')
}
onBeforeMount(() => {
  if (form.conditions.length < 1) addClick()
})
const validateFreq_day = (freq: any, day: string) => {
  if (freq === 6) {
    if (!day) {
      freqError.value = '请输入自定义时间'
      return
    }
    if (day && (Number(day) < 1 || Number(day) > 100)) {
      freqError.value = '频率/周期取值范围为1 ~ 100'
    } else {
      freqError.value = ''
    }
  } else {
    freqError.value = ''
  }
}

const validate = (call: (v: boolean, f: boolean) => void) => {
  freqError.value = ''
  validateFreq_day(form.freq, form.freq_custom_day)
  let valid = form.conditions.every(i => {
    if (i.type !== 3 && i.type !== 4) {
      if (i.relation === '区间') return i.name && i.relation && i.value1 && i.value2
      return i.name && i.relation && i.value1
    } else {
      return i.name && i.relation
    }
  })
  if (form.conditions.length < 1) valid = false
  if (freqError.value) valid = false
  call(valid, !!freqError.value)
}

watch([toRef(form, 'freq'), toRef(form, 'freq_custom_day')], ([freq, freq_day]) => {
  validateFreq_day(freq, freq_day)
}, { immediate: true })

defineExpose({
  validate
})
</script>

<style lang="scss" scoped>
.title {
  color: #000000;
  font-size: 20px;
}

.tag-rules {
  >section {
    flex: 1;
    border-radius: 8px;
    border: 1px solid #D6DCE0;
    margin-top: -10px;

    .tag-header {
      color: #005DA7;
      width: 100%;
      height: 40px;
      line-height: 40px;
      padding-left: 16px;
      background-color: #F0F6FA;
      border-bottom: 1px solid #D6DCE0;

      .tag-icon {
        border: 1px solid #005DA7;
        border-radius: 50%;
        margin-right: 10px;
      }
    }

    .tag-main {
      padding: 30px;
      padding-bottom: 0;

      .left {
        flex-direction: column;
        width: 120px;
        margin-right: 14px;
        align-items: center;

        .line {
          width: 1px;
          flex: 1;
          background-color: #005DA7;
        }

        .dropdown-btn {
          border: 1px solid #005DA7;
          color: #005DA7;
        }
      }

      .right {
        flex: 1;
      }
    }
  }

  >label {
    width: 100px;
    color: #9A9A9A;
    margin-left: 20px;
    min-width: 100px;

    &::before {
      content: '*';
      color: #B22924;
      margin-right: 6px;
      margin-top: 4px;
    }

    &.no {
      margin-right: 20px;

      &::before {
        content: '';
      }
    }
  }
}
</style>