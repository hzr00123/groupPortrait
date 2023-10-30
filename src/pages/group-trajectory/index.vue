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

    <div class="mapContent sb" v-loading="loading">
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
        <div class="right" v-if="false">
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

      <div class="msg-box">
        <div class="msg-box-btn column" @click="showMore">
          <el-icon class="icon">
            <DArrowRight v-if="isShowMore" />
            <DArrowLeft v-else />
          </el-icon>
          {{ isShowMore ? '收起' : '展开' }}
        </div>
        <div class="up-box" v-show="isShowMore">
          <div class="up-box-tag column">
            行为轨迹分析
          </div>
          <div class="top flex-start">
            <img src="@/assets/imgs/gj.png" alt="">
            有轨迹学生
            <span>{{ behaveCount }}</span>
            人
          </div>
          <div class="center">
            <div class="title">行为占比分析</div>
            <div class="pie-chart" ref="MainPie"></div>
          </div>
          <div class="bottom">
            <div class="title">热门场所分析</div>
            <el-table height="153" :data="dataObj.hotPosition" style="margin-top: 10px;"
              :header-cell-style="{ background: '#F5F7F9', color: '#808080', height: '35px', padding: 0, }">
              <el-table-column prop="rang" label="排名" width="80">
                <template #default="{row}">
                  <div :class="row.rang=='NO.1'||row.rang=='NO.2'||row.rang=='NO.3'?'red-tag':'red-tag2'" >
                    {{ row.rang }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="场所名称" width="150" :show-overflow-tooltip="true" />
              <el-table-column prop="number" label="访问人数" />
            </el-table>
          </div>
        </div>
        <div class="down-box" v-show="isShowMore">
          <div class="down-box-tag column">
            无行为轨迹人员
          </div>
          <div class="top">
            <div class="top-t sb">
              <div class="title">学院分布</div>
              <div class="look" @click="lookFn">查看名单</div>
            </div>
            <div class="box">
              <ProgressBar :option="barOption" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <PageModal  v-if="showPages" :param="param" @closeModal="closeModal"/> -->

    <c-table-plus title="无行为轨迹人员" 
    dialogWidth="65%" 
    height="460px"
    requestDataKey="list"
    :visible="visible"
    :searchConfig="searchConfig"
    :columns="columns"
    :request="tableRequest"
    :exportBtn="exportEvt"
    :closed="() => visible = false">
      <template #index="{ data }">{{ data.$index + 1 }}</template>
      <template #action="{ data }">
        <ElLink type="primary">学生个像</ElLink>  
      </template>
    </c-table-plus>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import RedTab from '@/components/common/RedTab.vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import ProgressBar from '@/components/common/ProgressBar.vue'
import { exportNoGroupTraceDatas, getGroupTraceDatas, getNoGroupTraceDatas } from "@/api/modules/groupTrajectory"
import PageModal from './PageModal.vue'
import { ProgressConf } from '@/components/common/Search'
import { mapKey } from '@/utils'
import { Column } from '@/components/Table'
import { requestResType, PagesType, searchConfigType } from '@/components/Table-plus/index.d'
import { getOrgType } from '@/api/modules/emphasisList'
import { downloadFile } from '@/hooks'
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;

const showPages = ref(false)
const loading = ref(false)
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

const paramsObj = {
  campusId: 'stuCampusId',
  collegeId: 'stuCollegeId',
  majorId: 'stuMajorId',
  gradeId: 'stuGradeId',
  classId: 'stuClassId'
}
const visible = ref<boolean>(false)
const searchConfig: searchConfigType = [
  {
    type: 'select',
    // label: '性别',
    label: '',
    placeholder: '性别',
    inputWidth: '80px',
    labelWidth: '40px',
    key: 'stuSex',
    options: [{ label: '男', value: '男' }, { label: '女', value: '女' }]
  },
  {
    type: 'select',
    // label: '校区',
    label: '',
    placeholder: '校区',
    inputWidth: '120px',
    labelWidth: '40px',
    key: 'stuCampusId',
    request: getOrgType as any,
    reqKey: 'campusOrgList',
    opKey: 'id',
    opLabel: 'orgName',
    params: paramsObj,
    target: ['stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId']
  },
  {
    type: 'select',
    // label: '学院',
    label: '',
    placeholder: '学院',
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
    // label: '专业',
    label: '',
    placeholder: '专业',
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
    // label: '年级',
    label: '',
    placeholder: '年级',
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
    // label: '班级',
    label: '',
    placeholder: '班级',
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
    width: '110'
  },
  {
    prop: 'sex',
    label: '性别',
    width: '80'
  },
  {
    prop: 'userName',
    label: '学号',
    width: '180'
  },
  {
    prop: 'campusName',
    label: '校区',
    width: '150'
  },
  {
    prop: 'collegeName',
    label: '学院',
    width: '150'
  },
  {
    prop: 'majorName',
    label: '专业',
    width: '150'
  },
  {
    prop: 'gradeName',
    label: '年级',
    width: '150'
  },
  {
    prop: 'className',
    label: '班级',
    width: '100'
  },
  {
    prop: 'noBehaveTime',
    label: '无行为轨迹时长',
    width: '150'
  },
  {
    prop: 'lastPosition',
    label: '最后轨迹来源',
    width: '180'
  },
  {
    slot: 'action',
    label: '操作',
    width: '150',
    fixed: 'right',
    align: 'center'
  }
]
const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
  return getNoGroupTraceDatas({
    ...param.value,
    ...params,
    pageNum: pages.current,
    pageSize: pages.size
  })
}

const exportEvt = async (form: any, pages: PagesType) => {
  const res = await exportNoGroupTraceDatas({
    ...form,
    ...param.value,
  })
  downloadFile(res)
}

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
setMap(arg0: null): unknown
plugin(arg0: string[], arg1: () => void): unknown
  clearMap(): unknown, remove: (arg0: never[]) => void; add: (arg0: any) => void
}
let campusLeft: {
  clearMap(): unknown, plugin: any, remove: (arg0: never[]) => void; add: (arg0: any) => void
}
let heatmapLeft: {
  setMap(arg0: null): unknown, setDataSet: (arg0: { data: ({ lng: string; lat: string; count: number; currentNum?: undefined } | { lng: string; lat: string; currentNum: null; count: number })[]; max: number }) => void
} | null;
let heatmapRight:  {
  setMap(arg0: null): unknown, setDataSet: (arg0: { data: ({ lng: string; lat: string; count: number; currentNum?: undefined } | { lng: string; lat: string; currentNum: null; count: number })[]; max: number }) => void
} | null;
// 初始化地图
const initMap = () => {
  AMapLoader.load({
    key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.HeatMap", "AMap.moveAnimation"] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then(AMap => {
      AMap.plugin("AMap.MoveAnimation", () => { });
      //DOM初始化完成进行地图初始化
      campusLeft = new AMap.Map("campusLeft", {
        //设置地图容器id
        resizeEnable: true,
        zoom: 17.3, //初始化地图级别
        zooms: [17.3, 18], //缩放范围
        center: [116.18, 39.74] //初始化地图中心点位置
      });
      campusRight = new AMap.Map("campusRight", {
        //设置地图容器id
        resizeEnable: true,
        zoom: 18.9, //初始化地图级别
        zooms: [17.3, 18], //缩放范围
        center: [116.4780, 39.9813] //初始化地图中心点位置
      });
      //初始化heatmap对象
      initData()
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
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: '加载中...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  loading.value = true
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
    initMainPie(data.behaveTypeList);
    barOption.list = [];
    data.noBehave.forEach((item: { rate: any; name: any }) => {
      let obj = {
        name:'',
        ratio:item.rate,
        value:item.name,
      }
      barOption.list.push(obj as any)
    });
  
  }
  loading.value = false
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
        `${itm.count}人` +
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
  // showPages.value = true;
  visible.value = true;
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