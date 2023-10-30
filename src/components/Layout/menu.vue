<template>
    <el-menu
    background-color="#FBFBFB"
    class="el-menu-vertical-demo"
    :collapse-transition="false"
    :default-active="active">
        <template v-for="item in menuList.children" :key="item.name">
            <el-sub-menu :index="item.name" v-if="item.children && item.children.length > 1">
                <template #title>
                    <svg-icon :icon-class="item.meta.icon"/>
                    <span>{{ item.meta.title }}</span>
                </template>
                <el-menu-item v-for="it in item.children"
                :key="it.name"
                :index="it.name" 
                @click="jumpMenu(it)">
                {{ it.meta.title }}
                </el-menu-item>
            </el-sub-menu>
            <template v-else>
                <el-menu-item :index="item.name" @click="jumpMenu(item)" v-if="!['/404', '/:pathMath(.*)'].includes(item.path)">
                    <svg-icon :icon-class="item?.meta?.icon" v-if="item?.meta?.icon"/>
                    <span>{{ item?.meta?.title }}</span>
                </el-menu-item>
            </template>
        </template>
    </el-menu>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, watchEffect } from 'vue'
import { Menu } from './index'
defineProps<{
    menuList: Menu
}>()

const router = useRouter();
const active = ref('');
const R = useRoute()
watchEffect(()=>{
    const pName = R.meta.pName as string
    active.value = R.meta.pName ?  pName : R.name as string;
})

const jumpMenu = (value:any) => {
    if(['/404', '/:pathMath(.*)'].includes(value.path)) return;
    router.push(value.path)
}
</script>

<style lang="less">
.el-menu {
    border-right: none !important;
    .svg-icon {
        color: #B22924;
    }
    .el-sub-menu {
        .el-sub-menu__title {
            height: 48px;
            font-size: 16px;
            &:hover {
                background-color: #FBFBFB;
            }
        }

        .el-menu {
            font-size: 16px;
            background-color: #F5EDED;
            .el-menu-item {
                height: 48px;
            }
        }
        &.is-active {
            .svg-icon {
                color: #FFF;
            }
            .el-sub-menu__title {
                background-color: #B22924 !important;
                color: #FFF;
                box-shadow: 0px 0px 20px 0px #FFADAB;
                border-radius: 8px;
            }
            .el-menu {
                .el-menu-item.is-active {
                    border-radius: 0;
                    background-color: #F5EDED;
                    color: #1F384A;
                    box-shadow: none;
                    position: relative;
                    &::before{
                        width: 3px;
                        height: 13px;
                        background: #B22924;
                        border-radius: 2px;
                        content: "";
                        display: inline-block;
                        position: absolute;
                        left: 28px;
                    }
                }
            }
        }
    }
    >.el-menu-item {
        font-size: 16px;
        height: 48px;
        &:hover {
            background-color: transparent;
        }
        &.is-active {
            transition: none;
            background-color: #B22924;
            color: #FFF;
            box-shadow: 0px 0px 20px 0px #FFADAB;
            border-radius: 8px;
            .svg-icon {
                color: #FFF;
            }
        }
    }
}
</style>