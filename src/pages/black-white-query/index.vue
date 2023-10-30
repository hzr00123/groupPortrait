<template>
  <div>
    <Setings type="black" @query="queryClick"/>
  </div>
</template>

<script setup lang="ts">
import Search from '@/components/common/Search.vue'
import { reactive, ref } from 'vue'
import Setings from './components/Setings';

const queryClick = (form:object)=>{
}
</script>

<style scoped></style>