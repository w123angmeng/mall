<template>
  <div class="account-manage">
    <!-- 账号信息卡片 -->
    <div class="account-card">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <span class="info-label">我的头像：</span>
        <div 
          class="avatar-wrap" 
          @mouseenter="isAvatarHover = true" 
          @mouseleave="isAvatarHover = false"
          @click="triggerAvatarUpload"
        >
          <img :src="userInfo.avatar || '~/assets/images/user-avatar.png'" alt="我的头像" class="avatar-img" />
          <div class="avatar-mask" v-if="isAvatarHover">
            <img src="~/assets/images/upload.png" alt="上传图标" class="upload-icon" />
          </div>
          <img src="~/assets/images/edit.png" alt="编辑" class="edit-icon" @click.stop="triggerAvatarUpload" />
        </div>
        <input 
          type="file" 
          ref="avatarInput" 
          class="avatar-upload-input" 
          accept="image/*"
          @change="handleAvatarUpload"
        >
      </div>

      <!-- 我的昵称 -->
      <div class="info-item">
        <span class="info-label">我的昵称：</span>
        <span class="info-value">{{ userInfo.nickname || '未设置' }}</span>
      </div>

      <!-- 手机号码 -->
      <div class="info-item">
        <span class="info-label">手机号码：</span>
        <span class="info-value">{{ formatPhone(userInfo.phoneNumber) }}</span>
        <img src="~/assets/images/edit.png" alt="编辑" class="edit-icon" @click="openPhoneModal" />
      </div>

      <!-- 登录密码 -->
      <div class="info-item">
        <span class="info-label">登录密码：</span>
        <span class="info-value">**********</span>
        <img src="~/assets/images/edit.png" alt="编辑" class="edit-icon" @click="openPwdModal" />
      </div>

      <!-- 退出登录按钮 -->
      <button class="logout-btn">退出登录</button>
    </div>

    <!-- 修改手机号弹窗 -->
    <t-dialog 
      v-model:visible="phoneModalVisible" 
      header="修改手机号" 
      width="400px"
      :theme="dialogTheme"
    >
      <div class="form-item">
        <t-input 
          prefix="+86" 
          v-model="phoneForm.newPhone"
          placeholder="请输入新手机号" 
          class="form-input"
          :disabled="isPhoneSubmitting"
        />
      </div>
      <div class="form-item">
        <t-input 
          v-model="phoneForm.smsCode"
          placeholder="请输入验证码" 
          class="form-input"
          :disabled="isPhoneSubmitting || codeBtnDisabled"
        />
        <span class="verify-code-text" @click="getPhoneCode" :class="{ disabled: codeBtnDisabled || isPhoneSubmitting }">
          {{ codeBtnText }}
        </span>
      </div>
      <template #footer>
        <t-button theme="default" @click="phoneModalVisible = false" :disabled="isPhoneSubmitting">取消</t-button>
        <t-button class="submit-btn" @click="submitUpdatePhone" :disabled="isPhoneSubmitting">
          <t-loading v-if="isPhoneSubmitting" size="small" />
          <span v-else>提交</span>
        </t-button>
      </template>
    </t-dialog>

    <!-- 修改密码弹窗 -->
    <t-dialog 
      v-model:visible="pwdModalVisible" 
      header="修改密码" 
      width="400px"
      :theme="dialogTheme"
    >
      <div class="form-item">
        <t-input 
          prefix="+86" 
          v-model="pwdForm.phoneNumber"
          disabled 
          class="form-input"
        />
      </div>
      <div class="form-item">
        <t-input 
          v-model="pwdForm.smsCode"
          placeholder="请输入验证码" 
          class="form-input"
          :disabled="isPwdSubmitting || pwdCodeBtnDisabled"
        />
        <span class="verify-code-text" @click="getPwdCode" :class="{ disabled: pwdCodeBtnDisabled || isPwdSubmitting }">
          {{ pwdCodeBtnText }}
        </span>
      </div>
      <div class="form-item">
        <t-input 
          type="password" 
          v-model="pwdForm.newPassword"
          placeholder="请输入新密码" 
          class="form-input"
          :disabled="isPwdSubmitting"
        />
      </div>
      <div class="form-item">
        <t-input 
          type="password" 
          v-model="pwdForm.confirmPassword"
          placeholder="请再次输入密码" 
          class="form-input"
          :disabled="isPwdSubmitting"
        />
      </div>
      <template #footer>
        <t-button theme="default" @click="pwdModalVisible = false" :disabled="isPwdSubmitting">取消</t-button>
        <t-button class="submit-btn" @click="submitUpdatePwd" :disabled="isPwdSubmitting">
          <t-loading v-if="isPwdSubmitting" size="small" />
          <span v-else>提交</span>
        </t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
import { Dialog, Input, Button, Loading, Message } from 'tdesign-vue-next';
import { ref, reactive, onMounted } from 'vue';
import { navigateTo, useRequest } from '#imports'; // 显式导入 Nuxt 组合式函数
import { getUserApi } from '@/apis/user';

// 初始化 API 实例（关键：在 setup 中调用 getUserApi，确保 useRequest 上下文正确）
const userApi = getUserApi();

// 头像相关状态
const isAvatarHover = ref(false);
const avatarInput = ref(null);
const isAvatarUploading = ref(false);

// 用户信息
const userInfo = reactive({
  avatar: '',
  nickname: '',
  phoneNumber: ''
});

// 弹窗显示状态
const phoneModalVisible = ref(false);
const pwdModalVisible = ref(false);
const dialogTheme = ref({ primaryColor: '#3799AE' });

// 修改手机号表单
const phoneForm = reactive({
  newPhone: '',
  smsCode: ''
});
const codeBtnText = ref('获取验证码');
const codeBtnDisabled = ref(false);
const isPhoneSubmitting = ref(false);

// 修改密码表单
const pwdForm = reactive({
  phoneNumber: '',
  smsCode: '',
  newPassword: '',
  confirmPassword: ''
});
const pwdCodeBtnText = ref('获取验证码');
const pwdCodeBtnDisabled = ref(false);
const isPwdSubmitting = ref(false);

// 初始化 Message（直接使用 TDesign 组件，避免动态导入的上下文问题）
const showMessage = (type, text) => {
  Message[type]({
    content: text,
    duration: 3000
  });
};

// 页面挂载时获取用户信息
onMounted(async () => {
  await fetchUserInfo();
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await userApi.getUserProfile();
    if (res?.data) {
      userInfo.avatar = res.data.avatar;
      userInfo.nickname = res.data.nickname;
      userInfo.phoneNumber = res.data.phoneNumber;
      pwdForm.phoneNumber = res.data.phoneNumber;
    }
  } catch (error) {
    showMessage('error', '获取用户信息失败');
  }
};

// 格式化手机号（138****1234）
const formatPhone = (phone) => {
  if (!phone) return '未绑定';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 手机号校验
const isPhoneValid = (phone) => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

// 密码校验
const isPasswordValid = (password) => {
  const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/;
  return reg.test(password);
};

// 头像上传
const triggerAvatarUpload = () => {
  if (isAvatarUploading.value) return;
  avatarInput.value.click();
};

const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // 校验文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    showMessage('error', '头像文件大小不能超过2MB');
    return;
  }

  try {
    isAvatarUploading.value = true;
    // 调用上传头像接口
    const res = await userApi.updateUserAvatar({
      file,
      onProgress: (progress) => {
        console.log('上传进度：', progress);
      }
    });
    
    if (res?.data) {
      showMessage('success', '头像修改成功');
      userInfo.avatar = res.data.avatarUrl;
    }
  } catch (error) {
    showMessage('error', error.message || '头像上传失败，请重试');
  } finally {
    isAvatarUploading.value = false;
    avatarInput.value.value = '';
  }
};

// 获取修改手机号验证码
const getPhoneCode = async () => {
  if (!isPhoneValid(phoneForm.newPhone)) {
    showMessage('error', '请输入有效的11位手机号');
    return;
  }

  try {
    codeBtnDisabled.value = true;
    codeBtnText.value = '60s后重发';
    
    // 调用获取验证码接口（此处需补充实际接口）
    // await userApi.getSmsCode({ phoneNumber: phoneForm.newPhone, type: 'updatePhone' });
    showMessage('success', '验证码发送成功');
    
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
  } catch (error) {
    showMessage('error', error.message || '验证码发送失败');
    codeBtnDisabled.value = false;
    codeBtnText.value = '获取验证码';
  }
};

// 提交修改手机号
const submitUpdatePhone = async () => {
  if (!isPhoneValid(phoneForm.newPhone)) {
    showMessage('error', '请输入有效的11位手机号');
    return;
  }
  
  if (!phoneForm.smsCode || phoneForm.smsCode.length !== 6) {
    showMessage('error', '请输入6位数字验证码');
    return;
  }

  try {
    isPhoneSubmitting.value = true;
    // 调用修改手机号接口
    await userApi.updateUserPhone({
      phoneNumber: phoneForm.newPhone,
      smsCode: phoneForm.smsCode
    });
    
    showMessage('success', '手机号修改成功，请重新登录');
    setTimeout(() => {
      phoneModalVisible.value = false;
      // 退出登录并跳转登录页（实际项目中需补充退出登录逻辑）
      navigateTo('/login');
    }, 1500);
  } catch (error) {
    showMessage('error', error.message || '手机号修改失败，请重试');
  } finally {
    isPhoneSubmitting.value = false;
  }
};

// 获取修改密码验证码
const getPwdCode = async () => {
  if (!pwdForm.phoneNumber) {
    showMessage('error', '手机号不能为空');
    return;
  }

  try {
    pwdCodeBtnDisabled.value = true;
    pwdCodeBtnText.value = '60s后重发';
    
    // 调用获取验证码接口（此处需补充实际接口）
    // await userApi.getSmsCode({ phoneNumber: pwdForm.phoneNumber, type: 'updatePassword' });
    showMessage('success', '验证码发送成功');
    
    let count = 60;
    const timer = setInterval(() => {
      count--;
      pwdCodeBtnText.value = `${count}s后重发`;
      if (count <= 0) {
        clearInterval(timer);
        pwdCodeBtnText.value = '获取验证码';
        pwdCodeBtnDisabled.value = false;
      }
    }, 1000);
  } catch (error) {
    showMessage('error', error.message || '验证码发送失败');
    pwdCodeBtnDisabled.value = false;
    pwdCodeBtnText.value = '获取验证码';
  }
};

// 提交修改密码
const submitUpdatePwd = async () => {
  if (!pwdForm.smsCode || pwdForm.smsCode.length !== 6) {
    showMessage('error', '请输入6位数字验证码');
    return;
  }
  
  if (!isPasswordValid(pwdForm.newPassword)) {
    showMessage('error', '密码需6-16位，且包含字母和数字');
    return;
  }
  
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    showMessage('error', '两次输入的密码不一致');
    return;
  }

  try {
    isPwdSubmitting.value = true;
    // 调用修改密码接口
    await userApi.updateUserPassword({
      phoneNumber: pwdForm.phoneNumber,
      smsCode: pwdForm.smsCode,
      newPassword: pwdForm.newPassword
    });
    
    showMessage('success', '密码修改成功，请重新登录');
    setTimeout(() => {
      pwdModalVisible.value = false;
      // 退出登录并跳转登录页
      navigateTo('/login');
    }, 1500);
  } catch (error) {
    showMessage('error', error.message || '密码修改失败，请重试');
  } finally {
    isPwdSubmitting.value = false;
  }
};

// 弹窗打开逻辑
const openPhoneModal = () => {
  phoneForm.newPhone = '';
  phoneForm.smsCode = '';
  codeBtnText.value = '获取验证码';
  codeBtnDisabled.value = false;
  phoneModalVisible.value = true;
};

const openPwdModal = () => {
  pwdForm.smsCode = '';
  pwdForm.newPassword = '';
  pwdForm.confirmPassword = '';
  pwdCodeBtnText.value = '获取验证码';
  pwdCodeBtnDisabled.value = false;
  pwdModalVisible.value = true;
};
</script>

<style lang="scss" scoped>
.account-manage {
  width: 100%;
  height: 100%;

  .account-card {
    padding: 24px;

    .avatar-section {
      display: flex;
      align-items: center;
      margin-bottom: 24px;

      .info-label {
        width: 80px;
        font-size: 14px;
        color: #666;
      }

      .avatar-wrap {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;

          .upload-icon {
            width: 24px;
            height: 24px;
          }
        }

        .edit-icon {
          position: absolute;
          top: 0;
          right: -20px;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
      }

      .avatar-upload-input {
        display: none;
      }
    }

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      font-size: 14px;

      .info-label {
        width: 80px;
        color: #666;
      }

      .info-value {
        color: #333;
        margin-right: 10px;
      }

      .edit-icon {
        margin-left: 60px;
        width: 16px;
        height: 16px;
        cursor: pointer;
      }
    }

    .logout-btn {
      background: #3799AE;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;

      &:hover {
        background: #2d8094;
      }
    }
  }

  .verify-code-text {
    font-size: 14px !important;
    font-weight: normal !important;
    line-height: 14px !important;
    letter-spacing: 0em !important;
    color: #3799AE !important;
    cursor: pointer;
    padding: 0 5px;

    &:hover {
      color: #2d8094 !important;
      text-decoration: underline;
    }

    &.disabled {
      color: #999 !important;
      cursor: not-allowed;
      text-decoration: none;
    }
  }

  .submit-btn {
    background: #3799AE !important;
    border-color: #3799AE !important;
    color: #ffffff !important;
    font-size: 14px;
    padding: 0 16px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background: #2d8094 !important;
      border-color: #2d8094 !important;
    }

    &:disabled {
      background: #99c4cf !important;
      border-color: #99c4cf !important;
      cursor: not-allowed;
    }
  }

  .form-item {
    margin-bottom: 15px;
    display: flex;
    gap: 10px;
    align-items: center;

    .form-input {
      flex: 1;
      height: 36px;

      :deep(.t-input__inner) {
        border-color: #ECEEF2;
        &:focus {
          border-color: #3799AE;
          box-shadow: 0 0 0 2px rgba(55, 153, 174, 0.1);
        }
      }
    }
  }

  :deep(.t-dialog__header) {
    border-bottom: 1px solid #ECEEF2;
    padding-bottom: 12px;
    .t-dialog__title {
      color: #2F3032;
      font-weight: 500;
    }
  }

  :deep(.t-dialog__footer) {
    border-top: 1px solid #ECEEF2;
    padding-top: 12px;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>