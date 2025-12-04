<!-- layouts/auth.vue -->
<template>
  <div class="auth-page">
    <!-- 顶部导航条（共用） -->
    <header class="auth-header">
      <div class="header-container">
        <!-- 左侧 Logo -->
        <div class="logo-wrapper">
          <img src="@/assets/images/logo.png" alt="严牌Logo" class="logo-img" />
        </div>
        <!-- 右侧链接 -->
        <div class="header-links">
          <a href="#" class="link-item">帮助中心</a>
          <a href="#" class="link-item">售后政策</a>
        </div>
      </div>
    </header>

    <!-- 主体内容区（由子页面填充） -->
    <main class="auth-main">
      <slot /> <!-- 子页面的卡片内容会插入到这里 -->
    </main>
  </div>
</template>

<style scoped>
/* 页面整体背景：使用 bg.png */
.auth-page {
  min-height: 100vh;
  background: url('~/assets/images/bg.png') center/cover no-repeat fixed;
  position: relative;
}

/* 顶部导航条：白色背景，高度60px */
.auth-header {
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 轻微阴影区分层级 */
  position: relative;
  z-index: 10;
}

/* 导航条容器：居中内容 */
.header-container {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo 样式 */
.logo-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
}
.logo-img {
  height: 36px; /* 适配60px高度的导航条 */
  object-fit: contain;
}

/* 右侧链接：14px，#2F3032 */
.header-links {
  display: flex;
  gap: 30px; /* 链接间距 */
}
.link-item {
  font-size: 14px;
  color: #2F3032;
  text-decoration: none;
  transition: color 0.2s;
}
.link-item:hover {
  color: #4096ff; /*  hover时轻微变色 */
}

/* 主体内容区：居中卡片 */
.auth-main {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  min-height: calc(100vh - 60px); /* 减去导航条高度 */
  padding: 30px 16px;
  box-sizing: border-box;
  width: 100%; /* 关键：确保容器占满宽度，才能正确居中 */
}
</style>