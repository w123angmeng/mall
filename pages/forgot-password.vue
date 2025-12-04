<!-- pages/forgot-password.vue -->
<template>
  <div>
    <div class="auth-card">
      <div class="page-title text-center mb-md">忘记密码</div>
      <form class="forgot-form" @submit.prevent="handleConfirm">
        <!-- 手机号输入 -->
        <div class="form-group mb-md">
          <div class="input-container phone-input">
            <div class="country-code">+86</div>
            <t-input
              v-model="form.phone"
              placeholder="请输入手机号"
              class="theme-input"
            />
          </div>
        </div>

        <!-- 验证码输入 -->
        <div class="form-group mb-md">
          <div class="input-container code-input">
            <t-input
              v-model="form.code"
              placeholder="请输入验证码"
              class="theme-input"
            />
            <button type="button" class="code-btn" @click="getCode" :disabled="codeBtnDisabled">
              {{ codeBtnText }}
            </button>
          </div>
        </div>

        <!-- 新密码输入 -->
        <div class="form-group mb-md">
          <div class="input-container password-input">
            <t-input
              v-model="form.newPassword"
              placeholder="请输入新密码"
              class="theme-input"
			  type="password"
            />
          </div>
        </div>

        <!-- 再次输入新密码 -->
        <div class="form-group mb-md">
          <div class="input-container password-input">
            <t-input
              v-model="form.reNewPassword"
              placeholder="请再次输入新密码"
              class="theme-input"
			  type="password"
            />
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="btn-group">
          <button type="submit" class="confirm-btn">确定</button>
          <button type="button" class="cancel-btn" @click="handleCancel">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' });
import { ref } from 'vue';
import { isPhoneValid, isPasswordValid, isCodeValid } from '~/utils/validate';
import { navigateTo } from 'nuxt/app';

const form = ref({ phone: '', code: '', newPassword: '', reNewPassword: '' });
const codeBtnText = ref('获取验证码');
const codeBtnDisabled = ref(false);

const getCode = () => {
  if (!isPhoneValid(form.value.phone)) {
    alert('请输入正确的手机号');
    return;
  }
  codeBtnDisabled.value = true;
  codeBtnText.value = '60s后重发';
  let count = 60;
  const timer = setInterval(() => {
    count--;
    codeBtnText.value = `${count}s后重发`;
    if (count <= 0) {
      clearInterval(timer);
      codeBtnText.value = '获取验证码';
      codeBtnDisabled.value = false;
    }
  }, 1000);
};

const handleConfirm = () => {
  if (!isPhoneValid(form.value.phone)) { alert('请输入正确的手机号'); return; }
  if (!isCodeValid(form.value.code)) { alert('请输入6位数字验证码'); return; }
  if (!isPasswordValid(form.value.newPassword)) { alert('密码需6-16位，包含数字和字母'); return; }
  if (form.value.newPassword !== form.value.reNewPassword) { alert('两次输入的新密码不一致'); return; }
  
  alert('密码重置成功！请登录');
  navigateTo('/login');
};

const handleCancel = () => navigateTo('/login');
</script>

<style lang="scss" scoped>
/* 基础卡片 */
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 30px;
  box-sizing: border-box;
  margin: 0 auto;
  :deep(.t-input) {
      height: 39px !important; // 加 !important 覆盖内置样式
      border: none !important;
      box-shadow: none !important; // 清空内置阴影
      background: transparent !important; // 清空背景
  
      // 穿透到输入框核心元素
      .t-input__inner {
        height: 100% !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        padding: 0 !important; // 清空内置内边距
        line-height: 1 !important;
      }
    }
}

/* 标题 */
.page-title {
  font-size: 20px;
  font-weight: 500;
  color: #2F3032;
  margin-bottom: 25px;
}

/* 表单组 */
.form-group {
  width: 100%;
  margin-bottom: 16px !important;
}

/* 核心：统一输入容器样式 */
.input-container {
  width: 100%;
  height: 40px;
  border: 1px solid #ECEEF2;
  border-radius: 4px;
  padding: 0 15px;
  box-sizing: border-box;
  display: flex;
  align-items: center; /* 强制垂直居中 */
  justify-content: flex-start;
}

/* 手机号容器特殊布局 */
.phone-input {
  gap: 8px;
}

/* 验证码容器特殊布局 */
.code-input {
  gap: 10px;
}

/* 区号样式 */
.country-code {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

/* 核心：清空t-input所有自带样式 */
.theme-input {
  /* 重置所有默认样式 */
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1 !important;
  font-size: 14px !important;
  color: #2F3032 !important;
  border-radius: 0 !important;
  /* 占位符样式统一 */
  ::-webkit-input-placeholder { color: #999 !important; }
  ::-moz-placeholder { color: #999 !important; }
  :-ms-input-placeholder { color: #999 !important; }
  ::placeholder { color: #999 !important; }
}

/* 验证码按钮：清空主题色边框，仅保留文字样式 */
.code-btn {
  width: 90px;
  height: 28px;
  background: transparent !important;
  border: none !important; /* 清空边框 */
  outline: none !important;
  box-shadow: none !important;
  color: #3799AE;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0; /* 不被挤压 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  margin: 0 !important;
}
.code-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}
.confirm-btn {
  width: 100px;
  height: 44px;
  background: #3799AE;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background .2s;
}
.confirm-btn:hover {
  background: #2d8094;
}
.cancel-btn {
  width: 100px;
  height: 44px;
  background: transparent;
  border: 1px solid #ECEEF2;
  color: #2F3032;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: border-color .2s, color .2s;
}
.cancel-btn:hover {
  border-color: #3799AE;
  color: #3799AE;
}

/* 统一间距 */
.mb-md {
  margin-bottom: 16px !important;
}
.text-center {
  text-align: center;
}
</style>