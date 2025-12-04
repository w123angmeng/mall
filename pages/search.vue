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
        <!-- 有搜索结果 -->
        <div class="result-list" v-if="hasResult">
          <div class="goods-item" v-for="(goods, idx) in searchGoods" :key="idx">
            <!-- 自适应正方形商品图片 -->
            <img :src="goods.img" alt="商品图" class="goods-img">
            <!-- 商品名称（两行省略） -->
            <div class="goods-name">{{ goods.name }}</div>
            <!-- 商品价格（拆分符号/数字设置样式） -->
            <div class="price-area">
              <span class="current-price">
                <span class="price-sign">¥</span>
                <span class="price-num">{{ goods.price }}</span>
              </span>
              <span class="original-price">
                <span class="original-sign">¥</span>
                <span class="original-num">{{ goods.originalPrice }}</span>
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

      <!-- 猜你喜欢组件 -->
      <GuessYouLike 
        fromPage="search" 
        :relateKey="searchKeyword" 
        :goodsList="guessGoods"
      />
    </div>

    <!-- 公共尾部 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import GuessYouLike from '@/components/GuessYouLike.vue';

const route = useRoute();
const searchKeyword = ref('');
const hasResult = ref(true);

// 排序状态：当前字段 + 排序方向（asc正序/desc倒序）
const sortState = ref({
  currentKey: 'comprehensive',
  currentDir: 'asc'
});

// 筛选排序选项
const sortOptions = ref([
  { label: '综合', value: 'comprehensive' },
  { label: '销量', value: 'sales' },
  { label: '新品', value: 'new' },
  { label: '价格', value: 'price' }
]);

// 排序切换方法（支持销量/价格正倒序）
const handleSort = (option) => {
  const { value } = option;
  // 综合/新品无排序方向，直接切换字段
  if (value === 'comprehensive' || value === 'new') {
    sortState.value.currentKey = value;
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
};

// 搜索结果商品（假数据）
const searchGoods = ref([
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '129',
    originalPrice: '299'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '129',
    originalPrice: '299'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '129',
    originalPrice: '299'
  }
]);
// const searchGoods = ref([
 
// ]);

// 猜你喜欢商品（假数据）
const guessGoods = ref([
  {
    img: '/images/product.png',
    name: 'MX9系列过滤袋 MX9系列过滤袋 MX9系列过滤袋',
    price: '129',
    originalPrice: '200'
  },
  {
    img: '/images/product.png',
    name: 'MX9系列过滤袋 MX9系列过滤袋 MX9系列过滤袋',
    price: '129',
    originalPrice: '200'
  }
]);

onMounted(() => {
  searchKeyword.value = route.query.keyword || '';
  if (searchKeyword.value === '无结果') {
    hasResult.value = false;
  }
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
  width: calc(25% - 15px); /* 1200px容器下一行3个商品 */
  border-radius: 8px;
  overflow: hidden;
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
</style>