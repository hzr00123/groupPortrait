export interface BlackAndWriteListParams {
    pageNum: number
    pageSize: number
    /**
     * 名单状态（1：黑名单，2：白名单）
     */
    nameListStatus: 1 | 2
    /**
     * 结束时间
     */
    effectivePeriodEndTime?: string
    /**
     * 开始时间
     */
    effectivePeriodStartTime?: string
    /**
     * 黑名单 白名单 的input搜索值
     */
    nameListContent?: string
    /**
     * 原因
     */
    reason?: string
    /**
     * 关联功能模块
     */
    relatedFunctionModule?: string
}

export interface TableData {
    id: string
    nameListContent: string
    relatedFunctionModule: string
    reason: string
    effectivePeriod: string
    nameListStatus: 1 | 2
}

export interface BlackAndWriteListRes {
    total: number
    pages: number
    pageSize: number
    pageNum: number
    dataList: Array<TableData>
}

export interface nameListContentListType {
    code: string
    type: string
    name: string
}

export interface BlackAndWriteListInfoRes {
    id: number
    nameListContentList: Array<nameListContentListType>
    relatedFunctionModuleList: Array<string>
    reason: string
    effectivePeriodStartTime: string
    effectivePeriodEndTime: string
    nameListStatus: 1 | 2
    createTime: null | string
}