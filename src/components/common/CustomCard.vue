<template>
  <div class="custom-card" :class="cardConfig.describe?'f1':'f2'" :style="{'--color':cardConfig.color,width:cardConfig.width,height:cardConfig.height}">
    <div class="title">{{ cardConfig.title }}</div>
    <div class="bottom">
      <div class="l" :title="(cardConfig.value as string == '0' ? '0' : (cardConfig.value as string || '-'))" :style="{'--size':cardConfig.fontSize,}">
        {{ (cardConfig.value as string == '0' ? '0' : (cardConfig.value as string || '-')) }}
        <span v-if="cardConfig.isUnit">{{ cardConfig.unit }}</span>
      </div>
      <div class="r" v-if="cardConfig.describe">{{ cardConfig.describe }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CardConf } from './Search'
const props = withDefaults(defineProps<{
  cardConfig: CardConf,
}>(), {

})

</script>
<style lang="scss" scoped>
.f1{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.f2{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.custom-card {
  border-radius: 4px;
  border-left: 4px solid var(--color);
  background-color: #fff;
  padding: 12px 20px;
  .title {
    height: 18px;
    font-size: 18px;
    font-family: Regular;
    color: #1F384A;
    line-height: 18px;
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .l {
      height: var(--size);
      font-size: var(--size);
      font-family: Bold;
      color: var(--color);
      line-height:var(--size);
      flex: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;

      span {
        height: 20px;
        font-size: 14px;
        font-family: Regular;
        color: #1F384A;
        line-height: 20px;
      }
    }

    .r {
      max-width: 170px;
      // height: 20px;
      font-size: 14px;
      font-family: Regular;
      color: #1F384A;
      line-height: 14px;
      text-align: right;
    }
  }

}
</style>