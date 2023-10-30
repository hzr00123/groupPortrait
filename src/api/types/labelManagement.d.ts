export interface IGetParams {
  apiKey: string;
}
export interface IGetRes {
  area: string;
  areaCode: string;
  areaid: string;
  dayList: any[];
}

export interface IMockLoginRes {
  name: string;
}

export interface LabelTreeParams {
  search: string
  attribute: '预警' | '特征' | '行为' | ''
}

export interface LabelTreeRes {
  name: string,
  pid: number,
  createUser: string,
  id: number,
  attribute: string,
  type: string,
  label_explain: string,
  createDate: string
  children: LabelTreeRes
}

export interface OptionsType {
  name: string
  pid: number | undefined
  id: number
}

export interface LevelType {
  /**
   * 预警等级中文名： 二级预警
   */
  levelInfo: string
  /**
   * 运算规则：如： 等于 | 不等于
   */
  levelValueRule: '等于' | '不等于' | '包含' | '为空' | '不为空' | '大于' | '小于' | '大于等于' | '小于等于' | '为真' | '为假' | ''
  /**
   * 预警颜色
   */
  color: string
  /**
   * 预警等级： 1、一级预警。。
   */
  warnLevel: '1' | '2' | '3'
  levelValue2: null
  /**
   * 预警的值
   */
  levelValue: string
}

export type warning_levelType = Array<{
  level_rule: Array<LevelType>
  dataSourceId: number | null
  fieldName: string
  fieldCode: string
  dataType: string
  tableId: number | null
  tableCode: string
  type: number | null
  tableName: string
  fieldId: number | null
}>

export interface WarningRuleEntity {
  id?: string | number
  /**
   * 是否开启预警
   */
  is_warning?: 0 | 1
  /**
   * 策略名称
   */
  warning_policy_name: string
  /**
   * 创建类型：手动创建，自动创建
   */
  add_method?: string
  /**
   * "17yywx2,17rjgc", 策略对象 -> 选中的机构code逗号分隔
   */
  warning_policy_target: string
  /**
   * 策略对象 -> 选中的机构name逗号分隔
   */
  warning_policy_content: string
  /**
   * 排除对象 选中的id逗号分隔，
   */
  exclude_target: string
  /**
   * 排除对象 选中的name逗号分隔
   */
  excludeTargetContent: string
  /**
   * 预警内容 -> 标签id
   */
  gp_label_id: number | null
  /**
   * 预警内容 -> 标签名称
   */
  warning_content: string
  /**
   * 预警等级数组
   */
  warning_level: warning_levelType
  /**
   * 触发时间 1同步后触发 2定时触发
   */
  trigger_type: 1 | 2
  /**
   * 触发时间   1每天 2每周 3每月
   */
  trigger_freq: 1 | 2 | 3
  /**
   * 触发时间 哪一天
   */
  trigger_freq_day: string
  /**
   * // 触发时间 周几 星期天: 1 、星期一: 2、 星期六: 7
   */
  trigger_freq_week: '1' | '2' | '3' | '4' | '5' | '6' | '7' | ''
  /**
   * 触发时间 哪一小时 0 - 23
   */
  trigger_freq_hour: string
  /**
   * 触发时间 哪一分钟 0 - 59
   */
  trigger_freq_minutes: string
  /**
   * cron表达式
   */
  trigger_freq_cron: null
  /**
   * 策略开始时间
   */
  policy_start_time: string
  /**
   * 策略结束时间
   */
  policy_end_time: string
  /**
   * 提醒人员 userId 按逗号隔开
   */
  remind_person_id: string
  /**
   * 提醒人员name 按逗号隔开
   */
  remind_person: string
  /**
   *  提醒消息
   */
  remind_message: string
  /**
   * 消息类型 提醒方式 是否短信 0:是，1:否
   */
  text_message: 0 | 1
  /**
   * 消息类型 提醒方式 是否邮件 0:是，1:否
   */
  mail_message: 0 | 1
  /**
   * 消息类型 提醒方式 是否公众号 0:是，1:否
   */
  official_account_message: 0 | 1
  /**
   * 预警位置
   */
  warning_position: string
  /**
   * 预警位置id数组
   */
  warning_position_arr: Array<string | number>
  /**
   * 创建时间
   */
  create_time: string
  cron_id?: null | string
}

export interface ConditionPart {
  dataSourceId: number
  dataType: string
  group_attention_id: null
  group_attention_name: null
  id: number
  label_id: null
  label_name: null
  /**
  * 运算符，
  */
  operator: 'and' | 'or'
  /**
   * 条件连接符 
   */
  relation: '等于' | '不等于' | '包含' | '为空' | '不为空' | '大于' | '小于' | '大于等于' | '小于等于' | '区间' | '为真' | '为假' | ''
  /**
   * 条件判断 为真或者为假
   */
  trueOrFalse: 'true' | 'false' | null
  /**
   * 这条数据的类型 1：群像数据，2：视图，3：标签体系，4：关注群体
   */
  type: 1 | 2 | 3 | 4
  /**
  * 字段类型 1:字符；2:数字；3:日期
  */
  dataTypeNum: number
  /**
   * 字段的Code
   */
  fieldCode: string
  /**
   * 字段的名字
   */
  fieldName: string
  name: string
  /**
   * 字段id
   */
  fieldId: number
  /**
   * 表的code
   */
  tableCode: string
  /**
   * 表id
   */
  tableId: number
  /**
   * 表中文名称
   */
  tableName: string
  /**
   * 值
   */
  value1: string | number
  /**
   * 值
   */
  value2: string | number
  label_explain?: string
}

export interface LabelType {
  id: number
  /**
   * 二级标签的父级id
   */
  label_group_id: number
  /**
   * 一级标签名
   */
  firstLabel: string
  /**
   * 一级标签id
   */
  firstLabel_id: number
  /**
   * 二级标签名
   */
  secondLabel: string
  /**
   * 标签名
   */
  name: string
  /**
   * 标签说明
   */
  label_explain: string
  attribute: '预警' | '特征' | '行为' | ''
  createUser: string
  createDate: string
  conditionids: string
  /**
   * 第三步标签规则数据
   */
  conditions: ConditionPart[]
  freq: number
  freq_custom_day: number
  is_warning: 0 | 1
  warning_rule_id: number
  warningInfo:  Omit<WarningRuleEntity, 'warning_level'> & { warning_level: string }
}

export interface TablesViewsParams {
  type: 1 | 2 | 3 | 4
  search: string
}

export interface TablesViewsRes {
  [key: string]: any
  children?: TablesViewsRes[]
}

export interface PageTeacherParams {
  pageNum: number
  pageSize: number
  nameOrUserName: string
}