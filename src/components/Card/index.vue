<template>
    <div class="c-card">
        <header>
            <div class="title" v-if="title">{{ title }}</div>
            <slot name="operation"/>
        </header>
        <section>
            <slot />
        </section>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title?: string
}>()
</script>

<style lang="less" scoped>
.c-card {
    width: 100%;
    background: #ffffff;
    background: linear-gradient(-45deg, transparent 20px, #ffffff 0);
    box-sizing: border-box;
    section {
        display: flex;
        padding: 20px;
        flex-direction: column;
        justify-content: space-around;
    }
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 15px;
        .title {
            background: #1B528B;
            background: linear-gradient(-45deg, transparent 8px, #1B528B 0);
            box-sizing: border-box;
            color: #FFF;
            width: 100px;
            padding: 8px 18px;
            font-size: 16px;
            font-family: Medium;
            color: #FFFFFF;
            line-height: 22px;
        }

    }
}
</style>