<template>
    <el-row :gutter="40" style="padding: 0 20px;">
      <el-col :span="12">
        <div class="academic-level-two">
          <c-title title="基本信息画像" />
          <div class="academic-level-two-top">
            <div class="card flex-start">
              <img src="@/assets/imgs/A.png" alt="">
              <div class="r-box column">
                <div class="up">平均学分</div>
                <div class="down"><span>125</span>分</div>
              </div>
            </div>
            <div class="icon" v-for="(item, index) in 2" :key="index">
              <img class="tag" src="@/assets/imgs/warn-tag.png" alt="">
              <div class="txt">绩点低于3.0 52人</div>
            </div>
          </div>
          <div class="academic-level-two-center sb">
            <div class="c-title">各专业学分修学进度</div>
            <RedTab :btnList="courseList" :isRed="isRed" :isActive="isCourseActive" @redTabChange="clickCourse" />
          </div>
          <ProgressBar :option="progressBarOpt" />
          <div class="list-bottom">
            学校平均 <span>88.66%</span>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="content-two">
          <c-title title="修课进度特征"></c-title>
          <div class="content-two-body">
            <div class="c-title">男女学分进度差异</div>
            <div class="card-box sb">
              <CustomCard :cardConfig="twoLeftCard" />
              <CustomCard :cardConfig="twoRightCard" />
            </div>
            <div class="text">
              男生平均学分 <span>247</span> 女生平均绩点 <span>24</span>
            </div>
            <div class="c-title">学分进度待提高人群</div>
            <div class="body-bottom sb">
              <div class="body-bottom-left column">
                <ElProgress class="two" type="circle" :width="140" :stroke-width="10" color="#B22924" :percentage="80">
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
              学分进度待提高学生 <span>520</span>人，主要待提高 <span>公共基础</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, getCurrentInstance, computed, onMounted, nextTick } from 'vue'
import RedTab from '@/components/common/RedTab.vue'
import CustomCard from '@/components/common/CustomCard.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const isRed = ref(true)
const isCourseActive = ref<string | number>(0)
const courseList = ref([
  {
    value: 0,
    label: "全部"
  },
  {
    value: 1,
    label: "必修课"
  },
  {
    value: 2,
    label: "选修课"
  },
])
const twoLeftCard = ref({
  width: '280px',
  height: '80px',
  color: '#1B528B',
  title: '最大学分差专业',
  value: '专业A',
  isUnit: false,
  describe: '差值: 0.1',
  fontSize: '22px'
})
const twoRightCard = ref({
  width: '280px',
  height: '80px',
  color: '#F39702',
  title: '最小学分差专业',
  value: '专业W',
  isUnit: false,
  describe: '差值: 0.1',
  fontSize: '28px'
})
const progressBarOpt = ref({
  list: [
    {
      ratio: 80,
      name: "毕业",
      value: 300,
    },
    {
      ratio: 50,
      name: "提前毕业",
      value: 300
    },
    {
      ratio: 50,
      name: "保留入学资格",
      value: 300
    },
    {
      ratio: 50,
      name: "放弃入学资格",
      value: 300
    },
    {
      ratio: 50,
      name: "出国",
      value: 300
    },
    {
      ratio: 50,
      name: "保留学籍",
      value: 300
    },
    {
      ratio: 50,
      name: "取消入学资格",
      value: 300
    },
    {
      ratio: 50,
      name: "复学",
      value: 300
    },
  ],
  color:'#005DA7',
  lableWidth: 148,
  lableAlign:'right',
  unit:'%'
})
const clickCourse = (val: number | string) => {
  isCourseActive.value = val;
  if(val==1){
    progressBarOpt.value.list = [
      {
        ratio: 80,
        name: "毕业",
        value: 300,
      },
      {
        ratio: 50,
        name: "提前毕业",
        value: 300
      },
    ]
  }
}
const initTwoCyChart = () => {
  const el: HTMLElement = instance?.refs.twoCyChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let datas = [
    {
      "name": "网络奇闻",
      "value": 15
    },
    {
      "name": "旅游出行",
      "value": 438
    },
    {
      "name": "景点类型",
      "value": 957
    },
    {
      "name": "国内游",
      "value": 927
    },
  ]
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
watch(() => isCourseActive.value, (val) => {

}, { immediate: true })
onMounted(() => {
  nextTick(() => {
    initTwoCyChart();
  })

})
</script>
<style lang="scss" scoped>
@import '../index.scss';
</style>