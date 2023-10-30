<template>
    <div class="lsummary">
        <div class="lsummary-top">
            学习生活行为总结
        </div>
        <div class="lsummary-cont">
            <div class="outstanding">
                <div class="outstanding-title">{{btcName.seledTargetData.value}}</div>
                <div class="outstanding-con">
                    <div class="interg">
                        <LsummaryGoodIntegrity></LsummaryGoodIntegrity>
                    </div>
                    <div class="lawd">
                        <LsummaryGoodLaw></LsummaryGoodLaw>
                    </div>
                </div>
            </div>
            <div class="tobeimproved">
                <div class="tobeimproved-title">{{btcName.seledCompareData.value}}</div>
                <div class="tobeimproved-con">
                    <div class="interg">
                        <LsummaryPoorIntegrity></LsummaryPoorIntegrity>
                    </div>
                    <div class="lawd">
                        <LsummaryPoorLaw></LsummaryPoorLaw>
                    </div>
                </div>
            </div>
        </div>
        <div class="lsummary-sumup">
            <div class="sumup-item">完整性：学生每周的学习生活活动内容是完整的，包含“寝室住宿”“食堂就餐”“教室学习”“图书馆学习”“体育馆运动”“浴室沐浴”“超市购物”</div>
            <div class="sumup-item">规律性：学生每周的学习生活活动习惯是规律的，进行每一项活动内容的时间点规律</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import LsummaryGoodIntegrity from "../charts/LsummaryGoodIntegrity.vue"
import LsummaryGoodLaw from "../charts/LsummaryGoodLaw.vue"
import LsummaryPoorIntegrity from "../charts/LsummaryPoorIntegrity.vue"
import LsummaryPoorLaw from "../charts/LsummaryPoorLaw.vue"
import {userStore} from "@/store/btc"

  let myStore = userStore();
  const btcName = inject("btcName", {} as any)
</script>

<style lang="scss" scoped>
.lsummary{
    width: 100%;
    height: 460px;
    background:linear-gradient(-45deg, transparent 15px, #FFFFFF 0%, rgba(255,255,255,0.86) 100%);
    margin-top: 30px;
    .lsummary-top{
        width: 100%;
        height: 58px;
        border-bottom: 1px solid #D8D8D8;
        font-size: 20px;
        font-family: Medium;
        font-weight: 500;
        color: #000000;
        line-height: 58px;
        padding: 0px 25px;
        position: relative;
        &::after{
            content: " ";
            display: inline-block;
            width: 30px;
            height: 4px;
            background: #B22A25;
            border-radius: 2px;
            position: absolute;
            left: 25px;
            bottom: 0px;
        }
    }
    .lsummary-cont{
        width: 100%;
        padding-top: 20px;
        display: flex;
        .outstanding{
           flex: 1;
            .outstanding-title{
                height: 25px;
                font-size: 18px;
                font-family: SemiBold;
                color: #203449;
                line-height: 25px;
                margin-left: 20px;
                position: relative;
                &::before{
                    content: "";
                    width: 8px;
                    height: 12px;
                    display: inline-block;
                    background: url("@/assets/imgs/sanjiaoxing.png");
                    position: absolute;
                    left:-20px;
                    top:6.5px
                }
            }
            .outstanding-con{
                height: 235px;
                position: relative;
                display: flex;
                &::after{
                    content: "";
                    width: 1px;
                    height: 100px;
                    background: #D8D8D8;
                    display: inline-block;
                    position: absolute;
                    right:0px;
                    top:50%;
                    margin-top: -50px;
                }
                .interg{
                    width: 50%;
                }
                .lawd{
                    flex: 1;
                }
            }
            
        }
        .tobeimproved{
            width: 50%;
            .tobeimproved-title{
                height: 25px;
                font-size: 18px;
                font-family: SemiBold;
                color: #203449;
                line-height: 25px;
                margin-right: 20px;
                text-align: right;
                position: relative;
                &::before{
                    content: "";
                    width: 8px;
                    height: 12px;
                    display: inline-block;
                    background: url("@/assets/imgs/hongsanjiao.png");
                    position: absolute;
                    right:-20px;
                    top:6.5px
                }
            }
            .tobeimproved-con{
                height: 235px;
                display: flex;
                .interg{
                    width: 50%;
                }
                .lawd{
                    flex: 1;
                }
            }
        }
        
    }
    .lsummary-sumup{
        width: 1430px;
        height: 100px;
        background: rgba(107, 124, 250, 0.05);
        margin: auto;
        padding: 10px 20px;
        margin-top: 5px;
        .sumup-item{
            height: 26px;
            font-size: 18px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #3E5463;
            line-height: 26px;
            margin-bottom: 5px;
        }
    }
}
</style>