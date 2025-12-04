// apis/address.js
import { useRequest } from '@/composables/useRequest';

const { get, post, put, delete: del } = useRequest();

/**
 * 根据父级ID获取区域列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.parentId - 父级区域ID
 */
export const getAreaListByParentId = async (params) => {
  return await get('/area/list', params);
};

/**
 * 获取省份列表
 */
export const getProvinces = async () => {
  return await get('/area/provinces');
};

/**
 * 获取城市列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.provinceId - 省份ID
 */
export const getCities = async (params) => {
  return await get('/area/cities', params);
};

/**
 * 获取区县列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.cityId - 城市ID
 */
export const getDistricts = async (params) => {
  return await get('/area/districts', params);
};

/**
 * 获取街道列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.districtId - 区县ID
 */
export const getStreets = async (params) => {
  return await get('/area/streets', params);
};

/**
 * 添加收货地址
 * @param {Object} data - 地址参数
 * @param {string} data.realName - 收货人姓名
 * @param {string} data.phone - 收货人手机号
 * @param {string} data.province - 省份名称
 * @param {string|number} data.provinceId - 省份ID
 * @param {string} data.city - 城市名称
 * @param {string|number} data.cityId - 城市ID
 * @param {string} data.district - 区县名称
 * @param {string|number} data.districtId - 区县ID
 * @param {string} data.street - 街道名称
 * @param {string|number} data.streetId - 街道ID
 * @param {string} data.detail - 详细地址
 * @param {string} data.requirement - 收货要求
 * @param {boolean} data.isDefault - 是否默认地址
 */
export const addAddress = async (data) => {
  return await post('/address/add', data);
};

/**
 * 修改收货地址
 * @param {Object} data - 地址参数
 * @param {string|number} data.id - 地址ID
 * @param {string} data.realName - 收货人姓名
 * @param {string} data.phone - 收货人手机号
 * @param {string} data.province - 省份名称
 * @param {string|number} data.provinceId - 省份ID
 * @param {string} data.city - 城市名称
 * @param {string|number} data.cityId - 城市ID
 * @param {string} data.district - 区县名称
 * @param {string|number} data.districtId - 区县ID
 * @param {string} data.street - 街道名称
 * @param {string|number} data.streetId - 街道ID
 * @param {string} data.detail - 详细地址
 * @param {string} data.requirement - 收货要求
 * @param {boolean} data.isDefault - 是否默认地址
 */
export const updateAddress = async (data) => {
  return await put('/address/update', data);
};

/**
 * 删除收货地址
 * @param {string|number} addressId - 地址ID
 */
export const deleteAddress = async (addressId) => {
  return await del(`/address/delete/${addressId}`);
};

/**
 * 获取收货地址列表
 */
export const getAddressList = async () => {
  return await get('/address/list');
};

/**
 * 获取收货地址详情
 * @param {string|number} addressId - 地址ID
 */
export const getAddressDetail = async (addressId) => {
  return await get(`/address/detail/${addressId}`);
};

/**
 * 获取默认收货地址
 */
export const getDefaultAddress = async () => {
  return await get('/address/default');
};