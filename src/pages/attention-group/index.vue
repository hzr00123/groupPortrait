<template>
  <div class="attention-group" v-loading="loading">
    <div class="top-search">
      <Search :search-config="searchConfig" :searchForm="searchForm" @queryClick="queryClick" @resetClick="resetClick" @selectChange="selectChange" />
    </div>

    <section>
      <c-card-tree fistNode isChildActive :treeList="treeList" activeColor="#B22924" @search="treeSearch" @handleNodeClick="handleNodeClick">
        <template #customize="{ data }">
          <svg-icon class="svg-icon" v-if="data.icon" :icon-class="data.icon" />
          <span>{{ data.label }}</span>
          <el-icon class="plus-icon" size="13" color="#005DA7" @click="customizeCrowd">
            <Plus />
          </el-icon>
        </template>
      </c-card-tree>
      <el-scrollbar style="width: calc(100% - 240px);">
        <article>
          <div class="cards-box mg-b20">
            <MiniCard v-for="item in cardList" :key="item.title" :item="item">
              <template #icon>
                <el-progress type="circle" :percentage="percentage" :stroke-width="8" color="#1D548D" :width="70" style="margin-right: 14px;" />
              </template>
            </MiniCard>
          </div>
          <c-card title="特殊群体" class="special-group mg-b20">
            <template #operation>
              <div class="timer">{{ currentInfo.update_way === '1' ? '定时更新' : '手动更新' }} ｜ {{ currentInfo.create_by }} 创建于 {{ currentInfo.create_date }}</div>
            </template>
            <div class="content">
              <div class="line-1 mg-b15">
                <div class="left">
                  <p class="name">{{ currentInfo.label }}</p>
                  <div class="num">{{ currentInfo.user_count }} <span class="unit">人</span></div>
                  <div class="time">{{ currentInfo.last_calculate_time }}</div>
                  <el-icon size="24" color="#FFF" class="right-icon" @click="visible = true">
                    <Right />
                  </el-icon>
                </div>
                <el-dropdown @command="command">
                  <div class="more">
                    <el-icon size="18" color="#005DA7">
                      <MoreFilled />
                    </el-icon>
                  </div>
                  <!-- <el-button type="primary">
                                        Dropdown List<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                    </el-button> -->
                  <template #dropdown>
                    <el-dropdown-menu class="dropdown-style">
                      <el-dropdown-item command="update" v-if="currentInfo.update_way == '2'"><svg-icon icon-class="update-icon" /> 更新</el-dropdown-item>
                      <el-dropdown-item command="edit"><svg-icon icon-class="edit-icon" /> 编辑</el-dropdown-item>
                      <el-dropdown-item command="del" v-if="currentInfo.ident === 'custom_groups'"><svg-icon icon-class="del-icon" /> 删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>

              </div>
              <div class="line-2">
                <p class="name mg-b15">{{ currentInfo.user_group_description }}</p>
                <div class="book-mark">
                  <div class="tab-pane">{{ currentInfo.last_calculate_time }}</div>
                </div>
              </div>
            </div>
          </c-card>

          <c-card-tabs :activeName="activeName" :tabs="tabs" :isDaterange="['1', '3'].includes(activeName)" ref="tabsRef" @tabClick="tabClick" @datePickerChange="datePickerChange">
            <template #pane-content="{ data }">
              <!-- <div v-if="data.name === '1'">{{ data }}</div> -->
              <div v-if="data.name === '1'">
                <!-- <EchartView ref="echartViewRef" v-if="isCustomGroups === false" :key="currentInfo.id" 
                                :data="{ user_group_id: currentInfo.id, startTime: data.start, endTime: data.end, ident: currentInfo.ident }"/> -->
                <AnalyzeView v-if="isCustomGroups === false" :key="currentInfo.id" ref="analyzeRef" :params="{
                  ident: currentInfo.ident,
                  user_group_id: currentInfo.id,
                  startTime: data.start || '',
                  endTime: data.end || ''
                }" />

                <CustomGroups v-else :data="{ id: currentInfo.id, ident: currentInfo.ident, gp_ident_left: currentInfo.gp_ident_left, gp_ident_right: currentInfo.gp_ident_right }" :params="{
                  user_group_id: currentInfo.id,
                  startTime: data.start || '',
                  endTime: data.end || ''
                }" @callBack="callBack" />
              </div>
              <DistributionAnalysis v-if="data.name === '2'" :params="{ user_group_id: currentInfo['id']!, campusId: searchForm.campusId }" />
              <HistoryAnalyse v-if="data.name === '3'" :params="{ user_group_id: currentInfo['id']!, campusId: searchForm.campusId }" @opendStudentList="visible = true" />
              <PersonnelList v-if="data.name === '4'" :currentInfo="currentInfo" />

              <p class="personnel-text" style="font-size: 14px;" v-if="data.name === '4'">{{ currentInfo.user_count }}人，计算于{{ currentInfo.last_calculate_time }}</p>
            </template>
          </c-card-tabs>

        </article>
      </el-scrollbar>
    </section>
    <StudentList v-model:visible="visible" :user_group_id="currentInfo['id']" :user_group_name="currentInfo.user_group_name!" v-if="visible" />
    <!-- <el-button type="primary" @click="addVisible = true">开启</el-button>
        <BehaviorAnalyse v-if="addVisible" v-model:visible="addVisible" /> -->
  </div>
</template>

<script setup lang="ts">
import { TabsPaneContext, ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NodeData, TreeStructure } from './index'
import Search from '@/components/common/Search.vue'
import MiniCard from './components/MiniCard.vue'
import StudentList from './components/StudentList.vue'
import BehaviorAnalyse from './components/BehaviorAnalyse.vue'
import Progress from './components/Progress.vue'
import PersonnelList from './components/PersonnelList.vue'
import HistoryAnalyse from './components/HistoryAnalyse.vue'
import DistributionAnalysis from './components/DistributionAnalysis.vue'
import { getOrgType } from '@/api/modules/emphasisList'
import { getGroupTypeDown, getGroupUserList, getTotalCount, delSelfGroup, updateGroupUser } from '@/api/modules/attentionGroup'
import { userStore } from '@/store/user'
import { Tree } from '@/components/CardTree'
import EchartView from './components/EchartView.vue';
import CustomGroups from './components/CustomGroups'
import AnalyzeView from './components/analyzeView/index';
import { getDay } from "@/utils";

const router = useRouter();
const route = useRoute();
const userInfoStore = userStore();
const percentage = ref<number>(0)

const treeList = ref<TreeStructure[]>([])
const loading = ref(false)

const currentInfo = ref<NodeData>({
  id: '',
  label: '',
  ident: '',
})

const daterange = ref({})

const cardList = reactive([
  {
    icon: 'crowd-icon',
    title: '总群体数',
    titColor: '#F39704',
    num: 0,
    numColor: '#F39704',
    unit: '个',
    unitColor: '#C2B5A1',
    bg: 'mini-card1.png'
  },
  {
    title: '覆盖学生数',
    titColor: '#1D558D',
    num: 0,
    numColor: '#063565',
    unit: '人',
    unitColor: '#628AB0',
    bg: 'mini-card2.png'
  },
  {
    icon: 'gender-icon',
    title: '男女比例',
    titColor: '#6376DD',
    num: 0,
    numColor: '#3848A6',
    ratio: 0,
    ratioColor: '#6477DD',
    bg: 'mini-card3.png'
  },
])

const tabs = [
  {
    label: '群体行为分析',
    name: '1'
  },
  {
    label: '人员分布分析',
    name: '2'
  },
  {
    label: '历史人数分析',
    name: '3'
  },
  {
    label: '人员名单',
    name: '4'
  }
]

const tabsRef = ref()
const echartViewRef = ref()

const visible = ref(false)
const addVisible = ref(false)
const searchConfig = reactive(
  [
    {
      labelWidth: '75px',
      inputWidth: '166px',
      type: 'select',
      placeholder: '群体特征分类',
      key: 'user_group_type',
      opKey: 'value',
      opLabel: 'label',
      options: [],
    },
    {
      labelWidth: '75px',
      inputWidth: '166px',
      type: 'select',
      placeholder: '校区',
      key: 'campusId',
      opKey: 'value',
      opLabel: 'label',
      options: [],
    },
    {
      labelWidth: '75px',
      inputWidth: '166px',
      type: 'select',
      placeholder: '学院',
      key: 'collegeId',
      opKey: 'value',
      opLabel: 'label',
      options: [],
    },
    {
      labelWidth: '75px',
      inputWidth: '166px',
      type: 'select',
      placeholder: '专业',
      key: 'majorId',
      opKey: 'value',
      opLabel: 'label',
      options: [],
    },
    {
      labelWidth: '75px',
      inputWidth: '166px',
      type: 'select',
      placeholder: '年级',
      key: 'gradeId',
      opKey: 'value',
      opLabel: 'label',
      options: [],
    },
    {
      labelWidth: '75px',
      inputWidth: '166px',
      type: 'select',
      placeholder: '班级',
      key: 'classId',
      opKey: 'value',
      opLabel: 'label',
      options: [],
    },
  ]
)
const searchForm = reactive({
  user_group_type: '',
  user_group_name: '',
  campusId: '',
  collegeId: '',
  majorId: '',
  gradeId: '',
  classId: ''
});

const timeRange = reactive<{ startTime: string, endTime: string }>({
  startTime: '',
  endTime: ''
})

const activeName = ref('1');

const isCustomGroups = ref<boolean>(false)

const groupClass = ref([])



const queryClick = async (form: object) => {
  // treeList.value = [];
  await initGroupUserList();

  initTotalCount()
  treeList.value.map(item => {
    item.children.map(it => {
      if (it.id == currentInfo.value.id) {
        currentInfo.value = it as unknown as NodeData;
      }
    })
  })
}

const resetClick = async () => {
  for (let key in searchForm) {
    searchForm[key] = ''
    OrgTypeParams[key] = undefined
  }
  await initGroupUserList()
  await initTotalCount()
  await initSelect()
  treeList.value.map(item => {
    item.children.map(it => {
      if (it.id == currentInfo.value.id) {
        currentInfo.value = it;
      }
    })
  })
}

const OrgTypeParams = reactive({})

const selectChange = (key: string) => {
  if (['campusId', 'collegeId', 'majorId', 'gradeId', 'classId'].includes(key)) {
    OrgTypeParams[key] = searchForm[key];
    if (key === 'campusId') {
      OrgTypeParams['collegeId'] = undefined;
      OrgTypeParams['majorId'] = undefined;
      OrgTypeParams['gradeId'] = undefined;
      OrgTypeParams['classId'] = undefined;
      searchForm['collegeId'] = '';
      searchForm['majorId'] = '';
      searchForm['gradeId'] = '';
      searchForm['classId'] = '';
    } else if (key === 'collegeId') {
      OrgTypeParams['majorId'] = undefined;
      OrgTypeParams['gradeId'] = undefined;
      OrgTypeParams['classId'] = undefined;
      searchForm['majorId'] = '';
      searchForm['gradeId'] = '';
      searchForm['classId'] = '';
    } else if (key === 'majorId') {
      OrgTypeParams['gradeId'] = undefined;
      OrgTypeParams['classId'] = undefined;
      searchForm['gradeId'] = '';
      searchForm['classId'] = '';
    } else if (key === 'gradeId') {
      OrgTypeParams['classId'] = undefined;
      searchForm['classId'] = '';
    }
    initSelect()
  }
}

const handleNodeClick = (value: Tree) => {
  isCustomGroups.value = false;
  if (value.ident === 'custom_groups') {
    isCustomGroups.value = true
  }
  activeName.value = '1'
  currentInfo.value = value as unknown as NodeData;
}

const treeSearch = (value: string) => {
  searchForm.user_group_name = value;
  initGroupUserList();
}

const tabClick = (tab: TabsPaneContext) => {
  activeName.value = `${tab.props.name}`
}

const datePickerChange = (val: typeof Array) => {
  if (activeName.value === '1') {
    try {
      if (isCustomGroups.value === false) {
        analyzeRef.value.getData()
      } else {
        timeRange.startTime = tabsRef.value._val['start'];
        timeRange.endTime = tabsRef.value._val['end'];
      }
    } catch (error) {
      console.log(error);
    }
  }
}


const customizeCrowd = () => {
  router.push('/custom-crowd')
}

onMounted(async () => {
  await initSelect();
  await initGroupUserList();
  await initTotalCount();
  tabsRef.value.value1 = [getDay(-7), getDay(0)];

  tabsRef.value._val['start'] = getDay(-7)
  tabsRef.value._val['end'] = getDay(0)
})


const initSelect = async () => {
  loading.value = true
  await Promise.all([getGroupTypeDown(), getOrgType(OrgTypeParams)])
    .then(res => {
      try {
        groupClass.value = res[0].data.groupTypeList;
        userInfoStore.updateGroupTypeList(res[0].data.groupTypeList);
        const userGroupTypeItem = searchConfig.find(it => it.key === 'user_group_type');
        const campusItem = searchConfig.find(it => it.key === 'campusId');
        const collegeItem = searchConfig.find(it => it.key === 'collegeId');
        const majorItem = searchConfig.find(it => it.key === 'majorId');
        const gradeItem = searchConfig.find(it => it.key === 'gradeId');
        const classItem = searchConfig.find(it => it.key === 'classId');

        userGroupTypeItem!.options = handleOptions(res[0].data.groupTypeList, 'lookup_name', 'id') as []
        campusItem!.options = handleOptions(res[1].data.campusOrgList, 'orgName', 'id') as []
        collegeItem!.options = handleOptions(res[1].data.collegeOrgList, 'orgName', 'id') as []
        majorItem!.options = handleOptions(res[1].data.majorOrgList, 'orgName', 'id') as []
        gradeItem!.options = handleOptions(res[1].data.gradeOrgList, 'orgName', 'id') as []
        classItem!.options = handleOptions(res[1].data.classOrgList, 'orgName', 'id') as []

        userInfoStore.updateOrgType({
          campusOrgList: campusItem!.options,
          collegeOrgList: collegeItem!.options,
          majorOrgList: majorItem!.options,
          gradeOrgList: gradeItem!.options,
          classOrgList: classItem!.options
        });
        loading.value = false
      } catch (error) {

      }
    })
}

const initGroupUserList = async () => {
  loading.value = true
  const { data } = await getGroupUserList(searchForm)
  loading.value = false
  treeList.value = []
  groupClass.value.map(item => {
    let obj: TreeStructure = {
      id: item['id'],
      label: item['lookup_name'],
      children: []
    }
    obj.label === '自定义人群' ? obj['slot'] = 'customize' : null
    data.map((it: any) => {
      if (it.user_group_type == item['id']) {
        obj['icon'] = it.icon
        obj['children'].push({
          ...it,
          id: Number(it['id']),
          label: it.user_group_name,
          update_way: it.update_way,
          user_count: it.user_count,
          last_calculate_time: it.last_calculate_time,
          user_group_description: it.user_group_description,
          user_group_name: it.user_group_name,
          icon: null
        })
      }
    })
    treeList.value.push(obj)
  })



}

const initTotalCount = async () => {
  const { data } = await getTotalCount(searchForm);
  let ratio = typeof data.sexRatio === 'string' ? data.sexRatio.split(':') : [0, 0];
  percentage.value = data.coverStudentRatio;
  cardList[0].num = data.totalCount;
  cardList[1].num = data.coverStudentCount;
  cardList[2].num = ratio[0];
  cardList[2].ratio = ratio[1];
}

const handleOptions = (list: [], key?: string, val?: string) => {
  const newList = list.map((it) => {
    if (key && val) {
      return {
        label: it[key],
        value: it[val]
      }
    } else {
      return {
        label: it,
        value: it
      }
    }
  })
  return newList
}

const analyzeRef = ref()

const command = (type: string) => {
  if (type === 'edit') {
    let params = {
      id: currentInfo.value.id,
      user_group_name: currentInfo.value.user_group_name,
      user_group_type: currentInfo.value.user_group_type,
      user_group_description: currentInfo.value.user_group_description,
      rule_and_or: currentInfo.value.rule_and_or,
      group_rules: currentInfo.value.group_rules,
      update_way: currentInfo.value.update_way,
    }

    router.push({
      path: currentInfo.value.ident === 'custom_groups' ?
        '/edit-custom-crowd' : '/edit-beforehand-crowd',
      query: { params: JSON.stringify(params) }
    }
    )
    console.log(currentInfo.value, 'currentInfo.value');

  } else if (type === 'del') {
    ElMessageBox.confirm(
      '删除后，用户群将无法找回，确定删除？',
      { type: 'warning', title: '删除关注群体' }
    ).then(() => {
      delSelfGroup({ id: currentInfo.value.id }).then(async (res) => {
        if (res.code === 1) {
          ElMessage.success('删除成功！')
          await initSelect();
          await initGroupUserList();
          await initTotalCount()
        }
      })
    })
  } else {
    updateGroupUser({ id: currentInfo.value.id }).then(async (res) => {
      if (res.code === 1) {
        ElMessage.success(res.data);
        await initSelect();
        await initGroupUserList();
        await initTotalCount();
        await analyzeRef.value.getData();
      }
    })
  }
}

const callBack = async (id: number) => {
  await initGroupUserList();
  treeList.value.map(item => {
    item.children?.map(it => {
      if (it.id == id) {
        currentInfo.value = it as unknown as NodeData;
      }
    })
  })
}
</script>

<style lang="scss" scoped>
.attention-group {
  height: 100%;

  section {
    display: flex;
    height: calc(100% - 62px);

    .c-card-tree {
      margin-right: 20px;
      width: 220px;

      :deep(.c-card) {
        background: linear-gradient(-45deg, transparent 20px, #ffffff 0);
      }
    }

    article {

      // width: calc(100% - 220px);
      // overflow-y: auto;
      // overflow-x: hidden;
      .cards-box {
        display: flex;
        justify-content: space-between;
      }

      .special-group {
        .timer {
          font-size: 14px;
          font-family: Regular;
          color: #3F4C59;
          line-height: 20px;
        }

        .content {
          .line-1 {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .left {
              display: flex;
              align-items: center;

              .name {
                font-size: 20px;
                font-family: Medium;
                color: #203449;
                line-height: 28px;
                margin-right: 20px;
              }

              .num {
                font-size: 28px;
                font-family: DinProBold;
                font-weight: bold;
                color: #B22924;
                line-height: 36px;
                display: flex;
                align-items: center;
                margin-right: 12px;

                .unit {
                  font-size: 14px;
                  font-family: Regular;
                  font-weight: 400;
                  color: #B22924;
                  line-height: 20px;
                  margin-left: 7px;
                }
              }

              .time {
                font-size: 16px;
                font-family: Regular;
                color: #3F4C59;
                line-height: 22px;
                padding: 4px 14px;
                background: #FAF3F3;
                border-radius: 15px;
                margin-right: 10px;
              }

              .right-icon {
                background: #B22924;
                border-radius: 50%;
                padding: 2px;
                cursor: pointer;
              }
            }

          }

          .line-2 {
            .name {
              font-size: 16px;
              font-family: Regular;
              color: #3F4C59;
              line-height: 22px;
            }

            .book-mark {
              display: flex;

              .tab-pane {
                width: 208px;
                height: 42px;
                background: url('@/assets/imgs/selectBg.png');
                background-size: 100% 100%;
                font-size: 16px;
                font-family: Bold;
                color: #07203a;
                line-height: 42px;
                text-align: center;
              }
            }
          }

          :deep(.el-dropdown) {
            .more {
              background: #E9F0FF;
              border: 1px solid #005DA7;
              border-radius: 4px;
              padding: 2px;
              cursor: pointer;

              &:focus-visible {
                outline: 2px solid #005DA7;
              }
            }
          }
        }
      }

    }
  }
}

.plus-icon {
  border: 1px solid #005DA7;
  border-radius: 2px;
  position: absolute;
  right: 24px;
}

.personnel-text {
  font-size: 14px;
  position: absolute;
  bottom: 0;
}
</style>