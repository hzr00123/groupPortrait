import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, onUnmounted, toRef, unref, toRefs, provide } from "vue"
import { BaseParams } from "../../types";
import InstanceManager, { getImageUrl } from '@/utils';
import './DormitoryMange.scss'
import ColorCard from '@/components/common/ColorCard.vue';
import BarLegend from '@/components/common/BarLegend.vue'
import { usePortraitRequest } from "@/hooks";
import { getOrgType } from "@/api/modules/emphasisList";
import WarningSeal from "@/components/WarningSeal";
const LeftView = defineComponent({
  
  setup(props, content) {
    const params = inject<BaseParams>('params',  {} as any)
    const instanceManager = inject<InstanceManager>('InstanceManager',new InstanceManager())
    const response = ref({})
    const cardConf = reactive( {
      color: '#45A0E6',
      title: '入住率',
      value: '',
      isUnit: true,
      icon: getImageUrl('rzl'),
      unit: '%',
      width: '200px'
    })
    const legendList = ref([
      {
        color: '#005DA7',
        label: '满房'
      },
      {
        color: '#B22924',
        label: '未满'
      },
      {
        color: '#808080',
        label: '空房'
      },
    ])
    const isLeft = ref()
    const leftList = ref<any[]>([])
    const isCenter = ref()
    const centerList = ref<any[]>([])
    const rightList = ref<any[]>([])
    const isActive = ref<string|number>('')
    const list = ref<any[]>()
    onMounted(()=>{
      getOrgType({}).then(res =>{
        if(res.code ==1){
          const {campusOrgList} = res.data //orgName id
          list.value = campusOrgList
          list.value?.unshift({orgName:'全校',id:''})
        }
      })
    })
    const getChildById = (id: any, data: string | any[]) => {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.id === id) {
          return item.child;
        }
        if (item.child) {
          const result :any = getChildById(id, item.child);
          if (result) {
            return result;
          }
        }
      }
      return null;
    }
    const leftClick = async (v:string)=>{
      isLeft.value = v;
      const list = await getChildById(v,leftList.value)
      isCenter.value = list.length&&list.length>0? list[0].id:'';
      centerList.value = list?list:[]
      const child = await getChildById(isCenter.value, centerList.value)
      rightList.value = child?child:[]
    }
    const centerClick = async (v:string)=>{
      isCenter.value = v;
      const list = await getChildById(v,centerList.value)
      rightList.value = list?list:[]
    }
    instanceManager.register('dormitoryRes',response)
    onUnmounted(()=>{
      instanceManager.clear('dormitoryRes')
    })
    const dataSource = usePortraitRequest({...toRefs(params) as any, ident: 'Dormitory_management',stuCampusId: isActive}, isActive)
    watch(dataSource,(res)=>{
      response.value = res;
      if(res.code !=1){
        cardConf.value = ''
        leftList.value = []
        isLeft.value = ''
        centerList.value = []
        isCenter.value = ''
        rightList.value = []
      }
      const {dormitoryBaseInfo,rate} = res.data
      cardConf.value = rate
      if(dormitoryBaseInfo&&dormitoryBaseInfo.length>0){
        leftList.value = dormitoryBaseInfo
        isLeft.value = dormitoryBaseInfo[0].id
        centerList.value = dormitoryBaseInfo[0].child
        isCenter.value = dormitoryBaseInfo[0].child[0].id
        rightList.value = dormitoryBaseInfo[0].child[0].child
      } else {
        leftList.value = []
        isLeft.value = ''
        centerList.value = []
        isCenter.value = ''
        rightList.value = []
      }
    
    },{deep:true})
    const renderFn = ()=>{
      return <>
        <div class='DormitoryMange-left-top'>
          <ColorCard cardConfig={cardConf} />
        </div>
        <div class='flex-end'>
          <BarLegend legendList={legendList.value} />
        </div>
        <div class='DormitoryMange-left-box'>
          <div class='DormitoryMange-left-box-l'>
            {
              leftList.value.map((i,index)=>{
                return <div onClick={leftClick.bind(null,i.id)} class={{'left-item':true ,'isLeftA': isLeft.value==i.id}}>{i.name}</div>
              })
            }
          </div>
          <div class='DormitoryMange-left-box-c'>
            {
              centerList.value.map((i,index)=>{
                return <div onClick={centerClick.bind(null,i.id)} class={{'left-item':true ,'isLeftA': isCenter.value==i.id}}>{i.name}</div>
              })
            }
          </div>
          <div class='DormitoryMange-left-box-r'>
            {
              rightList.value.map((i,index)=>{
                return <div class={{
                  'content':true,
                  'full':i.status=='满房',
                  'notFull':i.status=='未满',
                  'empty':i.status=='空房',
                  }} >
                <div class='title'>{i.name}</div>
                <div class='content-box'>
                  {
                    i.value.map((k:any)=>{
                      return   <div class={{'content-box-item':true, 'sb':true,'empty-name':k.stuName===''}}>
                      <div class='tag'>{k.bedNum}</div>
                      <div class='name'>{k.stuName}</div>
                    </div>
                    })
                  }
                
                
                </div>
              </div>
              })
            }
          </div>
        </div>
      </>
    }
    return () => {
      return <div class='DormitoryMange-left'>
        <div class=" sb">
            <c-title title="基本信息画像" />
            <el-radio-group v-model={isActive.value}>
              {
                list.value?.map((item:any)=>{
                  return  <el-radio label={item.id}>{item.orgName}</el-radio>
                })
              }
            </el-radio-group>
          </div>
          {
            renderFn()
          }
        
      </div>

    }
  }
})

const RightView = defineComponent({

  setup(props, content) {
    const instance = getCurrentInstance();
    const instanceManager = inject<InstanceManager>('InstanceManager')!
    const echart = instance?.proxy?.$echarts;
    const TopChart = ref()
    const BottomChart = ref()
    const RightData = reactive<{ laterBack: any[], noBack: any[], [key: string | symbol]: any }>({
      laterBack:[],
      noBack:[],
      laterBackMax:{},
      noBackMax:{}
    })
    const initTopChart = ()=>{
      const el: HTMLElement = TopChart.value;
      let myChart = echart?.getInstanceByDom(TopChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let color = ['#E3493E', '#1B528B', '#00C9F2', '#F39702',]
      let list = RightData.laterBack? RightData.laterBack:[]
      let datas = list.map((it:any) => {
        let item = {...it}
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
        return item
      })
      let option = {
        color: color,
        legend: {
          // type: "scroll",
          // icon: "circle",
          orient: 'vertical',
          top: 'center',
          right: '6%',
          textStyle: {
            color: "#3E5463",
            fontSize: 14,
            backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
          },
          itemWidth: 10,
          itemHeight: 6,
          itemGap: 10,
          icon: "rect",
          pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
          pageIconSize: 12,  //当然就是按钮的大小
          pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
          tooltip: {
            show: true
          },
          data: datas.map((item) => item.name),
        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value}%`
          }
        },
        series: [
          {
            // name: "",
            type: "pie",
            radius: ["45%", "65%"],
            center: ['30%', '50%'],
            labelLine: {
              length: 20,//第一段线长
              length2: 60, //第二段线长
              lineStyle: {
                width: 1,
                type: 'solid',
                color: '#005DA7'
              },
    
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 4,
          },
            label: {
              formatter: '{zb|{d}%}',
              padding: [0, -60, 20, -60],
              rich: {
                zb: {
                  fontSize: 16,
                  color: '#203449'
                }
    
              },
            },
            data: datas,
          },
        ],
    
      }
      myChart?.setOption(option)
    }
    const initBottomChart = ()=>{
      const el: HTMLElement = BottomChart.value;
      let myChart = echart?.getInstanceByDom(BottomChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let color = ['#E3493E', '#1B528B', '#00C9F2', '#F39702',]
      let list = RightData.noBack? RightData.noBack:[]
      let datas = list.map((it:any) => {
        let item = {...it}
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
        return item
      })
      let option = {
        color: color,
        legend: {
          // type: "scroll",
          // icon: "circle",
          orient: 'vertical',
          top: 'center',
          right: '6%',
          textStyle: {
            color: "#3E5463",
            fontSize: 14,
            backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
          },
          itemWidth: 10,
          itemHeight: 6,
          itemGap: 10,
          icon: "rect",
          pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
          pageIconSize: 12,  //当然就是按钮的大小
          pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
          tooltip: {
            show: true
          },
          data: datas.map((item) => item.name),
        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value}%`
          }
        },
        series: [
          {
            // name: "",
            type: "pie",
            radius: ["45%", "65%"],
            center: ['30%', '50%'],
            labelLine: {
              length: 20,//第一段线长
              length2: 60, //第二段线长
              lineStyle: {
                width: 1,
                type: 'solid',
                color: '#005DA7'
              },
    
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 4,
          },
            label: {
              formatter: '{zb|{d}%}',
              padding: [0, -60, 20, -60],
              rich: {
                zb: {
                  fontSize: 16,
                  color: '#203449'
                }
    
              },
            },
            data: datas,
          },
        ],
    
      }
      myChart?.setOption(option)
    }
    onMounted(()=>{
      nextTick(()=>{
        initTopChart()
        initBottomChart()
      })
    })
    const dataSource = instanceManager.get('dormitoryRes')
    watch(dataSource, (res) => {
      if(res.code !=1){
        RightData.laterBack = []
        RightData.noBack = []
        RightData.laterBackMax = {}
        RightData.noBackMax = {}
        nextTick(()=>{
          initTopChart()
          initBottomChart()
        })
      }
      const {laterBack,noBack,laterBackMax,noBackMax} = res.datas2
      RightData.laterBack = laterBack
      RightData.noBack = noBack
      RightData.laterBackMax = laterBackMax
      RightData.noBackMax = noBackMax
      nextTick(()=>{
        initTopChart()
        initBottomChart()
      })

    }, { deep: true })
    const renderFn = ()=>{
      return <>
        <div class='c-title'>晚归分析</div>
        <div class='top-pie-chart' ref={TopChart}></div>
        <div class='text'>晚归时间主要集中于 <span>{RightData.laterBackMax?.name}</span></div>
        <div class='c-title' style='margin-top:8px;'>未归分析</div>
        <div class='bottom-pie-chart' ref={BottomChart}></div>
        <div class='text'>未归时间主要集中于 <span>{RightData.noBackMax?.name}</span></div>
      </>
    }
    return () => {
      return <div class="DormitoryMange-right">
          <div class="DormitoryMange-tab-tag">
            <c-title title="特征分析" />
          </div>
        <section class='DormitoryMange-right-content'>
          {
            renderFn()
          }
        </section>
      </div>
    }
  }
})


const DormitoryMange = defineComponent({
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
  },
  setup(props, content) {
    provide('params', props.params)
    return () => {
      return <div
        class={{'DormitoryMange': true,}}
      >
        <div class={{
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}>
          <LeftView  class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }}/>
          <RightView  class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
          <WarningSeal name='宿舍管理' ident='Dormitory_management'/>
        </div>
      </div>
    }
  }
})

DormitoryMange.Left = LeftView
DormitoryMange.Right = RightView


export default DormitoryMange


