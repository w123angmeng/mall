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
          <img :src="userInfo.avatar" alt="我的头像" class="avatar-img" />
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
        <span class="info-value">{{ getDisplayNickname() }}</span>
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
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>

    <!-- 修改手机号弹窗 -->
    <t-dialog 
      v-model:visible="phoneModalVisible" 
      header="修改手机号" 
      width="368px"
	  class="diy-dialog"
	  
	  
    >
	 <t-form ref="phoneFormRef" :rules="phoneFormRules" :data="phoneForm" :colon="false" labelWidth="0px">
	  <t-form-item label="" name="newPhone">
      <div class="form-item">
		  <t-input-adornment prepend="+86">
		        <t-input
		          v-model="phoneForm.newPhone"
		          placeholder="请输入新手机号" 
		          class="form-input"
		          :disabled="isPhoneSubmitting"
		        />
		  </t-input-adornment>
        
      </div>
	  </t-form-item>
	  <t-form-item label="" name="smsCode">
      <div class="form-item">
        <t-input 
          v-model="phoneForm.smsCode"
          placeholder="请输入验证码" 
          class="form-input"
          :disabled="isPhoneSubmitting"
        />
        <span class="verify-code-text" @click="getPhoneCode" :class="{ disabled: codeBtnDisabled || isPhoneSubmitting }">
          {{ codeBtnText }}
        </span>
      </div>
	  </t-form-item>
      
	  </t-form>
	  <template #footer>
	    <t-button theme="default" type="reset" :disabled="isPhoneSubmitting" @click="onPhoneFormReset">取消</t-button>
	    <t-button theme="primary" type="submit" :disabled="isPhoneSubmitting" @click="submitUpdatePhone">
	      <t-loading v-if="isPhoneSubmitting" size="small" />
	      <span v-else>提交</span>
	    </t-button>
	  </template>
    </t-dialog>

    <!-- 修改密码弹窗 -->
    <t-dialog 
      v-model:visible="pwdModalVisible" 
      header="修改密码" 
      width="368px"
	  :dialogClassName="diyDialog"
    >
	<t-form ref="pwdFormRef" :rules="pwdFormRules" :data="pwdForm" :colon="false" labelWidth="0px">
	 <t-form-item label="" name="phoneNumber">
      <div class="form-item">
        <!-- <t-input 
          prefix="+86" 
          v-model="pwdForm.phoneNumber"
          disabled 
          class="form-input"
        /> -->
		<t-input-adornment prepend="+86">
		      <t-input
		        v-model="pwdForm.phoneNumber"
		        placeholder="请输入新手机号" 
		        class="form-input"
		        disabled
		      />
		</t-input-adornment>
      </div>
	  </t-form-item>
	  <t-form-item label="" name="smsCode">
      <div class="form-item">
        <t-input 
          v-model="pwdForm.smsCode"
          placeholder="请输入验证码" 
          class="form-input"
          :disabled="isPwdSubmitting || !pwdCodeBtnDisabled"
        />
        <span class="verify-code-text" @click="getPwdCode" :class="{ disabled: pwdCodeBtnDisabled || isPwdSubmitting }">
          {{ pwdCodeBtnText }}
        </span>
      </div>
	  </t-form-item>
	  <t-form-item label="" name="newPassword">
      <div class="form-item">
        <t-input 
          type="password" 
          v-model="pwdForm.newPassword"
          placeholder="请输入新密码" 
          class="form-input"
          :disabled="isPwdSubmitting"
        />
      </div>
	  </t-form-item>
	  <t-form-item label="" name="confirmPassword">
      <div class="form-item">
        <t-input 
          type="password" 
          v-model="pwdForm.confirmPassword"
          placeholder="请再次输入密码" 
          class="form-input"
          :disabled="isPwdSubmitting"
        />
      </div>
	  </t-form-item>
      
	  </t-form>
	  <template #footer>
	    <t-button theme="default" type="reset" @click="onPwdFormReset" :disabled="isPwdSubmitting">取消</t-button>
	    <t-button theme="primary" :disabled="isPwdSubmitting" @click="submitUpdatePwd" >
	      <t-loading v-if="isPwdSubmitting" size="small" />
	      <span v-else>提交</span>
	    </t-button>
	  </template>
    </t-dialog>

    <!-- 退出登录确认弹窗（新增） -->
    <t-dialog
      v-model:visible="logoutConfirmVisible"
      width="300px"
	  header="提示"
    >
      <div class="logout-confirm-content">
        确定要退出登录吗？
      </div>
      <template #footer>
        <t-button theme="default" @click="logoutConfirmVisible = false">取消</t-button>
        <t-button theme="primary" @click="confirmLogout">确定</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
import { Dialog, Form, FormItem, Input, Button, Loading, MessagePlugin } from 'tdesign-vue-next';
import { ref, reactive, onMounted } from 'vue';
import { navigateTo, useRequest } from '#imports';
import { getUserApi } from '@/apis/user';
import * as loginApi from '@/apis/login';
import { useUserStore } from '@/stores/user';

// 初始化 API 实例
const userApi = getUserApi();
// 初始化用户Store
const userStore = useUserStore();

// 头像相关状态
const isAvatarHover = ref(false);
const avatarInput = ref(null);
const isAvatarUploading = ref(false);

// 用户信息
const userInfo = reactive({
  avatar: '',
  nickname: '',
  phoneNumber: '',
  certified: 0
});

// 弹窗显示状态
const phoneModalVisible = ref(false);
const pwdModalVisible = ref(false);
const logoutConfirmVisible = ref(false); // 退出登录确认弹窗


// 修改手机号表单
const phoneForm = reactive({
  newPhone: '',
  smsCode: ''
});
const codeBtnText = ref('获取验证码');
const codeBtnDisabled = ref(false);
const isPhoneSubmitting = ref(false);
const phoneFormRules = { newPhone: [{ required: true, message: '手机号必填' }], smsCode: [{ required: true, message: '验证码必填' }] };
const phoneFormRef = ref(null)
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
const pwdFormRules = { phoneNumber: [{ required: true, message: '手机号必填' }], smsCode: [{ required: true, message: '验证码必填' }], newPassword: [{ required: true, message: '新密码必填' }], confirmPassword: [{ required: true, message: '确认密码必填' }] };
const pwdFormRef = ref(null)

// 统一消息提示方法（适配MessagePlugin规范）
const showMessage = (type, text) => {
  switch (type) {
    case 'info':
      MessagePlugin.info(text);
      break;
    case 'success':
      MessagePlugin.success(text);
      break;
    case 'warning':
      MessagePlugin.warning({ content: text });
      break;
    case 'error':
      MessagePlugin.error({ content: text });
      break;
    case 'question':
      MessagePlugin.question(text);
      break;
    default:
      MessagePlugin.info(text);
  }
};

// 页面挂载时获取用户信息
onMounted(async () => {
  await fetchUserInfo();
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // const res = await userApi.getUserProfile();
    // if (res?.data) {
    //   userInfo.avatar = res.data.avatar;
    //   userInfo.nickname = res.data.userName;
    //   userInfo.phoneNumber = res.data.phoneNumber;
    //   userInfo.certified = res.data.certified;
    //   pwdForm.phoneNumber = res.data.phoneNumber;
    // }
	if(userStore.userInfo) {
		  userInfo.avatar = userStore.userInfo.avatar;
		  userInfo.nickname = userStore.userInfo.userName;
		  userInfo.phoneNumber = userStore.userInfo.phoneNumber;
		  userInfo.certified = userStore.userInfo.certified;
		  pwdForm.phoneNumber = userStore.userInfo.phoneNumber;
	}
  } catch (error) {
    showMessage('error', '获取用户信息失败');
  }
};

// 获取展示昵称
const getDisplayNickname = () => {
  const authType = Number(userInfo.certified);
  if (authType >= 2 && userInfo.nickname) {
    return userInfo.nickname;
  }
  if (authType === 1 && userInfo.nickname) {
    return userInfo.nickname;
  }
  if (userInfo.phoneNumber) {
    return formatPhone(userInfo.phoneNumber);
  }
  return '未设置';
};

// 格式化手机号
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

// 头像上传触发
const triggerAvatarUpload = () => {
  if (isAvatarUploading.value) return;
  avatarInput.value.click();
};

// 处理头像上传
const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (file.size > 2 * 1024 * 1024) {
    showMessage('error', '头像文件大小不能超过2MB');
    return;
  }

  try {
    isAvatarUploading.value = true;
	const formData = new FormData();
	formData.append('avatarfile', file);
    const res = await userApi.updateUserAvatar({
      file: formData,
      onProgress: (progress) => {
        console.log('上传进度：', progress);
      }
    });
    
    if (res?.data) {
      showMessage('success', '头像修改成功');
      userInfo.avatar = res.data.avatarUrl;
	  
	  await userStore.refreshUserProfile();
	  await fetchUserInfo();
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
    
	// 调用获取验证码接口
	await loginApi.getUpdatePhoneCaptcha({
	  phonenumber: phoneForm.newPhone,
	  userType: 'customer_user'
	});
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

// 重置
const onPhoneFormReset = () => {
	phoneFormRef.value.reset();
}
// 提交修改手机号
const submitUpdatePhone = async () => {
	console.log('----start:', phoneFormRef, phoneFormRef.value.submit)
	let validateResult = await phoneFormRef.value.validate();
	console.log('提交：', 123, validateResult)
	// phoneFormRef.value.submit( async ({ validateResult, firstError })=> {
	// 	console.log('----submitUpdatePhone:', validateResult, firstError)
	
	if (validateResult === true) {
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
	      await userApi.updateUserPhone({
	        phoneNumber: phoneForm.newPhone,
	        smsCode: phoneForm.smsCode
	      });
	      await userStore.refreshUserProfile();
	      showMessage('success', '手机号修改成功');
	      phoneForm.value = { newPhone: '', smsCode: '' };
		  codeCountDown.value = 0;
	      phoneModalVisible.value = false;
	    } catch (error) {
	      showMessage('error', error.message || '手机号修改失败，请重试');
	    } finally {
	      isPhoneSubmitting.value = false;
	    }
	  } else {
	    // console.log('Validate Errors: ', firstError, validateResult);
	    // MessagePlugin.warning(firstError);
	  }
  // })
};

// 获取修改密码验证码
const getPwdCode = async () => {
	console.log('getPwdCode :', pwdForm.phoneNumber, pwdForm)
  if (!pwdForm.phoneNumber) {
    showMessage('error', '手机号不能为空');
    return;
  }

  try {
    pwdCodeBtnDisabled.value = true;
    pwdCodeBtnText.value = '60s后重发';
	
    // 调用获取验证码接口
    await loginApi.getUpdatePasswordCaptcha({
      phonenumber: pwdForm.phoneNumber,
      userType: 'customer_user'
    });
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
const onPwdFormReset = () => {
	pwdFormRef.value.reset()
	pwdModalVisible.value = false
}
// 提交修改密码
const submitUpdatePwd = async () => {
  let validateResult = await pwdFormRef.value.validate();
  
  if (validateResult === true) {
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
    await userApi.updateUserPassword({
      phoneNumber: pwdForm.phoneNumber,
      smsCode: pwdForm.smsCode,
      newPassword: pwdForm.newPassword
    });
    
    showMessage('success', '密码修改成功，请重新登录');
	await userStore.logout();
    setTimeout(() => {
      pwdModalVisible.value = false;
      navigateTo('/login');
    }, 1500);
  } catch (error) {
    showMessage('error', error.message || '密码修改失败，请重试');
  } finally {
    isPwdSubmitting.value = false;
  }
  }
};

// 打开修改手机号弹窗
const openPhoneModal = () => {
  phoneForm.newPhone = '';
  phoneForm.smsCode = '';
  codeBtnText.value = '获取验证码';
  codeBtnDisabled.value = false;
  phoneModalVisible.value = true;
};

// 打开修改密码弹窗
const openPwdModal = () => {
  pwdForm.smsCode = '';
  pwdForm.newPassword = '';
  pwdForm.confirmPassword = '';
  pwdCodeBtnText.value = '获取验证码';
  pwdCodeBtnDisabled.value = false;
  pwdModalVisible.value = true;
};

// 打开退出登录确认弹窗
const handleLogout = () => {
  logoutConfirmVisible.value = true;
};

// 确认退出登录（核心修复）
const confirmLogout = async () => {
  try {
    // 调用Store的logout方法
    await userStore.logout();
    
    // 清空当前页面用户信息
    userInfo.avatar = '';
    userInfo.nickname = '';
    userInfo.phoneNumber = '';
    userInfo.certified = 0;
    
    // 关闭弹窗、提示并跳转登录页
    logoutConfirmVisible.value = false;
    showMessage('success', '退出登录成功');
    // navigateTo('/login');
  } catch (error) {
    showMessage('error', '退出登录失败，请重试');
    logoutConfirmVisible.value = false;
  }
};
</script>

<style lang="scss" scoped>
.account-manage {
  width: 100%;
  height: 100%;
	  // 弹窗样式
	  :deep(.t-dialog--default) {
		  padding: 0;
		  border-radius: 4px;
		  border: 1px solid #ECEEF2;
	  }
	  :deep(.t-dialog__header) {
		  height: 48px;
		  padding: 16px;
		  font-size: 16px;
		  font-weight: 350;
		  line-height: 16px;
		  color: #272727;
		  box-sizing: border-box;
		  border-bottom: 1px solid #ECEEF2;
		  border-radius: 4px 4px 0px 0px;
		  background: #F9FAFC;
	  }
	  :deep(.t-dialog__body) {
		  padding: 24px 24px 40px;
	  }
	  :deep(.t-dialog__footer) {
	  	padding: 0 24px 24px;
		button {
			width: 100px;
			height: 32px;
			border-radius: 4px;
		}
		.t-button + .t-button {
		    margin-left: 20px;
		}
	  }
	  
	  // 表单相关样式
	  .t-form__item {
	  	  margin-bottom: 16px;
	  }
	  .t-input-adornment {
		  width: 100%;
	  }
	  .form-item {
	    // margin-bottom: 15px;
	    width: 100%;
	    height: 32px;
	    border: 1px solid #ECEEF2;
	    border-radius: 4px;
	    padding: 0 15px 0 0;
	    box-sizing: border-box;
	    display: flex;
	    align-items: center;
	    justify-content: flex-start;
	  
	    .form-input {
	      flex: 1;
	      height: 32px;
	  
	      :deep(.t-input__inner) {
	        border-color: #ECEEF2;
	        &:focus {
	          border-color: #3799AE;
	          box-shadow: 0 0 0 2px rgba(55, 153, 174, 0.1);
	        }
	      }
	  	  
	  	  :deep(.t-input) {
	  	    height: 32px !important;
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
  }
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

  .logout-confirm-content {
    font-size: 14px;
    color: #333;
    text-align: center;
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
}
</style>