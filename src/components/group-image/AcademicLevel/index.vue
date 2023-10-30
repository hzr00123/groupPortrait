<template>
  <div class="academic-level">
    <Tabs :topBtnList="topBtnList" :isActive="isActive" @changeClick="changeClick" />
    <SchoolWork v-if="isActive == 'GPA'" :params="params!" :direction="direction" :selectList="chilrenList"/>
    <CourseProgress v-if="isActive == 'Course_progress'" :params="params!"  :direction="direction"/>
    <SelfStudy v-if="isActive == 'Self_study_and_self-study'" :params="params!"  :direction="direction"/>
    <PerformanceImpact v-if="isActive == 'Performance_Impact'" :params="params!"  :direction="direction"/>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, getCurrentInstance, computed, onMounted, nextTick, inject, useAttrs } from 'vue'
import Tabs from '@/components/common/Tabs.vue'
import SchoolWork from './components/SchoolWork.vue'
import CourseProgress from './components/CourseProgress.vue'
import SelfStudy from './components/SelfStudy.vue'
import PerformanceImpact from './components/PerformanceImpact.vue'
import { BaseParams } from '../types'
import { WarnMenuListRes } from '@/api/types/attentionGroup';
const props = withDefaults(defineProps<{
    params: BaseParams, selectList?: any[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
    selectList: [
  {
    key: 'GPA',
    label: '学业成绩',
    icon: 'skcq',
  },
  {
    key: 'Course_progress',
    label: '修课进度',
    icon: 'xjbd',
  },
  {
    key: 'Self_study_and_self-study',
    label: '自修自习',
    icon: 'zxzx',
  },
  {
    key: 'Performance_Impact',
    label: '成绩影响',
    icon: 'cjyx',
  },
] as any,
    isActive: 'GPA',
    direction: 'horizontal',
})
const content = useAttrs()
const icons = {
  GPA: 'skcq',
  Course_progress: 'xjbd',
  'Self_study_and_self-study': 'zxzx',
  Performance_Impact: 'cjyx'
}
const isActive = ref<string | number>(props.isActive)
const params = inject<BaseParams>('params',  {} as any)
const list = props.selectList!.map(i => ({...i, icon: icons[i.key]}))
const topBtnList = ref(list)
const changeClick = (val: number | string) => {
  isActive.value = val;
}
const chilrenList = computed(()=> {
    const item = topBtnList.value.find(i => i.key === isActive.value)
    return item?.children
})

watch(()=> content.warning as WarnMenuListRes, v=>{
    if(v && v.length > 0){
    v.forEach(i => {
        const index = topBtnList.value.findIndex((v:any) => v.label === i.catalog_name)
        if (index !== -1) {
            topBtnList.value[index].show = true
        }
    })
    }
}, { immediate: true, deep: true })
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>