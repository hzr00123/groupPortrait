<template>
  <div class="sb BarLegendBox">
    <el-icon v-if="currentPage > 1" class="BarLegendBox-l" @click="ArrowRight1">
      <ArrowLeft />
    </el-icon>
    <div class="BarLegend" ref="BarLegend" id="BarLegend">
      <div class="legend" v-for="(item, index) in legendList" :key="index">
        <div class="tag" :style="{ background: item.color }"></div>
        <div class="text">{{ item.label }}</div>
      </div>
    </div>
    <el-icon v-if="currentPage > 1" class="BarLegendBox-r" @click="ArrowRight2">
      <ArrowRight />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue';
import { LegendListConf } from './Search'
  const props = withDefaults(defineProps<{
    legendList: Array<LegendListConf>,
  }>(), {

  })
  const instance = getCurrentInstance();
  const containerRef = ref<any>(null);
  const currentPage = ref(0);
  onMounted(() => {
    containerRef.value = instance?.refs.BarLegend;
  });
  watch(() => props.legendList, (newVal, oldVal) => {
    const containerWidth = 450; // 最大宽度450
    nextTick(() => {
      const children = containerRef.value?.children;
      let totalWidth = 0;
      let page = 0;
      for (let i = 0; i < children.length; i++) {
        const childWidth = (children[i] as HTMLElement).clientWidth;
        totalWidth += childWidth;
        if (totalWidth > containerWidth) {
          page++;
          totalWidth = childWidth;
        }
      }
      if (totalWidth > 0) {
        page++;
      }
      currentPage.value = page;
    })
  },
    { immediate: true });
  const ArrowRight1 = () => {
    nextTick(() => {
      document.getElementById('BarLegend')!.scrollLeft -= 450
    })
  }
  const ArrowRight2 = () => {
    nextTick(() => {
      document.getElementById('BarLegend')!.scrollLeft += 450
    })
  }
</script>
<style lang="scss" scoped>
.BarLegendBox {
  max-width: 480px;

  .el-icon {
    cursor: pointer;

  }


}

.BarLegend {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 450px;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
  -ms-overflow-style: none;

  .legend {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 12px;

    .tag {
      width: 12px;
      height: 4px;
      background: #F39D12;
      border-radius: 2px;
    }

    .text {
      white-space: nowrap;
      height: 14px;
      font-size: 14px;
      font-family: Regular;
      color: #203449;
      line-height: 14px;
      margin-left: 10px;
    }
  }

  .legend:last-child {
    margin-right: 0px;
  }
}</style>