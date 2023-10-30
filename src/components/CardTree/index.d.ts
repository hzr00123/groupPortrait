export interface Tree {
    id: string
    label: string
    [key: string]: string | number
    icon?: string
    slot?: string
    children?: Tree[]
}