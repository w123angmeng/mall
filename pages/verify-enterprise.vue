<template>
  <div>
    <div class="auth-card">
      <!-- 页面标题 -->
      <div class="page-title text-center mb-lg">企业认证</div>

      <form @submit.prevent="handleEnterpriseSubmit" class="auth-form">
        <!-- 营业执照上传区域 -->
        <div class="upload-section">
          <div class="flex-row">
            <label class="upload-label">
              <span class="required-mark">*</span>营业执照
            </label>
            <div 
              class="upload-card license-card"
              @click="triggerLicenseUpload"
            >
              <div class="upload-content">
                <t-upload
                  ref="licenseUploadRef"
                  v-model="uploadFiles.license"
                  accept="image/*"
                  :multiple="false"
                  :on-success="handleLicenseUploadSuccess"
                  :on-error="handleLicenseUploadError"
                  :style="{ display: 'none' }"
                />
                <span class="upload-text">营业执照</span>
              </div>
            </div>
            <div class="upload-tip">
              请上传清晰的营业执照照片，支持JPG/PNG格式，大小不超过2MB
            </div>
          </div>
        </div>

        <!-- 表单两列布局 -->
        <div class="form-row mb-md">
          <!-- 企业名称 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>企业名称
            </label>
            <t-input
              v-model="form.enterpriseName"
              placeholder="请输入企业名称"
              :disabled="isSubmitting"
            />
          </div>
          
          <!-- 注册资本 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>注册资本(万元)
            </label>
            <t-input
              v-model="form.registeredCapital"
              placeholder="请输入注册资本"
              type="number"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-row mb-md">
          <!-- 统一社会信用代码 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>统一社会信用代码
            </label>
            <t-input
              v-model="form.socialCreditCode"
              placeholder="请输入统一社会信用代码"
              :disabled="isSubmitting"
            />
          </div>
          
          <!-- 法人姓名 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>法人姓名
            </label>
            <t-input
              v-model="form.legalPersonName"
              placeholder="请输入法人姓名"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-row mb-md">
          <!-- 法人身份证号 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>法人身份证号
            </label>
            <t-input
              v-model="form.legalPersonId"
              placeholder="请输入法人身份证号"
              :disabled="isSubmitting"
            />
          </div>
          
          <!-- 联系人姓名 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>联系人姓名
            </label>
            <t-input
              v-model="form.contactName"
              placeholder="请输入联系人姓名"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-row mb-md">
          <!-- 联系人手机号 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>联系人手机号
            </label>
            <t-input
              v-model="form.contactPhone"
              placeholder="请输入联系人手机号"
              :disabled="isSubmitting"
            />
          </div>
          
          <!-- 有效期设置 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>有效期
            </label>
            <div class="date-row">
              <t-radio-group v-model="form.isLongTerm" :disabled="isSubmitting">
                <t-radio value="1">长期有效</t-radio>
                <t-radio value="0">指定有效期</t-radio>
              </t-radio-group>
            </div>
          </div>
        </div>

        <!-- 有效期日期选择 -->
        <div class="form-row mb-md" v-if="form.isLongTerm === '0'">
          <div class="form-item-row">
            <div class="date-row" style="gap: 10px; margin-top: 8px;">
              <t-date-picker
                v-model="form.validDate[0]"
                placeholder="开始日期"
                :disabled="isSubmitting || form.isLongTerm === '1'"
                style="flex: 1;"
              />
              <span style="color: #999;">至</span>
              <t-date-picker
                v-model="form.validDate[1]"
                placeholder="结束日期"
                :disabled="isSubmitting || form.isLongTerm === '1'"
                style="flex: 1;"
              />
            </div>
          </div>
        </div>

        <div class="form-row mb-md">
          <!-- 业务员 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>业务员
            </label>
            <t-input
              v-model="form.businessName"
              placeholder="请输入业务员姓名"
              :disabled="isSubmitting"
            />
          </div>
          
          <!-- 购买意向 -->
          <div class="form-item">
            <label class="form-label">
              <span class="required-mark">*</span>购买意向
            </label>
            <t-input
              v-model="form.tradeIntention"
              placeholder="请输入购买意向"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="btn-group">
          <button type="submit" class="confirm-btn" :disabled="isSubmitting">
            <t-loading v-if="isSubmitting" size="small" />
            <span v-else>提交认证</span>
          </button>
          <button type="button" class="cancel-btn" @click="handleCancel" :disabled="isSubmitting">
            取消
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// 复用auth布局（导航+背景）
definePageMeta({ layout: 'auth' });
import { ref, reactive, onMounted } from 'vue';
import { navigateTo } from '#app';
import * as verifyApi from '@/apis/credit';

// 初始化message兜底
let message = {
  error: (text) => alert(text),
  success: (text) => alert(text)
};

// 上传组件引用
const licenseUploadRef = ref(null);

// 上传文件状态
const uploadFiles = reactive({
  license: [] // 营业执照
});

// 营业执照附件ID
const licenseAttachmentId = ref('');

// 表单数据
const form = reactive({
  enterpriseName: '', // 企业名称
  registeredCapital: '', // 注册资本
  socialCreditCode: '', // 统一社会信用代码
  legalPersonName: '', // 法人姓名
  legalPersonId: '', // 法人身份证号
  contactName: '', // 联系人姓名
  contactPhone: '', // 联系人手机号
  validDate: [], // 有效期范围
  isLongTerm: '1', // 是否长期有效（1-是，0-否）
  businessName: '', // 业务员
  tradeIntention: '' // 购买意向
});

// 提交状态
const isSubmitting = ref(false);

// 客户端动态导入TDesign Message
onMounted(async () => {
  if (process.client) {
    try {
      const tdesign = await import('tdesign-vue-next');
      if (tdesign?.Message && typeof tdesign.Message.error === 'function') {
        message = tdesign.Message;
      }
    } catch (e) {
      // 导入失败继续使用alert兜底
    }
  }
});

// 触发营业执照上传
const triggerLicenseUpload = () => {
  if (isSubmitting.value) return;
  if (licenseUploadRef.value) {
    licenseUploadRef.value.uploadRef.click();
  }
};

// 营业执照上传成功处理
const handleLicenseUploadSuccess = (file) => {
  // 假设上传成功后返回的文件对象包含附件ID
  if (file?.response?.data?.id) {
    licenseAttachmentId.value = file.response.data.id;
    message.success('营业执照上传成功');
  } else {
    message.error('营业执照上传失败，未获取到附件ID');
    uploadFiles.license = [];
  }
};

// 营业执照上传失败处理
const handleLicenseUploadError = (err) => {
  message.error(`营业执照上传失败：${err.message || '未知错误'}`);
  uploadFiles.license = [];
};

// 校验统一社会信用代码
const validateSocialCreditCode = (code) => {
  // 社会信用代码正则（18位）
  const reg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
  return reg.test(code);
};

// 校验手机号
const validatePhone = (phone) => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

// 校验身份证号
const validateIdNumber = (id) => {
  const reg = /^\d{17}[\dXx]$/;
  return reg.test(id);
};

// 校验日期范围
const validateDateRange = () => {
  if (form.isLongTerm === '1') return true;
  
  if (!form.validDate[0] || !form.validDate[1]) {
    message.error('请选择有效期开始和结束日期');
    return false;
  }
  
  const startDate = new Date(form.validDate[0]);
  const endDate = new Date(form.validDate[1]);
  
  if (startDate > endDate) {
    message.error('开始日期不能晚于结束日期');
    return false;
  }
  
  return true;
};

// 表单校验
const validateForm = () => {
  // 校验营业执照上传
  if (!licenseAttachmentId.value) {
    message.error('请上传营业执照照片');
    return false;
  }
  
  // 校验企业名称
  if (!form.enterpriseName.trim()) {
    message.error('请输入企业名称');
    return false;
  }
  
  // 校验注册资本
  if (!form.registeredCapital || isNaN(form.registeredCapital) || Number(form.registeredCapital) <= 0) {
    message.error('请输入有效的注册资本（大于0的数字）');
    return false;
  }
  
  // 校验统一社会信用代码
  if (!form.socialCreditCode.trim()) {
    message.error('请输入统一社会信用代码');
    return false;
  }
  if (!validateSocialCreditCode(form.socialCreditCode)) {
    message.error('请输入有效的18位统一社会信用代码');
    return false;
  }
  
  // 校验法人姓名
  if (!form.legalPersonName.trim()) {
    message.error('请输入法人姓名');
    return false;
  }
  
  // 校验法人身份证号
  if (!form.legalPersonId.trim()) {
    message.error('请输入法人身份证号');
    return false;
  }
  if (!validateIdNumber(form.legalPersonId)) {
    message.error('请输入有效的18位法人身份证号码');
    return false;
  }
  
  // 校验联系人姓名
  if (!form.contactName.trim()) {
    message.error('请输入联系人姓名');
    return false;
  }
  
  // 校验联系人手机号
  if (!form.contactPhone.trim()) {
    message.error('请输入联系人手机号');
    return false;
  }
  if (!validatePhone(form.contactPhone)) {
    message.error('请输入有效的11位手机号');
    return false;
  }
  
  // 校验有效期
  if (!validateDateRange()) {
    return false;
  }
  
  // 校验业务员
  if (!form.businessName.trim()) {
    message.error('请输入业务员姓名');
    return false;
  }
  
  // 校验购买意向
  if (!form.tradeIntention.trim()) {
    message.error('请输入购买意向');
    return false;
  }
  
  return true;
};

// 提交企业认证
const handleEnterpriseSubmit = async () => {
  if (!process.client || isSubmitting.value) return;
  
  // 表单校验
  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;
    
    // 构造提交参数
    const submitData = {
      companyName: form.enterpriseName.trim(),
      registeredCapital: Number(form.registeredCapital),
      socialCode: form.socialCreditCode.trim(),
      longTerm: parseInt(form.isLongTerm),
      startDate: form.isLongTerm === '1' ? '' : form.validDate[0],
      endDate: form.isLongTerm === '1' ? '' : form.validDate[1],
      legalName: form.legalPersonName.trim(),
      legalNumber: form.legalPersonId.trim(),
      concatName: form.contactName.trim(),
      concatPhone: form.contactPhone.trim(),
      license: licenseAttachmentId.value,
      isDefault: false,
      salePerson: form.businessName.trim(),
      purchaseIntent: form.tradeIntention.trim()
    };

    // 调用提交企业认证接口
    await verifyApi.submitCompanyCert(submitData);
    
    message.success('企业认证提交成功！审核结果将通过短信通知');
    setTimeout(() => {
      navigateTo('/');
    }, 1500);
  } catch (error) {
    message.error(error.message || '企业认证提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 取消（返回选择认证页面）
const handleCancel = () => {
  if (!isSubmitting.value) {
    navigateTo('/select-auth');
  }
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
  margin-bottom: 16px !important;
}

.form-item {
  flex: 0 0 48%; // 两列各占48%，留2%间距
  margin-bottom: 0 !important;
}
.form-item-row {
  flex: 0 0 100%; // 整行占比
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
.cancel-btn:disabled {
  border-color: #ECEEF2;
  color: #999;
  cursor: not-allowed;
}

/* 间距工具类 */
.mb-lg { margin-bottom: 25px !important; }
.mb-md { margin-bottom: 16px !important; }
.text-center { text-align: center; }
</style>