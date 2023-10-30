<template>
  <div style="padding: 0 20px;" :class="['self-study-and-self-study',{
    'scholarship': true,
    'flex': true,
    'horizontal': direction === 'horizontal',
    'vertical': direction === 'vertical'
    }]">
    <div :class="['academic-level-three', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
      <div class="sb">
        <c-title title="基本信息画像" />
        <RedTab :btnList="selfStudy" :isRed="isRed" :isActive="isSelfStudyActive" @redTabChange="clickSelfStudy" />
      </div>
      <div class="c-title mt12">图书借阅变化趋势</div>
      <div class="chart-dom" ref="BookBorrowing"></div>
      <div class="c-title mt12">学习门禁变化趋势</div>
      <div class="chart-dom" ref="LearningAccessControl"></div>
    </div>
    <div v-if="$attrs.view !== 'left'" :class="['content-three', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
      <c-title title="自修自习特征" />
      <div class="content-three-body">
        <div class="c-title">图书借阅</div>
        <div class="card-box sb dialog-table-dir" @click="visibleClick('图书借阅')">
          <CustomCard :cardConfig="threeLeftCard" />
          <CustomCard :cardConfig="threeRightCard" />
        </div>
        <div class="text mg-b20"><span>{{ rightData.top.number }}</span>人 总计借阅<span>{{ rightData.top.time }}</span>次
        </div>
        <div class="c-title">学习门禁</div>
        <div class="card-box sb dialog-table-dir" @click="visibleClick('自修自习')">
          <CustomCard :cardConfig="threeLeftCard2" />
          <CustomCard :cardConfig="threeRightCard2" />
        </div>
        <div class="text mg-b20"><span>{{ rightData.bottom.number }}</span>人 总计进入自习室<span>{{ rightData.bottom.time
        }}</span>次</div>
      </div>
      <c-table-plus :columns="columns" :request="tableRequest" :searchConfig="searchConfig" :visible="visible"
          :title="tableCategory" dialogWidth="1460px" height="350px" :closed="() => visible = false" :exportBtn="exportEvt">
          <template #index="{ data }">
            {{ data.$index + 1 }}
          </template>
          <template #action="{ data }">
            <!-- <ElButton link>学生个像</ElButton> -->
            <ElLink type="primary">学生个像</ElLink>
          </template>
        </c-table-plus>
    </div>

    <WarningSeal name="自修自习" ident="Self_study_and_self-study" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, getCurrentInstance, computed, onMounted, nextTick, toRefs } from 'vue'
import RedTab from '@/components/common/RedTab.vue'
import CustomCard from '@/components/common/CustomCard.vue'
import { downloadFile, usePortraitRequest } from '@/hooks';
import { BaseParams } from '../../types';
import { changeChartData, exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import { getOrgType } from '@/api/modules/emphasisList';
import { searchConfigType, PagesType, requestResType } from '@/components/Table-plus/index.d';
import { Column } from '@/components/Table';
import WarningSeal from '@/components/WarningSeal'
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const isRed = ref(true)
const isSelfStudyActive = ref<string | number>("按月度")
const props = withDefaults(defineProps<{ params: BaseParams, direction: string }>(), {
  params: {} as any,
  direction: 'horizontal'
})
const visible = ref(false)
const selfStudy = ref([
  {
    value: "按月度",
    label: "按月度"
  },
  {
    value: "按季度",
    label: "按季度"
  },

])
const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Self_study_and_self-study' })

const threeLeftCard = ref({
  width: '280px',
  height: '80px',
  color: '#1B528B',
  title: '最大借阅数',
  value: '-',
  isUnit: true,
  unit: '本(册)',
  fontSize: '22px'
})
const threeRightCard = ref({
  width: '280px',
  height: '80px',
  color: '#F39702',
  title: '最小借阅数',
  value: '-',
  isUnit: true,
  unit: '本(册)',
  fontSize: '28px'
})
const threeLeftCard2 = ref({
  width: '280px',
  height: '80px',
  color: '#B22924',
  title: '最大进入次数',
  value: '-',
  isUnit: true,
  unit: '次',
  fontSize: '28px'
})
const threeRightCard2 = ref({
  width: '280px',
  height: '80px',
  color: '#45A0E6',
  title: '最小进入次数',
  value: '-',
  isUnit: true,
  unit: '次',
  fontSize: '28px'
})
const rightData = reactive({
  top: {
    number: 0,
    time: 0
  },
  bottom: {
    number: 0,
    time: 0
  }
})
const clickSelfStudy = (val: number | string) => {
  isSelfStudyActive.value = val;
}

const learningAccessData = reactive({
  series: [],
  xAxis: []
})
const bookData = reactive({
  series: [],
  xAxis: []
})
const initBookBorrowing = () => {
  const el: HTMLElement = instance?.refs.BookBorrowing as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  const data = bookData.series
  const values: Array<number> = []
  data.forEach((i: { data: number[] }) => {
    i.data.forEach((v: number) => {
      values.push(v)
    })
  })
  const max = Math.ceil(Math.max(...values) / 10) * 10;
  const interval = Math.ceil(max / 5);
  let option = {
    color: ['#45A0E6', '#F39D12'],
    title: {
      text: '单位/本(册)',
      top: 0,
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      right: '14%',
      top: '0',
      itemWidth: 10,
      itemHeight: 5,
      icon: 'roundRect',
      data: data.map((i: { name: string }) => i.name)
    },
    grid: {
      top: '20%',
      left: 0,
      right: 10,
      bottom: '4%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: bookData.xAxis,
        axisTick: { //刻度
          alignWithLabel: true,
          show: false,
        },
        triggerEvent: true,
        axisLabel: {
          // rotate: 0, //代表逆时针旋转
          interval: 'auto',
          formatter: function (value: string) {
            if (value.length > 6) {
              return `${value.slice(0, 6)}...`;
            }
            return value
          }
        },
      }
    ],
    yAxis: [
      {
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        },
        min: 0,
        interval: interval,
        max: max,
      },
      {
        name: '单位：人',
        nameLocation: 'end',
        nameTextStyle: {
          color: '#333333',
          fontSize: 14,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        type: 'value',
        splitLine: {
          show: false,
          lineStyle: {
            type: 'dashed'
          }
        },
        min: 0,
        interval: interval,
        max: max,
      },

    ],
    series: data.map((i: { name: string, data: number[] }) => {
      return {
        type: 'line',
        name: i.name,
        smooth: true,
        symbol: 'none',
        data: i.data,
      }
    })
  };
  myChart?.setOption(option);
}
const initLearningAccessControl = () => {
  const el: HTMLElement = instance?.refs.LearningAccessControl as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  const data = learningAccessData.series
  const values: Array<number> = []
  data.forEach((i: { data: number[] }) => {
    i.data.forEach((v: number) => {
      values.push(v)
    })
  })
  const max = Math.ceil(Math.max(...values) / 10) * 10;
  const interval = Math.ceil(max / 5);
  let option = {
    color: ['#005DA7', '#B22924'],
    title: {
      text: '单位/人次',
      top: 0,
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      right: '14%',
      top: '0',
      itemWidth: 10,
      itemHeight: 5,
      icon: 'roundRect',
      data: data.map((i: { name: string }) => i.name)
    },
    grid: {
      top: '20%',
      left: 0,
      right: 10,
      bottom: '4%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: learningAccessData.xAxis,
        axisTick: { //刻度
          alignWithLabel: true,
          show: false,
        },
        triggerEvent: true,
        axisLabel: {
          // rotate: 0, //代表逆时针旋转
          interval: 'auto',
          formatter: function (value: string) {
            if (value.length > 6) {
              return `${value.slice(0, 6)}...`;
            }
            return value
          }
        },
      }
    ],
    yAxis: [
      {
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        },
        min: 0,
        interval: interval || 2,
        max: max || 10,
      },
    ],
    series: data.map((i: { name: string, data: number[] }, index) => {
      return {
        type: 'line',
        name: i.name,
        smooth: true,
        symbol: 'none',
        data: i.data,
      }
    })
  };
  myChart?.setOption(option);
}
const columns: Column = reactive([
  {
    slot: 'index',
    label: '序号',
    width: '60',
    align: 'center'
  },
  {
    prop: 'name',
    label: '姓名',
    width: 100,
    align: 'center'
  },
  {
    prop: 'sex',
    label: '性别',
    width: 80,
    align: 'center'
  },
  {
    prop: 'userName',
    label: '学号',
    align: 'center'
  },
  {
    prop: 'campusName',
    label: '校区',
    align: 'center'
  },
  {
    prop: 'collegeName',
    label: '学院',
    align: 'center'
  },
  {
    prop: 'majorName',
    label: '专业',
    align: 'center'
  },
  {
    prop: 'gradeName',
    label: '年级',
    align: 'center'
  },
  {
    prop: 'className',
    label: '班级',
    align: 'center'
  },
  {
    prop: 'count',
    label: '图书借阅',
    align: 'center'
  },
  {
    slot: 'action',
    label: '操作',
    fixed: 'right',
    align: 'center'
  }
])
const paramsObj = {
  campusId: 'stuCampusId',
  collegeId: 'stuCollegeId',
  majorId: 'stuMajorId',
  gradeId: 'stuGradeId',
  classId: 'stuClassId'
}
const searchConfig: searchConfigType = [
  {
    type: 'select',
    label: '性别',
    inputWidth: '80px',
    labelWidth: '40px',
    key: 'stuSex',
    options: [{ label: '男', value: '男' }, { label: '女', value: '女' }]
  },
  {
    type: 'select',
    label: '校区',
    inputWidth: '120px',
    labelWidth: '40px',
    key: 'stuCampusId',
    request: getOrgType as any,
    reqKey: 'campusOrgList',
    opKey: 'id',
    opLabel: 'orgName',
    params: paramsObj,
    target: ['stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId']
  },
  {
    type: 'select',
    label: '学院',
    inputWidth: '120px',
    labelWidth: '40px',
    key: 'stuCollegeId',
    request: getOrgType as any,
    reqKey: 'collegeOrgList',
    target: ['stuMajorId', 'stuGradeId', 'stuClassId'],
    opKey: 'id',
    opLabel: 'orgName',
    params: paramsObj
  },
  {
    type: 'select',
    label: '专业',
    inputWidth: '120px',
    labelWidth: '40px',
    key: 'stuMajorId',
    request: getOrgType as any,
    reqKey: 'majorOrgList',
    target: ['stuGradeId', 'stuClassId'],
    opKey: 'id',
    opLabel: 'orgName',
    params: paramsObj
  },
  {
    type: 'select',
    label: '年级',
    inputWidth: '120px',
    labelWidth: '40px',
    key: 'stuGradeId',
    request: getOrgType as any,
    reqKey: 'gradeOrgList',
    target: ['stuClassId'],
    opKey: 'id',
    opLabel: 'orgName',
    params: paramsObj
  },
  {
    type: 'select',
    label: '班级',
    inputWidth: '120px',
    labelWidth: '40px',
    key: 'stuClassId',
    request: getOrgType as any,
    reqKey: 'classOrgList',
    opKey: 'id',
    opLabel: 'orgName',
    params: paramsObj
  },
  {
    type: 'input',
    placeholder: '请输入姓名,学号搜索',
    label: '',
    inputWidth: '160px',
    key: 'name'
  }
]
const tableCategory = ref('图书借阅')

const visibleClick = (v: string)=>{
  tableCategory.value = v
  columns.forEach(i => {
    if(i.prop === 'count'){
      i.label = v
    }
  })
  visible.value = true
}

const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
  console.log(4444444444,tableCategory.value);
  
  return getChartDataDetail({
    ...params,
    pageNum: pages.current,
    pageSize: pages.size,
    ident: 'Self_study_and_self-study',
    startTime: props.params.startTime,
    endTime: props.params.endTime,
    category: tableCategory.value
  })
}

const exportEvt = async (form: any, pages: PagesType) => {
  const res = await exportGetChartDataDetail({
    ...form,
    pageNum: pages.current,
    pageSize: pages.size,
    ident: 'Self_study_and_self-study',
    startTime: props.params.startTime,
    endTime: props.params.endTime,
    category: tableCategory.value,
    expExcel: true
  })
  downloadFile(res)
}
watch(() => isSelfStudyActive.value, (val) => {
  changeChartData({ ...props.params, ident: 'Self_study_and_self-study', category: val }).then(res => {
    if (res.code == 1) {
      // console.log(1111111, res);
      const { series = [], xAxis = [] } = res.data?.borrow || {}
      bookData.series = series
      bookData.xAxis = xAxis
      nextTick(() => {
        initBookBorrowing();
      })
    }
  })
})

watch(dataSource, val => {
  if (val.code == 1) {
    // console.log(111111, val);
    if (val.data?.borrow) {
      Object.keys(val.data.borrow).map(i => {
        bookData[i] = val.data.borrow[i]
      })
    }
    if (val.data?.entrance) {
      Object.keys(val.data.entrance).map(i => {
        learningAccessData[i] = val.data.entrance[i]
      })
    }
    nextTick(() => {
      initBookBorrowing();
      initLearningAccessControl();
    })
    if (val.datas2) {
      if (val.datas2.borrow) {
        const { max, min, number, time } = val.datas2.borrow
        threeLeftCard.value.value = max
        threeRightCard.value.value = min
        rightData.top.number = number
        rightData.top.time = time
      }
      if (val.datas2.entrance) {
        const { max, min, number, time } = val.datas2.entrance
        threeLeftCard2.value.value = max
        threeRightCard2.value.value = min
        rightData.bottom.number = number
        rightData.bottom.time = time
      }
    }
  }
}, { immediate: true, deep: true })
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>