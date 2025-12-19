<template>
  <div class="enterprise-auth-form">
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
    
      <!-- 营业执照上传区域 -->
      <div class="upload-section mb-md flex-row">
        <label class="form-label upload-label">
          <span class="required-mark">*</span>请上传营业执照
        </label>
        <div class="upload-card license-card">
          <t-upload
            v-model="uploadFiles.license"
            :request-method="(file) => handleFileUpload(file, 'license')"
            :max-size="10 * 1024 * 1024"
            :accept="'image/jpeg, image/png'"
            list-type="picture-card"
            :show-upload-list="true"
            theme="image"
          >
            <div class="upload-content">
              <img src="~/assets/images/upload.png" alt="上传"/>
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
    
      <!-- 按钮组：仅企业认证页面显示 -->
      <div class="btn-group" v-if="!isPersonalCenter">
        <button type="button" class="confirm-btn" @click="handleSubmit">提交</button>
        <button type="button" class="cancel-btn" @click="handleCancel">取消</button>
      </div>
    
      <!-- 跳过链接：仅企业认证页面显示 -->
      <a href="/" class="skip-link text-center" v-if="!isPersonalCenter">跳过企业认证</a>
    </form>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, onMounted } from 'vue';
import { navigateTo } from '#app';
import { MessagePlugin } from 'tdesign-vue-next';
import { useRequest } from '@/composables/useRequest';
import { uploadFile } from '@/apis/common';

const props = defineProps({
  editData: { 
    type: Object, 
    default: () => ({}) 
  },
  isPersonalCenter: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel', 'uploadSuccess']);

const { upload } = useRequest();

const form = ref({
  enterpriseName: props.editData.enterpriseName || '',
  registeredCapital: props.editData.registeredCapital || '',
  socialCreditCode: props.editData.socialCreditCode || '',
  validDate: props.editData.validDate || [],
  isLongTerm: props.editData.isLongTerm || false,
  legalPersonName: props.editData.legalPersonName || '',
  legalPersonId: props.editData.legalPersonId || '',
  contactName: props.editData.contactName || '',
  contactPhone: props.editData.contactPhone || '',
  businessName: props.editData.businessName || '',
  tradeIntention: props.editData.tradeIntention || '',
  originalId: props.editData.originalId || '',
});

const uploadFiles = ref({
  license: []
});

const isUploading = ref(false);

const handleFileUpload = (file, type) => {
  return new Promise(async (resolve) => {
    if (file.size > 10 * 1024 * 1024) {
      MessagePlugin.error('图片大小不能超过10MB');
      resolve({ status: 'fail' });
      return;
    }

    if (isUploading.value) {
      MessagePlugin.warning('已有文件正在上传，请稍等');
      resolve({ status: 'fail' });
      return;
    }

    try {
      isUploading.value = true;
      const uploadRes = await uploadFile({
        file: file.raw,
        onProgress: (progress) => {
          const percent = Math.floor(progress * 100);
          console.log(`上传进度：${percent}%`);
        }
      });

      if (uploadRes && uploadRes.code === 200 && uploadRes.data?.url) {
        const ossUrl = uploadRes.data.url;
        uploadFiles.value[type] = [{
          url: ossUrl,
          name: file.name,
		  ossId: uploadRes.data?.ossId
        }];
        
        resolve({ 
          status: 'success', 
          response: { url: ossUrl, name: file.name } 
        });
        MessagePlugin.success('营业执照上传成功');
        emit('uploadSuccess', { type, url: ossUrl, ossId: uploadRes.data?.ossId});
      } else {
        resolve({ status: 'fail' });
        MessagePlugin.error('营业执照上传失败');
      }
    } catch (error) {
      resolve({ status: 'fail' });
      MessagePlugin.error(`上传失败：${error.message || '网络异常'}`);
    } finally {
      isUploading.value = false;
    }
  });
};

const handleSubmit = () => {
  if (!form.value.enterpriseName) {
    MessagePlugin.error('请输入企业名称');
    return false;
  }
  if (!form.value.socialCreditCode) {
    MessagePlugin.error('请输入统一社会信用代码');
    return false;
  }
  if (!form.value.legalPersonName) {
    MessagePlugin.error('请输入法人姓名');
    return false;
  }
  if (!form.value.legalPersonId) {
    MessagePlugin.error('请输入法人身份证号');
    return false;
  }
  if (!form.value.contactName) {
    MessagePlugin.error('请输入联系人姓名');
    return false;
  }
  if (!form.value.contactPhone) {
    MessagePlugin.error('请输入联系人手机号');
    return false;
  }
  if (uploadFiles.value.license.length === 0) {
    MessagePlugin.error('请上传营业执照');
    return false;
  }

  const submitData = {
    ...form.value,
    licenseUrl: uploadFiles.value.license[0]?.ossId || '',
	license: uploadFiles.value.license[0]?.ossId || ''
  };
  console.log('----submit:', form.value, submitData)
  emit('submit', submitData);
  return true;
};

const handleCancel = () => {
  emit('cancel');
  navigateTo('/select-auth');
};

defineExpose({
  handleSubmit,
  handleCancel
});

onMounted(() => {
  if (props.editData.licenseUrl) {
    uploadFiles.value.license = [{
      url: props.editData.licenseUrl,
      name: '营业执照.jpg'
    }];
  }
});
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
    
    .t-upload-card {
      width: 170px !important;
      height: 100px !important;
    }
    
    .t-upload-card-img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
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

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #2F3032;
  margin-bottom: 25px;
}

.form-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.form-item {
  flex: 0 0 48%;
  margin-bottom: 0 !important;
}

.form-item-row {
  flex: 0 0 100%;
  margin-bottom: 0 !important;
}

.form-label {
  display: none !important;
  font-size: 14px;
  color: #2F3032;
  margin-bottom: 8px;
}

.upload-label {
  display: block !important;
  margin-bottom: 0 !important;
  margin-right: 15px;
}

.required-mark {
  color: #F53F3F;
  margin-right: 4px;
}

.date-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.upload-section {
  width: 100%;
  margin-bottom: 16px;
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

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
    background-size: cover;
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
  margin-top: 0 !important;
}

.btn-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
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
}

.confirm-btn:hover {
  background: #2d8094;
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
}

.cancel-btn:hover {
  border-color: #3799AE;
  color: #3799AE;
}

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

.mb-lg { margin-bottom: 25px !important; }
.mb-md { margin-bottom: 16px !important; }
.text-center { text-align: center; }
</style>