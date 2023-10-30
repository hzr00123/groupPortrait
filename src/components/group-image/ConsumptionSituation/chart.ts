export interface LineCinfig {
  xAxis: string[],
  legend: string[],
  series: { data: number[], name: string }[]
}

export interface PieCinfig {
  series: { name: string, value: number }[]
}

// 双饼图配置对象
export interface TwoPieCinfig {
  series: { name: string, data: { name: string, value: number }[] }[]
}

// 差异和规律
export interface LawDiffBar {
  series: { name: string, arr: { name: string, value: number, percentage: number }[] }[],
  legend: string[],
  Axis: string[]
}

const color = ["#005DA7", "#00C9F2", "#8C6C4E", "#F39702", "#E3493E", "#231815", "#4D5FC1", "#45A0E6"]
const pieToolTip = { formatter: "{b} : {c}" }
// 折线图配置项
export function getLineOptions(config: LineCinfig, unit: string, shadow: boolean, legend: boolean) {
  const option = {
    color: color,
    title: {
      text: "单位/" + unit,
      top: "5%",
      left: 0,
      textStyle: {
        color: "#333333",
        fontSize: 14,
      },
    },
    tooltip: {
      trigger: "axis",
    },
    grid: {
      top: "20%",
      left: 0,
      right: 0,
      bottom: "4%",
      containLabel: true,
    },
    legend: {
      show: legend,
      itemWidth: 10,
      itemHeight: 4,
      left: 100,
      top: 10,
      icon: "rect",
      textStyle: {
        color: '#000014',
        fontSize: 14
      }
    },
    xAxis: [
      {
        type: "category",
        data: config.xAxis,
        axisTick: { show: false, },
      },
    ],
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: config.series.map(item => {
      return {
        name: item.name,
        type: "line",
        smooth: true,
        symbol: "none",
        areaStyle: {
          opacity: shadow ? 0.8 : 0,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{ offset: 0, color: '#cfdae6' }, { offset: 1, color: '#fff' }],
          }
        },
        data: item.data,
      }
    })
  };
  return option
}

// 饼图配置项
export function getPieOptions(config: PieCinfig, unit: string) {
  const option = {
    color: color,
    title: {
      text: config?.series?.reduce((a, b) => a + b.value, 0).toFixed(2) + unit,
      top: "50%",
      left: "35%",
      textStyle: {
        color: "#203449",
        fontSize: 14,
      },
    },
    legend: {
      orient: "vertical",
      top: "middle",
      right: "5%",
      bottom: "0%",
      textStyle: {
        color: "#3E5463",
        fontSize: 14,
        backgroundColor: "transparent",
      },
      formatter: function (name: string) {
        let total = 0;
        let target = 0;
        for (let i = 0, l = config.series.length; i < l; i++) {
          total += config.series[i].value;
          if (config.series[i].name == name) {
            target = config.series[i].value;
          }
        }
        return name + '  ' + target.toFixed(2) + "万元  " + ((target / total) * 100).toFixed(2) + '%';
      },
      itemWidth: 10,
      itemHeight: 4,
      itemGap: 15,
      icon: "rect",
      pageIconColor: "#FF9500",
      pageIconSize: 12,
      pageIconInactiveColor: "#7f7f7f",
      tooltip: { show: true },
    },
    tooltip: pieToolTip,
    series: [
      {
        radius: ["60%", "70%"],
        center: ["40%", "50%"],
        type: "pie",
        label: {
          show: false,
          formatter: '{d} %'
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
        },
        data: config.series,
      },
    ],
  };
  return option
}

// 消费结构饼图配置项
export function getStructurePieOptions(config: PieCinfig, unit: string) {
  const option = {
    color: color,
    title: {
      text: config?.series?.reduce((a, b) => a + b.value, 0).toFixed(2) + unit,
      top: "50%",
      left: "35%",
      textStyle: {
        color: "#203449",
        fontSize: 14,
      },
    },
    legend: {
      orient: "vertical",
      top: "middle",
      right: "5%",
      bottom: "0%",
      textStyle: {
        color: "#3E5463",
        fontSize: 14,
        backgroundColor: "transparent",
      },
      formatter: function (name: string) {
        let total = 0;
        let target = 0;
        for (let i = 0, l = config.series.length; i < l; i++) {
          total += config.series[i].value;
          if (config.series[i].name == name) {
            target = config.series[i].value;
          }
        }
        return name + '  ' + target.toFixed(2) + "万元  " + ((target / total) * 100).toFixed(2) + '%';
      },
      itemWidth: 10,
      itemHeight: 4,
      itemGap: 15,
      icon: "rect",
      pageIconColor: "#FF9500",
      pageIconSize: 12,
      pageIconInactiveColor: "#7f7f7f",
      tooltip: { show: true },
    },
    tooltip: pieToolTip,
    series: [
      {
        radius: ["60%", "70%"],
        center: ["40%", "50%"],
        type: "pie",
        label: {
          show: false,
          formatter: '{d} %'
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
        },
        data: config.series,
      },
    ],
  };
  return option
}

// 左侧地图配置项
export function getMapOptions(data: Array<{ name: string, value: number }>) {
  const option = {
    color: ["#E3493E", "#1B528B", "#00C9F2"],
    title: {
      text: data.reduce((a, b) => a + b.value, 0) + "万元",
      top: "center",
      left: "center",
      textStyle: {
        color: "#203449",
        fontSize: 14,
      },
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      top: "middle",
      right: "0%",
      bottom: "0%",
      textStyle: {
        color: "#3E5463",
        fontSize: 14,
        backgroundColor: "transparent", // 文字块背景色，一定要加上，否则对齐不会生效
        rich: {
          a: {
            // width: 60,
            padding: [0, 0, 0, 0],
            color: "#3E5463",
            fontWeight: "bold",
          },
          c: {
            width: 60,
            padding: [0, 0, 0, 0],
          },
        },
      },
      itemWidth: 10,
      itemHeight: 4,
      itemGap: 10,
      icon: "rect",
      pageIconColor: "#FF9500", //图例分页左右箭头图标颜色
      pageIconSize: 12, //当然就是按钮的大小
      pageIconInactiveColor: "#7f7f7f", // 禁用的按钮颜色
      tooltip: {
        show: true,
      },
    },
    tooltip: {
      formatter: "{b} : {c}  ({d}%)",
    },
    series: [
      {
        radius: ["40%", "50%"],
        center: ["25%", "40%"],
        type: "pie",
        label: {
          show: true,
          formatter: '{d} %'
        },
        labelLine: {
          show: true,
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
        },
        data: data,
      },
    ],
  };
  return option
}

// 消费差异饼图配置项
export function getDiffPieOptions(config: TwoPieCinfig) {
  const textStyle = { color: "#203449", fontSize: 14 }
  const TitleTextStyle = { fontSize: '18', color: '#000000', textAlign: 'center' }
  const option = {
    color: color,
    title: [
      { text: "人均月消费金额分布", bottom: 10, left: "center", textStyle: textStyle },
      { text: config.series[0].name, left: '24%', top: '32%', textAlign: 'center', textStyle: TitleTextStyle },
      { text: config.series[1].name, left: '64%', top: '32%', textAlign: 'center', textStyle: TitleTextStyle }
    ],
    legend: {
      orient: "vertical",
      top: "middle",
      right: "0%",
      textStyle: { color: "#3E5463", fontSize: 14, backgroundColor: "transparent" },
      itemWidth: 10,
      itemHeight: 4,
      itemGap: 10,
      icon: "rect",
    },
    tooltip: pieToolTip,
    series: config.series.map(item => {
      return {
        // name: item.name,
        radius: ["35%", "55%"],
        center: item.name === "男" ? ["25%", "40%"] : ["65%", "40%"],
        type: "pie",
        label: { show: true, formatter: '{d} %' },
        labelLine: { show: true },
        itemStyle: { borderColor: "#fff", borderWidth: 2 },
        data: item.data,
      }
    })
  };

  return option
}

// 右侧柱状图配置项
export function getRightBarOptions(config: { xAxis: string[], datas: number[] }) {
  const option = {
    title: {
      text: '单位/万元',
      top: 0,
      left: 0,
      textStyle: {
        color: '#333333',
        fontSize: 14,
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: [
      {
        type: 'category',
        data: config.xAxis,
        axisTick: { //刻度
          alignWithLabel: true,
          show: false,
        },
        triggerEvent: true,
        axisLabel: {
          // rotate: 0, //代表逆时针旋转
          interval: 'auto',
          formatter: function (value: string) {
            if (value.length > 6) {
              return `${value.slice(0, 6)}...`;
            }
            return value
          }
        },
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        }
      },
    ],
    series: [
      {
        type: 'bar',
        barWidth: 10,
        data: config.datas,
        itemStyle: {
          color: '#E3493E',
          borderRadius: [0, 0, 0, 0] //左上，右上，右下、左下
        },
      },
    ]
  };
  return option
}

// 充值饼图配置项
export function getRechargePieOptions(config: PieCinfig, unit: string, chart: any) {
  const total = config.series.reduce((a, b) => a + b.value, 0).toFixed(1)
  const option = {
    title: {
      text: `累计充值 {a|${total}} ` + unit,
      bottom: 0,
      left: "center",
      textStyle: {
        color: "#203449",
        fontSize: 16,
        fontWeight: 400,
        rich: {
          a: {
            fontSize: 16,
            fontWeight: 600
          },
        }
      },
    },
    color: ["#E3493E", "#1B528B", "#00C9F2"],
    tooltip: { formatter: "{b} : {c}万" },
    series: [
      {
        radius: ["25%", "35%"],
        center: ["50%", "50%"],
        type: "pie",
        label: {
          show: true,
          alignTo: 'edge',
          color: "#203449",
          formatter: '{b}:{c}万 \n {d}%',
          // minMargin: 2,
          edgeDistance: 2,
          lineHeight: 24,
          fontSize: 14,
        },
        labelLayout: function (params: any) {
          const isLeft = params.labelRect.x < chart.getWidth() / 2;
          const points = params.labelLinePoints;
          points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
          return {
            labelLinePoints: points
          };
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 0,
          maxSurfaceAngle: 80
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
        },
        data: config?.series,
      },
    ],
  };

  return option
}

// 消费频次多个饼图配置项
export function getMultiplePieOptions(config: any, Width: number) {
  const { feMaleMap, feMalePie, maleMap, malePie } = config
  const TitleStyle1 = { color: "#203449", fontSize: 14 }
  const TitleStyle2 = { color: "#203449", fontSize: 18 }
  const Pie = {
    type: "pie",
    radius: ["9%", "15%"],
    label: {
      formatter: '{name|{b}}\n',
      minMargin: 5,
      edgeDistance: 10,
      lineHeight: 15,
      rich: { time: { fontSize: 10, color: '#999' } }
    },
    labelLine: { length: 15, length2: 0, maxSurfaceAngle: 80 },
    itemStyle: { borderColor: "#fff", borderWidth: 2, },
  }
  const Guage = {
    type: 'gauge',
    startAngle: 90,
    endAngle: -270,
    radius: "16%",
    center: ["36%", "17%"],
    pointer: { show: false },
    progress: { show: true, overlap: false, roundCap: true, clip: false, itemStyle: { color: '#45A0E6' } },
    axisLine: { lineStyle: { width: 10 } },
    splitLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    title: { fontSize: 14 },
    detail: {
      fontSize: 14,
      color: '#45A0E6',
      borderRadius: 20,
      formatter: '{value}%',
      offsetCenter: [0, '-20%']
    }
  }

  const option = {
    color: color,
    title: [
      {
        text: `男生人均月吃早餐 ${maleMap.bfCount || 0} 次 ${maleMap.bfUCount || 0} 人吃早餐`,
        top: 185,
        left: 30,
        textStyle: TitleStyle1,
      },
      {
        text: `女生人均月吃早餐 ${feMaleMap.bfCount || 0} 次 ${feMaleMap.bfUCount || 0} 人吃早餐`,
        top: 185,
        right: 20,
        textStyle: TitleStyle1,
      },
      {
        text: `男生人均月吃午餐 ${maleMap.lCount || 0} 次 ${maleMap.lUCount || 0} 人吃午餐`,
        top: 360,
        left: 30,
        textStyle: TitleStyle1,
      },
      {
        text: `女生人均月吃午餐 ${feMaleMap.lCount || 0} 次 ${feMaleMap.lUCount || 0} 人吃午餐`,
        top: 360,
        right: 20,
        textStyle: TitleStyle1,
      },
      {
        text: `男生人均月吃晚餐 ${maleMap.dCount || 0} 次 ${maleMap.dUCount || 0} 人吃晚餐`,
        top: 522,
        left: 30,
        textStyle: TitleStyle1,
      },
      {
        text: `女生人均月吃晚餐 ${feMaleMap.dCount || 0} 次 ${feMaleMap.dUCount || 0} 人吃晚餐`,
        top: 522,
        right: 20,
        textStyle: TitleStyle1,
      },
      {
        text: "男",
        top: 95,
        left: "12%",
        textStyle: TitleStyle2,
      },
      {
        text: "女",
        top: 95,
        right: "28%",
        textStyle: TitleStyle2,
      },
      {
        text: "男",
        top: 275,
        left: "12%",
        textStyle: TitleStyle2,
      },
      {
        text: "女",
        top: 275,
        right: "28%",
        textStyle: TitleStyle2,
      },
      {
        text: "男",
        top: 450,
        left: "12%",
        textStyle: TitleStyle2,
      },
      {
        text: "女",
        top: 450,
        right: "28%",
        textStyle: TitleStyle2,
      },
    ],
    legend: {
      itemWidth: 10,
      itemHeight: 6,
      right: 10,
      orient: 'horizontal',
    },
    tooltip: {
      formatter: (params: any) => {
        if (params.name === "就餐率") {
          return "就餐率：" + params.value + "%"
        } else {
          return params.name + "：" + params.value + "人"
        }
      },
    },
    series: [
      {
        ...Pie,
        center: ["14%", "20%"],
        labelLayout: function (params: any) {
          const isLeft = params.labelRect.x < Width / 2;
          const points = params.labelLinePoints;
          points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
          return { labelLinePoints: points };
        },
        data: malePie.breakfast,
      },
      {
        ...Guage,
        center: ["36%", "20%%"],
        data: [{ value: maleMap.bfRate || 0, name: '就餐率' }],
      },
      {
        ...Pie,
        center: ["70%", "20%%"],
        labelLayout: function (params: any) {
          const isLeft = params.labelRect.x < Width / 2;
          const points = params.labelLinePoints;
          points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
          return { labelLinePoints: points };
        },
        data: feMalePie.breakfast,
      },
      {
        ...Guage,
        center: ["92%", "20%%"],
        data: [{ value: feMaleMap.bfRate || 0, name: '就餐率' }],
      },
      {
        ...Pie,
        center: ["14%", "53%"],
        type: "pie",
        labelLayout: function (params: any) {
          const isLeft = params.labelRect.x < Width / 2;
          const points = params.labelLinePoints;
          points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
          return { labelLinePoints: points };
        },
        data: malePie.lunch,
      },
      {
        ...Guage,
        center: ["36%", "53%"],
        data: [{ value: maleMap.lRate || 0, name: '就餐率' }],
      },
      {
        ...Pie,
        center: ["70%", "53%"],
        labelLayout: function (params: any) {
          const isLeft = params.labelRect.x < Width / 2;
          const points = params.labelLinePoints;
          points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
          return { labelLinePoints: points };
        },
        data: feMalePie.lunch,
      },
      {
        ...Guage,
        center: ["92%", "53%"],
        data: [{ value: feMaleMap.lRate || 0, name: '就餐率' }],
      },
      {
        ...Pie,
        center: ["14%", "85%"],
        labelLayout: function (params: any) {
          const isLeft = params.labelRect.x < Width / 2;
          const points = params.labelLinePoints;
          points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
          return { labelLinePoints: points };
        },
        data: malePie.dinner,
      },
      {
        ...Guage,
        center: ["36%", "85%"],
        data: [{ value: maleMap.dRate || 0, name: '就餐率' }],
      },
      {
        ...Pie,
        center: ["70%", "85%"],
        labelLayout: function (params: any) {
          const isLeft = params.labelRect.x < Width / 2;
          const points = params.labelLinePoints;
          points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
          return { labelLinePoints: points };
        },
        data: feMalePie.dinner,
      },
      {
        ...Guage,
        center: ["92%", "85%"],
        data: [{ value: feMaleMap.dRate || 0, name: '就餐率' }],
      },
    ],
  };

  return option
}

// 差异和规律柱状图配置项
export function getLawDiffBarOptions(config: LawDiffBar, index: number) {
  // 图例有几个，就需要几个series对象，对象中data长度等于Axis长度
  const series = []
  // 顶开柱条
  const prop = {
    z: 0,
    type: 'bar',
    barWidth: 10,
    stack: "value",
    data: [] as any[],
    itemStyle: { color: 'transparent' },
    label: { show: false },
    tooltip: { show: false },
  }

  // 外边框
  const boder = {
    z: 0,
    type: 'bar',
    barGap: '-130%',
    data: [] as any[],
    barWidth: 16,
    itemStyle: { color: 'transparent', borderColor: '#005DA7', borderWidth: 1, borderRadius: 15 },
    label: { show: false },
    tooltip: { show: false },
  }
  series.push(prop, boder)
  const cahe = {}

  for (let i = 0; i < config.legend.length; i++) {
    const key = config.legend[i];
    const item = {
      z: 1,
      name: key,
      type: 'bar',
      barWidth: 10,
      stack: "value",
      data: [],
      label: {
        show: true, position: 'top', formatter: (params: any) => {
          if (params.data.label){
           return params.data.label + "%"
          }else{
            return ""
          }
        }
      }
    }
    if (i === 0) {
      item['itemStyle'] = { borderRadius: [10, 0, 0, 10] }
    } else if (i === config.legend.length - 1) {
      item['itemStyle'] = { borderRadius: [0, 10, 10, 0] }
    }
    series.push(item)
    cahe[key] = item
  }

  config.series.forEach(e => {
    prop.data.push(2)
    let max = 0
    e?.arr?.forEach((item, index) => {
      item.name = config.legend[index]
      item.value > max && (max = item.value)
      cahe[config.legend[index]].data.push({ value: item.value, label: item.percentage })
    })
    boder.data.push(index === 3 ? (max + 5) : (max + 11))
  })

  const option = {
    color: color,
    tooltip: { trigger: 'axis' },
    grid: { top: index === 3 ? 30 : 50, bottom: 0, right: 0, left: 80 },
    legend: { top: index === 3 ? 0 : 10, right: 0, orient: 'horizontal', itemWidth: 10, itemHeight: 4 },
    xAxis: [
      {
        type: 'value',
        axisLine: { show: false },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        max: "dataMax",
      },
    ],
    yAxis: [
      {
        type: 'category',
        data: config.Axis,
        axisLine: { show: false },
        axisTick: { show: false },
        triggerEvent: true,
        axisLabel: { interval: 'auto', width: 80, overflow: 'truncate' },

      }
    ],
    series: series
  };
  return option
}