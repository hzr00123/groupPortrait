import { getWarningRuleList, warnLevel } from "@/api/modules/advancedSetting";
import { exportWarnStuList, getWarnStuList } from "@/api/modules/attentionGroup";
import { getOrgType } from "@/api/modules/emphasisList";
import { WarnListType, WarnMenuListRes } from "@/api/types/attentionGroup";
import { WarningRuleEntity } from "@/api/types/labelManagement";
import { downloadFile } from "@/hooks";
import { getImageUrl } from "@/utils";
import { ElDialog, ElEmpty, ElLink } from "element-plus";
import { omit } from "lodash";
import { computed, defineAsyncComponent, defineComponent, inject, onErrorCaptured, onMounted, reactive, Ref, ref, Suspense, Teleport, unref } from "vue";
import { BaseParams } from "../group-image/types";
import { Column } from "../Table";
import { searchConfigType, PagesType, requestResType } from "../Table-plus/index.d";
import WarningDescription from "../WarningDescription";
import './index.scss'
import { SealInfo } from "./type";

const WarningSeal = defineComponent({
  props: {
    ident: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  setup(props, ctx) {
    const seal = inject<Ref<WarnMenuListRes>>('seal', ref([]))
    const params = inject<BaseParams>('params', {} as any)
    const warningDes = reactive({
      visible: false,
      title: '',
      loading: false,
      warnConfig: {} as WarningRuleEntity
    })
    const tableConfig = reactive({
      visible: false,
      title: '',
      id: '' as string | number
    })

    const sealClick = (e: Event, info: SealInfo) => {
      e.stopPropagation()
      tableConfig.visible = true
      tableConfig.title = info.rule_name
      tableConfig.id = info.rule_id
      columns.value = initColumns()
      if (info.table_title) {
        const extraClum: any[] = JSON.parse(info.table_title)
        if (extraClum.length > 0) {
          extraClum.reverse().forEach((i: { prop: string; label: string; }) => {
            columns.value.splice(9, 0, { ...i, align: 'center', width: `${i.label.length * 18 + 40}px` })
          })
        }
      }
    }
    const initColumns = () => {
      return [
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
          slot: 'action',
          label: '操作',
          fixed: 'right',
          align: 'center',
          width: '150px'
        }
      ]
    }
    const columns = ref<Column>(initColumns())

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
    const tableRequest = (params: any, pages: PagesType): Promise<requestResType> => {
      return getWarnStuList({
        id: tableConfig.id,
        ...omit(params, ['endTime', 'startTime']),
        pageNum: pages.current,
        pageSize: pages.size,
        ident: props.ident
      }) as unknown as Promise<requestResType>
    }

    const exportEvt = async (form: any, pages: PagesType) => {
      const res = await exportWarnStuList({
        ...omit(params, ['endTime', 'startTime']),
        ...form,
        id: tableConfig.id,
        pageNum: pages.current,
        pageSize: pages.size,
        ident: props.ident,
        expExcel: true
      })
      downloadFile(res)
    }


    const tagClick = (e: Event, info: SealInfo) => {
      e.stopPropagation()
      warningDes.loading = true
      warningDes.visible = true
      warningDes.title = info.rule_name
      warningDes.warnConfig = {} as any
      getWarningRuleList({ "id": info.rule_id }).then(res => {
        if (res.code == 1 && res.data) {
          if (res.data.warning_level) {
            res.data.warning_level = JSON.parse(res.data.warning_level)
          }
          warningDes.warnConfig = res.data
        }
      }).finally(() => warningDes.loading = false)
    }

    const sealKey = inject<Ref<string>>('sealKey', ref(''))
    const teleportTo = ref()
    onMounted(()=>{
      teleportTo.value = document.getElementById('seal-' + sealKey.value)
    })
    return () => {
      const data = unref(seal).find(i => i.catalog_name === props.name && i.ident === props.ident)?.warnList

      if (!data || data.length < 1) {
        return ''
      }
      
      if(!teleportTo.value) return ''
      
      return (
          <Teleport to={teleportTo.value}>
            <div {...ctx.attrs} id='warning-seal'>
              <div class="container-box">
                {
                  data.map(i => {
                    return (
                      <div class="icon">
                        <img class="tag" src={getImageUrl('warn-tag')} alt="" onClick={e => { tagClick(e, i) }} />
                        <div class="txt" onClick={e => sealClick(e, i)}>{i.rule_name}{i.warn_num}人</div>
                      </div>
                    )
                  })
                }
              </div>

              <c-table-plus
                columns={columns.value}
                request={tableRequest}
                searchConfig={searchConfig}
                visible={tableConfig.visible}
                title={tableConfig.title}
                dialogWidth="1460px"
                height="350px"
                closed={() => tableConfig.visible = false}
                exportBtn={exportEvt}
                v-slots={{
                  index: (info: { data: { $index: number } }) => info.data.$index + 1,
                  action: (_data: any) => <ElLink type="primary">学生个像</ElLink>
                }}
              >
              </c-table-plus>
              <ElDialog title="预警说明" width={'1300px'} modelValue={warningDes.visible} onClosed={() => warningDes.visible = false}>
                <div class={'dialog-warning-des'} v-loading={warningDes.loading}>
                  <div class={'c-title mg-b20'}>{warningDes.title}</div>
                  {
                    Object.keys(warningDes.warnConfig).length > 0
                      ?
                      <WarningDescription config={warningDes.warnConfig} />
                      :
                      <ElEmpty />
                  }
                </div>
              </ElDialog>
            </div>
          </Teleport>
      )
    }
  }
})

// export default defineAsyncComponent({
//   loader: async () => WarningSeal,
//   delay: 1000
// })
export default WarningSeal