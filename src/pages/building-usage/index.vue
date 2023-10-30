<template>
  <div class="building-usage">
    <!-- <div class="group-trajectory-top sb">
      <div class="top-left sb">
        <el-date-picker format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="changeTime" v-if="isActive == 0"
          v-model="time" type="daterange" unlink-panels range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" size="large" />
        <div v-else>{{ nowTime }}</div>
      </div>
    </div> -->
    <el-form :inline="true" :model="formMapSearch" class="demo-form-inline">
      <el-form-item label="校区：">
        <el-select v-model="formMapSearch.campusName" placeholder="请选择校区" @change="initData">
          <el-option
            v-for="item in optionsCampus"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="楼宇：">
        <el-select v-model="formMapSearch.buildingName" placeholder="请选择楼宇" clearable @change="initData">
          <el-option
            v-for="item in optionsBuilding"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="name">
        <el-date-picker
          v-model="formMapSearch.date as any"
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="shortcuts"
          value-format="YYYY-MM-DD"
          @change="initData"
        />
      </el-form-item>
    </el-form>

    <div class="mapContent sb">
      <div class="top-bar-color"></div>
      <div class="top-bar sb">
        <div class="left sb">
          <div class="select-box sb">
          </div>
          <div class="map-box sb">
            <div class="item" :class="activeMapCls == item.value ? 'activeMapCls' : ''" v-for="item in mapClsList"
              :key="item.value + 'map'" @click="mapClsClick(item.value)">
              <img class="icon" :src="activeMapCls == item.value ? item.iconA : item.icon" alt="">
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>

      <div id="campusLeft" v-show="formMapSearch.campusName === '良乡校区' || formMapSearch.campusName === '全部'" :style="{ width: formMapSearch.campusName === '全部' ? '50%' : '100%' }">
      </div>
      <div class="lineCenter" v-if="formMapSearch.campusName === '全部'"></div>
      <div id="campusRight" v-show="formMapSearch.campusName === '望京校区' || formMapSearch.campusName === '全部'" :style="{ width: formMapSearch.campusName === '全部' ? '50%' : '100%' }">
      </div>

      <div class="msg-box">
        <div class="msg-box-btn column" @click="showMore">
          <el-icon class="icon">
            <DArrowRight v-if="isShowMoreRight" />
            <DArrowLeft v-else />
          </el-icon>
          {{ isShowMoreRight ? '收起' : '展开' }}
        </div>
        <div class="up-box" v-show="isShowMoreRight">
          <div class="center">
            <div class="title">使用情况数据总览</div>
            <div class="center-content">
              <p>暂无数据</p>
              <!-- <p><i class="left-icon"></i><span class="txt">最高访问量在 2022年01月22日，数据撒旦萨达斯</span></p>
              <p><i class="left-icon"></i><span class="txt">访问高峰期在 学期中 和 学期末</span></p> -->
            </div>
          </div>
          <div class="bottom">
            <div class="title">使用情况数据分析</div>
            <div class="center-content">
              <p>暂无数据</p>
              <!-- <p><i class="left-icon"></i><span class="txt">最高访问量在 2022年01月22日，数据撒旦萨达斯</span></p>
              <p><i class="left-icon"></i><span class="txt">访问高峰期在 学期中 和 学期末</span></p> -->
            </div>
          </div>
        </div>
      </div>

      <div class="chart-box">
          <div class="chart-box-btn" @click="showMoreBottom" :style="{'bottom' : isShowMoreBottom ? '267px' : '0'}">
            <el-icon class="icon">
              <DArrowRight v-if="isShowMoreBottom" />
              <DArrowLeft v-else />
            </el-icon>
            {{ isShowMoreBottom ? '收起' : '展开' }}
          </div>
          <!-- <el-row :gutter="20">
            <el-col :span="8">
              <div class="left">
                <div class="box">
                  <div class="title">使用情况数据总览</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8"><div class="center">
                <div class="box">
                  <div class="title">使用情况数据总览</div>
                </div>
              </div></el-col>
            <el-col :span="6"><div class="right">
                <div class="box">
                  <div class="title">使用情况数据总览</div>
                </div>
              </div></el-col>
          </el-row> -->
          <div class="bottom-box" v-show="isShowMoreBottom">
            <div class="left">
              <div class="box">
                <!-- <div class="title">使用情况数据总览</div> -->
                 <div class="line-chart" ref="lineChart"></div>
              </div>
            </div>
            <div class="center">
              <div class="box">
                <div class="chart-title">
                  访问热度变化趋势
                  <div>
                    <el-radio-group v-model="frequency" size="small" @change="initVisitHeat">
                      <el-radio-button :label="0">天</el-radio-button>
                      <el-radio-button :label="1">周</el-radio-button>
                      <el-radio-button :label="2">月</el-radio-button>
                      <el-radio-button :label="3">年</el-radio-button>
                    </el-radio-group>
                  </div>
                </div>
                <div class="line-chart2" ref="lineBarChart"></div>
              </div>
            </div>
            <div class="right">
              <div class="box">
                <div class="chart-title">使用情况数据总览</div>
                <div class="line-chart" ref="wordCloud"></div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, getCurrentInstance } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { getBuildingDatas,getBuildingUsageMap, buildingHeatCompare, trendInVisitHeat } from "@/api/modules/buildingUsage"
import { ProgressConf } from '@/components/common/Search'
import { mapKey } from '@/utils'
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

const dataObj = ref({
  map1:[],
  map2:[],
  hotPosition:[],
})

// 首页搜索的表单
let formMapSearch = reactive<{
  campusName: string
  buildingName: string
  date:Array<string>
}>({
  campusName: '全部',
  buildingName: '全部',
  date:[]
})

// 获取日期
const getDay = (day: number) => {
  let today = new Date();
  let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds); //注意，这行是关键代码
  let tYear = today.getFullYear();
  let tMonth: string | number = today.getMonth();
  let tDate: string | number = today.getDate();
  tMonth = doHandleMonth(tMonth + 1);
  tDate = doHandleMonth(tDate);
  return tYear + "-" + tMonth + "-" + tDate;
}

// 日期加0
const doHandleMonth = (month: string | number) => {
  let m = month;
  if (month.toString().length == 1) {
    m = "0" + month;
  }
  return m;
}

// 楼宇下拉
let optionsBuilding = ref<{
  value: string
  name: string
}[]>([])

// 初始化地图下拉框的数据
const initType = async () => {
  let { data } = await getBuildingDatas();
  if (data) {
    optionsCampus.value = data.campusList
    optionsBuilding.value = data.buildingList
  }
}

// 折柱混合的tab
let frequency = ref(0)

// 日期选择器快捷选择工具
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
]

// 校区下拉
let optionsCampus = ref<{
   value: string
  name: string
}[]>([])

// 地图上方切换
const mapClsList = ref([
  {
    value: 0,
    label: "标记图",
    icon: getImageUrl('bjt'),
    iconA: getImageUrl('bjt-a')
  },
  {
    value: 1,
    label: "热力图",
    icon: getImageUrl('rlt'),
    iconA: getImageUrl('rlt-a')
  },
])

const activeMapCls = ref<string | number>(0)
const behaveCount = ref(0)
const barOption = reactive<ProgressConf>({
  list:[],
  color: '#B22924',
  lableWidth: 0,
  lableAlign: 'center'
})

//  切换标记图和热力图
const mapClsClick = (index: number) => {
  activeMapCls.value = index;
  if (index == 0) {
    initDrop(dataObj.value);
  } else {
    initMapHotData(dataObj.value);
  }
}

let isShowMoreRight = ref(true)
let isShowMoreBottom = ref(true)
let showMore = () => {
  isShowMoreRight.value = !isShowMoreRight.value
}
let showMoreBottom = () => {
  isShowMoreBottom.value = !isShowMoreBottom.value
}

let campusLeftList = ref([])
let campusRightList = ref<any[]>([])
let campusRight: {
setMap(arg0: null): unknown
plugin(arg0: string[], arg1: () => void): unknown
  clearMap(): unknown, remove: (arg0: never[]) => void; add: (arg0: any) => void
}
let campusLeft: {
  clearMap(): unknown, plugin: any, remove: (arg0: never[]) => void; add: (arg0: any) => void
}
let heatmapLeft: {
  setMap(arg0: null): unknown, setDataSet: (arg0: { data: ({ lng: string; lat: string; count: number; currentNum?: undefined } | { lng: string; lat: string; currentNum: null; count: number })[]; max: number }) => void
} | null;
let heatmapRight:  {
  setMap(arg0: null): unknown, setDataSet: (arg0: { data: ({ lng: string; lat: string; count: number; currentNum?: undefined } | { lng: string; lat: string; currentNum: null; count: number })[]; max: number }) => void
} | null;

// 初始化地图
const initMap = () => {
  AMapLoader.load({
    key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.HeatMap", "AMap.moveAnimation"] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then(AMap => {
      AMap.plugin("AMap.MoveAnimation", () => { });
      //DOM初始化完成进行地图初始化
      campusLeft = new AMap.Map("campusLeft", {
        //设置地图容器id
        resizeEnable: true,
        zoom: 17.3, //初始化地图级别
        zooms: [17.3, 18], //缩放范围
        center: [116.18, 39.74] //初始化地图中心点位置
      });
      campusRight = new AMap.Map("campusRight", {
        //设置地图容器id
        resizeEnable: true,
        zoom: 18.9, //初始化地图级别
        zooms: [17.3, 18], //缩放范围
        center: [116.4780, 39.9813] //初始化地图中心点位置
      });
      //初始化heatmap对象
      initData()
    })
    .catch(e => {
      console.log(e);
    });
}

const param = ref({})

// 初始化数据
const initData = async () => {
  let params = {
    campusName: formMapSearch.campusName || '全部',
    buildingName: formMapSearch.buildingName || '全部',
    startTime: formMapSearch.date.length > 0 ?  formMapSearch.date[0] : getDay(-6),
    endTime:  formMapSearch.date.length > 0 ?  formMapSearch.date[1] : getDay(0),
  }
  param.value = params;
  let res = await getBuildingUsageMap(params);
  if(res.code == 1){
    let {data} = res;
    dataObj.value = data;
    behaveCount.value = data.behaveCount;
    if (activeMapCls.value == 0) {
      initDrop(data);
    } else {
      initMapHotData(data);
    }
    initHeatCompareChart(data.behaveTypeList);
    barOption.list = [];
    data.noBehave.forEach((item: { rate: any; name: any }) => {
      let obj = {
        name:'',
        ratio:item.rate,
        value:item.name,
      }
      barOption.list.push(obj)
    });

  }
}

// 标记图
const initDrop = (data: {
  map1: { name: string; count: any; lng: any; lat: any }[],
  map2: { name: string; count: any; lng: any; lat: any }[]
})=>{
  campusLeft.clearMap();
  campusRight.clearMap();
  if (heatmapLeft != null) {
    heatmapLeft.setMap(null);
  }
  if (heatmapRight != null) {
    heatmapRight.setMap(null);
  }
  if(data && data.map1){
    data.map1.forEach((itm: { name: string; count: any;  lng: any; lat: any; }) => {
      let backHtml = ''
      if (itm.count<500) {
        backHtml = '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#FC9F1A, #F7B733);">'
      } else {
        backHtml = '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#e92a2a, #ec423f);">'
      }
      const markerContent = backHtml +
        `<span>${itm.count}</span>人次` +
        '</div>' +
        '</div>';
      const position = new window.AMap.LngLat(itm.lng, itm.lat); // Marker经纬度
      let marker = new window.AMap.Marker({
        position: position,
        content: markerContent, // 将 html 传给 content
        offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
      });

      campusLeft.add(marker);
      campusLeftList.value.push(marker as never)

    });
  }
  if(data && data.map2){
    data.map2.forEach((itm: { name: string; count: any;  lng: any; lat: any; }) => {
      let backHtml = ''
      if (itm.count<500) {
        backHtml = '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#FC9F1A, #F7B733);">'
      } else {
        backHtml = '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#e92a2a, #ec423f);">'
      }
      const markerContent = backHtml +
        `<span>${itm.count}</span>人次` +
        '</div>' +
        '</div>';
      const position = new window.AMap.LngLat(itm.lng, itm.lat); // Marker经纬度
      let marker = new window.AMap.Marker({
        position: position,
        content: markerContent, // 将 html 传给 content
        offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
      });

      campusRight.add(marker);
      campusRightList.value.push(marker as never)
    });
  }
}

// 热力图
const initMapHotData = (data: {
  map1: { name: string; count: any; lng: any; lat: any }[],
  map2: { name: string; count: any; lng: any; lat: any }[]
}) => {

  campusLeft.clearMap();
  campusRight.clearMap();

  if (heatmapLeft != null) {
    heatmapLeft.setMap(null);
  }
  campusLeft.plugin(["AMap.HeatMap"], function () {      //加载热力图插件
    heatmapLeft = new window.AMap.HeatMap(campusLeft, {
      radius: 40, //给定半径
      opacity: [0.1, 1],
      gradient: {
        0.1: "blue",
        0.2: "blue",
        0.4: "green",
        0.6: "yellow",
        1.0: "red"
      }
    });    //在地图对象叠加热力图
    heatmapLeft?.setDataSet({ data: data.map1, max: 100 }); //设置热力图数据集
    //具体参数见接口文档
  });
  if (heatmapRight != null) {
    heatmapRight.setMap(null);
  }
  campusRight.plugin(["AMap.HeatMap"], function () {      //加载热力图插件
    heatmapRight = new window.AMap.HeatMap(campusRight, {
      radius: 40, //给定半径
      opacity: [0.1, 1],
      gradient: {
        0.1: "blue",
        0.2: "blue",
        0.4: "green",
        0.6: "yellow",
        1.0: "red"
      }
    });    //在地图对象叠加热力图
    heatmapRight?.setDataSet({ data: data.map2, max: 100 }); //设置热力图数据集
    //具体参数见接口文档
  });

}


// 下方第一个图表
let initHeatCompare = async () => {
  let { data } = await buildingHeatCompare();
  if (data) {
    initHeatCompareChart(data)
  }
}

// 中间折柱混合
let initVisitHeat = async (val:any) => {
  let { data } = await trendInVisitHeat(val || 0);
  if (data) {
    initVisitHeatChart(data)
  }
}

// 楼宇访问热度对比图表
const initHeatCompareChart = (data:any) => {
  const el: HTMLElement = instance?.refs.lineChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let seriesList: any[] = []
   data.series.forEach((e:any) => {
     seriesList.push({...e, type: 'line',
      smooth: true,
    })
   });
  let option = {
    // 标题
    title: {
      text: '楼宇访问热度对比',
      textStyle: {
        fontSize: 16,
        color: '#203449',
        fontFamily: 'SemiBold',
        // fontWeight:600
      },
      left: 15,
      top:15
    },
    grid: {
      top: 50,
      bottom:30
    },
    legend: {
      icon: 'rect',
      itemHeight: 5,
      itemWidth: 12,
      data:data.yAxis,
      right: 20,
      top: 15,
      type: 'scroll',
      width:'60%'
    },
    // 横坐标
    xAxis: {
      type: 'category',
      data: data.xAxis,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        color: '#E0E0E0'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#E0E0E0'
        }
      }
    },
    series: seriesList
  };
  myChart?.setOption(option);
}

// 词云图图表
const initWordCloudChart = (list: []) => {
  const el: HTMLElement = instance?.refs.wordCloud as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let option = {
    series: [{
      type: 'wordCloud',
      sizeRange: [14,22],
      rotationRange: [0, 0],
      rotationStep: 45,
      gridSize: 10,
      shape: 'diamond',
      left: '-14%',
      top: 'center',
      width: '100%',
      height: '100%',
      data: [{ value: 3, name: "暂无数据" }]
    }]
  };
  myChart?.setOption(option);
}

// 访问热度图表
const initVisitHeatChart = (data: any) => {
  const el: HTMLElement = instance?.refs.lineBarChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }

  let option = {
    legend: {
      data: data.yAxis,
      right: 50,
      top:6,
      itemHeight: 5,
      itemWidth: 12,
    },
    grid: {
      top: 50,
      bottom:36
    },
    xAxis: [
      {
        type: 'category',
        data: data.xAxis,
        axisPointer: {
          type: 'shadow'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '单位/人次',
        axisLine: {
          show: true,
          color: '#E0E0E0'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#E0E0E0'
          }
        },
        nameTextStyle: {
        }
      },
      {
        type: 'value',
        name: '单位/人',
        interval: 20,
        axisLine: {
          show: true,
          color: '#E0E0E0'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#E0E0E0'
          }
        }
      }
    ],
    series: [
      {
        name: '访问人次',
        type: 'bar',
        data: data.series[0] ? data.series[0].data : []
      },
      {
        name: '访问人数',
        type: 'line',
        yAxisIndex: 1,
        data: data.series[1] ? data.series[1].data : []
      }
    ]
  };
  myChart?.setOption(option);
}

onMounted(() => {
  initType()
  initMap();
  initHeatCompare()
  initVisitHeat(0)
  initWordCloudChart([]);
})

</script>

<style lang="scss" scoped>
@import './index.scss';

:deep(.custom-btn:active) {
  color: #ffffff;
  border-color: #004e8d;
  background-color: #004e8d;
}

:deep(.custom-btn) {
  color: #ffffff;
  border: 1px solid #005da7;
  background: #005da7;
}
</style>