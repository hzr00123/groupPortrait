import request from "@/service";
import { tantNameListPrams, orgTypePrams, removeNamePrams } from "../types/emphasisList"

// 获重点名单列表
export function getImportantNameList(data: tantNameListPrams) {
    return request({
        url: '/groupAttention/getImportantNameList',
        data
    })
}

// 关注人群下拉框
export function getFocusGroupData() {
    return request({
        method: 'GET',
        url: '/groupAttention/getFocusGroupData'
    })
}

// 关注人群下拉框
export function getOrgType(data: any) {
    return request({
        url: '/classFileBag/getOrgType',
        data
    })
}

// 预警信息下拉框
export function getWarningStrategy() {
    return request({
        method: 'GET',
        url: '/groupAttention/getWarningStrategy'
    })
}

// 移除重点名单
export function removeImportantName(data: removeNamePrams) {
    return request({
        method: 'GET',
        url: '/groupAttention/removeImportantName',
        data
    })
}

// 下载模版
export function downTemplate() {
    return request({
        method: 'GET',
        responseType: 'blob',
        url: '/groupAttention/downTemplate'
    })
}

// 待选名单
export function getStudentInfo(data) {
    return request({
        url: '/groupAttention/getStudentInfo',
        data
    })
}

// 保存待选名单
export function addImportantName(data) {
    return request({
        url: '/groupAttention/addImportantName',
        data
    })
}

// 保存待选名单
export function involvedImportantName(data) {
    return request({
        url: '/groupAttention/involvedImportantName',
        data
    })
}

// 批量导出
export function exportImportantNameData(data) {
    return request({
        url: '/groupAttention/exportImportantNameData',
        responseType: 'blob',
        data
    })
}

// 批量导入
export function importImportantNameData(data) {
    return request({
        url: '/groupAttention/importImportantNameData',
        responseType: 'blob',
        data
    })
}