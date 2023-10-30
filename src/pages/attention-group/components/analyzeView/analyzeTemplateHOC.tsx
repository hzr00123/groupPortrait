
import { Component, reactive, defineComponent, h, computed } from 'vue'
import { AnalyzeTemplateConfigType } from './index.d'
import { getImageUrl } from '@/utils';

function sortByData<T>(arr: T[], property: string = 'value' || 'num'): T[] {
    const sortedArray = arr.slice();
    sortedArray.sort((a, b) => {
        const aValue = a[property];
        const bValue = b[property];
        if (aValue > bValue) {
            return -1;
        } else if (aValue < bValue) {
            return 1;
        } else {
            return 0;
        }
    })
    return sortedArray
}

type AnalyzeTemplateType = Component & { leftView?: Component, rightView?: Component}


export default <T extends AnalyzeTemplateType>(AnalyzeTemplate: T, config: AnalyzeTemplateConfigType) => {
    return defineComponent({
        components: {
            AnalyzeTemplate,
        },
        setup(props, context) {
            const attrs: { [key: string]: any } = context.attrs as { [key: string]: any };
            const { leftData, rightData } = config.params
            const sortByLeftData = Array.isArray(leftData) && sortByData(leftData);
            const sortByRightData = Array.isArray(rightData) && sortByData(rightData);
            
            const desDom = reactive<{ [k: string]: any }>({
                irregular_schedule: { // 作息不规律人群
                    l_title: '早起习惯',
                    r_title: '晚归习惯',
                    l_des: () => <p class='stencil-des mg-b20'>
                        <span class='high-light-blue'>{ sortByLeftData[0].value }%</span>
                        人群起床时间在 <span class='high-light-blue'>{ sortByLeftData[0].name }</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b20'>
                        <span class='high-light-blue'>{ sortByRightData[0].value }%</span>
                        人群归寝时间在 <span class='high-light-blue'>{ sortByRightData[0].name }</span>
                    </p>,
                },
                irregularly_eat: { // 饮食不规律人群
                    l_title: '三餐就餐率', 
                    r_title: '三餐就餐人数变化趋势',
                    l_des: () => <p class='stencil-des mg-b20'>
                        <span class='high-light-blue'>20%</span>
                        人群 <span class='high-light-blue'>不吃三餐</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b20'>
                        日均三餐就餐人数变化幅度 <span class='high-light-blue'>20.09%</span>
                    </p>,
                },
                college_failure: { // 挂科人群
                    l_title: '挂科门数分布', 
                    r_title: '挂科课程',
                    l_des: () => <p class='stencil-des mg-b40'>
                        <span class='high-light-red'>{ sortByLeftData[0].value }%</span>
                        人群挂科<span class='high-light-red'>{ sortByLeftData[0].name }</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>
                        主要挂科课程<span class='high-light-red'>{sortByRightData[0].name}</span>
                    </p>
                },
                absenteeism: { // 旷课人群
                    l_title: '上课平均出勤率', 
                    r_title: '缺勤课程特征',
                    l_des: () => <p class='stencil-des mg-b40'>平均出勤率
                        <span class='high-light-blue'>{ leftData['rate'] }%</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>缺勤课程主要特征为
                        {   Array.isArray(sortByRightData) && sortByRightData.map((it: any, ix: number) => {
                                if(ix < 2) {
                                    return <span class='high-light-red'>{ it.name } {ix < 1 && '、'} </span>
                                }
                            })
                        }
                    </p>
                },
                content_sensitive: { // 内容敏感人群
                    l_title: '异常敏感内容类型分布', 
                    r_title: '异常敏感内容排行',
                    l_des: () => <p class='stencil-des mg-b40'>
                        主要敏感内容类型<span class='high-light-red'>{sortByLeftData[0].name}</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>主要敏感内容为
                        <span class='high-light-red'>{sortByRightData[0].name}</span>
                    </p>
                },
                internet_addiction: { // 上网成瘾人群
                    l_title: '上网时长分布', 
                    r_title: '上网流量应用分布',
                    l_des: () => <p class='stencil-des mg-b40'>
                        主要上网时长<span class='high-light-red'>{ sortByLeftData[0].name }</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>应用Top5&nbsp;
                        {
                            Array.isArray(sortByRightData) && sortByRightData.map((it: { name: string}, ix: number) => {
                                return <span class='high-light-red'>{it.name} {ix < 4 && '、'}</span>
                            })
                        }
                    </p>
                },
                isolated_people: { // 孤僻人群
                    l_title: '社交亲密关系', 
                    r_title: '行为轨迹重叠',
                    l_des: () => <p class='stencil-des mg-b40'>
                        平均社交亲密关系 <span class='high-light-red'>0人</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>
                        日均行为轨迹重叠 <span class='high-light-red'>11人</span>
                    </p>
                },
                sudden_abnormal_behavior: { // 突发异常行为人群
                    l_title: '突发异常行为分布', 
                    r_title: '突发异常行为变化趋势',
                    l_des: () => <p  class='stencil-des mg-b40'>
                        <span class='high-light-red'>6000人</span> 突发异常行为 <span class='high-light-red'>生活事件低</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>
                        突发异常行为人数呈现 <span class='high-light-red'>增加</span> 趋势
                    </p>
                },
                missing_people: { // 失联人群
                    l_title: '失联时长分布', 
                    r_title: '失联前上网内容'
                },
                consume_too_much: { // 消费过高人群
                    l_title: '人均月消费分布', 
                    r_title: '消费结构分布',
                    l_des: () => <p class='stencil-des mg-b40'>
                        人均月消费 <span class='high-light-red'>{ leftData['average'] }</span>
                        超过学校平均水平 <span class='high-light-red'>{ leftData['schoolAverage'] }</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>
                        主要消费内容 <span class='high-light-red'>{ sortByRightData[0].name }</span>
                    </p>
                },
                consume_too_little: { // 消费过低人群
                    l_title: '人均月消费分布', 
                    r_title: '消费结构分布',
                    l_des: () => <p class='stencil-des mg-b40'>
                        人均月消费 <span class='high-light-red'>{ leftData['average'] }</span>
                        落后学校平均水平 <span class='high-light-red'>{ leftData['schoolAverage'] }</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>
                        主要消费内容 <span class='high-light-red'>{ sortByRightData[0].name }</span>
                    </p>
                },
                consumption_skyrocketing: { // 消费骤增人群
                    l_title: '人均月消费增加分布', 
                    r_title: '消费结构分布',
                    l_des: () => <p class='stencil-des mg-b40'>
                        人均月消费增加 <span class='high-light-red'>{ leftData['addAverage'] }</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>
                        主要消费内容 <span class='high-light-red'>{ sortByRightData[0].name }</span>
                    </p>
                },
                consumption_plummeted: { // 消费骤减人群
                    l_title: '人均月消费减少分布', 
                    r_title: '消费结构分布',
                    l_des: () => <p class='stencil-des mg-b40'>
                        人均月消费减少 <span class='high-light-red'>{ leftData['addAverage'] }</span>
                    </p>,
                    r_des: () => <p class='stencil-des mg-b40'>
                        主要消费内容 <span class='high-light-red'>{ sortByRightData[0].name }</span>
                    </p>
                },
                suddenly_poor: { // 突发贫困人群
                    l_title: '消费水平对比', 
                    r_title: '日均消费金额变化趋势'
                },
                poor_people: { // 贫困人群
                    l_title: '消费水平对比', 
                    r_title: '消费频次对比'
                },
                anxiety_people: { // 抑郁人群
                    l_title: '心理测评次数', 
                    r_title: '心理辅导/咨询次数'
                },
                depressed_people: { // 焦虑人群
                    l_title: '心理测评次数', 
                    r_title: '心理辅导/咨询次数'
                },
                physical_not_standard: { // 体质健康不达标人群
                    l_title: '体质健康特征分布', 
                    r_title: '校医院就诊次数'
                }
            })
            
            return () => <div class="analyze-stencil">
                <div class="analyze-stencil-left">
                    <h3 class="c-title mg-b10">{ desDom[attrs.ident] && desDom[attrs.ident].l_title }</h3>
                    { desDom[attrs.ident] && h(desDom[attrs.ident].l_des) }
                    { AnalyzeTemplate?.leftView && h(AnalyzeTemplate?.leftView, { ...props, ...attrs,  data: leftData}) }
                    {   (!AnalyzeTemplate?.leftView || (Array.isArray(leftData) && !leftData.length)) &&
                        <div class='empty-box'>
                            <img src={ getImageUrl('empty') } alt="" />
                            <p>暂无数据</p>
                        </div>
                    }
                </div>
                <div class="analyze-stencil-right">
                    <h3 class="c-title mg-b10">{ desDom[attrs.ident] && desDom[attrs.ident].r_title }</h3>
                    { desDom[attrs.ident] && h(desDom[attrs.ident].r_des) }
                    { AnalyzeTemplate?.rightView && h(AnalyzeTemplate?.rightView, { ...props, ...attrs,  data: rightData}) }
                    {   (!AnalyzeTemplate?.rightView || (Array.isArray(leftData) && !rightData.length)) &&
                        <div class='empty-box'>
                            <img src={ getImageUrl('empty') } alt="" />
                            <p>暂无数据</p>
                        </div>
                    }
                </div>
            </div>
        }
    })
}