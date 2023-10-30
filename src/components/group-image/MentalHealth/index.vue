<template>
  <div class="MentalHealth">
    <Tabs :topBtnList="topBtnList" :isActive="isActive" @changeClick="changeClick" />
    <Assessment v-if="isActive == 'Distribution_of_Big_Five_Personality_Traits'" :direction="direction"
      :selectList="chilrenList" :params="params" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tabs from '@/components/common/Tabs.vue'
import Assessment from './components/Assessment.vue'
import { BaseParams } from '../types'

const props = withDefaults(defineProps<{
  params: BaseParams, selectList?: any[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
  selectList: [
    {
      key: 'Distribution_of_Big_Five_Personality_Traits',
      label: '综合测评',
    },
    {
      key: 'depressed',
      label: '抑郁',
    },
    {
      key: 'anxious',
      label: '焦虑',
    },
    {
      key: 'Low_life_events',
      label: '生活事件低',
    },
  ] as any,
  isActive: 'scholarship',
  direction: 'horizontal',
})
const icons = {
  Distribution_of_Big_Five_Personality_Traits: 'zhcp',
  depressed: 'yy',
  anxious: 'jl',
  Low_life_events: 'shsjd'
}
const list = props.selectList!.map(i => ({ ...i, icon: icons[i.key] }))
const isActive = ref<string | number>(list[0].key)
const topBtnList = ref(list)
const changeClick = (val: number | string) => {
  isActive.value = val;
}

const chilrenList = computed<any[] | undefined>(() => {
  const item = topBtnList.value.find(i => i.key === isActive.value)
  return item?.children
})
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>