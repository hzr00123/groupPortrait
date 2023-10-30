export interface Params {
    user_group_type: string | number
    user_group_name: string
    campusId: string | number
    collegeId: string | number
    majorId: string | number
    gradeId: string | number
    classId: string | number
}

export interface DistributionParams {
    user_group_id: number
    campusId: number | string
}

export interface AnalysisParams {
    user_group_id: number
    campusId: number | string
    startTime?: string
    endTime?: string
}

export interface UserListParams {
    calculate_time: string
    campus: string,
    campusId: string,
    campus_org_id: string,
    classId: string,
    class_org_id: string,
    classes: string,
    college: string,
    collegeId: string,
    college_org_id: string,
    endTime: string,
    grade: string,
    gradeId: string,
    grade_org_id: string,
    ident: string,
    major: string,
    majorId: null | string,
    major_org_id: string,
    name: string,
    pageNumber: number,
    pageSize: number,
    reason: string,
    searchKey: string,
    sex: string,
    startTime: string,
    state: string,
    userName: string,
    user_group_id: string | number
}

export interface ListType {
    classId: string,
    gradeId: string,
    majorId: string,
    collegeId: string,
    campusId: string,
    user_group_id: string,
    userName: string,
    calculate_time: string,
    state: string,
    reason: string,
    name: string,
    sex: string,
    campus: string,
    college: string,
    major: string,
    grade: string,
    classes: string,
    campus_org_id: string,
    college_org_id: string,
    major_org_id: string,
    grade_org_id: string,
    class_org_id: string,
    startTime: string,
    endTime: string,
    searchKey: string,
    ident: string,
    pageSize: string,
    pageNumber: string
}

export interface UserListRes {
    pageNum: number,
    pageSize: number,
    size: number,
    startRow: number,
    endRow: number,
    total: number,
    pages: number,
    list: Array<ListType>,
    prePage: number,
    nextPage: number,
    isFirstPage: boolean,
    isLastPage: boolean,
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    navigatePages: number,
    navigatepageNums: number[],
    navigateFirstPage: number,
    navigateLastPage: number,
    firstPage: number,
    lastPage: number
}

export interface EditUserStateParmas {
    user_group_id: string
    userName: string
    calculate_time: string
    /**
     * 状态 1：关注 2： 未关注
     */
    state: '1' | '2'
}

export interface GroupBehavioralAnalysisParams {
    ident: string
    startTime: string
    endTime: string
    user_group_id: string
}

export interface EchartData {
    name:string
    value: number
}

export interface GroupBehavioralAnalysisRes {
    ident: string
    leftData: Array<EchartData>
    rightData: Array<EchartData>
}

export interface groupUserParams {
    id?: number
	user_group_name: string
    user_group_type: string
    user_group_description: string
    rule_and_or: string
    group_rules: [
        {
            label_id?: number | string | undefined
            value?: boolean | string | undefined
        }
    ]
    update_way: string
}

export interface estimateDataParams {
    rule_and_or: string
    group_rules: [
		{
			label_id?: number | string | undefined
            value?: boolean | string | undefined
		}
	],
}

export interface delGroup {
    id: number
}

export type WarnMenuTableColumn = Array<{ prop: string, label: string, sort: number | string}>

export type WarnListType = Array<{
    rule_id: number
    rule_name: string
    site_menu_id: string
    warn_num: number
    table_title: string
}>

export type WarnMenuListRes = Array<{
    catalog_name: string
    children?: WarnMenuListRes
    parent_id: number
    ident: string
    warnList?: WarnListType
    id: number
}>

export interface EditGroupAnalysisParams {
    id: string | number
    gp_ident_left: string
    gp_ident_right: string
}