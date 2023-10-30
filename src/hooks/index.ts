import { useRequest } from "./request";
import { computed, inject, InjectionKey, isRef, onUnmounted, provide, Ref, ref, unref, watch } from "vue";
import { getChartData, changeChartData } from "@/api/modules/studentPortrait";
import { ChartData } from "@/api/types/studentPortrait";
import { ElLoading } from "element-plus";
import { MyResponse } from "@/service";
import { isArray } from "lodash";
export { useRequest };

/**
 * 
 * @param tree 查找的数据源
 * @param func 回调
 * @param field 需要放到结果里的字段（不传代表所有项都需要放入）
 * @param path 最后结果
 * @returns 查找到的子集的所有直系父级节点的field数据
 */
export const treeFindPath = (tree: any[], func: (data: any) => any, field = "", path: any[] = []): any[] => {
  if (!tree) return []
  for (const data of tree) {
    field === "" ? path.push(data) : path.push(data[field]);
    if (func(data)) return path
    if (data.children) {
      const findChildren = treeFindPath(data.children, func, field, path)
      if (findChildren.length) return findChildren
    }
    path.pop()
  }
  return []
}

export function deepNormalizeData(arr: any[], keys = ['name', 'id'], icon = ['wenjianjia', 'tag']) {
  const res: any[] = []
  arr.forEach(i => {
    if (i.children && i.children.length > 0) {
      i.children = deepNormalizeData(i.children, keys, icon)
    }
    res.push({
      label: i[keys[0]],
      value: i[keys[1]],
      icon: !!i.children ? icon[0] : icon[1],
      ...i
    })
  })
  return res
}

export const downloadFile = (response: any, fileName?: string) => {
  const { data, headers } = response;

  if (data.size) {
    let blob = new Blob([data]);
    if (!fileName) {
      fileName = decodeURI(headers['content-disposition'].split('filename=').pop());
    }
    if ('msSaveOrOpenBlob' in navigator && typeof navigator.msSaveOrOpenBlob === 'function') {
      navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      const elink = document.createElement('a');
      elink.download = fileName;
      elink.style.display = 'none';
      elink.href = URL.createObjectURL(blob);
      document.body.appendChild(elink);
      elink.click();
      URL.revokeObjectURL(elink.href);
      document.body.removeChild(elink);
    }
  } else {
    console.error("文件大小为空")
  }
}

/**
 * 群像模块请求hook，该hook会依据依赖项变动自动发起请求。同时会把请求后的数据provide注入子组件，子组件通过inject('dataSource')得到其值
 * @param params 请求参数
 * @param dependent 依赖项，类型与watch接收的监听类型一致。若不传则只执行一次。依赖项变动会重新发起请求。默认接收provide('dependent')的值
 * @returns 请求得到的数据
 */
export const usePortraitRequest = (params: ChartData, dependent?: Array<Ref | Function> | Ref) => {
  const data = ref<MyResponse>({ code: 0, data: null, datas: null, datas2: null, info: '', msg: '' })
  let _dependent = dependent
  if (!_dependent) {
    _dependent = inject('dependent', ref(0))
  } else {
    if (isArray(_dependent)) {
      _dependent = _dependent.concat(inject('dependent', [ref(0)]))
    }
    if (isRef(_dependent)) {
      const dep = inject('dependent', [ref(0)])
      dep.push(_dependent as Ref<any>)
      _dependent = dep
    }
  }

  provide('dataSource', data)
  const loading = inject<(v: boolean) => void>('setLoding', ()=>{})
  watch(
    _dependent!,
    () => {
      // const loading = ElLoading.service({
      //   lock: true,
      //   text: '加载中...',
      //   background: 'rgba(0, 0, 0, 0.7)',
      // })
      loading(true)
      const _parmas = { ...computed(() => params).value }
      if (isRef(_parmas.ident)) _parmas.ident = _parmas.ident.value as string
      for (let key in _parmas) {
        _parmas[key] = unref(_parmas[key])
      }
      const res = getChartData(_parmas)
      res.then(res => {
        data.value = res
        // loading.close()
        loading(false)
      // }).catch(() => loading.close())
      }).catch(() => loading(false))
    },
    {
      immediate: true,
      deep: true
    }
  )
  return data
}

/**
 * 群像模块子组件获取数据hook
 * @param params 请求参数
 * @returns 群像模块子组件获取数据
 */
export const useChildrenData = (params: ChartData) => {
  let data = inject<Ref<MyResponse>>(
    'dataSource',
    ref<MyResponse>({ code: 0, data: null, datas: null, datas2: null, info: '', msg: '' })
  )
  if (!data.value) {
    data = usePortraitRequest(params)
  }
  return data
}