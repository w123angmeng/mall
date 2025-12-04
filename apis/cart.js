// apis/cart.js
import { useRequest } from '@/composables/useRequest';
import { useCookie } from '#app';

const { get, post, put, delete: del } = useRequest();
const deviceIdCookie = useCookie('device_id'); // 关联设备ID，与登录模块保持一致

/**
 * 添加购物车
 * @param {Object} data - 购物车参数
 * @param {string|number} data.productId - 商品ID
 * @param {string|number} data.productSkuId - 商品SKU ID
 * @param {number} data.cartNum - 商品数量
 */
export const addCart = async (data) => {
  return await post('/cart/add', data, {
    headers: {
      Cookie: `device_id=${deviceIdCookie.value || ''}`
    }
  });
};

/**
 * 获取购物车列表
 */
export const getCartList = async () => {
  return await get('/cart/list', {}, {
    headers: {
      Cookie: `device_id=${deviceIdCookie.value || ''}`
    }
  });
};

/**
 * 删除购物车商品
 * @param {string|number} cartId - 购物车ID
 */
export const deleteCartItem = async (cartId) => {
  return await del(`/cart/delete/${cartId}`, {}, {
    headers: {
      Cookie: `device_id=${deviceIdCookie.value || ''}`
    }
  });
};

/**
 * 更新购物车商品数量
 * @param {Object} params - 更新参数
 * @param {string|number} params.cartId - 购物车ID
 * @param {number} params.cartNum - 新商品数量
 */
export const updateCartNum = async (params) => {
  return await put('/cart/updateNum', {}, {
    params,
    headers: {
      Cookie: `device_id=${deviceIdCookie.value || ''}`
    }
  });
};