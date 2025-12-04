<template>
  <div>
    <div class="auth-card">
      <div class="page-title text-center mb-md">注册</div>

      <form class="register-form" @submit.prevent="handleRegister">
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

        <!-- 密码输入 -->
        <div class="form-group mb-md">
          <div class="input-container password-input">
            <t-input
              v-model="form.password"
              placeholder="请输入密码"
              class="theme-input"
              type="password"
            />
          </div>
        </div>

        <!-- 再次输入密码 -->
        <div class="form-group mb-md">
          <div class="input-container password-input">
            <t-input
              v-model="form.rePassword"
              placeholder="请再次输入密码"
              class="theme-input"
              type="password"
            />
          </div>
        </div>

        <!-- 协议勾选 -->
        <div class="agreement mb-md flex-center">
          <t-checkbox v-model="form.agreement" size="small" />
          <span class="text-sm ml-sm">
            我已阅读并同意
            <a href="/user-agreement" class="agreement-link">《用户协议》</a>
            和
            <a href="/privacy-policy" class="agreement-link">《隐私协议》</a>
          </span>
        </div>

        <!-- 注册按钮 -->
        <button 
          type="submit" 
          class="confirm-btn w-full"
          :disabled="!form.agreement || isSubmitting"
        >
          <t-loading v-if="isSubmitting" size="small" />
          <span v-else>注册</span>
        </button>

        <!-- 登录链接 -->
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
import { ref } from 'vue';
import { useMessage } from 'tdesign-vue-next';
import { navigateTo, useRoute } from '#app';
import * as loginApi from '@/apis/login';

const message = useMessage();
const route = useRoute();
const isSubmitting = ref(false);

// 表单状态
const form = ref({
  phone: '',
  code: '',
  password: '',
  rePassword: '',
  agreement: false
});

// 验证码倒计时
const codeBtnText = ref('获取验证码');
const codeBtnDisabled = ref(false);

// 手机号校验规则
const isPhoneValid = (phone) => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

// 验证码校验规则
const isCodeValid = (code) => {
  const reg = /^\d{6}$/;
  return reg.test(code);
};

// 密码校验规则
const isPasswordValid = (password) => {
  const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/;
  return reg.test(password);
};

// 获取验证码
const getCode = async () => {
  // 手机号格式校验
  if (!isPhoneValid(form.value.phone)) {
    message.error('请输入正确的11位手机号');
    return;
  }

  try {
    // 调用获取注册验证码接口
    await loginApi.getRegisterSmsCode({ phoneNumber: form.value.phone });
    message.success('验证码发送成功，请注意查收');

    // 开启倒计时
    codeBtnDisabled.value = true;
    let count = 60;
    codeBtnText.value = `${count}s后重发`;
    
    const timer = setInterval(() => {
      count--;
      codeBtnText.value = `${count}s后重发`;
      if (count <= 0) {
        clearInterval(timer);
        codeBtnText.value = '获取验证码';
        codeBtnDisabled.value = false;
      }
    }, 1000);
  } catch (error) {
    message.error(error.message || '验证码发送失败，请重试');
    codeBtnDisabled.value = false;
  }
};

// 注册逻辑
const handleRegister = async () => {
  // 基础校验
  if (!form.value.agreement) {
    message.error('请阅读并同意用户协议和隐私协议');
    return;
  }

  if (!isPhoneValid(form.value.phone)) {
    message.error('请输入正确的11位手机号');
    return;
  }

  if (!isCodeValid(form.value.code)) {
    message.error('请输入6位数字验证码');
    return;
  }

  if (!isPasswordValid(form.value.password)) {
    message.error('密码需6-16位，且包含字母和数字');
    return;
  }

  if (form.value.password !== form.value.rePassword) {
    message.error('两次输入的密码不一致');
    return;
  }

  try {
    // 提交注册请求
    isSubmitting.value = true;
    const res = await loginApi.register({
      phoneNumber: form.value.phone,
      smsCode: form.value.code,
      password: form.value.password
    });

    message.success('注册成功，即将跳转到登录页');
    
    // 获取跳转地址，优先使用redirect参数，否则跳转到首页
    const redirect = route.query.redirect || '/';
    setTimeout(() => {
      navigateTo(redirect);
    }, 1500);
  } catch (error) {
    message.error(error.message || '注册失败，请重试');
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
  font-size: 12px;
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