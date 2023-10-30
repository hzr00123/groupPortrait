<template>
  <div class="consumption-situation_panle-container" :style="{ flexDirection: direction === 'horizontal' ? 'row' : 'column' }">

    <div class="left-container">
      <div class="container-title sb">
        <c-title title="基本信息画像" />
        <RedTab :btnList="PanleList" :isActive="ActivePanle" @RedTabChange="onPanleChange" />
      </div>
      <div class="card-box space-around">
        <ColorCard :cardConfig="e" v-for="e, i in SupermarketCzrds" :key="i" />
      </div>
      <div class="chart-box">
        <div class="chart" ref="RatioDOM" v-if="ActivePanle === 'Other_consumption'"></div>
        <div class="chart" ref="PeriodDOM" v-else></div>
      </div>
      <div class='text'>各时段消费次数变化趋势</div>
    </div>

    <div v-if="$attrs.view !== 'left'" class="right-container">
      <c-title title="特征分析"></c-title>
      <div class="right-main">
        <div class="top-item">
          <div class="c-title ">消费金额</div>
          <div class="card-box">
            <CustomCard :cardConfig="e" v-for="e, i in ConsumeCards" :key="i" />
          </div>
          <div class="text">
            <p>{{ ActivePanle === 'Supermarket_consumption' ? "超市消费金额" : "其他类型消费金额" }} <span> {{ SupermarketCzrds.money.middle }} </span> 万元 累计消费次数<span> {{ SupermarketCzrds.count.middle }} </span> 次</p>
          </div>
        </div>
        <div class="bottom-item">
          <div class="c-title">消费时段</div>
          <ul class="specific-strip fill-height">
            <li class="specific-item">
              <span class="title" style="background: #45A0E6;">{{ ActivePanle === 'Supermarket_consumption' ? "最高金额" : "最多消费" }}</span>
              <div class="message">
                <p> {{ ActivePanle === 'Supermarket_consumption' ? "最高消费金额时段" : "最多消费类型" }} <span> {{ TimeSlot.high }}</span></p>
              </div>
            </li>
            <li class="specific-item">
              <span class="title" style="background: #B22924;">{{ ActivePanle === 'Supermarket_consumption' ? "最高次数" : "最低消费" }}</span>
              <div class="message">
                <p>{{ ActivePanle === 'Supermarket_consumption' ? "最高消费次数时段" : "最低消费类型" }} <span> {{ TimeSlot.low }}</span></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <WarningSeal :name="panleName" :ident="ActivePanle" />
  </div>
</template>

<script setup lang="ts">
import { inject, reactive, ref, getCurrentInstance, watch, toRefs, computed, defineAsyncComponent } from "vue";
import { BaseParams } from "../../types";
import { usePortraitRequest } from "@/hooks";
import { getImage } from "@/utils";
import ColorCard from "./ColorCard.vue";
import RedTab from "@/components/common/RedTab.vue";
import CustomCard from "@/components/common/CustomCard.vue";
import { getLineOptions, getPieOptions, LineCinfig, PieCinfig } from "../chart";
const WarningSeal = defineAsyncComponent({
  loader: () => import('@/components/WarningSeal'),
  delay: 1000
})
const params = inject<BaseParams>("params")

const props = withDefaults(defineProps<{
  selectList: any[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
  selectList: [
    { value: "Supermarket_consumption", label: "超市消费" },
    { value: "Other_consumption", label: "其他消费" }
  ] as any,
  direction: 'horizontal',
})
// 面板切换
const ActivePanle = ref(props.selectList[0].value);
const PanleList = reactive(props.selectList);
const panleName = computed(()=> PanleList.find(i => i.value === ActivePanle.value).label)
const onPanleChange = (v: string) => { ActivePanle.value = v };

// 超市消费卡片
const SupermarketCzrds = reactive({
  money: {
    color: "#4D5FC1",
    top: "消费金额",
    middle: "0",
    middleUnit: "万元",
    icon: getImage("icons/consumption-amount.svg"),
  },
  count: {
    color: "#45A0E6",
    top: "消费次数",
    middle: "0",
    middleUnit: "次",
    icon: getImage("icons/consumption-frequency.svg"),
  },
})


// 特征分析消费卡片
const ConsumeCards = reactive({
  high: {
    width: "280px",
    height: "80px",
    color: "#1B528B",
    title: "最高单笔消费",
    value: "0",
    isUnit: true,
    unit: "元",
    describe: "经济学·2022级·男",
    fontSize: "22px",
  },
  low: {
    width: "280px",
    height: "80px",
    color: "#F39702",
    title: "最低单笔消费",
    value: "0",
    isUnit: true,
    unit: "元",
    describe: "经济学·2022级·女",
    fontSize: "22px",
  },
});


// 消费时段
const TimeSlot = reactive({
  high: "",
  low: ""
})
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

// 折线图
const PeriodDOM = ref();
let LineChart: any = null;
const drawLineChart = (config: LineCinfig) => {
  const el: HTMLElement = PeriodDOM.value;
  if (LineChart) { LineChart.dispose() }
  LineChart = echart?.init(el);
  LineChart.setOption(getLineOptions(config, "人次", false, false));
};

// 饼图
const RatioDOM = ref();
let PieChart: any = null;
const drawPieChart = (config: PieCinfig) => {
  const el: HTMLElement = RatioDOM.value;
  if (PieChart) { PieChart.dispose() }
  PieChart = echart?.init(el);
  PieChart.setOption(getPieOptions(config, "万元"));
};

// 更新数据
const updateData = (result: any) => {
  if (!result.code) {
    return
  }

  const { data: { chartData, totalMap }, datas2: { maxCost, minCost, maxCostType, minCostType, moneyTime, timesTime } } = result
  const active = ActivePanle.value
  // 处理图表
  if (active === "Supermarket_consumption") {
    drawLineChart(chartData);
    TimeSlot.high = moneyTime || ""
    TimeSlot.low = timesTime || ""
  } else {
    drawPieChart(chartData);
    TimeSlot.high = maxCostType.name || ""
    TimeSlot.low = minCostType.name || ""
  }
  SupermarketCzrds.count.middle = totalMap.count || ""
  SupermarketCzrds.money.middle = totalMap.money || ""
  ConsumeCards.high.value = maxCost.money || ""
  ConsumeCards.high.describe = maxCost.major_name ? (maxCost.major_name + "·" + maxCost.grade_name + "·" + maxCost.sex) : ""
  ConsumeCards.low.value = minCost.money || ""
  ConsumeCards.low.describe = minCost.major_name ? (minCost.major_name + "·" + minCost.grade_name + "·" + minCost.sex) : ""
}

const dataSource = usePortraitRequest({...toRefs(params!) as any, ident: ActivePanle }, ActivePanle)
watch(dataSource, updateData, { immediate: true, deep: true })
</script>
