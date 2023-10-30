<template>
  <div class="map-marker">
    <template v-for="item in ShowList" :key="item.name">
      <img :src="marker" class="marker" :style="item.iconStyle">
      <div class="panle" :style="item.panleStyle">
        <p>
          <span class="icon"></span>
          <span class="title">{{ item.name }}</span>
        </p>
        <p>消费记录：<span class="value">{{ item.value }}</span>条</p>
        <p>日均人数：<span class="value">{{ item.userCount }}</span>人</p>
        <p>高峰时段：<span class="value">{{ item.hightTime }}</span></p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { getImage } from "@/utils/index";
interface MapMarkers {
  labelList: string[],
  values: { name: string, value: string, userCount: string, hightTime: string }[]
}
const { MapMarkers } = defineProps<{ MapMarkers: MapMarkers }>()
const marker = getImage("icons/marker.svg")
const MarkerList = [
  {
    name: "食堂",
    value: "62000",
    userCount: "20000",
    hightTime: "11:30-13:00",
    iconStyle: {
      left: "90px",
      top: "50px"
    },
    panleStyle: {
      left: "120px",
      top: "30px"
    }
  },
  {
    name: "体育场",
    value: "62000",
    userCount: "100",
    hightTime: "18:00-22:00",
    iconStyle: {
      left: "350px",
      top: "90px"
    },
    panleStyle: {
      left: "380px",
      top: "70px"
    }
  },
  {
    name: "超市",
    value: "62000",
    userCount: "1800",
    hightTime: "14:00-17:00",
    iconStyle: {
      left: "350px",
      top: "250px"
    },
    panleStyle: {
      left: "380px",
      top: "220px"
    }
  },
  {
    name: "教学楼",
    value: "62000",
    userCount: "1800",
    hightTime: "14:00-17:00",
    iconStyle: {
      left: "50px",
      top: "180px"
    },
    panleStyle: {
      left: "80px",
      top: "150px"
    }
  },
  {
    name: "宿舍",
    value: "62000",
    userCount: "1800",
    hightTime: "14:00-17:00",
    iconStyle: {
      left: "320px",
      top: "270px"
    },
    panleStyle: {
      left: "350px",
      top: "240px"
    }
  },
  {
    name: "澡堂",
    value: "62000",
    userCount: "1800",
    hightTime: "19:30~21:00",
    iconStyle: {
      left: "360px",
      top: "90px"
    },
    panleStyle: {
      left: "390px",
      top: "60px"
    }
  },
]

const ShowList = computed(() => {
  const list = MarkerList.filter(item => {
    const result = MapMarkers.labelList.includes(item.name)
    if (result) {
      const element = MapMarkers.values.find((ele: any) => ele.name === item.name)
      if (element) {
        Object.assign(item, element)
      }
    }
    return result
  })
  return list
})
</script>
<style lang="scss" scoped>
.map-marker {
  width: 100%;
  height: 370px;
  position: relative;
  background: url(@/assets/imgs/consumption-location.png) no-repeat;

  .marker {
    width: 30px;
    height: 35px;
    position: absolute;
  }

  .panle {
    width: 238px;
    height: 118px;
    padding: 12px 10px 12px 35px;
    font-size: 16px;
    color: #203449;
    position: absolute;
    background: url(@/assets/icons/map-panle.svg) no-repeat;

    p {
      line-height: 22px;

      .icon {
        width: 8px;
        height: 12px;
        display: inline-block;
        clip-path: polygon(0 0, 0% 100%, 100% 50%);
        background: #B22A25;
        margin-right: 6px;
      }

      .value {
        color: #203449;
        font-weight: 600;
      }
    }
  }
}
</style>