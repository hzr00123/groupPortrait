<template>
    <div class="c-card-tabs">
        <c-card>
            <section class="content">
                <el-tabs :modelValue="activeName" class="demo-tabs" @tab-click="handleClick">
                    <el-tab-pane 
                    v-for="item in tabs" 
                    :key="item.name" 
                    :label="item.label"
                    :name="item.name">
                        <slot name="pane-content" :data="{...item, start: _val.start, end: _val.end}" v-if="item.name === activeName"/>
                    </el-tab-pane>
                </el-tabs>
                <el-date-picker v-if="isDaterange"
                    v-model="(value1 as any)"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    value-format="YYYY-MM-DD"
                    size="large"
                    style="width: 270px;"
                    @change="datePickerChange"
                />
            </section>
        </c-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed  } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import { List, active, daterange } from './index'
defineProps<{
    tabs: List,
    activeName: active
    isDaterange: daterange
}>()
const value1 = ref([])
const emit = defineEmits(['tabClick', 'datePickerChange'])

const handleClick = (tab: TabsPaneContext) => {
    emit('tabClick', tab)
}

const datePickerChange = (val: typeof Array) => {
    // value1.value = val;
    emit('datePickerChange', val)
}

const _val = computed(()=>{
    if(value1.value) {
        return {
            start: value1.value[0],
            end: value1.value[1]
        }
    } else {
        return {
            start: undefined,
            end: undefined
        }
    }
})

defineExpose({_val, value1})
</script>

<style lang="less" scoped>
.c-card-tabs {
    .c-card {
        :deep(.demo-tabs) {
            .el-tabs__nav {
                height: 58px;
                align-items: center;
            }
            .el-tabs__active-bar {
                width: 30px !important;
                height: 4px;
                border-radius: 2px;
            }
            .el-tabs__item {
                font-size: 20px;
                font-family: Medium;
                font-weight: 500;
                color: #767676;
                line-height: 28px;
                &.is-active {
                    color: #000000;
                }
            }
        }
        :deep(section) {
            padding-top: 0;

        }
    }
    .content {
        display: flex;
        position: relative;
        :deep(.el-date-editor)  {
            position: absolute;
            right: 0;
            top: 9px;
        }
        .demo-tabs {
            width: 100%;
            // width: 80%;
        }
    }
}
</style>