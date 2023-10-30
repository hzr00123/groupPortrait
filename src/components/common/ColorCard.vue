<template>
  <div class="ColorCard flex-start" :style="{ backgroundColor: cardConfig.color, width: cardConfig?.width || '200px' }" @click="handleClick">
    <img :src="cardConfig.icon" alt="">
    <div class="r-box column">
      <div class="up" :title="cardConfig.title">{{ cardConfig.title }}</div>
      <div class="down">
        <span class="Bold">{{ cardConfig.value }}</span>
        <span v-if="cardConfig.isUnit">{{ cardConfig.unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ColorCardConf } from './Search'
const props = withDefaults(defineProps<{
  cardConfig: ColorCardConf,
}>(), {

})

const emit = defineEmits(['handleClick'])

const handleClick = () => {
  emit('handleClick')
}
</script>
<style lang="scss" scoped>
.ColorCard {
  width: 200px;
  height: 80px;
  box-shadow: 0px 2px 14px 0px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  align-items: flex-start;
  padding: 18px 0;
  cursor: default;

  img {
    width: 26px;
    height: 27px;
    display: block;
    margin: 0 10px 0 16px;
  }

  .r-box {
   width: calc(100% - 52px);

    .up {
      margin-bottom: 10px;
      font-size: 18px;
      font-family: Regular;
      color: #FFFFFF;
      line-height: 18px;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .down {
      font-size: 16px;
      font-family: Regular;
      color: #FFFFFF;
      line-height: 18px;

      .Bold {
        font-family: Bold;
        font-size: 18px;
        margin-right: 4px;
      }
    }
  }
}
</style>