<template>
    <div class="classroom">
        <div class="classroom-top">
            教室学习
        </div>
        <div class="classroom-cont">
            <el-row>
                <el-col :span="8">
                    <div class="outstanding">{{btcName.seledTargetData.value}}</div>
                    <div>
                        <ClassroomGoodLine></ClassroomGoodLine>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="compare">
                        <div class="core-title">关键数据对比</div>
                        <div class="core-con">
                            <div class="core-con-outstanding">
                                <div v-for="(item,index) in myStore.classroomConfig.center.compare" :key="index">{{item.left}}</div>
                            </div>
                            <div class="project">
                                <div v-for="(item,index) in myStore.classroomConfig.center.compare" :key="index">{{item.name}}</div>
                            </div>
                            <div class="core-con-tobeimproved">
                                <div v-for="(item,index) in myStore.classroomConfig.center.compare" :key="index">{{item.right}}</div>
                            </div>
                        </div>
                        <div class="track-title">轨迹规律分析</div>
                        <div class="track-con">
                            <div class="track-con-item" v-for="(item,index) in myStore.classroomConfig.center.law" :key="index">{{item}}</div>
                        </div>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="tobeimproved">{{btcName.seledCompareData.value}}</div>
                    <div>
                        <ClassroomPoorLine></ClassroomPoorLine>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import ClassroomGoodLine from "../charts/ClassroomGoodLine.vue"
import ClassroomPoorLine from "../charts/ClassroomPoorLine.vue"
import {userStore} from "@/store/btc"

  let myStore = userStore();
  const btcName = inject("btcName", {} as any)
</script>

<style lang="scss" scoped>
.classroom{
    width: 100%;
    height: 400px;
    background:linear-gradient(-45deg, transparent 15px, #FFFFFF 0%, rgba(255,255,255,0.86) 100%);
    margin-top: 30px;
    .classroom-top{
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
    .classroom-cont{
        padding: 20px 0px;
        .outstanding{
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
        .compare{
            width: 490px;
            height: 300px;
            background: #FFFFFF;
            box-shadow: 0px 0px 12px 0px rgba(138,129,129,0.14);
            border-radius: 6px;
            padding: 10px 5px 10px 10px;
            .core-title{
                height: 22px;
                font-size: 16px;
                font-family: SemiBold;
                color: #203449;
                line-height: 22px;
                margin-left: 22px;
                position: relative;
                &::before{
                    content: "";
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: 2px solid #B22A25;
                    display: inline-block;
                    position: absolute;
                    left:-15px;
                    top:5px
                }
            }
            .core-con{
                display: flex;
                justify-content: start;
                margin-top: 5px;
                margin-bottom: 8px;
                .core-con-outstanding{
                    width: 140px;
                    background: #FAFDFF;
                    border-radius: 10px;
                    border: 1px solid #E9F4FF;
                    margin-left: 9px;
                    margin-right: 9px;
                    font-size: 14px;
                    font-family: Regular;
                    color: #005DA7;
                    line-height: 24px;
                    text-align: center;
                    text-overflow: ellipsis;
                    white-space: nowrap; 
                    overflow: hidden;
                }
                .project{
                    width: 155px;
                    font-size: 14px;
                    font-family: Regular;
                    color: #717171;
                    line-height: 24px;
                    margin-right: 9px;
                    text-align: center;
                    text-overflow: ellipsis;
                    white-space: nowrap; 
                    overflow: hidden;
                }
                .core-con-tobeimproved{
                    width: 140px;
                    background: #FFFBFB;
                    border-radius: 10px;
                    border: 1px solid #FAE4E2;
                    font-size: 14px;
                    font-family: Regular;
                    color: #64140E;
                    line-height: 24px;
                    text-align: center;
                    text-overflow: ellipsis;
                    white-space: nowrap; 
                    overflow: hidden;
                }
            }
            .track-title{
                height: 22px;
                font-size: 16px;
                font-family: SemiBold;
                color: #203449;
                line-height: 22px;
                margin-left: 22px;
                position: relative;
                &::before{
                    content: "";
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: 2px solid #B22A25;
                    display: inline-block;
                    position: absolute;
                    left:-15px;
                    top:5px
                }
            }
            .track-con{
                .track-con-item{
                    font-size: 14px;
                    font-family: Regular;
                    color: #203449;
                    line-height: 20px;
                    padding-left: 20px;
                    position: relative;
                    margin-top: 8px;
                    &::before{
                        content: "";
                        display: inline-block;
                        width: 4px;
                        height: 12px;
                        background: #005DA7;
                        position: absolute;
                        left:9px;
                        top:4px;
                    }
                }
            }
        }
        .tobeimproved{
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
    }
}
</style>