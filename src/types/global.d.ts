export { }

import type * as echarts from "echarts"
declare module 'vue' {
    interface ComponentCustomProperties {
        $echarts: typeof echarts
    }
}

declare global {
    interface Window {
        WebUI: any;
        AMap: any;
        AMapUI: any;
    }
}