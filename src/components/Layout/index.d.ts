export interface Menu {
    path: string //菜单唯一标识，与路由名保持一致
    name: string //菜单显示名称
    meta: {
        title: string
        icon: string
        hidden?: boolean
    },
    children?: Menu[] | undefined //子菜单
}

export interface Form {
    dbloginkey: string
    JSESSIONID: string
}