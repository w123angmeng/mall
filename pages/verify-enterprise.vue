<!-- pages/verify-enterprise.vue -->
<template>
  <div>
    <div class="auth-card">
      <!-- 页面标题 -->
      <div class="page-title text-center mb-lg">企业认证</div>
	  <!-- 取消注释后需确保组件路径正确 -->
	  <EnterpriseAuthForm @submit="handleEnterpriseSubmit"/>
    </div>
  </div>
</template>

<script setup>
// 复用auth布局（导航+背景）
definePageMeta({ layout: 'auth' });
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';
// 正确导入TDesign组件
import { Input, DatePicker, Radio, Upload } from 'tdesign-vue-next';
import EnterpriseAuthForm from '~/components/auth/EnterpriseAuthForm.vue';

// 企业认证提交（取消注释后启用）
const handleEnterpriseSubmit = (data) => {
  enterpriseDialogVisible.value = false;
};
// 上传文件状态
const uploadFiles = ref({
  license: [] // 营业执照
});

// 表单数据
const form = ref({
  enterpriseName: '', // 企业名称
  registeredCapital: '', // 注册资本
  socialCreditCode: '', // 统一社会信用代码
  legalPersonName: '', // 法人姓名
  legalPersonId: '', // 法人身份证号
  contactName: '', // 联系人姓名
  contactPhone: '', // 联系人手机号
  validDate: [], // 有效期范围
  isLongTerm: false, // 是否长期有效
  businessName: '', // 产业业务姓名
  tradeIntention: '' // 交易意向
});

// 提交认证
const handleSubmit = () => {
  // 实际项目中可添加表单验证逻辑
  alert('企业认证提交成功！');
  navigateTo('/'); // 提交后跳转首页
};

// 取消（返回选择认证页面）
const handleCancel = () => {
  navigateTo('/select-auth');
};
</script>

<style lang="scss" scoped>
/* 基础卡片（适配企业认证表单宽度） */
.auth-card {
  width: 782px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 30px;
  box-sizing: border-box;
  margin: 0 auto;

  // 🔥 优化：去掉theme-input后，直接重置t-input样式
  :deep(.t-input) {
    height: 39px !important;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    width: 100% !important;

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
    // width: 100%;
    height: 39px;

    .t-input__inner {
      height: 100% !important;
    }
  }

  :deep(.t-radio) {
    font-size: 14px;
    color: #2F3032;
    margin-left: 10px;
  }
}

/* 页面标题 */
.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #2F3032;
  margin-bottom: 25px;
}

/* 表单两列布局 */
.form-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.form-item {
  flex: 0 0 48%; // 两列各占48%，留2%间距
  margin-bottom: 0 !important;
}
.form-item-row {
  flex: 0 0 100%; // 两列各占48%，留2%间距
  margin-bottom: 0 !important;
}

/* 🔥 优化1：仅展示营业执照的label，其余隐藏 */
.form-label {
  display: none !important; // 默认隐藏所有label
  font-size: 14px;
  color: #2F3032;
  margin-bottom: 8px;
}
// 仅显示营业执照的label
.upload-label {
  display: block !important;
  margin-bottom: 0 !important; // 水平布局无需底部间距
  margin-right: 15px; // 与上传组件的间距
}

.required-mark {
  color: #F53F3F;
  margin-right: 4px;
}

/* 有效期行布局 */
.date-row {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 🔥 优化2：上传区域水平一行布局 */
.upload-section {
  width: 100%;
  margin-bottom: 16px;
}
.flex-row {
  display: flex;
  align-items: center; // 垂直居中
  gap: 10px; // 元素间间距
}

/* 营业执照上传卡片（与个人认证上传样式统一） */
.upload-card {
  width: 170px;
  height: 100px;
  border: 1px dashed #ECEEF2;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  position: relative;
  background-repeat: no-repeat;
  background-position: center center;
  
  img {
  	  width: 20px;
  	  height:20px;
  }

  &.license-card {
    background-image: url('/_nuxt/assets/images/business-license.png');
	background-size: cover; // 背景图占满容器
  }

  &:hover {
    border-color: #3799AE;
  }

  .upload-content {
    // width: 100%;
    // height: 100%;
	width: 170px;
	height: 98px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 8px;
    background: linear-gradient(to top, rgba(255,255,255,0.8), transparent 60%);
  }
}

.upload-text {
  font-size: 14px;
  color: #838486;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 0 !important; // 水平布局取消顶部间距
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

/* 提交按钮（与个人认证按钮样式统一） */
.confirm-btn {
  width: 170px;
  height: 56px;
  background: #3799AE;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.confirm-btn:hover {
  background: #2d8094;
}

/* 取消按钮 */
.cancel-btn {
  width: 170px;
  height: 56px;
  background: transparent;
  border: 1px solid #ECEEF2;
  color: #2F3032;
  border-radius: 8px;
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