import { defineComponent, inject, toRaw, PropType, reactive, ref, nextTick, getCurrentInstance, watch, onUnmounted, toRef, unref, toRefs, provide, Ref, computed } from "vue"
import { BaseParams } from "../../types";
import { downloadFile, usePortraitRequest } from "@/hooks";
import InstanceManager, { getImageUrl } from '@/utils';
import './EatingHabits.scss'
import ColorCard from '@/components/common/ColorCard.vue';
import RedTab from '@/components/common/RedTab.vue';
import BarLegend from '@/components/common/BarLegend.vue'
import BarMultiSegment from '@/components/common/BarMultiSegment.vue'
import TwoRowsCard from '@/components/common/TwoRowsCard.vue';
import { ElLink, ElRadio, ElRadioGroup } from "element-plus";
import { changeChartData, exportGetChartDataDetail, getChartData, getChartDataDetail } from "@/api/modules/studentPortrait";
import { MultiSegmentConf, RedTabConfig, RowsCardConf } from "@/components/common/Search";
import { Column } from "@/components/Table";
import { searchConfigType, requestResType, PagesType } from "@/components/Table-plus/index.d";
import { getOrgType } from "@/api/modules/emphasisList";
import WarningSeal from "@/components/WarningSeal";
const LeftView = defineComponent({
  props: {
    selectList: {
      type: Object as PropType<RedTabConfig[]>,
      default: () => ([
        {
          value: 'Breakfast_rate',
          label: "三餐规律度"
        },
        {
          value: 'Three_Meal_Consumption_Trends',
          label: "三餐消费趋势"
        },
        {
          value: 'Amount_stability',
          label: "消费稳定性"
        },
        {
          value: 'Consumption_correlation',
          label: "消费关联性"
        }
      ])
    }
  },
  setup(props, content) {
    const params = inject<BaseParams>('params', {} as any)
    const instance = getCurrentInstance();
    const instanceManager = inject<InstanceManager>('InstanceManager', new InstanceManager())
    const tag = getImageUrl('warn-tag')
    const echart = instance?.proxy?.$echarts;
    const tabList = reactive(props.selectList)
    const isActive = ref(props.selectList[0].value as string)
    const tabChange = (v: string) => {
      isActive.value = v;
    }

    const LeftChart = ref()
    const LeftLineChart = ref()
    const twoLeftChart = ref()
    const StabilizeChart = ref()
    const TimeChart = ref()
    const FrequencyChart = ref()
    const ThreeMealsChart = ref()
    const Correlation = ref()
    const visible = ref(false)
    const oneData = reactive({
      details: [],
      highRateCount: [],
      lowRateCount: [],
      middleRateCount: [],
      rate: [],
    })
    const twoData = reactive({
      breakfast: [],
      dinner: [],
      lunch: [],
    })
    const threeData = reactive({
      details: [],
    })
    const fourData = reactive({
      details: [],
    })
    const WarningSealName = (val: any) => {
      const list = [
        {
          value: 'Three_Meal_Consumption_Trends',
          label: "三餐消费趋势"
        },
        {
          value: 'Consumption_correlation',
          label: "消费关联性"
        },
        {
          value: "Breakfast_rate",
          label: "早餐就餐率"
        },
        {
          value: "Dinner_rate",
          label: "正餐就餐率"
        },
        {
          value: "Three_meal_dining_rate",
          label: "三餐就餐率"
        },
        {
          value: "Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate",
          label: "早餐就餐率与正餐就餐率关联分析"
        },
        {
          value: "Amount_stability",
          label: "金额稳定性"
        },
        {
          value: "Time_stability",
          label: "时间稳定性"
        },
        {
          value: "Frequency_stability",
          label: "频次稳定性"
        },
        {
          value: "Stability_of_Three_Meals_Amount",
          label: "三餐金额稳定性"
        },

      ];
      const item = list.find(item => item.value === val);
      return item ? item.label : '';
    };

    const response = ref({})
    const selectOne = ref<any>([])
    const isOneActive = ref('')
    const isClsActive = ref<string>('按日')
    const isTwoActive = ref<string>('按日')
    const isThreeActive = ref<string>('按日')
    const selectList = reactive([
      {
        value: "按日",
        label: "按日"
      },
      {
        value: "按月",
        label: "按月"
      },
    ])
    const colorConfig = reactive({
      color: '#45A0E6',
      title: '吃早餐学生占比',
      value: '',
      isUnit: true,
      icon: getImageUrl('czcxszb'),
      unit: '%',
      width: '200px'
    })
    const colorConfigList = ref([{
      color: '#4D5FC1',
      title: '人均早餐消费',
      value: '',
      isUnit: true,
      icon: getImageUrl('ren-jun-zao-can-xiao-fei'),
      unit: '元',
      width: '180px'
    },
    {
      color: '#45A0E6',
      title: '人均午餐消费',
      value: '',
      isUnit: true,
      icon: getImageUrl('ren-jun-wu-can-xiao-fei'),
      unit: '元',
      width: '180px'
    },
    {
      color: '#B22924',
      title: '人均晚餐消费',
      value: '',
      isUnit: true,
      icon: getImageUrl('ren-jun-wan-can-xiao-fei'),
      unit: '元',
      width: '180px'
    }])
    const povertyCls = ref('全部学生')
    const timeCls = ref('全部时间')
    const selectThree = ref<any>([])
    const isThreeCls = ref<any>('')
    const setList = (res: string) => {
      const item: any = tabList.find(i => i.value === res)
      if (res == 'Breakfast_rate') {
        selectOne.value = item.children ? item.children : [
          {
            value: "Breakfast_rate",
            label: "早餐就餐率"
          },
          {
            value: "Dinner_rate",
            label: "正餐就餐率"
          },
          {
            value: "Three_meal_dining_rate",
            label: "三餐就餐率"
          },
          {
            value: "Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate",
            label: "早餐就餐率与正餐就餐率关联分析"
          },
        ]

        isOneActive.value = selectOne.value[0].value
      }
      if (res == 'Amount_stability') {
        selectThree.value = item.children ? item.children : [
          {
            value: "Amount_stability",
            label: "金额稳定性"
          },
          {
            value: "Time_stability",
            label: "时间稳定性"
          },
          {
            value: "Frequency_stability",
            label: "频次稳定性"
          },
          {
            value: "Stability_of_Three_Meals_Amount",
            label: "三餐金额稳定性"
          },
        ]
        isThreeCls.value = selectThree.value[0].value
      }
    }
    const tableSort = ref(1)
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
        prop: 'breakfast',
        label: '早餐',
        align: 'center',
        sortable: true,
      },
      {
        prop: 'lunch',
        label: '午餐',
        align: 'center',
        sortable: true,
      },
      {
        prop: 'dinner',
        label: '晚餐',
        align: 'center',
        sortable: true,
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
    const searchConfig: searchConfigType = reactive(
      [
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
          target: ['stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId'],
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
    )
    const initLeftChart = () => {
      const el: HTMLElement = LeftChart.value;
      let myChart = echart?.getInstanceByDom(LeftChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let datas: any = oneData.details ? oneData.details : []
      let option = {
        color: ['#F39702',],
        title: {
          text: '单位：%',
          top: '1%',
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
          left: '12%',
          top: '1.5%',
          itemWidth: 10,
          itemHeight: 5,
          data: []
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: datas.map((item: any) => ({ value: item.name })),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              // rotate: 0, //代表逆时针旋转
              interval: 'auto',
              // formatter: function (value: string) {
              //   if (value.length > 6) {
              //     return `${value.slice(0, 6)}...`;
              //   }
              //   return value
              // }
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
          },
        ],
        series: [
          {
            type: 'line',
            name: '早餐就餐率',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: datas.map((item: any) => ({ value: item.value })),
          },
        ]
      };
      myChart?.setOption(option);
    }
    const initLeftLineChart = () => {
      const el: HTMLElement = LeftLineChart.value;
      let myChart = echart?.getInstanceByDom(LeftLineChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let option = {
        color: ['#F39D12', '#B22924', '#45A0E6'],
        title: {
          text: '单位：人',
          top: '1%',
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
          left: '12%',
          top: '1.5%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['高', '中', '低']
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            name: '早餐就餐率',
            nameLocation: 'end',
            nameTextStyle: {
              padding: [20, 0, 0, -60],
              verticalAlign: "top"
            },
            data: oneData.rate ? oneData.rate : [],
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              // rotate: 0, //代表逆时针旋转
              interval: 'auto',
              formatter: '{value}%'
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
          },
        ],
        series: [
          {
            type: 'line',
            name: '高',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: oneData.highRateCount ? oneData.highRateCount : [],
          },
          {
            type: 'line',
            name: '中',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: oneData.middleRateCount ? oneData.middleRateCount : [],
          },
          {
            type: 'line',
            name: '低',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: oneData.lowRateCount ? oneData.lowRateCount : [],
          },
        ]
      };
      myChart?.setOption(option);
    }
    const initTwoLeftChart = () => {
      const el: HTMLElement = twoLeftChart.value;
      let myChart = echart?.getInstanceByDom(twoLeftChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let option = {
        color: ['#F39D12', '#B22924', '#45A0E6'],
        title: {
          text: '单位：元',
          top: '1%',
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
          left: '12%',
          top: '1.5%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['早餐', '午餐', '晚餐']
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: twoData.breakfast.map((item: any) => ({ value: item.name })),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              // rotate: 0, //代表逆时针旋转
              interval: 'auto',
              // formatter: function (value: string) {
              //   if (value.length > 6) {
              //     return `${value.slice(0, 6)}...`;
              //   }
              //   return value
              // }
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
          },
        ],
        series: [
          {
            type: 'line',
            name: '早餐',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: twoData.breakfast,
          },
          {
            type: 'line',
            name: '午餐',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: twoData.lunch,
          },
          {
            type: 'line',
            name: '晚餐',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: twoData.dinner,
          },
        ]
      };
      myChart?.setOption(option);
    }
    const initStabilizeChart = () => {
      const el: HTMLElement = StabilizeChart.value;
      let myChart = echart?.getInstanceByDom(StabilizeChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let datas: any = threeData.details ? threeData.details : []
      const values = datas?.map((item: any) => item.perCapita).concat(datas.map((item: any) => item.timesAverage).concat(datas.map((item: any) => item.total))) || [];
      const max = Math.ceil(Math.max(...values) / 10) * 10;
      const interval = Math.ceil(max / 5);
      let option = {
        color: ['#F39D12', '#45A0E6', '#B22924'],
        title: {
          text: '单位：元',
          top: '4%',
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
          left: '12%',
          top: '4%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['人均消费', '次均消费', '消费总额']
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: datas.map((item: any) => ({ value: item.name })),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              // rotate: 0, //代表逆时针旋转
              interval: 'auto',
              // formatter: function (value: string) {
              //   if (value.length > 6) {
              //     return `${value.slice(0, 6)}...`;
              //   }
              //   return value
              // }
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
            name: '单位：万元',
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
        series: [
          {
            type: 'bar',
            name: '人均消费',
            barWidth: '20%',
            data: datas.map((item: any) => ({ value: item.perCapita })),
          },
          {
            type: 'bar',
            name: '次均消费',
            barWidth: '20%',
            data: datas.map((item: any) => ({ value: item.timesAverage })),
          },
          {
            type: 'line',
            name: '消费总额',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: datas.map((item: any) => ({ value: item.total })),
          },
        ]
      };
      myChart?.setOption(option);
    }
    const initTimeChart = () => {
      const el: HTMLElement = TimeChart.value;
      let myChart = echart?.getInstanceByDom(TimeChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const datas = threeData.details ? threeData.details : []
      let option = {
        color: ['#1B528B', '#E3493E', '#F39702', '#45A0E6', '#4D5FC1', '#00C9F2'],
        title: {
          text: '单位：人次',
          top: '4%',
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
          left: '12%',
          top: '4%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['9点及以前', '9~11点', '11~13点', '13~18点', '18~20点', '20点以后']
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: datas.map((item: any) => ({ value: item.name })),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              interval: 'auto',
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
          },
        ],
        series: [
          {
            type: 'bar',
            name: '9点及以前',
            barWidth: '20%',
            data: datas.map((item: any) => ({ value: item.first })),
            stack: 'Ad',
          },
          {
            type: 'bar',
            name: '9~11点',
            barWidth: '20%',
            data: datas.map((item: any) => ({ value: item.second })),
            stack: 'Ad',
          },
          {
            type: 'bar',
            name: '11~13点',
            barWidth: '20%',
            data: datas.map((item: any) => ({ value: item.third })),
            stack: 'Ad',
          },
          {
            type: 'bar',
            name: '13~18点',
            barWidth: '20%',
            data: datas.map((item: any) => ({ value: item.fourth })),
            stack: 'Ad',
          },
          {
            type: 'bar',
            name: '18~20点',
            barWidth: '20%',
            data: datas.map((item: any) => ({ value: item.fifth })),
            stack: 'Ad',
          },
          {
            type: 'bar',
            name: '20点以后',
            barWidth: '20%',
            data: datas.map((item: any) => ({ value: item.sixth })),
            stack: 'Ad',
          },
        ]
      };
      myChart?.setOption(option);
    }
    const initFrequencyChart = () => {
      const el: HTMLElement = FrequencyChart.value;
      let myChart = echart?.getInstanceByDom(FrequencyChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const datas = threeData.details ? threeData.details : []
      const values = datas.map((item: any) => item.personTime).concat(datas.map((item: any) => item.numberOfPeople));
      const max = Math.ceil(Math.max(...values) / 10) * 10;
      const interval = Math.ceil(max / 5);
      let option = {
        color: ['#45A0E6', '#B22924',],
        title: {
          text: '单位：人次',
          top: '4%',
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
          left: '12%',
          top: '4%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['消费人次', '消费人数',]
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: datas.map((item: any) => item.name),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              interval: 'auto',
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
        series: [
          {
            type: 'bar',
            name: '消费人次',
            barWidth: '20%',
            data: datas.map((item: any) => item.personTime),
          },
          {
            type: 'line',
            name: '消费人数',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: datas.map((item: any) => item.numberOfPeople),
          },
        ]
      };
      myChart?.setOption(option);
    }
    const initThreeMealsChart = () => {
      const el: HTMLElement = ThreeMealsChart.value;
      let myChart = echart?.getInstanceByDom(ThreeMealsChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let datas: any = threeData.details ? threeData.details : []
      let option = {
        color: ['#E3493E', '#1B528B', '#F6B145'],
        title: {
          text: '单位：元',
          top: '4%',
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
          left: '12%',
          top: '4%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['早餐人均消费', '午餐人均消费', '晚餐人均消费']
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: datas.map((item: any) => item.name),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              interval: 'auto',
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

          },
        ],
        series: [
          {
            type: 'bar',
            name: '早餐人均消费',
            barWidth: '20%',
            data: datas.map((item: any) => item.breakfast),
          },
          {
            type: 'bar',
            name: '午餐人均消费',
            barWidth: '20%',
            data: datas.map((item: any) => item.lunch),
          },
          {
            type: 'bar',
            name: '晚餐人均消费',
            barWidth: '20%',
            data: datas.map((item: any) => item.dinner),
          },
        ]
      };
      myChart?.setOption(option);
    }
    const initCorrelation = () => {
      const el: HTMLElement = Correlation.value;
      let myChart = echart?.getInstanceByDom(Correlation.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const datas = fourData.details ? fourData.details : []
      let option = {
        color: ['#E3493E', '#1B528B', '#F39702', '#45A0E6', '#4D5FC1', '#00C9F2'],
        title: {
          text: '单位：人',
          top: '4%',
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
          left: '12%',
          top: '4%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['待改进', '适中', '较好']
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: datas.map((item: any) => item.name),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              interval: 'auto',
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
          },
        ],
        series: [
          {
            type: 'bar',
            name: '待改进',
            barWidth: '20%',
            data: datas.map((item: any) => item.improve),
            stack: 'Ad',
          },
          {
            type: 'bar',
            name: '适中',
            barWidth: '20%',
            data: datas.map((item: any) => item.moderate),
            stack: 'Ad',
          },
          {
            type: 'bar',
            name: '较好',
            barWidth: '20%',
            data: datas.map((item: any) => item.preferably),
            stack: 'Ad',
          },
        ]
      };
      myChart?.setOption(option);
    }
    const changeData = async (indet: Ref) => {
      chartLoading.value = true
      let query: any = {
        ident: indet.value,
      }
      if (isActive.value == 'Breakfast_rate') {
        query.category = isClsActive.value
      }
      if (isActive.value == 'Three_Meal_Consumption_Trends') {
        query.category = isTwoActive.value
      }
      if (isActive.value == 'Amount_stability') {
        query.category = isThreeActive.value
      }
      const res = await changeChartData(Object.assign(params, query))
      if (res.code != 1) {
        if (isActive.value == 'Breakfast_rate') {
          oneData.details = []
          nextTick(() => {
            initLeftChart();
          })
        }
        if (isActive.value == 'Three_Meal_Consumption_Trends') {
          twoData.breakfast = []
          twoData.lunch = []
          twoData.dinner = []
          nextTick(() => {
            initTwoLeftChart();
          })
        }
        if (isActive.value == 'Amount_stability') {
          threeData.details = []
          nextTick(() => {
            if (isThreeCls.value == 'Amount_stability') {
              initStabilizeChart();
            }
            if (isThreeCls.value == 'Time_stability') {
              initTimeChart();
            }
            if (isThreeCls.value == 'Frequency_stability') {
              initFrequencyChart();
            }
            if (isThreeCls.value == 'Stability_of_Three_Meals_Amount') {
              initThreeMealsChart();
            }
          })
        }
      }
      if (isActive.value == 'Breakfast_rate') {
        oneData.details = res.data
        nextTick(() => {
          initLeftChart();
        })
      }
      if (isActive.value == 'Three_Meal_Consumption_Trends') {
        const { breakfast, lunch, dinner } = res.data
        twoData.breakfast = breakfast
        twoData.lunch = lunch
        twoData.dinner = dinner
        nextTick(() => {
          initTwoLeftChart();
        })
      }
      if (isActive.value == 'Amount_stability') {
        threeData.details = res.data
        nextTick(() => {
          if (isThreeCls.value == 'Amount_stability') {
            initStabilizeChart();
          }
          if (isThreeCls.value == 'Time_stability') {
            initTimeChart();
          }
          if (isThreeCls.value == 'Frequency_stability') {
            initFrequencyChart();
          }
          if (isThreeCls.value == 'Stability_of_Three_Meals_Amount') {
            initThreeMealsChart();
          }
        })
      }
      delete params.category
      chartLoading.value = false
    }
    const redTabChange = (v: string) => {
      isClsActive.value = v;
      if (v != 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate') {
        changeData(isOneActive)
      }
    }
    const oneTabChange = (v: string) => {
      isOneActive.value = v;
      isClsActive.value = '按日';
    }
    const twoTabChange = (v: string) => {
      isTwoActive.value = v;
      changeData(isActive)
    }
    const cardClick = (index: number) => {
      tableSort.value = 1;
      visible.value = true
    }
    const threeTabChange = (v: string) => {
      isThreeCls.value = v;
      isThreeActive.value = '按日';
    }
    const threeChange = (v: string) => {
      isThreeActive.value = v;
      changeData(isThreeCls)
    }
    instanceManager?.register('isActiveEating', isActive)
    instanceManager?.register('isOneActive', isOneActive)
    instanceManager?.register('isThreeCls', isThreeCls)
    instanceManager?.register('EatingRight', response)
    onUnmounted(() => {
      instanceManager?.clear('isActiveEating')
      instanceManager?.clear('isOneActive')
      instanceManager?.clear('isThreeCls')
      instanceManager?.clear('EatingRight')
      delete params.poorStatus
      delete params.consTime
    })

    const sortClick = (obj: any) => {
      if (obj.prop == 'breakfast') {
        tableSort.value = obj.order == 'des' ? 2 : 1
      }
      if (obj.prop == 'lunch') {
        tableSort.value = obj.order == 'des' ? 4 : 3
      }
      if (obj.prop == 'dinner') {
        tableSort.value = obj.order == 'des' ? 6 : 5
      }
    }
    const tableRequest = (para: any, pages: PagesType): Promise<requestResType> => {
      const obj = {
        ...params,
        ...para,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: false,
        ident: 'Three_Meal_Consumption_Trends',
        sort: tableSort.value,
      }
      return getChartDataDetail(obj)
    }
    const exportEvt = async (form: any, pages: PagesType) => {
      const res = await exportGetChartDataDetail({
        ...params,
        ...form,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: true,
        ident: 'Three_Meal_Consumption_Trends',
        sort: tableSort.value,
      })
      downloadFile(res)
    }
    const queryIsActive: any = ref()
    const newIdent = ref()

    watch(isActive, (val) => {
      setList(val)
      if (val != 'Breakfast_rate' && val != 'Amount_stability') {
        queryIsActive.value = val
      }
      if (val == 'Breakfast_rate') {
        isClsActive.value = '按日'
        queryIsActive.value = isOneActive.value
      }
      if (val == 'Amount_stability') {
        povertyCls.value = '全部学生'
        timeCls.value = '全部时间'
        params.poorStatus = povertyCls.value
        params.consTime = timeCls.value
        isThreeCls.value = isThreeCls.value
        queryIsActive.value = isThreeCls.value
      } else {
        isThreeCls.value = ''
        delete params.poorStatus
        delete params.consTime
      }
      if (val == 'Three_Meal_Consumption_Trends') {
        isTwoActive.value = '按日'
      }
      newIdent.value = queryIsActive.value
    }, { immediate: true, deep: true })

    const chartLoading = ref(false)
    const chartData = async () => {
      chartLoading.value = true
      // let query = {
      //   ident: queryIsActive
      // }

      if (isActive.value == 'Amount_stability') {
        params.poorStatus = povertyCls.value
        params.consTime = timeCls.value
      } else {
        delete params.poorStatus
        delete params.consTime
      }
      const newParams = { ...params }
      newParams.ident = newParams.ident.value
      const res = await getChartData(newParams)
      response.value = res
      if (res.code != 1) {
        if (isActive.value == 'Breakfast_rate') {
          if (isOneActive.value != 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate') {
            oneData.details = []
            colorConfig.value = ''
            nextTick(() => {
              initLeftChart();
            })
          } else {
            oneData.highRateCount = []
            oneData.lowRateCount = []
            oneData.middleRateCount = []
            oneData.rate = []
            nextTick(() => {
              initLeftLineChart();
            })
          }
        }
        if (isActive.value == 'Amount_stability') {
          threeData.details = []
          nextTick(() => {
            if (isThreeCls.value == 'Amount_stability') {
              initStabilizeChart();
            }
            if (isThreeCls.value == 'Time_stability') {
              initTimeChart();
            }
            if (isThreeCls.value == 'Frequency_stability') {
              initFrequencyChart();
            }
            if (isThreeCls.value == 'Stability_of_Three_Meals_Amount') {
              initThreeMealsChart();
            }
          })
        }
      }
      if (isActive.value == 'Breakfast_rate') {
        if (isOneActive.value != 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate') {
          const { details, rate } = res.data
          oneData.details = details
          colorConfig.value = rate
          nextTick(() => {
            initLeftChart();
          })
        } else {
          const { highRateCount, lowRateCount, middleRateCount, rate } = res.data
          oneData.highRateCount = highRateCount
          oneData.lowRateCount = lowRateCount
          oneData.middleRateCount = middleRateCount
          oneData.rate = rate
          nextTick(() => {
            initLeftLineChart();
          })
        }
      }
      if (isActive.value == 'Amount_stability') {
        threeData.details = res.data
        nextTick(() => {
          if (isThreeCls.value == 'Amount_stability') {
            initStabilizeChart();
          }
          if (isThreeCls.value == 'Time_stability') {
            initTimeChart();
          }
          if (isThreeCls.value == 'Frequency_stability') {
            initFrequencyChart();
          }
          if (isThreeCls.value == 'Stability_of_Three_Meals_Amount') {
            initThreeMealsChart();
          }
        })
      }
      chartLoading.value = false
    }

    watch(isOneActive, (res, oldValue) => {
      // if (props.isActive == 'Breakfast_rate') {
      if (oldValue !== undefined) {
        newIdent.value = isOneActive.value
        queryIsActive.value = isOneActive.value
        // chartData(isOneActive)
      }
      switch (res) {
        case 'Breakfast_rate':
          colorConfig.title = '吃早餐学生占比';
          break;
        case 'Dinner_rate':
          colorConfig.title = '吃正餐学生占比';
          break;
        case 'Three_meal_dining_rate':
          colorConfig.title = '三餐都吃学生占比';
          break;
      }
      // }
    }, { deep: true, immediate: true })
    watch(isThreeCls, (res, old) => {
      if (isActive.value == 'Amount_stability') {
        newIdent.value = res
        queryIsActive.value = res
        // chartData()
      }
    }, { deep: true })


    watch([povertyCls, timeCls], ([newValue1, newValue2]) => {
      if (isActive.value == 'Amount_stability') {
        newIdent.value = isThreeCls.value
        chartData()
      }
    })

    // const dataSource = usePortraitRequest( {...toRefs(params) as any, ident: queryIsActive, }, queryIsActive)
    const dataSource = usePortraitRequest(Object.assign(params, { ident: queryIsActive }), queryIsActive)

    watch(dataSource, (res) => {
      response.value = res
      if (res.code != 1) {
        if (isActive.value == 'Breakfast_rate') {
          if (isOneActive.value != 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate') {
            oneData.details = []
            colorConfig.value = ''
            nextTick(() => {
              initLeftChart();
            })
          } else {
            oneData.highRateCount = []
            oneData.lowRateCount = []
            oneData.middleRateCount = []
            oneData.rate = []
            nextTick(() => {
              initLeftLineChart();
            })
          }
        }
        if (isActive.value == 'Three_Meal_Consumption_Trends') {
          colorConfigList.value[0].value = ''
          colorConfigList.value[1].value = ''
          colorConfigList.value[2].value = ''
          twoData.breakfast = []
          twoData.lunch = []
          twoData.dinner = []
          nextTick(() => {
            initTwoLeftChart();
          })
        }
        if (isActive.value == 'Amount_stability') {
          threeData.details = []
          nextTick(() => {
            if (isThreeCls.value == 'Amount_stability') {
              initStabilizeChart();
            }
            if (isThreeCls.value == 'Time_stability') {
              initTimeChart();
            }
            if (isThreeCls.value == 'Frequency_stability') {
              initFrequencyChart();
            }
            if (isThreeCls.value == 'Stability_of_Three_Meals_Amount') {
              initThreeMealsChart();
            }
          })
        }
        if (isActive.value == 'Consumption_correlation') {
          fourData.details = []
          nextTick(() => {
            initCorrelation()
          })
        }

        return
      }
      if (isActive.value == 'Breakfast_rate') {
        if (isOneActive.value != 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate') {
          const { details, rate } = res.data
          oneData.details = details
          colorConfig.value = rate
          nextTick(() => {
            initLeftChart();
          })
        } else {
          const { highRateCount, lowRateCount, middleRateCount, rate } = res.data
          oneData.highRateCount = highRateCount
          oneData.lowRateCount = lowRateCount
          oneData.middleRateCount = middleRateCount
          oneData.rate = rate
          nextTick(() => {
            initLeftLineChart();
          })
        }
      }
      if (isActive.value == 'Three_Meal_Consumption_Trends') {
        const { average, trend } = res.data
        colorConfigList.value[0].value = average.breakfast ? average.breakfast : ''
        colorConfigList.value[1].value = average.lunch ? average.lunch : ''
        colorConfigList.value[2].value = average.dinner ? average.dinner : ''
        twoData.breakfast = trend.breakfast
        twoData.lunch = trend.lunch
        twoData.dinner = trend.dinner
        nextTick(() => {
          initTwoLeftChart();
        })
      }
      if (isActive.value == 'Amount_stability') {
        threeData.details = res.data
        nextTick(() => {
          if (isThreeCls.value == 'Amount_stability') {
            initStabilizeChart();
          }
          if (isThreeCls.value == 'Time_stability') {
            initTimeChart();
          }
          if (isThreeCls.value == 'Frequency_stability') {
            initFrequencyChart();
          }
          if (isThreeCls.value == 'Stability_of_Three_Meals_Amount') {
            initThreeMealsChart();
          }
        })
      }
      if (isActive.value == 'Consumption_correlation') {
        fourData.details = res.data
        nextTick(() => {
          initCorrelation()
        })
      }

    }, { deep: true })
    const renderTitie = (v1: string, v2: string) => {
      let t = v2 == '按日' ? '每日' : '每月'
      switch (v1) {
        case 'Breakfast_rate':
          return t + '早餐就餐率变化趋势'
        case 'Dinner_rate':
          return t + '正餐就餐率变化趋势'
        default:
          return t + '三餐都吃就餐率变化趋势'
      }
    }
    const renderOne = (val: string) => {
      switch (val) {
        case 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate':
          return <div key={Date.now()} class="EatingHabits-left-chart2" ref={LeftLineChart}></div>
        default:
          return <>
            <div class="EatingHabits-left-card-box flex just-c align-items-c">
              <ColorCard cardConfig={colorConfig} />
            </div>
            <div class='sb'>
              <div></div>
              <RedTab class="small-tab" isRed={true} btnList={selectList} isActive={isClsActive.value} onRedTabChange={redTabChange} />
            </div>
            <div v-loading={chartLoading.value} key={val} class="EatingHabits-left-chart" ref={LeftChart}></div>
            <div class='text'>
              {
                renderTitie(val, isClsActive.value)
              }
            </div>
          </>
      }
    }
    const renderTwo = () => {
      return <>
        <div class="EatingHabits-left-card-box-more flex just-c align-items-c">
          {
            colorConfigList.value.map((i, index) => (
              <div onClick={cardClick.bind(null, index)}>
                <ColorCard class={{ 'mlr30': index == 1, 'cursor': true }} cardConfig={i} key={i.color} />
              </div>
            ))
          }
        </div>
        <div class="EatingHabits-left-two-chart-box">
          <RedTab class="two-tab" isRed={true} btnList={selectList} isActive={isTwoActive.value} onRedTabChange={twoTabChange} />
          <div v-loading={chartLoading.value} class="two-chart" ref={twoLeftChart}></div>
        </div>
        <div class='text'>三餐人均消费金额变化趋势</div>
        <c-table-plus onSortClick={sortClick} key={Date.now()} columns={columns} request={tableRequest} searchConfig={searchConfig} visible={visible.value}
          title="个人三餐平均消费金额" dialogWidth="1460px" height="450px" closed={() => visible.value = false} exportBtn={exportEvt}>
          {{
            index: (arg: any) => {
              const { data } = arg
              return <div>{data.$index + 1}</div>
            },
            action: (arg: any) => {
              const { data } = arg
              return <ElLink type="primary">学生个像</ElLink>
            }
          }}
        </c-table-plus>
      </>
    }
    const renderThreeDom = (val: string, v2: string) => {
      switch (val) {
        case 'Amount_stability':
          return <>
            <div v-loading={chartLoading.value} key='StabilizeChart' class='Amount_stability-chart' ref={StabilizeChart}></div>
            <div class='text'>{v2 == '按日' ? '每日' : '每月'}食堂消费金额变化趋势</div>
          </>

        case 'Time_stability':
          return <>
            <div v-loading={chartLoading.value} key='TimeChart' class='Amount_stability-chart' ref={TimeChart}></div>
            <div class='text'>{v2 == '按日' ? '每日' : '每月'}食堂消费时间变化趋势</div>
          </>
        case 'Frequency_stability':
          return <>
            <div v-loading={chartLoading.value} key='FrequencyChart' class='Amount_stability-chart' ref={FrequencyChart}></div>
            <div class='text'>{v2 == '按日' ? '每日' : '每月'}食堂消费频次变化趋势</div>
          </>
        case 'Stability_of_Three_Meals_Amount':
          return <>
            <div v-loading={chartLoading.value} key='ThreeMealsChart' class='Amount_stability-chart' ref={ThreeMealsChart}></div>
            <div class='text'>{v2 == '按日' ? '每日' : '每月'}食堂三餐消费金额变化趋势</div>
          </>

      }
    }
    const renderThree = () => {
      return <div class="EatingHabits-left-renderThree">
        <div class='sb' style='margin:5px 0 10px'>
          <div class='sb'>
            <div class="radio-label">
              贫困等级：
            </div>
            <ElRadioGroup v-model={povertyCls.value}>
              <ElRadio label="全部学生">全部学生</ElRadio>
              <ElRadio label="贫困生">贫困生</ElRadio>
              <ElRadio label="非贫困生">非贫困生</ElRadio>
            </ElRadioGroup>
          </div>
          <div class='sb'>
            <div class="radio-label">
              时间：
            </div>
            <ElRadioGroup v-model={timeCls.value}>
              <ElRadio label="全部时间">全部时间</ElRadio>
              <ElRadio label="工作日">工作日</ElRadio>
              <ElRadio label="双休日">双休日</ElRadio>
            </ElRadioGroup>
          </div>
        </div>
        <RedTab height='28px' bgColor='#B22924' btnList={selectThree.value} isActive={isThreeCls.value} onRedTabChange={threeTabChange} />
        {
          isThreeCls.value == 'Stability_of_Three_Meals_Amount' ? <div class='tag'><img src={tag} alt="" /> 三餐都就餐人群</div> : ''
        }
        <div class='sb' style="margin-top:10px;">
          <div></div>
          <RedTab isRed={true} btnList={selectList} isActive={isThreeActive.value} onRedTabChange={threeChange} />
        </div>
        {
          renderThreeDom(isThreeCls.value, isThreeActive.value)
        }
      </div>
    }
    const renderFn = (val: string) => {
      switch (val) {
        case 'Breakfast_rate':
          return <>
            <div class='sb'>
              <RedTab class="one-tab" height='28px' bgColor='#B22924' btnList={selectOne.value} isActive={isOneActive.value} onRedTabChange={oneTabChange} />
            </div>
            {
              renderOne(isOneActive.value)
            }
          </>
        case 'Three_Meal_Consumption_Trends':
          return renderTwo()
        case 'Amount_stability':
          return renderThree()
        case 'Consumption_correlation':
          return <>
            <div class='correlation-chart' key='Consumption_correlation' ref={Correlation}></div>
            <div class='text'>消费金额(消费水平)与消费稳定性关联分析</div>
          </>
      }
    }
    return () => {
      return <div class='EatingHabits-left' {...content.attrs}>
        <div class="EatingHabits-tab-box sb">
          <c-title title="基本信息画像" />
          <RedTab btnList={tabList} isActive={isActive.value} onRedTabChange={tabChange} />
        </div>
        {
          renderFn(isActive.value)
        }
        <WarningSeal name={WarningSealName(newIdent.value)} ident={newIdent.value} />
      </div>

    }
  }
})

const RightView = defineComponent({
  setup(props, content) {
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const oneTitle = ref('')
    const ThreeTitle = ref('')
    const descTitle = ref('')
    const instanceManager = inject<InstanceManager>('InstanceManager', new InstanceManager())
    const isActive = instanceManager.get('isActiveEating')
    const dataSource = instanceManager.get('EatingRight')
    const isOneActive = instanceManager.get('isOneActive')
    const isThreeCls = instanceManager.get('isThreeCls')
    const isFour = ref('0')
    const oneData = reactive<{ intervals: any[], [key: string | symbol]: any }>({
      intervals: [],
    })
    const twoData = reactive<{ [key: string | symbol]: any }>({})
    const fourData = ref<{ breakfast: any[], dinner: any[], level: any[], stability: any[], }>({
      breakfast: [],
      dinner: [],
      level: [],
      stability: [],
    })
    const selectFour = reactive([
      {
        value: "0",
        label: "早餐就餐率相关性"
      },
      {
        value: "1",
        label: "正餐就餐率相关性"
      },
      {
        value: "2",
        label: "饮食消费水平相关性"
      },
      {
        value: "3",
        label: "就餐时间稳定度相关性"
      },
    ])
    const MajorOption = reactive<MultiSegmentConf>({
      list: [],
      colorList: [
        {
          color: "#F39D12",
          label: "三餐规律"
        },
        {
          color: "#B22924",
          label: "不吃早餐"
        },
        {
          color: "#8C6C4E",
          label: "不吃午餐"
        },
        {
          color: "#00C9F2",
          label: "不吃晚餐"
        },
        {
          color: "#005DA7",
          label: "不吃三餐"
        },
      ],
      unit: '',
      lableAlign: 'right',
      lableWidth: '0'
    })
    const cardConfig = ref<RowsCardConf[]>([])

    const LeftPieChart = ref()
    const initLeftPieChart = () => {
      const el: HTMLElement = LeftPieChart.value;
      let myChart = echart?.getInstanceByDom(LeftPieChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const list = oneData.intervals ? oneData.intervals : []
      const datas = list.map((it: any) => {
        const item = { ...it }
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
        return item
      })
      let option: any = {
        color: ['#E3493E', '#1B528B', '#00C9F2', '#F39702', '#8C6C4E'],
        legend: {
          // type: "scroll",
          // icon: "circle",
          orient: 'vertical',
          top: 'center',
          right: '6%',
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
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value} 人 (${param.percent}%)`
          }
        },
        series: [
          {
            // name: "",
            type: "pie",
            radius: ["40%", "55%"],
            center: ['50%', '50%'],
            labelLine: {
              length: 20,//第一段线长
              length2: 80, //第二段线长
              lineStyle: {
                width: 1,
                type: 'solid',
                color: '#005DA7'
              },

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
        ],

      }
      if (isOneActive.value == 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate') {
        option.color = ["#005DA7", "#00C9F2", "#8C6C4E", "#DEC859", "#F39702", "#E3493E", "#231815", "#4D5FC1", "#45A0E6"];
        option.series = [{
          radius: ['55%', '70%'],
          center: ['17%', '50%'],
          type: 'pie',
          //roseType: 'radius',
          emphasis: {
            label: {
              show: false
            }
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 4,

          },
          data: datas
        },]
        option.legend = {
          type: "scroll",
          orient: 'vertical',
          top: 'middle',
          right: '0%',
          bottom: '0%',
          textStyle: {
            color: "#3E5463",
            fontSize: 14,
            backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
            rich: {
              a: {
                // width: 60,
                padding: [0, 0, 0, 0],
                color: '#3E5463',
                fontWeight: 'bold'
              },
              b: {
                width: 50,
                padding: [0, 0, 0, 10],
                color: '#3E5463',
                fontWeight: 'bold',
              },
              c: {
                padding: [0, 0, 0, 0],
              },
            },
          },
          itemWidth: 10,
          itemHeight: 4,
          itemGap: 10,
          icon: "rect",
          pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
          pageIconSize: 12,  //当然就是按钮的大小
          pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
          tooltip: {
            show: true
          },
          data: datas.map((item) => item.name),
          formatter: (name: string) => {
            let total = 0;
            let tarValue: number = 0; // 为 tarValue 赋一个默认值
            for (let i = 0; i < datas.length; i++) {
              total += datas[i].value;
              if (name === datas[i].name) {
                tarValue = datas[i].value;
              }
            }
            const p = tarValue != 0 ? ((tarValue / total) * 100).toFixed(2) : 0;
            return `{c|${name}} {b|${tarValue}人} {a| ${p}}%`;
          }

        }

      }
      myChart?.setOption(option);
    }
    const optionFn = (datas: any, title: string) => {
      return {
        color: ['#E3493E', '#1B528B', '#00C9F2', '#F39702', '#8C6C4E'],
        legend: {
          orient: 'vertical',
          top: 'center',
          right: '6%',
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
          data: datas?.map((item: any) => item.name),
        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value}%`
          }
        },
        graphic: {
          type: 'text',
          left: '19.5%',
          top: '51.5%',
          style: {
            text: title,
            textAlign: 'center',
            fill: '#000',
            fontSize: 16,
          }
        },
        series: [
          {
            type: "pie",
            radius: ["45%", "65%"],
            center: ['22%', '55%'],
            labelLine: {
              length: 15,//第一段线长
              length2: 50, //第二段线长
              lineStyle: {
                width: 1,
                type: 'solid',
                color: '#005DA7'
              },
            },
            label: {
              formatter: '{zb|{d}%}',
              padding: [0, -50, 20, -50],
              rich: {
                zb: {
                  fontSize: 14,
                  color: '#203449'
                }

              },
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: datas,
          },
        ],

      }
    }
    const twoTopPie = ref()
    const twoCenterPie = ref()
    const twoBottomPie = ref()
    const FourChart = ref()
    const FourTitle = ref()
    const initTwoTopPie = () => {
      const el: HTMLElement = twoTopPie.value;
      let myChart = echart?.getInstanceByDom(twoTopPie.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const list = twoData.breakfast && twoData.breakfast.intervals ? twoData.breakfast.intervals : []
      const datas = list.map((it: any) => {
        let item = { ...it }
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
        return item
      })
      myChart?.setOption(optionFn(datas, '早餐'));
    }
    const initTwoCenterPie = () => {
      const el: HTMLElement = twoCenterPie.value;
      let myChart = echart?.getInstanceByDom(twoCenterPie.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const list = twoData.lunch && twoData.lunch.intervals ? twoData.lunch.intervals : []
      const datas = list.map((it: any) => {
        let item = { ...it }
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
        return item
      })
      myChart?.setOption(optionFn(datas, '午餐'));
    }
    const initTwoBottomPie = () => {
      const el: HTMLElement = twoBottomPie.value;
      let myChart = echart?.getInstanceByDom(twoBottomPie.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const list = twoData.dinner && twoData.dinner.intervals ? twoData.dinner.intervals : []
      const datas = list.map((it: any) => {
        let item = { ...it }
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
        return item
      })
      myChart?.setOption(optionFn(datas, '晚餐'));
    }
    const initFourChart = () => {
      const el: HTMLElement = FourChart.value;
      let myChart = echart?.getInstanceByDom(FourChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let smallTitle = ''
      let datas: any[] = []
      switch (isFour.value) {
        case '0':
          smallTitle = '早餐就餐率'
          datas = fourData.value.breakfast ? fourData.value.breakfast : []
          break;
        case '1':
          smallTitle = '正餐就餐率'
          datas = fourData.value.dinner ? fourData.value.dinner : []
          break;
        case '2':
          smallTitle = '饮食消费水平'
          datas = fourData.value.level ? fourData.value.level : []
          break;
        case '3':
          smallTitle = '就餐时间稳定度'
          datas = fourData.value.stability ? fourData.value.stability : []
          break;
      }
      let option: any = {
        color: ['#F39D12', '#B22924', '#45A0E6'],
        title: {
          text: '单位：人',
          top: '1%',
          left: 0,
          textStyle: {
            color: '#333333',
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            datas.forEach((item: any) => {
              if (item.name == params[0].name) {
                params[0].percent = item.goodRate
              }
              if (item.name == params[1].name) {
                params[1].percent = item.wellRate
              }
              if (item.name == params[2].name) {
                params[2].percent = item.improveRate
              }
            })
            return `<div>${smallTitle}: ${params[0].name}</div>
            <div style='display: flex;width:200px'><div style='width:33.33%'>${params[0].marker}${params[0].seriesName}</div><div style='width:33.33%'>${params[0].value}人</div><div style='width:33.33%'>${params[0].percent}%</div></div>
            <div style='display: flex;width:200px'><div style='width:33.33%'>${params[1].marker}${params[1].seriesName}</div><div style='width:33.33%'>${params[1].value}人</div><div style='width:33.33%'>${params[1].percent}%</div></div>
            <div style='display: flex;width:200px'><div style='width:33.33%'>${params[2].marker}${params[2].seriesName}</div><div style='width:33.33%'>${params[2].value}人</div><div style='width:33.33%'>${params[2].percent}%</div></div>
            `
          }
        },
        legend: {
          left: '12%',
          top: '1.5%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['优秀', '良好', '待改进']
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: datas?.map((item: any) => item.name) || [],
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              interval: 'auto',
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
          },
        ],
        series: [
          {
            type: 'line',
            name: '优秀',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: datas.map((item: any) => item.good),
          },
          {
            type: 'line',
            name: '良好',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: datas.map((item: any) => item.well),
          },
          {
            type: 'line',
            name: '待改进',
            smooth: true,
            symbol: 'none',
            symbolSize: 10,
            data: datas.map((item: any) => item.improve),
          },
        ]
      };
      if (isFour.value == '2' || isFour.value == '3') {
        option.series = [
          {
            type: 'bar',
            name: '优秀',
            barWidth: '20%',
            data: datas.map((item: any) => item.good),
          },
          {
            type: 'bar',
            name: '良好',
            barWidth: '20%',
            data: datas.map((item: any) => item.well),
          },
          {
            type: 'bar',
            name: '待改进',
            barWidth: '20%',
            data: datas.map((item: any) => item.improve),
          },
        ]
      }
      myChart?.setOption(option);
    }
    const FourTabChange = (v: string) => {
      isFour.value = v;
      nextTick(() => {
        initFourChart();
      })
      switch (v) {
        case '0':
          FourTitle.value = '与早餐就餐率相关性'
          break;
        case '1':
          FourTitle.value = '与正餐就餐率相关性'
          break;
        case '2':
          FourTitle.value = '与饮食消费水平相关性'
          break;
        case '3':
          FourTitle.value = '与就餐时间稳定度相关性'
          break;
      }
    }
    watch(isOneActive, (val) => {
      switch (val) {
        case 'Breakfast_rate':
          oneTitle.value = '早餐就餐分析'
          descTitle.value = '每周人均早餐次数主要区间'
          break;
        case 'Dinner_rate':
          oneTitle.value = '正餐就餐分析'
          descTitle.value = '每周人均正餐次数主要区间'
          break;
        case 'Three_meal_dining_rate':
          oneTitle.value = '三餐就餐分析'
          descTitle.value = '每周人均三餐均就餐次数主要区间'
          break;
        default:
          oneTitle.value = '早餐与正餐就餐率关联分析'
          descTitle.value = '学生就餐习惯主要集中于'
          break;
      }
    }, { immediate: true, deep: true })
    watch(isThreeCls, (val) => {
      switch (val) {
        case 'Amount_stability':
          ThreeTitle.value = '消费金额稳定性'
          cardConfig.value = [
            {
              title: '消费总额',
              topText: '日均消费总额',
              topText2: '每日平均变化幅度',
              bottomText: '月均消费总额',
              bottomText2: '每月平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '万元',
              unit2: '%',
              bgColor: '#005DA7'
            },
            {
              title: '人均消费',
              topText: '每日人均消费总额',
              topText2: '每日平均变化幅度',
              bottomText: '每月人均消费总额',
              bottomText2: '每月平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '元',
              unit2: '%',
              bgColor: '#45A0E6'
            },
            {
              title: '次均消费',
              topText: '每日次均消费总额',
              topText2: '每日平均变化幅度',
              bottomText: '每月次均消费总额',
              bottomText2: '每月平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '元',
              unit2: '%',
              bgColor: '#B22924'
            },
          ]
          break;
        case 'Time_stability':
          ThreeTitle.value = '消费时间稳定性'
          cardConfig.value = [
            {
              title: '早上',
              topText: '最早消费时间',
              topText2: '每日平均变化幅度',
              bottomText: '消费高峰时段',
              bottomText2: '每日平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '',
              unit2: '%',
              bgColor: '#005DA7'
            },
            {
              title: '中午',
              topText: '最早消费时间',
              topText2: '每日平均变化幅度 ',
              bottomText: '消费高峰时段',
              bottomText2: '每日平均变化幅度 ',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '',
              unit2: '%',
              bgColor: '#45A0E6'
            },
            {
              title: '晚上',
              topText: '最早消费时间',
              topText2: '每日平均变化幅度',
              bottomText: '消费高峰时段',
              bottomText2: '每日平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '',
              unit2: '%',
              bgColor: '#B22924'
            },
          ]
          break;
        case 'Frequency_stability':
          ThreeTitle.value = '消费频次稳定性'
          cardConfig.value = [
            {
              title: '消费人数',
              topText: '日均消费人数',
              topText2: '每日平均变化幅度',
              bottomText: '月均消费人数',
              bottomText2: '每月平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '人',
              unit2: '%',
              bgColor: '#005DA7'
            },
            {
              title: '消费人次',
              topText: '日均消费人次',
              topText2: '每日平均变化幅度',
              bottomText: '月均消费人次',
              bottomText2: '每月平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '人次',
              unit2: '%',
              bgColor: '#45A0E6'
            },
          ]
          break;
        case 'Stability_of_Three_Meals_Amount':
          ThreeTitle.value = '三餐金额稳定性'
          cardConfig.value = [
            {
              title: '早餐',
              topText: '每日人均早餐消费',
              topText2: '每日平均变化幅度',
              bottomText: '每月人均早餐消费',
              bottomText2: '每月平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '',
              unit2: '%',
              bgColor: '#005DA7'
            },
            {
              title: '午餐',
              topText: '每日人均午餐消费',
              topText2: '每日平均变化幅度 ',
              bottomText: '每月人均午餐消费',
              bottomText2: '每月平均变化幅度 ',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '',
              unit2: '%',
              bgColor: '#45A0E6'
            },
            {
              title: '晚餐',
              topText: '每日人均晚餐消费',
              topText2: '每日平均变化幅度',
              bottomText: '每月人均晚餐消费',
              bottomText2: '每月平均变化幅度',
              topVal: '',
              topVal2: '',
              bottomVal: '',
              bottomVal2: '',
              unit: '',
              unit2: '%',
              bgColor: '#B22924'
            },
          ]
          break;
      }
    }, { immediate: true, deep: true })
    watch(isActive, (val) => {
      if (val == 'Consumption_correlation') {
        isFour.value = '0'
      }
    })
    watch(dataSource, (res) => {
      if (res.code != 1) {
        if (isActive.value == 'Breakfast_rate') {
          if (isOneActive.value != 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate') {
            oneData.intervals = []
            oneData.mainInterval = ''
            nextTick(() => {
              initLeftPieChart();
            })
          } else {
            oneData.intervals = [];
            oneData.mainInterval = '';
            MajorOption.list = []
            nextTick(() => {
              initLeftPieChart();
            })
          }
        }
        if (isActive.value == 'Three_Meal_Consumption_Trends') {
          twoData.breakfast = []
          twoData.lunch = []
          twoData.dinner = []
          nextTick(() => {
            initTwoTopPie();
            initTwoCenterPie();
            initTwoBottomPie();
          })
        }
        if (isActive.value == 'Amount_stability') {
          cardConfig.value[0].topVal = ''
          cardConfig.value[0].topVal2 = ''
          cardConfig.value[0].bottomVal = ''
          cardConfig.value[0].bottomVal2 = ''
          cardConfig.value[1].topVal = ''
          cardConfig.value[1].topVal2 = ''
          cardConfig.value[1].bottomVal = ''
          cardConfig.value[1].bottomVal2 = ''
          if (isThreeCls.value != 'Frequency_stability') {
            cardConfig.value[2].topVal = ''
            cardConfig.value[2].topVal2 = ''
            cardConfig.value[2].bottomVal = ''
            cardConfig.value[2].bottomVal2 = ''
          }
        }
        if (isActive.value == 'Consumption_correlation') {
          fourData.value = {
            breakfast: [],
            dinner: [],
            level: [],
            stability: [],
          }
          nextTick(() => {
            initFourChart()
          })
        }
        return
      }
      if (isActive.value == 'Breakfast_rate') {
        if (isOneActive.value != 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate') {
          const { mainInterval, intervals } = res.datas2
          oneData.intervals = intervals
          oneData.mainInterval = mainInterval
          nextTick(() => {
            initLeftPieChart();
          })
        } else {
          const { diningHabits, diningPatterns, mainHabit } = res.datas2
          oneData.intervals = diningHabits;
          oneData.mainInterval = mainHabit;
          let ob = { name: '', arr: [] }
          ob.arr = diningPatterns.map((item: any) => {
            let obj: any = {}
            obj.percentage = item.rate
            obj.value = item.value
            return obj
          })
          MajorOption.list = [ob]
          nextTick(() => {
            initLeftPieChart();
          })
        }
      }
      if (isActive.value == 'Three_Meal_Consumption_Trends') {
        const { breakfast, lunch, dinner } = res.datas2
        twoData.breakfast = breakfast
        twoData.lunch = lunch
        twoData.dinner = dinner
        nextTick(() => {
          initTwoTopPie();
          initTwoCenterPie();
          initTwoBottomPie();
        })
      }
      if (isActive.value == 'Amount_stability') {
        if (isThreeCls.value == 'Amount_stability') {
          const { perCapita, timesAverage, totalMoney } = res.datas2
          cardConfig.value[0].topVal = totalMoney.day.average
          cardConfig.value[0].topVal2 = totalMoney.day.range
          cardConfig.value[0].bottomVal = totalMoney.month.average
          cardConfig.value[0].bottomVal2 = totalMoney.month.range
          cardConfig.value[1].topVal = perCapita.day.average
          cardConfig.value[1].topVal2 = perCapita.day.range
          cardConfig.value[1].bottomVal = perCapita.month.average
          cardConfig.value[1].bottomVal2 = perCapita.month.range
          cardConfig.value[2].topVal = timesAverage.day.average
          cardConfig.value[2].topVal2 = timesAverage.day.range
          cardConfig.value[2].bottomVal = timesAverage.month.average
          cardConfig.value[2].bottomVal2 = timesAverage.month.range
        }
        if (isThreeCls.value == 'Time_stability') {
          const { morning, noon, night } = res.datas2
          cardConfig.value[0].topVal = morning.time.name
          cardConfig.value[0].topVal2 = morning.time.range
          cardConfig.value[0].bottomVal = morning.timeInterval.name
          cardConfig.value[0].bottomVal2 = morning.timeInterval.range
          cardConfig.value[1].topVal = noon.time.name
          cardConfig.value[1].topVal2 = noon.time.range
          cardConfig.value[1].bottomVal = noon.timeInterval.name
          cardConfig.value[1].bottomVal2 = noon.timeInterval.range
          cardConfig.value[2].topVal = night.time.name
          cardConfig.value[2].topVal2 = night.time.range
          cardConfig.value[2].bottomVal = night.timeInterval.name
          cardConfig.value[2].bottomVal2 = night.timeInterval.range
        }
        if (isThreeCls.value == 'Frequency_stability') {
          const { people, time } = res.datas2
          cardConfig.value[0].topVal = people.day.name
          cardConfig.value[0].topVal2 = people.day.range
          cardConfig.value[0].bottomVal = people.month.name
          cardConfig.value[0].bottomVal2 = people.month.range
          cardConfig.value[1].topVal = time.day.name
          cardConfig.value[1].topVal2 = time.day.range
          cardConfig.value[1].bottomVal = time.month.name
          cardConfig.value[1].bottomVal2 = time.month.range
        }
        if (isThreeCls.value == 'Stability_of_Three_Meals_Amount') {
          const { breakfast, lunch, dinner } = res.datas2
          cardConfig.value[0].topVal = breakfast.day.average
          cardConfig.value[0].topVal2 = breakfast.day.range
          cardConfig.value[0].bottomVal = breakfast.month.average
          cardConfig.value[0].bottomVal2 = breakfast.month.range
          cardConfig.value[1].topVal = lunch.day.average
          cardConfig.value[1].topVal2 = lunch.day.range
          cardConfig.value[1].bottomVal = lunch.month.average
          cardConfig.value[1].bottomVal2 = lunch.month.range
          cardConfig.value[2].topVal = dinner.day.average
          cardConfig.value[2].topVal2 = dinner.day.range
          cardConfig.value[2].bottomVal = dinner.month.average
          cardConfig.value[2].bottomVal2 = dinner.month.range
        }
      }
      if (isActive.value == 'Consumption_correlation') {
        fourData.value = res.datas2
        nextTick(() => {
          initFourChart()
        })
      }
    }, { deep: true })
    const renderFn = (val: string) => {
      switch (val) {
        case 'Breakfast_rate':
          return <>
            <div class='c-title'>{oneTitle.value}</div>
            <div key={Date.now()} class='LeftPieChart'
              style={{ height: isOneActive.value == 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate' ? '260px' : '280px' }}
              ref={LeftPieChart}></div>
            <div class='text'>{descTitle.value} <span>{oneData.mainInterval}</span></div>
            {
              isOneActive.value == 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate' ?
                <>
                  <div class='c-title mt10'>学生就餐习惯(三餐就餐)分布</div>
                  <div class='flex-end mt10 mb18'>
                    <BarLegend legendList={MajorOption.colorList} />
                  </div>
                  <BarMultiSegment options={MajorOption} />
                </>
                : ''
            }
          </>
        case 'Three_Meal_Consumption_Trends':
          return <>
            <div class='c-title'>三餐消费分析</div>
            <div key='twoPieChart' class="twoPieChart" ref={twoTopPie}></div>
            <div class='text'>早餐人均单次消费主要集中于 <span>{twoData.breakfast?.mainInterval}</span></div>
            <div key='twoCenterPie' class="twoPieChart" ref={twoCenterPie}></div>
            <div class='text'>午餐人均单次消费主要集中于 <span>{twoData.lunch?.mainInterval}</span></div>
            <div key='twoBottomPie' class="twoPieChart" ref={twoBottomPie}></div>
            <div class='text'>晚餐人均单次消费主要集中于 <span>{twoData.dinner?.mainInterval}</span></div>
          </>
        case 'Amount_stability':
          return <>
            <div class='c-title mb18'>{ThreeTitle.value}</div>
            {
              cardConfig.value.map((i, index) => (
                <TwoRowsCard cardConfig={i} key={i.bgColor} />
              ))
            }
          </>
        case 'Consumption_correlation':
          return <>
            <div class='c-title'>学习成绩关联性分析</div>
            <div class='flex-start' style="margin:14px 0 20px">
              <RedTab height='36px' bgColor='#B22924' btnList={selectFour} isActive={isFour.value} onRedTabChange={FourTabChange} />
            </div>
            <div class='FourChart' ref={FourChart}></div>
            <div key={Date.now()} class='text'>{FourTitle.value}</div>
          </>

      }
    }
    return () => {
      return <div class="EatingHabits-right" {...content.attrs}>
        <div class="EatingHabits-tab-tag">
          <c-title title="特征分析" />
        </div>
        <section class='EatingHabits-right-content'>
          {
            renderFn(isActive.value)
          }
        </section>
      </div>
    }
  }
})


const EatingHabits = defineComponent({
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    selectList: {
      type: Object as PropType<RedTabConfig[]>,
      default: () => ([
        {
          value: 'Breakfast_rate',
          label: "三餐规律度"
        },
        {
          value: 'Three_Meal_Consumption_Trends',
          label: "三餐消费趋势"
        },
        {
          value: 'Amount_stability',
          label: "消费稳定性"
        },
        {
          value: 'Consumption_correlation',
          label: "消费关联性"
        }
      ])
    }
  },
  setup(props, content) {
    provide('params', props.params)
    return () => {
      return <div
        class={{ 'EatingHabits': true, }}
      >
        <div class={{
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}>
          <LeftView selectList={props.selectList} class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
          <RightView class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
        </div>
      </div>
    }
  }
})

EatingHabits.Left = LeftView
EatingHabits.Right = RightView
export default EatingHabits


