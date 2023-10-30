<template>
    <div class="two-content">
        <WarningSeal name="学籍变动" ident="Changes_in_student_status"/>
        <c-title title="基本信息画像" />
        <div :class="['two-content-box', 'sb', {scholarship: true, flex: true, horizontal: direction === 'horizontal', vertical: direction === 'vertical'}]">
            <div :class="['left', 'column', { w49:  direction === 'horizontal', w100: direction === 'vertical'}]">
                <div class="btn" @click="openUserList">人员名单</div>
                <ProgressBar :option="progressBarOpt" @handleClick="handleClick"/>
                <div class="list-bottom">
                    学籍变动类型人数分布
                </div>
            </div>
            <div v-if="$attrs.view !== 'left'" :class="['right', { w49: direction === 'horizontal', w100: direction === 'vertical' }]">
                <template v-if="currentTitle == '毕业'">
                    <div class="c-title">
                        非“毕业”变动
                    </div>
                    <div class="right-chart-box sb">
                        <div class="left-pie" ref="leftPie"></div>
                        <div class="line-box">
                            <div class="line1"></div>
                            <div class="line2"></div>
                        </div>
                        <div class="right-pie" ref="rightPie"></div>
                    </div>
                    <div class="right-chart-txt">
                        非"毕业"变动类型占比 <span>{{noGraduateRate}}%</span> 主要 <span v-for="(it, ix) in changeTypeTopSort.slice(0, 3)" :key="ix">{{it}} <span v-if="ix < changeTypeTopSort.slice(0, 3).length - 1">、</span></span>
                    </div>
                    <div class="c-title">学籍变动原因</div>
                    <div class="right-cy" ref="rightCy"></div>
                    <div class="right-chart-txt" v-if="changeReasonIk && changeReasonIk.length">
                        学籍变动原因关键词Top3 <span v-for="(it, ix) in changeReasonIk.slice(0, 3)" :key="ix">{{ it.name }} <span v-if="ix < changeReasonIk.slice(0, 3).length - 1">、</span></span>
                    </div>
                </template>
                <template v-else>
                    <div class="mg-b20" style="display: flex;justify-content: flex-end;">
                        <el-button type="primary" size="mini" @click="goBack">返回整体分析</el-button>
                    </div>
                    <div class="c-title">{{ currentTitle }}</div>
                    <div style="display: flex;flex-direction: column;align-items: center;">
                        <ElProgress class="Progress-style" type="circle" :width="110" :stroke-width="10" color="#317DB8"
                            :percentage="typeData.typeRate">
                            <template #default="{ percentage }">
                                <span class="percentage-value" style="color:#317DB8;">{{ percentage }}<span>%</span>
                                </span>
                            </template>
                        </ElProgress>
                        <div class="right-chart-txt">变动人数{{typeData.typeCount}}人  占比  {{typeData.typeRate}}%</div>
                    </div>
                    
                    <div class="c-title">“提前毕业”原因</div>
                    <div class="right-cy" ref="reasonCy"></div>
                    <div class="right-chart-txt" v-if="advancedReason && advancedReason.length">变动原因关键词Top3  
                        <span v-for="(it, ix) in advancedReason.slice(0, 3)" :key="ix">{{it.name}} <span v-if="ix < 2">、</span> </span>
                    </div>
                </template>
            </div>
        </div>

        <el-dialog
            v-model="dialogVisible"
            title="学籍变动名单"
            width="65%">
            <section>
                <Search :search-config="searchConfig" 
                :searchForm="searchForm" 
                :rowNum="4"
                :isExport="true"
                @queryClick="queryClick"
                @resetClick="resetClick"
                @selectChange="selectChange"
                @exportClick="exportClick" />
                

                <c-table align="center"
                :columnList="columnList"
                :data="tableData"
                :pages="pages"
                height="400"
                @changeCurrent="changeCurrent" 
                @changeSize="changeSize"
                v-loading="loading"
                >
                    <template #index="{ data }">
                        {{ data.$index+1 }}
                    </template>
                    <template #operation="{ data }">
                        <el-button type="danger" link @click="lookReason(data)">变动原因</el-button>
                        <el-button link>学生个像</el-button>
                    </template>
                </c-table>
            </section>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { downloadFile, usePortraitRequest } from '@/hooks';
import { getChartDataDetail, changeChartData, exportGetChartDataDetail } from '@/api/modules/studentPortrait'
import { getCurrentInstance, nextTick, onMounted, ref, reactive, watch, toRefs,onBeforeMount, onUnmounted, inject } from 'vue';
import { BaseParams } from '../../types';
import { ElLoading, ElMessageBox } from 'element-plus';
import { getOrgType } from '@/api/modules/emphasisList';
import ProgressBar from "@/components/common/ProgressBar.vue";
import WarningSeal from '@/components/WarningSeal'
import Search from '@/components/common/Search.vue'
import { userStore } from '@/store/user';
const props = withDefaults(defineProps<{params: BaseParams, direction: string}>(), {
    params: {} as any,
    direction: 'horizontal'
})
const dialogVisible = ref<boolean>(false);
const loading = ref<boolean>(false)

const campusOrgList = ref([])
const collegeOrgList = ref([])
const majorOrgList = ref([])
const gradeOrgList = ref([])
const classOrgList = ref([])

const searchConfig = [
    {
      inputWidth: '100px',
      type: 'select',
      label: '性别',
      placeholder: '性别',
      key: 'stuSex',
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
      inputWidth: '150px',
      type: 'select',
      label: '校区',
      placeholder: '校区',
      key: 'stuCampusId',
      opKey: 'id',
      opLabel: 'orgName',
      options: campusOrgList,
    },
    {
      inputWidth: '140px',
      type: 'select',
      label: '学院',
      placeholder: '学院',
      key: 'stuCollegeId',
      opKey: 'id',
      opLabel: 'orgName',
      options: collegeOrgList,
    },
    {
      inputWidth: '140px',
      type: 'select',
      label: '专业',
      placeholder: '专业',
      key: 'stuMajorId',
      opKey: 'id',
      opLabel: 'orgName',
      options: majorOrgList,
    },
    {
      inputWidth: '140px',
      type: 'select',
      label: '年级',
      placeholder: '年级',
      key: 'stuGradeId',
      opKey: 'id',
      opLabel: 'orgName',
      options: gradeOrgList,
    },
    {
      inputWidth: '140px',
      type: 'select',
      label: '班级',
      placeholder: '班级',
      key: 'stuClassId',
      opKey: 'id',
      opLabel: 'orgName',
      options: classOrgList,
    },
    {
      inputWidth: '135px',
      labelWidth: '75px',
      type: 'select',
      label: '变动类型',
      placeholder: '变动类型',
      key: 'category',
      opKey: 'id',
      opLabel: 'orgName',
      options: [
        {label:'保留入学资格', value: '保留入学资格'},
        {label:'放弃入学资格', value: '放弃入学资格'},
        {label:'取消入学资格', value: '取消入学资格'},
        {label:'转专业', value: '转专业'},
        {label:'休学', value: '休学'},
        {label:'出国', value: '出国'},
        {label:'复学', value: '复学'},
        {label:'退学', value: '退学'},
        {label:'提前毕业', value: '提前毕业'},
        {label:'毕业', value: '毕业'},
        {label:'肄业', value: '肄业'},
        {label:'结业', value: '结业'},
        {label:'延迟毕业', value: '延迟毕业'},
        {label:'保留学籍', value: '保留学籍'},
        {label:'开除学籍', value: '开除学籍'}
      ],
    },
    {
        inputWidth: '140px',
        type: 'input',
        placeholder: '请输入姓名或学号搜索',
        key: 'name'
    },
]
const searchForm = reactive({
    stuSex: '',
    stuCampusId: '',
    stuCollegeId: '',
    stuMajorId: '',
    stuGradeId: '',
    stuClassId: '',
    category: '',
    name: ''
});
const columnList = [
    {
        slot: 'index',
        label: '序号',
        width: '110'
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
        width: '110'
    },
    {
        prop: 'campusName',
        label: '校区',
        width: '110'
    },
    {
        prop: 'collegeName',
        label: '学院',
        width: '110'
    },
    {
        prop: 'majorName',
        label: '专业',
        width: '110'
    },
    {
        prop: 'gradeName',
        label: '年级',
        width: '110'
    },
    {
        prop: 'className',
        label: '班级',
        width: '110'
    },
    {
        prop: 'changeType',
        label: '变动类型',
        width: '110'
    },
    {
        prop: 'changeTime',
        label: '变动时间',
        width: '110'
    },
    {
        slot: 'operation',
        label: '操作',
        width: '200',
        fixed: 'right'
    },
]
const tableData = ref([])
const pages = reactive({
    current: 1,
    size: 10,
    total: 0,
})

const instance = getCurrentInstance();
const echart = instance?.proxy?.$echarts
const leftPie = ref()
const rightPie = ref()
const rightCy = ref()
const reasonCy = ref()
const typeData = reactive({
    typeCount: 0,
    typeRate: 0
})
const currentTitle = ref<string>('毕业')
const advancedReason = ref<any>()
const progressBarOpt = reactive({
    list: [],
    height: '450px',
    color: '#005DA7',
    lableWidth: 148,
    lableAlign: 'right',
    unit: '人'
})
const initLeftPieChart = () => {
    const el: HTMLElement = leftPie.value;
    let myChart = echart?.getInstanceByDom(el)
    if (myChart == null) {
        myChart = echart?.init(el);
    }
    let colors = ['#005DA7', '#00C9F2', '#F39702', '#E3493E', '#231815', '#45A0E6'];
    let datas = changeType.value

    let option = {
        color: colors,
        legend: {
            type: "scroll",
            // icon: "circle",
            orient: 'vertical',
            top: 'middle',
            left: '0%',
            bottom: '0%',
            textStyle: {
                color: "#3E5463",
                fontSize: 14,

                backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                rich: {
                    a: {
                        width: 30,
                        padding: [0, 0, 0, 0],

                    },
                    c: {
                        width: 60,
                        padding: [0, 0, 0, 0],
                    }
                },
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
            data: datas.map((item: any) => item.name),
            formatter: function (name: string) {
                var total = 0;
                var tarValue: number = 0;
                for (var i = 0; i < datas.length; i++) {
                    total += datas[i].value;
                    if (name === datas[i].name) {
                        tarValue = datas[i].value;
                    }
                }
                var p = Math.round((tarValue! / total) * 100) || 0;
                if (name.length > 4) {
                    name = name.substring(0, 4) + '...'
                }
                return `{c|${name}}{a| ${p}%}`;
            },

        },
        tooltip: {
            formatter: '{b} : {c} 人 ({d}%)'
        },
        series: [
            {
                radius: ['45%', '70%'],
                center: ['80%', '50%'],
                type: 'pie',
                //roseType: 'radius',
                emphasis: {
                    label: {
                        show: true
                    }
                },
                label: {
                    show: true,
                    position: 'center',
                    color: '#4c4a4a',
                    formatter: '{total|' + changeTypeCount.value + '}' + '人',
                    rich: {
                        total: {
                            fontSize: 16,
                            color: '#203449',
                        }
                    },
                    padding: [5, 0, 0, 0],
                },
                labelLine: {
                    show: false
                },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 2,

                },
                data: datas
            },
        ]
    }
    myChart?.setOption(option)
}
const initRightPieChart = () => {
    const el: HTMLElement = rightPie.value;
    let myChart = echart?.getInstanceByDom(el)
    if (myChart == null) {
        myChart = echart?.init(el);
    }
    let colors = ['#5191CC', '#8C6C4E', '#DEC859', '#4D5FC1', '#223274', '#7665CC', '#6E99E5'];
    let datas = otherType.value

    let option = {
        color: colors,
        legend: {
            type: "scroll",
            // icon: "circle",
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
                        width: 30,
                        padding: [0, 0, 0, 0],

                    },
                    c: {
                        width: 60,
                        padding: [0, 0, 0, 0],
                    },
                },
            },
            itemWidth: 10,
            itemHeight: 16,
            itemGap: 4,
            icon: "rect",
            pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
            pageIconSize: 10,  //当然就是按钮的大小
            pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
            tooltip: {
                show: true
            },
            data: datas.map((item:any) => item.name),
            formatter: function (name: string) {
                var total = 0;
                var tarValue: number = 0;
                for (var i = 0; i < datas.length; i++) {
                    total += datas[i].value;
                    if (name === datas[i].name) {
                        tarValue = datas[i].value;
                    }
                }
                var p = Math.round((tarValue! / total) * 100) || 0;
                if (name.length > 4) {
                    name = name.substring(0, 4) + '...'
                }
                return `{c|${name}}{a| ${p}%}`;
            },

        },
        tooltip: {
            formatter: '{b} : {c} 人 ({d}%)'
        },
        series: [
            {
                radius: ['33%', '58%'],
                center: ['17%', '50%'],
                type: 'pie',
                //roseType: 'radius',
                emphasis: {
                    label: {
                        show: true
                    }
                },
                label: {
                    show: true,
                    position: 'center',
                    color: '#4c4a4a',
                    formatter: '{total|' + otherTypeCount.value + '}' + '人',
                    rich: {
                        total: {
                            fontSize: 14,
                            color: '#203449',
                        }
                    },
                    padding: [5, 0, 0, 0],
                },
                labelLine: {
                    show: false
                },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 2,

                },
                data: datas
            },
        ]
    }
    myChart?.setOption(option)
}
const initRightCychart = () => {
    const el: HTMLElement = rightCy.value;
    let myChart = echart?.getInstanceByDom(el)
    if (myChart == null) {
        myChart = echart?.init(el);
    }
    console.log(changeReasonIk.value, 'changeReasonIk.value');
    
    let option = {
        series: [{
            type: 'wordCloud',
            sizeRange: [14, 30],
            rotationRange: [0, 0],
            rotationStep: 45,
            gridSize: 30,
            shape: 'diamond',
            width: '100%',
            height: '100%',
            textStyle: {
                color: '#000000',
                // color: function() {
                //   return 'rgb(' +
                //       Math.round(Math.random() * 255) +
                //       ', ' + Math.round(Math.random() * 255) +
                //       ', ' + Math.round(Math.random() * 255) + ')'
                // }
            },
            data: changeReasonIk.value
        }]
    };
    myChart?.setOption(option)
}
const initReasonCychart = () => {
    const el: HTMLElement = reasonCy.value;
    let myChart = echart?.getInstanceByDom(el)
    if (myChart == null) {
        myChart = echart?.init(el);
    }
    
    let option = {
        series: [{
            type: 'wordCloud',
            sizeRange: [14, 30],
            rotationRange: [0, 0],
            rotationStep: 45,
            gridSize: 30,
            shape: 'diamond',
            width: '100%',
            height: '100%',
            textStyle: {
                color: '#000000',
                // color: function() {
                //   return 'rgb(' +
                //       Math.round(Math.random() * 255) +
                //       ', ' + Math.round(Math.random() * 255) +
                //       ', ' + Math.round(Math.random() * 255) + ')'
                // }
            },
            data: advancedReason.value
        }]
    };
    myChart?.setOption(option)
}

const handleClick = async(value: any) => {
    if(value.name === '毕业') return;
    let params = {
        ident: 'Changes_in_student_status',
        ...props.params,
        category: value.name
    }
    const { data } = await changeChartData(params);
    currentTitle.value = value.name;
    typeData.typeCount = data.typeCount;
    typeData.typeRate = data.typeRate;
    advancedReason.value = data.changeReasonIk.map((it: any, ix: number) => {
        return {
            name: it,
            value: 100 - ix
        }
    })
    nextTick(() => {
        initReasonCychart()
    })
    console.log(value);
}

const initUserList = async () => {
    loading.value = true;
    let params = {
        ...props.params,
        ...searchForm,
        ident: 'Changes_in_student_status',
        pageNum: pages.current,
        pageSize: pages.size
    }
    const { data } = await getChartDataDetail(params);
    tableData.value = data.rows;
    pages.total = data.total;
    loading.value = false;
}

const openUserList = async () => {
    dialogVisible.value = true;
    const res = await getOrgType({})
    if (res.code == 1) {
        campusOrgList.value = res.data.campusOrgList;
        collegeOrgList.value = res.data.collegeOrgList;
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
    }
    initUserList()
}

const queryClick = () => {
    pages.current = 1;
    initUserList()
}

const resetClick = () => {
    pages.current = 1;
    initUserList()
}

const selectChange = async (key: string, val: string | number) => {
    const list = ['stuCampusId', 'stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId',]
  if (list.includes(key)) {
    if (key === 'stuCampusId') {
      searchForm.stuCollegeId = '';
      searchForm.stuMajorId = '';
      searchForm.stuGradeId = '';
      searchForm.stuClassId = '';
    }
    if (key === 'stuCollegeId') {
      searchForm.stuMajorId = '';
      searchForm.stuGradeId = '';
      searchForm.stuClassId = '';
    }
    if (key === 'stuMajorId') {
      searchForm.stuGradeId = '';
      searchForm.stuClassId = '';
    }
    if (key === 'stuGradeId') {
      searchForm.stuClassId = '';
    }
    const params = {
      campusId: searchForm.stuCampusId,
      collegeId: searchForm.stuCollegeId,
      majorId: searchForm.stuMajorId,
      gradeId: searchForm.stuGradeId,
      classId: searchForm.stuClassId,
    }
    const res = await getOrgType(params);
    if (res.code == 1) {
      if (key == 'campusId') {
        collegeOrgList.value = res.data.collegeOrgList;
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;

      }
      if (key == 'collegeId') {
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
      }
      if (key == 'majorId') {
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
      }
      if (key == 'gradeId') {
        classOrgList.value = res.data.classOrgList;
      }
    }
  }
}

const changeCurrent = (pageNum: number) => {
    pages.current = pageNum;
    initUserList()
}

const changeSize = (size: number) => {
    pages.current = 1;
    pages.size = size;
    initUserList()
}

const lookReason = (data: any) => {
    ElMessageBox.alert(
        `<div>
            <div style="display: flex;">
                <label style="width:70px;text-align: right">姓名：</label>
                <span>${data.name}</span>
            </div>
            <div style="display: flex;">
                <label>变动类型：</label>
                <span>${data.changeType}</span>
            </div>
            <div>
                <label> 变动原因：</label>
                <span>${data.changeReason}</span>
            </div> 
        </div>`,
        '变动原因',
        {
        dangerouslyUseHTMLString: true,
        }
    )
}

const exportClick = async () => {
    let params = {
        ...props.params,
        ...searchForm,
        ident: 'Changes_in_student_status',
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: true
    }
    const res = await exportGetChartDataDetail(params);
    downloadFile(res)
}

const changeReasonIk = ref<any>();
const changeTypeTopSort = ref<any>([]);
const changeType = ref<any>([]); //非“毕业”变动  左
const otherType = ref<any>([]); //非“毕业”变动  右
const changeTypeCount = ref<number>(0); //非“毕业”变动  左 人总数
const otherTypeCount = ref<number>(0); //非“毕业”变动  右 人总数
const noGraduateRate = ref<number | string>(0)
const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Changes_in_student_status' });

watch(dataSource, (val) => {
    if(dataSource.value.code == 1) {
        const { data, datas2 } = dataSource.value;
        try {
            progressBarOpt.list = data.baseStatics.map((it: any) => {
                return {
                    ...it,
                    value: it.count
                }
            })
            
            searchConfig.forEach((it, ix) => {
                if(it.key === 'changeType') {
                    searchConfig[ix].options = data.baseStatics.map((v: any) => {
                        return {
                            label: v.name,
                            value: v.name
                        }
                    })
                }
            })
            if(datas2.changeReasonIk) {
                changeReasonIk.value = datas2.changeReasonIk.map((it: any, ix: number) => {
                    return {
                        name: it,
                        value: 100 - ix
                    }
                })
            } else {
                changeReasonIk.value = []
            }

            if(datas2.changeType) {
                changeType.value = datas2.changeType.map((it: any) => {
                    changeTypeCount.value += it.count;
                    return {
                        ...it,
                        value: it.count
                    }
                })
            } else {
                changeType.value = []
            }
         
            if(datas2.otherType) {
                otherType.value = datas2.otherType.map((it: any) => {
                    otherTypeCount.value += it.count;
                    return {
                        ...it,
                        value: it.count
                    }
                })
            } else {
                otherType.value = []
            }
    
            if(datas2.noGraduateRate) {
                noGraduateRate.value = datas2.noGraduateRate
            } else {
                noGraduateRate.value = 0
            }
            
            if(datas2.changeTypeTopSort) {
                changeTypeTopSort.value = datas2.changeTypeTopSort
            } else {
                changeTypeTopSort.value = []
            }

            nextTick(() => {
                initLeftPieChart();
                initRightCychart();
                initRightPieChart();
            })
        } catch (error) {
            console.log(error);
        }
    }
}, {immediate: true, deep: true})

const init = async() => {
    const loading = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    let res = await getOrgType({});
    if (res.code == 1) {
        campusOrgList.value = res.data.campusOrgList;
        collegeOrgList.value = res.data.collegeOrgList;
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
    }
    loading.close()
}

const goBack = () => {
    currentTitle.value = '毕业';
    
    nextTick(() => {
        initLeftPieChart()
        initRightPieChart();
        initRightCychart();
    })
}

const store = userStore()
const type = inject<'left' | 'right'>('vscmType')
onBeforeMount(() => {
    nextTick(()=>{
        type && store.updateVsViewDirection(type, true)
    })
    
})
onMounted(() => {
    init()
})

onUnmounted(() => {
    type && store.updateVsViewDirection(type, false)
})
</script>

<style lang="scss" scoped>
@import '../index.scss';
.Progress-style {
    :deep(.el-progress-circle__track) {
        // 修改进度条背景色 
        stroke: #e3ecf3;
        stroke-width: 6;
    }
}
</style>