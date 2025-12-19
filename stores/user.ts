// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUserApi } from '@/apis/user'; 
import { logoutApi } from '@/apis/login';

// 定义用户信息类型
interface UserInfo {
  token: string;
  refreshToken?: string;
  phone: string;
  userId: string | number;
  loginTime: number;
  realName?: string;
  avatar?: string;
  enterpriseName?: string;
  creditCode?: string;
  [key: string]: any;
}

export const useUserStore = defineStore('user', () => {
  // ========== 核心状态 ==========
  const userInfo = ref<UserInfo | null>(null);
  const isLoading = ref<boolean>(false);
  let userApi: ReturnType<typeof getUserApi> | null = null;

  // ========== 计算属性 ==========
  const token = computed(() => userInfo.value?.token || null);
  const refreshToken = computed(() => userInfo.value?.refreshToken || null);
  const phone = computed(() => userInfo.value?.phone || null);
  const userId = computed(() => userInfo.value?.userId || null);
  const avatar = computed(() => userInfo.value?.avatar || null);
  const isLoggedIn = computed(() => !!token.value);

  // ========== 本地存储方法 ==========
  const loadUserFromStorage = () => {
    if (process.client) {
      try {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) userInfo.value = JSON.parse(storedUser) as UserInfo;
      } catch (e) {
        console.error('解析用户信息失败', e);
        localStorage.removeItem('userInfo');
        userInfo.value = null;
      }
    }
  };

  const saveUserToStorage = (userData: Partial<UserInfo>) => {
	 console.log('saveUserToStorage : userInfo.value:', userInfo.value, userData)
    if (process.client && userData) {
      userInfo.value = { ...userInfo.value, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
    }
  };

  const clearUserStorage = () => {
    if (process.client) {
      localStorage.removeItem('userInfo');
      userInfo.value = null;
    }
  };

  // ========== 初始化API ==========
  const initUserApi = () => {
    if (!userApi && process.client) userApi = getUserApi();
  };

  // ========== 核心业务逻辑 ==========
  /** 登录后初始化用户信息 */
  const initUserInfo = async (loginRes: { token: string; refreshToken?: string; phone?: string }) => {
    if (!loginRes?.token) {
      console.error('初始化用户信息失败：缺少Token');
      return false;
    }

    try {
      isLoading.value = true;
      initUserApi();
      saveUserToStorage({
        token: loginRes.token,
        refreshToken: loginRes.refreshToken || '',
        phone: loginRes.phone || '',
        loginTime: new Date().getTime(),
		avatar: 'https://bjyp-mall-public.oss-cn-beijing.aliyuncs.com/default-avatar.png',
      });

      if (userApi) {
        const profileRes = await userApi.getUserProfile();
        if (profileRes?.data) saveUserToStorage({ ...profileRes.data, avatar: profileRes.data.avatar || userInfo.value?.avatar || 'https://bjyp-mall-public.oss-cn-beijing.aliyuncs.com/default-avatar.png',});
      }
      return true;
    } catch (error) {
      console.error('初始化用户详情失败', error);
      clearUserStorage();
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /** 登出操作 */
  const logout = async () => {
    try {
      isLoading.value = true;
      initUserApi();
      await logoutApi().catch(err => console.error('后端登出失败', err));
    } catch (error) {
      console.error('登出异常', error);
    } finally {
      clearUserStorage();
      isLoading.value = false;
    }
  };

  /** 唯一刷新用户信息的方法（页面层修改数据后统一调用） */
  const refreshUserProfile = async (): Promise<boolean> => {
    if (!token.value) {
      console.error('刷新用户信息失败：未登录');
      return false;
    }

    try {
      isLoading.value = true;
      initUserApi();
      if (!userApi) return false;

      const profileRes = await userApi.getUserProfile();
      if (profileRes?.data) {
        // 全量覆盖更新用户信息（保证和后端一致）
        saveUserToStorage({
          ...profileRes.data,
          phone: profileRes.data.phoneNumber || profileRes.data.phone || userInfo.value?.phone,
		  avatar: profileRes.data.avatar || userInfo.value?.avatar || 'https://bjyp-mall-public.oss-cn-beijing.aliyuncs.com/default-avatar.png',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('刷新用户信息失败', error);
      if (error.message?.includes('token')) await logout();
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /** 通用更新用户信息（可选，手动局部更新） */
  const updateUserInfo = (newData: Partial<UserInfo>) => {
    if (userInfo.value && newData) saveUserToStorage(newData);
  };
  
  
  // ========== 初始化 ==========
  loadUserFromStorage();

  // ========== 对外暴露 ==========
  return {
    userInfo,
    isLoading,
    token,
    refreshToken,
    phone,
    userId,
    avatar,
    isLoggedIn,
    initUserInfo,
    logout,
    refreshUserProfile, // 核心：页面层修改数据后调用此方法刷新
    updateUserInfo,
    clearUserStorage,
  };
});