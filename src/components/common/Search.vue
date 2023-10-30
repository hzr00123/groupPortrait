<template>
  <div class="search-container">

    <el-form ref="ruleFormRef" :label-position="'left'" :inline="true" class="searchForm" :model="searchForm">

      <div class="search-top">
        <div class="row-item">
          <template class="row-item" v-for="item in searchList" :key="item.key">
            <el-form-item :label="item.label" class="label-box" :prop="item.key" :style="{
              '--labelWidth': item.labelWidth ? item.labelWidth : '50px',
            }">
              <template v-if="item.type === 'input'">
                <el-input size="large" :style="{ width: item.inputWidth }" clearable v-model="searchForm[item.key]"
                  :placeholder="item.placeholder ? item.placeholder : '请输入'" />
                <span v-if="item.inputUnit" style="margin-left:10px">{{ item.inputUnit }}</span>
              </template>
              <template v-if="item.type === 'select'">
                <el-select  @change="selectChange(item.key)" size="large" :style="{ width: item.inputWidth }" clearable :ref="item.ref"
                  :filterable="item.filterable" v-model="searchForm[item.key]"
                  :placeholder="item.placeholder ? item.placeholder : '请选择'">
                  <el-option :placeholder="'请选择' + item.label" v-for="list in item.options"
                    :key="list.value ? list.value : list[item.opKey!]"
                    :label="list.label ? list.label : list[item.opLabel!]"
                    :value="list.value ? list.value : list[item.opKey!]">
                  </el-option>
                </el-select>
              </template>
              <template v-if="item.type === 'date'">
                <el-date-picker size="large" :style="{ width: item.inputWidth }" clearable unlink-panels
                  v-model="searchForm[item.key]" :type="item.dataType ? item.dataType : 'date'"
                  :value-format="item.dataFormat ? item.dataFormat : 'YYYY-MM-DD'" :placeholder="item.placeholder || '选择日期'">
                </el-date-picker>
              </template>
              <template v-if="item.type === 'cascader'">
                <el-cascader size="large" :style="{ width: item.inputWidth }" ref="cascader" clearable
                  :filterable="item.filterable" :placeholder="'请选择' + item.label" v-model="searchForm[item.key]"
                  :options="item.options"
                  :props="{ value: item.opKey, label: item.opLabel, multiple: item.multiple, expandTrigger: 'hover', emitPath: item.emitPath === true ? true : false, checkStrictly: item.checkStrictly === false ? false : true }"
                  :collapse-tags="item.collapse ? true : false" :show-all-levels="item.showAllLevels" />
              </template>
            </el-form-item>
          </template>
        </div>
        <div class="serach-btn">
          <el-button size="large" @click="handleMore" v-if="rowNum!=0">
            {{ !isMore ? '展开搜索' : '收起搜索' }}
            <el-icon class="btn-icon" v-if="!isMore">
              <DArrowRight />
            </el-icon>
            <el-icon class="btn-icon" v-else>
              <DArrowLeft />
            </el-icon>
          </el-button>
          <el-button size="large" @click="resetClick()">
            重置
          </el-button>
          <el-button class="query-btn" size="large" type="primary" @click="queryClick">
            搜索
          </el-button>
          <el-button v-if="isExport"  size="large" @click="exportClick">
            导出
          </el-button>
        </div>
      </div>
    </el-form>


  </div>
</template>

<script lang="ts" setup>
import { FormInstance } from 'element-plus'
import { reactive, Ref, ref, toRaw, watch } from 'vue'
import { SearchConfig } from './Search'

const ruleFormRef = ref()
const props = withDefaults(defineProps<{
    searchConfig: SearchConfig[],
    searchForm: { [key: string]: any},
    rowNum?: number
    isExport?:boolean
	}>(),{
	  rowNum:0
	})
const emits = defineEmits(['queryClick', 'resetClick', 'exportClick','selectChange'])
const isMore = ref(false)
const searchList = ref<SearchConfig[]>([])

watch(() => props.searchConfig, (val) => {
  if(props.rowNum==0){
    searchList.value = toRaw(val)
    return
  }
  if (toRaw(val).length <= props.rowNum) {
    searchList.value = toRaw(val)
  } else {
    if (isMore.value) {
      searchList.value = toRaw(val)
    } else {
      searchList.value = toRaw(val).slice(0, props.rowNum)
    }
  }
}, { immediate: true })
function handleMore() {
  isMore.value=!isMore.value
  if ( toRaw(props.searchConfig).length <= props.rowNum) {
    searchList.value =  toRaw(props.searchConfig)
  } else {
    if (isMore.value) {
      searchList.value =  toRaw(props.searchConfig)
    } else {
      searchList.value = toRaw(props.searchConfig).slice(0, props.rowNum)
    }
  }
}

const queryClick = ()=> {
  emits('queryClick', toRaw(props.searchForm))
}
const resetClick = () => {
  ruleFormRef.value.resetFields()
  emits('resetClick', '重置')
}
const exportClick = ()=>{
  emits('exportClick', toRaw(props.searchForm))
}
const selectChange = (key:string)=>{
  emits('selectChange', key,toRaw(props.searchForm[key]))
}

defineExpose<{reset: () => void}>({
  reset: ()=> ruleFormRef.value.resetFields()
})
</script>


<style lang="scss" scoped>
.search-container {
  width: 100%;
  max-height: 100%;

  .search-top {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .serach-btn {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .btn-icon {
      transform: rotate(90deg);
    }

  }

  .label-box {
    :deep(.el-form-item__label) {
      width: var(--labelWidth);
      height: 40px;
      line-height: 40px;
    }
  }
}

:deep(.el-button) {
  color: #005da7;
  border: 1px solid #005da7;
  background: #f2f5fe;

}

:deep(.el-button:hover,.el-button:focus) {
  color: #ffffff;
  border-color: #005da7;
  background-color: #005da7;

  .default {
    display: none;
  }

  .hover {
    display: block;
  }
}

:deep(.el-button:active) {
  color: #ffffff;
  border-color: #004e8d;
  background-color: #004e8d;
}

:deep(.query-btn){
  color: #ffffff;
  border: 1px solid #005da7;
  background: #005da7;
}
:deep(.el-form-item){
  margin-right: 15px;
}
</style>