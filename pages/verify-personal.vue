<template>
  <div>
    <div class="auth-card">
      <!-- 页面标题 -->
      <div class="page-title text-center mb-lg">个人认证</div>

      <form @submit.prevent="handlePersonalSubmit" class="auth-form">
        <!-- 身份证上传区域 -->
        <div class="upload-section">
          <div class="upload-label">
            <span class="required-mark">*</span>身份证上传
          </div>
          <div class="upload-cards">
            <!-- 身份证正面上传 -->
            <div 
              class="upload-card front-card"
              @click="triggerUpload('front')"
            >
              <div class="upload-content">
                <t-upload
                  ref="frontUploadRef"
                  v-model="uploadFiles.front"
                  accept="image/*"
                  :multiple="false"
                  :on-success="(file) => handleUploadSuccess(file, 'front')"
                  :on-error="handleUploadError"
                  :style="{ display: 'none' }"
                />
                <span class="upload-text">正面</span>
              </div>
            </div>
            
            <!-- 身份证背面上传 -->
            <div 
              class="upload-card back-card"
              @click="triggerUpload('back')"
            >
              <div class="upload-content">
                <t-upload
                  ref="backUploadRef"
                  v-model="uploadFiles.back"
                  accept="image/*"
                  :multiple="false"
                  :on-success="(file) => handleUploadSuccess(file, 'back')"
                  :on-error="handleUploadError"
                  :style="{ display: 'none' }"
                />
                <span class="upload-text">背面</span>
              </div>
            </div>
          </div>
          <div class="upload-tip text-center">
            请上传清晰的身份证正反面照片，支持JPG/PNG格式，大小不超过2MB
          </div>
        </div>

        <!-- 姓名输入 -->
        <div class="form-group">
          <label class="upload-label">
            <span class="required-mark">*</span>姓名
          </label>
          <t-input
            v-model="form.idName"
            placeholder="请输入身份证姓名"
            :disabled="isSubmitting"
          />
        </div>

        <!-- 身份证号输入 -->
        <div class="form-group">
          <label class="upload-label">
            <span class="required-mark">*</span>身份证号
          </label>
          <t-input
            v-model="form.idNumber"
            placeholder="请输入18位身份证号码"
            :disabled="isSubmitting"
          />
        </div>

        <!-- 有效期设置 -->
        <div class="form-group">
          <label class="upload-label">
            <span class="required-mark">*</span>有效期
          </label>
          <div class="date-row">
            <t-radio-group v-model="form.isLongTerm" :disabled="isSubmitting">
              <t-radio value="1">长期有效</t-radio>
              <t-radio value="0">指定有效期</t-radio>
            </t-radio-group>
          </div>
          
          <div class="date-row" style="margin-top: 12px; gap: 10px" v-if="form.isLongTerm === '0'">
            <t-date-picker
              v-model="form.validDate[0]"
              placeholder="开始日期"
              :disabled="isSubmitting || form.isLongTerm === '1'"
            />
            <span style="color: #999;">至</span>
            <t-date-picker
              v-model="form.validDate[1]"
              placeholder="结束日期"
              :disabled="isSubmitting || form.isLongTerm === '1'"
            />
          </div>
        </div>

        <!-- 业务员 -->
        <div class="form-group">
          <label class="upload-label">
            <span class="required-mark">*</span>业务员
          </label>
          <t-input
            v-model="form.businessName"
            placeholder="请输入业务员姓名"
            :disabled="isSubmitting"
          />
        </div>

        <!-- 购买意向 -->
        <div class="form-group">
          <label class="upload-label">
            <span class="required-mark">*</span>购买意向
          </label>
          <t-input
            v-model="form.tradeIntention"
            placeholder="请输入购买意向"
            :disabled="isSubmitting"
          />
        </div>

        <!-- 按钮组 -->
        <div class="btn-group">
          <button type="submit" class="confirm-btn" :disabled="isSubmitting">
            <t-loading v-if="isSubmitting" size="small" />
            <span v-else>提交认证</span>
          </button>
          <button type="button" class="cancel-btn" @click="handlePersonalCancel" :disabled="isSubmitting">
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
import { ref, onMounted, reactive } from 'vue';
import { navigateTo } from '#app';
import * as verifyApi from '@/apis/credit';

// 初始化message兜底
let message = {
  error: (text) => alert(text),
  success: (text) => alert(text)
};

// 上传组件引用
const frontUploadRef = ref(null);
const backUploadRef = ref(null);

// 上传文件状态
const uploadFiles = reactive({
  front: [], // 身份证正面
  back: []   // 身份证背面
});

// 附件ID（上传成功后返回）
const attachmentIds = reactive({
  front: '',
  back: ''
});

// 表单数据
const form = reactive({
  idName: '',
  idNumber: '',
  validDate: [], // 日期范围：[开始日期, 结束日期]
  isLongTerm: '1', // 是否长期有效（1-是，0-否）
  businessName: '',
  tradeIntention: ''
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

// 触发文件上传
const triggerUpload = (type) => {
  if (isSubmitting.value) return;
  
  if (type === 'front' && frontUploadRef.value) {
    frontUploadRef.value.uploadRef.click();
  } else if (type === 'back' && backUploadRef.value) {
    backUploadRef.value.uploadRef.click();
  }
};

// 上传成功处理
const handleUploadSuccess = (file, type) => {
  // 假设上传成功后返回的文件对象包含附件ID
  if (file?.response?.data?.id) {
    attachmentIds[type] = file.response.data.id;
    message.success(`${type === 'front' ? '身份证正面' : '身份证背面'}上传成功`);
  } else {
    message.error(`${type === 'front' ? '身份证正面' : '身份证背面'}上传失败，未获取到附件ID`);
    uploadFiles[type] = [];
  }
};

// 上传失败处理
const handleUploadError = (err, type) => {
  message.error(`${type === 'front' ? '身份证正面' : '身份证背面'}上传失败：${err.message || '未知错误'}`);
  uploadFiles[type] = [];
};

// 身份证号校验
const validateIdNumber = (id) => {
  const reg = /^\d{17}[\dXx]$/;
  return reg.test(id);
};

// 日期校验
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
  // 校验身份证上传
  if (!attachmentIds.front) {
    message.error('请上传身份证正面照片');
    return false;
  }
  
  if (!attachmentIds.back) {
    message.error('请上传身份证背面照片');
    return false;
  }
  
  // 校验姓名
  if (!form.idName.trim()) {
    message.error('请输入身份证姓名');
    return false;
  }
  
  // 校验身份证号
  if (!form.idNumber.trim()) {
    message.error('请输入18位身份证号码');
    return false;
  }
  
  if (!validateIdNumber(form.idNumber)) {
    message.error('请输入有效的18位身份证号码');
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

// 提交个人认证
const handlePersonalSubmit = async () => {
  if (!process.client || isSubmitting.value) return;
  
  // 表单校验
  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;
    
    // 构造提交参数
    const submitData = {
      cardFront: attachmentIds.front,
      cardBack: attachmentIds.back,
      cardName: form.idName.trim(),
      cardNumber: form.idNumber.trim(),
      cardLongTerm: parseInt(form.isLongTerm),
      cardStart: form.isLongTerm === '1' ? '' : form.validDate[0],
      cardEnd: form.isLongTerm === '1' ? '' : form.validDate[1],
      salePerson: form.businessName.trim(),
      purchaseIntent: form.tradeIntention.trim()
    };

    // 调用提交个人认证接口
    await verifyApi.submitPersonCert(submitData);
    
    message.success('个人认证提交成功！审核结果将通过短信通知');
    setTimeout(() => {
      navigateTo('/');
    }, 1500);
  } catch (error) {
    message.error(error.message || '个人认证提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 取消（返回选择认证页面）
const handlePersonalCancel = () => {
  if (!isSubmitting.value) {
    navigateTo('/select-auth');
  }
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
  display: block;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.confirm-btn:hover {
  background: #2d8094; // 深色hover效果
}
.confirm-btn:disabled {
  background: #a8d0d8;
  cursor: not-allowed;
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