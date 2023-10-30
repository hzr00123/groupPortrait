

<template>
  <div class="title-box">
    <div class="title" :style="{fontSize}">
      {{ title }}
    </div>
    <p class="title-border" />
  </div>
</template>
<script setup lang="ts">
  const props = withDefaults(defineProps<{
    title: string,
    fontSize?: string,
	}>(),{
	  fontSize: '20px'
	})


</script>
<style lang="scss" scoped>
.title-box {
  .title {
    font-weight: 500;
    color: #000000;
    font-family: Medium;
    margin-bottom: 6px;
  }
  .title-border {
    width: 30px;
    margin-top: 5px;
    border: 2px solid #b22a25;
    border-radius: 2px;
  }
}
</style>