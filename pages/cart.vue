<template>
  <div class="cart-page">
    <!-- 公共页首 -->
    <Header />

    <!-- 购物车主体区域 -->
    <div class="main-container">
      <!-- 面包屑 -->
      <div class="breadcrumb">
        <span class="breadcrumb-item" @click="goToHome">首页</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item">购物车</span>
      </div>

      <!-- 购物车核心区域 -->
      <div class="cart-core">
        <!-- 有商品状态（图1） -->
        <div class="cart-has-goods" v-if="cartList.length > 0">
          <!-- 表头 -->
		  <div class="cart-has-goods-content">
          <div class="cart-header">
            <div class="cart-col select-col">
              <!-- 自定义复选框容器 -->
              <label class="custom-checkbox">
                <input type="checkbox" v-model="isAllChecked" class="checkbox-input">
                <span class="checkbox-icon"></span>
                <span class="checkbox-text">全选</span>
              </label>
            </div>
            <div class="cart-col goods-col">商品</div>
            <div class="cart-col price-col">单价</div>
            <div class="cart-col count-col">数量</div>
            <div class="cart-col subtotal-col">小计</div>
            <div class="cart-col opt-col">操作</div>
          </div>

          <!-- 商品列表 -->
          <div class="cart-goods-list">
            <div class="cart-goods-item" v-for="(item, idx) in cartList" :key="idx">
              <div class="cart-col select-col">
                <!-- 自定义复选框容器 -->
                <label class="custom-checkbox">
                  <input type="checkbox" v-model="item.checked" @change="checkSingle" class="checkbox-input">
                  <span class="checkbox-icon"></span>
                </label>
              </div>
              <div class="cart-col goods-col">
                <img :src="item.img" alt="商品图" class="goods-img">
                <div class="goods-info">
                  <div class="goods-name">{{ item.name }}</div>
                  <div class="goods-spec">{{ item.spec }}</div>
                </div>
              </div>
              <div class="cart-col price-col">
                <span class="current-price">¥{{ item.price }}</span>
                <span class="original-price">¥{{ item.originalPrice }}</span>
              </div>
              <div class="cart-col count-col">
                <button class="count-btn minus-btn" @click="changeCount(idx, 'minus')" :disabled="item.count <= 1">
                  -
                </button>
                <span class="count-num">{{ item.count }}</span>
                <button class="count-btn plus-btn" @click="changeCount(idx, 'plus')">
                  +
                </button>
              </div>
              <div class="cart-col subtotal-col">
                <span class="subtotal-price">¥{{ (item.price * item.count).toFixed(0) }}</span>
              </div>
              <div class="cart-col opt-col">
                <button class="delete-btn" @click="deleteGoods(idx)">删除</button>
              </div>
            </div>
          </div>
		  </div>
          <!-- 底部操作栏 -->
          <div class="cart-footer">
            <div class="footer-left">
              <!-- 自定义复选框容器 -->
              <label class="custom-checkbox">
                <input type="checkbox" v-model="isAllChecked" class="checkbox-input">
                <span class="checkbox-icon"></span>
                <span class="checkbox-text">全选</span>
              </label>
              <button class="delete-selected-btn" @click="deleteSelected" :disabled="selectedCount === 0">
                删除选中商品
              </button>
            </div>
            <div class="footer-right">
              <div class="total-amount">
                总计: <span class="total-price">¥{{ totalAmount.toFixed(0) }}</span>
              </div>
              <button class="settle-btn" :disabled="selectedCount === 0">
                结算 ({{ selectedCount }})
              </button>
            </div>
          </div>
        </div>

        <!-- 空购物车状态（图2） -->
        <div class="cart-empty" v-else>
          <img src="/images/empty-cart.png" alt="空购物车图标" class="empty-cart-icon">
          <div class="empty-text">您的购物车暂时没有商品</div>
          <button class="go-shop-btn" @click="goToHome">去购物</button>
        </div>
      </div>

      <!-- 猜您喜欢（复用组件） -->
      <GuessYouLike 
        fromPage="cart" 
        relateKey="" 
        :goodsList="guessGoods"
      />
    </div>

    <!-- 公共页尾 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import GuessYouLike from '@/components/GuessYouLike.vue';

const router = useRouter();
// const cartList = ref([])
// 购物车商品数据（模拟）
const cartList = ref([
  {
    id: 'cart001',
    img: '/images/product.png',
    name: 'nova Flip5 256GB 星耀黑 双卡全网通版',
    spec: '规格信息规格信息',
    price: 499,
    originalPrice: 4999,
    count: 2,
    checked: true
  },
  {
    id: 'cart002',
    img: '/images/product.png',
    name: 'nova Flip5 256GB 星耀黑 双卡全网通版',
    spec: '规格信息规格信息',
    price: 499,
    originalPrice: 4999,
    count: 2,
    checked: true
  }
  // 清空数组可切换为空购物车状态
]);

// 全选状态
const isAllChecked = ref(true);

// 选中商品数量（计算属性）
const selectedCount = computed(() => {
  return cartList.value.filter(item => item.checked).reduce((sum, item) => sum + item.count, 0);
});

// 总计金额（计算属性）
const totalAmount = computed(() => {
  return cartList.value.filter(item => item.checked).reduce((sum, item) => sum + (item.price * item.count), 0);
});

// 猜您喜欢商品数据（模拟）
const guessGoods = ref([
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '129',
    originalPrice: '299'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '129',
    originalPrice: '299'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '129',
    originalPrice: '299'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋 MX芳纶系列滤袋',
    price: '129',
    originalPrice: '299'
  }
]);

// 监听全选状态
watch(isAllChecked, (newVal) => {
  cartList.value.forEach(item => {
    item.checked = newVal;
  });
});

// 单个商品选中状态变化，同步全选
const checkSingle = () => {
  const allChecked = cartList.value.every(item => item.checked);
  isAllChecked.value = allChecked;
};

// 数量变更
const changeCount = (idx, type) => {
  if (type === 'minus') {
    cartList.value[idx].count--;
  } else {
    cartList.value[idx].count++;
  }
};

// 删除单个商品
const deleteGoods = (idx) => {
  cartList.value.splice(idx, 1);
  // 重新检查全选状态
  checkSingle();
};

// 删除选中商品
const deleteSelected = () => {
  cartList.value = cartList.value.filter(item => !item.checked);
  // 重置全选状态
  isAllChecked.value = cartList.value.length > 0;
};

// 跳转首页
const goToHome = () => {
  router.push('/');
};

// 结算（实际项目中跳转结算页）
const settle = () => {
  // 示例：跳转结算页并携带选中商品
  const selectedGoods = cartList.value.filter(item => item.checked);
  router.push({
    path: '/settle',
    query: { goods: JSON.stringify(selectedGoods) }
  });
};
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  /* background: #F8F9FA; */
}

.main-container {
  width: 1200px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 14px;
}

/* 面包屑样式 */
.breadcrumb {
  font-size: 14px;
  color: #838486;
  margin-bottom: 20px;
}
.breadcrumb-item {
  cursor: pointer;
  transition: color 0.2s;
}
.breadcrumb-item:hover {
  color: #3799AE;
}
.breadcrumb-sep {
  margin: 0 4px;
}

/* 购物车核心区域 */
.cart-core {
  margin-bottom: 40px;
}

/* 自定义复选框样式（核心优化点1） */
.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.checkbox-input {
  display: none; /* 隐藏原生复选框 */
}
.checkbox-icon {
  width: 16px;
  height: 16px;
  border: 1px solid #DCDEE2;
  border-radius: 2px;
  display: inline-block;
  position: relative;
  margin-right: 4px;
  transition: all 0.2s;
}
/* 选中状态 - 主题色（#3799AE） */
.checkbox-input:checked + .checkbox-icon {
  background-color: #3799AE;
  border-color: #3799AE;
}
/* 选中对勾 */
.checkbox-input:checked + .checkbox-icon::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid #FFFFFF;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.checkbox-text {
  font-size: 14px;
  color: #838486;
}

/* 有商品购物车样式 */
.cart-has-goods {
  /* border: 1px solid #ECEEF2; */
  /* border-radius: 8px; */
  /* overflow: hidden; */
}
.cart-has-goods-content {
	/* border: 1px solid #ECEEF2; */
	border-radius: 8px;
	overflow: hidden;
}
/* 购物车表头 */
.cart-header {
  display: flex;
  background: #ffffff;
  padding: 12px 20px;
  font-size: 14px;
  color: #838486;
  border-bottom: 1px solid #ECEEF2;
}

.cart-goods-list {
	 background: #ffffff;
	 border-bottom-right-radius: 8px;
	 border-bottom-left-radius: 8px;
}
.cart-col {
  display: flex;
  align-items: center;
}
.select-col {
  width: 80px;
}
.goods-col {
  flex: 1;
}
.price-col {
  width: 120px;
  justify-content: center;
}
.count-col {
  width: 120px;
  justify-content: center;
}
.subtotal-col {
  width: 120px;
  justify-content: center;
}
.opt-col {
  width: 80px;
  justify-content: center;
}

/* 商品列表项 */
.cart-goods-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ECEEF2;
}
.goods-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}
.goods-info {
  flex: 1;
}
.goods-name {
  font-size: 14px;
  color: #272727;
  margin-bottom: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.goods-spec {
  font-size: 12px;
  color: #838486;
}
.current-price {
  font-size: 14px;
  color: #F72B1C;
  margin-right: 8px;
}
.original-price {
  font-size: 12px;
  color: #838486;
  text-decoration: line-through;
}
.count-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ECEEF2;
  background: #FFFFFF;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.count-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.count-num {
  width: 40px;
  text-align: center;
  font-size: 14px;
}
.subtotal-price {
  font-size: 14px;
  color: #F72B1C;
}
/* 单个删除按钮 - hover主题色（核心优化点2） */
.delete-btn {
  border: none;
  background: transparent;
  color: #838486;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}
.delete-btn:hover {
  color: #3799AE; /* 替换原红色为主题色 */
}

/* 购物车底部操作栏 */
.cart-footer {
  margin-top:20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 8px;
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
/* 删除选中商品按钮 - hover主题色（核心优化点2） */
.delete-selected-btn {
  border: none;
  background: transparent;
  color: #838486;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}
.delete-selected-btn:hover:not(:disabled) {
  color: #3799AE; /* 替换原默认色为主题色 */
}
.delete-selected-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.total-amount {
  font-size: 14px;
  color: #838486;
}
.total-price {
  font-size: 18px;
  color: #F72B1C;
  font-weight: bold;
}
.settle-btn {
  width: 120px;
  height: 44px;
  border: none;
  background: #4FA2B4;
  color: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.settle-btn:disabled {
  background: #ECEEF2;
  color: #838486;
  cursor: not-allowed;
}

/* 空购物车样式 */
.cart-empty {
  text-align: center;
  padding: 60px 0;
}
.empty-cart-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  opacity: 0.5;
}
.empty-text {
  font-size: 14px;
  color: #838486;
  margin-bottom: 20px;
}
.go-shop-btn {
  padding: 10px 24px;
  border: none;
  background: #4FA2B4;
  color: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
</style>