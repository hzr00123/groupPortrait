import { defineComponent, getCurrentInstance, onMounted, onUnmounted, reactive, ref, watch, nextTick, PropType, defineAsyncComponent, inject, provide, toRefs } from "vue"
import RedTab from "@/components/common/RedTab.vue";
import ColorCard from '@/components/common/ColorCard.vue';
import InstanceManager, { _getMaxValue, getImageUrl } from "@/utils"
import { ElLink, ElProgress } from "element-plus";
import { searchConfigType, PagesType, requestResType } from "@/components/Table-plus/index.d";
import { getOrgType } from "@/api/modules/emphasisList";
import { Column } from "@/components/Table";
import { exportGetChartDataDetail, getChartDataDetail } from "@/api/modules/studentPortrait";
import { BaseParams } from "@/components/group-image/types";
import { downloadFile, usePortraitRequest } from "@/hooks";
import '../../index.scss'
import { RedTabConfig } from "@/components/common/Search";

const InnovationBusiness = defineComponent({
    name: 'innovationBusiness',
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        direction: {
            type: String as PropType<'horizontal' | 'vertical'>,
            default: 'horizontal'
        },
        selectList: {
            type: Array as PropType<RedTabConfig[]>,
            default: () => [
                {
                  value: 'Number_of_innovative_and_entrepreneurial_individuals',
                  label: "创新创业人数"
                },
                {
                  value: 'Entrepreneurship_industry',
                  label: "创业行业"
                }
            ]
        }
    },
    setup(props, content) {
        provide('params', props.params)
        provide('InstanceManager', new InstanceManager())
        return () => {
            return <div class={{
                'innovation-business':  true,
                'scholarship': true,
                'flex': true,
                'horizontal': props.direction === 'horizontal',
                'vertical': props.direction === 'vertical'
            }}>
                <LeftView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }} 
                params={ props.params }
                selectList={ props.selectList }/>
                <RightView class={{
                    'w49': props.direction === 'horizontal',
                    'w100': props.direction === 'vertical'
                }}/>
            </div>
        }
    }
})

const LeftView = defineComponent({
    props: {
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        selectList: {
            type: Array as PropType<RedTabConfig[]>,
            default: () => [
                {
                  value: 'Number_of_innovative_and_entrepreneurial_individuals',
                  label: "创新创业人数"
                },
                {
                  value: 'Entrepreneurship_industry',
                  label: "创业行业"
                }
            ]
        }
    },
    setup(props, content) {
        const params = inject<BaseParams>('params',  {} as any);
        
        const instanceManager = inject<InstanceManager>('InstanceManager')
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts

        const selectList = reactive(props.selectList)
        
        const isClsActive = ref<string>('按学院')

        const isActive = ref<string>(props.selectList[0].value as string)
        const activeLable = ref(props.selectList[0].label as string)

        const response = ref<any>({})
        const clsList = [
            {
                value: '按学院',
                label: "按学院"
            },
            {
                value: '按专业',
                label: "按专业"
            },
            {
                value: '历年人数',
                label: "历年人数"
            }
        ]

        const legendList = [
            {
                color: "#F39D12",
                label: "女性"
            },
            {
                color: "#005DA7",
                label: "男性"
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
            prop: 'entrepreneurshipIndustryName',
            label: '创新创业行业',
            align: 'center'
          },
          {
            slot: 'action',
            label: '操作',
            fixed: 'right',
            align: 'center'
          }
        ]

        const colorConfig = reactive({
            color: '#6477DD',
            title:'创业创新人数',
            value:0,
            isUnit:true,
            icon:getImageUrl('peopleNum'),
            unit:'人'
        })

        const list = ref([])

        const industryList = ref([])

        const formerYearsList = ref([])

        const totalNum = ref<number>(0)

        const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
            return getChartDataDetail({
                ...props.params,
                ...params,
                pageNum: pages.current,
                pageSize: pages.size,
                ident: isActive.value,
                startTime: params.startTime,
                endTime: params.endTime
            })
        }

        const exportEvt = async(form: any, pages: PagesType) => {
            const res = await exportGetChartDataDetail({
              ...form,
              pageNum: pages.current,
              pageSize: pages.size,
              ident: isActive.value,
              startTime: params.startTime,
              endTime: params.endTime,
              expExcel: true
            })
            downloadFile(res)
        }

        const cardClick = () => {
            visible.value = true
        }

        const redTabChange = (index: string) => {
            isActive.value = index;
            activeLable.value = selectList.find(it => it.value === index)!.label;
            isClsActive.value = '按学院';
        }

        const redClsTabChange = (name: string) => {
            isClsActive.value = name
        }

        const initChartsNum = () => {
            const el: HTMLElement = instance?.refs.chartsNum as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            // let data = [
            //     {
            //         awards: 16,
            //         total: 23,
            //         year: "2023"
            //     }
            // ]
            let data = formerYearsList.value
            const max1 = _getMaxValue(data.map((item: any) => item.allPostgraduateNum))
            const max2 = _getMaxValue(data.map((item: any) => item.scale))

            let option = {
                color:['#6477DD','#FFCC00'],
                title: {
                text: '单位：人',
                top: 0,
                left: 0,
                textStyle: {
                    color: '#333333',
                    fontSize: 14,
                    fontWeight:'normal'
                }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(res: any) {
                        return `${res[0].axisValue}<br>
                        <p>
                          <i style="display: inline-block;
                          background: #6477DD;
                          width: 10px;
                          height: 10px;
                          margin-right: 5px;
                          border-radius: 50%;"></i>创新创业人数：${res[0].value} 人
                        </p>
                        <p>
                          <i style="display: inline-block;
                          background: #FFCC00;
                          width: 10px;
                          height: 10px;
                          margin-right: 5px;
                          border-radius: 50%;"></i>创新创业人数占比：${res[1].value} %
                        </p>
                        `
                    }
                },
                legend: {
                right: '14%',
                top: '1%',
                itemWidth: 10,
                itemHeight: 5,
                    data: ['创新创业人数', '创新创业人数占比']
                },
                grid: {
                top: '12%',
                left: 0,
                right: '4%',
                bottom: '4%',
                containLabel: true
                },
                xAxis: [
                {
                    type: 'category',
                    data: data.map((item: { year: any; }) => ({ value: item.year })),
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
                    min: 0,
                    max: max1, 
                    splitNumber: 5, 
                    interval: max1 / 5, 
                },
                { 
                    name:'单位：%',
                    nameLocation:'end',
                    nameTextStyle:{
                    color: '#333333',
                    fontSize: 14,
                    },
                    axisLine: {
                    show: false,
                    },
                    axisTick: {
                    show: false,
                    },
                    type: 'value',
                    splitLine: {
                    show: false,
                    lineStyle: {
                        type: 'dashed'
                    }
                    },
                    min: 0,
                    max: max2, 
                    splitNumber: 5, 
                    interval: max2 / 5, 
                },

                ],
                series: [
                {
                    type: 'bar',
                    name:'创新创业人数',
                    barWidth: '20%',
                    data: data.map((item: { allPostgraduateNum: any; }) => ({ value: item.allPostgraduateNum })),
                    itemStyle: {
                    borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
                    },
                },
                {
                    name: '创新创业人数占比',
                    type: 'line',
                    smooth: true,
                    // symbol: 'none',
                    symbolSize: 8,
                    yAxisIndex: 1,
                    data: data.map((item: { scale: any; }) => ({ value: item.scale })),
                },
                ]
            };
            myChart?.setOption(option);
        }

        const initCharts1 = () => {
            const el: HTMLElement = instance?.refs.charts1 as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data = industryList.value;
            let option = {
            title: {
                show: true,
                text: '创业行业分布',
                bottom: '0%',
                left: '20%',
            },
            color:['#00C9F2','#E3493E','#005DA7'],
            legend: {
                type: "scroll",
                orient: 'vertical',
                top: 'middle',
                right: '6%',
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
                let n = name.length>8? name.substring(0,8)+'...':name
                return `{c|${n}} {b|${tarValue} 人} {a| ${p}} %`;
            }

            },
            tooltip: {
                formatter: '{b} : {c}人  ({d}%)'
            },
            series: [
                {
                z: 2,
                // radius: ['35%', '50%'],
                radius: ['55%', '65%'],
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
        }

        const WarningSeal = defineAsyncComponent({
            loader: () => import('@/components/WarningSeal'),
            delay: 1000
        })

        instanceManager?.register('IisActive', isActive);
        instanceManager?.register('IdataSource', response);

        onUnmounted(()=>{
            instanceManager?.clear('IisActive')
            instanceManager?.clear('IdataSource')
        })
        
    
        const dataSource = usePortraitRequest({...toRefs(params!) as any, ident: isActive, category: isClsActive }, [isClsActive, isActive])

        watch(dataSource, (res) => {
            const { data, datas2 } = res
            try {
                response.value = datas2;
                colorConfig.value = data.count;
                if(isClsActive.value !== '历年人数') {
                    list.value = data.value;
                } else {
                    formerYearsList.value = data.value.map((it: any) => {
                        return {
                            ...it,
                            scale: it.scale.split('%')[0]
                        }
                    });
                    nextTick(() => {
                        initChartsNum()
                    })
                }
    
                if(isActive.value === 'Entrepreneurship_industry') {
                    totalNum.value = 0 
                    industryList.value = data.value.map((it: any) => {
                        totalNum.value += it.count
                        return {
                            ...it,
                            value: it.count
                        }
                    })
                    nextTick(() => {
                        initCharts1()
                    })
                }
            } catch (error) {
                console.log(error);
            }
        })

        return () => {
            return <div class="innovation-business-left" {...content.attrs}>
                <WarningSeal name={activeLable.value} ident={isActive.value}/>
                { !content.attrs.view &&
                    <div class="innovation-business-header mg-b20">
                        <c-title title="基本信息画像" />
                        <RedTab btnList={ selectList } isActive={ isActive.value } onRedTabChange={ redTabChange } />
                    </div>
                }

                {
                    isActive.value === 'Number_of_innovative_and_entrepreneurial_individuals' ?
                    <>
                        <div class="innovation-business-top mg-b20">
                            <ColorCard class="mr50" cardConfig={ colorConfig } onHandleClick={ cardClick } />
                        </div>
                        <div class="filter-strip mg-b15" style={{ 'justify-content':  isClsActive.value !== '历年人数' ? 'space-between': 'flex-end'}}>
                            { isClsActive.value !== '历年人数' && <div class="legend-box">
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
                            </div>}
                            <RedTab btnList={ clsList } isRed={ true } isActive={ isClsActive.value } onRedTabChange={ redClsTabChange } />
                        </div>
                        <section key={ isClsActive.value }>
                            {
                                isClsActive.value !== '历年人数' &&
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
                            }

                            {
                                isClsActive.value === '历年人数' &&
                                <>
                                    <div class="chartsNum" ref="chartsNum"></div>
                                    <p style="text-align: center">每年创新创业情况变化趋势</p>
                                </>
                            }
                        </section>
                    </> :

                    <div class="industry-charts" ref="charts1"></div>
                }

                <c-table-plus title="创新创业" 
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
                
            </div>
        }
    }
})

const RightView = defineComponent({
    setup(props, content) {
        const instance = getCurrentInstance();
        
        const instanceManager = inject<InstanceManager>('InstanceManager')!
        const echart = instance?.proxy?.$echarts;
        const isActive = instanceManager.get('IisActive');
        const collegePostgraduateTop = ref([])

        const majorPostgraduateTop = ref([])

        const postgraduateProportion = ref<number>(0)

        const boyAndGirlNumMap = reactive<{boyCount: number, girlCount: number, scale: string}>({
            boyCount: 0,
            girlCount: 0,
            scale: ''
        })

        const orientationList = ref([])

        const manList = ref([])

        const woManList = ref([])

        const initSexContrastCharts = () => {
            const el: HTMLElement = instance?.refs.sexContrastCharts as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let data = [
                {
                    name: '男',
                    value: boyAndGirlNumMap.boyCount,
                },
                {
                    name: '女',
                    value: boyAndGirlNumMap.girlCount
                }
            ]
            let option = {
                color: ['#005DA7', '#E3493E',],
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
                    name: "创新创业男女人数对比",
                    type: "pie",
                    // radius: ['45%', '60%'],
                    // radius: ['55%', '70%'],
                    // center: ['50%', '50%'],
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
                      formatter: '{name|{b} } {num|{c}人 }\n\n{zb|{d}%}',
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

        onMounted(() => {
            nextTick(() => {
                initSexContrastCharts()
            })
        })

        const dataSource = instanceManager.get('IdataSource')
        watch(dataSource, (res) => {
            if(res && Object.keys(res).length) {
                try {
                    if(isActive.value === 'Number_of_innovative_and_entrepreneurial_individuals') {
                        postgraduateProportion.value = res.postgraduateProportion && Number(res.postgraduateProportion.scale.split('%')[0]);
                        collegePostgraduateTop.value = res.collegePostgraduateTop
                        majorPostgraduateTop.value = res.majorPostgraduateTop
                        boyAndGirlNumMap.boyCount = res.boyAndGirlNumMap && res.boyAndGirlNumMap.boyCount
                        boyAndGirlNumMap.girlCount = res.boyAndGirlNumMap && res.boyAndGirlNumMap.girlCount
                        boyAndGirlNumMap.scale = res.boyAndGirlNumMap && res.boyAndGirlNumMap.scale
                        nextTick(() => {
                            initSexContrastCharts()
                        })
                    } else {
                        orientationList.value = res.top
                        manList.value = res.boyMajorTop
                        woManList.value = res.girlMajorTop
                    }
                } catch(error) {
                    console.log(error);
                }
            }
        }, { immediate: true,  deep: true})

        return () => {
            return <div class="innovation-business-right" {...content.attrs}>
                <c-title class="mg-b20" title="特征分析" />
                {
                    isActive.value === 'Number_of_innovative_and_entrepreneurial_individuals' &&
                    <section>
                        <div class="container-box">
                            <div class="c-title mg-b30">创新创业人数占比</div>
                            <div style="display: flex;justify-content: center;margin-bottom: 35px;">
                                <ElProgress class="innovation-proportion mg-b15"  type="circle" width={ 110 } stroke-width={ 10 } color="#45A0E6" percentage={ postgraduateProportion.value }>
                                    {{
                                        default:(arg:{percentage:number}) =>{
                                            return <span class="percentage-value" style="color:#45A0E6;">{ arg.percentage || 0 }<span>%</span></span>
                                        }
                                    }}
                                </ElProgress>
                            </div>
                            <p class="hint-text mg-b20">创新创业人数占毕业人数占比 <span class="bold">{postgraduateProportion.value || 0}%</span></p>
                            <div class="c-title mg-b20">创新创业人数学院Top5</div>
                            <ul class="branch-progress-bar">
                                {
                                    collegePostgraduateTop.value.map((it:any, ix) => {
                                        return (
                                            <li class="mg-b10">
                                            <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                            <span class="text">{ it.collegeName }</span>
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
                                <li class="hint-text">创新创业人数专业Top5 
                                    {
                                        collegePostgraduateTop.value.map((it:any, ix: number) => {
                                        return (
                                            <span class="bold"> {it.collegeName}{ix < collegePostgraduateTop.value.length - 1 &&  <span>、</span>}</span>
                                        )
                                        })
                                    }
                                </li>
                            </ul>
                        </div>
                        <div class="container-box">
                            <div class="c-title mg-b30">创新创业男女人数对比</div>
                            <div class="sexContrast mg-b15" ref="sexContrastCharts"></div>
                            <p class="hint-text mg-b20">男女比 <span class="bold">{boyAndGirlNumMap.scale}</span></p>
                            <div class="c-title mg-b20">创新创业人数专业Top5</div>
                            <ul class="branch-progress-bar">
                                {
                                    majorPostgraduateTop.value.map((it:any, ix) => {
                                        return (
                                            <li class="mg-b10">
                                            <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                            <span class="text">{ it.majorName }</span>
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
                                <li class="hint-text">创新创业人数专业Top5 
                                    {
                                        majorPostgraduateTop.value.map((it:any, ix: number) => {
                                        return (
                                            <span class="bold"> {it.majorName}{ix < majorPostgraduateTop.value.length - 1 &&  <span>、</span>}</span>
                                        )
                                        })
                                    }
                                </li>
                            </ul>
                        </div>
                    </section>
                }

                {
                    isActive.value === 'Entrepreneurship_industry' &&
                    <div style="padding: 20px;background: #F7F7F7">
                        <h3 class="c-title">创业方向Top5</h3>
                        <div class="orientation-top mg-b20">
                            <ul class="branch-progress-bar">
                                {
                                    orientationList.value.map((it:any, ix) => {
                                        return (
                                            <li class="mg-b10">
                                            <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                            <span class="text" title={it.name}>{ it.name }</span>
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
                            <p class="hint-text">创业方向Top5 
                                {
                                    orientationList.value.map((it:any, ix: number) => {
                                    return (
                                        <span class="bold"> {it.name}{ix < orientationList.value.length - 1 &&  <span>、</span>}</span>
                                    )
                                    })
                                }
                            </p>
                        </div>
                        <div class="c-title mg-b30">男女创业方向差异</div>
                        <el-row gutter={20} class="difference-content">
                            <el-col span={12}>
                                <ul class="branch-progress-bar">
                                    {
                                        manList.value.map((it:any, ix) => {
                                            return (
                                                <li class="mg-b10">
                                                    <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                                    <span class="text" title={it.entrepreneurshipIndustryName}>{ it.entrepreneurshipIndustryName }</span>
                                                    <div class="progress-bar-box">
                                                        <div class="out-rect">
                                                        <div class="in-rect" style={{ width: it.proportion }} />
                                                        </div>
                                                    </div>
                                                    <span class="num">{ it.peopleNum }人</span>
                                                </li>
                                            )
                                        })
                                    }
                                    <li class="hint-text">男性Top3方向  
                                        {
                                            manList.value.map((it:any, ix: number) => {
                                            return (
                                                <span class="bold"> {it.entrepreneurshipIndustryName}{ix < manList.value.length - 1 &&  <span>、</span>}</span>
                                            )
                                            })
                                        }
                                    </li>
                                </ul>
                            </el-col>
                            <el-col span={12}>
                                <ul class="branch-progress-bar">
                                    {
                                        woManList.value.map((it:any, ix) => {
                                            return (
                                                <li class="mg-b10">
                                                    <div class={['ranking', ix > 2 ? 'r-active': '']}>{ ix + 1 }</div>
                                                    <span class="text" title={it.entrepreneurshipIndustryName}>{ it.entrepreneurshipIndustryName }</span>
                                                    <div class="progress-bar-box">
                                                        <div class="out-rect">
                                                        <div class="in-rect" style={{ width: it.proportion }} />
                                                        </div>
                                                    </div>
                                                    <span class="num">{ it.peopleNum }人</span>
                                                </li>
                                            )
                                        })
                                    }
                                    <li class="hint-text">女性Top3方向
                                        {
                                            woManList.value.map((it:any, ix: number) => {
                                                return (
                                                    <span class="bold"> {it.entrepreneurshipIndustryName}{ix < woManList.value.length - 1 &&  <span>、</span>}</span>
                                                )
                                            })
                                        }
                                    </li>
                                </ul>
                            </el-col>
                        </el-row>
                    </div>
                }
            </div>
        }
    }
})

InnovationBusiness.Left = LeftView;
InnovationBusiness.Right = RightView;
export default InnovationBusiness