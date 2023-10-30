// 旷课人群
export default {
    leftTitle: '上课平均出勤率',
    rightTitle: '缺勤课程特征',
    subLeftTitle: '_%s% 人群 _%d 平均出勤率  91.00%',
    subRightTitle: '缺勤课程主要特征为 _%s%',
    leftOpt(data: Array<{ [key: string]: any }>) {
        
    },
    rightOpt(data: Array<{ [key: string]: any }>) {
        return {
            series: [{
                type: 'wordCloud',
                sizeRange: [14, 30],
                rotationRange: [0, 0],
                rotationStep: 45,
                gridSize: 30,
                shape: 'diamond',
                width: '100%',
                height: '100%',
                textStyle: {
                    color: '#B22924',
                    // color: function() {
                    //   return 'rgb(' +
                    //       Math.round(Math.random() * 255) +
                    //       ', ' + Math.round(Math.random() * 255) +
                    //       ', ' + Math.round(Math.random() * 255) + ')'
                    // }
                },
                data: data?.map(i => ({...i, value: i.num}))
            }]
        }
    }
}