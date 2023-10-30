<template>
    <div class="v-setting" @click="handleSetting">
        <el-icon color="#FFF" size="24"><Setting /></el-icon>
        <el-drawer 
        v-model="drawer"
        size="15%" 
        title="项目配置"
        @closed="closed">
            <el-form :model="form" label-width="80px">
                <el-form-item label="dbloginkey:">
                    <el-input v-model="form.dbloginkey"  />
                </el-form-item>
                <el-form-item label="JSESSIONID:">
                    <el-input v-model="form.JSESSIONID" />
                </el-form-item>
            </el-form>
        </el-drawer>
    </div>
</template>
    
<script setup lang='ts'>
import Cookies from 'js-cookie'
import { ref, onMounted } from 'vue'
import { Form } from './index'
const drawer = ref(false)
const form = ref<Form>({ dbloginkey: '', JSESSIONID: ''})


const closed = () => {
    for(let key in form.value) {
        Cookies.set(key, form.value[key])
    }
}

const handleSetting = () => {
    drawer.value = true
}

onMounted(() => {
    form.value.dbloginkey = Cookies.get('dbloginkey') || ''
    form.value.JSESSIONID = Cookies.get('JSESSIONID') || ''
})
</script>
    
<style lang="less" scoped>
.v-setting {
    width: 40px;
    height: 40px;
    background: #B22924;
    border-radius: 6px 0 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
    
</style>