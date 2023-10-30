<template>
  <div class="classroom-behavior">
    <Tabs :topBtnList="topBtnList" :isActive="isActive" @changeClick="changeClick" />
    <div class="classroom-behavior-content">
      <School_attendance :params="params!" v-if="isActive === 'school_attendance'" :direction="direction"/>
      <Changes_in_student_status :params="params!" v-if="isActive === 'Changes_in_student_status'" :direction="direction"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch, reactive, useAttrs } from 'vue'
import Tabs from '@/components/common/Tabs.vue'
import School_attendance from './components/School_attendance.vue'
import Changes_in_student_status from './components/Changes_in_student_status.vue'
import { BaseParams } from '../types'
import { WarnListType, WarnMenuListRes } from '@/api/types/attentionGroup'
const props = withDefaults(defineProps<{
    params: BaseParams, selectList?: any[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
  params: {} as any,
  selectList: [
    {
      key: 'school_attendance',
      label: '上课出勤',
      icon: 'skcq',
      show: false,
      warning: [] as WarnListType
    },
    {
      key: 'Changes_in_student_status',
      label: '学籍变动',
      icon: 'xjbd',
      show: false,
      warning: [] as WarnListType
    },
  ] as any,
  isActive: 'school_attendance',
  direction: 'horizontal',
})
const attrs = useAttrs()
const isActive = ref<string | number>(props.isActive)
const params = inject<BaseParams>('params',  {} as any)
const icons = {
  school_attendance: 'skcq',
  Changes_in_student_status: 'xjbd',
}
const list = props.selectList!.map(i => ({...i, icon: icons[i.key]}))
const topBtnList = reactive(list)

const changeClick = (val: number | string) => {
  isActive.value = val;
}

watch(() => attrs.warning as WarnMenuListRes, v => {
  if(v && v.length > 0){
    v.forEach(i => {
      const index = topBtnList.findIndex(it => it.key === i.ident)
      if (i.warnList && i.warnList.length > 0 && index !== -1) {
        topBtnList[index].warning = i.warnList
        topBtnList[index].show = true
      }
    })
  }
}, { immediate: true, deep: true })

</script>
<style lang="scss" scoped>
@import './index.scss';
</style>