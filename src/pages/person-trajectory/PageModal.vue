<template>
  <div>
    <el-dialog v-model="dialogVisible" title="无行为轨迹人员" :close-on-click-modal="false" :append-to-body="true" width="65%"
      :before-close="handleClose">
      <Search :isExport="true" :rowNum="0" :search-config="searchConfig" :searchForm="searchForm" @queryClick="queryClick"
        @exportClick="exportClick" @resetClick="resetClick" />
      <c-table :align="'center'" :columnList="columnList" :data="tableData" :pages="pages"
        @changeCurrent="changeCurrent" @changeSize="changeSize" height="460">
        <template #operation="{ data }">
          <el-button style="color:#005DA7" link>学生个像</el-button>
        </template>
      </c-table>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, watch, toRef } from 'vue'
import { ElMessageBox } from 'element-plus'
import Search from '@/components/common/Search.vue'
import { ElLoading } from 'element-plus'
import { getNoGroupTraceDatas, exportNoGroupTraceDatas } from "@/api/modules/groupTrajectory"
import { getOrgType } from "@/api/modules/emphasisList"
import { downloadFile } from '@/hooks'
import { SearchConfig } from '@/components/common/Search'
const emits = defineEmits(['closeModal'])
const props = withDefaults(defineProps<{
  param: {},
}>(), {

})
const dialogVisible = ref(true)
const searchForm = reactive({
  noBehaveSex: "",
  noBehaveCampusId: "",
  noBehaveCollegeId: "",
  noBehaveMajorId: "",
  noBehaveGradeId: "",
  noBehaveClassId: "",
  keyWord: "",
});
const searchConfig = ref< SearchConfig[]>([])
const columnList = [
  {
    prop: 'index',
    label: '序号',
    width: '110'
  },
  {
    prop: 'name',
    label: '姓名',
    width: '110'
  },
  {
    prop: 'sex',
    label: '性别',
    width: '80'
  },
  {
    prop: 'userName',
    label: '学号',
    width: '180'
  },
  {
    prop: 'campusName',
    label: '校区',
    width: '150'
  },
  {
    prop: 'collegeName',
    label: '学院',
    width: '150'
  },
  {
    prop: 'majorName',
    label: '专业',
    width: '150'
  },
  {
    prop: 'gradeName',
    label: '年级',
    width: '150'
  },
  {
    prop: 'className',
    label: '班级',
    width: '100'
  },
  {
    prop: 'noBehaveTime',
    label: '无行为轨迹时长',
    width: '100'
  },
  {
    prop: 'lastPosition',
    label: '最后轨迹来源',
    width: '180'
  },
  {
    slot: 'operation',
    label: '操作',
    width: '150',
    fixed: 'right'
  }
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
    pageNum: pages.current,
    pageSize: pages.size
  }

  let res = await getNoGroupTraceDatas(params);
  if (res.code == 1) {
    let { total, list } = res.data;
    pages.total = total;
    tableData.value = list;
    tableData.value.forEach((item:{index:number}, index) => {
      item.index = index + 1
    })
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
    ...searchForm,
    ...props.param,
  }
  const res = await exportNoGroupTraceDatas(params)
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
const init = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let res = await getOrgType({});
  if (res.code == 1) {
    let { campusOrgList,collegeOrgList,majorOrgList,gradeOrgList,classOrgList} = res.data
    searchConfig.value = [
      {
        inputWidth: '80px',
        type: 'select',
        label: '',
        placeholder: '性别',
        key: 'noBehaveSex',
        opKey: 'value',
        opLabel: 'label',
        options: [
          {
            label: '男',
            value: '男'
          },
          {
            label: '女',
            value: '女'
          },
        ],
      },
      {
        inputWidth: '120px',
        type: 'select',
        label: '',
        placeholder: '校区',
        key: 'noBehaveCampusId',
        opKey: 'id',
        opLabel: 'orgName',
        options: campusOrgList,
      },
      {
        inputWidth: '156px',
        type: 'select',
        label: '',
        placeholder: '学院',
        key: 'noBehaveCollegeId',
        opKey: 'id',
        opLabel: 'orgName',
        options: collegeOrgList,
      },
      {
        inputWidth: '130px',
        type: 'select',
        label: '',
        placeholder: '专业',
        key: 'noBehaveMajorId',
        opKey: 'id',
        opLabel: 'orgName',
        options: majorOrgList,
      },
      {
        inputWidth: '100px',
        type: 'select',
        label: '',
        placeholder: '年级',
        key: 'noBehaveGradeId',
        opKey: 'id',
        opLabel: 'orgName',
        options: gradeOrgList,
      },
      {
        inputWidth: '100px',
        type: 'select',
        label: '',
        placeholder: '班级',
        key: 'noBehaveClassId',
        opKey: 'id',
        opLabel: 'orgName',
        options: classOrgList,
      },
      {
        inputWidth: '145px',
        type: 'input',
        label: '',
        placeholder: '请输入姓名或学号',
        key: 'keyWord',
      },

    ]
    loading.close()
    getData();
  }
}
onMounted(() => {
  init();
})
</script>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
