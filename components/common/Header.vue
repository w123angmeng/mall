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

        <!-- 右侧菜单（根据登录状态动态渲染） -->
        <div class="top-nav-right">
          <!-- 未登录：显示登录、注册按钮 -->
          <template v-if="!userStore?.userInfo?.token">
            <NuxtLink 
              v-for="menu in unLoginMenuList" 
              :key="menu.key"
              :to="menu.path"
              class="nav-item"
              :class="{ active: isMenuActive(menu.path) }"
            >
              {{ menu.name }}
            </NuxtLink>
          </template>
          
          <!-- 已登录：显示脱敏昵称 + 其他菜单（隐藏登录/注册） -->
          <template v-else>
            <!-- 脱敏昵称展示 -->
            <span class="nav-item nickname-item">
              {{ formatNickname(userStore?.userInfo?.userName || '') }}
            </span>
            
            <!-- 其他菜单（个人中心、客服、购物车） -->
            <NuxtLink 
              v-for="menu in loggedMenuList" 
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
          </template>
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
            @focus="handleSearchFocus"
            @blur="hideSearchPopup"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">搜索</button>

          <!-- 搜索弹窗 -->
          <div class="search-popup" v-if="isSearchFocused">
            <div class="popup-section">
              <div class="section-header">
                <span class="section-title">最近搜索</span>
                <button 
                  class="delete-btn" 
                  @click="clearRecentSearch"
                  :disabled="!recentSearch.length || isDeleting"
                >
                  {{ isDeleting ? '删除中...' : '删除' }}
                </button>
              </div>
              <div class="tag-group" v-if="recentSearch.length">
                <!-- 点击最近搜索标签触发跳转 -->
                <span 
                  class="tag-item" 
                  v-for="item in recentSearch" 
                  :key="item"
                  @click="handleTagClick(item)"
                >
                  {{ item }}
                </span>
              </div>
              <div class="empty-tip" v-else>暂无最近搜索记录</div>
            </div>
            <div class="popup-section">
              <div class="section-header">
                <span class="section-title">推荐搜索</span>
              </div>
              <div class="tag-group" v-if="recommendSearch.length">
                <!-- 点击推荐搜索标签触发跳转 -->
                <span 
                  class="tag-item" 
                  v-for="(item, idx) in recommendSearch" 
                  :key="idx"
                  @click="handleTagClick(item)"
                >
                  <i class="search-icon">🔍</i>{{ item }}
                </span>
              </div>
              <div class="empty-tip" v-else>暂无推荐搜索</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getGoodApi } from '@/apis/good';
import { MessagePlugin } from 'tdesign-vue-next';

// 获取路由对象
const route = useRoute();
const router = useRouter();
// 初始化用户Store
const userStore = useUserStore();
// 初始化商品API
const goodApi = getGoodApi();

const searchKeyword = ref('');

// 搜索提交：跳转到搜索页面并携带关键字
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value } });
  }
};

// 新增：点击搜索标签（最近/推荐）触发跳转
const handleTagClick = (keyword) => {
  // 填充关键词到搜索框
  searchKeyword.value = keyword;
  // 跳转到搜索页
  router.push({ path: '/search', query: { keyword } });
  // 隐藏搜索弹窗
  isSearchFocused.value = false;
};

// 1. 左侧导航菜单数组
const leftMenuList = ref([
  { key: 'home', name: '首页', path: '/' },
  { key: 'official', name: '严牌官网', path: '/official' }
]);

// 2. 未登录时显示的右侧菜单（登录、注册）
const unLoginMenuList = ref([
  { key: 'login', name: '登录', path: '/login' },
  { key: 'register', name: '注册', path: '/register' },
  { key: 'contact', name: '联系客服', path: '/contact' },
  { key: 'cart', name: '购物车', path: '/cart' }
]);

// 3. 已登录时显示的右侧菜单（隐藏登录/注册）
const loggedMenuList = ref([
  { key: 'user', name: '个人中心', path: '/user' },
  { key: 'contact', name: '联系客服', path: '/contact' },
  { key: 'cart', name: '购物车', path: '/cart' }
]);

// 4. 菜单激活判断方法
const isMenuActive = (path) => {
  // 个人中心子路由也高亮
  if (path === '/user') {
    return route.path.startsWith('/user');
  }
  // 其他菜单精确匹配
  return route.path === path;
};

// 5. 昵称脱敏格式化（修正后的核心逻辑）
const formatNickname = (nickname) => {
  if (!nickname) return '未设置';
  
  const len = nickname.length;
  if (len <= 4) {
    if (len === 1) {
      return '*';
    }
    return `${nickname.substring(0, len - 1)}*`;
  }
  return `${nickname.substring(0, 4)}***`;
};

// 搜索相关逻辑
const isSearchFocused = ref(false);
const recentSearch = ref([]); // 最近搜索（从接口获取）
const recommendSearch = ref([]); // 推荐搜索（从接口获取）
const isDeleting = ref(false); // 删除加载状态
const isLoadingSearch = ref(false); // 搜索数据加载状态

// 隐藏搜索弹窗
const hideSearchPopup = () => {
  setTimeout(() => { isSearchFocused.value = false; }, 200);
};

// 获取最近搜索记录
const getRecentSearch = async () => {
  try {
    isLoadingSearch.value = true;
    const res = await goodApi.getRecentSearchKeywords();
    if (res.code === 200 && Array.isArray(res.data)) {
      recentSearch.value = res.data;
    } else {
      recentSearch.value = ['商品01', '商品02', '商品03']; // 兜底数据
    }
  } catch (err) {
    console.error('获取最近搜索失败：', err);
    recentSearch.value = ['商品01', '商品02', '商品03']; // 兜底数据
    MessagePlugin.warning('获取最近搜索记录失败，显示默认数据');
  } finally {
    isLoadingSearch.value = false;
  }
};

// 获取推荐搜索分类
const getRecommendSearch = async () => {
  try {
    const res = await goodApi.getRecommendCategories();
    if (res.code === 200 && Array.isArray(res.data)) {
      // 若接口返回分类名称数组，直接使用；若返回对象数组，取name/title字段
      recommendSearch.value = res.data.map(item => {
        if (typeof item === 'object') {
          return item.categoryName || item.title || item.name;
        }
        return item;
      });
    } else {
      recommendSearch.value = Array(14).fill('热搜商品01'); // 兜底数据
    }
  } catch (err) {
    console.error('获取推荐搜索失败：', err);
    recommendSearch.value = Array(14).fill('热搜商品01'); // 兜底数据
    MessagePlugin.warning('获取推荐搜索失败，显示默认数据');
  }
};

// 搜索框聚焦时加载数据
const handleSearchFocus = async () => {
  isSearchFocused.value = true;
  // 仅首次聚焦时加载数据，避免重复请求
  if (recentSearch.value.length === 0) {
    await getRecentSearch();
  }
  if (recommendSearch.value.length === 0) {
    await getRecommendSearch();
  }
};

// 清空最近搜索
const clearRecentSearch = async () => {
  try {
    isDeleting.value = true;
    const res = await goodApi.deleteSearchRecord();
    if (res.code === 200) {
      recentSearch.value = [];
      MessagePlugin.success('清空最近搜索成功');
    } else {
      MessagePlugin.error(res.msg || '清空最近搜索失败');
    }
  } catch (err) {
    console.error('清空最近搜索失败：', err);
    MessagePlugin.error('清空最近搜索失败，请稍后重试');
  } finally {
    isDeleting.value = false;
  }
};

// 组件挂载时预加载推荐搜索（可选）
onMounted(async () => {
  await getRecommendSearch();
});
</script>

<style lang="scss" scoped>
/* 顶部导航样式 */
.top-nav-bar {
  background-color: #ffffff;
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
      &.nickname-item {
        &.active, &:hover { color: #666; }
      }
    }
  }
}

/* Logo+搜索区样式 */
.logo-search-bar {
  padding: 15px 0;
  background-color: var(--theme-bg);

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

      :deep(.search-input) {
        width: 100%;
        height: 36px;
        padding: 0 12px;
        border: 1px solid #FFFFFF;
        border-radius: 4px;
        outline: none;
        background-color: #FFFFFF !important;
        &:focus {
          background-color: #FFFFFF !important;
        }
        &::placeholder {
          color: #A1A1A2;
        }
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
        border-radius: 6px;

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
              &:disabled {
                color: #ccc;
                cursor: not-allowed;
              }
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

          .empty-tip {
            font-size: 12px;
            color: #999;
            padding: 10px 0;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>