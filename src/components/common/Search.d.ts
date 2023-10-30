// 定义自定义属性接受到的属性接口
export interface SearchConfig {
  type: string,
  key: string,
  label?: string,
  labelWidth?: string,
  placeholder?: string,
  inputWidth?: string,
  ref?: string,
  filterable?: boolean,
  remote?: boolean,
  options?: Array<{ [key: string]: string | number }> | Ref<Array<{ [key: string]: string | number }>>,
  opKey?: string,
  opLabel?: string,
  dataType?: any,
  dataFormat?: string,
  collapse?: boolean,
  showAllLevels?: boolean,
  multiple?: boolean,
  emitPath?: boolean,
  checkStrictly?: boolean,
  inputUnit?: string,
}

export interface TabsConfig {
  label: string,
  key: string | number,
  icon?: string,
  show?: boolean,
}

export interface arrConf {
  name: string,
  value: number,
}
export interface WordCloudConfig {
  data1: Array<arrConf>,
  data2: Array<arrConf>,
  data3: Array<arrConf>,
  position: 'center' | 'bottom',
  leftText?:string,
  rightText?:string,
}

export interface RedTabConfig {
  label: string,
  value: string | number,
}

export interface CardConf {
  title: string,
  value: string | number,
  isUnit: boolean,
  color: string,
  width: string,
  height: string,
  fontSize: string
  describe?: string,
  unit?: string,
}

export interface ProgressListConf {
  name: string,
  rate: number | string,
  value: number | string,
  color?: string,
  type?: string
  unit?: string
}
export interface ProgressConf {
  list: Array<ProgressListConf>,
  lableWidth: number,
  lableAlign: string,
  valuePosition?: string,
  color?: string,
  unit?: string
  needTag?: boolean
  valueWidth?: number
  margin?: string,
  height?: string
}

export interface ColorCardConf {
  title: string,
  value: string | number,
  color: string,
  icon: string,
  isUnit: boolean,
  unit?: string,
  width?: string
  strSliceNum?: number
}

export interface LegendListConf {
  color: string,
  label: string
}

export interface BarListConf {
  name: string,
  arr: Array<{ percentage: string | number, value: string | number,fillet?:string }>
}

export interface MultiSegmentConf {
  list: Array<BarListConf>,
  colorList: Array<LegendListConf>,
  unit: string,
  lableWidth: string,
  lableAlign: 'left' | 'center' | 'right',
  height?: string
}

export interface chinaMapConf {
  datas: Array<{
    name: string
    value: number | string
    data: Array<{
      name: string
      rate: string | string
      value: number | string
    }>
  }>
}

export interface RowsCardConf {
  title: string,
  topVal: string | number,
  topVal2: string | number,
  bottomVal: string | number,
  bottomVal2: string | number,
  topText: string,
  topText2: string,
  bottomText: string,
  bottomText2: string,
  unit: string,
  unit2: string,
  bgColor:string
}