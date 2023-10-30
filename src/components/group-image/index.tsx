/***
 *  综合面貌
***/
import Comprehensive_appearance from './ComprehensiveFace/index.vue'

/***
 *  学生分布
***/
import Gender from './StudentDistribution/index.vue'

/***
 *  上课行为
***/
import School_attendance from './ClassroomBehavior/components/School_attendance.vue'
import Changes_in_student_status from './ClassroomBehavior/components/Changes_in_student_status.vue'

/***
 *  学业水平
***/
import GPA from './AcademicLevel/components/SchoolWork.vue'
import Course_progress from './AcademicLevel/components/CourseProgress.vue'
import Self_study_and_self_study from './AcademicLevel/components/SelfStudy.vue'
import Performance_Impact from './AcademicLevel/components/PerformanceImpact.vue'

/***
 * 科学研究 
***/
import Overview from './ScientificResearch/components/Overview.vue'
import Academic_papers from './ScientificResearch/components/AcademicPapers.vue'
import Academic_works from './ScientificResearch/components/StudentWorks.vue'
import Research_report from './ScientificResearch/components/ResearchReport.vue'
import Appraisal_results from './ScientificResearch/components/AppraisalResults.vue'
import Artistic_works from './ScientificResearch/components/ArtisticWorks.vue'

/***
 * 奖助贷勤 
***/
import Scholarship from './RewardsPunishmentsHelpLoans/components/Scholarship'
import Overview__of_funding from './RewardsPunishmentsHelpLoans/components/LoanSupplement'
import Award_certificate from './RewardsPunishmentsHelpLoans/components/Certificate'

/***
 * 实践活动 
***/

/***
 * 图书借阅 
***/

/***
 * 上网行为 
***/
import Online_behavior_duration from './OnlineBehavior/components/DurationFlowRate'
import Online_behavior_content from './OnlineBehavior/components/OnlineContent'
import Online_behavior_location from './OnlineBehavior/components/OnlineLocation'
import Online_behavior_discrepancy_sex from './OnlineBehavior/components/NetDiversity'

/***
 * 消费情况 
***/
import Consumption_amount from './ConsumptionSituation/components/DurationFlowRate.vue'
import Dissipate from './ConsumptionSituation/components/CanteenConsumption.vue'
import Supermarket_consumption from './ConsumptionSituation/components/CampusMerchants.vue'

/***
 * 生活习惯 
***/
import Bathing_frequency from './LivingHabit/components/BathingHabits'
import Breakfast_rate from './LivingHabit/components/EatingHabits'
import Sleep_and_rest from './LivingHabit/components/SleepAndRest'
import Dormitory_management from './LivingHabit/components/DormitoryMange'
import Lifestyle_population from './LivingHabit/components/RuleOfLife'

/***
 * 心理健康 
***/


/***
 * 体质健康
***/
import Health_assessment from './PhysicalHealth/components/HealthEvaluation'
import School_hospital from './PhysicalHealth/components/SchoolHospital'

/***
 * 社交关系
***/


/***
 * 毕业就业
***/
import Academic_Degrees_Awarded from './GraduateEmployment/components/GraduateEmploymentView/components/EducationDegreeAwarding'
import Paper_Information from './GraduateEmployment/components/GraduateEmploymentView/components/ThesisInfo'
import Destinative_distribution from './GraduateEmployment/components/GraduateEmploymentView/components/DestinationAfterGraduation'
import Career_Planning from './GraduateEmployment/components/CareerPlanning'
import Number_of_innovative_and_entrepreneurial_individuals from './GraduateEmployment/components/InnovationBusiness'
import Number_of_candidates_for_postgraduate_entrance_examination from './GraduateEmployment/components/PubMedSituation'
console.log(Comprehensive_appearance);

export default {
    // 综合面貌
    Comprehensive_appearance: (props: any) => <Comprehensive_appearance {...props} direction="vertical" />,
    /**学生分布 */
    //性别
    Gender: (props: any) => <Gender {...props} direction="vertical" />,
    //年龄
    Age: (props: any) => <Gender {...props} direction="vertical"/>,
    //生源
    Source_of_Students: (props: any) => <Gender {...props} direction="vertical"/>,
    //民族
    nation: (props: any) => <Gender {...props} direction="vertical"/>,

    /* 上课行为 */
    //上课出勤
    school_attendance: (props: any) => <School_attendance direction="vertical" />,
    // 学籍变动
    Changes_in_student_status: (props: any) => <Changes_in_student_status {...props} direction="vertical" />,

    /* 学业水平 */
    //学业成绩 绩点
    GPA: (props: any) => <GPA {...props} direction='vertical' />,
    //学业成绩 挂科
    Hanging_up: (props: any) => <GPA {...props} direction='vertical' />,
    // 修课进度
    Course_progress: (props: any) => <Course_progress {...props} direction='vertical'/>,
    // 自修自习
    'Self_study_and_self-study': (props: any) =><Self_study_and_self_study {...props} direction='vertical'/>,
    // 成绩影响
    Performance_Impact: (props: any) => <Performance_Impact {...props} direction='vertical'/>,

    /* 科学研究 */
    // 总览
    Overview: (props: any) => <Overview {...props} direction='vertical'/>,
    // 学术论文
    Academic_papers: (props: any) => <Academic_papers {...props} direction='vertical' />,
    // 学生著作
    Academic_works: (props: any) => <Academic_works {...props} direction='vertical' />,
    // 研究报告
    research_report: (props: any) => <Research_report {...props} direction='vertical'/>,
    // 鉴定成果
    Appraisal_results: (props: any) => <Appraisal_results {...props} direction='vertical' />,
    // 艺术作品
    artistic_works: (props: any) => <Artistic_works {...props} direction='vertical' />,

    /* 奖助贷勤 */
    // 奖学金
    scholarship: (props: any) => <Scholarship.Left {...props}/>,
    // 奖助总额
    overview__of_funding: (props: any) => <Overview__of_funding.Left {...props}/>,
    // 助学金
    Financial_aid: (props: any) => <Overview__of_funding.Left {...props}/>,
    // 勤工俭学
    'Work-study_program':  (props: any) => <Overview__of_funding.Left {...props}/>,
    // 助学贷款
    student_loan: (props: any) => <Overview__of_funding.Left {...props}/>,
    // 生活补贴
    Living_allowance: (props: any) => <Overview__of_funding.Left {...props}/>,
    // 获奖证书
    Award_certificate: (props: any) => <Award_certificate.Left {...props} />,
    // 上网时长
    Online_behavior_duration: (props: any) => <Online_behavior_duration.Left {...props} />,
    // 上网流量
    Online_behavior_traffic: (props: any) => <Online_behavior_duration.Left {...props} />,
    // 上网内容
    Online_behavior_content: (props: any) => <Online_behavior_content.Left {...props} />,
    // 上网地点
    Online_behavior_location: (props: any) => <Online_behavior_location {...props} />,
    // 上网差异-性别
    Online_behavior_discrepancy_sex: (props: any) => <Online_behavior_discrepancy_sex.Left {...props} />,
    // 专业
    Online_behavior_discrepancy_major: (props: any) => <Online_behavior_discrepancy_sex.Left {...props} />,
    // 学院
    Online_behavior_discrepancy_college: (props: any) => <Online_behavior_discrepancy_sex.Left {...props} />,
    // 消费金额
    Consumption_amount: (props: any) => <Consumption_amount direction='vertical' {...props} />,
    // 消费结构
    structure_type: (props: any) => <Consumption_amount direction='vertical' {...props} />,
    // 消费地点
    Consumption_location: (props: any) => <Consumption_amount direction='vertical' {...props} />,
    // 食堂消费-消费时间
    dissipate: (props: any) => <Dissipate direction='vertical' {...props} />,
    //  食堂消费-消费金额
    Consumption_amount_2: (props: any) => <Dissipate direction='vertical' {...props} />,
    //  食堂消费-消费地点
    Consumption_place: (props: any) => <Dissipate direction='vertical' {...props} />,
    //  食堂消费-消费频次
    Consumption_frequency: (props: any) => <Dissipate direction='vertical' {...props} />,
    //  食堂消费-消费差异性-年级差异
    differenice_grade: (props: any) => <Dissipate direction='vertical' {...props} />,
    // 食堂消费-消费差异性-性别差异
    differenice_sex: (props: any) => <Dissipate direction='vertical' {...props} />,
    // 食堂消费-消费差异性-贫困差异
    differenice_poor: (props: any) => <Dissipate direction='vertical' {...props} />,
    // 校内商户-超市消费
    Supermarket_consumption: (props: any) => <Supermarket_consumption direction='vertical' {...props} />,
    // 校内商户-其他消费
    Other_consumption: (props: any) => <Supermarket_consumption direction='vertical' {...props} />,
    // 生活习惯-洗澡习惯-洗澡频次
    Bathing_frequency: (props: any) => <Bathing_frequency.Left {...props} />,
    // 生活习惯-洗澡习惯-洗澡时间
    Bathing_time: (props: any) => <Bathing_frequency.Left {...props} />,
    // 生活习惯-洗澡习惯-洗澡地点
    Bathing_location: (props: any) => <Bathing_frequency.Left {...props} />,
    // 生活习惯-饮食习惯-早餐就餐率
    Breakfast_rate: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-饮食习惯-正餐就餐率
    Dinner_rate: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-饮食习惯-三餐就餐率
    Three_meal_dining_rate: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-饮食习惯-早餐就餐率与正餐就餐率关联分析
    Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate: (props: any) => <Breakfast_rate.Left  {...props} />,
    // 生活习惯-饮食习惯-三餐消费趋势
    Three_Meal_Consumption_Trends: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-饮食习惯-金额稳定性
    Amount_stability: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-饮食习惯-时间稳定性
    Time_stability: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-饮食习惯-频次稳定性
    Frequency_stability: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-饮食习惯-三餐金额稳定性
    Stability_of_Three_Meals_Amount: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-饮食习惯-消费关联性
    Consumption_correlation: (props: any) => <Breakfast_rate.Left {...props} />,
    // 生活习惯-作息睡眠
    Sleep_and_rest: (props: any) => <Sleep_and_rest.Left {...props} />,
    // 生活习惯-宿舍管理
    Dormitory_management: (props: any) => <Dormitory_management.Left {...props} />,
    // 生活习惯-生活规律-生活规律人群
    Lifestyle_population: (props: any) => <Lifestyle_population.Left {...props} />,
    // 生活习惯-生活规律-人群差异分析-年级差异
    Grade_differences: (props: any) => <Lifestyle_population.Left {...props} />,
    // 生活习惯-生活规律-人群差异分析-性别差异
    sex_difference: (props: any) => <Lifestyle_population.Left {...props} />,
    // 生活习惯-生活规律-人群差异分析-学院专业差异
    Differences_in_College_Majors: (props: any) => <Lifestyle_population.Left {...props} />,
    // 体质健康-健康测评
    Health_assessment: (props: any) => <Health_assessment.Left  {...props}/>,
    // 体质健康-校医院
    school_hospital: (props: any) => <School_hospital.Left  {...props}/>,
    // 学历学位授予情况
    Academic_Degrees_Awarded: (props: any) => <Academic_Degrees_Awarded.Left {...props} />,
    // 论文开题
    Paper_Information: (props: any) => <Paper_Information.Left {...props} />,
    // 论文预答辩
    Thesis_Proposal: (props: any) => <Paper_Information.Left {...props} />,
    // 论文评阅
    Paper_Review: (props: any) => <Paper_Information.Left {...props} />,
    // 论文答辩
    Thesis_Defense: (props: any) => <Paper_Information.Left {...props} />,
    // 去向分布
    Destinative_distribution: (props: any) => <Destinative_distribution.Left {...props}/>,
    // 就业地域
    Employment_region: (props: any) => <Destinative_distribution.Left {...props}/>,
    // 就业行业
    Employment_industry: (props: any) => <Destinative_distribution.Left {...props}/>,
    // 就业单位
    Employment_unit: (props: any) => <Destinative_distribution.Left {...props}/>,
    // 就业薪资
    Employment_salary: (props: any) => <Destinative_distribution.Left {...props}/>,
    // 职业规划
    Career_Planning: (props: any) => <Career_Planning.Left {...props}/>,
    // 创新创业人数
    Number_of_innovative_and_entrepreneurial_individuals: (props: any) => <Number_of_innovative_and_entrepreneurial_individuals.Left {...props}/>,
    // 创业行业
    Entrepreneurship_industry: (props: any) =>  <Number_of_innovative_and_entrepreneurial_individuals.Left {...props}/>,
    // 考研人数
    Number_of_candidates_for_postgraduate_entrance_examination: (props: any) => <Number_of_candidates_for_postgraduate_entrance_examination.Left  {...props}/>,
    // 考研意向
    Intention_to_take_the_postgraduate_entrance_examination: (props: any) => <Number_of_candidates_for_postgraduate_entrance_examination.Left {...props}/>,
    // 考研去向
    Destination_of_postgraduate_entrance_examination: (props: any) => <Number_of_candidates_for_postgraduate_entrance_examination.Left {...props}/>,
}