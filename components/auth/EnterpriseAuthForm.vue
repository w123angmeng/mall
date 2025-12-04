<template>
  <div class="enterprise-auth-form">
    <!-- 表单区域 -->
    <form class="auth-form">
      <!-- 第一行：企业名称 + 注册资本 -->
      <div class="form-row mb-md">
        <div class="form-item">
          <label class="form-label">
            <span class="required-mark">*</span>请输入企业名称
          </label>
          <t-input
            v-model="form.enterpriseName"
            placeholder="请输入企业名称"
          />
        </div>
        <div class="form-item">
          <label class="form-label">
            <span class="required-mark">*</span>请输入注册资本
          </label>
          <t-input
            v-model="form.registeredCapital"
            placeholder="单位万元"
          />
        </div>
      </div>
    
      <!-- 第二行：统一社会信用代码 + 有效期 -->
      <div class="form-row mb-md">
        <div class="form-item">
          <label class="form-label">
            <span class="required-mark">*</span>请输入统一社会信用代码
          </label>
          <t-input
            v-model="form.socialCreditCode"
            placeholder="请输入统一社会信用代码"
          />
        </div>
        <div class="form-item date-item">
          <label class="form-label">
            <span class="required-mark">*</span>开始日期 — 结束日期
          </label>
          <div class="date-row">
            <t-date-picker
              v-model="form.validDate"
              type="daterange"
              placeholder="选择日期"
              :disabled="form.isLongTerm"
            />
            <t-radio
              v-model="form.isLongTerm"
              label="true"
              class="long-term-radio"
            >
              长期有效
            </t-radio>
          </div>
        </div>
      </div>
    
      <!-- 第三行：法人姓名 + 法人身份证号 -->
      <div class="form-row mb-md">
        <div class="form-item">
          <label class="form-label">
            <span class="required-mark">*</span>请输入法人姓名
          </label>
          <t-input
            v-model="form.legalPersonName"
            placeholder="请输入法人姓名"
          />
        </div>
        <div class="form-item">
          <label class="form-label">
            <span class="required-mark">*</span>请输入法人身份证号
          </label>
          <t-input
            v-model="form.legalPersonId"
            placeholder="请输入法人身份证号"
          />
        </div>
      </div>
    
      <!-- 第四行：联系人姓名 + 联系人手机号 -->
      <div class="form-row mb-md">
        <div class="form-item">
          <label class="form-label">
            <span class="required-mark">*</span>请输入联系人姓名
          </label>
          <t-input
            v-model="form.contactName"
            placeholder="请输入联系人姓名"
          />
        </div>
        <div class="form-item">
          <label class="form-label">
            <span class="required-mark">*</span>请输入联系人手机号
          </label>
          <t-input
            v-model="form.contactPhone"
            placeholder="请输入联系人手机号"
          />
        </div>
      </div>
    
      <!-- 🔥 优化：营业执照上传区域（文字+上传组件水平一行） -->
      <div class="upload-section mb-md flex-row">
        <label class="form-label upload-label">
          <span class="required-mark">*</span>请上传营业执照
        </label>
        <div class="upload-card license-card">
          <t-upload
            v-model="uploadFiles.license"
            action="#"
            :max-size="10 * 1024 * 1024"
            :accept="['image/jpeg', 'image/png']"
            list-type="picture-card"
            :show-upload-list="false"
          >
            <div class="upload-content">
    				<img src="~/assets/images/upload.png"/>
              <div class="upload-text">营业执照</div>
            </div>
          </t-upload>
        </div>
        <div class="upload-tip">图片大小小于10MB</div>
      </div>
    
      <!-- 产业业务姓名 + 交易意向 -->
      <div class="form-row mb-md">
        <div class="form-item-row">
          <label class="form-label">请输入对接产业业务姓名</label>
          <t-input
            v-model="form.businessName"
            placeholder="请输入对接产业业务姓名"
          />
        </div>
      </div>
    		<div class="form-row mb-md">
    		  <div class="form-item-row">
    		    <label class="form-label">请输入交易意向</label>
    		    <t-input
    		      v-model="form.tradeIntention"
    		      placeholder="请输入交易意向"
    		    />
    		  </div>
    		</div>
    
      <!-- 按钮组 -->
      <div class="btn-group">
        <button type="button" class="confirm-btn" @click="handleSubmit">提交</button>
        <button type="button" class="cancel-btn" @click="handleCancel">取消</button>
      </div>
    
      <!-- 跳过链接 -->
      <a href="/" class="skip-link text-center">跳过企业认证</a>
    </form>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { Form, FormItem, Input, DateRangePicker, Radio, Button } from 'tdesign-vue-next';

// 接收父组件的编辑数据
const props = defineProps({ editData: { type: Object, default: () => ({}) } });
// 表单数据（编辑时初始化）
const form = ref({
  companyName: props.editData.companyName || '',
  creditCode: props.editData.creditCode || '',
  registerCapital: props.editData.registerCapital || '',
  dateRange: props.editData.dateRange || [],
  isLongTerm: props.editData.isLongTerm || 'true',
  legalName: props.editData.legalName || '',
  legalIdNumber: props.editData.legalIdNumber || '',
  contactName: props.editData.contactName || '',
  contactPhone: props.editData.contactPhone || '',
  businessName: props.editData.businessName || '',
  intention: props.editData.intention || ''
});
// 上传文件状态
const uploadFiles = ref({
  license: [] // 营业执照
});

// 表单数据
// const form = ref({
//   enterpriseName: '', // 企业名称
//   registeredCapital: '', // 注册资本
//   socialCreditCode: '', // 统一社会信用代码
//   legalPersonName: '', // 法人姓名
//   legalPersonId: '', // 法人身份证号
//   contactName: '', // 联系人姓名
//   contactPhone: '', // 联系人手机号
//   validDate: [], // 有效期范围
//   isLongTerm: false, // 是否长期有效
//   businessName: '', // 产业业务姓名
//   tradeIntention: '' // 交易意向
// });

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

// 提交/取消（通过emit通知父组件）
const emit = defineEmits(['submit', 'cancel']);
// const handleSubmit = () => emit('submit', formData.value);
// const handleCancel = () => emit('cancel');
</script>

<style lang="scss" scoped>
.enterprise-auth-form {
  padding: 20px;
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