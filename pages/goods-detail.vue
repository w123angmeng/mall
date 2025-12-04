<template>
  <div class="goods-detail-page">
    <!-- 公共头部 -->
    <Header />

    <!-- 商品详情主体区域 -->
    <div class="main-container">
      <!-- 上半部分：商品图片+信息 -->
      <div class="goods-header">
        <!-- 商品图片区域（自定义轮播） -->
        <div class="goods-img-area">
          <!-- 大图展示 -->
          <img :src="currentGoodsImg" alt="商品大图" class="goods-big-img">
          <!-- 缩略图轮播 -->
          <div class="thumb-carousel">
            <button class="carousel-btn left-btn" @click="prevThumb" :disabled="currentThumbIdx <= 0">
              <img src="/images/pre.png" alt="上一个" class="carousel-btn-img">
            </button>
            <div class="thumb-list">
              <img 
                v-for="(img, idx) in goodsImgs" 
                :key="idx"
                :src="img" 
                alt="缩略图" 
                class="thumb-img"
                :class="currentThumbIdx === idx ? 'active' : ''"
                @click="currentThumbIdx = idx"
              >
            </div>
            <button class="carousel-btn right-btn" @click="nextThumb" :disabled="currentThumbIdx >= goodsImgs.length - 1">
              <img src="/images/next.png" alt="下一个" class="carousel-btn-img">
            </button>
          </div>
        </div>

        <!-- 商品信息区域 -->
        <div class="goods-info-area">
          <h1 class="goods-title">MX芳纶系列滤袋</h1>
          <p class="goods-desc">
            介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍
          </p>
          <div class="price-area">
            <span class="current-price">¥{{ currentPrice }}</span>
            <span class="original-price">原价 ¥{{ originalPrice }}</span>
          </div>

          <!-- 标签区域（循环数组） -->
          <div class="tags-area">
            <span v-for="(tag, idx) in tags" :key="idx" class="tag-item">{{ tag }}</span>
          </div>

          <!-- 规格选择 -->
          <div class="spec-group">
            <div class="spec-label">规格1：</div>
            <div class="spec-options">
              <span 
                v-for="(opt, idx) in spec1Options" 
                :key="idx"
                class="spec-option"
                @click="selectedSpec1 = idx"
                :class="selectedSpec1 === idx ? 'active' : ''"
              >
                <img src="/images/product.png" alt="规格图标" class="spec-option-img">
                {{ opt }}
              </span>
            </div>
          </div>

          <div class="spec-group">
            <div class="spec-label">规格2：</div>
            <div class="spec-options">
              <span 
                v-for="(opt, idx) in spec2Options" 
                :key="idx"
                class="spec-option"
                @click="selectedSpec2 = idx"
                :class="selectedSpec2 === idx ? 'active' : ''"
              >
                {{ opt }}
              </span>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="divider"></div>

          
		  <div class="option-wrap">
			  <!-- 数量选择 -->
			  <div class="count-area">
			    <button class="count-btn" @click="count > 1 && (count--)">&minus;</button>
			    <span class="count-num">{{ count }}</span>
			    <button class="count-btn" @click="count++">&plus;</button>
			  </div>
			  
			  <!-- 操作按钮 -->
			  <div class="btn-area">
			    <button class="cart-btn">加入购物车</button>
			    <button class="buy-btn">立即购买</button>
				
			  </div>
			  
		  </div>
          <p class="tip">缺规格，请 <span class="custom-link">私人订制</span></p>
        </div>
      </div>

      <!-- 相关好物区域（自定义横向轮播） -->
      <div class="related-goods-area">
        <h2 class="related-title">相关好物</h2>
        <div class="related-carousel">
          <button class="carousel-btn left-btn" @click="scrollRelated('left')">
            <img src="/images/pre.png" alt="上一个" class="carousel-btn-img">
          </button>
          <div class="related-list" ref="relatedListRef">
            <div class="related-item" v-for="(item, idx) in relatedGoods" :key="idx">
              <img :src="item.img" alt="相关商品" class="related-img">
              <p class="related-name">{{ item.name }}</p>
              <div class="related-price">
                <span class="related-current-price">¥{{ item.price }}</span>
                <span class="related-original-price">¥{{ item.originalPrice }}</span>
              </div>
            </div>
          </div>
          <button class="carousel-btn right-btn" @click="scrollRelated('right')">
            <img src="/images/next.png" alt="下一个" class="carousel-btn-img">
          </button>
        </div>
      </div>

      <!-- 下半部分：详情/参数Tab -->
      <div class="goods-detail-area">
        <!-- 标签切换 -->
        <div class="detail-tabs">
          <span 
            class="tab-item" 
            :class="activeTab === 'detail' ? 'active' : ''"
            @click="activeTab = 'detail'"
          >
            详情
          </span>
          <span 
            class="tab-item" 
            :class="activeTab === 'param' ? 'active' : ''"
            @click="activeTab = 'param'"
          >
            参数
          </span>
        </div>

        <!-- 内容区域 -->
        <div class="detail-content">
          <!-- 详情内容 -->
          <template v-if="activeTab === 'detail'">
            <img src="/images/product.png" alt="详情图" class="detail-banner">
          </template>

          <!-- 参数表格 -->
          <template v-else>
            <table class="param-table">
              <tr v-for="(item, idx) in paramsData" :key="idx">
                <td class="param-key">{{ item.key }}</td>
                <td class="param-value">{{ item.value }}</td>
              </tr>
            </table>
          </template>
        </div>
      </div>
    </div>

    <!-- 公共尾部 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';

// 商品图片数据
const goodsImgs = ref([
  '/images/product.png',
  '/images/product.png',
  '/images/product.png',
  '/images/product.png',
  '/images/product.png',
]);
const currentThumbIdx = ref(0);
const currentGoodsImg = computed(() => goodsImgs.value[currentThumbIdx.value]);

// 缩略图轮播控制
const prevThumb = () => {
  currentThumbIdx.value = Math.max(currentThumbIdx.value - 1, 0);
};
const nextThumb = () => {
  currentThumbIdx.value = Math.min(currentThumbIdx.value + 1, goodsImgs.value.length - 1);
};

// 商品价格&标签数据
const currentPrice = ref('3499');
const originalPrice = ref('3999');
const tags = ref(['7天无理由退换', '标签2', '标签3', '标签4', '标签5', '标签6']);

// 规格选择数据
const spec1Options = ref(['滤袋', '滤袋', '滤袋']);
const selectedSpec1 = ref(0);
const spec2Options = ref(['子规格子规格子规格', '子规格子规格子规格']);
const selectedSpec2 = ref(0);

// 数量选择
const count = ref(1);

// 相关好物数据
const relatedGoods = ref([
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '3899',
    originalPrice: '2999'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '3399',
    originalPrice: '4999'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '1954',
    originalPrice: '3199'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '1444',
    originalPrice: '4999'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '2464',
    originalPrice: '4999'
  }
]);
const relatedListRef = ref(null);
const scrollRelated = (direction) => {
  if (!relatedListRef.value) return;
  const scrollStep = 300;
  if (direction === 'left') {
    relatedListRef.value.scrollLeft -= scrollStep;
  } else {
    relatedListRef.value.scrollLeft += scrollStep;
  }
};

// Tab切换&参数数据
const activeTab = ref('detail');
const paramsData = ref([
  { key: '产品名称', value: 'MX芳纶系列滤袋' },
  { key: '核心材质', value: '芳纶纤维复合材料' },
  { key: '适用温度', value: '≤200℃（瞬间220℃）' },
  { key: '过滤精度', value: '5μm-200μm（可定制）' },
  { key: '工作压力', value: '≤0.6MPa' },
  { key: '适用介质', value: '强酸、强碱、高温液体/气体' },
  { key: '常规尺寸', value: 'φ180×800mm（可定制）' },
  { key: '使用寿命', value: '3-6个月（依工况而定）' }
]);
import { useRoute } from 'vue-router'; // 引入路由钩子
const route = useRoute();
// 接收商品ID参数（两种方式）
const goodsId = ref('');
// 请求商品详情数据（模拟接口）
const getGoodsDetailData = async () => {
  // 实际项目中替换为真实接口请求
  // const res = await api.getGoodsDetail(goodsId.value);
  // goodsDetail.value = res.data;

  // 模拟数据
  goodsDetail.value = {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋',
    price: '3499',
    originalPrice: '3999',
    desc: '介绍介绍介绍介绍介绍介绍介绍介绍',
    tags: ['7天无理由退换', '正品保障', '现货速发'],
    spec1Options: ['滤袋', '滤袋', '滤袋'],
    spec2Options: ['子规格子规格子规格', '子规格子规格子规格']
  };
};
onMounted(() => {
  goodsId.value = route.params.id || '';
  
  // 调用接口请求商品详情数据
    getGoodsDetailData();
  if (relatedListRef.value) {
    relatedListRef.value.style.width = `${relatedGoods.value.length * 220}px`;
  }
});
</script>

<style scoped type="scss">
.goods-detail-page {
  min-height: 100vh;
  background: #F8F9FA;
  .option-wrap {
	  display: flex;
	  justify-content: flex-start;
	  
  }
}

.main-container {
  width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 14px;
}

/* 商品头部区域 */
.goods-header {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

/* 商品图片区域 */
.goods-img-area {
  width: 400px;
}
.goods-big-img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 8px;
  background: #F5F5F5;
}
.thumb-carousel {
  display: flex;
  align-items: center;
  margin-top: 12px;
}
.carousel-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.carousel-btn-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.carousel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.thumb-list {
  display: flex;
  gap: 8px;
  margin: 0 8px;
  overflow: hidden;
}
.thumb-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 1px solid #F5F5F5;
  border-radius: 4px;
  cursor: pointer;
}
.thumb-img.active {
  border-color: #3799AE;
}

/* 商品信息区域 */
.goods-info-area {
  flex: 1;
}
.goods-title {
  font-size: 24px;
  font-weight: 500;
  color: #272727;
  margin-bottom: 12px;
}
.goods-desc {
  font-size: 14px;
  color: #838486;
  margin-bottom: 20px;
  line-height: 1.5;
}
.price-area {
  margin-bottom: 16px;
}
.current-price {
  font-size: 32px;
  font-weight: bold;
  color: #F72B1C;
  margin-right: 12px;
}
.original-price {
  font-size: 14px;
  color: #838486;
  text-decoration: line-through;
}

/* 标签区域样式 */
.tags-area {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tag-item {
  height: 30px;
  border-radius: 4px;
  padding: 0 8px;
  background: #E1F5F9;
  color: #3799AF;
  font-size: 14px;
  display: flex;
  align-items: center;
}

/* 规格选择样式 */
.spec-group {
  margin-bottom: 20px;
}
.spec-label {
  font-size: 14px;
  color: #515152;
  line-height: 16px;
  margin-bottom: 8px;
}
.spec-options {
  display: flex;
  gap: 12px;
}
.spec-option {
  height: 42px;
  box-sizing: border-box;
  border: 1px solid #DCDEE2;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  color: #272727;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.spec-option-img {
  width: 30px;
  height: 21px;
  object-fit: contain;
}
.spec-option.active {
  border-color: #3799AE;
  color: #3799AE;
}

/* 分割线 */
.divider {
  height: 1px;
  background: #ECEFF3;
  margin: 20px 0;
}

/* 数量选择 */
.count-area {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: fit-content;
}
.count-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ECEEF2;
  background: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.count-num {
  width: 40px;
  height: 32px;
  /* border-top: 1px solid #ECEEF2; */
  /* border-bottom: 1px solid #ECEEF2; */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* 操作按钮 */
.btn-area {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  margin-left: 20px;
}
.cart-btn {
  width: 290px;
  height: 58px;
  border: none;
  background: #E1F5F9;
  color: #3799AF;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.buy-btn {
  width: 290px;
  height: 58px;
  border: none;
  background: #4FA2B4;
  color: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.tip {
  font-size: 12px;
  color: #838486;
  margin-left: 124px;
}
.custom-link {
  color: #3799AF;
  cursor: pointer;
}

/* 相关好物区域 */
.related-goods-area {
  margin-bottom: 40px;
}
.related-title {
  font-size: 20px;
  font-weight: 500;
  color: #272727;
  margin-bottom: 16px;
}
.related-carousel {
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.related-list {
  display: flex;
  gap: 20px;
  transition: scrollLeft 0.3s ease;
}
.related-item {
  width: 200px;
}
.related-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}
.related-name {
  font-size: 14px;
  color: #272727;
  margin-bottom: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.related-price {
  font-size: 14px;
}
.related-current-price {
  color: #F72B1C;
  margin-right: 8px;
}
.related-original-price {
  color: #838486;
  text-decoration: line-through;
}

/* 详情/参数Tab区域 */
.goods-detail-area {
  margin-bottom: 40px;
}
.detail-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ECEEF2;
  padding-bottom: 8px;
}
.tab-item {
  font-size: 16px;
  color: #838486;
  cursor: pointer;
  padding-bottom: 8px;
  border-bottom: 2px solid transparent;
}
.tab-item.active {
  color: #272727;
  border-bottom-color: #3799AE;
}
.detail-content {
  padding: 10px 0;
}
.detail-banner {
  width: 100%;
  border-radius: 8px;
}

/* 参数表格样式 */
.param-table {
  width: 100%;
  border-collapse: collapse;
}
.param-table tr {
  border-bottom: 1px solid #ECEEF2;
}
.param-table td {
  padding: 12px 0;
  font-size: 14px;
}
.param-key {
  width: 150px;
  color: #838486;
}
.param-value {
  color: #272727;
}
</style>