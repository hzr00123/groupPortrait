<template>
  <div class="color-card flex-start" :style="{ backgroundColor: cardConfig.color, width: cardConfig.width, height: cardConfig.height }">
    <img :src="cardConfig.icon" class="card-icon">
    <div class="color-content">
      <div class="top">{{ cardConfig.top }}</div>
      <div class="middle"><span class="value">{{ cardConfig.middle }}</span><span class="unit">{{ cardConfig.middleUnit }}</span></div>
      <div class="bottom"><span class="value">{{ cardConfig.bottom }}</span><span class="unit">{{ cardConfig.bottomUnit }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ColorCardConf {
  top?: string,
  middle?: string | number,
  bottom?: string,
  color?: string,
  icon?: string,
  middleUnit?: string,
  bottomUnit?: string,
  width?: string,
  height?: string,
}
withDefaults(defineProps<{ cardConfig: ColorCardConf }>(), {})
</script>
<style lang="scss" scoped>
.color-card {
  width: 200px;
  height: 80px;
  box-shadow: 0px 2px 14px 0px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  align-items: flex-start;
  padding: 20px;

  .card-icon {
    width: 26px;
    height: 27px;
  }

  .color-content {
    font-family: Regular;
    color: #FFFFFF;
    font-size: 18px;
    flex: 1;
    text-align: center;

    .middle {
      margin-top: 5px;
      margin-bottom: 10px;
    }

    .value {
      font-family: Bold;
      margin-right: 4px;
    }

    .unit {
      font-size: 16px;
    }
  }
}
</style>