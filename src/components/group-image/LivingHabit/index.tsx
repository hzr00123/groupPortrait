
import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, provide, computed } from "vue"
import Tabs from '@/components/common/Tabs.vue'
import { BaseParams } from '../types'
import BathingHabits from './components/BathingHabits'
import EatingHabits from './components/EatingHabits'
import DormitoryMange from './components/DormitoryMange'
import RuleOfLife from './components/RuleOfLife'
import SleepAndRest from './components/SleepAndRest'
import { TabsConfig } from "@/components/common/Search"
import InstanceManager from "@/utils"
import { WarnMenuListRes } from "@/api/types/attentionGroup"


const LivingHabit = defineComponent({
  props: {
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    selectList:{
      type: Array as PropType<TabsConfig[]>,
      default: [
        {
          key: 'Bathing_frequency',
          label: '洗澡习惯',
          icon: 'xi-zao-xi-guan',
          show: false
        },
        {
          key: 'Breakfast_rate',
          label: '饮食习惯',
          icon: 'yin-shi-xi-guan',
          show: false
        },
        {
          key: 'Sleep_and_rest',
          label: '作息睡眠',
          icon: 'zuo-xi-shui-mian',
          show: false
        },
        {
          key: 'Dormitory_management',
          label: '宿舍管理',
          icon: 'su-she-guan-li',
          show: false
        },
        {
          key: 'Lifestyle_population',
          label: '生活规律',
          icon: 'shen-huo-gui-lv',
          show: false
        }
      ]
    },
    isActive:{
      type: String,
      default: 'Bathing_frequency'
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
  },
  setup(props, content) {
    const active = ref(props.isActive)
    const topBtnList = reactive(props.selectList)
    provide('InstanceManager', new InstanceManager())
    watch(()=> content.attrs.warning as WarnMenuListRes, v=>{
      if(v && v.length > 0){
        v.forEach(i => {
          const index = topBtnList.findIndex((v:any) => v.label === i.catalog_name)
          if (index !== -1) {
              topBtnList[index].show = true
          }
      })
      }
    }, { immediate: true, deep: true })
    const chilrenList = computed(()=> {
        const item: any = topBtnList.find(i => i.key === active.value)
        return item?.children
    })
    const renderDom = (val: string) => {
      switch (val) {
        case 'Bathing_frequency':
          return <BathingHabits params={props.params} direction={props.direction} selectList={chilrenList.value as any}/>
        case 'Breakfast_rate':
          return <EatingHabits params={props.params}  direction={props.direction} selectList={chilrenList.value as any}/>
        case 'Sleep_and_rest':
          return <SleepAndRest params={props.params}  direction={props.direction} />
        case 'Dormitory_management':
            return <DormitoryMange params={props.params}  direction={props.direction} />
        case 'Lifestyle_population':
          return <RuleOfLife params={props.params}  direction={props.direction} selectList={chilrenList.value as any}/>

      }
    }
    return () => {
      return <div class='LivingHabit'>
        <Tabs topBtnList={topBtnList} isActive={active.value} onChangeClick={(v: string) => active.value = v} />
        {
          renderDom(active.value)
        }

      </div>
    }
  }
})

export default LivingHabit

