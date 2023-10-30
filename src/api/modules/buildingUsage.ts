import request from "@/service";

// 筛选条件
export function getBuildingDatas() {
    return request({
        url: '/behaviorTrace/getBuildingDatas',
        method:'get'
    })
}


// 地图
export function getBuildingUsageMap(data:any) {
    return request({
        url: '/behaviorTrace/getBuildingUsageMap',
        data
    })
}

// 访问热度变化趋势
export function trendInVisitHeat(data:any) {
    return request({
        url: `/behaviorTrace/trendInVisitHeat/${data}`,
        method:'get'
    })
}

// 楼宇访问热度对比
export function buildingHeatCompare() {
    return request({
        url: '/behaviorTrace/buildingHeatCompare',
    })
}




