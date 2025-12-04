<template>
  <div class="personal-auth-form">
    <!-- 身份证上传区域 -->
    <div class="upload-section mb-lg">
      <div class="upload-label">
        <span class="required-mark">*</span>请上传身份证照
      </div>
      <div class="upload-cards">
        <!-- 身份证正面上传 -->
        <div class="upload-card front-card">
          <t-upload
            v-model="uploadFiles.front"
            action="#"
            :max-size="10 * 1024 * 1024"
            :accept="['image/jpeg', 'image/png']"
            list-type="picture-card"
            :show-upload-list="false"
          >
            <div class="upload-content">
    				<img src="~/assets/images/upload.png"/>
              <div class="upload-text">证件正面照片</div>
            </div>
          </t-upload>
        </div>
        <!-- 身份证背面上传 -->
        <div class="upload-card back-card">
          <t-upload
            v-model="uploadFiles.back"
            action="#"
            :max-size="10 * 1024 * 1024"
            :accept="['image/jpeg', 'image/png']"
            list-type="picture-card"
            :show-upload-list="false"
          >
            <div class="upload-content">
    				<img src="~/assets/images/upload.png"/>
              <div class="upload-text">证件反面照片</div>
            </div>
          </t-upload>
        </div>
      </div>
      <div class="upload-tip text-center">图片大小小于10MB</div>
    </div>
    
    <!-- 表单区域 -->
    <form class="auth-form">
      <!-- 身份证姓名 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.idName"
          placeholder="自动识别姓名"
        />
      </div>
    
      <!-- 身份证号 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.idNumber"
          placeholder="自动识别身份证号"
        />
      </div>
    
      <!-- 有效期选择 -->
      <div class="form-group mb-md date-row">
        <t-date-picker
          v-model="form.validDate"
          type="daterange"
          placeholder="开始日期 — 结束日期"
          class="date-picker"
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
    
      <!-- 产业业务姓名 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.businessName"
          placeholder="请输入对接产业业务姓名"
        />
      </div>
    
      <!-- 交易意向 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.tradeIntention"
          placeholder="请输入交易意向"
        />
      </div>
    
      <!-- 按钮组 -->
      <div class="btn-group">
        <button type="button" class="confirm-btn" @click="handleSubmit">提交</button>
        <button type="button" class="cancel-btn" @click="handleCancel">取消</button>
      </div>
    
      <!-- 跳过链接 -->
      <a href="/" class="skip-link text-center">跳过个人认证</a>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { navigateTo } from 'nuxt/app';
// 正确导入TDesign组件
import { Input, DatePicker, Radio, Upload } from 'tdesign-vue-next';

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

// // 提交认证
// const handleSubmit = () => {
//   // 实际项目中可添加表单验证逻辑
//   alert('企业认证提交成功！');
//   navigateTo('/'); // 提交后跳转首页
// };

// // 取消（返回选择认证页面）
// const handleCancel = () => {
//   navigateTo('/select-auth');
// };

// 提交/取消（通过emit通知父组件）
const emit = defineEmits(['submit', 'cancel']);
const handleSubmit = () => emit('submit', formData.value);
const handleCancel = () => emit('cancel');
</script>

<style lang="scss" scoped>
.personal-auth-form {
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