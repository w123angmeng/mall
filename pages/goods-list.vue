<template>
  <div class="goods-list-page">
    <!-- 公共页首 -->
    <Header />

    <!-- 商品列表主体区域 -->
    <div class="main-container">
      <!-- 1. 面包屑导航 -->
      <div class="breadcrumb">
        <span 
          class="breadcrumb-item home-item" 
          @click="goToHome"
        >
          首页
        </span>
        <span class="breadcrumb-sep">/</span>
        <span 
          class="breadcrumb-item level1-item" 
          @click="goToLevel1List"
        >
          {{ level1Name }}
        </span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item level2-item">
          {{ currentLevel2Label }}
        </span>
      </div>

      <!-- 2. 统一筛选卡片（分类+子分类+排序） -->
      <div class="filter-card">
        <!-- 分类行 -->
        <div class="filter-row">
          <span class="filter-label">分类：</span>
          <span 
            v-for="(cate, idx) in level2Cates" 
            :key="idx"
            :class="['filter-item', currentLevel2 === cate.value ? 'active' : '']"
            @click="handleLevel2Change(cate)"
          >
            {{ cate.label }}
          </span>
        </div>

        <!-- 子分类行 -->
        <div class="filter-row">
          <span class="filter-label">子分类：</span>
          <span 
            v-for="(subCate, idx) in level3Cates" 
            :key="idx"
            :class="['filter-item', currentLevel3 === subCate.value ? 'active' : '']"
            @click="currentLevel3 = subCate.value"
          >
            {{ subCate.label }}
          </span>
        </div>

        <!-- 排序行 -->
        <div class="filter-row">
          <span class="filter-label">排序：</span>
          <span 
            v-for="option in sortOptions" 
            :key="option.value"
            :class="['filter-item', sortState.currentKey === option.value ? 'active' : '']"
            @click="handleSort(option)"
          >
            {{ option.label }}
            <!-- 销量/价格排序箭头 -->
            <span v-if="option.value === 'sales' || option.value === 'price'" class="sort-arrow">
              <span v-if="sortState.currentKey === option.value && sortState.currentDir === 'asc'">↑</span>
              <span v-else-if="sortState.currentKey === option.value && sortState.currentDir === 'desc'">↓</span>
              <span v-else>↕</span>
            </span>
          </span>
        </div>
      </div>

      <!-- 3. 商品列表 -->
      <div class="goods-list">
        <div class="goods-item" v-for="(goods, idx) in goodsList" :key="idx">
          <img :src="goods.img" alt="商品图" class="goods-img">
          <div class="goods-name">{{ goods.name }}</div>
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
    </div>

    <!-- 公共页尾 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';

const route = useRoute();
const router = useRouter();

// 1. 路由参数接收（一级分类从首页传递）
const level1Name = ref(''); // 一级分类名称
const level2IdFromQuery = ref(''); // 二级分类ID（首页传递）
const currentLevel2 = ref(''); // 当前选中的二级分类
const currentLevel3 = ref(''); // 当前选中的三级分类

// 2. 分类数据
const level2Cates = ref([
  { label: '滤袋系列', value: 'filter-bag' },
  { label: '滤芯系列', value: 'filter-core' },
  { label: '滤框系列', value: 'filter-frame' },
  { label: '其他配件', value: 'other-parts' }
]);
const level3Cates = ref([
  { label: 'MX9系列', value: 'mx9-series' },
  { label: 'MX8系列', value: 'mx8-series' },
  { label: 'MX7系列', value: 'mx7-series' },
  { label: 'MX6系列', value: 'mx6-series' }
]);

// 当前二级分类的名称（用于面包屑）
const currentLevel2Label = computed(() => {
  const targetCate = level2Cates.value.find(item => item.value === currentLevel2.value);
  return targetCate ? targetCate.label : '';
});

// 3. 排序状态
const sortOptions = ref([
  { label: '综合', value: 'comprehensive' },
  { label: '销量', value: 'sales' },
  { label: '新品', value: 'new' },
  { label: '价格', value: 'price' }
]);
const sortState = ref({
  currentKey: 'comprehensive',
  currentDir: 'asc'
});

// 4. 商品列表数据
const goodsList = ref([]);

// 二级分类切换（同步面包屑）
const handleLevel2Change = (cate) => {
  currentLevel2.value = cate.value;
  // 实际项目中：切换二级分类后重置三级分类+重新请求商品
  currentLevel3.value = level3Cates.value[0].value;
  getGoodsList();
};

// 排序切换
const handleSort = (option) => {
  const { value } = option;
  if (value === 'comprehensive' || value === 'new') {
    sortState.value.currentKey = value;
  } else {
    sortState.value.currentKey = value;
    sortState.value.currentDir = sortState.value.currentDir === 'asc' ? 'desc' : 'asc';
  }
  getGoodsList();
};

// 请求商品数据
const getGoodsList = () => {
  const mockData = [
    {
      img: '/images/product.png',
      name: 'MX9系列滤袋 MX9系列滤袋 MX9系列滤袋 MX9系列滤袋',
      price: '129',
      originalPrice: '299'
    },
    {
      img: '/images/product.png',
      name: 'MX9系列滤袋 MX9系列滤袋 MX9系列滤袋 MX9系列滤袋',
      price: '129',
      originalPrice: '299'
    },
    {
      img: '/images/product.png',
      name: 'MX9系列滤袋 MX9系列滤袋 MX9系列滤袋 MX9系列滤袋',
      price: '129',
      originalPrice: '299'
    },
    {
      img: '/images/product.png',
      name: 'MX9系列滤袋 MX9系列滤袋 MX9系列滤袋 MX9系列滤袋',
      price: '129',
      originalPrice: '299'
    }
  ];
  goodsList.value = mockData;
};

// 面包屑跳转：首页
const goToHome = () => {
  router.push('/');
};

// 面包屑跳转：一级分类列表（实际项目中配置对应路由）
const goToLevel1List = () => {
  router.push({
    path: '/level1-list',
    query: { level1Name: level1Name.value }
  });
};

onMounted(() => {
  // 从首页传递的参数中获取一级分类+默认二级分类
  level1Name.value = route.query.level1Name || '一级分类';
  level2IdFromQuery.value = route.query.level2Id || '';
  
  // 初始化选中分类
  currentLevel2.value = level2IdFromQuery.value || level2Cates.value[0].value;
  currentLevel3.value = level3Cates.value[0].value;
  
  getGoodsList();
});
</script>

<style scoped>
.goods-list-page {
  min-height: 100vh;
  background: #F8F9FA;
}

.main-container {
  width: 1200px;
  margin: 20px auto;
}

/* 1. 面包屑样式 */
.breadcrumb {
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-item {
  cursor: pointer;
  transition: color 0.2s;
}

/* 面包屑颜色规则 */
.home-item, .level1-item {
  color: #A1A1A1;
}
.home-item:hover, .level1-item:hover {
  color: #3799AE; /* 主题色 */
}
.level2-item {
  color: #2F3032;
}
.level2-item:hover {
  color: #3799AE;
}

.breadcrumb-sep {
  color: #A1A1A1;
}

/* 2. 统一筛选卡片 */
.filter-card {
  background: #FFFFFF;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 14px;
  color: #838486;
  min-width: 60px;
}

.filter-item {
  font-size: 14px;
  color: #272727;
  margin-right: 24px;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.filter-item.active {
  color: #3799AE; /* 选中态主题色 */
  font-weight: 500;
}

.sort-arrow {
  font-size: 12px;
  color: #838486;
}

/* 3. 商品列表样式 */
.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: #FFFFFF;
  border-radius: 14px;
  padding: 20px;
}

.goods-item {
  width: calc(25% - 15px);
  border-radius: 8px;
  overflow: hidden;
}

.goods-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.goods-name {
  font-size: 18px;
  font-weight: normal;
  line-height: 24px;
  color: #272727;
  margin: 0 0 8px 0;
  max-height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
}

.price-area {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
}

.current-price .price-sign {
  color: #F72B1C;
  font-size: 18px;
  font-weight: 350;
}

.current-price .price-num {
  color: #F72B1C;
  font-size: 24px;
  font-weight: bold;
  line-height: 24px;
}

.original-price {
  margin-left: 12px;
  text-decoration: line-through;
}

.original-price .original-sign {
  color: #838486;
  font-size: 16px;
}

.original-price .original-num {
  color: #838486;
  font-size: 18px;
}
</style>