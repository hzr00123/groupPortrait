<template>
  <div class="student-distribution">
    <div class="flex" :class="direction === 'horizontal'?'horizontal':'vertical'">
      <div :class="direction === 'horizontal'?'w50':'w100'" style="padding-right: 20px;">
        <div class="student-distribution-left">
          <div class="student-distribution-left-top">
            <c-title title="基本信息画像" />
            <RedTab :btnList="btnList" :isActive="isActive" @redTabChange="clickCls" />
          </div>

          <div class="student-distribution-left-content" v-if="isActive != 'Source_of_Students'">
            <div class="student-distribution-left-content-top">
              <BarLegend :legendList="MajorOption.colorList" />
              <RedTab :btnList="clsList" :isRed="isRed" :isActive="isClsActive" @redTabChange="redTabChange" />
            </div>
            <BarMultiSegment :options="MajorOption" />
            <div class="footer" v-if="isActive == 'Gender' || isActive == 'nation'">
              <div>学校:</div>
              <div>{{ GenderData.school ? GenderData.school[1]?.name : '' }}</div>
              <div>{{ GenderData.school ? GenderData.school[1]?.rate : '' }}</div>
              <div>{{ GenderData.school ? GenderData.school[0]?.name : '' }}</div>
              <div>{{ GenderData.school ? GenderData.school[0]?.rate : '' }}</div>
            </div>
          </div>
          <div class="student-distribution-left-content" v-else>
            <div class="stu-chart" ref="stuChart"></div>
          </div>
        </div>
      </div>
      <div v-if="$attrs.view !== 'left'" :class="direction === 'horizontal'?'w50':'w100'" style="padding-left: 20px;">
        <div class="student-distribution-right">
          <c-title title="学生分布特征" class="right-top" />

          <div class="right-content">
            <div class="c-title">{{ rightTitle(isActive) }}</div>
            <div class="content" v-if="isActive == 'Gender'">
              <div class="woman">
                <div class="zb">{{ GenderData.data && GenderData.data[1]?.rate || '' }}%</div>
                <img src="@/assets/imgs/woman.png" alt="">
                <div class="num">
                  女性 <span>{{ GenderData.data && GenderData.data[1]?.value || '' }}人</span>
                </div>
              </div>
              <div class="chart-box">
                <div class="chart" ref="sexChart" :key="Date.now()"></div>
                <div class="chart-zb">
                  男女比 <span>{{ GenderData.rate }}</span>
                </div>
              </div>
              <div class="man">
                <div class="zb">{{ GenderData.data && GenderData.data[0]?.rate || '' }}%</div>
                <img src="@/assets/imgs/man.png" alt="">
                <div class="num">
                  男性 <span>{{ GenderData.data && GenderData.data[0]?.value || '' }}人</span>
                </div>
              </div>
            </div>
            <div class="age-content" v-if="isActive == 'Age'">
              <div class="age-chart" ref="ageChart" :key="Date.now()"></div>
              <div class="age-tips">
                主要年龄区间&nbsp;<span>{{ GenderData.main }}</span>
              </div>
              <div class="age-content-bottom">
                <CustomCard :cardConfig="leftCard" />
                <CustomCard :cardConfig="rightCard" />
              </div>
            </div>
            <div class="stu-content" v-if="isActive == 'Source_of_Students' || isActive == 'nation'">
              <div class="stu-content-top">
                <div class="stu-pie-chart" ref="stuPieChart"></div>
                <div class="list-body">
                  <ProgressBar :option="barOption" />
                </div>
              </div>
              <div class="stu-content-bottom">
                <div class="l">{{ isActive == 'Source_of_Students' ? '省(市)内生源占比' : '少数民族占比' }}<span>{{ GenderData.rate
                }}</span></div>
                <div class="r">{{ isActive == 'Source_of_Students' ? '生源Top5' : '少数民族Top5' }}
                  <span class="s-box">{{ GenderData.topFive?.fiveName }} </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <WarningSeal :name="WarningSealName(isActive)" :ident='isActive'/>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, toRaw, watch, computed, getCurrentInstance, onMounted, nextTick, inject, toRefs } from 'vue';
import china from "@/utils/china.json";
import RedTab from "@/components/common/RedTab.vue";
import CustomCard from "@/components/common/CustomCard.vue";
import BarLegend from '@/components/common/BarLegend.vue';
import BarMultiSegment from '@/components/common/BarMultiSegment.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import { getChartData, changeChartData } from "@/api/modules/studentPortrait"
import { useChildrenData, usePortraitRequest } from "@/hooks";
import { BaseParams } from '../types';
import { MultiSegmentConf, RedTabConfig,  } from '@/components/common/Search';
import { ElLoading } from 'element-plus';
import WarningSeal from "@/components/WarningSeal";
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

const props = withDefaults(defineProps<{
  params: BaseParams, selectList?: RedTabConfig[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
  params: {} as any,
  selectList: [
    {
      value: 'Gender',
      label: "性别"
    },
    {
      value: 'Age',
      label: "年龄"
    },
    {
      value: 'Source_of_Students',
      label: "生源"
    },
    {
      value: 'nation',
      label: "民族"
    },
  ] as any,
  isActive: 'Gender',
  direction:'horizontal',
}) 

const GenderData = ref<{ data: Array<any>, series: Array<any>, school: Array<any>, [key: string | symbol]: any }>({
  data: [],
  series: [],
  school: []
})
const btnList = ref<RedTabConfig[]>(props.selectList!)
const isRed = ref(true)
const barOption = reactive({
  list: [],
  color: '#005DA7',
  lableWidth: 90,
  valueWidth: 60,
  lableAlign: 'left',
  valuePosition: 'right',
  unit: '人',
  needTag: true,
  margin: '8px',
})

const MajorOption = reactive<MultiSegmentConf>({
  list: [],
  colorList: [
    {
      color: "#F39D12",
      label: "女性"
    },
    {
      color: "#005DA7",
      label: "男性"
    },
  ],
  unit: '人',
  lableAlign: 'right',
  lableWidth: '160px',
  height: '270px'
})
const leftCard = reactive({
  width: '280px',
  height: '80px',
  color: '#1B528B',
  title: '最大年龄',
  value: '',
  isUnit: true,
  unit: '岁',
  describe: '',
  fontSize: '28px'
})
const rightCard = reactive({
  width: '280px',
  height: '80px',
  color: '#F39702',
  title: '最小年龄',
  value: '',
  isUnit: true,
  unit: '岁',
  describe: '',
  fontSize: '28px'
})
const isActive = ref(props.isActive)
const WarningSealName = computed(() => {
  return (val: string) => {
    let str=''
    btnList.value!.forEach((item:any)=>{
      if(val == item.value){
        str = item.label
      }
    })
    return str
  }
});
const clsList = ref([
  {
    value: "按学院",
    label: "按学院"
  },
  {
    value: "按专业",
    label: "按专业"
  },
])
const isClsActive = ref<string>("按学院")
const clickCls = (index: string) => {
  isActive.value = index;
  isClsActive.value = "按学院";
}
const redTabChange = (index: string) => {
  isClsActive.value = index;
  changeData()
}

const initChart = () => {

  const el: HTMLElement = instance?.refs.chart as any;
  let myChart = echart?.init(el);
  let datas = [
    {
      name: '江河湖海1',
      value1: 50,
      value2: 50
    },
    {
      name: '江河湖海2',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海3',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海4',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
    ,
    {
      name: '江河湖海5',
      value1: 50,
      value2: 50
    }
  ]
  let option = {
    backgroundColor: '#fff',
    title: {
      show: false,
      text: '',
      textStyle: {
        color: '#FFFFFF'
      },
      left: '300px',
      top: '300'

    },
    grid: { //调整图表上下左右位置
      top: '15%',
      left: '5%',
      right: '0%',
      bottom: '0%',
      containLabel: true
    },

    tooltip: {
      show: false,
      formatter: "{b} <br> {c}%"

    },
    legend: {
      icon: "circle",
      top: '3%',
      left: '10%',
      itemWidth: 7,
      itemHeight: 7,
      itemGap: 40,
      textStyle: {
        color: '#203449',
      },
      data: [{ name: '女性' }, { name: '男性' }]
    },
    xAxis: [{
      type: 'value',
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false,
      }
    }],
    yAxis: [{
      // type: 'category',
      data: datas.map(item => item.name),
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },

    }],
    series: [
      {
        name: '女性',
        type: 'bar',
        barWidth: 8,
        stack: '危货种类占比',
        label: {
          normal: {
            borderWidth: 10,
            distance: 15,
            align: 'left',
            verticalAlign: 'middle',
            // borderRadius: 1,
            // borderColor: '#E8A61F',
            // backgroundColor: '#E8A61F',
            show: true,
            position: 'top',
            formatter: '{c}%',
            color: '#000'
          }
        },
        itemStyle: {
          color: '#E8A61F',
          borderRadius: [10, 0, 0, 10],
          // borderWidth:1,
          // borderRight:'none',
          // borderColor:'#cfe0ee'
        },
        data: datas.map(item => item.value1)

      },
      {
        name: '男性',
        type: 'bar',
        barWidth: 8,
        stack: '危货种类占比',
        itemStyle: {
          color: '#005DA7',
          borderRadius: [0, 10, 10, 0],
        },
        label: {
          normal: {
            borderWidth: 10,
            distance: 15,
            align: 'right',
            verticalAlign: 'middle',
            show: true,
            position: 'top',
            formatter: '{c}%',
            color: '#000'
          }
        },
        data: datas.map(item => item.value1)
        // data: [{
        //   value: datas.map(item =>{
        //     console.log(item.value2)
        //     return item.value2
        //   } ),
        //   itemStyle: {
        //     normal: {
        //       color: {
        //         type: 'bar',
        //         colorStops: [{
        //           offset: 0,
        //           color: '#005DA7' // 0% 处的颜色
        //         }, {
        //           offset: 1,
        //           color: '#005DA7' // 100% 处的颜色
        //         }],
        //         globalCoord: false, // 缺省为 false
        //       },
        //       borderRadius: [0,10,10,0],
        //       // borderRadius: 1,
        //       // borderColor: '#E67C26',
        //     }
        //   }
        // }]
      },
    ],

  };
  myChart?.setOption(option)
}
const initSexChart = () => {
  const el: HTMLElement = instance?.refs.sexChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }

  let color = ['#317DB8', '#C0534F',]
  let datas = GenderData.value.data;
  let option = {
    color: color,
    legend: {
      // type: "scroll",
      // icon: "circle",
      // orient: 'vertical',
      top: '0',
      left: 'center',

      textStyle: {
        color: "#3E5463",
        fontSize: 14,
        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
      },
      itemWidth: 10,
      itemHeight: 6,
      itemGap: 30,
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
        radius: ['45%', '70%'],
        center: ['50%', '55%'],
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
      },
    ]
  }
  myChart?.setOption(option)
}
const initAgeChart = () => {
  const el: HTMLElement = instance?.refs.ageChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let color = ['#00C9F2', '#8C6C4E', '#F39702', '#E3493E', '#005DA7']
  let datas = GenderData.value.data
  datas.forEach(item => {
    if (item.value == 0) {
      item.labelLine = { show: false }
      item.label = { show: false }
    }
  })
  let option = {
    color: color,
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
  myChart?.setOption(option)
}
const initStuChart = () => {
  echart?.registerMap("china", china as any);
  const el: HTMLElement = instance?.refs.stuChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let datas = GenderData.value.dataMap;

  let option = {
    grid: {
      // width: '100%',
      // height: '100%',
      left: '0%',
      right: '0%',
      bottom: '0%',
      containLabel: true
    },
    // 视觉映射组件
    visualMap: {
      type: "continuous",
      min: 0,
      max: 10000,
      realtime: false,
      calculable: false,
      color: ['#B22924', '#E9C5C4'],
      right: '0%',
      text: ['高', '低'],
      itemWidth: 15
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        if(!params.data){
          return 
        }
        let htm = `<div style="width:220px;height:80px;">
          <div>${params.name}</div>
          <div style="display: flex;justify-content: space-between;">
              <div style="margin-left:22px">${params.data.data[0].name}</div>
              <div style="width:33.33%;text-align:center;">${params.data.data[0].value}人</div>
              <div style="width:25%;text-align:right;">${params.data.data[0].rate}</div>
          </div>
          <div style="display: flex;justify-content: space-between; align-items: center;">
            
              <div style="display: flex;justify-content: space-between; align-items: center;">
                <div style="width:12px;height:4px;background:#005DA7;margin-right:10px;"></div>
                ${params.data.data[1].name}
              </div>
              <div style="width:33.33%;text-align:center;">${params.data.data[1].value}人</div>
              <div style="width:25%;text-align:right;">${params.data.data[1].rate}</div>
          </div>
          <div style="display: flex;justify-content: space-between;">
            <div style="display: flex;justify-content: space-between; align-items: center;">
                <div style="width:12px;height:4px;background:#E3493E;margin-right:10px;"></div>
                ${params.data.data[2].name}
              </div>
              <div style="width:33.33%;text-align:center;">${params.data.data[2].value}人</div>
              <div style="width:25%;text-align:right;">${params.data.data[2].rate}</div>
          </div>
          </div>`
        return htm
      }
    },
    series: [
      {
        type: 'map', // 类型
        // 系列名称，用于tooltip的显示，legend 的图例筛选 在 setOption 更新数据和配置项时用于指定对应的系列
        name: '中国地图',
        map: 'china', // 地图类型
        // 是否开启鼠标缩放和平移漫游 默认不开启 如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move' 设置成 true 为都开启
        roam: true,
        // 图形上的文本标签
        label: {
          show: false // 是否显示对应地名
        },
        zoom: 1.2,
        // 地图区域的多边形 图形样式
        itemStyle: {
          // areaColor: '#7B68EE', // 地图区域的颜色 如果设置了visualMap，areaColor属性将不起作用
          borderWidth: 0.5, // 描边线宽 为 0 时无描边
          borderColor: '#E4E7ED', // 图形的描边颜色 支持的颜色格式同 color，不支持回调函数
          borderType: 'solid' // 描边类型，默认为实线，支持 'solid', 'dashed', 'dotted'
        },
        // 高亮状态下的多边形和标签样式
        emphasis: {
          label: {
            show: true, // 是否显示标签
            color: '#fff' // 文字的颜色 如果设置为 'auto'，则为视觉映射得到的颜色，如系列色
          },
          itemStyle: {
            areaColor: '#FFCC00' // 地图区域的颜色
          }
        },
        // 地图系列中的数据内容数组 数组项可以为单个数值
        data: datas
      }
    ]
  };
  myChart?.setOption(option)
}

const initStuPieChart = (val: number | string) => {
  const el: HTMLElement = instance?.refs.stuPieChart as any;
  if(el === undefined){
    return
  }
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let color;
  if (val == 'Source_of_Students') {
    color = ['#f39d12', '#45A0E6',];
  } else {
    color = ['#e3493e', '#317DB8',];
  }
  let datas = GenderData.value.data;
  datas.forEach(item => {
    if (item.value == 0) {
      item.labelLine = { show: false }
      item.label = { show: false }
    }
  })
  let option = {
    color: color,
    legend: {
      show: false,
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
        name: "",
        type: "pie",
        radius: ["55%", "70%"],
        center: ['50%', '50%'],
        labelLine: {
          length: 20,//第一段线长
          length2: 60, //第二段线长
          lineStyle: {
            width: 1,
            type: 'solid',
            color: '#005DA7'
          }
        },
        label: {
          formatter: '{name|{b} }\n\n{zb|{d}%}',
          padding: [0, -60, -5, -60],
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
  myChart?.setOption(option)
}


const rightTitle = computed(() => {
  return (val: string) => {
    switch (val) {
      case 'Gender':
        return "男女比例";
      case 'Age':
        return "年龄构成";
      case 'Source_of_Students':
        return "生源地区";
      case 'nation':
        return "民族分布";
    }

  }
});
const changeData = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  const res = await changeChartData({ ...props.params, ident: isActive.value, category: isClsActive.value })
  if (res.code == 1) {
    let { data, datas2 } = res;
    if (isActive.value != 'Source_of_Students') {
      MajorOption.list = data.series
    }
  }
  loading.close()
}

// console.log(props.params, 'props.params');


const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: isActive }, isActive)
watch(
  dataSource,
  (res: any) => {
    if (res.code != 1) {
      GenderData.value = {
        data: [],
        series: [],
        school: []
      }
      barOption.list = []
      MajorOption.list = []
      switch (isActive.value) {
        case 'Gender':
          nextTick(() => {
            initSexChart();
          })
          break
        case 'Age':
          nextTick(() => {
            initAgeChart();
          })
          break
        case 'Source_of_Students':
          nextTick(() => {
            initStuChart();
            initStuPieChart('Source_of_Students');
          })
          break
        case 'nation':
          nextTick(() => {
            initStuPieChart('nation');
          })
          break
      }
      return
    }
    let { data, datas2 } = res;
    GenderData.value = { ...data, ...datas2 }
    if (isActive.value != 'Source_of_Students') {
      MajorOption.list = data.series
    }
    switch (isActive.value) {
      case 'Gender':
        MajorOption.colorList = [
          {
            color: "#F39D12",
            label: "女性"
          },
          {
            color: "#005DA7",
            label: "男性"
          },
        ]
        nextTick(() => {
          initSexChart();
        })
        break
      case 'Age':
        MajorOption.colorList = [
          {
            color: "#F39D12",
            label: "≤17岁"
          },
          {
            color: "#B22924",
            label: "18岁"
          },
          {
            color: "#00C9F2",
            label: "19岁"
          },
          {
            color: "#8C6C4E",
            label: "20岁"
          },
          {
            color: "#005DA7",
            label: "≥21岁"
          },
        ]
        leftCard.describe = `${datas2.max?.college}·${datas2.max?.grade}·${datas2.max?.sex}`
        leftCard.value = datas2.max?.age
        rightCard.describe = `${datas2.min?.college}·${datas2.min?.grade}·${datas2.min?.sex}`
        rightCard.value = datas2.min?.age
        nextTick(() => {
          initAgeChart();
        })
        break
      case 'Source_of_Students':
        GenderData.value.dataMap = data.data
        barOption.list = datas2.topFive?.data ? datas2.topFive.data : []
        nextTick(() => {
          initStuChart();
          initStuPieChart('Source_of_Students');
        })
        break
      case 'nation':
        MajorOption.colorList = [
          {
            color: "#45A0E6",
            label: "汉族"
          },
          {
            color: "#F39D12",
            label: "少数民族"
          },
        ]
        barOption.list = datas2.topFive.data ? datas2.topFive.data : []
        nextTick(() => {
          initStuPieChart('nation');
        })
        break
    }
  
  }, { immediate: true })


</script>
<style lang="scss" scoped>
@import './index.scss';
</style>