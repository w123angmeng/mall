<template>
  <div class="order-manage-component">
    <!-- 1. 订单状态Tab栏（循环数组） -->
    <div class="order-tabs">
      <div 
        class="tab-item" 
        v-for="tab in tabList" 
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.name }} ({{ tab.count }})
      </div>
    </div>

    <!-- 加载中状态 -->
    <div class="loading-container" v-if="isLoading">
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 2. 订单列表（每个订单是独立Table） -->
    <div class="order-list" v-else-if="filteredOrders.length">
      <div class="order-item" v-for="(order, oIdx) in filteredOrders" :key="order.id">
        <table class="order-table">
          <!-- 表格表头 -->
          <thead>
            <tr>
              <th class="th-detail">订单详情</th>
              <th class="th-amount">订单金额</th>
              <th class="th-action">订单状态及操作</th>
            </tr>
			<tr>
			  <th class="th-detail" :colspan="3">
				<div class="order-header-bar">
				  <div class="order-header-left">
				    <span class="order-time">{{ order.createTime }}</span>
				    <span class="order-no">订单号：{{ order.orderNo }}</span>
				  </div>
				  <span class="order-status">{{ order.statusName }}</span>
				</div>
			</th>
			</tr>
          </thead>
          <tbody>
            <!-- 商品行：每个商品一行 -->
            <tr class="product-row" v-for="(product, pIdx) in order.orderItems" :key="pIdx">
              <td class="td-detail">
                <div class="product-item">
                  <img :src="product.productImage || '/images/order-goods.png'" alt="商品图" class="product-img">
                  <div class="product-info">
                    <div class="product-name">{{ product.productName }}</div>
                    <div class="product-spec">{{ product.singleSpec || product.specJson || '无规格' }}</div>
                  </div>
                  <div class="product-count">×{{ product.payNum }}</div>
                  <div class="product-price">¥{{ product.productPrice }}</div>
                </div>
              </td>
			  <td
			    class="td-amount"
				v-if="pIdx == 0"
			    :rowspan="order.orderItems.length"
			  >
			    ¥{{ order.payAmount }}
			  </td>
			  <!-- 订单操作列：合并订单头+商品行 -->
			  <td 
			    class="td-action" 
				v-if="pIdx == 0"
			    :rowspan="order.orderItems.length"
			  >
			    <div class="action-status">{{ order.actionStatus }}</div>
			    <div class="action-btn-group">
			      <div 
			        class="action-btn" 
			        v-for="(btn, bIdx) in getActionBtns(order)" 
			        :key="bIdx"
			        @click="handleAction(btn, order)"
			      >
			        {{ btn.name }}
			      </div>
			    </div>
			  </td>
            </tr>
          </tbody>
        </table>
      </div>
	  
	  <!-- 分页组件：绑定分页对象中的数据，监听分页事件 -->
	  <div class="pagination-wrap">
	    <t-pagination 
	      :total="pagination.totalCount" 
	      :page-size="pagination.pageSize"
	      v-model="pagination.currentPage"
	      @change="handlePageChange"
	    />
	  </div>
    </div>

    <!-- 3. 空状态 -->
    <div class="empty-container" v-else>
      <div class="empty-text">{{ emptyTitle }}</div>
      <div class="empty-desc">{{ emptyDesc }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { getOrderApi } from '@/apis/order'; // 导入订单API

// 初始化路由和订单API
const router = useRouter();
const orderApi = getOrderApi();

// ========== 1. 抽离状态常量，提升可维护性 ==========
// 订单状态与Tab的映射常量（统一管理，便于修改）
const ORDER_STATUS_MAP = {
  ALL: 'all',
  PENDING_PAYMENT: '0', // 待付款（支付状态）
  ORDERED: '1', // 已下单（订单状态）
  PRODUCING: '2', // 生产中（订单状态）
  PRODUCE_DONE: '3', // 生产完成（订单状态）
  SHIPPED: '4', // 已发货（订单状态）
  COMPLETED: '5' // 已完成（订单状态）
};

// Tab列表配置（基于常量定义，减少硬编码）
const tabList = ref([
  { key: ORDER_STATUS_MAP.ALL, name: '全部订单', count: 0 },
  { key: ORDER_STATUS_MAP.PENDING_PAYMENT, name: '待付款', count: 0 },
  { key: ORDER_STATUS_MAP.ORDERED, name: '已下单', count: 0 },
  { key: ORDER_STATUS_MAP.PRODUCING, name: '生产中', count: 0 },
  { key: ORDER_STATUS_MAP.PRODUCE_DONE, name: '生产完成', count: 0 },
  { key: ORDER_STATUS_MAP.SHIPPED, name: '已发货', count: 0 },
  { key: ORDER_STATUS_MAP.COMPLETED, name: '已完成', count: 0 }
]);

// ========== 2. 响应式数据 ==========
const activeTab = ref(ORDER_STATUS_MAP.ALL); // 当前激活的Tab
const isLoading = ref(false); // 加载状态
const orderList = ref([]); // 原始订单列表
// 分页数据整合为一个对象，包含当前页、每页条数、总条数
const pagination = ref({
  currentPage: 1, // 当前页码
  pageSize: 10, // 每页条数
  totalCount: 0 // 总记录数
});

// ========== 3. 计算属性 ==========
// 筛选当前Tab对应的订单
const filteredOrders = computed(() => {
  if (activeTab.value === ORDER_STATUS_MAP.ALL) return orderList.value;
  // 待付款Tab匹配支付状态0，其他Tab匹配订单状态
  if (activeTab.value === ORDER_STATUS_MAP.PENDING_PAYMENT) {
    return orderList.value.filter(order => order.payStatus === '0');
  }
  return orderList.value.filter(order => order.orderStatus.toString() === activeTab.value);
});

// 空状态文案
const emptyTitle = computed(() => {
  const currentTab = tabList.value.find(t => t.key === activeTab.value);
  return `暂无${currentTab?.name.replace(/\s\(\d+\)/, '')}订单`;
});
const emptyDesc = computed(() => '暂无相关订单数据，快去下单吧~');

// ========== 4. 方法定义 ==========
/**
 * 获取订单状态数量汇总
 */
const getOrderSummary = async () => {
  try {
    const res = await orderApi.getOrderSummary();
    if (res.code === 200 && res.data) {
      const summary = res.data;
      // 按状态常量映射汇总数据，避免硬编码
      tabList.value.forEach(tab => {
        switch (tab.key) {
          case ORDER_STATUS_MAP.ALL:
            tab.count = summary.totalNum || 0;
            break;
          case ORDER_STATUS_MAP.PENDING_PAYMENT:
            tab.count = summary.pendingPaymentNum || 0;
            break;
          case ORDER_STATUS_MAP.ORDERED:
            tab.count = summary.orderPlacedNum || 0;
            break;
          case ORDER_STATUS_MAP.PRODUCING:
            tab.count = summary.productionInProcessNum || 0;
            break;
          case ORDER_STATUS_MAP.PRODUCE_DONE:
            tab.count = summary.productionCompleteNum || 0;
            break;
          case ORDER_STATUS_MAP.SHIPPED:
            tab.count = summary.shippedNum || 0;
            break;
          case ORDER_STATUS_MAP.COMPLETED:
            tab.count = summary.completedNum || 0;
            break;
        }
      });
    }
  } catch (error) {
    console.error('获取订单汇总失败：', error);
    MessagePlugin.error('获取订单状态失败，请稍后重试');
  }
};

/**
 * 获取订单列表（适配接口入参规则：Query参数、字符串类型、payStatus/orderStatus可选）
 */
const getOrderList = async () => {
  try {
    isLoading.value = true;
    // 构造查询参数：严格按接口要求，pageSize/pageNum转为字符串，payStatus/orderStatus按需传递
    const params = {
      pageSize: pagination.value.pageSize.toString(), // 接口要求string类型
      pageNum: pagination.value.currentPage.toString() // 接口要求string类型
    };

    // 按需传递payStatus：仅当Tab为待付款时传递（0-待付款）
    if (activeTab.value === ORDER_STATUS_MAP.PENDING_PAYMENT) {
      params.payStatus = ORDER_STATUS_MAP.PENDING_PAYMENT;
    }

    // 按需传递orderStatus：非全部、非待付款时传递
    if (activeTab.value !== ORDER_STATUS_MAP.ALL && activeTab.value !== ORDER_STATUS_MAP.PENDING_PAYMENT) {
      params.orderStatus = activeTab.value;
    }

    const res = await orderApi.getOrderList(params);
    if (res.code === 200) {
      // 解构接口返回的分页数据
      const { rows = [], total = 0 } = res;
      orderList.value = rows.map(order => ({
        ...order,
        // 订单状态名称（后端返回或映射）
        statusName: order.statusName || getStatusName(order.orderStatus.toString(), order.payStatus),
        // 操作状态文案
        actionStatus: getActionStatusText(order.orderStatus.toString(), order.payStatus),
        // 订单创建时间格式化
        createTime: formatTime(order.createTime),
        // 补充订单扩展字段
        hasPay: order.hasPay ?? false,
        hasContract: order.hasContract ?? false,
        hasInvoice: order.hasInvoice ?? false,
        contractRejected: order.contractRejected ?? false,
        payRejected: order.payRejected ?? false
      }));
      // 更新分页总条数
      pagination.value.totalCount = total;
    }
  } catch (error) {
    console.error('获取订单列表失败：', error);
    MessagePlugin.error('获取订单列表失败，请稍后重试');
    orderList.value = [];
    pagination.value.totalCount = 0;
  } finally {
    isLoading.value = false;
  }
};

/**
 * 获取订单状态名称（兼容支付状态和订单状态）
 * @param {string} orderStatus - 订单状态
 * @param {string} payStatus - 支付状态
 * @returns {string} 状态名称
 */
const getStatusName = (orderStatus, payStatus) => {
  // 优先判断支付状态
  if (payStatus === '0') return '待付款';
  // 订单状态映射
  const nameMap = {
    [ORDER_STATUS_MAP.ORDERED]: '已下单',
    [ORDER_STATUS_MAP.PRODUCING]: '生产中',
    [ORDER_STATUS_MAP.PRODUCE_DONE]: '生产完成',
    [ORDER_STATUS_MAP.SHIPPED]: '已发货',
    [ORDER_STATUS_MAP.COMPLETED]: '已完成'
  };
  return nameMap[orderStatus] || '未知状态';
};

/**
 * 获取操作状态文案（兼容支付状态和订单状态）
 * @param {string} orderStatus - 订单状态
 * @param {string} payStatus - 支付状态
 * @returns {string} 操作状态文案
 */
const getActionStatusText = (orderStatus, payStatus) => {
  // 优先判断支付状态
  if (payStatus === '0') return '未付款';
  // 订单状态映射
  const textMap = {
    [ORDER_STATUS_MAP.ORDERED]: '补充合同',
    [ORDER_STATUS_MAP.PRODUCING]: '生产中',
    [ORDER_STATUS_MAP.PRODUCE_DONE]: '待发货',
    [ORDER_STATUS_MAP.SHIPPED]: '待收货',
    [ORDER_STATUS_MAP.COMPLETED]: '已完成'
  };
  return textMap[orderStatus] || '无操作';
};

/**
 * 根据订单属性获取操作按钮
 * @param {Object} order - 订单对象
 * @returns {Array} 操作按钮列表
 */
const getActionBtns = (order) => {
  const btnList = [];
  const orderStatus = order.orderStatus.toString();
  const payStatus = order.payStatus;

  // 1. 所有订单都有【订单详情】按钮
  btnList.push({ 
    name: '订单详情', 
    action: 'detail', 
    orderId: order.id, 
    scrollTo: 'order-detail'
  });

  // 2. 待付款订单展示【未付款】按钮
  if (payStatus === '0') {
    btnList.push({ 
      name: '未付款', 
      action: 'unpaid', 
      orderId: order.id, 
      scrollTo: 'pay-section'
    });
  }

  // 3. 没上传合同的订单展示【补充合同】按钮（非已完成状态）
  if (!order.hasContract && orderStatus !== ORDER_STATUS_MAP.COMPLETED) {
    btnList.push({ 
      name: '补充合同', 
      action: 'supplementContract', 
      orderId: order.id, 
      scrollTo: 'contract-section'
    });
  }

  // 4. 合同驳回展示【合同驳回】按钮
  if (order.contractRejected) {
    btnList.push({ 
      name: '合同驳回', 
      action: 'contractReject', 
      orderId: order.id, 
      scrollTo: 'contract-section'
    });
  }

  // 5. 付款驳回展示【付款驳回】按钮
  if (order.payRejected) {
    btnList.push({ 
      name: '付款驳回', 
      action: 'payReject', 
      orderId: order.id, 
      scrollTo: 'pay-section'
    });
  }

  // 6. 商家开了发票的订单展示【查看发票】按钮
  if (order.hasInvoice) {
    btnList.push({ 
      name: '查看发票', 
      action: 'invoice', 
      orderId: order.id, 
      scrollTo: 'invoice-section'
    });
  }

  // 7. 已发货状态的订单展示【确认收货】按钮
  if (orderStatus === ORDER_STATUS_MAP.SHIPPED) {
    btnList.push({ 
      name: '确认收货', 
      action: 'confirmReceipt', 
      orderId: order.id, 
      scrollTo: 'receipt-section'
    });
  }

  return btnList;
};

/**
 * 时间格式化
 * @param {string} time - 后端返回的时间字符串
 * @returns {string} 格式化后的时间
 */
const formatTime = (time) => {
  if (!time) return '未知时间';
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');
};

/**
 * Tab切换事件
 * @param {string} tabKey - Tab标识
 */
const handleTabChange = (tabKey) => {
  activeTab.value = tabKey;
  pagination.value.currentPage = 1; // 切换Tab重置页码
};

/**
 * 分页变化事件（适配TDesign分页组件的回调参数）
 * @param {Object} pageInfo - 分页信息 { page: 页码, pageSize: 每页条数 }
 */
const handlePageChange = (pageInfo) => {
  pagination.value.currentPage = pageInfo.page;
  pagination.value.pageSize = pageInfo.pageSize;
  getOrderList(); // 重新请求订单列表
};

/**
 * 操作按钮点击事件
 * @param {Object} btn - 按钮对象
 * @param {Object} order - 订单对象
 */
const handleAction = async (btn, order) => {
  try {
    router.push({
      path: `/order-detail/${btn.orderId}`,
      query: {
        scrollTo: btn.scrollTo
      }
    });

    // 特殊操作接口调用
    switch (btn.action) {
      case 'confirmReceipt':
        await orderApi.confirmReceipt(btn.orderId);
        MessagePlugin.success('确认收货操作已提交，将跳转到详情页查看结果');
        break;
      case 'supplementContract':
        MessagePlugin.info('将跳转到合同上传页面');
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`执行${btn.name}操作失败：`, error);
    MessagePlugin.error(`${btn.name}操作失败，请稍后重试`);
  }
};

// ========== 5. 生命周期与监听 ==========
// 页面挂载时初始化数据
onMounted(async () => {
  await getOrderSummary();
  await getOrderList();
});

// 监听Tab切换，重新请求订单列表
watch(activeTab, () => {
  getOrderList();
}, { immediate: false });

// 监听分页参数变化，重新请求订单列表
watch([() => pagination.value.currentPage, () => pagination.value.pageSize], () => {
  getOrderList();
}, { immediate: false });
</script>

<style lang="scss" scoped>
.order-manage-component {
  width: 100%;
  padding: 0 16px;

  // 加载中样式
  .loading-container {
    padding: 60px 0;
    text-align: center;
    .loading-text {
      font-size: 14px;
      color: #838486;
    }
  }

  // 1. 订单状态Tab栏
  .order-tabs {
    display: flex;
    gap: 24px;
    padding: 16px 0;
    border-bottom: 1px solid #ECEEF2;
    margin-bottom: 20px;

    .tab-item {
      font-size: 14px;
      color: #838486;
      cursor: pointer;
      padding-bottom: 8px;
      position: relative;

      &.active {
        color: #3799AE;
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #3799AE;
        }
      }
    }
  }

  // 2. 订单列表（每个订单是独立Table）
  .order-list {
    .order-item {
      margin-bottom: 20px;

      .order-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #ECEEF2;
        border-radius: 4px;
        table-layout: fixed;
        width: 100%;

        thead {
          tr {
            background: #F9FAFC;
            th {
              height: 40px;
              line-height: 40px;
              padding: 0 16px;
              font-size: 14px;
              color: #272727;
              text-align: left;
              border: 1px solid #ECEEF2;
              border-bottom: 1px solid #ECEEF2;

              .order-header-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                background: #F8F9FA;
                border-radius: 8px;
                font-size: 14px;

                .order-header-left {
                  display: flex;
                  gap: 16px;
                }

                .order-time, .order-no {
                  color: #838486;
                }

                .order-status {
                  color: #272727;
                  font-weight: 500;
                }
              }
              &.th-detail { width: 60%; }
              &.th-amount { width: 15%; }
              &.th-action { width: 25%; }
            }
          }
        }

        tbody {
          table-layout: fixed;
          width: 100%;

          .product-row {
            td {
              border: 1px solid #ECEEF2;
              border-top: 1px solid #F5F5F5;
            }

            .td-detail {
              padding: 0;

              .product-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;

                .product-img {
                  width: 60px;
                  height: 60px;
                  object-fit: cover;
                  margin-right: 12px;
                  border-radius: 4px;
                }

                .product-info {
                  flex: 1;
                  font-size: 14px;

                  .product-name {
                    color: #272727;
                    margin-bottom: 4px;
                  }

                  .product-spec {
                    color: #838486;
                    font-size: 12px;
                  }
                }

                .product-count {
                  width: 60px;
                  text-align: center;
                  color: #272727;
                  font-size: 14px;
                }

                .product-price {
                  width: 80px;
                  text-align: right;
                  color: #272727;
                  font-size: 14px;
                }
              }
            }
          }

          .td-amount {
            padding: 12px 16px;
            font-size: 14px;
            color: #F53F3F;
            font-weight: 500;
            text-align: center;
            vertical-align: middle;
            border: 1px solid #ECEEF2;
          }

          .td-action {
            padding: 12px 16px;
            font-size: 14px;
            vertical-align: top;
            border: 1px solid #ECEEF2;

            .action-status {
              color: #F53F3F;
              margin-bottom: 12px;
              font-weight: 500;
            }

            .action-btn-group {
              display: flex;
              flex-direction: column;
              gap: 8px;

              .action-btn {
                color: #272727;
                cursor: pointer;

                &:hover {
                  color: #3799AE;
                }
              }
            }
          }
        }
      }
    }

    // 分页容器样式
    .pagination-wrap {
      margin: 20px 0;
      // text-align: right;
    }
  }

  // 3. 空状态容器
  .empty-container {
    padding: 60px 0;
    text-align: center;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #ECEEF2;
    .empty-text {
      font-size: 16px;
      color: #272727;
      margin-bottom: 8px;
    }
    .empty-desc {
      font-size: 14px;
      color: #838486;
    }
  }
}
</style>