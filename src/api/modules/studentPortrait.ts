import request from "@/service";
import { ChartData } from "../types/studentPortrait";

// 获取查询参数
export function getBaseInfo(data: { schoolYear?: string }) {
    return request({
        url: '/groupPortrait/getBaseInfo',
        data
    })
}
export function getGroupTypeDown(data:any) {
  return request({
      url: '/groupAttention/getGroupTypeDown',
      data
  })
}
export function getGroupUserList(data:any) {
  return request({
      url: '/groupAttention/getGroupUserList',
      data
  })
}
// 获取已选学生人数及占比
export function selectedStuAndRate(data:any) {
  return request({
      url: '/groupPortrait/selectedStuAndRate',
      data
  })
}
// 获取图表数据
export function getChartData(data:ChartData) {
  return request({
      url: '/groupPortrait/getChartData',
      data
  })
}
// 获取学生名单列表
export function selectedStuDetail(data:any) {
  return request({
      url: '/groupPortrait/selectedStuDetail',
      data
  })
}
//导出学生名单
export function exportSelectedStuDetail(data:any) {
  return request({
      url: '/groupPortrait/exportSelectedStuDetail',
      responseType: 'blob',
      data
  })
}

/**
 * 切换图例获取数据
 */
export function changeChartData(data:ChartData) {
  return request({
      url: '/groupPortrait/changeChartData',
      data
  })
}


/**
 * 获取图列数据 单独使用  直接用hooks监听顺序有混乱
 */
export function getAllChartData(data:ChartData) {
  return request({
      url: '/groupPortrait/getChartData',
      data
  })
}

/**
 * 获取下钻
 */
export function getChartDataDetail(data:ChartData) {
  return request({
      url: '/groupPortrait/getChartDataDetail',
      data
  })
}


/**
 * 获取下钻Any
 */
export function getChartDataDetailAny(data:any) {
  return request({
      url: '/groupPortrait/getChartDataDetail',
      data
  })
}

// 导出
export function exportGetChartDataDetail(data: any) {
  return request({
    url: '/groupPortrait/getChartDataDetail',
    responseType: 'blob',
    data
  })
}

// 下拉项
export function getSelectData(data:any) {
  return request({
      url: '/groupPortrait/getSelectData',
      data
  })
}


