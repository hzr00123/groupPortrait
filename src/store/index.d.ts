export interface OrgType {
    campusOrgList: Array<any>,
    collegeOrgList: Array<any>,
    majorOrgList: Array<any>,
    gradeOrgList: Array<any>,
    classOrgList: Array<any>
}

export interface StateType {
    orgType: OrgType
    groupTypeList: any[],
    vsViewDirection: {
        left: boolean
        right: boolean
    }
    seting: boolean
}