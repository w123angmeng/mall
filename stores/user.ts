// stores/user.ts
import { defineStore } from 'pinia';

// 注意：Nuxt 中无需手动 import { defineStore }，已通过 autoImports 自动导入
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: {
      username: '',
      phone: '',
      avatar: ''
    },
    isLogin: false
  }),
  getters: {
    userNickname: (state) => state.userInfo.username || '未登录用户'
  },
  actions: {
    login(userData: { token: string; username: string; phone: string }) {
      this.token = userData.token;
      this.userInfo.username = userData.username;
      this.userInfo.phone = userData.phone;
      this.isLogin = true;
    },
    logout() {
      this.token = '';
      this.userInfo = { username: '', phone: '', avatar: '' };
      this.isLogin = false;
    },
    async fetchUserInfo() {
      try {
        // 接口逻辑留空，先保证无报错
      } catch (err) {
        console.error('获取用户信息失败：', err);
      }
    }
  }
});