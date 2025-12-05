<template>
  <div class="address-manage">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <t-loading size="large" />
    </div>
    
    <!-- 收货地址列表 -->
    <div class="address-list" v-else-if="addressList.length">
      <!-- 地址卡片 -->
      <div class="address-item" v-for="(item, idx) in addressList" :key="item.id">
        <!-- 卡片头（显示收货人 + 默认标签） -->
        <div class="card-header">
          <div class="default-tag" v-if="item.isDefault">默认</div>
          <div class="receiver-name">{{ item.realName }}</div>
        </div>

        <!-- 卡片内容区（地址信息） -->
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">所在地区：</span>
            <span class="info-value">{{ item.province }} {{ item.city }} {{ item.district }} {{ item.street }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">地址：</span>
            <span class="info-value">{{ item.detail }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">手机号码：</span>
            <span class="info-value">{{ item.phone }}</span>
          </div>
          <div class="info-item" v-if="item.requirement">
            <span class="info-label">收货要求：</span>
            <span class="info-value">{{ item.requirement }}</span>
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
    <t-dialog v-model:visible="addressDialogVisible" :header="currentAddress.id ? '编辑收货地址' : '添加收货地址'" width="500px">
      <div class="address-form">
        <!-- 姓名 + 电话（一行双列） -->
        <div class="form-row">
          <t-input 
            v-model="currentAddress.realName" 
            placeholder="请输入姓名" 
            class="form-item"
            :disabled="isSubmitting"
          />
          <t-input 
            v-model="currentAddress.phone" 
            placeholder="请输入电话" 
            class="form-item"
            :disabled="isSubmitting"
          />
        </div>

        <!-- 地区选择（级联选择优化） -->
        <div class="region-selector form-item full-width">
          <t-select 
            v-model="provinceValue" 
            placeholder="请选择省份" 
            class="region-select"
            @change="handleProvinceChange"
            :disabled="isSubmitting"
          >
            <t-option v-for="item in provinceList" :key="item.id" :label="item.name" :value="item.id" />
          </t-select>
          <t-select 
            v-model="cityValue" 
            placeholder="请选择城市" 
            class="region-select"
            @change="handleCityChange"
            :disabled="!provinceValue || isSubmitting"
          >
            <t-option v-for="item in cityList" :key="item.id" :label="item.name" :value="item.id" />
          </t-select>
          <t-select 
            v-model="districtValue" 
            placeholder="请选择区县" 
            class="region-select"
            @change="handleDistrictChange"
            :disabled="!cityValue || isSubmitting"
          >
            <t-option v-for="item in districtList" :key="item.id" :label="item.name" :value="item.id" />
          </t-select>
          <t-select 
            v-model="streetValue" 
            placeholder="请选择街道" 
            class="region-select"
            :disabled="!districtValue || isSubmitting"
          >
            <t-option v-for="item in streetList" :key="item.id" :label="item.name" :value="item.id" />
          </t-select>
        </div>

        <!-- 详细地址 -->
        <t-input 
          v-model="currentAddress.detail" 
          placeholder="请输入详情地址" 
          class="form-item full-width"
          :disabled="isSubmitting"
        />

        <!-- 特殊要求 -->
        <t-input 
          v-model="currentAddress.requirement" 
          placeholder="特殊要求" 
          class="form-item full-width"
          :disabled="isSubmitting"
        />

        <!-- 设为默认复选框 -->
        <div class="default-option">
          <t-checkbox v-model="currentAddress.isDefault" :disabled="isSubmitting">设为默认</t-checkbox>
        </div>
      </div>

      <template #footer>
        <t-button theme="default" @click="addressDialogVisible = false" :disabled="isSubmitting">取消</t-button>
        <t-button theme="primary" @click="handleAddressSubmit" :loading="isSubmitting">提交</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { Button, Dialog, Input, Select, Checkbox, Loading, Message, Icon, Option } from 'tdesign-vue-next';

// 修复apis/address.js的Nuxt上下文问题，封装为函数
const getAddressApi = () => {
  const { get, post, put, delete: del } = useRequest();
  
  return {
    getAreaListByParentId: async (params) => await get('/area/list', params),
    getProvinces: async () => await get('/area/provinces'),
    getCities: async (params) => await get('/area/cities', params),
    getDistricts: async (params) => await get('/area/districts', params),
    getStreets: async (params) => await get('/area/streets', params),
    addAddress: async (data) => await post('/address/add', data),
    updateAddress: async (data) => await put('/address/update', data),
    deleteAddress: async (addressId) => await del(`/address/delete/${addressId}`),
    getAddressList: async () => await get('/address/list'),
    getAddressDetail: async (addressId) => await get(`/address/detail/${addressId}`),
    getDefaultAddress: async () => await get('/address/default')
  };
};

// 初始化地址API实例
const addressApi = getAddressApi();

// 基础状态管理
const isLoading = ref(false);
const isSubmitting = ref(false);
const addressList = ref([]);
const addressDialogVisible = ref(false);

// 地区选择相关
const provinceList = ref([]);
const cityList = ref([]);
const districtList = ref([]);
const streetList = ref([]);
const provinceValue = ref('');
const cityValue = ref('');
const districtValue = ref('');
const streetValue = ref('');

// 当前编辑地址表单
const currentAddress = reactive({
  id: '',
  realName: '',
  phone: '',
  province: '',
  provinceId: '',
  city: '',
  cityId: '',
  district: '',
  districtId: '',
  street: '',
  streetId: '',
  detail: '',
  requirement: '',
  isDefault: false
});

// 页面挂载时加载地址列表和省份数据
onMounted(async () => {
  await fetchAddressList();
  await fetchProvinces();
});

// 监听省份变化加载城市
watch(provinceValue, async (val) => {
  if (val) {
    await fetchCities(val);
    // 重置下级选择
    cityValue.value = '';
    districtValue.value = '';
    streetValue.value = '';
    cityList.value = [];
    districtList.value = [];
    streetList.value = [];
  }
});

// 监听城市变化加载区县
watch(cityValue, async (val) => {
  if (val) {
    await fetchDistricts(val);
    // 重置下级选择
    districtValue.value = '';
    streetValue.value = '';
    districtList.value = [];
    streetList.value = [];
  }
});

// 监听区县变化加载街道
watch(districtValue, async (val) => {
  if (val) {
    await fetchStreets(val);
    // 重置下级选择
    streetValue.value = '';
    streetList.value = [];
  }
});

// ========== 接口调用逻辑 ==========
// 获取地址列表
const fetchAddressList = async () => {
  try {
    isLoading.value = true;
    const res = await addressApi.getAddressList();
    addressList.value = res?.data || [];
  } catch (error) {
    Message.error('获取收货地址列表失败');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// 获取省份列表
const fetchProvinces = async () => {
  try {
    const res = await addressApi.getProvinces();
    provinceList.value = res?.data || [];
  } catch (error) {
    Message.error('获取省份列表失败');
    console.error(error);
  }
};

// 获取城市列表
const fetchCities = async (provinceId) => {
  try {
    const res = await addressApi.getCities({ provinceId });
    cityList.value = res?.data || [];
  } catch (error) {
    Message.error('获取城市列表失败');
    console.error(error);
  }
};

// 获取区县列表
const fetchDistricts = async (cityId) => {
  try {
    const res = await addressApi.getDistricts({ cityId });
    districtList.value = res?.data || [];
  } catch (error) {
    Message.error('获取区县列表失败');
    console.error(error);
  }
};

// 获取街道列表
const fetchStreets = async (districtId) => {
  try {
    const res = await addressApi.getStreets({ districtId });
    streetList.value = res?.data || [];
  } catch (error) {
    Message.error('获取街道列表失败');
    console.error(error);
  }
};

// ========== 表单操作逻辑 ==========
// 打开地址弹窗
const openAddressDialog = async (data) => {
  // 重置表单
  Object.assign(currentAddress, {
    id: '',
    realName: '',
    phone: '',
    province: '',
    provinceId: '',
    city: '',
    cityId: '',
    district: '',
    districtId: '',
    street: '',
    streetId: '',
    detail: '',
    requirement: '',
    isDefault: false
  });
  
  // 重置地区选择器
  provinceValue.value = '';
  cityValue.value = '';
  districtValue.value = '';
  streetValue.value = '';
  
  // 编辑模式
  if (data) {
    Object.assign(currentAddress, data);
    // 回显地区选择
    provinceValue.value = data.provinceId;
    if (data.provinceId) await fetchCities(data.provinceId);
    cityValue.value = data.cityId;
    if (data.cityId) await fetchDistricts(data.cityId);
    districtValue.value = data.districtId;
    if (data.districtId) await fetchStreets(data.districtId);
    streetValue.value = data.streetId;
  }
  
  addressDialogVisible.value = true;
};

// 表单校验
const validateAddressForm = () => {
  // 姓名校验
  if (!currentAddress.realName.trim()) {
    Message.error('请输入收货人姓名');
    return false;
  }
  
  // 手机号校验
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(currentAddress.phone.trim())) {
    Message.error('请输入有效的11位手机号码');
    return false;
  }
  
  // 地区校验
  if (!provinceValue.value) {
    Message.error('请选择省份');
    return false;
  }
  if (!cityValue.value) {
    Message.error('请选择城市');
    return false;
  }
  if (!districtValue.value) {
    Message.error('请选择区县');
    return false;
  }
  if (!streetValue.value) {
    Message.error('请选择街道');
    return false;
  }
  
  // 详细地址校验
  if (!currentAddress.detail.trim()) {
    Message.error('请输入详细地址');
    return false;
  }
  
  return true;
};

// 提交地址
const handleAddressSubmit = async () => {
  if (!validateAddressForm()) return;
  
  try {
    isSubmitting.value = true;
    
    // 组装地址数据
    const addressData = {
      ...currentAddress,
      provinceId: provinceValue.value,
      cityId: cityValue.value,
      districtId: districtValue.value,
      streetId: streetValue.value,
      // 获取地区名称
      province: provinceList.value.find(item => item.id === provinceValue.value)?.name || '',
      city: cityList.value.find(item => item.id === cityValue.value)?.name || '',
      district: districtList.value.find(item => item.id === districtValue.value)?.name || '',
      street: streetList.value.find(item => item.id === streetValue.value)?.name || ''
    };
    
    if (addressData.id) {
      // 修改地址
      await addressApi.updateAddress(addressData);
      Message.success('地址修改成功');
    } else {
      // 添加新地址
      await addressApi.addAddress(addressData);
      Message.success('地址添加成功');
    }
    
    // 关闭弹窗并刷新列表
    addressDialogVisible.value = false;
    await fetchAddressList();
  } catch (error) {
    Message.error(error.message || '地址操作失败');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

// 删除地址
const deleteAddress = async (item) => {
  try {
    await addressApi.deleteAddress(item.id);
    Message.success('地址删除成功');
    await fetchAddressList();
  } catch (error) {
    Message.error(error.message || '地址删除失败');
    console.error(error);
  }
};

// 地区选择器事件处理
const handleProvinceChange = async (val) => {
  await fetchCities(val);
};

const handleCityChange = async (val) => {
  await fetchDistricts(val);
};

const handleDistrictChange = async (val) => {
  await fetchStreets(val);
};
</script>

<style lang="scss" scoped>
.address-manage {
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

    // 地区级联选择器样式
    .region-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      
      .region-select {
        flex: 1;
        
        :deep(.t-select__inner) {
          border-color: #ECEEF2;
          &:focus {
            border-color: #3799AE;
            box-shadow: 0 0 0 2px rgba(55, 153, 174, 0.1);
          }
        }
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

    // 复选框主题色样式
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