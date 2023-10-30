import { defineComponent, ref, renderSlot, PropType } from 'vue'
import { Close, Search } from '@element-plus/icons-vue'
import './index.scss'
interface TransferProps {
    name: string
    [key: string]: any
}
const Transfer = defineComponent({
    name: 'cTransfer',
    inheritAttrs: false,
    props: {
        selection: {
            type: Array as PropType<TransferProps[]>,
            default: () => ([])
        },
        title:{
            type: Array,
            default:()=>['待选名单', '已选名单']
        },
        width:{
            type: Array,
            default:()=>['55%', '42%']
        }
    },
    setup(props, content) {
        const searchVal = ref('')

        const handleKeyUpEnter = (e: any) => {
            content.emit('transferSearch', searchVal.value)
        }

        const remove = (idx: number, it: any) => {
            content.emit('removeTags', idx, it);
        }

        // content.expose({tagList})

        return () => {
            const { selection, title, width } = props
            return<>
                <div class='c-transfer'>
                    <section style={{width: width[0] as string}}>
                        <div class="title">{title[0]}</div>
                        <section>
                            <el-input class="mg-b20"
                                v-model={ searchVal.value }
                                clearable
                                placeholder="请输入姓名或学号搜索"
                                prefix-icon={ Search }
                                onInput={(event: any) => handleKeyUpEnter(event)}
                                onkeydown={(event: any) => {
                                    if(event.code === 'Enter') {
                                        handleKeyUpEnter(event)
                                    }
                                }}
                            />
                            <div class='mg-b10'>
                               {
                                 renderSlot(content.slots, 'top')
                               }
                            </div>
                            {
                                renderSlot(content.slots, 'default')
                            }
                        </section>
                    </section>

                    <section style={{width: width[1] as string}}>
                        <div class="title">{title[1]}</div>
                        <section>
                            <div class="already-select">
                                {
                                    selection.map((it, ix) => {
                                        return <div class="tag">
                                            <span title={it['name']}>{ it['name'] }</span>
                                            <el-icon size='16' color='#B1C1CF' onClick={() => remove(ix, it)}><Close /></el-icon>
                                        </div>
                                    })
                                }
                            </div>
                        </section>
                    </section>
                </div>
            </>
        }
    }
})

export default Transfer