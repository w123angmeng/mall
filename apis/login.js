// apis/login.js
import { useRequest } from '@/composables/useRequest';
import { useCookie, navigateTo, useRoute } from '#app';

/**
 * 生成注册短信验证码
 * @param {Object} params - 请求参数
 * @param {string} params.phoneNumber - 手机号
 */
export const getRegisterSmsCode = async (params) => {
  // ✅ 每个函数内部单独调用useRequest，确保上下文正确
  const { get } = useRequest();
  return await get('/sms/smsRegisterCaptcha', {
    phonenumber: params.phoneNumber
  });
  // return await get('/yp-resource/sms/smsForgetCaptcha', {
  //   phonenumber: params.phoneNumber
  // });
  
};

/**
 * 登录
 * @param {Object} data - 登录参数
 * @param {string} data.phoneNumber - 手机号
 * @param {string} data.password - 登录密码
 * @param {string} data.smsCode - 注册短信验证码
 * @param {string} data.grantType - 验证码/登录密码 password/grantType
 */
export const login = async (data) => {
  const { post } = useRequest();
  // ✅ 仅在函数内部初始化Cookie，避免顶层调用
  const tokenCookie = useCookie('user_token');
  const refreshTokenCookie = useCookie('refresh_token');
  
  const res = await post('/login', data);
  
  if (res.token && res.refreshToken) {
    tokenCookie.value = res.token;
    refreshTokenCookie.value = res.refreshToken;
  }

  return res;
};

/**
 * 注册
 * @param {Object} data - 注册参数
 * @param {string} data.phoneNumber - 手机号
 * @param {string} data.smsCode - 注册短信验证码
 * @param {string} data.password - 登录密码
 */
export const register = async (data) => {
  const { post } = useRequest();
  const tokenCookie = useCookie('user_token');
  const refreshTokenCookie = useCookie('refresh_token');
  
  const res = await post('/register', data);
  
  if (res.token && res.refreshToken) {
    tokenCookie.value = res.token;
    refreshTokenCookie.value = res.refreshToken;
  }

  return res;
};

/**
 * 注销登录
 */
export const logout = async () => {
  const { post } = useRequest();
  const tokenCookie = useCookie('user_token');
  const refreshTokenCookie = useCookie('refresh_token');
  // ✅ 仅在函数内部初始化路由，避免顶层调用
  const route = useRoute();
  
  const res = await post('/logout');
  
  tokenCookie.value = '';
  refreshTokenCookie.value = '';
  
  // ✅ 增加客户端判断，避免服务端执行导航逻辑
  if (process.client) {
    navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath));
  }

  return res;
};

/**
 * 忘记密码
 * @param {Object} data - 重置参数
 * @param {string} data.phoneNumber - 手机号
 * @param {string} data.smsCode - 验证码
 * @param {string} data.newPassword - 新密码
 */
export const forgetPassword = async (data) => {
  const { post } = useRequest();
  return await post('/forgetPassword', data);
};

/**
 * 合并未登录数据
 */
export const mergeUnloginData = async () => {
  const { post } = useRequest();
  const deviceIdCookie = useCookie('device_id');
  
  // ✅ 增加兜底，避免deviceId为空时报错
  const deviceId = deviceIdCookie.value || '';
  
  return await post('/merge', {}, {
    headers: {
      Cookie: `device_id=${deviceId}`
    }
  });
};

/**
 * 发送登录短信验证码
 * @param {Object} params - 请求参数
 * @param {string} params.phonenumber - 手机号
 * @param {string|number} params.userType - 用户类型（后端定义的类型值）
 */
export const getLoginSmsCode = async (params) => {
  const { get } = useRequest();
  return await get('/sms/smsLoginCaptcha', params);
};

/**
 * 发送忘记密码短信验证码
 * @param {Object} params - 请求参数
 * @param {string} params.phonenumber - 手机号
 * @param {string|number} params.userType - 用户类型（后端定义的类型值）
 */
export const getForgetPwdSmsCode = async (params) => {
  const { get } = useRequest();
  return await get('/sms/smsForgetCaptcha', params);
};