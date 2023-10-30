<template>
  <div>
    <div class="red-tab" v-if="isRed">
      <div class="btn" :class="[isActive == item.value ? 'active-cls' : '',btnList.length<2?'fillet':'']" v-for="item in btnList"
        :key="item.value" @click="clickCls(item)">
        {{ item.label }}
      </div>
    </div>
    <div class="blue-tab" v-else>
      <div class="item-btn" :style="{height:height?height:'36px', minWidth:height?'100px':'80px', '--bgColor': bgColor,'--height':height?height:'36px'}" 
        :class="[isActive == item.value ? 'active-btn' : '', btnList.length<2?'fillet':'']" v-for="item in btnList"
        @click="clickCls(item)" :key="item.value"
        :isbgcolor="bgColor ? true: false"
        >
        {{ item.label }}
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref,onMounted,watch } from 'vue'
import { RedTabConfig } from './Search'
const emits = defineEmits(['redTabChange',])
const props = withDefaults(defineProps<{
  btnList: RedTabConfig[],
  isActive: number | string,
  onRedTabChange: Function,
  height?:string
  isRed?: boolean,
  bgColor?: string
}>(), {
})

const clickCls = (item: {value: number | string, label: string}) => {
  emits('redTabChange', item.value, item.label)
}
</script>
<style lang="scss" scoped>
$bgColor: var(--bgColor);
.red-tab {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // margin-left: 190px;
  .btn {
    min-width: 72px;
    height: 28px;
    font-size: 14px;
    font-family: Regular;
    color: #203449;
    line-height: 28px;
    text-align: center;
    box-sizing: border-box;
    border: 1px solid #D6DCE0;
    background-color: #fff;
    border-right: none;
    cursor: pointer;
    padding: 0 8px;
    box-sizing: border-box;
  }
  .btn:first-child {
    border-radius: 28px 0 0 28px;
  }
  .btn:last-child {
    border-right: 1px solid #D6DCE0;
    border-radius: 0 28px 28px 0;
  }
  .fillet{
    border-radius: 28px!important;
  }
  .active-cls {
    color: #B22924;
    border: 1px solid #B22924 !important;
    background-color: #f6e8e8;
  }
}

.blue-tab {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .item-btn {
    min-width: 80px;
    height: 36px;
    border: 1px solid #D6DCE0;
    background-color: #fff;
    text-align: center;
    line-height: 36px;
    border-right: none;
    cursor: pointer;
    padding: 0 10px;
    box-sizing: border-box;
    &[isbgcolor="true"].active-btn {
      background-color: $bgColor;
      border-color: $bgColor;
    }
    &[isbgcolor="true"]{
      font-size: 14px;
      line-height: var(--height);
    }
  }
  .item-btn:first-child {
    border-radius: 6px 0 0 6px;
  }
  .item-btn:last-child {
    border-right: 1px solid #D6DCE0;
    border-radius: 0 6px 6px 0;
  }
  .fillet{
    border-radius: 6px!important;
  }
  .active-btn {
    color: #fff;
    background-color: #005DA7;
    border-color: #005da7;
  }
}
</style>