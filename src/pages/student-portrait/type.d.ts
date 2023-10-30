import { Component } from "vue"

export interface TabPaneWarningType {
    catalog_name: string
    id: string
    warning: WarnMenuListRes | nul
    component: Component | JSX.Element
}