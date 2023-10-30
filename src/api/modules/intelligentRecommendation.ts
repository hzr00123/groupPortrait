import request from "@/service";

// 地图
export function wisdomRecommendMap(data: any) {
    return request({
        url: '/behaviorTrace/wisdomRecommendMap',
        data
    })
}


// 获取活动类型下拉
export function wisdomRecommendSelect() {
    return request({
        url: '/behaviorTrace/wisdomRecommendSelect',
    })
}

// 查询推荐设置
export function getWisdomRecomSetting(data: any) {
    return request({
        url: '/behaviorTrace/getWisdomRecomSetting',
        data
    })
}

// 查询节假日推荐
export function wisdomRecommendLabels() {
    return request({
        url: '/behaviorTrace/wisdomRecommendLabels',
    })
}

// 查询组织机构树
export function orgTreeList(data: any) {
    return request({
        url: '/sys/org/getOrgList',
        data
    })
}

// 查询节假日推荐
export function getWisdomRecomUserList(data: any) {
    return request({
        url: '/behaviorTrace/getWisdomRecomUserList',
        data
    })
}


// 存储表单
export function saveWisdomRecomSetting(data: any) {
    return request({
        url: '/behaviorTrace/saveWisdomRecomSetting',
        data
    })
}


// 手动推荐
export function manualRecommend(data: any) {
    return request({
        url: '/behaviorTrace/manualRecommend',
        data
    })
}







//不在校情况
export function notAtSchoolData(data: any) {
    return request({
        url: '/behaviorTrace/notAtSchoolData',
        data
    })
}

