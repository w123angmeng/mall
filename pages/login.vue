<template>
  <div>
    <div class="auth-card">
      <div class="page-title text-center mb-md">登录</div>
      
      <div class="tab-switch mb-md">
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'password' }"
          @click="loginType = 'password'"
        >
          账号登录
        </div>
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'code' }"
          @click="loginType = 'code'"
        >
          验证码登录
        </div>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
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

        <div class="form-group mb-md" v-if="loginType === 'password'">
          <div class="input-container password-input">
            <t-input
              v-model="form.password"
              placeholder="请输入密码"
              class="theme-input"
              type="password"
            />
          </div>
          <a href="/forgot-password" class="forgot-link">忘记密码？</a>
        </div>

        <div class="form-group mb-md" v-if="loginType === 'code'">
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

        <div class="agreement mb-md flex-center">
          <t-checkbox v-model="form.agreement" size="small" />
          <span class="text-sm ml-sm">
            我已阅读并同意
            <a href="/user-agreement" class="agreement-link">《用户协议》</a>
            和
            <a href="/privacy-policy" class="agreement-link">《隐私协议》</a>
          </span>
        </div>

        <button 
          type="submit" 
          class="confirm-btn w-full"
          :disabled="!form.agreement || isSubmitting"
        >
          <t-loading v-if="isSubmitting" size="small" />
          <span v-else>登录</span>
        </button>

        <div class="register-link text-center mt-md">
          <span class="text-secondary">没有账号？</span>
          <NuxtLink to="/register" class="agreement-link">立即注册</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' });
import { ref, onMounted } from 'vue';
import { navigateTo, useRoute } from '#app';
import { useUserStore } from '@/stores/user'; // 引入用户Store
import * as loginApi from '@/apis/login';

// 初始化核心变量
const loginType = ref('password');
const isSubmitting = ref(false);
const route = useRoute();
const userStore = useUserStore(); // 实例化用户Store

// 消息提示兜底（兼容服务端/客户端）
let message = {
  error: (text) => alert(text),
  success: (text) => alert(text)
};

// 表单数据
const form = ref({
  phone: '',
  password: '',
  code: '',
  agreement: false
});

// 验证码按钮状态
const codeBtnText = ref('获取验证码');
const codeBtnDisabled = ref(false);

// 页面挂载初始化
onMounted(async () => {
  // 1. 已登录用户直接跳转
  if (process.client && userStore.isLoggedIn()) {
    navigateTo(route.query.redirect || '/');
    return;
  }

  // 2. 初始化TDesign Message
  if (process.client) {
    try {
      const tdesign = await import('tdesign-vue-next');
      if (tdesign?.Message && typeof tdesign.Message.error === 'function') {
        message = tdesign.Message;
      }
    } catch (e) {
      // 导入失败不处理，使用兜底alert
    }
  }
});

// ========== 工具校验函数 ==========
/**
 * 校验手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
const isPhoneValid = (phone) => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

/**
 * 校验密码格式（6-16位字母+数字）
 * @param {string} password - 密码
 * @returns {boolean}
 */
const isPasswordValid = (password) => {
  const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/;
  return reg.test(password);
};

/**
 * 校验验证码格式（6位数字）
 * @param {string} code - 验证码
 * @returns {boolean}
 */
const isCodeValid = (code) => {
  const reg = /^\d{6}$/;
  return reg.test(code);
};

// ========== 验证码发送逻辑 ==========
const getCode = async () => {
  if (!process.client) return;

  // 手机号校验
  if (!isPhoneValid(form.value.phone)) {
    message.error('请输入正确的11位手机号');
    return;
  }

  try {
    codeBtnDisabled.value = true;
    // 调用获取验证码接口
    await loginApi.getLoginSmsCode({
      phonenumber: form.value.phone,
      userType: 1
    });
    
    message.success('验证码发送成功，请注意查收');
    
    // 倒计时逻辑
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

// ========== 核心登录逻辑（集成Store） ==========
const handleLogin = async () => {
  if (!process.client) return;

  // 1. 协议校验
  if (!form.value.agreement) {
    message.error('请阅读并同意用户协议和隐私协议');
    return;
  }

  // 2. 手机号校验
  // if (!isPhoneValid(form.value.phone)) {
  //   message.error('请输入正确的11位手机号');
  //   return;
  // }

  try {
    isSubmitting.value = true;
    let loginParams = {};
    
    // 3. 构建登录参数
    if (loginType.value === 'password') {
      // 密码登录参数校验
      // if (!isPasswordValid(form.value.password)) {
      //   message.error('密码需6-16位，且包含字母和数字');
      //   isSubmitting.value = false;
      //   return;
      // }
      loginParams = {
        phoneNumber: form.value.phone,
        password: form.value.password,
        grantType: 'password'
      };
    } else {
      // 验证码登录参数校验
      if (!isCodeValid(form.value.code)) {
        message.error('请输入6位数字验证码');
        isSubmitting.value = false;
        return;
      }
      loginParams = {
        phoneNumber: form.value.phone,
        smsCode: form.value.code,
        grantType: 'code'
      };
    }

    // 4. 调用登录接口
    const resResult = await loginApi.login(loginParams);
    const loginResult = resResult.data
	
    // 5. 核心步骤：登录成功后初始化用户信息（Store）
    if (loginResult.access_token) {
      // 调用Store的初始化方法，传入登录返回的token等信息
      const initSuccess = await userStore.initUserInfo({
        token: loginResult.access_token,
        refreshToken: loginResult.refreshToken || '',
        phone: form.value.phone
      });

      // 6. 根据用户信息初始化结果处理
      if (initSuccess) {
        message.success('登录成功，即将跳转');
        const redirect = route.query.redirect || '/';
        // 延迟跳转，提升用户体验
        setTimeout(() => {
          navigateTo(redirect);
        }, 1000);
      } else {
        // 用户信息获取失败，提示重新登录
        message.error('登录成功，但获取用户信息失败，请重新登录');
      }
    } else {
      // 登录接口返回无token，登录失败
      message.error('登录失败，未获取到登录凭证');
    }
  } catch (error) {
    // 异常处理
    message.error(error.message || '登录失败，请重试');
  } finally {
    // 重置提交状态
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

.tab-switch {
  display: flex;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 16px !important;
}
.tab-item {
  padding: 10px 0;
  width: 50%;
  text-align: center;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  position: relative;
}
.tab-item.active {
  color: #3799AE;
  font-weight: 500;
}
.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 20%;
  width: 60%;
  height: 2px;
  background-color: #3799AE;
  border-radius: 1px;
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

.forgot-link {
  display: block;
  text-align: right;
  color: #3799AE;
  text-decoration: none;
  font-size: 12px;
  margin-top: 8px;
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

.register-link {
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