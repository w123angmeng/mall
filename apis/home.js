// apis/home.js
import { useRequest } from '@/composables/useRequest';

const { get } = useRequest();

/**
 * 获取首页分类列表
 * @param {Object} [params] - 查询参数（可选）
 */
export const getHomeCategoryList = async (params) => {
  return await get('/home/page/category', params);
};

/**
 * 获取首页Banner列表
 * @param {Object} [params] - 查询参数（可选）
 */
export const getHomeBannerList = async (params) => {
  return await get('/home/page/banner', params);
};

/**
 * 获取首页爆品推荐列表
 * @param {Object} [params] - 查询参数（可选）
 */
export const getHomeHotGoodsList = async (params) => {
  return await get('/home/page/hot', params);
};

/**
 * 获取首页推荐分类列表
 * @param {Object} [params] - 查询参数（可选）
 */
export const getHomeRecommendList = async (params) => {
  return await get('/home/page/recommend', params);
};

/**
 * 获取首页介绍板块列表
 * @param {Object} [params] - 查询参数（可选）
 */
export const getHomeIntroList = async (params) => {
  return await get('/home/page/intro', params);
};

/**
 * 获取网站底部信息
 * @param {Object} [params] - 查询参数（可选）
 */
export const getHomeFooterInfo = async (params) => {
  return await get('/home/page/footer', params);
};