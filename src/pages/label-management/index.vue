<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { getLabel, getLabelTree } from '@/api/modules/labelManagement';
import { LabelTreeParams, LabelTreeRes, LabelType, WarningRuleEntity } from '@/api/types/labelManagement';
import TagPreView from './components/TagPreview';
import { Tree } from '@/components/CardTree';
import { ListType } from './index';
import { deepNormalizeData } from '@/hooks';
import { useRouter } from 'vue-router';


// const props = defineProps<{ data: propsType }>()
const treeList = ref<ListType>([])
const config = ref<Omit<LabelType, 'warningInfo'> & {warningInfo: WarningRuleEntity}>()
const loading = ref(false)
const treLoading = ref(false)
const activeNode = ref<number>()
const router = useRouter()
const treeShow = ref(false)

const activeEvt = (step = 1, type: 'edit' | 'add' = 'edit') => {
    if(type === 'add'){
        router.push({
            path: '/label-seting',
            query: { step, id: null }
        })
    } else {
        router.push({
            path: '/label-seting-edit',
            query: { step, id: activeNode.value }
        })
    }
}
const getTreeData = async () => {
    treLoading.value = true
    loading.value = true
    const res = await getLabelTree(searchVal)
    if (res.code == 1) {
        const arr = deepNormalizeData(res.data)
        treeList.value = arr
    }
    treLoading.value = false
    loading.value = false
}

const searchVal = reactive<LabelTreeParams>({
    search: '',
    attribute: ''
})

watch(
    () => searchVal,
    () => getTreeData(),
    {
        deep: true,
        immediate: true
    }
)

const searchEvt = (v: string) => {
    searchVal.search = v
}

/**
 * 树节点点击事件
 * @param item 点击项数据
 */
const handleNodeClick = async (item: Omit<Tree, 'id'> & { id: number }) => {
    loading.value = true
    activeNode.value = item.id
    const res = await getLabel(item.id)
    if(res.data?.warningInfo && res.data.warningInfo.warning_level){
        res.data.warningInfo.warning_level = JSON.parse(res.data.warningInfo.warning_level)
    }
    if (res.code == 1) config.value = res.data as any
    loading.value = false
}
</script>

<template>
    <div class="label-management">
        <!-- <component :is="active === 'Management' ? Management : LabelSeting" @active="activeEvt"
      @back="active = 'Management'" :step="step"/> -->
        <div class="management">
            <header>
                <div class="header-input">
                    <label>行为特征:</label>
                    <el-select class="cm-input" placeholder="请选择" v-model="searchVal.attribute" clearable>
                        <ElOption value="特征">特征</ElOption>
                        <ElOption value="行为">行为</ElOption>
                        <ElOption value="预警">预警</ElOption>
                    </el-select>
                </div>
                <el-button color="#005DA7" dark @click="activeEvt(1, 'add')">新建标签</el-button>
            </header>
            <main>
                <section class="left-section">
                    <c-card-tree :key="treeShow" :treeList="treeList" @handleNodeClick="handleNodeClick"
                        activeColor="#1D538C" isChildActive @search="searchEvt" placeholder="请输入标签名称搜索" fistNode
                        v-loading="treLoading" />
                </section>
                <TagPreView @editClick="activeEvt" :loading="loading" :config="config" :key="activeNode"
                    :tree="() => treeShow = !treeShow" :getTreeData="getTreeData" />
            </main>
        </div>
    </div>
</template>

<style scoped lang="scss">
.label-management {
    width: 100%;
    height: 100%;

    .management {
        width: 100%;
        height: 100%;

        >header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;

            .header-input {
                width: 220px;
                display: flex;
                align-items: center;
                justify-content: space-between;

                >label {
                    width: 80px;
                }

                .cm-input {
                    flex: 1;
                }
            }
        }

        >main {
            display: flex;
            height: calc(100% - 56px);

            .left-section {
                background: linear-gradient(-45deg, transparent 20px, #FFFFFF 0);
                width: 220px;
                height: 100%;
                margin-right: 20px;
                overflow-y: auto;
                overflow-x: hidden;
            }
        }
    }
}</style>