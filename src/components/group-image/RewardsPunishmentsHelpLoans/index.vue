/**奖助贷勤
 */

<template>
    <div class="rewards">
        <Tabs :top-btn-list="topBtnList" :is-active="active" @change-click="v => active = v" />
        <Scholarship v-if="active == 'scholarship'" :params="params!" :direction="direction"/>
        <LoanSupplement v-if="active == 'overview__of_funding'" :params="params!" :direction="direction" :selectList="chilrenList"/>
        <Certificate v-if="active == 'Award_certificate'" :params="params!" :direction="direction"/>
    </div>
</template>

<script setup lang="ts">
import Tabs from '@/components/common/Tabs.vue'
import { computed, inject, reactive, ref, useAttrs, watch, provide } from 'vue';
import { BaseParams } from '../types';
import Scholarship from './components/Scholarship';
import LoanSupplement from './components/LoanSupplement';
import Certificate from './components/Certificate';
import { WarnMenuListRes } from '@/api/types/attentionGroup';
import InstanceManager from "@/utils"
const props = withDefaults(defineProps<{
    params: BaseParams, selectList?: any[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
    selectList: [
        {
            key: 'scholarship',
            label: '奖学金',
        },
        {
            key: 'overview__of_funding',
            label: '助勤贷补',
        },
        {
            key: 'Award_certificate',
            label: '获奖证书',
        }
    ] as any,
    isActive: 'scholarship',
    direction: 'horizontal',
})
provide('InstanceManager', new InstanceManager())
const content = useAttrs()
const icons = {
    scholarship: 'jiang-xue-jin',
    overview__of_funding: 'zhu-qin-dai-bu',
    Award_certificate: 'huo-jiang-zheng-shu'
}
const active = ref(props.isActive)
const params = inject<BaseParams>('params', {} as any)
const list = props.selectList!.map(i => ({...i, icon: icons[i.key]}))
const topBtnList = reactive(list)

const chilrenList = computed(()=> {
    const item = topBtnList.find(i => i.key === active.value)
    return item?.children
})

watch(()=> content.warning as WarnMenuListRes, v=>{
    if(v && v.length > 0){
    v.forEach(i => {
        const index = topBtnList.findIndex((v:any) => v.label === i.catalog_name)
        if (index !== -1) {
            topBtnList[index].show = true
        }
    })
    }
}, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.rewards {
    width: 100%;
}
</style>