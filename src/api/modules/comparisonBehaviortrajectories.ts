import request from "@/service";

// 行为轨迹对比-人数对比
export function getBehaviorTraceCompare(data:any) {
    return request({
        method: 'POST',
        url: '/behaviorTrace/behaviorTraceCompare',
        data
    })
}

// 行为轨迹对比-图表加载
export function getBehaviorTraceCompareChart(data:any) {
    return request({
        method: 'POST',
        url: '/behaviorTrace/behaviorTraceCompareChart',
        data
    })
}