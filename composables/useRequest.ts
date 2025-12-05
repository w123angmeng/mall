// composables/useRequest.ts
import axios from 'axios';
import { useRuntimeConfig, useCookie, useRoute, navigateTo, useNuxtApp } from '#app';
import { useUserStore } from '@/stores/user'; // 导入用户Store

export function useRequest() {
  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();
  const route = useRoute();
  // 兼容旧逻辑：优先使用Store的token，其次使用cookie（兜底）
  const tokenCookie = useCookie('user_token');
  // 初始化用户Store（延迟获取，避免服务端报错）
  let userStore = null;
  
  // baseURL 从 runtimeConfig 读取（开发可为 /prod-api，生产为真实域）
  const baseURL = String(config.public.apiBaseUrl || '');
  const timeout = config.public.requestTimeout || 5000;
  const currentEnv = config.public.env || 'production';

  // 兼容 TDesign toast/message（可选）
  let toast = null;
  if (process.client) {
    // 客户端环境下初始化Store
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
              } catch (e) {
                // ignore
              }
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  }

  const service = axios.create({
    baseURL: baseURL || undefined,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器：添加 token 等（核心优化：优先从Store获取token）
  service.interceptors.request.use(
    (req) => {
      // ========== 核心修改：获取token的优先级 ==========
      // 1. 优先使用Store中的token（最新的登录状态）
      // 2. 其次使用cookie中的token（兼容旧逻辑）
      const token = (process.client && userStore?.token) || tokenCookie.value;
      
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      
      // 开发环境可打印最终请求（便于调试）
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

  // 响应拦截器：关键改动在这里 —— 保留后端返回的 msg 到抛出的 Error.message 中
  service.interceptors.response.use(
    (res) => {
      // 约定后端响应结构：{ code, data, msg }
      const respData = res?.data ?? {};
      const { code, data, msg } = respData;

      // 业务成功
      if (code === 200) {
        return respData;
      }

      // 后端返回业务错误（比如验证码错误），把后端 msg 作为 Error.message 抛出
      const backendMsg = msg || '业务错误';
      // 在客户端显示 toast（可选）
      if (process.client && toast) {
        try {
          if (typeof toast === 'function') {
            toast({ content: backendMsg, theme: 'error' });
          } else if (typeof toast === 'object' && typeof toast.show === 'function') {
            toast.show({ content: backendMsg, theme: 'error' });
          }
        } catch (e) {
          // ignore toast 调用异常
        }
      }

      // 构造 Error 并附带后端原始信息，业务调用处可直接读取 error.message
      const err = new Error(backendMsg);
      // 附带更多上下文，方便上层判断
      (err as any).code = code;
      (err as any).data = data;
      return Promise.reject(err);
    },
    (axiosErr) => {
      // 网络或 Axios 层错误
      let errMsg = '网络异常，请稍后重试';
      // 若后端在 err.response.data 中返回了结构化信息，优先取后端 msg
      const serverResp = axiosErr?.response?.data;
      if (serverResp && typeof serverResp === 'object') {
        errMsg = serverResp.msg || serverResp.message || errMsg;
      } else if (process.client && currentEnv === 'development') {
        // 开发环境下显示更详细的错误
        errMsg = axiosErr?.response?.data?.msg || axiosErr.message || errMsg;
      }

      // 客户端显示 toast（若可用）
      if (process.client && toast) {
        try {
          if (typeof toast === 'function') {
            toast({ content: errMsg, theme: 'error' });
          } else if (typeof toast === 'object' && typeof toast.show === 'function') {
            toast.show({ content: errMsg, theme: 'error' });
          }
        } catch (e) {}
      }

      // 处理 401（token 过期）跳转登录（仅客户端）
      if (process.client && axiosErr?.response?.status === 401) {
        // ========== 核心修改：401时清除Store和Cookie的token ==========
        // 1. 清除Store中的用户信息
        if (userStore) {
          userStore.clearUserStorage();
        }
        // 2. 清除Cookie中的token（兼容旧逻辑）
        tokenCookie.value = '';
        
        // 跳转到登录页，携带当前路径
        if (route && route.fullPath !== '/login') {
          navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
        } else {
          navigateTo('/login');
        }
      }

      // 抛出一个 Error，message 为后端或网络层可读信息
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
    upload: (url, file, onProgress) => {
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