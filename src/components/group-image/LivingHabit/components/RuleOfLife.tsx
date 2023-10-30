import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, onUnmounted, toRef, unref, toRefs, provide, computed, Ref, onErrorCaptured } from "vue"
import { BaseParams } from "../../types";
import './RuleOfLife.scss'
import RedTab from '@/components/common/RedTab.vue';
import BarLegend from '@/components/common/BarLegend.vue'
import BarMultiSegment from '@/components/common/BarMultiSegment.vue'
import TwoRowsCard from '@/components/common/TwoRowsCard.vue';
import { ElLink, ElLoading, ElProgress } from "element-plus";
import { MultiSegmentConf, RedTabConfig } from "@/components/common/Search";
import InstanceManager from "@/utils";
import { downloadFile, usePortraitRequest } from "@/hooks";
import { changeChartData, exportGetChartDataDetail, getChartData, getChartDataDetail } from "@/api/modules/studentPortrait";
import { Column } from "@/components/Table";
import { requestResType, PagesType, searchConfigType } from '@/components/Table-plus/index.d'
import { getOrgType } from "@/api/modules/emphasisList";
import WarningSeal from "@/components/WarningSeal";

const LeftView = defineComponent({
  props: {
    selectList:{
      type: Object as PropType<RedTabConfig[]>,
      default: () => ([
        {
          value: 'Lifestyle_population',
          label: "生活规律人群"
        },
        {
          value: 'Grade_differences',
          label: "人群差异分析"
        },
      ])
    }
  },
  setup(props, content) {
    const params = inject<BaseParams>('params',  {} as any)
    const instanceManager = inject<InstanceManager>('InstanceManager',new InstanceManager())
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const tabList = reactive(props.selectList)
    const isActive = ref<string>(props.selectList[0].value as string)
    const tabChange = (v: string) => {
      isActive.value = v;
    }
    const LeftChart = ref()
    const response = ref({})
    const MajorOption = reactive<MultiSegmentConf>({
      list: [],
      colorList: [
        {
          color: "#005DA7",
          label: "待改进"
        },
        {
          color: "#00C9F2",
          label: "适中"
        },
        {
          color: "#E3493E",
          label: "较好"
        },
      
      ],
      unit: '人',
      lableAlign: 'right',
      lableWidth: '80px',
      height: '290px',
    })
    const isOneActive = ref<string>('')
    const selectOne = ref<any>([])
    const setList = (res:string)=>{
      const item: any = tabList.find(i => i.value === res)
      if(res =='Grade_differences'){
        selectOne.value = item.children?item.children:[
          {
          value: "Grade_differences",
          label: "年级差异"
          },
          {
            value: "sex_difference",
            label: "性别差异"
          },
          {
            value: "Differences_in_College_Majors",
            label: "学院专业差异"
          },
        ]
        isOneActive.value = selectOne.value[0].value
      }
    }
    const isClsActive = ref<string>('按学院')
    const selectList = reactive([
      {
        value: "按学院",
        label: "按学院"
      },
      {
        value: "按专业",
        label: "按专业"
      },
    ])
    const oneData = reactive({
      list:[]
    })
    const visible = ref(false)
    const initLeftChart = () => {
      const el: HTMLElement = LeftChart.value;
      let myChart = echart?.getInstanceByDom(LeftChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      const datas = oneData.list?oneData.list:[]
      let option = {
        color: ['#E3493E', '#1B528B', '#F6B145'],
        title: {
          text: '单位：人',
          top: '0%',
          left: 0,
          textStyle: {
            color: '#333333',
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          right: '0%',
          top: '0.5%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['待改进', '适中','较好']
        },
        grid: {
          top: '12%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: datas.map((item:any)=> item.name),
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              interval: 'auto',
            },
          }
        ],
        yAxis: [
          { 
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            },
          
          },
        ],
        series: [
          { 
            type: 'bar',
            name:'待改进',
            barWidth: '20%',
            data: datas.map((item:any)=> item.improve),
          },
          { 
            type: 'bar',
            name:'适中',
            barWidth: '20%',
            data: datas.map((item:any)=> item.moderate),
          },
          { 
            type: 'bar',
            name:'较好',
            barWidth: '20%',
            data: datas.map((item:any)=> item.preferably),
          },
        ]
      };
      myChart?.setOption(option);
      myChart?.on('click', (param)=> {
        typeNameRef.value = param.name
        visible.value = true
      })
    }
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
        prop: 'campusName',
        label: '校区',
        align: 'center'
      },
      {
        prop: 'collegeName',
        label: '学院',
        align: 'center'
      },
      {
        prop: 'majorName',
        label: '专业',
        align: 'center'
      },
      {
        prop: 'gradeName',
        label: '年级',
        align: 'center'
      },
      {
        prop: 'className',
        label: '班级',
        align: 'center'
      },
      {
        prop: 'regularity',
        label: '规律性',
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
    const typeNameRef = ref('')
    const searchConfig: searchConfigType = [
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
        type: 'select',
        label: '类型',
        inputWidth: '80px',
        labelWidth: '40px',
        default: typeNameRef,
        key: 'typeName',
        options: [
          { label: '洗澡', value: '洗澡' }, 
          { label: '饮食', value: '饮食' },
          { label: '作息', value: '作息' },
          { label: '消费', value: '消费' },
          { label: '上网', value: '上网' },
        ]
      },
      {
        type: 'input',
        placeholder: '请输入姓名,学号搜索',
        label: '',
        inputWidth: '160px',
        key: 'name'
      }
    ]
    const tableRequest = (para: any, pages: PagesType): Promise<requestResType> => {
      const obj = {
        ...params,
        ...para,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: false,
        ident: 'Lifestyle_population'
      }
      return getChartDataDetail(obj)
    }
    const exportEvt = async(form: any, pages: PagesType)=>{
      const res = await exportGetChartDataDetail({
        ...params,
        ...form,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: true,
        ident: 'Lifestyle_population'
      })
      downloadFile(res)
    }
    const oneTabChange = (v: string) => {
      isOneActive.value = v;
      isClsActive.value = '按学院';
    }
    instanceManager?.register('ruleIsActive', isActive)
    instanceManager?.register('isOneActiveLife', isOneActive)
    instanceManager?.register('ruleResponse', response)
    
    onUnmounted(() => {
      instanceManager?.clear('ruleIsActive')
      instanceManager?.clear('isOneActiveLife')
      instanceManager?.clear('ruleResponse')
    })
    
    const changeData = async (indet: Ref) => {
      const loading = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      let query: any = {
        ident: indet.value,
      }
      if (isActive.value == 'Grade_differences') {
        query.category = isClsActive.value
      }
      const res = await changeChartData(Object.assign(params, query))
      if(res.code != 1){
        if(isActive.value == 'Grade_differences'){
          MajorOption.list = []
        }
      }
      if(isActive.value == 'Grade_differences'){
        MajorOption.list = res.data
      }
      delete params.category
      loading.close()
    }
    const redTabChange = (v: string) => {
      isClsActive.value = v;
      changeData(isOneActive)
    }
    const chartData = async (indet: Ref) => {
      const loading = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      let query = {
        ident: indet
      }
      const res = await getChartData(Object.assign(params, {ident:indet.value}))
      response.value = res
      if(res.code != 1){
        if(isActive.value == 'Grade_differences'){
          MajorOption.list = []
        }
      }
      if(isActive.value == 'Grade_differences'){
        MajorOption.list = res.data
      }
      loading.close()
    }
    const WarningSealName = (val: any) => {
      const list = [
        {
          value: 'Lifestyle_population',
          label: "生活规律人群"
        },
        {
          value: "Grade_differences",
          label: "年级差异"
        },
        {
          value: "sex_difference",
          label: "性别差异"
        },
        {
          value: "Differences_in_College_Majors",
          label: "学院专业差异"
        },
      
      ];
      const item = list.find(item => item.value === val);
      return item ? item.label : '';
    };
  
    const queryFlag = ref('')
    watch(isOneActive,(res)=>{
      MajorOption.list = []
      if(res=='Grade_differences'){
        MajorOption.lableWidth = '80px'
        MajorOption.height = '290px'
      }
      if(res=='sex_difference'){
        MajorOption.lableWidth = '80px'
        MajorOption.height = '100px'
      }
      if(res=='Differences_in_College_Majors'){
        MajorOption.lableWidth = '155px'
        MajorOption.height = '290px'
      }
      if (isActive.value == 'Grade_differences') {
        queryFlag.value = res
        // chartData(isOneActive)
      }
    },{deep:true})
    watch(isActive, (val) => {
      setList(val)
      queryFlag.value = val
      if (val == 'Grade_differences') {
        isClsActive.value = '按学院';
      }
    },{ immediate:true,deep:true})
    const dataSource = usePortraitRequest({...toRefs(params) as any, ident: queryFlag }, queryFlag)
    watch(dataSource,(res)=>{
      response.value = res
      if(res.code !=1){
        if(isActive.value == 'Lifestyle_population'){
          oneData.list = []
          nextTick(() => {
            initLeftChart();
          })
        }
        if(isActive.value == 'Grade_differences'){
          MajorOption.list = []
        }
        return
      }
      if(isActive.value == 'Lifestyle_population'){
        oneData.list = res.data
        nextTick(() => {
          initLeftChart();
        })
      }
      if(isActive.value == 'Grade_differences'){
        MajorOption.list = res.data
      }
      
    },{deep:true})
    const renderOne = (val: string) => {
      switch (val) {
        case 'Grade_differences':
          return <>
            <div class='flex-end' style='margin-bottom:8px;'>
              <BarLegend legendList={MajorOption.colorList} />
            </div>
            <BarMultiSegment key={val} options={MajorOption} />
            <div class='text'>不同年级生活规律性差异</div>
          </>
        case 'sex_difference':
          return <>
            <div class='column' style='height:290px'>
              <div class='flex-end' style='margin-bottom:8px;width:100%'>
                <BarLegend legendList={MajorOption.colorList} />
              </div>
              <BarMultiSegment key={val} options={MajorOption} />
            </div>
            <div class='text'>不同性别生活规律性差异</div>
          </>
        default:
          return <>
            <div class='sb' style='padding-left:175px;margin-bottom:8px;'>
              <BarLegend legendList={MajorOption.colorList} />
              <RedTab class="small-tab" isRed={true} btnList={selectList} isActive={isClsActive.value} onRedTabChange={redTabChange} />
            </div>
            <BarMultiSegment key={val} options={MajorOption} />
            <div class='text'>不同学院专业生活规律性差异</div>
          </>
      }
    }
    const renderFn = (val: string) => {
      switch (val) {
        case 'Lifestyle_population':
          return <>
            <div key={val} class='RuleOfLife-left-chart' ref={LeftChart}></div>
            <div class='text'>各生活内容规律性分布</div>
          </>
        case 'Grade_differences':
          return <>
            <div class='flex-end'>
              <RedTab class="one-tab" height='28px' bgColor='#B22924' btnList={selectOne.value} isActive={isOneActive.value} onRedTabChange={oneTabChange} />
            </div>
            {
              renderOne(isOneActive.value)
            }
          </>
      }
    }
    return () => {
      return <div class='RuleOfLife-left'>
        <div class="RuleOfLife-tab-box sb">
          <c-title title="基本信息画像" />
          <RedTab btnList={tabList} isActive={isActive.value} onRedTabChange={tabChange} />
        </div>
        {
          renderFn(isActive.value)
        }
        <c-table-plus columns={columns} request={tableRequest} searchConfig={searchConfig} visible={visible.value}
          title='个人生活规律' dialogWidth="85%" height="450px" closed={() => visible.value = false} exportBtn={exportEvt}>
          {{
            index:(arg:any) =>{
              const {data} = arg
              return <div>{ data.$index + 1 }</div>
            },
            action:(arg:any) =>{
              const {data} = arg
              return <ElLink type="primary">学生个像</ElLink>
            }
          }}
      </c-table-plus>
      <WarningSeal name={WarningSealName(queryFlag.value)} ident={queryFlag.value}/>
      </div>
    }
  }
})


const RightView = defineComponent({
  setup(props, content) {
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const instanceManager = inject<InstanceManager>('InstanceManager',new InstanceManager())
    const isOneActive = instanceManager.get('isOneActiveLife')
    const dataSource = instanceManager.get('ruleResponse')
    const isActive = instanceManager.get('ruleIsActive')
    const oneData = ref<{ [key: string | symbol]: any }>({})
    const twoData = reactive<{ details:any[],[key: string | symbol]: any }>({
      details:[],
      good:'',
      bad:'',
      user:{}
    })
    const LeftPieChart = ref()
    const cardConfig = ref([
      {
        title:'规律',
        topText:'生活规律性最好学院',
        topText2:'',
        bottomText:'生活规律性最好专业',
        bottomText2:'',
        topVal: '',
        topVal2: '',
        bottomVal: '',
        bottomVal2: '',
        unit:'',
        unit2:'',
        bgColor:'#005DA7'
      },
      {
        title:'不规律',
        topText:'生活规律性最差学院',
        topText2:'',
        bottomText:'生活规律性最差专业',
        bottomText2:'',
        topVal: '',
        topVal2: '',
        bottomVal: '',
        bottomVal2: '',
        unit:'',
        unit2:'',
        bgColor:'#45A0E6'
      },
    ])
    const initLeftPieChart = () => {
      const el: HTMLElement = LeftPieChart.value;
      let myChart = echart?.getInstanceByDom(LeftPieChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let datas = twoData.user.details? twoData.user.details :[]
      datas.forEach((it: any) => {
        let item = {...it}
        if (item.value == 0) {
          item.labelLine = { show: false }
          item.label = { show: false }
        }
        return item
      })
      let option: any = {
        color: [ '#F39D12','#45A0E6',],
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value} 人 (${param.percent}%)`
          }
        },
        series: [
          {
            // name: "",
            type: "pie",
            radius: ["40%", "55%"],
            center: ['50%', '50%'],
            labelLine: {
              length: 20,//第一段线长
              length2: 80, //第二段线长
              lineStyle: {
                width: 1,
                type: 'solid',
                color: '#005DA7'
              },

            },
            label: {
              formatter: '{name|{b}: }{num|{c}人}\n\n{zb|{d}%}',
              padding: [0, -80, -5, -80],
              rich: {
                name: {
                  fontSize: 14,
                  color: '#203449'
                },
                num: {
                  fontSize: 14,
                  color: '#203449'
                },
                zb: {
                  fontSize: 16,
                  color: '#203449'
                }

              },
            },
            data: datas,
          },
        ],

      }
      myChart?.setOption(option);
    }
    watch(dataSource,(res)=>{
      if(res.code !=1){
        if(isActive.value == 'Lifestyle_population'){
          oneData.value = {}
        }
        if (isActive.value == 'Grade_differences') {
          if(isOneActive.value == 'Grade_differences'){
            twoData.good = ''
            twoData.bad = ''
          }
          if(isOneActive.value == 'sex_difference'){
            twoData.details = []
            nextTick(() => {
              initLeftPieChart();
            })
          }
          if(isOneActive.value == 'Differences_in_College_Majors'){
            cardConfig.value[0].topVal = ''
            cardConfig.value[0].bottomVal = ''
            cardConfig.value[1].topVal = ''
            cardConfig.value[1].bottomVal = ''
          }
        }
        return
      }
      if(isActive.value == 'Lifestyle_population'){
        oneData.value = res.datas2
      }
      if (isActive.value == 'Grade_differences') {
        if(isOneActive.value == 'Grade_differences'){
          const {best,worst} = res.datas2
          twoData.good = best
          twoData.bad = worst
        }
      
        if(isOneActive.value == 'sex_difference'){
          const {user,improve} = res.datas2
          twoData.user = user
          twoData.improve = improve
          nextTick(() => {
            initLeftPieChart();
          })
        }
        if(isOneActive.value == 'Differences_in_College_Majors'){
          const {best,worst} = res.datas2
          cardConfig.value[0].topVal = best.college
          cardConfig.value[0].bottomVal = best.major
          cardConfig.value[1].topVal = worst.college
          cardConfig.value[1].bottomVal = worst.major
        }
      }
    },{deep:true})
    const renderTwo = (v:string) => {
      switch (v) {
        case 'Grade_differences':
          return <>
            <div class='c-title'>不同年级生活规律性差异</div>
            <div style='padding:0 25px;margin-top:34px;height:300px;'>
              <div class='small-box flex-start'>
                <div class='small-box-tag' style="background: #45A0E6;">规律</div>
                <div class='text'>生活规律性最好年级 <span>{twoData.good}</span></div>
              </div>
              <div class='small-box flex-start' style="margin-top:22px;">
                <div class='small-box-tag' style="background: #B22924;">不规律</div>
                <div class='text'>生活规律性最差年级 <span>{twoData.bad}</span></div>
              </div>
            </div>
          </>
        case 'sex_difference':
          return <div class='sex_difference-box sb'>
            <div class='sex_difference-box-l'>
              <div class='c-title'>不同性别生活规律性差异</div>
              <div class='column' style='height:305px;'>
                <div class='small-box flex-start'>
                  <div class='small-box-tag' >男生</div>
                  <div class='text'>生活规律性待改进 <span>{twoData.improve?.male}</span>%</div>
                </div>
                <div class='small-box flex-start' style="margin-top:22px;">
                  <div class='small-box-tag' style="background: #B22924;">女生</div>
                  <div class='text'>生活规律性待改进 <span>{twoData.improve?.female}</span>%</div>
                </div>
              </div>
            </div>
            <div class='sex_difference-box-r'>
              <div class='c-title'>生活规律性待改进学生</div>
              <div class='column' style='height:305px;'>
                <div class='twoPieChart' ref={LeftPieChart}></div>
                <div class='text'>生活规律性待改进学生 <span>{twoData.user?.total}</span>人</div>
              </div>
            </div>
          </div>
        case 'Differences_in_College_Majors':
          return <>
            <div class='c-title' style='margin-bottom:28px'>不同学院/专业生活规律性差异</div>
            {
              cardConfig.value.map((i, index) => (
                <TwoRowsCard cardConfig={i} key={i.bgColor} />
              ))
            }
          </>
      }
    }
    const renderFn = (val: string) => {
      switch (val) {
        case 'Lifestyle_population':
          return <>
            <div class='c-title'>生活规律人群</div>
            <div class='Lifestyle_population-content sb'>
              <div class='Lifestyle_population-content-left'>
                <div class='small-box flex-start'>
                  <div class='small-box-tag'>适中</div>
                  <div class='text'>生活规律适中占比 <span>{oneData.value.moderate}</span>%</div>
                </div>
                <div class='small-box flex-start' style="margin-top:22px;">
                  <div class='small-box-tag' style="background: #B22924;">待改进</div>
                  <div class='text'>生活规律待改进占比 <span>{oneData.value.improve}</span>%</div>
                </div>
              </div>
              <div class='Lifestyle_population-content-right column'>
                  <ElProgress class="one" type="circle" width={110} strokeWidth={10} color="#45A0E6" percentage={oneData.value.preferably}>
                    {{
                      default:(arg:{percentage:number}) =>{
                        return <div>
                          <span class="percentage-value" style="color:#45A0E6;">{ arg.percentage }<span>%</span></span>
                          <div  class="one-value" >{oneData.value.value}人</div>
                        </div>
                      }
                    }}
                  </ElProgress>
                <div class='text'><span>{oneData.value.preferably}</span>% 学生生活规律 <span>较好</span></div>
              </div>
            </div>
          </>
        case 'Grade_differences':
          return renderTwo(isOneActive.value)
      }
    }
    return () => {
      return <div class="RuleOfLife-right">
        <div class="RuleOfLife-tab-tag">
          <c-title title="特征分析" /> 
        </div>
        <section class='RuleOfLife-right-content'>
          {
            renderFn(isActive.value)
          }
        </section>
      </div>
    }
  }
})


const RuleOfLife = defineComponent({
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    selectList:{
      type: Object as PropType<RedTabConfig[]>,
      default: () => ([
        {
          value: 'Lifestyle_population',
          label: "生活规律人群"
        },
        {
          value: 'Grade_differences',
          label: "人群差异分析"
        },
      ])
    }
  },
  setup(props, content) {
    provide('params', props.params)
    return () => {
      return <div
        class={{ 'RuleOfLife': true, }}
      >
        <div class={{
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}>
          <LeftView selectList={props.selectList} 
          class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
          <RightView 
          class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
        </div>
      </div>
    }
  }
})

RuleOfLife.Left = LeftView
RuleOfLife.Right = RightView
export default RuleOfLife
