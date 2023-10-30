<template>
    <div class="history-analyse">
        <div class="categoryChart" ref="categoryChart"></div>
        <c-table align="center"
        :columnList="columnList"
        :data="tableData"
        :pages="pages"
        maxHeight="400"
        ></c-table>
    </div>
</template>
    
<script setup lang='ts'>
import { ref, onMounted, getCurrentInstance, nextTick } from 'vue'
import { getHistoricalCountAnalysis } from '@/api/modules/attentionGroup'
import { AnalysisParams } from '@/api/types/attentionGroup'
const props = defineProps<{
    params: AnalysisParams
}>()

const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

const columnList = ref([
    {
        prop: 'groupName',
        label: '特殊群体',
        width: '150'
    },
])

const tableData = ref([])
const times = ref([])
const datas = ref([])

const pages = {
    current: 1,
    size: 10,
    total: 0,
}

const emit = defineEmits<{
    (e: 'opendStudentList', params: any): void
}>()

const resize = ref(false)
const initEcharts = () => {
    const el: HTMLElement = instance?.refs.categoryChart as any;
    const myChart = echart?.init(el, undefined, {
        renderer: 'svg'
    });

    let option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            icon: 'rect',
            x:'right',
            itemWidth: 12,
            itemHeight: 4,
            top: 30,
            data: ['旷课人群'],
            textStyle: {
                fontSize: '14px',
                color: "#3E5463",
                fontFamily: 'Regular',
            }
        },
        xAxis: {
            type: 'category',
            data: times.value
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '旷课人群',
                data: datas.value,
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#B22924'
                    }
                }
            }
        ]
    };
    myChart?.setOption(option)
    myChart?.on('click', function (params) {
        emit("opendStudentList", params)
    })
    window.addEventListener("resize", () => {
        myChart?.resize();
    })
}

const initData = async () => {
    const { data } = await getHistoricalCountAnalysis(props.params);
    let obj: object = []
    data.list.map((it: any, ix: number) => {
        times.value.push(it.calculate_time);
        datas.value.push(it.count)
        columnList.value.push({
            prop: `calculate_time_${ix}`,
            label: it.calculate_time,
            width: '185'
        })
        obj[`calculate_time_${ix}`] = it.count;
        obj['groupName'] = data.groupName;
    })
    tableData.value = [obj];
}


onMounted(() => {
    initData()
    resize.value = true;
    nextTick(() => {
        setTimeout(()=>{
            initEcharts()
        }, 1000)
    })
})

// watch(() => resize.value, (val) => {
//     console.log(val, 'wa');
    
//     initEcharts();
// })
</script>
    
<style lang="scss" scoped>
.history-analyse {
    width: 100%;
    .categoryChart {
        width: 100%;
        height: 200px;
    }
}
</style>