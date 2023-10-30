<template>
  <div class="consumption-situation_panle-container" :style="{ flexDirection: direction === 'horizontal' ? 'row' : 'column' }">

    <!-- 左侧 -->
    <div class="left-container">
      <div class='sb container-title' :class="ActivePanle === 'Consumption_place' ? 'half-width' : ''">
        <c-title title="基本信息画像" />
        <RedTab :btnList="PanleList" :isActive="ActivePanle" @RedTabChange="OnPanleChange" />
      </div>

      <template v-if="ActivePanle === 'dissipate'">
        <div class="chart-box">
          <div class="chart" ref="FrequencyDOM"></div>
        </div>
        <div class='time-slot'>
          <span>早餐</span>
          <span>午餐</span>
          <span style="transform: translateX(64px);">晚餐</span>
          <span>夜宵</span>
        </div>
        <div class='text'>各时段消费次数变化趋势</div>
      </template>

      <template v-else-if="ActivePanle === 'Consumption_amount_2'">
        <ul class="card-list">
          <li class="card-item" v-for="value, key in ColorCards" :key="key" :style="value.style">
            <div class="icon"><img :src="value.icon"></div>
            <div class="main">
              <p class="title">{{ value.title }}</p>
              <p class="value"> {{ value.value == '0' ? 0 : (value.value || '-') }}<span>{{ value.unit }}</span> </p>
              <p class="describe" v-if="value.describe">
                {{ value.describe }}<span class="percentage">{{ value.percentage }}</span>
              </p>
            </div>
          </li>
        </ul>
      </template>

      <template v-else-if="ActivePanle === 'Consumption_place'">
        <div class='Consumption_place_box'>
          <div class="fixed-tool">
            <RedTab class="campus-list" :btnList="CampusList" :isActive="ActiveCampus" @RedTabChange="OnCampusChange" />
            <TimeScale @select-time="onSelectTime" :TimeScale="TimeScales"></TimeScale>
          </div>
          <!-- 地图盒子 -->
          <div class="map-box" style="min-width: 1400px; overflow-x: auto;">
            <div class="left-map" ref="LeftMapDOM"></div>
            <template v-if="!ActiveCampus">
              <div class="right-map" ref="RightMapDOM"></div>
              <div class="separate-bar"></div>
            </template>
            <!-- 颜色条 -->
            <div class='color-bar'>
              <div>高</div>
              <div class='color'></div>
              <div>低</div>
            </div>
            <!-- 固定面板 -->
            <div class='fixed-panle'>
              <div class="fixed-panle-content">
                <c-title title='热门就餐地点分析' />
                <el-checkbox v-model="firstCheckbox" @change="OnFirstCheckboxChange">全部</el-checkbox>
                <el-checkbox-group style="display: inline-block;margin-left: 20px;" v-model="PopularTimes" @change="OnOtherCheckboxChange">
                  <el-checkbox label="breakfast">早餐</el-checkbox>
                  <el-checkbox label="lunch">午餐</el-checkbox>
                  <el-checkbox label="dinner">晚餐</el-checkbox>
                </el-checkbox-group>
                <div class="text"><span v-for="e, i in TopThree" :key="i">{{ e.name }} {{ i === TopThree.length - 1 ? "" : "、" }}</span></div>
                <ProgressBar class="progress" :option="PopularLocation" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="ActivePanle === 'Consumption_frequency'">
        <div class="card-box sb">
          <ColorCard :cardConfig="e" v-for="e, i in FrequencyCzrds" :key="i" @click="OnCardClick" class="pointer" />
        </div>
        <div class="chart-box">
          <RedTab :btnList="LineChartTyps" :isRed="true" :isActive="ActiveLineType" @RedTabChange="OnLineChartTypChange" class="tool-bar" />
          <div class="chart" ref="ThreeMealsDOM"></div>
        </div>
        <div class='text'>三餐消费人数变化趋势</div>
      </template>

      <template v-else>
        <div class="inline-block">
          <RedTab :btnList="BarChartTyps" :isRed="true" :isActive="ActiveBarType" @RedTabChange="onActiveBarTypeChange" />
        </div>
        <div class="top-item">
          <div class="title-box sb">
            <div class="c-title half">消费总金额差异</div>
            <div class="c-title half">餐均消费差异</div>
          </div>
          <div class="chart-box sb fill-height">
            <div class="chart-item" style="height: 200px;" ref="ThreeMealsAverage"></div>
            <div class="chart-item" style="height: 200px;" ref="ThreeMealsTotal"></div>
          </div>
        </div>
        <div class="bottom-item">
          <div class="c-title">三餐规律性</div>
          <div class="chart-box fill-height">
            <div class="chart" ref="ThreeMealsDiff"></div>
          </div>
        </div>
        <WarningSeal :name="barName" :ident="ActiveBarType" />
      </template>
    </div>

    <!-- 右侧 -->
    <div class="right-container" v-if="ActivePanle !== 'Consumption_place' && $attrs.view !== 'left'">
      <c-title title="特征分析" />
      <div class="right-main">

        <template v-if="ActivePanle === 'dissipate'">
          <div class="left-item" style="height: 290px;">
            <div class="c-title">消费时段分析</div>
            <div class="card-content vertical">
              <CustomCard :cardConfig="EarliestCard" />
              <CustomCard :cardConfig="LatestCard" />
            </div>
          </div>
          <div class="right-item" style="height: 290px;">
            <div class="c-title">三餐消费时段</div>
            <ul class="specific-strip fill-height">
              <li class="specific-item" v-for="value, key in TimesSlot" :key="key">
                <span class="title" style="background: #45A0E6;">{{ value.name }}</span>
                <div class="message">
                  <p>主要消费时段<span>{{ " " + value.time + " " }}</span></p>
                </div>
              </li>
            </ul>
          </div>
          <div class="text" style="float: left;">
            <p>主消费时段<span v-for="value, key in TimesSlot" :key="key">{{ " " + value.time + " " }}</span>辅消费时段<span>{{ " " + assistTime + " " }}</span></p>
          </div>
        </template>

        <template v-else-if="ActivePanle === 'Consumption_amount_2'">
          <div class="top-item" style="height: 250px;">
            <div class="c-title">平均消费水平</div>
            <div class="card-list self-adaption">
              <CustomCard :cardConfig="item" v-for="item, index in LevelCards" :key="index" />
            </div>
            <div class="text">学生人均食堂月消费 <span>{{ LevelText.monthMoney }}</span>元 日消费 <span>{{ LevelText.dayMoney }}</span>次消费 <span>{{ LevelText.timeMoney }}</span> 元</div>
          </div>
          <div class="bottom-item" style="height: 250px;">
            <div class="c-title">男女消费差异</div>
            <div class="self-adaption chart-box">
              <div class="chart" ref="DifferPieDOM"></div>
            </div>
            <div class="text">男性学生人均日消费<span> {{ LevelText.male }}</span> 元 女性学生人均日消费<span> {{ LevelText.female }}</span>元</div>
          </div>
        </template>

        <template v-else-if="ActivePanle === 'Consumption_frequency'">
          <div class="chart-item">
            <div class="c-title">消费频次分析</div>
            <div class="chart-box">
              <div class="chart" ref="MultiplePie"></div>
            </div>
            <div class="separate">
              <span>早餐</span>
              <span>午餐</span>
              <span>晚餐</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="top-item">
            <div class="c-title">消费水平差异</div>
            <ul class="specific-strip fill-height">
              <li class="specific-item">
                <span class="title" style="background: #45A0E6;">最高</span>
                <div class="message">
                  <p>消费水平最高年级 <span> {{ RegularityLevel.level1 }}</span> 月均消费 <span> {{ RegularityLevel.money1 }} </span> 元</p>
                </div>
              </li>
              <li class="specific-item">
                <span class="title" style="background: #B22924;">最低</span>
                <div class="message">
                  <p>消费水平最低年级 <span> {{ RegularityLevel.level2 }}</span> 月均消费 <span> {{ RegularityLevel.money2 }} </span> 元</p>
                </div>
              </li>
            </ul>
          </div>
          <div class="bottom-item">
            <div class="c-title">三餐规律性差异</div>
            <ul class="specific-strip fill-height">
              <li class="specific-item">
                <span class="title" style="background: #45A0E6;">规律</span>
                <div class="message">
                  <p>三餐规律性最好 <span>{{ RegularityLevel.law1 }}</span></p>
                </div>
              </li>
              <li class="specific-item">
                <span class="title" style="background: #B22924;">不规律</span>
                <div class="message">
                  <p>三餐规律性最差 <span>{{ RegularityLevel.law2 }}</span></p>
                </div>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
    <WarningSeal :name="panleName" :ident="ActivePanle" />
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, getCurrentInstance, computed, inject, watch, onUnmounted, toRefs, nextTick, defineAsyncComponent } from "vue";
import { CheckboxValueType, ElLoading } from 'element-plus'
import { BaseParams } from "../../types";
import TimeScale from "@/components/common/TimeScale.vue";
import { usePortraitRequest } from "@/hooks";
import { changeChartData } from "@/api/modules/studentPortrait";
import { getImageUrl, getImage, getiGradientColor } from "@/utils";
import "../index.scss";
import AMapLoader from "@amap/amap-jsapi-loader";
import ColorCard from "./ColorCard.vue";
import RedTab from "@/components/common/RedTab.vue";
import CustomCard from "@/components/common/CustomCard.vue";
import ProgressBar from "@/components/common/ProgressBar.vue";
import { getLineOptions, LineCinfig, getMultiplePieOptions, getLawDiffBarOptions, LawDiffBar, getDiffPieOptions, TwoPieCinfig } from "../chart";
import { getNowHoursMinutes } from "@/utils/index";
import { userStore } from "@/store/user";
const WarningSeal = defineAsyncComponent({
  loader: () => import('@/components/WarningSeal'),
  delay: 1000
})
const store = userStore()
const emit = defineEmits(['OpenWindow'])
const params = inject<BaseParams>("params")
const props = withDefaults(defineProps<{
  selectList: any[],
  // isActive?: string,
  direction?: 'horizontal' | 'vertical',
}>(), {
  selectList: [
    { value: "dissipate", label: "消费时间" },
    { value: "Consumption_amount_2", label: "消费金额" },
    { value: "Consumption_place", label: "消费地点" },
    { value: "Consumption_frequency", label: "消费频次" },
    { value: "differenice_grade", label: "消费差异性" },
  ] as any,
  direction: 'horizontal',
})

const defalutBarChartTyps = [
  {
    value: "differenice_grade",
    label: "年级差异",
  },
  {
    value: "differenice_sex",
    label: "性别差异",
  },
  {
    value: "differenice_poor",
    label: "贫困差异",
  }
]

const Ident = ref(props.selectList[0].value as string)


// 面板切换
const ActivePanle = ref(props.selectList[0].value as string);
const PanleList = reactive(props.selectList);
const panleName = computed(() => PanleList.find(i => i.value === ActivePanle.value).label)
const barName = computed(() => BarChartTyps.value.find((i: { value: any; }) => i.value === ActiveBarType.value).label)
const HoursMinutes = ref("")

const BarChartTyps = computed(() => {
  return PanleList.find(i => i.value === ActivePanle.value)?.children || defalutBarChartTyps
})
const ActiveBarType = ref(BarChartTyps.value ? BarChartTyps.value[0].value : "differenice_grade")

const OnPanleChange = (value: string) => {
  if (value === "Consumption_place") {
    HoursMinutes.value = getNowHoursMinutes().join(":")
  }
  ActivePanle.value = value
  ActiveCampus.value = ""
  Ident.value = value
};
const type = inject<'left' | 'right'>('vscmType')
watch(ActivePanle, v => {
  if (v === 'Consumption_place') nextTick(() => type && store.updateVsViewDirection(type, true))
  else nextTick(() => type && store.updateVsViewDirection(type, false))
}, { immediate: true })

onUnmounted(() => {
  type && store.updateVsViewDirection(type, false)
})

const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

// 消费时间
const FrequencyDOM = ref();
let FrequencyChart: any = null;
const DrawLineChart = (config: LineCinfig) => {
  const el: HTMLElement = FrequencyDOM.value;
  if (FrequencyChart) { FrequencyChart.dispose() }
  FrequencyChart = echart?.init(el);
  FrequencyChart.setOption(getLineOptions(config, "次", true, false));
};

const EarliestCard = reactive({
  width: "280px",
  height: "80px",
  color: "#1B528B",
  title: "就餐最早时间",
  value: "",
  isUnit: false,
  describe: "",
  fontSize: "22px",
});

const LatestCard = reactive({
  width: "280px",
  height: "80px",
  color: "#F39702",
  title: "就餐最晚时间",
  value: "",
  isUnit: false,
  describe: "",
  fontSize: "22px",
});

const TimesSlot = reactive({
  morning: {
    name: "早餐",
    time: ""
  },
  noon: {
    name: "午餐",
    time: ""
  },
  evening: {
    name: "晚餐",
    time: ""
  }
})

const assistTime = ref("")


// 消费金额
const ColorCards = reactive({
  canteenMoney: {
    icon: getImage("card-image/consumption/0.svg"),
    title: "食堂消费总金额",
    value: "-",
    unit: "万元",
    describe: "在所有消费类型中占",
    percentage: "",
    style: {
      backgroundImage: `url(${getImage("card-image/consumption/total-amount.svg")})`,
    },
  },
  consumeCount: {
    icon: getImage("card-image/consumption/1.svg"),
    title: "消费次数",
    value: "-",
    unit: "万次",
    describe: "",
    percentage: "",
    style: {
      backgroundImage: `url(${getImage("card-image/consumption/number-of-times.svg")})`,
    },
  },
  userCount: {
    icon: getImage("card-image/consumption/2.svg"),
    title: "消费人数",
    value: "-",
    unit: "人",
    describe: "",
    percentage: "",
    style: {
      backgroundImage: `url(${getImage("card-image/consumption/number-of-people.svg")})`,
    },
  },
  avgDateMoney: {
    icon: getImage("card-image/consumption/3.svg"),
    title: "日均消费",
    value: "-",
    unit: "元",
    describe: "",
    percentage: "",
    style: {
      backgroundImage: `url(${getImage("card-image/consumption/average-per-day.svg")})`,
    },
  },
  avgTimeMoney: {
    icon: getImage("card-image/consumption/4.svg"),
    title: "次均消费",
    value: "-",
    unit: "元",
    describe: "",
    percentage: "",
    style: {
      backgroundImage: `url(${getImage("card-image/consumption/secondary-mean.svg")})`,
    },
  },
  avgUserMoney: {
    icon: getImage("card-image/consumption/5.svg"),
    title: "人均消费",
    value: "-",
    unit: "元",
    describe: "",
    percentage: "",
    style: {
      backgroundImage: `url(${getImage("card-image/consumption/per-capita.svg")})`,
    },
  },
});
const LevelCards = reactive({
  maxCost: {
    width: "280px",
    height: "80px",
    color: "#1B528B",
    title: "最高人均月消费",
    value: "-",
    isUnit: true,
    unit: "元",
    describe: "",
    fontSize: "22px",
  },
  minCost: {
    width: "280px",
    height: "80px",
    color: "#F39702",
    title: "最低人均月消费",
    value: "-",
    isUnit: true,
    unit: "元",
    describe: "",
    fontSize: "22px",
  },
  maxTime: {
    width: "280px",
    height: "80px",
    color: "#B22924",
    title: "最高单次消费",
    value: "-",
    isUnit: true,
    unit: "元",
    describe: "",
    fontSize: "22px",
  },
  minTime: {
    width: "280px",
    height: "80px",
    color: "#45A0E6",
    title: "最低单次消费",
    value: "-",
    isUnit: true,
    unit: "元",
    describe: "",
    fontSize: "22px",
  },
});
const LevelText = reactive({
  dayMoney: 0,
  monthMoney: 0,
  timeMoney: 0,
  male: 0,
  female: 0
})
const DifferPieDOM = ref();
let DifferPieChart: any = null
const DrawDifferPieChart = (config: TwoPieCinfig) => {
  const el: HTMLElement = DifferPieDOM.value;
  if (DifferPieChart) {
    DifferPieChart.dispose()
  }
  DifferPieChart = echart?.init(el);
  DifferPieChart.setOption(getDiffPieOptions(config));
};


// 消费地点
const CampusList = reactive([{ value: "", label: "全校" }, { value: "良乡校区", label: "良乡校区" }, { value: "望京校区", label: "望京校区" }]);
const ActiveCampus = ref("");
const OnCampusChange = (value: string) => ActiveCampus.value = value

const TimeScales = [
  {
    label: "06:00",
    value: 6,
    color: "",
    alias: "",
  },
  {
    label: "07:00",
    value: 7,
    color: "#45A0E6",
    alias: "",
  },
  {
    alias: "早餐",
    label: "08:00",
    value: 8,
    color: "#45A0E6",
  },
  {
    label: "09:00",
    value: 9,
    color: "#45A0E6",
    alias: "",
  },
  {
    label: "10:00",
    value: 10,
    color: "",
    alias: "",
  },
  {
    label: "11:00",
    value: 11,
    color: "#45A0E6",
    alias: "",
  },
  {
    alias: "午餐",
    label: "12:00",
    value: 12,
    color: "#45A0E6",
  },
  {
    label: "13:00",
    value: 13,
    color: "#45A0E6",
    alias: "",
  },
  {
    label: "14:00",
    value: 14,
    color: "",
    alias: "",
  },
  {
    label: "15:00",
    value: 15,
    color: "",
    alias: "",
  },
  {
    label: "16:00",
    value: 16,
    color: "",
    alias: "",
  },
  {
    label: "17:00",
    value: 17,
    color: "",
    alias: "",
  },
  {
    label: "18:00",
    value: 18,
    color: "#45A0E6",
    alias: "",
  },
  {
    alias: "晚餐",
    label: "19:00",
    value: 19,
    color: "#45A0E6",
  },
  {
    label: "20:00",
    value: 20,
    color: "#45A0E6",
    alias: "",
  },
  {
    label: "21:00",
    value: 21,
    color: "#45A0E6",
    alias: "",
  },
  {
    label: "22:00",
    value: 22,
    color: "#45A0E6",
    alias: "",
  },
  {
    label: "23:00",
    value: 23,
    color: "",
    alias: "",
  },
];

const PopularLocation = reactive({
  list: [] as any[],
  color: "#005DA7",
  lableWidth: 90,
  valueWidth: 70,
  lableAlign: "left",
  valuePosition: "right",
  unit: "次",
  needTag: true,
  height: "calc(100% - 86px)"
});

const TopThree = computed(() => PopularLocation.list.slice(0, 3))
const LeftMapDOM = ref();
const RightMapDOM = ref();
let LeftMapChart: any = null;
let RightMapChart: any = null;
let MapInstance: any = null
const DrawMapChart = (chartData: any) => {
  if (MapInstance) {
    const left: HTMLElement = LeftMapDOM.value;
    LeftMapChart?.destroy()
    LeftMapChart = new MapInstance.Map(left, {
      resizeEnable: true,
      zoom: 18.9,
      zooms: [17.3, 18],
      center: [116.18, 39.74],
    });
    setMarker(LeftMapChart, chartData.map1)
    if (ActiveCampus.value === "" || ActiveCampus.value === "") {
      RightMapChart?.destroy()
      const right: HTMLElement = RightMapDOM.value;
      RightMapChart = new MapInstance.Map(right, {
        resizeEnable: true,
        zoom: 18.9,
        zooms: [17.3, 18],
        center: [116.4780, 39.9813]
      });
      setMarker(RightMapChart, chartData.map2)
    }
  } else {
    AMapLoader.load({
      key: "0efc8c6fe4432f09ed9996dd40645a6b",
      version: "2.0",
      plugins: ["AMap.HeatMap", "AMap.moveAnimation"],
    }).then((AMap) => {
      AMap.plugin("AMap.MoveAnimation", () => { });
      MapInstance = AMap
      DrawMapChart(chartData)
    }).catch((e) => {
      console.log(e);
    });
  }
};

// 添加标记物
const setMarker = (chart: any, data: any[]) => {
  chart.clearMap()
  const Max = Math.max(...data.map(e => e.value))
  data.forEach(item => {
    const color = getiGradientColor("D18E8E", "#B22924", item.value / Max)
    const content = `<div class='map-marker' >
          <svg class='bgImg' width="50px" height="75px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-691.000000, -773.000000)" fill="${color}" fill-rule="nonzero">
                      <g id="编组" transform="translate(691.502246, 773.000000)">
                          <path d="M24.5157238,58.5126923 C11.1634099,58.5126923 0,61.139377 0,65.2982945 C0,69.4572119 11.1634099,72.7405678 24.5157238,72.7405678 C37.8680376,72.7405678 48.155886,69.4572119 48.155886,65.2982945 C48.155886,61.3582674 37.8680376,58.5126923 24.5157238,58.5126923 Z" id="路径" fill-opacity="0.3"></path>
                          <path d="M24.3451825,0 C11.1814018,0 0.497753746,10.6836481 0.497753746,24.0382082 C0.497753746,30.9062676 2.7871069,36.4388711 6.22113664,41.2083569 C12.5168578,49.2210929 18.4310202,57.4246084 24.1544031,65.8189033 C30.6409037,57.6153878 36.7458454,49.4118723 42.2784489,41.3991363 C47.0479346,34.149518 48.0018318,30.5247088 48.0018318,24.0382082 C48.1926112,10.6836481 37.5089631,0 24.3451825,0 Z" id="路径"></path>
                      </g>
                  </g>
              </g>
          </svg>
            <span>${item.value}次</span>
            <div class='bottom-box'>${item.name}</div> 
          </div>`
    const position = new window.AMap.LngLat(item.lng, item.lat);
    let marker = new window.AMap.Marker({
      position: position,
      content: content,
      offset: new window.AMap.Pixel(-13, -30)
    });
    chart.add(marker);
  });
}

const PopularTimes = ref<string[]>([]);
const firstCheckbox = ref(false)
const typeName = ref("all")
const OnFirstCheckboxChange = (value: CheckboxValueType) => {
  if (value) {
    PopularTimes.value = ["breakfast", "lunch", "dinner"]
  } else {
    PopularTimes.value = []
  }
  UpdateHotData()
}

const OnOtherCheckboxChange = (values: CheckboxValueType[]) => {
  if (values.length === 3) {
    firstCheckbox.value = true
  } else {
    firstCheckbox.value = false
  }
  UpdateHotData()
}

const UpdateHotData = async () => {
  typeName.value = firstCheckbox.value ? "all" : PopularTimes.value.join(",")
  try {
    const { list } = await GetDataByCategory(ActiveCampus.value, { timePoint: "", typeName: typeName.value })
    if (list && Array.isArray(list)) {
      PopularLocation.list = list.map(item => {
        item.rate = 90
        return item
      })

    }
  } catch (error) {
  }
}

const onSelectTime = async (time: string) => {
  HoursMinutes.value = time
  try {
    const chartData = await GetDataByCategory(ActiveCampus.value, { timePoint: HoursMinutes.value })
    if (ActiveCampus.value === "") {
      setMarker(LeftMapChart, chartData.map1);
      setMarker(RightMapChart, chartData.map2);
    } else {
      setMarker(LeftMapChart, chartData.map1);
    }
  } catch (error) {
  }
}

// 消费频次
const LineChartTyps = reactive([{ value: "按日", label: "按日" }, { value: "按月", label: "按月" }]);
const ActiveLineType = ref("按日");
const OnLineChartTypChange = async (value: string) => {
  ActiveLineType.value = value
  try {
    const chartData = await GetDataByCategory(value)
    DrawThreeMealsLine(chartData);
  } catch (error) {
  }
};

const FrequencyCzrds = reactive({
  breakfast: {
    color: "#1B528B",
    top: "早餐频次",
    middle: "",
    bottom: "",
    middleUnit: "人",
    bottomUnit: "人次",
    icon: getImageUrl("swzsc"),
    width: "220px",
    height: "110px"
  },
  lunch: {
    color: "#B22924",
    top: "午餐频次",
    middle: "",
    bottom: "",
    middleUnit: "人",
    bottomUnit: "人次",
    icon: getImageUrl("swzsc"),
    width: "220px",
    height: "110px"
  },
  dinner: {
    color: "#45A0E6",
    top: "晚餐频次",
    middle: "",
    bottom: "",
    middleUnit: "人",
    bottomUnit: "人次",
    icon: getImageUrl("swzsc"),
    width: "220px",
    height: "110px"
  }
})

const ThreeMealsDOM = ref()
let ThreeMealsChart: any = null
const DrawThreeMealsLine = (config: LineCinfig) => {
  const el: HTMLElement = ThreeMealsDOM.value;
  if (ThreeMealsChart) { ThreeMealsChart?.dispose() }
  ThreeMealsChart = echart?.init(el)
  ThreeMealsChart.setOption(getLineOptions(config, "人", false, true));
}

const MultiplePie = ref()
let MultiplePieChart: any = null
const DrawMultiplePie = (config: any) => {
  const el: HTMLElement = MultiplePie.value;
  if (el === undefined) {
    return
  }
  if (MultiplePieChart) { MultiplePieChart.dispose() }
  MultiplePieChart = echart?.init(el)
  MultiplePieChart.setOption(getMultiplePieOptions(config, el.offsetWidth));
}

const OnCardClick = () => {
  const list = [{ prop: 'breakfastCount', label: '早餐', width: '100' }, { prop: 'lunchCount', label: '午餐', width: '100' }, { prop: 'dinnerCount', label: '晚餐', width: '100' }];
  emit("OpenWindow", "个人食堂消费频次", list, ActivePanle.value)
}

// 消费差异性
const onActiveBarTypeChange = async (value: string) => {
  ActiveBarType.value = value
  Ident.value = value
  // try {
  //   const chartData = await GetDataByCategory(value)
  //   DrawBarThreeMealsDiff(chartData);
  // } catch (error) {
  // }
}

const RegularityLevel = reactive({
  law1: "",
  law2: "",
  level1: "",
  level2: "",
  money1: "",
  money2: "",
})
const ThreeMealsAverage = ref()
const ThreeMealsTotal = ref()
const ThreeMealsDiff = ref()
let ThreeMealsAverageChart: any = null
let ThreeMealsTotalChart: any = null
let ThreeMealsDiffChart: any = null
const DrawBarThreeMealsDiff = (config: any) => {
  const el1: HTMLElement = ThreeMealsAverage.value;
  const el2: HTMLElement = ThreeMealsTotal.value;
  const el3: HTMLElement = ThreeMealsDiff.value;

  if (ThreeMealsAverageChart) { ThreeMealsAverageChart.dispose() }
  if (ThreeMealsTotalChart) { ThreeMealsTotalChart.dispose() }
  if (ThreeMealsDiffChart) { ThreeMealsDiffChart.dispose() }

  ThreeMealsAverageChart = echart?.init(el1);
  ThreeMealsTotalChart = echart?.init(el2);
  ThreeMealsDiffChart = echart?.init(el3);

  const Config1: LawDiffBar = { series: config.costSeries, legend: config.costLegend, Axis: config.costyAxis }
  const Config2: LawDiffBar = { series: config.avgSeries, legend: config.avgLegend, Axis: config.avgyAxis }
  const Config3: LawDiffBar = { series: config.lawSeries, legend: config.lawLegend, Axis: config.lawyAxis }
  ThreeMealsAverageChart.setOption(getLawDiffBarOptions(Config1, 1));
  ThreeMealsTotalChart.setOption(getLawDiffBarOptions(Config2, 2));
  ThreeMealsDiffChart.setOption(getLawDiffBarOptions(Config3, 3));
}


// 通过类型获取数据
const GetDataByCategory = async (category: string, other?: object) => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    const { code, data, msg } = await changeChartData({ ...params!, ident: ActivePanle.value, category: category, ...(other || {}) })
    if (code) {
      return data
    } else {
      return Promise.reject(msg)
    }
  } catch (error) {
    return Promise.reject(error)
  } finally {
    loading.close()
  }
}

// 更新数据
const updateData = (result: any) => {
  if (!result.code) {
    return
  }

  const { data: { chartData, totalMap }, datas2 } = result
  const active = ActivePanle.value
  // 处理图表
  if (active == "dissipate") {
    DrawLineChart(chartData);
    EarliestCard.value = datas2.earlyTime.time
    EarliestCard.describe = datas2.earlyTime.date
    LatestCard.value = datas2.lateTime.time
    LatestCard.describe = datas2.lateTime.date
    TimesSlot.morning.time = datas2.breakfaseTime
    TimesSlot.noon.time = datas2.lunchTime
    TimesSlot.evening.time = datas2.dinnerTime
    assistTime.value = datas2.supperTime
  } else if (active == "Consumption_amount_2") {
    ColorCards.canteenMoney.percentage = (chartData.rate || '-') + "%"
    ColorCards.canteenMoney.value = chartData.canteenMoney
    ColorCards.avgDateMoney.value = chartData.avgDateMoney
    ColorCards.consumeCount.value = chartData.consumeCount
    ColorCards.userCount.value = chartData.userCount
    ColorCards.avgTimeMoney.value = chartData.avgTimeMoney
    ColorCards.avgUserMoney.value = chartData.avgUserMoney

    LevelCards.maxCost.value = datas2.maxAndMin.maxCost.monthMoney
    LevelCards.maxCost.describe = (datas2.maxAndMin.maxCost.major_name || '-') + "·" + (datas2.maxAndMin.maxCost.sex || '-')
    LevelCards.minCost.value = datas2.maxAndMin.minCost.monthMoney
    LevelCards.minCost.describe = (datas2.maxAndMin.minCost.major_name || '-') + "·" + (datas2.maxAndMin.minCost.sex || '-')
    LevelCards.maxTime.value = datas2.maxAndMin.maxTime.money
    LevelCards.maxTime.describe = datas2.maxAndMin.maxTime.date
    LevelCards.minTime.value = datas2.maxAndMin.minTime.money
    LevelCards.minTime.describe = datas2.maxAndMin.minTime.date

    LevelText.monthMoney = datas2.avgCost.monthMoney
    LevelText.dayMoney = datas2.avgCost.dayMoney
    LevelText.timeMoney = datas2.avgCost.timeMoney
    LevelText.male = datas2.sexDifferent.maleAvg
    LevelText.female = datas2.sexDifferent.feMaleAvg
    const { malePie, feMalePie } = datas2.sexDifferent
    const config = { series: [{ name: '男', data: malePie }, { name: '女', data: feMalePie }] }
    DrawDifferPieChart(config);
  } else if (active == "Consumption_place") {
    DrawMapChart(chartData);
    const { list } = datas2
    if (list && Array.isArray(list)) {
      PopularLocation.list = list.map(item => {
        item.rate = 90
        return item
      })
    }
  } else if (active == "Consumption_frequency") {
    DrawThreeMealsLine(chartData);
    DrawMultiplePie(datas2)
    FrequencyCzrds.breakfast.middle = totalMap.breakfastCount
    FrequencyCzrds.breakfast.bottom = totalMap.userBreakfast
    FrequencyCzrds.lunch.middle = totalMap.lunchCount
    FrequencyCzrds.lunch.bottom = totalMap.userLunch
    FrequencyCzrds.dinner.middle = totalMap.dinnerCount
    FrequencyCzrds.dinner.bottom = totalMap.userDinner
  } else {
    DrawBarThreeMealsDiff(chartData)
    Object.assign(RegularityLevel, datas2)
  }
}
const dataSource = usePortraitRequest({
  ...toRefs(params!) as any,
  ident: Ident,
  timePoint: HoursMinutes,
  category: ActiveCampus,
  typeName: typeName
}, [ActivePanle, ActiveCampus, ActiveBarType])
watch(dataSource, updateData, { immediate: true, deep: true })
</script>
