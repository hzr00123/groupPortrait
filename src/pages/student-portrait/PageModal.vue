<template>
  <div>
    <el-dialog v-model="dialogVisible" title="学生名单" :close-on-click-modal="false" :append-to-body="true" width="80%"
      :before-close="handleClose">
      <Search :isExport="true" :rowNum="9" :search-config="searchConfig" :searchForm="searchForm" @queryClick="queryClick"
        @exportClick="exportClick" @resetClick="resetClick" @selectChange="selectChange"/>
      <c-table v-loading="loading" :align="'center'" :columnList="columnList" :data="tableData" :pages="pages"
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
import { selectedStuDetail, exportSelectedStuDetail } from "@/api/modules/studentPortrait"
import { getOrgType } from "@/api/modules/emphasisList"
import { downloadFile } from '@/hooks'

const emits = defineEmits(['closeModal'])
const props = defineProps<{
  param: {},
  schoolYearList:Array<any>,
  enrollTypeList:Array<any>,
  politicsList:Array<any>,
  placeOriginList:Array<any>,
  nationList:Array<any>,
}>()
const dialogVisible = ref(true)
const loading = ref(false)
const searchForm = reactive({
  stuSchoolYear: "",
  stuSemester: "",
  stuCampusId: "",
  stuCollegeId: "",
  stuMajorId: "",
  stuGradeId: "",
  stuClassId: "",
  stuSex: "",
  stuNation: "",
  stuStudentType: "",
  stuPlaceOrigin: "",
  stuPolitics: "",
  stuEnrollType: "",
  keyWord: "",
});
const campusOrgList = ref([])
const collegeOrgList = ref([])
const majorOrgList = ref([])
const gradeOrgList = ref([])
const classOrgList = ref([])
const searchConfig = reactive([
    {
      inputWidth: '150px',
      type: 'select',
      label: '',
      placeholder: '学年',
      key: 'stuSchoolYear',
      opKey: 'value',
      opLabel: 'label',
      options: props.schoolYearList,
    },
    {
      inputWidth: '100px',
      type: 'select',
      label: '',
      placeholder: '学期',
      key: 'stuSemester',
      opKey: 'value',
      opLabel: 'label',
      options: [
        {
          label: '上学期',
          value: '上学期'
        },
        {
          label: '下学期',
          value: '下学期'
        }
      ],
    },
    {
      inputWidth: '110px',
      type: 'select',
      label: '',
      placeholder: '校区',
      key: 'stuCampusId',
      opKey: 'id',
      opLabel: 'orgName',
      options: campusOrgList,
    },
    {
      inputWidth: '110px',
      type: 'select',
      label: '',
      placeholder: '学院',
      key: 'stuCollegeId',
      opKey: 'id',
      opLabel: 'orgName',
      options: collegeOrgList,
    },
    {
      inputWidth: '110px',
      type: 'select',
      label: '',
      placeholder: '专业',
      key: 'stuMajorId',
      opKey: 'id',
      opLabel: 'orgName',
      options: majorOrgList,
    },
    {
      inputWidth: '110px',
      type: 'select',
      label: '',
      placeholder: '年级',
      key: 'stuGradeId',
      opKey: 'id',
      opLabel: 'orgName',
      options: gradeOrgList,
    },
    {
      inputWidth: '110px',
      type: 'select',
      label: '',
      placeholder: '班级',
      key: 'stuClassId',
      opKey: 'id',
      opLabel: 'orgName',
      options: classOrgList,
    },
    {
      inputWidth: '80px',
      type: 'select',
      label: '',
      placeholder: '性别',
      key: 'stuSex',
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
      inputWidth: '100px',
      type: 'select',
      placeholder: '民族',
      key: 'stuNation',
      opKey: 'nation',
      opLabel: 'nationName',
      options: props.nationList,
    },
    {
      inputWidth: '110px',
      type: 'select',
      placeholder: '培养层次',
      key: 'stuStudentType',
      opKey: 'value',
      opLabel: 'label',
      options: [
        {
          label: '本科生',
          value: 1
        },
        {
          label: '研究生',
          value: 2
        },
      ],
    },
    {
      inputWidth: '110px',
      type: 'select',
      placeholder: '生源地',
      key: 'stuPlaceOrigin',
      opKey: 'value',
      opLabel: 'label',
      options: props.placeOriginList,
    },
    {
      inputWidth: '110px',
      type: 'select',
      placeholder: '政治面貌',
      key: 'stuPolitics',
      opKey: 'politics',
      opLabel: 'politicName',
      options: props.politicsList,
    },
    {
      inputWidth: '110px',
      type: 'select',
      placeholder: '录取类型',
      key: 'stuEnrollType',
      opKey: 'value',
      opLabel: 'label',
      options: props.enrollTypeList,
    },
      {
        inputWidth: '150px',
        type: 'input',
        label: '',
        placeholder: '请输入姓名或学号',
        key: 'keyWord',
      },

    ])
const columnList = [
  {
    prop: 'name',
    label: '姓名',
    width: '110'
  },
  {
    prop: 'userName',
    label: '学号',
    width: '150'
  },
  {
    prop: 'sex',
    label: '性别',
    width: '80'
  },
  {
    prop: 'school_year',
    label: '学年',
    width: '150'
  },
  {
    prop: 'semester',
    label: '学期',
    width: '80'
  },
  {
    prop: 'campusName',
    label: '校区',
    width: '100'
  },
  {
    prop: 'collegeName',
    label: '学院',
    width: '100'
  },
  {
    prop: 'majorName',
    label: '专业',
    width: '100'
  },
  {
    prop: 'gradeName',
    label: '年级',
    width: '100'
  },
  {
    prop: 'className',
    label: '班级',
    width: '100'
  },
  {
    prop: 'nation',
    label: '民族',
    width: '60'
  },
  {
    prop: 'student_type',
    label: '培养层次',
    width: '100'
  },
  {
    prop: 'place_origin',
    label: '生源地',
  },
  {
    prop: 'politics',
    label: '政治面貌',
  },
  {
    prop: 'enroll_type',
    label: '录取类型',
  }
]
const pages = reactive({
  current: 1,
  size: 10,
  total: 0,
})
const tableData = ref([])
const getData = async () => {
  loading.value = true
  let params = {
    ...props.param,
    ...searchForm,
    pageNum: pages.current,
    pageSize: pages.size
  }

  let res = await selectedStuDetail(params);
  if (res.code == 1) {
    let { total, list } = res.data;
    pages.total = total;
    tableData.value = list;
  }
  loading.value = false
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
  const res = await exportSelectedStuDetail(params)
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
const selectChange = async (key: string, val: string | number) => {
  const list = ['stuCampusId', 'stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId',]
  if (list.includes(key)) {
    if (key === 'stuCampusId') {
      searchForm.stuCollegeId = '';
      searchForm.stuMajorId = '';
      searchForm.stuGradeId = '';
      searchForm.stuClassId = '';
    }
    if (key === 'stuCollegeId') {
      searchForm.stuMajorId = '';
      searchForm.stuGradeId = '';
      searchForm.stuClassId = '';
    }
    if (key === 'stuMajorId') {
      searchForm.stuGradeId = '';
      searchForm.stuClassId = '';
    }
    if (key === 'stuGradeId') {
      searchForm.stuClassId = '';
    }
    const params = {
      campusId: searchForm.stuCampusId,
      collegeId: searchForm.stuCollegeId,
      majorId: searchForm.stuMajorId,
      gradeId: searchForm.stuGradeId,
      classId: searchForm.stuClassId,
    }
    const res = await getOrgType(params);
    if (res.code == 1) {
      if (key == 'stuCampusId') {
        collegeOrgList.value = res.data.collegeOrgList;
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;

      }
      if (key == 'stuCollegeId') {
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
      }
      if (key == 'stuMajorId') {
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
      }
      if (key == 'stuGradeId') {
        classOrgList.value = res.data.classOrgList;
      }
    }
  }
}
const init = async () => {
  let res = await getOrgType({});
  if (res.code == 1) {
    campusOrgList.value = res.data.campusOrgList;
    collegeOrgList.value = res.data.collegeOrgList;
    majorOrgList.value = res.data.majorOrgList;
    gradeOrgList.value = res.data.gradeOrgList;
    classOrgList.value = res.data.classOrgList;
  }
  getData();
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
