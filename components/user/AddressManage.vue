<template>
  <div class="address-manage">
    <!-- 收货地址列表 -->
    <div class="address-list" v-if="addressList.length">
      <!-- 地址卡片 -->
      <div class="address-item" v-for="(item, idx) in addressList" :key="item.id">
        <!-- 卡片头（显示收货人 + 默认标签） -->
        <div class="card-header">
          <div class="default-tag" v-if="item.isDefault">默认</div>
          <div class="receiver-name">{{ item.receiver }}</div>
        </div>

        <!-- 卡片内容区（地址信息） -->
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">所在地区：</span>
            <span class="info-value">{{ item.region }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">地址：</span>
            <span class="info-value">{{ item.detail }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">手机号码：</span>
            <span class="info-value">{{ item.phone }}</span>
          </div>
        </div>

        <!-- 分割线 -->
        <div class="card-divider"></div>

        <!-- 底部操作按钮 -->
        <div class="card-footer">
          <span class="operate-btn edit-btn" @click="openAddressDialog(item)">
            <t-icon name="edit" size="20" />
            <span class="btn-text">修改</span>
          </span>
          <span class="operate-btn delete-btn" @click="deleteAddress(item)">
            <t-icon name="delete" size="20" />
            <span class="btn-text">删除</span>
          </span>
        </div>
      </div>

      <!-- 添加新地址按钮 -->
      <t-button class="add-btn" @click="openAddressDialog(null)">+ 添加新地址</t-button>
    </div>

    <!-- 地址空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-text">暂无收货地址</div>
      <t-button class="add-btn" @click="openAddressDialog(null)">+ 添加新地址</t-button>
    </div>

    <!-- 添加/编辑地址弹窗（复选框优化） -->
    <t-dialog v-model:visible="addressDialogVisible" header="添加收货地址" width="500px">
      <div class="address-form">
        <!-- 姓名 + 电话（一行双列） -->
        <div class="form-row">
          <t-input 
            v-model="currentAddress.receiver" 
            placeholder="请输入姓名" 
            class="form-item"
          />
          <t-input 
            v-model="currentAddress.phone" 
            placeholder="请输入电话" 
            class="form-item"
          />
        </div>

        <!-- 地区选择 -->
        <t-select 
          v-model="currentAddress.region" 
          placeholder="请选择省/市/区/街道" 
          class="form-item full-width"
          :options="regionOptions"
        />

        <!-- 详细地址 -->
        <t-input 
          v-model="currentAddress.detail" 
          placeholder="请输入详情地址" 
          class="form-item full-width"
        />

        <!-- 特殊要求 -->
        <t-input 
          v-model="currentAddress.remark" 
          placeholder="特殊要求" 
          class="form-item full-width"
        />

        <!-- 🔥 核心修改：设为默认改为复选框 -->
        <div class="default-option">
          <t-checkbox v-model="currentAddress.isDefault">设为默认</t-checkbox>
        </div>
      </div>

      <template #footer>
        <t-button theme="default" @click="addressDialogVisible = false">取消</t-button>
        <t-button theme="primary" @click="handleAddressSubmit">提交</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// 🔥 替换Radio为Checkbox
import { Button, Dialog, Input, Select, Checkbox } from 'tdesign-vue-next';

// 收货地址列表数据
const addressList = ref([
  {
    id: 1,
    receiver: '张三三',
    region: '四川省成都市高新区街道名称',
    detail: '小区名称具体信息',
    phone: '1234567890',
    isDefault: true,
    remark: ''
  },
  {
    id: 2,
    receiver: '公司名称信息名称信息',
    region: '四川省成都市高新区街道名称',
    detail: '小区名称具体信息',
    phone: '1234567890',
    isDefault: false,
    remark: ''
  }
]);

// 地区选择下拉选项（示例）
const regionOptions = ref([
  { label: '四川省成都市高新区街道名称', value: '四川省成都市高新区街道名称' },
  { label: '北京市朝阳区街道名称', value: '北京市朝阳区街道名称' }
]);

// 弹窗状态 + 当前编辑地址
const addressDialogVisible = ref(false);
const currentAddress = ref({
  id: '',
  receiver: '',
  phone: '',
  region: '',
  detail: '',
  isDefault: false, // 布尔值适配复选框
  remark: ''
});

// 打开地址弹窗（新增/编辑）
const openAddressDialog = (data) => {
  if (data) {
    currentAddress.value = { ...data };
  } else {
    currentAddress.value = {
      id: '',
      receiver: '',
      phone: '',
      region: '',
      detail: '',
      isDefault: false,
      remark: ''
    };
  }
  addressDialogVisible.value = true;
};

// 提交地址（新增/编辑）
const handleAddressSubmit = () => {
  // 若设为默认，取消其他地址的默认状态
  if (currentAddress.value.isDefault) {
    addressList.value = addressList.value.map(addr => ({
      ...addr,
      isDefault: addr.id === currentAddress.value.id // 仅当前地址设为默认
    }));
  }
  
  if (currentAddress.value.id) {
    const index = addressList.value.findIndex(item => item.id === currentAddress.value.id);
    addressList.value[index] = { ...currentAddress.value };
  } else {
    addressList.value.push({
      ...currentAddress.value,
      id: Date.now()
    });
  }
  addressDialogVisible.value = false;
};

// 删除地址
const deleteAddress = (item) => {
  addressList.value = addressList.value.filter(addr => addr.id !== item.id);
};
</script>

<style lang="scss" scoped>
.address-manage {
  width: 100%;
  min-height: 500px;
  padding: 0 10px;

  // 地址列表
  .address-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;

    // 地址卡片
    .address-item {
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

      // 默认地址标签样式
      .default-tag {
        display: inline-block;
        width: 49px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        border-radius: 4px;
        opacity: 1;
        background: #3799AE;
        color: #fff !important;
        font-size: 12px;
        padding: 0 !important;
        margin: 0 10px 0 0 !important;
        z-index: 1;
      }

      // 卡片头（收货人）
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

        .receiver-name {
          font-size: 18px;
          font-weight: 350;
          line-height: 18px;
          letter-spacing: 0em;
          color: #272727;
        }
      }

      // 卡片内容区（地址信息）
      .card-content {
        flex: 1;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;

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

      // 分割线
      .card-divider {
        width: 100%;
        height: 1px;
        opacity: 1;
        background: #ECEEF2;
        box-sizing: border-box;
      }

      // 底部操作按钮
      .card-footer {
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 30px;
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

        // 修改按钮hover（主题色）
        .edit-btn:hover {
          :deep(.t-icon) { color: #3799AE !important; }
          .btn-text { color: #3799AE !important; }
        }

        // 删除按钮hover（红色）
        .delete-btn:hover {
          :deep(.t-icon) { color: #F53F3F !important; }
          .btn-text { color: #F53F3F !important; }
        }
      }
    }

    // 添加地址按钮
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

  // 空状态
  .empty-state {
    text-align: center;
    padding: 40px 0;

    .empty-text {
      font-size: 14px;
      color: #999;
      margin-bottom: 20px;
    }
  }

  // 地址弹窗表单样式
  .address-form {
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .form-item {
        flex: 1;
      }
    }

    .form-item {
      margin-bottom: 16px;

      :deep(.t-input__inner),
      :deep(.t-select__inner) {
        border-color: #ECEEF2;
        &:focus {
          border-color: #3799AE;
          box-shadow: 0 0 0 2px rgba(55, 153, 174, 0.1);
        }
      }
    }

    .full-width {
      width: 100%;
    }

    // 🔥 核心优化：复选框主题色样式
    .default-option {
      margin-bottom: 20px;
      :deep(.t-checkbox) {
        font-size: 14px;
        color: #272727;
        
        // 复选框未选中状态
        :deep(.t-checkbox__inner) {
          border-color: #ECEEF2;
          background: #fff;
        }

        // 复选框选中状态（主题色）
        &.t-is-checked {
          :deep(.t-checkbox__inner) {
            background-color: #3799AE !important;
            border-color: #3799AE !important;
          }
          :deep(.t-checkbox__label) {
            color: #3799AE !important;
          }
        }

        // 复选框hover状态（未选中）
        &:not(.t-is-checked):hover {
          :deep(.t-checkbox__inner) {
            border-color: #3799AE !important;
          }
          :deep(.t-checkbox__label) {
            color: #3799AE !important;
          }
        }
      }
    }
  }

  // 弹窗底部按钮主题色
  :deep(.t-dialog__footer) {
    // 取消按钮（default主题）
    .t-button--theme-default {
      color: #3799AE !important;
      border-color: #3799AE !important;
      background: #fff !important;

      &:hover {
        background: #EEF7F9 !important;
        border-color: #7ab9c9 !important;
        color: #2d8094 !important;
      }
    }

    // 提交按钮（primary主题）
    .t-button--theme-primary {
      background: #3799AE !important;
      border-color: #3799AE !important;
      color: #fff !important;

      &:hover {
        background: #2d8094 !important;
        border-color: #2d8094 !important;
      }

      &:active {
        background: #1f6a7c !important;
        border-color: #1f6a7c !important;
      }
    }
  }
}
</style>