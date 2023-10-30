import { getGroupBehavioralAnalysis } from '@/api/modules/attentionGroup';
import { GroupBehavioralAnalysisParams } from '@/api/types/attentionGroup'
import { defineComponent, h, ref, PropType, onBeforeMount, computed } from 'vue'
import { AnalysisParamsResponse } from './index.d';
import AnalyzeTemplate from './analyzeTemplateHOC'
import irregular_schedule from './components/irregular_schedule'
import absenteeism from './components/absenteeism'
import content_sensitive from './components/content_sensitive'
import internet_addiction from './components/internet_addiction'
import college_failure from './components/college_failure'
import consume_too_much from './components/consume_too_much'
import consume_too_little from './components/consume_too_little'
import consumption_skyrocketing from './components/consumption_skyrocketing'
import consumption_plummeted from './components/consumption_plummeted'
import irregularly_eat from './components/irregularly_eat'
import isolated_people from './components/isolated_people'
import './analyze.scss'

const modelComponent = {
    irregular_schedule,
    absenteeism,
    content_sensitive,
    internet_addiction,
    college_failure,
    consume_too_much,
    consume_too_little,
    consumption_skyrocketing,
    consumption_plummeted,
    irregularly_eat,
    isolated_people
}

const AnalyzeView = defineComponent({
    name: 'analyzeView',
    props: {
        params: {
            type: Object as PropType<GroupBehavioralAnalysisParams>,
            default: () => ({
                ident: '',
                user_group_id: '',
                startTime: '',
                endTime: ''
            })
        }
    },
    setup(props, { expose }) {
        const vLoading = ref(false)
        const ident = ref(props.params.ident);
        const response = ref<AnalysisParamsResponse>({
            ident: '',
            leftData: [],
            rightData: [],
        })
        const getData = async () => {
            vLoading.value = true;
            let res = await getGroupBehavioralAnalysis(props.params);
            if(res.code == 1) {
                vLoading.value = false;
                if(ident.value === 'irregularly_eat') {
                    response.value = {
                        ident: ident.value,
                        leftData: [
                            {
                                name: "不吃早餐",
                                num: 4000,
                                value: 60
                            },
                            {
                                name: "不吃午餐",
                                num: 1000,
                                value: 20
                            },
                            {
                                name: "不吃晚餐",
                                num: 2009,
                                value: 20
                            },
                            {
                                name: "不吃三餐",
                                num: 40,
                                value: 20
                            }
                        ],
                        rightData: {
                            xAxis: ['0307', '0308', '0309', '0310', '0311', '0312', '0313'],
                            series: [
                                {
                                    name: '吃早餐',
                                    data: [18, 40, 70, 40, 60, 35, 38]
                                },
                                {
                                    name: '吃午餐',
                                    data: [40, 40, 25, 60, 40, 35, 80]
                                },
                                {
                                    name: '吃晚餐',
                                    data: [10, 40, 65, 25, 60, 22, 35]
                                }
                            ]
                        }
                    }
                    return
                } else if(ident.value === 'isolated_people') {
                    response.value = {
                        ident: ident.value,
                        leftData: [
                            {
                                name: '刘好',
                                avatar: 'https://pit1.topit.pro/forum/202202/581112035819921.jpg'
                            },
                            {
                                name: '张瑶',
                                avatar: 'https://gw.alicdn.com/imgextra/i4/1074906482/O1CN012fzHI81xko9UdSqiP_!!1074906482.jpg_Q75.jpg_.webp'
                            },
                            {
                                name: '张露露',
                                avatar: 'https://m.shicimingju.com/upload/images/xiaz/2022/0218/1645148300461.jpg'
                            },
                            {
                                name: '李思思',
                                avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVVzYW3rn9i6fF0KkCUrVeX_Hs9_e1eQoWLw&usqp=CAU'
                            },
                            {
                                name: '欧阳德华',
                                avatar: 'https://upen.caup.net/ai_pics_mj/202303/1677952366325269.jpg'
                            },
                            {
                                name: '王大棒',
                                avatar: 'https://img.nanrentu.cc/listImg/c2023/06/20/lsykgb5dgmq.jpg'
                            },
                            {
                                name: '鳌拜',
                                avatar: 'https://attach.setn.com/newsimages/2020/11/22/2895891-PH.jpg'
                            },
                            {
                                name: '索尼',
                                avatar: 'https://pic1.zhimg.com/v2-31aa37c0b730e0ae1d592ab346dd878c_xl.jpg?source=32738c0c'
                            }
                        ],
                        rightData: {
                            xAxis: ['0307', '0308', '0309', '0310', '0311', '0312', '0313'],
                            series: [
                                {
                                    name: '共同进餐',
                                    data: [18, 40, 70, 40, 60, 35, 38]
                                },
                                {
                                    name: '共同学习',
                                    data: [40, 40, 25, 60, 40, 35, 80]
                                },
                                {
                                    name: '共同运动',
                                    data: [10, 40, 65, 25, 60, 22, 35]
                                }
                            ]
                        }
                    }
                    return
                } else if(ident.value === 'sudden_abnormal_behavior') {
                    response.value = {
                        ident: ident.value,
                        leftData: [],
                        rightData: {
                            
                        }
                    }
                    return
                }
                response.value = {
                    ident: res.data.ident || ident.value,
                    leftData: res.data.leftData || [],
                    rightData: res.data.rightData || []
                };
            }
        }
        onBeforeMount( async() => {
            await getData()
        })
        const componentView = computed(() => h(AnalyzeTemplate(
            modelComponent[ident.value],
            {
                params: response.value
            }
        ), {
            key: ident.value,
            ident: ident.value
        }))
        expose({getData})

        return () => {
            return <div class='analyze-view' v-loading={ vLoading.value } style={{'height': vLoading.value ? '350px' : 'auto'}}>
                {
                    response.value.ident && <componentView.value />
                }
            </div>
        }
    }
})

export default AnalyzeView


