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
            <img src="~/assets/images/user-avatar.png" alt="用户头像" class="user-avatar" />
            <p class="account-name">账号名称</p>
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
import { Breadcrumb, BreadcrumbItem } from 'tdesign-vue-next';
import { ref, computed } from 'vue';

// 子内容组件
import AccountManage from '~/components/user/AccountManage.vue';
import AuthManage from '~/components/user/AuthManage.vue';
import OrderManage from '~/components/user/OrderManage.vue';
import AddressManage from '~/components/user/AddressManage.vue';
import InvoiceManage from '~/components/user/InvoiceManage.vue';
import CreditManage from '~/components/user/CreditManage.vue';

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
      }

      .account-name {
        font-size: 14px;
        color: #333;
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