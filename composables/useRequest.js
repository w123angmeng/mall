// composables/useRequest.js
import axios from 'axios';
import { useRuntimeConfig, useCookie, useRoute, navigateTo, useNuxtApp } from '#app';

export function useRequest() {
  // 1. 获取Nuxt实例（核心：判断是否在客户端/服务端）
  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();
  const tokenCookie = useCookie('user_token');
  const route = useRoute(); // 移到函数内部并初始化

  // 2. 兼容处理TDesign的useToast（避免SSR环境报错）
  let toast = null;
  if (process.client) { // 仅在客户端初始化toast
    const { useToast } = require('tdesign-vue-next');
    const toastInstance = useToast();
    toast = toastInstance.toast;
  }

  // 从Nuxt运行时配置中读取环境参数（自动适配当前环境）
  const baseURL = config.public.apiBaseUrl;
  const timeout = config.public.requestTimeout || 5000; // 兜底默认值
  const currentEnv = config.public.env || 'production';

  // 创建axios实例（使用环境配置）
  const service = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器（原有逻辑不变，新增客户端判断）
  service.interceptors.request.use(
    (req) => {
      // 仅在客户端打印开发环境日志（避免服务端报错）
      if (process.client && currentEnv === 'development') {
        console.log(`[${req.method}] ${req.url}`, req.params || req.data);
      }

      // 添加Token（原有逻辑）
      if (tokenCookie.value) {
        req.headers.Authorization = `Bearer ${tokenCookie.value}`;
      }
      return req;
    },
    (err) => Promise.reject(err)
  );

  // 响应拦截器（修复上下文报错+保留原有逻辑）
  service.interceptors.response.use(
    (res) => {
      const { code, data, msg } = res.data;
      if (code === 200) {
        return data;
      } else {
        // 正式环境不暴露详细错误信息
        const errorMsg = currentEnv === 'production' ? '请求失败，请稍后重试' : msg || '业务错误';
        
        // 仅在客户端显示toast（避免服务端报错）
        if (process.client && toast) {
          toast({ content: errorMsg, theme: 'error' });
        }
        
        return Promise.reject(new Error(errorMsg));
      }
    },
    (err) => {
      // 不同环境的错误处理
      let errMsg = '';
      if (process.client && currentEnv === 'development') {
        errMsg = err.response?.data?.msg || err.message || '网络异常';
      } else {
        errMsg = '网络异常，请稍后重试';
      }

      // 仅在客户端显示toast
      if (process.client && toast) {
        toast({ content: errMsg, theme: 'error' });
      }

      // Token过期处理（修复导航逻辑，仅在客户端执行）
      if (process.client && err.response?.status === 401) {
        tokenCookie.value = '';
        // 确保路由对象存在时再跳转
        if (route) {
          navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
        } else {
          navigateTo('/login');
        }
      }

      return Promise.reject(err);
    }
  );

  // 封装请求方法（原有逻辑不变）
  return {
    get: (url, params = {}) => service.get(url, { params }),
    post: (url, data = {}) => service.post(url, data),
    put: (url, data = {}) => service.put(url, data),
    delete: (url, params = {}) => service.delete(url, { params }),
    upload: (url, file, onProgress) => {
      // 仅在客户端处理文件上传（避免服务端FormData报错）
      if (!process.client) {
        return Promise.reject(new Error('文件上传仅支持客户端执行'));
      }
      
      const formData = new FormData();
      formData.append('file', file);
      return service.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progress) => {
          onProgress && onProgress(progress.loaded / progress.total);
        },
      });
    },
  };
}