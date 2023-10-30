<template>
  <div class="student-portrait">
    <div class="student-portrait-top">
      <div class="text">群体筛选</div>
      <div class="tag"></div>
    </div>
    <Search :search-config="searchConfig" :searchForm="searchForm" :rowNum="rowNum" @queryClick="queryClick"
      @resetClick="resetClick" @selectChange="selectChange" />
    <div class="student-portrait-center">
      <div class="left">
        <div class="title">已选学生群体:</div>
        <div class="query">
          <span>{{ queryText }}</span>
        </div>
        <div class="num">，共<span>{{ groupInfo.total }}</span>人，</div>
        <div class="zb">在全部学生中占<span>{{ groupInfo.rate }}</span></div>
        <el-button type="primary" @click="lookFn">
          查看名单
        </el-button>
      </div>
      <div>
        <el-date-picker v-model="time" value-format="YYYY-MM-DD" type="daterange" unlink-panels
          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :shortcuts="shortcuts" size="large" />
      </div>
    </div>
    <el-tabs v-model="activeName" class="demo-tabs">
      <TabPane :active="activeName" :load="initChartData"/>
    </el-tabs>

    <PageModal v-if="showPages" :param="searchForm" :schoolYearList="schoolYearList" :enrollTypeList="enrollTypeList"
      :politicsList="politicsList" :placeOriginList="placeOriginList" :nationList="nationList" @closeModal="closeModal" />
  </div>
</template>

<script setup lang="ts">
import Search from '@/components/common/Search.vue'
import TabPane from './TabPane.vue';
// import ComprehensiveFace from '@/components/group-image/ComprehensiveFace/index.vue' //综合面貌
// import StudentDistribution from '@/components/group-image/StudentDistribution/index.vue' //学生分布
// import ClassroomBehavior from '@/components/group-image/ClassroomBehavior/index.vue' //上课行为
// import AcademicLevel from '@/components/group-image/AcademicLevel/index.vue' //学业水平
// import ScientificResearch from '@/components/group-image/ScientificResearch/index.vue' //科学研究
// import RewardsPunishmentsHelpLoans from '@/components/group-image/RewardsPunishmentsHelpLoans/index.vue' //奖助贷勤
// import PracticeActivity from '@/components/group-image/PracticeActivity/index.vue' //实践活动
// import BooksBorrow from '@/components/group-image/BooksBorrow/index.vue' //图书借阅
// import OnlineBehavior from '@/components/group-image/OnlineBehavior/index' //上网行为
// import ConsumptionSituation from '@/components/group-image/ConsumptionSituation/index.vue' //消费情况
// import LivingHabit from '@/components/group-image/LivingHabit/index' //生活习惯
// import MentalHealth from '@/components/group-image/MentalHealth/index.vue' //心理健康
// import PhysicalHealth from '@/components/group-image/PhysicalHealth/index' //体质健康
// import SocialRelationship from '@/components/group-image/SocialRelationship/index.vue' //社交关系
// import GraduateEmployment from '@/components/group-image/GraduateEmployment/index' //毕业就业
import { getOrgType } from "@/api/modules/emphasisList"
import { getBaseInfo, getGroupTypeDown, getGroupUserList, selectedStuAndRate, } from "@/api/modules/studentPortrait"
import { reactive, ref, onMounted, provide, toRef, computed, toRaw, Ref } from 'vue'
import { ElLoading } from 'element-plus'
import { BaseParams } from '@/components/group-image/types'
import PageModal from './PageModal.vue'
import { getDay } from '@/utils'
import { userStore } from '@/store/user'

const userInfoStore = userStore();
/**
 * 是否重新加载模块数据标识
 */

const initChartData = ref(false)
const activeName = ref('1');
const queryList = ref([]);
const groupInfo = reactive({
  total: '',
  rate: ''
})
const shortcuts = [
  {
    text: '今日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime())
      return [start, end]
    },
  },
  {
    text: '昨日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
      end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
      return [start, end]
    },
  },
  {
    text: '最近7日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近30日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  // {
  //   text: '上周',
  //   value: () => {
  //     const end = new Date()
  //     const start = new Date()
  //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
  //     return [start, end]
  //   },
  // },
  // {
  //   text: '上个月',1
  //   value: () => {
  //     const end = new Date()
  //     const start = new Date()
  //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
  //     return [start, end]
  //   },
  // },
  // {
  //   text: '最近3个月',
  //   value: () => {
  //     const end = new Date()
  //     const start = new Date()
  //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
  //     return [start, end]
  //   },
  // },
];
const rowNum = 7;
const showPages = ref(false)
const searchForm = reactive<BaseParams>({
  schoolYear: '',
  semester: '',
  campusId: '',
  collegeId: '',
  majorId: '',
  gradeId: '',
  classId: '',
  sex: '',
  nation: '',
  studentType: '',
  placeOrigin: '',
  politics: '',
  enrollType: '',
  userGroupType: '',
  userGroupDescription: '',
  startTime: getDay(-6),
  endTime: getDay(0),
});
provide('dependent', [initChartData, toRef(searchForm, 'startTime'), toRef(searchForm, 'endTime')])
provide('params', searchForm)

const time: Ref<any> = computed({
  get(){
      return [searchForm.startTime, searchForm.endTime]
  },
  set(v){
    if(!v){
      searchForm.startTime = getDay(-6)
      searchForm.endTime = getDay(0)
      return
    }
    searchForm.startTime = v[0]
    searchForm.endTime = v[1]
  }
});

const queryText = ref('全部学生')
const campusOrgList = ref([])
const collegeOrgList = ref([])
const majorOrgList = ref([])
const gradeOrgList = ref([])
const classOrgList = ref([])
const schoolYearList = ref<Array<any>>([])
const enrollTypeList = ref<Array<any>>([])
const politicsList = ref<Array<any>>([])
const placeOriginList = ref<Array<any>>([])
const nationList = ref<Array<any>>([])
const groupTypeList = ref([])
const groupUserList = ref([])
const semesterList = ref([])
const searchConfig = reactive(
  [
    {
      labelWidth: '75px',
      inputWidth: '166px',
      type: 'select',
      label: '基本信息:',
      placeholder: '学年',
      key: 'schoolYear',
      opKey: 'value',
      opLabel: 'label',
      options: schoolYearList,
    },
    {
      inputWidth: '166px',
      type: 'select',
      label: '',
      placeholder: '学期',
      key: 'semester',
      opKey: 'value',
      opLabel: 'label',
      options: semesterList,
    },
    {
      inputWidth: '120px',
      type: 'select',
      label: '',
      placeholder: '校区',
      key: 'campusId',
      opKey: 'id',
      opLabel: 'orgName',
      options: campusOrgList,
    },
    {
      inputWidth: '166px',
      type: 'select',
      label: '',
      placeholder: '学院',
      key: 'collegeId',
      opKey: 'id',
      opLabel: 'orgName',
      options: collegeOrgList,
    },
    {
      inputWidth: '166px',
      type: 'select',
      label: '',
      placeholder: '专业',
      key: 'majorId',
      opKey: 'id',
      opLabel: 'orgName',
      options: majorOrgList,
    },
    {
      inputWidth: '120px',
      type: 'select',
      label: '',
      placeholder: '年级',
      key: 'gradeId',
      opKey: 'id',
      opLabel: 'orgName',
      options: gradeOrgList,
    },
    {
      inputWidth: '120px',
      type: 'select',
      label: '',
      placeholder: '班级',
      key: 'classId',
      opKey: 'id',
      opLabel: 'orgName',
      options: classOrgList,
    },
    {
      labelWidth: '75px',
      inputWidth: '166px',
      type: 'select',
      label: ' ',
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
      inputWidth: '166px',
      type: 'select',
      placeholder: '民族',
      key: 'nation',
      opKey: 'nation',
      opLabel: 'nationName',
      options: nationList,
    },
    {
      inputWidth: '176px',
      type: 'select',
      placeholder: '培养层次',
      key: 'studentType',
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
      inputWidth: '176px',
      type: 'select',
      placeholder: '生源地',
      key: 'placeOrigin',
      opKey: 'value',
      opLabel: 'label',
      options: placeOriginList,
    },
    {
      inputWidth: '176px',
      type: 'select',
      placeholder: '政治面貌',
      key: 'politics',
      opKey: 'politics',
      opLabel: 'politicName',
      options: politicsList,
    },
    {
      inputWidth: '180px',
      type: 'select',
      placeholder: '录取类型',
      key: 'enrollType',
      opKey: 'value',
      opLabel: 'label',
      options: enrollTypeList,
    },
    {
      labelWidth: '75px',
      inputWidth: '330px',
      type: 'select',
      label: '关注人群:',
      placeholder: '请选择用户群类型',
      key: 'userGroupType',
      opKey: 'id',
      opLabel: 'lookup_name',
      options: groupTypeList,
    },
    {
      inputWidth: '330px',
      type: 'select',
      placeholder: '请选择用户群',
      key: 'userGroupDescription',
      opKey: 'user_group_name',
      opLabel: 'user_group_name',
      options: groupUserList,
    },

  ]
)
const selectChange = async (key: string, val: string | number) => {
  const list = ['campusId', 'collegeId', 'majorId', 'gradeId', 'classId', 'schoolYear']
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
    if(key === 'schoolYear'){
      searchForm.semester = ''
      const response = await getBaseInfo({});
      if(response.code == 1){
        semesterList.value = response.data.semester?.map((item: string) => {
          return { label: item, value: item }
        }) || []
      }
      return
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
  if (key == 'userGroupType') {
    searchForm.userGroupDescription = '';
    const re = await getGroupUserList({ user_group_type: searchForm.userGroupType });
    if (re.code == 1) {
      groupUserList.value = re.data
    }
  }
}
const handleClick = (val: string) => {
  console.log("val:", val)
}
const getNonEmptyKeys = (obj: { [x: string]: string }) => {
  return Object.keys(obj).filter(key => obj[key] !== '');
}
const getValueFromList = (key: string, value: string|number, arr: any)=> {
  if (arr[key]!=undefined) {
    if(arr[key].list){
      const list = arr[key].list;
      const val = arr[key].value;
      const back = list.find((item: any ) => item[arr[key].key] === value );
      return back[val] + ' ';
    }else{
      return value + ' ';
    }
  } 
}
const getQueryParams = (obj: { [x: string]: any }) => {
  const nonEmptyKeys = getNonEmptyKeys(obj);
  let str = '';
  const lists = {
    schoolYear: {
      list: schoolYearList.value,
      key: 'value',
      value: 'label'
    },
    campusId: {
      list: campusOrgList.value,
      key: 'id',
      value: 'orgName'
    },
    collegeId: {
      list: collegeOrgList.value,
      key: 'id',
      value: 'orgName'
    },
    majorId: {
      list: majorOrgList.value,
      key: 'id',
      value: 'orgName'
    },
    gradeId: {
      list: gradeOrgList.value,
      key: 'id',
      value: 'orgName'
    },
    classId: {
      list: classOrgList.value,
      key: 'id',
      value: 'orgName'
    },
    nation: {
      list: nationList.value,
      key: 'nation',
      value: 'nationName'
    },
    placeOrigin: {
      list: placeOriginList.value,
      key: 'value',
      value: 'label'
    },
    politics: {
      list: politicsList.value,
      key: 'politics',
      value: 'politicName'
    },
    userGroupType: {
      list: groupTypeList.value,
      key: 'id',
      value: 'lookup_name'
    },
    userGroupDescription: {
      list: groupUserList.value,
      key: 'user_group_name',
      value: 'user_group_name'
    },
    enrollType:{
      list: enrollTypeList.value,
      key: 'value',
      value: 'label',
    },
    studentType: {
      list: [{ label: '本科生', value: 1 }, { label: '研究生', value: 2 },],
      key: 'value',
      value: 'label'
    },
    semester: {},
    sex: {},
  };
  for (let i=0;i<nonEmptyKeys.length;i++) {
    const value = obj[nonEmptyKeys[i]]
    let val =  getValueFromList(nonEmptyKeys[i],value,lists);
    str += val ? val : ''
  }
  queryText.value = str !='' ? str:'全部学生';

}
const queryClick = () => {
  getData()
  getQueryParams(searchForm);
  initChartData.value = !initChartData.value;
}
const resetClick = () => {
  init();
  getQueryParams(searchForm);
  initChartData.value = !initChartData.value
}
const init = async () => {
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: '加载中...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  const res = await getOrgType({});
  if (res.code == 1) {
    campusOrgList.value = res.data.campusOrgList;
    collegeOrgList.value = res.data.collegeOrgList;
    majorOrgList.value = res.data.majorOrgList;
    gradeOrgList.value = res.data.gradeOrgList;
    classOrgList.value = res.data.classOrgList;
    userInfoStore.updateOrgType({
      campusOrgList: campusOrgList.value,
      collegeOrgList: collegeOrgList.value,
      majorOrgList: majorOrgList.value,
      gradeOrgList: gradeOrgList.value,
      classOrgList: classOrgList.value
    })
  }
  const response = await getBaseInfo({});
  if (response.code == 1) {
    let { schoolYear, enrollType, politics, placeOrigin, nation, semester } = response.data;
    politicsList.value = politics;
    nationList.value = nation;
    schoolYearList.value = schoolYear.map((item: string) => {
      return { label: item, value: item }
    });
    enrollTypeList.value = enrollType.map((item: string) => {
      return { label: item, value: item }
    });
    placeOriginList.value = placeOrigin.map((item: string) => {
      return { label: item, value: item }
    });
    semesterList.value = semester?.map((item: string) => {
      return { label: item, value: item }
    });
  }
  const resMsg = await getGroupTypeDown({});
  if (resMsg.code == 1) {
    groupTypeList.value = resMsg.data.groupTypeList;
  }
  const re = await getGroupUserList({});
  if (re.code == 1) {
    groupUserList.value = re.data
  }
  getData()
  // loading.close()
}
const getData = async () => {
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: '加载中...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  const res = await selectedStuAndRate(searchForm);
  if (res.code == 1) {
    groupInfo.rate = res.data.rate;
    groupInfo.total = res.data.total;
  }
  // loading.close()
}
const lookFn = () => {
  showPages.value = true;
}
const closeModal = () => {
  showPages.value = false;
}
onMounted(() => {
  init();
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>