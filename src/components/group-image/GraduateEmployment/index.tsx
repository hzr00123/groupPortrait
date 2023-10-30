import { defineComponent, ref, reactive, inject, shallowRef, watch, PropType, computed, provide } from 'vue'
import Tabs from '@/components/common/Tabs.vue'
import GraduateEmploymentView from './components/GraduateEmploymentView/index'
import CareerPlanning from './components/CareerPlanning/index'
import InnovationBusiness from './components/InnovationBusiness/index'
import PubMedSituation from './components/PubMedSituation/index'
import { WarnListType, WarnMenuListRes } from '@/api/types/attentionGroup'
import { BaseParams } from '../types'
import './index.scss'
import InstanceManager from '@/utils'

const GraduateEmployment = defineComponent({
  name: 'graduateEmployment',
  props: {
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    selectList: {
      type: Array as PropType<any[]>,
      default: () => [
        {
          key: 'Academic_Degrees_Awarded',
          label: '毕业就业',
          icon: 'byjy',
          show: false,
        },
        {
          key: 'Career_Planning',
          label: '职业规划',
          icon: 'zygh',
          show: false,
        },
        {
          key: 'Number_of_innovative_and_entrepreneurial_individuals',
          label: '创新创业',
          icon: 'cxcy',
          show: false,
        },
        {
          key: 'Number_of_candidates_for_postgraduate_entrance_examination',
          label: '考研情况',
          icon: 'kyqk',
          show: false,
        },
      ]
    },
    isActive: {
      type: String,
      default: 'Academic_Degrees_Awarded'
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    }
  },
  setup(props, content) {
    provide('InstanceManager', new InstanceManager())
    const isActive = ref<string>(props.isActive);
    const icons = {
      Academic_Degrees_Awarded: 'byjy',
      Career_Planning: 'zygh',
      Number_of_innovative_and_entrepreneurial_individuals: 'cxcy',
      Number_of_candidates_for_postgraduate_entrance_examination: 'kyqk'
    }
    const list = props.selectList.map(i => ({ ...i, icon: icons[i.key] }))
    const topBtnList = reactive(list)

    const chilrenList = computed(() => {
      const item = topBtnList.find(i => i.key === isActive.value)
      return item?.children
    })
    /**
     * 因为毕业就业与子模块名有一样的，ident也一样，所以这里用全部数据来筛选
     */
    const sealAllData = inject('sealAllData', ref<WarnMenuListRes>([]))
    watch(sealAllData, v => {
      if (v && v.length > 0) {
        const item = v.find(i => i.ident === 'Academic_Degrees_Awarded')?.children
        item && item.forEach(i => {
          const index = topBtnList.findIndex(it => it.key === i.ident)
          if (index !== -1) {
            topBtnList[index].warning = i.warnList
            topBtnList[index].show = true
          }
        })
      }
    }, { immediate: true, deep: true })

    return () => {
      const { params, direction } = props
      return <div class="graduate-employment">
        <Tabs topBtnList={topBtnList} isActive={isActive.value} onChangeClick={(v: string) => isActive.value = v} />
        {isActive.value === 'Academic_Degrees_Awarded' &&
          <GraduateEmploymentView params={params} selectList={chilrenList.value} direction={direction}/>}

        {isActive.value === 'Career_Planning' &&
          <CareerPlanning params={params} direction={direction}/>}

        {isActive.value === 'Number_of_innovative_and_entrepreneurial_individuals' &&
          <InnovationBusiness params={params} selectList={chilrenList.value} direction={direction} />}

        {isActive.value === 'Number_of_candidates_for_postgraduate_entrance_examination' &&
          <PubMedSituation params={params} selectList={chilrenList.value} direction={direction} />}
      </div>
    }
  }
})

export default GraduateEmployment