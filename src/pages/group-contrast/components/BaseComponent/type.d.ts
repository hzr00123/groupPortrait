import { BaseParams } from "@/components/group-image/types"

export type WrappedComponent = null

export interface BaseListType {
    id: string
    key: string
    label: string
    value: string
    show: boolean
    children?: BaseListType[]
}
export interface ConfigType {
    selectList: BaseListType[]
    params: BaseParams
    ident: string
    type: 'left' | 'right'
}