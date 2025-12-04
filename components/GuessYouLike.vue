<template>
  <div class="guess-you-like">
    <div class="section-title">猜您喜欢</div>
    <div class="goods-list">
      <div class="goods-item" v-for="(goods, idx) in goodsList" :key="idx">
        <!-- 1. 统一图片样式：自适应正方形 -->
        <img :src="goods.img" alt="商品图" class="goods-img">
        <!-- 2. 商品名称：两行省略（和商品卡片样式统一） -->
        <div class="goods-name">{{ goods.name }}</div>
        <!-- 3. 价格区域：拆分符号/数字，统一样式 -->
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
</template>

<script setup>
const props = defineProps({
  // 来源页面（搜索页/商品详情页）
  fromPage: {
    type: String,
    required: true,
    validator: (val) => ['search', 'goodsDetail'].includes(val)
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