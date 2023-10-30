export interface cardItem {
    icon?: string
    title: string
    num: number | string
    ratio?: number
    unit?: string
    bg: string
    titColor: string
    numColor: string
    unitColor?: string
    ratioColor?: string
}

export interface Progress {
    value: string | number //进度值
    size: string | number //尺寸
    strokeWidth: string | number //边框粗细
    color: string  //进度条颜色
    duration: string | number  //动画执行时间
}

export interface TreeStructure {
    id: number
    label: string
    icon?: string
    children: Array<{
        id: number
        label: string,
        update_way: string,
        user_count: number,
        last_calculate_time: string,
        user_group_description: string,
        user_group_name: string
    }>
}

export interface distributionData {
    collegeData: HotList
    majorData: HotList
}
export type HotList = Array<{
    orgName: string
    count: number
    rate: string | number
}>

export interface NodeData {
    id: any
    label: string
    ident: string
    last_calculate_time?: string
    update_way?: string
    user_count?: string
    user_group_description?: string
    user_group_name?: string
}