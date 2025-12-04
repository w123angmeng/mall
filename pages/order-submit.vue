<template>
  <div class="order-submit-page">
    <!-- 公共页首 -->
    <Header />

    <!-- 主体区域 -->
    <div class="main-container">
      <!-- 面包屑 -->
      <div class="breadcrumb">
        <span class="breadcrumb-item" @click="goToHome">首页</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item">提交订单</span>
      </div>

      <!-- 公共步骤导航 -->
      <OrderStepNav 
        :currentStep="currentStep"
        :steps="stepList"
      />

      <!-- 步骤1：下单主体信息（严格匹配UI） -->
      <div class="step-content" v-if="currentStep === 1">
        <h2 class="step-title">下单主体信息</h2>

        <!-- 提示条：tip.png + 样式 -->
        <div class="tip-bar">
          <img src="@/assets/images/tip.png" alt="提示" class="tip-icon">
          <span class="tip-text">必须选择一个主体才能下单</span>
        </div>

        <!-- 内容区：背景#F8FAFD + 高度204px -->
        <div class="subject-content">
          <div class="form-group">
            <label class="form-label required">下单主题：</label>
            <!-- 复用优化后的单选组件 -->
            <RadioGroup 
              :options="subjectOptions"
              v-model="formData.subject.type"
              groupName="subject-type"
            />
          </div>

          <!-- 企业信息区域（选中“企业”时显示） -->
          <div class="enterprise-info" v-if="formData.subject.type === 'company'">
            <div class="form-row">
              <span class="form-label">企业名称：</span>
              <span class="form-value">北京岩排材料有限公司</span>
            </div>
            <div class="form-row">
              <span class="form-label">统一社会信用代码：</span>
              <span class="form-value">SCH8P487975420201</span>
            </div>
            <div class="form-row">
              <span class="form-label">法人姓名：</span>
              <span class="form-value">张三</span>
            </div>
          </div>
        </div>

        <!-- 新增企业区域 -->
        <div class="add-enterprise">
          <button class="add-btn" @click="handleAddEnterprise">
            <img src="@/assets/images/new.png" alt="新增" class="add-icon">
            <span class="add-text">新增企业</span>
          </button>
          <span class="add-note">您最多可以创建5个企业</span>
        </div>

        <!-- 查看全部企业区域（替换展开图标为down.png） -->
        <div class="view-enterprises">
          <span class="view-text">查看全部企业：</span>
          <button class="expand-btn" @click="toggleExpandEnterprises">
            展开
            <img src="@/assets/images/down.png" alt="展开" class="expand-icon">
          </button>
        </div>

        <!-- 底部操作栏 -->
        <div class="step-footer">
          <div class="total-amount">
            结算金额：<span class="amount-value">¥2896.80</span>
          </div>
          <div class="btn-group">
            <button class="btn-cancel" @click="goToCart">取消</button>
            <button class="btn-next" @click="toNextStep">下一步</button>
          </div>
        </div>
      </div>

      <!-- 步骤2：订单合同信息（严格匹配新UI + 步骤一按钮样式） -->
      <div class="step-content" v-if="currentStep === 2">
        <h2 class="step-title">订单合同信息</h2>

        <!-- 提示条：匹配UI样式 -->
        <div class="tip-bar">
          <img src="@/assets/images/tip.png" alt="提示" class="tip-icon">
          <span class="tip-text">合同下载后请查收上传，可以先下载再上传合同！</span>
        </div>

        <!-- 订单合同单选组 -->
        <div class="form-group contract-radio-group">
          <label class="form-label required">订单合同：</label>
          <!-- 复用分段单选组件 -->
          <RadioGroup 
            :options="contractOptions"
            v-model="formData.contract.type"
            groupName="contract-type"
          />
        </div>

        <!-- 合同下载区域 -->
        <div class="form-desc contract-download">
          <span>合同下载：</span>
          <a href="#" class="link">这是合同文件，下载文件名称为20个字符，超过部分...</a>
          <span class="link-suffix">.pdf</span>
        </div>

        <!-- 董监高文件附件区域（参考步骤一新增企业按钮样式） -->
        <div class="form-group attachment-group">
          <label class="form-label">董监高文件附件：</label>
          <div class="attachment-content">
            <button class="upload-btn" @click="handleUploadAttachment">
              <img src="@/assets/images/upload.png" alt="上传" class="upload-icon">
              <span class="upload-text">上传文件</span>
            </button>
            <span class="form-note">（仅支持.pdf, word, excel, jpg, png）</span>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="step-footer">
          <div class="total-amount">
            结算总价：<span class="amount-value">¥2896.80</span>
          </div>
          <div class="btn-group">
            <button class="btn-cancel" @click="goToCart">取消</button>
            <button class="btn-prev" @click="toPrevStep">上一步</button>
            <button class="btn-next" @click="toNextStep">下一步</button>
          </div>
        </div>
      </div>

      <!-- 步骤3：收货地址（严格匹配新UI + 步骤一样式） -->
      <div class="step-content" v-if="currentStep === 3">
        <h2 class="step-title">收货地址</h2>

        <!-- 填写收货信息区域（背景+布局匹配UI） -->
        <div class="address-form-container">
          <h3 class="address-form-title">填写收货信息</h3>
          
          <!-- 姓名输入行 -->
          <div class="form-row short-input-row">
            <label class="form-label required">姓名：</label>
            <input 
              type="text" 
              class="form-input short-input"
              placeholder="请输入姓名"
              v-model="formData.address.name"
            >
          </div>
          
          <!-- 电话输入行 -->
          <div class="form-row short-input-row">
            <label class="form-label required">电话：</label>
            <input 
              type="tel" 
              class="form-input short-input"
              placeholder="请输入电话号码"
              v-model="formData.address.phone"
            >
          </div>
          
          <!-- 地址输入行 -->
          <div class="form-row long-input-row">
            <label class="form-label required">地址：</label>
            <input 
              type="text" 
              class="form-input long-input"
              placeholder="请输入地址"
              v-model="formData.address.detail"
            >
          </div>
          
          <!-- 特殊要求输入行 -->
          <div class="form-row long-input-row">
            <label class="form-label">特殊要求：</label>
            <input 
              type="text" 
              class="form-input long-input"
              placeholder="请输入描述"
              v-model="formData.address.note"
            >
          </div>
        </div>

        <!-- 收货地址提示条（参考步骤一tip样式） -->
        <div class="tip-bar address-tip">
          <img src="@/assets/images/tip.png" alt="提示" class="tip-icon">
          <span class="tip-text">收货地址</span>
        </div>

        <!-- 查看全部地址区域（参考步骤一展开样式） -->
        <div class="view-addresses">
          <span class="view-text">查看全部地址：</span>
          <button class="expand-btn" @click="toggleExpandAddresses">
            展开
            <img src="@/assets/images/down.png" alt="展开" class="expand-icon">
          </button>
        </div>

        <!-- 底部操作栏 -->
        <div class="step-footer">
          <div class="total-amount">
            结算总额：<span class="amount-value address-total">¥2896.80</span>
          </div>
          <div class="btn-group">
            <button class="btn-cancel" @click="goToCart">取消</button>
            <button class="btn-prev" @click="toPrevStep">上一步</button>
            <button class="btn-next" @click="toNextStep">下一步</button>
          </div>
        </div>
      </div>

      <!-- 步骤4：付款方式（严格匹配新UI + 步骤一样式） -->
      <div class="step-content" v-if="currentStep === 4">
        <h2 class="step-title">付款方式</h2>

        <!-- 提示条（匹配UI图样式） -->
        <div class="tip-bar pay-tip">
          <img src="@/assets/images/tip.png" alt="提示" class="tip-icon">
          <span class="tip-text">立即付款需要上传付款凭证后下单</span>
        </div>
        <div class="upload-proof-group-wrap">
          <!-- 付款方式单选组（参考步骤一单选样式） -->
          <div class="form-group pay-radio-group">
            <label class="form-label required">付款主题：</label>
            <RadioGroup 
              :options="payOptions"
              v-model="formData.pay.type"
              groupName="pay-type"
            />
          </div>

          <!-- 上传付款凭证（参考步骤一新增企业按钮样式） -->
          <div class="form-group upload-proof-group">
            <label class="form-label">上传付款凭证：</label>
            <button class="upload-btn" @click="handleUploadPayProof">
              <img src="@/assets/images/upload.png" alt="上传" class="upload-icon">
              <span class="upload-text">上传文件</span>
            </button>
            <span class="form-note">格式支持pdf、word、excel、jpeg、png。</span>
          </div>

          <!-- 收款方信息（匹配UI图排版） -->
          <div class="payee-info">
            <div class="payee-row">
              <span class="payee-label">收款方名称：</span>
              <span class="payee-value">北京优创锐科技有限公司</span>
            </div>
            <div class="payee-row">
              <span class="payee-label">收款方开户行：</span>
              <span class="payee-value">5DHJHF88775432201</span>
            </div>
            <div class="payee-row">
              <span class="payee-label">收款账号：</span>
              <span class="payee-value">6288 8888 8888 8888</span>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="step-footer">
          <div class="total-amount">
            结算总额：<span class="amount-value pay-total">¥2896.80</span>
          </div>
          <div class="btn-group">
            <button class="btn-cancel" @click="goToCart">取消</button>
            <button class="btn-prev" @click="toPrevStep">上一步</button>
            <button class="btn-next" @click="toNextStep">下一步</button>
          </div>
        </div>
      </div>

      <!-- 步骤5：信息确认（严格匹配UI图） -->
      <div class="step-content" v-if="currentStep === 5">
        <h2 class="step-title">信息确认</h2>

        <!-- 收票及结算信息提示条 -->
        <div class="tip-bar info-tip">
          <span class="tip-title">收票及结算信息</span>
          <span class="tip-desc">请您信息核对无误后再下单，没有票则不需要！</span>
        </div>
		<div class="subject-content">
        <!-- 是否需要发票单选组 -->
        <div class="form-group invoice-radio-group">
          <label class="form-label required">是否需要发票：</label>
          <RadioGroup 
            :options="invoiceOptions"
            v-model="formData.other.invoiceType"
            groupName="invoice-type"
          />
        </div>

        <!-- 企业信息区域 -->
        <div class="company-info">
          <div class="info-row">
            <span class="info-label">企业名称：</span>
            <span class="info-value">北京优创锐科技有限公司</span>
            <button class="edit-btn">✎</button>
          </div>
          <div class="info-row">
            <span class="info-label">统一社会信用代码：</span>
            <span class="info-value">91110108MA01A4PWVT</span>
            <button class="edit-btn">✎</button>
          </div>
          <div class="info-row">
            <span class="info-label">公司地址：</span>
            <span class="info-value">北京市海淀区中关村826号创科园号楼5099</span>
            <button class="edit-btn">✎</button>
          </div>
          <div class="info-row">
            <span class="info-label">公司电话：</span>
            <span class="info-value">010-86437388</span>
            <button class="edit-btn">✎</button>
          </div>
          <div class="info-row">
            <span class="info-label">开户行：</span>
            <span class="info-value">中国交通银行股份有限公司北京紫竹支行</span>
            <button class="edit-btn">✎</button>
          </div>
          <div class="info-row">
            <span class="info-label">银行账号：</span>
            <span class="info-value">20230606000000000001</span>
            <button class="edit-btn">✎</button>
          </div>
          <div class="info-row">
            <span class="info-label">行号：</span>
            <span class="info-value">0200000052</span>
            <button class="edit-btn">✎</button>
          </div>
        </div>

        <!-- 开票信息 & 付款摘要输入框 -->
        <div class="form-group invoice-input-group">
          <label class="form-label">开票信息：</label>
          <input 
            type="text" 
            class="form-input invoice-input"
            placeholder="请按照实际开票信息输入，可修改"
            v-model="formData.other.invoiceInfo"
          >
          <span class="char-count">0/200</span>
        </div>
        <div class="form-group payment-summary-group">
          <label class="form-label">付款摘要：</label>
          <input 
            type="text" 
            class="form-input summary-input"
            placeholder="请输入"
            v-model="formData.other.paymentSummary"
          >
          <span class="char-count">0/200</span>
        </div>
		</div>
        <!-- 订单信息区域 -->
        <div class="order-info-container">
          <h3 class="order-info-title">订单信息</h3>
		  <div class="subject-content">
          <div class="order-info-content">
            <!-- 商品列表 -->
            <div class="goods-list">
              <div class="goods-item" v-for="(item, idx) in orderGoods" :key="idx">
                <img :src="item.img" alt="商品" class="goods-img">
                <div class="goods-detail">
                  <div class="goods-name">{{ item.name }}</div>
                  <div class="goods-desc">型号：统一 规格</div>
                </div>
                <div class="goods-count">× {{ item.count }}</div>
                <div class="goods-price">¥{{ item.price }}</div>
              </div>
            </div>
            <!-- 订单汇总 -->
            <div class="order-summary">
                  <div class="summary-inner">
                    <div class="summary-item">
                      <span class="summary-label">商品总数：</span>
                      <span class="summary-value">{{ totalGoodsCount }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">商品金额：</span>
                      <span class="summary-value">¥{{ totalGoodsAmount }}</span>
                    </div>
                    <div class="summary-item total">
                      <span class="summary-label">结算金额：</span>
                      <span class="summary-value">¥{{ totalAmount }}</span>
                    </div>
                  </div>
            </div>
          </div>
		  </div>
        </div>

        <!-- 订单其他补充 -->
        <div class="order-supplement">
          <h3 class="supplement-title">订单其他补充</h3>
		  <div class="subject-content">
          <div class="form-group contract-remark-group">
            <label class="form-label">客户合同备注：</label>
            <input 
              type="text" 
              class="form-input remark-input"
              placeholder="请按照实际输入，可修改"
              v-model="formData.other.contractRemark"
            >
            <span class="char-count">0/200</span>
          </div>
          <div class="form-group order-remark-group">
            <label class="form-label">订单备注：</label>
            <input 
              type="text" 
              class="form-input remark-input"
              placeholder="请输入"
              v-model="formData.other.orderRemark"
            >
            <span class="char-count">0/200</span>
          </div>
        </div>
		</div>
		<div class="subject-content">
        <!-- 底部操作栏 -->
        <div class="step-footer info-footer">
          <div class="total-amount">
            结算总额：<span class="amount-value">¥{{ totalAmount }}</span>
          </div>
          <div class="btn-group">
            <button class="btn-cancel" @click="goToCart">取消</button>
            <button class="btn-prev" @click="toPrevStep">上一步</button>
            <button class="btn-submit" @click="submitOrder">提交订单</button>
          </div>
        </div>
		</div>
      </div>
    </div>

    <!-- 公共页尾 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
// 导入公共组件
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import RadioGroup from '@/components/common/RadioGroup.vue';
import OrderStepNav from '@/components/common/OrderStepNav.vue';

const router = useRouter();

// 步骤配置
const stepList = ref([
  '下单主体信息',
  '订单合同信息',
  '收货地址',
  '付款方式',
  '信息确认'
]);
const currentStep = ref(5);

// 全步骤表单数据（最后提交直接获取）
const formData = reactive({
  // 步骤1：下单主体
  subject: {
    type: 'company', // company/individual
    isSelf: 'true'
  },
  // 步骤2：订单合同
  contract: {
    type: 'need', // need/notNeed
    isUpload: 'true'
  },
  // 步骤3：收货地址
  address: {
    name: '',
    phone: '',
    detail: '',
    note: '',
    isSaved: 'true'
  },
  // 步骤4：付款方式（匹配UI图选项）
  pay: {
    type: 'immediate' // immediate/installment/credit
  },
  // 步骤5：信息确认
  other: {
    invoiceType: 'need', // need/notNeed
    invoiceInfo: '',
    paymentSummary: '',
    contractRemark: '',
    orderRemark: ''
  }
});

// 单选组件的选项列表
const subjectOptions = ref([
  { label: '企业', value: 'company' },
  { label: '个人', value: 'individual' }
]);
const contractOptions = ref([
  { label: '需要', value: 'need' },
  { label: '不需要', value: 'notNeed' }
]);
// 付款方式选项（匹配UI图：立即/分期/授信）
const payOptions = ref([
  { label: '立即付款', value: 'immediate' },
  { label: '分期付款', value: 'installment' },
  { label: '授信付款', value: 'credit' }
]);
// 是否需要发票选项
const invoiceOptions = ref([
  { label: '需要', value: 'need' },
  { label: '不需要', value: 'notNeed' }
]);

// 订单商品数据（模拟）
const orderGoods = ref([
  {
    img: '/images/product.png',
    name: 'PPTE耐酸碱玻纤系列滤袋',
    count: 1,
    price: '899.00'
  },
  {
    img: '/images/product.png',
    name: 'PPTE耐酸碱玻纤系列滤袋',
    count: 1,
    price: '899.00'
  }
]);

// 计算商品总数、总金额
const totalGoodsCount = computed(() => {
  return orderGoods.value.reduce((sum, item) => sum + item.count, 0);
});
const totalGoodsAmount = computed(() => {
  return orderGoods.value.reduce((sum, item) => sum + item.count * Number(item.price), 0).toFixed(2);
});
const totalAmount = computed(() => {
  return totalGoodsAmount.value;
});

// 新增企业方法
const handleAddEnterprise = () => {
  // 可补充新增企业的业务逻辑
  alert('新增企业按钮点击');
};

// 董监高文件附件上传方法
const handleUploadAttachment = () => {
  // 可补充文件上传逻辑
  alert('董监高文件附件上传按钮点击');
};

// 付款凭证上传方法（参考步骤一按钮逻辑）
const handleUploadPayProof = () => {
  // 可补充文件上传逻辑
  alert('付款凭证上传按钮点击');
};

// 展开/收起企业名录方法
const toggleExpandEnterprises = () => {
  // 可补充展开/收起的业务逻辑
  alert('展开企业名录按钮点击');
};

// 展开/收起地址方法
const toggleExpandAddresses = () => {
  // 可补充展开/收起地址的业务逻辑
  alert('展开全部地址按钮点击');
};

// 步骤切换：下一步
const toNextStep = () => {
  // 步骤3必填项校验
  if (currentStep.value === 3) {
    if (!formData.address.name || !formData.address.phone || !formData.address.detail) {
      alert('请填写收货地址必填项');
      return;
    }
  }
  if (currentStep.value < 5) currentStep.value++;
};

// 步骤切换：上一步
const toPrevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

// 跳转首页
const goToHome = () => {
  router.push('/');
};

// 跳转购物车
const goToCart = () => {
  router.push('/cart');
};

// 提交订单（获取全步骤数据）
const submitOrder = () => {
  console.log('提交的订单数据：', formData);
  console.log('订单商品：', orderGoods.value);
  alert('订单提交成功！');
  // 提交后跳转订单列表页（需配置路由）
  router.push('/order-list');
};
</script>

<style scoped>
/* 全局页面样式 */
.order-submit-page {
  min-height: 100vh;
  background: #F8F9FA;
}

.main-container {
  width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 14px;
}

/* 面包屑样式 */
.breadcrumb {
  font-size: 14px;
  color: #838486;
  margin-bottom: 16px;
}
.breadcrumb-item {
  cursor: pointer;
  color: #838486;
  transition: color 0.2s;
}
.breadcrumb-item:hover {
  color: #3799AE;
}
.breadcrumb-sep {
  margin: 0 4px;
}

/* 步骤内容通用样式 */
.step-content {
  padding: 0 20px;
}
.step-title {
  font-size: 18px;
  font-weight: 500;
  color: #272727;
  margin-bottom: 20px;
}

/* 步骤1：下单主体信息专属样式 */
/* 提示条 */
.tip-bar {
  background: #F1F9FB;
  border-radius: 4px;
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.tip-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.tip-text {
  font-size: 14px;
  color: #1E293B;
}

/* 主体内容区 */
.subject-content {
  background: #F8FAFD;
  border-radius: 8px;
  /* height: 204px; */
  padding: 20px;
  margin-bottom: 16px;
}
.subject-content .form-group {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}
.subject-content .form-label.required {
  font-size: 14px;
  color: #1E293B;
  min-width: 80px;
  margin-right: 12px;
}
.subject-content .form-label.required::after {
  content: '*';
  color: #F72B1C;
  margin-left: 4px;
}

/* 企业信息区域 */
.enterprise-info {
  margin-top: 20px;
}
.enterprise-info .form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.enterprise-info .form-label {
  font-size: 14px;
  color: #6E7B8D;
  min-width: 100px;
}
.enterprise-info .form-value {
  font-size: 14px;
  color: #1E293B;
}

/* 新增企业区域 & 通用上传按钮样式（统一复用） */
.add-enterprise {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.add-btn, .upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  color: #1DA4B6;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}
.add-btn:hover, .upload-btn:hover {
  /* background: #1994A5; */
}
.add-icon, .upload-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.add-text, .upload-text {
  font-size: 14px;
  color: #1DA4B6;
}
.add-note {
  font-size: 12px;
  color: #6E7B8D;
}

/* 查看全部企业区域 & 通用展开区域样式（统一复用） */
.view-enterprises, .view-addresses {
  background: #F8FAFD;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.view-text {
  font-size: 12px;
  color: #1E293B;
}
.expand-btn {
  border: none;
  background: transparent;
  color: #1DA4B6;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
}
/* 展开图标样式 */
.expand-icon {
  width: 12px;
  height: 12px;
  object-fit: contain;
}
/* 小尺寸展开图标（收货地址区域） */
.expand-icon-small {
  width: 10px;
  height: 10px;
  object-fit: contain;
  margin-left: 2px;
}

/* 步骤2：订单合同信息专属样式 */
.contract-radio-group {
  display: flex;
  align-items: center;
  margin: 16px 0;
}
.contract-radio-group .form-label.required {
  font-size: 14px;
  color: #1E293B;
  min-width: 80px;
  margin-right: 12px;
}
.contract-radio-group .form-label.required::after {
  content: '*';
  color: #F72B1C;
  margin-left: 4px;
}

.contract-download {
  font-size: 14px;
  color: #838486;
  margin: 8px 0;
}
.contract-download .link {
  color: #3799AE;
  text-decoration: underline;
  margin: 0 4px;
}
.contract-download .link-suffix {
  color: #838486;
}

.attachment-group {
  display: flex;
  align-items: center;
  margin: 16px 0;
}
.attachment-group .form-label {
  font-size: 14px;
  color: #1E293B;
  min-width: 80px;
  margin-right: 12px;
}
.attachment-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 步骤3：收货地址专属样式 */
.address-form-container {
  background: #F8FAFD;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}
.address-form-title {
  font-size: 16px;
  color: #1E293B;
  margin-bottom: 16px;
  font-weight: 500;
}
.short-input-row {
  margin-bottom: 16px;
}
.short-input {
  width: 200px;
}
.long-input-row {
  margin-bottom: 16px;
}
.long-input {
  width: 500px;
}
.address-tip {
  margin-bottom: 16px;
}
.address-total {
  color: #F72B1C;
  font-weight: bold;
}

/* 步骤4：付款方式专属样式 */
.pay-tip {
  margin-bottom: 16px;
}
.pay-radio-group {
  display: flex;
  align-items: center;
  margin: 16px 0;
}
.upload-proof-group-wrap {
  background: #F8FAFD;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.pay-radio-group .form-label.required {
  font-size: 14px;
  color: #1E293B;
  min-width: 80px;
  margin-right: 12px;
}
.pay-radio-group .form-label.required::after {
  content: '*';
  color: #F72B1C;
  margin-left: 4px;
}
.upload-proof-group {
  display: flex;
  align-items: center;
  margin: 16px 0;
  gap: 8px;
}
.upload-proof-group .form-label {
  font-size: 14px;
  color: #1E293B;
  min-width: 80px;
}
.payee-info {
  margin: 20px 0 0 0px; /* 与UI图对齐，和付款主题标签缩进一致 */
}
.payee-row {
  margin-bottom: 20px;
  font-size: 14px;
  color: #1E293B;
}
.payee-label {
  display: inline-block;
  min-width: 100px;
}
.pay-total {
  color: #F72B1C;
  font-weight: bold;
}

/* 步骤5：信息确认专属样式 */
.info-tip {
  justify-content: flex-start;
  margin-bottom: 20px;
}
.info-tip .tip-title {
  font-size: 16px;
  font-weight: 500;
  color: #1E293B;
  margin-right: 12px;
}
.info-tip .tip-desc {
  font-size: 14px;
  color: #838486;
}

.invoice-radio-group {
  display: flex;
  align-items: center;
  margin: 16px 0 24px;
}
.invoice-radio-group .form-label.required {
  font-size: 14px;
  color: #1E293B;
  min-width: 80px;
  margin-right: 12px;
}
.invoice-radio-group .form-label.required::after {
  content: '*';
  color: #F72B1C;
  margin-left: 4px;
}

.company-info {
  margin-bottom: 24px;
}
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}
.info-label {
  display: inline-block;
  min-width: 120px;
  color: #838486;
}
.info-value {
  color: #1E293B;
  flex: 1;
}
.edit-btn {
  border: none;
  background: transparent;
  color: #3799AE;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.invoice-input-group, .payment-summary-group {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}
.invoice-input, .summary-input {
  width: 500px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ECEEF2;
  border-radius: 4px;
}
.char-count {
  font-size: 12px;
  color: #838486;
}

.order-info-container {
  margin-bottom: 24px;
}
.order-info-title {
  font-size: 16px;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 16px;
}
.order-info-content {
  display: flex;
  justify-content: space-between;
  /* 关键1：让子元素等高拉伸 */
  align-items: stretch;
  /* border-top: 1px solid #ECEEF2; */
  /* padding-top: 16px; */
  /* 可选：设置最小高度，避免内容过少时高度过矮 */
  min-height: 120px;
  
}

.goods-list {
  flex: 1;
  /* 保持商品列表自然布局，与右侧汇总等高 */
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}

.order-summary {
  width: 200px;
  background: #F8FAFD;
  
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  padding: 16px;
  /* 关键2：让汇总容器成为flex父级，实现内部内容垂直居中 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #EBEFF1;
}

/* 汇总内部内容间距调整（可选，优化视觉居中效果） */
.summary-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.goods-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  margin: 0 16px;
  gap: 12px;
}
.goods-item + .goods-item {
	/* padding-top: 20px; */
	border-top: 1px solid #D8D8D8;
	
}
.goods-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.goods-detail {
  flex: 1;
}
.goods-name {
  font-size: 14px;
  color: #1E293B;
  margin-bottom: 4px;
}
.goods-desc {
  font-size: 12px;
  color: #838486;
}
.goods-count {
  font-size: 14px;
  color: #838486;
  width: 60px;
  text-align: center;
}
.goods-price {
  font-size: 14px;
  color: #1E293B;
  width: 80px;
  text-align: right;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #838486;
}
.summary-item.total {
  /* margin-top: 16px;
  padding-top: 16px; */
  border-top: 1px solid #ECEEF2;
}
.summary-item.total .summary-value {
  color: #F72B1C;
  font-weight: bold;
}

.order-supplement {
  margin-bottom: 24px;
}
.supplement-title {
  font-size: 16px;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 16px;
}
.contract-remark-group, .order-remark-group {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}
.remark-input {
  width: 500px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ECEEF2;
  border-radius: 4px;
}

.info-footer {
  border-top: 1px solid #ECEEF2;
  padding-top: 20px;
  margin-top: 20px;
}
.info-footer .total-amount {
  font-size: 16px;
}
.info-footer .amount-value {
  font-size: 20px;
  color: #F72B1C;
  font-weight: bold;
}

/* 表单通用样式 */
.form-group {
  margin-bottom: 24px;
}
.form-label {
  font-size: 14px;
  color: #272727;
}
.form-label.required::after {
  content: '*';
  color: #F72B1C;
  margin-left: 4px;
}
.form-desc {
  font-size: 12px;
  color: #838486;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-card {
  border: 1px solid #ECEEF2;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-value {
  font-size: 14px;
  color: #838486;
  margin-left: 8px;
}
.form-tip {
  font-size: 14px;
  color: #838486;
  margin: 8px 0;
  display: flex;
  align-items: center;
}
.form-tip-text {
  margin-left: 8px;
}
.form-input {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ECEEF2;
  border-radius: 4px;
}
.form-note {
  font-size: 12px;
  color: #838486;
  margin-left: 8px;
}
.btn-link {
  border: none;
  background: transparent;
  color: #3799AE;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  display: flex;
  align-items: center;
}
.link {
  color: #3799AE;
  text-decoration: underline;
  cursor: pointer;
}
.link-suffix {
  color: #838486;
  text-decoration: none;
}

/* 步骤底部操作栏 */
.step-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #ECEEF2;
  margin-top: 20px;
}
.total-amount {
  font-size: 14px;
  color: #838486;
}
.amount-value {
  font-size: 18px;
  color: #F72B1C;
  font-weight: bold;
  margin-left: 4px;
}
.btn-group {
  display: flex;
  gap: 12px;
}
.btn-cancel, .btn-prev {
  height: 36px;
  padding: 0 20px;
  border: 1px solid #ECEEF2;
  border-radius: 4px;
  background: #FFFFFF;
  color: #838486;
  cursor: pointer;
}
.btn-next {
  height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: 4px;
  background: #4FA2B4;
  color: #FFFFFF;
  cursor: pointer;
}
.btn-submit {
  height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: 4px;
  background: #F72B1C;
  color: #FFFFFF;
  cursor: pointer;
}
</style>