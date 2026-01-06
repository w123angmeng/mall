<template>
  <div class="personal-auth-form">
    <!-- 身份证上传区域 -->
    <div class="upload-section">
      <div class="upload-label">
        <span class="required-mark">*</span>请上传身份证照
      </div>
      <div class="upload-cards">
        <!-- 身份证正面上传 -->
		
        <div class="upload-card">
          <t-upload
            ref="frontUploadRef"
            v-model="uploadFiles.front"
            :max-size="10 * 1024 * 1024"
            :accept="'image/jpeg, image/png'"
            list-type="picture-card"
            :show-upload-list="true"
            :request-method="(file) => handleFileUpload(file, 'front')"
            :on-fail="handleUploadFail"
            theme="custom"
          >
            <div class="upload-content front-card">
              <img class="upload-img" src="~/assets/images/upload.png" alt="上传图标"/>
              <div class="upload-text">证件正面照片</div>
            </div>
			
          </t-upload>
		  <div class="upload-tip">图片大小小于10MB</div>
        </div>
        <!-- 身份证背面上传 -->
        <div class="upload-card">
          <t-upload
            ref="backUploadRef"
            v-model="uploadFiles.back"
            :max-size="10 * 1024 * 1024"
            :accept="'image/jpeg, image/png'"
            list-type="picture-card"
            :show-upload-list="true"
            :request-method="(file) => handleFileUpload(file, 'back')"
            :on-fail="handleUploadFail"
            theme="custom"
          >
            <div class="upload-content back-card">
              <img class="upload-img" src="~/assets/images/upload.png" alt="上传图标"/>
              <div class="upload-text">证件反面照片</div>
            </div>
          </t-upload>
        </div>
      </div>
    </div>
    
    <!-- 表单区域 -->
    <form class="auth-form" @submit.prevent="handleSubmit">
      <!-- 身份证姓名：字段改为 cardName 与父组件对齐 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.cardName"
          placeholder="自动识别姓名"
          :disabled="isSubmitting"
        />
      </div>
    
      <!-- 身份证号：字段改为 cardNumber 与父组件对齐 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.cardNumber"
          placeholder="自动识别身份证号"
          :disabled="isSubmitting"
        />
      </div>
    
      <!-- 有效期选择：字段改为 cardLongTerm 与父组件对齐 -->
      <div class="form-group mb-md date-row">
        <t-date-range-picker
          v-model="form.validDate"
          clearable
          type="daterange"
          class="date-picker"
          :disabled="form.cardLongTerm || isSubmitting"
        />
        <t-radio
          v-model="form.cardLongTerm"
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
          v-model="form.salePerson"
          placeholder="请输入对接产业业务姓名"
          :disabled="isSubmitting"
        />
      </div>
    
      <!-- 交易意向 -->
      <div class="form-group mb-md">
        <t-input
          v-model="form.purchaseIntent"
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
    
      <!-- 跳过链接：根据from字段控制显示 -->
      <a 
        href="/" 
        class="skip-link text-center" 
        @click.prevent="handleSkip"
        v-if="from !== 'authManage'"
      >
        跳过个人认证
      </a>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { navigateTo } from '#app';
import { MessagePlugin } from 'tdesign-vue-next';
import { uploadFile } from '@/apis/common';
import { getVerifyApi } from '@/apis/credit';

const verifyApi = getVerifyApi();

// 定义接收父组件传值：字段与父组件 personalForm 完全对齐
const props = defineProps({
  authInfo: {
    type: Object,
    default: () => ({
      id: '',
      cardFront: '',
      cardBack: '',
      cardName: '',
      cardNumber: '',
      cardLongTerm: 1,
      cardStart: '',
      cardEnd: '',
      salePerson: '',
      purchaseIntent: ''
    })
  },
  from: {
    type: String,
    default: 'personalAuth'
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel', 'skip']);

// 上传组件Ref
const frontUploadRef = ref();
const backUploadRef = ref();

// 上传文件存储（适配TDesign Upload的v-model数组格式）
const uploadFiles = ref({
  front: [],
  back: []
});

// 卡片文件信息存储
const cardFileInfo = ref({
  front: { url: '', ossId: '' },
  back: { url: '', ossId: '' },
  recognizeData: null
});

// 加载状态
const isUploading = ref(false);
const isRecognizing = ref(false);

// 核心修复：表单字段与父组件 personalForm 完全对齐
const form = reactive({
  cardName: '',
  cardNumber: '',
  validDate: [],
  cardLongTerm: 0, // 1=长期有效，0=自定义日期
  salePerson: '',
  purchaseIntent: ''
});

// 消息提示函数
const showMessage = (type, text) => {
  MessagePlugin[type]({ content: text, duration: 3000 });
};

// 辅助函数：校验URL有效性
const isValidUrl = (url) => {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w.-]*)*\/?$/;
  return urlRegex.test(url);
};

// 文件上传方法
const handleFileUpload = (file, type) => {
  return new Promise(async (resolve) => {
    if (file.size > 10 * 1024 * 1024) {
      resolve({ status: 'fail', error: '图片大小不能超过10MB' });
      return;
    }

    if (isUploading.value) {
      resolve({ status: 'fail', error: '已有文件正在上传，请稍等' });
      return;
    }

    try {
      isUploading.value = true;
      const uploadRes = await uploadFile({
        file: file.raw,
        onProgress: (progress) => {
          const percent = Math.floor(progress * 100);
          console.log(`${type === 'front' ? '正面' : '背面'}上传进度：${percent}%`);
        }
      });

      if (uploadRes?.code === 200 && uploadRes.data?.url) {
        const { url, ossId } = uploadRes.data;
        if (!isValidUrl(url)) {
          resolve({ status: 'fail', error: '上传成功但URL格式无效' });
          showMessage('warning', '图片无法预览，请重新上传');
          return;
        }

        // 存储文件信息
        cardFileInfo.value[type] = { url, ossId };
        // 更新Upload组件的v-model
        uploadFiles.value[type] = [{ url, name: file.name, ossId }];

        resolve({ status: 'success', response: { url, name: file.name } });
        showMessage('success', `${type === 'front' ? '身份证正面' : '身份证背面'}上传成功`);

        // 正反面都上传后自动识别
        if (cardFileInfo.value.front.ossId && cardFileInfo.value.back.ossId) {
          await handleIdCardRecognize();
        }
      } else {
        resolve({ status: 'fail', error: uploadRes?.msg || '上传失败' });
        showMessage('error', `${type === 'front' ? '正面' : '背面'}上传失败`);
      }
    } catch (error) {
      resolve({ status: 'fail', error: error.message || '网络异常' });
      showMessage('error', `${type === 'front' ? '正面' : '背面'}上传失败`);
    } finally {
      isUploading.value = false;
    }
  });
};

// 身份证识别方法
const handleIdCardRecognize = async () => {
  if (isRecognizing.value) return;
  try {
    isRecognizing.value = true;
    const formData = new FormData();
    formData.append('frontFileId', cardFileInfo.value.front.ossId);
    formData.append('backFileId', cardFileInfo.value.back.ossId);

    const res = await verifyApi.recognizeIdCard(formData);
    if (res?.code === 200 && res.data) {
      const { cardName, cardNumber, cardLongTerm, cardStart, cardEnd } = res.data;
      // 自动填充表单（字段与父组件对齐）
      form.cardName = cardName || '';
      form.cardNumber = cardNumber || '';
      form.cardLongTerm = cardLongTerm || 1;
      if (cardLongTerm === 0) {
        form.validDate = [cardStart, cardEnd];
      }
      showMessage('success', `身份证识别成功，${res.data.verified ? '信息匹配' : '信息不匹配'}`);
    } else {
      showMessage('warning', '身份证识别失败，请手动填写');
    }
  } catch (error) {
    console.error('识别失败：', error);
    showMessage('error', '身份证识别失败，请手动填写');
  } finally {
    isRecognizing.value = false;
  }
};

// 上传失败回调
const handleUploadFail = (error) => {
  console.error('上传失败：', error);
  showMessage('error', error.error || '文件上传失败');
  if (error.file?.type === 'front') {
    uploadFiles.value.front = [];
    cardFileInfo.value.front = { url: '', ossId: '' };
  } else if (error.file?.type === 'back') {
    uploadFiles.value.back = [];
    cardFileInfo.value.back = { url: '', ossId: '' };
  }
};

// 身份证号校验规则
const validateIdNumber = (idCard) => {
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return reg.test(idCard);
};

// 表单校验（与父组件逻辑一致）
const validateForm = () => {
  if (uploadFiles.value.front.length === 0) {
    showMessage('error', '请上传身份证正面照片');
    return false;
  }
  if (uploadFiles.value.back.length === 0) {
    showMessage('error', '请上传身份证背面照片');
    return false;
  }
  if (!form.cardName.trim()) {
    showMessage('error', '请填写身份证姓名');
    return false;
  }
  if (!form.cardNumber.trim()) {
    showMessage('error', '请填写身份证号');
    return false;
  }
  if (!validateIdNumber(form.cardNumber.trim())) {
    showMessage('error', '请填写有效的18位身份证号');
    return false;
  }
  if (form.cardLongTerm === 0 && form.validDate.length !== 2) {
    showMessage('error', '请选择有效期或勾选长期有效');
    return false;
  }
  if (!form.salePerson.trim()) {
    showMessage('error', '请填写对接产业业务姓名');
    return false;
  }
  if (!form.purchaseIntent.trim()) {
    showMessage('error', '请填写交易意向');
    return false;
  }
  return true;
};

// 提交方法：传递与父组件对齐的字段
const handleSubmit = async () => {
  if (!validateForm()) return;

  // 构造提交数据（字段与父组件 personalForm 完全一致）
  const submitData = {
    ...form,
    cardFront: cardFileInfo.value.front.ossId || uploadFiles.value.front[0]?.ossId || '',
    cardBack: cardFileInfo.value.back.ossId || uploadFiles.value.back[0]?.ossId || '',
    cardStart: form.cardLongTerm === 0 ? form.validDate[0] : '',
    cardEnd: form.cardLongTerm === 0 ? form.validDate[1] : ''
  };

  emit('submit', submitData);
  showMessage('success', '表单验证通过，提交中...');
};

// 取消方法
const handleCancel = () => {
  emit('cancel');
  navigateTo('/select-auth');
};

// 跳过认证
const handleSkip = () => {
  emit('skip');
  navigateTo('/');
};

// 页面挂载时初始化表单（从父组件接收数据）
onMounted(() => {
  const { authInfo } = props;
  if (authInfo) {
    form.cardName = authInfo.cardName || '';
    form.cardNumber = authInfo.cardNumber || '';
    form.cardLongTerm = authInfo.cardLongTerm || 1;
    form.salePerson = authInfo.salePerson || '';
    form.purchaseIntent = authInfo.purchaseIntent || '';
    // 初始化已上传的文件
    if (authInfo.cardFront) {
      uploadFiles.value.front = [{ url: authInfo.cardFront, name: '身份证正面.jpg' }];
      cardFileInfo.value.front.url = authInfo.cardFront;
    }
    if (authInfo.cardBack) {
      uploadFiles.value.back = [{ url: authInfo.cardBack, name: '身份证背面.jpg' }];
      cardFileInfo.value.back.url = authInfo.cardBack;
    }
    // 初始化有效期
    if (authInfo.cardLongTerm === 0 && authInfo.cardStart && authInfo.cardEnd) {
      form.validDate = [authInfo.cardStart, authInfo.cardEnd];
    }
  }
});

// 监听长期有效选项
watch(() => form.cardLongTerm, (val) => {
  if (val === 1) {
    form.validDate = [];
  }
});
</script>

<style lang="scss" scoped>
.personal-auth-form {
	:deep(.t-input) {
	    height: 40px !important;
	    box-sizing: border-box !important;
	
	    .t-input__inner {
	      height: 100% !important;
	      line-height: 40px !important;
	      padding: 0 15px !important;
	      
	      &:focus {
	        border-color: inherit !important;
	        outline: none !important;
	        box-shadow: none !important;
	      }
	    }
	  }
	
	  :deep(.t-date-range-picker) {
	    height: 40px !important;
		.t-input {
			height: 100% !important;
		}
	    .t-range-input {
	      height: 100% !important;
	      &:focus {
	        border-color: inherit !important;
	        outline: none !important;
	        box-shadow: none !important;
	      }
	    }
	  }
	
	  :deep(.t-range-input__inner) {
	    height: 100% !important;
	    .t-input__inner {
	      height: 100% !important;
	      &:focus {
	        border-color: inherit !important;
	        outline: none !important;
	        box-shadow: none !important;
	      }
	    }
	  }
  :deep(.t-input) {
    // height: 40px !important;
    // border: none !important;
    // box-shadow: none !important;
    // background: transparent !important;

    // .t-input__inner {
    //   height: 100% !important;
    //   border: 1px solid #ECEEF2 !important;
    //   border-radius: 4px !important;
    //   outline: none !important;
    //   padding: 0 15px !important;
    //   font-size: 14px !important;
    // }
  }

  :deep(.t-date-range-picker) {
    // width: 220px;
	flex: 1;
    .t-input__inner {
      height: 39px !important;
    }
  }

  :deep(.t-radio) {
    font-size: 14px;
    color: #2F3032;
    margin-left: 15px;
  }

  :deep(.t-loading) {
    display: inline-block;
    margin-right: 8px;
  }
}

.upload-section {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start; 
}

.upload-label {
  font-size: 14px;
  color: #272727;
  margin-bottom: 12px;
}

.required-mark {
  color: #F53F3F;
  margin-right: 4px;
}

.upload-cards {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.upload-card {
  // width: 180px;
  // height: 100px;
  
  .upload-tip {
    font-size: 12px;
    color: #838486;
    margin-top: 10px;
  }
  .upload-content {
    width: 180px;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
	border: 1px dashed #ECEEF2;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: border-color 0.2s;
	position: relative;
	background-repeat: no-repeat;
	background-position: center;
	background-size: cover;
	
	&.front-card {
	  background-image: url('~/assets/images/idcard-front.png');
	}
	
	&.back-card {
	  background-image: url('~/assets/images/idcard-back.png');
	}
	
	&:hover {
	  border-color: #3799AE;
	}
	
	.upload-img {
		width: 20px;
		height: 20px;
		margin-bottom: 16px;
	}
	.upload-text {
	  font-size: 14px;
	  color: #838486;
	}
  }
}




.auth-form {
  width: 100%;
  // max-width: 500px;
  margin: 0 auto;
}

.form-group {
  width: 100%;
  margin-bottom: 16px !important;
}

.date-row {
  display: flex;
  align-items: center;
  .long-term-radio {
	  width: 86px;
  }
}

.btn-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 40px auto;
}

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

  &:hover {
    background: #2d8094;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

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

  &:hover {
    border-color: #3799AE;
    color: #3799AE;
  }

  &:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
  }
}

.skip-link {
  display: block;
  font-size: 14px;
  color: #3799AE;
  text-decoration: none;
  margin-top: 16px;
  text-align: center;

  &:hover {
    text-decoration: underline;
  }
}

.mb-lg { margin-bottom: 18px !important; }
.mb-md { margin-bottom: 16px !important; }
.text-center { text-align: center; }
</style>