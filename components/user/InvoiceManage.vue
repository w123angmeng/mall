<template>
  <div class="invoice-manage">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <t-loading size="large" />
    </div>
    
    <!-- 发票信息列表 -->
    <div class="invoice-list" v-else-if="invoiceList.length">
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
      <!-- <t-button class="add-btn" @click="openInvoiceDialog(null)" :disabled="isSubmitting">+ 添加发票信息</t-button> -->
    </div>
    
    <div class="empty-state" v-else>
      <div class="empty-text">暂无发票信息</div>
      <!-- <t-button class="add-btn" @click="openInvoiceDialog(null)" :disabled="isSubmitting">+ 添加发票信息</t-button> -->
    </div>

    <!-- 发票新增/编辑弹窗（t-form结构） -->
    <t-dialog 
      v-model:visible="invoiceDialogVisible" 
      :header="currentInvoice.id ? '发票修改' : '发票添加'" 
      width="500px"
    >
      <t-form 
        ref="invoiceFormRef" 
        :data="currentInvoice" 
        :rules="invoiceFormRules" 
        label-width="140px"
        class="invoice-form"
      >
        <!-- 企业名称 -->
        <t-form-item name="enterpriseName" class="form-item full-width" label="企业名称">
          <t-input 
            v-model="currentInvoice.enterpriseName" 
            placeholder="请输入企业名称" 
            :disabled="isSubmitting"
          />
        </t-form-item>
        
        <!-- 统一社会信用代码 -->
        <t-form-item name="creditCode" class="form-item full-width" label="统一社会信用代码">
          <t-input 
            v-model="currentInvoice.creditCode" 
            placeholder="请输入统一社会信用代码" 
            :disabled="isSubmitting"
          />
        </t-form-item>
        
        <!-- 公司地址 -->
        <t-form-item name="companyAddress" class="form-item full-width" label="公司地址">
          <t-input 
            v-model="currentInvoice.companyAddress" 
            placeholder="请输入公司地址" 
            :disabled="isSubmitting"
          />
        </t-form-item>
        
        <!-- 公司电话 -->
        <t-form-item name="companyPhone" class="form-item full-width" label="公司电话">
          <t-input 
            v-model="currentInvoice.companyPhone" 
            placeholder="请输入公司电话（座机或手机号）" 
            :disabled="isSubmitting"
          />
        </t-form-item>
        
        <!-- 开户银行 -->
        <t-form-item name="bankName" class="form-item full-width" label="开户银行">
          <t-input 
            v-model="currentInvoice.bankName" 
            placeholder="请输入开户银行" 
            :disabled="isSubmitting"
          />
        </t-form-item>
        
        <!-- 银行账号 -->
        <t-form-item name="bankAccount" class="form-item full-width" label="银行账号">
          <t-input 
            v-model="currentInvoice.bankAccount" 
            placeholder="请输入银行账号" 
            :disabled="isSubmitting"
          />
        </t-form-item>
        
        <!-- 行号 -->
        <t-form-item name="bankCode" class="form-item full-width" label="行号">
          <t-input 
            v-model="currentInvoice.bankCode" 
            placeholder="请输入12位银行行号" 
            :disabled="isSubmitting"
          />
        </t-form-item>
      </t-form>

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
import { MessagePlugin } from 'tdesign-vue-next';
import { Button, Dialog, Input, Icon, Loading, Form, FormItem } from 'tdesign-vue-next';

// 封装API函数
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
const invoiceFormRef = ref(null);

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

// 表单校验规则（所有字段必填+格式校验）
const invoiceFormRules = ref({
  enterpriseName: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { min: 2, max: 50, message: '企业名称长度需在2-50位之间', trigger: 'blur' }
  ],
  creditCode: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
    // { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '请输入有效的统一社会信用代码', trigger: 'blur' }
  ],
  companyAddress: [
    { required: true, message: '请输入公司地址', trigger: 'blur' },
    { min: 5, message: '公司地址长度不能少于5位', trigger: 'blur' }
  ],
  companyPhone: [
    { required: true, message: '请输入公司电话', trigger: 'blur' },
    { pattern: /^(\d{3,4}-)?\d{7,8}$|^1[3-9]\d{9}$/, message: '请输入有效的公司电话（座机或手机号）', trigger: 'blur' }
  ],
  bankName: [
    { required: true, message: '请输入开户银行', trigger: 'blur' },
    { min: 2, max: 50, message: '开户银行长度需在2-50位之间', trigger: 'blur' }
  ],
  bankAccount: [
    { required: true, message: '请输入银行账号', trigger: 'blur' },
    { pattern: /^\d{8,20}$/, message: '请输入有效的银行账号（8-20位数字）', trigger: 'blur' }
  ],
  bankCode: [
    { required: true, message: '请输入银行行号', trigger: 'blur' },
    { pattern: /^\d{12}$/, message: '请输入有效的12位银行行号', trigger: 'blur' }
  ]
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
const fetchInvoiceList = async () => {
  try {
    isLoading.value = true;
    const res = await invoiceApi.getInvoiceList();
    invoiceList.value = res?.data || [];
  } catch (error) {
    MessagePlugin.error('获取发票列表失败');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const submitInvoiceInfo = async (data) => {
  try {
    await invoiceApi.supplementInvoiceInfo(data);
    return true;
  } catch (error) {
    MessagePlugin.error(error.message || '发票信息提交失败');
    console.error(error);
    return false;
  }
};

// ========== 表单操作逻辑 ==========
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
  
  // 重置表单校验状态
  if (invoiceFormRef.value) {
    invoiceFormRef.value.clearValidate();
  }
  
  // 编辑模式
  if (data) {
    Object.assign(currentInvoice, data);
  }
  
  invoiceDialogVisible.value = true;
};

const handleInvoiceSubmit = async () => {
  if (!invoiceFormRef.value) return;

  try {
    // 表单校验
    const validateResult = await invoiceFormRef.value.validate();
	console.log('submit validateResult:', validateResult)
    if (validateResult !== true) return;
    
    isSubmitting.value = true;
    
    // 组装提交数据
    const submitData = {
      certId: currentInvoice.certId,
      address: currentInvoice.companyAddress,
      phone: currentInvoice.companyPhone,
      depositBank: currentInvoice.bankName,
      accountNumber: currentInvoice.bankAccount,
      bankCode: currentInvoice.bankCode,
      enterpriseName: currentInvoice.enterpriseName,
      creditCode: currentInvoice.creditCode,
      id: currentInvoice.id
    };
    
    // 调用接口提交数据
    const result = await submitInvoiceInfo(submitData);
    if (result) {
      if (currentInvoice.id) {
        const index = invoiceList.value.findIndex(item => item.id === currentInvoice.id);
        if (index > -1) {
          invoiceList.value[index] = { 
            ...invoiceList.value[index],
            ...currentInvoice,
            status: '待审核'
          };
          MessagePlugin.success('发票信息修改成功，等待审核');
        }
      } else {
        const newInvoice = {
          ...currentInvoice,
          id: Date.now(),
          certId: submitData.certId,
          status: '待审核'
        };
        invoiceList.value.push(newInvoice);
        MessagePlugin.success('发票信息添加成功，等待审核');
      }
      
      invoiceDialogVisible.value = false;
      await fetchInvoiceList();
    }
  } catch (error) {
    MessagePlugin.error('发票信息提交失败，请重试');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const viewInvoice = (item) => {
  console.log('发票详情：', item);
};

const deleteInvoice = async (item) => {
  try {
    invoiceList.value = invoiceList.value.filter(inv => inv.id !== item.id);
    MessagePlugin.success('发票信息删除成功');
  } catch (error) {
    MessagePlugin.error('发票信息删除失败');
    console.error(error);
  }
};
</script>

<style lang="scss" scoped>
.invoice-manage {
  width: 100%;
  min-height: 500px;
  padding: 0 10px;

  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
  }

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

  .invoice-form {
    .form-item {
      margin-bottom: 18px;

      .full-width {
        width: 100%;
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