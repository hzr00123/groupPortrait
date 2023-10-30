import { ElButton } from "element-plus"
import './styles/FooterBtns.scss'
interface propsType {
    active: number
    prev: () => void
    next: () => void
    back: () => void
    submit: () => void
}
const renderFooterBtns = (props: propsType) => {
    const { active, prev, submit, next, back } = props
    return (
        <div class='btn-box'>
            {
                active == 1 && <ElButton onClick={back}>取消</ElButton>
            }
            {
                active > 1 && active <= 5 && <ElButton onClick={prev}>上一步</ElButton>
            }
            {
                active < 5 && <ElButton color="#005DA7" onClick={next}>下一步</ElButton>
            }
            {
                active == 5 && <ElButton color="#005DA7" onClick={submit}>生成标签</ElButton>
            }
        </div>
    )
}

export default renderFooterBtns