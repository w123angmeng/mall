<!-- pages/select-auth.vue -->
<template>
  <div>
    <div class="auth-card">
      <!-- 页面标题 -->
      <div class="page-title text-center">
        注册成功，请选择认证方式
      </div>

      <!-- 认证方式选项 -->
      <div class="auth-options">
        <!-- 个人认证 -->
        <div 
          class="auth-option-card" 
          :class="{ active: selectedAuth === 'personal' }"
          @click="selectedAuth = 'personal'"
        >
          <div class="auth-text">个人认证</div>
          <div class="auth-img">
            <img src="~/assets/images/personal.png" alt="个人认证" />
          </div>
        </div>

        <!-- 企业认证 -->
        <div 
          class="auth-option-card" 
          :class="{ active: selectedAuth === 'enterprise' }"
          @click="selectedAuth = 'enterprise'"
        >
          <div class="auth-text">企业认证</div>
          <div class="auth-img">
            <img src="~/assets/images/enterprise.png" alt="企业认证" />
          </div>
        </div>
      </div>

      <!-- 操作按钮/链接 -->
      <div class="auth-actions">
        <button 
          class="confirm-btn w-full"
          @click="handleConfirm"
          :disabled="!selectedAuth"
        >
          确认认证
        </button>

        <a href="/" class="skip-link text-center">
          跳过认证
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// 复用auth布局（导航+背景）
definePageMeta({ layout: 'auth' });
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';

// 选中的认证方式
const selectedAuth = ref('');

// 确认认证
const handleConfirm = () => {
  if (selectedAuth.value === 'personal') {
    // 跳转到个人认证页面
    navigateTo('/verify-personal');
  } else if (selectedAuth.value === 'enterprise') {
    // 跳转到企业认证页面
    navigateTo('/verify-enterprise');
  }
};
</script>

<style lang="scss" scoped>
/* 基础卡片（精准尺寸：宽648px 高468px） */
.auth-card {
  width: 548px !important;
  height: 468px !important;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 40px 60px; /* 调整内边距适配高宽 */
  box-sizing: border-box;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 内容垂直分布均匀 */
}

/* 页面标题 */
.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #2F3032;
  margin-bottom: 20px;
}

/* 认证方式选项容器 */
.auth-options {
  display: flex;
  justify-content: center; /* 选项居中 */
  gap: 120px; /* 增大间距适配宽卡片 */
  flex: 1; /* 占满中间空间 */
  align-items: center; /* 垂直居中 */
}

/* 认证选项卡片（精准尺寸：宽204px 高194px） */
.auth-option-card {
  width: 204px !important;
  height: 194px !important;
  border: 1px solid #ECEEF2;
  border-radius: 8px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color .2s, background .2s;
  gap: 16px; /* 文字和图片间距 */

  // 选中态
  &.active {
    border-color: #3799AE;
    background: rgba(55, 153, 174, 0.05);
  }
}

/* 认证文字（先显示，字号16px） */
.auth-text {
  font-size: 16px !important;
  color: #2F3032;
  font-weight: 500;
}

/* 认证图片容器 */
.auth-img {
  width: 80px; /* 图片宽度，可根据实际调整 */
  height: 80px; /* 图片高度，可根据实际调整 */
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* 图片自适应，不拉伸 */
  }
}

/* 操作区域 */
.auth-actions {
  width: 100%;
  text-align: center;
}

/* 确认按钮（适配宽卡片） */
.confirm-btn {
  width: 200px; /* 按钮宽度适配 */
  height: 44px;
  background: #3799AE;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background .2s;
  margin: 0 auto 16px; /* 按钮居中 */
}
.confirm-btn:disabled {
  background: #a8d0d8;
  cursor: not-allowed;
}
.confirm-btn:not(:disabled):hover {
  background: #2d8094;
}

/* 跳过认证链接 */
.skip-link {
  display: inline-block;
  font-size: 14px;
  color: #3799AE;
  text-decoration: none;
}
.skip-link:hover {
  text-decoration: underline;
}

/* 统一工具类 */
.text-center { text-align: center; }
.w-full { width: 100%; }
</style>