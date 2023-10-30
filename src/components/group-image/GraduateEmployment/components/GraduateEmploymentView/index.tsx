import { defineComponent, reactive, ref, getCurrentInstance, onMounted, nextTick, PropType, defineAsyncComponent, provide  } from 'vue'
import RedTab from "@/components/common/RedTab.vue";
import { BaseParams } from "@/components/group-image/types";
import EducationDegreeAwarding from "./components/EducationDegreeAwarding"
import ThesisInfo from "./components/ThesisInfo"
import DestinationAfterGraduation from "./components/DestinationAfterGraduation"
import '../../index.scss'
import { RedTabConfig } from '@/components/common/Search';
import InstanceManager from '@/utils';

const GraduateEmploymentView = defineComponent({
    name: "graduateEmploymentView",
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        direction: {
            type: String as PropType<'horizontal' | 'vertical'>,
            default: 'horizontal'
        },
        selectList: {
            type: Array as PropType<RedTabConfig[]>,
            default: () => [
                {
                    value: 'Academic_Degrees_Awarded',
                    label: "学历学位授予情况"
                },
                {
                    value: 'Paper_Information',
                    label: "论文信息"
                },
                {
                    value: 'Destinative_distribution',
                    label: "毕业去向"
                }
            ]
        }
    },
    setup(props, content) {
        // const dataSource = usePortraitRequest(props.params)
        provide('InstanceManager',new InstanceManager())
        const selectList = reactive(props.selectList)
        const isActive = ref<string>(selectList[0].value as string)
        const activeLable = ref<string>('学历学位授予情况')

        const clickCls = (values: string) => {
            isActive.value = values;
            activeLable.value = selectList.find(it => it.value === values)?.label as string
        }

        const WarningSeal = defineAsyncComponent({
            loader: () => import('@/components/WarningSeal'),
            delay: 1000
        })
        
        return () => <>
            <div class={{
                'education-degree-awarding': true,
                'scholarship': true,
                'flex': true,
                'horizontal': props.direction === 'horizontal',
                'vertical': props.direction === 'vertical'
            }}>
                <WarningSeal name={activeLable.value} ident={isActive.value}/>
                <div class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}>
                    <header class="mg-b30">
                        <c-title title="基本信息画像" />
                        <RedTab btnList={ selectList } isActive={ isActive.value } onRedTabChange={clickCls} />
                    </header>
                    <section class="left" key={isActive.value}>
                        { isActive.value === 'Academic_Degrees_Awarded' && <EducationDegreeAwarding.Left params={ props.params } />}
                        { isActive.value === 'Paper_Information' && <ThesisInfo.Left  params={ props.params } /> }
                        { isActive.value === 'Destinative_distribution' && <DestinationAfterGraduation.Left params={ props.params } /> }
                    </section>
                </div>

                <div  class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}>
                    <header class="mg-b20">
                        <c-title title="特征分析" />
                    </header>
                    <section class="right" key={isActive.value} style="background: #F7F7F7">
                        { isActive.value === 'Academic_Degrees_Awarded' && <EducationDegreeAwarding.Right params={ props.params } />}
                        { isActive.value == 'Paper_Information' && <ThesisInfo.Right params={ props.params } /> }
                        { isActive.value === 'Destinative_distribution' && <DestinationAfterGraduation.Right params={ props.params } /> }
                    </section>
                </div>
            </div>
        </>
    }
})


export default GraduateEmploymentView
