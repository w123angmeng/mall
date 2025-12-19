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
            <button type="button" class="code-btn" @click="getCode" :disabled="codeBtnDisabled || isSubmitting">
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
          <button type="submit" class="confirm-btn" :disabled="isSubmitting">
            <t-loading v-if="isSubmitting" size="small" />
            <span v-else>确定</span>
          </button>
          <button type="button" class="cancel-btn" @click="handleCancel" :disabled="isSubmitting">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' });
import { ref, onMounted } from 'vue';
import { navigateTo, useRoute } from '#app';
import * as loginApi from '@/apis/login';
// 导入 TDesign 的 MessagePlugin
import { MessagePlugin } from 'tdesign-vue-next';

// 核心新增：获取路由参数
const route = useRoute();

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

const form = ref({ 
  phone: '', 
  code: '', 
  newPassword: '', 
  reNewPassword: '' 
});
const codeBtnText = ref('获取验证码');
const codeBtnDisabled = ref(false);
const isSubmitting = ref(false);

// 核心新增：页面挂载时读取路由中的手机号参数
onMounted(() => {
  // 如果路由参数中有phone，且格式正确，自动填充到输入框
  if (route.query.phone) {
    const phone = decodeURIComponent(route.query.phone);
    const isPhoneValid = (phone) => {
      const reg = /^1[3-9]\d{9}$/;
      return reg.test(phone);
    };
    if (isPhoneValid(phone)) {
      form.value.phone = phone;
    }
  }
});

// 手机号校验规则
const isPhoneValid = (phone) => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

// 密码校验规则
const isPasswordValid = (password) => {
  const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/;
  return reg.test(password);
};

// 验证码校验规则
const isCodeValid = (code) => {
  const reg = /^\d{6}$/;
  return reg.test(code);
};

// 获取忘记密码验证码
const getCode = async () => {
  if (!process.client) return;

  // 手机号校验
  if (!isPhoneValid(form.value.phone)) {
    showMessage('error', '请输入正确的11位手机号');
    return;
  }

  try {
    codeBtnDisabled.value = true;
    // 调用忘记密码验证码接口
    await loginApi.getForgetPwdSmsCode({
      phonenumber: form.value.phone,
      userType: 'customer_user'
    });
    showMessage('success', '验证码发送成功，请注意查收');
    
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
    showMessage('error', error.message || '验证码发送失败，请重试');
    codeBtnDisabled.value = false;
  }
};

// 确认重置密码
const handleConfirm = async () => {
  if (!process.client) return;

  // 表单校验
  if (!isPhoneValid(form.value.phone)) {
    showMessage('error', '请输入正确的11位手机号');
    return;
  }
  
  if (!isCodeValid(form.value.code)) {
    showMessage('error', '请输入6位数字验证码');
    return;
  }
  
  if (!isPasswordValid(form.value.newPassword)) {
    showMessage('error', '密码需6-16位，且包含字母和数字');
    return;
  }
  
  if (form.value.newPassword !== form.value.reNewPassword) {
    showMessage('error', '两次输入的新密码不一致');
    return;
  }

  try {
    isSubmitting.value = true;
    // 调用忘记密码接口
    await loginApi.forgetPassword({
      phoneNumber: form.value.phone,
      smsCode: form.value.code,
      newPassword: form.value.newPassword
    });
    
    showMessage('success', '密码重置成功！请登录');
    setTimeout(() => {
      navigateTo('/login');
    }, 1000);
  } catch (error) {
    showMessage('error', error.message || '密码重置失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 取消重置
const handleCancel = () => {
  if (!isSubmitting.value) {
    navigateTo('/login');
  }
};
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
  align-items: center;
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

/* 验证码按钮 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.confirm-btn:hover {
  background: #2d8094;
}
.confirm-btn:disabled {
  background: #a8d0d8;
  cursor: not-allowed;
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
.cancel-btn:disabled {
  border-color: #ECEEF2;
  color: #999;
  cursor: not-allowed;
}

/* 统一间距 */
.mb-md {
}

/* 统一间距 */
.mb-md {
  margin-bottom: 16px !important;
}
.text-center {
  text-align: center;
}
</style>