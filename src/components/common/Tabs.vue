<template>
  <div class="custom-tabs">
    <div class="top-btn" :class="activeKey == item.key ? 'active-btn' : ''" v-for="item in topBtnList" :key="item.key"
      @click="clickCls(item.key)">
      <img class="tag" src="@/assets/imgs/warn.png" alt="" v-if="item.show">
      <!-- <img class="icon" :src="activeKey == item.key ? item.iconA : item.icon" alt=""> -->
      <svg-icon class="svg-icon" v-if="item.icon" :icon-class="item.icon" />
      {{ item.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {  ref, } from 'vue'
import { TabsConfig } from './Search'
const emits = defineEmits(['changeClick',])
const props = withDefaults(defineProps<{
    topBtnList: TabsConfig[],
    isActive: number|string,
    onChangeClick: Function
	}>(),{
	})
const activeKey = ref<string | number>(props.isActive)

const clickCls = (index: number | string) => {
    activeKey.value = index;
    emits('changeClick', index)
}
</script>
<style lang="scss" scoped>
  .custom-tabs {
    border-bottom: 1px solid #E8E8E8;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 20px 4px;
    flex-wrap: wrap;

    .top-btn {
      min-width: 100px;
      height: 43px;
      line-height: 43px;
      text-align: center;
      margin-right: 10px;
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      position: relative;
      padding: 0 10px;
      box-sizing: border-box;

      .svg-icon {
        width: 16px;
        height: 16px;
        display: block;
        margin-right: 5px;
        color: #646464;
      }

      .tag {
        width: 14px;
        height: 14px;
        position: absolute;
        right: -6px;
        top: -6px;
      }
    }

    .active-btn {
      color: #B22824;
      background-color: rgba(178, 41, 36, 0.08);
      .svg-icon {
        color: #B22824;
      }
    }
  }
</style>