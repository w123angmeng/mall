<template>
  <div>
    <div class="auth-card">
      <!-- 登录标题 -->
      <div class="page-title text-center mb-md">登录</div>
      
      <!-- Tab切换：账号/验证码登录 -->
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
        <!-- 手机号输入（通用） -->
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

        <!-- 密码/验证码输入（根据登录类型切换） -->
        <div class="form-group mb-md" v-if="loginType === 'password'">
          <div class="input-container password-input">
            <t-input
              v-model="form.password"
              placeholder="请输入密码"
              class="theme-input"
			  type="password"
            />
          </div>
          <!-- 忘记密码链接 -->
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

        <!-- 登录按钮 -->
        <button 
          type="submit" 
          class="confirm-btn w-full"
          :disabled="!form.agreement"
        >
          登录
        </button>

        <!-- 注册链接 -->
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
import { ref } from 'vue';
import { isPhoneValid, isPasswordValid, isCodeValid } from '~/utils/validate';
import { navigateTo } from 'nuxt/app';

// 登录类型：password-账号登录 / code-验证码登录
const loginType = ref('password');
// 表单状态
const form = ref({
  phone: '',
  password: '',
  code: '',
  agreement: false
});
// 验证码倒计时
const codeBtnText = ref('获取验证码');
const codeBtnDisabled = ref(false);

// 获取验证码
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

// 登录逻辑
const handleLogin = () => {
  // 协议校验
  if (!form.value.agreement) {
    alert('请同意用户协议和隐私协议');
    return;
  }
  // 手机号校验
  if (!isPhoneValid(form.value.phone)) {
    alert('请输入正确的手机号');
    return;
  }

  // 账号登录校验
  if (loginType.value === 'password') {
    if (!isPasswordValid(form.value.password)) {
      alert('密码需6-16位，包含数字和字母');
      return;
    }
  }

  // 验证码登录校验
  if (loginType.value === 'code') {
    if (!isCodeValid(form.value.code)) {
      alert('请输入6位数字验证码');
      return;
    }
  }

  // 模拟登录成功
  alert('登录成功！');
  navigateTo('/');
};
</script>

<style lang="scss" scoped>
/* 基础卡片（完全复用忘记密码页样式） */
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

  // TDesign复选框样式重置
  :deep(.t-checkbox__label) {
    font-size: 12px !important;
    color: #999 !important;
  }
}

/* 标题 */
.page-title {
  font-size: 20px;
  font-weight: 500;
  color: #2F3032;
  margin-bottom: 25px;
}

/* Tab切换样式 */
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

/* 表单组 */
.form-group {
  width: 100%;
  margin-bottom: 16px !important;
}

/* 核心：统一输入容器样式（和忘记密码页完全一致） */
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

/* 区号样式 */
.country-code {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

/* 核心：清空t-input所有自带样式 */
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

/* 验证码按钮（和忘记密码页一致） */
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

/* 忘记密码链接 */
.forgot-link {
  display: block;
  text-align: right;
  color: #3799AE;
  text-decoration: none;
  font-size: 12px;
  margin-top: 8px;
}

/* 协议勾选 */
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

/* 登录按钮（适配宽度） */
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
}
.confirm-btn:disabled {
  background: #a8d0d8;
  cursor: not-allowed;
}
.confirm-btn:not(:disabled):hover {
  background: #2d8094;
}

/* 注册链接 */
.register-link {
  font-size: 14px;
  color: #666;
  margin-top: 20px;
}

/* 统一间距 */
.mb-md { margin-bottom: 16px !important; }
.mt-md { margin-top: 20px !important; }
.text-center { text-align: center; }
.flex-center { display: flex; align-items: center; }
.w-full { width: 100%; }
</style>