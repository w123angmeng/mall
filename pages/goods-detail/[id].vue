<template>
  <div class="goods-detail-page">
    <Header />
    <div class="main-container">
      <div class="goods-header">
        <div class="goods-img-area">
          <img :src="currentGoodsImg" alt="商品大图" class="goods-big-img">
          <div class="thumb-carousel">
            <button class="carousel-btn left-btn" @click="prevThumb" :disabled="currentThumbIdx <= 0">
              <img src="/images/pre.png" alt="上一个" class="carousel-btn-img">
            </button>
            <div class="thumb-list">
              <img 
                v-for="(img, idx) in goodsImgs" 
                :key="idx"
                :src="img.imageUrl" 
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
        <div class="goods-info-area">
          <h1 class="goods-title">{{ goodsDetail?.productName || 'MX芳纶系列滤袋' }}</h1>
          <p class="goods-desc">
            {{ goodsDetail?.introduction || '介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍' }}
          </p>
          <div class="price-area">
            <span class="current-price">¥{{ goodsDetail?.salePrice || currentPrice }}</span>
            <span class="original-price">原价 ¥{{ goodsDetail?.strikePrice || originalPrice }}</span>
          </div>
          <div class="tags-area">
            <span v-for="(tag, idx) in goodsDetail?.labels || tags" :key="idx" class="tag-item">{{ tag?.labelInfo?.name || tag }}</span>
          </div>
          <div class="spec-group" v-for="(sku, ind) in goodsDetail?.skus" :key="ind">
            <div class="spec-label">{{ `规格${ind + 1}`}}</div>
            <div class="spec-options">
              <span
                v-if="!sku?.specJson"
                class="spec-option"
                @click="handleSpecSelect(sku, 0)"
                :class="selectedSkuId === sku.id ? 'active' : ''"
              >
                <img :src="sku.image || '/images/product.png'" alt="规格图标" class="spec-option-img">
                {{ sku?.singleSpec  || '-'}}
              </span>
              <span 
                v-for="(opt, idx) in  JSON.parse(sku?.specJson || '[]')" 
                :key="idx"
                class="spec-option"
                @click="handleSpecSelect(sku, idx)"
                :class="selectedSkuId === sku.id ? 'active' : ''"
              >
                <img :src="'/images/product.png' || sku.image" alt="规格图标" class="spec-option-img">
                {{ opt?.specName  || '-'}}
              </span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="option-wrap">
            <div class="count-area">
              <button class="count-btn" @click="count > 1 && (count--)">&minus;</button>
              <span class="count-num">{{ count }}</span>
              <button class="count-btn" @click="count++">&plus;</button>
            </div>
            <div class="btn-area">
              <button class="cart-btn" @click="handleAddCart">加入购物车</button>
              <button class="buy-btn" @click="handleBuyNow">立即购买</button>
            </div>
          </div>
          <p class="tip">缺规格，请 <span class="custom-link">私人订制</span></p>
        </div>
      </div>
      <div class="related-goods-area">
        <h2 class="related-title">相关好物</h2>
        <div class="related-carousel">
          <button class="carousel-btn left-btn" @click="scrollRelated('left')">
            <img src="/images/pre.png" alt="上一个" class="carousel-btn-img">
          </button>
          <div class="related-list-wrap">
            <div class="related-list" ref="relatedListRef">
              <div class="related-item" v-for="(item, idx) in relatedGoods" :key="idx" @click="goToGoodsDetail(item.id)">
                <img :src="item?.firstImage || '/images/product.png'" alt="相关商品" class="related-img">
                <p class="related-name">{{ item?.productName }}</p>
                <div class="related-price">
                  <span class="related-current-price">¥{{ item?.salePrice }}</span>
                  <span class="related-original-price">¥{{ item?.strikePrice }}</span>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-btn right-btn" @click="scrollRelated('right')">
            <img src="/images/next.png" alt="下一个" class="carousel-btn-img">
          </button>
        </div>
      </div>
      <div class="goods-detail-area">
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
        <div class="detail-content">
          <template v-if="activeTab === 'detail'">
            <div v-html="goodsDetail?.details || '-'"></div>
          </template>
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
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter, useAsyncData } from '#app';
// 导入 TDesign 的 MessagePlugin
import { MessagePlugin } from 'tdesign-vue-next';
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import { getGoodApi } from '@/apis/good';
import { getCartApi } from '@/apis/cart';

// 初始化路由和路由跳转
const route = useRoute();
const router = useRouter();
// 响应式获取商品ID
const goodsId = computed(() => route.params.id || '');
// 初始化商品API
const goodApi = getGoodApi();
// 初始化购物车API
const cartApi = getCartApi();

// 获取商品详情数据
const { data: goodsDetail, refresh: refreshGoodsDetail } = useAsyncData(
  () => `goodsDetail_${goodsId.value}`,
  async() => {
    console.log('请求商品详情ID：', goodsId.value);
    // 优先使用路由中的商品ID，兜底使用测试ID
    const res = await goodApi.getProductDetail(goodsId.value || '1996153055358066689');
    console.log('------goodsDetail: res:', res)
    return res.data;
  },
  { 
    server: true,
    default: () => ({}),
    watch: [goodsId]
  }
);

// 获取相关好物数据
const { data: relatedGoods } = useAsyncData(
  () => `relatedGoods_${goodsId.value}`,
  async() => {
    console.log('请求相关好物ID：', goodsId.value);
    const res = await goodApi.getRelatedProducts(goodsId.value || '1996153055358066689');
    console.log('-------relatedGoods: res:', res)
    return res.data || [];
  },
  {
    server: false
  }
);

// 监听商品ID变化刷新数据
watch(goodsId, (newId) => {
  console.log('监听到ID变化：', newId);
  if (newId) {
    refreshGoodsDetail();
  }
}, { immediate: true });

// 商品图片轮播相关
const goodsImgs = computed(() => {
  return goodsDetail.value?.images || []
});
const currentThumbIdx = ref(0);
const currentGoodsImg = computed(() => {
  return goodsImgs.value[currentThumbIdx.value]?.imageUrl || goodsImgs.value[0]?.imageUrl || '/images/product.png';
});
const prevThumb = () => {
  currentThumbIdx.value = Math.max(currentThumbIdx.value - 1, 0);
};
const nextThumb = () => {
  currentThumbIdx.value = Math.min(currentThumbIdx.value + 1, goodsImgs.value.length - 1);
};

// 基础数据定义
const currentPrice = ref('3499');
const originalPrice = ref('3999');
const tags = ref(['7天无理由退换', '标签2', '标签3', '标签4', '标签5', '标签6']);
const selectedSkuId = ref('');
const count = ref(1);

// 规格选择处理
const handleSpecSelect = (sku, idx) => {
  selectedSkuId.value = sku.id;
  // 可在此处更新选中规格的价格等信息
  if (sku.salePrice) {
    currentPrice.value = sku.salePrice;
  }
  if (sku.strikePrice) {
    originalPrice.value = sku.strikePrice;
  }
};

// 相关好物滚动
const relatedListRef = ref(null);
const scrollRelated = (direction) => {
  if (!relatedListRef.value) return;
  const scrollStep = 300;
  relatedListRef.value.scrollLeft += direction === 'left' ? -scrollStep : scrollStep;
};

// 详情/参数标签切换
const activeTab = ref('detail');
const defaultParamsData = [
  { key: '产品名称', value: 'MX芳纶系列滤袋' },
  { key: '核心材质', value: '芳纶纤维复合材料' },
  { key: '适用温度', value: '≤200℃（瞬间220℃）' },
  { key: '过滤精度', value: '5μm-200μm（可定制）' },
  { key: '工作压力', value: '≤0.6MPa' },
  { key: '适用介质', value: '强酸、强碱、高温液体/气体' },
  { key: '常规尺寸', value: 'φ180×800mm（可定制）' },
  { key: '使用寿命', value: '3-6个月（依工况而定）' }
];
const paramsData = computed(()=> {
  return goodsDetail.value?.productParams || defaultParamsData
});

// 加入购物车处理函数
const handleAddCart = async () => {
  if (!goodsId.value) {
    MessagePlugin.error('商品ID不能为空');
    return;
  }
  if (!selectedSkuId.value) {
    MessagePlugin.error('请选择商品规格');
    return;
  }
  try {
    const res = await cartApi.addCart({
      productId: goodsId.value,
      productSkuId: selectedSkuId.value,
      cartNum: count.value
    });
    if (res.code === 200) {
      MessagePlugin.success('加入购物车成功');
    } else {
      MessagePlugin.error(`加入购物车失败：${res.msg || '系统异常'}`);
    }
  } catch (error) {
    console.error('加入购物车出错：', error);
    MessagePlugin.error('加入购物车失败，请稍后重试');
  }
};

// 立即购买处理函数（修复后）
const handleBuyNow = () => {
  // 验证商品信息
  if (!goodsId.value) {
    MessagePlugin.error('商品ID异常，无法购买');
    return;
  }
  if (!selectedSkuId.value) {
    MessagePlugin.error('请先选择商品规格');
    return;
  }
  if (count.value < 1) {
    MessagePlugin.error('购买数量不能小于1');
    return;
  }

  // 从商品详情中找到选中的SKU数据
  const selectedSku = goodsDetail.value?.skus?.find(sku => sku.id === selectedSkuId.value) || {};
  
  // 1. 确定商品规格类型（0单规格，1多规格）：从选中的SKU中判断
  const specType = selectedSku.specJson ? 1 : 0; 
  // 2. 单规格名称：从选中的SKU的singleSpec获取
  const singleSpec = specType === 0 ? (selectedSku.singleSpec || '默认规格') : '';
  // 3. 多规格JSON：直接使用选中SKU的specJson（已为JSON字符串）
  const specJson = specType === 1 ? (selectedSku.specJson || '{}') : ''; 
  // 4. 商品图片ID（如果后端要求图片ID而非URL，需替换为图片ID，此处暂时用URL）
  const productImageId = currentGoodsImg.value ? getImageIdFromUrl(currentGoodsImg.value) : ''; 

  // 构造订单参数（补充后端YpOrderDetailDTO要求的所有字段）
  const orderParams = {
    // 基础商品信息
    productId: goodsId.value, // 商品ID
    skuId: selectedSkuId.value, // 选中的SKU ID
    buyNum: count.value, // 购买数量
    productName: goodsDetail.value?.productName || 'MX芳纶系列滤袋', // 商品名称
    salePrice: goodsDetail.value?.salePrice || currentPrice.value, // 商品单价
    productImage: currentGoodsImg.value, // 商品图片URL
    productImageId: productImageId, // 商品图片ID（可选）
    
    // 规格相关
    specType: specType, // 规格类型 0单 1多
    singleSpec: singleSpec, // 单规格名称
    specJson: specJson, // 多规格JSON字符串
    
    // 金额计算
    totalPrice: (Number(goodsDetail.value?.salePrice) || Number(currentPrice.value)) * count.value, // 商品总价
  };

  // 跳转到下单页面并携带参数（编码防止特殊字符问题）
  router.push({
    path: '/order-submit',
    query: {
      orderData: encodeURIComponent(JSON.stringify(orderParams))
    }
  });
};

// 可选：辅助函数 - 从图片URL中提取图片ID（如果后端要求图片ID而非URL）
const getImageIdFromUrl = (url) => {
  if (!url) return '';
  // 示例：从URL末尾截取ID（需根据实际URL规则调整）
  const parts = url.split('/');
  return parts[parts.length - 1].split('.')[0];
};

// 相关商品点击跳转详情页
const goToGoodsDetail = (id) => {
  if (id) {
    router.push(`/goods-detail/${id}`);
  }
};

// 挂载时初始化
onMounted(() => {
  console.log('挂载时ID：', goodsId.value);
  if (relatedListRef.value && relatedGoods.value) {
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

.goods-header {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

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
  flex-wrap: wrap;
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
  transition: all 0.2s ease;
}
.spec-option-img {
  width: 30px;
  height: 21px;
  object-fit: contain;
}
.spec-option.active {
  border-color: #3799AE;
  color: #3799AE;
  background-color: rgba(55, 153, 174, 0.05);
}
.spec-option:hover:not(.active) {
  border-color: #B3D9E1;
}

.divider {
  height: 1px;
  background: #ECEFF3;
  margin: 20px 0;
}

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
  transition: border-color 0.2s ease;
}
.count-btn:hover {
  border-color: #3799AE;
}
.count-num {
  width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

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
  transition: background-color 0.2s ease;
}
.cart-btn:hover {
  background-color: #D1EEF2;
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
  transition: background-color 0.2s ease;
}
.buy-btn:hover {
  background-color: #3799AE;
}
.buy-btn:disabled {
  background-color: #B3D9E1;
  cursor: not-allowed;
}
.tip {
  font-size: 12px;
  color: #838486;
  margin-left: 124px;
}
.custom-link {
  color: #3799AF;
  cursor: pointer;
  text-decoration: underline;
}

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
  width: 100%;
}
.related-list-wrap {
  flex: 1;
  overflow: hidden;
  margin: 0 10px;
}
.related-list {
  display: flex;
  gap: 20px;
  transition: scrollLeft 0.3s ease;
}
.related-item {
  width: 200px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.related-item:hover {
  transform: translateY(-4px);
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
  transition: all 0.2s ease;
}
.tab-item.active {
  color: #272727;
  border-bottom-color: #3799AE;
}
.tab-item:hover:not(.active) {
  color: #3799AE;
  border-bottom-color: #E1F5F9;
}
.detail-content {
  padding: 10px 0;
  font-size: 14px;
  line-height: 1.8;
  color: #272727;
}

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
  font-weight: 500;
}
.param-value {
  color: #272727;
}
</style>