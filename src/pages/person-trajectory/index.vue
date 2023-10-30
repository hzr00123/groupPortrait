<template>
  <div class="group-trajectory">
    <div class="group-trajectory-top sb">
      <div class="top-left sb">
        <RedTab class="mr15" :btnList="selectList" height="40px" :isActive="isActive" @redTabChange="handleClick" />
        <el-date-picker format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="changeTime" v-if="isActive == 0"
          v-model="time" type="daterange" unlink-panels range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" size="large" />
        <div v-else>{{ nowTime }}</div>
      </div>
      <div class="top-right" v-if="false">
        <div class="title">已选学生群体:</div>
        <div class="query">
          <span v-for="(item, index) in 2" :key="index">全部群体&nbsp;</span>
        </div>
        <div class="num">，共<span>5000</span>人，</div>
        <div class="zb">在全部学生中占<span>100%</span></div>
        <el-button class="custom-btn" size="large" type="primary">群体筛选</el-button>
      </div>
    </div>

    <div class="mapContent sb">
      <div class="top-bar-color"></div>
      <div class="top-bar sb">
        <div class="left sb">
          <div class="select-box sb">
            <div class="item" :class="activeMap == item.value ? 'activeMap' : ''" v-for="item in selectMapList"
              :key="item.value + 'map'" @click="mapClick(item.value)">
              {{ item.label }}
            </div>
          </div>
          <div class="map-box sb">
            <div class="item" :class="activeMapCls == item.value ? 'activeMapCls' : ''" v-for="item in mapClsList"
              :key="item.value + 'map'" @click="mapClsClick(item.value)">
              <img class="icon" :src="activeMapCls == item.value ? item.iconA : item.icon" alt="">
              {{ item.label }}
            </div>
          </div>
        </div>
        <div class="right" >
          <div class="switch sb">
            <span>动态趋势</span>
            <el-switch v-model="switchVal" size="default"
              style="--el-switch-on-color: #0e943b; --el-switch-off-color: #b1b1b1" />
          </div>
          <div class="sb" v-if="switchVal">
            <el-select class="select" v-model="timeVal" size="default">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <div class="play sb">
              <img class="l" src="@/assets/imgs/mapLeft.png" alt="">
              <img class="c" src="@/assets/imgs/mapStop.png" alt="">
              <img class="r" src="@/assets/imgs/mapRight.png" alt="">
            </div>
            <div class="time-box">
              2023年05月12日 13:00～14:00
            </div>
          </div>
        </div>
      </div>

      <div id="campusLeft" v-show="activeMap == 0 || activeMap == 1" :style="{ width: activeMap == 0 ? '50%' : '100%' }">
      </div>
      <div class="lineCenter" v-if="activeMap == 0"></div>
      <div id="campusRight" v-show="activeMap == 0 || activeMap == 2" :style="{ width: activeMap == 0 ? '50%' : '100%' }">
      </div>

    </div>

    <PageModal  v-if="showPages" :param="param" @closeModal="closeModal"/>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import RedTab from '@/components/common/RedTab.vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import ProgressBar from '@/components/common/ProgressBar.vue'
import { getGroupTraceDatas, getPersonalTraceDatas } from "@/api/modules/groupTrajectory"
import PageModal from './PageModal.vue'
import { ProgressConf } from '@/components/common/Search'
import { ElLoading } from 'element-plus'
import { mapKey } from '@/utils'
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

const showPages = ref(false)
const dataObj = ref({
  map1:[],
  map2:[],
  hotPosition:[],
})
const selectList = ref([
  {
    value: 0,
    label: "历史定位"
  },
  {
    value: 1,
    label: "实时定位"
  },
])
const selectMapList = ref([
  {
    value: 0,
    label: "全校"
  },
  {
    value: 1,
    label: "良乡校区"
  },
  {
    value: 2,
    label: "望京校区"
  },
])
const mapClsList = ref([
  {
    value: 0,
    label: "标记图",
    icon: getImageUrl('bjt'),
    iconA: getImageUrl('bjt-a')
  },
  {
    value: 1,
    label: "热力图",
    icon: getImageUrl('rlt'),
    iconA: getImageUrl('rlt-a')
  },
])
const nowTime = ref('')
const isActive = ref<string | number>(0)
const activeMap = ref<string | number>(0)
const activeMapCls = ref<string | number>(0)
const switchVal = ref(true)
const behaveCount = ref(0)
const time = ref('');
let timer: number = 0;

const timeVal = ref<string | number>(0)
const options = reactive([
  {
    label: '30min',
    value: 0
  },
  {
    label: '2H',
    value: 1
  },
])
const barOption = reactive<ProgressConf>({
  list:[],
  color: '#B22924',
  lableWidth: 0,
  lableAlign: 'center'
})
let handleClick = (index: string) => {
  isActive.value = index;
  initData();
}
const mapClick = (index: number) => {
  activeMap.value = index;
  initData();
}
const mapClsClick = (index: number) => {
  activeMapCls.value = index;
  if (index == 0) {
    initDrop(dataObj.value);
  } else {
    initMapHotData(dataObj.value);
  }
}
const timeFormate = (timeStamp: Date) => {
  let year = new Date(timeStamp).getFullYear();
  let month = new Date(timeStamp).getMonth() + 1 < 10 ? "0" + (new Date(timeStamp).getMonth() + 1) : new Date(timeStamp).getMonth() + 1;
  let date = new Date(timeStamp).getDate() < 10 ? "0" + new Date(timeStamp).getDate() : new Date(timeStamp).getDate();
  let hh = new Date(timeStamp).getHours() < 10 ? "0" + new Date(timeStamp).getHours() : new Date(timeStamp).getHours();
  let mm = new Date(timeStamp).getMinutes() < 10 ? "0" + new Date(timeStamp).getMinutes() : new Date(timeStamp).getMinutes();
  let ss = new Date(timeStamp).getSeconds() < 10 ? "0" + new Date(timeStamp).getSeconds() : new Date(timeStamp).getSeconds();
  let week = new Date(timeStamp).getDay();
  let weeks = ["日", "一", "二", "三", "四", "五", "六"];
  let getWeek = "星期" + weeks[week];
  nowTime.value = `${year}年${month}月${date}日 ${getWeek} ${hh}:${mm}:${ss}`;
}
let nowTimes = () => {
  timer = Number(setInterval(() => {
    timeFormate(new Date());
  }, 1000));
}

const isShowMore = ref(true)
const showMore = () => {
  isShowMore.value = !isShowMore.value
}

let campusLeftList = ref([])
let campusRightList = ref<any[]>([])
let campusRight: {
lngLatToContainer: any
containerToLngLat: any
getBounds: any
setStatus: any
on: any
setMap(arg0: null): unknown
plugin(arg0: string[], arg1: () => void): unknown
  clearMap(): unknown, remove: (arg0: never[]) => void; add: (arg0: any) => void
}
let campusLeft: {
getBounds: any
containerToLngLat: any
lngLatToContainer: any
getSize: any
setStatus: any
on: any
  clearMap(): unknown, plugin: any, remove: (arg0: never[]) => void; add: (arg0: any) => void
}
let heatmapLeft: {
  setMap(arg0: null): unknown, setDataSet: (arg0: { data: ({ lng: string; lat: string; count: number; currentNum?: undefined } | { lng: string; lat: string; currentNum: null; count: number })[]; max: number }) => void
} | null;
let heatmapRight:  {
  setMap(arg0: null): unknown, setDataSet: (arg0: { data: ({ lng: string; lat: string; count: number; currentNum?: undefined } | { lng: string; lat: string; currentNum: null; count: number })[]; max: number }) => void
} | null;

let resetMapline = () => {
  if (!dragOk.value) {
    return false
  }
  campusLeft.setStatus({
    dragEnable: false,
    zoomEnable: false
  });
  campusRight.setStatus({
    dragEnable: false,
    zoomEnable: false
  });
  dragOk.value = false
  campusLeft.clearMap()
  campusRight.clearMap()
  initData()
}


let dragOk = ref(false)
// 初始化地图
let initMap = () => {
  AMapLoader.load({
    key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.HeatMap", "AMap.moveAnimation"] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then(AMap => {
      AMap.plugin("AMap.MoveAnimation", () => { });
      //DOM初始化完成进行地图初始化
      campusLeft = new window.AMap.Map("campusLeft", {
        //设置地图容器id
        dragEnable: false,
        zoomEnable:false,
        zoom: 17.3, //初始化地图级别
        zooms: [17.3, 18], //缩放范围
        center: [116.18, 39.74] //初始化地图中心点位置
      });
      campusRight = new window.AMap.Map("campusRight", {
        //设置地图容器id
        dragEnable: false,
        zoomEnable: false,
        zoom: 18.9, //初始化地图级别
        zooms: [17.3, 18], //缩放范围
        center: [116.4780, 39.9813] //初始化地图中心点位置
      });
      //初始化heatmap对象



      initData()

      campusLeft.on('dragend', function () {
        resetMapline()
      });

      campusRight.on('dragend', function () {
        resetMapline()
      });

      campusLeft.on('zoomend', function () {
        resetMapline()
      });

      campusRight.on('zoomend', function () {
        resetMapline()
      });
    })
    .catch(e => {
      console.log(e);
    });
}



const getDay = (day: number) => {
  let today = new Date();
  let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds); //注意，这行是关键代码
  let tYear = today.getFullYear();
  let tMonth: string | number = today.getMonth();
  let tDate: string | number = today.getDate();
  tMonth = doHandleMonth(tMonth + 1);
  tDate = doHandleMonth(tDate);
  return tYear + "-" + tMonth + "-" + tDate;

}

const doHandleMonth = (month: string | number) => {
  let m = month;
  if (month.toString().length == 1) {
    m = "0" + month;
  }
  return m;
}
const changeTime = () => {
  initData();
}

const param = ref({})
const initData = async () => {
  let params = {
    campusName: activeMap.value == 1 ? '良乡校区' : activeMap.value == 2 ? '望京校区' : '',
    startTime: time.value.length>0? time.value[0] : getDay(-6),
    endTime: time.value.length>0? time.value[1] : getDay(0),
  }
  if(isActive.value==1){
    params.startTime = getDay(0);
    params.endTime = getDay(0);
  }
  param.value = params;
  let res = await getGroupTraceDatas(params);
  if(res.code == 1){
    let {data} = res;
    dataObj.value = data;
    behaveCount.value = data.behaveCount;
    if (activeMapCls.value == 0) {
      initDrop(data);
    } else {
      initMapHotData(data);
    }
    // initMainPie(data.behaveTypeList);
    barOption.list = [];
    data.noBehave.forEach((item: { rate: any; name: any }) => {
      let obj = {
        name:'',
        ratio:item.rate,
        value:item.name,
      }
      barOption.list.push(obj)
    });
    //
    initLine()
  }
}

let pathListRightOverall = ref<any[]>([])
let rightFirstLngLatOverall =  ref({})
let initLine = async () => {
  // let params = {
  //   startTime: '',
  //   endTime: '',
  //   userName: '14015005'
  // }
  // let res = await getPersonalTraceDatas(params);


  let personalTrace = [
    {

      "cur": 1,

      "recordTime": "2023-06-08 20:00:00",

      "analys": null,

      "roomNo": "101",

      "lng": "116.178994",

      "campus": "良乡校区",

      "name": "北餐厅",

      "dataSource": "一卡通系统",

      "lat": "39.740861"

    },

    {

      "cur": 0,

      "recordTime": "2023-06-02 22:16:37",

      "analys": null,

      "roomNo": "101",

      "lng": "116.18051",

      "campus": "良乡校区",

      "name": "图书馆",

      "dataSource": "一卡通系统",

      "lat": "39.73926"

    },

    {

      "cur": 0,

      "recordTime": "2023-06-03 04:00:00",

      "analys": null,

      "roomNo": "215",

      "lng": "116.478056",

      "campus": "望京校区",

      "name": "教学楼",

      "dataSource": "一卡通系统",

      "lat": "39.980927"

    },


    {

      "cur": 0,

      "recordTime": "2023-01-08 23:00:56",

      "analys": null,

      "roomNo": "310",

      "lng": "116.477538",

      "campus": "望京校区",

      "name": "学生宿舍",

      "dataSource": "一卡通系统",

      "lat": "39.981322"

    }
  ]

  let pathListLeft: any[] = []
  let pathListRight: any[] = []
  personalTrace.forEach((item) => {
    if (item.campus === '良乡校区') {
      pathListLeft.unshift(new window.AMap.LngLat(item.lng, item.lat))
    }
    if (item.campus === '望京校区') {
      pathListRight.unshift(new window.AMap.LngLat(item.lng, item.lat))
    }
  })

  let mapSizeLeft = campusLeft.getSize().width
  // let mapSizeRight = campusRight.getSize().width

  // 以下示例为左侧地图到右侧地图 如果返回的是右侧到左侧地图 同理 只是换算第三个虚拟点的时候注意下位置
  // 如果存在两侧校区的点位 才将虚拟点位加到地图上并且用到的是左侧最后一个点位和右侧第一个点位
  if (pathListLeft && pathListLeft.length > 0 && pathListRight && pathListRight.length > 0) {
    let leftLast = pathListLeft[pathListLeft.length - 1]
    let rightFirst = pathListRight[0]
    // 虚拟点坐标转换xy
    let pixelLeftLast = campusLeft.lngLatToContainer(leftLast);
    let pixelRightFirst = campusRight.lngLatToContainer(rightFirst);
    // 虚拟点坐标转换计算新的xy
    var leftLastXY = new window.AMap.Pixel(mapSizeLeft + pixelRightFirst.x, pixelRightFirst.y);
    var rightFirstXY = new window.AMap.Pixel(-(mapSizeLeft - pixelLeftLast.x), pixelLeftLast.y);
    // 虚拟点坐标转换换算经纬度  获得的是左侧最后一个虚拟点和右侧第一个虚拟点 然后连起来
    var leftLastLngLat = campusLeft.containerToLngLat(leftLastXY);
    var rightFirstLngLat = campusRight.containerToLngLat(rightFirstXY);
    // console.log('转换后的坐标', leftLastLngLat, rightFirstLngLat)

    pathListLeft.push(leftLastLngLat)
    pathListRight.unshift(rightFirstLngLat)
    pathListRightOverall.value = pathListRight
    rightFirstLngLatOverall.value = rightFirstLngLat


    // 以下为第一根线
    // 动画出来的路径 替代直接划线
    let passedPolyline = new window.AMap.Polyline({
      map: campusLeft,
      showDir: true,
      strokeColor: "red",  //线颜色
      strokeWeight: 6,      //线宽
    })

    // 虚拟一个运动的对象 可以加图片  让其隐藏
    let markerLeft = new window.AMap.Marker({
      map: campusLeft,
      position: pathListLeft[0],
      offset: new window.AMap.Pixel(-26, -26),
      visible: false
    })

    // 监听运动的点 获取移动点的位置
    markerLeft.on('moving', (e:any) => {
      // 运动的运动轨迹
      passedPolyline.setPath(e.passedPath)
      // southWest 西南 northEast 东北
      let lngBoundary = campusLeft.getBounds().northEast.lng
      // ? 理论是碰到边界点让动画停止 但是实际情况临界值可能会有差异 所以取5位小数 可能存在有两个点前5位一样
      let stringlng = e.pos.lng.toString()
      let ePos5 = Number(stringlng.substring(0, stringlng.indexOf('.') + 6))
      // 速度过快的时候可能取不到途径点 如果位数减少来判断== 可能出现未到边界就触发了 位数增大可能出现取不到那个点 故该次判断用>来判定触发图二的渲染
      if (ePos5 > lngBoundary) {
        markerLeft.stopMove()
        constructionLine()
      }
    })

    // 设置动画
    markerLeft.moveAlong(pathListLeft, {
      // 每一段的时长
      duration: 5000,//可根据实际采集时间间隔设置
      // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
      autoRotation: true,
    });
  }
}

// ? 虚拟这根线是为了减少右侧虚拟点到实际显示地图的时间
let constructionLine = async () => {
  // console.log('传入', rightFirstLngLatOverall, pathListRightOverall)
  // 以下为第三根线
  // 动画出来的路径 替代直接划线
  let passedPolylineCenter = new window.AMap.Polyline({
    map: campusRight,
    showDir: true,
    strokeColor: "red",  //线颜色
    strokeWeight: 6,      //线宽
  })

  // 虚拟一个运动的对象 可以加图片  让其隐藏
  let markerCenter = new window.AMap.Marker({
    map: campusRight,
    position: rightFirstLngLatOverall.value,
    offset: new window.AMap.Pixel(-26, -26),
    visible: false
  })

  // 监听运动的点 获取移动点的位置
  markerCenter.on('moving', (e: any) => {
    // 运动的运动轨迹
    passedPolylineCenter.setPath(e.passedPath)
    let lngBoundary = campusRight.getBounds().southWest.lng
    // ? 理论是碰到边界点让动画停止 但是实际情况临界值可能会有差异 所以取5位小数 可能存在有两个点前5位一样 但基本不影响
    // let stringlng = e.pos.lng.toString()
    // let ePos5 = Number(stringlng.substring(0, stringlng.indexOf('.') + 6))
    // 速度过快的时候可能取不到途径点 如果位数减少来判断== 可能出现未到边界就触发了 位数增大可能出现取不到那个点 故该次判断用>来判定触发图二的渲染
    if (e.pos.lng > lngBoundary) {
      markerCenter.stopMove()
      rightLine(e.pos.lng,e.pos.lat)
    }
  })

  // 设置动画
  markerCenter.moveAlong(pathListRightOverall.value, {
    // 每一段的时长
    duration: 1000,//可根据实际采集时间间隔设置
    // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
    autoRotation: true,
  });
}

let rightLine = async (lng: any,lat: any) => {
  //  替换第三根线的起点为虚拟线的终点
  let rightMapFinal = new window.AMap.LngLat(lng, lat)
  pathListRightOverall.value.splice(0,1, rightMapFinal)
  // 以下为第三根线
  // 动画出来的路径 替代直接划线
  let passedPolylineRight = new window.AMap.Polyline({
    map: campusRight,
    showDir: true,
    strokeColor: "red",  //线颜色
    strokeWeight: 6,      //线宽
  })

  // 虚拟一个运动的对象 可以加图片  让其隐藏
  let markerRight = new window.AMap.Marker({
    map: campusRight,
    position: rightFirstLngLatOverall.value,
    offset: new window.AMap.Pixel(-26, -26),
    visible: false
  })

  // 监听运动的点 获取移动点的位置
  markerRight.on('moving', (e:any) => {
    // 运动的运动轨迹
    passedPolylineRight.setPath(e.passedPath)
    // 到达最后一个点
    let lngLast = pathListRightOverall.value[pathListRightOverall.value.length - 1].lng
    if (e.pos.lng === lngLast) {
       // 为了刷新地图拖拽实现重新画线 本来用设置拖拽状态来实现无缝连接动画 结果该状态设置成false 扔能在多次拖拽下触发拖拽事件 解决方案为双重禁止 在禁止下触发的拖拽事件不执行
      markerRight.stopMove()
      dragOk.value = true
      campusLeft.setStatus({
        dragEnable: true,
        zoomEnable:true
      });
      campusRight.setStatus({
        dragEnable: true,
        zoomEnable: true
      });
    }
  })

  // 设置动画
  markerRight.moveAlong(pathListRightOverall.value, {
    // 每一段的时长
    duration: 5000,//可根据实际采集时间间隔设置
    // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
    autoRotation: true,
  });
}



const initDrop = (data: {
  map1: { name: string; count: any; lng: any; lat: any }[],
  map2: { name: string; count: any; lng: any; lat: any }[]
})=>{
  campusLeft.clearMap();
  campusRight.clearMap();
  if (heatmapLeft != null) {
    heatmapLeft.setMap(null);
  }
  if (heatmapRight != null) {
    heatmapRight.setMap(null);
  }
  if(data && data.map1){
    data.map1.forEach((itm: { name: string; count: any;  lng: any; lat: any; }) => {
      let backHtml = ''
      if (itm.count<500) {
        backHtml = '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#FC9F1A, #F7B733);">'
      } else {
        backHtml = '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#e92a2a, #ec423f);">'
      }
      const markerContent = backHtml +
        `${itm.count}次` +
        '</div>' +
        '</div>';
      const position = new window.AMap.LngLat(itm.lng, itm.lat); // Marker经纬度
      let marker = new window.AMap.Marker({
        position: position,
        content: markerContent, // 将 html 传给 content
        offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
      });

      campusLeft.add(marker);
      campusLeftList.value.push(marker as never)

    });
  }
  if(data && data.map2){
    data.map2.forEach((itm: { name: string; count: any;  lng: any; lat: any; }) => {
      let backHtml = ''
      if (itm.count<500) {
        backHtml = '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#FC9F1A, #F7B733);">'
      } else {
        backHtml = '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#e92a2a, #ec423f);">'
      }
      const markerContent = backHtml +
        `${itm.count}人` +
        '</div>' +
        '</div>';
      const position = new window.AMap.LngLat(itm.lng, itm.lat); // Marker经纬度
      let marker = new window.AMap.Marker({
        position: position,
        content: markerContent, // 将 html 传给 content
        offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
      });

      campusRight.add(marker);
      campusRightList.value.push(marker as never)
    });
  }
}
const initMapHotData = (data: {
  map1: { name: string; count: any; lng: any; lat: any }[],
  map2: { name: string; count: any; lng: any; lat: any }[]
}) => {

  campusLeft.clearMap();
  campusRight.clearMap();

  if (heatmapLeft != null) {
    heatmapLeft.setMap(null);
  }
  campusLeft.plugin(["AMap.HeatMap"], function () {      //加载热力图插件
    heatmapLeft = new window.AMap.HeatMap(campusLeft, {
      radius: 40, //给定半径
      opacity: [0.1, 1],
      gradient: {
        0.1: "blue",
        0.2: "blue",
        0.4: "green",
        0.6: "yellow",
        1.0: "red"
      }
    });    //在地图对象叠加热力图
    heatmapLeft?.setDataSet({ data: data.map1, max: 100 }); //设置热力图数据集
    //具体参数见接口文档
  });
  if (heatmapRight != null) {
    heatmapRight.setMap(null);
  }
  campusRight.plugin(["AMap.HeatMap"], function () {      //加载热力图插件
    heatmapRight = new window.AMap.HeatMap(campusRight, {
      radius: 40, //给定半径
      opacity: [0.1, 1],
      gradient: {
        0.1: "blue",
        0.2: "blue",
        0.4: "green",
        0.6: "yellow",
        1.0: "red"
      }
    });    //在地图对象叠加热力图
    heatmapRight?.setDataSet({ data: data.map2, max: 100 }); //设置热力图数据集
    //具体参数见接口文档
  });

}
const initMainPie = (list:[]) => {
  const el: HTMLElement = instance?.refs.MainPie as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let data = list;
  let option = {
    color: ['#FD5145', '#1B528B', '#6376DC', '#00C9F2', '#F7B500'],
    legend: {
      // type: "scroll",
      orient: 'vertical',
      top: 'middle',
      right: '10%',
      bottom: '0%',
      textStyle: {
        color: "#3E5463",
        fontSize: 14,
        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
        rich: {
          a: {
            // width: 60,
            padding: [0, 0, 0, 0],
            color: '#3E5463',
            fontWeight: 'bold'
          },
          b: {
            width: 60,
            padding: [0, 0, 0, 0],
            color: '#3E5463',
            fontWeight: 'bold'
          },
          c: {
            width: 60,
            padding: [0, 0, 0, 0],
          },
        },
      },
      itemWidth: 10,
      itemHeight: 4,
      itemGap: 15,
      icon: "rect",
      pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
      pageIconSize: 12,  //当然就是按钮的大小
      pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
      tooltip: {
        show: true
      },
      data: data.map((item: { name: any }) => item.name),
      //   formatter: (name: string) => {
      //     let total = 0;
      //     let tarValue: number = 0; // 为 tarValue 赋一个默认值
      //     for (let i = 0; i < data.length; i++) {
      //         total += data[i].value;
      //         if (name === data[i].name) {
      //             tarValue = data[i].value;
      //         }
      //     }
      //     const p = ((tarValue / total) * 100).toFixed(2);
      //     return `{c|${name}} {b|${tarValue}项} {a| ${p}}%`;
      // }

    },
    tooltip: {
      formatter: '{b} : {c}  ({d}%)'
    },
    series: [
      {
        z: 2,
        radius: ['60%', '70%'],
        center: ['26%', '50%'],
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
          borderWidth: 4,
          normal: {
          }
        },
        data: data
      },
      {
        z: 1,
        radius: ['70%', '80%'],
        center: ['26%', '50%'],
        type: 'pie',
        //roseType: 'radius',
        emphasis: {
          label: {
            show: false
          }
        },

        //animation: false,
        itemStyle: {
          normal: {
            opacity: 0.2,
          }
        },
        label: {
          show: false,
        },
        labelLine: {
          show: false
        },
        tooltip: {
          show: false
        },
        silent: true,
        data: data
      },


    ]
  }
  myChart?.setOption(option);
}
const lookFn = () =>{
  showPages.value = true;
}
const closeModal = () =>{
  showPages.value = false;
}
onMounted(() => {
  nowTimes();
  initMap();
})

onBeforeUnmount(() => {
  clearInterval(timer); //清除定时器
  timer = 0;
})
</script>

<style lang="scss" scoped>
@import './index.scss';

:deep(.custom-btn:active) {
  color: #ffffff;
  border-color: #004e8d;
  background-color: #004e8d;
}

:deep(.custom-btn) {
  color: #ffffff;
  border: 1px solid #005da7;
  background: #005da7;
}
</style>