<template>
    <div class="cm-title">
        {{ props.title }}
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ title: string }>()
</script>

<style lang="scss" scoped>
.cm-title {
    &::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        border: 2px solid #B22A25;
        border-radius: 50%;
        margin-right: 8px;
        font-size: 18px;
        color: #203449;
    }
}
</style>