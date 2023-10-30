export interface AnalysisParamsResponse {
    ident: string,
    leftData: any[] | { [k: string]: any},
    rightData:any[] | { [k: string]: any},
}

export interface AnalyzeTemplateConfigType {
    params: AnalysisParamsResponse
}