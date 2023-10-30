import { defineComponent, inject, onMounted, PropType, reactive, ref, nextTick, getCurrentInstance, watch, toRaw, provide, toRefs } from "vue"
import { BaseParams } from "../../types";
import { usePortraitRequest, useChildrenData, downloadFile } from "@/hooks";
import { getImageUrl } from '@/utils';
import '../index.scss'
import { ElLink } from "element-plus";
import { Column } from "@/components/Table";
import { requestResType, PagesType, searchConfigType } from '@/components/Table-plus/index.d'
import { getOrgType } from '@/api/modules/emphasisList'
import { exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import WarningSeal from "@/components/WarningSeal";

const LeftView = defineComponent({
  setup(props, content) {
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
    const params = inject<BaseParams>('params', {} as any)
    const visible = ref(false);
    const xName = ref('');
    const LeftData = ref<{ legendData: Array<any>, xAxisData: Array<any>, series: Array<any>, }>({
      legendData: [],
      xAxisData: [],
      series: []
    })
    const LeftChart = ref()
    const initLeftChart = () => {
      const el: HTMLElement = LeftChart.value;
      let myChart = echart?.getInstanceByDom(LeftChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let arr: any = LeftData.value.series.map((item: { name: any; data: any; type: any; }) => {
        return {
          smooth: true,
          // symbol: 'none',
          symbolSize: 10,
          data: item.data,
          type: item.type,
          name: item.name,
        }
      })
      let option = {
        color: ['#45A0E6', '#F39D12', '#B22924', '#005DA7'],
        title: {
          text: '单位：人',
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
          data: LeftData.value.legendData
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
            data: LeftData.value.xAxisData,
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
        series: arr
      };
      myChart?.setOption(option);
      myChart?.on('click', (param) => {
        visible.value = true
        xName.value = param.name
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
        prop: 'sideStatus',
        label: '测评类型',
        align: 'center'
      },
      {
        prop: 'sideAssess',
        label: '测评结果',
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
    const tableRequest = (para: any, pages: PagesType): Promise<requestResType> => {
      const obj = {
        ...params,
        ...para,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: false,
        titleAndYear: xName.value,
        ident: 'Health_assessment'
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
        titleAndYear: xName.value,
        ident: 'Health_assessment'
      })
      downloadFile(res)
    }
    const dataSource = usePortraitRequest({...toRefs(params!) as any, ident: 'Health_assessment' })
    // const dataSource = useChildrenData(Object.assign(params!, { ident: 'Health_assessment' }))
    watch(dataSource, (res) => {
      if (res.code != 1) {
        LeftData.value = {
          legendData: [],
          xAxisData: [],
          series: []
        }
        return
      }
      let { stackLine } = res.data
      LeftData.value = stackLine;
      nextTick(() => {
        initLeftChart();
      })

    }, { deep: true })
    return () => {
      return <div class='health-evaluation-left' {...content.attrs}>
        <section class='left-content'>
          <c-title title="基本信息画像" />
          <div class="chart" ref={LeftChart}></div>
          <div class='text'>历次体质健康测评结果变化趋势</div>
        </section>
        <c-table-plus columns={columns} request={tableRequest} searchConfig={searchConfig} visible={visible.value}
          title={xName.value} dialogWidth="1460px" height="450px" closed={() => visible.value = false} exportBtn={exportEvt}>
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
    const instance = getCurrentInstance();
    const echart = instance?.proxy?.$echarts;
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
      let data = RightData.value.status && RightData.value.status.pie ? RightData.value.status.pie : []
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
    const initRightPieChart = () => {
      const el: HTMLElement = RightPieChart.value;
      let myChart = echart?.getInstanceByDom(RightPieChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let data = RightData.value.assess && RightData.value.assess.pie ? RightData.value.assess.pie : []
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
    const initBottomCy = () => {
      const el: HTMLElement = cyChart.value;
      let myChart = echart?.getInstanceByDom(cyChart.value)
      if (myChart == undefined) {
        myChart = echart?.init(el);
      }
      let datas = RightData.value.report && RightData.value.report.pie ? RightData.value.report.pie : []
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
              return 'rgba(27, 82, 139, ' + opacity + ')';
            }
          },
          data: datas
        }]
      };
      myChart?.setOption(option);
    }

    const params = inject<BaseParams>('params', {} as any)
    const dataSource = useChildrenData(Object.assign(params!, { ident: 'Health_assessment' }))
    watch(dataSource, (res) => {
      if (res.code != 1) {
        RightData.value = {}
        return
      }
      RightData.value = res.datas2;
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
            <div class='c-title'>体质健康测评结果</div>
            <div class='right-content-box-top sb'>
              <div class="right-content-box-top-left">
                <div class="chart" ref={LeftPieChart}></div>
                <div class='text'>参测率 <span>{RightData.value.status?.rate}</span>%</div>
              </div>
              <div class="right-content-box-top-right">
                <div class="chart" ref={RightPieChart}></div>
                <div class='text'>体测合格率 <span>{RightData.value.assess?.rate}</span>%</div>
              </div>
            </div>
            <div class='c-title mt20'>体质特征</div>
            <div class="cyChart" ref={cyChart}></div>
            <div class="text">
              <span>{RightData.value.report?.value1}</span>人有
              &nbsp;<span>{RightData.value.report?.value2}</span>&nbsp;风险
              &nbsp;<span>{RightData.value.report?.value3}</span>人有
              &nbsp;<span>{RightData.value.report?.value4}</span>&nbsp;风险
            </div>
          </div>
        </section>
      </div>
    }
  }
})


const HealthEvaluation = defineComponent({
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
    usePortraitRequest({ ...toRefs(props.params) as any, ident: 'Health_assessment' })
    return () => {
      return <div
        class={{
          'HealthEvaluation': true,
          'flex': true,
          'horizontal': props.direction === 'horizontal',
          'vertical': props.direction === 'vertical'
        }}
      >
        <LeftView class={{
              'w50': props.direction === 'horizontal',
              'w100': props.direction === 'vertical'
            }}/>
        <RightView class={{
              'w50': props.direction === 'horizontal',
              'w100': props.direction === 'vertical'
            }}/>
        <WarningSeal name="健康测评" ident='Health_assessment'/>
      </div>
    }
  }
})

HealthEvaluation.Left = LeftView
HealthEvaluation.Right = RightView


export default HealthEvaluation


