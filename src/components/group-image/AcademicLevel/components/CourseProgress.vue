<template>
  <div style="padding-left: 20px;" :class="['course-progress',{
    'scholarship': true,
    'flex': true,
    'horizontal': direction === 'horizontal',
    'vertical': direction === 'vertical'
    }]">
    <div :class="['academic-level-two', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
        <c-title title="基本信息画像" />
        <div class="academic-level-two-top">
          <ColorCard :cardConfig="colorConfig" style="cursor: pointer;" @click="visible = true"/>
          <!-- <div class="icon" v-for="(item, index) in 2" :key="index">
            <img class="tag" src="@/assets/imgs/warn-tag.png" alt="">
            <div class="txt">绩点低于3.0 52人</div>
          </div> -->
        </div>
        <div class="academic-level-two-center sb">
          <div class="c-title">各专业学分修学进度</div>
          <RedTab :btnList="courseList" :isRed="isRed" :isActive="isCourseActive" @redTabChange="clickCourse" />
        </div>
        <ProgressBar :option="progressBarOpt" style="max-height: 250px;overflow: auto;"/>
        <div class="list-bottom">
          学校平均 <span>{{ schoolAverage + '%' }}</span>
        </div>
        <c-table-plus :row="6" :columns="columns" :request="tableRequest" :searchConfig="searchConfig" :visible="visible"
            title="个人学分" dialogWidth="1460px" height="350px" :closed="() => visible = false" :exportBtn="exportEvt">
            <template #index="{ data }">
              {{ data.$index + 1 }}
            </template>
            <template #action="{ data }">
              <!-- <ElButton link>学生个像</ElButton> -->
              <ElLink type="primary">学生个像</ElLink>
            </template>
        </c-table-plus>
    </div>

    <div v-if="$attrs.view !== 'left'" :class="['content-two', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
        <c-title title="修课进度特征"></c-title>
        <div class="content-two-body">
          <div class="c-title">男女学分进度差异</div>
          <div class="card-box sb">
            <CustomCard :cardConfig="twoLeftCard" />
            <CustomCard :cardConfig="twoRightCard" />
          </div>
          <div class="text">
            男生平均学分 <span>{{ average.manAvg }}</span> 女生平均学分 <span>{{ average.womanAvg }}</span>
          </div>
          <div class="c-title">学分进度待提高人群</div>
          <div class="body-bottom sb">
            <div class="body-bottom-left column">
              <ElProgress class="two" type="circle" :width="140" :stroke-width="10" color="#B22924"
                :percentage="TwoCyChartData.rate">
                <template #default="{ percentage }">
                  <div class="percentage-value" style="color:#B22924;">{{ percentage }}<span>%</span></div>
                  <div class="percentage-total">落后学生占比</div>
                </template>
              </ElProgress>
            </div>
            <div class="body-bottom-right column">
              <div class="body-bottom-right-chart" ref="twoCyChart"></div>
            </div>
          </div>
          <div class="text">
            学分进度待提高学生 <span>{{ TwoCyChartData.number }}</span>人，主要待提高 <span>{{ TwoCyChartData.courseName }}</span>
          </div>
        </div>
    </div>

    <WarningSeal name="修课进度" ident="Course_progress" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, getCurrentInstance, computed, onMounted, nextTick, PropType, toRefs } from 'vue'
import RedTab from '@/components/common/RedTab.vue'
import CustomCard from '@/components/common/CustomCard.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import ColorCard from '@/components/common/ColorCard.vue'
import { downloadFile, usePortraitRequest } from '@/hooks'
import { BaseParams } from '../../types'
import { ProgressConf } from '@/components/common/Search'
import { changeChartData, exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import { getOrgType } from '@/api/modules/emphasisList'
import { searchConfigType, PagesType, requestResType } from '@/components/Table-plus/index.d'
import { Column } from '@/components/Table'
import WarningSeal from '@/components/WarningSeal'
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const isRed = ref(true)
const isCourseActive = ref<string | number>("全部")
const props = withDefaults(defineProps<{ params: BaseParams, direction: string }>(), {
  params: {} as any,
  direction: 'horizontal'
})
const visible = ref(false)

const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Course_progress' })
/**
 * 男生平均学分/女生平均绩点
 */
const average = reactive({
  manAvg: "-",
  womanAvg: "-"
})
const TwoCyChartData = reactive({
  courseName: '',
  highFrequency: [],
  number: '-',
  rate: 0
})
const courseList = ref([
  {
    value: "全部",
    label: "全部"
  },
  {
    value: "必修课",
    label: "必修课"
  },
  {
    value: "选修课",
    label: "选修课"
  },
])
const twoLeftCard = reactive({
  width: '280px',
  height: '80px',
  color: '#1B528B',
  title: '最大学分差专业',
  value: '-',
  isUnit: false,
  describe: '差值: -',
  fontSize: '20px'
})
const twoRightCard = reactive({
  width: '280px',
  height: '80px',
  color: '#F39702',
  title: '最小学分差专业',
  value: '-',
  isUnit: false,
  describe: '差值: -',
  fontSize: '20px'
})
const colorConfig = reactive({
  color: '#45A0E6',
  title: '平均学分',
  value: '-',
  isUnit: true,
  icon: getImageUrl('A'),
  unit: '分',
})
const progressBarOpt = reactive<ProgressConf>({
  list: [],
  color: '#005DA7',
  lableWidth: 148,
  lableAlign: 'right',
  unit: '%'
})
const schoolAverage = computed(()=>{
  const num = (progressBarOpt.list.reduce((pre, cur) => pre += Number(cur.value), 0) / progressBarOpt.list.length).toFixed(2)
  if(num === 'NaN') return 0
  return num
})
const clickCourse = (val: number | string) => {
  isCourseActive.value = val;
}
const initTwoCyChart = () => {
  const el: HTMLElement = instance?.refs.twoCyChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  const datas = TwoCyChartData.highFrequency.map((i: any) => ({ ...i, value: i.frequency }))
  let option = {
    series: [{
      type: 'wordCloud',
      sizeRange: [14, 30],
      rotationRange: [0, 0],
      rotationStep: 45,
      gridSize: 20,
      shape: 'diamond',
      width: '100%',
      height: '100%',
      textStyle: {
        color: '#000000',
      },
      data: datas
    }]
  };
  myChart?.setOption(option)
}

const columns: Column = [
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
    prop: 'credit',
    label: '学分',
    align: 'center'
  },
  {
    prop: 'behindCredit',
    label: '落后学分',
    align: 'center'
  },
  {
    slot: 'action',
    label: '操作',
    fixed: 'right',
    align: 'center'
  }
]
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
    type: 'select',
    label: '类型',
    inputWidth: '120px',
    labelWidth: '40px',
    key: 'category',
    default: '全部',
    options: [
      {name: '全部', value: '全部'},
      {name: '必修课', value: '必修课'},
      {name: '选修课', value: '选修课'},
    ]
  },
  {
    type: 'input',
    placeholder: '请输入姓名,学号搜索',
    label: '',
    inputWidth: '160px',
    key: 'name'
  }
]
const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
  return getChartDataDetail({
    ...params,
    pageNum: pages.current,
    pageSize: pages.size,
    ident: 'Course_progress',
    startTime: props.params.startTime,
    endTime: props.params.endTime
  })
}

const exportEvt = async(form: any, pages: PagesType)=>{
  const res = await exportGetChartDataDetail({
    ...form,
    pageNum: pages.current,
    pageSize: pages.size,
    ident: 'Course_progress',
    startTime: props.params.startTime,
    endTime: props.params.endTime,
    expExcel: true
  })
  downloadFile(res)
}
watch(() => isCourseActive.value, (val) => {
  changeChartData({ ...props.params, ident: 'Course_progress', category: val }).then(res => {
    if (res.code == 1) {
      // console.log(1111111, res);
      const { series = [], yAxis = [] } = res.data?.chartData || {}
      progressBarOpt.list = series.map((i: string, index: number) => {
        return {
          name: yAxis[index],
          value: i,
          rate: i
        }
      })
    }
  })
})

watch(dataSource, () => {
  // console.log(333333333333, toRaw(dataSource.value));
  if (dataSource.value.code == 1) {
    colorConfig.value = dataSource.value.data?.avg || '-'
    const { series = [], yAxis = [] } = dataSource.value.data?.chartData || {}
    progressBarOpt.list = series.map((i: string, index: number) => {
      return {
        name: yAxis[index],
        value: i,
        rate: i
      }
    })
    const diff = dataSource.value.datas2?.sexDifference?.difference
    if (diff) {
      twoLeftCard.value = diff?.maxDiffMajor || '-'
      twoLeftCard.describe = `差值：${diff?.maxDiff}`
      twoRightCard.value = diff?.minDiffMajor || '-'
      twoRightCard.describe = `差值：${diff?.minDiff}`
    }
    average.manAvg = dataSource.value.datas2?.sexDifference?.manAvg || ''
    average.womanAvg = dataSource.value.datas2?.sexDifference?.womanAvg || ''
    Object.keys(TwoCyChartData).forEach(i => {
      if (dataSource.value.datas2.notStandard) {
        TwoCyChartData[i] = dataSource.value.datas2.notStandard[i]
        nextTick(() => {
          initTwoCyChart();
        })
      }
    })
  }
}, { immediate: true, deep: true })
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>