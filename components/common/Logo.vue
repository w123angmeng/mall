<!-- components/common/Logo.vue -->
<template>
  <div class="logo-container">
    <img src="/images/yanpai-logo.png" alt="严牌商城Logo" class="logo-img" />
    <span class="logo-text">严牌商城</span>
  </div>
</template>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.logo-img {
  width: 32px;
  height: 32px;
  margin-right: var(--gap-sm);
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-primary);
}
</style>