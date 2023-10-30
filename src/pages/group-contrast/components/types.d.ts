export interface SelectListVal {
    /**
     * 从学生基本信息中选择字段筛选人群的第一个下拉的数据标识
     */
    type?: { label?: string, value: number | string } | {}
    equal?: '=' | '≠'
    /**
     * 学年
     */
    schoolYear?: { label?: string, value: number | string } | null
    /**
     * 学期
     */
    semester?: { label?: string, value: number | string } | null
    /**
     * 校区
     */
    campusId?: { label?: string, value: number | string } | null
    /**
     * 学院
     */
    collegeId?: { label?: string, value: number | string } | null
    /**
     * 专业
     */
    majorId?: { label?: string, value: number | string } | null
    /**
     * 年级
     */
    gradeId?: { label?: string, value: number | string } | null
    /**
     * 班级
     */
    classId?: { label?: string, value: number | string } | null
    /**
     * 性别
     */
    sex?: { label?: string, value: number | string } | null
    /**
     * 民族
     */
    nation?: { label?: string, value: number | string } | null
    /**
     * 培养层次
     */
    studentType?: { label?: string, value: number | string } | null
    /**
     * 生源地
     */
    placeOrigin?: { label?: string, value: number | string } | null
    /**
     * 政治面貌
     */
    politics?: { label?: string, value: number | string } | null
    /**
     * 录取类型
     */
    enrollType?: { label?: string, value: number | string } | null
    /**
     * 关注人群
     */
    userGroupType?: { label?: string, value: number | string } | null
    /**
     * 用户群
     */
    userGroupDescription?: { label?: string, value: number | string } | null
}

export type GroupTransferValType = Array<{
    /**
     * 1:从学生基本信息中选择字段筛选人群
     * 2:从关注人群中直接选择某一群体
     */
    type: 1 | 2
    values: Array<SelectListVal>
}>

