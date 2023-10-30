<template>
  <el-tab-pane v-for="it in tabItems" :label="it.catalog_name" :name="it.id" :key="it.catalog_name + it.warning">
    <template #label v-if="!!it.warning">
      <img class="warn" src="@/assets/imgs/warn.png" alt="">
      <span class="custom-tabs-label">
        <span>{{ it.catalog_name }}</span>
      </span>
    </template>
    <div v-loading="tabLoading" class="pane-contnet" :id="'seal-' + active" v-if="active == it.id">
      <component :is="it.component" :warning="it.warning" :params="params" />
    </div>
  </el-tab-pane>
</template>

<script setup lang="ts">
import { inject, watch, reactive, shallowRef, toRef, ref, provide } from 'vue';
import ComprehensiveFace from '@/components/group-image/ComprehensiveFace/index.vue' //综合面貌
import StudentDistribution from '@/components/group-image/StudentDistribution/index.vue' //学生分布
import ClassroomBehavior from '@/components/group-image/ClassroomBehavior/index.vue' //上课行为
import AcademicLevel from '@/components/group-image/AcademicLevel/index.vue' //学业水平
import ScientificResearch from '@/components/group-image/ScientificResearch/index.vue' //科学研究
import RewardsPunishmentsHelpLoans from '@/components/group-image/RewardsPunishmentsHelpLoans/index.vue' //奖助贷勤
// import PracticeActivity from '@/components/group-image/PracticeActivity/index.vue' //实践活动
// import BooksBorrow from '@/components/group-image/BooksBorrow/index.vue' //图书借阅
import OnlineBehavior from '@/components/group-image/OnlineBehavior/index' //上网行为
import ConsumptionSituation from '@/components/group-image/ConsumptionSituation/index.vue' //消费情况
import LivingHabit from '@/components/group-image/LivingHabit/index' //生活习惯
import MentalHealth from '@/components/group-image/MentalHealth/index.vue' //心理健康
import PhysicalHealth from '@/components/group-image/PhysicalHealth/index' //体质健康
import SocialRelationship from '@/components/group-image/SocialRelationship/index.vue' //社交关系
import GraduateEmployment from '@/components/group-image/GraduateEmployment/index' //毕业就业
import { getWarnMenuList } from '@/api/modules/attentionGroup';
import { TabPaneWarningType } from './type';
import { BaseParams } from '@/components/group-image/types';
import { WarnMenuListRes } from '@/api/types/attentionGroup';

const props = defineProps<{ active: string, load: boolean }>()

const tabItems = reactive<TabPaneWarningType[]>([
  {
    catalog_name: '综合面貌',
    id: '1',
    warning: null,
    component: shallowRef(ComprehensiveFace),
  },
  {
    catalog_name: '学生分布',
    id: '2',
    warning: null,
    component: shallowRef(StudentDistribution),
  },
  {
    catalog_name: '上课行为',
    id: '3',
    warning: null,
    component: shallowRef(ClassroomBehavior),
  },
  {
    catalog_name: '学业水平',
    id: '4',
    warning: null,
    component: shallowRef(AcademicLevel),
  },
  {
    catalog_name: '科学研究',
    id: '5',
    warning: null,
    component: shallowRef(ScientificResearch),
  },
  {
    catalog_name: '奖助贷勤',
    id: '6',
    warning: null,
    component: shallowRef(RewardsPunishmentsHelpLoans),
  },
  // {
  //   catalog_name: '实践活动',
  //   id: '7',
  //   warning: null,
  //   component: shallowRef(PracticeActivity),
  // },
  // {
  //   catalog_name: '图书借阅',
  //   id: '8',
  //   warning: null,
  //   component: shallowRef(BooksBorrow),
  // },
  {
    catalog_name: '上网行为',
    id: '9',
    warning: null,
    component: shallowRef(OnlineBehavior),
  },
  {
    catalog_name: '消费情况',
    id: '10',
    warning: null,
    component: shallowRef(ConsumptionSituation),
  },
  {
    catalog_name: '生活习惯',
    id: '11',
    warning: null,
    component: shallowRef(LivingHabit),
  },
  // {
  //   catalog_name: '心理健康',
  //   id: '12',
  //   warning: null,
  //   component: shallowRef(MentalHealth),
  // },
  {
    catalog_name: '体质健康',
    id: '13',
    warning: null,
    component: shallowRef(PhysicalHealth),
  },
  // {
  //   catalog_name: '社交关系',
  //   id: '14',
  //   warning: null,
  //   component: shallowRef(SocialRelationship),
  // },
  {
    catalog_name: '毕业就业',
    id: '15',
    warning: null,
    component: shallowRef(GraduateEmployment),
  }
])
const params = inject<BaseParams>('params', {} as any)
const seal = ref<WarnMenuListRes>([])
const tabLoading = ref(false)
const sealAllData = ref<WarnMenuListRes>([])
provide('sealKey', toRef(props, 'active'))
provide('sealAllData', sealAllData)
const setLoading = (v: boolean)=>{
  tabLoading.value = v
}
provide('setLoding', setLoading)
const traverseChildren = (data: any) => {
  const result: any[] = []
  for (const item of data) {
    const index = tabItems.findIndex(v => v.catalog_name === item.catalog_name)
    if (item.warnList && item.warnList.length) {
      result.push(item);
    }
    if (item.children && item.children.length > 0) {
      (index !== -1) && (tabItems[index].warning = item.children);
      const childrenItems = traverseChildren(item.children);
      result.push(...childrenItems);
    }
  }
  return result
}
provide('seal', seal)
watch(toRef(props, 'load'), () => {
  getWarnMenuList(params!).then(res => {
    if (res.code == 1 && res.data) {
      sealAllData.value = res.data
      seal.value = traverseChildren(res.data)
    }
  })
}, { immediate: true })
</script>


<style lang="scss" scoped>
.pane-contnet {
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, transparent 20px, #ffffff 0);
}
</style>

