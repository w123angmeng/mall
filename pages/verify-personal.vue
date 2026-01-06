<template>
  <div>
    <div class="auth-card">
      <div class="page-title text-center mb-lg">个人认证</div>
      <!-- 调用个人认证公共组件 -->
      <PersonalAuthForm
        :auth-info="authInfo"
        :from="from"
        :is-submitting="isSubmitting"
        @submit="handlePersonalSubmit"
        @cancel="handleCancel"
        @skip="handleSkip"
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
// 引入个人认证公共组件
import PersonalAuthForm from '@/components/auth/PersonalAuthForm.vue';

const router = useRouter();
const isSubmitting = ref(false);
// 页面来源标识：个人认证页固定传 personalAuth
const from = ref('personalAuth');
// 公共组件回显数据，默认空对象即可
const authInfo = reactive({
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
});

// 核心：接收公共组件的提交事件 + 表单数据
const handlePersonalSubmit = async (submitData) => {
  if (isSubmitting.value) return;
  try {
    isSubmitting.value = true;
    // 构造接口提交参数，与后端接口字段对齐
    const params = {
      cardFront: submitData.cardFront,
      cardBack: submitData.cardBack,
      cardName: submitData.cardName.trim(),
      cardNumber: submitData.cardNumber.trim(),
      cardLongTerm: submitData.cardLongTerm,
      cardStart: submitData.cardStart || '',
      cardEnd: submitData.cardEnd || '',
      salePerson: submitData.salePerson.trim(),
      purchaseIntent: submitData.purchaseIntent.trim()
    };
    // 调用个人认证提交接口
    await verifyApi.submitPersonCert(params);
    MessagePlugin.success('个人认证提交成功！审核结果将通过短信通知');
    setTimeout(() => {
      router.push({ path: '/' });
    }, 1500);
  } catch (error) {
    MessagePlugin.error(error.message || '个人认证提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 取消按钮事件：返回认证选择页
const handleCancel = () => {
  if (!isSubmitting.value) {
    router.push({ path: '/select-auth' });
  }
};

// 跳过认证事件：返回首页
const handleSkip = () => {
  if (!isSubmitting.value) {
    router.push({ path: '/' });
  }
};
</script>

<style lang="scss" scoped>
.auth-card {
  width: 560px;
  height: 705px;
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