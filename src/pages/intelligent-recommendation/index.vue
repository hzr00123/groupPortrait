
<template>
  <div class="login-page" >
    <el-form :inline="true" :model="formMapSearch" class="demo-form-inline">
      <el-form-item label="校区：">
        <el-select v-model="formMapSearch.campus" placeholder="请选择校区">
          <el-option
            v-for="item in optionsCampus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动类型：">
        <el-select v-model="formMapSearch.activeName" placeholder="请选择活动类型">
          <el-option
            v-for="item in optionsTypeActivity"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="推荐类型：">
        <el-select v-model="formMapSearch.type" placeholder="请选择推荐类型">
          <el-option
            v-for="item in optionsTypeRecommend"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item >
        <el-input v-model="formMapSearch.name" placeholder="请输入楼宇名称搜索" />
      </el-form-item>
      <el-form-item style="float:right">
        <el-button  @click="onResetMapSearch">重置</el-button>
        <el-button type="primary" @click="initMapData">搜索</el-button>
      </el-form-item>
    </el-form>
    <div class="mapContent">
      <div id="campusLeft" v-show="formMapSearch.campus === '良乡校区' || formMapSearch.campus === ''" :style="formMapSearch.campus === '' ? 'width:50%' : 'width:100%'"></div>
      <div class="lineCenter" v-show="formMapSearch.campus == ''"></div>
      <div id="campusRight" v-show="formMapSearch.campus === '望京校区' || formMapSearch.campus === ''" :style="formMapSearch.campus === '' ? 'width:50%' : 'width:100%'"></div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="选择推荐人员"
      width="60%"
      append-to-body
    >
      <div style="display:flex">
        <div style="width:50%;height:600px;overflow: auto;margin-right:20px">
          组织机构树
          <el-tree style="margin-top:10px" check-strictly ref="treeRef" :props="props" default-expand-all :data="dataTree" node-key="id" show-checkbox @check="searchTable"/>
        </div>
        <div>
          已选推荐人员<span>{{ selectionUserNum ? '('+ selectionUserNum + ')' : ''}}</span>
          <el-input
            style="margin-top:10px"
            v-model="input2"
            @blur="searchTableData"
            class="w-50 m-2"
            placeholder="请输入学号、姓名、组织机构搜索"
            :prefix-icon="Search"
          />
      <el-table
        ref="multipleTableRef"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        height='500'
        >
        <el-table-column type="selection" width="55" />
        <el-table-column label="姓名" width="120">
          <template #default="scope">{{ scope.row.name }}</template>
        </el-table-column>
        <el-table-column property="user_fk" label="学号" width="120" />
        <el-table-column property="orgNames" label="组织机构" show-overflow-tooltip />
      </el-table>
      <el-pagination
        v-model:current-page="currentPageUser"
        v-model:page-size="pageSizeUser"
        :page-sizes="[10, 20, 30, 50]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableDataTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
      </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>


      <el-dialog v-model="dialogFormVisible" :title="dialogFormObj.name" @closed="closed">
        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="rules"
          label-width="120px"
          class="demo-ruleForm"
          status-icon
        >
          <span class="title-txt"><i class="title-icon"></i>基础信息</span>
          <el-form-item label="活动类型：" prop="activeName">
            <el-input v-model="ruleForm.activeName" maxlength='20' placeholder="请输入活动类型" disabled style="max-width:302px"/>
          </el-form-item>
          <el-form-item label="最大容量：" prop="maxNum" >
            <el-input v-model.number="ruleForm.maxNum" maxlength='5' style="max-width: 263px;margin-right:8px" placeholder="请输入该楼宇的最大容量人数"/>人
          </el-form-item>
          <span class="title-txt"><i class="title-icon"></i>推荐设置</span>
          <el-form-item label="推荐类型：" prop="type">
            <el-radio-group v-model="ruleForm.type">
              <el-radio label="1">自动推荐</el-radio>
              <el-radio label="2">手动推荐</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="触发容量：" prop="triggerNum" v-if="ruleForm.type === '1'">
            <el-input v-model.number="ruleForm.triggerNum" maxlength='5' style="max-width: 263px;margin-right:8px" placeholder="请输入自动推荐人数" />人
          </el-form-item>
          <el-form-item label="推荐时间段：" prop="timePeriod" v-if="ruleForm.type === '1'">
            <div class='timeFormItem'
              v-for="(timeDateOne, index) in ruleForm.timeDate"
              :key="index"
            >
              <el-form-item prop="date">
                <el-date-picker
                  v-model="timeDateOne.date as any"
                  type="daterange"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :shortcuts="shortcuts"
                  value-format="YYYY-MM-DD"
                  :size="size"
                  style="max-width: 280px"
                />
              </el-form-item>
              <!-- 这儿将prop设为activeName只是为了不想写*号 -->
              <el-form-item prop="activeName" label="请设置每日推荐时间段：" label-width='180'>
                </el-form-item>
                <div style="overflow-y:auto;height:121px" >
                  <el-form-item prop="dateTime" v-for="(domain, idx) in timeDateOne.times" :key="idx">
                    <el-time-picker
                      v-model="domain.value"
                      is-range
                      format='HH:MM'
                      value-format="HH:MM"
                      range-separator="至"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      style="max-width: 200px;margin-top:6px"
                    />
                    <svg-icon  @click="addTime(timeDateOne.times,idx)" style="margin-left:6px;cursor:pointer" icon-class="square-add"/>
                    <svg-icon v-if="timeDateOne.times.length > 1" @click="delTime(timeDateOne.times,idx)" style="margin-left:6px;cursor:pointer" icon-class="circle-delete"/>
                  </el-form-item>
                </div>
              <div class="formItemDel" v-if="ruleForm.timeDate.length > 1">
                <svg-icon @click="delFormItemCal(index)" style="margin-left:6px;cursor:pointer" icon-class="circle-delete"/>
              </div>
            </div>
            <div class='timeFormItem addFormItem' @click='addFormItemCal'>
               <p>+</p>
               新建时间段
            </div>
          </el-form-item>
          <el-form-item label="推荐间隔：" prop="interval" v-if="ruleForm.type === '1'">
            <el-radio-group v-model="ruleForm.interval">
              <el-radio :label="10">10分钟</el-radio>
              <el-radio :label="20">20分钟</el-radio>
              <el-radio :label="30">30分钟</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="重复推荐：" prop="repeat" v-if="ruleForm.type === '1'">
            <el-radio-group v-model="ruleForm.repeat">
              <el-radio :label="0">不重复</el-radio>
              <el-radio :label="1">1次</el-radio>
              <el-radio :label="2">2次</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="节假日推荐：" prop="holiday" v-if="ruleForm.type === '1'">
            <el-checkbox-group v-model="ruleForm.holiday">

              <el-checkbox
                v-for="item in optionsHoliday"
                :key="item.hId"
                :label="item.hId"
              >
                <template v-slot>
                    <span :title="item.holidayName" style="max-width: 100px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;display: inline-block;">{{ item.holidayName }}</span>
                </template>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="优先推荐：" prop="priority" v-if="optionsPriority.length">
            <el-checkbox-group v-model="ruleForm.priority">
              <el-checkbox
                v-for="item in optionsPriority"
                :key="item.dId"
                :label="item.dId"
              >
                <template v-slot>
                  <span :title="item.domitory_name" style="max-width: 100px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;display: inline-block;">{{ item.domitory_name }}</span>
                </template>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item :label="optionsPriority.length ? '' : '优先推荐'"  prop="positionIdName">
            <el-checkbox-group v-model="ruleForm.positionIdName">
              <el-checkbox
                v-for="item in optionsPosition"
                :key="item.positionId"
                :label="item.positionId"
              >
                <template v-slot>
                  <span :title="item.name" style="max-width: 100px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;display: inline-block;">{{ item.name }}</span>
                </template>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="推荐人员：" prop="recommend" >
             <div @click='getSecond'>{{selectionUserNum ? '已选择' + selectionUserNum + '人' : '点击选择'}}</div>
          </el-form-item>
          <span class="title-txt"><i class="title-icon"></i>消息设置</span>
          <el-form-item label="消息类型：" prop="attribute12">
            <el-checkbox-group v-model="ruleForm.attribute12">
              <!-- <el-checkbox label="邮件" name="type" /> -->
              <el-checkbox label="微信" name="type" />
              <!-- <el-checkbox label="短信" name="type" /> -->
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="消息内容：" prop="msgType">
            <el-radio-group v-model="ruleForm.msgType">
              <el-radio :label="1" >文本</el-radio>
              <el-radio :label="2" >文本+链接</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button @click="dialogFormVisible = false">
              取消
            </el-button>
            <el-button type="primary" @click="submitForm(ruleFormRef)">保存</el-button>
            <el-button type="success" @click="manualRecommendSave(ruleFormRef)" v-if="ruleForm.type === '2'">手动推荐</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
  </div>
</template>
<script setup lang="ts" name="index">
 import { onMounted, toRefs, reactive, ref,toRaw,shallowRef,nextTick } from 'vue'
 import  { FormInstance, FormRules,ElTable,ElMessage ,ElTree, DateModelType } from 'element-plus'
import AMapLoader from '@amap/amap-jsapi-loader'
import { Search } from '@element-plus/icons-vue'   //引入图标用
import { wisdomRecommendMap,wisdomRecommendSelect,getWisdomRecomSetting,wisdomRecommendLabels,orgTreeList,getWisdomRecomUserList,saveWisdomRecomSetting,manualRecommend} from '@/api/modules/intelligentRecommendation'
import { mapKey } from '@/utils'

onMounted(() => {
    initMap()
    initType()
    initSelectRiado()
})

// 表格的属性定义
interface User {
  orgNames: string
  name: string
  user_fk: string
}

// 组织机构树的相关定义
interface Tree {
  name: string
  leaf?: boolean
}

// 组织机构树的渲染属性
const props = {
  label: 'org_name',
  children: 'children',
}

// 首页搜索的表单
let formMapSearch = reactive({
  campus: '',
  activeName: '',
  type: '',
  name: '',
})

// 点击事件的传值
const dialogFormObj = reactive({
  name:'',
  activeName:''
})
let orgIds = ref([])
let defaultkeys = ref([])

// 人员搜索项
const input2 = ref('')
// 分页配置项
let currentPageUser = ref(1)
let pageSizeUser = ref(10)
let small = ref(false)
let background = ref(false)
let disabled = ref(false)

let selectionUserNum = ref(0)
const selectionUserList = ref<User[]>([])

interface User {
  user_fk: string
  name: string
  orgNames: string
  orgId:string
}

const treeRef = ref<InstanceType<typeof ElTree>>()
// 表格配置项
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User[]>([])

const handleSelectionChange = (val: User[]) => {
  multipleSelection.value = val
  // 处理先选再取消选择的操作 目前就是当前选择项清空 再重新加当前选中的选择项
  tableData.value.forEach((mm) => {
    // console.log('编辑当前')
    let mmnn = selectionUserList.value.findIndex((kk) => kk.user_fk === mm.user_fk)
    if (mmnn > -1) {
      selectionUserList.value.splice(mmnn, 1)
    }
  })
  if(val.length) {
    val.forEach((ff) => {
      let dd = selectionUserList.value.find((kk) => kk.user_fk === ff.user_fk)
      if(!dd) {
        selectionUserList.value.push(ff)
      }
    })
  }
  selectionUserNum.value = selectionUserList.value.length
}

// 日期选择器配置项
const size = ref<'default' | 'large' | 'small'>('default')

// 重置搜索按钮表单
const onResetMapSearch = () => {
  formMapSearch.campus = ''
  formMapSearch.name = ''
  formMapSearch.activeName = ''
  formMapSearch.type = ''
  initMapData()
}

// 选人分页切换 数量
const handleSizeChange = (val: number) => {
  currentPageUser.value = 1
  pageSizeUser.value = val
  searchTableData()
}

// 选人界面页码切换
const handleCurrentChange = (val: number) => {
  pageSizeUser.value = 10
  currentPageUser.value = val
  searchTableData()
}

// 选人页面弹窗
let tableData = ref<User[]>([])
let tableDataTotal = ref(0)

// 图片引入 统一
const getImageUrl = (name: string) => {
  return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
}
const ruleFormRef = ref<FormInstance>()
let ruleForm = ref<{
  userIdList: Array<{
    orgId: string,
    userId: string
  }>
  campus: string
  orgIdList: Array<string>
  name: string
  maxNum: number
  userIds:string
  triggerNum:number
  wechat:number
  sms:number
  email:number
  recommendNum:number
  dormitoryIds:string
  orgIds:string
  positionId: string
  holidayIds: string
  type: string
  activeName: string
  timePeriod: string
  interval: string
  repeat: number
  holiday: Array<string>,
  priority: Array<string>,
  positionIds: string
  positionIdName: Array<string>
  recommend: string
  attribute12: Array<string>,
  msgType: string
  timeDate: Array<{
    date: Array<string>
    key: number
    times: Array<{
      key: number
      value: any
    }>
  }>
}>({
  campus:'',
  userIdList:[],
  orgIdList:[],
  name:'',
  maxNum:0,
  userIds:'',
  triggerNum:0,
  wechat:0,
  sms:0,
  email:0,
  recommendNum:0,
  dormitoryIds:'',
  orgIds:'',
  positionId:'',
  holidayIds:'',
  type:'1',
  activeName:'',
  timePeriod:'',
  interval:'',
  repeat:0,
  holiday:[],
  priority:[],
  positionIds:'',
  positionIdName:[],
  recommend:'',
  attribute12:[],
  msgType:'',
  timeDate:[
    {
      date:[],
      key:1,
      times:[
        {
           key:10,
           value:[]
        }
      ]
    }
  ]
})


// 日期选择器快捷选择工具
const shortcuts = [
  {
    text: '今日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime())
      return [start, end]
    },
  },
  {
    text: '昨日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
      end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
      return [start, end]
    },
  },
  {
    text: '最近7日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近30日',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
]

// 验证时间段
const validatePassTime = (rule: any, value: any, callback: any) => {
  if(ruleForm.value.timeDate.length > 0) {
    let successOrError = true
    let errorIdx = 0
    let errorName = '日期时间段'
    ruleForm.value.timeDate.forEach((ele,idx) => {
      if(!ele.date || (ele.date.length && ele.date.length === 0)) {
        errorIdx = idx + 1
        errorName = '日期时间段'
        successOrError = false
        return false
      }

      if(!ele.times.every((kk) => kk.value && (kk.value.length && kk.value.length > 0))) {
        errorName = '每日推荐时间'
        errorIdx = idx + 1
        successOrError = false
        return false
      }
    });

    if(successOrError) {
      callback()
    } else {
      callback(new Error(`请选择完整的时间(参考：第${errorIdx}个中${errorName}未填写完整)`))
    }
  }
}

const validatePassUser = (rule: any, value: any, callback: any) => {
  if(ruleForm.value.userIds && ruleForm.value.userIds !== '[]') {
    callback()
  } else {
    callback(new Error(`请选择推荐人`))
  }
}

// 规则定义
const rules = reactive<FormRules>({
  activeName: [{ required: true, message: '请输入活动类型', trigger: 'blur' }],
  maxNum: [
    { required: true, message: '请输入最大容量', trigger: 'blur' },
    {
      pattern: /^[1-9][0-9]*$/,
      message: '请输入正整数',
      trigger: 'blur',
    }
  ],
  triggerNum: [
    { required: true, message: '请输入触发容量', trigger: 'blur' },
    {
    pattern: /^[1-9][0-9]*$/,
    message: '请输入正整数',
    trigger: 'blur',
    }
  ],
  timePeriod:[{ validator: validatePassTime,required: true, trigger: 'blur' }],
  interval: [{required: true,message: '请选择推荐间隔',trigger: 'change'}],
  repeat: [{required: true,message: '请选择重复推荐',trigger: 'change'}],
  holiday: [{required: true,message: '请选择节假日推荐',trigger: 'change'}],
  recommend:[{ validator: validatePassUser,required: true, trigger: 'blur' }],
  attribute12: [{required: true,message: '请选择消息类型',trigger: 'change'}],
  msgType: [{required: true,message: '请选择消息内容',trigger: 'change'}],
  type: [{ required: true, message: '请选择推荐类型', trigger: 'change' }],
})

// 保存表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid: any, fields: any) => {
    if (valid) {
      console.log('ruleForm.attribute12:',ruleForm.value.attribute12);
      
      ruleForm.value.holidayIds = ruleForm.value.holiday.join(',')
      ruleForm.value.dormitoryIds = ruleForm.value.priority.join(',')
      ruleForm.value.positionIds = ruleForm.value.positionIdName.join(',')
      ruleForm.value.userIds = JSON.stringify(ruleForm.value.userIdList)
      ruleForm.value.orgIds = ruleForm.value.orgIdList.join(',')
      let timePeriodList: {}[] = []
      ruleForm.value.timeDate.forEach((kk) => {
        let obj: {
          startDate: string
          endDate: string
          period: Array<{
            startTime: string
            endTime: string
          }>
        } = {
          startDate: '',
          endDate: '',
          period: []
        }
        obj.startDate = kk.date[0]
        obj.endDate = kk.date[1]
        obj.period = []
        kk.times.forEach((mm) => {
          let objTime = {
            startTime: '',
            endTime: ''
          }
          objTime.startTime = mm.value[0]
          objTime.endTime = mm.value[1]
          obj.period.push(objTime)
        })
        timePeriodList.push(obj)
      })
      ruleForm.value.timePeriod = JSON.stringify(timePeriodList)
      ruleForm.value.wechat = ruleForm.value.attribute12.includes('微信') ? 1 : 0
      // ruleForm.value.sms = ruleForm.value.attribute12.includes('短信') ? 1 : 0
      // ruleForm.value.email = ruleForm.value.attribute12.includes('邮件') ? 1 : 0
      ruleForm.value.sms =  0
      ruleForm.value.email =  0
      let { activeName, campus, dormitoryIds, email, holidayIds, interval, maxNum, msgType, name, orgIds, positionId, positionIds, recommendNum, repeat, sms, timePeriod, triggerNum, type, userIds, wechat } = ruleForm.value
      let params = { activeName, campus, dormitoryIds, email, holidayIds, interval, maxNum, msgType, name, orgIds, positionId, positionIds, recommendNum, repeat, sms, timePeriod, triggerNum, type, userIds, wechat }
      saveWisdomRecomSetting(params).then((res) => {
         if(res.data) {
            ElMessage({
              message: res.msg || '编辑成功',
              type: 'success',
            })
            initMapData()
            dialogFormVisible.value = false
         } else {
            ElMessage({
              message: res.msg || '编辑失败',
              type: 'error',
            })
         }
      })
    }
  })
}

// 手动推荐表单
const manualRecommendSave = async (formEl: FormInstance | undefined) => {
  ruleForm.value.dormitoryIds = ruleForm.value.priority.join(',')
  ruleForm.value.positionIds = ruleForm.value.positionIdName.join(',')
  ruleForm.value.userIds = JSON.stringify(ruleForm.value.userIdList)
  ruleForm.value.orgIds = ruleForm.value.orgIdList.join(',')
  ruleForm.value.wechat = ruleForm.value.attribute12.includes("微信") ? 1 : 0
  // ruleForm.value.sms = ruleForm.value.attribute12.includes('短信') ? 1 : 0
  // ruleForm.value.email = ruleForm.value.attribute12.includes('邮件') ? 1 : 0
  ruleForm.value.sms =  0
  ruleForm.value.email =  0
  let { activeName,campus,dormitoryIds,email,maxNum,msgType,name,orgIds,positionId,positionIds,recommendNum,sms,triggerNum,type,userIds,wechat } = ruleForm.value
  let params = { activeName,campus,dormitoryIds,email,maxNum,msgType,name,orgIds,positionId,positionIds,recommendNum,sms,triggerNum,type,userIds,wechat }
  if (!formEl) return
  await formEl.validate((valid: any, fields: any) => {
    if (valid) {
      manualRecommend(params).then((res) => {
        if(res.data) {
            ElMessage({
              message: res.msg || '推荐成功',
              type: 'success',
            })
         } else {
            ElMessage({
              message: res.msg || '推荐失败',
              type: 'error',
            })
         }

      })
    }
  })
}

const optionsCampus = [
  {
    value:'',
    label:'全校'
  },
   {
    value:'良乡校区',
    label:'良乡校区'
  },
   {
    value:'望京校区',
    label:'望京校区'
  },
]

const optionsTypeRecommend = [
  {
    value:'',
    label:'不限'
  },
   {
    value:'1',
    label:'自动推荐'
  },
   {
    value:'2',
    label:'手动推荐'
  },
]

const optionsTypeActivity = ref([])
const optionsHoliday = ref<any[]>([])
const optionsPriority = ref<any[]>([])
const optionsPosition = ref<any[]>([])
const dataTree = ref([])
let dialogFormVisible = ref(false)
let dialogVisible = ref(false)
let campusLeftList = ref([])
let campusRightList = ref<any[]>([])
let campusRight : { remove: (arg0: never[]) => void; add: (arg0: any) => void }
let campusLeft: { remove: (arg0: never[]) => void; add: (arg0: any) => void }

// 添加时间点
const addTime = (item:any,idx:any) => {
  item.splice(idx+1,0,{
    key: Date.now(),
    value: [],
  })
}

// // 删除时间点
const delTime = (item:any,idx:any) => {
  item.splice(idx,1)
}

// 添加时间段
const addFormItemCal = () => {
  ruleForm.value.timeDate.push({
    key: Date.now(),
    date: [],
    times:[
      {
        key: Date.now(),
        value:[]
      }
    ]
  })
}

// 添加时间段
const delFormItemCal = (idx:any) => {
  ruleForm.value.timeDate.splice(idx,1)
}

// 添加时间点
const getSecond = () => {
   initTree()
   currentPageUser.value = 1
   dialogVisible.value = true
}

// 初始化机构树
let initTree = async () => {
    let { data } = await orgTreeList({org_name:''});
    if(data) {
      dataTree.value = data
      if (defaultkeys.value) {
        nextTick(() => {
          orgIds.value = defaultkeys.value
          treeRef.value!.setCheckedKeys(defaultkeys.value, true)
          searchTableData()
        })
      }
    }
}
let amp = ref()

// 初始化地图
function initMap() {
  AMapLoader.load({
    key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.HeatMap", "AMap.moveAnimation"] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
  .then(AMap => {
    amp.value = AMap
    AMap.plugin("AMap.MoveAnimation", () => {});
    //DOM初始化完成进行地图初始化
    campusLeft = new AMap.Map("campusLeft", {
      //设置地图容器id
      resizeEnable: true,
      zoom: 17.3, //初始化地图级别
      zooms: [17.3,18], //缩放范围
      center: [116.18,39.74] //初始化地图中心点位置
    });
    campusRight = new AMap.Map("campusRight", {
      //设置地图容器id
      resizeEnable: true,
      zoom: 18.9, //初始化地图级别
      zooms: [17.3,20], //缩放范围
      center: [116.4780,39.9813] //初始化地图中心点位置
    });
    //初始化heatmap对象
    initMapData()
  })
  .catch(e => {
    console.log(e);
  });
}

const initType = async () => {
    let { data } = await wisdomRecommendSelect();
    if(data) {
      optionsTypeActivity.value= data
    }
}

let initSelectRiado = async () => {
    let { data } = await wisdomRecommendLabels();
    if(data) {
      optionsHoliday.value = data.holidays
      optionsPriority.value = data.domitorys
      optionsPosition.value = data.teachBuild
    }
}

let searchTable = async (tab: any, selects: { checkedNodes: { map: (arg0: (kk: any) => any) => never[] } }) => {
  orgIds.value = selects.checkedNodes.map((kk) => kk.id)

  for (let i = 0; i < selectionUserList.value.length; i++) {
    let hh = selectionUserList.value[i]
    let idx = orgIds.value.findIndex((kk) => kk == hh.orgId)
    let idxx = selectionUserList.value.findIndex((uu) => uu.user_fk == hh.user_fk)
    if (idx < 0) {
      selectionUserList.value.splice(idxx, 1)
      i--
    }
  }
  if(!orgIds.value.length) {
    tableData.value = []
    tableDataTotal.value = 0
    return false
  } else {
    searchTableData()
  }
}

let searchTableData = async () => {
  if (!orgIds.value.length) {
    tableData.value = []
    tableDataTotal.value = 0
    return false
  }
  let obj = {
    orgIds:orgIds.value.join(','),
    name:input2.value,
    pageSize: pageSizeUser.value,
    pageNum: currentPageUser.value
  }
    let { data } = await getWisdomRecomUserList(obj);
    if(data) {
      tableData.value = data.rows
      tableDataTotal.value = data.total

      if(selectionUserList.value) {
        selectionUserList.value.forEach((rowSee) => {
          let idx = tableData.value.findIndex((kk) => kk.user_fk === rowSee.user_fk)
          if(idx > -1) {
            nextTick(() => {
              changeSele([tableData.value[idx]])
            })
          }
        })
      }
    }
}

let changeSele = (rows: any[]) => {
  if (rows) {
    rows.forEach((row) => {
      multipleTableRef.value!.toggleRowSelection(row, true)
    })
  }
}

let saveUser = () => {
  ruleForm.value.orgIdList = orgIds.value
  ruleForm.value.userIdList = []
  selectionUserList.value.forEach((pp) => {
    ruleForm.value.userIdList.push({
      orgId: pp.orgId,
      userId: pp.user_fk,
    })
  })
  // 在弹窗内再次打开的显示
  defaultkeys.value = orgIds.value
  ruleForm.value.userIds = JSON.stringify(ruleForm.value.userIdList)
  dialogVisible.value = false
}



const initMapData = async () => {
    let params = {
      ...formMapSearch
    }
    let { data } = await wisdomRecommendMap(params);
    let iconObj = {
      '篮球场':'basketball',
      '教学楼':'building',
      '足球场':'football',
      '体育馆':'gymnasium',
      '图书馆':'library',
      '北餐厅':'restaurant',
    }
    if(data && data.map1) {
      if(formMapSearch.campus === '望京校区') {
        campusRight.remove(campusRightList.value as any)
        campusRightList.value = []
      } else {
        campusLeft.remove(campusLeftList.value)
        campusLeftList.value = []
      }
      data.map1.forEach((itm: { name: string; currentNum: any; maxNum: string; lng: any; lat: any; positionId: any }) => {
        let backHtml = ''
        let iconShow = iconObj[itm.name] || 'building'
        if(['篮球场','足球场'].includes(itm.name)) {
          backHtml =  '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#FC9F1A, #F7B733);">'
        } else {
          backHtml =  '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#0A6886, #2762B0);">'
        }
         const markerContent = backHtml +
         '<div>' +
          `<img src="${getImageUrl(iconShow)}" style="width:15px;height:15px;margin-right:8px"/>` +
          `<span>${itm.name}</span>` +
         '</div>' +
          `<span>${itm.currentNum || 0}${itm.maxNum ? '/' + itm.maxNum : ''}</span>` +
          `<img src="${getImageUrl("set")}" style="width:18px;height:18px"/>` +
          '</div>' +
          '</div>';
          const position = new window.AMap.LngLat(itm.lng,itm.lat); // Marker经纬度
        let marker = new window.AMap.Marker({
            position: position,
            content: markerContent, // 将 html 传给 content
          offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
          });

          if(formMapSearch.campus === '望京校区') {
            campusRight.add(marker);
            campusRightList.value.push(marker)
          } else {
            campusLeft.add(marker);
            campusLeftList.value.push(marker as never)
          }

          // 点击事件定义
          const clickHandler = async function(e: any) {
            let { data } = await getWisdomRecomSetting({positionId:itm.positionId});
            dialogFormObj.name = itm.name
            dialogFormVisible.value = true
            data.timePeriod = JSON.parse(data.timePeriod)
            if(data.timePeriod && data.timePeriod.length > 0) {
              ruleForm.value.timeDate = []
              data.timePeriod.forEach((kk: { startDate: any; endDate: any; period: any[] },indx: string|number) => {
                ruleForm.value.timeDate.push({
                  key: Date.now(),
                  date: kk.startDate ? [kk.startDate, kk.endDate] : [],
                  times: []
                  })
                ruleForm.value.timeDate[indx].times = []
                kk.period.forEach((mm,idx) => {
                  ruleForm.value.timeDate[indx].times.push({
                    key: Date.now(),
                    value: mm.startTime ? [mm.startTime,mm.endTime] : []
                  })
                })
              })
            }

            ruleForm.value.holiday = data.holidayIds ? data.holidayIds.split(',').map(Number) : []
            ruleForm.value.priority= data.dormitoryIds ? data.dormitoryIds.split(',').map(Number) : []
            ruleForm.value.positionIdName = data.positionIds ? data.positionIds.split(',').map(Number) : []
            ruleForm.value.userIdList = data.userIds ? JSON.parse(data.userIds) : []
            selectionUserNum.value = ruleForm.value.userIdList.length
            selectionUserList.value = []
            ruleForm.value.userIdList.forEach((l: any) => {
              selectionUserList.value.push({
              user_fk: l.userId,
              orgNames: '',
              name: '',
              orgId: l.orgId
              })
            })
            ruleForm.value.orgIdList = data.orgIds ? data.orgIds.split(',').map(Number) : []
            defaultkeys.value = data.orgIds ? data.orgIds.split(',').map(Number) : []
            if(data.wechat) {
              ruleForm.value.attribute12.push('微信')
            }
            if(data.sms) {
              ruleForm.value.attribute12.push('短信')
            }
            if(data.email) {
              ruleForm.value.attribute12.push('邮件')
            }
            ruleForm.value = { ...ruleForm.value , ...data }
          };

          // 绑定事件
          marker.on('click', clickHandler);
      });
    }
    // campusRight.remove(campusRightList)
    if(data && data.map2) {
      campusRight.remove(campusRightList.value as any)
      campusRightList.value = []
      data.map2.forEach((itm: { name: string; currentNum: any; maxNum: string; lng: any; lat: any; positionId:string}) => {
        let backHtml = ''
        let iconShow = iconObj[itm.name] || 'building'
        if(['篮球场','足球场'].includes(itm.name)) {
          backHtml =  '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#FC9F1A, #F7B733);">'
        } else {
          backHtml =  '<div class="custom-content-marker">' +
          '<div class="content" style="background-image: linear-gradient(#0A6886, #2762B0);">'
        }
         const markerContent = backHtml +
         '<div>' +
          `<img src="${getImageUrl(iconShow)}" style="width:15px;height:15px;margin-right:8px"/>` +
          `<span>${itm.name}</span>` +
         '</div>' +
          `<span>${itm.currentNum || 0}${itm.maxNum ? '/' + itm.maxNum : ''}</span>` +
          `<img src="${getImageUrl("set")}" style="width:18px;height:18px"/>` +
          '</div>' +
          '</div>';
          const position = new window.AMap.LngLat(itm.lng,itm.lat); // Marker经纬度
          const marker11 = new window.AMap.Marker({
            position: position,
            content: markerContent, // 将 html 传给 content
            offset: new window.AMap.Pixel(-13, -30) // 以 icon 的 [center bottom] 为原点
          });
          campusRight.add(marker11);
          campusRightList.value.push(marker11)

          // 点击事件定义
          const clickHandler = async function() {
            let { data } = await getWisdomRecomSetting({positionId:itm.positionId});
            dialogFormObj.name = itm.name
            dialogFormVisible.value = true
            data.timePeriod = JSON.parse(data.timePeriod)
            if(data.timePeriod && data.timePeriod.length > 0) {
              ruleForm.value.timeDate = []
              data.timePeriod.forEach((kk: { startDate: string; endDate: string; period: any[] },indx: string | number) => {
                ruleForm.value.timeDate.push({
                  key: Date.now(),
                  date: kk.startDate ? [kk.startDate, kk.endDate] : [],
                  times: []
                  })
                ruleForm.value.timeDate[indx].times = []
                kk.period.forEach((mm,idx) => {
                  ruleForm.value.timeDate[indx].times.push({
                    key: Date.now(),
                    value: mm.startTime ? [mm.startTime,mm.endTime] : []
                  })
                })
              })
            }

            ruleForm.value.holiday = data.holidayIds.split(',').map(Number)
            ruleForm.value.priority= data.dormitoryIds.split(',').map(Number)
            ruleForm.value.positionIdName = data.positionIds.split(',').map(Number)
            selectionUserNum.value = ruleForm.value.userIdList.length
             ruleForm.value.userIdList = data.userIds ? JSON.parse(data.userIds) : []
            selectionUserList.value = []
            ruleForm.value.userIdList.forEach((l: any) => {
              selectionUserList.value.push({
                user_fk: l.userId,
                orgNames: '',
                name: '',
                orgId: l.orgId
              })
            })
            ruleForm.value.orgIdList = data.orgIds ? data.orgIds.split(',').map(Number) : []
            defaultkeys.value = data.orgIds ? data.orgIds.split(',').map(Number) : []
            if(data.wechat) {
              ruleForm.value.attribute12.push('微信')
            }
            if(data.sms) {
              ruleForm.value.attribute12.push('短信')
            }
            if(data.email) {
              ruleForm.value.attribute12.push('邮件')
            }
            ruleForm.value = { ...ruleForm.value , ...data }
          };

          // 绑定事件
          marker11.on('click', clickHandler);
      });
    }
}

const closed = () => {
  ruleForm.value = {
    campus:'',
    userIdList:[],
    orgIdList:[],
    name:'',
    maxNum:0,
    userIds:'',
    triggerNum:0,
    wechat:0,
    sms:0,
    email:0,
    recommendNum:0,
    dormitoryIds:'',
    orgIds:'',
    positionId:'',
    holidayIds:'',
    type:'1',
    activeName:'',
    timePeriod:'',
    interval:'',
    repeat:0,
    holiday:[],
    priority:[],
    positionIds:'',
    positionIdName:[],
    recommend:'',
    attribute12:['短信'],
    msgType:'',
    timeDate:[
      {
        date:[],
        key:1,
        times:[
          {
            key:10,
            value:[]
          }
        ]
      }
    ]
  }
}
</script>


<style lang="scss" scoped>
#campusRight {
  width:50%;
  height:100%;
  float:right
}

#campusLeft {
  width:100%;
  height:100%;
  float:left
}

:deep(.custom-content-marker){
  padding: 3px;
  width: 200px;
  height: 40px;
  position: relative;
  background-color: #FFFFFF;
  border-radius: 5px;
  margin-left:-100px;
  box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.21);
  .content {
    text-align:center;

    // width:100%;
    border-radius: 5px;
    height:34px;
    line-height:34px    ;
    // background-color:#0A6886;
    font-size: 16px;
    font-family: AlibabaPuHuiTi_2_65_Medium;
    color: #FFFFFF;
    display:flex;
    justify-content:space-around;
    align-items: center;
  }
}

:deep(.custom-content-marker::after){
  content: '';
  width: 0px;
  height: 0px;
  border: 7px solid;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-top: 7px solid #FFFFFF;
  /*给绝对定位，根据需求设置三角形的位置*/
  position: absolute;
  top: 40px;
  left: 100px;
}

:deep(.timeFormItem) {
  width:302px;
  height:202px;
  padding:11px;
  margin-right:10px;
  margin-bottom:10px;
  background: url(@/assets/imgs/rectangle-bg.png) no-repeat center center;
  background-size: 100% 100%;
  // overflow-y: auto;
  position: relative;
  .formItemDel {
    position: absolute;
    right: -18px;
    top: -13px;
  }
}

:deep(.addFormItem) {
 display: flex;
 align-items: center;
 justify-content: center;
 flex-direction: column;
 font-size: 16px;
 color: #005DA7;
 cursor: pointer;
}


.lineCenter {
  position:absolute;
  left: calc(50% - 15px);
  width: 30px;
  height: calc(100% - 20px);
  background: linear-gradient( transparent , rgba(0,0,0,0.08) 0);
  // opacity: 0.08;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 999;

  // position:absolute;
  //     bottom: 8px;
  //     left: calc(50% - 15px);
  //     width: 30px;
  //     height: calc(100% - 66px);
  //     background: linear-gradient( transparent , rgba(0,0,0,0.08) 0);
  //     backdrop-filter: blur(4px);
  //     -webkit-backdrop-filter: blur(4px);
  //     z-index: 999;
}

.title-icon {
  width: 12px;
  height: 12px;
  border: 2px solid rgb(178, 42, 37);
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.title-txt {
  font-size: 18px;
  font-family: AlibabaPuHuiTi_2_75_SemiBold;
  color: #203449;
  font-weight: 600;
  margin-bottom: 20px;
  display: inline-block;
}

.mapContent {
  width: 100%;
  height: 650px;
  padding: 10px;
  background: #FFFFFF;
  position: relative;
}

:deep(.amap-logo) {
    right: 0 !important;
    left: auto !important;
    display: none !important;
}

:deep(.amap-copyright) {
    right: 70px !important;
    left: auto !important;
    opacity:0 !important;
}
</style>
