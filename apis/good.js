/**
 * 注意：不要在模块顶层调用 useRequest，
 * 改为封装成函数，在 Vue setup 中调用
 */
import { useRequest } from '@/composables/useRequest';
import { useCookie } from '#app';

export const getGoodApi = () => {
  const { get, delete: deleteRequest } = useRequest();
  const deviceIdCookie = useCookie('device_id');
  const getDeviceId = () => deviceIdCookie.value || '';

  return {
    /**
     * 获取商品列表
     * @param {Object} params - 查询参数
     * @param {string} [params.keyword] - 搜索关键词
     * @param {string} [params.categoryId] - 分类ID
     * @param {number} [params.pageSize] - 每页条数
     * @param {number} [params.pageNum] - 页码
     * @param {string} [params.orderByColumn=comprehensiveScore] - 排序字段
     * @param {string} [params.isAsc=desc] - 排序方式（asc/desc）
     */
    getProductList: async (params = {}) => {
      const requestParams = {
        orderByColumn: 'comprehensiveScore',
        isAsc: 'desc',
        ...params
      };
      return await get('/product/getProductList', requestParams);
    },

    /**
     * 获取可能喜欢的商品
     */
    getRecommendProducts: async () => {
      return await get('/product/recommendProducts', {}, {
        headers: { 'Cookie': `device_id=${getDeviceId()}` }
      });
    },

    /**
     * 查看商品详情
     * @param {string} productId - 商品ID
     */
    getProductDetail: async (productId) => {
      if (!productId) {
        console.warn('【查看商品详情】商品ID不能为空');
        return {};
      }
      return await get(`/product/getDetail/${productId}`, {}, {
        headers: { 'Cookie': `device_id=${getDeviceId()}` }
      });
    },

    /**
     * 获取相关好物
     * @param {string} productId - 商品ID
     */
    getRelatedProducts: async (productId) => {
      if (!productId) {
        console.warn('【获取相关好物】商品ID不能为空');
        return [];
      }
      return await get(`/product/related/${productId}`);
    },

    /**
     * 获取搜索关键字（最近搜索）
     */
    getRecentSearchKeywords: async () => {
      return await get('/product/recentSearchKeywords', {}, {
        headers: { 'Cookie': `device_id=${getDeviceId()}` }
      });
    },

    /**
     * 删除搜索记录
     */
    deleteSearchRecord: async () => {
      return await deleteRequest('/product/deleteSearchRecord', {}, {
        headers: { 'Cookie': `device_id=${getDeviceId()}` }
      });
    },

    /**
     * 获取搜索推荐分类列表
     */
    getRecommendCategories: async () => {
      return await get('/product/recommendCategories', {}, {
        headers: { 'Cookie': `device_id=${getDeviceId()}` }
      });
    }
  };
};