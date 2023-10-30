export interface ISelOption {
    id?:string | number,
    name: string,
    typeName: string,
    disabled?:boolean
}

export interface ITargetColony {
    targetBasicInfoOptions: Array<{
        value: string,
        label: string
    }>,
    targetBasicInfo: string,
    targetIsEqual:string,
    targetIsSelectValOptions: Array<{
        name: string,
        typeName: string,
    }>,
    targetIsSelectVal: string
}

export interface ITargetTwoColony {
    targetUsersType:string,
    targetUserGrops:string
}

export interface IContrastColony {
    compareBasicInfoOptions:Array<{
        value: string,
        label: string
    }>,
    compareBasicInfo: string,
    compareIsEqual:string,
    compareIsSelectValOptions: Array<{
        name: string,
        typeName: string,
    }>,
    compareIsSelectVal: string
}

export interface IContrastTwoColony {
    compareUsersType:string,
    compareUserGrops:string
}

export interface IUserType {
    id:string | number,
    value: string,
    label: string
}

export interface IUserGrops {
    id:string | number,
    value: string,
    label: string,
    typeId:string | number
}

export interface IDanTargetObj {
    semester:string,  //学期
    schoolYear:string, //学年 
    campusId:number | null,  //校区id
    collegeId:number | null,  //学院id
    majorId:number | null, //专业id
    gradeId:number | null,  //年级id
    classId:number | null,   //班级id
    sex:string,      //性别
    nation:string,     //民族
    studentType:string,    //培养层次
    placeOrigin:string,    //生源地
    politics:string,      //政治面貌
    enrollType:string,    //"录取类型
    userGroupDescription:string,  //关注人群用户群描述
    userGroupType:number | null | string   //关注人群用户群类型
}

export interface IDanComTargetObj {
    semester:string,  //学期
    schoolYear:string, //学年 
    campusId:number | null,  //校区id
    collegeId:number | null,  //学院id
    majorId:number | null, //专业id
    gradeId:number | null,  //年级id
    classId:number | null,   //班级id
    sex:string,      //性别
    nation:string,     //民族
    studentType:string,    //培养层次
    placeOrigin:string,    //生源地
    politics:string,      //政治面貌
    enrollType:string,    //"录取类型
    userGroupDescription:string,  //关注人群用户群描述
    userGroupType:number | null | string   //关注人群用户群类型
}

export interface IParmsQueryData {
    compareGroup: {
        semester:string,  //学期
        schoolYear:string, //学年 
        campusId:number | null,  //校区id
        collegeId:number | null,  //学院id
        majorId:number | null, //专业id
        gradeId:number | null,  //年级id
        classId:number | null,   //班级id
        sex:string,      //性别
        nation:string,     //民族
        studentType:string,    //培养层次
        placeOrigin:string,    //生源地
        politics:string,      //政治面貌
        enrollType:string,    //"录取类型
        userGroupDescription:string,  //关注人群用户群描述
        userGroupType:number | null | string   //关注人群用户群类型
    },
    compareGroupName: string,
    compareGroupNum: string | number,
    targetGroup:{
        semester:string,  //学期
        schoolYear:string, //学年 
        campusId:number | null,  //校区id
        collegeId:number | null,  //学院id
        majorId:number | null, //专业id
        gradeId:number | null,  //年级id
        classId:number | null,   //班级id
        sex:string,      //性别
        nation:string,     //民族
        studentType:string,    //培养层次
        placeOrigin:string,    //生源地
        politics:string,      //政治面貌
        enrollType:string,    //"录取类型
        userGroupDescription:string,  //关注人群用户群描述
        userGroupType:number | null | string   //关注人群用户群类型
    },
    targetGroupName: string,
    targetGroupNum: string | number
}

export interface ISearchFunc{
    //定义一个调用签名
    (source: any):string
}

export interface IChartLeft {
    type: string,
    coordinateSystem: string, 
    symbolSize: number,
    edgeSymbol: [string,string],  
    links: Array<{
        source:number,
        target:number,
        name:string,
        chu:string,
        hui:string,
        count:string | number
    }>,
    label: {
        normal: {
            show: boolean
        }
    },
    tooltip:{
        backgroundColor: string,
        borderColor: string,
        formatter: ISearchFunc
    },
    itemStyle: {
        normal: {
            label: {
                position: any,
                textStyle: {
                    fontSize: number
                }
            }
        }
    },
    lineStyle: {
        normal: {
            width: number,
            color:any,
            curveness: any
        }
    }, 
    data:any,
}

export interface IChartRight {
    type: string,
    coordinateSystem: string, 
    symbolSize: number,
    edgeSymbol: [string,string],  
    links: Array<{
        source:number,
        target:number,
        name:string,
        chu:string,
        hui:string,
        count:string | number
    }>,
    label: {
        normal: {
            show: boolean
        }
    },
    tooltip:{
        backgroundColor: string,
        borderColor: string,
        formatter: ISearchFunc
    },
    itemStyle: {
        normal: {
            label: {
                position: any,
                textStyle: {
                    fontSize: number
                }
            }
        }
    },
    lineStyle: {
        normal: {
            width: number,
            color:any,
            curveness: any
        }
    }, 
    data:any,
}