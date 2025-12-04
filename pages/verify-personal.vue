<!-- pages/verify-personal.vue -->
<template>
  <div>
    <div class="auth-card">
		
      <!-- 页面标题 -->
      <div class="page-title text-center mb-lg">个人认证</div>

      <PersonalAuthForm @submit="handlePersonalSubmit" @cancel="handlePersonalCancel" />
    </div>
  </div>
</template>

<script setup>
// 复用auth布局（导航+背景）
definePageMeta({ layout: 'auth' });
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';
// 正确导入TDesign组件（无T前缀）
import { Upload, Input, DatePicker, Radio } from 'tdesign-vue-next';
import PersonalAuthForm from '~/components/auth/PersonalAuthForm.vue';
// 上传文件状态
const uploadFiles = ref({
  front: [], // 身份证正面
  back: []   // 身份证背面
});

// 表单数据
const form = ref({
  idName: '',
  idNumber: '',
  validDate: [], // 日期范围：[开始日期, 结束日期]
  isLongTerm: false, // 是否长期有效
  businessName: '',
  tradeIntention: ''
});

// 提交认证
const handleSubmit = () => {
  // 实际项目中可添加表单验证逻辑
  alert('个人认证提交成功！');
  navigateTo('/'); // 提交后跳转首页
};

// 取消（返回选择认证页面）
const handleCancel = () => {
  navigateTo('/select-auth');
};
</script>

<style lang="scss" scoped>
/* 基础卡片（适配表单宽度） */
.auth-card {
  width: 560px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 30px;
  box-sizing: border-box;
  margin: 0 auto;

  // 重置TDesign组件样式，与全局风格统一
  :deep(.t-input) {
    height: 39px !important;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;

    .t-input__inner {
      height: 100% !important;
      border: 1px solid #ECEEF2 !important;
      border-radius: 4px !important;
      outline: none !important;
      box-shadow: none !important;
      padding: 0 15px !important;
      line-height: 1 !important;
      font-size: 14px !important;
    }
  }

  :deep(.t-upload) {
    width: 100%;
    height: 100%;
  }

  :deep(.t-date-picker) {
    flex: 1;
    height: 39px;

    .t-input__inner {
      height: 100% !important;
    }
  }

  :deep(.t-radio) {
    font-size: 14px;
    color: #2F3032;
    margin-left: 15px;
  }
}

/* 页面标题 */
.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #2F3032;
  margin-bottom: 25px;
}

/* 上传区域 */
.upload-section {
  margin-bottom: 25px;
}

.upload-label {
  font-size: 14px;
  color: #2F3032;
  margin-bottom: 12px;
}

.required-mark {
  color: #F53F3F; // 红色必填标记
  margin-right: 4px;
}

.upload-cards {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 8px;
}

.upload-card {
  width: 120px;
  height: 80px;
  border: 1px dashed #ECEEF2; // 虚线边框
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  position: relative;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 40px 40px; // 背景图尺寸
  img {
	  width: 20px;
	  height:20px;
  }
  // 正面卡片背景图
  &.front-card {
    background-image: url('~/assets/images/idcard-front.png');
	background-size: cover;
  }
  // 反面卡片背景图
  &.back-card {
    background-image: url('~/assets/images/idcard-back.png');
	background-size: cover;
  }

  &:hover {
    border-color: #3799AE; // hover时主题色边框
  }

  // 上传内容容器（文字居中在背景图下方）
  .upload-content {
    // width: 100%;
    // height: 100%;
	width: 120px;
	height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 8px; // 文字离底部距离
  }
}

/* 🔥 优化：上传文字样式（#838486 14px） */
.upload-text {
  font-size: 14px !important;
  color: #838486 !important;
  margin-top: 4px; // 与背景图的间距
}

.upload-tip {
  font-size: 12px;
  color: #999;
}

/* 表单区域 */
.auth-form {
  width: 100%;
}

.form-group {
  width: 100%;
  margin-bottom: 16px !important;
}

/* 有效期行布局 */
.date-row {
  display: flex;
  align-items: center;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

/* 🔥 优化2：提交按钮样式（170px宽/56px高/8px圆角） */
.confirm-btn {
  width: 170px;
  height: 56px;
  background: #3799AE;
  color: #fff;
  border: none;
  border-radius: 8px !important;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.confirm-btn:hover {
  background: #2d8094; // 深色hover效果
}

/* 取消按钮保持原有比例适配 */
.cancel-btn {
  width: 170px;
  height: 56px;
  background: transparent;
  border: 1px solid #ECEEF2;
  color: #2F3032;
  border-radius: 8px; // 同步圆角
  font-size: 16px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.cancel-btn:hover {
  border-color: #3799AE;
  color: #3799AE;
}

/* 跳过链接 */
.skip-link {
  display: block;
  font-size: 14px;
  color: #3799AE;
  text-decoration: none;
  margin-top: 16px;
}
.skip-link:hover {
  text-decoration: underline;
}

/* 间距工具类 */
.mb-lg { margin-bottom: 25px !important; }
.mb-md { margin-bottom: 16px !important; }
.text-center { text-align: center; }
</style>