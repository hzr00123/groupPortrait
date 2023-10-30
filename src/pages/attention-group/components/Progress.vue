<template>
    <div class="circle-main">
        <div class="circle-main-box" :style="[{ 'width': size+'px','height': size+'px'}]">
            <svg :width="size" :height="size" class="circle">
                <circle
                :r="radius"
                :cx="cx"
                :cy="cy"
                fill="transparent"
                stroke="#E2E6EB"
                :stroke-width="strokeWidth"
                />
                <circle
                :r="radius"
                :cx="cx"
                :cy="cy"
                fill="transparent"
                :stroke="color"
                :stroke-width="strokeWidth"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progress"
                />
            </svg>
        <span class="count-num">{{countDown}}%</span>
    </div>
  </div>
</template>
    
<script setup lang='ts'>
import { ref, computed, onMounted } from 'vue'
const props = defineProps<{
    value: number | string //进度值
    strokeWidth: number //边框粗细
    color: string  //进度条颜色
    duration: number  //动画执行时间
 }>()

const now = ref(0);
const size = ref(70);

const percentage = computed(() => {
    return props.value
})

const countDown = computed(() => {
    return now.value
})

// 圆心x轴坐标
const cx = computed(() => {
    return size.value / 2;
})

// 圆心y轴坐标
const cy = computed(() => {
    return size.value / 2;
})

// 半径
const radius = computed(() => {
    return (size.value - props.strokeWidth) / 2
})

// 圆周长
const circumference = computed(() => {
    return 2 * Math.PI * radius.value
})

// 进度长度
const progress = computed(() => {
    return (1 - now.value / 100) * circumference.value
})


const run = () => {
    if(props.value === 0) return;
    let t = props.duration / props.value
    let timer: any = setInterval(() => {
        if (now.value >= props.value) {
            return clearInterval(timer);
        }
        now.value++;
    }, t);
}

onMounted(() => {
    run()
})
</script>
    
<style lang="scss" scoped>
.circle {
  transform: rotate(-90deg);
}
.circle-main-box {
  position: relative;
  display: block;
  margin: 0 auto;
}
.count-num {
  width: 100px;
  height: 100px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -50px;
  margin-top: -50px;
  align-items: center;
  justify-content: center;
  display: flex;
  font-size: 16px;
    font-family: DINProBold;
    font-weight: bold;
    color: #1D538C;
    // line-height: 21px;
}
</style>