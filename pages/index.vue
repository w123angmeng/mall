<template>
  <div>
    <Header />
	<main class="main-container">
      <div class="content-wrapper">
        <CategoryTree />
        <div class="right-area">
          <div class="banner">
			  
            <t-swiper :navigation="{ size: 'large' }">
              <t-swiper-item v-for="item in bannerList" :key="item.id">
                <div style="height:400px;">
                  <img :src="item.image || '/images/banner1.png'" alt="banner图" class="banner-img" style="height:100%;width:100%;object-fit: cover;"/>
                </div>
              </t-swiper-item>
            </t-swiper>
          </div>
        </div>
      </div>
	  
	  <div class="product-wrapper">
	  <section class="product-block">
	  			<div class="product-tags">
	  			  <span 
	  			    class="tag-item"
	  			    :class="{ active: activeTag === tag.name }"
	  			    v-for="tag in hotGoodsList" 
	  			    :key="tag.name"
	  			    @click="switchTag(tag.name)"
	  			  >
	  			    {{ tag.name }}
	  			  </span>
	  			</div>
	    <!-- <div class="block-header">
	      <h3 class="block-title">{{ activeTag }}</h3>
	      <a class="more-btn" @click="goToGoodsList('filter-bag', 'mx9-series', '滤袋系列')">更多 ></a>
	    </div> -->
	    <div class="product-grid">
	      <div class="product-card" v-for="(item, idx) in currentProducts" :key="item.id" @click="goToGoodsDetail(item.id)">
	        <div class="tag-hot" v-if="item.isHot">热卖</div>
	        <img :src="item.image || '/images/product.png'" alt="商品图" class="product-img" />
	        <p class="product-name">{{ item.productName || '默认商品名称' }}</p>
	        <div class="product-price">
	          <span class="current-price">¥{{ item.salePrice || '-'}}</span>
	          <span class="original-price">¥{{ item.strikePrice || '-'}}</span>
	        </div>
	      </div>
	    </div>
	  </section>
	  
	  <section class="product-block" v-for="(item, idx) in recommendList">
	    <div class="block-header">
	      <h3 class="block-title">{{item.categoryName}}</h3>
	      <a href="#" class="more-btn">更多 ></a>
	    </div>
		
	  			<div class="block-img" v-if="item.products?.length && !item.products[0].mainDisplay"  @click="goToGoodsDetail(item.products[0].id)" >
	  				<img :src="item.products[0].image || '/images/big-product.png'" alt=""/>
	  			</div>
	    <div class="product-grid" v-if="item.products?.length">
	      <div class="product-card" v-for="(product, idx) in item.products.slice(1)" :key="item.id" @click="goToGoodsDetail(product.id)">
	        <div class="tag-hot" v-if="product.isHot">热卖</div>
	        <img :src="product.image || '/images/product.png'" alt="商品图" class="product-img" />
	        <p class="product-name">{{ product.productName || '默认商品' }}</p>
	        <div class="product-price">
	          <span class="current-price">¥{{ product.salePrice || '-'}}</span>
	          <span class="original-price">¥{{ product.strikePrice || '-'}}</span>
	        </div>
	      </div>
	    </div>
	  </section>
	  </div>
    </main>
    <!-- <Footer :footerInfo="footerInfo" /> -->
	<Footer />
  </div>
</template>

<script setup>
import Header from '~/components/common/Header.vue';
import Footer from '~/components/common/Footer.vue';
import CategoryTree from '~/components/CategoryTree.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncData } from '#imports';
import { 
  getHomeBannerList, 
  getHomeCategoryList, 
  getHomeHotGoodsList, 
  getHomeRecommendList,
  // getHomeFooterInfo
} from '@/apis/home';

const router = useRouter();

// 基础模拟数据（兜底用）
const defaultBannerList = [{ id: 1, image: '/images/banner1.png' }];
const defaultCategoryList = [
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
];
const defaultHotGoodsList = defaultCategoryList[0].products;
const defaultRecommendList = defaultCategoryList[1].products;
const defaultFooterInfo = {
  guideList: Array.from({ length: 18 }, (_, i) => ({ id: i + 1, name: "分类一型" })),
  serviceList: [
    { id: 1, name: "帮助中心" },
    { id: 2, name: "售后政策" },
    { id: 3, name: "私人定制" },
    { id: 4, name: "严牌官网" }
  ],
  contactPhone: "400-826-6678",
  contactEmail: "service@yanpai.com",
  copyright: "Copyright Yanpai Filtration Technology Co., Ltd.",
  recordInfo: "备案号:浙ICP备11060044号-8"
};

// 服务端异步获取数据（SSR兼容）
const { data: bannerRes } = useAsyncData('homeBanner', () => getHomeBannerList(), {
  // default: () => defaultBannerList,
  transform: (res) => res.data && res.data.length ? res.data : defaultBannerList,
  server: false
});
const { data: categoryRes } = useAsyncData('homeCategory', () => getHomeCategoryList(), {
  default: () => defaultCategoryList,
  transform: (res) => res.data && res.data.length ? res.data : defaultCategoryList,
});
const { data: hotGoodsRes } = useAsyncData('homeHotGoods', () => getHomeHotGoodsList(), {
  default: () => defaultHotGoodsList,
  transform: (res) => res.data && res.data.length ? res.data : defaultHotGoodsList,
  server: false
});
const { data: recommendRes } = useAsyncData('homeRecommend', () => getHomeRecommendList(), {
  default: () => defaultRecommendList,
  transform: (res) => res.data && res.data.length ? res.data : defaultRecommendList,
  server: false
});
// const { data: footerRes } = useAsyncData('homeFooter', () => getHomeFooterInfo(), {
//   default: () => defaultFooterInfo,
//   transform: (res) => res.data ? res.data : defaultFooterInfo,
//   server: false
// });

// 响应式数据
// const bannerList = ref(bannerRes.value);
// const categoryList = ref(categoryRes.value);
// const hotGoodsList = ref(hotGoodsRes.value);
// const recommendList = ref(recommendRes.value);
// const footerInfo = ref(footerRes.value);
// const activeTag = ref(categoryList.value[0].name);

const bannerList = computed(() => bannerRes.value || defaultBannerList);
const categoryList = computed(() => categoryRes.value);
const hotGoodsList = computed(() => hotGoodsRes.value);
const recommendList = computed(() => recommendRes.value);
const footerInfo = computed(() => footerRes.value);
const activeTag = ref(categoryList.value[0].name || '名称');

// 方法
const goToGoodsDetail = (goodsId) => {
 console.log('goToGoodsDetail:', goodsId)
  router.push({
    path: `/goods-detail/${goodsId}`,
  });
};

const goToGoodsList = (level2Id, level3Id, categoryName) => {
  router.push({
    path: '/goods-list',
    query: {
      level2Id: level2Id,
      level3Id: level3Id,
      categoryName: categoryName
    }
  });
};

const switchTag = (tagName) => {
  activeTag.value = tagName;
  console.log('switchTag activeTag.value:', activeTag.value, tagName)
};

// 计算属性
const currentProducts = computed(() => {
  const targetTag = hotGoodsList.value.find(tag => tag.name === activeTag.value);
  return targetTag ? targetTag.products : [];
});
</script>

<style lang="scss" scoped>
.main-container {
  width: 1200px;
  margin: 0 auto;
  padding: 5px 0 20px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.right-area {
  flex: 1;
}

.banner {
  width: 100%;
  height: 400px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.product-tags {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;

  .tag-item {
	padding: 0 16px;
    height: 42px;
    line-height: 42px;
    text-align: center;
    border-radius: 4px;
    background: #FFFFFF;
    box-sizing: border-box;
    border: 1px solid #DCDEE2;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      height: 42px;
      background: #E1F5F9;
      border-color: #E1F5F9;
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

.product-block {
  background: #ffffff;
  padding: 0px 20px 20px;
  border-radius: 8px;
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  position: relative;
  text-align: center;
  cursor: pointer;

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

  .product-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 12px;
  }

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

:deep(.footer-container) {
  width: 1200px !important;
  margin: 0 auto;
}
</style>