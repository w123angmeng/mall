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
            @change="handleUploadChange('front')"
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
            @change="handleUploadChange('back')"
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
    <form class="auth-form" @submit.prevent="handleSubmit">
      <!-- 身份证姓名 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.idName"
          placeholder="自动识别姓名"
          :disabled="isSubmitting"
        />
      </div>
    
      <!-- 身份证号 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.idNumber"
          placeholder="自动识别身份证号"
          :disabled="isSubmitting"
        />
      </div>
    
      <!-- 有效期选择 -->
      <div class="form-group mb-md date-row">
        <t-date-picker
          v-model="form.validDate"
          type="daterange"
          placeholder="开始日期 — 结束日期"
          class="date-picker"
          :disabled="form.isLongTerm || isSubmitting"
        />
        <t-radio
          v-model="form.isLongTerm"
          label="true"
          class="long-term-radio"
          :disabled="isSubmitting"
        >
          长期有效
        </t-radio>
      </div>
    
      <!-- 产业业务姓名 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.businessName"
          placeholder="请输入对接产业业务姓名"
          :disabled="isSubmitting"
        />
      </div>
    
      <!-- 交易意向 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.tradeIntention"
          placeholder="请输入交易意向"
          :disabled="isSubmitting"
        />
      </div>
    
      <!-- 按钮组 -->
      <div class="btn-group">
        <button type="button" class="confirm-btn" @click="handleSubmit" :disabled="isSubmitting">
          <t-loading v-if="isSubmitting" size="small" />
          <span v-else>提交</span>
        </button>
        <button type="button" class="cancel-btn" @click="handleCancel" :disabled="isSubmitting">取消</button>
      </div>
    
      <!-- 跳过链接 -->
      <a href="/" class="skip-link text-center" @click.prevent="handleSkip">跳过个人认证</a>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { navigateTo, useNuxtApp } from '#app';
import { Input, DatePicker, Radio, Upload, Loading, Message } from 'tdesign-vue-next';

// 定义接收父组件传值
const props = defineProps({
  // 从AuthManage.vue传递的用户基础信息
  userInfo: {
    type: Object,
    default: () => ({
      nickname: '',
      phoneNumber: ''
    })
  },
  // 已有的认证信息（编辑场景）
  authInfo: {
    type: Object,
    default: () => ({})
  }
});

// 定义事件发射
const emit = defineEmits(['submit', 'cancel', 'skip']);

// Nuxt App 实例
const nuxtApp = useNuxtApp();

// 加载状态
const isSubmitting = ref(false);

// 上传文件状态（修正原有错误的license字段）
const uploadFiles = ref({
  front: [], // 身份证正面
  back: []   // 身份证背面
});

// 表单数据（修正原有错误的企业相关字段，改为个人认证字段）
const form = reactive({
  idName: '', // 身份证姓名
  idNumber: '', // 身份证号
  validDate: [], // 有效期范围
  isLongTerm: false, // 是否长期有效
  businessName: '', // 产业业务姓名
  tradeIntention: '' // 交易意向
});

// 初始化Message提示
const showMessage = (type, text) => {
  if (nuxtApp.$message) {
    nuxtApp.$message[type]({
      content: text,
      duration: 3000
    });
  } else {
    Message[type]({
      content: text,
      duration: 3000
    });
  }
};

// 页面挂载时初始化表单值
onMounted(() => {
  // 1. 优先使用已有认证信息初始化（编辑场景）
  if (props.authInfo) {
    form.idName = props.authInfo.idName || '';
    form.idNumber = props.authInfo.idNumber || '';
    form.validDate = props.authInfo.validDate || [];
    form.isLongTerm = props.authInfo.isLongTerm || false;
    form.businessName = props.authInfo.businessName || '';
    form.tradeIntention = props.authInfo.tradeIntention || '';
    
    // 初始化上传文件（如有）
    if (props.authInfo.frontImg) uploadFiles.value.front = [{ url: props.authInfo.frontImg }];
    if (props.authInfo.backImg) uploadFiles.value.back = [{ url: props.authInfo.backImg }];
  } 
  // 2. 其次使用用户昵称填充身份证姓名（新增场景）
  else if (props.userInfo?.nickname) {
    form.idName = props.userInfo.nickname;
    // 可选项：用手机号填充业务联系人
    form.businessName = props.userInfo.nickname;
  }
});

// 监听长期有效选项，清空有效期
watch(() => form.isLongTerm, (val) => {
  if (val) {
    form.validDate = [];
  }
});

// 身份证号校验规则
const validateIdNumber = (idCard) => {
  if (!idCard) return false;
  // 18位身份证正则
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return reg.test(idCard);
};

// 上传文件变化处理
const handleUploadChange = (type) => {
  // 可在这里添加文件上传前的校验逻辑
  const files = uploadFiles.value[type];
  if (files.length > 0) {
    const file = files[0];
    // 校验文件大小（双重保障，与组件max-size一致）
    if (file.size && file.size > 10 * 1024 * 1024) {
      showMessage('error', `${type === 'front' ? '身份证正面' : '身份证背面'}图片大小不能超过10MB`);
      uploadFiles.value[type] = [];
    }
  }
};

// 表单整体校验
const validateForm = () => {
  // 1. 校验身份证照片
  if (uploadFiles.value.front.length === 0) {
    showMessage('error', '请上传身份证正面照片');
    return false;
  }
  if (uploadFiles.value.back.length === 0) {
    showMessage('error', '请上传身份证背面照片');
    return false;
  }

  // 2. 校验身份证姓名
  if (!form.idName || form.idName.trim() === '') {
    showMessage('error', '请填写身份证姓名');
    return false;
  }

  // 3. 校验身份证号
  if (!form.idNumber || form.idNumber.trim() === '') {
    showMessage('error', '请填写身份证号');
    return false;
  }
  if (!validateIdNumber(form.idNumber.trim())) {
    showMessage('error', '请填写有效的18位身份证号');
    return false;
  }

  // 4. 校验有效期
  if (!form.isLongTerm && (!form.validDate || form.validDate.length !== 2)) {
    showMessage('error', '请选择身份证有效期或勾选长期有效');
    return false;
  }

  // 5. 校验产业业务姓名
  if (!form.businessName || form.businessName.trim() === '') {
    showMessage('error', '请填写对接产业业务姓名');
    return false;
  }

  // 6. 校验交易意向
  if (!form.tradeIntention || form.tradeIntention.trim() === '') {
    showMessage('error', '请填写交易意向');
    return false;
  }

  return true;
};

// 提交认证
const handleSubmit = async () => {
  // 1. 表单校验
  if (!validateForm()) return;

  try {
    isSubmitting.value = true;
    
    // 2. 构造提交数据
    const submitData = {
      ...form,
      // 处理上传文件（实际项目中需替换为文件上传后的URL）
      frontImg: uploadFiles.value.front[0]?.url || '',
      backImg: uploadFiles.value.back[0]?.url || '',
      // 处理长期有效
      isLongTerm: form.isLongTerm === 'true' || form.isLongTerm === true
    };

    // 3. 发射提交事件给父组件
    emit('submit', submitData);

    // 提示成功（可由父组件接管提示）
    showMessage('success', '个人认证提交成功，等待审核');
    
    // 4. 提交成功后跳转（可由父组件控制）
    setTimeout(() => {
      navigateTo('/user');
    }, 1500);

  } catch (error) {
    showMessage('error', error.message || '个人认证提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 取消（返回选择认证页面）
const handleCancel = () => {
  emit('cancel');
  navigateTo('/select-auth');
};

// 跳过认证
const handleSkip = () => {
  emit('skip');
  navigateTo('/');
};
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