<template>
  <div class="ConsumptionSituation">
    <Tabs :top-btn-list="PanleList" :is-active="ActivePanle" @change-click="(v: string) => ActivePanle = v" />
    <DurationFlowRate v-if="ActivePanle == 'Consumption_amount'" @OpenWindow="OpenWindow" :selectList="chilrenList" :direction="direction" />
    <CanteenConsumption v-else-if="ActivePanle == 'dissipate'" @OpenWindow="OpenWindow" :selectList="chilrenList" :direction="direction" />
    <CampusMerchants v-else-if="ActivePanle == 'Supermarket_consumption'" @OpenWindow="OpenWindow" :selectList="chilrenList" :direction="direction" />

    <c-table-plus :columns="ColumnList" :request="getData" :searchConfig="SearchConfig" :visible="Visible" :title="Title" dialogWidth="1460px" height="350px" :closed="() => Visible = false" :exportBtn="ClickExport">
      <template #index="{ data }">
        {{ data.$index + 1 }}
      </template>
      <template #action="{ data }">
        <ElLink type="primary">学生个像</ElLink>
      </template>
    </c-table-plus>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject, computed, watch, useAttrs } from 'vue'
import { getChartDataDetail, exportGetChartDataDetail } from "@/api/modules/studentPortrait"
import { downloadFile } from '@/hooks'
import { BaseParams } from '@/components/group-image/types'
import Tabs from "@/components/common/Tabs.vue";
import DurationFlowRate from "./components/DurationFlowRate.vue";
import CanteenConsumption from "./components/CanteenConsumption.vue";
import CampusMerchants from "./components/CampusMerchants.vue";
import { getOrgType } from '@/api/modules/emphasisList'
import { searchConfigType, PagesType, requestResType } from '@/components/Table-plus/index.d'
import { WarnListType, WarnMenuListRes } from '@/api/types/attentionGroup'
import { unref } from 'vue';


const params = inject<BaseParams>('params', {} as any)
const props = withDefaults(defineProps<{
  params: BaseParams, selectList?: any[], isActive?: string, direction?: 'horizontal' | 'vertical',
}>(), {
  selectList: [
    {
      key: "Consumption_amount",
      label: "消费金额",
      show: false,
      warning: [] as WarnListType
    },
    {
      key: "dissipate",
      label: "食堂消费",
      show: false,
      warning: [] as WarnListType
    },
    {
      key: "Supermarket_consumption",
      label: "校内商户",
      show: false,
      warning: [] as WarnListType
    },
  ] as any,
  isActive: 'Consumption_amount',
  direction: 'horizontal',
})
const icons = {
  Consumption_amount: 'xiao-fei-jin-e',
  dissipate: 'shi-tang-xiao-fei',
  Supermarket_consumption: 'xiao-nei-shang-hu'
}
const list = props.selectList!.map(i => ({ ...i, icon: icons[i.key] }))
const ActivePanle = ref(props.isActive);
const PanleList = reactive(list);
const chilrenList = computed<any[] | undefined>(() => {
  const item = PanleList.find(i => i.key === ActivePanle.value)
  return item?.children
})
const Title = ref("")
const Visible = ref(false)
const Ident = ref("")
interface column {
  prop?: string,
  label: string,
  width?: string,
  slot?: string,
  fixed?: string,
  align?: string,
}
const OpenWindow = async (title: string, columns: column[], ident: string) => {
  ColumnList.splice(0, ColumnList.length);
  ColumnList.splice(0, ColumnList.length, ...DefaultColumns);
  ColumnList.splice(DefaultColumns.length - 1, 0, ...columns)
  Title.value = title;
  Ident.value = ident
  Visible.value = true
}

const paramsObj = {
  campusId: 'stuCampusId',
  collegeId: 'stuCollegeId',
  majorId: 'stuMajorId',
  gradeId: 'stuGradeId',
  classId: 'stuClassId'
}
const SearchConfig: searchConfigType = [
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
    target: ['stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId']
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

const DefaultColumns: column[] = [
  {
    slot: 'index',
    label: '序号',
    width: '60'
  },
  {
    prop: 'name',
    label: '姓名',
    width: '110'
  },
  {
    prop: 'sex',
    label: '性别',
    width: '60'
  },
  {
    prop: 'userName',
    label: '学号',
    width: '130'
  },
  {
    prop: 'campus_name',
    label: '校区',
    width: '100'
  },
  {
    prop: 'college_name',
    label: '学院',
    width: '150'
  },
  {
    prop: 'major_name',
    label: '专业',
    width: '150'
  },
  {
    prop: 'grade_name',
    label: '年级',
    width: '90'
  },
  {
    prop: 'className',
    label: '班级',
    width: '150'
  },
  {
    slot: 'action',
    label: '操作',
    fixed: 'right',
    align: 'center'
  }
]

const ColumnList: column[] = reactive([])

const getData = (para: any, pages: PagesType): Promise<requestResType> => {
  console.log(pages, '@@@@');
  
  const obj = Object.assign(params!, {
    ...para,
    pageNum: pages.current,
    pageSize: pages.size,
    expExcel: false,
    ident: Ident.value
  })
  delete obj.typeName
  delete obj.titleAndYear
  return getChartDataDetail(obj)
}

const ClickExport = async (form: any, pages: PagesType) => {
  const res = await exportGetChartDataDetail(Object.assign(params!, {
    ...form,
    pageNum: pages.current,
    pageSize: pages.size,
    expExcel: true,
    ident: Ident.value
  }))
  downloadFile(res)
}

const topBtnList = reactive(list)
const attrs = useAttrs()
watch(() => attrs.warning as WarnMenuListRes, v => {
  if (v && v.length > 0) {
    v.forEach((i, index) => {
      const { children } = i
      if (children && children.length) {
        children.forEach((e) => {
          if (e.warnList) {
            topBtnList[index].show = true
          }
        })
      }
    })
  }
}, { immediate: true, deep: true })
</script>