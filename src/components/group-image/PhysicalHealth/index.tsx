import { defineComponent, watch, reactive, ref, PropType, provide, } from "vue"
import Tabs from '@/components/common/Tabs.vue'
import HealthEvaluation from './components/HealthEvaluation'
import SchoolHospital from './components/SchoolHospital'
import { WarnMenuListRes } from "@/api/types/attentionGroup"
import { BaseParams } from "../types"
import { TabsConfig } from "@/components/common/Search"
import InstanceManager from "@/utils"

const PhysicalHealth = defineComponent({
  props: {
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    selectList:{
      type: Array as PropType<TabsConfig[]>,
      default: [
        {
          key: 'Health_assessment',
          label: '健康测评',
          icon: 'jian-kang-ce-pin',
          show: false
        },
        {
          key: 'school_hospital',
          label: '校医院',
          icon: 'xiao-yi-yuan',
          show: false
        },
      ]
    },
    isActive:{
      type: String,
      default: 'Health_assessment'
    }
  },
  setup(props, content) {
    provide('InstanceManager', new InstanceManager())
    const active = ref(props.isActive)
    const icons = {
      Health_assessment: 'jian-kang-ce-pin',
      school_hospital: 'xiao-yi-yuan'
    }
    const list = props.selectList.map(i => ({...i, icon: icons[i.key]}))
    const topBtnList = reactive<TabsConfig[]>(list)
    watch(()=> content.attrs.warning as WarnMenuListRes, v=>{
      if(v && v.length > 0){
        v.forEach(i => {
          const index = topBtnList.findIndex((v:any) => v.label === i.catalog_name)
          if (i.warnList && i.warnList.length > 0 && index !== -1) {
              topBtnList[index].show = true
          }
      })
      }
    }, { immediate: true, deep: true })
    const renderDom = (val: string) => {
      switch (val) {
        case 'Health_assessment':
          return <HealthEvaluation params={props.params} direction={props.direction}/>
        case 'school_hospital':
          return <SchoolHospital params={props.params} direction={props.direction}/>
      }
    }
    return () => {
      return <div class='PhysicalHealth'>
        <Tabs topBtnList={topBtnList} isActive={active.value} onChangeClick={(v: string) => active.value = v} />
        {
          renderDom(active.value)
        }

      </div>
    }
  }
})

export default PhysicalHealth