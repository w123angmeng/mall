<template>
  <div>
    <!-- 顶部导航条（数组渲染菜单） -->
    <div class="top-nav-bar">
      <div class="top-nav-container">
        <!-- 左侧菜单（数组循环） -->
        <div class="top-nav-left">
          <NuxtLink 
            v-for="menu in leftMenuList" 
            :key="menu.key"
            :to="menu.path"
            class="nav-item"
            :class="{ active: isMenuActive(menu.path) }"
          >
            {{ menu.name }}
          </NuxtLink>
        </div>

        <!-- 右侧菜单（数组循环） -->
        <div class="top-nav-right">
          <NuxtLink 
            v-for="menu in rightMenuList" 
            :key="menu.key"
            :to="menu.path"
            class="nav-item"
            :class="[
              { active: isMenuActive(menu.path) },
              menu.key === 'cart' ? 'cart-item' : ''
            ]"
          >
            <!-- 购物车特殊处理：显示图标 -->
            <i class="cart-icon" v-if="menu.key === 'cart'">🛒</i>
            {{ menu.name }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 中间Logo+搜索区（保留原有逻辑） -->
    <div class="logo-search-bar">
      <div class="logo-search-container">
        <div class="logo">
          <img src="~/assets/images/logo.png" alt="严牌商城" />
        </div>
        <div class="search-wrapper" @click.stop>
          <input
			v-model="searchKeyword" 
            type="text"
            placeholder="搜索"
            class="search-input"
            :class="{ focused: isSearchFocused }"
            @focus="isSearchFocused = true"
            @blur="hideSearchPopup"
          />
          <button class="search-btn" @click="handleSearch">搜索</button>

          <!-- 搜索弹窗 -->
          <div class="search-popup" v-if="isSearchFocused">
            <div class="popup-section">
              <div class="section-header">
                <span class="section-title">最近搜索</span>
                <button class="delete-btn" @click="clearRecentSearch">删除</button>
              </div>
              <div class="tag-group">
                <span class="tag-item" v-for="item in recentSearch" :key="item">{{ item }}</span>
              </div>
            </div>
            <div class="popup-section">
              <div class="section-header">
                <span class="section-title">推荐搜索</span>
              </div>
              <div class="tag-group">
                <span class="tag-item" v-for="(item, idx) in recommendSearch" :key="idx">
                  <i class="search-icon">🔍</i>{{ item }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>

<script setup>
import { ref } from 'vue';
// 🔥 关键修复：导入Nuxt3的路由钩子
import { useRoute, useRouter } from 'vue-router';

// 🔥 获取路由对象（替代原来的$route）
const route = useRoute();
const router = useRouter();

const searchKeyword = ref('');

// 搜索提交：跳转到搜索页面并携带关键字
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value } });
  }
};
// 1. 左侧导航菜单数组
const leftMenuList = ref([
  { key: 'home', name: '首页', path: '/' },
  { key: 'official', name: '严牌官网', path: '/official' }
]);

// 2. 右侧导航菜单数组
const rightMenuList = ref([
  { key: 'login', name: '登录', path: '/login' },
  { key: 'register', name: '注册', path: '/register' },
  { key: 'user', name: '个人中心', path: '/user' },
  { key: 'contact', name: '联系客服', path: '/contact' },
  { key: 'cart', name: '购物车', path: '/cart' }
]);

// 3. 菜单激活判断方法（修正：用route替代$route）
const isMenuActive = (path) => {
  // 个人中心子路由也高亮
  if (path === '/user') {
    return route.path.startsWith('/user');
  }
  // 其他菜单精确匹配
  return route.path === path;
};

// 搜索相关逻辑
const isSearchFocused = ref(false);
const recentSearch = ref(['商品01', '商品02', '商品03']);
const recommendSearch = ref(Array(14).fill('热搜商品01'));

const hideSearchPopup = () => {
  setTimeout(() => { isSearchFocused.value = false; }, 200);
};
const clearRecentSearch = () => { recentSearch.value = []; };
</script>

<style lang="scss" scoped>
/* 样式部分完全不变，省略（和上一版一致） */
.top-nav-bar {
  background-color: #ffffff;
  border-bottom: 1px solid #eee;
  padding: 8px 0;

  .top-nav-container {
    width: 1200px;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .nav-item {
      color: #666;
      text-decoration: none;
      font-size: 14px;
      margin: 0 8px;

      &.active, &:hover { color: #3799AE; }
      &.cart-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        .cart-icon { font-size: 16px; padding-right: 4px;}
      }
    }
  }
}

.logo-search-bar {
  padding: 15px 0;
  border-bottom: 1px solid #eee;

  .logo-search-container {
    width: 1200px;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      img { width: 130px; height: 42px; }
    }

    .search-wrapper {
      width: 1000px;
      position: relative;

      .search-input {
        width: 100%;
        height: 36px;
        padding: 0 12px;
        border: 1px solid #ECEEF2;
        border-radius: 4px;
        outline: none;
        &.focused { border-color: #3799AE; }
      }

      .search-btn {
        position: absolute;
        right: 10px;
        top: 5px;
        height: 26px;
        width: 46px;
        background: #E1F5F9;
        color: #3799AF;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .search-popup {
        position: absolute;
        top: 42px;
        left: 0;
        width: 100%;
        background: #fff;
        border: 1px solid #ECEEF2;
        padding: 15px;
        z-index: 99;

        .popup-section {
          margin-bottom: 15px;
          .section-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .section-title { font-size: 14px; font-weight: 500; }
            .delete-btn {
              background: transparent;
              border: none;
              color: #3799AF;
              font-size: 14px;
              font-weight: normal;
              line-height: 14px;
              cursor: pointer;
            }
          }

          .tag-group {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;

            .tag-item {
              width: 167px;
              height: 30px;
              line-height: 30px;
              padding: 0 12px;
              background: #F3F3F3;
              border-radius: 30px;
              font-size: 12px;
              color: #666;
              cursor: pointer;
              text-align: center;

              .search-icon {
                margin-right: 5px;
              }

              &:hover {
                background: #e6f2f5;
                color: #3799AE;
              }
            }
          }
        }
      }
    }
  }
}
</style>