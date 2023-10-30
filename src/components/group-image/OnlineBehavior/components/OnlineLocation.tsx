import { defineComponent, onMounted, PropType, reactive, ref, nextTick,
    getCurrentInstance, watch, readonly, provide, onBeforeMount, onUnmounted, toRefs, inject, shallowRef, } from "vue"
import { BaseParams } from "../../types";
import { downloadFile, usePortraitRequest } from "@/hooks";
import { getiGradientColor, mapKey } from '@/utils';
import '../index.scss'
import RedTab from '@/components/common/RedTab.vue';
import AMapLoader from '@amap/amap-jsapi-loader'
import { exportGetChartDataDetail, getChartDataDetail,getSelectData } from "@/api/modules/studentPortrait";
import { requestResType, PagesType, searchConfigType } from '@/components/Table-plus/index.d'
import { Column } from "@/components/Table";
import WarningSeal from "@/components/WarningSeal";
import { userStore } from "@/store/user";
const LeftView = defineComponent({
  props: {
    isActive: {
      type: String,
      default: '',
    },
    datas:{
      type:Array,
      default: ()=>[]
    }
  },
  emits : ['dropClick'],
  setup(props, content) {
    // let OnlineLeftMap: {
    //   clearMap(): unknown, plugin: any, remove: (arg0: never[]) => void; add: (arg0: any) => void
    // }
    const OnlineLeftMap = shallowRef<any>(null)
    const OnlineLeftList = ref([])
    const leftMap = ref<HTMLElement>()
    const initMap = () => {
      // if(!leftMap.value) return
      AMapLoader.load({
        key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.HeatMap", "AMap.moveAnimation"] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      })
        .then(AMap => {
          AMap.plugin("AMap.MoveAnimation", () => { });
          //DOM初始化完成进行地图初始化
          OnlineLeftMap.value = new AMap.Map(leftMap.value, {
            //设置地图容器id
            resizeEnable: true,
            zoom: 17.3, //初始化地图级别
            zooms: [17.3, 18], //缩放范围
            center: [116.18, 39.74] //初始化地图中心点位置
          });

          initDrop(props.datas)
        })
        .catch(e => {
          console.log(e);
        });
    }
    const dropClick = () => {
      content.emit('dropClick')
    }
    const initDrop = (data: any)=>{
      OnlineLeftMap.value?.clearMap();
      if(data&&data.length&&data.length>0){
        const total = Math.max(...data.map((i: { time: any; })=>i.time))
        data.forEach((itm: { name: string; time: any;  lng: any; lat: any; }) => {
          const color = getiGradientColor("#D18E8E","#B22924", itm.time / total)
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
            <div class='top-box'>${itm.time}</div>
            <div class='bottom-box'>小时</div> 
          </div>` 
          const position = new window.AMap.LngLat(itm.lng, itm.lat); // Marker经纬度
          let marker = new window.AMap.Marker({
            position: position,
            content: markerContent, // 将 html 传给 content
            offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
          });
    
          OnlineLeftMap.value?.add(marker);
          OnlineLeftList.value.push(marker as never)
          
           // 绑定事件
          marker.on('click', dropClick);
        });
      }
    
    }
    watch(() => props.datas,(val)=>{
      initDrop(val)
    },{deep:true})
    onMounted(() => {
      nextTick(() => {
        initMap();
      })
    })
    onUnmounted(()=>{
      OnlineLeftMap.value?.destroy();
    })
    return () => {
      return <div class='leftMap' style={{width: props.isActive!='良乡校区'? '50%' : '100%'}} ref={leftMap} id='OnlineLeftMap'></div>

    }
  }
})

const RightView = defineComponent({
  props: {
    isActive: {
      type: String,
      default: ''
    },
    datas:{
      type:Array,
      default: ()=>[]
    }
  },
  emits : ['dropClick'],
  setup(props, content) {
    // let OnlineRightMap: {
    //   clearMap(): unknown, plugin: any, remove: (arg0: never[]) => void; add: (arg0: any) => void
    // }
    const OnlineRightMap = shallowRef<any>(null)
    const OnlineRightList = ref([])
    const dropClick = () => {
      content.emit('dropClick')
    }
    const rightMap = ref<HTMLElement>()
    const initMap = () => {
      AMapLoader.load({
        key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.HeatMap", "AMap.moveAnimation"] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      })
        .then(AMap => {
          AMap.plugin("AMap.MoveAnimation", () => { });
          //DOM初始化完成进行地图初始化
          OnlineRightMap.value = new AMap.Map(rightMap.value, {
            //设置地图容器id
            resizeEnable: true,
            zoom: 18.9, //初始化地图级别
            zooms: [17.3, 18], //缩放范围
            center: [116.4780, 39.9813] //初始化地图中心点位置
          });
          initDrop(props.datas)
        })
        .catch(e => {
          console.log(e);
        });
    }
    const initDrop = (data: any)=>{
      OnlineRightMap.value?.clearMap();
      if(data&&data.length&&data.length>0){
        const total = Math.max(...data.map((i: { time: any; })=>i.time))
        data.forEach((itm: { name: string; time: any;  lng: any; lat: any; }) => {
          const color = getiGradientColor("#D18E8E","#B22924", itm.time / total)
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
            <div class='top-box'>${itm.time}</div>
            <div class='bottom-box'>小时</div> 
          </div>` 
          const position = new window.AMap.LngLat(itm.lng, itm.lat); // Marker经纬度
          let marker = new window.AMap.Marker({
            position: position,
            content: markerContent, // 将 html 传给 content
            offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
          });
    
          OnlineRightMap.value?.add(marker);
          OnlineRightList.value.push(marker as never)
          // 绑定事件
          marker.on('click', dropClick);
        });
      }
    }
    watch(() => props.datas,(val)=>{
      initDrop(val)
    },{deep:true})
    onMounted(() => {
      nextTick(() => {
        initMap();
      })
    })
    onUnmounted(()=>{
      OnlineRightMap.value?.destroy();
    })
    return () => {
      return <div class="rightMap" style={{width: props.isActive!='望京校区'? '50%' : '100%'}} ref={rightMap} id='OnlineRightMap'></div>
    }
  }
})


const OnlineLocation = defineComponent({
  name: 'OnlineLocation',
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
    const store = userStore()
    provide('params', props.params)
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const selectList = reactive([
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
    const type = inject<'left' | 'right'>('vscmType', 'left')
    onBeforeMount(()=>{
      nextTick(()=>{
        type && store.updateVsViewDirection(type, true)
      })
    })
    onUnmounted(()=>{
      type && store.updateVsViewDirection(type, false)
    })

    const isActive = ref("")
    const copy = readonly(isActive)
    const mapLeft = ref<Array<any>>([])
    const mapRight = ref<Array<any>>([])
    const mainData = reactive<{locationType:Array<any>,rank:Array<any>,main:string}>({
      locationType:[],
      rank:[],
      main:''
    })
    const redTabChange = (v:string) =>{
      isActive.value = v
    }
    const PieChart = ref();
    const showPages = ref(false);
    const locationCls = ref([])
    const campusCls = ref([])
    const initPieChart = () => {
      const el: HTMLElement = PieChart.value;
      let myChart = echart?.getInstanceByDom(PieChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let data = mainData.locationType;
      let option = {
        color:['#005DA7','#00C9F2','#8C6C4E','#F39702','#E3493E','#231815','#4D5FC1','#45A0E6',],
        legend: {
          type: "scroll",
          orient: 'vertical',
          top: 'middle',
          right: '0%',
          bottom: '0%',
          textStyle: {
            color: "#3E5463",
            fontSize: 14,

            backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
            rich: {
              a: {
                // width: 60,
                padding: [0, 0, 0, 0],
                color:'#3E5463',
                fontWeight:'bold'
              },
              c: {
                width: 60,
                padding: [0, 0, 0, 0],
              },
            },
          },
          itemWidth: 10,
          itemHeight: 4,
          itemGap: 10,
          icon: "rect",
          pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
          pageIconSize: 12,  //当然就是按钮的大小
          pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
          tooltip: {
            show: true
          },
          data: data.map((item) => item.name),
          formatter: (name: string) => {
            let n = name.length>6?name.slice(0,6)+'...':name;
            
            return `{c|${n}}`;
        }

        },
        tooltip: {
          formatter : function(param:any){
            return `${param.marker}${param.name} : ${param.value} 次 (${param.percent}%)`
          }
        },
        series: [
          {
            radius: ['50%', '80%'],
            center: ['40%', '50%'],
            type: 'pie',
            //roseType: 'radius',
            emphasis: {
              label: {
                show: false
              }
            },
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2,

            },
            data: data
          },
        ]
  }
      myChart?.setOption(option);
    }
    const hotBgColor = (val: any) => {
        switch (val) {
          case 1:
            return "rgba(178, 41, 36, 1)";
          case 2:
            return "rgba(178, 41, 36, 0.9)";
          case 3:
            return "rgba(178, 41, 36, 0.8)";
          case 4:
            return "rgba(178, 41, 36, 0.7)";
          case 5:
            return "rgba(178, 41, 36, 0.6)";
          default :
            return "rgba(178, 41, 36, 0.5)";
        }
    };
    const lookMore = () =>{
      showPages.value = true;
    }
    const renderDom = (v:string)=>{
      switch (v) {
        case '良乡校区':
          return <LeftView isActive={v} datas={mapLeft.value}  onDropClick={lookMore}/>
        case '望京校区':
          return <RightView isActive={v} datas={mapRight.value} onDropClick={lookMore}/>
        default:
          return <>
            <LeftView isActive={v} datas={mapLeft.value} onDropClick={lookMore} />
            <div class="lineCenter"></div> 
            <RightView isActive={v} datas={mapRight.value} onDropClick={lookMore}/>
          </>
      }
    }
    const columns: Column = [
      {
        slot: 'index',
        label: '序号',
        width: 80,
        align: 'center'
      },
      {
        prop: 'location',
        label: '地点',
        align: 'center'
      },
      {
        prop: 'campus',
        label: '校区',
        align: 'center'
      },
      {
        prop: 'locationType',
        label: '地点类型',
        align: 'center'
      },
      {
        prop: 'time',
        label: '上网时长',
        align: 'center',
        sortable:true,
      },
    ]
    const searchConfig: searchConfigType = reactive([
      {
        type: 'select',
        label: '校区',
        inputWidth: '120px',
        labelWidth: '40px',
        key: 'campusName',
        opKey: 'value',
        opLabel: 'label',
        options: campusCls,
      },
      {
        type: 'select',
        label: '地点类型',
        inputWidth: '120px',
        labelWidth: '68px',
        key: 'locationType',
        opKey: 'value',
        opLabel: 'label',
        options: locationCls
      },
      {
        type: 'input',
        placeholder: '请输入地点名称搜索',
        label: '',
        inputWidth: '200px',
        key: 'name'
      }
    ])
    const tableSort = ref(1)
    const sortClick = (obj:any)=>{
      tableSort.value = obj.order == 'des' ? 2 : 1
    }
    const tableRequest = (para: any, pages: PagesType): Promise<requestResType> => {
      return getChartDataDetail({
        ...props.params,
        ...para,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: false,
        ident: 'Online_behavior_location',
        sort:tableSort.value,
      })
    }
    const exportEvt = async(form: any, pages: PagesType)=>{
      const res = await exportGetChartDataDetail({
        ...props.params,
        ...form,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: true,
        ident: 'Online_behavior_location',
        sort:tableSort.value,
      })
      downloadFile(res)
    }
    onMounted(()=>{
      getSelectData({ident: 'Online_behavior_location'}).then(res=>{
        if(res.code ==1){
          let {locationType,campus} = res.data
          campusCls.value = campus.map((item:any)=>{
            return {value:item,label:item}
          })
          locationCls.value = locationType.map((item:any)=>{
            return {value:item,label:item}
          })
        }
      })
    })
    const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Online_behavior_location', campus:copy },copy)
    watch(dataSource, (res) => {
      if(res.code !=1){
        mainData.locationType = []
        mainData.rank = []
        mainData.main = ''
        mapLeft.value = []
        mapRight.value = []
        return
      }
      const {locationType,rank,main,onlinePosition1,onlinePosition2} = res.data
      mainData.locationType = locationType
      mainData.rank = rank
      mainData.main = main
      mapLeft.value = onlinePosition1?onlinePosition1:[]
      mapRight.value = onlinePosition2?onlinePosition2:[]
      nextTick(() => {
        initPieChart();
      })
    
    }, { immediate:true, deep: true })
    watch
    return () => {
      return <div
        class={{
          'OnlineLocation': true,
          'flex': true,
          'horizontal': true,
          // 'vertical': props.direction === 'vertical'
        }}
      >
        <RedTab class='mapTab' btnList={selectList} isActive={copy.value} onRedTabChange={redTabChange} />
        <div class='colorBar-box column'>
          <div>高</div>
          <div class='colorBar'></div>
          <div>低</div>
        </div>
        <div class='fixed-box'>
          <div class='fixed-box-top'>
            <c-title title='上网地点分析' />
            <div class='c-title mt12'>上网地点类型分布</div>
            <div class='pie-chart' ref={PieChart}></div>
            <div class='text'>上网地点主要在 <span>{mainData.main}</span></div>
          </div>
          <div class="fixed-box-bottom">
            <div class='sb'> 
              <div class='c-title'>上网地点时长排名</div>
              <div class='look' onClick={lookMore}>查看详情</div>
            </div>
            <el-table height="256" data={mainData.rank}   style={{marginTop: '10px'}}
              header-cell-style={{ background: '#E4E7ED', color: '#000000', height: '35px', padding: 0, }}
              row-style={{height: '44px',}} cell-style={{padding:'10px 0'}}>
              <el-table-column prop="name" label="排名" width="80" align='center' >
              {{
                default:(arg: { $index:any; }) =>{
                  return <div class='tableIndex'  style={{background: hotBgColor(arg.$index+1)}}>{arg.$index+1}</div>
                }
              }}
              </el-table-column>
              <el-table-column prop="name" label="上网地点" align='center'  show-overflow-tooltip={true} />
              <el-table-column prop="time" label="上网时长" align='center'  show-overflow-tooltip={true}>
              {{
                default:(arg:{row:any}) =>{
                  return <div>{arg.row.time}小时</div>
                }
              }}
              </el-table-column>
            </el-table>
          </div>
        </div>
        {
          renderDom(copy.value)
        }
        <c-table-plus onSortClick={sortClick} columns={columns} request={tableRequest} searchConfig={searchConfig} visible={showPages.value}
          title='各地点上网时长' dialogWidth="1460px" height="450px" closed={() => showPages.value = false} exportBtn={exportEvt}>
          {{
            index:(arg:any) =>{
              const {data} = arg
              return <div>{ data.$index + 1 }</div>
            },
          }}
        </c-table-plus>
        <WarningSeal name="上网地点" ident='Online_behavior_location'/>
      </div>
    }
  }
})


export default OnlineLocation


