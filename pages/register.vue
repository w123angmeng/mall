<template>
  <div>
    <div class="auth-card">
      <div class="page-title text-center mb-md">注册</div>

      <form class="register-form" @submit.prevent="handleRegister" novalidate>
        <div class="form-group mb-md">
          <div class="input-container phone-input">
            <div class="country-code">+86</div>
            <t-input v-model="form.phone" placeholder="请输入手机号" class="theme-input" />
          </div>
        </div>

        <div class="form-group mb-md">
          <div class="input-container code-input">
            <t-input v-model="form.code" placeholder="请输入验证码" class="theme-input" />
            <button type="button" class="code-btn" @click="getCode" :disabled="codeBtnDisabled || !isPhoneValid(form.phone)">
              {{ codeBtnText }}
            </button>
          </div>
        </div>

        <div class="form-group mb-md">
          <div class="input-container password-input">
            <t-input v-model="form.password" placeholder="请输入密码" class="theme-input" type="password" />
          </div>
        </div>

        <div class="form-group mb-md">
          <div class="input-container password-input">
            <t-input v-model="form.rePassword" placeholder="请再次输入密码" class="theme-input" type="password" />
          </div>
        </div>

        <div class="agreement mb-md flex-center">
          <t-checkbox v-model="form.agreement" size="small" />
          <span class="text-sm ml-sm">
            我已阅读并同意
            <a href="/user-agreement" class="agreement-link">《用户协议》</a>
            和
            <a href="/privacy-policy" class="agreement-link">《隐私协议》</a>
          </span>
        </div>

        <button type="submit" class="confirm-btn w-full" :disabled="!form.agreement || isSubmitting">
          <t-loading v-if="isSubmitting" size="small" />
          <span v-else>注册</span>
        </button>

        <div class="login-link text-center mt-md">
          <span class="text-secondary">已有账号？</span>
          <NuxtLink to="/login" class="agreement-link">立即登录</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' });

import { ref, onMounted, onBeforeUnmount } from 'vue';
import { navigateTo, useRoute } from '#app';
import { useUserStore } from '@/stores/user'; // 导入用户Store
import * as loginApi from '@/apis/login';
// 核心修改：导入 TDesign 的 MessagePlugin
import { MessagePlugin } from 'tdesign-vue-next';

// 统一消息提示方法（适配 TDesign MessagePlugin 规范）
const showMessage = (type, text) => {
  switch (type) {
    case 'error':
      MessagePlugin.error({ content: text });
      break;
    case 'success':
      MessagePlugin.success({ content: text });
      break;
    case 'warning':
      MessagePlugin.warning({ content: text });
      break;
    case 'info':
      MessagePlugin.info({ content: text });
      break;
    default:
      MessagePlugin.info({ content: text });
  }
};

const route = useRoute();
const userStore = useUserStore(); // 初始化用户Store
const isSubmitting = ref(false);

const form = ref({
  phone: '',
  code: '',
  password: '',
  rePassword: '',
  agreement: false
});

const codeBtnText = ref('获取验证码');
const codeBtnDisabled = ref(false);
let countdownTimer = null;
let countdown = 0;

const isPhoneValid = (phone) => {
  if (!phone) return false;
  return /^1[3-9]\d{9}$/.test(String(phone).trim());
};
const isCodeValid = (code) => {
  if (!code) return false;
  return /^\d{6}$/.test(String(code).trim());
};
const isPasswordValid = (password) => {
  if (!password) return false;
  return /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,16}$/.test(String(password));
};

onMounted(() => {
  // 移除原有动态获取 message 实例的逻辑
});

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});

const getCode = async () => {
  if (!isPhoneValid(form.value.phone)) {
    showMessage('error', '请输入正确的11位手机号');
    return;
  }
  if (codeBtnDisabled.value) return;
  try {
    codeBtnDisabled.value = true;
    await loginApi.getRegisterSmsCode({ phoneNumber: form.value.phone });
    showMessage('success', '验证码发送成功，请注意查收');
    countdown = 60;
    codeBtnText.value = `${countdown}s后重发`;
    countdownTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        codeBtnText.value = '获取验证码';
        codeBtnDisabled.value = false;
      } else {
        codeBtnText.value = `${countdown}s后重发`;
      }
    }, 1000);
  } catch (err) {
    const errMsg = err?.message || '验证码发送失败，请重试';
    showMessage('error', errMsg);
    codeBtnDisabled.value = false;
    codeBtnText.value = '获取验证码';
  }
};

/**
 * 自动登录并初始化用户信息
 * @returns {Promise<boolean>} 是否成功
 */
const autoLoginAndInitUser = async () => {
  try {
    // 1. 调用登录接口（验证码登录，因为注册时用户还没设置密码登录的习惯）
    const loginResult = await loginApi.login({
      phoneNumber: form.value.phone,
      password: form.value.password, // 复用注册验证码（后端需支持验证码有效期内复用）
      grantType: 'password' // 验证码登录类型
    });

    // 2. 初始化用户信息（调用Store方法）
    const initSuccess = await userStore.initUserInfo({
      token: loginResult.token,
      refreshToken: loginResult.refreshToken || '',
      phone: form.value.phone
    });

    if (initSuccess) {
      return true;
    } else {
      showMessage('error', '用户信息获取失败，请手动登录');
      return false;
    }
  } catch (loginErr) {
    // 登录失败处理（比如验证码过期，改用密码登录）
    showMessage('error', `自动登录失败：${loginErr.message || '请手动登录'}`);
    return false;
  }
};

const handleRegister = async () => {
  // 基础校验
  if (!form.value.agreement) {
    showMessage('error', '请阅读并同意用户协议和隐私协议');
    return;
  }
  if (!isPhoneValid(form.value.phone)) {
    showMessage('error', '请输入正确的11位手机号');
    return;
  }
  if (!isCodeValid(form.value.code)) {
    showMessage('error', '请输入6位数字验证码');
    return;
  }
  if (!isPasswordValid(form.value.password)) {
    showMessage('error', '密码需6-16位，且包含字母和数字');
    return;
  }
  if (form.value.password !== form.value.rePassword) {
    showMessage('error', '两次输入的密码不一致');
    return;
  }

  try {
    isSubmitting.value = true;
    
    // 1. 调用注册接口
    await loginApi.register({
      phoneNumber: form.value.phone,
      smsCode: form.value.code,
      password: form.value.password
    });

    showMessage('success', '注册成功，正在为您自动登录...');

    // 2. 核心：自动登录并初始化用户信息
    const loginSuccess = await autoLoginAndInitUser();
    
    if (loginSuccess) {
      // 3. 登录成功：跳转到认证选择页
      showMessage('success', '登录成功，即将跳转到认证选择页');
      setTimeout(() => {
        navigateTo('/select-auth'); // 跳转到认证选择页
      }, 1200);
    } else {
      // 自动登录失败：跳转到登录页
      setTimeout(() => {
        navigateTo('/login?phone=' + encodeURIComponent(form.value.phone));
      }, 1200);
    }
  } catch (err) {
    const errMsg = err?.message || '注册失败，请重试';
    showMessage('error', errMsg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
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
    height: 39px !important;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;

    .t-input__inner {
      height: 100% !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      line-height: 1 !important;
    }
  }

  :deep(.t-checkbox__label) {
    font-size: 12px !important;
    color: #999 !important;
  }
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  color: #2F3032;
  margin-bottom: 25px;
}

.form-group {
  width: 100%;
  margin-bottom: 16px !important;
}

.input-container {
  width: 100%;
  height: 40px;
  border: 1px solid #ECEEF2;
  border-radius: 4px;
  padding: 0 15px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.phone-input { gap: 8px; }
.code-input { gap: 10px; }

.country-code {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.theme-input {
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
  
  ::-webkit-input-placeholder { color: #999 !important; }
  ::-moz-placeholder { color: #999 !important; }
  :-ms-input-placeholder { color: #999 !important; }
  ::placeholder { color: #999 !important; }
}

.code-btn {
  width: 90px;
  height: 28px;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  color: #3799AE;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
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

.agreement {
  font-size: 12px;
  color: #999;
  justify-content: center;
}
.agreement-link {
  color: #3799AE;
  text-decoration: none;
  margin: 0 2px;
}
.agreement-link:hover {
  text-decoration: underline;
}

.confirm-btn {
  width: 100%;
  height: 44px;
  background: #3799AE;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.confirm-btn:disabled {
  background: #a8d0d8;
  cursor: not-allowed;
}
.confirm-btn:not(:disabled):hover {
  background: #2d8094;
}

.login-link {
  font-size: 14px;
  color: #666;
  margin-top: 20px;
}

.mb-md { margin-bottom: 16px !important; }
.mt-md { margin-top: 20px !important; }
.text-center { text-align: center; }
.flex-center { display: flex; align-items: center; }
.w-full { width: 100%; }
</style>