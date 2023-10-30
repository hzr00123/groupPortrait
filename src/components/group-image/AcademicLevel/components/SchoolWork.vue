<template>
  <div style="padding: 0 20px;" :class="['school-Work', {
    'scholarship': true,
    'flex': true,
    'horizontal': direction === 'horizontal',
    'vertical': direction === 'vertical'
  }]" v-loading="loading">
    <div :class="['academic-level-one', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
      <div class="academic-level-left">
        <div class="academic-level-left-top sb">
          <c-title title="基本信息画像" />
          <RedTab :btnList="selectList" :isActive="isClsActive" @redTabChange="clickCls" />
        </div>
      </div>
      <div class="gpa-content sb" v-if="isClsActive == '绩点'">
        <div class="left-box">
          <div class="left-box-top">
            <div class="top" ref="topGauge"></div>
            <div class="gauge-box">
              <div class="legend" v-for="it in gaugeData.legend">
                <div class="tag" :style="{ backgroundColor: it.color }"></div>
                <div class="txt">{{ it.name }}</div>
                <div class="num">{{ it.value }}</div>
              </div>
            </div>
          </div>
          <div class="left-box-bottom">
            <div class="c-title">绩点差异对比</div>
            <div class="gpa-contrast" ref="gpaContrast"></div>
          </div>
        </div>
        <div class="right-box">
          <div class="right-box-top">
            <!-- <div class="icon" v-for="(item, index) in 3" :key="index">
                <img class="tag" src="@/assets/imgs/warn-tag.png" alt="">
                <div class="txt">绩点低于3.0 52人</div>
              </div> -->
          </div>
          <div class="right-box-bottom">
            <div class="c-title">绩点成绩离群</div>
            <div class="gpa-score-outlier" ref="gpaScoreOutlier"></div>
          </div>
        </div>
      </div>
      <div class="hangingUp-content" v-if="isClsActive == '挂科'">
        <div class="hangingUp-content-top">
          <!-- <div class="icon" v-for="(item, index) in 1" :key="index">
              <img class="tag" src="@/assets/imgs/warn-tag.png" alt="">
              <div class="txt">绩点低于3.0 52人</div>
            </div> -->
        </div>
        <div class="hangingUp-chart" ref="hangingUpPie"></div>
        <c-table-plus :columns="columns" :request="tableRequest" :searchConfig="searchConfig" :visible="visible" title="个人挂科" dialogWidth="1460px" height="350px" :closed="() => visible = false" :exportBtn="exportEvt">
          <template #index="{ data }">
            {{ data.$index + 1 }}
          </template>
          <template #action="{ data }">
            <!-- <ElButton link>学生个像</ElButton> -->
            <ElLink type="primary">学生个像</ElLink>
          </template>
        </c-table-plus>
      </div>
    </div>

    <div v-if="$attrs.view !== 'left'" :class="['content-one', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
      <c-title title="学业成绩分析"></c-title>
      <div class="content-one-gpa sb" v-if="isClsActive == '绩点'">
        <div class="left">
          <div class="c-title">男女绩点差异</div>
          <div class="card-box">
            <CustomCard :cardConfig="topCard" />
            <CustomCard :cardConfig="bottomCard" />
          </div>
          <div class="text">
            男生平均绩点 <span>{{ workRight.difference.manAvg }}</span> 女生平均绩点 <span>{{ workRight.difference.womanAvg
            }}</span>
          </div>
        </div>
        <div class="right">
          <div class="c-title">绩点成绩离群</div>
          <div class="content-box">
            <ElProgress class="two" type="circle" :width="140" :stroke-width="10" color="#317DB8" :percentage="workRight.stray.discreteIntervalRate">
              <template #default="{ percentage }">
                <div class="percentage-value" style="color:#317DB8;">{{ percentage }}<span>%</span></div>
                <div class="percentage-total">{{ workRight.stray.discreteIntervalTotal }}人</div>
              </template>
            </ElProgress>
            <div class="msg">离群学生占比</div>
          </div>
          <div class="text">
            离群学生生绩点区间 <span>{{ workRight.stray.discreteInterval }}</span>
          </div>
        </div>
      </div>
      <div class="content-one-hangingUp sb" v-if="isClsActive == '挂科'">
        <div class="left">
          <div class="c-title">挂科情况</div>
          <div class="cy-box">
            <div class="cy-chart" ref="hangingUpCy"></div>
          </div>
          <div class="text">
            挂科最多为 <span>{{ lowScoreRight.failure.failurName }}</span>
          </div>
        </div>
        <div class="right">
          <div class="righ-top flex-start">
            <div class="c-title">低分人群</div>
            <div class="tag flex-start">
              <img src="@/assets/imgs/warn-tag.png" alt="">
              低分人群:得分后27%人群
            </div>
          </div>
          <div class="cy-box">
            <WordCloud :wordCloudObj="wordCloudObj" />
          </div>
          <div class="text">
            低分学生 <span>{{ lowScoreRight.lowScore.total }}</span> 人,主要低分课程 <span>{{ lowScoreRight.lowScore.majorName
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <WarningSeal :name="isClsActive" :ident="isClsActive == '绩点' ? 'GPA' : 'Hanging_up'" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, getCurrentInstance, nextTick, toRefs } from 'vue'
import RedTab from '@/components/common/RedTab.vue'
import CustomCard from '@/components/common/CustomCard.vue'
import WordCloud from '@/components/common/WordCloud.vue'
import { WordCloudConfig } from '@/components/common/Search'
import { downloadFile, usePortraitRequest } from '@/hooks'
import { BaseParams } from '../../types'
import { changeChartData, exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import { Column } from '@/components/Table'
import { requestResType, PagesType, searchConfigType } from '@/components/Table-plus/index.d'
import { getOrgType } from '@/api/modules/emphasisList'
import WarningSeal from '@/components/WarningSeal'
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
/**
 * 表格弹窗
 */
const visible = ref(false)
const props = withDefaults(defineProps<{ params: BaseParams, selectList: any[], direction: string }>(), {
  params: {} as any,
  selectList: [
    {
      value: "绩点",
      label: "绩点"
    },
    {
      value: "挂科",
      label: "挂科"
    },
  ] as any,
  direction: 'horizontal'
})

const loading = ref(false)

const selectList = ref(props.selectList.map(i => ({ ...i, value: i.label })))
const isClsActive = ref<string>(props.selectList[0].label as string)
/**
 * 平均要求、平均绩点
 */
const gaugeData = reactive<{
  chart: Array<{ name: string, value: number }>,
  legend: Array<{ name: string, value: number, color: string }>
}>({
  chart: [],
  legend: []
})
/**
 * 绩点差异对比
 */
const gpaContrastData = reactive({
  series: [],
  xAxis: []
})
/**
 * 绩点成绩离群
 */
const gpaScoreOutlierData = reactive<{ series: Array<number>, xAxis: Array<string> }>({
  series: [],
  xAxis: []
})
/**
 * 学业成绩right数据
 */
const workRight = reactive({
  stray: {
    discreteInterval: '-',
    discreteIntervalTotal: 0,
    discreteIntervalRate: 0
  },
  difference: {
    maxDiff: "-",
    manAvg: "-",
    minDiff: "-",
    maxDiffMajor: "-",
    womanAvg: "-",
    minDiffMajor: "-"
  }
})
const topCard = ref({
  width: '280px',
  height: '80px',
  color: '#1B528B',
  title: '最大绩点差专业',
  value: '-',
  isUnit: false,
  describe: '差值: -',
  fontSize: '22px'
})
const bottomCard = ref({
  width: '280px',
  height: '80px',
  color: '#F39702',
  title: '最小绩点差专业',
  value: '-',
  isUnit: false,
  describe: '差值: -',
  fontSize: '22px'
})
/**
 * 挂科饼图数据
 */
const HangingUpPieData = ref<Array<{ name: string, value: number }>>([])
/**
 * 挂科right数据
 */
const lowScoreRight = reactive({
  failure: {
    failurName: "-",
    highFrequency: [],
  },
  lowScore: {
    majorName: "-",
    total: 0
  }
})
const wordCloudObj = ref<WordCloudConfig>({
  data1: [],
  data2: [],
  data3: [],
  position: 'bottom',
})
const initHangingUpPieChart = () => {
  const el: HTMLElement = instance?.refs.hangingUpPie as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  const datas = HangingUpPieData.value
  datas.forEach((i: any) => {
    if (i.value === 0) {
      i.labelLine = { show: false }
      i.label = { show: false }
    }
  })
  let option = {
    color: ['#00C9F2', '#F39702', '#E3493E', '#005DA7'],
    legend: {
      // type: "scroll",
      // icon: "circle",
      orient: 'vertical',
      top: 'center',
      right: '12%',
      textStyle: {
        color: "#3E5463",
        fontSize: 14,
        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
      },
      itemWidth: 10,
      itemHeight: 6,
      itemGap: 10,
      icon: "rect",
      pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
      pageIconSize: 12,  //当然就是按钮的大小
      pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
      tooltip: {
        show: true
      },
      data: datas.map((item) => item.name),
    },
    tooltip: {
      formatter: '{b} : {c} 人 ({d}%)'
    },
    series: [
      {
        // name: "",
        z: 1,
        type: "pie",
        radius: ["60%", "80%"],
        center: ['42%', '50%'],
        labelLine: {
          length: 20,//第一段线长
          length2: 80, //第二段线长
          lineStyle: {
            width: 1,
            type: 'solid',
            color: '#005DA7'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 4,
        },
        label: {
          formatter: '{name|{b}: }{num|{c}人}\n\n{zb|{d}%}',
          padding: [0, -80, -5, -80],
          rich: {
            name: {
              fontSize: 14,
              color: '#203449'
            },
            num: {
              fontSize: 14,
              color: '#203449'
            },
            zb: {
              fontSize: 16,
              color: '#203449'
            }

          },
        },

        data: datas,
      },
      {
        // name: "",
        z: 0,
        type: "pie",
        radius: ["60%", "80%"],
        center: ['42%', '50%'],
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 4,
        },
        label: {
          show: true,
          position: 'center',
          color: '#4c4a4a',
          formatter(item: { value: number }) {
            return `{total|${item.value}人}`
          },
          rich: {
            total: {
              fontSize: 22,
              color: '#203449',
            }
          },
          padding: [5, 0, 0, 0],
        },
        labelLine: {
          show: false
        },
        tooltip: {
          show: false
        },
        silent: true,
        data: datas,
      },
    ],

  }
  myChart?.setOption(option)
  myChart?.on('click', () => visible.value = true)
}
const clickCls = (_index: string, label: string) => {
  isClsActive.value = label;
}

const initTopGaugeChart = () => {
  const el: HTMLElement = instance?.refs.topGauge as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let option = {
    color: ['#005DA7', '#F39702',],
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 5,
        radius: "80%",
        center: ["40%", "55%"],
        progress: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0, '#45A0E6'],
              [1, '#45A0E6']
            ]
          }
        },
        axisTick: {
          show: false // 不显示坐标轴刻度线
        },
        splitLine: {            // 分隔线样式。
          show: false
        },
        axisLabel: {
          show: true,             // 是否显示标签,默认 true。
          distance: -7,
          color: '#203449',
          fontSize: 13,
          formatter: function (value: number) {
            if (value === 0) {
              return 0;
            } else if (value === 2.5) {
              return 2.5;
            } else if (value === 5) {
              return 5;
            }
          }
        },
        pointer: {              // 仪表盘指针。
          show: true,             // 是否显示指针,默认 true。
          length: "75%",          // 指针长度，可以是绝对数值，也可以是相对于半径的百分比,默认 80%。
          width: 3,               // 指针宽度,默认 8。
        },

        itemStyle: {
          borderCap: 'round',
          borderMiterLimit: 5,
          opacity: 1,             // 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
        },
        detail: {
          show: false,
        },
        title: {
          show: false,
        },
        data: gaugeData.chart
      }
    ]
  };
  myChart?.setOption(option)
}
const initGpaContrastChart = () => {
  const el: HTMLElement = instance?.refs.gpaContrast as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let option = {
    title: {
      text: '单位: 人',
      top: '5%',
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
      }
    },
    legend: {
      right: '3%',
      top: '5%',
      itemWidth: 10,
      itemHeight: 5,
      data: gpaContrastData.series.map((i: { name: string }) => i.name)
    },
    // tooltip: {
    //   trigger: 'axis',
    //   axisPointer: {
    //     type: 'shadow'
    //   },
    //   formatter: '{b}: {c}人次',
    // },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: '20%',
      left: 0,
      right: '3%',
      bottom: '4%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: gpaContrastData.xAxis,
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
        type: 'value',
        axisLine: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        }
      },
    ],
    series: gpaContrastData.series.map((i: { name: string, data: Array<number> }, index) => {
      return {
        type: 'bar',
        name: i.name,
        barWidth: '20%',
        data: i.data.map(i => ({ value: i })),
        itemStyle: {
          color: index == 0 ? '#E3493E' : '#1B528B',
          borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
        },
      }
    })
  };
  myChart?.setOption(option);
}
const initGpaScoreOutlierChart = () => {
  const el: HTMLElement = instance?.refs.gpaScoreOutlier as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }

  let option = {
    title: {
      text: '单位: 人',
      top: '5%',
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: '20%',
      left: 0,
      right: '3%',
      bottom: '4%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: gpaScoreOutlierData.xAxis,
        axisTick: { //刻度
          alignWithLabel: true,
          show: false,
        },
        triggerEvent: true,
        // axisLabel: {
        //   // rotate: 0, //代表逆时针旋转
        //   interval: 'auto',
        //   formatter: function (value: string) {
        //     if (value.length > 6) {
        //       return `${value.slice(0, 6)}...`;
        //     }
        //     return value
        //   }
        // },
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        }
      },
    ],
    series: [
      // ..._servs,
      {
        type: 'bar',
        barWidth: '20%',
        data: gpaScoreOutlierData.series,
        itemStyle: {
          color: '#45A0E6',
          borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
        },
        markLine: {
          symbol: 'none',
          lineStyle: {
            color: 'blue',
            type: 'solid',
            width: 4,
          }
        }
      },
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#E3493E',
        },
        data: gpaScoreOutlierData.series,
      },
    ]
  };
  myChart?.setOption(option);
}
const initHangingUpChart = () => {
  const el: HTMLElement = instance?.refs.hangingUpCy as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  const datas = lowScoreRight.failure.highFrequency

  let option = {
    series: [{
      type: 'wordCloud',
      sizeRange: [14, 30],
      rotationRange: [0, 0],
      rotationStep: 45,
      gridSize: 30,
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
    prop: 'count',
    label: '挂科',
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
    ident: 'GPA',
    startTime: props.params.startTime,
    endTime: props.params.endTime,
    category: isClsActive.value
  })
}

const exportEvt = async (form: any, pages: PagesType) => {
  const res = await exportGetChartDataDetail({
    ...form,
    pageNum: pages.current,
    pageSize: pages.size,
    ident: 'GPA',
    startTime: props.params.startTime,
    endTime: props.params.endTime,
    category: isClsActive.value,
    expExcel: true
  })
  downloadFile(res)
}

watch(() => isClsActive.value, (val) => {
  loading.value = true
  changeChartData({ ...props.params, ident: 'GPA', category: isClsActive.value }).then(res => {
    if (res.code == 1) {
      if (res.data.left) {
        HangingUpPieData.value = res.data?.left?.series
        lowScoreRight.lowScore = res.data?.right?.lowScore?.lowScore
        lowScoreRight.failure.failurName = res.data?.right?.failure?.failurName
        lowScoreRight.failure.highFrequency = res.data?.right?.failure?.highFrequency?.map((i: { name: string; frequency: number }) => ({ name: i.name, value: i.frequency })) || []
      }
      wordCloudObj.value.data1 = res.data?.right?.lowScore?.highFrequency?.manHighFrequencyList?.map((i: { name: string; frequency: number }) => ({ name: i.name, value: i.frequency })) || []
      wordCloudObj.value.data2 = res.data?.right?.lowScore?.highFrequency?.commonHighFrequencyList?.map((i: { name: string; frequency: number }) => ({ name: i.name, value: i.frequency })) || []
      wordCloudObj.value.data3 = res.data?.right?.lowScore?.highFrequency?.womanHighFrequencyList?.map((i: { name: string; frequency: number }) => ({ name: i.name, value: i.frequency })) || []
      if (val == '绩点') {
        nextTick(() => {
          initTopGaugeChart();
          initGpaContrastChart();
          initGpaScoreOutlierChart();
        })
      } else {
        nextTick(() => {
          initHangingUpPieChart();
          initHangingUpChart();
        })
      }
    }
    loading.value = false
  }).catch(error => loading.value = false)
}, { deep: true })

const dataSource = usePortraitRequest({ ...toRefs(props.params) as any, ident: 'GPA' })

watch(dataSource, () => {
  if (dataSource.value.code == 1) {
    const { stray, difference, gradePoint } = dataSource.value.data
    gpaContrastData.series = difference.series
    gpaContrastData.xAxis = difference.xAxis
    gaugeData.chart = gradePoint
    const colors = ['#005DA7', '#F39702']
    gaugeData.legend = gradePoint.map((i: object, index: number) => {
      return {
        ...i,
        color: colors[index]
      }
    })
    gpaScoreOutlierData.series = stray.dataList
    gpaScoreOutlierData.xAxis = stray.xAxis
    nextTick(() => {
      initGpaContrastChart()
      initTopGaugeChart()
      initGpaScoreOutlierChart()
    })

    const { difference: diff, stray: sta } = dataSource.value.datas2

    workRight.difference = diff
    workRight.stray = sta
    topCard.value.value = diff.maxDiffMajor
    topCard.value.describe = `差值：${diff.maxDiff}`
    bottomCard.value.value = diff.minDiffMajor
    bottomCard.value.describe = `差值：${diff.minDiff}`
  }
}, { immediate: true, deep: true })

</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>