/**
 * 标签页请求>>>>>>>>>
 */
import request from "@/service";
import { LabelTreeParams, LabelTreeRes, LabelType, OptionsType, PageTeacherParams, TablesViewsParams, TablesViewsRes } from "../types/labelManagement";

/**
 * 获取标签树
 */
export function getLabelTree(data: LabelTreeParams) {
    return request<Array<LabelTreeRes>>({
        url: '/label/labelTree',
        data
    })
}
/**
 * 获取步骤一的一级标签options
 */
export function getFirstLabel() {
    return request<Array<OptionsType>>({
        url: '/label/firstLabel',
    })
}
/**
 * 获取步骤一的二级标签options
 */
export function getSsecondLabel(id: number) {
    return request<Array<OptionsType>>({
        url: '/label/secondLabel',
        data: {
            id
        }
    })
}
/**
 * 查询标签详细数据
 */
export function getLabel(id: number) {
    return request<LabelType>({
        url: '/label/getLabel',
        data: {
            id
        }
    })
}

/**
 * 获取条件下拉框选项
 * @param type "type":1表，2视图,3标签，4群体
 * @param search 字段名或标签名
 */
export function getTablesViews(type: 1 | 2 | 3 | 4, search: string) {
    return request<TablesViewsRes[], TablesViewsParams>({
        url: '/label/getTablesViews',
        data: {
            type,
            search
        }
    })
}

/**
 * 更新添加标签
 */
export function updateLabel(data: LabelType) {
    return request({
        url: '/label/updateLabel',
        data
    })
}
/**
 * 删除标签
 */
export function deleteLabel(id: number) {
    return request({
        url: '/label/deleteLabel',
        data: {id}
    })
}

/**
 * 获取组织结构树，策略对象选项
 */
export function orgTree() {
    return request({
        url: '/advanceSetting/orgTree'
    })
}

/**
 * 获取提醒人员选项（老师名单）
 */
export function pageTeacher(data: PageTeacherParams) {
    return request({
        url: '/advanceSetting/pageTeacher',
        data
    })
}

/**
 * 获取学生群像数据（预警位置）
 */
export function getGPCatalogList(data={}) {
    return request({
        url: '/groupAttention/getGPCatalogList',
        data
    })
}