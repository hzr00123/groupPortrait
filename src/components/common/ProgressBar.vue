<template>
  <ul class="ProgressBar" :class="option.height?'ProgressBar-y':''" :style="{ height: option.height ? option.height : 'auto' }">
    <li class="item" v-for="(item, index) in option.list" :key="index + 'ProgressBar'" @click="handleClick(item)">
      <div class="title-box" :style="{ '--margin': option.margin ? option.margin : '14px', }">
        <div v-if="option.needTag == true" class="tag" :style="{ background: hotBgColor(index) }">{{ index + 1 }}</div>
        <el-tooltip :content="item.name" placement="right" effect="light">
          <div class="text" :style="{ '--lableWidth': option.lableWidth - 22 + 'px', '--align': option.lableAlign }">{{ item.name }}</div>
        </el-tooltip>

      </div>
      <div class="out-rect" :style="{ '--color': item.color ? item.color : option.color }">
        <div class="in-rect" :style="{ width: item.rate + '%' }"></div>
      </div>
      <div v-if="option.valuePosition == 'right'" class="value" :style="{ '--valueWidth': option.valueWidth + 'px', '--margin': option.margin ? option.margin : '14px', }">{{ item.value }}<span v-if="option.unit">{{ option.unit }}</span></div>
      <div v-else class="num" :style="{ '--left': option.lableWidth + 'px' }">{{ item.value }}<span v-if="option.unit">{{item.unit?item.unit:option.unit }}</span></div>
      <div class="type-text" v-if="item.type"><span>{{ item.type }}</span></div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ProgressConf } from './Search'
import { computed, } from 'vue';
const props = withDefaults(defineProps<{
  option: ProgressConf,
}>(), {

})
const hotBgColor = computed(() => {
  return (val: string | number) => {
    // switch (val) {
    //   case 0:
    //     return "rgba(178, 41, 36, 1)";
    //   case 1:
    //     return "rgba(178, 41, 36, 0.9)";
    //   case 2:
    //     return "rgba(178, 41, 36, 0.8)";
    //   case 3:
    //     return "rgba(178, 41, 36, 0.7)";
    //   case 4:
    //     return "rgba(178, 41, 36, 0.6)";
    // }
    if (typeof val === "number" && val <= 2) {
      return "rgba(178, 41, 36, 1)";
    } else {
      return "rgba(178, 41, 36, 0.5)";
    }
  }
});

const emits = defineEmits(['handleClick'])
const handleClick = (value: any) => {
  emits('handleClick', value)
}
</script>
<style lang="scss" scoped>
.ProgressBar-y{
  overflow-y: auto;
  overflow-x: hidden;
}
.ProgressBar {
  width: 100%;
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-bottom: 18px;
    // margin: 15px 0 30px;
    margin-top: 25px;
    position: relative;

    .num {
      height: 14px;
      font-size: 14px;
      font-family: Regular;
      color: #203449;
      line-height: 14px;
      position: absolute;
      top: -16px;
      left: var(--left);
    }

    .value {
      width: var(--valueWidth);
      height: 14px;
      font-size: 14px;
      font-family: Regular;
      color: #203449;
      line-height: 14px;
      margin-left: var(--margin);
      font-weight: bold;

      span {
        font-weight: bold;
      }
    }

    .title-box {
      height: 16px;
      color: #203449;
      margin-right: var(--margin);
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .tag {
        width: 14px;
        height: 14px;
        color: #fff;
        line-height: 14px;
        font-size: 12px;
        text-align: center;
        margin-right: 8px;
      }

      .text {
        cursor: pointer;
        width: var(--lableWidth);
        text-align: var(--align);
        height: 16px;
        font-size: 16px;
        line-height: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .out-rect {
      flex: 1;
      height: 15px;
      padding: 0 4px;
      clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 15px, 100% calc(100% - 0px),
          calc(100% - 0px) 100%, 0px 100%, 0 calc(100% - 0px), 0 0px);
      background: linear-gradient(-45deg, #d2e2f0 0px, rgba(248, 248, 248, 0) 0) bottom right,
        linear-gradient(45deg, #d2e2f0 0px, rgba(216, 236, 255, 0) 0) bottom left,
        linear-gradient(135deg, #d2e2f0 0px, rgba(216, 236, 255, 0) 0) top left,
        linear-gradient(-115deg, #d2e2f0 6px, rgba(216, 236, 255, 0) 0) top right;
      background-repeat: no-repeat;
      border: solid 1px #d2e2f0;
      border-radius: 15px 0 0 15px;
      display: flex;
      align-items: center;
    }

    .in-rect {
      width: 0%;
      height: 7px;
      background: linear-gradient(250deg, transparent 4px, var(--color) 0);
    }
  }
}
</style>