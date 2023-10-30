import { defineComponent, getCurrentInstance, ref, reactive, onUnmounted, watch, nextTick, PropType, inject, toRefs, computed } from "vue"
import InstanceManager from '@/utils/index'
import RedTab from "@/components/common/RedTab.vue";
import BarMultiSegment from '@/components/common/BarMultiSegment.vue';
import ChinaMap from "@/components/common/ChinaMap.vue"
import { MultiSegmentConf } from "@/components/common/Search";
import { BaseParams } from '../../../../types'
import { exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import { downloadFile, usePortraitRequest } from "@/hooks";
import { Column } from "@/components/Table";
import { searchConfigType, requestResType, PagesType } from "@/components/Table-plus/index.d";
import { getOrgType } from "@/api/modules/emphasisList";
import "../../../index.scss"
import { ElLink } from "element-plus";
import WarningSeal from "@/components/WarningSeal";


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

const DestinationAfterGraduation = defineComponent({

})


const LeftView = defineComponent({
    props: {
      params: {
        type: Object as PropType<BaseParams>,
        default: () => ({})
      },
      isActive: {
        type: String,
        default: 'Destinative_distribution'
      }
    },
    setup(props, content) {
        const instance = getCurrentInstance();
        const instanceManager = inject<InstanceManager>('InstanceManager')
        const echart = instance?.proxy?.$echarts;
        const selectList = reactive([
            {
                value: 'Destinative_distribution',
                label: "去向分布"
            },
            {
                value: 'Employment_region',
                label: "就业地域"
            },
            {
                value: 'Employment_industry',
                label: "就业行业"
            },
            {
                value: 'Employment_unit',
                label: "就业单位"
            },
            {
                value: 'Employment_salary',
                label: "就业薪资"
            }
        ])

        const isActive = ref<string>(props.isActive)
        const clickCls = (name: string) => {
            isActive.value = name;
        }

        const clsList = reactive([
            {
                value: "按学院",
                label: "按学院"
              },
              {
                value: "按专业",
                label: "按专业"
              }
        ])

        const MapDatas = ref<any>([])

        const industryList = ref([])

        const totalNum = ref<number>(0)

        const areaInfo = reactive<{category: string, economize: string}>({
          category: '',
          economize: ''
        })

        const employmentUnitNature = ref([])
        const employmentUnitScale = ref([])
        const salaryList = ref([])
        const response = ref({})
        const title = ref('')
        const isClsActive = ref<string | number>('按学院');
        const redTabChange = (index: string) => {
            isClsActive.value = index;
        }

        const MajorOption = reactive<MultiSegmentConf>({
            list: [],
            colorList:[
              {
                color: "#F39D12",
                label: "升学"
              },
              {
                color: "#B22924",
                label: "创业"
              },
              {
                color: "#8C6C4E",
                label: "就业"
              },
              {
                color: "#00C9F2",
                label: "待业"
              },
              {
                color: "#005DA7",
                label: "其他"
              }
            ],
            unit:'人',
            lableAlign:'right',
            lableWidth:'138px'
        })

        let columns: Column = [
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
            slot: 'action',
            label: '操作',
            fixed: 'right',
            align: 'center'
          }
        ]

        const handleMapClick = (value: any) => {
          title.value = '就业地域'
          areaInfo.category = value === 'all' ? value: 'part';
          areaInfo.economize = value === 'all' ? null : value.name;
          columns.splice(columns.length - 1, 0, {
            prop: 'employmentRegion',
            label: '就业地域',
            align: 'center'
          })
          visible.value = true
        }

        const exportEvt = async(form: any, pages: PagesType) => {
          let data = {
            ...form,
            pageNum: pages.current,
            pageSize: pages.size,
            ident: isActive.value,
            startTime: props.params.startTime,
            endTime: props.params.endTime,
            expExcel: true
          }
          if(isActive.value === 'Destinative_distribution') {
            data.category = isClsActive.value
          }
          if(isActive.value === 'Employment_region') {
            data.category = areaInfo.category
            data.economize = areaInfo.economize
          }

          const res = await exportGetChartDataDetail(data)
          downloadFile(res)
        }

        const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
          let data = {
            ...props.params,
            ...params,
            pageNum: pages.current,
            pageSize: pages.size,
            ident: isActive.value,
            startTime: props.params.startTime,
            endTime: props.params.endTime
          }
          if(isActive.value === 'Destinative_distribution') {
            data.category = isClsActive.value
          }
          if(isActive.value === 'Employment_region') {
            data.category = areaInfo.category
            data.economize = areaInfo.economize
          }
          return getChartDataDetail(data)
        }

        const initIndustryCharts = () => {
          const el: HTMLElement = instance?.refs.industryCharts as any;
          let myChart = echart?.getInstanceByDom(el)
          if (myChart == null) {
              myChart = echart?.init(el);
          }
          let data: any[] = industryList.value
          let option = {
            title: {
              show: true,
              text: `${totalNum.value}人`,
              left: '37%',
              y: 'center'
            },
            color:['#005DA7','#00C9F2','#8C6C4E','#F39702','#E3493E','#231815','#4D5FC1','#45A0E6',],
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
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  b: {
                    width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  c: {
                    width: 100,
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
                const p = ((tarValue / total) * 100).toFixed(2);
                return `{c|${name}} {b|${tarValue} 人} {a| ${p}} %`;
            }
    
            },
            tooltip: {
              formatter: '{b} : {c}人  ({d}%)'
            },
            series: [
              {
                z: 2,
                // radius: ['35%', '50%'],
                radius: ['48%', '40%'],
                center: ['40%', '50%'],
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
          myChart?.off('click');
          myChart?.on('click', (params) => {
            columns.splice(columns.length - 1, 0, {
              prop: 'employmentIndustry',
              label: '就业行业',
              align: 'center'
            })
            title.value = '就业行业'
            visible.value = true
          })
        }

        const initNatureDistributionCharts = () => {
          const el: HTMLElement = instance?.refs.natureDistribution as any;
          let myChart = echart?.getInstanceByDom(el)
          if (myChart == null) {
              myChart = echart?.init(el);
          }
          let data: any[] = employmentUnitNature.value
          let option = {
            title: {
              show: true,
              text: '就业单位性质分布',
              x: 'center',
              left: '20%',
              y: 'bottom',
              textStyle: {
                fontSize: 16,
                fontWeight: 500,
                fontFamily: 'Regular',
                color: '#203449'
              }
            },
            color:['#005DA7','#00C9F2','#8C6C4E','#F39702','#E3493E','#231815','#4D5FC1','#45A0E6',],
            legend: {
              type: "scroll",
              orient: 'vertical',
              top: 'middle',
              right: '10%',
              bottom: '0%',
              textStyle: {
                color: "#3E5463",
                fontSize: 14,
                backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                rich: {
                  a: {
                    // width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  b: {
                    width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  c: {
                    width: 80,
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
                const p = ((tarValue / total) * 100).toFixed(2);
                return `{c|${name}} {b|${tarValue} 人} {a| ${p}} %`;
            }
    
            },
            tooltip: {
              formatter: '{b} : {c}人  ({d}%)'
            },
            series: [
              {
                z: 2,
                // radius: ['35%', '50%'],
                radius: ['50%', '60%'],
                center: ['30%', '50%'],
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
          myChart?.off('click');
          myChart?.on('click', (params) => {
            title.value = '就业单位'
            columns.splice(columns.length - 1, 0, {
              prop: 'employmentUnit',
              label: '单位名称',
              align: 'center'
            },)
            columns.splice(columns.length - 1, 0, {
              prop: 'employmentUnitNature',
              label: '单位性质',
              align: 'center'
            },)
            columns.splice(columns.length - 1, 0, {
              prop: 'employmentUnitScale',
              label: '单位规模',
              align: 'center'
            })
            visible.value = true
          })
        }

        const initScaleDistributionCharts = () => {
          const el: HTMLElement = instance?.refs.scaleDistribution as any;
          let myChart = echart?.getInstanceByDom(el)
          if (myChart == null) {
              myChart = echart?.init(el);
          }
          let data: any[] = employmentUnitScale.value
          let option = {
            title: {
              show: true,
              text: '就业单位规模分布',
              x: 'center',
              left: '20%',
              y: 'bottom',
              textStyle: {
                fontSize: 16,
                fontWeight: 500,
                fontFamily: 'Regular',
                color: '#203449'
              }
            },
            color:['#005DA7','#00C9F2','#8C6C4E','#F39702','#E3493E','#231815','#4D5FC1','#45A0E6',],
            legend: {
              type: "scroll",
              orient: 'vertical',
              top: 'middle',
              right: '10%',
              bottom: '0%',
              textStyle: {
                color: "#3E5463",
                fontSize: 14,
                backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
                rich: {
                  a: {
                    // width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  b: {
                    width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  c: {
                    width: 80,
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
                const p = ((tarValue / total) * 100).toFixed(2);
                return `{c|${name}} {b|${tarValue} 人} {a| ${p}} %`;
            }
    
            },
            tooltip: {
              formatter: '{b} : {c}人  ({d}%)'
            },
            series: [
              {
                z: 2,
                // radius: ['35%', '50%'],
                radius: ['50%', '60%'],
                center: ['30%', '50%'],
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
          myChart?.off('click');
          myChart?.on('click', (params) => {
            title.value = '就业单位'
            columns.splice(columns.length - 1, 0, {
              prop: 'employmentUnit',
              label: '单位名称',
              align: 'center'
            },)
            columns.splice(columns.length - 1, 0, {
              prop: 'employmentUnitNature',
              label: '单位性质',
              align: 'center'
            },)
            columns.splice(columns.length - 1, 0, {
              prop: 'employmentUnitScale',
              label: '单位规模',
              align: 'center'
            },)
            visible.value = true
          })
        }

        const initSalaryCharts = () => {
          const el: HTMLElement = instance?.refs.salaryCharts as any;
          let myChart = echart?.getInstanceByDom(el)
          if (myChart == null) {
              myChart = echart?.init(el);
          }
          let data: any[] = salaryList.value
          let option = {
            // title: {
            //   show: true,
            //   text: '5000人',
            //   left: '35%',
            //   y: 'center'
            // },
            color:['#005DA7','#00C9F2','#8C6C4E','#F39702','#E3493E','#231815','#4D5FC1','#45A0E6',],
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
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  b: {
                    width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  c: {
                    width: 100,
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
                const p = ((tarValue / total) * 100).toFixed(2);
                return `{c|${name}} {b|${tarValue} 人} {a| ${p}} %`;
            }
    
            },
            tooltip: {
              formatter: '{b} : {c}人  ({d}%)'
            },
            series: [
              {
                z: 2,
                // radius: ['35%', '50%'],
                radius: ['48%', '40%'],
                center: ['40%', '50%'],
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
          myChart?.off('click');
          myChart?.on('click', (params) => {
            title.value = '就业薪资'
            columns.splice(columns.length - 1, 0, {
              prop: 'employmentUnit',
              label: '单位名称',
              align: 'center'
            },)
            columns.splice(columns.length - 1, 0, {
              prop: 'type',
              label: '薪资',
              align: 'center'
            },)
            visible.value = true
          })
        }

        const closed = () => {
          visible.value = false
          columns = [
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
              slot: 'action',
              label: '操作',
              fixed: 'right',
              align: 'center'
            }
          ]
        }

        const visible = ref<boolean>(false)
        instanceManager?.register('DisActive', isActive);
        instanceManager?.register('DdataSource', response);
        onUnmounted(()=>{
            instanceManager?.clear('DisActive')
            instanceManager?.clear('DdataSource')
        })

        const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: isActive, category: isActive.value === 'Destinative_distribution' ? isClsActive : '' }, [isClsActive, isActive])

        watch(dataSource, (res) => {
          response.value = res.datas2
          try {
            if(isActive.value === 'Destinative_distribution') {
              MajorOption.list = res.data.value.map((item:any) => {
                item.arr.map((it: any, ix: number) => {
                  item.arr[ix].percentage = it.percentage.split('%')[0]
                })
                return item
              });
              console.log(MajorOption.list);
              
            } else if(isActive.value ===  'Employment_region') {
              MapDatas.value = res.data.data
            } else if(isActive.value === 'Employment_industry') {
              totalNum.value = 0
              industryList.value = res.data.value.map((it: any) => {
                totalNum.value += it.count
                return {
                  name: it.employment_industry,
                  value: it.count
                }
              });
              initIndustryCharts();
            } else if(isActive.value === 'Employment_unit') {
              employmentUnitNature.value = res.data.employmentUnitNature.map((it: any) => {
                return {
                  name: it.employmentUnitNature,
                  value: it.count
                }
              });
              employmentUnitScale.value = res.data.employmentUnitScale.map((it: any) => {
                return {
                  name: it.employmentUnitScale,
                  value: it.count
                }
              });
              initNatureDistributionCharts()
              initScaleDistributionCharts()
            } else {
              salaryList.value = res.data.value.map((it: any) => {
                return {
                  name: it.type,
                  value: it.count
                }
              })
              initSalaryCharts()
            }
          } catch (error) {
            console.log(error);
          }
        })

        const activeLable = computed(()=> selectList.find(i => i.value === isActive.value)!.label)
        return () => {
          return <div class="destination-after-graduation-left" key={isActive.value} {...content.attrs}>
              <WarningSeal name={activeLable.value} ident={isActive.value}/>
              { !content.attrs.view && 
                <RedTab class="mg-b20" 
                btnList={ selectList } 
                isActive={ isActive.value } 
                bgColor="#B22924" 
                onRedTabChange={ clickCls } />
              }

              {
                isActive.value === 'Destinative_distribution' &&
                <>
                  <div class="filtration-btn mg-b15">
                      <div class="legend-btn">
                          {
                              MajorOption.colorList.map((it: any) => {
                                  return (
                                      <span class="item-btn" style={{'--legendColor': it.color }}>{ it.label }</span>
                                  )
                              })
                          }
                      </div>
                      <RedTab btnList={ clsList } isActive={ isClsActive.value } isRed={true} onRedTabChange={redTabChange} />
                  </div>
                  
                  <BarMultiSegment options={MajorOption} />
                </>
              }

              {
                isActive.value === 'Employment_region' &&
                <>
                  <div class="operation-btn mg-b15">
                    <el-button size="default" onClick={ () => handleMapClick('all') }>查看详情</el-button>
                  </div>
                  <ChinaMap onHandleMapClick={ handleMapClick } datas={ MapDatas.value } style="height: 350px"/>

                </>
              }

              {
                isActive.value === 'Employment_industry' &&
                <div class="industry-charts" ref="industryCharts"></div>
              }

              {
                isActive.value === 'Employment_unit' && 
                <>
                  <div class="employment-charts" ref="natureDistribution"></div>
                  <div class="employment-charts" ref="scaleDistribution"></div>
                </>
              }

              {
                isActive.value === 'Employment_salary' &&
                <div class="salary-charts" ref="salaryCharts"></div>
              }

                <c-table-plus title={title.value} 
                dialogWidth="1460px" 
                height="350px"
                visible={ visible.value }
                searchConfig={ searchConfig }
                columns={ columns }
                request={ tableRequest }
                exportBtn={ exportEvt }
                closed={ closed }
                v-slots={{
                  index:(arg:any) =>{
                    const {data} = arg
                    return <div>{ data.$index + 1 }</div>
                  },
                  action:(arg:any) =>{
                    const {data} = arg
                    return <el-button style="color:#005DA7" link>学生个像</el-button>
                  }
                }} 
                />
          </div>
        }
    }
    
})

const RightView = defineComponent({
    props: {
      params: {
        type: Object as PropType<BaseParams>,
        default: () => ({})
      }
    },
    setup(props, content) {
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts;
        const instanceManager = inject<InstanceManager>('InstanceManager')!
        const isActive = instanceManager.get('DisActive');
        const dataSource = instanceManager.get('DdataSource');
        const largeClassificationProportion = ref<any[]>([])
        const occupationTypeProportion = ref<any[]>([])
        const totalCount = ref(0)
        const branchBar = ref([])

        const boyData = ref<any>({})
        const girlData = ref<any>({})
        const employmentIndustryInfoList = ref([])
        const difference = ref<any[]>([])
        const employmentUnitTop = ref([])
        const topFiveHundredTop = ref([])
        const boyAndGirlEmploymentUnitNature = ref([])
        const boyAndGirlEmploymentUnitScale = ref([])
        const industryProportion = ref<string>('')
        const maxAnnualSalary = ref<any>({})
        const minAnnualSalary = ref<any>({})
        const majorAnnualSalaryDistribution = ref<any>({})
        const employmentIndustrySalary = ref([])
        const majorAverageSalary = ref([])
        const maxCareerSelection = reactive<{manValue: string, womanValue: string}>({
          manValue: '',
          womanValue: ''
        })

        const mainGraduationDestination = reactive<{title: string, subTitle: string, value: string | number}>({
          title: '',
          subTitle: '',
          value: ''
        })

        const visible = ref<boolean>(false);

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
            prop: 'type',
            label: '毕业去向',
            align: 'center'
          },
          {
            slot: 'action',
            label: '操作',
            fixed: 'right',
            align: 'center'
          }
        ]
        const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
          return getChartDataDetail({
            ...props.params,
            ...params,
            pageNum: pages.current,
            pageSize: pages.size,
            ident: isActive.value,
            startTime: props.params.startTime,
            endTime: props.params.endTime
          })
        }

        const exportEvt = async(form: any, pages: PagesType) => {
          const res = await exportGetChartDataDetail({
            ...form,
            pageNum: pages.current,
            pageSize: pages.size,
            ident: isActive.value,
            startTime: props.params.startTime,
            endTime: props.params.endTime,
            expExcel: true
          })
          downloadFile(res)
        }

        const initTypeBranchCharts = () => {
          const el: HTMLElement = instance?.refs.typeBranchCharts as any;
          let myChart = echart?.getInstanceByDom(el);
          if (myChart == null) {
            myChart = echart?.init(el);
          }
          let data: any[] = occupationTypeProportion.value;
          let data1: any[] = largeClassificationProportion.value;
          
          let option = {
            title: {
              text: `${totalCount.value}人`,
              // x: 'left',
              y: 'center',
              left: '25%',
              // top: '50%',
              textStyle: {
                fontSize: 18,
                fontFamily: 'Bold',
                color: '#203449'
              },
            },
            tooltip: {
              trigger: 'item',
              formatter: '{b}: {c}人 ({d}%)'
            },
            legend: {
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
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  b: {
                    width: 60,
                    padding: [0, 0, 0, 0],
                    color:'#3E5463',
                    fontWeight:'bold'
                  },
                  c: {
                    width: 80,
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
                  data: data.map((it: any) => it.name),
                  formatter: (name: string) => {
                    let total = 0;
                    let tarValue: number = 0; // 为 tarValue 赋一个默认值
                    for (let i = 0; i < data.length; i++) {
                        total += data[i].value;
                        if (name === data[i].name) {
                            tarValue = data[i].value;
                        }
                    }
                    const p = ((tarValue / total) * 100).toFixed(2);
                    // if(name == '就业') employmentRate.value = p;
                    return `{c|${name}} {b|${tarValue} 人} {a| ${p}} %`;
                }
            },
            series: [
              {
                color: ['#E3493E', '#005DA7', '#F39702'],
                name: 'Access From',
                type: 'pie',
                radius: ['40%', '60%'],
                center: ['30%', '50%'],
                label: {
                  position: 'inner',
                  rotate: 50,
                  fontSize: 12,
                  color: '#FFF'
                },
                labelLine: {
                  show: false
                },
                data: data1
              },
              {
                name: 'Access From',
                color: ['#E76B63', '#EDA09A', '#F2D4D1', '#F4BD63', '#F4D095', '#498ABE', '#7BAACF', '#C5D8E6'],
                type: 'pie',
                radius: ['75%', '90%'],
                center: ['30%', '50%'],
                labelLine: {
                  show: false
                },
                label: {
                  show: false
                },
                data: data
              }
            ]
          };

          myChart?.setOption(option);
          myChart?.off('click');
          myChart?.on('click', (params) => {
            visible.value = true
          })
        }
        
        const initManPieCharts = () => {
          const el: HTMLElement = instance?.refs.manPieCharts as any;
          let myChart = echart?.getInstanceByDom(el);
          if (myChart == null) {
            myChart = echart?.init(el);
          }
          let data = [
            {
                name: '一致',
                value: boyData.value.consistent,
            },
            {
                name: '不一致',
                value: boyData.value.inconsistent
            }
          ]
          let option = {
              title: {
                text: '男',
                x:'center',
                y: 'center',
                textStyle: {
                  fontFamily: 'Regular',
                  fontSize: 18,
                  fontWeight: '400',
                  color: '#000000'
                },
              },
              color: ['#F39D12', '#45A0E6',],
              // title: {
              //   text: '主要年龄区间',
              //   bottom:'0%',
              //   left: "30%",
              //   textStyle: {
              //     color: '#000000',
              //     fontSize: 16,
              //     fontWeight: '600'
              //   }
              // },
              legend: {
                show: false,
                // type: "scroll",
                // icon: "circle",
                orient: 'vertical',
                top: 'center',
                right: '8%',
                textStyle: {
                  color: "#3E5463",
                  fontSize: 12,
                  backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
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
                data: data.map((item) => item.name),
              },
              tooltip: {
                formatter: '{b} : {c} 人 ({d}%)'
              },
              series: [
                {
                  name: "国外考试中心",
                  type: "pie",
                  radius: ['45%', '60%'],
                  // radius: ['40%', '55%'],
                  center: ['50%', '50%'],
                  labelLine: {
                    length: 20,//第一段线长
                    length2: 60, //第二段线长
                    lineStyle: {
                      width: 1,
                      type: 'solid',
                      color: '#005DA7'
                    }
                  },
                  label: {
                    // formatter: function(pram:any){
                    //     return '{a|'+pram.data.type+' '+pram.percent+'% }'
                    // },
                    formatter: '{name|{b} }\n\n{zb|{d}%}',
                    padding: [0, -60, -5, -60],
                    rich: {
                      name: {
                        fontSize: 12,
                        color: '#203449'
                      },
                      num: {
                        fontSize: 12,
                        color: '#203449'
                      },
                      zb: {
                        fontSize: 12,
                        color: '#203449'
                      }
          
                    },
                  },
                  data: data,
                },
              ],
          
          }
          myChart?.setOption(option);
        }

        const initWomanPieCharts = () => {
          const el: HTMLElement = instance?.refs.womanPieCharts as any;
          let myChart = echart?.getInstanceByDom(el);
          if (myChart == null) {
            myChart = echart?.init(el);
          }
          let data = [
              {
                  name: '一致',
                  value: girlData.value.consistent,
              },
              {
                  name: '不一致',
                  value: girlData.value.inconsistent
              }
          ]
          let option = {
              title: {
                text: '女',
                x:'center',
                y: 'center',
                textStyle: {
                  fontFamily: 'Regular',
                  fontSize: 18,
                  fontWeight: '400',
                  color: '#000000'
                },
              },
              color: ['#E3493E', '#005DA7',],
              // title: {
              //   text: '主要年龄区间',
              //   bottom:'0%',
              //   left: "30%",
              //   textStyle: {
              //     color: '#000000',
              //     fontSize: 16,
              //     fontWeight: '600'
              //   }
              // },
              legend: {
                show: false,
                // type: "scroll",
                // icon: "circle",
                orient: 'vertical',
                top: 'center',
                right: '8%',
                textStyle: {
                  color: "#3E5463",
                  fontSize: 12,
                  backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
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
                data: data.map((item) => item.name),
              },
              tooltip: {
                formatter: '{b} : {c} 人 ({d}%)'
              },
              series: [
                {
                  name: "国外考试中心",
                  type: "pie",
                  radius: ['45%', '60%'],
                  // radius: ['40%', '55%'],
                  center: ['50%', '50%'],
                  labelLine: {
                    length: 20,//第一段线长
                    length2: 60, //第二段线长
                    lineStyle: {
                      width: 1,
                      type: 'solid',
                      color: '#005DA7'
                    }
                  },
                  label: {
                    // formatter: function(pram:any){
                    //     return '{a|'+pram.data.type+' '+pram.percent+'% }'
                    // },
                    formatter: '{name|{b} }\n\n{zb|{d}%}',
                    padding: [0, -60, -5, -60],
                    rich: {
                      name: {
                        fontSize: 12,
                        color: '#203449'
                      },
                      num: {
                        fontSize: 12,
                        color: '#203449'
                      },
                      zb: {
                        fontSize: 12,
                        color: '#203449'
                      }
          
                    },
                  },
                  data: data,
                },
              ],
          
          }
          myChart?.setOption(option);
        }

        const initChooseJobSexCharts = () => {
          const el: HTMLElement = instance?.refs.chooseJobSexCharts as any;
          let myChart = echart?.getInstanceByDom(el);
          if (myChart == null) {
            myChart = echart?.init(el);
          }
          let data = employmentIndustryInfoList.value
          let option = {
            title: {
              text: '单位: 人',
              top: 0,
              left: 0,
              textStyle: {
                color: '#333333',
                fontSize: 14,
                fontWeight:'normal'
              }
            },
            color: ['#1B528B', '#E3493E'],
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              show: true,
              left: '20%',
              top: '0',
              itemWidth: 10,
              itemHeight: 5,
              icon:'roundRect'
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
                axisTick: { show: false },
                data: data.map((it: any) => it.name)
              }
            ],
            yAxis: [
              {
                type: 'value'
              }
            ],
            series: [
              {
                name: '男',
                type: 'bar',
                barGap: 0,
                barWidth: 14,
                emphasis: {
                  focus: 'series'
                },
                data: data.map((it: any) => it.boyCount)
              },
              {
                name: '女',
                type: 'bar',
                barWidth: 14,
                emphasis: {
                  focus: 'series'
                },
                data: data.map((it: any) => it.girlCount)
              }
            ]
          };
          myChart?.setOption(option);
        }

        const initChooseJobSpecialtyCharts = () => {
          const el: HTMLElement = instance?.refs.chooseJobSpecialtyCharts as any;
          let myChart = echart?.getInstanceByDom(el);
          if (myChart == null) {
            myChart = echart?.init(el);
          }
          let data = difference.value
          let option = {
            title: {
              text: '专业对口匹配度%',
              top: 0,
              left: 0,
              textStyle: {
                color: '#333333',
                fontSize: 14,
                fontWeight:'normal'
              }
            },
            color: ['#45A0E6'],
            tooltip: {
              // trigger: 'axis',
              formatter: function({data}: any) {
                return `${data.industryName}<br>
                <p>
                  <i style="display: inline-block;
                  background: #1B528B;
                  width: 10px;
                  height: 10px;
                  margin-right: 5px;
                  border-radius: 50%;"></i>男性：${data.boyCount} 人
                </p>
                <p>
                  <i style="display: inline-block;
                  background: #E3493E;
                  width: 10px;
                  height: 10px;
                  margin-right: 5px;
                  border-radius: 50%;"></i>女性：${data.girlCount} 人
                </p>
                `
              }
            },
            legend: {
              show: true,
              left: '20%',
              top: '0',
              itemWidth: 10,
              itemHeight: 5,
              icon:'roundRect'
            },
            grid: {
              // top: '20%',
              top: '15%',
              left: 0,
              right: 0,
              bottom: '0',
              containLabel: true
            },
            xAxis: [
              {
                type: 'category',
                axisTick: { show: false },
                data: data.map((it:any) => it.name),
                axisLabel: {
                  show: true,
                  margin: 20,
                  rotate: 45, // 旋转角度，单位为度
                  textStyle: {
                    align: 'right' // 文本对齐方式，默认为 'center'
                  }
                }
              },
            ],
            yAxis: [
              {
                type: 'value'
              }
            ],
            series: [
              {
                type: 'bar',
                barGap: 0,
                barWidth: 14,
                data: data
              }
            ]
          };
          myChart?.setOption(option);
        }

        const initFirmSexDifference1 = () => {
          const el: HTMLElement = instance?.refs.sexDifference1 as any;
          let myChart = echart?.getInstanceByDom(el);
          if (myChart == null) {
            myChart = echart?.init(el);
          }
          let data = boyAndGirlEmploymentUnitNature.value
          let option = {
            title: {
              text: '单位: 人',
              top: 0,
              left: 0,
              textStyle: {
                color: '#333333',
                fontSize: 14,
                fontWeight:'normal'
              }
            },
            color: ['#1B528B', '#E3493E'],
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              show: true,
              left: '20%',
              top: '0',
              itemWidth: 10,
              itemHeight: 5,
              icon:'roundRect'
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
                axisTick: { show: false },
                data: data.map((it:any) => it.name)
              }
            ],
            yAxis: [
              {
                type: 'value'
              }
            ],
            series: [
              {
                name: '男',
                type: 'bar',
                barGap: 0,
                barWidth: 14,
                emphasis: {
                  focus: 'series'
                },
                data: data.map((it:any) => it.boyCount)
              },
              {
                name: '女',
                type: 'bar',
                barWidth: 14,
                emphasis: {
                  focus: 'series'
                },
                data: data.map((it:any) => it.girlCount)
              }
            ]
          };
          myChart?.setOption(option);
        }

        const initFirmSexDifference2 = () => {
          const el: HTMLElement = instance?.refs.sexDifference2 as any;
          let myChart = echart?.getInstanceByDom(el);
          if (myChart == null) {
            myChart = echart?.init(el);
          }
          let data = boyAndGirlEmploymentUnitScale.value
          let option = {
            title: {
              text: '单位: 人',
              top: 0,
              left: 0,
              textStyle: {
                color: '#333333',
                fontSize: 14,
                fontWeight:'normal'
              }
            },
            color: ['#1B528B', '#E3493E'],
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              show: true,
              left: '20%',
              top: '0',
              itemWidth: 10,
              itemHeight: 5,
              icon:'roundRect'
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
                axisTick: { show: false },
                data: data.map((it: any) => it.name)
              }
            ],
            yAxis: [
              {
                type: 'value'
              }
            ],
            series: [
              {
                name: '男',
                type: 'bar',
                barGap: 0,
                barWidth: 14,
                emphasis: {
                  focus: 'series'
                },
                data: data.map((it:any) => it.boyCount)
              },
              {
                name: '女',
                type: 'bar',
                barWidth: 14,
                emphasis: {
                  focus: 'series'
                },
                data: data.map((it:any) => it.girlCount)
              }
            ]
          };
          myChart?.setOption(option);
        }

        watch(dataSource, (res) => {
          if(res && Object.keys(res).length){
            try {
              nextTick(() => {
                if(isActive.value === 'Destinative_distribution') {
                  totalCount.value = 0;
                  largeClassificationProportion.value = res.largeClassificationProportion.map((it: any, ix: number) => {
                    totalCount.value += it.count;
                    return {
                      name: it.type,
                      value: it.count,
                    }
                  });
  
                  console.log(largeClassificationProportion.value);
                  
                  let total = 0
                  occupationTypeProportion.value = res.occupationTypeProportion.map((it: any, ix: number) => {
                    total += it.count
                    return {
                      name: it.occupationType,
                      value: it.count
                    }
                  });
                  let name = res.mainGraduationDestination.mainGraduationDestination.split('-')[1];
                  let maxValue = occupationTypeProportion.value.find((v: any) => v.name === name)!.value
                  
                  mainGraduationDestination.title = res.mainGraduationDestination.mainGraduationDestination;
                  mainGraduationDestination.subTitle = res.mainGraduationDestination.mainGraduationDestination.split('-')[0];
                  mainGraduationDestination.value = ((maxValue / total) * 100).toFixed(2);
                  
    
                  initTypeBranchCharts();
                } else if(isActive.value === 'Employment_region') {
                  branchBar.value = res.employmentRegion;
                  boyData.value = res.boyData
                  girlData.value = res.girlData
                  initManPieCharts()
                  initWomanPieCharts()
                } else if(isActive.value === 'Employment_industry') {
                  employmentIndustryInfoList.value = res.employmentIndustryInfoList;
                  maxCareerSelection.manValue = res.maxCareerSelection.find((v: any) => v.sex === '男')!.employmentIndustry
                  maxCareerSelection.womanValue = res.maxCareerSelection.find((v: any) => v.sex === '女')!.employmentIndustry
                  industryProportion.value = res.industryProportion;
                  difference.value = res.difference.map((it: any) => {
                    return {
                      ...it,
                      name: it.majorName,
                      value: it.proportion.split('%')[0]
                    }
                  });
                  initChooseJobSexCharts()
                  initChooseJobSpecialtyCharts()
                } else if(isActive.value === 'Employment_unit') {
                  boyAndGirlEmploymentUnitNature.value = res.boyAndGirlEmploymentUnitNature;
                  boyAndGirlEmploymentUnitScale.value = res.boyAndGirlEmploymentUnitScale;
                  employmentUnitTop.value = res.employmentUnitTop;
                  topFiveHundredTop.value = res.topFiveHundredTop;
                  initFirmSexDifference1()
                  initFirmSexDifference2()
                } else {
                  maxAnnualSalary.value = res.maxAnnualSalary || {}
                  minAnnualSalary.value = res.minAnnualSalary || {}
                  majorAnnualSalaryDistribution.name = res.majorAnnualSalaryDistribution.type
                  majorAnnualSalaryDistribution.averageSalary = res.averageSalary
                  employmentIndustrySalary.value = res.employmentIndustrySalary
                  majorAverageSalary.value = res.majorAverageSalary
                }
              })
            } catch (error) {
              console.log(error);
            }
          }
        }, { immediate: true, deep: true })

        return () => {
          return <div class="destination-after-graduation-right" key={ isActive.value }>
            {
              isActive.value === 'Destinative_distribution' &&
              <>
                <div class="c-title mg-b30">毕业去向类型分布</div>
                <div class="destination-type-branch" ref="typeBranchCharts"></div>
                <div class="hint-text">主要毕业去向<span class="bold">{ mainGraduationDestination.title }</span> 就业率 <span class="bold">{largeClassificationProportion.value.length &&  ((largeClassificationProportion.value[0]?.value / totalCount.value) * 100).toFixed(2)} %</span></div>
                <c-table-plus title="毕业去向情况" 
                  dialogWidth="1460px" 
                  height="350px"
                  visible={ visible.value }
                  searchConfig={ searchConfig }
                  columns={ columns }
                  request={ tableRequest }
                  exportBtn={ exportEvt }
                  closed={ () => visible.value = false }
                  v-slots={{
                    index:(arg:any) =>{
                      const {data} = arg
                      return <div>{ data.$index + 1 }</div>
                    },
                    action:(arg:any) =>{
                      const {data} = arg
                      return <el-button style="color:#005DA7" link>学生个像</el-button>
                    }
                  }} 
                  />
              </>
            }

            {
              isActive.value === 'Employment_region' &&
              <>
                <div class="c-title mg-b10">就业地域分布</div>
                <ul class="branch-progress-bar">
                    {
                      branchBar.value.map((it: any, ix) => {
                          return (
                            <li class="mg-b10">
                              <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                              <span class="text" title={it.region}>{ it.region }</span>
                              <div class="progress-bar-box">
                                <div class="out-rect">
                                  <div class="in-rect" style={{ width: it.proportion }} />
                                </div>
                              </div>
                              <span class="num">{ it.count }人</span>
                            </li>
                          )
                      })
                    }
                </ul>
                <p class="hint-text mg-b15">生源Top5 
                  {
                    branchBar.value.map((it:any, ix: number) => {
                      return (
                        <span class="bold"> {it.region}{ix < branchBar.value.length - 1 &&  <span>、</span>}</span>
                      )
                    })
                  }
                </p>
                <div class="c-title mg-b10">生源地与毕业去向匹配分析</div>
                <div class="pie-charts-box">
                  <div class="man-pie" ref="manPieCharts"></div>
                  <div class="woman-pie" ref="womanPieCharts"></div>
                </div>
              </>
            }

            {
              isActive.value === 'Employment_industry' && 
              <>
                <div class="c-title mg-b10">择业性别差异</div>
                <div class="choose-job-sex" ref="chooseJobSexCharts"></div>
                <p class="hint-text mg-b15">男性择业最多的行业 <span class="bold">{maxCareerSelection.manValue}</span> 女性择业最多的行业 <span class="bold">{maxCareerSelection.womanValue}</span></p>
                <div class="c-title mg-b10">择业专业差异</div>
                <div class="choose-job-specialty" ref="chooseJobSpecialtyCharts"></div>
                <p class="hint-text">专业对口匹配最高为 <span class="bold">{ difference.value.length && difference.value[0].name }, { industryProportion.value }</span>学生选择 <span class="bold">{ difference.value.length && difference.value[0].industryName }</span></p>
              </>
            }

            {
              isActive.value === 'Employment_unit' &&
              <>
                <div class="c-title mg-b15">择业企业性别差异</div>
                <div class="firm-sex-difference">
                  <div class="sexDifference" ref="sexDifference1"></div>
                  <div class="sexDifference" ref="sexDifference2"></div>
                </div>
                <div class="c-title mg-b15">择业企业排行</div>
                <div class="firm-ranking annual-salary-ranking">
                  <ul class="branch-progress-bar">
                    {
                      employmentUnitTop.value.map((it: any, ix) => {
                          return (
                            <li class="mg-b10">
                              <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                              <span class="text" title={it.employmentUnit}>{ it.employmentUnit }</span>
                              <div class="progress-bar-box">
                                <div class="out-rect">
                                  <div class="in-rect" style={{ width: it.proportion }} />
                                </div>
                              </div>
                              <span class="num">{ it.count }人</span>
                            </li>
                          )
                      })
                    }

                    <li class="hint-text">企业Top5 
                      {
                        employmentUnitTop.value.map((it:any, ix: number) => {
                          return (
                            <span class="bold"> {it.employmentUnit}{ix < employmentUnitTop.value.length - 1 &&  <span>、</span>}</span>
                          )
                        })
                      }
                    </li>
                  </ul>

                  <ul class="branch-progress-bar">
                    {
                      topFiveHundredTop.value.map((it: any, ix) => {
                          return (
                            <li class="mg-b10">
                              <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                              <span class="text" title={it.employmentUnit}>{ it.employmentUnit }</span>
                              <div class="progress-bar-box">
                                <div class="out-rect">
                                  <div class="in-rect" style={{ width: it.proportion }} />
                                </div>
                              </div>
                              <span class="num">{ it.count }人</span>
                            </li>
                          )
                      })
                    }
                    <li class="hint-text">世界五百强Top5 
                      {
                        topFiveHundredTop.value.map((it:any, ix: number) => {
                          return (
                            <span class="bold"> {it.employmentUnit}{ix < topFiveHundredTop.value.length - 1 &&  <span>、</span>}</span>
                          )
                        })
                      }
                    </li>
                  </ul>
                </div>
              </>
            }

            {
              isActive.value === 'Employment_salary' && 
              <>
                <div class="c-title mg-b20">薪资分布</div>
                <div class="salary-branch mg-b30">
                  <div class="salary-card-box">
                      <p class="card-box-title">最高年薪</p>
                      <div class="card-box-bottom">
                        <span class="money">{maxAnnualSalary.value.employmentSalary || 0}万</span>
                        <span class="class">{maxAnnualSalary.value.majorName}·{maxAnnualSalary.value.gradeName}·{maxAnnualSalary.value.sex}</span>
                      </div>
                  </div>
                  <div class="salary-card-box">
                      <p class="card-box-title">最低年薪</p>
                      <div class="card-box-bottom">
                        <span class="money">{minAnnualSalary.value.employmentSalary || 0}万</span>
                        <span class="class">{minAnnualSalary.value.majorName}·{minAnnualSalary.value.gradeName}·{minAnnualSalary.value.sex}</span>
                      </div>
                  </div>
                </div>
                <p class="hint-text mg-b20">年薪主要分布 <span class="bold">{majorAnnualSalaryDistribution.name}</span> 平均年薪 <span class="bold">{majorAnnualSalaryDistribution.averageSalary}</span>万元 </p>
                <div class="c-title mg-b20">平均年薪排行</div>
                <div class="annual-salary-ranking">
                  <ul class="branch-progress-bar">
                    {
                      employmentIndustrySalary.value.map((it:any, ix:number) => {
                          return (
                            <li class="mg-b10">
                              <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                              <span class="text" title={ it.employment_industry }>{ it.employment_industry }</span>
                              <div class="progress-bar-box">
                                <div class="out-rect">
                                  <div class="in-rect" style={{ width: it.proportion }} />
                                </div>
                              </div>
                              <span class="num">{ it.averageSalary }万</span>
                            </li>
                          )
                      })
                    }

                    <li class="hint-text">行业Top5 
                      {
                        employmentIndustrySalary.value.map((it:any, ix: number) => {
                          return (
                            <span class="bold"> {it.employment_industry}{ix < employmentIndustrySalary.value.length - 1 &&  <span>、</span>}</span>
                          )
                        })
                      }
                    </li>
                  </ul>

                  <ul class="branch-progress-bar">
                    {
                      majorAverageSalary.value.map((it:any, ix) => {
                          return (
                            <li class="mg-b10">
                              <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                              <span class="text" title={ it.major_name }>{ it.major_name }</span>
                              <div class="progress-bar-box">
                                <div class="out-rect">
                                  <div class="in-rect" style={{ width: it.proportion }} />
                                </div>
                              </div>
                              <span class="num">{ it.averageSalary }万</span>
                            </li>
                          )
                      })
                    }
                    <li class="hint-text">行业Top5 
                      {
                        majorAverageSalary.value.map((it:any, ix: number) => {
                          return (
                            <span class="bold"> {it.major_name}{ix < majorAverageSalary.value.length - 1 &&  <span>、</span>}</span>
                          )
                        })
                      }
                    </li>
                  </ul>
                </div>
              </>
            }
          </div>
        }

    }
})


DestinationAfterGraduation.Left = LeftView;
DestinationAfterGraduation.Right = RightView;
export default DestinationAfterGraduation