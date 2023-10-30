import { getOrgType } from "@/api/modules/emphasisList";
import { getGPCatalogList } from "@/api/modules/labelManagement";
import { exportSelectedStuDetail, getBaseInfo, selectedStuAndRate, selectedStuDetail } from "@/api/modules/studentPortrait";
import { BaseParams } from "@/components/group-image/types";
import { Column } from "@/components/Table";
import { PagesType, requestResType, searchConfigType } from "@/components/Table-plus/index.d";
import { downloadFile } from "@/hooks";
import { getImageUrl } from "@/utils";
import { ElButton, ElCol, ElDialog, ElEmpty, ElMessage, ElRow, ElTabPane, ElTabs, ElTree } from "element-plus";
import { cloneDeep, omit } from "lodash";
import { computed, defineComponent, onErrorCaptured, onMounted, reactive, ref, VueElement, watch } from "vue";
import GroupTransfer from "./components/GroupTransfer";
import { GroupTransferValType } from "./components/types";
import component from './groupComponent';
import BaseComponent from './components/BaseComponent';
import './index.scss'
import { BaseListType } from "./components/BaseComponent/type";
import { userStore } from '@/store/user';
import { storeToRefs } from "pinia";
const store = userStore()

const GroupContrast = defineComponent({
  name: 'vsViewComponent',
  setup() {
    const contrastVisible = ref(false)
    const groupVisible = ref(false)
    const contrastLoading = ref(false)
    const groupLoading = ref(false)
    const mainLoading = ref(false)
    const tableVisible = ref(false)
    const treeData = ref([])
    const activeName = ref('')
    const { viewDirection } = storeToRefs(store)

    /**
     * 对比视图区域要渲染的dom组件
     */
    const vsDom = ref<JSX.Element | VueElement | null>(null)
    const vsInfo = reactive({
      left: {
        text: '',
        total: 0,
        rate: '0.00%'
      },
      right: {
        text: '',
        total: 0,
        rate: '0.00%'
      },
    })
    const groupRef = ref<{ validDate: () => { valid: boolean, data: GroupTransferValType } }>()
    /**
     * 群体的筛选数据params
     */
    const tableParams = reactive({
      left: {},
      right: {}
    })
    const studentListType = ref<'left' | 'right'>('left')
    const transferSelection = ref<Array<{ name: string, [key: string]: any }>>([])

    /**
     * 对比的数据：group对比的群体 contrast对比的内容
     */
    const vsData = reactive<{ group: GroupTransferValType, contrast: any[] }>({
      group: [
        {
          type: 1,
          values: []
        },
        {
          type: 1,
          values: []
        }
      ],
      contrast: []
    })

    const paramsObj = {
      campusId: 'stuCampusId',
      collegeId: 'stuCollegeId',
      majorId: 'stuMajorId',
      gradeId: 'stuGradeId',
      classId: 'stuClassId',
    }
    const stuSemesterOpt = ref([])
    const searchConfig = reactive<searchConfigType>([
      {
        inputWidth: '150px',
        type: 'select',
        label: '',
        placeholder: '学年',
        key: 'stuSchoolYear',
        options: [],
        target: ['stuSemester'],
        request: getBaseInfo,
        params: { schoolYear: 'stuSchoolYear' },
        formart(data) {
          stuSemesterOpt.value = data.semester?.map((i: string) => ({ label: i, value: i })) || []
        },
      },
      {
        inputWidth: '100px',
        type: 'select',
        label: '',
        placeholder: '学期',
        key: 'stuSemester',
        options: stuSemesterOpt
      },
      {
        inputWidth: '110px',
        type: 'select',
        label: '',
        placeholder: '校区',
        key: 'stuCampusId',
        request: getOrgType as any,
        reqKey: 'campusOrgList',
        opKey: 'id',
        opLabel: 'orgName',
        params: paramsObj,
        target: ['stuCollegeId', 'stuMajorId', 'stuGradeId', 'stuClassId']
      },
      {
        inputWidth: '200px',
        type: 'select',
        label: '',
        placeholder: '学院',
        key: 'stuCollegeId',
        opKey: 'id',
        opLabel: 'orgName',
        request: getOrgType as any,
        reqKey: 'collegeOrgList',
        target: ['stuMajorId', 'stuGradeId', 'stuClassId'],
        params: paramsObj
      },
      {
        inputWidth: '200px',
        type: 'select',
        label: '',
        placeholder: '专业',
        key: 'stuMajorId',
        opKey: 'id',
        opLabel: 'orgName',
        request: getOrgType as any,
        reqKey: 'majorOrgList',
        target: ['stuGradeId', 'stuClassId'],
        params: paramsObj
      },
      {
        inputWidth: '150px',
        type: 'select',
        label: '',
        placeholder: '年级',
        key: 'stuGradeId',
        opKey: 'id',
        opLabel: 'orgName',
        request: getOrgType as any,
        reqKey: 'gradeOrgList',
        target: ['stuClassId'],
        params: paramsObj
      },
      {
        inputWidth: '150px',
        type: 'select',
        label: '',
        placeholder: '班级',
        key: 'stuClassId',
        opKey: 'id',
        opLabel: 'orgName',
        request: getOrgType as any,
        reqKey: 'classOrgList',
        params: paramsObj
      },
      {
        inputWidth: '80px',
        type: 'select',
        label: '',
        placeholder: '性别',
        key: 'stuSex',
        opKey: 'value',
        opLabel: 'label',
        options: [
          {
            label: '男',
            value: '男'
          },
          {
            label: '女',
            value: '女'
          },
        ],
      },
      {
        inputWidth: '100px',
        type: 'select',
        placeholder: '民族',
        key: 'stuNation',
        options: []
      },
      {
        inputWidth: '110px',
        type: 'select',
        placeholder: '培养层次',
        key: 'stuStudentType',
        opKey: 'value',
        opLabel: 'label',
        options: [
          {
            label: '本科生',
            value: 1
          },
          {
            label: '研究生',
            value: 2
          },
        ],
      },
      {
        inputWidth: '110px',
        type: 'select',
        placeholder: '生源地',
        key: 'stuPlaceOrigin',
        options: []
      },
      {
        inputWidth: '110px',
        type: 'select',
        placeholder: '政治面貌',
        key: 'stuPolitics',
        options: []
      },
      {
        inputWidth: '110px',
        type: 'select',
        placeholder: '录取类型',
        key: 'stuEnrollType',
        options: []
      }
    ])

    const columns: Column = [
      {
        prop: 'name',
        label: '姓名',
        width: '110',
        align: 'center'
      },
      {
        prop: 'userName',
        label: '学号',
        width: '150',
        align: 'center'
      },
      {
        prop: 'sex',
        label: '性别',
        width: '80',
        align: 'center'
      },
      {
        prop: 'school_year',
        label: '学年',
        width: '150',
        align: 'center'
      },
      {
        prop: 'semester',
        label: '学期',
        width: '80',
        align: 'center'
      },
      {
        prop: 'campusName',
        label: '校区',
        width: '100',
        align: 'center'
      },
      {
        prop: 'collegeName',
        label: '学院',
        width: '100',
        align: 'center'
      },
      {
        prop: 'majorName',
        label: '专业',
        width: '100',
        align: 'center'
      },
      {
        prop: 'gradeName',
        label: '年级',
        width: '100',
        align: 'center'
      },
      {
        prop: 'className',
        label: '班级',
        width: '100',
        align: 'center'
      },
      {
        prop: 'nation',
        label: '民族',
        width: '60',
        align: 'center'
      },
      {
        prop: 'student_type',
        label: '培养层次',
        width: '100',
        align: 'center'
      },
      {
        prop: 'place_origin',
        label: '生源地',
        width: '100',
        align: 'center'
      },
      {
        prop: 'politics',
        label: '政治面貌',
        align: 'center',
        width: '100',
      },
      {
        prop: 'enroll_type',
        label: '录取类型',
        align: 'center',
        width: '100',
      }
    ]

    const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
      return selectedStuDetail({
        ...tableParams[studentListType.value],
        ...params,
        pageNum: pages.current,
        pageSize: pages.size,
      })
    }

    const exportEvt = async (form: any, pages: PagesType) => {
      const res = await exportSelectedStuDetail({
        ...tableParams[studentListType.value],
        ...form,
        pageNum: pages.current,
        pageSize: pages.size,
        expExcel: true
      })
      downloadFile(res)
    }
    onMounted(() => {
      getBaseInfo({}).then(res => {
        if (res.code == 1) {
          for (const key in res.data) {
            if (Object.prototype.hasOwnProperty.call(res.data, key)) {
              const ele = res.data[key] || [];
              if (key === 'enrollType') searchConfig.find(i => i.key === 'stuEnrollType')!.options = ele.map((i: string) => ({ label: i, value: i }))
              if (key === 'nation') searchConfig.find(i => i.key === 'stuNation')!.options = ele.map((i: { nationName: string; nation: number; }) => ({ label: i.nationName, value: i.nation }))
              if (key === 'politics') searchConfig.find(i => i.key === 'stuPolitics')!.options = ele.map((i: { politicName: string; politics: number; }) => ({ label: i.politicName, value: i.politics }))
              if (key === 'placeOrigin') searchConfig.find(i => i.key === 'stuPlaceOrigin')!.options = ele.map((i: string) => ({ label: i, value: i }))
              if (key === 'schoolYear') searchConfig.find(i => i.key === 'stuSchoolYear')!.options = ele.map((i: string) => ({ label: i, value: i }))
              if (key === 'semester') searchConfig.find(i => i.key === 'stuSemester')!.options = ele.map((i: string) => ({ label: i, value: i }))
            }
          }
        }
      })
      getGPCatalogList().then(res => {
        if (res.code == 1 && res.data) {
          treeData.value = res.data
        }
      })
    })

    const groupClose = async () => {
      groupLoading.value = true
      const [left, right] = vsData.group
      const leftObj = {}
      const rightObj = {}
      let leftText = ''
      let rightText = ''
      left.values.forEach(v => {
        for (const key in v) {
          if (Object.prototype.hasOwnProperty.call(v, key)) {
            const ele = v[key];
            if (left.type === 1) {
              if (key === 'equal') leftText += ` ${ele} `
              else leftText += `${ele.label}`
            } else leftText += `${ele.label}, `


            if (key !== 'type' && key !== 'equal') {
              leftObj[key] = ele.value
            }
          }
        }
        if (left.type === 1) leftText += ', '
      })
      right.values.forEach(v => {
        for (const key in v) {
          if (Object.prototype.hasOwnProperty.call(v, key)) {
            const ele = v[key];
            if (right.type === 1) {
              if (key === 'equal') rightText += ` ${ele} `
              else rightText += `${ele.label}`
            } else rightText += `${ele.label}, `

            if (key !== 'type' && key !== 'equal') {
              rightObj[key] = ele.value
            }
          }
        }
        if (right.type === 1) rightText += ', '
      })

      tableParams.left = leftObj
      tableParams.right = rightObj
      vsInfo.left.text = leftText
      vsInfo.right.text = rightText
      const leftRes = await selectedStuAndRate(tableParams.left)
      if (leftRes.code == 1 && leftRes.data) {
        vsInfo.left.rate = leftRes.data.rate
        vsInfo.left.total = leftRes.data.total
      }
      const rightRes = await selectedStuAndRate(tableParams.right)
      if (rightRes.code == 1 && rightRes.data) {
        vsInfo.right.total = rightRes.data.total
        vsInfo.right.rate = rightRes.data.rate
      }
      groupLoading.value = false
    }

    const groupSubmit = () => {
      const { valid, data } = groupRef.value!.validDate()
      if (valid) {
        vsData.group = data
        groupVisible.value = false
        groupClose()
      }
      else ElMessage({ type: 'warning', message: '请将群体对比信息补充完整！' })
    }

    const handleNodeClick = (data: any, node: any) => {
      if (!data.children || data.children.length < 1) {
        const item = transferSelection.value.find(i => i.id === data.id)
        if (!item) {
          const parentArr = []
          let currentData = node
          while (currentData.parent) {
            parentArr.push({ ...omit(currentData.data, 'children'), level: currentData.level })
            currentData = currentData.parent
          }
          const _parentArr = parentArr.reverse()
          const pData = _parentArr.reduce((pre: any, cur: any) => {
            if (Object.keys(pre).length < 1) {
              pre = cur
              return pre
            }
            let item = pre
            while (item.children) {
              item = item.children
            }
            item.children = cur
            return pre
          }, {})
          data.pData = pData
          transferSelection.value.push({ name: data.catalog_name, ...data })
        }
      }
    }

    const transferSearch = (val: string) => {
      getGPCatalogList({ catalog_name: val }).then(res => {
        if (res.code == 1 && res.data) {
          treeData.value = res.data
        }
      })
    }
    const transferRemoveTags = (index: number) => {
      transferSelection.value.splice(index, 1)
    }

    const transferSubmit = () => {
      vsData.contrast = transferSelection.value
      contrastVisible.value = false
    }
    // watch(viewDirection, v => console.log('viewDirection=========', v), {deep: true})
    onErrorCaptured((err, instance, info) => {
      console.error('组件在渲染期间出错>>>>>>>>>>>>>>>')
      console.error('错误对象>>>>>>', err)
      console.error('错误信息来源info>>>>>>>>', info)
      console.error('instance>>>>>>>>', instance)
      return false
    })
    const deepEach = (arr: any[]) => {
      if (arr.length < 1) return []
      const _arr: any[] = []
      cloneDeep(arr).forEach(i => {
        let item = i
        if (_arr.findIndex(v => v.id === i.id) === -1) _arr.push(i)
        while (item.children) {
          if (_arr.findIndex(v => v.id === item.children.id) === -1) _arr.push(item.children)
          item = item.children
        }
      })
      _arr.forEach(i => delete i.children)
      function buildTree(catalogs: any[], parentId = null) {
        const tree = [];
        for (const catalog of catalogs) {
          if (catalog.parent_id === parentId) {
            const node: { [key: string]: any } = {
              id: catalog.id,
              label: catalog.catalog_name,
              value: catalog.ident,
              key: catalog.ident,
              show: false
            };
            const children = buildTree(catalogs, catalog.id);
            if (children.length > 0) {
              node.children = children;
            }
            tree.push(node);
          }
        }
        return tree;
      }

      return buildTree(_arr)
    }
    /**
     * 群体及对比内容选择完毕后查询视图组件
     */
    const vsSearchEvt = () => {
      // console.log(tableParams, vsData);
      //首先校验对比群体及对比内容，再渲染视图组件
      let groupValid = true

      vsData.group.forEach(i => {
        if (i.values.length < 1) groupValid = false
        i.values.forEach(v => {
          for (const key in v) {
            if (Object.prototype.hasOwnProperty.call(v, key)) {
              const ele = v[key];
              if (!ele) groupValid = false
            }
          }
        })
      })

      const contrastValid = vsData.contrast.length > 0
      //校验不通过不执行视图渲染
      if (!groupValid || !contrastValid) {
        !groupValid && ElMessage({ type: 'warning', message: '请将对比群体信息补充完整！' })
        !contrastValid && ElMessage({ type: 'warning', message: '请选择对比的内容！' })
        return
      }
      vsDom.value = null
      MountList = []
      mainLoading.value = true
      const tb = deepEach(vsData.contrast.map(i => i.pData))
      activeName.value = tb[0].key

      const LeftComponent = computed(() => BaseComponent(
        component[activeName.value],
        {
          params: tableParams.left as BaseParams,
          selectList: tb as unknown as BaseListType[],
          ident: activeName.value,
          type: 'left'
        }
      ))
      const RightComponent = computed(() => BaseComponent(
        component[activeName.value],
        {
          params: tableParams.right as BaseParams,
          selectList: tb as unknown as BaseListType[],
          ident: activeName.value,
          type: 'right'
        }
      ))

      vsDom.value = (
        <div class="concrete">
          <ElTabs v-model={activeName.value} class="demo-tabs">
            {
              tb.map(i => {
                return (
                  <ElTabPane label={i.label} name={i.key} key={i.key}>
                    <div class={{
                      'pane-contnet': true,
                      'flex': true,
                      'content-direction': viewDirection.value.left || viewDirection.value.right

                    }}
                      v-loading={mainLoading.value}
                    >
                      <div class={'group-data vs-view'}>
                        <header class='flex align-items-c just-c'>
                          <span class='des-title'>已选群体</span>
                          <span class='des-tex'>{vsInfo.left.text}</span>
                        </header>
                        <LeftComponent.value onMount={mount} />
                      </div>
                      <div class={'vs-tag'}>
                        vs
                      </div>
                      <div class={'group-data vs-view'}>
                        <header class='flex align-items-c just-c'>
                          <span class='des-title'>对比群体</span>
                          <span class='des-tex'>{vsInfo.right.text}</span>
                        </header>
                        <RightComponent.value onMount={mount} />
                      </div>
                    </div>
                  </ElTabPane>
                )
              })
            }
          </ElTabs>
        </div>
      )
    }


    let MountList = []
    const mount = (count: number) => {
      MountList.push(count)
      if (MountList.length === 2) {
        // 懒求得做其他的，直接都挂载2秒后结束转圈
        setTimeout(() => {
          mainLoading.value = false
        }, 2000);
      }
    }


    /**
     * 对比群体项render
     */
    const groupRender = () => {
      if (vsData.group.every(i => i.values.length < 1)) {
        return (
          <div
            class='group mg-b20 flex align-items-c just-c'
            onClick={() => groupVisible.value = true}
            style='cursor: pointer;'
          >
            <ElButton class='add-btn' link icon='Plus' >
              添加群体
            </ElButton>
          </div>
        )
      } else {
        function dataRender(type: 'left' | 'right') {
          return (
            <ElRow>
              <ElCol class={'mg-b15'}>
                <div class={{ 'text-info flex align-items-c': true, 'flex-end': type === 'left' }} >
                  <span style='color: #767676;'>{type === 'left' ? '已选学生群体：' : '已选对比群体：'}</span>
                  <span style='color: #00538F;' class='ellipsis'>{vsInfo[type].text}</span>
                  <span>共<span style='color: #00538F;'> {vsInfo[type].total}</span>人，</span>
                  <span>在全部学生中占比</span>
                  <span style='color: #F39702;'>{vsInfo[type].rate}</span>
                </div>
              </ElCol>
              <ElCol>
                <div style={{ textAlign: type === 'right' ? 'start' : 'end' }}>
                  <ElButton size="default" onClick={() => groupVisible.value = true}>
                    重新筛选
                  </ElButton>
                  <ElButton
                    size="default"
                    type="primary"
                    color="#1B528B"
                    onClick={() => {
                      studentListType.value = type
                      tableVisible.value = true
                    }}
                  >
                    查看名单
                  </ElButton>
                </div>
              </ElCol>
            </ElRow>
          )
        }
        return (
          <div class='group mg-b20 flex align-items-c' v-loading={groupLoading.value}>
            <div class={'group-data'}>
              {
                dataRender('left')
              }
            </div>
            <div class={'vs-tag'}>
              vs
            </div>
            <div class={'group-data'}>
              {
                dataRender('right')
              }
            </div>
          </div>
        )
      }
    }

    /**
     * 对比内容项render
     */
    const contrastRender = () => {
      if (vsData.contrast.length < 1) {
        return (
          <div
            class='contrast flex align-items-c just-c'
            onClick={() => contrastVisible.value = true}
            style='cursor: pointer;'
          >
            <ElButton class='add-btn' link icon='Plus'>
              添加对比内容
            </ElButton>
          </div>
        )
      } else {
        return (
          <div class='contrast flex align-items-c'>
            {
              vsData.contrast.map(i => {
                return <span class='const-tag'>{i.name}</span>
              })
            }
            <ElButton style='margin-bottom: 15px;' size="default" type="primary" color="#1B528B" onClick={() => contrastVisible.value = true}>
              重新选择
            </ElButton>
          </div>
        )
      }
    }

    /**
     * 对比视图render函数
     */
    const vsContentRender = () => {
      if (vsDom.value) return vsDom.value
      return <ElEmpty description="暂无对比内容数据" imageSize={320}>
        {{
          image: () => <img src={getImageUrl('conempty')} alt="" />,
          description: () => <p class='no-content-des'>暂无对比内容数据</p>
        }}
      </ElEmpty>
    }
    return () => {

      return (
        <div class='group-contrast w100 h100'>
          <div class='vs-content'>
            {groupRender()}
            {contrastRender()}
          </div>
          <ElButton
            color="#005DA7"
            class='qury-btn'
            onClick={vsSearchEvt}
          >
            查询
          </ElButton>
          <section v-loading={contrastLoading.value}>
            {vsContentRender()}
          </section>
          <ElDialog
            width={1300}
            modelValue={groupVisible.value}
            title='选择群体'
            destroy-on-close
            onClosed={() => { groupVisible.value = false }}
            close-on-click-modal={false}
            v-slots={{
              footer: () => (
                <>
                  <ElButton onClick={() => groupVisible.value = false}>取消</ElButton>
                  <ElButton type="primary" onClick={groupSubmit}>
                    保存
                  </ElButton>
                </>
              )
            }}
          >
            <GroupTransfer value={cloneDeep(vsData.group)} ref={groupRef} />
          </ElDialog>
          <ElDialog
            width={880}
            modelValue={contrastVisible.value}
            title='选择对比内容'
            close-on-click-modal={false}
            destroy-on-close
            onClosed={() => {
              contrastVisible.value = false
              transferSelection.value = []
            }}
            v-slots={{
              footer: () => (
                <>
                  <ElButton onClick={() => contrastVisible.value = false}>取消</ElButton>
                  <ElButton type="primary" onClick={transferSubmit}>保存</ElButton>
                </>
              )
            }}
          >
            <c-transfer
              title={['待选画像内容', '已选画像内容']}
              width={['48%', '48%']}
              selection={transferSelection.value}
              onTransferSearch={transferSearch}
              onRemoveTags={transferRemoveTags}
            >
              {{
                default: () => {
                  return (
                    <ElTree
                      style='height: 390px; overflow-y: auto;'
                      data={treeData.value}
                      props={{
                        children: 'children',
                        label: 'catalog_name',
                      }}
                      node-key="label"
                      onNode-click={handleNodeClick}
                      v-slots={{
                        default: (item: { node: { label: string; childNodes: any[] }; }) => {
                          return (
                            <>
                              {
                                item.node.childNodes && item.node.childNodes.length > 0 &&
                                <img src={getImageUrl('treeIcon')} style='margin-right: 10px;' />
                              }

                              <span
                                style={{
                                  paddingLeft: item.node.childNodes && item.node.childNodes.length > 0 ? '0px' : '25px'
                                }}
                              >
                                {item.node.label}
                              </span>
                            </>
                          )
                        }
                      }}
                    />
                  )
                }
              }}
            </c-transfer>
          </ElDialog>

          <c-table-plus
            title='学生名单'
            dialogWidth="1460px"
            height="450px"
            row={6}
            visible={tableVisible.value}
            searchConfig={searchConfig}
            columns={columns}
            request={tableRequest}
            requestDataKey='list'
            exportBtn={exportEvt}
            closed={() => tableVisible.value = false}
            v-slots={{
              index: (arg: any) => {
                const { data } = arg
                return <div>{data.$index + 1}</div>
              },
              action: (arg: any) => {
                const { data } = arg
                return <el-button style="color:#005DA7" link>学生个像</el-button>
              }
            }}
          />
        </div>
      )
    }
  }
})

export default GroupContrast