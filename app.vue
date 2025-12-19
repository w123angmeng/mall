<!-- 根目录 app.vue（核心：必须有 <NuxtPage/>） -->
<template>
  <!-- 所有路由页面（如 /login、/）都会挂载到这个插槽中 -->
  <!-- <NuxtPage /> -->
  <NuxtLayout>
      <!-- NuxtPage 组件：用于渲染页面内容（替代原来的 <RouterView />） -->
      <NuxtPage />
    </NuxtLayout>
</template>

<script setup>
// 可添加全局逻辑，无需额外代码
// import { Empty } from 'tdesign-vue-next';
// app.component('t-empty', Empty);
</script>

<style global lang="scss">
/* 全局样式：可放通用样式（如重置样式） */
@import "@/assets/css/common.scss";
@import "@/assets/css/theme.css";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  
}
</style>