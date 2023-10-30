export default {
    leftTitle: '消费水平对比',
    rightTitle: '日均消费金额变化趋势',
    subLeftTitle: '主要敏感内容类型 _%d',
    subRightTitle: '主要敏感内容为 _%d',
    leftOpt(data: Array<{ [key: string]: any }>) {

    },
    rightOpt(data: { [key: string]: any }) {
        return {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
            icon: 'rect',
            x:'right',
            itemWidth: 12,
            itemHeight: 4,
            top: 30,
            data: ['突发贫困人群', '学校平均'],
            textStyle: {
                    color: "#3E5463",
                    fontFamily: 'Regular',
                }
            },
            // grid: {
            //     left: '3%',
            //     right: '4%',
            //     bottom: '3%',
            //     containLabel: true
            // },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.consumeDayAveData.map((item: any) => ({value: item.date}))
                // data.consumeDayAveData.map(item => ({value: item.date}))
            },
            yAxis: {
                type: 'value',
                name: "单位/元",
                nameTextStyle: {
                    color: "#3E5463",
                    fontFamily: 'Regular',
                    nameLocation: "start",
                },
            },
            series: [
                {
                  name: '突发贫困人群',
                  type: 'line',
                  stack: '',
                  color: '#1B528B',
                  data: data.consumeDayAveData.map((item: any) => ({value: item.money}))
                },
                {
                  name: '学校平均',
                  type: 'line',
                  stack: '',
                  color: '#B22A25',
                  data: data.consumeSchoolAveData.map((item: any) => ({value: item.money}))
                }
            ]
        }
    }
}