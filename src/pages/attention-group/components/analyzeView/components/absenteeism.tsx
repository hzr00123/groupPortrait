import { PropType, defineComponent, getCurrentInstance, onMounted, nextTick } from 'vue'
import { ElProgress } from 'element-plus'
const Absenteeism = defineComponent({ name: 'absenteeism'})

const leftView = defineComponent({
    name: 'leftView',
    props: {
        data: {
            type: Object as PropType<{ [k: string]: any}>,
            default:() => ({})
        },
    },
    setup(props, content) {
        const { data } = props;
        return () => {
            return <div class='absenteeism-left'>
                <div class="absence-duty">
                    <h4>缺勤次数</h4>
                    <span>{ data.total } <span class="unit">次</span></span>
                </div>
                <ElProgress type="circle" color="#1B528B" stroke-width={ 10 } width={ 140 } percentage={ data.rate }>
                    {{
                        default:(arg:{percentage:number}) =>{
                            return <span class="internal-style">{ arg.percentage || 0 }<span>%</span></span>
                        }
                    }}
                </ElProgress>
            </div>
        }
    }
})

const rightView = defineComponent({
    props: {
        data: {
            type: Array as PropType<any[]>,
            default:() => ([])
        },
    },
    setup(props, content) {
        const { data } = props
        const instance = getCurrentInstance();
        const echart = instance?.proxy?.$echarts;
        const initRightCharts = () => {
            const el: HTMLElement = instance?.refs.WordCloud as any;
            let myChart = echart?.getInstanceByDom(el)
            if (myChart == null) {
                myChart = echart?.init(el);
            }
            let datas = data.map((it: any) => {
                return {
                    name: it.name,
                    value: it.num
                }
            });
            let maxVal = Math.max(...datas.map((item:any) => item.value)); 
            let option = {
                backgroundColor: '#FFFFFF',
                series: [{
                  type: 'wordCloud',
                  sizeRange: [14, 30],
                  rotationRange: [0, 0],
                  rotationStep: 45,
                  gridSize: 30,
                  shape: 'circle',
                  width: '100%',
                  height: '100%',
                  textStyle: {
                    color: function (params: { value: number }) {
                        var opacity =  params.value / maxVal;
                        return 'rgba(178, 41, 36, ' + opacity + ')';
                    }
                  },
                  data: datas
                }]
            };
            myChart?.setOption(option)
        }
        onMounted(() => {
            nextTick(() => {
                initRightCharts()
            })
        })
        return () => {
            return <div class='absenteeism-right' ref='WordCloud' style="height: 250px" ></div>
        }
    }
})

Absenteeism.leftView = leftView;
Absenteeism.rightView = rightView;
export default Absenteeism