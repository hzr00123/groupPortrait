<template>
  <ul class="BarMultiSegment" :style="{ height: options.height ? options.height : 'auto' }">
    <li class="bar-item" v-for="(item, index) in options.list" :key="index + 'bar'">
      <div class="y-title" :style="{ width: options.lableWidth, textAlign: options.lableAlign }">{{ item.name }}</div>
      <el-popover placement="top-start" :title="item.name" :width="280" trigger="hover">
        <template #reference>
          <ul class="item-ul">
            <li class="item-ul-li" v-for="(it, idx) in item.arr" :key="idx + 'barli'"
              :style="{ width: it.percentage + '%', '--bgColor': options.colorList[idx] && options.colorList[idx]?.color,borderRadius:it.fillet?it.fillet:'0'}">
              <!-- <div class="zb" v-if="Number(it.percentage) >= 8 || idx == 0 || idx == item.arr.length - 1"> -->
              <div class="zb" v-if="Number(it.percentage) >= 8 ">
                {{ it.percentage }}%
              </div>
            </li>
          </ul>
        </template>
        <ul class="hover-box">
          <li class="hover-box-li sb" v-for="(it, idx) in item.arr" :key="idx + 'hover'">
            <div class="left-one">
              <div class="tag-box" :style="{ background: options.colorList[idx] && options.colorList[idx]?.color }"></div>
              <div>
                {{ options.colorList[idx] && options.colorList[idx].label }}
              </div>
            </div>
            <div class="left-two">{{ it.value }}{{ options.unit }}</div>
            <div class="left-three">{{ it.percentage }}%</div>
          </li>
        </ul>
      </el-popover>
      <!-- {{countNum(item.arr)}} -->
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed ,watch} from 'vue';
import { MultiSegmentConf } from './Search'
const props = defineProps<{options: MultiSegmentConf,}>()

const borderRadius = (arr:any) => {
  const { percentage: first } = arr[0];
  const { percentage: last } = arr[arr.length - 1];
  if (first == '100.00'||first == '100') {
    arr[0].fillet = '8px';
  } else if (first !== '0') {
    arr[0].fillet = '8px 0 0 8px';
  }
  if (last == '100.00'||last == '100') {
    arr[arr.length - 1].fillet = '8px';
  } else if (last !== '0'&& last !== '0.00') {
    arr[arr.length - 1].fillet = '0 8px 8px 0';
  }
  if(first== '0'||first== '0.00'&&last== '0'||last== '0.00'){
    if (arr.length === 3) {
      arr[1].fillet = '8px';
    }else if (arr.length > 3) {
      arr[1].fillet = arr[1].percentage=='100.00'? '8px':'0 8px 8px 0';
      arr[arr.length - 2].fillet = arr[arr.length - 2].percentage=='100.00'? '8px':'0 8px 8px 0';
    }
  }else if(first== '0'||first== '0.00'){
    if (arr.length === 3) {
      arr[1].fillet = '8px 0 0 8px';
    } else if (arr.length > 3) {
      arr[1].fillet = arr[1].percentage=='100.00'? '8px':'8px 0 0 8px';
    }else{
      arr[arr.length - 1].fillet = '8px'
    }
  }else if(last== '0'||last== '0.00'){
    if (arr.length === 3) {
      arr[arr.length - 2].fillet = '0 8px 8px 0';
    } else if (arr.length > 3) {
      arr[arr.length - 2].fillet = arr[arr.length - 2].percentage=='100.00'? '8px':'0 8px 8px 0';
    }else{
      arr[0].fillet = '8px'
    }
    
  }
}

watch(()=>props.options.list,(res)=>{
  res.forEach((it:any)=>{
    borderRadius(it.arr)
  })
})

const countNum = computed(() => {
  return (list: any) => {
    let total = 0;
    for (let i = 0; i < list.length; i++) {
      total += list[i].value;
    }
    return total
  }
});

</script>
<style lang="scss" scoped>
.hover-box {
  .hover-box-li {
    margin: 2px 0;

    .left-one {
      width: 41.33%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .tag-box {
        margin-right: 5px;
        width: 12px;
        height: 4px;

      }
    }
    .left-two{
      width: 38.33%;
      text-align: center;
    }
    .left-three{
      width: 20.33%;
      text-align: right;
    }
  }
}

.BarMultiSegment {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 20px;

  // box-sizing: border-box;
  .bar-item {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 24px;

    .y-title {
      margin-right: 14px;
      height: 16px;
      font-size: 16px;
      color: #203449;
      font-family: Regular;
      line-height: 16px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .item-ul {
      flex: 1;
      height: 16px;
      border-radius: 100px;
      border: 1px solid #c9dcec;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;

      .item-ul-li {
        height: 8px;
        position: relative;
        background: var(--bgColor);

        .zb {
          width: 100%;
          position: absolute;
          text-align: center;
          top: -23px;
          // right: 50%;
          font-size: 14px;
          font-family: Medium;
          color: #203449;
          line-height: 20px;
        }
      }

      .item-ul-li:first-child {
        border-radius: 8px 0 0 8px;

        // .zb {
        //   width: auto !important;
        //   text-align: left;
        //   left: 0;
        // }
      }

      .item-ul-li:last-child {

        border-radius: 0 8px 8px 0;

        // .zb {
        //   width: auto !important;
        //   text-align: right;
        //   right: 0;
        // }
      }
    }


  }
}
</style>