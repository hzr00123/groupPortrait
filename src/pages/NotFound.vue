<template>
    <el-empty>
        <h1 class="title">Not Found</h1>
        <h2 class="title">您来到了没有知识的荒原</h2>
        <el-button @click="back" type="primary" size="small">返回</el-button>
    </el-empty>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const back = () => {
    router.go(-1)
}
</script>

<style scoped>
.title{
  margin: 10px;
}
</style>