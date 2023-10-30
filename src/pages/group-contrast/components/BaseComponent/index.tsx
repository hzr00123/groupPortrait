import { defineComponent, Component, h, ref, provide, unref, computed } from "vue"
import { ConfigType } from "./type"
import { storeToRefs } from "pinia";
import { userStore } from "@/store/user";

export default <T extends Component>(WrappedComponent: T, config: ConfigType) => {
  return defineComponent({
    components: {
      WrappedComponent,
    },
    emits: ['mount'],
    setup(props, { attrs }) {
      const store = userStore()
      provide('vscmType', config.type)
      const { viewDirection } = storeToRefs(store)
      const isActive = ref('')
      provide('params', config.params)
      const list = computed(() => {
        const item = config.selectList.find(i => i.key === config.ident)
        return item?.children
      })
      if (unref(list) && unref(list)!.length > 0) isActive.value = unref(list)![0].key

      return () => h(WrappedComponent, {
        ...props,
        ...attrs,
        params: config.params,
        selectList: unref(list),
        isActive: unref(isActive),
        direction: viewDirection.value.left || viewDirection.value.right ? 'horizontal' : 'vertical'
      });
    },
    mounted() {
      // 新增挂载报告，挂载完成报个1过去
      this.$emit("mount", 1)
    },
  })
}