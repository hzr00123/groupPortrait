import { getOrgType } from "@/api/modules/emphasisList";
import { getBaseInfo } from "@/api/modules/studentPortrait";
import { CircleClose, CirclePlus } from "@element-plus/icons-vue";
import { ElButton, ElCol, ElOption, ElRow, ElSelect } from "element-plus";
import { cloneDeep } from "lodash";
import { computed, defineComponent, onBeforeMount, onMounted, PropType, reactive, ref, unref, watch } from "vue";
import { SelectListVal } from "./types";

const SelectList = defineComponent({
    props: {
        modelValue: {
            type: Array as PropType<SelectListVal[]>,
            required: true,
            default: () => [[]]
        }
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        const values = ref<SelectListVal[]>([])
        const detailOptions = ref<Array<Array<{ label: string, value: number | string }>>>([])
        const typeDisable = ref<string[]>([])
        const baseInfoData = {}
        const orgTypeData = {}
        onBeforeMount(() => {
            if(props.modelValue.some(i => Object.prototype.hasOwnProperty.call(i, 'userGroupType'))) {
                unref(values).push({ type: {}, equal: '=' })
                return
            }
            if (props.modelValue.length < 1) unref(values).push({ type: {}, equal: '=' })
            else values.value = cloneDeep(props.modelValue)
        })
        onMounted(async () => {
            const infoRes = await getBaseInfo({})
            if (infoRes.code == 1) {
                for (const key in infoRes.data) {
                    if (Object.prototype.hasOwnProperty.call(infoRes.data, key)) {
                        const ele = infoRes.data[key] || [];
                        if (key === 'enrollType') baseInfoData[key] = ele.map((i: string) => ({ label: i, value: i }))
                        if (key === 'nation') baseInfoData[key] = ele.map((i: { nationName: string; nation: number; }) => ({ label: i.nationName, value: i.nation }))
                        if (key === 'politics') baseInfoData[key] = ele.map((i: { politicName: string; politics: number; }) => ({ label: i.politicName, value: i.politics }))
                        if (key === 'placeOrigin') baseInfoData[key] = ele.map((i: string) => ({ label: i, value: i }))
                        if (key === 'schoolYear') baseInfoData[key] = ele.map((i: string) => ({ label: i, value: i }))
                        if (key === 'semester') baseInfoData[key] = ele.map((i: string) => ({ label: i, value: i }))
                    }
                }
            }
            const orgRes = await getOrgType({})
            if (orgRes.code == 1 && orgRes.data) {
                orgTypeData['campusId'] = orgRes.data.campusOrgList.map((i: { orgName: string; id: string; }) => ({ label: i.orgName, value: i.id }))
                orgTypeData['classId'] = orgRes.data.classOrgList.map((i: { orgName: string; id: string; }) => ({ label: i.orgName, value: i.id }))
                orgTypeData['collegeId'] = orgRes.data.collegeOrgList.map((i: { orgName: string; id: string; }) => ({ label: i.orgName, value: i.id }))
                orgTypeData['gradeId'] = orgRes.data.gradeOrgList.map((i: { orgName: string; id: string; }) => ({ label: i.orgName, value: i.id }))
                orgTypeData['majorId'] = orgRes.data.majorOrgList.map((i: { orgName: string; id: string; }) => ({ label: i.orgName, value: i.id }))
            }
            values.value.forEach((i, index) => {
                typeChange(i.type as any, index)
            })
        })
        watch(() => values, v => {
            const disables: string[] = []
            unref(v).forEach(i => disables.push(i.type!['value']))
            typeDisable.value = disables
            ctx.emit('update:modelValue', v)
        }, { deep: true })
        //基本信息选项
        const basicInfoOptions = [
            { value: 'schoolYear', label: '学年' },
            { value: 'semester', label: '学期' },
            { value: 'campusId', label: '校区' },
            { value: 'collegeId', label: '学院' },
            { value: 'majorId', label: '专业' },
            { value: 'gradeId', label: '年级' },
            { value: 'classId', label: '班级' },
            { value: 'sex', label: '性别' },
            { value: 'nation', label: '民族' },
            { value: 'studentType', label: '培养层次' },
            { value: 'placeOrigin', label: '生源地' },
            { value: 'politics', label: '政治面貌' },
            { value: 'enrollType', label: '录取类型' },
        ]
        const typeChange = (type: { label?: string, value: number | string }, index: number) => {
            const data = values.value[index]
            if (data) {
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        if (key === 'type' || key === 'equal') continue
                        if (key !== type.value) delete data[key]
                    }
                }
            }
            const infoKeys = ['schoolYear', 'nation', 'placeOrigin', 'politics', 'enrollType']
            if (infoKeys.includes(type.value as string)) {
                detailOptions.value[index] = baseInfoData[type.value]
                return
            }
            const constKeys = ['semester', 'sex', 'studentType']
            if (constKeys.includes(type.value as string)) {
                switch (type.value) {
                    case 'semester':
                        detailOptions.value[index] = baseInfoData['semester']
                        return;
                    case 'sex':
                        detailOptions.value[index] = [
                            { label: '男', value: '男' },
                            { label: '女', value: '女' },
                        ]
                        return;
                    case 'studentType':
                        detailOptions.value[index] = [
                            { label: '本科生', value: 1 },
                            { label: '研究生', value: 2 },
                        ]
                        return;
                    default:
                        return;
                }
            }
            detailOptions.value[index] = orgTypeData[type.value]
        }


        const addEvt = () => {
            values.value.push({ type: '', equal: '=' })
        }

        const removeEvt = (index: number) => {
            values.value.splice(index, 1)
        }
        return () => {
            return (
                <>
                    {
                        values.value.map((i, index) => {
                            return (
                                <ElRow gutter={10} class='mg-b15' key={`select-item-${index}`}>
                                    <ElCol span={7}>
                                        <ElSelect v-model={i.type} onChange={v => typeChange(v, index)} key={'select1' + index}>
                                            {
                                                basicInfoOptions.map(i => {
                                                    return <ElOption label={i.label} value={i} disabled={typeDisable.value.includes(i.value)} />
                                                })
                                            }
                                        </ElSelect>
                                    </ElCol>
                                    <ElCol span={7}>
                                        <ElSelect v-model={i.equal} key={'select2' + index} >
                                            <ElOption label="=" value="=" />
                                            <ElOption label="≠" value="≠" disabled />
                                        </ElSelect>
                                    </ElCol>
                                    <ElCol span={7}>
                                        <ElSelect v-model={i[i.type!['value']]} key={'select3' + index} >
                                            {
                                                detailOptions.value[index] && detailOptions.value[index].map(i => {
                                                    return <ElOption label={i.label} value={i} />
                                                })
                                            }
                                        </ElSelect>
                                    </ElCol>
                                    <ElCol span={3}>
                                        {
                                            values.value.length > 1
                                                ?
                                                <div class={'h100 flex align-items-c just-a'}>
                                                    <div
                                                        style='cursor: pointer;'
                                                        onClick={addEvt}><el-icon size={20} color='#67C23A'
                                                        >
                                                            <CirclePlus /></el-icon>
                                                    </div>
                                                    <div
                                                        style='cursor: pointer;'
                                                        onClick={removeEvt.bind(null, index)}
                                                    >
                                                        <el-icon size={20} color='#F56C6C'><CircleClose /></el-icon>
                                                    </div>
                                                </div>
                                                :
                                                <div style='cursor: pointer;' class={'h100 flex align-items-c'} onClick={addEvt}>
                                                    <el-icon size={20} color='#67C23A'><CirclePlus /></el-icon>
                                                </div>
                                        }
                                    </ElCol>
                                </ElRow>
                            )
                        })
                    }
                </>
            )
        }
    }
})

export default SelectList