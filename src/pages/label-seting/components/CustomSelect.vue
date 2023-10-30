<template>
    <ElPopover ref="popoverRef" placement="bottom" :width="430" trigger="click" :teleported="false">
        <template #reference>
            <ElInput v-model="selectValue" ref="inputRef" suffix-icon="ArrowDown" placeholder="请选择" readonly />
        </template>
        <div class="custom-select-cm">
            <ElInput placeholder="请输入关键字搜索" clearable @clear="getTreeData" v-model="searchVal" @keydown.enter="getTreeData" prefix-icon="Search" class="mg-b15" />
            <div @click="inputRef?.focus()">
                <div class="flex just-b mg-b15">
                    <ElButton color="#005DA7" :plain="active !== 1" @click="activeEvt(1)">群像数据</ElButton>
                    <ElButton color="#005DA7" :plain="active !== 2" @click="activeEvt(2)">视图</ElButton>
                    <ElButton color="#005DA7" :plain="active !== 3" @click="activeEvt(3)">标签体系</ElButton>
                    <ElButton color="#005DA7" :plain="active !== 4" @click="activeEvt(4)">关注群体</ElButton>
                </div>
                <div class="popover-tree">
                    <c-card-tree activeColor="#005DA7" @handleNodeClick="handleNodeClick" isChildActive :treeList="treeList"
                        showSearch v-loading="loading" :key="active" :fistNode="false">
                        <template #popor="{ data }">
                            <ElPopover trigger="hover" placement="right-start" :offset="40" :width="350"
                                v-if="!data.children || data.children.length == 0">
                                <template #reference>
                                    <div class="pop-tree-node">
                                        <svg-icon style="width: 14px; height: 14px;" v-if="data.icon"
                                            :icon-class="data.icon" />
                                        <span>{{ data.label }}</span>
                                    </div>
                                </template>
                                <div>
                                    <ElDescriptions :column="1">
                                        <template #extra>
                                            <div class="extra-node">
                                                {{ extra }}
                                            </div>
                                        </template>
                                        <ElDescriptionsItem :label="labelText[0]" label-class-name="popor-label">
                                            {{ data.name }}
                                        </ElDescriptionsItem>
                                        <ElDescriptionsItem :label="labelText[1]" label-class-name="popor-label">
                                            {{ descText(data)[0] }}
                                        </ElDescriptionsItem>
                                        <ElDescriptionsItem :label="labelText[2]" label-class-name="popor-label"
                                            class-name="dest-text-item">
                                            <span v-if="active !== 3 && active !== 4">{{ descText(data)[1] }}</span>
                                            <ul v-else>
                                                <li style="margin-bottom: 10px;" v-for="item in descText(data)[1]">
                                                    <ElTag size="small">{{ item }}</ElTag>
                                                </li>
                                            </ul>
                                        </ElDescriptionsItem>
                                    </ElDescriptions>
                                </div>
                            </ElPopover>
                            <div v-else class="pop-tree-node">
                                <svg-icon style="width: 14px; height: 14px;" v-if="data.icon" :icon-class="data.icon" />
                                <span>{{ data.label }}</span>
                            </div>
                        </template>
                    </c-card-tree>
                </div>
            </div>
        </div>
    </ElPopover>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ElInput } from 'element-plus';
import { getTablesViews } from '@/api/modules/labelManagement';
import { deepNormalizeData } from '@/hooks';
import { ListType } from '@/pages/label-management/index';
import { ConditionPart } from '@/api/types/labelManagement';

const props = defineProps<{ value: ConditionPart }>()
const emit = defineEmits<{ (e: 'update:value', val: ConditionPart): void }>()
const active = ref<1 | 2 | 3 | 4>(props.value.type)
const inputRef = ref<typeof ElInput>()
const searchVal = ref('')
const treeList = ref<ListType>([])
const loading = ref(false)
const popoverRef = ref()
const extra = computed(() => {
    if (active.value == 1) return '学生群像数据'
    if (active.value == 2) return '视图'
    if (active.value == 3) return '标签'
    if (active.value == 4) return '关注群体'
})

const labelText = computed(() => {
    if (active.value == 1 || active.value == 2) {
        return ['字段名称:', '字段类型:', '备注说明:']
    }
    if (active.value == 3) {
        return ['标签名称:', '标签说明:', '标签规则:']
    }
    return ['用户群:', '用户群说明:', '建群规则:']
})

const descText = computed(() => {
    return (data: { [x: string]: any; }) => {
        if (active.value == 1 || active.value == 2) {
            return [data.dataType, data.remark]
        }
        if (active.value == 3) {
            return [data.label_explain, data.roles]
        }
        return [data.user_group_description, data.roles]
    }
})

const activeEvt = (type: 1 | 2 | 3 | 4) => {
    active.value = type
}
const handleNodeClick = (item: ConditionPart) => {
    const _item = { ...item }
    delete _item['value']
    delete _item['label']
    delete _item['icon']
    _item['type'] = active.value
    if(active.value === 4){
      _item.group_attention_id = _item.id
      _item.group_attention_name = _item.name
    }
    emit('update:value', Object.assign(props.value, _item))
    popoverRef.value.hide()
}

const selectValue = computed(() => {
    return props.value.name
})

watch(selectValue, ()=>{
    emit('update:value', Object.assign(props.value, {relation: '', value1: '', value2: ''}))
})

const deepLoop = (arr: any[]) => {
    let count = 0
    const icon = ['house', 'biao', 'ji-he', 'field']
    function loop(data: any[], level: number) {
        level++
        return data.map(i => {
            i.icon = icon[level - 1]
            i.label = i.name
            i.value = i.id
            if (i.children && i.children.length > 0) {
                i.children = loop(i.children, level)
            }
            return i
        })
    }
    return loop(arr, count)
}

const getTreeData = async () => {
    loading.value = true
    const res = await getTablesViews(active.value, searchVal.value)
    if (res.code == 1) {
        // console.log(5555555555555, res.data);
        let arr = []
        if (active.value == 1) arr = deepNormalizeData(res.data, ['name', 'id'], ['group-img', 'field'])
        if (active.value == 2) arr = deepLoop(res.data)
        if (active.value == 3) arr = deepNormalizeData(res.data, ['name', 'id'])
        if (active.value == 4) arr = deepNormalizeData(res.data, ['name', 'id'])

        treeList.value = arr
    }

    loading.value = false
}

watch(
    () => active.value,
    () => {
        getTreeData()
    },
    {
        immediate: true
    }
)

</script>

<style lang="scss" scoped>
.extra-node {
    padding: 0 9px;
    height: 30px;
    border: 1px solid #005DA7;
    background-color: #F4F7FF;
    color: #005DA7;
    line-height: 30px;
    border-radius: 4px;
    display: inline-block;
}

.popor-label {
    color: #9A9A9A;
}

:deep(.el-descriptions__content.dest-text-item) {
    display: inline-grid;
}

.custom-select-cm {
    height: 450px;

    .popover-tree {
        height: 340px;
        overflow-y: auto;
        overflow-x: hidden;

        :deep(.title-box) {
            width: 100%;

            .pop-tree-node {
                width: 100%;
            }
        }
    }

    :deep(.c-card-tree .el-scrollbar__wrap.el-scrollbar__wrap--hidden-default) {
        height: 100% !important;
    }
}
</style>