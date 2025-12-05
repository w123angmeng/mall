<template>
  <div>
    <!-- 公共头部 -->
    <Header />

    <!-- 主体内容（宽度1200px 水平居中） -->
    <main class="user-center-container">
      <!-- 面包屑 -->
      <t-breadcrumb class="bread-crumb">
        <t-breadcrumb-item>
          <NuxtLink to="/">首页</NuxtLink>
        </t-breadcrumb-item>
        <t-breadcrumb-item>个人中心</t-breadcrumb-item>
      </t-breadcrumb>

      <!-- 左侧菜单 + 右侧内容区（间距20px） -->
      <div class="user-content-wrapper">
        <!-- 左侧菜单（样式精细化） -->
        <aside class="user-sidebar">
          <!-- 头像+账号名称 -->
          <div class="user-avatar-wrap">
            <!-- 核心：优先使用Store中的头像，无则使用默认头像 -->
            <img 
              :src="userAvatar" 
              alt="用户头像" 
              class="user-avatar" 
              @error="handleAvatarError"
            />
            <!-- 核心：优先使用Store中的昵称/手机号，无则显示默认文本 -->
            <p class="account-name">{{ userName || '账号名称' }}</p>
          </div>
          <!-- 分割线 -->
          <div class="menu-divider"></div>

          <!-- 菜单列表（数组循环） -->
          <ul class="menu-list">
            <li 
              class="menu-item"
              :class="{ active: activeMenu === menu.key }"
              @click="activeMenu = menu.key"
              v-for="menu in menuList" 
              :key="menu.key"
            >
              {{ menu.name }}
            </li>
          </ul>
        </aside>

        <!-- 右侧内容区域 -->
        <div class="user-main-content">
          <component :is="currentComponent" />
        </div>
      </div>
    </main>

    <!-- 公共尾部 -->
    <Footer />
  </div>
</template>

<script setup>
import Header from '~/components/common/Header.vue';
import Footer from '~/components/common/Footer.vue';
import { Breadcrumb, BreadcrumbItem, Message } from 'tdesign-vue-next';
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { navigateTo } from '#app';

// 子内容组件
import AccountManage from '~/components/user/AccountManage.vue';
import AuthManage from '~/components/user/AuthManage.vue';
import OrderManage from '~/components/user/OrderManage.vue';
import AddressManage from '~/components/user/AddressManage.vue';
import InvoiceManage from '~/components/user/InvoiceManage.vue';
import CreditManage from '~/components/user/CreditManage.vue';

// 初始化用户Store
const userStore = useUserStore();

// 菜单数组
const menuList = ref([
  { key: 'account', name: '账号管理' },
  { key: 'auth', name: '认证管理' },
  { key: 'order', name: '我的订单' },
  { key: 'address', name: '地址管理' },
  { key: 'invoice', name: '发票管理' },
  { key: 'credit', name: '授信情况' }
]);

// 当前激活菜单
const activeMenu = ref(menuList.value[0].key);

// 组件映射
const componentMap = {
  account: AccountManage,
  auth: AuthManage,
  order: OrderManage,
  address: AddressManage,
  invoice: InvoiceManage,
  credit: CreditManage
};

// 动态组件
const currentComponent = computed(() => componentMap[activeMenu.value] || AccountManage);

// ========== 核心：从Store获取用户信息 ==========
/**
 * 计算用户头像（优先使用Store中的头像，无则使用默认头像）
 */
const userAvatar = computed(() => {
  // 1. Store中有头像且有效，使用Store中的头像
  if (userStore.userInfo?.avatar && userStore.userInfo.avatar.trim()) {
    return userStore.userInfo.avatar;
  }
  // 2. 否则使用默认头像
  return '/images/user-avatar.png'; // Nuxt中~/会被解析为根目录，直接用/assets更稳定
});

/**
 * 计算用户名称（优先显示真实姓名，其次手机号，最后空）
 */
const userName = computed(() => {
  if (!userStore.userInfo) return '';
  
  // 1. 优先显示真实姓名
  if (userStore.userInfo.realName && userStore.userInfo.realName.trim()) {
    return userStore.userInfo.realName;
  }
  // 2. 其次显示手机号（脱敏处理）
  if (userStore.phone) {
    return userStore.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  // 3. 无信息则返回空
  return '';
});

// ========== 辅助方法 ==========
/**
 * 头像加载失败时的处理（兜底显示默认头像）
 */
const handleAvatarError = (e) => {
  // e.target.src = '/images/user-avatar.png';
  e.target.src = '';
};

/**
 * 页面挂载时校验登录状态
 */
onMounted(() => {
  // 客户端环境下校验
  if (process.client) {
    // 未登录则跳转到登录页
    if (!userStore.isLoggedIn()) {
      Message.warning('请先登录');
      navigateTo({
        path: '/login',
        query: { redirect: '/user-center' } // 登录后跳转回个人中心
      });
      return;
    }

    // 已登录但用户信息不完整，尝试重新获取
    if (userStore.isLoggedIn() && !userStore.userInfo?.realName && !userStore.phone) {
      Message.info('正在加载用户信息...');
      // 可扩展：重新调用获取用户信息接口
      // userStore.initUserInfo({ token: userStore.token }).catch(() => {
      //   Message.error('用户信息加载失败，请重新登录');
      //   userStore.logout();
      //   navigateTo('/login');
      // });
    }
  }
});
</script>

<style lang="scss" scoped>
.user-center-container {
  width: 1200px;
  margin: 20px auto;
  padding: 0;

  // 面包屑
  .bread-crumb {
    margin-bottom: 20px;
    font-size: 14px;
    color: #666;
  }

  // 内容容器（左侧+右侧间距20px）
  .user-content-wrapper {
    display: flex;
    gap: 20px;
    width: 100%;
  }

  // 左侧菜单
  .user-sidebar {
    width: 164px;
    height: 600px;
    border-radius: 14px;
    background: #FFFFFF;
    padding: 20px 0;
    box-sizing: border-box;

    // 头像区域
    .user-avatar-wrap {
      text-align: center;
      margin-bottom: 16px;
      padding: 0 20px;

      .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 8px;
        // 增加边框，提升视觉效果
        border: 1px solid #ECEEF2;
      }

      .account-name {
        font-size: 14px;
        color: #333;
        margin: 0; // 清除默认margin
      }
    }

    // 分割线
    .menu-divider {
      width: 164px;
      height: 1px;
      background: #ECEEF2;
      margin-bottom: 20px;
    }

    // 菜单列表
    .menu-list {
      list-style: none;
      padding: 0 0px;
      margin: 0;
	  text-align: center;

      .menu-item {
        height: 52px;
        line-height: 52px;
        padding: 0 15px;
        font-size: 14px;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;

        // 激活状态
        &.active {
          background: rgba(55, 153, 174, 0.05);
          color: #3799AE;
          font-weight: 500;

          // 左侧伪元素标识
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 3px;
            height: 52px;
            background: #3799AE;
          }
        }

        &:hover:not(.active) {
          color: #3799AE;
        }
      }
    }
  }

  // 右侧内容区
  .user-main-content {
    flex: 1;
    background: #FFFFFF;
    border-radius: 14px;
    padding: 24px;
    min-height: 600px;
  }
}
</style>