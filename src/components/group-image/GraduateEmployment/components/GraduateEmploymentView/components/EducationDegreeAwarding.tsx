import { defineComponent, PropType, reactive, ref, getCurrentInstance, onMounted, nextTick, watch, onUnmounted, inject, toRefs } from 'vue'
import { downloadFile, usePortraitRequest } from "@/hooks";
import InstanceManager from '@/utils';
import RedTab from "@/components/common/RedTab.vue";
import BarMultiSegment from '@/components/common/BarMultiSegment.vue';
import { BaseParams } from "@/components/group-image/types";
import { ElLink, ElProgress } from 'element-plus';
import ColorCard from '@/components/common/ColorCard.vue';
import { Column } from '@/components/Table';
import { searchConfigType, requestResType, PagesType } from '@/components/Table-plus/index.d';
import { getOrgType } from '@/api/modules/emphasisList';
import { exportGetChartDataDetail, getChartDataDetail } from '@/api/modules/studentPortrait';
import { MultiSegmentConf } from '@/components/common/Search';
import '../../../index.scss'

const EducationDegreeAwarding = defineComponent({
    name: "educationDegreeAwarding",
    props: {
        params: {
          type: Object as PropType<BaseParams>,
          default: () => ({})
        }
    },
    setup(props, content) {
        return () => {
            return <div>
                <LeftView />
                <RightView />
            </div>
        }
    }
})

const LeftView = defineComponent({
    props: {
        active: {
            type: [Number, String],
            default: 0
        },
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        }
    },
    setup(props, content) {
        const getImageUrl = (name: string) => {
            return new URL(`/src/assets/imgs/${name}.png`, import.meta.url).href
        }
        const instanceManager = inject<InstanceManager>('InstanceManager')
        const response = ref({});
        const colorConfig = reactive({
            color: '#6477DD',
            title:'学历学位授予情况',
            value:0,
            isUnit:true,
            icon:getImageUrl('degree-icon'),
            unit:'人'
        })
        const visible = ref<boolean>(false)
        const legendList = [
            {
                color: "#F39D12",
                label: "女性"
            },
            {
                color: "#005DA7",
                label: "男性"
            },
        ]

        const list = ref([])
        const isRed = ref(true)
        const isClsActive = ref<string>('按学院')
        const clsList = [
            {
              value: '按学院',
              label: "按学院"
            },
            {
              value: '按专业',
              label: "按专业"
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
              type: 'select',
              label: '授予',
              inputWidth: '80px',
              labelWidth: '40px',
              key: 'category',
              options: [{ label: '是', value: '1' }, { label: '否', value: '2' }]
            },
            {
              type: 'input',
              placeholder: '请输入姓名,学号搜索',
              label: '',
              inputWidth: '160px',
              key: 'name'
            }
        ]

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
              prop: 'grantStatus',
              label: '是否授予',
              align: 'center'
            },
            {
                prop: 'notGrantReason',
                label: '未授予原因',
                align: 'center'
            },
            {
              slot: 'action',
              label: '操作',
              fixed: 'right',
              align: 'center'
            }
        ]
        const MajorOption = reactive<MultiSegmentConf>({
          list: [],
          colorList:[
            {
              color: "#005DA7",
              label: "男"
            },
            {
              color: "#F39D12",
              label: "女"
            }
          ],
          unit:'人',
          lableAlign:'right',
          lableWidth:'138px'
        })

        const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
            return getChartDataDetail({
                ...props.params,
                ...params,
                pageNum: pages.current,
                pageSize: pages.size,
                ident: 'Academic_Degrees_Awarded',
                startTime: props.params.startTime,
                endTime: props.params.endTime
            })
        }

        const exportEvt = async(form: any, pages: PagesType) => {
            const res = await exportGetChartDataDetail({
              ...form,
              pageNum: pages.current,
              pageSize: pages.size,
              ident: 'Academic_Degrees_Awarded',
              startTime: props.params.startTime,
              endTime: props.params.endTime,
              expExcel: true
            })
            downloadFile(res)
        }

        const redTabChange = (name: string) => {
            isClsActive.value = name;
        }
        const cardClick = () => {
            visible.value = true
        }

        instanceManager?.register('EdataSource', response)
        onUnmounted(()=> {
          instanceManager?.clear('EdataSource')
        })
        
        const dataSource = usePortraitRequest({...toRefs(props.params) as any, ident: 'Academic_Degrees_Awarded', category: isClsActive }, isClsActive)

        watch(dataSource, () => {
            if (dataSource.value.code == 1) {
                const { data, datas2 } = dataSource.value;
                try {
                  response.value = datas2;
                  colorConfig.value = data.count;
                  MajorOption.list = data.value.map((it: any) => {
                    return {
                      name: it.collegeName || it.majorName,
                      arr: [
                        {
                          percentage: it.boyProportion.split('%')[0],
                          value: it.boyCount,
                          type: '男'
                        },
                        {
                          percentage: it.girlProportion.split('%')[0],
                          value: it.girlCount,
                          type: '女'
                        }
                      ]
                    }
                  });
                } catch (error) {
                  console.log(error);
                }
            }   
        })

        
        return () => {
            const { active } = props
            return <>
                <div class="education-degreeAwarding-left-view">
                        <div class="top mg-b20">
                            <ColorCard class="mr50" cardConfig={ colorConfig } onHandleClick={ cardClick } />
                        </div>
                        <div class="content">
                            <div class="filter-strip mg-b15">
                                <div class="legend-box">
                                    {
                                        legendList.map((it, ix) => {
                                            return (
                                                <div class="legend" key={ ix }>
                                                    <div class="tag" style={{background: it.color}}></div>
                                                    <div class="text">{ it.label }</div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <RedTab btnList={ clsList } isRed={ isRed.value } isActive={ isClsActive.value } onRedTabChange={ redTabChange } />
                            </div>
                            <BarMultiSegment options={MajorOption} />
                            <ul class="bar-box">
                                {
                                    list.value.map((it: any, ix) => {
                                        return (
                                            <li class="bar-item" key={ ix }>
                                                <div class="y-title">{ it.collegeName || it.majorName }</div>
                                                <ul class="item-ul">
                                                    <li class="item-ul-li" style={{ width: `${it.girlProportion}`, '--bgColor': '#F39D12' }}>
                                                        <div class="zb">{ it.girlProportion }</div>
                                                    </li>
                                                    <li class="item-ul-li" style={{ width: `${it.boyProportion}`, '--bgColor': '#005DA7' }}>
                                                        <div class="zb">{ it.boyProportion }</div>
                                                    </li>
                                                </ul>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                </div>
                <c-table-plus title="学历学位授予情况" 
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
                }}  />
            </>
        }
    }
})

const RightView = defineComponent({
    props: {
        active: {
            type: [Number, String],
            default: 0
        },
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        }
    },
    setup(props, content) {
        const percentage = ref(0);
        
        const instanceManager = inject<InstanceManager>('InstanceManager')!
        const notGraduate = reactive({
            count: 0,
            percentage: 0
        });
        const notGrantEducationReason = ref<any[]>([])

        const boyAndGirlNumMap = reactive({
            boyCount: 0,
            boyProportion: 0,
            girlCount: 0,
            girlProportion: 0,
            scale: null
        })
        
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts;

        const initDocmentPie = () => {
            const el: HTMLElement = instance?.refs.MainPie as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data = notGrantEducationReason.value;
            let option = {
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
                        padding: [0, 0, 0, 0],
                        color:'#3E5463',
                        fontWeight:'bold'
                      },
                      b: {
                        // width: 60,
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
                  data: data.map((item:any) => item.name),
                  formatter: (name: string) => {
                    let total = 0;
                    let tarValue: number = 0; // 为 tarValue 赋一个默认值
                    for (let i = 0; i < data.length; i++) {
                        total += data[i]['value'];
                        if (name === data[i]['name']) {
                            tarValue = data[i]['value'];
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
                    radius: ['60%', '75%'],
                    center: ['17%', '50%'],
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

        const initDocmentPie2 = () => {
            console.log(boyAndGirlNumMap);
            
            const el: HTMLElement = instance?.refs.MainPie2 as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data = [
                {
                  name: '男',
                  value: boyAndGirlNumMap.boyCount
                },
                {
                  name: '女',
                  value: boyAndGirlNumMap.girlCount
                }
            ]
            let option = {
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
                    fontSize: 14,
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
                    // radius: ['45%', '60%'],
                    // radius: ['50%', '65%'],
                    radius: ['40%', '55%'],
                    center: ['40%', '50%'],
                    labelLine: {
                      length: 14,//第一段线长
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
                          fontSize: 14,
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

        const dataSource = instanceManager.get('EdataSource')
        watch(dataSource, (res) => {
            if(res && Object.keys(res).length) {
              try {
                percentage.value = res.proportion && Number(res.proportion.split('%')[0]);
                notGraduate.percentage = res.notGraduate.proportion && Number(res.notGraduate.proportion.split('%')[0]);
                notGraduate.count = res.notGraduate.count;
                boyAndGirlNumMap.boyCount = res.boyAndGirlNumMap.boyCount
                boyAndGirlNumMap.boyProportion = res.boyAndGirlNumMap.boyProportion
                boyAndGirlNumMap.girlCount = res.boyAndGirlNumMap.girlCount
                boyAndGirlNumMap.girlProportion = res.boyAndGirlNumMap.girlProportion
                boyAndGirlNumMap.scale = res.boyAndGirlNumMap.scale
                notGrantEducationReason.value = res.notGrantEducationReason.map((it: any) => {
                    return{
                        name: it.reason,
                        value: it.count
                    }
                })
                nextTick(() => {
                    initDocmentPie()
                    initDocmentPie2()
                })
              } catch (error) {
                console.log(error);
              }
            }
        }, {immediate: true, deep: true})
        
        return () => {
            const { active } = props
            return <>
            
                <div class="right-view" style="padding: 20px">
                    <el-row gutter={20} class="mg-b30">
                        <el-col span={12}>
                            <div class="analyze-box">
                                <h3 class="c-title mg-b20">授予人数占比</h3>
                                <ElProgress class="one-1 mg-b15"  type="circle" width={ 110 } stroke-width={ 10 } color="#B22924" percentage={ percentage.value }>
                                    {{
                                        default:(arg:{percentage:number}) =>{
                                            return <span class="percentage-value" style="color:#B22924;">{ arg.percentage || 0 }<span>%</span></span>
                                        }
                                    }}
                                </ElProgress>
                                <div class="name">授予人数占比 {percentage.value || 0}%</div>
                            </div>
                        </el-col>
                        <el-col span={12}>
                            <div class="analyze-box">
                                <h3 class="c-title">男女人数对比</h3>
                                <div class="docment-chart" ref="MainPie2"></div>
                                <div class="name">男女比 {boyAndGirlNumMap.scale}</div>
                            </div>
                        </el-col>
                    </el-row>

                    <el-row gutter={20}>
                        <el-col span={12}>
                            <div class="analyze-box">
                                <h3 class="c-title">未授权原因分布</h3>
                                <div class="docment-chart" ref="MainPie"></div>
                                <div class="name">主要未授予原因 { notGrantEducationReason.value.length && notGrantEducationReason.value[0].name}</div>
                            </div>
                        </el-col>
                        <el-col span={12}>
                            <div class="analyze-box">
                                <h3 class="c-title mg-b20">非毕业生授予人数</h3>
                                <ElProgress class="one-2 mg-b15"  type="circle" width={ 110 } stroke-width={ 10 } color="#005DA7" percentage={ notGraduate.percentage }>
                                    {{
                                        default:(arg:{percentage:number}) =>{
                                          return <span class="percentage-value" style="color:#005DA7;">{ arg.percentage || 0 }<span>%</span></span>
                                        }
                                    }}
                                </ElProgress>
                                <div class="name">非毕业生授予 {notGraduate.count}人</div>
                            </div>
                        </el-col>
                    </el-row>
                    
                </div>
            </>
        }
    }
})

EducationDegreeAwarding.Left = LeftView;
EducationDegreeAwarding.Right = RightView;
export default EducationDegreeAwarding