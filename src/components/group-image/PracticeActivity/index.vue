<template>
    <div>
        <Tabs :top-btn-list="topBtnList" :is-active="active" @change-click="(v: string) => active = v" />
        <MilitaryTraining v-if="active === 'military_training'" :direction="direction" :params="params" :selectList="chilrenList"/>
        <Classroom v-if="active === 'overview2'" :direction="direction" :params="params" :selectList="chilrenList"/>
        <Campus v-if="active === 'overview3'" :direction="direction" :params="params" :selectList="chilrenList"/>
    </div>
</template>
    
<script setup lang='ts'>
import Tabs from '@/components/common/Tabs.vue'
import MilitaryTraining from './components/MilitaryTraining';
import Classroom from './components/Classroom';
import Campus from './components/Campus';
import { ref, reactive, computed } from 'vue'
import { BaseParams } from '../types'

const props = withDefaults(defineProps<{
    params: BaseParams, selectList?: any[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
    selectList: [
        {
            key: 'military_training',
            label: '思想教育',
        },
        {
            key: 'overview2',
            label: '第二课堂',
        },
        {
            key: 'overview3',
            label: '校园活动参与度',
        }
    ] as any,
    isActive: 'military_training',
    direction: 'horizontal',
})
const icons = {
    military_training: 'jiang-xue-jin',
    overview2: 'zhu-qin-dai-bu',
    overview3: 'huo-jiang-zheng-shu'
}
const active = ref(props.isActive)
const list = props.selectList!.map(i => ({ ...i, icon: icons[i.key] }))
const topBtnList = reactive(list)

const chilrenList = computed(() => {
    const item = topBtnList.find(i => i.key === active.value)
    return item?.children
})
</script>
    
<style></style>