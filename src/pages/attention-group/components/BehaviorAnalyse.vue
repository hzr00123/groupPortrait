<template>
    <el-dialog
        v-model="dialogVisible"
        title="添加行为分析"
        width="50%"
    >
        <el-row :gutter="20" class="content">
            <el-col :span="7">
                <c-card-tree
                :treeList="treeList"
                activeColor="#1D538C"
                @handleNodeClick="handleNodeClick"/>
            </el-col>
            <el-col :span="17">
                <div class="charts-view">
                    <header>
                        <div class="c-title">图表样式预览</div>
                    </header>
                    <section>
                        <component is="c-stackedLine"/>
                        <!-- <c-stackedLine /> -->
                    </section>
                </div>
            </el-col>
        </el-row>

        <template #footer>
        <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogVisible = false">
            保存
            </el-button>
        </span>
        </template>
    </el-dialog>
</template>
    
<script setup lang='ts'>
import { computed } from 'vue'
import { Tree } from '@/components/CardTree/index'
import { defineAsyncComponent } from 'vue'
const props = defineProps<{
    visible: boolean
}>()

const CCardTree = defineAsyncComponent({
    loader: () => import('@/components/CardTree/index.vue'),
    delay: 1000,
})

// const CStackedLine = defineAsyncComponent({
//     loader: () => import('@/components/Echarts/StackedLine.vue'),
//     delay: 1000,
// })

const treeList: Tree[] = [
    {
        id: '1',
        label: '综合面貌',
        icon: 'file-icon',
        children: [
            {
                id: '2-1',
                label: '挂科人群'
            },
            {
                id: '2-2',
                label: '旷课人群'
            }
        ]
    },
    {
        id: '2',
        label: '消费情况',
        icon: 'file-icon',
        children: [
            {
                id: '2-1',
                label: '消费记录',
                icon: 'file-icon',
                children: [
                    {
                        id: '2-1-1',
                        label: '消费金额'
                    },
                    {
                        id: '2-2',
                        label: '消费偏好'
                    },
                    {
                        id: '2-2',
                        label: '消费地点'
                    }
                ]
            },
            {
                id: '2-2',
                label: '食堂消费'
            }
        ]
    }
]

const emits = defineEmits(['update:visible', 'handleNodeClick']);

const dialogVisible = computed({
    get:() => {
        return props.visible
    },
    set:(visible: boolean) => {
        emits('update:visible', visible);
    }
})

const handleNodeClick = (data: Tree) => {
    emits('handleNodeClick', data)
}
</script>
    
<style lang="scss" scoped>
.content {
    height: 400px;
    display: flex;
    justify-content: space-between;
    :deep(.c-card-tree) {
        border: 1px solid #E5E8EA;
        border-radius: 2px;
    }
    .charts-view {
        header {
            background: #F1F4F8;
            border: 1px solid #D6E4F1;
            padding: 14px;
        }
        section {
            border: 1px solid #D6E4F1;
            border-top: none;
            padding: 20px;
            height: 345px;
        }
    }
}
</style>