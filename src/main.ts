import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import store from "./store";
import router from "@/router";
import ElementPlus from "element-plus";
// import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import "element-plus/dist/index.css";
import 'virtual:svg-icons-register'    // 【svg-icons相关】
import '@/assets/font-family/index.less'
import './assets/styles/element-variables.scss'
import SvgIcon from '@/components/SvgIcon/index.vue'
import comprnents from '@/components/index';
import * as echarts from "echarts"
import 'echarts-wordcloud'
const app = createApp(App)
app.config.globalProperties.$echarts = echarts;
// import { vLoading } from 'element-plus';

// // 修复按需引入组件时loading指令失效问题
// app.directive('loading', vLoading);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.component('SvgIcon', SvgIcon)
// app.use(store).use(router).use(ElementPlus, { locale: zhCn }).use(comprnents).mount("#app");
app.use(store).use(router).use(ElementPlus).use(comprnents).mount("#app");
