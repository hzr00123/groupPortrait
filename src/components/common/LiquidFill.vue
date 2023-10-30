<template>
    <div class="liquidFill">
        <div class="liquidFill-charts" ref="liquidFill"></div>
        <p class="title">{{ options.title }}</p>
    </div>
</template>
    
<script setup lang='ts'>
import 'echarts-liquidfill'
import { getCurrentInstance, onMounted, nextTick, watch, computed } from 'vue'
import {optionsConfig} from './LiquidFill'

const props = withDefaults(
    defineProps<{
        options: optionsConfig
	}>(),
    {
        // options: {
        //     value: 0.6,
        //     borderColor: '#146AAE',
        //     borderWidth: 1,
        //     backgroundColor: '#E3F7FF',
        //     wavyColor: ['#294D99', '#156ACF', '#1598ED', '#45BDFF'],
        // }
    }
)

const percentValue = computed(() => {
    return Number(props.options.value as number * 100)
})
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const initCharts = () => {
    const el: HTMLElement = instance?.refs.liquidFill as any;
    let myChart = echart?.getInstanceByDom(el);
    if (myChart == null) {
        myChart = echart?.init(el);
    }
    
    var option = {
        backgroundColor:'transparent',
        tooltip: {
            show: true
        },
        title: {
            text: props.options.text,
            x:'center',
            y: 70,
            textStyle: {
                fontWeight: 'normal',
                fontSize: 16,
                fontFamily: 'Regular',
                color: '#FFF'
            }
        },
        series: [{
            type: 'liquidFill',
            radius: '90%',
            data: [{
                name: 'First Data',
                value: props.options.value
            }, 0.5, 0.4, 0.3],
            outline: {
                show: false
            },
            color: props.options.wavyColor,
            backgroundStyle: {
                borderColor: props.options.borderColor,
                borderWidth: props.options.borderWidth,
                color: props.options.backgroundColor
            },
            tooltip: {
                formatter: `${props.options.title}<br> ${percentValue.value} %`
            },
            itemStyle: {
                opacity: 0.6
            },
            label: {
                fontSize: 20
            }
        }]
    }
    myChart?.setOption(option);
}

// onMounted(() => {
//     nextTick(() => {
//         initCharts()
//     })
// })


watch(() => props.options, (newVal) => {
    if(newVal) {
        nextTick(() => {
            initCharts()
        })
    }
}, { immediate: true ,deep: true })
</script>
    
<style lang="scss" scoped>
.liquidFill {
    width: 100%;
    height: 100%;

    .liquidFill-charts {
        width: 100%;
        height: 100%;
    }
    .title {
        text-align: center;
        font-size: 14px;
        font-family: Regular;
        color: #203449;
        line-height: 22px;
    }
}
</style>