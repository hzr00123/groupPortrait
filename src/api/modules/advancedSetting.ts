/**
 * 高级设置API
 */

import request from "@/service";
import { BlackAndWriteListInfoRes, BlackAndWriteListParams, BlackAndWriteListRes } from "../types/advancedSetting";
/**
 * 获取黑白名单表格
 */
export function getBlackAndWriteList(data: BlackAndWriteListParams) {
    return request<BlackAndWriteListRes>({
        url: '/advanceSetting/getBlackAndWriteList',
        data
    })
}

/**
 * 获取黑白名单编辑数据
 */
export function getBlackAndWriteListInfo(id: number) {
    return request<BlackAndWriteListInfoRes>({
        url: '/advanceSetting/getBlackAndWriteListInfo',
        data: { id }
    })
}

/**
 * 黑白名单转换
 */
export function convertBlackAndWriteList(data: any) {
    return request({
        url: '/advanceSetting/convertBlackAndWriteList',
        data
    })
}

/**
 * 获取学生群像总览
 */
export function getStudentGroupPortraitList(data: any) {
    return request({
        url: '/advanceSetting/getStudentGroupPortraitList',
        data
    })
}

/**
 * 获取关注人群
 */
export function getFocusGroupList(data:any) {
    return request({
        url: '/advanceSetting/getFocusGroupList',
        data
    })
}

/**
 * 新增黑白名单
 */
export function addBlackAndWriteList(data:any) {
    return request({
        url: '/advanceSetting/addBlackAndWriteList',
        data
    })
}

/**
 * 新增黑白名单
 */
export function editBlackAndWriteList(data:any) {
    return request({
        url: '/advanceSetting/editBlackAndWriteList',
        data
    })
}



/**
 * 删除黑白名单
 */
export function deleteBlackAndWriteList(data:any) {
    return request({
        url: '/advanceSetting/deleteBlackAndWriteList',
        data:data.id
    })
}





/**
 * 新增特殊日期
 */
export function addSpecialDate(data:any) {
    return request({
        url: '/advanceSetting/addSpecialDate',
        data
    })
}

/**
 * 获取特殊时期列表
 */
export function getSpecialDateList(data:any) {
    return request({
        url: '/advanceSetting/getSpecialDateList',
        data
    })
}

/**
 * 获取特殊时期列表
 */
export function editSpecialDate(data:any) {
    return request({
        url: '/advanceSetting/editSpecialDate',
        data
    })
}


/**
 * 删除特殊时期列表
 */
export function deleteSpecialDateList(data:any) {
    return request({
        url: '/advanceSetting/deleteSpecialDateList',
        data:data.id
    })
}



/**
 * 黑白名单查询
 */
export function queryBlackAndWriteListInfo(data:any) {
    return request({
        url: '/advanceSetting/queryBlackAndWriteListInfo',
        data
    })
}

/**
 * 预警规则列表
 */
export function pageWarningRuleList(data:any) {
    return request({
        url: '/advanceSetting/pageWarningRuleList',
        data
    })
}

/**
 * 新增预警规则
 */
export function addWarningRule(data:any) {
    return request({
        url: '/advanceSetting/addWarningRule',
        data
    })
}

/**
 * 新增预警规则
 */
export function editWarningRule(data:any) {
    return request({
        url: '/advanceSetting/editWarningRule',
        data
    })
}

/**
 * 预警等级
 */
export function warnLevel(data:any) {
    return request({
        url: '/advanceSetting/warnLevel',
        data
    })
}


/**
 * 查询预警规则
 */
export function getWarningRuleList(data:any) {
    return request({
        url: '/advanceSetting/getWarningRuleList',
        data
    })
}


/**
 * 删除预警规则
 */
export function deleteWarningRuleList(data:any) {
    return request({
        url: '/advanceSetting/deleteWarningRuleList',
        data:data.id
    })
}

/**
 * 黑白名单下拉框
 */
export function queryBlackAndWriteNameList(data:any) {
    return request({
        url: '/advanceSetting/queryBlackAndWriteNameList',
        data
    })
}

/**
 * 删除黑白名单学生
 */
export function deleteBlackAndWriteStudent(data:any) {
    return request({
        url: '/advanceSetting/deleteBlackAndWriteStudent',
        data:data
    })
}



