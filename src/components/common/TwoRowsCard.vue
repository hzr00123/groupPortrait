<template>
  <div class="TwoRowsCard">
    <div class="TwoRowsCard-l" :style="{background:cardConfig.bgColor}">
      {{ cardConfig.title }}
    </div>
    <div class="TwoRowsCard-r">
      <div class="TwoRowsCard-r-top">
        {{ cardConfig.topText }} <span>{{ cardConfig.topVal }}</span>{{ cardConfig.unit }} {{ cardConfig.topText2 }} <span>{{ cardConfig.topVal2 }}</span>{{ cardConfig.unit2 }}
      </div>
      <div class="TwoRowsCard-r-bottom">
        {{ cardConfig.bottomText }} <span>{{ cardConfig.bottomVal }}</span>{{ cardConfig.unit }} {{ cardConfig.bottomText2 }} <span>{{ cardConfig.bottomVal2 }}</span>{{ cardConfig.unit2 }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RowsCardConf } from './Search'
const props = defineProps<{
  cardConfig: RowsCardConf,
}>()

</script>
<style lang="scss" scoped>
  .TwoRowsCard{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    .TwoRowsCard-l{
      width: 48px;
      height: 48px;
      border-radius: 12px;
      padding: 0 10px;
      font-size: 14px;
      line-height: 20px;
      color: #fff;
      display: flex;
      align-items: center;
      margin-right: 10px;
    }
    .TwoRowsCard-r-top,.TwoRowsCard-r-bottom{
      width: 562px;
      height: 56px;
      background: #FFFFFF;
      border-radius: 12px;
      padding-left: 20px;
      font-family: Regular;
      color: #203449;
      line-height: 56px;
      span {
        font-family: Bold;
      }
    }
    .TwoRowsCard-r-bottom{
      margin-top: 4px;
    }
  }

</style>