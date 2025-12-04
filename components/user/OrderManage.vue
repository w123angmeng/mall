<template>
  <div class="order-manage-component">
    <!-- 1. 订单状态Tab栏（循环数组） -->
    <div class="order-tabs">
      <div 
        class="tab-item" 
        v-for="tab in tabList" 
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.name }} ({{ tab.count }})
      </div>
    </div>

    <!-- 2. 订单列表（每个订单是独立Table） -->
    <div class="order-list" v-if="filteredOrders.length">
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
				    <span class="order-time">{{ order.time }}</span>
				    <span class="order-no">订单号：{{ order.orderNo }}</span>
				  </div>
				  <span class="order-status">{{ order.status }}</span>
				</div>
			</th>
			  
			</tr>
          </thead>
          <tbody>

            <!-- 商品行：每个商品一行 -->
            <tr class="product-row" v-for="(product, pIdx) in order.products" :key="pIdx">
              <td class="td-detail">
                <div class="product-item">
                  <img :src="product.img" alt="商品图" class="product-img">
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-spec">{{ product.spec }}</div>
                  </div>
                  <div class="product-count">×{{ product.count }}</div>
                  <div class="product-price">{{ product.price }}</div>
                </div>
              </td>
			  <td
			    class="td-amount"
				v-if="pIdx == 0"
			    :rowspan="order.products.length"
			  >
			    ¥{{ order.totalAmount }}
			  </td>
			  <!-- 订单操作列：合并订单头+商品行 -->
			  <td 
			    class="td-action" 
				v-if="pIdx == 0"
			    :rowspan="order.products.length"
			  >
			    <div class="action-status">{{ order.actionStatus }}</div>
			    <div class="action-btn-group">
			      <div 
			        class="action-btn" 
			        v-for="(btn, bIdx) in order.actions" 
			        :key="bIdx"
			        @click="handleAction(btn, order)"
			      >
			        {{ btn }}
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
      <t-empty 
        :title="emptyTitle" 
        :description="emptyDesc"
      ></t-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
// import TEmpty from 'tdesign-vue-next/es/empty';

// 1. 订单状态Tab数组（循环展示）
const tabList = ref([
  { key: 'all', name: '全部订单', count: 5 },
  { key: 'waitPay', name: '待付款', count: 5 },
  { key: 'ordered', name: '已下单', count: 5 },
  { key: 'producing', name: '生产中', count: 5 },
  { key: 'produceDone', name: '生产完成', count: 5 },
  { key: 'shipped', name: '已发货', count: 5 },
  { key: 'completed', name: '已完成', count: 5 }
]);
const activeTab = ref('all');

// 2. 订单数据（每个订单对应独立Table）
const orderList = ref([
  {
    id: 1,
    time: '2024-10-15 22:43:46',
    orderNo: '1234567890',
    status: '已下单',
    products: [
      {
        img: '/images/order-goods.png',
        name: 'nova Flip S 256GB星耀黑 双卡全网通版',
        spec: '规格信息规格信息',
        count: 2,
        price: '¥499'
      },
      {
        img: '/images/order-goods.png',
        name: 'nova Flip S 256GB星耀黑 双卡全网通版',
        spec: '规格信息规格信息',
        count: 2,
        price: '¥499'
      }
    ],
    totalAmount: '2999',
    actionStatus: '补充合同',
    actions: ['订单详情', '查看发票', '确认收货'],
    tabType: 'ordered'
  },
  {
    id: 2,
    time: '2024-10-15 22:43:46',
    orderNo: '1234567890',
    status: '已下单',
    products: [
      {
        img: '/images/order-goods.png',
        name: 'nova Flip S 256GB星耀黑 双卡全网通版',
        spec: '规格信息规格信息',
        count: 2,
        price: '¥499'
      },
      {
        img: '/images/order-goods.png',
        name: 'nova Flip S 256GB星耀黑 双卡全网通版',
        spec: '规格信息规格信息',
        count: 2,
        price: '¥499'
      }
    ],
    totalAmount: '2999',
    actionStatus: '未付款',
    actions: ['补充合同', '查看发票', '订单详情'],
    tabType: 'ordered'
  }
]);

// 3. 筛选当前Tab对应的订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orderList.value;
  return orderList.value.filter(order => order.tabType === activeTab.value);
});

// 4. 空状态文案
const emptyTitle = computed(() => {
  const currentTab = tabList.value.find(t => t.key === activeTab.value);
  return `暂无${currentTab?.name.replace(' (5)', '')}订单`;
});
const emptyDesc = computed(() => '暂无相关订单数据');

// 5. 操作按钮点击事件
const handleAction = (btn, order) => {
  console.log(`点击${btn}，订单号：${order.orderNo}`);
};
</script>

<style lang="scss" scoped>
.order-manage-component {
  width: 100%;
  padding: 0 16px;

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
        // 修复border-radius和border的兼容问题
        // overflow: hidden;

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
			    // padding: 10px 16px;
			    background: #F8F9FA; /* 浅灰背景 */
			    // border: 1px solid #ECEEF2;
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
          // 订单头行
          .order-header-row {
            td {
              border: 1px solid #ECEEF2; // 订单头单元格边框
            }
			/* 表头列宽 */
			// .th-detail { width: calc(100% - 120px - 200px); } // 剩余宽度给订单详情
			// .th-amount { width: 120px; } // 订单金额列固定120px
			// .th-action { width: 200px; } // 订单状态及操作列固定200px
			
			/* 单元格列宽（必须与表头严格一致） */
			// .td-amount { width: 120px; }
			// .td-action { width: 200px; }
			// .td-detail { width: calc(100% - 120px - 200px); }
            .td-detail {
              .order-header-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                font-size: 14px;

                .order-time, .order-no {
                  color: #838486;
                  margin-right: 16px;
                }

                .order-status {
                  color: #272727;
                  font-weight: 500;
                }
              }
            }
          }

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

    :deep(.t-empty) {
      --t-empty-title-color: #272727;
      --t-empty-description-color: #838486;
    }
  }
}
</style>