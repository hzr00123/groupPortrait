import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, onUnmounted, provide, toRefs } from "vue"
import { BaseParams } from "../../types";
import { usePortraitRequest } from "@/hooks";
import '../index.scss'
import RedTab from '@/components/common/RedTab.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import BarLegend from '@/components/common/BarLegend.vue';
import BarMultiSegment from '@/components/common/BarMultiSegment.vue';
import WordCloud from '@/components/common/WordCloud.vue'
import { MultiSegmentConf, ProgressConf, WordCloudConfig } from '@/components/common/Search'
import WarningSeal from "@/components/WarningSeal";
import InstanceManager from "@/utils";
const LeftView = defineComponent({
  props: {
    selectList: {
      type: Array as PropType<any[]>,
      default: ()=> [
        {
          value: 'Online_behavior_discrepancy_sex',
          label: "性别"
        },
        {
          value: 'Online_behavior_discrepancy_major',
          label: "专业"
        },
        {
          value: 'Online_behavior_discrepancy_college',
          label: "学院"
        },
      ]
    }
  },
  setup(props, content) {
    const params = inject<BaseParams>('params', {} as any)
    const instanceManager = inject<InstanceManager>('InstanceManager')
    const selectList = reactive(props.selectList)
    const isClsActive = ref(props.selectList[0].value as string)
    const redTabChange = (v: string) => {
      isClsActive.value = v
    }
    const response = ref({})
    const manOption = reactive<ProgressConf>({
      list: [],
      color: '#005DA7',
      lableWidth: 86,
      lableAlign: 'left',
      unit: '%',
      height: "290px"
    })
    const womanOption = reactive<ProgressConf>({
      list: [],
      color: '#C0534F',
      lableWidth: 86,
      lableAlign: 'left',
      unit: '%',
      height: "290px"
    })
    const colors = ["#F39D12", "#B22924", "#8C6C4E", "#00C9F2", "#005DA7"]
    const MajorOption = reactive<MultiSegmentConf>({
      list: [],
      colorList: [],
      unit: '人',
      lableAlign: 'right',
      lableWidth: '138px',
      height: '200px'
    })
    const majorBarOption = reactive({
      list: [],
      color: '#005DA7',
      lableWidth: 160,
      lableAlign: 'right',
      unit: '',
      height: '200px'
    })
    onMounted(() => {
      instanceManager?.register('isClsActiveData', isClsActive)
      instanceManager?.register('NetDiversityData', response)
    })
    const WarningSealName = (val: string) => {
      let str = ''
      selectList.forEach((item) => {
        if (val == item.value) {
          str = item.label
        }
      })
      return str
    }
    const renderOne = () => {
      return <><div class="c-title mt18">上网差异</div>
        <div class='ProgressBar-box sb'>
          <div class='ProgressBar-box-l'>
            <ProgressBar class='mg-b30' option={manOption} />
            <div class='text'>男性</div>
          </div>
          <div class='ProgressBar-box-r'>
            <ProgressBar class='mg-b30' option={womanOption} />
            <div class='text'>女性</div>
          </div>
        </div></>
    }
    const renderTwo = () => {
      return <><div class="c-title mt18">上网时长差异</div>
        <div class='ProgressBar-box-two'>
          <ProgressBar class='mg-b30' option={majorBarOption} />
        </div>
        <div class="sb mb10">
          <div class="c-title">上网偏好内容差异</div>
          <BarLegend legendList={MajorOption.colorList} />
        </div>
        <BarMultiSegment options={MajorOption} />
      </>
    }
    const renderThree = () => {
      return <><div class="c-title mt18">上网时长差异</div>
        <div class='ProgressBar-box-two'>
          <ProgressBar class='mg-b30' option={majorBarOption} />
        </div>
        <div class="sb mb10">
          <div class="c-title">上网偏好内容差异</div>
          <BarLegend legendList={MajorOption.colorList} />
        </div>
        <BarMultiSegment options={MajorOption} />
      </>
    }
    const renderDom = (key: string) => {
      switch (key) {
        case 'Online_behavior_discrepancy_sex':
          return renderOne()
        case 'Online_behavior_discrepancy_major':
          return renderTwo()
        case 'Online_behavior_discrepancy_college':
          return renderThree()
      }
    }
    onUnmounted(() => {
      instanceManager?.clear('isClsActiveData')
      instanceManager?.clear('NetDiversityData')
    })
    const dataSource = usePortraitRequest({...toRefs(params!) as any, ident: isClsActive }, isClsActive)
    watch(isClsActive, (val) => {
      if (val == 'Online_behavior_discrepancy_sex') {
        manOption.list = []
        womanOption.list = []
      } else {
        MajorOption.list = []
        MajorOption.colorList = []
        majorBarOption.list = []
      }
      if (val == 'Online_behavior_discrepancy_college') {

      }
    }, { deep: true })
    watch(dataSource, (res) => {
      response.value = res
      if (res.code != 1) {
        if (isClsActive.value == 'Online_behavior_discrepancy_sex') {
          manOption.list = []
          womanOption.list = []
        } else {
          MajorOption.list = []
          MajorOption.colorList = []
          majorBarOption.list = []
        }
        return
      }
      if (isClsActive.value == 'Online_behavior_discrepancy_sex') {
        const { man, woman } = res.data
        manOption.list = man.map((item: any, index: number) => {
          if (index != 0) {
            item.value = item.rate
          }
          return item
        })
        manOption.list[0].unit = 'h'
        womanOption.list = woman.map((item: any, index: number) => {
          if (index != 0) {
            item.value = item.rate
          }
          return item
        })
        womanOption.list[0].unit = 'h'
      } else {
        const { contentDifference, timeDifference } = res.data
        MajorOption.list = contentDifference.series
        let newColor: any[] = []
        MajorOption.colorList = contentDifference.x.map((item: any, index: number) => {
          newColor.push(colors[index % 5])
          return { color: newColor[index], label: item }
        })
        majorBarOption.list = timeDifference
        majorBarOption.unit = 'h'
      }

    }, { immediate: true, deep: true })
    return () => {
      return <div class='net-diversity-left'  {...content.attrs}>
        <section class='left-content'>
          <div class='sb'>
            <c-title title="基本信息画像" />
            <RedTab btnList={selectList} isActive={isClsActive.value} onRedTabChange={redTabChange} />
          </div>
          {
            renderDom(isClsActive.value)
          }
        </section>
        <WarningSeal name={WarningSealName(isClsActive.value)} ident={isClsActive.value} />
      </div>
    }
  }
})

const RightView = defineComponent({
  setup(props, content) {
    const instanceManager = inject<InstanceManager>('InstanceManager')!
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const isClsActive = instanceManager.get('isClsActiveData')
    const dataSource = instanceManager.get('NetDiversityData')
    const RightData = ref<{ [key: string | symbol]: any }>()
    const cardConfig = ref(
      [
        {
          color: '#005DA7',
          title: '最高上网时长',
          value: '22.01',
          value2: '22.01',
        },
        {
          color: '#F39702',
          title: '最低上网时长',
          value: '22.01',
          value2: '22.01',
        }
      ]
    )
    const wordCloudObj = reactive<WordCloudConfig>({
      data1: [],
      data2: [],
      data3: [],
      position: 'center',
    })
    const barConfig = ref(
      [
        {
          color: '#005DA7',
          title: '最高时长',
          value: '',
          name: '',
        },
        {
          color: '#DDAB1F',
          title: '最低时长',
          value: '',
          name: '',
        }
      ]
    )
    const barConfig2 = ref(
      [
        {
          color: '#45A0E6',
          title: '共同关注',
          value: '',
        },
        {
          color: '#B22924',
          title: '小众关注',
          ratio: '',
          value: '',
          name: '',
        }
      ]
    )
    const renderOne = () => {
      return <><div class="c-title">男女上网时长差异</div>
        <div class="sb one-top-box">
          {
            cardConfig.value.map(item => {
              return <div class="one-top" style={{ '--color': item.color }}>
                <div class="title">{item.title}</div>
                <div class="bottom">
                  <div class="l" >男生<span>{item.value}h</span> </div>
                  <div class="r">女生<span>{item.value2}h</span></div>
                </div>
              </div>
            })
          }

        </div>
        <div class='text'>男生上网时长 <span>{RightData.value?.manAvg}h</span>&nbsp;女生上网时长 <span>{RightData.value?.womanAvg}h</span></div>
        <div class="c-title mt5"> 男女上网偏好内容差异</div>
        <div style="width:467px;margin:10px auto;">
          <WordCloud wordCloudObj={wordCloudObj} />
        </div>
        <div class='text'>男生偏好 <span>{RightData.value?.manWordCloudMax}</span>&nbsp;女生偏好 <span>{RightData.value?.womanWordCloudMax}</span>&nbsp;男女都关注<span>{RightData.value?.manAndWomanWordCloudMax}</span></div>
      </>
    }
    const renderTwo = () => {
      return <><div class="c-title">各专业上网时长差异</div>
        <div class="column list-item-box">
          {
            barConfig.value.map(item => {
              return <><div class="list-item flex-start" style="background: #fff;">
                <div class="tag" style={{ background: item.color }}>
                  {item.title}
                </div>
                <div class="msg-box">
                  <span class="bold">{item.name}</span>&nbsp; 上网时长 <span class="bold">{item.value}</span>h
                </div>
              </div>
              </>
            })
          }

        </div>
        <div class='text'><span>{RightData.value?.aboveAvg}</span>个&nbsp;专业上网时长高于学校平均时长</div>
        <div class="c-title mt30"> 各专业上网偏好内容差异</div>
        <div style="width:467px;margin:10px auto;">
          <WordCloud wordCloudObj={wordCloudObj} />
        </div>
        <div class='text'>理工科偏好 <span>{RightData.value?.lkMax}</span>&nbsp;文科偏好 <span>{RightData.value?.wkMax}</span>&nbsp;各专业都关注<span>{RightData.value?.wklkMax}</span></div>
      </>
    }
    const renderThree = () => {
      return <><div class="c-title">各学院上网时长差异</div>
        <div class="column list-item-box">
          {
            barConfig.value.map(item => {
              return <><div class="list-item flex-start" style="background: #fff;">
                <div class="tag" style={{ background: item.color }}>
                  {item.title}
                </div>
                <div class="msg-box">
                  <span class="bold">{item.name}</span>&nbsp; 上网时长 <span class="bold">{item.value}</span>h
                </div>
              </div>
              </>
            })
          }

        </div>
        <div class='text'><span>{RightData.value?.aboveAvg}</span>个&nbsp;学院上网时长高于学校平均时长</div>
        <div class="c-title mt30"> 各学院上网偏好内容差异</div>
        <div class="column list-item-box">
          {
            barConfig2.value.map((item, index) => {
              return <><div class="list-item flex-start" style="background: #fff;">
                <div class="tag" style={{ background: item.color }}>
                  {item.title}
                </div>
                {
                  index == 0 ? <div class="msg-box">各学院都关注 <span class="bold">{item.value}</span></div>
                    :
                    <div class="msg-box">
                      <span class="bold">{item.name}</span> 有<span class="bold">{item.ratio}</span>% 学生关注 <span class="bold">{item.value}</span>
                    </div>
                }
              </div>
              </>
            })
          }
        </div>
      </>
    }
    const renderDom = (key: string) => {
      switch (key) {
        case 'Online_behavior_discrepancy_sex':
          return renderOne()
        case 'Online_behavior_discrepancy_major':
          return renderTwo()
        case 'Online_behavior_discrepancy_college':
          return renderThree()
      }
    }
    watch(isClsActive, (val) => {
      if (val != 'Online_behavior_discrepancy_college') {
        wordCloudObj.data1 = []
        wordCloudObj.data2 = []
        wordCloudObj.data3 = []
        wordCloudObj.leftText = ' '
        wordCloudObj.rightText = ' '
      }
      RightData.value = {}
      if (val == 'Online_behavior_discrepancy_sex') {
        cardConfig.value[0].value = ''
        cardConfig.value[0].value2 = ''
        cardConfig.value[1].value = ''
        cardConfig.value[1].value2 = ''
      } else {
        barConfig.value[0].name = ''
        barConfig.value[0].value = ''
        barConfig.value[1].name = ''
        barConfig.value[1].value = ''
      }
      if (val == 'Online_behavior_discrepancy_college') {
        barConfig2.value[0].value = ''
        barConfig2.value[1].ratio = ''
        barConfig2.value[1].value = ''
        barConfig2.value[1].name = ''
      }
    }, { deep: true })
    watch(dataSource, (res) => {
      if (res.code != 1) {
        if (isClsActive.value != 'Online_behavior_discrepancy_college') {
          wordCloudObj.data1 = []
          wordCloudObj.data2 = []
          wordCloudObj.data3 = []
          wordCloudObj.leftText = ' '
          wordCloudObj.rightText = ' '
        }
        RightData.value = {}
        if (isClsActive.value == 'Online_behavior_discrepancy_sex') {
          cardConfig.value[0].value = ''
          cardConfig.value[0].value2 = ''
          cardConfig.value[1].value = ''
          cardConfig.value[1].value2 = ''

        } else {
          barConfig.value[0].name = ''
          barConfig.value[0].value = ''
          barConfig.value[1].name = ''
          barConfig.value[1].value = ''
        }
        if (isClsActive.value == 'Online_behavior_discrepancy_college') {
          barConfig2.value[0].value = ''
          barConfig2.value[1].ratio = ''
          barConfig2.value[1].value = ''
          barConfig2.value[1].name = ''
        }
        return
      }
      if (isClsActive.value == 'Online_behavior_discrepancy_sex') {
        const { manAndWomanWordCloud, womanWordCloud, manMax, manMin, manWordCloud, womanMax, womanMin } = res.datas2
        RightData.value = res.datas2
        cardConfig.value[0].value = manMax
        cardConfig.value[0].value2 = womanMax
        cardConfig.value[1].value = manMin
        cardConfig.value[1].value2 = womanMin
        wordCloudObj.data1 = manWordCloud
        wordCloudObj.data2 = manAndWomanWordCloud
        wordCloudObj.data3 = womanWordCloud
        wordCloudObj.leftText = '男'
        wordCloudObj.rightText = '女'
      } else {
        const { max, min } = res.datas2
        barConfig.value[0].name = max ? max.name : ''
        barConfig.value[0].value = max ? max.value : ''
        barConfig.value[1].name = min ? min.name : ''
        barConfig.value[1].value = min ? min.value : ''
      }
      if (isClsActive.value == 'Online_behavior_discrepancy_major') {
        const { lkCloud, wkCloud, wklkCloud } = res.datas2
        RightData.value = res.datas2
        wordCloudObj.data1 = lkCloud
        wordCloudObj.data2 = wklkCloud
        wordCloudObj.data3 = wkCloud
        wordCloudObj.leftText = '理工科'
        wordCloudObj.rightText = '文科'
      }
      if (isClsActive.value == 'Online_behavior_discrepancy_college') {
        const { allFocus, fractionFocus } = res.datas2
        RightData.value = res.datas2
        barConfig2.value[0].value = allFocus ? allFocus : ''
        barConfig2.value[1].ratio = fractionFocus ? fractionFocus.rate : ''
        barConfig2.value[1].value = fractionFocus ? fractionFocus.content : ''
        barConfig2.value[1].name = fractionFocus ? fractionFocus.college_name : ''
      }


    }, { deep: true })
    return () => {
      return <div class="right" {...content.attrs}>
        <section class='right-content'>
          <c-title title="上网差异分析" />
          <div class="right-content-box">
            {
              renderDom(isClsActive.value)
            }
          </div>
        </section>
      </div>
    }
  }
})

const NetDiversity = defineComponent({
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    selectList: {
      type: Array as PropType<any[]>,
    }
  },
  setup(props, content) {
    provide('params', props.params)
    return () => {
      return <div
        class={{
          'NetDiversity': true,
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}
      >
        <LeftView
          class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }}
          selectList={props.selectList}
        />
        <RightView
          class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }}
        />
      </div>
    }
  }
})

NetDiversity.Left = LeftView
NetDiversity.Right = RightView
export default NetDiversity


