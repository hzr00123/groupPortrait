import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, onUnmounted, provide, toRefs, defineAsyncComponent } from "vue"
import { BaseParams } from "../../types";
import { downloadFile, usePortraitRequest } from "@/hooks";
import InstanceManager, { getImageUrl } from '@/utils';
import '../index.scss'
import ColorCard from '@/components/common/ColorCard.vue';
import RedTab from '@/components/common/RedTab.vue';
import CustomCard from '@/components/common/CustomCard.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import { ColorCardConf, RedTabConfig } from "@/components/common/Search";
import { Column } from "@/components/Table";
import { requestResType, PagesType, searchConfigType } from '@/components/Table-plus/index.d'
import { getOrgType } from '@/api/modules/emphasisList'
import { exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
// import WarningSeal from "@/components/WarningSeal";

const LeftView = defineComponent({
  props: {
    selectList: {
      type: Array as PropType<RedTabConfig[]>,
      default: () => [
        {
          value: 'Online_behavior_duration',
          label: "上网时长"
        },
        {
          value: 'Online_behavior_traffic',
          label: "上网流量"
        },
      ]
    }
  },
  setup(props, content) {
    const instanceManager = inject<InstanceManager>('InstanceManager', new InstanceManager())
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const params = inject<BaseParams>('params', {} as any)
    const response = ref({})
    const LeftChart = ref()
    const LeftData = reactive<{ series: Array<any>, xAxis: Array<any> }>({
      series: [],
      xAxis: []
    })
    const selectList = reactive(props.selectList)
    const colorConfig = ref<Array<ColorCardConf>>([
      {
        color: '#4D5FC1',
        title: '上网总时长',
        value: '',
        isUnit: true,
        icon: getImageUrl('swzsc'),
        unit: '万天',
        width: '180px'
      },
      {
        color: '#45A0E6',
        title: '月均时长',
        value: '',
        isUnit: true,
        icon: getImageUrl('yjsc'),
        unit: '天',
        width: '180px'
      },
    ])
    const isClsActive = ref<string>(props.selectList[0].value as string)
    const visible = ref(false)
    const columns = ref<Column>([
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
        prop: 'time',
        label: '上网时长',
        align: 'center',
        sortable:true,
      },
      {
        prop: 'avg',
        label: '月均时长',
        align: 'center',
        sortable:true,
      },
      {
        slot: 'action',
        label: '操作',
        fixed: 'right',
        align: 'center'
      }
    ])
    const paramsObj = {
      campusId: 'stuCampusId',
      collegeId: 'stuCollegeId',
      majorId: 'stuMajorId',
      gradeId: 'stuGradeId',
      classId: 'stuClassId'
    }
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
        type: 'input',
        placeholder: '请输入姓名,学号搜索',
        label: '',
        inputWidth: '160px',
        key: 'name'
      }
    ]
    const tableSort = ref(1)
    const sortClick = (obj:any)=>{
      if(obj.prop == 'time'||obj.prop == 'flow_rate'){
        tableSort.value = obj.order == 'des' ? 2 : 1
      }
      if(obj.prop == 'avg'){
        tableSort.value = obj.order == 'des' ? 4 : 3
      }
    }
    const tableRequest = (para: any, pages: PagesType): Promise<requestResType> => {
      const obj = {
        ...params,
        ...para,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: false,
        ident: isClsActive.value,
        sort:tableSort.value,
      }
      delete obj.typeName
      return getChartDataDetail(obj)
    }

    const exportEvt = async (form: any, pages: PagesType) => {
      const res = await exportGetChartDataDetail({
        ...params,
        ...form,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: true,
        ident: isClsActive.value,
        sort:tableSort.value,
      })
      downloadFile(res)
    }
    const redTabChange = (v: string) => {
      isClsActive.value = v
    }
    const initLeftChart = () => {
      const el: HTMLElement = LeftChart.value;
      let myChart = echart?.getInstanceByDom(LeftChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let option: any = {
        title: {
          text: '单位: 人次',
          top: '5%',
          left: 0,
          textStyle: {
            color: '#333333',
            fontSize: 14,
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params:any) {
            if(isClsActive.value == 'Online_behavior_traffic'){
              return `${params[0].name}<br/>
              ${params[0].marker}上网流量:  ${params[0].value} G`;
            }else{
              return `${params[0].marker}${params[0].name}:  ${params[0].value} 人次`;
            }
          },
        },
        grid: {
          top: '20%',
          left: 0,
          right: '4%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: LeftData.xAxis,
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              // rotate: 0, //代表逆时针旋转
              interval: 'auto',
              // formatter: function (value: string) {
              //   if (value.length > 6) {
              //     return `${value.slice(0, 6)}...`;
              //   }
              //   return value
              // }
            },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: { show: false },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            }
          },
        ],
        series: [
          {
            // name: '',
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {
              color: '#1B528B',
            },
            areaStyle: {
              opacity: 0.8,
              color: new echart!.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#cfdae6'
                },
                {
                  offset: 1,
                  color: '#fff'
                }
              ])
            },
            data: LeftData.series,
          },
        ]
      };
      if (isClsActive.value == 'Online_behavior_traffic') {
        option.title.text = '单位: G';
        option.series = [
          {
            type: 'bar',
            barWidth: '20%',
            data: LeftData.series,
            itemStyle: {
              color: '#F39702',
              borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
            },
          },
        ];
      }
      myChart?.setOption(option);
    }
    onMounted(() => {
      instanceManager?.register('dataSource', response)
      instanceManager?.register('isClsActive', isClsActive)
    })
    onUnmounted(() => {
      instanceManager?.clear('dataSource')
      instanceManager?.clear('isClsActive')
    })
    const dataSource = usePortraitRequest({...toRefs(params!) as any, ident: isClsActive }, isClsActive)
    const WarningSealName = (val: string) => {
      let str = ''
      selectList.forEach((item) => {
        if (val == item.value) {
          str = item.label
        }
      })
      return str
    }
    const cardClick = (index:number)=>{
      if(index===0){
        visible.value = true;
      }
    }
    watch(isClsActive, (val) => {
      tableSort.value = 1
      if (val == 'Online_behavior_duration') {
        colorConfig.value[0].color = '#4D5FC1'
        colorConfig.value[0].title = '上网总时长'
        colorConfig.value[0].icon = getImageUrl('swzsc')
        colorConfig.value[0].unit = '万天'
        colorConfig.value[0].value = ''
        colorConfig.value[1].color = '#45A0E6'
        colorConfig.value[1].title = '月均时长'
        colorConfig.value[1].icon = getImageUrl('yjsc')
        colorConfig.value[1].unit = '天'
        colorConfig.value[1].value = ''
        columns.value[9].label = '上网时长'
        columns.value[9].prop = 'time'
        columns.value[10].label = '月均时长'
      }
      if(val == 'Online_behavior_traffic'){
        colorConfig.value[0].color = '#005DA7'
        colorConfig.value[0].title = '上网总流量'
        colorConfig.value[0].icon = getImageUrl('swzll')
        colorConfig.value[0].unit = '万G'
        colorConfig.value[0].value = ''
        colorConfig.value[1].color = '#00C9F2'
        colorConfig.value[1].title = '月均流量'
        colorConfig.value[1].icon = getImageUrl('yjll')
        colorConfig.value[1].unit = 'G'
        colorConfig.value[1].value = ''
        columns.value[9].label = '上网流量'
        columns.value[9].prop = 'flow_rate'
        columns.value[10].label = '月均流量'
      }
    }, {immediate: true, deep: true})
    watch(dataSource, (res) => {
      response.value = res
      if (res.code != 1) {
        colorConfig.value[0].value = ''
        colorConfig.value[1].value = ''
        LeftData.series = []
        LeftData.xAxis = []
        return
      }
      let { chart, avg, total } = res.data
      colorConfig.value[0].value = total
      colorConfig.value[1].value = avg
      LeftData.series = chart.series
      LeftData.xAxis = chart.xAxis
      nextTick(() => {
        initLeftChart();
      })

    }, { immediate: true, deep: true })
    const WarningSeal = defineAsyncComponent({
        loader: () => import('@/components/WarningSeal'),
        delay: 1000
    })
    return () => {
      return <div class='duration-flow-rate-left'  {...content.attrs}>
          <section class='left-content'>
            <div class='sb'>
              <c-title title="基本信息画像" />
              <RedTab btnList={selectList} isActive={isClsActive.value} onRedTabChange={redTabChange} />
            </div>
            <div class="card-box flex just-c align-items-c">
              {
                colorConfig.value.map((i, index) => (
                  <div onClick={cardClick.bind(null, index)}>
                    <ColorCard class={{ 'mr50': index == 0,'cursor': index == 0}} cardConfig={i} key={i.color} />
                  </div>
                ))
              }
            </div>
            <div class="chart" ref={LeftChart}></div>
            <div class='text'>{isClsActive.value == 'Online_behavior_duration' ? '每日上网时段分布' : '每日上网流量分布'}</div>
          </section>
          <c-table-plus onSortClick={sortClick} columns={columns.value} request={tableRequest} searchConfig={searchConfig} visible={visible.value}
            title={isClsActive.value == 'Online_behavior_duration' ? '个人上网时长' : '个人上网流量' } dialogWidth="1460px" height="450px" closed={() => visible.value = false} exportBtn={exportEvt}>
            {{
              index: (arg: any) => {
                const { data } = arg
                return <div>{data.$index + 1}</div>
              },
              action: (arg: any) => {
                const { data } = arg
                return <el-button style="color:#005DA7" link>学生个像</el-button>
              }
            }}
          </c-table-plus>
          <WarningSeal name={WarningSealName(isClsActive.value)} ident={isClsActive.value} />
        </div>
    }
  }
})

const RightView = defineComponent({
  setup(props, content) {
    const instance = getCurrentInstance();
    const instanceManager = inject<InstanceManager>('InstanceManager')!
    const echart = instance?.proxy?.$echarts;
    const RightPieChart = ref()
    const RightLineChart = ref()
    const RightData = ref<{ pie: Array<any>, [key: string | symbol]: any }>({
      pie: [],
    })
    const RightData2 = ref<{ [key: string | symbol]: any }>({})
    const topCard = reactive({
      width: '280px',
      height: '80px',
      color: '#1B528B',
      title: '最早上网时间',
      value: '',
      isUnit: false,
      describe: '',
      fontSize: '22px'
    })
    const bottomCard = reactive({
      width: '280px',
      height: '80px',
      color: '#F39702',
      title: '最晚上网时间',
      value: '',
      isUnit: false,
      describe: '',
      fontSize: '22px'
    })
    const barOption = reactive({
      list: [],
      color: '#005DA7',
      lableWidth: 60,
      valueWidth: 50,
      lableAlign: 'left',
      valuePosition: 'right',
      unit: 'G',
      needTag: true,
      height: '210px'
    })
    const initRightPieChart = () => {
      const el: HTMLElement = RightPieChart.value;
      let myChart = echart?.getInstanceByDom(RightPieChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let data = RightData.value.pie
      let option = {
        color: ['#E3493E', '#1B528B', '#00C9F2',],
        title: {
          text: '日平均上网时长分布',
          bottom: '13%',
          left: '5%',
          textStyle: {
            color: '#203449',
            fontSize: 14,
          }
        },
        legend: {
          type: "scroll",
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
                // width: 60,
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
          itemGap: 10,
          icon: "rect",
          pageIconColor: '#FF9500', //图例分页左右箭头图标颜色
          pageIconSize: 12,  //当然就是按钮的大小
          pageIconInactiveColor: '#7f7f7f',  // 禁用的按钮颜色
          tooltip: {
            show: true
          },
          data: data.map((item) => item.name),
          formatter: (name: string) => {
            let total = 0;
            let tarValue: number = 0; // 为 tarValue 赋一个默认值
            for (let i = 0; i < data.length; i++) {
              total += data[i].value;
              if (name === data[i].name) {
                tarValue = data[i].value;
              }
            }
            const p = tarValue != 0 ? ((tarValue / total) * 100).toFixed(2) : 0;
            return `{c|${name}} {a| ${p}}%`;
          }

        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value}  (${param.percent}%)`
          }
        },
        series: [
          {
            radius: ['35%', '50%'],
            center: ['25%', '50%'],
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
              borderWidth: 2,

            },
            data: data
          },
        ]
      }
      myChart?.setOption(option);
    }
    const initRightLineChart = () => {
      const el: HTMLElement = RightLineChart.value;
      let myChart = echart?.getInstanceByDom(RightLineChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let option = {
        color: ['#B22924'],
        title: {
          text: '单位: G',
          top: '5%',
          left: 0,
          textStyle: {
            color: '#333333',
            fontSize: 14,
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: '20%',
          left: 0,
          right: 0,
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: RightData2.value.chart && RightData2.value.chart.xAxis ? RightData2.value.chart.xAxis : [],
            axisTick: { //刻度
              alignWithLabel: true,
              show: false,
            },
            triggerEvent: true,
            axisLabel: {
              // rotate: 0, //代表逆时针旋转
              interval: 'auto',
              formatter: function (value: string) {
                if (value.length > 6) {
                  return `${value.slice(0, 6)}...`;
                }
                return value
              }
            },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: { show: false },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            }
          },
        ],
        series: [
          {
            // name: '',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: RightData2.value.chart && RightData2.value.chart.series ? RightData2.value.chart.series : [],
          },
        ]
      };
      myChart?.setOption(option);
    }
    const isClsActive = instanceManager.get('isClsActive')
    const dataSource = instanceManager.get('dataSource')
    watch(dataSource, (res) => {
      if (res.code != 1) {
        if (isClsActive.value == 'Online_behavior_duration') {
          topCard.describe = ''
          topCard.value = ''
          bottomCard.describe = ''
          bottomCard.value = ''
          RightData.value = { pie: [] }
          nextTick(() => {
            initRightPieChart();
          })
        } else {
          RightData2.value = {}
          barOption.list = []
          nextTick(() => {
            initRightLineChart();
          })
        }
        return
      }
      if (isClsActive.value == 'Online_behavior_duration') {
        const { first, last } = res.datas2
        const firstTime = first ? first.split(' ') : []
        const lastTime = last ? last.split(' ') : []
        topCard.describe = firstTime.length > 0 ? firstTime[0] : ''
        topCard.value = firstTime.length > 0 ? firstTime[1] : ''
        bottomCard.describe = lastTime.length > 0 ? lastTime[0] : ''
        bottomCard.value = lastTime.length > 0 ? lastTime[1] : ''
        RightData.value = res.datas2
        nextTick(() => {
          initRightPieChart();
        })
      } else {
        RightData2.value = res.datas2;
        barOption.list = res.datas2.flowRateTop5;
        nextTick(() => {
          initRightLineChart();
        })
      }
    }, { deep: true })

    return () => {
      return <div class="right" {...content.attrs}>
          <section class='right-content'>
            <c-title title="上网时长流量特征分析" />
            <div class="right-content-box">
              {
                isClsActive.value == 'Online_behavior_duration' ?
                  <div class="right-content-one sb">
                    <div class="content-one-left">
                      <div class='c-title'>上网时段分析</div>
                      <CustomCard class='top' cardConfig={topCard} />
                      <CustomCard class='center' cardConfig={bottomCard} />
                      <div class="text">
                        学生上网时段主要集中在 <span>{RightData.value.concentrated}</span>
                      </div>
                    </div>
                    <div class="content-one-right">
                      <div class='c-title'>上网时长分析</div>
                      <div class="chart" ref={RightPieChart}></div>
                      <div class="text">学生日平均上网时长 <span>{RightData.value.avg}</span>h,&nbsp;<span>{RightData.value.max?.rate}</span>%&nbsp;学生每日上网 <span>{RightData.value.max?.name}</span></div>
                    </div>
                  </div> :
                  <div class="right-content-two sb">
                    <div class="content-two-left">
                      <div class='c-title'>上网流量值分析</div>
                      <div class="chart" ref={RightLineChart}></div>
                      <div class='text'>大部分上网流量峰值 <span>{RightData2.value.max?.time}</span></div>
                    </div>
                    <div class="content-two-right">
                      <div class='c-title'>上网流量应用分布</div>
                      <ProgressBar class='progress' option={barOption} />
                      <div class='text'>应用Top5 <span>{RightData2.value.top}</span></div>
                    </div>
                  </div>
              }
            </div>
          </section>
        </div>
    }
  }
})


const DurationFlowRate = defineComponent({
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
    selectList: {
      type: Array as PropType<any[]>,
    }
  },
  setup(props, content) {
    provide('params', props.params)
    return () => {
      return <div
        class={{
          'DurationFlowRate': true,
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}
      >
        <LeftView
          class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }}
          selectList={props.selectList}
        />
        <RightView
          class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }}
        />
      </div>
    }
  }
})

DurationFlowRate.Left = LeftView
DurationFlowRate.Right = RightView


export default DurationFlowRate


