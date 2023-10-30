<template>
  <div class="departure-destination">
    <div class="departure-destination-top">
      <div class="top-box sb">
        <c-title title="离校学生去向分布" />
        <Search :rowNum="0" :search-config="searchConfig" :searchForm="searchForm" @queryClick="queryClick"
          @resetClick="resetClick" @selectChange="selectChange" />
      </div>
      <div class="bottom-box sb" v-loading="mapLoading">
        <div class="bottom-left">
          <div class="tag flex-start">
            <img src="@/assets/imgs/warn-tag.png" alt="">
            注: 学生非毕业离校去向
          </div>
          <div class="chart-box">
            <div class="word-chart" ref="wordChart"></div>
            <div class="stu-chart" ref="stuChart"></div>
          </div>
        </div>
        <el-table :summary-method="getSummaries" height="326" :data="dataObj.list" show-summary style="width: 536px"
          :header-cell-style="{ background: '#E4E7ED', color: '#000000', }">
          <el-table-column prop="index" label="序号" align="center" />
          <el-table-column prop="name" label="去向地区" align="center" />
          <el-table-column prop="ratio" label="占比" align="center" />
          <el-table-column prop="value" label="人数" align="center" />
        </el-table>
      </div>
    </div>
    <div class="departure-destination-bottom">
      <c-title title="离校学生去向明细" />
      <Search class="mt16" :rowNum="0" :search-config="searchConfig2" :searchForm="searchForm2" @queryClick="queryClick2"
        @resetClick="resetClick2" @selectChange="selectChange2" />

      <c-table v-loading="tableLoading" :align="'center'" :columnList="columnList" :data="tableData" :pages="pages" @changeCurrent="changeCurrent"
        @changeSize="changeSize" height="360">
        <template #operation="{ data }">
          <el-button style="color:#005DA7" link>学生个像</el-button>
        </template>
      </c-table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import Search from '@/components/common/Search.vue'
import { SearchConfig } from '@/components/common/Search'
import { ElLoading } from 'element-plus';
import { getOrgType } from "@/api/modules/emphasisList"
import china from "@/utils/china.json";
import world from "@/utils/world_fix.json"
import { leaveSchoolMap, leaveSchoolDestination, leaveSchoolList } from '@/api/modules/groupTrajectory' 
const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts;
const mapLoading = ref(false)
const tableLoading = ref(false)

const searchForm = reactive({
  campusId: "",
  collegeId: "",
  majorId: "",
  gradeId: "",
  classId: "",
});
const searchForm2 = reactive({
  campusId: "",
  collegeId: "",
  majorId: "",
  gradeId: "",
  classId: "",
  name: "",
  approvalProcess: "",
  destination: "",
  sex: ""

});
const searchConfig = ref<SearchConfig[]>([])
const searchConfig2 = ref<SearchConfig[]>([])

const tableData = ref([])
const pages = reactive({
  current: 1,
  size: 10,
  total: 0,
})
const columnList = [
  {
    prop: 'name',
    label: '姓名',
    width: '140'
  },
  {
    prop: 'sex',
    label: '性别',
    width: '80'
  },
  {
    prop: 'id_no',
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
    width: '150'
  },
  {
    prop: 'tel',
    label: '联系电话',
    width: '130'
  },
  {
    prop: 'leve_time',
    label: '离校时间',
    width: '190'
  },
  {
    prop: 'plan_back_time',
    label: '预计返校时间',
    width: '190'
  },
  {
    prop: 'reason',
    label: '离校原因',
    width: '150'
  },
  {
    prop: 'destination',
    label: '所去地区',
    width: '100'
  },
  {
    prop: 'approval_process',
    label: '请假',
    width: '100'
  },
  {
    prop: 'hourdiff',
    label: '已离校时长',
    width: '120'
  },
  {
    prop: 'emergency_phone',
    label: '紧急联系电话',
    width: '150'
  },

]
const queryClick = (form: object) => {
  getData();
}
const queryClick2 = (form: object) => {
  getDataList();
}
const resetClick = () => {
  getData();
}
const resetClick2 = () => {
  getDataList();
}
const selectChange = async (key: string, val: string | number) => {
  const list = ['campusId', 'collegeId', 'majorId', 'gradeId', 'classId',]
  if (list.includes(key)) {
    if (key === 'campusId') {
      searchForm.collegeId = '';
      searchForm.majorId = '';
      searchForm.gradeId = '';
      searchForm.classId = '';
    }
    if (key === 'collegeId') {
      searchForm.majorId = '';
      searchForm.gradeId = '';
      searchForm.classId = '';
    }
    if (key === 'majorId') {
      searchForm.gradeId = '';
      searchForm.classId = '';
    }
    if (key === 'gradeId') {
      searchForm.classId = '';
    }
    const params = {
      campusId: searchForm.campusId,
      collegeId: searchForm.collegeId,
      majorId: searchForm.majorId,
      gradeId: searchForm.gradeId,
      classId: searchForm.classId,
    }
    const res = await getOrgType(params);
    if (res.code == 1) {
      const { collegeOrgList, majorOrgList, gradeOrgList, classOrgList } = res.data;
      if (key == 'campusId') {
        searchConfig.value.forEach(item => {
          if (item.key == 'collegeId') {
            item.options = collegeOrgList
          }
          if (item.key == 'majorId') {
            item.options = majorOrgList
          }
          if (item.key == 'gradeId') {
            item.options = gradeOrgList
          }
          if (item.key == 'classId') {
            item.options = classOrgList
          }
        })
      }
      if (key == 'collegeId') {
        searchConfig.value.forEach(item => {
          if (item.key == 'majorId') {
            item.options = majorOrgList
          }
          if (item.key == 'gradeId') {
            item.options = gradeOrgList
          }
          if (item.key == 'classId') {
            item.options = classOrgList
          }
        })
      }
      if (key == 'majorId') {
        searchConfig.value.forEach(item => {
          if (item.key == 'gradeId') {
            item.options = gradeOrgList
          }
          if (item.key == 'classId') {
            item.options = classOrgList
          }
        })
      }
      if (key == 'gradeId') {
        searchConfig.value.forEach(item => {
          if (item.key == 'classId') {
            item.options = classOrgList
          }
        })
      }
    }
  }
}

const selectChange2 = async (key: string, val: string | number) => {
  const list = ['campusId', 'collegeId', 'majorId', 'gradeId', 'classId',]
  if (list.includes(key)) {
    if (key === 'campusId') {
      searchForm2.collegeId = '';
      searchForm2.majorId = '';
      searchForm2.gradeId = '';
      searchForm2.classId = '';
    }
    if (key === 'collegeId') {
      searchForm2.majorId = '';
      searchForm2.gradeId = '';
      searchForm2.classId = '';
    }
    if (key === 'majorId') {
      searchForm2.gradeId = '';
      searchForm2.classId = '';
    }
    if (key === 'gradeId') {
      searchForm2.classId = '';
    }
    const params = {
      campusId: searchForm2.campusId,
      collegeId: searchForm2.collegeId,
      majorId: searchForm2.majorId,
      gradeId: searchForm2.gradeId,
      classId: searchForm2.classId,
    }
    const res = await getOrgType(params);
    if (res.code == 1) {
      const { collegeOrgList, majorOrgList, gradeOrgList, classOrgList } = res.data;
      if (key == 'campusId') {
        searchConfig2.value.forEach(item => {
          if (item.key == 'collegeId') {
            item.options = collegeOrgList
          }
          if (item.key == 'majorId') {
            item.options = majorOrgList
          }
          if (item.key == 'gradeId') {
            item.options = gradeOrgList
          }
          if (item.key == 'classId') {
            item.options = classOrgList
          }
        })
      }
      if (key == 'collegeId') {
        searchConfig2.value.forEach(item => {
          if (item.key == 'majorId') {
            item.options = majorOrgList
          }
          if (item.key == 'gradeId') {
            item.options = gradeOrgList
          }
          if (item.key == 'classId') {
            item.options = classOrgList
          }
        })
      }
      if (key == 'majorId') {
        searchConfig2.value.forEach(item => {
          if (item.key == 'gradeId') {
            item.options = gradeOrgList
          }
          if (item.key == 'classId') {
            item.options = classOrgList
          }
        })
      }
      if (key == 'gradeId') {
        searchConfig2.value.forEach(item => {
          if (item.key == 'classId') {
            item.options = classOrgList
          }
        })
      }
    }
  }
}
const initStuChart = () => {
  echart?.registerMap("china", china as any);
  const el: HTMLElement = instance?.refs.stuChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let datas = dataObj.chinaMap;
  let option = {
    grid: {
      // width: '100%',
      // height: '100%',
      left: '0%',
      right: '0%',
      bottom: '0%',
      containLabel: true
    },
    // 视觉映射组件
    visualMap: {
      type: "continuous",
      min: 0,
      max: 10000,
      realtime: false,
      calculable: false,
      color: ['#B22924', '#E9C5C4'],
      right: '15%',
      text: ['高', '低'],
      itemWidth: 15
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: { value: string; seriesName: string; name: string; }) {
        if (params.value) {
          return `${params.name} : ${params.value}人`;
        } else {
          return `${params.name} : 0人`;
        }
      }
    },
    layoutCenter: ['50%', '67%'],//位置
	  layoutSize:'100%',//大小
    series: [
      {
        type: 'map', // 类型
        // 系列名称，用于tooltip的显示，legend 的图例筛选 在 setOption 更新数据和配置项时用于指定对应的系列
        name: '中国地图',
        map: 'china', // 地图类型
        // 是否开启鼠标缩放和平移漫游 默认不开启 如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move' 设置成 true 为都开启
        roam: true,
        // 图形上的文本标签
        label: {
          show: false // 是否显示对应地名
        },
        zoom: 1.3,
        // 地图区域的多边形 图形样式
        itemStyle: {
          // areaColor: '#7B68EE', // 地图区域的颜色 如果设置了visualMap，areaColor属性将不起作用
          borderWidth: 0.5, // 描边线宽 为 0 时无描边
          borderColor: '#E4E7ED', // 图形的描边颜色 支持的颜色格式同 color，不支持回调函数
          borderType: 'solid' // 描边类型，默认为实线，支持 'solid', 'dashed', 'dotted'
        },
        // 高亮状态下的多边形和标签样式
        emphasis: {
          label: {
            show: true, // 是否显示标签
            color: '#fff' // 文字的颜色 如果设置为 'auto'，则为视觉映射得到的颜色，如系列色
          },
          itemStyle: {
            areaColor: '#FFCC00' // 地图区域的颜色
          }
        },
        // 地图系列中的数据内容数组 数组项可以为单个数值
        data: datas
      }
    ]
  };
  myChart?.setOption(option)
}
const initWordChart = () => {
  echart?.registerMap("world", world as any);
  const el: HTMLElement = instance?.refs.wordChart as any;
  let myChart = echart?.getInstanceByDom(el)
  if (myChart == null) {
    myChart = echart?.init(el);
  }
  let datas = dataObj.worldMap;
  let option = {
    grid: {
      width: '100%',
      height: '100%',
      left: '2%',
      right: '2%',
      bottom: '0%',
      containLabel: true
    },
    // 视觉映射组件
    visualMap: {
      show: false,
      type: "continuous",
      min: 0,
      max: 10000,
      realtime: false,
      calculable: false,
      color: ['#B22924', '#E9C5C4'],
      right: '0%',
      text: ['高', '低'],
      itemWidth: 15
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: { value: string; seriesName: string; name: string; }) {
        if (params.value) {
          return `${params.name} : ${params.value}人`;
        } else {
          return `${params.name} : 0人`;
        }
      }
    },
    series: [
      {
        type: 'map', // 类型
        // 系列名称，用于tooltip的显示，legend 的图例筛选 在 setOption 更新数据和配置项时用于指定对应的系列
        name: '世界地图',
        map: 'world', // 地图类型
        // 是否开启鼠标缩放和平移漫游 默认不开启 如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move' 设置成 true 为都开启
        roam: true,
        // 图形上的文本标签
        label: {
          show: false // 是否显示对应地名
        },
        zoom: 1.2,
        // 地图区域的多边形 图形样式
        itemStyle: {
          // areaColor: '#7B68EE', // 地图区域的颜色 如果设置了visualMap，areaColor属性将不起作用
          borderWidth: 0.5, // 描边线宽 为 0 时无描边
          borderColor: '#E4E7ED', // 图形的描边颜色 支持的颜色格式同 color，不支持回调函数
          borderType: 'solid' // 描边类型，默认为实线，支持 'solid', 'dashed', 'dotted'
        },
        // 高亮状态下的多边形和标签样式
        emphasis: {
          label: {
            show: true, // 是否显示标签
            color: '#fff' // 文字的颜色 如果设置为 'auto'，则为视觉映射得到的颜色，如系列色
          },
          itemStyle: {
            areaColor: '#FFCC00' // 地图区域的颜色
          }
        },
        // 地图系列中的数据内容数组 数组项可以为单个数值
        data: datas
      }
    ]
  };
  myChart?.setOption(option)
}
const changeCurrent = (v: number) => {
  pages.current = v;
  getDataList();
}
const changeSize = (v: number) => {
  pages.size = v;
  getDataList();
}
const dataObj = reactive<{chinaMap:[],worldMap:[],list:Array<any>}>({
  chinaMap:[],
  worldMap:[],
  list:[],

})
const getData = async () =>{
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: '加载中...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  mapLoading.value = true
  const res = await leaveSchoolMap(searchForm);
  if(res.code == 1){
    let { chinaMap, worldMap, tableList } = res.data;
    dataObj.chinaMap = chinaMap;
    dataObj.worldMap = worldMap;
    dataObj.list = tableList;
    dataObj.list.forEach((item,index) =>{
      item.index = index + 1;
      item.ratio = item.ratio + '%';
    })
    initStuChart();
    initWordChart();
  }
  // loading.close()
  mapLoading.value = false

}
const getSummaries = (param: { columns: any[]; data: any[]; }): string[] =>{
      const { columns, data } = param;
      const sumDic = {};
      columns.forEach((column: { property: string; }, index: number) => {
        // 第 1 列
        if (index === 0) {
          sumDic[column.property] = "合计";
          return;
        }
        // 其他列默认求和
        const values = data.map((item: { [x: string]: any; }) => Number(item[column.property]));
        if (!values.every((value: number) => isNaN(value))) {
          // 可以求和的列
          sumDic[column.property] = values.reduce((prev: any, curr: any) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
        } else {
          // 无法求和的列
          sumDic[column.property] = " ";
        }
      });

      // 指定列添加单位
      sumDic["value"] += " 人";
      return Object.values(sumDic);
}
  

const getDataList = async () =>{
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: '加载中...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  tableLoading.value = true
  const params = {
    ...searchForm2,
    pageNum: pages.current,
    pageSize: pages.size
  }
  const res = await leaveSchoolList(params);
  if (res.code == 1) {
    let { total, rows } = res.data;
    pages.total = total;
    tableData.value = rows;
    tableData.value.forEach((item:{approval_process:number|string}) =>{
      item.approval_process = item.approval_process==1? "是" : '否'
    })
  }
  // loading.close()
  tableLoading.value = false
} 
const init = async () => {
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: '加载中...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  const res = await getOrgType({});
  if (res.code == 1) {
    const { campusOrgList, collegeOrgList, majorOrgList, gradeOrgList, classOrgList } = res.data
    searchConfig.value = [
      {
        inputWidth: '160px',
        type: 'select',
        label: '',
        placeholder: '校区',
        key: 'campusId',
        opKey: 'id',
        opLabel: 'orgName',
        options: campusOrgList,
      },
      {
        inputWidth: '160px',
        type: 'select',
        label: '',
        placeholder: '学院',
        key: 'collegeId',
        opKey: 'id',
        opLabel: 'orgName',
        options: collegeOrgList,
      },
      {
        inputWidth: '160px',
        type: 'select',
        label: '',
        placeholder: '专业',
        key: 'majorId',
        opKey: 'id',
        opLabel: 'orgName',
        options: majorOrgList,
      },
      {
        inputWidth: '160px',
        type: 'select',
        label: '',
        placeholder: '年级',
        key: 'gradeId',
        opKey: 'id',
        opLabel: 'orgName',
        options: gradeOrgList,
      },
      {
        inputWidth: '160px',
        type: 'select',
        label: '',
        placeholder: '班级',
        key: 'classId',
        opKey: 'id',
        opLabel: 'orgName',
        options: classOrgList,
      },
    ]
    const re = await leaveSchoolDestination({})
    const { data } = re;
    let options: { value: string; label: string; }[] = [];
    data.forEach((item:string) =>{
      options.push({value:item,label:item})
    })
    searchConfig2.value = [
      {
        inputWidth: '80px',
        type: 'select',
        label: '',
        placeholder: '性别',
        key: 'sex',
        opKey: 'value',
        opLabel: 'label',
        options: [
          {
            label: '男',
            value: '男'
          },
          {
            label: '女',
            value: '女'
          },
        ],
      },
      {
        inputWidth: '120px',
        type: 'select',
        label: '',
        placeholder: '校区',
        key: 'campusId',
        opKey: 'id',
        opLabel: 'orgName',
        options: campusOrgList,
      },
      {
        inputWidth: '130px',
        type: 'select',
        label: '',
        placeholder: '学院',
        key: 'collegeId',
        opKey: 'id',
        opLabel: 'orgName',
        options: collegeOrgList,
      },
      {
        inputWidth: '130px',
        type: 'select',
        label: '',
        placeholder: '专业',
        key: 'majorId',
        opKey: 'id',
        opLabel: 'orgName',
        options: majorOrgList,
      },
      {
        inputWidth: '100px',
        type: 'select',
        label: '',
        placeholder: '年级',
        key: 'gradeId',
        opKey: 'id',
        opLabel: 'orgName',
        options: gradeOrgList,
      },
      {
        inputWidth: '100px',
        type: 'select',
        label: '',
        placeholder: '班级',
        key: 'classId',
        opKey: 'id',
        opLabel: 'orgName',
        options: classOrgList,
      },
      {
        inputWidth: '120px',
        type: 'select',
        label: '',
        placeholder: '所去地区',
        key: 'destination',
        opKey: 'value',
        opLabel: 'label',
        options: options,
      },
      {
        inputWidth: '80px',
        type: 'select',
        label: '',
        placeholder: '请假',
        key: 'approvalProcess',
        opKey: 'value',
        opLabel: 'label',
        options: [
          {
            label:'是',
            value: '1',
          },
          {
            label:'否',
            value: '0',
          }
        ],
      },
      {
        inputWidth: '216px',
        type: 'input',
        label: '',
        placeholder: '请输入关键词搜索',
        key: 'name',
      },
    ]
  }
  // loading.close()
  getData();
  getDataList();
}

onMounted(() => {
  init();
})

onBeforeUnmount(() => {

})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>