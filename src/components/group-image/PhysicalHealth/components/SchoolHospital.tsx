import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, onUnmounted, toRef, unref, provide, toRefs } from "vue"
import { BaseParams } from "../../types";
import { downloadFile, useChildrenData, usePortraitRequest } from "@/hooks";
import InstanceManager, { getImageUrl } from '@/utils';
import '../index.scss'
import ColorCard from '@/components/common/ColorCard.vue';
import RedTab from '@/components/common/RedTab.vue';
import CustomCard from '@/components/common/CustomCard.vue';
import { ElProgress } from "element-plus";
import { exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import { requestResType, PagesType, searchConfigType } from '@/components/Table-plus/index.d';
import { Column } from "@/components/Table";
import { getOrgType } from "@/api/modules/emphasisList";
import WarningSeal from "@/components/WarningSeal";

const LeftView = defineComponent({
  setup(props, content) {
    const params = inject<BaseParams>('params', {} as any)
    const instanceManager = inject<InstanceManager>('InstanceManager')
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const visible = ref(false)
    const isRed = ref(true)
    const radio = ref('')
    const campusOrgList = ref()
    const response = ref({})
    const LeftChart = ref()
    const LeftData = ref({
      day: {},
      month: {}
    })
    const selectList = reactive([
      {
        value: 0,
        label: "按日"
      },
      {
        value: 1,
        label: "按月"
      },
    ])
    const colorConfig = ref([
      {
        color: '#45A0E6',
        title: '问诊次数',
        value: '',
        isUnit: true,
        icon: getImageUrl('wzcs'),
        unit: '次',
        width: '180px'
      },
      {
        color: '#F39D12',
        title: '问诊人数',
        value: '',
        isUnit: true,
        icon: getImageUrl('wzrs'),
        unit: '人',
        width: '180px'
      },
      {
        color: '#B22924',
        title: '问诊费用',
        value: '',
        isUnit: true,
        icon: getImageUrl('wzfy'),
        unit: '',
        width: '180px'
      },
    ])
    const isClsActive = ref<string | number>(0)
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
        prop: 'diseaseType',
        label: '诊断结果',
        align: 'center'
      },
      {
        prop: 'visitCost',
        label: '费用',
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
    const stuCampus = ref<string | number>('')
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
          type: 'input',
          placeholder: '请输入姓名,学号搜索',
          label: '',
          inputWidth: '160px',
          key: 'name'
        }
      ]
    )
    const initLeftChart = () => {
      const el: HTMLElement = LeftChart.value;
      let myChart = echart?.getInstanceByDom(LeftChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let obj: any = {}
      if (isClsActive.value == 0) {
        obj = LeftData.value.day
      } else {
        obj = LeftData.value.month
      }
      let option = {
        color: ['#45A0E6',],
        title: {
          text: '单位：次',
          top: '1%',
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
          left: '12%',
          top: '1.5%',
          itemWidth: 10,
          itemHeight: 5,
          data: ['问诊次数',]
        },
        grid: {
          top: '10%',
          left: 0,
          right: '3%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: obj.xAxis,
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
            name: '问诊次数',
            barWidth: '20%',
            data: obj.yAxis,
            itemStyle: {
              borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
            },
          },
        ]
      };
      myChart?.setOption(option);
    }
    const redTabChange = (v: string | number) => {
      isClsActive.value = v;
      nextTick(() => {
        initLeftChart();
      })
    }
    const cardClick = (index: number) => {
      if (index == 1) {
        if (radio.value == '') {
          stuCampus.value = ''
        } else {
          campusOrgList.value.forEach((item: { orgName: string; id: number; }) => {
            if (item.orgName == radio.value) {
              stuCampus.value = item.id
            }
          });
        }
        visible.value = true
      }
    }
    const tableRequest = (para: any, pages: PagesType): Promise<requestResType> => {
      const obj = {
        ...params,
        ...para,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: false,
        ident: 'school_hospital'
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
        ident: 'school_hospital'
      })
      downloadFile(res)
    }
    instanceManager?.register('dataSource', response)
    onMounted(async () => {
      const res = await getOrgType({})
      if (res.code == 1) {
        campusOrgList.value = res.data.campusOrgList
      }
    })
    onUnmounted(() => {
      instanceManager?.clear('dataSource')
    })
    const dataSource = usePortraitRequest({ ...toRefs(params!) as any, ident: 'school_hospital', typeName: radio }, radio)
    watch(dataSource, (res) => {
      response.value = res
      if (res.code != 1) {
        LeftData.value = { day: {}, month: {} }
        colorConfig.value[0].value = ''
        colorConfig.value[1].value = ''
        colorConfig.value[2].value = ''
        return
      }
      let { baseCount, baseBar } = res.data
      LeftData.value = baseBar;
      colorConfig.value[0].value = baseCount.numberOrder
      colorConfig.value[1].value = baseCount.personOrder
      colorConfig.value[2].value = baseCount.visitCost
      colorConfig.value[2].unit = baseCount.visitCostUnit
      nextTick(() => {
        initLeftChart();
      })

    }, { immediate: true, deep: true })
    return () => {
      return <div class='school-hospital-left'  {...content.attrs}>
        <section class='left-content'>
          <div class="sb">
            <c-title title="基本信息画像" />
            <el-radio-group v-model={radio.value}>
              <el-radio label="">全校</el-radio>
              <el-radio label="良乡校区">良乡校区</el-radio>
              <el-radio label="望京校区">望京校区</el-radio>
            </el-radio-group>
          </div>
          <div class="card-box flex just-c align-items-c">
            {
              colorConfig.value.map((i, index) => (
                <div onClick={cardClick.bind(null, index)}>
                  <ColorCard class={{ 'mlr40': index == 1, 'cursor': index == 1 }} cardConfig={i} key={i.color} />
                </div>

              ))
            }
          </div>
          <div class="chart-box">
            <RedTab class="small-tab" isRed={isRed.value} btnList={selectList} isActive={isClsActive.value} onRedTabChange={redTabChange} />
            <div class="chart" ref={LeftChart}></div>
          </div>

          <div class='text'>{isClsActive.value==0?'每日':'每月'}校医院问诊次数变化趋势</div>
        </section>
        <c-table-plus key={Date.now()} columns={columns} request={tableRequest} searchConfig={searchConfig} visible={visible.value}
          title="校医院问诊情况" dialogWidth="1460px" height="450px" closed={() => visible.value = false} exportBtn={exportEvt}>
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
      </div>

    }
  }
})


const RightView = defineComponent({
  setup(props, content) {
    const instanceManager = inject<InstanceManager>('InstanceManager')!
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const barConfig = ref(
      [
        {
          color: '#B22924',
          title: '就医频次',
          value: '',
          name: '校医院就医次数主要集中于',

        },
        {
          color: '#005DA7',
          title: '就医费用',
          value: '',
          name: '平均每次就医费用',
          unit: '元'
        }
      ]
    )
    const leftCard = reactive({
      width: '280px',
      height: '80px',
      color: '#005DA7',
      title: '单次最高费用',
      value: '',
      isUnit: true,
      unit: '元',
      describe: ' ',
      fontSize: '22px'
    })
    const rightCard = reactive({
      width: '280px',
      height: '80px',
      color: '#F39702',
      title: '单次最低费用',
      value: '',
      isUnit: true,
      unit: '元',
      describe: ' ',
      fontSize: '22px'
    })
    const RightData = ref<{ [key: string | symbol]: any }>({})
    const LeftPieChart = ref()
    const RightPieChart = ref()
    const cyChart = ref()
    const initLeftPieChart = () => {
      const el: HTMLElement = LeftPieChart.value;
      let myChart = echart?.getInstanceByDom(LeftPieChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let data = RightData.value.frequency && RightData.value.frequency.pie ? RightData.value.frequency.pie : []
      let option = {
        color: ['#E3493E', '#1B528B', '#00C9F2', '#F39702'],
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
              b: {
                // width: 60,
                padding: [0, 0, 0, 10],
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
          data: data.map((item: any) => item.name),
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
            return `{c|${name}} {a|${p}}% {b|${tarValue}人}`;
          }

        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value} 人 (${param.percent}%)`
          }
        },
        series: [
          {
            radius: ['35%', '60%'],
            center: ['15%', '50%'],
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
    const initRightPieChart = () => {
      const el: HTMLElement = RightPieChart.value;
      let myChart = echart?.getInstanceByDom(RightPieChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let data = RightData.value.visitCost && RightData.value.visitCost.pie ? RightData.value.visitCost.pie : []
      let option = {
        color: ['#E3493E', '#1B528B', '#00C9F2', '#F39702'],
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
              b: {
                // width: 60,
                padding: [0, 0, 0, 10],
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
          data: data.map((item: { name: any; }) => item.name),
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
            return `{c|${name}} {a|${p}}% {b|${tarValue}人}`;
          }

        },
        tooltip: {
          formatter: function (param: any) {
            return `${param.marker}${param.name} : ${param.value} 人 (${param.percent}%)`
          }
        },
        series: [
          {
            radius: ['35%', '60%'],
            center: ['15%', '50%'],
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
    const initBottomCy = () => {
      const el: HTMLElement = cyChart.value;
      let myChart = echart?.getInstanceByDom(cyChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let datas = RightData.value.visitBig && RightData.value.frequency.pie ? RightData.value.visitBig.wordCloud : []
      let maxVal = Math.max(...datas.map((item: { value: any; }) => item.value));
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
              return 'rgba(178, 41, 36, ' + opacity + ')';
            }
          },
          data: datas
        }]
      };
      myChart?.setOption(option);
    }

    const dataSource = instanceManager.get('dataSource')
    watch(dataSource, (res) => {
      if (res.code != 1) {
        RightData.value = {}
        return
      }
      RightData.value = res.datas2;
      barConfig.value[0].value = res.datas2.frequency.maxScope
      barConfig.value[1].value = res.datas2.visitCost.average
      leftCard.value = res.datas2.visitCost.max
      rightCard.value = res.datas2.visitCost.min
      nextTick(() => {
        initLeftPieChart();
        initRightPieChart();
        initBottomCy();
      })

    }, { deep: true })

    return () => {
      return <div class="HealthEvaluation-right"  {...content.attrs}>
        <section class='right-content'>
          <c-title title="特征分析" />
          <div class="right-content-box">
            <div class='c-title'>校医院就医</div>
            <div class="sb list-item-box">
              {
                barConfig.value.map(item => {
                  return <><div class="list-item flex-start" style="background: #fff;">
                    <div class="tag" style={{ background: item.color }}>
                      {item.title}
                    </div>
                    <div class="msg-box">
                      {item.name}<span class="bold">{item.value}</span><span>{item.unit ? item.unit : ''}</span>
                    </div>
                  </div>
                  </>
                })
              }

            </div>
            <div class='right-content-box-top sb'>
              <div class="right-content-box-top-left">
                <div class="chart" ref={LeftPieChart}></div>
              </div>
              <div class="right-content-box-top-right">
                <div class="chart" ref={RightPieChart}></div>
              </div>
            </div>
            <div class="sb">
              <CustomCard cardConfig={leftCard} />
              <CustomCard cardConfig={rightCard} />
            </div>
            <div class="list-item flex-start" style="background: #fff;margin:15px 0 20px;">
              <div class="tag" style={{ background: '#F39702' }}>
                重大疾病
              </div>
              <div class="msg-box">
                <span class="bold">{RightData.value.visitBig?.big}</span>人 初诊为重大疾病
              </div>
            </div>
            <div class="sb">
              <div style="width:50%" >
                <div style="height:146px;margin:0 0 15px;" class='column'>
                  <ElProgress class="one" type="circle" width={110} strokeWidth={10} color="#005DA7" percentage={RightData.value.visitBig?.pie}>
                    {{
                      default: (arg: { percentage: number }) => {
                        return <span class="percentage-value" style="color:#005DA7;">{arg.percentage}<span>%</span></span>
                      }
                    }}
                  </ElProgress>
                </div>
                <div class="text">重大疾病率</div>
              </div>
              <div style="width:50%">
                <div class="cyChart" ref={cyChart}></div>
                <div class="text">主要疾病分布</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    }
  }
})


const SchoolHospital = defineComponent({
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    params: {
      type: Object as PropType<BaseParams>,
      default: () => ({})
    },
  },
  setup(props, content) {
    provide('params', props.params)
    return () => {
      return <div
        class={{
          'SchoolHospital': true,
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}
      >
        <LeftView class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
        <RightView class={{
            'w50': props.direction === 'horizontal',
            'w100': props.direction === 'vertical'
          }} />
        <WarningSeal name="校医院" ident='school_hospital'/>
      </div>
    }
  }
})

SchoolHospital.Left = LeftView
SchoolHospital.Right = RightView


export default SchoolHospital


