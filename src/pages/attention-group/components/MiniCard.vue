<template>
    <div class="mini-card" :style="{
        'background-image': `url(${getImageUrl(item.bg.replace('.png', ''))})`,
        '--tcolor': item.titColor,
        '--ncolor': item.numColor,
        '--ucolor': item.unitColor,
        '--rcolor': item.ratioColor,
        }">
        <svg-icon v-if="item.icon" :icon-class="item.icon"/>
        <slot v-else name="icon"/>
        <h5 class="title">{{ item.title }}</h5>
        <div class="content">
            <span class="num">{{ item.num }}</span>
            <span class="unit" v-if="item.unit">/{{ item.unit }}</span>
            <template v-if="item.ratio">
                <span class="num">:</span>
                <span class="ratio">{{ item.ratio }}</span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { cardItem } from '../index'
import { getImageUrl } from "@/utils";
defineProps<{
    item: cardItem
}>()
</script>

<style lang="scss" scoped>
$bg: var(--bg);
$tcolor :var(--tcolor);
$ncolor :var(--ncolor);
$ucolor :var(--ucolor);
$rcolor :var(--rcolor);

.svg-icon {
    width: 64px;
    height: 64px;
    margin-right: 13px;
}
.mini-card {
    // width: 31%;
    width: 400px;
    height: 110px;
    padding: 30px;
    display: flex;
    align-items: center;
    background-size: 100% 100%;
    .title {
        font-size: 18px;
        font-family: SemiBold;
        line-height: 25px;
        margin-right: 6px;
        color: $tcolor;
    }
    .content {
        .num, .ratio {
            font-size: 36px;
            font-family: DinProBold;
            font-weight: bold;
            line-height: 46px;
            font-style: normal;
            margin-right: 6px;
            color: $ncolor;
        }
        .unit {
            font-size: 14px;
            font-family: Regular;
            font-weight: 400;
            line-height: 20px;
            font-style: normal;
            color: $ucolor;
        }
        .ratio {
            color: $rcolor;
        }
    }
}
</style>