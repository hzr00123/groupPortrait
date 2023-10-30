import { MoreFilled, Plus } from "@element-plus/icons-vue";
import { defineComponent, ref, computed, onMounted, nextTick, reactive, PropType, watch, Teleport, Component, provide, unref, h, shallowRef } from "vue";
import { getGPCatalogList } from "@/api/modules/labelManagement";
import groupImage from "@/components/group-image"
import './CustomGroups.scss'
import { editGroupAnalysis } from "@/api/modules/attentionGroup";
import { ElMessage } from "element-plus";
import { BaseParams } from "@/components/group-image/types";
import { getDay } from "@/utils";

interface Tree {
    id: string | number,
    ident: string,
    label: string
    icon?: string,
    parent_id: string,
    children: Tree[]
}

interface DataProp {
    id: string,
    ident: string,
    gp_ident_left: string,
    gp_ident_right: string
}

interface BaseListType {
    label: string
    value: string
}

interface ConfigType {
    selectList: BaseListType[]
    params: BaseParams
    ident: string
}


const handleActive = (active: string) => {
    if(['sex_difference', 'Differences_in_College_Majors'].includes(active)) {
        return 'Grade_differences'
    } else if(['Dinner_rate', 'Three_meal_dining_rate', 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate'].includes(active)) {
        return 'Breakfast_rate'
    } else if(['Time_stability', 'Frequency_stability', 'Stability_of_Three_Meals_Amount'].includes(active)) {
        return 'Amount_stability'
    } else {
        return active
    }
}

const BaseComponent = <T extends Component>(WrappedComponent: T, config: ConfigType) => {
    return defineComponent({
        components: {
            WrappedComponent,
        },
        setup(props, { attrs }) {
            const isActive = ref('')
            provide('params', config.params)
            // if (unref(config.selectList) && unref(config.selectList)!.length > 0) isActive.value = unref(config.selectList)![0].value
            return () => h(WrappedComponent, {
                ...props,
                ...attrs,
                params: config.params,
                selectList: config.selectList,
                // isActive: unref(isActive),
            });
        }
    })
}

const CustomGroups = defineComponent({
    props: {
        data: {
            type: Object as PropType<DataProp>,
            default: () => ({
                id: "",
                ident: "",
                gp_ident_left: "",
                gp_ident_right: ""
            })
        },
        params: {
            type: Object as any,
            default: () => ({})
        }
    },
    emits: ['callBack'],
    setup(props, content) {
        const visible = ref<boolean>(false)
        const viewType = ref<string>('')
        const addFun = (type: string) => {
            viewType.value = type
            visible.value = true
        }

        const component = reactive<{leftView: any, leftIdent: string, rightView: any, rightIdent: string}>({
            leftView: null,
            leftIdent: "",
            rightView: null,
            rightIdent: ""
        })

        const confirm = (value: any, ident: string) => {
            component[viewType.value] = value;
            if(viewType.value === 'leftView') {
                component.leftIdent = ident
            } else {
                component.rightIdent = ident
            }
            submitGroupAnalysis()
            console.log(component);
        }


        const handleCommand = (command: string | number | object, type: string) => {
            if(command === 'del') {
                component[type] = null;
                type === 'leftView' ? component.leftIdent = "" : component.rightIdent = "";
                submitGroupAnalysis()
            }
        }

        const submitGroupAnalysis = async () => {
            const res = await editGroupAnalysis({ 
                id: props.data.id,
                gp_ident_left: component.leftIdent,
                gp_ident_right: component.rightIdent
            })
            try {
                if(res.code == 1) {
                    ElMessage.success('操作成功！')
                    content.emit('callBack', props.data.id)
                }
            } catch (error) {

            }
        }

        const handleSelectList = (ident: string) => {
            let selectList = [{ label: '', value: ident }]
            if(['Breakfast_rate', 'Dinner_rate', 'Three_meal_dining_rate', 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate'].includes(ident)) {
                return [{
                    label: '三餐规律度',
                    value: 'Breakfast_rate',
                    children: selectList
                }]
            }

            if(['Amount_stability', 'Time_stability', 'Frequency_stability', 'Stability_of_Three_Meals_Amount'].includes(ident)) {
                return [{
                    label: '金额稳定性',
                    value: 'Amount_stability',
                    children: selectList
                }]
            }
            if(['sex_difference', 'Differences_in_College_Majors',].includes(ident)) {
              return [{
                  label: '人群差异分析',
                  value: 'Grade_differences',
                  children: selectList
              }]
            }
            if(['Hanging_up', 'GPA'].includes(ident)) {
                return [{ label: ident === 'Hanging_up' ? '挂科' : '绩点', value: ident }]
            }

            if('Paper_Information' == ident) {
                return [
                    {
                        label: '论文开题',
                        value: 'Paper_Information'
                    },
                    {
                        label: '论文预答辩',
                        value: 'Thesis_Proposal'
                    },
                    {
                        label: '论文评阅',
                        value: 'Paper_Review'
                    },
                    {
                        label: '论文答辩',
                        value: 'Thesis_Defense'
                    }
                ]
            }
            return selectList
        }

        watch(() => props.data, (val: DataProp) => {
            component.leftIdent = val.gp_ident_left;
            component.rightIdent = val.gp_ident_right;
            if(val.gp_ident_left) {
                component.leftView = BaseComponent(groupImage[val.gp_ident_left]({
                    view: 'left', 
                    key: val.gp_ident_left, 
                    // params: props.params,
                    isActive: handleActive(val.gp_ident_left)
                }), {
                    selectList: handleSelectList(val.gp_ident_left),
                    ident: handleActive(val.gp_ident_left),
                    params: props.params
                })
            } else {
                component.leftView = null
            }

            if(val.gp_ident_right) {
                // component.rightView =  groupImage[val.gp_ident_right]({view: 'left', key: val.gp_ident_right});
                component.rightView = BaseComponent(groupImage[val.gp_ident_right]({
                    view: 'left', 
                    key: val.gp_ident_right, 
                    // params: props.params,
                    isActive: handleActive(val.gp_ident_right)
                }), {
                    selectList: handleSelectList(val.gp_ident_right),
                    ident: handleActive(val.gp_ident_right),
                    params: props.params
                })
            } else {
                component.rightView = null
            }
        }, { deep: true, immediate: true})

        return () => {
            return <div class="custom-groups">
                <el-row gutter={20}>
                    <el-col span={12}>
                        <div class="container">
                            { component.leftView &&
                                <Teleport to=".el-tabs__header">
                                    <el-dropdown class="operate-btn" onCommand={ (command: string | number | object) => handleCommand(command, 'leftView') }
                                        v-slots={{
                                            dropdown: () => {
                                                return <el-dropdown-menu>
                                                    <el-dropdown-item command="del">删除</el-dropdown-item>
                                                </el-dropdown-menu>
                                            }
                                        }}>
                                            <el-button style="padding: 10px 3px;height: 0;">
                                                <el-icon><MoreFilled /></el-icon>
                                            </el-button>
                                    </el-dropdown>
                                </Teleport>
                            }
                            
                            { !component.leftView ? 
                                <el-button icon={Plus} class="add-btn" onClick={ () => addFun('leftView') }>添加行为分析</el-button>
                                :
                                <component.leftView />
                            }
                        </div>
                    </el-col>
                    <el-col span={12}>
                        <div class="container">
                            { component.rightView &&
                                <Teleport to=".el-tabs__header">
                                    <el-dropdown class="operate-btn" onCommand={ (command: string | number | object) => handleCommand(command, 'rightView') }
                                        v-slots={{
                                            dropdown: () => {
                                                return <el-dropdown-menu>
                                                    <el-dropdown-item command="del">删除</el-dropdown-item>
                                                </el-dropdown-menu>
                                            }
                                        }}>
                                            <el-button style="padding: 10px 3px;height: 0;">
                                                <el-icon><MoreFilled /></el-icon>
                                            </el-button>
                                    </el-dropdown>
                                </Teleport>
                            }

                            { !component.rightView && component.leftView ? 
                                <el-button icon={Plus} class="add-btn" onClick={ () => addFun('rightView') }>添加行为分析</el-button>
                                :
                                <component.rightView />
                            }
                        </div>
                    </el-col>
                </el-row>


                { visible.value === true && <AddBehaviorAnalysis v-model:visible={visible.value} params={ {startTime: getDay(-30), endTime: getDay(0)} } onConfirm={ confirm } /> }
            </div>
        }
    }
})

const AddBehaviorAnalysis = defineComponent({
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        params: {
            type: Object as any,
            default: () => ({})
        }
    },
    emits: ['update:visible', 'confirm'],
    setup(props, content) {
        const dialogVisible = computed({
            get:() => {
                return props.visible
            },
            set:(visible: boolean) => {
                content.emit('update:visible', visible);
            }
        })
        const Loading = ref(false)
        const setLoading = (v: boolean)=>{
            Loading.value = v
        }
        provide('setLoding', setLoading)
        const treeList = ref([])

        const ident = ref<string>('Comprehensive_appearance');

        const Component = shallowRef()

        const initTreeList = async () => {
            const { data } = await getGPCatalogList()
            treeList.value = handleTree(data);
        }
        const handleTree = (tree: any) => {
            return tree.map((item: any) => {
                const newItem: Tree = {
                    id: item.id,
                    ident: item.ident,
                    label: item.catalog_name,
                    icon: 'file-icon',
                    children: item.children,
                    parent_id: item.parent_id
                }
                if (item.children && item.children.length > 0) {
                    newItem.children = handleTree(item.children);
                }
                if (!item.children.length) {
                    delete newItem['icon'];
                }
                return newItem
            })
        }

        const handleNodeClick = (data: Tree) => {
            ident.value = data.ident;
            nextTick(() => {
                Component.value = BaseComponent(groupImage[ident.value]({
                    view: 'left', 
                    key: ident.value,
                    isActive: handleActive(data.ident)
                }),  {
                    selectList: handleSelectList(data),
                    ident: handleActive(data.ident),
                    params: props.params
                })
            })
        }

        const handleSelectList = (data: Tree) => {
            let selectList = [{ label: data.label, value: data.ident }]
            if(['Breakfast_rate', 'Dinner_rate', 'Three_meal_dining_rate', 'Analysis_of_the_correlation_between_breakfast_dining_rate_and_main_meal_dining_rate'].includes(data.ident)) {
                return [{
                    label: '三餐规律度',
                    value: 'Breakfast_rate',
                    children: selectList
                }]
            }

            if(['Amount_stability', 'Time_stability', 'Frequency_stability', 'Stability_of_Three_Meals_Amount'].includes(data.ident)) {
                return [{
                    label: '金额稳定性',
                    value: 'Amount_stability',
                    children: selectList
                }]
            }
            if(['sex_difference', 'Differences_in_College_Majors',].includes(data.ident)) {
              return [{
                  label: '人群差异分析',
                  value: 'Grade_differences',
                  children: selectList
              }]
            }
            if(['Paper_Information',].includes(data.ident)){
              selectList =  [
                  {
                      label: '论文开题',
                      value: 'Paper_Information'
                  },
                  {
                      label: '论文预答辩',
                      value: 'Thesis_Proposal'
                  },
                  {
                      label: '论文评阅',
                      value: 'Paper_Review'
                  },
                  {
                      label: '论文答辩',
                      value: 'Thesis_Defense'
                  }
              ]
            }
        
            return selectList
        }

        const close = () => {
            dialogVisible.value = false
        }

        const confirm = () => {
            content.emit('confirm', Component.value, ident.value)
            dialogVisible.value = false;
        }

        content.expose({
            ident
        })

        onMounted(() => {
            initTreeList()
        })

        return () => {
            // const Component = groupImage[ident.value]({view: 'left', key: ident.value})
            // console.log(Component, 'Component', ident.value);
            
            return <el-dialog class="add-behavior-analysis"
            width="1100px"
            title="添加行为分析" 
            v-model={dialogVisible.value}
            v-slots={{
                footer: () => <span class="dialog-footer">
                    <el-button onClick={ close }>取消</el-button>
                    <el-button type="primary" onClick={ confirm }> 保存</el-button>
                </span>
            }}>
                <el-row gutter={20} class="behavior-analysis-container">
                    <el-col span={5} class="behavior-analysis-left">
                        <section>
                            <c-card-tree class="tree-container"
                            fistNode
                            isChildActive
                            treeList={ treeList.value }
                            activeColor="#1D538C"
                            onHandleNodeClick={ handleNodeClick }/>
                        </section>
                    </el-col>
                    <el-col span={19}>
                        <div class="charts-view">
                            <header>
                                <div class="c-title">图表样式预览</div>
                            </header>
                            <section v-loading={Loading.value}>
                                {/* { Component.value } */}
                                <Component.value />
                                {/* <EducationDegreeAwarding.Left {...props} /> */}
                            </section>
                        </div>
                    </el-col>
                </el-row>     
            </el-dialog>
        }
    }
})

export default CustomGroups