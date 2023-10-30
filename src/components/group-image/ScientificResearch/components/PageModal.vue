<template>
  <div>
    <el-dialog v-model="dialogVisible" title="科研成果情况" :close-on-click-modal="false" :append-to-body="true" width="65%"
      :before-close="handleClose">
      <Search :isExport="true"  :search-config="searchConfig" :searchForm="searchForm" @queryClick="queryClick"
        @exportClick="exportClick" @resetClick="resetClick" />
      <c-table :align="'center'" :columnList="columnList" :data="tableData" :pages="pages"
        @changeCurrent="changeCurrent" @changeSize="changeSize" height="460">
      </c-table>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, watch, toRef } from 'vue'
import { ElMessageBox } from 'element-plus'
import Search from '@/components/common/Search.vue'
import { ElLoading } from 'element-plus'
import { getChartDataDetail, exportGetChartDataDetail } from "@/api/modules/studentPortrait"
import { downloadFile } from '@/hooks'
import { SearchConfig } from '@/components/common/Search'
const emits = defineEmits(['closeModal'])
const props = defineProps<{
  param: {},
}>()
const dialogVisible = ref(true)
const searchForm = reactive({
  category: "",
  typeName: "",
  isAwards: "",
});
const searchConfig = ref< SearchConfig[]>([
    {
      inputWidth: '150px',
      type: 'select',
      label: '类型:',
      placeholder: '类型',
      key: 'category',
      opKey: 'value',
      opLabel: 'label',
      options: [
        {
          label: '学术论文',
          value: 1
        },
        {
          label: '学术著作',
          value: 2
        },
        {
          label: '研究报告',
          value: 3
        },
        {
          label: '艺术作品',
          value: 4
        },
        {
          label: '其他',
          value: 5
        },
      ],
    },
    {
      inputWidth: '150px',
      labelWidth: '80px',
      type: 'select',
      label: '是否获奖:',
      placeholder: '是否获奖',
      key: 'isAwards',
      opKey: 'value',
      opLabel: 'label',
      options: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        },
      ],
    },
    {
        inputWidth: '200px',
        type: 'input',
        label: '名称:',
        placeholder: '请输入名称',
        key: 'typeName',
    },

])
const columnList = [
  {
    prop: 'id',
    label: '序号',
  },
  {
    prop: 'name',
    label: '名称',
  },
  {
    prop: 'type',
    label: '类型',
  },
  {
    prop: 'userName',
    label: '作者/参编人',
  },
  {
    prop: 'isAwards',
    label: '是否获奖',
  },
  {
    prop: 'awardsName',
    label: '获奖',
  },
  {
    prop: 'awardsType',
    label: '获奖级别',
  },
  {
    prop: 'awardsLevel',
    label: '获奖等级',
  },
]
const pages = reactive({
  current: 1,
  size: 10,
  total: 0,
})
const tableData = ref([])
const getData = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let params = {
    ...props.param,
    ...searchForm,
    expExcel:false,
    ident:'Overview',
    pageNum: pages.current,
    pageSize: pages.size
  }

  const res = await getChartDataDetail(params as any);
  if (res.code == 1) {
    const { total, rows } = res.data;
    pages.total = total;
    tableData.value = rows;
  }
  loading.close()
}
const queryClick = () => {
  getData();
}
const resetClick = () =>{
  getData();
}
const exportClick = async () => {
  let params = {
    ...props.param,
    ...searchForm,
    expExcel:true,
    ident:'Overview',
  }
  const res = await exportGetChartDataDetail(params);
  downloadFile(res)
}
const handleClose = (done: () => void) => {
  done()
  emits('closeModal')
}
const changeCurrent = (v: number) =>{
  pages.current = v;
  getData();
}
const changeSize = (v: number) =>{
  pages.size = v;
  getData();
}

onMounted(() => {
  getData();
})
</script>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
