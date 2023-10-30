<template>
  <div class="not-school">
   <Search :rowNum="6" :search-config="searchConfig" :searchForm="searchForm" @queryClick="queryClick"
  @resetClick="resetClick" @selectChange="selectChange"/>
  <div class="cards-box mg-b20">
    <MiniCard v-for="item in cardList"
    :key="item.title"
    :item="item">
    </MiniCard>
  </div>
  <div class="table-box">
    <p>不在校人员名单</p>
    <p class="table-icon"><span></span></p>

    <c-table v-loading="loading" :align="'center'" :columnList="columnList" :data="tableData" :pages="pages"
          @changeCurrent="changeCurrent" @changeSize="changeSize" @changeSort="changeSort" height="460">
    </c-table>
    <!-- <el-table :data="tableData" stripe style="width: 100%" header-cell-class-name="table-title" cell-class-name='table-body' @sort-change="changeSort">
      <el-table-column type="index" label="序号" align="center" width="80" />
      <el-table-column prop="date" label="姓名" align="center"/>
      <el-table-column prop="name" label="性别"  align="center"/>
      <el-table-column prop="name" label="学号"  align="center"/>
      <el-table-column prop="name" label="校区"  align="center"/>
      <el-table-column prop="name" label="学院"  align="center"/>
      <el-table-column prop="name" label="专业"  align="center"/>
      <el-table-column prop="name" label="年级"  align="center"/>
      <el-table-column prop="name" label="班级" align="center" />
      <el-table-column prop="name" label="不在校时长" align="center" sortable/>
      <el-table-column prop="address" label="操作" />
    </el-table>
    <el-pagination
        style="float:'right'"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="400"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      /> -->
  </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import MiniCard from '@/pages/attention-group/components/MiniCard.vue'
import { SearchConfig } from '@/components/common/Search'
import { ElLoading } from 'element-plus'
import { notAtSchoolData } from "@/api/modules/intelligentRecommendation"
import { getOrgType } from "@/api/modules/emphasisList"
import Search from '@/components/common/Search.vue'
const campusOrgList = ref([])
const collegeOrgList = ref([])
const majorOrgList = ref([])
const gradeOrgList = ref([])
const classOrgList = ref([])
const loading = ref(false)
const searchConfig = ref<any[]>([
  {
    labelWidth: '66px',
    inputWidth: '80px',
    type: 'select',
    label: '性别：',
    placeholder: '性别',
    key: 'sex',
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
    labelWidth: '66px',
    inputWidth: '110px',
    type: 'select',
    label: '校区：',
    placeholder: '校区',
    key: 'campusId',
    opKey: 'id',
    opLabel: 'orgName',
    options: campusOrgList,
  },
  {
    labelWidth: '66px',
    inputWidth: '110px',
    type: 'select',
    label: '学院：',
    placeholder: '学院',
    key: 'collegeId',
    opKey: 'id',
    opLabel: 'orgName',
    options: collegeOrgList,
  },
  {
    inputWidth: '110px',
    labelWidth: '66px',
    type: 'select',
    label: '专业：',
    placeholder: '专业',
    key: 'majorId',
    opKey: 'id',
    opLabel: 'orgName',
    options: majorOrgList,
  },
  {
    labelWidth: '66px',
    inputWidth: '110px',
    type: 'select',
    label: '年级：',
    placeholder: '年级',
    key: 'gradeId',
    opKey: 'id',
    opLabel: 'orgName',
    options: gradeOrgList,
  },
  {
    labelWidth: '66px',
    inputWidth: '110px',
    type: 'select',
    label: '班级：',
    placeholder: '班级',
    key: 'classId',
    opKey: 'id',
    opLabel: 'orgName',
    options: classOrgList,
  },
  {
    labelWidth: '100px',
    inputWidth: '100px',
    type: 'input',
    label: '不在校时长：',
    placeholder: '',
    key: 'start',
    inputUnit: '-'
  },
  // {
  //   inputWidth: '0',
  //   type: 'input',
  //   label: '-',
  //   placeholder: '',
  //   key: 'end1',
  // },
  {
    inputWidth: '100px',
    labelWidth: '0',
    type: 'input',
    label: '',
    placeholder: '',
    key: 'end',
    inputUnit:'天'
  },
  {
    inputWidth: '200px',
    type: 'input',
    label: '',
    placeholder: '请输入姓名或学号搜索',
    key: 'user',
  },
])

const columnList = [
  {
    prop: 'name',
    label: '姓名',
  },
  {
    prop: 'sex',
    label: '性别',
  },
  {
    prop: 'userName',
    label: '学号',
  },
  {
    prop: 'campusName',
    label: '校区',
  },
  {
    prop: 'collegeName',
    label: '学院',
  },
  {
    prop: 'majorName',
    label: '专业',
  },
  {
    prop: 'gradeName',
    label: '年级',
  },
  {
    prop: 'className',
    label: '班级',
  },
  {
    prop: 'duration',
    label: '不在校时长',
    sortable:true
  },
]

const pages = reactive({
  current: 1,
  size: 10,
  total: 0,
})
const tableData = ref([])

const searchForm = reactive({
  campusId: "",
  collegeId: "",
  majorId: "",
  gradeId: "",
  classId: "",
  user: "",
  sex:''
});

let orderDuration = ref(0)
const queryClick = () => {
  getData();
}
const resetClick = () => {
  getData();
}

const changeCurrent = (v: number) => {
  pages.current = v;
  getData();
}
const changeSize = (v: number) => {
  pages.size = v;
  getData();
}

const changeSort = (v: any) => {
  orderDuration.value = v.order === "asc" ? 2 : v.order === "des" ? 1 : 0
  getData();
}



const selectChange = async (key: string, val: string | number) => {
  const list = ['campusId', 'collegeId', 'majorId', 'gradeId', 'classId',]
  if (list.includes(key)) {
    if (key === 'campusId') {
      searchForm.collegeId = '';
      searchForm.majorId = '';
      searchForm.gradeId = '';
      searchForm.classId = '';
    }
    if (key === 'collegeId') {
      searchForm.majorId = '';
      searchForm.gradeId = '';
      searchForm.classId = '';
    }
    if (key === 'majorId') {
      searchForm.gradeId = '';
      searchForm.classId = '';
    }
    if (key === 'gradeId') {
      searchForm.classId = '';
    }
    const params = {
      campusId: searchForm.campusId,
      collegeId: searchForm.collegeId,
      majorId: searchForm.majorId,
      gradeId: searchForm.gradeId,
      classId: searchForm.classId,
    }
    const res = await getOrgType(params);
    if (res.code == 1) {
      if (key == 'campusId') {
        collegeOrgList.value = res.data.collegeOrgList;
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;

      }
      if (key == 'collegeId') {
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
      }
      if (key == 'majorId') {
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
      }
      if (key == 'gradeId') {
        classOrgList.value = res.data.classOrgList;
      }
    }
  }
}


const init = async () => {
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: '加载中...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  let res = await getOrgType({});
  if (res.code == 1) {
    campusOrgList.value = res.data.campusOrgList;
    collegeOrgList.value = res.data.collegeOrgList;
    majorOrgList.value = res.data.majorOrgList;
    gradeOrgList.value = res.data.gradeOrgList;
    classOrgList.value = res.data.classOrgList;
  }
  getData();
  // loading.close()
}

const getData = async () => {
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: '加载中...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  loading.value = true
  let params = {
    ...searchForm,
    // campusId: null,
    // collegeId: null,
    // majorId: null,
    // gradeId: null,
    // classId: null,
    // user: null,
    order: orderDuration.value || '',
    pageNum: pages.current,
    pageSize: pages.size,
  }

  let res = await notAtSchoolData(params);
  if (res.code == 1) {
    let { total, rows } = res.data;
    pages.total = total;
    tableData.value = rows;

    cardList[0].num = res.data.amount.userNum
    cardList[1].num = res.data.amount.rate
  }
  loading.value = false
}
// const initType = async () => {
//   let { data } = await wisdomRecommendSelect();
//   if (data) {
//     // console.log('显示', data)
//     optionsTypeActivity.value = data
//   }
// }

// 中间数据项
const cardList = reactive(
  [
    {
      icon: 'off-campus',
      title: '不在校人员',
      titColor: '#630F0C',
      num: 0,
      numColor: '#B22924',
      ratioColor: 'red',
      bg: 'off-campus.png'
    },
    {
      icon: 'off-campus-rate',
      title: '不在校人员占比',
      titColor: '#6376DD',
      num: '0%',
      numColor: '#3848A6',
      ratioColor: '#6477DD',
      bg: 'off-campus-rate.png'
    }
  ]
)

onMounted(() => {
  init()
})

</script>

<style lang="scss" scoped>
@import './index.scss';

 .cards-box {
    display: flex;
    justify-content: center;
    :deep(.mini-card) {
        &:first-child {
            margin-right: 30px;
        }
    }
  }
</style>