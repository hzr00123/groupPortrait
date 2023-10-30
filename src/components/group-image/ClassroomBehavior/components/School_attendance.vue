<template>
    <div
        :class="['one-content', { scholarship: true, flex: true, horizontal: direction === 'horizontal', vertical: direction === 'vertical' }]">
        <WarningSeal name="上课出勤" ident="school_attendance" />
        <div :class="['left', { w59: direction === 'horizontal', w100: direction === 'vertical' }]">
            <div class="l">
                <div class="l-top">
                    <c-title title="课程特征" />
                    <div class="l-top-chart" ref="courseChart" style="height: 170px;"></div>
                    <div class="l-top-text" v-if="highFrequencyList && highFrequencyList.length">
                        缺勤课程主要特征为 <span v-for="(it, ix) in highFrequencyList.slice(0, 2)" :key="ix">{{ it.name }} <span
                                v-if="ix < 1">、</span></span>
                    </div>
                </div>
                <div class="l-bottom">
                    <c-title title="男女逃课性质差异" />
                    <div class="l-bottom-box">
                        <WordCloud :wordCloudObj="wordCloudObj" />
                        <div class="l-bottom-box-tag">
                            <span>男生主要逃课</span>
                            <span :title="wordCloudObj.data1[0].name" class="bold text-ellipsis"
                                v-if="wordCloudObj.data1 && wordCloudObj.data1.length">{{ wordCloudObj.data1[0].name }}</span>
                            <span>女生主要逃课</span>
                            <span :title="wordCloudObj.data3[0].name" class="bold text-ellipsis"
                                v-if="wordCloudObj.data3 && wordCloudObj.data3.length">{{ wordCloudObj.data3[0].name }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="r">
                <!-- 暂时隐藏 -->
                <!-- <div class="icon" :style="{ left: index == 0 ? '0' : index + '00px' }" v-for="(item, index) in 4"
                    :key="index">
                    <img class="tag" src="@/assets/imgs/warn-tag.png" alt="">
                    <div class="txt">逃课大王:52人</div>
                </div> -->
                <div class="r-top column">
                    <ElProgress class="one" type="circle" :width="110" :stroke-width="10" color="#F39702"
                        :percentage="studentAttendanceRate.allRate">
                        <template #default="{ percentage }">
                            <span class="percentage-value" style="color:#F39702;cursor: pointer;" @click="lookTurnWork">{{
                                percentage }}<span>%</span></span>
                        </template>
                    </ElProgress>
                    <div class="title">
                        上课出勤率(全体)
                    </div>
                </div>
                <div class="r-bottom sb">
                    <div class="b-l column">
                        <ElProgress class="two" type="circle" :width="110" :stroke-width="10" color="#317DB8"
                            :percentage="studentAttendanceRate.manRate">
                            <template #default="{ percentage }">
                                <span class="percentage-value" style="color:#317DB8;">{{ percentage }}<span>%</span>
                                </span>
                            </template>
                        </ElProgress>
                        <div class="title">
                            上课出勤率(男性)
                        </div>
                    </div>
                    <div class="b-r column">
                        <ElProgress class="three" type="circle" :width="110" :stroke-width="10" color="#C0534F"
                            :percentage="studentAttendanceRate.womanRate">
                            <template #default="{ percentage }">
                                <span class="percentage-value" style="color:#C0534F;">{{ percentage }}<span>%</span></span>
                            </template>
                        </ElProgress>
                        <div class="title">
                            上课出勤率(女性)
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div v-if="$attrs.view !== 'left'"
            :class="['right', { w39: direction === 'horizontal', w100: direction === 'vertical' }]">
            <c-title title="缺勤学生分析" />
            <div class="list-box">
                <div class="list-item flex-start" style="background: #f0f4f7;">
                    <div class="tag" style="background: #005da7;">
                        缺勤人数
                    </div>
                    <div class="msg-box">
                        累计缺勤人数 <span class="bold">{{ studentAbsenceAnalysis.absenceCount }}</span> 人
                    </div>
                </div>
                <div class="list-item flex-start" style="background: #faf7f0;">
                    <div class="tag" style="background: #ddab1f;">
                        缺勤人次
                    </div>
                    <div class="msg-box">
                        累计缺勤人次 <span class="bold">{{ studentAbsenceAnalysis.Absenteeism }}</span> 人次
                    </div>
                </div>
                <div class="list-item flex-start" style="background: #f1f7fc;">
                    <div class="tag" style="background: #45a0e6;">
                        缺勤时间
                    </div>
                    <div class="msg-box">
                        <span class="bold">{{ studentAbsenceAnalysis.timeFrameRate }}%</span> 缺勤人次集中在 <span class="bold">{{
                            studentAbsenceAnalysis.timeFrame }}</span>
                    </div>
                </div>
                <div class="list-item flex-start" style="background: #faf5f5;">
                    <div class="tag" style="background: #b22924;">
                        男女特征
                    </div>
                    <div class="msg-box">
                        缺勤男生 <span class="bold">{{ studentAbsenceAnalysis.manCount }}</span> 人，缺勤女生<span class="bold">{{
                            studentAbsenceAnalysis.womanCount }}</span> 人，缺勤男女比<span class="bold">{{
        studentAbsenceAnalysis.sexProportion || '0:0' }}</span>
                    </div>
                </div>
                <div class="list-item flex-start" style="background: #f5f1f0;">
                    <div class="tag" style="background: #231815;">
                        专业特征
                    </div>
                    <div class="msg-box">
                        <span class="bold">{{ studentAbsenceAnalysis.majorRate }}%</span> 缺勤人次所在专业为 <span class="bold">{{
                            studentAbsenceAnalysis.major }}</span>
                    </div>
                </div>
            </div>
            <div class="right-bottom">
                缺勤Top3 <span class="bold" v-for="(it, ix) in studentAbsenceAnalysis.majorTop">{{ it }} <span
                        v-if="studentAbsenceAnalysis.majorTop.length > ix + 1">、</span></span>
            </div>
        </div>

        <el-dialog v-model="dialogVisible" title="个人出勤" width="65%">
            <section>
                <Search :search-config="searchConfig" :searchForm="searchForm" :rowNum="4" :isExport="true"
                    @queryClick="queryClick" @resetClick="resetClick" @selectChange="selectChange"
                    @exportClick="exportClick" />


                <c-table align="center" :columnList="columnList" :data="tableData" :pages="pages"
                    :default-sort="{ prop: 'attendanceCount', order: '' }" height="400" @changeCurrent="changeCurrent"
                    @changeSize="changeSize" @changeSort="changeSort" v-loading="loading">
                    <template #index="{ data }">
                        {{ data.$index + 1 }}
                    </template>
                    <template #attendanceRate="{ data }">
                        <span v-if="data.attendanceRate !== null">{{ data.attendanceRate }} %</span>
                    </template>
                    <template #operation="{ data }">
                        <el-button link>学生个像</el-button>
                    </template>
                </c-table>
            </section>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { WordCloudConfig } from '@/components/common/Search';
import { downloadFile, usePortraitRequest } from '@/hooks';
import { getCurrentInstance, nextTick, onMounted, ref, reactive, computed, watch, defineAsyncComponent, toRefs, inject, onBeforeMount, onUnmounted } from 'vue';
import { BaseParams } from '../../types';
import { getOrgType } from '@/api/modules/emphasisList';
import { getChartDataDetail, exportGetChartDataDetail } from '@/api/modules/studentPortrait';
import { userStore } from '@/store/user';

const props = withDefaults(defineProps<{ params: BaseParams, direction: string }>(), {
    params: {} as any,
    direction: 'horizontal'
})
const courseChart = ref()
const dialogVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const campusOrgList = ref([])
const collegeOrgList = ref([])
const majorOrgList = ref([])
const gradeOrgList = ref([])
const classOrgList = ref([])
const store = userStore()
const type = inject<'left' | 'right'>('vscmType')
onBeforeMount(() => {
    nextTick(()=>{
        type && store.updateVsViewDirection(type, true)
    })
    
})
onUnmounted(() => {
    type && store.updateVsViewDirection(type, false)
})
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
        inputWidth: '150px',
        type: 'select',
        label: '学院',
        placeholder: '学院',
        key: 'stuCollegeId',
        opKey: 'id',
        opLabel: 'orgName',
        options: collegeOrgList,
    },
    {
        inputWidth: '150px',
        type: 'select',
        label: '专业',
        placeholder: '专业',
        key: 'stuMajorId',
        opKey: 'id',
        opLabel: 'orgName',
        options: majorOrgList,
    },
    {
        inputWidth: '150px',
        type: 'select',
        label: '年级',
        placeholder: '年级',
        key: 'stuGradeId',
        opKey: 'id',
        opLabel: 'orgName',
        options: gradeOrgList,
    },
    {
        inputWidth: '150px',
        type: 'select',
        label: '班级',
        placeholder: '班级',
        key: 'stuClassId',
        opKey: 'id',
        opLabel: 'orgName',
        options: classOrgList,
    },
    {
        inputWidth: '180px',
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
    name: '',
    sort: ''
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
        prop: 'attendanceCount',
        label: '逃课次数',
        sortable: 'custom',
        width: '120'
    },
    {
        slot: 'attendanceRate',
        label: '出勤率',
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
const wordCloudObj = reactive<WordCloudConfig>({
    data1: [],
    data2: [],
    data3: [],
    position: 'center',
})
const initCourseChart = () => {
    const el: HTMLElement = courseChart.value;
    let myChart = echart?.getInstanceByDom(el)
    if (myChart == null) {
        myChart = echart?.init(el);
    }
    let datas = highFrequencyList.value;

    console.log(datas);

    let maxVal = Math.max(...datas.map((item: any) => item.value));
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
                color: function (params: { value: number }) {
                    var opacity = params.value / maxVal;
                    return 'rgba(0, 0, 0, ' + opacity + ')';
                }
            },
            data: datas
        }]
    };
    myChart?.setOption(option)
}

const handeleData = (list: any, value: string, name = 'name') => {
    const newArr = list.map((it: any) => {
        return {
            name: it[name],
            value: it[value]
        }
    })
    return newArr;
}

const WarningSeal = defineAsyncComponent({
    loader: () => import('@/components/WarningSeal'),
    delay: 1000
})

const lookTurnWork = async () => {
    dialogVisible.value = true;
    const res = await getOrgType({})
    if (res.code == 1) {
        campusOrgList.value = res.data.campusOrgList;
        collegeOrgList.value = res.data.collegeOrgList;
        majorOrgList.value = res.data.majorOrgList;
        gradeOrgList.value = res.data.gradeOrgList;
        classOrgList.value = res.data.classOrgList;
    }
    await initIndividualAttendance()
}

const initIndividualAttendance = async () => {
    loading.value = true;
    let params = {
        ...props.params,
        ...searchForm,
        ident: 'school_attendance',
        pageNum: pages.current,
        pageSize: pages.size
    }
    const { data } = await getChartDataDetail(params);
    tableData.value = data.rows;
    pages.total = data.total;
    loading.value = false;
}

const queryClick = () => {
    pages.current = 1;
    initIndividualAttendance()
}

const resetClick = () => {
    pages.current = 1;
    initIndividualAttendance()
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
    initIndividualAttendance()
}

const changeSize = (size: number) => {
    pages.current = 1;
    pages.size = size;
    initIndividualAttendance()
}

const changeSort = (value: { prop: string, order: string }) => {
    console.log(value);
    searchForm.sort = value.order === 'asc' ? '1' :
        value.order === 'des' ? '2' : '';
    pages.current = 1;
    initIndividualAttendance();
}

const exportClick = async () => {
    let params = {
        ...props.params,
        ...searchForm,
        ident: 'school_attendance',
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: true
    }
    const res = await exportGetChartDataDetail(params);
    downloadFile(res)
}
// 出勤率
const studentAttendanceRate = ref<any>({})
// 课程特征
const highFrequencyList = ref<any>([])
// 缺勤学生分析
const studentAbsenceAnalysis = ref<any>({})
const dataSource = usePortraitRequest({ ...toRefs(props.params) as any, ident: 'school_attendance' });

watch(dataSource, (value) => {
    if (dataSource.value.code == 1) {
        const { data } = dataSource.value
        const { allRate, manRate, womanRate } = data.studentAttendanceRate
        studentAttendanceRate.value = {
            allRate: ['NaN', null, ''].includes(allRate) ? 0 : allRate,
            manRate: ['NaN', null, ''].includes(manRate) ? 0 : manRate,
            womanRate: ['NaN', null, ''].includes(womanRate) ? 0 : womanRate,
        };
        highFrequencyList.value = handeleData(data.courseAnalyse.highFrequencyList, 'frequency'); // 课程特征
        wordCloudObj.data1 = handeleData(data.courseAnalyse.manHighFrequencyList, 'frequency');
        wordCloudObj.data2 = handeleData(data.courseAnalyse.commonHighFrequencyList, 'frequency');
        wordCloudObj.data3 = handeleData(data.courseAnalyse.womanHighFrequencyList, 'frequency');
        studentAbsenceAnalysis.value = {
            ...data.studentAbsenceAnalysis,
            majorRate: ['NaN', null, ''].includes(data.studentAbsenceAnalysis.majorRate) ? 0 : data.studentAbsenceAnalysis.majorRate,
            timeFrameRate: ['NaN', null, ''].includes(data.studentAbsenceAnalysis.timeFrameRate) ? 0 : data.studentAbsenceAnalysis.timeFrameRate,
        }
        nextTick(() => {
            initCourseChart();
        })
    }

}, { immediate: true, deep: true })






</script>

<style lang="scss" scoped>
@import '../index.scss';
.right {
    padding-right: 18px;
    box-sizing: border-box;

    .list-box {
        margin-top: 55px;

        .list-item {
        width: 480px;
        height: 56px;
        border-radius: 8px;
        padding-left: 4px;
        margin-bottom: 24px;

        .tag {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            padding: 0 10px;
            font-size: 14px;
            line-height: 20px;
            color: #fff;
            display: flex;
            align-items: center;
        }

        .msg-box {
            font-size: 16px;
            font-family: Regular;
            color: #203449;
            line-height: 22px;
            margin-left: 15px;

            .bold {
            font-family: bold;
            }
        }
        }
    }

    .right-bottom {
        font-size: 16px;
        font-family: Regular;
        color: #203449;
        line-height: 22px;
        text-align: center;
        margin-top: 38px;

        .bold {
        font-family: bold;
        }
    }
    }
    .w59 {
    width: 59%;
    }
    .w39 {
    width: 39%;
    }
</style>