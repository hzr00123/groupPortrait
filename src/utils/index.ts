import { cloneDeep } from "lodash";
import { computed, isReactive, isRef, readonly, ref, Ref } from "vue";

export const getImageUrl = (name: string, type = 'png') => {
  return new URL(`/src/assets/imgs/${name}.${type}`, import.meta.url).href
}

/**
 * 组件实例管理器,应用于群像模块左右区域组件通信
 */
class InstanceManager {
  /**
   * 实例对象容器
   */
  private instances: Ref<{ [key: string]: Ref<any> | object }> = ref({});
  /**
   * 注册实例
   * @param key
   * @param instance 
   */
  register(key: string, instance: Ref<any>): void {
    if (key in this.instances.value) console.error('该实例已存在，重复注册会覆盖原有实例')
    if (!isRef(instance) && isReactive(instance)) {
      console.error('注册实例必须是响应式的ref或reactive对象')
      return
    }
    this.instances.value[key] = instance
  }

  /**
   * 清除实例
   * @param key
   */
  clear(key: string): void {
    delete this.instances.value[key]
  }

  /**
   * 根据key获取注册的组件实例
   * @param key 
   */
  get(key: string): Ref<any> {
    return computed(() => cloneDeep(this.instances.value[key]))
  }
}

// export const instanceManager = new InstanceManager();
export default InstanceManager

// 获取日期
export const getDay = (day: number) => {
  const doHandleMonth = (month: string | number) => {
    let m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  }
  let today = new Date();
  let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds); //注意，这行是关键代码
  let tYear = today.getFullYear();
  let tMonth: string | number = today.getMonth();
  let tDate: string | number = today.getDate();
  tMonth = doHandleMonth(tMonth + 1);
  tDate = doHandleMonth(tDate);
  return tYear + "-" + tMonth + "-" + tDate;
}

export const getiGradientColor = (color1: string, color2: string, ratio: number) => {
  // 将颜色值转换为 RGB 数组
  function colorToRGB(color: string) {
    const hex = color.replace(/^#/, '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b };
  }

  // 根据比例计算插值结果
  function interpolate(value1: number, value2: number, ratio: number) {
    return value1 + (value2 - value1) * ratio;
  }

  // 将 RGB 数组转换为颜色值
  function RGBToColor(r: number, g: number, b: number) {
    return `#${decimalToHex(r)}${decimalToHex(g)}${decimalToHex(b)}`;
  }

  function decimalToHex(decimal: number) {
    // 将十进制转换为两位的十六进制值
    const hex = decimal.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  // 将颜色转换为 RGB 数组
  const rgb1 = colorToRGB(color1);
  const rgb2 = colorToRGB(color2);

  // 计算每个颜色通道的插值
  const r = Math.round(interpolate(rgb1.r, rgb2.r, ratio));
  const g = Math.round(interpolate(rgb1.g, rgb2.g, ratio));
  const b = Math.round(interpolate(rgb1.b, rgb2.b, ratio));

  // 将插值结果转换为 RGB 颜色值
  return RGBToColor(r, g, b);
}

// 导入图片
export const getImage = (url: string) => {
  return new URL(`../assets/${url}`, import.meta.url).href;
}

// 获取当前时-分
export const getNowHoursMinutes = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return [hours, minutes < 10 ? "0" + minutes : minutes]
}

export const mapKey = '0efc8c6fe4432f09ed9996dd40645a6b'

export const  _getMaxValue = (arr:any)=> {
  const max = Math.max(...arr);
  if (max % 5 === 0) {  
    return max;  
  } else {  
    let remainder = max % 5;  
    let addValue = 5 - remainder;  
    return max + addValue;  
  }  
}
