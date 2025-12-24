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
        <span class="breadcrumb-item">订单管理</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item active">订单详情</span>
      </div>

      <!-- 订单状态进度条 -->
      <OrderStatus 
        :completedStepIndex="3"
        :steps="statusSteps"
      />

      <!-- 下单主体模块 -->
      <div class="detail-module">
        <div class="module-header">
          <h3 class="module-title">下单主体</h3>
          <div class="module-actions">
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('add', true)"
              @mouseleave="toggleBtnIcon('add', false)"
            >
              <img :src="addBtnIcon" alt="新增" class="btn-icon">
              <span class="btn-text">新增</span>
            </button>
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('help', true)"
              @mouseleave="toggleBtnIcon('help', false)"
            >
              <img :src="helpBtnIcon" alt="说明" class="btn-icon">
              <span class="btn-text">说明</span>
            </button>
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('more', true)"
              @mouseleave="toggleBtnIcon('more', false)"
            >
              <span class="btn-text">查看全部</span>
              <img :src="moreBtnIcon" alt="更多" class="btn-icon">
            </button>
          </div>
        </div>
        <div class="module-content">
          <!-- 封装的单选组件 -->
          <RadioGroupSingle
            :options="[
              { label: '企业', value: 'company' },
              { label: '个人', value: 'personal' }
            ]"
            v-model="subjectType"
            groupName="subject-type"
          />
          <!-- 企业信息行 -->
          <div class="info-row info-row-warp">
            <span class="info-label">企业</span>
            <span class="info-value">北京水晶盈网络科技有限公司</span>
            <span class="info-label">统一社会信用代码</span>
            <span class="info-value">91110108MAPHWW114T</span>
            <span class="info-label">法人</span>
            <span class="info-value">张圆圆</span>
          </div>
        </div>
      </div>

      <!-- 订单合同模块 -->
      <div class="detail-module">
        <div class="module-header">
          <h3 class="module-title">订单合同</h3>
          <div class="module-actions">
            <!-- 新增按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('contractAdd', true)"
              @mouseleave="toggleBtnIcon('contractAdd', false)"
            >
              <img :src="contractAddBtnIcon" alt="新增" class="btn-icon">
              <span class="btn-text">新增</span>
            </button>
            <!-- 说明按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('contractHelp', true)"
              @mouseleave="toggleBtnIcon('contractHelp', false)"
            >
              <img :src="contractHelpBtnIcon" alt="说明" class="btn-icon">
              <span class="btn-text">说明</span>
            </button>
            <!-- 查看全部按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('contractMore', true)"
              @mouseleave="toggleBtnIcon('contractMore', false)"
            >
              <span class="btn-text">查看全部</span>
              <img :src="contractMoreBtnIcon" alt="更多" class="btn-icon">
            </button>
          </div>
        </div>
        <div class="module-content">
          <!-- 封装的单选组件 -->
          <RadioGroupSingle
            :options="[
              { label: '需要', value: 'need' },
              { label: '不需要', value: 'notNeed' }
            ]"
            v-model="contractType"
            groupName="contract-type"
          />
          <!-- 合同信息行 -->
          <div class="info-row contract-row">
            <span class="info-label">合同下载</span>
            <div class="contract-download-wrap" @click="handleDownload">
              <span class="download-text">北京水晶盈网络科技有限公司</span>
              <img src="/images/download.png" alt="下载" class="download-icon">
            </div>
            <span class="info-label">上传合同</span>
            <div class="upload-contract-wrap" @click="handleUploadContract">
              <span class="upload-text">请盖章后上传</span>
              <img src="/images/new-white.png" alt="新增" class="upload-icon">
            </div>
          </div>
        </div>
      </div>

      <!-- 收货地址模块 -->
      <div class="detail-module">
        <div class="module-header">
          <h3 class="module-title">收货地址</h3>
          <div class="module-actions">
            <!-- 新增收货地址按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('addressAdd', true)"
              @mouseleave="toggleBtnIcon('addressAdd', false)"
            >
              <img :src="addressAddBtnIcon" alt="新增" class="btn-icon">
              <span class="btn-text">新增收货地址</span>
            </button>
            <!-- 查看全部按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('addressMore', true)"
              @mouseleave="toggleBtnIcon('addressMore', false)"
            >
              <span class="btn-text">查看全部</span>
              <img :src="addressMoreBtnIcon" alt="更多" class="btn-icon">
            </button>
          </div>
        </div>
        <div class="module-content">
          <!-- 封装的单选组件 -->
          <RadioGroupSingle
            :options="[
              { label: '需要', value: 'need' },
              { label: '不需要', value: 'notNeed' }
            ]"
            v-model="addressType"
            groupName="address-type"
          />
          <!-- 地址信息行 -->
          <div class="info-row address-info-row">
            <div class="address-content">
              <span class="contact-info">张圆圆 1381999999</span>
              <span class="address-detail">北京市海淀区西三环北路50号院6号楼16层1909</span>
            </div>
            <div class="special-require-wrap">
              <span class="info-label">特殊需求</span>
              <input type="text" class="special-require-input" placeholder="请输入">
            </div>
          </div>
        </div>
      </div>

      <!-- 付款方式模块 -->
      <div class="detail-module">
        <div class="module-header">
          <h3 class="module-title">付款方式</h3>
          <div class="module-actions">
            <!-- 说明按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('payHelp', true)"
              @mouseleave="toggleBtnIcon('payHelp', false)"
            >
              <img :src="payHelpBtnIcon" alt="说明" class="btn-icon">
              <span class="btn-text">说明</span>
            </button>
            <!-- 查看全部按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('payMore', true)"
              @mouseleave="toggleBtnIcon('payMore', false)"
            >
              <span class="btn-text">查看全部</span>
              <img :src="payMoreBtnIcon" alt="更多" class="btn-icon">
            </button>
          </div>
        </div>
        <div class="module-content">
          <!-- 封装的单选组件 -->
          <RadioGroupSingle
            :options="[
              { label: '立即付款', value: 'immediate' },
              { label: '延期付款', value: 'delay' },
              { label: '授信额度', value: 'credit' }
            ]"
            v-model="payType"
            groupName="pay-type"
          />
          <!-- 上传支付凭证 -->
          <div class="info-row pay-upload-row">
            <span class="info-label">上传支付凭证</span>
            <div class="payment-upload-wrap" @click="handleUploadPayment">
              <span class="payment-upload-text">请上传</span>
              <img src="/images/new-white.png" alt="上传" class="payment-upload-icon">
            </div>
          </div>
          <!-- 收款信息行 -->
          <div class="info-row info-row-warp">
            <span class="info-label">收款方名称</span>
            <span class="info-value">北京水晶盈网络科技有限公司</span>
            <span class="info-label">收款方开户行</span>
            <span class="info-value">中国工商银行股份有限公司北京紫竹桥支行</span>
            <span class="info-label">收款方账号</span>
            <span class="info-value">02002359500200033061</span>
          </div>
        </div>
      </div>

      <!-- 发票信息模块（三列对齐优化） -->
      <div class="detail-module">
        <div class="module-header">
          <h3 class="module-title">发票信息</h3>
          <div class="module-actions">
            <!-- 说明按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('invoiceHelp', true)"
              @mouseleave="toggleBtnIcon('invoiceHelp', false)"
            >
              <img :src="invoiceHelpBtnIcon" alt="说明" class="btn-icon">
              <span class="btn-text">说明</span>
            </button>
            <!-- 查看全部按钮 -->
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('invoiceMore', true)"
              @mouseleave="toggleBtnIcon('invoiceMore', false)"
            >
              <span class="btn-text">查看全部</span>
              <img :src="invoiceMoreBtnIcon" alt="更多" class="btn-icon">
            </button>
          </div>
        </div>
        <div class="module-content">
          <!-- 封装的单选组件 -->
          <RadioGroupSingle
            :options="[
              { label: '需要', value: 'need' },
              { label: '不需要', value: 'notNeed' }
            ]"
            v-model="invoiceType"
            groupName="invoice-type"
          />
          <!-- 发票企业信息（三列对齐布局） -->
          <div class="invoice-company-wrap">
            <div class="invoice-grid">
              <!-- 第一列 -->
              <div class="invoice-col">
                <div class="invoice-item">
                  <span class="info-label">企业名称</span>
                  <span class="info-value">北京水晶盈网络科技有限公司</span>
                </div>
                <div class="invoice-item">
                  <span class="info-label">公司电话</span>
                  <span class="info-value">010-68432188</span>
                </div>
                <div class="invoice-item">
                  <span class="info-label">行号</span>
                  <span class="info-value">102100023552</span>
                </div>
              </div>
              <!-- 第二列 -->
              <div class="invoice-col">
                <div class="invoice-item">
                  <span class="info-label">统一社会信用代码</span>
                  <span class="info-value">91110108MABPHW114T</span>
                </div>
                <div class="invoice-item">
                  <span class="info-label">开户银行</span>
                  <span class="info-value">中国工商银行股份有限公司北京紫竹桥支行</span>
                </div>
                <div class="invoice-item">
                  <span class="info-label">开票金额</span>
                  <span class="info-value">699.00</span>
                </div>
              </div>
              <!-- 第三列 -->
              <div class="invoice-col">
                <div class="invoice-item">
                  <span class="info-label">公司地址</span>
                  <span class="info-value">北京市海淀区西三环北路50号院6号楼16层1909</span>
                </div>
                <div class="invoice-item">
                  <span class="info-label">银行账号</span>
                  <span class="info-value">02002359500200033061</span>
                </div>
                <div class="invoice-item">
                  <span class="info-label">&nbsp;</span>
                  <span class="info-value">&nbsp;</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 开票明细 -->
          <div class="input-row invoice-input-row">
            <span class="info-label">开票明细</span>
            <input type="text" class="invoice-input" placeholder="自动带入，可修改">
          </div>
          <!-- 特殊需求 -->
          <div class="input-row invoice-input-row">
            <span class="info-label">特殊需求</span>
            <input type="text" class="invoice-input" placeholder="请输入">
          </div>
        </div>
      </div>

      <!-- 订单信息模块（严格参考UI优化） -->
      <div class="detail-module">
        <div class="module-header">
          <h3 class="module-title">订单信息</h3>
          <div class="module-actions">
            <button 
              class="action-btn"
              @mouseenter="toggleBtnIcon('orderMore', true)"
              @mouseleave="toggleBtnIcon('orderMore', false)"
            >
              <span class="btn-text">查看全部</span>
              <img :src="orderMoreBtnIcon" alt="更多" class="btn-icon">
            </button>
          </div>
        </div>
        <div class="module-content">
          <!-- 商品列表表头 -->
          <div class="goods-header">
            <div class="goods-header-item goods-header-name">商品信息</div>
            <div class="goods-header-item goods-header-count">数量</div>
            <div class="goods-header-item goods-header-price">单价</div>
          </div>
          <!-- 商品列表 -->
          <div class="goods-list">
            <div class="goods-item" v-for="(item, idx) in orderGoods" :key="idx">
              <div class="goods-item-detail">
                <img :src="item.img" alt="商品" class="goods-img">
                <div class="goods-info">
                  <div class="goods-name">{{ item.name }}</div>
                  <div class="goods-color">{{ item.color }}</div>
                </div>
              </div>
              <div class="goods-item-count">× {{ item.count }}</div>
              <div class="goods-item-price">{{ item.price }}</div>
            </div>
          </div>
          <!-- 订单汇总 -->
          <div class="order-summary-wrap">
            <div class="summary-item">
              <span class="summary-label">商品总数量</span>
              <span class="summary-value">× {{ totalGoodsCount }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">商品总金额</span>
              <span class="summary-value">{{ totalGoodsAmount }}</span>
            </div>
            <div class="summary-item total">
              <span class="summary-label">优惠金额</span>
              <span class="summary-value">¥0.00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单补充模块（严格匹配UI截图） -->
      <div class="detail-module supplement-module">
        <div class="module-header">
          <h3 class="module-title">订单补充</h3>
        </div>
        <div class="module-content supplement-content">
          <!-- 对接业务员 -->
          <div class="input-row">
            <span class="info-label">对接业务员</span>
            <input 
              type="text" 
              class="info-input" 
              value="张圆圆" 
              readonly
            >
          </div>
          <!-- 订单留言 -->
          <div class="input-row">
            <span class="info-label">订单留言</span>
            <textarea 
              class="order-note-textarea" 
              placeholder="请输入"
            ></textarea>
          </div>
          <!-- 模块内按钮区域 -->
          <div class="supplement-buttons">
            <button class="btn-contact" @click="handleContactService">联系客服</button>
            <button class="btn-save" @click="handleSaveOrder">保存订单</button>
          </div>
        </div>
      </div>

    </div>

    <!-- 公共页尾 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// 导入公共组件
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import OrderStatus from '@/components/common/OrderStatus.vue';
import RadioGroupSingle from '@/components/common/RadioGroupInput.vue'; // 封装的单选组件

const router = useRouter();

// 订单状态步骤数据
const statusSteps = ref([
  { name: '已付款', date: '2025-10-16', completed: true },
  { name: '已下单', date: '2025-10-16', completed: true },
  { name: '生产中', date: '2025-10-16', completed: true },
  { name: '生产完成', date: '2025-10-16', completed: true },
  { name: '已发货', date: '', completed: false },
  { name: '已完成', date: '', completed: false }
]);

// 各模块单选值
const subjectType = ref('company');
const contractType = ref('need');
const addressType = ref('need');
const payType = ref('immediate'); // 付款方式单选值
const invoiceType = ref('need'); // 发票信息单选值

// 操作按钮图标（hover切换）
const addBtnIcon = ref('/images/new-white.png');
const helpBtnIcon = ref('/images/help.png');
const moreBtnIcon = ref('/images/down-white.png');

// 订单合同按钮图标
const contractAddBtnIcon = ref('/images/new-white.png');
const contractHelpBtnIcon = ref('/images/help.png');
const contractMoreBtnIcon = ref('/images/down-white.png');

// 收货地址按钮图标
const addressAddBtnIcon = ref('/images/new-white.png');
const addressMoreBtnIcon = ref('/images/down-white.png');

// 付款方式按钮图标
const payHelpBtnIcon = ref('/images/help.png');
const payMoreBtnIcon = ref('/images/down-white.png');

// 发票信息按钮图标
const invoiceHelpBtnIcon = ref('/images/help.png');
const invoiceMoreBtnIcon = ref('/images/down-white.png');

// 订单信息按钮图标
const orderMoreBtnIcon = ref('/images/down-white.png');

// 切换按钮图标
const toggleBtnIcon = (type, isHover) => {
  if (type === 'add') {
    addBtnIcon.value = isHover ? '/images/new.png' : '/images/new-white.png';
  } else if (type === 'help') {
    helpBtnIcon.value = isHover ? '/images/help.png' : '/images/help.png';
  } else if (type === 'more') {
    moreBtnIcon.value = isHover ? '/images/down.png' : '/images/down-white.png';
  } else if (type === 'contractAdd') {
    contractAddBtnIcon.value = isHover ? '/images/new.png' : '/images/new-white.png';
  } else if (type === 'contractHelp') {
    contractHelpBtnIcon.value = isHover ? '/images/help.png' : '/images/help.png';
  } else if (type === 'contractMore') {
    contractMoreBtnIcon.value = isHover ? '/images/down.png' : '/images/down-white.png';
  } else if (type === 'addressAdd') {
    addressAddBtnIcon.value = isHover ? '/images/new.png' : '/images/new-white.png';
  } else if (type === 'addressMore') {
    addressMoreBtnIcon.value = isHover ? '/images/down.png' : '/images/down-white.png';
  } else if (type === 'payHelp') {
    payHelpBtnIcon.value = isHover ? '/images/help.png' : '/images/help.png';
  } else if (type === 'payMore') {
    payMoreBtnIcon.value = isHover ? '/images/down.png' : '/images/down-white.png';
  } else if (type === 'invoiceHelp') {
    invoiceHelpBtnIcon.value = isHover ? '/images/help.png' : '/images/help.png';
  } else if (type === 'invoiceMore') {
    invoiceMoreBtnIcon.value = isHover ? '/images/down.png' : '/images/down-white.png';
  } else if (type === 'orderMore') {
    orderMoreBtnIcon.value = isHover ? '/images/down.png' : '/images/down-white.png';
  }
};

// 订单商品数据
const orderGoods = ref([
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋',
    color: '黄色',
    count: 1,
    price: '¥2999'
  },
  {
    img: '/images/product.png',
    name: 'MX芳纶系列滤袋',
    color: '黄色',
    count: 1,
    price: '¥2999'
  }
]);

// 计算商品总数、总金额
const totalGoodsCount = computed(() => {
  return orderGoods.value.reduce((sum, item) => sum + item.count, 0);
});
const totalGoodsAmount = computed(() => {
  const total = orderGoods.value.reduce((sum, item) => sum + Number(item.price.replace('¥', '')) * item.count, 0);
  return `¥${total}`;
});
const totalAmount = computed(() => totalGoodsAmount.value);

// 操作方法
const handleDownload = () => {
  console.log('点击合同下载');
};
const handleUploadContract = () => {
  console.log('点击上传合同');
};
const handleUploadPayment = () => {
  console.log('点击上传支付凭证');
};
const handleContactService = () => {
  console.log('点击联系客服');
};
const handleSaveOrder = () => {
  console.log('点击保存订单');
};

// 跳转首页
const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
/* 页面全局样式 */
.order-detail-page {
  min-height: 100vh;
  background: #F8F9FA;
}
.main-container {
  width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 面包屑样式 */
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

/* 详情模块通用样式 */
.detail-module {
  margin-bottom: 20px;
  border-radius: 14px;
  background: #FFFFFF;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

/* 模块头部 */
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

/* 操作按钮样式 */
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

/* 模块内容区 */
.module-content {
  font-size: 14px;
}

/* 信息行通用样式 */
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

/* 订单合同模块专属样式 */
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
  cursor: pointer; /* 鼠标经过变小手 */
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

/* 收货地址模块专属样式 */
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

/* 付款方式模块专属样式 */
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
  cursor: pointer; /* 鼠标经过变小手 */
}
.payment-upload-text {
  color: #272727;
}
.payment-upload-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

/* 发票信息模块专属样式（三列对齐） */
.invoice-company-wrap {
  background: #FAFAFC;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 16px;
}
.invoice-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

/* 订单信息模块专属样式（严格参考UI） */
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
  width: 60%;
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
  width: 60%;
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

/* 订单补充模块专属样式（匹配UI截图） */
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
</style>