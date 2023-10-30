import Request from "./request";
import { AxiosResponse } from "axios";
import { ElNotification } from 'element-plus'
import type { RequestConfig } from "./request/types";

export interface MyResponse<T = any, S = any, C = any> {
  code: 0 | 1,
  data: T,
  datas: S,
  datas2: C,
  info: string,
  msg: string
}

// 重写返回类型
interface MyRequestConfig<T, R> extends RequestConfig<MyResponse<R>> {
  data?: T;
}

const request = new Request({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 1000 * 60 * 5,
  interceptors: {
    // 请求拦截器
    requestInterceptors: (config) => config,
    // 响应拦截器
    responseInterceptors: (result: AxiosResponse) => {
      if (result.config.responseType === 'blob') return result;
      if (result.data.code !== 1 && result.data.code !== 200) {
        ElNotification.error({ message: result.data.msg })
      }
      return result;
    },
  },
});

/**
 * @description: 函数的描述
 * @generic T 响应结构
 * @generic D 请求参数
 * @param {MyRequestConfig} config 不管是GET还是POST请求都使用data
 * @returns {Promise}
 */
const MyRequest = <T = any, D = any, S = any, C = any>(config: MyRequestConfig<D, T>) => {

  if(!config.method) config.method = 'post'
  if (config.method === "get" || config.method === "GET") {
    config.params = config.data;
  }
  return request.request<MyResponse<T, S, C>>(config);
};
// // 取消请求
// export const cancelRequest = (url: string | string[]) => {
//   return request.cancelRequest(url)
// }
// // 取消全部请求
// export const cancelAllRequest = () => {
//   return request.cancelAllRequest()
// }

export default MyRequest;
