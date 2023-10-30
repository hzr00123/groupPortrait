import { createPinia } from "pinia";
import piniaPluginPersist from "pinia-plugin-persist";
const store = createPinia();
/**
 * 数据持久化
 *插件 pinia-plugin-persist 可以辅助实现数据持久化功能
 *开启数据缓存
 * persist: {enabled: true,strategies: [{key: 'my_user',storage: localStorage]}
 * persist: {enabled: true,strategies: [{storage: localStorage,paths: ['name', 'age']}]}
 * */
store.use(piniaPluginPersist);
export default store;
