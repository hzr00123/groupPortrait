<template>
  <div class="ScientificResearch">
    <Tabs :topBtnList="topBtnList" :isActive="isActive" @changeClick="changeClick" />
    <Overview v-if="isActive == 'Overview'" :params="params" :direction="direction" />
    <AcademicPapers v-if="isActive == 'Academic_papers'" :params="params" :direction="direction" />
    <StudentWorks v-if="isActive == 'Academic_works'" :params="params" :direction="direction" />
    <ResearchReport v-if="isActive == 'research_report'" :params="params" :direction="direction" />
    <AppraisalResults v-if="isActive == 'Appraisal_results'" :params="params" :direction="direction" />
    <ArtisticWorks v-if="isActive == 'artistic_works'" :params="params" :direction="direction" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, useAttrs, watch } from 'vue'
import Tabs from '@/components/common/Tabs.vue'
import Overview from './components/Overview.vue'
import AcademicPapers from './components/AcademicPapers.vue'
import StudentWorks from './components/StudentWorks.vue'
import ResearchReport from './components/ResearchReport.vue'
import AppraisalResults from './components/AppraisalResults.vue'
import ArtisticWorks from './components/ArtisticWorks.vue'
import { WarnMenuListRes } from '@/api/types/attentionGroup'
import { TabsConfig } from '@/components/common/Search'
import { BaseParams } from '../types'
const props = withDefaults(defineProps<{
  params: BaseParams, selectList?: TabsConfig[], isActive?: string, direction?: "horizontal" | "vertical"
}>(), {
  selectList: [
    {
      key: 'Overview',
      label: '总览',
      icon: 'zl',
      show: false,
    },
    {
      key: 'Academic_papers',
      label: '学术论文',
      icon: 'xslw',
      show: false,
    },
    {
      key: 'Academic_works',
      label: '学术著作',
      icon: 'xszz',
      show: false,
    },
    {
      key: 'research_report',
      label: '研究报告',
      icon: 'yjbg',
      show: false,
    },
    {
      key: 'Appraisal_results',
      label: '鉴定成果',
      icon: 'jdcg',
      show: false,
    },
    {
      key: 'artistic_works',
      label: '艺术作品',
      icon: 'yszp',
      show: false,
    },
  ] as any,
  isActive: 'Overview',
  direction: 'horizontal'
})
const attrs = useAttrs()
const icons = {
  Overview: 'zl',
  Academic_papers: 'xslw',
  Academic_works: 'xszz',
  research_report: 'yjbg',
  Appraisal_results: 'jdcg',
  artistic_works: 'yszp'
}
const list = props.selectList!.map(i => ({ ...i, icon: icons[i.key] }))
const isActive = ref<string | number>(props.isActive)
const topBtnList = reactive<TabsConfig[]>(list)
const changeClick = (val: number | string) => {
  isActive.value = val;
}
watch(() => attrs.warning as WarnMenuListRes, v => {
  if (v && v.length > 0) {
    v.forEach(i => {
      const index = topBtnList.findIndex(it => it.key === i.ident)
      if (i.warnList && i.warnList.length > 0 && index !== -1) {
        topBtnList[index].show = true
      }
    })
  }
}, { immediate: true, deep: true })
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>