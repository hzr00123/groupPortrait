<template>
    <div class="top">
        <div class="title-column">
            <h1>学生画像系统</h1>
            <div class="breadcrumb">
                <template v-for="item in breadcrumb" :key="item.name">
                    <router-link  class="item-bread" :to="item.path">
                        <svg-icon icon-class="root-icon"/>
                        {{item.name}}
                    </router-link>
                    <el-icon class="arrow-right" color="#C6A8A7" v-if="item.children"><ArrowRight/></el-icon>
                    <template v-for="it in item.children" :key="it.name">
                        <router-link  class="item-bread" :to="it.path" >{{it.meta.title}}</router-link>
                    </template>
                </template>
            </div>
        </div>
        <div class="flex">
            <div v-if="!store.setingVal" class="seting" @click="setingEvt(true)">
                <el-icon size="22"><Setting /></el-icon>
            </div>
            <div v-else class="seting" @click="setingEvt(false)" style="line-height: 22px;">
                返回
            </div>
            <div class="logout" @click="logout">
                <el-icon size="22" color="#FFF"><SwitchButton /></el-icon>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { userStore } from '@/store/user';
const router = useRouter();
let routes = router.options.routes.filter(it => it.name === 'group-layout')[0];
const store = userStore()
const route = useRoute()
let breadcrumb: any = ref([]);

watch(() => route.name, (val) => {
    breadcrumb.value = [];
    routes.children?.map((item, index) => {
        if(item.name === val) {
            let obj = {
                ...item,
                name: item.meta?.title,
            }
            if(item.children?.length && item.children.find(el => el.name === item.name)) {
                delete obj.children
            }
            breadcrumb.value.push(obj);
            // console.log(item);
        } else {
            item.children?.map(it => {
                if(it.name === val) {
                    
                    breadcrumb.value.push({
                        path: item.path,
                        name: item.meta?.title,
                        children: [it]
                    })
                }
            })
        }
    })
}, {immediate: true})

const setingEvt = (v: boolean)=>{
    if(v){
        router.push('/label-management')
    } else {
        router.push('/student-portrait')
    }
    store.updateSeting(v)
}
const logout = () => {
    ElMessageBox.confirm(
        '请问是否要退出登录?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        localStorage.clear()
        window.location.href = '/logout'
    })
}
</script>

<style lang="less" scoped>
.top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    .title-column {
        display: flex;
        align-items: center;
        h1 {
            font-size: 28px;
            font-family: Medium;
            color: #000000;
            line-height: 40px;
            margin-right: 22px;
        }
        .breadcrumb {
            a {
                font-size: 16px;
                font-family: Regular;
                color: #B22924;
                line-height: 22px;
                padding: 4px 20px;
                background: #F2EBEC;
                border-radius: 15px;
            }
            .arrow-right {
                font-size: 16px;
                margin: 0 10px;
            }
        }
    }
    .logout {
        padding: 8px;
        background: #B22924;
        border-radius: 12px;
        backdrop-filter: blur(6px);
        cursor: pointer;
        &:hover{
            opacity: .6;
        }
    }
    .seting{
        padding: 8px;
        background: #dcdce7;
        border-radius: 12px;
        backdrop-filter: blur(6px);
        cursor: pointer;
        margin-right: 15px;
        &:hover{
            opacity: .6;
        }
    }
}
</style>