// stores/user.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUserApi } from '@/apis/user'; // 导入重构后的用户API

export const useUserStore = defineStore('user', () => {
  // ========== 核心状态 ==========
  // 完整用户信息（包含token、个人资料等）
  const userInfo = ref(null);
  // 加载状态
  const isLoading = ref(false);
  // 用户API实例（延迟初始化）
  let userApi = null;

  // ========== 计算属性（导出token等关键信息） ==========
  /**
   * 获取用户token（对外暴露）
   * @returns {string|null}
   */
  const token = computed(() => {
    return userInfo.value?.token || null;
  });

  /**
   * 获取刷新token
   * @returns {string|null}
   */
  const refreshToken = computed(() => {
    return userInfo.value?.refreshToken || null;
  });

  /**
   * 获取用户手机号
   * @returns {string|null}
   */
  const phone = computed(() => {
    return userInfo.value?.phone || null;
  });

  /**
   * 获取用户ID
   * @returns {string|number|null}
   */
  const userId = computed(() => {
    return userInfo.value?.userId || null;
  });

  // ========== 本地存储核心方法 ==========
  /**
   * 从本地存储加载用户信息
   */
  const loadUserFromStorage = () => {
    if (process.client) {
      try {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          userInfo.value = JSON.parse(storedUser);
        }
      } catch (e) {
        console.error('解析用户信息失败', e);
        localStorage.removeItem('userInfo');
        userInfo.value = null;
      }
    }
  };

  /**
   * 保存用户信息到本地存储
   * @param {Object} userData - 用户数据
   */
  const saveUserToStorage = (userData) => {
    if (process.client && userData) {
      userInfo.value = { ...userInfo.value, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
    }
  };

  /**
   * 清除本地存储的用户信息
   */
  const clearUserStorage = () => {
    if (process.client) {
      localStorage.removeItem('userInfo');
      userInfo.value = null;
    }
  };

  // ========== 初始化API实例 ==========
  /**
   * 延迟初始化用户API（确保在setup环境中）
   */
  const initUserApi = () => {
    if (!userApi && process.client) {
      userApi = getUserApi();
    }
  };

  // ========== 核心业务逻辑 ==========
  /**
   * 登录后初始化用户信息
   * @param {Object} loginRes - 登录接口返回的基础数据
   * @param {string} loginRes.token - 登录token
   * @param {string} [loginRes.refreshToken] - 刷新token
   * @param {string} [loginRes.phone] - 手机号
   * @returns {Promise<boolean>}
   */
  const initUserInfo = async (loginRes) => {
    if (!loginRes?.token) {
      console.error('初始化用户信息失败：缺少token');
      return false;
    }

    try {
      isLoading.value = true;
      initUserApi(); // 初始化API

      // 1. 先保存登录返回的基础信息
      saveUserToStorage({
        token: loginRes.token,
        refreshToken: loginRes.refreshToken || '',
        phone: loginRes.phone || '',
        loginTime: new Date().getTime() // 记录登录时间
      });

      // 2. 获取用户详细信息并合并
      const profileRes = await userApi.getUserProfile();
      if (profileRes?.data) {
        saveUserToStorage({
          userId: profileRes.data.userId,
          realName: profileRes.data.realName,
          avatar: profileRes.data.avatar,
          enterpriseName: profileRes.data.enterpriseName,
          creditCode: profileRes.data.creditCode,
          ...profileRes.data // 合并所有用户资料
        });
      }

      return true;
    } catch (error) {
      console.error('获取用户详情失败', error);
      clearUserStorage(); // 失败则清除信息
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 登出操作
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      isLoading.value = true;
      initUserApi();
      // 这里可扩展：调用登出接口（如果有）
      // await userApi.logout();
    } catch (error) {
      console.error('登出接口调用失败', error);
    } finally {
      clearUserStorage(); // 强制清除本地数据
      isLoading.value = false;
    }
  };

  /**
   * 更新用户头像
   * @param {Object} params - 上传参数
   * @param {File} params.file - 头像文件
   * @param {Function} [params.onProgress] - 上传进度回调
   * @returns {Promise<boolean>}
   */
  const updateUserAvatar = async (params) => {
    if (!params?.file) {
      console.error('更新头像失败：缺少文件');
      return false;
    }

    try {
      isLoading.value = true;
      initUserApi();
      const res = await userApi.updateUserAvatar(params);
      
      if (res?.data?.avatarUrl) {
        // 更新本地用户信息
        saveUserToStorage({
          avatar: res.data.avatarUrl
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新头像失败', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 修改手机号
   * @param {Object} data - 修改参数
   * @param {string} data.phoneNumber - 新手机号
   * @param {string} data.smsCode - 验证码
   * @returns {Promise<boolean>}
   */
  const updateUserPhone = async (data) => {
    if (!data?.phoneNumber || !data?.smsCode) {
      console.error('修改手机号失败：参数不完整');
      return false;
    }

    try {
      isLoading.value = true;
      initUserApi();
      await userApi.updateUserPhone(data);
      
      // 更新本地手机号
      saveUserToStorage({
        phone: data.phoneNumber
      });
      return true;
    } catch (error) {
      console.error('修改手机号失败', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 修改密码
   * @param {Object} data - 修改参数
   * @param {string} data.phoneNumber - 绑定手机号
   * @param {string} data.smsCode - 验证码
   * @param {string} data.newPassword - 新密码
   * @returns {Promise<boolean>}
   */
  const updateUserPassword = async (data) => {
    if (!data?.phoneNumber || !data?.smsCode || !data?.newPassword) {
      console.error('修改密码失败：参数不完整');
      return false;
    }

    try {
      isLoading.value = true;
      initUserApi();
      await userApi.updateUserPassword(data);
      return true;
    } catch (error) {
      console.error('修改密码失败', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 更新用户信息（通用方法）
   * @param {Object} newData - 新的用户信息
   */
  const updateUserInfo = (newData) => {
    if (userInfo.value && newData) {
      saveUserToStorage(newData);
    }
  };

  /**
   * 检查用户是否已登录
   * @returns {Boolean}
   */
  const isLoggedIn = () => {
    return !!token.value; // 使用计算属性判断
  };

  // ========== 初始化 ==========
  // 页面加载时从本地存储恢复用户信息
  loadUserFromStorage();

  // ========== 对外暴露的状态和方法 ==========
  return {
    // 原始状态
    userInfo,
    isLoading,
    // 计算属性（导出token等关键信息）
    token,
    refreshToken,
    phone,
    userId,
    // 核心方法
    initUserInfo,
    logout,
    updateUserInfo,
    updateUserAvatar,
    updateUserPhone,
    updateUserPassword,
    isLoggedIn,
    clearUserStorage
  };
});