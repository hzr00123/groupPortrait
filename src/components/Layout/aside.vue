<template>
    <el-aside width="220px">
        <img class="logo" src="@/assets/imgs/logo.png" alt="">
        <Menu :menuList="(menu as MenuType)"/>
    </el-aside>
</template>

<script setup lang="ts">
import Menu from './menu.vue';
import { useRouter } from 'vue-router'
import { cloneDeep } from 'lodash'
import { Menu as MenuType } from './index';
import { userStore } from '@/store/user';
import { ref, watchEffect } from 'vue';
const store = userStore()
const menuList = cloneDeep(useRouter().options.routes.filter(it => it.name === 'group-layout')[0])

menuList.children?.forEach((item, index) => {
    if(item.children){
        item.children = item.children.filter(i => !i.meta?.hidden)
    }
})

const menu = ref(menuList)
const setingMenu = ['label-management', 'advanced-setting']
watchEffect(()=>{
    const seting = store.setingVal
    const _menu = cloneDeep(menuList)
    if(seting){
        _menu.children = _menu.children!.filter(i => setingMenu.includes(i.name! as string))
        menu.value = _menu
    } else {
        _menu.children = _menu.children!.filter(i => !setingMenu.includes(i.name! as string))
        menu.value = _menu
    }
})

</script>

<style scoped>
.el-aside {
    height: 100%;
    padding: 20px 0;
    background: #FBFBFB;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.logo{
    width: 135px;
    margin-bottom: 20px;
}
</style>