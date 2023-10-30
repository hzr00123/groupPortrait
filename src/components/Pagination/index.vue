<template>
    <el-pagination
      background
      :small="pages.small"
      v-model:current-page="currentPage"
      :page-size="pages.size"
      :page-sizes="[10, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pages.total"
      @size-change="changeSize"
      @current-change="changeCurrent"
    />
</template>
    
<script setup lang="ts">
import { ref } from 'vue'
import { Pages } from './index'
const props = defineProps<{pages: Pages}>()

const currentPage = ref(props.pages.current)

const emits = defineEmits(['changeSize', 'changeCurrent'])

const changeSize = (val: number) => {
    emits('changeSize', val)
}
const changeCurrent = (val: number) => {
    emits('changeCurrent', val)
}
</script>
    
<style lang="scss" scoped>
.el-pagination{
    justify-content: end;
}
</style>