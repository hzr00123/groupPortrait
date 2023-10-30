interface LabelType {
    backgroundColor: string
    borderColor: string
    height: number
    borderRadius: number
    padding: number[]
    borderWidth: string
    borderType: string
    position: string | Array<string | number>
    color: string
    verticalAlign: string
    align: string
}

export interface ChartData {
    name?: string
    label?: LabelType
    children?: Array<ChartData>
}