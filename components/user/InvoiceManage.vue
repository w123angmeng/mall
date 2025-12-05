<template>
  <div class="invoice-manage">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <t-loading size="large" />
    </div>
    
    <!-- 发票信息列表（保持原卡片样式不变） -->
    <div class="invoice-list" v-else-if="invoiceList.length">
      <!-- 发票卡片（复用地址卡片结构） -->
      <div class="invoice-item" v-for="(item, idx) in invoiceList" :key="item.id">
        <div class="card-header">
          <img :src="getStateBadge(item.status)" alt="审核状态" class="status-badge">
          <div class="enterprise-name">{{ item.enterpriseName }}</div>
        </div>
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">统一信用代码：</span>
            <span class="info-value">{{ item.creditCode }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">开户银行：</span>
            <span class="info-value">{{ item.bankName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">银行账号：</span>
            <span class="info-value">{{ item.bankAccount }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">公司地址：</span>
            <span class="info-value">{{ item.companyAddress || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">公司电话：</span>
            <span class="info-value">{{ item.companyPhone || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">行号：</span>
            <span class="info-value">{{ item.bankCode || '未填写' }}</span>
          </div>
        </div>
        <div class="card-divider"></div>
        <div class="card-footer">
          <span class="operate-btn view-btn" @click="viewInvoice(item)">
            <t-icon name="article" size="20" />
            <span class="btn-text">查看</span>
          </span>
          <span class="operate-btn edit-btn" @click="openInvoiceDialog(item)">
            <t-icon name="edit" size="20" />
            <span class="btn-text">修改</span>
          </span>
          <span class="operate-btn delete-btn" @click="deleteInvoice(item)">
            <t-icon name="delete" size="20" />
            <span class="btn-text">删除</span>
          </span>
        </div>
      </div>
      <t-button class="add-btn" @click="openInvoiceDialog(null)" :disabled="isSubmitting">+ 添加发票信息</t-button>
    </div>
    
    <div class="empty-state" v-else>
      <div class="empty-text">暂无发票信息</div>
      <t-button class="add-btn" @click="openInvoiceDialog(null)" :disabled="isSubmitting">+ 添加发票信息</t-button>
    </div>

    <!-- 发票新增/编辑弹窗 -->
    <t-dialog 
      v-model:visible="invoiceDialogVisible" 
      :header="currentInvoice.id ? '发票修改' : '发票添加'" 
      width="500px"
    >
      <div class="invoice-form">
        <!-- 表单项：每行1个标签+输入框，带*必填 -->
        <div class="form-item">
          <label class="required-label">企业名称：</label>
          <t-input 
            v-model="currentInvoice.enterpriseName" 
            placeholder="请输入" 
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-item">
          <label class="required-label">统一社会信用代码：</label>
          <t-input 
            v-model="currentInvoice.creditCode" 
            placeholder="请输入" 
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-item">
          <label class="required-label">公司地址：</label>
          <t-input 
            v-model="currentInvoice.companyAddress" 
            placeholder="请输入" 
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-item">
          <label class="required-label">公司电话：</label>
          <t-input 
            v-model="currentInvoice.companyPhone" 
            placeholder="请输入" 
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-item">
          <label class="required-label">开户银行：</label>
          <t-input 
            v-model="currentInvoice.bankName" 
            placeholder="请输入" 
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-item">
          <label class="required-label">银行账号：</label>
          <t-input 
            v-model="currentInvoice.bankAccount" 
            placeholder="请输入" 
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-item">
          <label class="required-label">行号：</label>
          <t-input 
            v-model="currentInvoice.bankCode" 
            placeholder="请输入" 
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-btns">
          <t-button theme="default" @click="invoiceDialogVisible = false" :disabled="isSubmitting">取消</t-button>
          <t-button theme="primary" @click="handleInvoiceSubmit" :loading="isSubmitting">提交</t-button>
        </div>
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Button, Dialog, Input, Icon, Loading, Message } from 'tdesign-vue-next';

// 封装API函数，适配Nuxt上下文
const getInvoiceApi = () => {
  const { get, post } = useRequest();
  
  return {
    getInvoiceList: async () => await get('/invoice/list'),
    supplementInvoiceInfo: async (data) => await post('/invoice/supplement', data)
  };
};

// 初始化API实例
const invoiceApi = getInvoiceApi();

// 基础状态管理
const isLoading = ref(false);
const isSubmitting = ref(false);
const invoiceList = ref([]);
const invoiceDialogVisible = ref(false);

// 当前编辑发票表单
const currentInvoice = reactive({
  id: '',
  certId: '',
  enterpriseName: '',
  creditCode: '',
  companyAddress: '',
  companyPhone: '',
  bankName: '',
  bankAccount: '',
  bankCode: '',
  status: ''
});

// 页面挂载时加载发票列表
onMounted(async () => {
  await fetchInvoiceList();
});

// 状态角标图片匹配
const getStateBadge = (status) => {
  switch (status) {
    case '已认证':
      return '/images/status-cred-success.png';
    case '待审核':
      return '/images/status-cred-pending.png';
    default:
      return '';
  }
};

// ========== 接口调用逻辑 ==========
// 获取发票列表
const fetchInvoiceList = async () => {
  try {
    isLoading.value = true;
    const res = await invoiceApi.getInvoiceList();
    invoiceList.value = res?.data || [];
  } catch (error) {
    Message.error('获取发票列表失败');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// 补充/修改发票信息
const submitInvoiceInfo = async (data) => {
  try {
    await invoiceApi.supplementInvoiceInfo(data);
    return true;
  } catch (error) {
    Message.error(error.message || '发票信息提交失败');
    console.error(error);
    return false;
  }
};

// ========== 表单操作逻辑 ==========
// 打开发票弹窗
const openInvoiceDialog = (data) => {
  // 重置表单
  Object.assign(currentInvoice, {
    id: '',
    certId: '',
    enterpriseName: '',
    creditCode: '',
    companyAddress: '',
    companyPhone: '',
    bankName: '',
    bankAccount: '',
    bankCode: '',
    status: ''
  });
  
  // 编辑模式
  if (data) {
    Object.assign(currentInvoice, data);
  }
  
  invoiceDialogVisible.value = true;
};

// 表单校验
const validateInvoiceForm = () => {
  // 企业名称校验
  if (!currentInvoice.enterpriseName.trim()) {
    Message.error('请输入企业名称');
    return false;
  }
  
  // 统一社会信用代码校验
  const creditReg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
  if (!creditReg.test(currentInvoice.creditCode.trim())) {
    Message.error('请输入有效的统一社会信用代码');
    return false;
  }
  
  // 公司地址校验
  if (!currentInvoice.companyAddress.trim()) {
    Message.error('请输入公司地址');
    return false;
  }
  
  // 公司电话校验
  const phoneReg = /^(\d{3,4}-)?\d{7,8}$|^1[3-9]\d{9}$/;
  if (!phoneReg.test(currentInvoice.companyPhone.trim())) {
    Message.error('请输入有效的公司电话（座机或手机号）');
    return false;
  }
  
  // 开户银行校验
  if (!currentInvoice.bankName.trim()) {
    Message.error('请输入开户银行');
    return false;
  }
  
  // 银行账号校验
  const bankAccountReg = /^\d{8,20}$/;
  if (!bankAccountReg.test(currentInvoice.bankAccount.trim())) {
    Message.error('请输入有效的银行账号（8-20位数字）');
    return false;
  }
  
  // 行号校验
  const bankCodeReg = /^\d{12}$/;
  if (!bankCodeReg.test(currentInvoice.bankCode.trim())) {
    Message.error('请输入有效的12位银行行号');
    return false;
  }
  
  return true;
};

// 提交发票信息
const handleInvoiceSubmit = async () => {
  if (!validateInvoiceForm()) return;
  
  try {
    isSubmitting.value = true;
    
    // 组装提交数据
    const submitData = {
      certId: currentInvoice.certId || Date.now(), // 认证ID，无则生成临时ID
      address: currentInvoice.companyAddress,
      phone: currentInvoice.companyPhone,
      depositBank: currentInvoice.bankName,
      accountNumber: currentInvoice.bankAccount,
      bankCode: currentInvoice.bankCode
    };
    
    // 调用接口提交数据
    const result = await submitInvoiceInfo(submitData);
    if (result) {
      // 提交成功处理
      if (currentInvoice.id) {
        // 编辑：更新列表
        const index = invoiceList.value.findIndex(item => item.id === currentInvoice.id);
        if (index > -1) {
          invoiceList.value[index] = { 
            ...invoiceList.value[index],
            ...currentInvoice,
            status: '待审核' // 提交后重置为待审核
          };
          Message.success('发票信息修改成功，等待审核');
        }
      } else {
        // 新增：添加到列表
        const newInvoice = {
          ...currentInvoice,
          id: Date.now(),
          certId: submitData.certId,
          status: '待审核'
        };
        invoiceList.value.push(newInvoice);
        Message.success('发票信息添加成功，等待审核');
      }
      
      // 关闭弹窗
      invoiceDialogVisible.value = false;
      // 刷新列表
      await fetchInvoiceList();
    }
  } catch (error) {
    Message.error('发票信息提交失败，请重试');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

// 查看发票详情
const viewInvoice = (item) => {
  // 可扩展查看详情逻辑
  console.log('发票详情：', item);
  // 此处可打开详情弹窗或跳转到详情页
};

// 删除发票信息
const deleteInvoice = async (item) => {
  try {
    // 注：接口未提供删除方法，此处为前端模拟删除
    invoiceList.value = invoiceList.value.filter(inv => inv.id !== item.id);
    Message.success('发票信息删除成功');
  } catch (error) {
    Message.error('发票信息删除失败');
    console.error(error);
  }
};
</script>

<style lang="scss" scoped>
.invoice-manage {
  width: 100%;
  min-height: 500px;
  padding: 0 10px;

  // 加载状态
  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
  }

  // 发票列表（保持原卡片样式）
  .invoice-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;

    .invoice-item {
      position: relative;
      width: 354px;
      height: 272px;
      border-radius: 4px;
      background: url('@/assets/images/card-bg.png') no-repeat center / cover;
      box-sizing: border-box;
      border: 1px solid #ECEEF2;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      // 右上角审核状态角标
      .status-badge {
        position: absolute;
        top: 0;
        right: 0;
        width: 48px;
        height: 48px;
        object-fit: contain;
        z-index: 1;
      }

      .card-header {
        height: 56px;
        border-radius: 4px 4px 0px 0px;
        opacity: 1;
        background: rgba(255, 255, 255, 0.502);
        box-sizing: border-box;
        border-bottom: 1px solid #ECEEF2;
        display: flex;
        align-items: center;
        padding: 0 16px;

        .enterprise-name {
          font-size: 18px;
          font-weight: 350;
          line-height: 18px;
          letter-spacing: 0em;
          color: #272727;
        }
      }

      .card-content {
        flex: 1;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .info-label {
            color: #838486;
            font-size: 14px;
          }

          .info-value {
            color: #272727;
            font-size: 14px;
            line-height: 1.5;
          }
        }
      }

      .card-divider {
        width: 100%;
        height: 1px;
        opacity: 1;
        background: #ECEEF2;
        box-sizing: border-box;
      }

      .card-footer {
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        padding: 0 16px;
        background: rgba(255, 255, 255, 0.5);

        .operate-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;

          :deep(.t-icon) {
            color: #838486;
            transition: color 0.2s ease;
          }

          .btn-text {
            font-size: 14px;
            color: #838486;
            transition: color 0.2s ease;
          }
        }

        .view-btn:hover, .edit-btn:hover {
          :deep(.t-icon) { color: #3799AE !important; }
          .btn-text { color: #3799AE !important; }
        }

        .delete-btn:hover {
          :deep(.t-icon) { color: #F53F3F !important; }
          .btn-text { color: #F53F3F !important; }
        }
      }
    }

    .add-btn {
      width: 140px;
      height: 32px;
      border-radius: 4px;
      opacity: 1;
      background: #EEF7F9;
      box-sizing: border-box;
      border: 1px solid #93C8D3;
      color: #3799AE !important;
      font-size: 14px;
      padding: 0 !important;

      &:hover {
        background: #e0f0f5 !important;
        border-color: #7ab9c9 !important;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 0;

    .empty-text {
      font-size: 14px;
      color: #999;
      margin-bottom: 20px;
    }
  }

  // 弹窗表单样式
  .invoice-form {
    .form-item {
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 12px;

      .required-label {
        width: 120px;
        font-size: 14px;
        color: #272727;

        &::before {
          content: '*';
          color: #F53F3F;
          margin-right: 4px;
        }
      }

      :deep(.t-input__inner) {
        width: 100%;
        height: 36px;
        border-radius: 4px;
        padding: 0 12px;
        font-size: 14px;
        color: #272727;

        &::placeholder {
          color: #C9C9C9;
        }

        &:focus {
          border-color: #3799AE;
          box-shadow: 0 0 0 2px rgba(55, 153, 174, 0.1);
        }
      }
    }
  }

  // 弹窗底部按钮
  :deep(.t-dialog__footer) {
    .dialog-btns {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .t-button--theme-default {
        width: 80px;
        height: 36px;
        border-radius: 4px;
        color: #272727 !important;
        border-color: #ECEEF2 !important;
        background: #fff !important;

        &:hover {
          border-color: #3799AE !important;
          color: #3799AE !important;
        }
      }

      .t-button--theme-primary {
        width: 80px;
        height: 36px;
        border-radius: 4px;
        background: #3799AE !important;
        border-color: #3799AE !important;
        color: #fff !important;

        &:hover {
          background: #2d8094 !important;
          border-color: #2d8094 !important;
        }
      }
    }
  }
}
</style>