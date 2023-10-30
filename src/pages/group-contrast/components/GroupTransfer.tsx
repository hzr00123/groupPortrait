import { getGroupTypeDown, getGroupUserList } from "@/api/modules/studentPortrait";
import { ElOption, ElRadio, ElRadioGroup, ElSelect } from "element-plus";
import { cloneDeep } from "lodash";
import { nextTick, watch, defineComponent, PropType, reactive, ref, toRef, unref, onMounted } from "vue";
import SelectList from "./SlectList";
import './styles/GroupTransfer.scss'
import { GroupTransferValType } from "./types";

const GroupTransfer = defineComponent({
    props: {
        value: {
            type: Array as PropType<GroupTransferValType>,
            default: () => []
        }
    },
    setup(props, ctx) {
        const [left, right] = reactive(props.value)
        const groupTypeOptions = ref<Array<{ label: string, value: number }>>([])
        const groupUserOptions = ref<Array<{ label: string, value: string }>>([])
        const getValue = () => {
            const data = [left, right].map(i => ({ type: i.type, values: unref(i.values) }))
            return cloneDeep(data)
        }

        const validDate: () => { valid: boolean, data: GroupTransferValType } = () => {
            let valid = true
            const data = getValue()
            data.forEach(i => {
                i.values.forEach(v => {
                    for (const key in v) {
                        if (Object.prototype.hasOwnProperty.call(v, key)) {
                            const ele = v[key];
                            if (!ele) valid = false
                        }
                    }
                })
            })
            return {
                valid,
                data
            }
        }
        onMounted(async () => {
            const resMsg = await getGroupTypeDown({});
            if (resMsg.code == 1 && resMsg.data && resMsg.data.groupTypeList) {
                groupTypeOptions.value = resMsg.data.groupTypeList.map((i: { lookup_name: string; id: number; }) => ({ label: i.lookup_name, value: i.id }));
            }
            const re = await getGroupUserList({});
            if (re.code == 1) {
                groupUserOptions.value = re.data.map((i: { user_group_name: string; }) => ({ label: i.user_group_name, value: i.user_group_name }))
            }
        })

        const groupTypechange = async (v: { label?: string, value: number | string }, type: 'left' | 'right') => {
            if (type === 'left') left.values[0].userGroupDescription = null
            if (type === 'right') right.values[0].userGroupDescription = null
            const re = await getGroupUserList({ user_group_type: v.value });
            if (re.code == 1) {
                groupUserOptions.value = re.data.map((i: { user_group_name: string; }) => ({ label: i.user_group_name, value: i.user_group_name }))
            }
        }
        ctx.expose({
            getValue,
            validDate
        })
        return () => {
            return (
                <div class={'group-transfer'}>
                    <section class={'tra-left'}>
                        <header>添加群体</header>
                        <main>
                            <ElRadioGroup class={'mg-b10'} v-model={left.type} onChange={v => {
                                if (v === 1) left.values = [{ type: { }, equal: '=' }]
                                else left.values = [{ userGroupType: null, userGroupDescription: null }]
                            }}>
                                <ElRadio label={1}>从学生基本信息中选择字段筛选人群</ElRadio>
                                <ElRadio label={2}>从关注人群中直接选择某一群体</ElRadio>
                            </ElRadioGroup>
                            {
                                left.type === 1
                                    ?
                                    <SelectList v-model={left.values} key={'left' + left.type} />
                                    :
                                    <>
                                        <ElSelect
                                            placeholder='请选择用户群类型'
                                            v-model={left.values[0].userGroupType}
                                            onChange={v => {
                                                groupTypechange(v, 'left')
                                            }}
                                        >
                                            {
                                                groupTypeOptions.value.map(i => {
                                                    return <ElOption label={i.label} value={i} />
                                                })
                                            }
                                        </ElSelect>
                                        <ElSelect placeholder='请选择用户群' v-model={left.values[0].userGroupDescription}>
                                            {
                                                groupUserOptions.value.map(i => {
                                                    return <ElOption label={i.label} value={i} />
                                                })
                                            }
                                        </ElSelect>
                                    </>
                            }
                        </main>
                    </section>
                    <span class={'vs-tag'}>vs</span>
                    <section class={'tra-right'}>
                        <header>添加对比用户群</header>
                        <main>
                            <ElRadioGroup class={'mg-b10'} v-model={right.type} onChange={v => {
                                if(v === 1) right.values = [{ type: {}, equal: '=' }]
                                else right.values = [{ userGroupType: null, userGroupDescription: null }]
                            }}>
                                <ElRadio label={1}>从学生基本信息中选择字段筛选人群</ElRadio>
                                <ElRadio label={2}>从关注人群中直接选择某一群体</ElRadio>
                            </ElRadioGroup>
                            {
                                right.type === 1
                                    ?
                                    <SelectList v-model={right.values} />
                                    :
                                    <>
                                        <ElSelect
                                            placeholder='请选择用户群类型'
                                            v-model={right.values[0].userGroupType}
                                            onChange={v => {
                                                groupTypechange(v, 'right')
                                            }}
                                        >
                                            {
                                                groupTypeOptions.value.map(i => {
                                                    return <ElOption label={i.label} value={i} />
                                                })
                                            }
                                        </ElSelect>
                                        <ElSelect placeholder='请选择用户群' v-model={right.values[0].userGroupDescription}>
                                            {
                                                groupUserOptions.value.map(i => {
                                                    return <ElOption label={i.label} value={i} />
                                                })
                                            }
                                        </ElSelect>
                                    </>
                            }
                        </main>
                    </section>
                </div>
            )
        }
    }
})

export default GroupTransfer