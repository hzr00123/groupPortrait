# Vue 3 + TypeScript + Vite

## 初始化

```
pnpm install
```

### 项目启动

```
pnpm run dev
```

### 打包

```
pnpm run build
```

### 开发规范

文件或文件夹的命名遵循以下原则：

index.ts 或者 index.vue，统一使用小写字母开头的(kebab-case)命名规范
属于组件或类的，统一使用大写字母开头的(PascalCase)命名规范
其他非组件或类的，统一使用小写字母开头的(kebab-case)命名规范

pages或components文件夹下的页面命名遵循以下规则：
1、文件夹以组件名命名。小写字母开头的(kebab-case)命名规范命名，如：growup-filebag
2、组件入口文件统一采用index.vue命名
3、当前组件下的components文件夹下的组件以大写字母开头的(PascalCase)命名规范命名，如：GrowupFilebag.vue

### 学生群像模块开发应该使用tsx组件形式开发，以便支持群体对比及群体关注选择视图使用，例如：

``` tsx
const LeftView = defineComponent({
    props: {
      //每个组件必须接收一个params，以保证群体对比左右视图传入不同的params数据发起请求
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        },
        /*每个组件有tab切换的必须采用此形式以配合群体对比选择显示的tab页（例如，当前tab有三个，但是群体对比可以只选择显示一个，所以需要此配置）*/
        selectList: {
            type: Array as PropType<any[]>,
            default: () => [
                {
                    value: 'military_training',
                    label: "军训"
                },
                {
                    value: 'Party_and_Youth_League_School',
                    label: "党团校"
                },
                {
                    value: 'Collective_activities',
                    label: "集体活动"
                },
            ]
        }
    },
    setup(props, ctx) {
        const btnList = reactive(props.selectList)
        const isActive = ref(btnList[0].value as string)
        //弹窗表格是否可见
        const tableVisible = ref(false)

        const ColorCardClick = () => {
            tableVisible.value = true
        }
         //表格列配置
        const columns = [
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
                prop: 'user_name',
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
                prop: 'type',
                label: '类型',
                align: 'center'
            },
            {
                prop: 'res',
                label: '测评结果',
                align: 'center'
            },
            {
                slot: 'action',
                label: '操作',
                fixed: 'right',
                align: 'center',
                width: '150px'
            }
        ]
        //表格搜索字段关联配置
        const paramsObj = {
            campusId: 'stuCampusId',
            collegeId: 'stuCollegeId',
            majorId: 'stuMajorId',
            gradeId: 'stuGradeId',
            classId: 'stuClassId'
        }
        //表格搜索字段配置
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
      //表格数据加载事件
        const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
            console.log(params, pages);

            return Promise.resolve({
                code: 1,
                data: { total: 0, rows: [] },
                datas: null,
                datas2: null,
                info: '',
                msg: ''
            })
        }
         //导出文件事件
        const exportEvt = async (form: any, pages: PagesType) => {
            // const res = await exportWarnStuList({
            //   ...omit(params, ['endTime', 'startTime']),
            //   ...form,
            //   id: tableConfig.id,
            //   pageNum: pages.current,
            //   pageSize: pages.size,
            //   ident: props.ident,
            //   expExcel: true
            // })
            // downloadFile(res)
        }

        const renderView = () => {
         //视图代码
            return <div></div>
        }
        const instanceManager = inject<InstanceManager>('InstanceManager')
        onMounted(() => {
            instanceManager?.register('leftActive', isActive)
        })
        return () => {

            return (
                <div class={'military-left h100'} {...ctx.attrs}>
                    <div class={'flex align-items-c just-b mg-b20'}>
                        <c-title title={'基本信息画像'}></c-title>
                        <RedTab btnList={btnList}
                            isRed={false}
                            isActive={isActive.value}
                            onRedTabChange={(v: string) => isActive.value = v}
                        />
                    </div>
                    {renderView()}
                    <c-table-plus
                        columns={columns}
                        request={tableRequest}
                        searchConfig={searchConfig}
                        visible={tableVisible.value}
                        title={'军训参与情况'}
                        dialogWidth="1460px"
                        height="350px"
                        closed={() => tableVisible.value = false}
                        exportBtn={exportEvt}
                        v-slots={{
                            index: (info: { data: { $index: number } }) => info.data.$index + 1,
                            action: (_data: any) => <ElLink type="primary">学生个像</ElLink>
                        }}
                    >
                    </c-table-plus>
                </div>
            )
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
        // const data = useChildrenData({ ...props.params, ident: 'scholarship' })
        const levelPie = ref([])
        const moneyPie = ref([])
        const moneyMax = ref('')
        const levelMax = ref('')
        const instence = getCurrentInstance()
        const echarts = instence?.proxy?.$echarts
        const topChartInstence = ref<EChartsType>()
        const bottomChartInstence = ref<EChartsType>()
        const topChart = ref()
        const bottomChart = ref()
        const leagueChart = ref()
        const leagueChartInstance = ref<EChartsType>()
        const leaguePie = ref([])
        const initChart = (el: Ref<HTMLElement>, datas: Array<any>, chart: Ref<EChartsType | undefined>, text: string) => {
            if(!unref(el)) return
            chart.value = echarts?.init(unref(el))!;
            const colors = ['#005DA7', '#00C9F2', '#F39702', '#E3493E', '#231815', '#45A0E6'];
            
            const option: EChartsOption = {}
            chart.value?.setOption(option)
        }

        watch(props, () => {
            getAllChartData({ ...props.params, ident: 'military_training' }).then((res: any) => {
                console.log(11111111, res);

            })
        }, { immediate: true, deep: true })

        const instanceManager = inject<InstanceManager>('InstanceManager')

        watch(instanceManager!.get('leftActive'), v => {
            if(v === 'military_training'){
                nextTick(() => {
                    initChart(topChart, levelPie.value, topChartInstence, `参与率 ${levelMax.value || 0}%`)
                    initChart(bottomChart, moneyPie.value, bottomChartInstence, `军训合格率 ${levelMax.value || 0}%`)
                })
            } else {
                nextTick(()=>{
                    initChart(leagueChart, leaguePie.value, leagueChartInstance, '')
                })
            }
        }, { immediate: true })

        onUnmounted(() => {
            instanceManager?.clear('leftActive')
        })
        const renderView = () => {
            //视图代码
            return <div></div>
        }
        return () => {
            return <div class='military-right h100' {...content.attrs}>
                {renderView()}
            </div>
        }
    }
})

/**
 * 此组件为视图的主要组件，控制左右视图渲染，需要支持横纵布局（学生群像页面显示的是横向布局，群体对比为纵向布局）
 */
const MilitaryTraining = defineComponent({
    props: {
      //布局方向控制
        direction: {
            type: String as PropType<'horizontal' | 'vertical'>,
            default: 'horizontal'
        },
        //每个组件必须接收一个params，以保证群体对比左右视图传入不同的params数据发起请求
        params: {
            type: Object as PropType<BaseParams>,
            default: () => ({})
        }
    },
    setup(props, ctx) {
         //InstanceManager此工具类详细见utils工具文件夹
        provide('InstanceManager', new InstanceManager())

        return () => {
            return (
                <div
                    class={{
                        'military': true,//military为组件名，有单独的命名空间，不能重复，否则会产生样式覆盖问题
                        'flex': true,//必须属性
                        'horizontal': props.direction === 'horizontal',//必须属性
                        'vertical': props.direction === 'vertical'//必须属性
                    }}
                >
                {/* 左边视图 */}
                    <LeftView
                        class={{
                            'w49': props.direction === 'horizontal',//必须属性
                            'w100': props.direction === 'vertical'//必须属性
                        }}
                        params={props.params}
                        {...ctx.attrs}
                    />
                    {/* 右边视图 */}
                    <RightView
                        class={{
                            'w49': props.direction === 'horizontal',//必须属性
                            'w100': props.direction === 'vertical'//必须属性
                        }}
                        params={props.params}
                    />
                </div>
            )
        }
    }
})
// 此处导出组件，并在组件添加左右视图组件，以提供给群体关注选择视图使用
MilitaryTraining.Left = LeftView
MilitaryTraining.Right = RightView

export default MilitaryTraining

```