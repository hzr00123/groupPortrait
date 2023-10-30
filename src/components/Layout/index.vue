<template>
    <div class="layout">
        <el-container class="app-content">
            <Aside />
            <el-container style="padding-bottom: 20px;">
                <el-header>
                    <Header />
                </el-header>
                <el-main class="app-main">
                    <router-view />
                </el-main>
            </el-container>
        </el-container>
        <vsetting v-if="show"/>
    </div>
</template>

<script setup lang="ts">
import Aside from './aside.vue'
import vsetting from './vsetting.vue'
import Header from './header.vue';
const show = import.meta.env.MODE === 'development'
</script>

<style lang="less" scoped>
.layout {
    height: 100%;
    width: 100%;
    background: #F5F5F7;
    .v-setting {
        position: absolute;
        right: 0;
        top: 45%;
    }
}

.app-content {
    height: 100%;
}

.el-header {
    height: auto;
    padding: 20px 20px 10px;
    display: flex;
    align-items: center;
    width: 100%;
}
</style>