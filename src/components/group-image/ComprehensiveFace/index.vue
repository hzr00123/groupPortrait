<template>
  <div class="comprehensive-face">
    <div class="flex" :class="direction === 'horizontal'?'horizontal':'vertical'">
      <div :class="direction === 'horizontal' ? 'w49' : 'w100'">
        <div class="comprehensive-face-left">
          <c-title title="画像内容"/>
          <div class="content">
            <div class="woman">
              <div class="zb">{{manOrWoman.feMaleRate}}%</div>
              <img src="@/assets/imgs/woman.png" alt="">
              <div class="num">
                女性 <span>{{manOrWoman.feMaleCount}}人</span>
              </div>
            </div>
            <ul class="list">
              <li class="item" v-for="(item,index) in leftArr" :key="item.id+'f'">
                <div class="item-title" :style="{backgroundColor:bgColor(index)}" @click="clickTitle(item.name,item.id,item.children)">{{ item.name }}</div>
                <div class="item-content" :class="isActive==item.id?`active-box${index}`:''">
                  <div class="btn" :class="isActive==item.id&&isActiveContnet==ite.id?`active-btn${index}`:''" v-for="(ite,idx) in item.children" :key="ite.id+'c'" @click="clickCls(index,item.id,ite.id)"> 
                    {{ite.name}}({{ite.count}}人)
                  </div>
                </div>
              </li>
            </ul>
            <div class="man">
              <div class="zb">{{manOrWoman.maleRate}}%</div>
              <img src="@/assets/imgs/man.png" alt="">
              <div class="num">
                男性 <span>{{manOrWoman.maleCount}}人</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div v-if="$attrs.view !== 'left'" :class="direction === 'horizontal' ? 'w49' : 'w100'">
        <div class="comprehensive-face-right" v-loading="loading">
          <div class="face-right-top">
            <c-title title="画像分析"/>
            <div class="samll-title" :style="{backgroundColor:bgColor(current)}">{{ rightTitle(isActive,isActiveContnet) }}</div>
            <div class="tag"> <img src="@/assets/imgs/warn-tag.png" alt="">
              点击标签，查看不同特征学生的画像分析</div>
          </div>
          <div class="face-right-content">
            <el-row :gutter="20">
                <el-col :span="12" class="mb20" v-for="item in rightArr">
                  <div class="card">
                    <img class="card-l" :src="getImageUrl(item.icon)" alt="">
                    <div class="card-r">
                      <div class="title">{{ item.name }}</div>
                      <div class="val">{{ item.data }}<span v-if="item.data!='-'" class="unit">{{ item.unit }}</span></div>
                    </div>
                  </div>
                </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
    <c-table-plus :columns="columns" :request="tableRequest" :searchConfig="searchConfig" :visible="visible"
        :title="dialogTitle" dialogWidth="85%" height="450px" :closed="() => visible = false" :exportBtn="exportEvt">
        <template #action="scope">
          <ElLink type="primary">学生个像</ElLink>
      </template>
    </c-table-plus>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, toRaw, watch,computed, toRefs } from 'vue'
  import { BaseParams } from '../types';
  import { downloadFile, useChildrenData, usePortraitRequest } from "@/hooks";
import { changeChartData, exportGetChartDataDetail, getChartDataDetail } from '@/api/modules/studentPortrait';
import { getOrgType } from '@/api/modules/emphasisList';
import { requestResType, PagesType, searchConfigType } from '@/components/Table-plus/index.d';

import { Column } from '@/components/Table';
  const props = withDefaults(defineProps<{
      params: BaseParams, direction?: 'horizontal' | 'vertical',
  }>(), { 
    direction:'horizontal'
  }) 
  const getImageUrl = (name: string) => {
    return new URL(`/src/assets/face/${name}.png`, import.meta.url).href
  }
  const current = ref<string|number>('')
  const isActive = ref<string|number>('')
  const isActiveContnet = ref<string|number>('')
  const leftArr = ref<{name:string,id:number,children:any[]}[]>([])
  const rightArr = ref<{name:string,data:string,icon:string,unit:string}[]>([])
  const manOrWoman = ref<{[key: string | symbol]: any }>({})
  const loading = ref(false)
  const bgColor = computed(() => {
    return (val:string|number)=>{
      switch (val) {
        case 0:
          return "#005DA7";
        case 1:
          return "#DDAB1F";
        case 2:
          return "#45A0E6";
        case 3:
          return "#4D5FC1";
        case 4:
          return "#B22924";
        case 5:
          return "#231815";
        case 6:
          return "#8C6C4E";
        default:
          return "#005DA7";
      }
    
    }
  });
  const rightTitle = computed(() => {
    return (v1:string|number,v2:string|number)=>{
      let title = '';
      leftArr.value.forEach(item => {
          if(item.id==v1){
            item.children.forEach(i=>{
              if(i.id == v2){
                title = `${item.name}·${i.name}`
              }
            })
          }
      });
      return title
    }
  });
  const dialogTitle = ref('')
  const dialogId = ref('')
  const labelList = ref([])
  const visible = ref(false)
  const columns: Column = [
      {
        slot: 'order',
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
        prop: 'campus_name',
        label: '校区',
        align: 'center'
      },
      {
        prop: 'college_name',
        label: '学院',
        align: 'center'
      },
      {
        prop: 'major_name',
        label: '专业',
        align: 'center'
      },
      {
        prop: 'grade_name',
        label: '年级',
        align: 'center'
      },
      {
        prop: 'className',
        label: '班级',
        align: 'center'
      },
      {
        prop: 'labelName',
        label: '标签',
        align: 'center'
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
  const stuCampus = ref<string|number>('')
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
        default: stuCampus
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
        type: 'select',
        label: '标签',
        inputWidth: '120px',
        labelWidth: '40px',
        key: 'id',
        opKey: 'id',
        opLabel: 'name',
        options: labelList
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
  const tableRequest = (para: any, pages: PagesType): Promise<requestResType> => {
    const obj = {
      ...props.params,
      ...para,
      pageNum: pages.current,
      pageSize: pages.size,
      expExcel: false,
      ident: 'Comprehensive_appearance',
      category:dialogId.value
    }
    return getChartDataDetail(obj)
  }
  const exportEvt = async(form: any, pages: PagesType)=>{
    const res = await exportGetChartDataDetail({
      ...props.params,
      ...form,
      pageNum: pages.current,
      pageSize: pages.size,
      expExcel: true,
      ident: 'Comprehensive_appearance',
      category:dialogId.value
    })
    downloadFile(res)
  }
  const clickTitle = (name:string,id:any,arr:any)=>{
    dialogTitle.value = name;
    dialogId.value = id;
    labelList.value = arr;
    visible.value = true;
  }
  const changeData = async(index:number|string,idx:number|string) =>{
    loading.value = true
    const res = await changeChartData({...props.params,ident: 'Comprehensive_appearance',category:index,id:idx })
    if(res.code !=1){
      manOrWoman.value = {}
      rightArr.value = []
      return
    }
    const { sexMap, rightData} = res.data
    manOrWoman.value = sexMap
    rightArr.value = rightData
    loading.value = false
  }
  const clickCls = (num:number,index:number|string,idx:number|string)=>{
    current.value = num
    isActive.value = index;
    isActiveContnet.value = idx;
    manOrWoman.value = {}
    rightArr.value = []
    changeData(index,idx)
  }
  const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Comprehensive_appearance',})
  watch(dataSource, (res) => {
      if(res.code !=1){
        manOrWoman.value = {}
        rightArr.value = []
        leftArr.value = []
        isActive.value = ''
        isActiveContnet.value = ''
        return
      }
      const { sexMap, rightData} = res.datas2
      manOrWoman.value = sexMap
      rightArr.value = rightData
      leftArr.value = res.data
      isActive.value = res.data[0].id
      isActiveContnet.value = res.data[0].children[0].id
  }, {immediate:true, deep: true })
</script>
<style lang="scss" scoped>
  @import './index.scss';
</style>