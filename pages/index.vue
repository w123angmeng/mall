<template>
  <div>
    <!-- 公共头部（顶部导航+Logo搜索） -->
    <Header />

    <!-- 主体内容（宽度1200px，居中） -->
    <main class="main-container">
      <!-- 左侧分类树 + 右侧Banner+商品区 -->
      <div class="content-wrapper">
        <!-- 左侧分类树（高400px，与Banner同高） -->
        <CategoryTree />

        <!-- 右侧区域（Banner+商品） -->
        <div class="right-area">
          <!-- Banner（高400px，与分类树同高） -->
          <div class="banner">
            <t-swiper :navigation="{ size: 'large' }">
              <t-swiper-item v-for="item in 1" :key="item">
                <div style="height:400px;">
                  <img :src="bannerImage" alt="618狂欢购" class="banner-img" style="height:100%;width:100%;object-fit: cover;"/>
                </div>
              </t-swiper-item>
            </t-swiper>
          </div>
        </div>
      </div>
	  
	  <div class="product-wrapper">
	  
	  <!-- 商品展示卡片（单个卡片：标题+更多+四个商品） -->
	  <section class="product-block">
	  			<!-- 商品分类标签栏（单选+指定样式） -->
	  			<div class="product-tags">
	  			  <span 
	  			    class="tag-item"
	  			    :class="{ active: activeTag === tag.name }"
	  			    v-for="tag in productTags" 
	  			    :key="tag.name"
	  			    @click="switchTag(tag.name)"
	  			  >
	  			    {{ tag.name }}
	  			  </span>
	  			</div>
	    <div class="block-header">
	      <h3 class="block-title">{{ activeTag }}</h3>
	      <a class="more-btn" @click="goToGoodsList('filter-bag', 'mx9-series', '滤袋系列')">更多 ></a>
	    </div>
	    <!-- 商品列表（仅4个商品，无大图片） -->
	    <div class="product-grid">
	      <div class="product-card" v-for="(item, idx) in currentProducts" :key="item.id" @click="goToGoodsDetail(item.id)">
	        <!-- 热卖标签 -->
	        <div class="tag-hot" v-if="item.isHot">热卖</div>
	        <img :src="item.image" alt="商品图" class="product-img" />
	        <p class="product-name">{{ item.name }}</p>
	        <!-- 价格区域 -->
	        <div class="product-price">
	          <span class="current-price">¥{{ item.price }}</span>
	          <span class="original-price">¥{{ item.originalPrice }}</span>
	        </div>
	      </div>
	    </div>
	  </section>
	  
	  
	  <section class="product-block">
	    <div class="block-header">
	      <h3 class="block-title">二行行商品</h3>
	      <a href="#" class="more-btn">更多 ></a>
	    </div>
	    <!-- 商品列表（仅4个商品） -->
	  			<div class="block-img">
	  				<img src="/public/images/big-product.png" alt="" />
	  			</div>
	  			
	    <div class="product-grid">
	      <div class="product-card" v-for="(item, idx) in currentProducts" :key="item.id">
	        <!-- 热卖标签 -->
	        <div class="tag-hot" v-if="item.isHot">热卖</div>
	        <img :src="item.image" alt="商品图" class="product-img" />
	        <p class="product-name">{{ item.name }}</p>
	        <!-- 价格区域 -->
	        <div class="product-price">
	          <span class="current-price">¥{{ item.price }}</span>
	          <span class="original-price">¥{{ item.originalPrice }}</span>
	        </div>
	      </div>
	    </div>
	  </section>
	  
	  <section class="product-block">
	    <div class="block-header">
	      <h3 class="block-title">三行商品</h3>
	      <a href="#" class="more-btn">更多 ></a>
	    </div>
	    <!-- 商品列表（仅4个商品，无大图片） -->
	    <div class="product-grid">
	      <div class="product-card" v-for="(item, idx) in currentProducts" :key="item.id">
	        <!-- 热卖标签 -->
	        <div class="tag-hot" v-if="item.isHot">热卖</div>
	        <img :src="item.image" alt="商品图" class="product-img" />
	        <p class="product-name">{{ item.name }}</p>
	        <!-- 价格区域 -->
	        <div class="product-price">
	          <span class="current-price">¥{{ item.price }}</span>
	          <span class="original-price">¥{{ item.originalPrice }}</span>
	        </div>
	      </div>
	    </div>
	  </section>
	  </div>
    </main>

    <!-- 公共尾部 -->
    <Footer />
  </div>
</template>

<script setup>
import Header from '~/components/common/Header.vue';
import Footer from '~/components/common/Footer.vue';
import CategoryTree from '~/components/CategoryTree.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// Banner图片路径
const bannerImage = ref('/images/banner1.png');

// 定义跳转商品详情页方法
const goToGoodsDetail = (goodsId) => {
  // 方式1：通过路由name跳转（推荐，参数更清晰）
  router.push({
    path: '/goods-detail?id=' + goodsId, 
    // params: { id: goodsId } // 传递商品ID到详情页
  });

  // 方式2：通过path跳转（需拼接参数）
  // router.push(`/goods-detail/${goodsId}`);
};
// 跳转商品列表页并传参
const goToGoodsList = (level2Id, level3Id, categoryName) => {
  router.push({
    path: '/goods-list', // 对应路由配置的name
    query: { // 用query传参（刷新不丢失，适合分类筛选）
      level2Id: level2Id, // 二级分类ID
      level3Id: level3Id, // 三级分类ID
      categoryName: categoryName // 分类名称（可选，用于页面标题）
    }
  });
};
// 1. 分类标签列表（单选）+ 对应商品数据
const productTags = ref([
  {
    name: "无纺布针刺毯",
    products: [
      { id: 1, image: '/images/product.png', name: "MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋", price: 129, originalPrice: 299, isHot: true },
      { id: 2, image: '/images/product.png', name: "MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋", price: 129, originalPrice: 299, isHot: false },
      { id: 3, image: '/images/product.png', name: "MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋 MX芳纶系列滤袋", price: 129, originalPrice: 299, isHot: false },
      { id: 4, image: '/images/product.png', name: "MX芳纶系列滤袋 MX芳纶系列滤袋", price: 129, originalPrice: 299, isHot: false }
    ]
  },
  {
    name: "机织过滤布",
    products: [
      { id: 5, image: '/images/product.png', name: "工业滤布-高温机织滤布", price: 159, originalPrice: 359, isHot: true },
      { id: 6, image: '/images/product.png', name: "食品级滤布-淀粉过滤布", price: 149, originalPrice: 329, isHot: false },
      { id: 7, image: '/images/product.png', name: "耐酸碱机织滤布-化工专用", price: 169, originalPrice: 389, isHot: false },
      { id: 8, image: '/images/product.png', name: "耐磨机织滤布-矿山专用", price: 179, originalPrice: 419, isHot: false }
    ]
  },
  {
    name: "过滤网带/干网",
    products: [
      { id: 9, image: '/images/product.png', name: "耐高温过滤网带-烘干专用", price: 229, originalPrice: 529, isHot: false },
      { id: 10, image: '/images/product.png', name: "食品级干网-烘焙专用", price: 219, originalPrice: 499, isHot: true },
      { id: 11, image: '/images/product.png', name: "耐腐蚀过滤网带-化工专用", price: 249, originalPrice: 569, isHot: false },
      { id: 12, image: '/images/product.png', name: "高透过滤网带-医药专用", price: 239, originalPrice: 549, isHot: false }
    ]
  },
  {
    name: "透气层布",
    products: [
      { id: 13, image: '/images/product.png', name: "高透气层布-环保专用", price: 189, originalPrice: 429, isHot: false },
      { id: 14, image: '/images/product.png', name: "防水透气层布-户外专用", price: 199, originalPrice: 459, isHot: false },
      { id: 15, image: '/images/product.png', name: "耐磨透气层布-工业专用", price: 209, originalPrice: 489, isHot: true },
      { id: 16, image: '/images/product.png', name: "抗菌透气层布-医疗专用", price: 219, originalPrice: 499, isHot: false }
    ]
  },
  {
    name: "化纤",
    products: [
      { id: 17, image: '/images/product.png', name: "涤纶化纤-高弹型", price: 99, originalPrice: 229, isHot: false },
      { id: 18, image: '/images/product.png', name: "丙纶化纤-耐酸碱型", price: 109, originalPrice: 249, isHot: false },
      { id: 19, image: '/images/product.png', name: "锦纶化纤-高强度型", price: 119, originalPrice: 269, isHot: false },
      { id: 20, image: '/images/product.png', name: "芳纶化纤-耐高温型", price: 129, originalPrice: 299, isHot: true }
    ]
  }
]);

// 2. 选中的标签（默认第一个）
const activeTag = ref(productTags.value[0].name);

// 3. 切换标签方法（单选）
const switchTag = (tagName) => {
  activeTag.value = tagName;
};

// 4. 计算属性：当前选中标签对应的商品列表
const currentProducts = computed(() => {
  const targetTag = productTags.value.find(tag => tag.name === activeTag.value);
  return targetTag ? targetTag.products : [];
});
</script>

<style lang="scss" scoped>
// 1. 主体容器宽度1200px居中
.main-container {
  width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.right-area {
  flex: 1;
}

/* Banner样式（保持高度400px） */
.banner {
  width: 100%;
  height: 400px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

/* 2. 分类标签样式（严格匹配要求） */
.product-tags {
  margin-bottom: 20px;
  display: flex;
  gap: 10px; // 标签间距

  .tag-item {
    // 未选中样式
    // width: 102px;
	padding: 0 16px;
    height: 42px;
    line-height: 42px; // 文字垂直居中
    text-align: center;
    border-radius: 4px;
    background: #FFFFFF;
    box-sizing: border-box;
    border: 1px solid #DCDEE2;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;

    // 选中样式
    &.active {
      // width: 116px;
      height: 42px;
      background: #E1F5F9;
      border-color: #E1F5F9; // 选中时边框同背景色
      color: #3799AE;
      font-weight: 500;
    }

    &:hover:not(.active) {
      border-color: #3799AE;
      color: #3799AE;
    }
  }
}
.product-wrapper {
	padding: 20px 0;
	background: #ffffff;
	border-radius: 8px;
}

/* 商品展示卡片（单个卡片） */
.product-block {
  background: #ffffff;
  padding: 0px 20px 20px;
  border-radius: 8px;
  // margin-bottom: 30px;
}
.block-img {
	height: 300px;
	margin-bottom:20px;
	img {
		width: 100%;
		height: 100%;
		border-radius: 8px;
	}
}
/* 卡片头部：分类名称+更多按钮（两端对齐） */
.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .block-title {
    font-size: 20px;
    font-weight: 600;
    color: #2F3032;
  }

  .more-btn {
    color: #666;
    text-decoration: none;
    font-size: 14px;

    &:hover {
      color: #3799AE;
    }
  }
}

/* 商品网格（4列，无大图片） */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 商品卡片样式 */
.product-card {
  position: relative;
  text-align: center;
  cursor: pointer;

  // 热卖标签
  .tag-hot {
    position: absolute;
    top: 10px;
    left: 10px;
    background: #FF672B;
    color: #fff;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    z-index: 10;
  }

  // 商品图片
  .product-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 12px;
  }

  // 商品名称（两行省略）
  .product-name {
    font-size: 14px;
    color: #333;
    line-height: 1.5;
    height: 42px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 8px;
  }

  // 价格区域
  .product-price {
    font-size: 16px;

    .current-price {
      color: #F53F3F;
      font-weight: 600;
    }

    .original-price {
      color: #999;
      font-size: 12px;
      text-decoration: line-through;
      margin-left: 8px;
    }
  }
}

/* 3. Footer宽度匹配1200px */
:deep(.footer-container) {
  width: 1200px !important;
  margin: 0 auto;
}
</style>