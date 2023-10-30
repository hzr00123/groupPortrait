
import { defineComponent, PropType, reactive, ref, watch, shallowRef, computed, shallowReactive, KeepAlive, provide } from "vue"
import Tabs from '@/components/common/Tabs.vue'
import { BaseParams } from '../types'
import DurationFlowRate from './components/DurationFlowRate'
import OnlineContent from './components/OnlineContent'
import OnlineLocation from './components/OnlineLocation'
import NetDiversity from './components/NetDiversity'
import './index.scss'
import { WarnMenuListRes } from "@/api/types/attentionGroup"
import { TabsConfig } from "@/components/common/Search"
import InstanceManager from "@/utils"

const OnlineBehavior = defineComponent({
  props: {
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    selectList: {
      type: Array as PropType<TabsConfig[]>,
      default: [
        {
          key: 'Online_behavior_duration',
          label: '时长流量',
          icon: 'shi-chang-liu-liang',
          show: false,
        },
        {
          key: 'Online_behavior_content',
          label: '上网内容',
          icon: 'shang-wang-nei-rong',
          show: false,
        },
        {
          key: 'Online_behavior_location',
          label: '上网地点',
          icon: 'shang-wang-di-dian',
          show: false,
        },
        {
          key: 'Online_behavior_discrepancy',
          label: '上网差异',
          icon: 'shang-wang-cha-yi',
          show: false,
        }
      ]
    },
    isActive: {
      type: String,
      default: 'Online_behavior_duration'
    },
    direction: {
      type: String as PropType<"vertical" | "horizontal">,
      default: 'horizontal'
    }
  },
  setup(props, content) {
    provide('InstanceManager', new InstanceManager())
    const icons = {
      Online_behavior_duration: 'shi-chang-liu-liang',
      Online_behavior_content: 'shang-wang-nei-rong',
      Online_behavior_location: 'shang-wang-di-dian',
      Online_behavior_discrepancy: 'shang-wang-cha-yi'
    }
    const list: any[] = props.selectList.map(i => ({ ...i, icon: icons[i.key] }))
    const active = ref(list[0].key as string)
    const topBtnList = reactive(list)
    const renderDom = (val: string) => {
      const chilrenList = computed(() => {
        const item = topBtnList.find(i => i.key === active.value)
        return item?.children
      })
      switch (val) {
        case 'Online_behavior_duration':
          return <DurationFlowRate params={props.params} direction={props.direction} selectList={chilrenList.value} />
        case 'Online_behavior_content':
          return <OnlineContent params={props.params} direction={props.direction} />
        case 'Online_behavior_location':
          return <OnlineLocation params={props.params} />
        case 'Online_behavior_discrepancy':
          return <NetDiversity params={props.params} direction={props.direction} selectList={chilrenList.value} />
      }
    }

    watch(() => content.attrs.warning as WarnMenuListRes, v => {
      if (v && v.length > 0) {
        v.forEach(i => {
          const index = topBtnList.findIndex(v => v.label === i.catalog_name)
          if (index !== -1) {
            topBtnList[index].show = true
          }
        })
      }
    }, { immediate: true, deep: true })
    return () => {
      return <div class='OnlineBehavior'>
        <Tabs topBtnList={topBtnList} isActive={active.value} onChangeClick={(v: string) => active.value = v} />
        {/* <KeepAlive include='OnlineLocation'> */}
          {
            renderDom(active.value as string)
          }
        {/* </KeepAlive> */}

      </div>
    }
  }
})

export default OnlineBehavior

