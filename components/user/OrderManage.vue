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

// 1. 订单状态Tab配置（与后端状态映射）
const tabList = ref([
  { key: 'all', name: '全部订单', count: 0 },
  { key: 'waitPay', name: '待付款', count: 0 },
  { key: 'ordered', name: '已下单', count: 0 },
  { key: 'producing', name: '生产中', count: 0 },
  { key: 'produceDone', name: '生产完成', count: 0 },
  { key: 'shipped', name: '已发货', count: 0 },
  { key: 'completed', name: '已完成', count: 0 }
]);
const activeTab = ref('all');
const isLoading = ref(false); // 加载状态
const orderList = ref([]); // 原始订单列表
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页条数

// 2. 筛选当前Tab对应的订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orderList.value;
  return orderList.value.filter(order => order.tabType === activeTab.value);
});

// 3. 空状态文案
const emptyTitle = computed(() => {
  const currentTab = tabList.value.find(t => t.key === activeTab.value);
  return `暂无${currentTab?.name.replace(' (0)', '')}订单`;
});
const emptyDesc = computed(() => '暂无相关订单数据，快去下单吧~');

/**
 * 获取订单状态数量汇总
 */
const getOrderSummary = async () => {
  try {
    const res = await orderApi.getOrderSummary();
    if (res.code === 200 && res.data) {
      // 映射后端汇总数据到Tab列表
      const summary = res.data;
      tabList.value.forEach(tab => {
        switch (tab.key) {
          case 'all':
            tab.count = summary.totalNum || 0;
            break;
          case 'waitPay':
            tab.count = summary.pendingPaymentNum || 0;
            break;
          case 'ordered':
            tab.count = summary.orderPlacedNum || 0;
            break;
          case 'producing':
            tab.count = summary.productionInProcessNum || 0;
            break;
          case 'produceDone':
            tab.count = summary.productionCompleteNum || 0;
            break;
          case 'shipped':
            tab.count = summary.shippedNum || 0;
            break;
          case 'completed':
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
 * 获取订单列表
 */
const getOrderList = async () => {
  try {
    isLoading.value = true;
    // 构造查询参数
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };
    // 非全部订单时，传递订单状态参数
    if (activeTab.value !== 'all') {
      params.orderStatus = activeTab.value;
    }
    const res = await orderApi.getOrderList(params);
    if (res.code === 200 && res.rows) {
      // 格式化订单数据，适配页面渲染
      orderList.value = res.rows.map(order => ({
        ...order,
        // 映射订单状态到Tab类型
        tabType: mapStatusToTabKey(order.orderStatus),
        // 订单状态名称（后端返回或映射）
        statusName: order.statusName || getStatusName(order.orderStatus.toString()),
        // 操作状态文案
        actionStatus: getActionStatusText(order.orderStatus.toString()),
        // 订单创建时间格式化
        createTime: formatTime(order.createTime),
        // 补充订单扩展字段（后端若返回则使用，否则默认）
        hasPay: order.hasPay ?? false, // 是否已付款
        hasContract: order.hasContract ?? false, // 是否已上传合同
        hasInvoice: order.hasInvoice ?? false, // 是否已开发票
        contractRejected: order.contractRejected ?? false, // 合同是否驳回
        payRejected: order.payRejected ?? false // 付款是否驳回
      }));
    }
  } catch (error) {
    console.error('获取订单列表失败：', error);
    MessagePlugin.error('获取订单列表失败，请稍后重试');
    orderList.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 4. 监听Tab切换，重新请求订单列表
watch(activeTab, () => {
  currentPage.value = 1; // 切换Tab重置页码
  getOrderList();
}, { immediate: true });

// 5. 页面挂载时获取订单汇总和订单列表
onMounted(async () => {
  await getOrderSummary(); // 获取订单状态数量汇总
  await getOrderList(); // 获取订单列表
});

/**
 * 订单状态映射到TabKey
 * @param {string|number} status - 后端订单状态值
 * @returns {string} TabKey
 */
const mapStatusToTabKey = (status) => {
  const statusMap = {
    '0': 'waitPay',
    '1': 'ordered',
    '2': 'producing',
    '3': 'produceDone',
    '4': 'shipped',
    '5': 'completed'
  };
  return statusMap[status.toString()] || 'all';
};

/**
 * 获取订单状态名称
 * @param {string|number} status - 后端订单状态值
 * @returns {string} 状态名称
 */
const getStatusName = (status) => {
  const nameMap = {
    '0': '待付款',
    '1': '已下单',
    '2': '生产中',
    '3': '生产完成',
    '4': '已发货',
    '5': '已完成'
  };
  return nameMap[status.toString()] || '未知状态';
};

/**
 * 获取操作状态文案
 * @param {string|number} status - 后端订单状态值
 * @returns {string} 操作状态文案
 */
const getActionStatusText = (status) => {
  const textMap = {
    '0': '未付款',
    '1': '补充合同',
    '2': '生产中',
    '3': '待发货',
    '4': '待收货',
    '5': '已完成'
  };
  return textMap[status.toString()] || '无操作';
};

/**
 * 根据订单属性获取操作按钮（严格按业务规则）
 * 规则：
 * 1. 没付款的订单展示【未付款】按钮
 * 2. 没上传合同的订单展示【补充合同】按钮
 * 3. 商家开了发票的订单展示【查看发票】按钮
 * 4. 已发货状态的订单展示【确认收货】按钮
 * 5. 合同驳回/付款驳回展示对应按钮
 * 6. 所有订单展示【订单详情】按钮
 * @param {Object} order - 订单对象
 * @returns {Array} 操作按钮列表
 */
const getActionBtns = (order) => {
  const btnList = [];
  const status = order.orderStatus.toString();

  // 1. 所有订单都有【订单详情】按钮
  btnList.push({ 
    name: '订单详情', 
    action: 'detail', 
    orderId: order.id, 
    scrollTo: 'order-detail' // 滚动到订单详情区域
  });

  // 2. 没付款的订单展示【未付款】按钮（状态为待付款 或 hasPay=false）
  if (status === '0' || !order.hasPay) {
    btnList.push({ 
      name: '未付款', 
      action: 'unpaid', 
      orderId: order.id, 
      scrollTo: 'pay-section' // 滚动到付款区域
    });
  }

  // 3. 没上传合同的订单展示【补充合同】按钮（hasContract=false 且 非已完成状态）
  if (!order.hasContract && status !== '5') {
    btnList.push({ 
      name: '补充合同', 
      action: 'supplementContract', 
      orderId: order.id, 
      scrollTo: 'contract-section' // 滚动到合同区域
    });
  }

  // 4. 合同驳回展示【合同驳回】按钮
  if (order.contractRejected) {
    btnList.push({ 
      name: '合同驳回', 
      action: 'contractReject', 
      orderId: order.id, 
      scrollTo: 'contract-section' // 滚动到合同区域
    });
  }

  // 5. 付款驳回展示【付款驳回】按钮
  if (order.payRejected) {
    btnList.push({ 
      name: '付款驳回', 
      action: 'payReject', 
      orderId: order.id, 
      scrollTo: 'pay-section' // 滚动到付款区域
    });
  }

  // 6. 商家开了发票的订单展示【查看发票】按钮（hasInvoice=true）
  if (order.hasInvoice) {
    btnList.push({ 
      name: '查看发票', 
      action: 'invoice', 
      orderId: order.id, 
      scrollTo: 'invoice-section' // 滚动到发票区域
    });
  }

  // 7. 已发货状态的订单展示【确认收货】按钮（状态为4）
  if (status === '4') {
    btnList.push({ 
      name: '确认收货', 
      action: 'confirmReceipt', 
      orderId: order.id, 
      scrollTo: 'receipt-section' // 滚动到收货区域
    });
  }

  return btnList;
};

/**
 * 时间格式化（简易版）
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
};

/**
 * 操作按钮点击事件：统一跳转到订单详情页并指定滚动位置
 * @param {Object} btn - 按钮对象
 * @param {Object} order - 订单对象
 */
const handleAction = async (btn, order) => {
  try {
    // 1. 跳转到订单详情页，携带订单ID和滚动目标位置
    router.push({
      path: `/order-detail/${btn.orderId}`,
      query: {
        scrollTo: btn.scrollTo // 传递滚动目标锚点
      }
    });

    // 2. 特殊操作需要先调用接口的场景（如确认收货）
    switch (btn.action) {
      case 'confirmReceipt':
        await orderApi.confirmReceipt(btn.orderId);
        MessagePlugin.success('确认收货操作已提交，将跳转到详情页查看结果');
        break;
      case 'supplementContract':
        // 补充合同前的前置校验（示例）
        MessagePlugin.info('将跳转到合同上传页面');
        break;
      default:
        // 仅跳转，无前置接口调用
        break;
    }
  } catch (error) {
    console.error(`执行${btn.name}操作失败：`, error);
    MessagePlugin.error(`${btn.name}操作失败，请稍后重试`);
  }
};
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

      // 核心修改：完整的表格外边框
      .order-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #ECEEF2; // 表格外边框
        border-radius: 4px;
        table-layout: fixed;
        width: 100%;

        // 表头样式
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
              border: 1px solid #ECEEF2; // 表头单元格边框
              border-bottom: 1px solid #ECEEF2;

              /* 样式（SCSS） */
              .order-header-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                background: #F8F9FA; /* 浅灰背景 */
                border-radius: 8px; /* 圆角 */
                font-size: 14px;

                .order-header-left {
                  display: flex;
                  gap: 16px; /* 时间和订单号的间距 */
                }

                .order-time, .order-no {
                  color: #838486; /* 浅灰文字 */
                }

                .order-status {
                  color: #272727; /* 深色状态文字 */
                  font-weight: 500;
                }
              }
              &.th-detail { width: 60%; }
              &.th-amount { width: 15%; }
              &.th-action { width: 25%; }
            }
          }
        }

        // 表格内容
        tbody {
          table-layout: fixed;
          width: 100%;
          &.td-amount { width: 15%; }
          &.td-action { width: 25%;}
          &.td-detail { width: 60%; }

          // 商品行
          .product-row {
            td {
              border: 1px solid #ECEEF2; // 商品行单元格边框
              border-top: 1px solid #F5F5F5; // 行内分隔线保留浅灰
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

          // 订单金额列（合并单元格）
          .td-amount {
            padding: 12px 16px;
            font-size: 14px;
            color: #F53F3F;
            font-weight: 500;
            text-align: center;
            vertical-align: middle;
            border: 1px solid #ECEEF2; // 金额列边框
          }

          // 订单操作列（合并单元格）
          .td-action {
            padding: 12px 16px;
            font-size: 14px;
            vertical-align: top;
            border: 1px solid #ECEEF2; // 操作列边框

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