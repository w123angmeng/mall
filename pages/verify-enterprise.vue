<template>
  <div>
    <div class="auth-card">
      <div class="page-title text-center mb-lg">企业认证</div>
      <!-- 调用企业认证公共组件 -->
      <EnterpriseAuthForm
        :edit-data="editData"
        :is-personal-center="false"
        @submit="handleEnterpriseSubmit"
        @cancel="handleCancel"
        @uploadSuccess="handleUploadSuccess"
      />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' });
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import * as verifyApi from '@/apis/credit';
// 引入企业认证公共组件
import EnterpriseAuthForm from '@/components/auth/EnterpriseAuthForm.vue';

const router = useRouter();
const isSubmitting = ref(false);
// 编辑回显数据，默认空对象即可
const editData = reactive({});
// 营业执照ossId存储
const licenseOssId = ref('');

// 接收公共组件的表单提交事件
const handleEnterpriseSubmit = async (submitData) => {
  if (isSubmitting.value) return;
  try {
    isSubmitting.value = true;
    // 构造接口提交参数，与后端字段完全对齐
    const params = {
      companyName: submitData.enterpriseName.trim(),
      registeredCapital: Number(submitData.registeredCapital),
      socialCode: submitData.socialCreditCode.trim(),
      longTerm: submitData.isLongTerm ? 1 : 0,
      startDate: submitData.isLongTerm ? '' : submitData.validDate?.[0] || '',
      endDate: submitData.isLongTerm ? '' : submitData.validDate?.[1] || '',
      legalName: submitData.legalPersonName.trim(),
      legalNumber: submitData.legalPersonId.trim(),
      concatName: submitData.contactName.trim(),
      concatPhone: submitData.contactPhone.trim(),
      license: submitData.license || licenseOssId.value,
      isDefault: false,
      salePerson: submitData.businessName.trim(),
      purchaseIntent: submitData.tradeIntention.trim()
    };
    // 调用企业认证提交接口
    await verifyApi.submitCompanyCert(params);
    MessagePlugin.success('企业认证提交成功！审核结果将通过短信通知');
    setTimeout(() => {
      router.push({ path: '/' });
    }, 1500);
  } catch (error) {
    MessagePlugin.error(error.message || '企业认证提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 接收公共组件的取消事件
const handleCancel = () => {
  if (!isSubmitting.value) {
    router.push({ path: '/select-auth' });
  }
};

// 接收公共组件的营业执照上传成功事件
const handleUploadSuccess = (res) => {
  licenseOssId.value = res.ossId;
};
</script>

<style lang="scss" scoped>
.auth-card {
  width: 782px;
  // height: 760px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 30px;
  box-sizing: border-box;
  margin: 0 auto;
}

.page-title {
  font-size: 16px;
  font-weight: 400;
  color: #272727;
  margin-bottom: 30px;
}

.mb-lg { margin-bottom: 25px !important; }
.text-center { text-align: center; }
</style>