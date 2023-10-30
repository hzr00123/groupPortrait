<template>
    <div class="behavior-trajectory-compare">
        <div class="brc-top" v-loading="topLoading">
            <div class="brc-seltd">
                <div class="sel-target-con" v-if="isShowSearchPanel">
                    <div class="title">已选目标群体：</div>
                    <div class="info">{{ seledTargetData }}</div>
                    <div class="cunt">，共<span class="consum">{{targetTotal}}</span>人，在全部学生中占比:<span class="proportion">{{targetProportion}}</span></div>
                </div>
                <div class="sel-compare-con" v-if="isShowSearchPanel">
                    <div class="title">已选对比群体：</div>
                    <div class="info">{{ seledCompareData }}</div>
                    <div class="cunt">，共<span class="consum">{{compareTotal}}</span>人，在全部学生中占比:<span class="proportion">{{compareProportion}}</span></div>
                </div>
            </div>
            <div class="brc-btn">
                <el-button @click="selectColony">选择目标群体与对比群体</el-button>
                <el-button @click="handleReset">重置</el-button>
                <el-button class="search-btn" @click="handleSearch">搜索</el-button>
            </div>
            
        </div>
        <div class="brc-content">
            <div class="haves" v-if="isShowContentPanel">
                <!-- 宿舍出入 -->
                <DormitoryAccess></DormitoryAccess>
                <!-- 食堂就餐 -->
                <DiningCanteen></DiningCanteen>
                <!-- 教室学习 -->
                <ClassroomLearning></ClassroomLearning>
                <!-- 图书馆学习 -->
                <LibraryLearning></LibraryLearning>
                <!-- 体育馆运动 -->
                <GymnasiumExercise></GymnasiumExercise>
                <!-- 浴室沐浴 -->
                <ShowerRoom></ShowerRoom>
                <!-- 超市购物 -->
                <Shopping></Shopping>
                <!-- 学习生活行为总结 -->
                <LearnLifeSummary></LearnLifeSummary>
            </div>
            <div class="kong" v-if="!isShowContentPanel" v-loading="loading" element-loading-text="正在生成图表,请耐心等待...">
                <el-empty :image="emptyImg" :image-size="320" class="my-el-empty">
                    <template v-slot:description>
                        <div class="empty-tag">暂无对比内容数据</div>
                    </template>
                </el-empty>
            </div>
        </div>

        <!-- 目标群体与对比群体 -->
        <AddBTCColonyDialog ref="BTCColonyDialogRef" @handeSaveAppend="handeSaveAppend"></AddBTCColonyDialog>
    </div>
</template>

<script lang="ts">
import { defineComponent,reactive,ref,nextTick,provide } from 'vue'
import emptyImg from "@/assets/imgs/conempty.png"
import { ElMessage } from 'element-plus'
import AddBTCColonyDialog from "./components/AddBTCColonyDialog.vue"
import DormitoryAccess from "./components/DormitoryAccess/index.vue"
import DiningCanteen from "./components/DiningCanteen/index.vue"
import ClassroomLearning from "./components/ClassroomLearning/index.vue"
import LibraryLearning from "./components/LibraryLearning/index.vue"
import GymnasiumExercise from "./components/GymnasiumExercise/index.vue"
import LearnLifeSummary from "./components/LearnLifeSummary/index.vue"
import ShowerRoom from "./components/ShowerRoom/index.vue"
import Shopping from "./components/Shopping/index.vue"
import {getBehaviorTraceCompare,getBehaviorTraceCompareChart} from "@/api/modules/comparisonBehaviortrajectories"
import {IDanTargetObj,IDanComTargetObj,IParmsQueryData} from "./types/restraint"
import {userStore} from "@/store/btc"

export default defineComponent({
    setup () {
        let BTCColonyDialogRef = ref();
        let loading = ref(false);
        let topLoading = ref(false);
        //选择目标群体与对比群体
        function selectColony(){
            BTCColonyDialogRef.value.appendDialogVisible = true;
        }
        
        let seledTargetData = ref(""); //已选目标群体内容
        let seledCompareData = ref("");//已选对比群体内容
        let isShowSearchPanel = ref(false);
        let targetTotal = ref(0);
        let targetProportion = ref("");
        let compareTotal = ref(0);
        let compareProportion = ref("");

        let parmsData:IParmsQueryData = {
            "compareGroup": {
                "campusId": 0,
                "classId": 0,
                "collegeId": 0,
                "enrollType": "",
                "gradeId": 0,
                "majorId": 0,
                "nation": "",
                "placeOrigin": "",
                "politics": "",
                "schoolYear": "",
                "semester": "",
                "sex": "",
                "studentType": "",
                "userGroupDescription": "",
                "userGroupType": 0
            },
            "compareGroupName": "",
            "compareGroupNum": "",
            "targetGroup": {
                "campusId": 0,
                "classId": 0,
                "collegeId": 0,
                "enrollType": "",
                "gradeId": 0,
                "majorId": 0,
                "nation": "",
                "placeOrigin": "",
                "politics": "",
                "schoolYear": "",
                "semester": "",
                "sex": "",
                "studentType": "",
                "userGroupDescription": "",
                "userGroupType": 0
            },
            "targetGroupName": "",
            "targetGroupNum": ""
        }
        provide('btcName', {seledTargetData,seledCompareData});
        //保存选择的信息
        function handeSaveAppend(data:any){
            topLoading.value = true;
            //console.log(data)
            let targetObj = manageTargetArgument(data.targetStudentsBasicInfos,data.targetAttentionCrowd.targetUserGrops);
            let compareObj = manageCompareArgument(data.compareStudentsBasicInfos,data.compareAttentionCrowd.compareUserGrops);

            parmsData.targetGroup.campusId = targetObj.campusId == 0 ? null : targetObj.campusId;
            parmsData.targetGroup.classId = targetObj.classId == 0 ? null : targetObj.classId;
            parmsData.targetGroup.collegeId = targetObj.collegeId == 0 ? null : targetObj.collegeId;
            parmsData.targetGroup.enrollType = targetObj.enrollType;
            parmsData.targetGroup.gradeId = targetObj.gradeId == 0 ? null : targetObj.gradeId;
            parmsData.targetGroup.majorId = targetObj.majorId == 0 ? null : targetObj.majorId;
            parmsData.targetGroup.nation = targetObj.nation;
            parmsData.targetGroup.placeOrigin = targetObj.placeOrigin;
            parmsData.targetGroup.politics = targetObj.politics;
            parmsData.targetGroup.schoolYear = targetObj.schoolYear;
            parmsData.targetGroup.semester = targetObj.semester;
            parmsData.targetGroup.sex = targetObj.sex;
            parmsData.targetGroup.studentType = targetObj.studentType;
            parmsData.targetGroup.userGroupDescription = targetObj.userGroupDescription;

            parmsData.compareGroup.campusId = compareObj.campusId == 0 ? null : compareObj.campusId;
            parmsData.compareGroup.classId = compareObj.classId == 0 ? null : compareObj.classId;
            parmsData.compareGroup.collegeId = compareObj.collegeId == 0 ? null : compareObj.collegeId;
            parmsData.compareGroup.enrollType = compareObj.enrollType;
            parmsData.compareGroup.gradeId = compareObj.gradeId == 0 ? null : compareObj.gradeId;
            parmsData.compareGroup.majorId = compareObj.majorId == 0 ? null : compareObj.majorId;
            parmsData.compareGroup.nation = compareObj.nation;
            parmsData.compareGroup.placeOrigin = compareObj.placeOrigin;
            parmsData.compareGroup.politics = compareObj.politics;
            parmsData.compareGroup.schoolYear = compareObj.schoolYear;
            parmsData.compareGroup.semester = compareObj.semester;
            parmsData.compareGroup.sex = compareObj.sex;
            parmsData.compareGroup.studentType = compareObj.studentType;
            parmsData.compareGroup.userGroupDescription = compareObj.userGroupDescription;

            getBehaviorTraceCompare(parmsData).then((res) => {
                //console.log(res)
                if(res.code == 1){
                    targetTotal.value = res.data.targetGroup.total;
                    targetProportion.value = res.data.targetGroup.rate;
                    compareTotal.value = res.data.compareGroup.total;
                    compareProportion.value = res.data.compareGroup.rate;
                }
                topLoading.value = false;
            })
            
            BTCColonyDialogRef.value.appendDialogVisible = false;

            //目标群体
            if(data.targetTypeResult == 1){//目标群体类型
                let mubiaoArr:any[] = [];
                data.targetStudentsBasicInfos.forEach((e:any) => {//目标群体---从学生基本信息中选择字段筛选人群
                    if(!mubiaoArr.includes(e.targetBasicInfo)){
                        mubiaoArr.push(`${e.targetIsSelectVal}`);
                    }
                });
                
                seledTargetData.value = mubiaoArr.join(",");
            }
            else if(data.targetTypeResult == 2){//目标群体---从关注人群中直接选择某一群体
                seledTargetData.value = data.targetAttentionCrowd.targetUsersType +" "+data.targetAttentionCrowd.targetUserGrops;
            }
            
            seledTargetData.value = seledTargetData.value == "" ? "全部" : seledTargetData.value;

            //对比群体
            if(data.compareTypeResult == 'b1'){//对比群体类型
                let duibiyonghuArr:any[] = [];
                data.compareStudentsBasicInfos.forEach((e:any) => {
                    if(!duibiyonghuArr.includes(e.compareBasicInfo)){
                        duibiyonghuArr.push(`${e.compareIsSelectVal}`);
                    }
                });
                
                seledCompareData.value = duibiyonghuArr.join(",");
            }
            else if(data.compareTypeResult == 'b2'){
                seledCompareData.value = data.compareAttentionCrowd.compareUsersType +" "+data.compareAttentionCrowd.compareUserGrops;
            }
            
            seledCompareData.value = seledCompareData.value == "" ? "全部" : seledCompareData.value;
            isShowSearchPanel.value = true;

        }

        let isShowContentPanel = ref(false);
        // let dormitoryConfig = reactive({});   //宿舍的数据
        // let canteenConfig = reactive({});   //食堂的数据
        // let classroomConfig = reactive({});   //教室的数据
        // let libraryConfig = reactive({});   //图书馆的数据
        // let gymnasiumConfig = reactive({});   //体育馆的数据
        // let bathConfig = reactive({});   //浴室的数据
        // let supermarketConfig = reactive({});  //超市的数据
        // let sumUpConfig = reactive({});  //学习生活行为总结的数据

        let myStore = userStore();
        //搜索
        async function handleSearch(){
            if(seledTargetData.value == "" || seledCompareData.value == ""){
                ElMessage({
                    message: '请先添加目标群体与对比群体',
                    type: 'warning',
                })
            }
            else{
                loading.value = true;
                parmsData.targetGroupName = seledTargetData.value == '全部'?'':seledTargetData.value;
                parmsData.targetGroupNum = targetTotal.value == 0 ? "" : targetTotal.value.toString(); //targetTotal.value.toString()
                parmsData.compareGroupName = seledCompareData.value == '全部'?'':seledCompareData.value;
                parmsData.compareGroupNum = compareTotal.value == 0 ? "" : compareTotal.value.toString();  //compareTotal.value.toString()

                let res = await getBehaviorTraceCompareChart(parmsData);
                
                if(res.code == 1){
                    loading.value = false;
                    isShowContentPanel.value = true;
                    
                    myStore.dormitoryConfig = res.data.dormitory;   //宿舍的数据
                    myStore.canteenConfig = res.data.canteen;     //食堂的数据
                    myStore.classroomConfig = res.data.classroom;    //教室的数据
                    myStore.libraryConfig = res.data.library;   //图书馆的数据
                    myStore.gymnasiumConfig = res.data.gymnasium;   //体育馆的数据
                    myStore.bathConfig = res.data.bath;    //浴室的数据
                    myStore.supermarketConfig = res.data.supermarket;   //超市的数据
                    myStore.sumUpConfig = res.data.sumUp;    //学习生活行为总结的数据
                    myStore.jichushuju++;
                }
                    
            }

            
        }
        //重置
        function handleReset(){
            seledTargetData.value = "";
            seledCompareData.value = "";
            isShowSearchPanel.value = false;
            isShowContentPanel.value = false;
            myStore.jichushuju = 0;
        }

        function manageTargetArgument(marg:any,usertg:any){
            let targetObj:IDanTargetObj = {
                semester:"",  //学期
                schoolYear:"", //学年 
                campusId:0,  //校区id
                collegeId:0,  //学院id
                majorId:0, //专业id
                gradeId:0,  //年级id
                classId:0,   //班级id
                sex:"",      //性别
                nation:"",     //民族
                studentType:"",    //培养层次
                placeOrigin:"",    //生源地
                politics:"",      //政治面貌
                enrollType:"",    //"录取类型
                userGroupDescription:"",  //关注人群用户群描述
                userGroupType:0   //关注人群用户群类型
            }

            marg.forEach((f:any) => {
                if(f.targetIsSelectValOptions.length > 0){
                    f.targetIsSelectValOptions.find((m:any) => {
                        if(f.targetIsSelectVal == m.name){
                            if(m.typeName == "学年"){
                                targetObj.schoolYear = m.name;
                            }
                            if(m.typeName == "学期"){
                                targetObj.semester = m.name;
                            }
                            if(m.typeName == "校区"){
                                targetObj.campusId = m.id;
                            }
                            if(m.typeName == "学院"){
                                targetObj.collegeId = m.id;
                            }
                            if(m.typeName == "专业"){
                                targetObj.majorId = m.id;
                            }
                            if(m.typeName == "年级"){
                                targetObj.gradeId = m.id;
                            }
                            if(m.typeName == "班级"){
                                targetObj.classId = m.id;
                            }
                            if(m.typeName == "性别"){
                                targetObj.sex = m.name;
                            }
                            if(m.typeName == "民族"){
                                targetObj.nation = m.name;
                            }
                            if(m.typeName == "培养层次"){
                                targetObj.studentType = m.name;
                            }
                            if(m.typeName == "生源地"){
                                targetObj.placeOrigin = m.name;
                            }
                            if(m.typeName == "政治面貌"){
                                targetObj.politics = m.name;
                            }
                            if(m.typeName == "录取类型"){
                                targetObj.enrollType = m.name;
                            }
                        }
                    })
                    
                }
                
            })
            targetObj.userGroupDescription = usertg;

            return targetObj;
        }

        function manageCompareArgument(marg:any,usertg:any){
            let compareObj:IDanComTargetObj = {
                semester:"",  //学期
                schoolYear:"", //学年 
                campusId:0,  //校区id
                collegeId:0,  //学院id
                majorId:0, //专业id
                gradeId:0,  //年级id
                classId:0,   //班级id
                sex:"",      //性别
                nation:"",     //民族
                studentType:"",    //培养层次
                placeOrigin:"",    //生源地
                politics:"",      //政治面貌
                enrollType:"",    //"录取类型
                userGroupDescription:"",  //关注人群用户群描述
                userGroupType:0   //关注人群用户群类型
            }

            marg.forEach((f:any) => {
                if(f.compareIsSelectValOptions.length > 0){
                    f.compareIsSelectValOptions.find((m:any) => {
                        if(f.compareIsSelectVal == m.name){
                            if(m.typeName == "学年"){
                                compareObj.schoolYear = m.name;
                            }
                            if(m.typeName == "学期"){
                                compareObj.semester = m.name;
                            }
                            if(m.typeName == "校区"){
                                compareObj.campusId = m.id;
                            }
                            if(m.typeName == "学院"){
                                compareObj.collegeId = m.id;
                            }
                            if(m.typeName == "专业"){
                                compareObj.majorId = m.id;
                            }
                            if(m.typeName == "年级"){
                                compareObj.gradeId = m.id;
                            }
                            if(m.typeName == "班级"){
                                compareObj.classId = m.id;
                            }
                            if(m.typeName == "性别"){
                                compareObj.sex = m.name;
                            }
                            if(m.typeName == "民族"){
                                compareObj.nation = m.name;
                            }
                            if(m.typeName == "培养层次"){
                                compareObj.studentType = m.name;
                            }
                            if(m.typeName == "生源地"){
                                compareObj.placeOrigin = m.name;
                            }
                            if(m.typeName == "政治面貌"){
                                compareObj.politics = m.name;
                            }
                            if(m.typeName == "录取类型"){
                                compareObj.enrollType = m.name;
                            }
                        }
                    })
                    
                }
                
            })
            compareObj.userGroupDescription = usertg;

            return compareObj;
        }

        return {
            //dormitoryConfig,canteenConfig,classroomConfig,libraryConfig,gymnasiumConfig,bathConfig,supermarketConfig,sumUpConfig
            emptyImg,selectColony,BTCColonyDialogRef,handeSaveAppend,seledTargetData,seledCompareData,isShowSearchPanel,isShowContentPanel,
            handleSearch,handleReset,loading,manageTargetArgument,manageCompareArgument,targetTotal,targetProportion,compareTotal,compareProportion,
            parmsData,myStore,topLoading
        }
    },
    components:{
        AddBTCColonyDialog,DormitoryAccess,DiningCanteen,ClassroomLearning,LibraryLearning,GymnasiumExercise,LearnLifeSummary,
        ShowerRoom,Shopping
    }
})
</script>

<style lang="scss" scoped>
.behavior-trajectory-compare{
    min-width: 1486px;
    .brc-top{
        display: flex;
        align-items: center;
        .brc-seltd{
            flex: 1;
            display: flex;
            padding: 0 20px 0px 10px;
            .sel-target-con{
                display: flex;
                font-size: 16px;
                font-family: Medium;
                .title{
                    color: #767676;
                    position: relative;
                    &::before{
                        content: "";
                        width: 4px;
                        height: 12px;
                        background: #1B528B;
                        position: absolute;
                        top:2px;
                        left: -10px;
                    }
                }
                .info{
                    max-width: 110px;
                    color: rgba(27, 82, 139, 1);
                    text-overflow: ellipsis;
                    white-space: nowrap; 
                    overflow: hidden;
                }
                .cunt{
                    color: #767676;
                    .consum{
                        color: rgba(27, 82, 139, 1);
                        text-decoration:underline
                    }
                    .proportion{
                        color: rgba(27, 82, 139, 1);
                    }
                }
            }
            .sel-compare-con{
                display: flex;
                margin-left: 30px;
                font-size: 16px;
                font-family: Medium;
                .title{
                    color: #767676;
                    position: relative;
                    &::before{
                        content: "";
                        width: 4px;
                        height: 12px;
                        background: #B22924;
                        position: absolute;
                        top:2px;
                        left: -10px;
                    }
                }
                .info{
                    max-width: 110px;
                    color: rgba(178, 41, 36, 1);
                    text-overflow: ellipsis;
                    white-space: nowrap; 
                    overflow: hidden;
                }
                .cunt{
                    color: #767676;
                    .consum{
                        color: rgba(178, 41, 36, 1);
                        text-decoration:underline
                    }
                    .proportion{
                        color: rgba(178, 41, 36, 1);
                    }
                }
            }
        }
        .brc-btn{
            width: 400px;
            text-align: right;
            :deep(.el-button){
                border: 1px solid #005DA7;
                color: #005DA7;
                background: rgba(233,240,255,0.5);
                font-size: 16px;
            }
            :deep(.el-button:hover) {
                color: #FFFFFF;
                background: #005DA7;
                outline: 0;
            }
            :deep(.el-button:hover) {
                color: #FFFFFF;
                background: #005DA7;
                outline: 0;
            }
            .search-btn{
                color: #FFFFFF;
                background: #005DA7;
                outline: 0;
            }
            
        }
    }
    
    .brc-content{
        margin-top: 20px;
        .kong{
            width: 100%;
            height: 625px;
            background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.86) 100%);
            .my-el-empty{
                height: 625px;
            }
            .empty-tag{
                font-size: 20px;
                font-family: Medium;
                font-weight: 500;
                color: #785151;
            }
        }
    }
}
</style>