<template>
  <div class="credit-manage">
    <!-- 授信情况卡片列表（保持原样式） -->
    <div class="credit-list" v-if="creditList.length">
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
            <span class="info-value credit-limit">{{ item.creditLimit }}</span>
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

    <!-- 🔥 优化后：匹配UI图的授信详情弹窗 -->
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
            <span class="section-value">{{ currentCredit.creditLimit }}</span>
          </div>
          <div class="section-table">
            <table>
              <tbody>
                <tr>
                  <td class="table-label">已用额度</td>
                  <td class="table-value">{{ currentCredit.usedLimit }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. 授信帐期section -->
        <div class="credit-section">
          <div class="section-header">
            <span class="section-title">授信帐期</span>
            <span class="section-value">下单后2个月内付款</span>
          </div>
          <div class="section-table scrollable-table">
            <table>
              <tbody>
                <tr v-for="(bill, i) in currentCredit.billInfo" :key="i">
                  <td class="table-label">{{ bill.period }}</td>
                  <td class="table-value">{{ bill.amount }}</td>
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
import { ref } from 'vue';
import { Button, Dialog, Icon } from 'tdesign-vue-next';

// 授信情况列表数据（保持原结构）
const creditList = ref([
  {
    id: 1,
    companyName: '公司名称信息名称信息',
    creditCode: '1234567890',
    creditPeriod: '2个月',
    creditLimit: '¥500000.00',
    usedLimit: '¥1250.00',
    billInfo: [
      { period: '已有帐期', amount: '¥1250.00', payTime: '2025.12.20前付款' },
      { period: '已有帐期', amount: '¥1250.00', payTime: '2025.12.20前付款' },
      { period: '已有帐期', amount: '¥1250.00', payTime: '2025.12.20前付款' },
      { period: '已有帐期', amount: '¥1250.00', payTime: '2025.12.20前付款' },
      { period: '已有帐期', amount: '¥1250.00', payTime: '2025.12.20前付款' }
    ]
  },
  {
    id: 2,
    companyName: '公司名称名称信息',
    creditCode: '1234567890',
    creditPeriod: '2个月',
    creditLimit: '¥500000.00元',
    usedLimit: '¥1250.00',
    billInfo: [
      { period: '已有帐期', amount: '¥1250.00', payTime: '2025.12.20前付款' }
    ]
  }
]);

// 弹窗状态 + 当前查看的授信信息
const creditDialogVisible = ref(false);
const currentCredit = ref({
  companyName: '',
  creditCode: '',
  creditPeriod: '',
  creditLimit: '',
  usedLimit: '',
  billInfo: []
});

// 打开授信详情弹窗
const openCreditDialog = (data) => {
  currentCredit.value = { ...data };
  creditDialogVisible.value = true;
};
</script>

<style lang="scss" scoped>
.credit-manage {
  width: 100%;
  min-height: 500px;
  padding: 0 10px;

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

  // 🔥 核心优化：授信详情弹窗样式（严格匹配UI图）
  .credit-detail {
    padding: 16px 0;
	border-top: 1px solid #ECEEF2;
    // 1. 基础信息行样式
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

    // 2. 通用section样式
    .credit-section {
      margin-bottom: 30px;
      // border-top: 1px solid #ECEEF2;
      // padding-top: 16px;

      // section头部（带主题色伪元素）
      .section-header {
        display: flex;
        align-items: center;
        // margin-bottom: 12px;
        font-size: 14px;

        // 伪元素（3px宽主题色竖条）
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
          color: #3799AE; // 统计值主题色
        }
      }

      // section表格（无表头）
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
          color: #3799AE; // 数值主题色
        }

        .table-time {
          color: #272727;
        }
      }

      // 滚动表格（授信帐期多数据）
      .scrollable-table {
        max-height: 180px;
        overflow-y: auto;
      }
    }
  }
  // 弹窗底部按钮（保持原样式）
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