import { SearchConfig } from '../common/Search';
import { MyResponse } from '@/service/index';
export interface PagesType {
    current: number
    size: number
    total: number
    small: boolean
}
interface Extra {
    request?: (data: any) => Promise<MyResponse>
    reqKey?: string
    target?: Array<string>
    params?: { [key: string]: string }
    default?: any
    formart?: (data: { [k: string]: any }) => Array<{label: string | number, value: string | number}> | void
}
export type searchConfigType = Array<SearchConfig & Extra>

export type requestResType = MyResponse<
    {
        total: number
        [key: string]: Array<{ [key: string]: any }> | any
    }
>