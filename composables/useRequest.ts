// composables/useRequest.ts
import axios from 'axios';
import { useRuntimeConfig, useCookie, useRoute, navigateTo, useNuxtApp } from '#app';
import { useUserStore } from '@/stores/user';

export function useRequest() {
  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();
  const route = useRoute();
  const tokenCookie = useCookie('user_token');
  let userStore = null;
  
  const baseURL = String(config.public.apiBaseUrl || '');
  // 1. 全局超时：默认5秒，可通过配置覆盖
  const defaultTimeout = config.public.requestTimeout || 5000;
  // 2. 新增：上传超时单独配置（默认60秒，可通过环境变量覆盖）
  const uploadTimeout = config.public.uploadTimeout || 60000; 
  const currentEnv = config.public.env || 'production';

  let toast = null;
  if (process.client) {
    userStore = useUserStore();
    try {
      const gp = nuxtApp?.vueApp?.config?.globalProperties;
      if (gp?.$toast) {
        toast = gp.$toast;
      } else if (gp?.$message && gp.$message.toast) {
        toast = gp.$message.toast;
      } else {
        import('tdesign-vue-next')
          .then((mod) => {
            const useToast = mod?.useToast || (mod?.default && mod.default.useToast);
            if (typeof useToast === 'function') {
              try {
                const toastInstance = useToast();
                toast = toastInstance?.toast || toastInstance;
              } catch (e) {}
            }
          })
          .catch(() => {});
      }
    } catch (e) {}
  }

  const service = axios.create({
    baseURL: baseURL || undefined,
    timeout: defaultTimeout, // 全局超时保持5秒
    headers: { 'Content-Type': 'application/json' },
  });

  // 请求拦截器（保持原有逻辑不变）
  service.interceptors.request.use(
    (req) => {
      const token = (process.client && userStore?.token) || tokenCookie.value;
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      if (process.client && currentEnv === 'development') {
        try {
          const base = service.defaults.baseURL || '';
          const finalUrl = /^https?:\/\//.test(req.url || '') ? req.url : `${base}${req.url || ''}`;
          console.debug('[useRequest] request ->', req.method?.toUpperCase(), finalUrl);
        } catch (e) {}
      }
      return req;
    },
    (err) => Promise.reject(err)
  );

  // 响应拦截器（保持原有逻辑不变）
  service.interceptors.response.use(
    (res) => {
      const respData = res?.data ?? {};
      const { code, data, msg } = respData;

      if (code === 401) {
        const authErrorMsg = msg || '认证失败，无法访问系统资源';
        if (process.client && toast) {
          try {
            if (typeof toast === 'function') {
              toast({ content: authErrorMsg, theme: 'error' });
            } else if (typeof toast === 'object' && typeof toast.show === 'function') {
              toast.show({ content: authErrorMsg, theme: 'error' });
            }
          } catch (e) {
            console.warn('[useRequest] toast调用失败:', e);
          }
        }

        if (process.client) {
          if (userStore) {
            userStore.clearUserStorage();
          }
          tokenCookie.value = '';
          if (route && route.fullPath !== '/login') {
            navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
          } else {
            navigateTo('/login');
          }
        }

        const err = new Error(authErrorMsg);
        (err as any).code = code;
        (err as any).data = data;
        return Promise.reject(err);
      }

      if (code === 200) {
        return respData;
      }

      const backendMsg = msg || '业务错误';
      if (process.client && toast) {
        try {
          if (typeof toast === 'function') {
            toast({ content: backendMsg, theme: 'error' });
          } else if (typeof toast === 'object' && typeof toast.show === 'function') {
            toast.show({ content: backendMsg, theme: 'error' });
          }
        } catch (e) {}
      }

      const err = new Error(backendMsg);
      (err as any).code = code;
      (err as any).data = data;
      return Promise.reject(err);
    },
    (axiosErr) => {
      let errMsg = '网络异常，请稍后重试';
      const serverResp = axiosErr?.response?.data;
      if (serverResp && typeof serverResp === 'object') {
        errMsg = serverResp.msg || serverResp.message || errMsg;
      } else if (process.client && currentEnv === 'development') {
        errMsg = axiosErr?.response?.data?.msg || axiosErr.message || errMsg;
      }

      if (process.client && toast) {
        try {
          if (typeof toast === 'function') {
            toast({ content: errMsg, theme: 'error' });
          } else if (typeof toast === 'object' && typeof toast.show === 'function') {
            toast.show({ content: errMsg, theme: 'error' });
          }
        } catch (e) {}
      }

      console.log('====process.client:', process.client, axiosErr?.response?.status, axiosErr)
      if (process.client && axiosErr?.response?.status === 401) {
        if (userStore) {
          userStore.clearUserStorage();
        }
        tokenCookie.value = '';
        if (route && route.fullPath !== '/login') {
          navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
        } else {
          navigateTo('/login');
        }
      }

      const err = new Error(errMsg);
      (err as any).original = axiosErr;
      return Promise.reject(err);
    }
  );

  return {
    get: (url, params = {}) => service.get(url, { params }),
    post: (url, data = {}) => service.post(url, data),
    put: (url, data = {}) => service.put(url, data),
    delete: (url, params = {}) => service.delete(url, { params }),
    // 3. 核心修改：上传方法添加单独的超时配置
    upload: (url, file, onProgress) => {
      if (!process.client) {
        return Promise.reject(new Error('文件上传仅支持客户端执行'));
      }
      // const formData = new FormData();
      // formData.append('avatarfile', file);
      return service.post(url, file, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: uploadTimeout, // 覆盖全局超时，使用60秒上传超时
        onUploadProgress: (progress) => {
          onProgress && onProgress(progress.loaded / progress.total);
        },
      });
    },
    // 可选：暴露自定义超时的请求方法，方便其他场景复用
    requestWithTimeout: (config) => {
      return service.request({
        ...config,
        timeout: config.timeout || defaultTimeout
      });
    }
  };
}