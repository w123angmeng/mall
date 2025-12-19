/**
 * 注意：useRequest 必须在 Nuxt 上下文（setup/插件/中间件）中调用，
 * 因此不能在模块顶层初始化，需在接口函数内部动态获取
 * 
 * SSR 调试说明：
 * 1. 该文件中所有接口默认在服务端执行（SSR模式），浏览器Network面板看不到请求；
 * 2. 调试服务端请求：启动Nuxt时执行 `nuxt dev --log-level debug`，在终端查看请求日志；
 * 3. 强制客户端请求（临时调试）：在调用接口的useAsyncData中添加 `server: false`；
 * 4. 如需打印请求日志，可在接口函数内添加 console.log（服务端日志在终端，客户端在浏览器控制台）
 */
import { useRequest } from '@/composables/useRequest';

/**
 * 获取首页分类列表
 * @param {Object} [params] - 查询参数（可选）
 * @returns {Promise<Object>} 分类列表数据
 * SSR调试：服务端执行，终端查看日志；如需客户端执行，在useAsyncData中设置server: false
 */
export const getHomeCategoryList = async (params) => {
  try {
    const { get } = useRequest(); 
    console.log('【首页分类列表】发起请求，参数：', params);
    const res = await get('/home/page/category', params);
    console.log('【首页分类列表】响应数据：', res);
    return res;
  } catch (err) {
    console.error('【首页分类列表】请求失败：', err.message);
    return null; // 兜底返回null，让页面使用模拟数据
  }
};

/**
 * 获取首页Banner列表
 * @param {Object} [params] - 查询参数（可选）
 * @returns {Promise<Object>} Banner列表数据
 * SSR调试：服务端执行，终端查看日志；如需客户端执行，在useAsyncData中设置server: false
 */
export const getHomeBannerList = async (params) => {
  try {
    const { get } = useRequest();
    console.log('【首页Banner列表】发起请求，参数：', params);
    const res = await get('/home/page/banner', params);
    console.log('【首页Banner列表】响应数据：', res);
    return res;
  } catch (err) {
    console.error('【首页Banner列表】请求失败：', err.message);
    return null;
  }
};

/**
 * 获取首页爆品推荐列表
 * @param {Object} [params] - 查询参数（可选）
 * @returns {Promise<Object>} 爆品推荐列表数据
 * SSR调试：服务端执行，终端查看日志；如需客户端执行，在useAsyncData中设置server: false
 */
export const getHomeHotGoodsList = async (params) => {
  try {
    const { get } = useRequest();
    console.log('【首页爆品推荐】发起请求，参数：', params);
    const res = await get('/home/page/hot', params);
    console.log('【首页爆品推荐】响应数据：', res);
    return res;
  } catch (err) {
    console.error('【首页爆品推荐】请求失败：', err.message);
    return null;
  }
};

/**
 * 获取首页推荐分类列表
 * @param {Object} [params] - 查询参数（可选）
 * @returns {Promise<Object>} 推荐分类列表数据
 * SSR调试：服务端执行，终端查看日志；如需客户端执行，在useAsyncData中设置server: false
 */
export const getHomeRecommendList = async (params) => {
  try {
    const { get } = useRequest();
    console.log('【首页推荐分类】发起请求，参数：', params);
    const res = await get('/home/page/recommend', params);
    console.log('【首页推荐分类】响应数据：', res);
    return res;
  } catch (err) {
    console.error('【首页推荐分类】请求失败：', err.message);
    return null;
  }
};

/**
 * 获取首页介绍板块列表
 * @param {Object} [params] - 查询参数（可选）
 * @returns {Promise<Object>} 介绍板块列表数据
 * SSR调试：服务端执行，终端查看日志；如需客户端执行，在useAsyncData中设置server: false
 */
export const getHomeIntroList = async (params) => {
  try {
    const { get } = useRequest();
    console.log('【首页介绍板块】发起请求，参数：', params);
    const res = await get('/home/page/intro', params);
    console.log('【首页介绍板块】响应数据：', res);
    return res;
  } catch (err) {
    console.error('【首页介绍板块】请求失败：', err.message);
    return null;
  }
};

/**
 * 获取网站底部信息
 * @param {Object} [params] - 查询参数（可选）
 * @returns {Promise<Object>} 底部信息数据
 * SSR调试：服务端执行，终端查看日志；如需客户端执行，在useAsyncData中设置server: false
 */
export const getHomeFooterInfo = async (params) => {
  try {
    const { get } = useRequest();
    console.log('【网站底部信息】发起请求，参数：', params);
    const res = await get('/home/page/footer', params);
    console.log('【网站底部信息】响应数据：', res);
    return res;
  } catch (err) {
    console.error('【网站底部信息】请求失败：', err.message);
    return null;
  }
};