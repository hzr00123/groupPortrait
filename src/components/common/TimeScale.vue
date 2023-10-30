<template>
  <div class="time-scale">
    <ul class="time-line">
      <li :style="{ 'background-color': e.color }" :class="e.color ? 'color' : null" class="tiem-point" v-for="e, i in props.TimeScale">
        <span>{{ e.alias || e.label }}</span>
        <span class="scale"></span>
      </li>
    </ul>
    <div class="cursor-box" ref="cursor" :style="style">
      <div class="cursor" @mousedown="onMouseDown"></div>
      <div class="minute">{{ TiemPoint }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { getNowHoursMinutes } from "@/utils";
const emit = defineEmits<{ (e: 'selectTime', data: string): void }>()
interface TimeScaleConfig {
  label: string,
  value: number,
  alias: string,
  color: string
}

const props = defineProps<{ TimeScale: TimeScaleConfig[] }>()
const cursor = ref()
const style = reactive({ left: "-25px" })
const min = -25
const max = props.TimeScale.length * 60 - 26
const init = ref(0)
const initX = ref(0)
const TiemPoint = ref("")
const timeRange = props.TimeScale.map(item => item.value)

// 初始化
const initialize = () => {
  TiemPoint.value = props.TimeScale[0].label
  const [hours, minutes] = getNowHoursMinutes()
  const index = timeRange.findIndex(item => item === hours)
  if (index >= 0) {
    style.left = index * 60 + parseInt(minutes as string) - 25 + "px";
    TiemPoint.value = `${props.TimeScale[index].value}:${minutes}`
  }
}

// 鼠标松开
const mouseup = (event: Event) => {
  event.stopPropagation()
  event.preventDefault()
  document.removeEventListener("mousemove", mousemove)
  document.removeEventListener("mouseup", mouseup)
  emit("selectTime", TiemPoint.value)
}

// 鼠标按下
const onMouseDown = (event: MouseEvent) => {
  event.stopPropagation()
  event.preventDefault()
  document.addEventListener("mousemove", mousemove)
  document.addEventListener("mouseup", mouseup)
  initX.value = event.pageX
  init.value = cursor.value.offsetLeft
}

// 鼠标移动
const mousemove = (event: MouseEvent) => {
  event.stopPropagation()
  event.preventDefault()
  const current = event.pageX
  let distance = init.value + current - initX.value
  if (distance < min) {
    distance = min
  } else if (distance > max) {
    distance = max
  }
  style.left = distance + "px"
  const discuss: number = Math.floor((distance + 25) / 60)
  let remainder: number | string = (distance + 25) % 60
  if (remainder < 10) {
    remainder = "0" + remainder
  }
  TiemPoint.value = `${props.TimeScale[discuss].value}:${remainder}`
}

onMounted(() => initialize())
</script>

<style lang="scss">
.time-scale {
  position: relative;

  .time-line {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .tiem-point {
      width: 60px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      background-color: #fff;
      position: relative;

      .scale {
        display: inline-block;
        width: 1px;
        height: 5px;
        position: absolute;
        background: #000;
        bottom: 0;
        left: -1px;
      }
    }

    .tiem-point.color {
      color: #fff;

      .scale {
        background: #FFFFFF;
      }
    }
  }

  .cursor-box {
    position: absolute;
    top: 36px;

    .cursor {
      width: 20px;
      height: 15px;
      margin-left: 15px;
      cursor: pointer;
      background-image: url('@/assets/time-scale/time-cale-cursor.svg');
    }

    .minute {
      user-select: none;
      width: 50px;
      height: 30px;
      margin-top: 5px;
      line-height: 36px;
      font-size: 14px;
      color: #333333;
      text-align: center;
      background-image: url('@/assets/time-scale/time-cale-minute.svg');
    }
  }
}
</style>
