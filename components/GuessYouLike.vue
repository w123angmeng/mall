<template>
  <div class="guess-you-like">
    <div class="section-title">猜您喜欢</div>
    <div class="goods-list">
      <!-- 添加点击事件，跳转到商品详情页 -->
      <div 
        class="goods-item" 
        v-for="(goods, idx) in goodsList" 
        :key="goods.id || idx"
        @click="goToGoodsDetail(goods)"
        :class="{ disabled: !goods.id && !goods.productId }"
      >
        <!-- 1. 统一图片样式：自适应正方形 -->
        <img :src="goods.img || goods.firstImage || '/images/product.png'" alt="商品图" class="goods-img">
        <!-- 2. 商品名称：两行省略（和商品卡片样式统一） -->
        <div class="goods-name">{{ goods.name || goods.productName || '默认商品名称' }}</div>
        <!-- 3. 价格区域：拆分符号/数字，统一样式 -->
        <div class="price-area">
          <span class="current-price">
            <span class="price-sign">¥</span>
            <span class="price-num">{{ goods.price || goods.salePrice || '0' }}</span>
          </span>
          <span class="original-price" v-if="goods.originalPrice || goods.strikePrice">
            <span class="original-sign">¥</span>
            <span class="original-num">{{ goods.originalPrice || goods.strikePrice || '0' }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from '#app';
import { MessagePlugin } from 'tdesign-vue-next';

const router = useRouter();

const props = defineProps({
  // 来源页面（搜索页/商品详情页/购物车）
  fromPage: {
    type: String,
    required: true,
    validator: (val) => ['search', 'goodsDetail', 'cart'].includes(val) // 新增cart来源
  },
  // 关联关键字/商品ID（用于请求推荐）
  relateKey: {
    type: String,
    default: ''
  },
  // 推荐商品列表
  goodsList: {
    type: Array,
    required: true,
    default: () => []
  }
});

// 跳转到商品详情页
const goToGoodsDetail = (goods) => {
  // 获取商品ID（兼容id和productId字段）
  const goodsId = goods.id || goods.productId;
  
  // 无商品ID时给出提示
  if (!goodsId) {
    MessagePlugin.warning('商品信息异常，无法查看详情');
    return;
  }
  
  // 跳转到商品详情页，携带来源页面参数（用于统计/返回）
  router.push({
    path: `/goods-detail/${goodsId}`,
    query: { from: props.fromPage } // 携带来源页面标识
  });
};
</script>

<style scoped>
.guess-you-like {
  margin-top: 30px;
  border-radius: 14px;
  background: #FFFFFF;
  padding: 20px;
}

/* 标题样式微调（保持原有基础，视觉统一） */
.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #272727;
  margin-bottom: 16px;
}

/* 商品列表布局：一行4个，适配1200px容器 */
.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px; /* 和商品卡片间距统一 */
}

.goods-item {
  width: calc(25% - 15px); /* 一行4个，精准计算间距 */
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer; /* 鼠标悬浮显示手型 */
  transition: all 0.2s ease; /* 过渡动画 */
}

/* 商品项悬浮效果 */
.goods-item:hover:not(.disabled) {
  transform: translateY(-4px); /* 向上偏移 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 阴影效果 */
}

/* 商品信息异常时的样式 */
.goods-item.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* 1. 图片样式：和商品卡片一致的自适应正方形 */
.goods-img {
  width: 100%;
  aspect-ratio: 1 / 1; /* 保持正方形，适配容器 */
  object-fit: cover;
  border-radius: 8px; /* 和商品卡片圆角统一 */
  margin-bottom: 12px; /* 调整间距，和商品卡片一致 */
}

/* 2. 商品名称：两行省略（完全匹配商品卡片样式） */
.goods-name {
  font-size: 18px;
  font-weight: normal;
  line-height: 24px;
  letter-spacing: 0em;
  color: #272727;
  margin: 0 0 8px 0;
  max-height: 48px; /* 2行高度：24px*2 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制2行 */
  -webkit-box-orient: vertical;
  white-space: normal; /* 取消单行限制 */
}

/* 3. 价格区域：完全匹配商品卡片的价格样式 */
.price-area {
  margin-top: 8px;
  display: flex;
  align-items: baseline; /* 对齐价格基线 */
}

/* 现价样式 */
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

/* 原价样式 */
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
</style>