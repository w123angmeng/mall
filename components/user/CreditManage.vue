<template>
  <div class="credit-manage">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <t-loading size="large" />
    </div>
    
    <!-- 授信情况卡片列表（保持原样式） -->
    <div class="credit-list" v-else-if="creditList.length">
      <div class="credit-item" v-for="(item, idx) in creditList" :key="item.id">
        <div class="card-header">
          <div class="company-name">{{ item.companyName }}</div>
        </div>
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">统一信用代码：</span>
            <span class="info-value">{{ item.creditCode }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">授信帐期：</span>
            <span class="info-value">{{ item.creditPeriod }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">授信额度：</span>
            <span class="info-value credit-limit">{{ formatAmount(item.creditLimit) }}</span>
          </div>
        </div>
        <div class="card-divider"></div>
        <div class="card-footer">
          <span class="operate-btn view-btn" @click="openCreditDialog(item)">
            <t-icon name="article" size="20" />
            <span class="btn-text">查看</span>
          </span>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <div class="empty-text">暂无授信信息</div>
    </div>

    <!-- 授信详情弹窗 -->
    <t-dialog v-model:visible="creditDialogVisible" header="授信情况" width="600px">
      <div class="credit-detail">
        <!-- 1. 基础信息行（企业名称+统一信用代码） -->
        <div class="base-info-row">
          <div class="base-info-item">
            <span class="label">企业名称：</span>
            <span class="value">{{ currentCredit.companyName }}</span>
          </div>
          <div class="base-info-item">
            <span class="label">统一信用代码：</span>
            <span class="value">{{ currentCredit.creditCode }}</span>
          </div>
        </div>

        <!-- 2. 授信额度section -->
        <div class="credit-section">
          <div class="section-header">
            <span class="section-title">授信额度</span>
            <span class="section-value">{{ formatAmount(currentCredit.creditLimit) }}</span>
          </div>
          <div class="section-table">
            <table>
              <tbody>
                <tr>
                  <td class="table-label">已用额度</td>
                  <td class="table-value">{{ formatAmount(currentCredit.usedLimit) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. 授信帐期section -->
        <div class="credit-section">
          <div class="section-header">
            <span class="section-title">授信帐期</span>
            <span class="section-value">下单后{{ currentCredit.creditPeriod }}内付款</span>
          </div>
          <div class="section-table scrollable-table">
            <table>
              <tbody>
                <tr v-for="(bill, i) in currentCredit.billInfo" :key="i">
                  <td class="table-label">{{ bill.period }}</td>
                  <td class="table-value">{{ formatAmount(bill.amount) }}</td>
                  <td class="table-time">{{ bill.payTime }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Button, Dialog, Icon, Loading, Message } from 'tdesign-vue-next';

// 封装API函数，适配Nuxt上下文
const getCreditApi = () => {
  const { get } = useRequest();
  
  return {
    // 获取授信列表
    getCreditList: async () => await get('/credit/list'),
    // 获取授信详情
    getCreditDetail: async (creditId) => await get(`/credit/detail/${creditId}`)
  };
};

// 初始化API实例
const creditApi = getCreditApi();

// 基础状态管理
const isLoading = ref(false);
const creditList = ref([]);
const creditDialogVisible = ref(false);

// 当前查看的授信信息
const currentCredit = reactive({
  id: '',
  companyName: '',
  creditCode: '',
  creditPeriod: '',
  creditLimit: '',
  usedLimit: '',
  billInfo: []
});

// 页面挂载时加载授信列表
onMounted(async () => {
  await fetchCreditList();
});

// ========== 工具函数 ==========
// 金额格式化（统一格式为 ¥xxx.00）
const formatAmount = (amount) => {
  if (!amount) return '¥0.00';
  
  // 移除已有符号和单位，保留数字
  const numStr = amount.toString().replace(/[^\d.]/g, '');
  const num = parseFloat(numStr) || 0;
  
  // 格式化为带¥的两位小数
  return `¥${num.toFixed(2)}`;
};

// 校验统一社会信用代码
const validateCreditCode = (code) => {
  const creditReg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
  return creditReg.test(code);
};

// 校验金额格式
const validateAmount = (amount) => {
  const amountReg = /^\d+(\.\d{1,2})?$/;
  return amountReg.test(amount.toString().replace(/[^\d.]/g, ''));
};

// ========== 接口调用逻辑 ==========
// 获取授信列表
const fetchCreditList = async () => {
  try {
    isLoading.value = true;
    const res = await creditApi.getCreditList();
    
    // 数据校验和格式化
    if (res?.data && Array.isArray(res.data)) {
      creditList.value = res.data.map(item => {
        // 基础数据校验
        if (!item.companyName) {
          Message.warning(`ID为${item.id}的授信信息缺少企业名称`);
        }
        if (!validateCreditCode(item.creditCode)) {
          Message.warning(`ID为${item.id}的企业统一信用代码格式异常`);
        }
        if (!validateAmount(item.creditLimit)) {
          Message.warning(`ID为${item.id}的授信额度格式异常`);
        }
        
        return {
          ...item,
          // 确保金额字段有默认值
          creditLimit: item.creditLimit || 0,
          usedLimit: item.usedLimit || 0,
          // 确保帐期字段有默认值
          creditPeriod: item.creditPeriod || '2个月',
          // 确保账单信息为数组
          billInfo: Array.isArray(item.billInfo) ? item.billInfo : []
        };
      });
    }
  } catch (error) {
    Message.error('获取授信信息失败，请稍后重试');
    console.error('获取授信列表失败：', error);
  } finally {
    isLoading.value = false;
  }
};

// 获取授信详情
const fetchCreditDetail = async (creditId) => {
  try {
    isLoading.value = true;
    const res = await creditApi.getCreditDetail(creditId);
    
    if (res?.data) {
      // 数据校验
      if (!validateCreditCode(res.data.creditCode)) {
        Message.warning('企业统一信用代码格式异常');
      }
      if (!validateAmount(res.data.creditLimit)) {
        Message.warning('授信额度格式异常');
      }
      
      return res.data;
    }
    return null;
  } catch (error) {
    Message.error('获取授信详情失败');
    console.error('获取授信详情失败：', error);
    return null;
  } finally {
    isLoading.value = false;
  }
};

// ========== 交互逻辑 ==========
// 打开授信详情弹窗
const openCreditDialog = async (data) => {
  try {
    // 重置当前授信信息
    Object.assign(currentCredit, {
      id: '',
      companyName: '',
      creditCode: '',
      creditPeriod: '',
      creditLimit: '',
      usedLimit: '',
      billInfo: []
    });
    
    // 优先从接口获取最新详情
    const detailData = await fetchCreditDetail(data.id);
    
    if (detailData) {
      Object.assign(currentCredit, detailData);
    } else {
      // 接口失败时使用本地缓存数据
      Object.assign(currentCredit, data);
    }
    
    creditDialogVisible.value = true;
  } catch (error) {
    Message.error('加载授信详情失败');
    console.error(error);
  }
};
</script>

<style lang="scss" scoped>
.credit-manage {
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

  // 授信卡片列表（保持原样式）
  .credit-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;

    .credit-item {
      position: relative;
      width: calc(30% - 15px);
      height: 220px;
      border-radius: 4px;
      background: url('@/assets/images/card-bg.png') no-repeat center / cover;
      box-sizing: border-box;
      border: 1px solid #ECEEF2;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .card-header {
        height: 48px;
        border-radius: 4px 4px 0px 0px;
        opacity: 1;
        background: rgba(255, 255, 255, 0.502);
        box-sizing: border-box;
        border-bottom: 1px solid #ECEEF2;
        display: flex;
        align-items: center;
        padding: 0 16px;

        .company-name {
          font-size: 16px;
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
        gap: 10px;

        .info-item {
          display: flex;
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

          .credit-limit {
            color: #F53F3F !important;
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

        .view-btn:hover {
          :deep(.t-icon) { color: #3799AE !important; }
          .btn-text { color: #3799AE !important; }
        }
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

  // 授信详情弹窗样式
  .credit-detail {
    padding: 16px 0;
    border-top: 1px solid #ECEEF2;

    .base-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 14px;

      .base-info-item {
        .label {
          color: #838486;
          margin-right: 6px;
        }
        .value {
          color: #272727;
        }
      }
    }

    .credit-section {
      margin-bottom: 30px;

      .section-header {
        display: flex;
        align-items: center;
        font-size: 14px;

        &::before {
          content: '';
          width: 3px;
          height: 14px;
          background: #3799AE;
          opacity: 1;
          margin-right: 8px;
        }

        .section-title {
          color: #272727;
          margin-right: 12px;
        }

        .section-value {
          color: #3799AE;
        }
      }

      .section-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;

        table {
          width: 100%;
        }

        td {
          padding: 10px 0;
          border-bottom: 1px solid #ECEEF2;
        }

        .table-label {
          color: #272727;
          width: 120px;
        }

        .table-value {
          color: #3799AE;
        }

        .table-time {
          color: #272727;
        }
      }

      .scrollable-table {
        max-height: 180px;
        overflow-y: auto;
      }
    }
  }

  // 弹窗底部按钮
  :deep(.t-dialog__footer) {
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
</style>