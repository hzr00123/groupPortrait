<template>
    <div class="c-card-tree" :style="{ '--activeColor': 'none' }">
        <c-card ref="cardDom">
            <el-input v-if="!showSearch" class="mg-b15" v-model="nameValue" :placeholder="placeholder"
                @keyup.enter.native="searchTree">
                <template v-slot:suffix>
                    <el-icon @click="searchTree">
                        <Search />
                    </el-icon>
                </template>
            </el-input>
            <el-scrollbar :height="scrollbarHeight + 'px'">
                <el-tree class="tree" :data="treeList" default-expand-all @node-click="handleNodeClick">
                    <template #default="{ node, data }">
                        <div class="title-box" v-tip="node.label" :class="{ 'c-tree-is-active': data[activeKey] === active }">
                            <slot v-if="data.slot" :name="data.slot" :data="data" />
                            <template v-else>
                                <slot name="popor" :data="data">
                                    <ElTooltip :enterable="false" :content="node.label" disabled>
                                        <span>
                                            <svg-icon class="svg-icon" v-if="data.icon" :icon-class="data.icon" />
                                            <span>{{ node.label }}</span>
                                        </span>
                                    </ElTooltip>
                                </slot>
                            </template>

                        </div>
                    </template>
                </el-tree>
            </el-scrollbar>
        </c-card>
    </div>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, onBeforeUpdate, onUnmounted, Directive, VNodeArrayChildren, VNode } from 'vue'
import { Tree } from './index'
const props = withDefaults(defineProps<{
    treeList: Tree[],
    activeColor?: string
    isChildActive?: boolean //是否只允许最后一级子节点点击
    placeholder?: string
    showSearch?: boolean //是否显示搜索框
    fistNode?: boolean //是否默认选中第一个子节点
    activeKey?: string //选中项的标识，默认id
}>(), {
    placeholder: '请输入用户群名称搜索',
    fistNode: true,
    activeKey: 'id'
})

const nameValue = ref('');
/**
 * 当前选中节点
 */
const active = ref<string | number>()

const emit = defineEmits<{
    (e: 'handleNodeClick', data: Tree): void
    (e: 'search', val: string): void
}>()

const searchTree = () => {
    // console.log(nameValue.value);
    emit('search', nameValue.value)
}

const findLastNode = (data: Tree[]): Tree => {
    const fist = data[0]
    if (fist.children && fist.children.length > 0) {
        return findLastNode(fist.children)
    } else {
        return fist
    }
}

let count = 0
onBeforeUpdate(() => {
    if (props.fistNode && props.treeList.length > 0 && count < 1) {
        handleNodeClick(findLastNode(props.treeList))
        count++
    }
})

const handleNodeClick = (data: Tree) => {
    if (props.isChildActive) {
        if (!data.children || data.children.length < 1) {
            active.value = data[props.activeKey]
            emit('handleNodeClick', data)
        }
    } else {
        active.value = data[props.activeKey]
        emit('handleNodeClick', data)
    }
}

const cardDom = ref()
const scrollbarHeight = ref(0)
const resizeEvt = () => {
    scrollbarHeight.value = cardDom.value?.$el.clientHeight - 100;

}
onMounted(() => {
    scrollbarHeight.value = cardDom.value?.$el.clientHeight - 100;
    window.addEventListener('resize', resizeEvt)
})

onUnmounted(() => {
    window.removeEventListener('resize', resizeEvt)
})

const findDeepItem = (node: VNode) =>{
    let item,
    children = node.children
    while (!item && children && Array.isArray(children) && children.length > 0) {
        item = children.find(i => i!['type']?.name === 'ElTooltip')
        children = children[0]!['children'] as VNodeArrayChildren
    }
    return item
}

const vTip: Directive = {
    mounted(el, _binding, vnode){
        const parent = el.parentElement
        if(el.offsetWidth + 24 + (Number(parent.style.paddingLeft.replace('px', ''))) > parent.offsetWidth){
            const tooltip = findDeepItem(vnode)
            tooltip && (tooltip['component']['props'].disabled = false)
        }
    }
}
</script>

<style lang="scss" scoped>
$acolor: var(--activeColor);

.c-card-tree {
    width: 100%;
    height: 100%;

    .c-card {
        height: 100%;

        :deep(section) {
            height: 100%;
        }

        // overflow-y: auto;
    }

    .title-box {
        font-size: 16px;
        font-family: Medium;
        color: #203449;
        line-height: 22px;
        display: flex;
        align-items: center;

        .plus-icon {
            border: 1px solid #005DA7;
            border-radius: 2px;
            position: absolute;
            right: 24px;
        }
    }

    .svg-icon {
        width: 14px;
        height: 14px;
    }

    .tree {
        :deep(.el-tree-node__children) {
            .title-box {
                font-size: 14px;
                font-family: Regular;
                color: #203449;
                line-height: 20px;
            }

            .c-tree-is-active {
                color: v-bind(activeColor);
            }

            // .is-current {
            //     .title-box {
            //         color: $acolor !important;
            //     }
            // }
        }
    }

    .c-card {
        background: transparent;
    }

    :deep(.el-tree.tree) {
        background: transparent;
    }

    :deep(.el-tree-node__content .title-box .svg-icon) {
        color: #C3C3C3;
    }

    :deep(.el-tree-node .el-tree-node__content .title-box.c-tree-is-active .svg-icon) {
        color: currentColor;
    }
}</style>