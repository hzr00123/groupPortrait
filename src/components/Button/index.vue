<template>
    <el-button :style="{'--color': color, '--bcolor': borderColor}"
    :isPlain="plain"
    :type="type">
        <div class="text">
            <svg-icon v-if="icon" :icon-class="icon"/>
            <slot />
        </div>
    </el-button>
</template>
    
<script setup lang="ts">
import { _color, _type, _plain, _icon, bColor } from './index'
defineProps<{
    color?: _color
    plain?: _plain
    icon?: _icon
    borderColor?: bColor
    type?: _type
}>() 
</script>
    
<style lang="scss" scoped>
$color: var(--color);
$bcolor: var(--bcolor);
.el-button {
    .text {
        display: flex;
        align-items: center;
        font-family: Regular;
        font-weight: 400;
        line-height: 22px;
        .svg-icon {
            margin: 0 6px 0 0;
        }
    }
    &[isPlain="true"] {
        background: $color;
        color: $bcolor;
        border-color: $bcolor;
        &:hover {
            color: #FFF;
            border-color: $bcolor;
            background-color: $bcolor;
            .svg-icon {
                color: #FFF;
            }
        }
    }
}
</style>