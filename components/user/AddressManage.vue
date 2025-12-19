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
		   <span class="info-label">收货人：</span>
		   <span class="info-value">{{ item.realName }}</span>
		 </div>
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
          <!-- <div class="info-item" v-if="item.requirement">
            <span class="info-label">收货要求：</span>
            <span class="info-value">{{ item.requirement }}</span>
          </div> -->
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

    <!-- 添加/编辑地址弹窗（t-form结构） -->
    <t-dialog v-model:visible="addressDialogVisible" :header="currentAddress.id ? '编辑收货地址' : '添加收货地址'" width="500px">
      <t-form 
        ref="addressFormRef" 
        :data="currentAddress" 
        :rules="addressFormRules" 
        label-width="0"
        class="address-form"
      >
        <!-- 姓名 + 电话（一行双列） -->
        <div class="form-row">
          <t-form-item name="realName" class="form-item">
            <t-input 
              v-model="currentAddress.realName" 
              placeholder="请输入姓名" 
              :disabled="isSubmitting"
            />
          </t-form-item>
          <t-form-item name="phone" class="form-item">
            <t-input 
              v-model="currentAddress.phone" 
              placeholder="请输入电话" 
              :disabled="isSubmitting"
            />
          </t-form-item>
        </div>

        <!-- 地区选择（t-cascader动态加载） -->
        <t-form-item name="" class="form-item full-width">
          <t-cascader 
            v-model="regionValue" 
            placeholder="请选择省/市/区/街道" 
            clearable 
            :load="loadRegionData" 
            :disabled="isSubmitting"
            :options="regionOptions"
			value-type="full"
          />
        </t-form-item>

        <!-- 详细地址 -->
        <t-form-item name="detail" class="form-item full-width">
          <t-input 
            v-model="currentAddress.detail" 
            placeholder="请输入详情地址" 
            :disabled="isSubmitting"
          />
        </t-form-item>

        <!-- 特殊要求（非必填） -->
        <t-form-item class="form-item full-width">
          <t-input 
            v-model="currentAddress.requirement" 
            placeholder="特殊要求（选填）" 
            :disabled="isSubmitting"
          />
        </t-form-item>

        <!-- 设为默认复选框 -->
        <div class="default-option">
          <t-checkbox v-model="currentAddress.isDefault" :disabled="isSubmitting">设为默认</t-checkbox>
        </div>
      </t-form>

      <template #footer>
        <t-button theme="default" @click="addressDialogVisible = false" :disabled="isSubmitting">取消</t-button>
        <t-button theme="primary" @click="handleAddressSubmit" :loading="isSubmitting">提交</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { 
  Button, Dialog, Input, Checkbox, Loading, Icon, 
  Form, FormItem, Cascader 
} from 'tdesign-vue-next';

// 导入地址相关API
import {
  getProvinces,
  getCities,
  getDistricts,
  getStreets,
  addAddress,
  updateAddress,
  deleteAddressApi,
  getAddressList,
  getAddressDetail
} from '@/apis/address';

// 基础状态管理
const isLoading = ref(false);
const isSubmitting = ref(false);
const addressList = ref([]);
const addressDialogVisible = ref(false);
const addressFormRef = ref(null); // 表单ref

// 级联选择相关 - 初始化为空数组（避免undefined）
const regionOptions = ref([]); 
const regionValue = ref([]); 
const regionLabelMap = ref({}); 

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

// 表单校验规则 - 空值保护
const addressFormRules = ref({
  realName: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度需在2-20位之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择完整的省/市/区/街道', trigger: 'change' },
    { 
      // validator: (val) => val && val.length === 4, 
	  validator: (val) => val, 
      message: '必须选择到街道级别', 
      trigger: 'change' 
    }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, message: '详细地址长度不能少于5位', trigger: 'blur' }
  ]
});

// 页面挂载时加载地址列表和省级数据
onMounted(async () => {
  await fetchAddressList();
  await initProvinceOptions();
});

// ========== 地区级联加载逻辑 ==========
/** 初始化省级级联选项 */
const initProvinceOptions = async () => {
  try {
    const res = await getProvinces();
    // 空值保护：确保res.data存在
    const provinceData = res?.data || [];
    regionOptions.value = provinceData.map(item => ({
      label: item.name,
      value: item.id,
      children: true 
    }));
    provinceData.forEach(item => {
      regionLabelMap.value[item.id] = item.name;
    });
  } catch (error) {
    MessagePlugin.error('加载省份数据失败');
    console.error('省级数据加载失败：', error);
  }
};

/** 级联选择动态加载子节点 */
const loadRegionData = async (node) => {
  return new Promise(async (resolve) => {
    try {
      let childNodes = [];
      const parentId = node.value;
      const level = node.level;

      let res = null;
      // 按层级加载对应数据，每个请求都做空值保护
      if (level === 0) {
        res = await getCities({ provinceId: parentId });
      } else if (level === 1) {
        res = await getDistricts({ cityId: parentId });
      } else if (level === 2) {
        res = await getStreets({ districtId: parentId });
      }

      // 核心：空值保护，避免res.data为undefined
      const data = res?.data || [];
      childNodes = data.map(item => ({
        label: item.name,
        value: item.id,
        children: level < 2 // 只有省/市有子节点
      }));
      
      // 缓存名称映射
      data.forEach(item => {
        regionLabelMap.value[item.id] = item.name;
      });

      setTimeout(() => resolve(childNodes), 300);
    } catch (error) {
      const levelName = level === 0 ? '市' : level === 1 ? '区' : '街道';
      MessagePlugin.error(`加载${levelName}数据失败，请重试`);
      console.error(`${levelName}数据加载失败：`, error);
      resolve([]);
    }
  });
};

// ========== 地址列表/操作逻辑 ==========
/** 获取地址列表 */
const fetchAddressList = async () => {
  try {
    isLoading.value = true;
    const res = await getAddressList();
    // 空值保护
    addressList.value = res?.data || [];
  } catch (error) {
    MessagePlugin.error('获取收货地址列表失败');
    console.error('地址列表加载失败：', error);
  } finally {
    isLoading.value = false;
  }
};

/** 打开地址弹窗 */
const openAddressDialog = async (data) => {
  // 重置表单数据
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

  // 重置级联选择状态
  regionValue.value = [];
  regionLabelMap.value = {};
  
  // 重置表单校验状态
  if (addressFormRef.value) {
    addressFormRef.value.clearValidate();
  }

  // 重新初始化省级选项
  await initProvinceOptions();

  // 编辑模式：加载地址详情并回显
  if (data) {
    try {
      // 空值保护：确保data有值
      const detail = data || {};
      Object.assign(currentAddress, detail);
      
      // 组装级联选择值，过滤空值
      const provinceId = detail.provinceId || '';
      const cityId = detail.cityId || '';
      const districtId = detail.districtId || '';
      const streetId = detail.streetId || '';
      regionValue.value = [provinceId, cityId, districtId, streetId].filter(Boolean);
      console.log('-----init:', regionValue.value)
      // 缓存地区名称映射
      regionLabelMap.value = {
        [provinceId]: detail.province || '',
        [cityId]: detail.city || '',
        [districtId]: detail.district || '',
        [streetId]: detail.street || ''
      };
    } catch (error) {
      MessagePlugin.error('加载地址详情失败');
      console.error('地址详情加载失败：', error);
    }
  }

  addressDialogVisible.value = true;
};

/** 提交地址（核心修复：解决result未定义） */
const handleAddressSubmit = async () => {
  
  if (!addressFormRef.value) return;

  try {
    // 1. 表单校验，校验失败直接返回
    const validateResult = await addressFormRef.value.validate();
    if (validateResult !== true) {
      return;
    }
    
    isSubmitting.value = true;
	console.log('----:', regionValue.value)
    // 2. 解析级联选择值，全量空值保护
    const [provinceId = '', cityId = '', districtId = '', streetId = ''] = regionValue.value;
	console.log('regionValue.value:', regionValue.value)
	console.log('provinceId:', provinceId)
	console.log('cityId:', cityId)
	console.log('districtId:', districtId)
	console.log('streetId:', streetId)
	console.log('map:', regionLabelMap.value)
    const province = regionLabelMap.value[provinceId] || '';
    const city = regionLabelMap.value[cityId] || '';
    const district = regionLabelMap.value[districtId] || '';
    const street = regionLabelMap.value[streetId] || '';

    // 3. 组装提交数据，确保所有字段都有值
    const submitData = {
      ...currentAddress,
      provinceId,
      cityId,
      districtId,
      streetId,
      province,
      city,
      district,
      street
    };

    // 4. 调用API，核心：对返回值做空值保护，避免访问result属性时报错
    let res = null;
    if (submitData.id) {
      res = await updateAddress(submitData);
    } else {
      res = await addAddress(submitData);
    }

    // 关键修复：如果代码中需要访问res.result，先判断res是否存在
    // 移除/注释掉所有直接访问 res.result 的代码，改为以下方式：
    const apiResult = res?.result || {}; // 空值兜底
    // 如果后端返回的是res.data，改为：const apiResult = res?.data || {};
    
    // 5. 提交成功提示
    MessagePlugin.success(submitData.id ? '地址修改成功' : '地址添加成功');

    // 6. 关闭弹窗并刷新列表
    addressDialogVisible.value = false;
    await fetchAddressList();

  } catch (error) {
    // 精准捕获错误，避免模糊的result未定义错误
    console.error('地址提交失败详情：', error);
    // 区分不同错误类型提示
    // if (error.message?.includes('result')) {
    //   MessagePlugin.error('接口返回数据格式异常，请联系管理员');
    // } else {
    //   MessagePlugin.error(error.message || '地址操作失败');
    // }
  } finally {
    isSubmitting.value = false;
  }
};

/** 删除地址 */
const deleteAddress = async (item) => {
  try {
    if (!item?.id) {
      MessagePlugin.error('地址ID不存在，无法删除');
      return;
    }
    // 二次确认
    const confirm = window.confirm('确定要删除该地址吗？');
    if (!confirm) return;

    const res = await deleteAddressApi(item.id);
    // 空值保护
    if (res?.code === 200 || !res) { // 根据后端实际返回调整
      MessagePlugin.success('地址删除成功');
      await fetchAddressList();
    } else {
      MessagePlugin.error('地址删除失败');
    }
  } catch (error) {
    MessagePlugin.error(error.message || '地址删除失败');
    console.error('地址删除失败：', error);
  }
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
          // flex-direction: column;
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
		  justify-content: center;
		  width: 50%;
		  
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

      // :deep(.t-input__inner),
      // :deep(.t-cascader__inner) {
      //   border-color: #ECEEF2;
      //   // &:focus {
      //   //   border-color: #3799AE;
      //   //   box-shadow: 0 0 0 2px rgba(55, 153, 174, 0.1);
      //   // }
      // }
    }

    .full-width {
      width: 100%;
    }

    // 复选框主题色样式
    .default-option {
      margin-bottom: 20px;
      :deep(.t-checkbox) {
        // font-size: 14px;
        // color: #272727;
        
        // 复选框未选中状态
        // :deep(.t-checkbox__inner) {
        //   border-color: #ECEEF2;
        //   background: #fff;
        // }

        // // 复选框选中状态（主题色）
        // &.t-is-checked {
        //   :deep(.t-checkbox__inner) {
        //     background-color: #3799AE !important;
        //     border-color: #3799AE !important;
        //   }
        //   :deep(.t-checkbox__label) {
        //     color: #3799AE !important;
        //   }
        // }

        // 复选框hover状态（未选中）
        // &:not(.t-is-checked):hover {
        //   :deep(.t-checkbox__inner) {
        //     border-color: #3799AE !important;
        //   }
        //   :deep(.t-checkbox__label) {
        //     color: #3799AE !important;
        //   }
        // }
      }
    }
  }

  // 弹窗底部按钮主题色
  :deep(.t-dialog__footer) {
    // 取消按钮（default主题）
    // .t-button--theme-default {
    //   color: #3799AE !important;
    //   border-color: #3799AE !important;
    //   background: #fff !important;

    //   &:hover {
    //     background: #EEF7F9 !important;
    //     border-color: #7ab9c9 !important;
    //     color: #2d8094 !important;
    //   }
    // }

    // 提交按钮（primary主题）
    // .t-button--theme-primary {
    //   background: #3799AE !important;
    //   border-color: #3799AE !important;
    //   color: #fff !important;

    //   &:hover {
    //     background: #2d8094 !important;
    //     border-color: #2d8094 !important;
    //   }

    //   &:active {
    //     background: #1f6a7c !important;
    //     border-color: #1f6a7c !important;
    //   }
    // }
  }
}
</style>