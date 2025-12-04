<template>
  <div class="invoice-manage">
    <!-- 发票信息列表（保持原卡片样式不变） -->
    <div class="invoice-list" v-if="invoiceList.length">
      <!-- 发票卡片（复用地址卡片结构） -->
      <div class="invoice-item" v-for="(item, idx) in invoiceList" :key="item.id">
        <div class="card-header">
          <!-- <div 
            class="status-tag" 
            :class="item.status === '已认证' ? 'tag-success' : 'tag-pending'"
          >
            {{ item.status }}
          </div> -->
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
            <span class="info-label">开户账号：</span>
            <span class="info-value">{{ item.bankAccount }}</span>
          </div>
         <!-- <div class="info-item">
            <span class="info-label">公司地址：</span>
            <span class="info-value">{{ item.companyAddress || '未填写' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">公司电话：</span>
            <span class="info-value">{{ item.companyPhone || '未填写' }}</span>
          </div> -->
        </div>
        <div class="card-divider"></div>
        <div class="card-footer">
          <span class="operate-btn view-btn" @click="openInvoiceDialog(item)">
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
      <t-button class="add-btn" @click="openInvoiceDialog(null)">+ 添加发票信息</t-button>
    </div>
    <div class="empty-state" v-else>
      <div class="empty-text">暂无发票信息</div>
      <t-button class="add-btn" @click="openInvoiceDialog(null)">+ 添加发票信息</t-button>
    </div>

    <!-- 🔥 优化后：匹配UI图的发票新增/编辑弹窗 -->
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
            :value="currentInvoice.enterpriseName"
          />
        </div>
        <div class="form-item">
          <label class="required-label">统一社会信用代码：</label>
          <t-input 
            v-model="currentInvoice.creditCode" 
            placeholder="请输入" 
            :value="currentInvoice.creditCode"
          />
        </div>
        <div class="form-item">
          <label class="required-label">公司地址：</label>
          <t-input 
            v-model="currentInvoice.companyAddress" 
            placeholder="请输入" 
            :value="currentInvoice.companyAddress || '请输入'"
          />
        </div>
        <div class="form-item">
          <label class="required-label">公司电话：</label>
          <t-input 
            v-model="currentInvoice.companyPhone" 
            placeholder="请输入" 
            :value="currentInvoice.companyPhone || '请输入'"
          />
        </div>
        <div class="form-item">
          <label class="required-label">开户银行：</label>
          <t-input 
            v-model="currentInvoice.bankName" 
            placeholder="请输入" 
            :value="currentInvoice.bankName || '请输入'"
          />
        </div>
        <div class="form-item">
          <label class="required-label">银行账号：</label>
          <t-input 
            v-model="currentInvoice.bankAccount" 
            placeholder="请输入" 
            :value="currentInvoice.bankAccount || '请输入'"
          />
        </div>
        <div class="form-item">
          <label class="required-label">行号：</label>
          <t-input 
            v-model="currentInvoice.bankCode" 
            placeholder="请输入" 
            :value="currentInvoice.bankCode || '请输入'"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-btns">
          <t-button theme="default" @click="invoiceDialogVisible = false">取消</t-button>
          <t-button theme="primary" @click="handleInvoiceSubmit">提交</t-button>
        </div>
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Button, Dialog, Input, Icon} from 'tdesign-vue-next';

// 发票信息列表数据
const invoiceList = ref([
  {
    id: 1,
    enterpriseName: '公司名称名称信息',
    creditCode: '123456789',
    bankName: '123',
    bankAccount: '123',
    companyAddress: '',
    companyPhone: '',
    bankCode: '',
    status: '已认证'
  },
  {
    id: 2,
    enterpriseName: '公司名称名称信息',
    creditCode: '123456789',
    bankName: '123',
    bankAccount: '222',
    companyAddress: '',
    companyPhone: '',
    bankCode: '',
    status: '待审核'
  }
]);
// 状态角标图片匹配（保持原逻辑）
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
// 弹窗状态 + 当前编辑发票信息
const invoiceDialogVisible = ref(false);
const currentInvoice = ref({
  id: '',
  enterpriseName: '',
  creditCode: '',
  companyAddress: '',
  companyPhone: '',
  bankName: '',
  bankAccount: '',
  bankCode: ''
});

// 打开发票弹窗（新增/编辑）
const openInvoiceDialog = (data) => {
  if (data) {
    // 编辑：赋值现有数据
    currentInvoice.value = { ...data };
  } else {
    // 新增：重置表单
    currentInvoice.value = {
      id: '',
      enterpriseName: '',
      creditCode: '',
      companyAddress: '',
      companyPhone: '',
      bankName: '',
      bankAccount: '',
      bankCode: ''
    };
  }
  invoiceDialogVisible.value = true;
};

// 提交发票信息
const handleInvoiceSubmit = () => {
  if (currentInvoice.value.id) {
    // 编辑：更新列表
    const index = invoiceList.value.findIndex(item => item.id === currentInvoice.value.id);
    invoiceList.value[index] = { 
      ...currentInvoice.value,
      status: invoiceList.value[index].status
    };
  } else {
    // 新增：添加到列表（默认待审核）
    invoiceList.value.push({
      ...currentInvoice.value,
      id: Date.now(),
      status: '待审核'
    });
  }
  invoiceDialogVisible.value = false;
};

// 删除发票信息
const deleteInvoice = (item) => {
  invoiceList.value = invoiceList.value.filter(inv => inv.id !== item.id);
};
</script>

<style lang="scss" scoped>
.invoice-manage {
  width: 100%;
  min-height: 500px;
  padding: 0 10px;

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

  // 🔥 匹配UI图的弹窗表单样式
  .invoice-form {
    .form-item {
      margin-bottom: 18px; // 匹配UI图行间距
      display: flex;
      align-items: center; // 标签和输入框垂直居中
      gap: 12px; // 标签和输入框间距

      // 带*必填标签
      .required-label {
        width: 120px; // 标签固定宽度，对齐UI图
        font-size: 14px;
        color: #272727;

        &::before {
          content: '*';
          color: #F53F3F; // *号红色
          margin-right: 4px;
        }
      }

      // 输入框样式匹配UI图
      :deep(.t-input__inner) {
        width: 100%;
        height: 36px;
        border-radius: 4px;
        // border: 1px solid #ECEEF2;
        padding: 0 12px;
        font-size: 14px;
        color: #272727;

        &::placeholder {
          color: #C9C9C9; // 占位符浅灰色
        }

        &:focus {
          border-color: #3799AE;
          box-shadow: 0 0 0 2px rgba(55, 153, 174, 0.1);
        }
      }
    }
  }

  // 弹窗底部按钮（匹配UI图右对齐）
  :deep(.t-dialog__footer) {
    .dialog-btns {
      display: flex;
      justify-content: flex-end; // 按钮右对齐
      gap: 12px; // 按钮间距

      .t-button--theme-default {
        width: 80px; // 按钮固定宽度
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
        width: 80px; // 按钮固定宽度
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