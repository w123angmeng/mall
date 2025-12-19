// apis/cart.js
/**
 * 注意：不要在模块顶层调用 useRequest/useCookie，
 * 改为封装成函数，在 Vue setup 中调用
 */
export const getCartApi = () => {
  // 仅在函数内部调用组合式API，确保Vue setup上下文
  const { get, post, put, delete: del } = useRequest();
  const deviceIdCookie = useCookie('device_id'); // 关联设备ID，与登录模块保持一致

  // 获取设备ID（兼容服务端/客户端）
  const getDeviceId = () => {
    return deviceIdCookie.value || '';
  };

  return {
    /**
     * 添加购物车
     * @param {Object} data - 购物车参数
     * @param {string|number} data.productId - 商品ID
     * @param {string|number} data.productSkuId - 商品SKU ID
     * @param {number} data.cartNum - 商品数量
     */
    addCart: async (data) => {
      if (!data?.productId || !data?.productSkuId || !data?.cartNum) {
        console.error('添加购物车参数错误：', data);
        return { code: -1, msg: '商品ID/SKU/数量不能为空' };
      }
      return await post('/cart/add', data, {
        headers: {
          Cookie: `device_id=${getDeviceId()}`,
          'Content-Type': 'application/json'
        }
      });
    },

    /**
     * 获取购物车列表
     */
    getCartList: async () => {
      try {
        return await get('/cart/list', {}, {
          headers: {
            Cookie: `device_id=${getDeviceId()}`
          }
        });
      } catch (error) {
        console.error('获取购物车列表失败：', error);
        return { code: -1, msg: '网络异常，获取购物车失败', data: [] };
      }
    },

    /**
     * 删除购物车商品
     * @param {string|number} cartId - 购物车ID
     */
    deleteCartItem: async (cartId) => {
      if (!cartId) {
        console.error('删除购物车参数错误：cartId不能为空');
        return { code: -1, msg: '购物车ID不能为空' };
      }
      return await del(`/cart/delete/${cartId}`, {}, {
        headers: {
          Cookie: `device_id=${getDeviceId()}`
        }
      });
    },

    /**
     * 更新购物车商品数量
     * @param {Object} params - 更新参数
     * @param {string|number} params.cartId - 购物车ID
     * @param {number} params.cartNum - 新商品数量
     */
    updateCartNum: async (params) => {
      if (!params?.cartId || !params?.cartNum) {
        console.error('更新购物车数量参数错误：', params);
        return { code: -1, msg: '购物车ID/数量不能为空' };
      }
      return await put('/cart/updateNum', params, {
        headers: {
          Cookie: `device_id=${getDeviceId()}`,
          'Content-Type': 'application/json'
        }
      });
    }
  };
};