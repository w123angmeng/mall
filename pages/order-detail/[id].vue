<template>
  <div class="order-detail-page">
    <!-- 公共页首 -->
    <Header />

    <!-- 主体区域 -->
    <div class="main-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <span class="breadcrumb-item" @click="goToHome">首页</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item" @click="goToOrderList">订单管理</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item active">订单详情</span>
      </div>

      <!-- 订单基础信息卡片 -->
      <div class="order-base-card" v-if="orderDetail">
        <div class="base-info-item">
          <label>订单号：</label>
          <span>{{ orderDetail.orderNo || '暂无' }}</span>
        </div>
        <div class="base-info-item">
          <label>创建时间：</label>
          <span>{{ orderDetail.createTime || '暂无' }}</span>
        </div>
        <div class="base-info-item">
          <label>订单状态：</label>
          <span class="status-tag" :class="getOrderStatusClass(orderDetail.orderStatus)">{{ getOrderStatusText(orderDetail.orderStatus) }}</span>
        </div>
        <div class="base-info-item" v-if="orderDetail.deliverInfo">
          <label>物流信息：</label>
          <span>{{ orderDetail.deliverInfo }}</span>
        </div>
      </div>

      <!-- 订单状态进度条 -->
      <OrderStatus 
        :completedStepIndex="completedStepIndex"
        :steps="statusSteps"
      />

      <!-- 下单主体模块 -->
      <div class="detail-module" id="order-detail">
        <div class="module-header">
          <h3 class="module-title">下单主体</h3>
          <div class="module-actions">
            <!-- <button class="action-btn" @mouseenter="toggleBtnIcon('add', true)" @mouseleave="toggleBtnIcon('add', false)">
              <img :src="addBtnIcon" alt="新增" class="btn-icon">
              <span class="btn-text">新增</span>
            </button>
            <button class="action-btn" @mouseenter="toggleBtnIcon('help', true)" @mouseleave="toggleBtnIcon('help', false)">
              <img :src="helpBtnIcon" alt="说明" class="btn-icon">
              <span class="btn-text">说明</span>
            </button>
            <button class="action-btn" @mouseenter="toggleBtnIcon('more', true)" @mouseleave="toggleBtnIcon('more', false)">
              <span class="btn-text">查看全部</span>
              <img :src="moreBtnIcon" alt="更多" class="btn-icon">
            </button> -->
          </div>
        </div>
        <div class="module-content">
          <!-- 认证类型单选 -->
          <RadioGroupSingle
            :options="[
              { label: '企业', value: 'company' },
              { label: '个人', value: 'personal' }
            ]"
            v-model="subjectType"
            groupName="subject-type"
            :readonly="true"
          />
          <!-- 企业/个人信息展示 -->
          <div class="info-row info-row-warp" v-if="orderDetail.orderInfo?.certType === 1">
            <span class="info-label">企业名称</span>
            <span class="info-value">{{ orderDetail.orderInfo?.companyName || '暂无' }}</span>
            <span class="info-label">统一社会信用代码</span>
            <span class="info-value">{{ orderDetail.orderInfo?.socialCode || '暂无' }}</span>
            <span class="info-label">法人姓名</span>
            <span class="info-value">{{ orderDetail.orderInfo?.legalName || '暂无' }}</span>
            <!-- <span class="info-label">法人身份证号</span>
            <span class="info-value">{{ orderDetail.orderInfo?.legalNumber || '暂无' }}</span> -->
          </div>
          <div class="info-row info-row-warp" v-else>
            <span class="info-label">身份证姓名</span>
            <span class="info-value">{{ orderDetail.orderInfo?.cardName || '暂无' }}</span>
            <span class="info-label">身份证号</span>
            <span class="info-value">{{ orderDetail.orderInfo?.cardNumber || '暂无' }}</span>
            <span class="info-label">手机号码</span>
            <span class="info-value">{{ orderDetail.orderInfo?.phoneNumber || '暂无' }}</span>
          </div>
        </div>
      </div>

      <!-- 订单合同模块 -->
      <div class="detail-module" id="contract-section">
        <div class="module-header">
          <h3 class="module-title">订单合同</h3>
          <div class="module-actions">
            <!-- <button class="action-btn" @mouseenter="toggleBtnIcon('contractAdd', true)" @mouseleave="toggleBtnIcon('contractAdd', false)" @click="handleSupplementContract" v-if="orderDetail.contractRequired && orderDetail.contractStatus !== 3">
              <img :src="contractAddBtnIcon" alt="新增" class="btn-icon">
              <span class="btn-text">{{ orderDetail.contractStatus === 1 ? '重新上传' : '上传合同' }}</span>
            </button>
            <button class="action-btn" @mouseenter="toggleBtnIcon('contractHelp', true)" @mouseleave="toggleBtnIcon('contractHelp', false)">
              <img :src="contractHelpBtnIcon" alt="说明" class="btn-icon">
              <span class="btn-text">说明</span>
            </button>
            <button class="action-btn" @mouseenter="toggleBtnIcon('contractMore', true)" @mouseleave="toggleBtnIcon('contractMore', false)">
              <span class="btn-text">查看全部</span>
              <img :src="contractMoreBtnIcon" alt="更多" class="btn-icon">
            </button> -->
          </div>
        </div>
        <div class="module-content">
          <!-- 是否需要合同单选 -->
          <RadioGroupSingle
            :options="[
              { label: '需要', value: 'need' },
              { label: '不需要', value: 'notNeed' }
            ]"
            v-model="contractType"
            groupName="contract-type"
            :readonly="true"
          />
          <!-- 合同状态展示 -->
          <div class="status-item" v-if="orderDetail.contractRequired">
            <label>合同状态：</label>
            <span class="status-tag" :class="getContractStatusClass(orderDetail.contractStatus)">{{ getContractStatusText(orderDetail.contractStatus) }}</span>
          </div>
          <!-- 合同信息行 -->
          <div class="info-row contract-row" v-if="orderDetail.contractRequired">
            <span class="info-label">合同下载</span>
            <div class="contract-download-wrap" @click="handleDownloadContract" v-if="orderDetail.contract">
              <span class="download-text">{{ orderDetail.contractName || '合同文件' }}</span>
              <img src="/images/download.png" alt="下载" class="download-icon">
            </div>
            <span class="no-contract" v-else>暂无合同可下载</span>
            <span class="info-label">上传状态</span>
            <div class="upload-status-wrap">
              <span class="upload-text">{{ getContractUploadText(orderDetail.contractStatus) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 收货地址模块 -->
      <div class="detail-module" id="receipt-section">
        <div class="module-header">
          <h3 class="module-title">收货地址</h3>
          <!-- <div class="module-actions">
            <button class="action-btn" @mouseenter="toggleBtnIcon('addressAdd', true)" @mouseleave="toggleBtnIcon('addressAdd', false)">
              <img :src="addressAddBtnIcon" alt="新增" class="btn-icon">
              <span class="btn-text">新增收货地址</span>
            </button>
            <button class="action-btn" @mouseenter="toggleBtnIcon('addressMore', true)" @mouseleave="toggleBtnIcon('addressMore', false)">
              <span class="btn-text">查看全部</span>
              <img :src="addressMoreBtnIcon" alt="更多" class="btn-icon">
            </button>
          </div> -->
        </div>
        <div class="module-content">
          <RadioGroupSingle
            :options="[
              { label: '需要', value: 'need' },
              { label: '不需要', value: 'notNeed' }
            ]"
            v-model="addressType"
            groupName="address-type"
            :readonly="true"
          />
          <!-- 地址信息行 -->
          <div class="info-row address-info-row">
            <div class="address-content">
              <span class="contact-info">{{ orderDetail.orderInfo?.receiverName || '暂无' }} {{ orderDetail.orderInfo?.receiverPhone || '暂无' }}</span>
              <span class="address-detail">{{ orderDetail.orderInfo?.fullAddress || '暂无' }}</span>
            </div>
            <div class="special-require-wrap">
              <span class="info-label">特殊需求</span>
              <input type="text" class="special-require-input" placeholder="请输入" :value="orderDetail.orderInfo?.requirement || ''" readonly>
            </div>
          </div>
        </div>
      </div>

      <!-- 付款方式模块 -->
      <div class="detail-module" id="pay-section">
        <div class="module-header">
          <h3 class="module-title">付款方式</h3>
          <div class="module-actions">
            <!-- <button class="action-btn" @mouseenter="toggleBtnIcon('payHelp', true)" @mouseleave="toggleBtnIcon('payHelp', false)">
              <img :src="payHelpBtnIcon" alt="说明" class="btn-icon">
              <span class="btn-text">说明</span>
            </button>
            <button class="action-btn" @mouseenter="toggleBtnIcon('payMore', true)" @mouseleave="toggleBtnIcon('payMore', false)">
              <span class="btn-text">查看全部</span>
              <img :src="payMoreBtnIcon" alt="更多" class="btn-icon">
            </button> -->
          </div>
        </div>
        <div class="module-content">
          <!-- 付款方式单选 -->
          <RadioGroupSingle
            :options="[
              { label: '立即付款', value: 'immediate' },
              { label: '账期付款', value: 'delay' },
              { label: '授信额度', value: 'credit' }
            ]"
            v-model="payType"
            groupName="pay-type"
            
          />
          <!-- 付款状态展示 -->
          <div class="status-item">
            <label>付款凭证状态：</label>
            <span class="status-tag" :class="getPayStatusClass(orderDetail.payStatus)">{{ getPayStatusText(orderDetail.payStatus) }}</span>
          </div>
          <!-- 上传支付凭证 -->
          <div class="info-row pay-upload-row" v-if="orderDetail.payStatus !== 2">
            <span class="info-label">上传支付凭证</span>
            <div class="payment-upload-wrap" @click="handleUploadPayment">
              <span class="payment-upload-text">{{ orderDetail.payStatus === 1 ? '重新上传' : '请上传' }}</span>
              <img src="/images/new-white.png" alt="上传" class="payment-upload-icon">
            </div>
          </div>
          <!-- 收款信息行 -->
          <div class="info-row info-row-warp">
            <span class="info-label">收款方名称</span>
            <span class="info-value">{{ payInfo?.payeeName || '北京水晶盈网络科技有限公司' }}</span>
            <span class="info-label">收款方开户行</span>
            <span class="info-value">{{ payInfo?.bankName || '中国工商银行股份有限公司北京紫竹桥支行' }}</span>
            <span class="info-label">收款方账号</span>
            <span class="info-value">{{ payInfo?.bankAccount || '02002359500200033061' }}</span>
          </div>
          <!-- 金额信息 -->
          <div class="amount-info-wrap">
            <div class="amount-item">
              <label>商品总金额：</label>
              <span>¥{{ orderDetail.totalAmount || '0.00' }}</span>
            </div>
            <div class="amount-item">
              <label>结算金额：</label>
              <span>¥{{ orderDetail.payAmount || '0.00' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 发票信息模块 -->
      <div class="detail-module" id="invoice-section">
        <div class="module-header">
          <h3 class="module-title">发票信息</h3>
          <div class="module-actions">
            <!-- <button class="action-btn" @mouseenter="toggleBtnIcon('invoiceHelp', true)" @mouseleave="toggleBtnIcon('invoiceHelp', false)">
              <img :src="invoiceHelpBtnIcon" alt="说明" class="btn-icon">
              <span class="btn-text">说明</span>
            </button>
            <button class="action-btn" @mouseenter="toggleBtnIcon('invoiceMore', true)" @mouseleave="toggleBtnIcon('invoiceMore', false)">
              <span class="btn-text">查看全部</span>
              <img :src="invoiceMoreBtnIcon" alt="更多" class="btn-icon">
            </button> -->
          </div>
        </div>
        <div class="module-content">
          <!-- 是否需要发票单选 -->
          <RadioGroupSingle
            :options="[
              { label: '需要', value: 'need' },
              { label: '不需要', value: 'notNeed' }
            ]"
            v-model="invoiceType"
            groupName="invoice-type"
            :readonly="true"
          />
          <!-- 发票状态展示 -->
          <div class="status-item" v-if="orderDetail.invoiceRequired">
            <label>发票状态：</label>
            <span class="status-tag" :class="getInvoiceStatusClass(orderDetail.invoiceStatus)">{{ getInvoiceStatusText(orderDetail.invoiceStatus) }}</span>
          </div>
          <!-- 发票信息展示 -->
          <div class="invoice-company-wrap" v-if="orderDetail.invoiceRequired">
            <div class="invoice-grid">
              <div class="invoice-col">
                <div class="invoice-item">
                  <span class="info-label">开票金额</span>
                  <span class="info-value">¥{{ orderDetail.invoiceAmount || '0.00' }}</span>
                </div>
                <div class="invoice-item">
                  <span class="info-label">开票明细</span>
                  <span class="info-value">{{ orderDetail.invoiceDetails || '暂无' }}</span>
                </div>
              </div>
              <div class="invoice-col">
                <div class="invoice-item">
                  <span class="info-label">开票要求</span>
                  <span class="info-value">{{ orderDetail.invoiceRequirement || '暂无' }}</span>
                </div>
                <div class="invoice-item" v-if="orderDetail.invoice">
                  <span class="info-label">发票下载</span>
                  <span class="info-value link-text" @click="handleDownloadInvoice">{{ orderDetail.invoiceName || '发票文件' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息模块 -->
      <div class="detail-module">
        <div class="module-header">
          <h3 class="module-title">订单商品</h3>
          <div class="module-actions">
            <!-- <button class="action-btn" @mouseenter="toggleBtnIcon('orderMore', true)" @mouseleave="toggleBtnIcon('orderMore', false)">
              <span class="btn-text">查看全部</span>
              <img :src="orderMoreBtnIcon" alt="更多" class="btn-icon">
            </button> -->
          </div>
        </div>
        <div class="module-content">
          <!-- 商品列表表头 -->
          <div class="goods-header">
            <div class="goods-header-item goods-header-name">商品信息</div>
            <div class="goods-header-item goods-header-count">数量</div>
            <div class="goods-header-item goods-header-price">单价</div>
            <div class="goods-header-item goods-header-total">小计</div>
          </div>
          <!-- 商品列表 -->
          <div class="goods-list">
            <div class="goods-item" v-for="(item, idx) in orderGoods" :key="idx">
              <div class="goods-item-detail">
                <img :src="item.productImage || '/images/product.png'" alt="商品" class="goods-img">
                <div class="goods-info">
                  <div class="goods-name">{{ item.productName || '未知商品' }}</div>
                  <div class="goods-color">{{ item.specType === 0 ? item.singleSpec : (item.specJson ? JSON.parse(item.specJson) : '无规格') }}</div>
                </div>
              </div>
              <div class="goods-item-count">× {{ item.payNum || 0 }}</div>
              <div class="goods-item-price">¥{{ item.productPrice || '0.00' }}</div>
              <div class="goods-item-total">¥{{ item.totalPrice || '0.00' }}</div>
            </div>
          </div>
          <!-- 订单汇总 -->
          <div class="order-summary-wrap">
            <div class="summary-item">
              <span class="summary-label">商品总数量</span>
              <span class="summary-value">× {{ orderDetail.totalNum || 0 }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">商品总金额</span>
              <span class="summary-value">¥{{ orderDetail.totalAmount || '0.00' }}</span>
            </div>
            <div class="summary-item total">
              <span class="summary-label">结算金额</span>
              <span class="summary-value">¥{{ orderDetail.payAmount || '0.00' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单补充模块 -->
      <div class="detail-module supplement-module">
        <div class="module-header">
          <h3 class="module-title">订单补充</h3>
        </div>
        <div class="module-content supplement-content">
          <div class="input-row">
            <span class="info-label">对接业务员</span>
            <input type="text" class="info-input" :value="orderDetail.salePerson || '暂无'" readonly>
          </div>
          <div class="input-row">
            <span class="info-label">订单留言</span>
            <textarea class="order-note-textarea" placeholder="暂无留言" readonly>{{ orderDetail.orderMessage || '' }}</textarea>
          </div>
          <div class="supplement-buttons">
            <button class="btn-contact" @click="handleContactService">联系客服</button>
            <button class="btn-save" @click="handleSaveOrder" v-if="orderDetail.orderStatus < 5">保存订单</button>
            <button class="btn-confirm" @click="handleConfirmReceipt" v-if="orderDetail.orderStatus === 4">确认收货</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 公共页尾 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
// 导入公共组件
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import OrderStatus from '@/components/common/OrderStatus.vue';
import RadioGroupSingle from '@/components/common/RadioGroupInput.vue';
// 导入订单API
import { getOrderApi } from '@/apis/order';

// 初始化路由、路由参数和API
const router = useRouter();
const route = useRoute();
const orderApi = getOrderApi();

// 响应式数据
const orderId = ref(route.params.id);
const orderDetail = ref({});
const payInfo = ref({});
const isLoading = ref(true);

// 订单状态步骤数据
const statusSteps = ref([
  { name: '未同步到CRM', date: '', completed: false },
  { name: '待生产', date: '', completed: false },
  { name: '生产中', date: '', completed: false },
  { name: '生产完成', date: '', completed: false },
  { name: '已发货', date: '', completed: false },
  { name: '已完成', date: '', completed: false }
]);
const completedStepIndex = ref(0);

// 各模块单选值（映射接口字段）
const subjectType = ref('company');
const contractType = ref('need');
const addressType = ref('need');
const payType = ref('immediate');
const invoiceType = ref('need');

// 表单输入值
const addressSpecialRequire = ref('');
const invoiceDetails = ref('');
const invoiceSpecialRequire = ref('');
const orderNote = ref('');

// 操作按钮图标
const addBtnIcon = ref('/images/new-white.png');
const helpBtnIcon = ref('/images/help.png');
const moreBtnIcon = ref('/images/down-white.png');
const contractAddBtnIcon = ref('/images/new-white.png');
const contractHelpBtnIcon = ref('/images/help.png');
const contractMoreBtnIcon = ref('/images/down-white.png');
const addressAddBtnIcon = ref('/images/new-white.png');
const addressMoreBtnIcon = ref('/images/down-white.png');
const payHelpBtnIcon = ref('/images/help.png');
const payMoreBtnIcon = ref('/images/down-white.png');
const invoiceHelpBtnIcon = ref('/images/help.png');
const invoiceMoreBtnIcon = ref('/images/down-white.png');
const orderMoreBtnIcon = ref('/images/down-white.png');

// 订单商品数据（从接口获取）
const orderGoods = computed(() => {
  return orderDetail.value.orderItems || [];
});

/**
 * 页面挂载时执行
 */
onMounted(async () => {
  await getOrderDetailData();
  await getPayInfoData();
  handleAnchorScroll();
  // 监听路由参数变化
  watch(() => route.params.id, async (newId) => {
    orderId.value = newId;
    await getOrderDetailData();
  });
});

/**
 * 获取订单详情数据
 */
const getOrderDetailData = async () => {
  try {
    isLoading.value = true;
    const res = await orderApi.getOrderDetail(orderId.value);
    if (res.code === 200) {
      orderDetail.value = res.data;
      // 映射接口字段到单选值
      mapApiDataToForm(res.data);
      // 更新订单状态步骤
      updateOrderStatusSteps(res.data);
    } else {
      MessagePlugin.error(res.msg || '获取订单详情失败');
    }
  } catch (error) {
    console.error('获取订单详情异常：', error);
    MessagePlugin.error('获取订单详情失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

/**
 * 获取收款信息
 */
const getPayInfoData = async () => {
  try {
    const res = await orderApi.getPayInfo();
    if (res.code === 200) {
      payInfo.value = res.data;
    }
  } catch (error) {
    console.error('获取收款信息异常：', error);
  }
};

/**
 * 映射接口数据到表单单选值
 */
const mapApiDataToForm = (data) => {
  // 主体类型：1企业/0个人
  subjectType.value = data.orderInfo?.certType === 1 ? 'company' : 'personal';
  // 合同需求：true需要/false不需要
  contractType.value = data.contractRequired ? 'need' : 'notNeed';
  // 地址需求（固定为需要）
  addressType.value = 'need';
  // 付款方式：0立即/1账期/2授信
  const payTypeMap = { 0: 'immediate', 1: 'delay', 2: 'credit' };
  payType.value = payTypeMap[data.payType] || 'immediate';
  // 发票需求：true需要/false不需要
  invoiceType.value = data.invoiceRequired ? 'need' : 'notNeed';
};

/**
 * 更新订单状态步骤
 */
const updateOrderStatusSteps = (data) => {
  const status = Number(data.orderStatus) || 0;
  completedStepIndex.value = status;
  // 更新步骤完成状态和时间
  statusSteps.value.forEach((step, idx) => {
    step.completed = idx <= status;
    step.date = step.completed ? (data.createTime || new Date().toLocaleDateString()) : '';
  });
};

/**
 * 处理锚点滚动
 */
const handleAnchorScroll = () => {
  const scrollTo = route.query.scrollTo;
  if (scrollTo) {
    const targetElement = document.getElementById(scrollTo);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

/**
 * 切换按钮图标
 */
const toggleBtnIcon = (type, isHover) => {
  const iconMap = {
    add: { hover: '/images/new.png', normal: '/images/new-white.png' },
    help: { hover: '/images/help.png', normal: '/images/help.png' },
    more: { hover: '/images/down.png', normal: '/images/down-white.png' },
    contractAdd: { hover: '/images/new.png', normal: '/images/new-white.png' },
    contractHelp: { hover: '/images/help.png', normal: '/images/help.png' },
    contractMore: { hover: '/images/down.png', normal: '/images/down-white.png' },
    addressAdd: { hover: '/images/new.png', normal: '/images/new-white.png' },
    addressMore: { hover: '/images/down.png', normal: '/images/down-white.png' },
    payHelp: { hover: '/images/help.png', normal: '/images/help.png' },
    payMore: { hover: '/images/down.png', normal: '/images/down-white.png' },
    invoiceHelp: { hover: '/images/help.png', normal: '/images/help.png' },
    invoiceMore: { hover: '/images/down.png', normal: '/images/down-white.png' },
    orderMore: { hover: '/images/down.png', normal: '/images/down-white.png' },
  };
  const targetIcon = iconMap[type];
  if (targetIcon) {
    this[`${type}BtnIcon`].value = isHover ? targetIcon.hover : targetIcon.normal;
  }
};

/**
 * 获取订单状态文本
 */
const getOrderStatusText = (status) => {
  const statusMap = {
    0: '未同步到CRM',
    1: '待生产',
    2: '生产中',
    3: '生产完成',
    4: '已发货',
    5: '已完成'
  };
  return statusMap[status] || '未知状态';
};

/**
 * 获取订单状态样式类
 */
const getOrderStatusClass = (status) => {
  const classMap = {
    0: 'status-pending',
    1: 'status-processing',
    2: 'status-processing',
    3: 'status-success',
    4: 'status-success',
    5: 'status-complete'
  };
  return classMap[status] || 'status-default';
};

/**
 * 获取合同状态文本
 */
const getContractStatusText = (status) => {
  const statusMap = {
    0: '不需要',
    1: '未上传',
    2: '已上传待审核',
    3: '审核通过',
    4: '审核驳回'
  };
  return statusMap[status] || '未知状态';
};

/**
 * 获取合同状态样式类
 */
const getContractStatusClass = (status) => {
  const classMap = {
    1: 'status-pending',
    2: 'status-processing',
    3: 'status-success',
    4: 'status-error'
  };
  return classMap[status] || 'status-default';
};

/**
 * 获取合同上传状态文本
 */
const getContractUploadText = (status) => {
  const textMap = {
    1: '未上传',
    2: '已上传待审核',
    3: '审核通过（无需上传）',
    4: '审核驳回，请重新上传'
  };
  return textMap[status] || '未上传';
};

/**
 * 获取付款状态文本
 */
const getPayStatusText = (status) => {
  const statusMap = {
    0: '未上传',
    1: '已上传待审核',
    2: '审核通过',
    3: '审核驳回'
  };
  return statusMap[status] || '未知状态';
};

/**
 * 获取付款状态样式类
 */
const getPayStatusClass = (status) => {
  const classMap = {
    0: 'status-pending',
    1: 'status-processing',
    2: 'status-success',
    3: 'status-error'
  };
  return classMap[status] || 'status-default';
};

/**
 * 获取发票状态文本
 */
const getInvoiceStatusText = (status) => {
  const statusMap = {
    0: '未上传',
    1: '已上传'
  };
  return statusMap[status] || '未知状态';
};

/**
 * 获取发票状态样式类
 */
const getInvoiceStatusClass = (status) => {
  const classMap = {
    0: 'status-pending',
    1: 'status-success'
  };
  return classMap[status] || 'status-default';
};

/**
 * 下载合同
 */
const handleDownloadContract = async () => {
  try {
    if (!orderDetail.value.contract) {
      MessagePlugin.warning('暂无合同可下载');
      return;
    }
    const res = await orderApi.downloadContract(orderDetail.value.id);
    if (res.code === 200) {
      // 处理文件下载（示例：创建a标签下载）
      const a = document.createElement('a');
      a.href = res.data.contractUrl;
      a.download = orderDetail.value.contractName;
      a.click();
      MessagePlugin.success('合同下载成功');
    }
  } catch (error) {
    console.error('下载合同失败：', error);
    MessagePlugin.error('下载合同失败，请稍后重试');
  }
};

/**
 * 补充/上传合同
 */
const handleSupplementContract = async () => {
  try {
    // 模拟文件选择（实际项目中替换为文件上传组件）
    const contractFile = {
      contract: 'uploaded_contract_url',
      contractName: '订单合同_盖章版.pdf'
    };
    const res = await orderApi.supplementContract(orderDetail.value.id, contractFile);
    if (res.code === 200) {
      MessagePlugin.success('合同上传成功，等待审核');
      await getOrderDetailData();
    }
  } catch (error) {
    console.error('上传合同失败：', error);
    MessagePlugin.error('上传合同失败，请稍后重试');
  }
};

/**
 * 上传支付凭证
 */
const handleUploadPayment = async () => {
  try {
    const payFile = {
      payVoucher: 'uploaded_pay_voucher_url',
      payVoucherName: '付款凭证_202510.pdf'
    };
    const res = await orderApi.supplementPayVoucher(orderDetail.value.id, payFile);
    if (res.code === 200) {
      MessagePlugin.success('付款凭证上传成功，等待审核');
      await getOrderDetailData();
    }
  } catch (error) {
    console.error('上传付款凭证失败：', error);
    MessagePlugin.error('上传付款凭证失败，请稍后重试');
  }
};

/**
 * 下载发票
 */
const handleDownloadInvoice = async () => {
  try {
    if (!orderDetail.value.invoice) {
      MessagePlugin.warning('暂无发票可下载');
      return;
    }
    // 实际项目中调用发票下载接口
    MessagePlugin.success('发票下载成功');
  } catch (error) {
    console.error('下载发票失败：', error);
    MessagePlugin.error('下载发票失败，请稍后重试');
  }
};

/**
 * 确认收货
 */
const handleConfirmReceipt = async () => {
  try {
    const res = await orderApi.confirmReceipt(orderDetail.value.id);
    if (res.code === 200) {
      MessagePlugin.success('确认收货成功');
      await getOrderDetailData();
    }
  } catch (error) {
    console.error('确认收货失败：', error);
    MessagePlugin.error('确认收货失败，请稍后重试');
  }
};

/**
 * 联系客服
 */
const handleContactService = () => {
  MessagePlugin.info('客服热线：400-123-4567');
};

/**
 * 保存订单
 */
const handleSaveOrder = () => {
  MessagePlugin.success('订单信息保存成功');
};

/**
 * 跳转首页
 */
const goToHome = () => {
  router.push('/');
};

/**
 * 跳转订单列表
 */
const goToOrderList = () => {
  router.push('/order-manage');
};
</script>

<style scoped>
/* 新增订单基础信息卡片样式 */
.order-base-card {
  background: #FFFFFF;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.base-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.base-info-item label {
  color: #6A6B6D;
  font-weight: 500;
}
.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #FFFFFF;
}
.status-default {
  background: #838486;
}
.status-pending {
  background: #F7BA1E;
}
.status-processing {
  background: #1DA4B6;
}
.status-success {
  background: #00B42A;
}
.status-error {
  background: #F53F3F;
}
.status-complete {
  background: #86909C;
}
.status-item {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.no-contract {
  color: #838486;
  font-size: 14px;
}
.amount-info-wrap {
  margin-top: 16px;
  display: flex;
  gap: 20px;
  padding: 12px;
  background: #FAFAFC;
  border-radius: 6px;
}
.amount-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}
.amount-item label {
  color: #6A6B6D;
}
.link-text {
  color: #1DA4B6;
  cursor: pointer;
  text-decoration: underline;
}
.goods-header-total {
  width: 20%;
  text-align: right;
}
.goods-item-total {
  width: 20%;
  text-align: right;
  font-size: 14px;
  color: #F72B1C;
}

/* 原有样式保持不变 */
.order-detail-page {
  min-height: 100vh;
  background: #F8F9FA;
}
.main-container {
  width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
.breadcrumb {
  font-size: 14px;
  color: #838486;
  margin-bottom: 20px;
  padding: 16px 0;
}
.breadcrumb-item {
  cursor: pointer;
  color: #838486;
  transition: color 0.2s;
}
.breadcrumb-item:hover, .breadcrumb-item.active {
  color: #1DA4B6;
}
.breadcrumb-sep {
  margin: 0 4px;
}
.detail-module {
  margin-bottom: 20px;
  border-radius: 14px;
  background: #FFFFFF;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.module-title {
  font-size: 16px;
  font-weight: 500;
  color: #272727;
}
.module-actions {
  display: flex;
  gap: 12px;
}
.action-btn {
  display: flex;
  align-items: center;
  height: 28px;
  gap: 4px;
  padding: 4px 10px;
  font-size: 14px;
  color: #515152;
  border-radius: 4px;
  min-width: 65px;
  border: 1px solid #DCDEE2;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  border-color: #1DA4B6;
  color: #1DA4B6;
}
.btn-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.btn-text {
  line-height: 1;
}
.module-content {
  font-size: 14px;
}
.info-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px 40px;
  padding: 12px 0;
}
.info-row-warp {
  border-radius: 14px;
  background: #FAFAFC;
  padding: 20px;
}
.info-label {
  color: #6A6B6D;
  min-width: 80px;
  margin-right: 10px;
}
.info-value {
  color: #272727;
}
.contract-row {
  align-items: center;
  gap: 30px;
}
.contract-download-wrap, .upload-contract-wrap {
  width: 230px;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid #DCDEE2;
  border-radius: 6px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  cursor: pointer;
}
.download-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #272727;
}
.download-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.upload-text {
  color: #272727;
}
.upload-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.address-info-row {
  display: flex;
  align-items: flex-start;
  gap: 40px;
  padding: 12px 0;
}
.address-content {
  flex: 1;
  background: #FAFAFC;
  border-radius: 6px;
  padding: 8px 12px;
}
.contact-info {
  display: block;
  color: #272727;
  margin-bottom: 4px;
}
.address-detail {
  color: #272727;
}
.special-require-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.special-require-input {
  width: 300px;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid #DCDEE2;
  border-radius: 6px;
  padding: 4px 10px;
  color: #272727;
}
.pay-upload-row {
  align-items: center;
  gap: 30px;
  margin-bottom: 12px;
}
.payment-upload-wrap {
  width: 230px;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid #DCDEE2;
  border-radius: 6px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.payment-upload-text {
  color: #272727;
}
.payment-upload-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.invoice-company-wrap {
  background: #FAFAFC;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 16px;
}
.invoice-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}
.invoice-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.invoice-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.invoice-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.invoice-input {
  width: 100%;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid #DCDEE2;
  border-radius: 6px;
  padding: 4px 10px;
  color: #272727;
}
.goods-header {
  display: flex;
  padding: 12px 20px;
  background: #F8FAFD;
  border-radius: 6px 6px 0 0;
  margin-bottom: 1px;
}
.goods-header-item {
  font-size: 14px;
  color: #6A6B6D;
  font-weight: 500;
}
.goods-header-name {
  width: 40%;
}
.goods-header-count {
  width: 20%;
  text-align: center;
}
.goods-header-price {
  width: 20%;
  text-align: right;
}
.goods-list {
  border: 1px solid #ECEEF2;
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}
.goods-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F5F5F5;
}
.goods-item:last-child {
  border-bottom: none;
}
.goods-item-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 40%;
}
.goods-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.goods-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.goods-name {
  font-size: 14px;
  color: #272727;
}
.goods-color {
  font-size: 12px;
  color: #838486;
}
.goods-item-count {
  width: 20%;
  text-align: center;
  font-size: 14px;
  color: #838486;
}
.goods-item-price {
  width: 20%;
  text-align: right;
  font-size: 14px;
  color: #F72B1C;
}
.order-summary-wrap {
  margin-top: 16px;
  padding: 16px;
  background: #F8FAFD;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}
.summary-item {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #838486;
}
.summary-label {
  min-width: 80px;
  text-align: right;
}
.summary-value {
  color: #272727;
}
.summary-item.total .summary-label {
  font-weight: 500;
  color: #272727;
}
.summary-item.total .summary-value {
  color: #F72B1C;
  font-weight: bold;
  font-size: 16px;
}
.supplement-module {
  background: #FFFFFF;
}
.supplement-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.supplement-content .input-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 0;
}
.supplement-content .info-label {
  min-width: 90px;
  padding-top: 8px;
}
.supplement-content .info-input {
  flex: 1;
  height: 36px;
  background: #FFFFFF;
  border: 1px solid #DCDEE2;
  border-radius: 4px;
  padding: 0 12px;
  color: #272727;
}
.order-note-textarea {
  flex: 1;
  height: 80px;
  background: #FFFFFF;
  border: 1px solid #DCDEE2;
  border-radius: 4px;
  padding: 10px 12px;
  resize: none;
  color: #272727;
  font-size: 14px;
}
.supplement-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
}
.supplement-buttons .btn-contact {
  height: 40px;
  padding: 0 30px;
  border: 1px solid #1DA4B6;
  border-radius: 4px;
  background: #FFFFFF;
  color: #1DA4B6;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.supplement-buttons .btn-contact:hover {
  background: #1DA4B6;
  color: #FFFFFF;
}
.supplement-buttons .btn-save {
  height: 40px;
  padding: 0 30px;
  border: none;
  border-radius: 4px;
  background: #1DA4B6;
  color: #FFFFFF;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.supplement-buttons .btn-save:hover {
  background: #18909E;
}
.supplement-buttons .btn-confirm {
  height: 40px;
  padding: 0 30px;
  border: none;
  border-radius: 4px;
  background: #F72B1C;
  color: #FFFFFF;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.supplement-buttons .btn-confirm:hover {
  background: #D92212;
}
</style>