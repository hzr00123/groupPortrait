<template>
  <div class="consumption-situation_panle-container" :style="{ flexDirection: direction === 'horizontal' ? 'row' : 'column' }">

    <div class='left-container'>
      <div class='sb container-title'>
        <c-title title="基本信息画像" />
        <RedTab :btnList="PanleList" :isActive="ActivePanle" @RedTabChange="OnPanleChange" />
      </div>

      <template v-if="ActivePanle == 'Consumption_amount'">
        <div class="card-box space-around">
          <ColorCard :cardConfig="ConsumeCards.avgMonthMomey" @click="OnCardClick" class="pointer" />
          <ColorCard :cardConfig="ConsumeCards.avgDayMomey" />
        </div>
        <div class="chart-box">
          <RedTab :btnList="AmountTypes" :isRed="true" :isActive="ActiveAmountT" @RedTabChange="OnAmountChange" class="tool-bar" />
          <div class="chart" ref="MoneyLineDom"></div>
        </div>
        <div class='text'>人均消费金额变化趋势</div>
      </template>

      <template v-else-if="ActivePanle == 'structure_type'">
        <div class="chart-box">
          <div class="chart" ref="StructurePieDOM"></div>
        </div>
      </template>

      <template v-else>
        <span class="select-list absolute">
          <RedTab isRed :btnList="CampusList" :isActive="ActiveCampus" @RedTabChange="OnCampusChange" />
        </span>
        <MapMarker :MapMarkers="MapMarkers"></MapMarker>
      </template>
    </div>

    <div v-if="$attrs.view !== 'left'" class="right-container">
      <c-title title="特征分析"></c-title>
      <div class="right-main">
        <template v-if="ActivePanle === 'Consumption_amount'">
          <div class="top-item" style="height: 153px;">
            <div class="c-title">平均消费水平</div>
            <div class="sb card-box self-adaption">
              <CustomCard :cardConfig="MaxAvgCost" />
              <CustomCard :cardConfig="MinAvgCost" />
            </div>
            <div class="text">学生人均月消费 <span>{{ ConsumeCards.avgMonthMomey.value }}</span>元</div>
          </div>
          <div class="bottom-item" style="height: 220px;">
            <div class="c-title">男女消费差异</div>
            <div class="chart-box self-adaption">
              <div class="chart" ref="DiffPieDOM"></div>
            </div>
            <div class="text">
              男性学生人均月消费
              <span> {{ AverageValue.maleAvgCost }} </span>
              元 女性学生人均月消费
              <span> {{ AverageValue.femaleAvgCost }}</span>
              元
            </div>
          </div>
        </template>

        <template v-else-if="ActivePanle === 'structure_type'">
          <div class="left-item" style="height: 370px;">
            <div class="c-title">消费结构</div>
            <div class="special-adaption chart-box">
              <div class="chart" ref="StructureBarDOM"></div>
            </div>
            <div class="text"><span>{{ MaxValue.maxName }}</span> 占比最高，占消费总额 {{ MaxValue.rate }}%</div>
          </div>
          <div class="right-item" style="height: 370px;">
            <div class="c-title">商户偏好</div>
            <div class="special-adaption">
              <ProgressBar class="progress" :option="TheCharts" />
            </div>
            <div class="text">
              商户Top5
              <span v-for="i, index in TheCharts.list.slice(0, 5)">
                {{ i.name + (TheCharts.list.length - 1 == index ? "" : "、") }}
              </span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="left-item" style="width: 60%; height: 370px;">
            <div class="c-title">消费地点</div>
            <div style="height: calc(100% - 57px); padding-top: 30px;">
              <ProgressBar class="progress" :option="MerchantList" />
            </div>
            <div class="text">
              <p>在
                <span>{{ LocationTypes.costMaxName }}</span> 消费记录最多，共
                <span> {{ LocationTypes.costCount }} </span> 条，主要消费类型
                <span> {{ LocationTypes.mainType }}</span>
              </p>
            </div>
          </div>
          <div class="right-item" style="width: 40%;height: 370px;">
            <div class="c-title">充值</div>
            <div class="chart-box fill-height">
              <div class="chart" ref="RechargePieDOM"></div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <WarningSeal :name="panleName" :ident="ActivePanle" />
  </div>
</template>
<script setup lang="ts">
import { inject, reactive, ref, getCurrentInstance, watch, unref, toRefs, defineAsyncComponent, computed } from "vue";
import { BaseParams } from "../../types";
import { usePortraitRequest } from "@/hooks";
import { ElLoading } from 'element-plus'
import { getImageUrl } from "@/utils";
import "../index.scss";
import ColorCard from "@/components/common/ColorCard.vue";
import MapMarker from "../components/MapMarker.vue";
import RedTab from "@/components/common/RedTab.vue";
import CustomCard from "@/components/common/CustomCard.vue";
import ProgressBar from "@/components/common/ProgressBar.vue";
import { changeChartData } from "@/api/modules/studentPortrait";
const WarningSeal = defineAsyncComponent({
  loader: () => import('@/components/WarningSeal'),
  delay: 1000
})
import {
  getLineOptions,
  getDiffPieOptions,
  getStructurePieOptions,
  getRightBarOptions,
  getRechargePieOptions,
  LineCinfig,
  PieCinfig,
  TwoPieCinfig
} from "../chart";

const params = inject<BaseParams>("params", {} as any)
const emit = defineEmits(['OpenWindow'])
const props = withDefaults(defineProps<{
  selectList: any[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
  selectList: [
    { value: "Consumption_amount", label: "消费金额" },
    { value: "structure_type", label: "结构类型" },
    { value: "Consumption_location", label: "消费地点" },
  ] as any,
  direction: 'horizontal',
})


// 面板切换
const ActivePanle = ref(props.selectList[0].value);
const PanleList = reactive(props.selectList);
const panleName = computed(() => PanleList.find(i => i.value === ActivePanle.value).label)
const OnPanleChange = (v: string) => {
  if (v === "Consumption_amount") {
    ActiveAmountT.value = "按日"
  } else {
    ActiveAmountT.value = ""
  }
  ActivePanle.value = v
};

const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

// 消费金额
const ConsumeCards = reactive({
  avgMonthMomey: {
    color: "#4D5FC1",
    title: "人均月消费",
    value: 2005,
    isUnit: true,
    icon: getImageUrl("swzsc"),
    unit: "元",
    width: "180px",
  },
  avgDayMomey: {
    color: "#45A0E6",
    title: "人均日消费",
    value: 25.28,
    isUnit: true,
    icon: getImageUrl("yjsc"),
    unit: "元",
    width: "180px",
  },
});
const OnCardClick = () => {
  const list = [{ prop: 'monthMoney', label: '月均消费', width: '100' }, { prop: 'dayMoney', label: '日均消费', width: '100' }];
  emit("OpenWindow", "人均消费金额", list, ActivePanle.value)
}

const ActiveAmountT = ref("按日");
const AmountTypes = reactive([{ value: "按日", label: "按日" }, { value: "按月", label: "按月" }]);
const OnAmountChange = async (value: string) => {
  ActiveAmountT.value = value
  try {
    const chartData = await GetDataByCategory(value)
    DrawMoneyLineChart(chartData)
  } catch (error) {
    console.log(error);
  }
};

const MaxAvgCost = reactive({
  width: "280px",
  height: "80px",
  color: "#1B528B",
  title: "最高人均月消费",
  value: "4009.25元",
  isUnit: true,
  unit: "元",
  describe: "经济学·2022级·男",
  fontSize: "22px",
});

const MinAvgCost = reactive({
  width: "280px",
  height: "80px",
  color: "#F39702",
  title: "最低人均月消费",
  value: "128.25元",
  isUnit: true,
  unit: "元",
  describe: "经济学·2022级·女",
  fontSize: "22px",
});

const MoneyLineDom = ref();
let MoneyLineChart: any = null
const DrawMoneyLineChart = (config: LineCinfig) => {
  const el: HTMLElement = MoneyLineDom.value;
  if (MoneyLineChart) {
    MoneyLineChart.dispose()
  }
  MoneyLineChart = echart?.init(el);
  MoneyLineChart.setOption(getLineOptions(config, "元", false, false));
};

const DiffPieDOM = ref();
let DiffPieChart: any = null
const DrawDiffPieChart = (config: TwoPieCinfig) => {
  const el: HTMLElement = DiffPieDOM.value;
  if (DiffPieChart) {
    DiffPieChart.dispose()
  }
  DiffPieChart = echart?.init(el);
  DiffPieChart.setOption(getDiffPieOptions(config));
};


// 结构类型
const StructurePieDOM = ref();
let StructurePieChart: any = null
const DrawStructurePieChart = (config: PieCinfig) => {
  const el: HTMLElement = StructurePieDOM.value;
  if (StructurePieChart) {
    StructurePieChart.dispose()
  }
  StructurePieChart = echart?.init(el);
  StructurePieChart.setOption(getStructurePieOptions(config, "万元"));
}


const StructureBarDOM = ref();
let StructureBarChart: any = null;
const DrawStructureBarChart = (config: any) => {
  const el: HTMLElement = StructureBarDOM.value;
  if (StructureBarChart) {
    StructureBarChart.dispose()
  }
  StructureBarChart = echart?.init(el);
  StructureBarChart.setOption(getStructurePieOptions(config, "万元"));
  StructureBarChart.setOption(getRightBarOptions(config));
};

const TheCharts = reactive({
  list: [{ rate: 80, name: "一食堂", value: 100 }],
  color: "#005DA7",
  lableWidth: 80,
  valueWidth: 80,
  lableAlign: "left",
  valuePosition: "right",
  unit: "万元",
  needTag: true,
  height: "100%",
});


// 消费地点
const ActiveCampus = ref("良乡校区");
const CampusList = reactive([{ value: "良乡校区", label: "良乡校区" }, { value: "望京校区", label: "望京校区" }]);

const OnCampusChange = async (value: string) => {
  ActiveCampus.value = value
  try {
    const chartData = await GetDataByCategory(value)
    updateLocation(chartData);
  } catch (error) {
    console.log(error);
  }
};


// 消费地点
const MerchantList = reactive({
  list: [
    {
      rate: 0,
      name: "食堂",
      value: 0,
      type: "食堂消费",
    },
    {
      rate: 0,
      name: "澡堂",
      value: 0,
      type: "食堂消费",
    },
    {
      rate: 0,
      name: "宿舍",
      value: 0,
      type: "食堂消费",
    },
    {
      rate: 0,
      name: "超市",
      value: 0,
      type: "食堂消费",
    },
    {
      rate: 0,
      name: "教学楼",
      value: 0,
      type: "食堂消费",
    },
  ],
  color: "#005DA7",
  lableWidth: 70,
  valueWidth: 70,
  lableAlign: "left",
  valuePosition: "right",
  unit: "条",
  height: "100%",
  needTag: true,
});
const LocationTypes = reactive({
  costCount: "6",
  costMaxName: "食堂",
  mainType: "食堂消费"
})

const MaxValue = reactive({
  maxName: "",
  rate: 100
})

const AverageValue = reactive({
  maleAvgCost: 2005,
  femaleAvgCost: 1805,
})

const MapMarkers = reactive({
  labelList: ["食堂", "体育场", "超市"],
  values: [
    {
      name: "食堂",
      value: "0",
      userCount: "0",
      hightTime: "",
    },
    {
      name: "体育场",
      value: "0",
      userCount: "0",
      hightTime: "",
    },
    {
      name: "超市",
      value: "0",
      userCount: "0",
      hightTime: "",
    },
  ]
})
const RechargePieDOM = ref();
let RechargePieChart: any = null;
const DrawRechargePieChart = (config: PieCinfig) => {
  const el: HTMLElement = RechargePieDOM.value;
  if (RechargePieChart) {
    RechargePieChart.dispose()
  }
  RechargePieChart = echart?.init(el);
  const option = getRechargePieOptions(config, "万", RechargePieChart)
  RechargePieChart.setOption(option);
};

const updateLocation = (config: any) => {
  const { costCount, costMaxName, mainType, mapList, recharges } = config
  LocationTypes.costCount = costCount
  LocationTypes.costMaxName = costMaxName
  LocationTypes.mainType = mainType
  MerchantList.list = []
  if (Array.isArray(mapList)) {
    for (const item of mapList) {
      const object = {
        rate: item.value,
        name: item.name,
        type: item.type,
        value: item.value,
      };
      MerchantList.list.push(object)
    }
  }
  MapMarkers.labelList = mapList.map((item: any) => item.name)
  MapMarkers.values = mapList
  DrawRechargePieChart({ series: recharges })
}
// 更新数据
const updateData = (result: any) => {

  if (!result.code) {
    return
  }
  const handler = () => {
    if (!result.data) {
      return
    }
    const { data: { chartData, totalMap }, datas2 } = result
    const active = ActivePanle.value
    if (active === "Consumption_amount") {
      DrawMoneyLineChart(chartData)
      const config = { series: [{ name: "男", data: datas2.maleAvgPie }, { name: "女", data: datas2.femaleAvgPie }] }
      DrawDiffPieChart(config)
      ConsumeCards.avgDayMomey.value = totalMap?.avgDayMomey || 0
      ConsumeCards.avgMonthMomey.value = totalMap?.avgMonthMomey || 0
      MaxAvgCost.value = datas2.maxAvgCost.money || 0
      MaxAvgCost.describe = datas2.maxAvgCost.major_name ? datas2.maxAvgCost.major_name + "·" + datas2.maxAvgCost.sex : ""
      MinAvgCost.value = datas2.minAvgCost.money || 0
      MinAvgCost.describe = datas2.minAvgCost.major_name ? datas2.minAvgCost.major_name + "·" + datas2.minAvgCost.sex : ""
      AverageValue.femaleAvgCost = datas2.femaleAvgCost || 0
      AverageValue.maleAvgCost = datas2.maleAvgCost || 0

    } else if (active === "structure_type") {
      DrawStructurePieChart(chartData)
      DrawStructureBarChart(datas2.structruePie)
      MaxValue.maxName = datas2.maxName
      MaxValue.rate = datas2.rate
      TheCharts.list = datas2.merchantList
    } else {
      updateLocation(chartData)
    }
  }

  window.requestAnimationFrame(handler)
}

// 通过类型获取数据
const GetDataByCategory = async (category: string) => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    const { code, data, msg } = await changeChartData({ ...params!, ident: ActivePanle.value, category: category })
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

const dataSource = usePortraitRequest({ ...toRefs(params!) as any, ident: ActivePanle, category: ActiveAmountT }, ActivePanle)
watch(dataSource, updateData, { immediate: true, deep: true })
</script>