import { BaseParams } from "@/components/group-image/types";
import { requestResType } from "@/components/Table-plus/index.d";
import request from "@/service";
import { 
    Params, 
    DistributionParams, 
    AnalysisParams, 
    UserListParams, 
    UserListRes, 
    EditUserStateParmas, 
    GroupBehavioralAnalysisParams,
    groupUserParams,
    estimateDataParams,
    delGroup,
    WarnMenuListRes,
    EditGroupAnalysisParams
 } from '../types/attentionGroup'
// 获重点名单列表
export function getGroupTypeDown() {
    return request({
        url: '/groupAttention/getGroupTypeDown',
        data: {}
    })
}

// 获取群体列表
export function getGroupUserList(data: Params) {
    return request({
        url: '/groupAttention/getGroupUserList',
        data
    })
}

// 群体汇总数据
export function getTotalCount(data: Params) {
    return request({
        url: '/groupAttention/getTotalCount',
        data
    })
}

// 人员分布分析
export function getPersonDistributionAnalysis(data: DistributionParams) {
    return request({
        url: '/groupAttention/getPersonDistributionAnalysis',
        data
    })
}

// 历史人数分析
export function getHistoricalCountAnalysis(data: AnalysisParams) {
    return request({
        url: '/groupAttention/getHistoricalCountAnalysis',
        data
    })
}

/**
 * 获取人员名单
 */
export function getUserList(data: any) {
    return request<UserListRes>({
        url: '/groupAttention/getUserList',
        data
    })
}
/**
 * 修改人员名单状态信息
 */
export function editUserState(data: EditUserStateParmas) {
    return request({
        url: '/groupAttention/editUserState',
        data
    })
}

/**
 * 获取群体行为分析
 */
export function getGroupBehavioralAnalysis(data: GroupBehavioralAnalysisParams) {
    return request({
        url: '/groupAttention/getGroupBehavioralAnalysis',
        data
    })
}

export function exportUserList(data: any) {
    return request({
        url: '/groupAttention/exportUserList',
        responseType: 'blob',
        data
    })
}

/**
 * 自定义人群
 */
// 新增
export function addGroupUser(data: groupUserParams) {
    return request({
        url: '/groupAttention/addGroupUser',
        data
    })
}
// 编辑
export function editGroupUser(data: groupUserParams) {
    return request({
        url: '/groupAttention/editGroupUser',
        data
    })
}
// 预估
export function getEstimateData(data: estimateDataParams) {
    return request({
        url: '/groupAttention/getEstimateData',
        data
    })
}
// 删除
export function delSelfGroup(data: delGroup) {
    return request({
        url: '/groupAttention/delSelfGroup',
        data
    })
}
// 更新
export function updateGroupUser(data: delGroup) {
    return request({
        url: '/groupAttention/updateGroupUser',
        data
    })
}

/**
 * 
 * @returns 获取预警公章信息
 */
export function getWarnMenuList(data: BaseParams) {
    return request<WarnMenuListRes>({
        url: '/groupPortrait/getWarnMenuList',
        data
    })
}

/**
 * 
 * @returns 查询预警公章学生弹框列表
 */
export function getWarnStuList(data: any) {
    return request<requestResType>({
        url: '/groupPortrait/getWarnStuList',
        data
    })
}
/**
 * 
 * @returns 导出预警公章学生弹框列表
 */
export function exportWarnStuList(data: any) {
    return request<requestResType>({
        url: '/groupPortrait/getWarnStuList',
        data,
        responseType: 'blob',
    })
}

// 自定义人群
export function editGroupAnalysis(data: EditGroupAnalysisParams) {
    return request({
        url: '/groupAttention/editGroupAnalysis',
        data
    })
}