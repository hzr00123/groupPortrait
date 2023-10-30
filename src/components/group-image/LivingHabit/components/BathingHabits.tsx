import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, onUnmounted, toRef, unref, toRefs, provide, computed, shallowRef } from "vue"
import { BaseParams } from "../../types";
import { downloadFile, useChildrenData, usePortraitRequest } from "@/hooks";
import InstanceManager, { getiGradientColor, getImageUrl, getNowHoursMinutes, mapKey } from '@/utils';
import './BathingHabits.scss'
import ColorCard from '@/components/common/ColorCard.vue';
import RedTab from '@/components/common/RedTab.vue';
import CustomCard from '@/components/common/CustomCard.vue';
import AMapLoader from '@amap/amap-jsapi-loader'
import TimeScale from "@/components/common/TimeScale.vue";
import ProgressBar from "@/components/common/ProgressBar.vue";
import { getChartData, changeChartData, getChartDataDetail, exportGetChartDataDetail } from "@/api/modules/studentPortrait"
import { ChartData } from "@/api/types/studentPortrait";
import { RedTabConfig } from "@/components/common/Search";
import { Column } from "@/components/Table";
import { searchConfigType, requestResType, PagesType } from "@/components/Table-plus/index.d";
import { getOrgType } from "@/api/modules/emphasisList";

import WarningSeal from "@/components/WarningSeal";
import { userStore } from "@/store/user";
import { ElLink } from "element-plus";
const LeftView = defineComponent({
  props: {
    selectList:{
      type: Object as PropType<RedTabConfig[]>,
      default: () => ([
        {
          value: 'Bathing_frequency',
          label: "洗澡频次"
        },
        {
          value: 'Bathing_time',
          label: "洗澡时间"
        },
        { 
          value: 'Bathing_location',
          label: "洗澡地点"
        }
      ])
    }
  },
  emits : ['getWidth'],
  setup(props, content) {
    const params = inject<BaseParams>('params',  {} as any)
    const instance = getCurrentInstance();
    const instanceManager = inject<InstanceManager>('InstanceManager',new InstanceManager())
    const echart = instance?.proxy?.$echarts;
    // let BathingLeftMap: {
    //   clearMap(): unknown, destroy():unknown, plugin: any, remove: (arg0: never[]) => void; add: (arg0: any) => void
    // }
    const BathingLeftMap = shallowRef<any>(null)
    const BathingRightMap = shallowRef<any>(null)
    // let BathingRightMap: {
    //   clearMap(): unknown, destroy():unknown, plugin: any, remove: (arg0: never[]) => void; add: (arg0: any) => void
    // }
    const LeftMap = ref<HTMLElement>()
    const RightMap = ref<HTMLElement>()
    const tabList = ref<RedTabConfig[]>(props.selectList)
    const isActive = ref<string>(props.selectList[0].value as string)
    const tabChange = (v:string) =>{
      isActive.value = v;
    }
    const BathingLeftList = ref([])
    const BathingRightList = ref([])
    const isRed = ref(true)
    const isMapActive = ref('')
    const selectMapList = reactive([
      {
        value: "",
        label: "全校"
      },
      {
        value: "良乡校区",
        label: "良乡校区"
      },
      {
        value: "望京校区",
        label: "望京校区"
      },
    ])
    const LeftChart = ref()
    const LeftChart2 = ref()
    const oneData = ref<any[]>()
    const twoData = reactive({
      datas:[],
      xaxis:[]
    })
    const threeData = ref()
    const mapDataL = ref<any[]>()
    const mapDataR = ref<any[]>()
    const isClsActive = ref<string>('按日')
    
    const selectList = reactive([
      {
        value: "按日",
        label: "按日"
      },
      {
        value: "按月",
        label: "按月"
      },
    ])
    const colorConfig = ref([
      {
        color: '#005DA7',
        title: '日均洗澡人数',
        value: '',
        isUnit: true,
        icon: getImageUrl('rjxz'),
        unit: '人',
        width: '180px'
      },
      {
        color: '#00C9F2',
        title: '月均洗澡人数',
        value: '',
        isUnit: true,
        icon: getImageUrl('yjxz'),
        unit: '人',
        width: '180px'
      },
    ])
    const PopularLocation = reactive({
      list: [],
      color: "#005DA7",
      lableWidth: 70,
      valueWidth: 70,
      lableAlign: "left",
      valuePosition: "right",
      unit: "次",
      needTag: true,
      height: "calc(100% - 86px)"
    });
    const timeOptions = reactive([
      {
        label: "14:00",
        value: 14,
        color: "",
        alias: "",
      },
      {
        label: "15:00",
        value: 15,
        color: "",
        alias: "",
      },
      {
        label: "16:00",
        value: 16,
        color: "",
        alias: "",
      },
      {
        label: "17:00",
        value: 17,
        color: "",
        alias: "",
      },
      {
        label: "18:00",
        value: 18,
        color: "",
        alias: "",
      },
      {
        label: "19:00",
        value: 19,
        color: "",
        alias: "",
      },
      {
        label: "20:00",
        value: 20,
        color: "",
        alias: "",
      },
      {
        label: "21:00",
        value: 21,
        color: "",
        alias: "",
      },
      {
        label: "22:00",
        value: 22,
        color: "",
        alias: "",
      },
      {
        label: "23:00",
        value: 23,
        color: "",
        alias: "",
      },
    ])

    const initLeftChart = () => {
      const el: HTMLElement = LeftChart.value;
      let myChart = echart?.getInstanceByDom(LeftChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let datas:any = oneData.value?oneData.value:[]

      let option = {
        color: ['#45A0E6', ],
        title: {
          text: '单位：人',
          top: '1%',
          left: 0,
          textStyle: {
            color: '#333333',
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: '12%',
          top: '1.5%',
          itemWidth: 10,
          itemHeight: 5,
          data: []
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data:  datas.map((item: { name: any; })=>({value: item.name})),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              // rotate: 0, //代表逆时针旋转
              interval: 'auto',
              // formatter: function (value: string) {
              //   if (value.length > 6) {
              //     return `${value.slice(0, 6)}...`;
              //   }
              //   return value
              // }
            },
          }
        ],
        yAxis: [
          {
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            },
          },
        ],
        series: [
          {
            type: 'line',
            name:'洗澡人数',
            smooth:true,
            symbol: 'none',
            symbolSize:10,
            data: datas.map((item: { value: any; })=>({value: item.value})),
          },
        ]
      };
      myChart?.setOption(option);
    }
    const initLeftChart2 = () => {
      const el: HTMLElement = LeftChart2.value;
      let myChart = echart?.getInstanceByDom(LeftChart2.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let option = {
        color: ['#F39D12', ],
        title: {
          text: '单位：人',
          top: '1%',
          left: 0,
          textStyle: {
            color: '#333333',
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: '12%',
          top: '1.5%',
          itemWidth: 10,
          itemHeight: 5,
          data: []
        },
        grid: {
          top: '15%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: twoData.xaxis,
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              // rotate: 0, //代表逆时针旋转
              interval: 'auto',
              // formatter: function (value: string) {
              //   if (value.length > 6) {
              //     return `${value.slice(0, 6)}...`;
              //   }
              //   return value
              // }
            },
          }
        ],
        yAxis: [
          {
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            },
          },
        ],
        series: [
          {
            type: 'line',
            name:'洗澡人数',
            smooth:true,
            symbol: 'none',
            symbolSize:10,
            data: twoData.datas,
          },
        ]
      };
      myChart?.setOption(option);
    }
    const chartLoading = ref(false)
    const changeData = async (val:string='') => {
      chartLoading.value = true
      const obj:ChartData = {
        ...params,
        ident: isActive.value, 
        category:isClsActive.value,
        consTime:val
      }
      if(val!=''){
        delete obj.category
      }else{
        delete obj.consTime
      }
      const res = await changeChartData(obj)
      if (res.code == 1) {
        if(isActive.value=='Bathing_frequency'){
          const { data } = res;
          oneData.value = data
          nextTick(() => {
            initLeftChart();
          })
        }
        if(isActive.value=='Bathing_location'){
          mapDataL.value = res.data[0].details
          mapDataR.value = res.data[1].details
          nextTick(() => {
            initLeftMap();
            initRightMap();
          })
        }
      }else{
        if(isActive.value=='Bathing_frequency'){
          oneData.value = []
          nextTick(() => {
            initLeftChart();
          })
        }
        if(isActive.value=='Bathing_location'){
          mapDataL.value = []
          mapDataR.value = []
          nextTick(() => {
            initLeftMap();
            initRightMap();
          })
        }
      }
      chartLoading.value = false
    }
    const redTabChange = (v:string) =>{
      isClsActive.value = v;
      changeData()
    }
    const redTabMapChange = (v:string) =>{
      isMapActive.value = v;
      nextTick(()=>{
        switch (v) {
          case '良乡校区':
            initLeftMap();
            break;
          case '望京校区':
            initRightMap();
            break;
          default:
            initLeftMap();
            initRightMap();
            break;
        }
      })
    }
    const initDrop = (data: any)=>{
      BathingLeftMap.value?.clearMap();
      if(data&&data.length&&data.length>0){
        const total = Math.max(...data.map((i: { value: any; })=>i.value))
        data.forEach((itm: { name: string; value: any;  lng: any; lat: any; }) => {
          const color = getiGradientColor("#D18E8E","#B22924", itm.value / total)
          const markerContent = `<div class='OnlineLocationTag' >
          <svg class='bgImg' width="49px" height="73px" viewBox="0 0 49 73" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-691.000000, -773.000000)" fill="${color}" fill-rule="nonzero">
                      <g id="编组" transform="translate(691.502246, 773.000000)">
                          <path d="M24.5157238,58.5126923 C11.1634099,58.5126923 0,61.139377 0,65.2982945 C0,69.4572119 11.1634099,72.7405678 24.5157238,72.7405678 C37.8680376,72.7405678 48.155886,69.4572119 48.155886,65.2982945 C48.155886,61.3582674 37.8680376,58.5126923 24.5157238,58.5126923 Z" id="路径" fill-opacity="0.3"></path>
                          <path d="M24.3451825,0 C11.1814018,0 0.497753746,10.6836481 0.497753746,24.0382082 C0.497753746,30.9062676 2.7871069,36.4388711 6.22113664,41.2083569 C12.5168578,49.2210929 18.4310202,57.4246084 24.1544031,65.8189033 C30.6409037,57.6153878 36.7458454,49.4118723 42.2784489,41.3991363 C47.0479346,34.149518 48.0018318,30.5247088 48.0018318,24.0382082 C48.1926112,10.6836481 37.5089631,0 24.3451825,0 Z" id="路径"></path>
                      </g>
                  </g>
              </g>
          </svg>
            <div class='top-box'>${itm.value}</div>
            <div class='bottom-box'>次</div> 
          </div>` 
          const position = new window.AMap.LngLat(itm.lng, itm.lat); // Marker经纬度
          let marker = new window.AMap.Marker({
            position: position,
            content: markerContent, // 将 html 传给 content
            offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
          });
    
          BathingLeftMap.value?.add(marker);
          BathingLeftList.value.push(marker as never)
          
        });
      }
    
    }
    const initDropR = (data: any)=>{
      BathingRightMap.value?.clearMap();
      if(data&&data.length&&data.length>0){
        const total = Math.max(...data.map((i: { value: any; })=>i.value))
        data.forEach((itm: { name: string; value: any;  lng: any; lat: any; }) => {
          const color = getiGradientColor("#D18E8E","#B22924", itm.value / total)
          const markerContent = `<div class='OnlineLocationTag' >
          <svg class='bgImg' width="49px" height="73px" viewBox="0 0 49 73" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-691.000000, -773.000000)" fill="${color}" fill-rule="nonzero">
                      <g id="编组" transform="translate(691.502246, 773.000000)">
                          <path d="M24.5157238,58.5126923 C11.1634099,58.5126923 0,61.139377 0,65.2982945 C0,69.4572119 11.1634099,72.7405678 24.5157238,72.7405678 C37.8680376,72.7405678 48.155886,69.4572119 48.155886,65.2982945 C48.155886,61.3582674 37.8680376,58.5126923 24.5157238,58.5126923 Z" id="路径" fill-opacity="0.3"></path>
                          <path d="M24.3451825,0 C11.1814018,0 0.497753746,10.6836481 0.497753746,24.0382082 C0.497753746,30.9062676 2.7871069,36.4388711 6.22113664,41.2083569 C12.5168578,49.2210929 18.4310202,57.4246084 24.1544031,65.8189033 C30.6409037,57.6153878 36.7458454,49.4118723 42.2784489,41.3991363 C47.0479346,34.149518 48.0018318,30.5247088 48.0018318,24.0382082 C48.1926112,10.6836481 37.5089631,0 24.3451825,0 Z" id="路径"></path>
                      </g>
                  </g>
              </g>
          </svg>
            <div class='top-box'>${itm.value}</div>
            <div class='bottom-box'>次</div> 
          </div>` 
          const position = new window.AMap.LngLat(itm.lng, itm.lat); // Marker经纬度
          let marker = new window.AMap.Marker({
            position: position,
            content: markerContent, // 将 html 传给 content
            offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
          });
    
          BathingRightMap.value?.add(marker);
          BathingRightList.value.push(marker as never)
        });
      }
    }
    // 初始化地图
    const initLeftMap = () => {
      AMapLoader.load({
        key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.HeatMap", "AMap.moveAnimation"] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      })
        .then(AMap => {
          AMap.plugin("AMap.MoveAnimation", () => { });
          //DOM初始化完成进行地图初始化
          BathingLeftMap.value = new AMap.Map(LeftMap.value, {
            //设置地图容器id
            resizeEnable: true,
            zoom: 17.3, //初始化地图级别
            zooms: [17.3, 18], //缩放范围
            center: [116.18, 39.74] //初始化地图中心点位置
          });
          initDrop(mapDataL.value)
        })
        .catch(e => {
          console.log(e);
        });
    }
    const initRightMap = () =>{
      AMapLoader.load({
        key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.HeatMap", "AMap.moveAnimation"] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      })
        .then(AMap => {
          AMap.plugin("AMap.MoveAnimation", () => { });
          //DOM初始化完成进行地图初始化
          BathingRightMap.value = new AMap.Map(RightMap.value, {
            //设置地图容器id
            resizeEnable: true,
            zoom: 18.9, //初始化地图级别
            zooms: [17.3, 18], //缩放范围
            center: [116.4780, 39.9813] //初始化地图中心点位置
          });
          initDropR(mapDataR.value)
        })
        .catch(e => {
          console.log(e);
        });
    }
    const onSelectTime = (time: string) => {
      changeData(time)
    }
    
    const response = ref({})
    instanceManager?.register('oneDataSource',response)
    instanceManager?.register('BathingActive',isActive)
    onUnmounted(()=>{
      instanceManager?.clear('oneDataSource')
      instanceManager?.clear('BathingActive')
      // 销毁地图实例
      BathingLeftMap.value?.destroy();
      BathingRightMap.value?.destroy();
      delete params.consTime
    })

    const queryParams = ref('')
    const WarningSealName = (val: any) => {
      const item = tabList.value!.find(item => item.value === val);
      return item ? item.label : '';
    }
    watch(isActive,(val)=>{
      content.emit('getWidth',val)
      if(val == 'Bathing_location'){
        isMapActive.value = '';
        const [hours, minutes] = getNowHoursMinutes()
        queryParams.value = `${hours}:${minutes}`
      }else{
        queryParams.value = ''
      }
    })
    const dataSource = usePortraitRequest({...toRefs(params) as any, ident: isActive,consTime:queryParams }, isActive)
    watch(dataSource, (res) => {
      response.value = res
      if(res.code !=1){
      
        return
      }
      if(isActive.value == 'Bathing_frequency'){
        const { average, details } =res.data
        colorConfig.value[0].value = average.averageDaily
        colorConfig.value[1].value = average.monthlyAverage
        oneData.value = details
        nextTick(() => {
          initLeftChart();
        })
      }
      if(isActive.value == 'Bathing_time'){
        const { datas, xaxis } =res.data
        twoData.datas = datas
        twoData.xaxis = xaxis
        nextTick(() => {
          initLeftChart2();
        })
      }
      if(isActive.value == 'Bathing_location'){
        mapDataL.value = res.data[0].details
        mapDataR.value = res.data[1].details
        PopularLocation.list =  res.datas2.analysis
        threeData.value =  res.datas2.popularPlace
        nextTick(() => {
          initLeftMap();
          initRightMap();
        })
      }
      

    }, { deep: true })
    const renderFn = (val:string)=>{
      switch (val) {
        case 'Bathing_frequency':
          return <>
            <div class="BathingHabits-left-card-box flex just-c align-items-c">
              {
                colorConfig.value.map((i, index) => (
                  <ColorCard  class={{ 'mr50': index == 0,}}  cardConfig={i} key={i.color} />
                ))
              }
            </div>
            <div class='sb'>
              <div></div>
              <RedTab class="small-tab" isRed={isRed.value} btnList={selectList} isActive={isClsActive.value} onRedTabChange={redTabChange} />
            </div>
          
            <div v-loading={chartLoading.value} class="BathingHabits-left-chart" ref={LeftChart}></div>
            <div class='text'>{isClsActive.value=='按日'?'每日':'每月'}洗澡人数变化趋势</div>
          </>
        case 'Bathing_time':
          return <>
            <div v-loading={chartLoading.value} key={Date.now()} class="BathingHabits-left-chart2" ref={LeftChart2}></div>
          </>
        case 'Bathing_location':
          return <div class='Bathing-location-content sb' key={Date.now()}>
            <RedTab class='mapTab' btnList={selectMapList} isActive={isMapActive.value} onRedTabChange={redTabMapChange} />
            <TimeScale class='mapTime' TimeScale={timeOptions} onSelectTime={onSelectTime}></TimeScale>
            <div class='colorBar-box column'>
              <div>高</div>
              <div class='colorBar'></div>
              <div>低</div>
            </div>
            <div class='fixed-box'>
              <div class='fixed-box-content'>
                <c-title title="热门洗澡地点分析" />
                <div class='text mtb30'><span>{threeData.value}</span></div>
                <ProgressBar class="progress" option={PopularLocation} />
              </div> 
            </div>
            {
              isMapActive.value != '望京校区'? 
              <div style={{width: isMapActive.value=='良乡校区'? '100%' : '50%'}} 
              class='leftMap' ref={LeftMap}></div> : ''
            }
            {
              isMapActive.value == ''? <div class="lineCenter"></div> :''
            }
            {
              isMapActive.value != '良乡校区'? 
              <div style={{width: isMapActive.value=='望京校区'? '100%' : '50%'}}
              class='rightMap' ref={RightMap}></div> :''
            }
          
          </div>
          
      }
    }
    return () => {
      return <div class='BathingHabits-left'>
        <div class={{'sb':true,'BathingHabits-tab-box':isActive.value=='Bathing_location'}}>
          <c-title title="基本信息画像" />
          <RedTab btnList={tabList.value} isActive={isActive.value} onRedTabChange={tabChange} />
        </div>
        {
          renderFn(isActive.value)
        }
        <WarningSeal name={WarningSealName(isActive.value)} ident={isActive.value}/>
      </div>

    }
  }
})


const RightView = defineComponent({
  props: {
    isActive: {
        type: String,
        default: ''
    }
  },
  setup(props, content) {
    const instance = getCurrentInstance();
    const instanceManager = inject<InstanceManager>('InstanceManager',new InstanceManager())
    const echart = instance?.proxy?.$echarts;
    const params = inject<BaseParams>('params',  {} as any)
    const leftCard = reactive({
      width: '280px',
      height: '80px',
      color: '#005DA7',
      title: '洗澡最早时间',
      value: '',
      isUnit: false,
      describe: '',
      fontSize: '22px'
    })
    const rightCard = reactive({
      width: '280px',
      height: '80px',
      color: '#F39702',
      title: '洗澡最晚时间',
      value: '',
      isUnit: false,
      describe: '',
      fontSize: '22px'
    })
    const RightData = ref<{ intervals: Array<any>, [key: string | symbol]: any }>({
      intervals:[]
    })
    const visible = ref(false)
    const LeftPieChart = ref()
    const initLeftPieChart = () => {
      const el: HTMLElement = LeftPieChart.value;
      let myChart = echart?.getInstanceByDom(LeftPieChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let color = ['#E3493E', '#1B528B', '#00C9F2', '#F39702']
      let datas: any[] = RightData.value.intervals?RightData.value.intervals:[]
      const _data = datas.map((item:any) => {
        const _item = {...item}
        if (_item.value == 0) {
          _item.labelLine = { show: false }
          _item.label = { show: false }
        }
        return _item
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
          data: _data.map((item) => item.name),
        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value} 人 (${param.percent}%)`
          }
        },
        series: [
          {
            // name: "",
            type: "pie",
            radius: ["40%", "55%"],
            center: ['50%', '50%'],
            labelLine: {
              length: 20,//第一段线长
              length2: 80, //第二段线长
              lineStyle: {
                width: 1,
                type: 'solid',
                color: '#005DA7'
              },
    
            },
            label: {
              formatter: '{name|{b}: }{num|{c}人}\n\n{zb|{d}%}',
              padding: [0, -80, -5, -80],
              rich: {
                name: {
                  fontSize: 14,
                  color: '#203449'
                },
                num: {
                  fontSize: 14,
                  color: '#203449'
                },
                zb: {
                  fontSize: 16,
                  color: '#203449'
                }
    
              },
            },
            data: _data,
          },
        ],
    
      }
      myChart?.setOption(option);
      myChart?.on('click',()=>{
        visible.value = true;
      })
    }
    const tableSort = ref(1)
    const columns: Column = [
      {
        slot: 'index',
        label: '序号',
        width: '60',
        align: 'center'
      },
      {
        prop: 'name',
        label: '姓名',
        width: 100,
        align: 'center'
      },
      {
        prop: 'sex',
        label: '性别',
        width: 80,
        align: 'center'
      },
      {
        prop: 'userName',
        label: '学号',
        align: 'center'
      },
      {
        prop: 'campusName',
        label: '校区',
        align: 'center'
      },
      {
        prop: 'collegeName',
        label: '学院',
        align: 'center'
      },
      {
        prop: 'majorName',
        label: '专业',
        align: 'center'
      },
      {
        prop: 'gradeName',
        label: '年级',
        align: 'center'
      },
      {
        prop: 'className',
        label: '班级',
        align: 'center'
      },
      {
        prop: 'weekFrequency',
        label: '每周',
        align: 'center',
        sortable:true,
      },
      {
        prop: 'monthFrequency',
        label: '每月',
        align: 'center',
        sortable:true,
      },
      {
        slot: 'action',
        label: '操作',
        fixed: 'right',
        align: 'center'
      }
    ]
    const paramsObj = {
      campusId: 'stuCampusId',
      collegeId: 'stuCollegeId',
      majorId: 'stuMajorId',
      gradeId: 'stuGradeId',
      classId: 'stuClassId'
    }
    const searchConfig: searchConfigType = reactive(
      [
        {
          type: 'select',
          label: '性别',
          inputWidth: '80px',
          labelWidth: '40px',
          key: 'stuSex',
          options: [{ label: '男', value: '男' }, { label: '女', value: '女' }]
        },
        {
          type: 'select',
          label: '校区',
          inputWidth: '120px',
          labelWidth: '40px',
          key: 'stuCampusId',
          request: getOrgType as any,
          reqKey: 'campusOrgList',
          opKey: 'id',
          opLabel: 'orgName',
          params: paramsObj,
          target: ['stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId'],
        },
        {
          type: 'select',
          label: '学院',
          inputWidth: '120px',
          labelWidth: '40px',
          key: 'stuCollegeId',
          request: getOrgType as any,
          reqKey: 'collegeOrgList',
          target: ['stuMajorId', 'stuGradeId', 'stuClassId'],
          opKey: 'id',
          opLabel: 'orgName',
          params: paramsObj
        },
        {
          type: 'select',
          label: '专业',
          inputWidth: '120px',
          labelWidth: '40px',
          key: 'stuMajorId',
          request: getOrgType as any,
          reqKey: 'majorOrgList',
          target: ['stuGradeId', 'stuClassId'],
          opKey: 'id',
          opLabel: 'orgName',
          params: paramsObj
        },
        {
          type: 'select',
          label: '年级',
          inputWidth: '120px',
          labelWidth: '40px',
          key: 'stuGradeId',
          request: getOrgType as any,
          reqKey: 'gradeOrgList',
          target: ['stuClassId'],
          opKey: 'id',
          opLabel: 'orgName',
          params: paramsObj
        },
        {
          type: 'select',
          label: '班级',
          inputWidth: '120px',
          labelWidth: '40px',
          key: 'stuClassId',
          request: getOrgType as any,
          reqKey: 'classOrgList',
          opKey: 'id',
          opLabel: 'orgName',
          params: paramsObj
        },
        {
          type: 'input',
          placeholder: '请输入姓名,学号搜索',
          label: '',
          inputWidth: '160px',
          key: 'name'
        }
      ]
    )
    const sortClick = (obj:any)=>{
      tableSort.value = obj.order == 'des' ? 2 : 1
    }
    const tableRequest = (para: any, pages: PagesType, sort:string|number): Promise<requestResType> => {
      const obj = {
        ...params,
        ...para,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: false,
        sort:tableSort.value,
        ident: 'Bathing_frequency'
      }
      return getChartDataDetail(obj)
    }
    const exportEvt = async(form: any, pages: PagesType)=>{
      const res = await exportGetChartDataDetail({
        ...params,
        ...form,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: true,
        sort:tableSort.value,
        ident: 'Bathing_frequency'
      })
      downloadFile(res)
    }
    const isActive = instanceManager.get('BathingActive')
    const dataSource = instanceManager.get('oneDataSource')
    watch(dataSource, (res) => {
      if(res.code !=1){
        RightData.value = {intervals:[]}
        if(isActive.value == 'Bathing_time'){
          leftCard.value = ''
          rightCard.value = ''
          leftCard.describe = ''
          rightCard.describe = ''
        }
        return
      }
      RightData.value = res.datas2
      if(isActive.value == 'Bathing_frequency'){
        nextTick(() => {
          initLeftPieChart();
        })
      }
      if(isActive.value == 'Bathing_time'){
        const { intervals } =  res.datas2
        leftCard.value = intervals.length&&intervals.length>0? intervals[0].value :''
        leftCard.describe = intervals.length&&intervals.length>0? intervals[0].date :''
        rightCard.value = intervals.length&&intervals.length>1? intervals[1].value :''
        rightCard.describe = intervals.length&&intervals.length>1? intervals[1].date :''
      }
    
    }, { deep: true })
    const renderFn = (val:string)=>{
      switch (val) {
        case 'Bathing_frequency':
          return <>
            <div class='c-title'>洗澡频次分析</div>
            <div key={val} class='LeftPieChart' ref={LeftPieChart}></div>
            <div class='text'>每周洗澡次数主要区间 <span>{RightData.value.mainInterval}</span></div>
          </>
        case 'Bathing_time':
          return <>
            <div class='c-title'>洗澡时间分析</div>
            <div class="Custom-Card-content sb">
              <CustomCard cardConfig={leftCard} />
              <CustomCard cardConfig={rightCard} />
            </div>
            <div class='text'>洗澡高峰时段 <span>{RightData.value.mainInterval}</span></div>
          </>
      }
    }
    return () => {
      return <div class="BathingHabits-right">
        <div class="BathingHabits-tab-tag">
          <c-title title="特征分析" />
        </div>
        <section class='BathingHabits-right-content'>
          {
            renderFn(isActive.value)
          }
          <c-table-plus onSortClick={sortClick} key={Date.now()} columns={columns} request={tableRequest} searchConfig={searchConfig} visible={visible.value}
            title="个人洗澡频次" dialogWidth="1460px" height="450px" closed={() => visible.value = false} exportBtn={exportEvt}>
            {{
              index:(arg:any) =>{
                const {data} = arg
                return <div>{ data.$index + 1 }</div>
              },
              action:(arg:any) =>{
                const {data} = arg
                return <ElLink type="primary">学生个像</ElLink>
              }
            }}
        </c-table-plus>
        </section>
      </div>
    }
  }
})


const BathingHabits = defineComponent({
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    selectList:{
      type: Object as PropType<RedTabConfig[]>,
      default: () => ([
        {
          value: 'Bathing_frequency',
          label: "洗澡频次"
        },
        {
          value: 'Bathing_time',
          label: "洗澡时间"
        },
        { 
          value: 'Bathing_location',
          label: "洗澡地点"
        }
      ])
    }
  },
  setup(props, content) {
    provide('params', props.params)
    const store = userStore()
    const flag = ref(props.selectList[0].value)
    const getWidth = (val:string)=>{
      flag.value = val
    }
    const type = inject<'left' | 'right'>('vscmType', 'left')
    watch(flag,(res)=>{
      if(res=='Bathing_location'){
        type && store.updateVsViewDirection(type, true)
      }else{
        type && store.updateVsViewDirection(type, false)
      }
    },{deep:true,immediate:true})
    onUnmounted(()=>{
      type && store.updateVsViewDirection(type, false)
    })
    return () => {
      return <div
        class={{'BathingHabits': true,}}
      >
        <div class={{
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}>
          <LeftView onGetWidth={getWidth} selectList={props.selectList} class={{
            'w50': props.direction === 'horizontal'&&flag.value!='Bathing_location',
            'w100': props.direction === 'vertical'||flag.value=='Bathing_location'
          }}
          />
          {
            flag.value!='Bathing_location'?<RightView class={{
              'w50': props.direction === 'horizontal',
              'w100': props.direction === 'vertical'
            }} /> : ''
          }
        </div>
        
      </div>
    }
  }
})

BathingHabits.Left = LeftView
BathingHabits.Right = RightView


export default BathingHabits


