<template>
  <div class="search-page">
    <!-- 公共头部 -->
    <Header />

    <!-- 搜索结果区域 -->
    <div class="search-container">
      <!-- 1. 结果标题（全部结果/搜索内容） -->
      <div class="page-title">
        <span class="all-result">全部结果</span>
        <span class="slash">/</span>
        <span class="search-content">{{ searchKeyword || '搜索内容' }}</span>
      </div>

      <!-- 2. 过滤筛选操作行（支持销量/价格正倒序） -->
      <div class="sort-bar">
        <span class="sort-label">排序：</span>
        <span 
          v-for="option in sortOptions" 
          :key="option.value"
          :class="['sort-item', sortState.currentKey === option.value ? 'active' : '']"
          @click="handleSort(option)"
        >
          {{ option.label }}
          <!-- 销量/价格显示排序箭头 -->
          <span v-if="option.value === 'sales' || option.value === 'price'" class="sort-arrow">
            <span v-if="sortState.currentKey === option.value && sortState.currentDir === 'asc'">↑</span>
            <span v-else-if="sortState.currentKey === option.value && sortState.currentDir === 'desc'">↓</span>
            <span v-else>↕</span>
          </span>
        </span>
      </div>

      <div class="search-result">
        <!-- 加载中状态 -->
        <div class="loading-result" v-if="isLoading">
          <span>正在搜索商品...</span>
        </div>

        <!-- 有搜索结果 -->
        <div class="result-list" v-else-if="hasResult && searchGoods.length">
          <div class="goods-item" v-for="(goods, idx) in searchGoods" :key="goods.id || idx" @click="goToGoodsDetail(goods.id)">
            <!-- 自适应正方形商品图片 -->
            <img :src="goods.image || '/images/product.png'" alt="商品图" class="goods-img">
            <!-- 商品名称（两行省略） -->
            <div class="goods-name">{{ goods.productName || '默认商品名称' }}</div>
            <!-- 商品价格（拆分符号/数字设置样式） -->
            <div class="price-area">
              <span class="current-price">
                <span class="price-sign">¥</span>
                <span class="price-num">{{ goods.salePrice || '0' }}</span>
              </span>
              <span class="original-price" v-if="goods.strikePrice">
                <span class="original-sign">¥</span>
                <span class="original-num">{{ goods.strikePrice }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 无搜索结果 -->
        <div class="empty-result" v-else>
          <img src="@/assets/images/empty-search.png" alt="无结果图标" class="empty-img">
          <div class="empty-text">抱歉，没有找到您要的商品，试试其他关键词吧~</div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div class="pagination" v-if="hasResult && totalPages > 1">
        <button 
          class="page-btn" 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1 || isLoading"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="page-btn" 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages || isLoading"
        >
          下一页
        </button>
      </div>

      <!-- 猜你喜欢组件 -->
      <GuessYouLike 
        fromPage="search" 
        :relateKey="searchKeyword" 
        :goodsList="guessGoods"
        v-if="guessGoods.length"
      />
    </div>

    <!-- 公共尾部 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getGoodApi } from '@/apis/good';
import { MessagePlugin } from 'tdesign-vue-next';
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import GuessYouLike from '@/components/GuessYouLike.vue';

// 路由与路由跳转
const route = useRoute();
const router = useRouter();
// 初始化商品API
const goodApi = getGoodApi();

// 响应式数据
const searchKeyword = ref('');
const hasResult = ref(true);
const isLoading = ref(false);
const searchGoods = ref([]); // 搜索结果商品
const guessGoods = ref([]); // 猜你喜欢商品

// 分页相关
const currentPage = ref(1);
const pageSize = ref(12); // 每页12条
const totalPages = ref(1);
const totalCount = ref(0);

// 排序状态：当前字段 + 排序方向（asc正序/desc倒序）
const sortState = ref({
  currentKey: 'comprehensiveScore', // 对应接口的综合排序字段
  currentDir: 'desc'
});

// 筛选排序选项（映射接口字段）
const sortOptions = ref([
  { label: '综合', value: 'comprehensiveScore' },
  { label: '销量', value: 'sales' },
  { label: '新品', value: 'new' },
  { label: '价格', value: 'price' }
]);

// 排序字段映射（接口实际接收的字段名）
const sortKeyMap = {
  comprehensiveScore: 'comprehensiveScore',
  sales: 'salesVolume', // 假设接口销量字段为salesVolume
  new: 'createTime', // 假设接口新品字段为createTime
  price: 'salePrice'
};

// 跳转到商品详情页
const goToGoodsDetail = (goodsId) => {
  if (goodsId) {
    router.push({ path: `/goods-detail/${goodsId}` });
  }
};

// 排序切换方法（支持销量/价格正倒序）
const handleSort = (option) => {
  const { value } = option;
  // 综合/新品无排序方向，直接切换字段
  if (value === 'comprehensiveScore' || value === 'new') {
    sortState.value.currentKey = value;
    sortState.value.currentDir = 'desc'; // 综合/新品默认倒序
    currentPage.value = 1; // 切换排序重置页码
    fetchSearchGoods(); // 重新请求数据
    return;
  }
  // 销量/价格切换字段/方向
  if (sortState.value.currentKey === value) {
    // 同一字段，切换方向
    sortState.value.currentDir = sortState.value.currentDir === 'asc' ? 'desc' : 'asc';
  } else {
    // 新字段，默认正序
    sortState.value.currentKey = value;
    sortState.value.currentDir = 'asc';
  }
  currentPage.value = 1; // 切换排序重置页码
  fetchSearchGoods(); // 重新请求数据
};

// 分页切换
const changePage = (page) => {
  if (page < 1 || page > totalPages.value || isLoading.value) return;
  currentPage.value = page;
  fetchSearchGoods();
};

// 获取搜索商品列表
const fetchSearchGoods = async () => {
  if (!searchKeyword.value.trim()) {
    searchGoods.value = [];
    hasResult.value = false;
    return;
  }

  isLoading.value = true;
  try {
    // 构造请求参数
    const params = {
      keyword: searchKeyword.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      orderByColumn: sortKeyMap[sortState.value.currentKey] || sortState.value.currentKey,
      isAsc: sortState.value.currentDir
    };

    // 调用商品列表接口
    const res = await goodApi.getProductList(params);
    if (res.code === 200) {
      const { rows, total } = res;
      searchGoods.value = rows || [];
      totalCount.value = total || 0;
      // totalPages.value = pages || 1;
      hasResult.value = !!rows.length;
    } else {
      MessagePlugin.error(res.msg || '获取商品列表失败');
      searchGoods.value = [];
      hasResult.value = false;
    }
  } catch (err) {
    console.error('搜索商品失败：', err);
    MessagePlugin.error('网络异常，搜索商品失败');
    searchGoods.value = [];
    hasResult.value = false;
  } finally {
    isLoading.value = false;
  }
};

// 获取猜你喜欢商品
const fetchGuessYouLike = async () => {
  try {
    const res = await goodApi.getRecommendProducts();
    if (res.code === 200 && Array.isArray(res.data)) {
      guessGoods.value = res.data.slice(0, 4); // 取前4个
    }
  } catch (err) {
    console.error('获取猜你喜欢商品失败：', err);
  }
};

// 监听路由参数变化，重新搜索
watch(
  () => route.query.keyword,
  (newKeyword) => {
    searchKeyword.value = newKeyword || '';
    currentPage.value = 1; // 关键词变化重置页码
    if (newKeyword) {
      fetchSearchGoods();
    } else {
      searchGoods.value = [];
      hasResult.value = false;
    }
  },
  { immediate: true }
);

// 组件挂载时加载猜你喜欢
onMounted(async () => {
  await fetchGuessYouLike();
});
</script>

<style scoped>
.search-page {
  min-height: 100vh;
}

.search-container {
  width: 1200px;
  margin: 20px auto;
}

/* 结果标题样式 */
.page-title {
  font-size: 14px;
  margin-bottom: 20px;
  .all-result {
    color: #A1A1A1;
    cursor: pointer;
    transition: color 0.2s;
    &:hover {
      color: #3799AE; /* 主题色 */
    }
  }
  .slash {
    margin: 0 4px;
    color: #A1A1A1;
  }
  .search-content {
    color: #2F3032;
  }
}

.search-result {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  min-height: 400px;
}

/* 加载中样式 */
.loading-result {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: #666;
}

/* 筛选排序栏样式 */
.sort-bar {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
}

.sort-label {
  font-size: 14px;
  color: #838486;
  margin-right: 16px;
}

.sort-item {
  font-size: 14px;
  color: #272727;
  margin-right: 24px;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sort-item.active {
  color: #3799AE;
  font-weight: 500;
}

.sort-arrow {
  font-size: 12px;
  color: #838486;
}

/* 商品列表与图片样式 */
.result-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px; /* 商品间距 */
}

.goods-item {
  width: calc(25% - 15px); /* 1200px容器下一行4个商品 */
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
  }
}

/* 自适应正方形图片 */
.goods-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
}

/* 商品名称（两行省略） */
.goods-name {
  font-size: 18px;
  font-weight: normal;
  line-height: 24px;
  letter-spacing: 0em;
  color: #272727;
  margin: 12px 0 8px;
  max-height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
}

/* 商品价格样式 */
.price-area {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
}

.current-price {
  .price-sign {
    color: #F72B1C;
    font-size: 18px;
    font-weight: 350;
  }
  .price-num {
    color: #F72B1C;
    font-size: 24px;
    font-weight: bold;
    line-height: 24px;
  }
}

.original-price {
  margin-left: 12px;
  text-decoration: line-through;
  .original-sign {
    color: #838486;
    font-size: 16px;
  }
  .original-num {
    color: #838486;
    font-size: 18px;
  }
}

/* 无结果样式 */
.empty-result {
  text-align: center;
  padding: 40px 0;
}

.empty-img {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #838486;
}

/* 分页样式 */
.pagination {
  margin-top: 30px;
  text-align: center;
  .page-btn {
    padding: 8px 16px;
    margin: 0 10px;
    border: 1px solid #eee;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    &:disabled {
      cursor: not-allowed;
      color: #ccc;
      border-color: #f5f5f5;
    }
    &:hover:not(:disabled) {
      border-color: #3799AE;
      color: #3799AE;
    }
  }
  .page-info {
    font-size: 14px;
    color: #666;
  }
}
</style>