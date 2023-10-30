import { defineComponent, onBeforeMount, onBeforeUpdate, onMounted, PropType, reactive, readonly, Ref, ref, Slot, toRaw, toRef, unref, watch } from "vue";
import { Column } from "../Table";
import { PagesType, requestResType, searchConfigType } from "./index.d";
export * from './index.d'
import Search from '@/components/common/Search.vue'
import { ElDialog, FormInstance } from "element-plus";

const DialogTable = defineComponent({
    props: {
        columns: {
            type: Array as PropType<Column>,
            required: true
        },
        request: {
            type: Function as PropType<(params: any, pages: PagesType, sort?: string | number) => Promise<requestResType>>,
            required: true
        },
        searchConfig: {
            type: Array as PropType<searchConfigType>,
            required: true
        },
        page: {
            type: Boolean,
            default: true
        },
        title: {
            type: String
        },
        visible: {
            type: Boolean,
            default: false
        },
        closed: {
            type: Function as PropType<() => any>
        },
        dialog: {
            type: Boolean,
            default: true
        },
        dialogWidth: {
            type: String
        },
        requestDataKey: {
            type: String,
            default: 'rows'
        },
        exportBtn: {
            type: Function
        },
        row: {
            type: Number,
            default: 0
        }
    },
    emits : ['sortClick'],
    setup(props, content) {

        const _searchConfig = reactive(props.searchConfig)
        const tableData = ref<Array<{ [key: string]: any }>>([])
        const loading = ref(false)
        const pages = reactive<PagesType>({
            current: 1,
            size: 10,
            total: 0,
            small: true
        })
        const sortObj = ref({})
        const form = reactive({})
        const searchRef = ref<{ reset: () => void }>()
        props.searchConfig.forEach(i => {
            i.key && (form[i.key] = null)
        })

        const initData = async () => {
            getData(form, pages,)
            const selectResMap = new Map() //优化重复请求，存储请求结果
            const resArr = _searchConfig.filter(i => !!i.request)
            for (let index = 0; index < resArr.length; index++) {
                const i = resArr[index];
                const dataIndex = _searchConfig.findIndex(p => p.key === i.key)
                if(selectResMap.has(i.request)){
                    const res = selectResMap.get(i.request)
                    if (res.code == 1) {
                        if(i.formart && typeof i.formart === 'function'){
                            const opt = i.formart(res.data)
                            if(opt) _searchConfig[dataIndex].options = opt
                        } else 
                        _searchConfig[dataIndex].options = res.data[i.reqKey!]
                    }
                } else {
                    const res = await i.request!({})
                    selectResMap.set(i.request, res)
                    if (res.code == 1) {
                        if(i.formart && typeof i.formart === 'function'){
                            const opt = i.formart(res.data)
                            if(opt) _searchConfig[dataIndex].options = opt
                        } else 
                        _searchConfig[dataIndex].options = res.data[i.reqKey!]
                    }
                }
            }
        }
        
        const defaultValue = ()=>{
            const vals = _searchConfig.filter(i => i.default)
            vals.forEach(i => {
                form[i.key] = unref(i.default)
            })
        }

        onMounted(async () => {
            defaultValue()
            if (props.dialog && props.visible) {
                await initData()
                return
            }
            if(!props.dialog) await initData()
        })
        onBeforeUpdate(async () => {
            if (props.visible) {
                defaultValue()
                await initData()
            }
        })
        const selectChange = (key: string) => {
            const resArr = _searchConfig.filter(i => !!i.target)
            resArr.forEach(async (i) => {
                if (i.key === key) {
                    i.target?.forEach(v => {
                        form[v] = null
                    })
                    if (i.request && typeof i.request === 'function') {
                        const pam = {}
                        for (const key in i.params) {
                            if (Object.prototype.hasOwnProperty.call(i.params, key)) {
                                const element = i.params[key];
                                pam[key] = form[element]
                            }
                        }
                        const res = await i.request(pam)
                        if (res.code == 1) {
                            i.target?.forEach(it => {
                                const index = _searchConfig.findIndex(p => p.key === it)
                                const item = _searchConfig[index]
                                if(i.formart && typeof i.formart === 'function'){
                                    const opt = i.formart(res.data)
                                    if(opt) item.options = opt
                                } else item.options = res.data[item.reqKey!]
                            })
                        }
                    }
                }
            })
        }
        const changeSort =(obj:any) =>{
          sortObj.value = obj
          content.emit('sortClick',obj)
        }
        const getData = (params: any, pages: PagesType,sort?:string|number) => {
            loading.value = true
            props.request(params, pages,sort).then(res => {
                if (res.code == 1 && !!res.data) {
                    tableData.value = res.data[props.requestDataKey]
                    pages.total = res.data.total
                }else{
                  tableData.value = []
                  pages.total = 0
                }
                loading.value = false
            }).catch(() => loading.value = false)
        }
        watch(
            [toRef(pages, 'current'), toRef(pages, 'size'), sortObj],
            () => {
                getData(form, pages)
            },
            { deep: true }
        )

        watch(toRef(props, 'visible'), v => {
            if(v === false) {
                pages.current = 1
                pages.size = 10
                pages.total = 0
            }
        })

        const reload = () => {
            pages.current = 1
            pages.size = 10
            pages.total = 0
            getData(form, pages)
        }

        const renderTable = () => {
            const { columns, exportBtn, row } = props
            return (
                <div class='dialog-table-plus'>
                    {
                        _searchConfig && _searchConfig.length > 0 && <Search
                            ref={searchRef}
                            search-config={_searchConfig}
                            searchForm={form}
                            rowNum={row}
                            onQueryClick={reload}
                            onResetClick={async () => {
                                defaultValue()
                                await initData()
                                reload()
                            }}
                            onSelectChange={selectChange}
                            onExportClick={exportBtn?.bind(null, form, pages)}
                            isExport={!!exportBtn}
                        />
                    }
                    <c-table
                        {...content.attrs}
                        v-loading={loading.value}
                        pages={pages}
                        data={tableData.value}
                        columnList={unref(columns)}
                        stripe
                        onChangeCurrent={(v: number) => pages.current = v}
                        onChangeSize={(v: number) => pages.size = v}
                        onChangeSort={changeSort}
                        headerCellStyle={{
                            background: '#E4E7ED',
                            color: '#000000',
                            fontWeight: 'bold',
                            fontFamily: 'Medium',
                        }}
                        v-slots={content.slots}
                    />
                </div>
            )
        }
        const footerRender = () => {
            const { slots } = content
            const dom: { [key: string]: Slot } = {}
            if (slots.footer) dom.footer = slots.footer
            if (Object.keys(dom).length > 0) return dom
        }

        content.expose({
            reload,
            data: readonly(tableData),
            form: readonly(form),
            pages: readonly(pages),
            reset: ()=> {
                defaultValue()
                searchRef.value?.reset
            }
        })
        return () => {
            const { dialog, title, visible, closed, dialogWidth } = props

            return (
                <div class='table-plus-cm'>
                    {
                        dialog
                            ?
                            <ElDialog
                                destroyOnClose
                                title={title}
                                modelValue={visible}
                                onClosed={() => {
                                    tableData.value = []
                                    searchRef.value?.reset()
                                    closed && closed()
                                }}
                                width={dialogWidth}
                            >
                                {renderTable()}
                                {
                                    footerRender()
                                }
                            </ElDialog>
                            :
                            renderTable()
                    }
                </div>
            )
        }
    }
})

export default DialogTable