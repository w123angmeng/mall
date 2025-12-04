<template>
  <div class="account-manage">
    <!-- 账号信息卡片（补全所有缺失内容） -->
    <div class="account-card">
      <!-- 头像区域（点击可上传） -->
      <div class="avatar-section">
        <span class="info-label">我的头像：</span>
        <div 
          class="avatar-wrap" 
          @mouseenter="isAvatarHover = true" 
          @mouseleave="isAvatarHover = false"
          @click="triggerAvatarUpload"
        >
          <img src="~/assets/images/user-avatar.png" alt="我的头像" class="avatar-img" />
          <!-- hover蒙层 -->
          <div class="avatar-mask" v-if="isAvatarHover">
            <img src="~/assets/images/upload.png" alt="上传图标" class="upload-icon" />
          </div>
          <!-- 编辑图标 -->
          <img src="~/assets/images/edit.png" alt="编辑" class="edit-icon" @click.stop="triggerAvatarUpload" />
        </div>
        <!-- 隐藏的文件上传框 -->
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
        <span class="info-value">公司名称/姓名/136****5502</span>
        <!-- <img src="~/assets/images/edit.png" alt="编辑" class="edit-icon" @click="openNicknameModal" /> -->
      </div>

      <!-- 手机号码 -->
      <div class="info-item">
        <span class="info-label">手机号码：</span>
        <span class="info-value">123456789</span>
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
          placeholder="请输入新手机号" 
          class="form-input"
        />
      </div>
      <div class="form-item">
        <t-input 
          placeholder="请输入验证码" 
          class="form-input"
        />
        <!-- 优化：获取验证码改为文字样式（严格匹配UI要求） -->
        <span class="verify-code-text" @click="getVerifyCode">获取验证码</span>
      </div>
      <template #footer>
        <t-button theme="default" @click="phoneModalVisible = false">取消</t-button>
        <!-- 优化：提交按钮强制主题色（覆盖TDesign默认蓝色） -->
        <t-button class="submit-btn" @click="phoneModalVisible = false">提交</t-button>
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
          value="1234567890" 
          disabled 
          class="form-input"
        />
      </div>
      <div class="form-item">
        <t-input 
          placeholder="请输入验证码" 
          class="form-input"
        />
        <!-- 优化：获取验证码改为文字样式（严格匹配UI要求） -->
        <span class="verify-code-text" @click="getVerifyCode">获取验证码</span>
      </div>
      <div class="form-item">
        <t-input 
          type="password" 
          placeholder="请输入新密码" 
          class="form-input"
        />
      </div>
      <div class="form-item">
        <t-input 
          type="password" 
          placeholder="请再次输入密码" 
          class="form-input"
        />
      </div>
      <template #footer>
        <t-button theme="default" @click="pwdModalVisible = false">取消</t-button>
        <!-- 优化：提交按钮强制主题色（覆盖TDesign默认蓝色） -->
        <t-button class="submit-btn" @click="pwdModalVisible = false">提交</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
import { Dialog, Input, Button } from 'tdesign-vue-next';
import { ref } from 'vue';

// 头像相关状态
const isAvatarHover = ref(false);
const avatarInput = ref(null);

// 弹窗显示状态
const phoneModalVisible = ref(false);
const pwdModalVisible = ref(false);
const nicknameModalVisible = ref(false); // 昵称修改弹窗（预留）

// 弹窗主题配置（辅助统一主题）
const dialogTheme = ref({ primaryColor: '#3799AE' });

// 头像上传逻辑
const triggerAvatarUpload = () => {
  avatarInput.value.click();
};
const handleAvatarUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    console.log('上传的头像文件：', file);
    // 可添加实际上传接口逻辑
    avatarInput.value.value = ''; // 重置输入框
  }
};

// 弹窗打开逻辑
const openPhoneModal = () => phoneModalVisible.value = true;
const openPwdModal = () => pwdModalVisible.value = true;
const openNicknameModal = () => nicknameModalVisible.value = true;

// 获取验证码逻辑
const getVerifyCode = () => {
  console.log('点击获取验证码');
  // 可添加倒计时、接口调用等逻辑
};
</script>

<style lang="scss" scoped>
.account-manage {
  width: 100%;
  height: 100%;

  // 账号卡片样式
  .account-card {
    padding: 24px;

    // 头像区域
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

    // 信息项通用样式
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
        // flex: 1;
      }

      .edit-icon {
		margin-left: 60px;
        width: 16px;
        height: 16px;
        cursor: pointer;
      }
    }

    // 退出登录按钮
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

  // 1. 获取验证码文字样式（严格匹配UI要求）
  .verify-code-text {
    font-size: 14px !important;
    font-weight: normal !important;
    line-height: 14px !important;
    letter-spacing: 0em !important;
    color: #3799AE !important;
    cursor: pointer;
    padding: 0 5px;
    // hover效果优化
    &:hover {
      color: #2d8094 !important;
      text-decoration: underline; // 可选：增加hover下划线，更符合文字按钮交互
    }
  }

  // 2. 提交按钮主题色样式（强制覆盖TDesign默认蓝色）
  .submit-btn {
    background: #3799AE !important;
    border-color: #3799AE !important;
    color: #ffffff !important;
    font-size: 14px;
    padding: 0 16px;
    height: 36px;

    &:hover {
      background: #2d8094 !important;
      border-color: #2d8094 !important;
    }

    // 禁用状态（可选，增加鲁棒性）
    &:disabled {
      background: #99c4cf !important;
      border-color: #99c4cf !important;
      cursor: not-allowed;
    }
  }

  // 表单项样式
  .form-item {
    margin-bottom: 15px;
    display: flex;
    gap: 10px;
    align-items: center;

    .form-input {
      flex: 1;
      height: 36px;
      // 输入框边框主题色适配
      :deep(.t-input__inner) {
        border-color: #ECEEF2;
        &:focus {
          border-color: #3799AE;
          box-shadow: 0 0 0 2px rgba(55, 153, 174, 0.1);
        }
      }
    }
  }

  // 弹窗样式适配
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