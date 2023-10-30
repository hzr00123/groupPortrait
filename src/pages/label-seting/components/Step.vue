<template>
    <div class="step">
        <template v-for="item in steps">
            <div class="step-item" :class="{ 'active': props.active == item.value, 'success': props.active > item.value }">
                <div>
                    <span v-if="props.active <= item.value">{{ item.value }}</span>
                    <el-icon v-else color="#005DA7"><Select /></el-icon>
                </div>
                <div>{{ item.name }}</div>
            </div>
            <div v-if="item.value !== 5" class="line" :class="{ 'active-line': props.active >= item.value }" />
        </template>
    </div>
</template>

<script setup lang="ts">
const steps = [
    {
        name: '选择标签体系',
        value: 1
    },
    {
        name: '设置标签基础属性',
        value: 2
    },
    {
        name: '设置标签规则',
        value: 3
    },
    {
        name: '设置预警策略',
        value: 4
    },
    {
        name: '生成标签',
        value: 5
    },
]
const props = defineProps<{ active: number }>()

</script>

<style scoped lang="scss">
.step {
    display: flex;
    justify-content: space-between;
    background-color: #FFFFFF;
    padding: 50px 250px;

    .step-item {
        color: #999999;
        height: 70px;
        position: relative;

        &>div:nth-child(1) {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #FFFFFF;
            border: 1px solid #999999;
            text-align: center;
            line-height: 28px;
        }

        &>div:nth-child(2) {
            position: absolute;
            bottom: 0;
            left: -46px;
            text-align: center;
            width: 126px;
        }

        &.active {
            &>div:nth-child(1) {
                background-color: #005DA7;
                border: none;
                color: #FFFFFF;
            }

            &>div:nth-child(2) {
                color: #005DA7;
            }
        }
        &.success {
            &>div:nth-child(1) {
                background-color: none;
                border-color: #005DA7;
                line-height: 30px;
            }

            &>div:nth-child(2) {
                color: #000000;
            }
        }
    }

    .line {
        width: 160px;
        height: 15px;
        border-bottom: 2px solid #DCDCDC;
        &.active-line{
            border-bottom: 2px solid #005DA7;
        }
    }
}
</style>