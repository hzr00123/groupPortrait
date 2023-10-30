import { ElButton, ElIcon, ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { defineComponent, getCurrentInstance, onMounted, PropType, ref, watchEffect } from 'vue';
import './styles/TagPreView.scss'
import { LabelType, WarningRuleEntity } from '@/api/types/labelManagement';
import { ChartData } from './types/TagPreview';
import { EChartsType } from 'echarts';
import { deleteLabel } from '@/api/modules/labelManagement';
import WarningDescription from '@/components/WarningDescription';
const TagPreView = defineComponent({
    name: 'TagPreView',
    inheritAttrs: false,
    props: {
        preview: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        config: {
            type: Object as PropType<Omit<LabelType, 'warningInfo'> & { warningInfo: WarningRuleEntity }>,
            default: {
                "id": undefined,
                "label_group_id": undefined,
                "firstLabel_id": undefined,
                "firstLabel": "",
                "secondLabel": "",
                "name": "",
                "label_explain": null,
                "attribute": "",
                "createUser": "",
                "createDate": "",
                "conditionids": "",
                "conditions": [],
                "freq": null,
                "freq_custom_day": null,
                "is_warning": null,
                "warning_rule_id": null,
                "warningInfo": null
            }
        }
    },
    emits: ['editClick'],
    setup(props, content) {
        const myecharts = ref()

        const removeClick = () => {
            ElMessageBox.confirm(
                '删除后，标签将无法找回，相关联的标签、关注人群、预警策略也将受到影响。确定删除？',
                '删除标签',
                {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(() => {
                deleteLabel(props.config.id).then(res => {
                    if (res.code == 1) {
                        ElMessage.success(res.msg)
                        if (typeof content.attrs.getTreeData === 'function') content.attrs.getTreeData()
                        if (typeof content.attrs.tree === 'function') content.attrs.tree()
                    }
                })
            }).catch(() => { })
        }

        const editClick = (step?: number) => {
            content.emit('editClick', step)
        }
        const strategyRender = () => {
            if (content.slots.default) {
                return content.slots.default()
            }

            if (props.config.warningInfo) {
                return <WarningDescription config={props.config.warningInfo} />
            }
            return <div class='flex just-c align-items-c w-100'>
                <ElButton onClick={editClick.bind(null, 4)} icon={Plus} color='#1C538B' plain>添加预警策略</ElButton>
            </div>
        }
        const instence = getCurrentInstance()
        const echarts = instence?.proxy?.$echarts
        type EChartsOption = echarts.EChartsOption;
        const labelStyle = {
            backgroundColor: '#F4F7FF',
            borderColor: '#005DA7',
            height: 40,
            borderRadius: 4,
            padding: [0, 18],
            borderWidth: '2px',
            borderType: 'solid',
            position: 'left',
            color: '#005DA7',
            verticalAlign: 'middle',
            align: 'center'
        }
        const labelStyle_2 = {
            ...labelStyle,
            backgroundColor: '#FFFFFF',
            borderColor: '#D6DCE0',
            color: '#203449',
            width: 600
        }
        const data = ref<ChartData>({
            name: '',
            label: labelStyle,
            children: []
        })

        let myChart: EChartsType | undefined

        const initEchart = () => {
            const ele: HTMLElement = myecharts.value
            if (ele) {
                let length = 0
                if (data.value.children) {
                    length = data.value.children!.length
                } else length = 1
                ele.style.height = `${length * 80}px`
                const option: EChartsOption = {
                    series: [
                        {
                            type: 'tree',
                            id: 0,
                            name: 'tree1',
                            data: [data.value] as any[],
                            top: '10%',
                            left: '60px',
                            bottom: '0',
                            right: '40%',
                            symbol: 'none',
                            edgeShape: 'polyline',
                            edgeForkPosition: 0,
                            expandAndCollapse: false,
                            initialTreeDepth: 2,
                            lineStyle: {
                                width: 1,
                                color: '#005DA7'
                            },
                            leaves: {
                                label: {
                                    position: 'right',
                                    verticalAlign: 'middle',
                                    align: 'left'
                                }
                            },
                            animationDuration: 550,
                            animationDurationUpdate: 750
                        }
                    ]
                };
                myChart?.setOption(option)
                myChart?.resize()
            }
        }
        onMounted(() => {
            const ele: HTMLElement = myecharts.value
            myChart = echarts?.init(ele, undefined, { renderer: 'svg' });
        })

        watchEffect(() => {
            const { conditions } = props.config
            if (conditions && conditions.length > 0) {
                if (conditions.length == 1) {
                    data.value = conditions.map(i => {
                        let name = `“${i.name}” ${i.relation} “${i.value1}”`
                        if (i.type !== 1 && i.type !== 2)
                            name = `“${i.name}” ${i.trueOrFalse === 'true' ? '为真' : '为假'}`
                        if (i.relation === '区间') name = `“${i.name}” ${i.relation} “${i.value1}” ~ “${i.value2}”`
                        return { name, label: { ...labelStyle_2, position: [420, '0%'] } }
                    })[0]
                } else {
                    data.value.name = conditions[0].operator === 'and' ? '同时满足' : '任一满足'
                    data.value.label = labelStyle
                    data.value.children = conditions.map(i => {
                        let name = `“${i.name}” ${i.relation} “${i.value1}”`
                        if (i.type !== 1 && i.type !== 2) {
                            name = `“${i.name}” ${i.trueOrFalse === 'true' ? '为真' : '为假'}`
                        }
                        if (i.relation === '区间') name = `“${i.name}” ${i.relation} “${i.value1}” ~ “${i.value2}”`
                        return { name, label: labelStyle_2 }
                    })
                }
            } else {
                data.value = {}
            }
            initEchart()
        })
        let className = 'right-section'
        if (props.preview) className += ' preview'
        // const tableData = ref([])
        return () => {
            const { loading, config: { name, firstLabel, freq, freq_custom_day, secondLabel, attribute, createDate, createUser, label_explain, warningInfo } } = props
            const renderFreq = () => {
                if (!freq) return
                if (freq !== 6) {
                    switch (freq) {
                        case 1:
                            return (<>
                                <span>每日</span>
                                <span class='divider' />
                            </>);

                        case 2:
                            return (<>
                                <span>每周</span>
                                <span class='divider' />
                            </>);

                        case 3:
                            return (<>
                                <span>每月</span>
                                <span class='divider' />
                            </>);

                        case 4:
                            return (<>
                                <span>每学期</span>
                                <span class='divider' />
                            </>);

                        default:
                            return (<>
                                <span>每学年</span>
                                <span class='divider' />
                            </>);
                    }
                } else {
                    return (<>
                        <span>{freq_custom_day} 天</span>
                        <span class='divider' />
                    </>)
                }
            }
            return <>
                <section class={className} v-loading={loading}>
                    <div class="right-top">
                        <div class="header mg-b20">
                            <div class="tag">预置标签</div>
                            <div class="des flex align-items-c">
                                <span class='divider' />
                                <span>{firstLabel}-{secondLabel}</span>
                                <span class='divider' />
                                <span>{attribute}</span>
                                <span class='divider' />
                                {
                                    renderFreq()
                                }
                                {
                                    createUser && <span class='create-user'>{createUser} 创建于 </span>
                                }
                                <span>{createDate} </span>
                            </div>
                        </div>
                        <div class="main-cm">
                            <div class="main-title mg-b20">
                                <span class="text">{name}</span>
                                {
                                    !props.preview &&
                                    <>
                                        <span onClick={() => editClick()}>
                                            <ElIcon class="mr" color="#1B528B">
                                                <Edit />
                                            </ElIcon>
                                        </span>
                                        <span onClick={removeClick}>
                                            <ElIcon class="mr" color="#B22924">
                                                <Delete />
                                            </ElIcon>
                                        </span></>
                                }
                            </div>
                            <div class="title-sb">{label_explain}</div>
                            <div class="svg-img" ref={myecharts}></div>
                        </div>
                    </div>
                    <div class="right-bottom">
                        <div class="header">
                            预警策略
                        </div>
                        <div class="main-cm">
                            {
                                warningInfo && warningInfo.warning_policy_name &&
                                <div class={'c-title mg-b20'}>{warningInfo.warning_policy_name}</div>
                            }
                            <div class="cm-strategy">
                                {strategyRender()}
                            </div>
                        </div>
                    </div>
                </section>
            </>
        }
    }

})

export default TagPreView