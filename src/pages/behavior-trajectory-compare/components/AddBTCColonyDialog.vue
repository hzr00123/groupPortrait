<template>
    <div class="add-append-box">
        <el-dialog
            v-model="appendDialogVisible"
            :title="appendTitle"
            :close-on-click-modal="false"
            :destroy-on-close="true"
            @close="close"
            @open="open"
            width="1300"
        >
            <div class="add-content">
                <div class="targetgrop">
                    <div class="title">目标群体</div>
                    <div class="targetgrop-sel">
                        <el-radio-group v-model="targetgropRadio" @change="targetgropSelChange">
                            <el-radio :label="1">从学生基本信息中选择字段筛选人群</el-radio>
                            <el-radio :label="2">从关注人群中直接选择某一群体</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="targetgrop-con">
                        <div class="sel-one" v-if="targetgropRadio==1">
                            <el-form
                                ref="tagOneformRef"
                                :model="targetgropForm"
                                :inline="true"
                                label-width="120px"
                                class="demo-dynamic"
                            >
                                <div v-for="(item,index) in targetgropForm" :key="index">
                                    <el-form-item :prop="'targetgropForm.' + index + '.targetBasicInfo'" label="" class="bielfrom" :key="'targetgropForm.' + index + '.targetBasicInfo'">
                                        <el-select v-model="item.targetBasicInfo" clearable class="m-2 basicInfoPattern" placeholder="请选择基本信息" @change="((value)=>{selectHandChange(value, index)})">
                                            <el-option
                                            v-for="item in dropdownOptions(item.targetBasicInfoOptions,index)"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled"
                                            />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item :prop="'targetgropForm.' + index + '.targetIsEqual'" label="">
                                        <el-select v-model="item.targetIsEqual" clearable class="m-2 isEqualPattern" placeholder="请选择">
                                            <el-option label="=" value="="/>
                                            <!-- <el-option label="≠" value="≠"/> -->
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item :prop="'targetgropForm.' + index + '.targetIsSelectVal'" label="">
                                        <el-select v-model="item.targetIsSelectVal" clearable class="m-2 isSelectValPattern" placeholder="请选择">
                                            <el-option
                                            v-for="item in item.targetIsSelectValOptions"
                                            :key="item.name"
                                            :label="item.name"
                                            :value="item.name"
                                            />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item>
                                        <div class="addition" @click="addItemList"><img src="@/assets/imgs/conAddImg.png" alt=""></div>
                                        <div class="decrease" v-if="index!=0" @click="deleteItem(item,index)"><img src="@/assets/imgs/conClose.png" alt=""></div>
                                    </el-form-item>
                                </div>
                                
                            </el-form>
                        </div>
                        <div class="sel-two" v-if="targetgropRadio==2">
                            <el-form
                                ref="tagTwoFormRef"
                                :model="targropTwoForm"
                                :inline="true"
                                label-width="120px"
                                class="demo-dynamic"
                            >
                                <el-form-item prop="targetUsersType" label="" class="guanzhufrom">
                                    <el-select v-model="targropTwoForm.targetUsersType" clearable class="m-2 usersTypeFollow" placeholder="请选择用户群类型" @change="targetTwoHandeChange">
                                        <el-option
                                        v-for="item in targetUsersTypeOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :tid="item.id"
                                        />
                                    </el-select>
                                </el-form-item>
                                <el-form-item prop="targetUserGrops" label="">
                                    <el-select v-model="targropTwoForm.targetUserGrops" clearable class="m-2 userGropsFollow" placeholder="请选择用户群">
                                        <el-option
                                        v-for="item in targetUserGropsOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                
                            </el-form>
                        </div>
                    </div>
                </div>
                <div class="compare-img">
                    <img src="@/assets/imgs/vs.png" alt="">
                </div>
                <div class="contrast">
                    <div class="title">对比群体</div>
                    <div class="contrast-sel">
                        <el-radio-group v-model="contrastRadio" @change="contrastSelChange">
                            <el-radio label="b1">从学生基本信息中选择字段筛选人群</el-radio>
                            <el-radio label="b2">从关注人群中直接选择某一群体</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="contrast-con">
                        <div class="sel-one" v-if="contrastRadio=='b1'">
                            <el-form
                                ref="contOneFormRef"
                                :model="contrastMyForm"
                                :inline="true"
                                label-width="120px"
                                class="demo-dynamic"
                            >
                                <div v-for="(item,index) in contrastMyForm" :key="index">
                                    <el-form-item :prop="'usersItem.' + index + '.compareBasicInfo'" label="" class="bielfrom">
                                        <el-select v-model="item.compareBasicInfo" clearable class="m-2 basicInfoPattern" placeholder="请选择基本信息" @change="((value)=>{selectCompareHandChange(value, index)})">
                                            <el-option
                                            v-for="item in compareDropdownMyOptions(item.compareBasicInfoOptions,index)"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled"
                                            />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item :prop="'usersItem.' + index + '.compareIsEqual'" label="">
                                        <el-select v-model="item.compareIsEqual" clearable class="m-2 isEqualPattern" placeholder="请选择">
                                            <el-option label="=" value="="/>
                                            <!-- <el-option label="≠" value="≠"/> -->
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item :prop="'usersItem.' + index + '.compareIsSelectVal'" label="">
                                        <el-select v-model="item.compareIsSelectVal" clearable class="m-2 isSelectValPattern" placeholder="请选择">
                                            <el-option
                                            v-for="item in item.compareIsSelectValOptions"
                                            :key="item.name"
                                            :label="item.name"
                                            :value="item.name"
                                            />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item>
                                        <div class="addition" @click="addComUsersItemList"><img src="@/assets/imgs/conAddImg.png" alt=""></div>
                                        <div class="decrease" v-if="index!=0" @click="deleteComUsersItem(item,index)"><img src="@/assets/imgs/conClose.png" alt=""></div>
                                    </el-form-item>
                                </div>
                                
                            </el-form>
                        </div>
                        <div class="sel-two" v-if="contrastRadio=='b2'">
                            <el-form
                                ref="contTwoFormRef"
                                :model="contrastMyTwoForm"
                                :inline="true"
                                label-width="120px"
                                class="demo-dynamic"
                            >
                                <el-form-item prop="compareUsersType" label="" class="guanzhufrom">
                                    <el-select v-model="contrastMyTwoForm.compareUsersType" clearable class="m-2 usersTypeFollow" placeholder="请选择用户群类型" @change="compareTwoHandeChange">
                                        <el-option
                                        v-for="item in compareUsersTypeOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                <el-form-item prop="compareUserGrops" label="">
                                    <el-select v-model="contrastMyTwoForm.compareUserGrops" clearable class="m-2 userGropsFollow" placeholder="请选择用户群">
                                        <el-option
                                        v-for="item in compareUserGropsOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                                
                            </el-form>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="appendCancel">取消</el-button>
                    <el-button type="primary" @click="appendSave">保存</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent,ref,reactive,onMounted,getCurrentInstance} from 'vue'
import {ISelOption,ITargetColony,ITargetTwoColony,IContrastColony,IContrastTwoColony,IUserType,IUserGrops} from "../types/restraint"
import {getOrgType} from "@/api/modules/emphasisList"
import {getBaseInfo,getGroupTypeDown,getGroupUserList} from "@/api/modules/studentPortrait"
import { ElMessage } from 'element-plus'

export default defineComponent({
    props:{
        appendTitle:{
            type:String,
            default:"选择群体"
        }
    },
    setup (props,context) {
        let appendDialogVisible = ref<boolean>(false);

        let targetgropRadio = ref<number | string>(1);//目标群体,1---从学生基本信息中选择字段筛选人群,2---从关注人群中直接选择某一群体

        //基本信息选项
        let zyOptions = [
            {value: '学年',label: '学年'},
            {value: '学期',label: '学期'},
            {value: '校区',label: '校区'},
            {value: '学院',label: '学院'},
            {value: '专业',label: '专业'},
            {value: '年级',label: '年级'},
            {value: '班级',label: '班级'},
            {value: '性别',label: '性别'},
            {value: '民族',label: '民族'},
            {value: '培养层次',label: '培养层次'},
            {value: '生源地',label: '生源地'},
            {value: '政治面貌',label: '政治面貌'},
            {value: '录取类型',label: '录取类型'},
        ]
        
        let selectSenOptions = reactive<ISelOption[]>([
            {
                "name": "男",
                "typeName": "性别",
            },
            {
                "name": "女",
                "typeName": "性别",
            },
            {
                "name": "本科生",
                "typeName": "培养层次",
            },
            {
                "name": "研究生",
                "typeName": "培养层次",
            },
            
        ])

        //目标群体用户群类型选项
        let targetUsersTypeOptions = ref<IUserType[]>([]);
        //目标群体用户群
        let targetUserGropsOptions = ref<IUserGrops[]>([]);

        //对比群体用户群类型选项
        let compareUsersTypeOptions = ref<IUserType[]>([]);
        //对比群体用户群
        let compareUserGropsOptions = ref<IUserGrops[]>([]);

        //获取基本信息对应的下拉选项
        async function getCorrespondingOption(){
            let orgData = await getOrgType({});
            if(orgData.code == 1){
                for(let key in orgData.data){
                    if(key == 'campusOrgList'){//校区
                        orgData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":e.id,
                                "name": e.orgName,
                                "typeName": e.typeName,
                            })
                        });
                    }
                    else if(key == 'classOrgList'){//班级
                        orgData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":e.id,
                                "name": e.orgName,
                                "typeName": e.typeName,
                            })
                        });
                    }
                    else if(key == 'collegeOrgList'){//学院
                        orgData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":e.id,
                                "name": e.orgName,
                                "typeName": e.typeName,
                            })
                        });
                    }
                    else if(key == 'gradeOrgList'){//年级
                        orgData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":e.id,
                                "name": e.orgName,
                                "typeName": e.typeName,
                            })
                        });
                    }
                    else if(key == 'majorOrgList'){//专业
                        orgData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":e.id,
                                "name": e.orgName,
                                "typeName": e.typeName,
                            })
                        });
                    }
                }
            }
            
            let baseData = await getBaseInfo({});
            if(baseData.code == 1){
                for(let key in baseData.data){
                    if(key == 'enrollType'){
                        baseData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":0,
                                "name": e,
                                "typeName": "录取类型",
                            })
                        });
                    }
                    else if(key == 'nation'){
                        baseData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":0,
                                "name": e.nationName,
                                "typeName": "民族",
                            })
                        });
                    }
                    else if(key == 'placeOrigin'){
                        baseData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":0,
                                "name": e,
                                "typeName": "生源地",
                            })
                        });
                    }
                    else if(key == 'politics'){
                        baseData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":0,
                                "name": e.politicName,
                                "typeName": "政治面貌",
                            })
                        });
                    }
                    else if(key == 'schoolYear'){
                        baseData.data[key].forEach((e:any) => {
                            selectSenOptions.push({
                                "id":0,
                                "name": e,
                                "typeName": "学年",
                            })
                        });
                    }
                    else if(key == 'semester'){//专业
                        baseData.data[key].forEach((e:string) => {
                            selectSenOptions.push({
                                "id":0,
                                "name": e,
                                "typeName": '学期',
                            })
                        });
                    }
                }
                
            }

        }

        //获取关注人群的下拉选择
        async function getAttentionCrowdOption(){
            let usersTypeData = await getGroupTypeDown({});
            if(usersTypeData.code == 1){
                let newTypeDa = usersTypeData.data.groupTypeList.map((m:any) => {
                    return {
                        id:m.id,
                        value: m.lookup_name,
                        label: m.lookup_name
                    }
                })
                targetUsersTypeOptions.value = newTypeDa;
                compareUsersTypeOptions.value = newTypeDa;
            }
            
            let userGropsData = await getGroupUserList({});
            //console.log(userGropsData)
            if(userGropsData.code == 1){
                let newGropsDa = userGropsData.data.map((m:any) => {
                    return {
                        id:m.id,
                        value: m.user_group_name,
                        label: m.user_group_name,
                        typeId:m.user_group_type
                    }
                })
                targetUserGropsOptions.value = newGropsDa;
                compareUserGropsOptions.value = newGropsDa;
            }
        }

        onMounted(() => {
            getCorrespondingOption();
            getAttentionCrowdOption();
        })
        
        //选择目标群体
        function targetgropSelChange(value:any):void{
            //console.log(value)
            if(value == 1){
                targropTwoForm.targetUsersType = "";
                targropTwoForm.targetUserGrops = "";
            }
            else if(value == 2){
                targetgropForm.value = [
                    {
                        targetBasicInfoOptions: zyOptions,
                        targetBasicInfo: "",
                        targetIsEqual:"",
                        targetIsSelectValOptions: [],
                        targetIsSelectVal: ''
                    }
                ]
            }
        }

        let targetgropForm = ref<ITargetColony[]>([
            {
                targetBasicInfoOptions: zyOptions,
                targetBasicInfo: "",
                targetIsEqual:"",
                targetIsSelectValOptions: [],
                targetIsSelectVal: ''
            }
        ]);

        let targropTwoForm = reactive<ITargetTwoColony>({
            targetUsersType:"",
            targetUserGrops:""
        })

        //增加目标群体新的一行选择项
        function addItemList(){
            // 添加一个空的表单项
            targetgropForm.value.push({
                targetBasicInfoOptions: zyOptions,
                targetBasicInfo: "",
                targetIsEqual:"",
                targetIsSelectValOptions: [],
                targetIsSelectVal: ''
            });
        }
        //删除目标群体当前的选择行
        function deleteItem(item:any[],index:number) {
            targetgropForm.value.splice(index, 1);
            //console.log(targetgropForm.dynamicItem, "删除");
        }
        //选择学生基本信息触发
        function selectHandChange(val:string,index:number){
            //console.log(val)
            //console.log(index)
            // 更新当前表单项的第一个下拉框值
            const selectedValue = targetgropForm.value[index].targetBasicInfo;
            targetgropForm.value[index].targetIsSelectValOptions = [];
            targetgropForm.value[index].targetIsSelectVal = '';
            updateSecondDropdownOptions(index, selectedValue);

        }
        const updateSecondDropdownOptions = (index:number, selectedValue:string) => {
            // 根据选择更新当前表单项的第二个下拉框选项
            selectSenOptions.forEach((m) => {
                if(m.typeName == selectedValue){
                    targetgropForm.value[index].targetIsSelectValOptions.push(m);
                }
            })
        };

        //选择目标群体的用户群类型
        function targetTwoHandeChange(val:string){
            let obj:any = {};
            obj = targetUsersTypeOptions.value.find((f)=>{
                return f.value == val
            })
            
            targropTwoForm.targetUserGrops = "";
            getGroupUserList({user_group_type:obj.id}).then((res) => {
                if(res.code == 1){
                    let newArr = res.data.map((m:any) => {
                        return {
                            id:m.id,value: m.user_group_name,label: m.user_group_name,typeId:m.user_group_type
                        }
                    })
                    targetUserGropsOptions.value = newArr;
                }
                
            });

        }

        let contrastRadio = ref('b1');

        //选择对比群体
        function contrastSelChange(val:any){
            //console.log(val)
            if(val == "b1"){
                contrastMyTwoForm.compareUsersType = "";
                contrastMyTwoForm.compareUserGrops = "";
            }
            else if(val == "b2"){
                contrastMyForm.value = [
                    {
                        compareBasicInfoOptions:zyOptions,
                        compareBasicInfo: "",
                        compareIsEqual:"",
                        compareIsSelectValOptions: [],
                        compareIsSelectVal: ''
                    }
                ]
            }
        }
        //选择对比群体-从学生基本信息中选择字段筛选人群
        let contrastMyForm = ref<IContrastColony[]>([
            {
                compareBasicInfoOptions:zyOptions,
                compareBasicInfo: "",
                compareIsEqual:"",
                compareIsSelectValOptions: [],
                compareIsSelectVal: ''
            }
        ])

        let contrastMyTwoForm = reactive<IContrastTwoColony>({
            compareUsersType:"",
            compareUserGrops:""
        })

        //增加对比群体的新的一行选择项
        function addComUsersItemList(){
            contrastMyForm.value.push(
                {
                    compareBasicInfoOptions:zyOptions,
                    compareBasicInfo: "",
                    compareIsEqual:"",
                    compareIsSelectValOptions: [],
                    compareIsSelectVal: ''
                }
            );
            //console.log(contrastMyForm.usersItem)
        }
        //删除对比群体的当前的选择行
        function deleteComUsersItem(item:any[],index:number) {
            contrastMyForm.value.splice(index, 1);
            //console.log(contrastMyForm.usersItem, "删除");
        }

        //选择对比群体学生基本信息触发
        function selectCompareHandChange(val:string,index:number){
            // 更新当前表单项的第一个下拉框值
            const selectedValue = contrastMyForm.value[index].compareBasicInfo;
            contrastMyForm.value[index].compareIsSelectValOptions = [];
            contrastMyForm.value[index].compareIsSelectVal = '';
            updateCompareSecondDropdownOptions(index, selectedValue);

        }
        const updateCompareSecondDropdownOptions = (index:number, selectedValue:string) => {
            // 根据选择更新当前表单项的第二个下拉框选项
            selectSenOptions.forEach((m) => {
                if(m.typeName == selectedValue){
                    contrastMyForm.value[index].compareIsSelectValOptions.push(m);
                }
            })

            //console.log(contrastMyForm.value)
        };

        //选择对比群体的用户群类型
        function compareTwoHandeChange(val:string){
            let obj:any = {};
            obj = compareUsersTypeOptions.value.find((f)=>{
                return f.value == val
            })
            
            contrastMyTwoForm.compareUserGrops = "";
            getGroupUserList({user_group_type:obj.id}).then((res) => {
                if(res.code == 1){
                    let newArr = res.data.map((m:any) => {
                        return {
                            id:m.id,value: m.user_group_name,label: m.user_group_name,typeId:m.user_group_type
                        }
                    })
                    compareUserGropsOptions.value = newArr;
                }
                
            });
        }

        //初始化
        function open(){
            //目标群体初始化
            targetgropRadio.value = 1;
            //目标群体---从学生基本信息中选择字段筛选人群初始化
            targetgropForm.value = [
                {
                    targetBasicInfoOptions: zyOptions,
                    targetBasicInfo: "",
                    targetIsEqual:"",
                    targetIsSelectValOptions: [],
                    targetIsSelectVal: ''
                }
                
            ]

            //目标群体---从关注人群中直接选择某一群体初始化
            targropTwoForm.targetUsersType = "";
            targropTwoForm.targetUserGrops = "";


            //添加对比群体初始化
            contrastRadio.value = "b1";
            //添加对比群体---从学生基本信息中选择字段筛选人群初始化
            contrastMyForm.value = [
                {
                    compareBasicInfoOptions:zyOptions,
                    compareBasicInfo: "",
                    compareIsEqual:"",
                    compareIsSelectValOptions: [],
                    compareIsSelectVal: ''
                }
            ]

            //添加对比群体---从关注人群中直接选择某一群体初始化
            contrastMyTwoForm.compareUsersType = "";
            contrastMyTwoForm.compareUserGrops = "";
        }
        //关闭
        function close(){
            appendDialogVisible.value = false;
        }
        //取消
        function appendCancel(){
            appendDialogVisible.value = false;
        }

        const dropdownOptions = (options:any,currentIndex:any) => {
            // 获取下拉框选项，并根据已选择的选项设置 disabled 属性
            return options.map((option:any) => {
                const disabled = targetgropForm.value.some((item, index) => index !== currentIndex && item.targetBasicInfo === option.value);
                return { ...option, disabled };
            });
        }

        const compareDropdownMyOptions = (options:any,currentIndex:any) => {
            // 获取下拉框选项，并根据已选择的选项设置 disabled 属性
            return options.map((option:any) => {
                const disabled = contrastMyForm.value.some((item, index) => index !== currentIndex && item.compareBasicInfo === option.value);
                return { ...option, disabled };
            });
        }

        //保存
        function appendSave(){
            let resLeft;
            let resRight;

            if(targetgropRadio.value == 1 && contrastRadio.value == "b1"){
                resLeft = targetgropForm.value.some(function(item) {
                    if (item.targetBasicInfo == "" || item.targetIsEqual == "" || item.targetIsSelectVal == "") { 
                        return true; 
                    }
                })
                resRight = contrastMyForm.value.some(function(item) {
                    if (item.compareBasicInfo == "" || item.compareIsEqual == "" || item.compareIsSelectVal == "") { 
                        return true;
                    }
                })
            }
            else if(targetgropRadio.value == 1 && contrastRadio.value == "b2"){
                resLeft = targetgropForm.value.some(function(item) {
                    if (item.targetBasicInfo == "" || item.targetIsEqual == "" || item.targetIsSelectVal == "") { 
                        return true; 
                    }
                })
                if(contrastMyTwoForm.compareUsersType == "" || contrastMyTwoForm.compareUserGrops == ""){
                    resRight = true;
                }
                else{
                    resRight = false;
                }
            }
            else if(targetgropRadio.value == 2 && contrastRadio.value == "b1"){

                if(targropTwoForm.targetUsersType == "" || targropTwoForm.targetUserGrops == ""){
                    resLeft = true;
                }
                else{
                    resLeft = false;
                }
                resRight = contrastMyForm.value.some(function(item) {
                    if (item.compareBasicInfo == "" || item.compareIsEqual == "" || item.compareIsSelectVal == "") { 
                        return true; 
                    }
                })
            }
            else if(targetgropRadio.value == 2 && contrastRadio.value == "b2"){
                if(targropTwoForm.targetUsersType == "" || targropTwoForm.targetUserGrops == ""){
                    resLeft = true;
                }
                else{
                    resLeft = false;
                }

                if(contrastMyTwoForm.compareUsersType == "" || contrastMyTwoForm.compareUserGrops == ""){
                    resRight = true;
                }
                else{
                    resRight = false;
                }
            }

            //选择的数据
            let saveData = {
                'targetTypeResult':targetgropRadio.value,
                'targetStudentsBasicInfos':targetgropForm.value,
                'targetAttentionCrowd':targropTwoForm,
                'compareTypeResult':contrastRadio.value,
                'compareStudentsBasicInfos':contrastMyForm.value,
                'compareAttentionCrowd':contrastMyTwoForm
            }
            
            
            if(!resLeft && !resRight){
                context.emit("handeSaveAppend", saveData);
            }
            else{
                ElMessage({
                    message: '目标群体与对比群体都不能为空',
                    type: 'warning',
                })
            }
            
            
        }
        
        return {
            appendDialogVisible,open,close,appendCancel,appendSave,targetgropRadio,targetgropSelChange,targetgropForm,zyOptions,
            addItemList,deleteItem,targropTwoForm,targetUsersTypeOptions,targetUserGropsOptions,compareUsersTypeOptions,compareUserGropsOptions,contrastRadio,
            contrastSelChange,contrastMyForm,contrastMyTwoForm,
            addComUsersItemList,deleteComUsersItem,selectSenOptions,getCorrespondingOption,selectHandChange,selectCompareHandChange,getAttentionCrowdOption,
            targetTwoHandeChange,compareTwoHandeChange,dropdownOptions,compareDropdownMyOptions
        }
    }
})
</script>

<style lang="scss" scoped>
.add-append-box{
    .add-content{
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .targetgrop{
            width: 600px;
            height: 320px;
            background: rgba(255,255,255,0.9);
            border-radius: 4px;
            border: 1px solid #DCDCDC;
            .targetgrop-sel{
                .el-radio-group{
                    margin-left: 15px;
                }
            }
            .targetgrop-con{
                .sel-one{
                    height: 220px;
                    overflow-y:auto ;
                    .bielfrom{
                        margin-left: 15px;
                    }
                    .addition{
                        cursor: pointer;
                    }
                    .decrease{
                        margin-left: 15px;
                        cursor: pointer;
                    }
                }
                .sel-two{
                    .guanzhufrom{
                        margin-left: 15px;
                    }
                }
            }
        }
        .compare-img{
            width: 36px;
        }
        .contrast{
            width: 600px;
            height: 320px;
            background: rgba(255,255,255,0.9);
            border-radius: 4px;
            border: 1px solid #DCDCDC;
            .contrast-sel{
                .el-radio-group{
                    margin-left: 15px;
                }
            }
            .contrast-con{
                .sel-one{
                    height: 220px;
                    overflow-y:auto ;
                    .bielfrom{
                        margin-left: 15px;
                    }
                    .addition{
                        cursor: pointer;
                    }
                    .decrease{
                        margin-left: 15px;
                        cursor: pointer;
                    }
                }
                .sel-two{
                    .guanzhufrom{
                        margin-left: 15px;
                    }
                }
            }
        }


        
        .title{
            width: 598px;
            height: 48px;
            background: #F8FAFC;
            border-radius: 4px 4px 0px 0px;
            border-bottom: 1px solid #DCDCDC;
            text-align: center;
            line-height: 48px;
            font-size: 16px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #01345C;
        }
    }
}
::v-deep(.el-dialog__footer){
    text-align:center !important;
}

::v-deep(.basicInfoPattern.el-select .el-input){
    width: 180px;
}

::v-deep(.isEqualPattern.el-select .el-input){
    width: 100px;
}
::v-deep(.isSelectValPattern.el-select .el-input){
    width: 160px;
}
::v-deep(.el-form--inline .el-form-item){
    margin-right: 15px;
}
::v-deep(.el-form-item--large){
    margin-bottom: 15px;
}

::v-deep(.usersTypeFollow.el-select .el-input){
    width: 180px;
}
::v-deep(.userGropsFollow.el-select .el-input){
    width: 180px;
}
</style>