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
              <div class="cart-goods-item" v-for="(item, idx) in cartList" :key="item.cartId">
                <div class="cart-col select-col">
                  <!-- 自定义复选框容器 -->
                  <label class="custom-checkbox">
                    <input type="checkbox" v-model="item.checked" @change="checkSingle" class="checkbox-input">
                    <span class="checkbox-icon"></span>
                  </label>
                </div>
                <div class="cart-col goods-col">
                  <img :src="item.firstImage || '/images/product.png'" alt="商品图" class="goods-img">
                  <div class="goods-info">
                    <div class="goods-name">{{ item.productName }}</div>
                    <div class="goods-spec">{{ item.specText || '无规格' }}</div>
                  </div>
                </div>
                <div class="cart-col price-col">
                  <span class="current-price">¥{{ item.salePrice }}</span>
                  <span class="original-price">¥{{ item.strikePrice }}</span>
                </div>
                <div class="cart-col count-col">
                  <button class="count-btn minus-btn" @click="changeCount(item, 'minus')" :disabled="item.cartNum <= 1">
                    -
                  </button>
                  <span class="count-num">{{ item.cartNum }}</span>
                  <button class="count-btn plus-btn" @click="changeCount(item, 'plus')">
                    +
                  </button>
                </div>
                <div class="cart-col subtotal-col">
                  <span class="subtotal-price">¥{{ (item.salePrice * item.cartNum).toFixed(0) }}</span>
                </div>
                <div class="cart-col opt-col">
                  <button class="delete-btn" @click="showDeleteConfirm(item.cartId)">删除</button>
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
              <button class="delete-selected-btn" @click="showBatchDeleteConfirm" :disabled="selectedCount === 0">
                删除选中商品
              </button>
            </div>
            <div class="footer-right">
              <div class="total-amount">
                总计: <span class="total-price">¥{{ totalAmount.toFixed(0) }}</span>
              </div>
              <button class="settle-btn" :disabled="selectedCount === 0" @click="handleSettle">
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from '#app';
// 导入 TDesign 提示组件
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import GuessYouLike from '@/components/GuessYouLike.vue';
// 参考user.js的调用方式，导入getCartApi
import { getCartApi } from '@/apis/cart';

const router = useRouter();
// 核心：在setup函数内初始化cartApi（确保Nuxt上下文）
const cartApi = getCartApi();

// 购物车商品数据
const cartList = ref([]);
// 全选状态
const isAllChecked = ref(false);
// 猜您喜欢商品数据
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

// 加载购物车列表（调用方式参考user.js）
const loadCartList = async () => {
  try {
    const res = await cartApi.getCartList();
    if (res.code === 200) {
      // 给每个商品添加选中状态
      cartList.value = res.data.map(item => ({
        ...item,
        checked: false // 默认未选中
      }));
      // 初始化全选状态
      checkSingle();
    } else {
      console.error('获取购物车列表失败：', res.msg);
      MessagePlugin.error(`获取购物车失败：${res.msg || '系统异常'}`);
      cartList.value = [];
    }
  } catch (error) {
    console.error('获取购物车列表异常：', error);
    MessagePlugin.error('获取购物车失败，请稍后重试');
    cartList.value = [];
  }
};

// 选中商品数量（计算属性）
const selectedCount = computed(() => {
  return cartList.value.filter(item => item.checked).reduce((sum, item) => sum + item.cartNum, 0);
});

// 总计金额（计算属性）
const totalAmount = computed(() => {
  return cartList.value.filter(item => item.checked).reduce((sum, item) => sum + (item.salePrice * item.cartNum), 0);
});

// 监听全选状态
watch(isAllChecked, (newVal) => {
  cartList.value.forEach(item => {
    item.checked = newVal;
  });
});

// 单个商品选中状态变化，同步全选
const checkSingle = () => {
  if (cartList.value.length === 0) {
    isAllChecked.value = false;
    return;
  }
  const allChecked = cartList.value.every(item => item.checked);
  isAllChecked.value = allChecked;
};

// 数量变更
const changeCount = async (item, type) => {
  try {
    let newCount = item.cartNum;
    if (type === 'minus') {
      newCount = Math.max(1, item.cartNum - 1);
    } else {
      newCount = item.cartNum + 1;
    }
    
    // 调用更新数量接口（参考user.js调用风格）
    const res = await cartApi.updateCartNum({
      cartId: item.cartId,
      cartNum: newCount
    });
    
    if (res.code === 200) {
      // 更新本地数据
      item.cartNum = newCount;
      MessagePlugin.success('数量更新成功');
    } else {
      MessagePlugin.error(`更新数量失败：${res.msg || '系统异常'}`);
    }
  } catch (error) {
    console.error('更新购物车数量异常：', error);
    MessagePlugin.error('更新数量失败，请稍后重试');
  }
};

// 单个商品删除确认弹窗
const showDeleteConfirm = (cartId) => {
  DialogPlugin.confirm({
    title: '确认删除',
    content: '确定要删除该商品吗？',
    confirmBtn: { content: '确认' },
    cancelBtn: { content: '取消' },
    onConfirm: () => deleteGoods(cartId),
    onCancel: () => MessagePlugin.info('已取消删除')
  });
};

// 批量删除确认弹窗
const showBatchDeleteConfirm = () => {
  const selectedItems = cartList.value.filter(item => item.checked);
  if (selectedItems.length === 0) return;

  DialogPlugin.confirm({
    title: '确认删除',
    content: '确定要删除选中的商品吗？',
    confirmBtn: { content: '确认' },
    cancelBtn: { content: '取消' },
    onConfirm: deleteSelected,
    onCancel: () => MessagePlugin.info('已取消删除')
  });
};

// 删除单个商品
const deleteGoods = async (cartId) => {
  try {
    const res = await cartApi.deleteCartItem(cartId);
    if (res.code === 200) {
      // 更新本地数据
      cartList.value = cartList.value.filter(item => item.cartId !== cartId);
      // 重新检查全选状态
      checkSingle();
      MessagePlugin.success('删除成功');
    } else {
      MessagePlugin.error(`删除失败：${res.msg || '系统异常'}`);
    }
  } catch (error) {
    console.error('删除购物车商品异常：', error);
    MessagePlugin.error('删除失败，请稍后重试');
  }
};

// 删除选中商品
const deleteSelected = async () => {
  const selectedItems = cartList.value.filter(item => item.checked);
  if (selectedItems.length === 0) return;
  
  try {
    // 批量删除（如果后端支持批量接口，可优化为批量请求）
    const deletePromises = selectedItems.map(item => cartApi.deleteCartItem(item.cartId));
    const results = await Promise.all(deletePromises);
    
    // 检查是否全部删除成功
    const allSuccess = results.every(res => res.code === 200);
    if (allSuccess) {
      // 更新本地数据
      cartList.value = cartList.value.filter(item => !item.checked);
      // 重置全选状态
      isAllChecked.value = cartList.value.length > 0;
      MessagePlugin.success('删除选中商品成功');
    } else {
      MessagePlugin.warning('部分商品删除失败，请稍后重试');
      // 重新加载购物车列表
      loadCartList();
    }
  } catch (error) {
    console.error('批量删除购物车商品异常：', error);
    MessagePlugin.error('删除失败，请稍后重试');
    loadCartList();
  }
};

// 结算处理
const handleSettle = () => {
  const selectedGoods = cartList.value.filter(item => item.checked);
  if (selectedGoods.length === 0) {
    MessagePlugin.warning('请选择要结算的商品');
    return;
  }
  
  // 跳转结算页并携带选中商品
  router.push({
    path: '/settle',
    query: { goods: JSON.stringify(selectedGoods) }
  });
};

// 跳转首页
const goToHome = () => {
  router.push('/');
};

// 页面挂载时加载购物车数据
onMounted(() => {
  loadCartList();
});
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
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

/* 自定义复选框样式 */
.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.checkbox-input {
  display: none;
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
.checkbox-input:checked + .checkbox-icon {
  background-color: #3799AE;
  border-color: #3799AE;
}
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
  margin-bottom: 20px;
}
.cart-has-goods-content {
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
.delete-btn {
  border: none;
  background: transparent;
  color: #838486;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}
.delete-btn:hover {
  color: #3799AE;
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
.delete-selected-btn {
  border: none;
  background: transparent;
  color: #838486;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}
.delete-selected-btn:hover:not(:disabled) {
  color: #3799AE;
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