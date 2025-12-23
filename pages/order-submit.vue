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

        <!-- 未认证提示 -->
        <div class="no-cert-tip" v-if="!hasCertified">
          <img src="@/assets/images/tip.png" alt="警告" class="warning-icon">
          <span class="warning-text">您尚未完成认证，请先<a href="#/certification" class="cert-link">去认证</a>，否则无法下单</span>
        </div>

        <!-- 内容区：背景#F8FAFD + 高度204px -->
        <div class="subject-content">
          <div class="form-group">
            <label class="form-label required">下单主体：</label>
            <!-- 复用优化后的单选组件，添加切换事件 -->
            <RadioGroup 
              :options="subjectOptions"
              v-model="formData.subject.type"
              groupName="subject-type"
              @change="handleSubjectChange"
            />
          </div>

          <!-- 企业信息区域（选中“企业”时显示） -->
          <div class="enterprise-info" v-if="formData.subject.type === 'company' && certInfo">
            <div class="form-row">
              <span class="form-label">企业名称：</span>
              <span class="form-value">{{ certInfo.companyName || '暂无' }}</span>
            </div>
            <div class="form-row">
              <span class="form-label">统一社会信用代码：</span>
              <span class="form-value">{{ certInfo.socialCode || '暂无' }}</span>
            </div>
            <div class="form-row">
              <span class="form-label">法人姓名：</span>
              <span class="form-value">{{ certInfo.legalName || '暂无' }}</span>
            </div>
          </div>

          <!-- 个人信息区域（选中“个人”时显示） -->
          <div class="personal-info" v-if="formData.subject.type === 'individual' && certInfo">
            <div class="form-row">
              <span class="form-label">姓名：</span>
              <span class="form-value">{{ certInfo.cardName || '暂无' }}</span>
            </div>
            <div class="form-row">
              <span class="form-label">身份证号：</span>
              <span class="form-value">{{ certInfo.cardNumber || '暂无' }}</span>
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
          <button class="expand-btn" @click="toggleExpandEnterprises" :disabled="!hasCompanyCert">
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
            <button class="btn-next" @click="toNextStep" :disabled="!hasCertified || !certInfo">下一步</button>
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
            @change="handleContractTypeChange"
          />
        </div>

        <!-- 合同下载区域（仅当选择“需要”合同时显示） -->
        <div 
          class="form-desc contract-download" 
          v-if="formData.contract.type === 'need'"
        >
          <span>合同下载：</span>
          <a 
            href="javascript:;" 
            class="link" 
            @click.prevent="handleDownloadContract"
            :class="{ disabled: isDownloading }"
          >
            {{ contractFileName || '合同文件' }}
          </a>
          <span class="link-suffix">.pdf</span>
          <!-- 下载加载中提示 -->
          <span class="download-loading" v-if="isDownloading">加载中...</span>
        </div>

        <!-- 董监高文件附件区域（参考步骤一新增企业按钮样式） -->
        <div class="form-group attachment-group">
          <label class="form-label">盖章后上传合同：</label>
          <div class="attachment-content">
            <!-- 自定义上传组件 -->
            <t-upload
              v-model="files"
              :tips="tips"
              theme="custom"
              :before-upload="beforeUpload"
              multiple
              @fail="handleUploadFail"
              @success="handleUploadSuccess"
              :request-method="customUploadRequest"
            >
              <div class="upload-wrap" ref="uploadRef">
                <button 
                  class="upload-btn" 
                  :disabled="isUploading"
                >
                  <img src="@/assets/images/upload.png" alt="上传" class="upload-icon">
                  <span class="upload-text">上传文件</span>
                </button>
              </div>
            </t-upload>
            <span class="form-note">（仅支持.pdf, word, excel, jpg, png）</span>
          </div>
        </div>

        <!-- 已上传文件列表 -->
        <div class="upload-file-list" v-if="uploadedFiles.length > 0">
          <div class="file-list-title">已上传文件：</div>
          <ul class="file-list">
            <li 
              class="file-item" 
              v-for="(file, index) in uploadedFiles" 
              :key="index"
            >
              <span class="file-name">{{ file.originalName }}</span>
              <button class="file-delete" @click="deleteFile(index)">×</button>
            </li>
          </ul>
        </div>

        <!-- 上传提示 -->
        <div class="upload-tip" v-if="uploadTip">
          <span :class="{ 'error': uploadTipType === 'error', 'success': uploadTipType === 'success' }">
            {{ uploadTip }}
          </span>
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
            <label class="form-label required">付款方式：</label>
            <RadioGroup 
                    :options="payOptions"
                    v-model="formData.pay.type"
                    groupName="pay-type"
                    @change="handlePayTypeChange"
                  />
          </div>

          <!-- 立即付款专属区域 -->
              <div v-if="formData.pay.type === 'immediate'">
                <!-- 上传付款凭证（复用合同上传组件） -->
                <div class="form-group upload-proof-group">
                  <label class="form-label">上传付款凭证：</label>
                  <div class="attachment-content">
                    <t-upload
                      v-model="payVoucherFiles"
                      :tips="payVoucherTips"
                      theme="custom"
                      :before-upload="beforeUpload"
                      single
                      @fail="handleUploadFail"
                      @success="handlePayVoucherUploadSuccess"
                      :request-method="customPayVoucherUploadRequest"
                    >
                      <div class="upload-wrap" ref="payVoucherUploadRef">
                        <button 
                          class="upload-btn" 
                          :disabled="isPayVoucherUploading"
                        >
                          <img src="@/assets/images/upload.png" alt="上传" class="upload-icon">
                          <span class="upload-text">上传文件</span>
                        </button>
                      </div>
                    </t-upload>
                    <span class="form-note">（仅支持.pdf, word, excel, jpg, png）</span>
                  </div>
                </div>
				
				<!-- 已上传付款凭证列表 -->
				      <div class="upload-file-list" v-if="uploadedPayVoucherFiles.length > 0">
				        <div class="file-list-title">已上传付款凭证：</div>
				        <ul class="file-list">
				          <li 
				            class="file-item" 
				            v-for="(file, index) in uploadedPayVoucherFiles" 
				            :key="index"
				          >
				            <span class="file-name">{{ file.originalName }}</span>
				            <button class="file-delete" @click="deletePayVoucherFile(index)">×</button>
				          </li>
				        </ul>
				      </div>
          <!-- 收款方信息（匹配UI图排版） -->
          <div class="payee-info">
            <div class="payee-row">
              <span class="payee-label">收款方名称：</span>
              <span class="payee-value">{{payInfo.payName}}</span>
            </div>
            <div class="payee-row">
              <span class="payee-label">收款方开户行：</span>
              <span class="payee-value">{{payInfo.bankName}}</span>
            </div>
            <div class="payee-row">
              <span class="payee-label">收款账号：</span>
              <span class="payee-value">{{payInfo.bankAccount}}</span>
            </div>
          </div>
        </div>
		
		
		<!-- 账期付款专属区域 -->
		    <div v-if="formData.pay.type === 'installment'" class="payment-type-content">
		      <div class="payment-desc">
		        <p>账期付款说明：</p>
		        <ul>
		          <li>1. 账期时长：{{installmentInfo.period || 30}}天</li>
		          <li>2. 账期额度：¥{{installmentInfo.limit || 0}}</li>
		          <li>3. 剩余可用额度：¥{{installmentInfo.remainingLimit || 0}}</li>
		          <li>4. 还款截止日期：{{installmentInfo.deadline || '下单后30天'}}</li>
		        </ul>
		      </div>
		    </div>
		
		    <!-- 授信付款专属区域 -->
		    <div v-if="formData.pay.type === 'credit'" class="payment-type-content">
		      <div class="payment-desc">
		        <p>授信付款说明：</p>
		        <ul>
		          <li>1. 授信总额度：¥{{creditInfo.totalLimit || 0}}</li>
		          <li>2. 已用额度：¥{{creditInfo.usedLimit || 0}}</li>
		          <li>3. 剩余额度：¥{{creditInfo.remainingLimit || 0}}</li>
		          <li>4. 授信有效期：{{creditInfo.expireDate || '长期有效'}}</li>
		        </ul>
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
                    <img :src="item.productImage || '/images/product.png'" alt="商品" class="goods-img">
                    <div class="goods-detail">
                      <div class="goods-name">{{ item.productName }}</div>
                      <div class="goods-desc" v-if="item.singleSpec">规格：{{ item.singleSpec }}</div>
                      <div class="goods-desc" v-else-if="item.specJson">规格：{{ formatSpecJson(item.specJson) }}</div>
                    </div>
                    <div class="goods-count">× {{ item.payNum }}</div>
                    <div class="goods-price">¥{{ item.productPrice.toFixed(2) }}</div>
                  </div>
                </div>
              <!-- 订单汇总 -->
              <div class="order-summary">
                <div class="summary-inner">
                  <div class="summary-item">
                          <span class="summary-label">商品总数：</span>
                          <span class="summary-value">{{ totalNum }}</span>
                        </div>
                        <div class="summary-item">
                          <span class="summary-label">商品金额：</span>
                          <span class="summary-value">¥{{ totalAmount.toFixed(2) }}</span>
                        </div>
                        <div class="summary-item total">
                          <span class="summary-label">结算金额：</span>
                          <span class="summary-value">¥{{ payAmount.toFixed(2) }}</span>
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

    <!-- 企业选择弹窗 -->
    <div class="enterprise-modal-mask" v-if="showEnterpriseModal">
      <div class="enterprise-modal">
        <div class="modal-header">
          <h3 class="modal-title">选择企业</h3>
          <button class="modal-close" @click="showEnterpriseModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="enterprise-list">
            <div 
              class="enterprise-item" 
              v-for="item in enterpriseList" 
              :key="item.id"
              :class="{ active: selectedEnterpriseId === item.id }"
              @click="selectedEnterpriseId = item.id"
            >
              <div class="enterprise-name">{{ item.companyName }}</div>
              <div class="enterprise-code">统一社会信用代码：{{ item.socialCode }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showEnterpriseModal = false">取消</button>
          <button class="btn-confirm" @click="confirmEnterpriseSelect" :disabled="!selectedEnterpriseId">确定</button>
        </div>
      </div>
    </div>

    <!-- 收货地址选择弹窗 -->
    <div class="address-modal-mask" v-if="showAddressModal">
      <div class="address-modal">
        <div class="modal-header">
          <h3 class="modal-title">选择收货地址</h3>
          <button class="modal-close" @click="showAddressModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="address-list" v-if="addressList.length > 0">
            <div 
              class="address-item" 
              v-for="item in addressList" 
              :key="item.id"
              :class="{ active: selectedAddressId === item.id }"
              @click="selectedAddressId = item.id"
            >
              <div class="address-name-phone">
                <span class="address-name">{{ item.realName }}</span>
                <span class="address-phone">{{ item.phone }}</span>
                <span class="address-default" v-if="item.isDefault">默认地址</span>
              </div>
              <div class="address-detail">
                {{ item.province }} {{ item.city }} {{ item.district }} {{ item.street }} {{ item.detail }}
              </div>
              <div class="address-requirement" v-if="item.requirement">
                特殊要求：{{ item.requirement }}
              </div>
            </div>
          </div>
          <div class="no-address" v-else>
            暂无收货地址，请先添加
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddressModal = false">取消</button>
          <button class="btn-confirm" @click="confirmAddressSelect" :disabled="!selectedAddressId || addressList.length === 0">确定</button>
        </div>
      </div>
    </div>

    <!-- 公共页尾 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// 导入公共组件
import Header from '@/components/common/Header.vue';
import Footer from '@/components/common/Footer.vue';
import RadioGroup from '@/components/common/RadioGroup.vue';
import OrderStepNav from '@/components/common/OrderStepNav.vue';
// 导入API
import { getOrderApi } from '@/apis/order';
import { getVerifyApi } from '@/apis/credit';
import { uploadFile } from '@/apis/common'; // 导入上传文件API
import { getDefaultAddress, getAddressList } from '@/apis/address'; // 新增地址接口
// 导入状态管理（根据项目实际使用的Vuex/Pinia调整）
import { useUserStore } from '@/stores/user';
// 导入TDesign的消息提示（按需）
import { MessagePlugin } from 'tdesign-vue-next';

// 初始化用户Store
const userStore = useUserStore();
const router = useRouter();
const route = useRoute(); // 获取当前路由参数

// 初始化API实例
const orderApi = getOrderApi();
const verifyApi = getVerifyApi();

// 步骤配置
const stepList = ref([
  '下单主体信息',
  '订单合同信息',
  '收货地址',
  '付款方式',
  '信息确认'
]);
const currentStep = ref(1);

// 存储接口数据
const certInfo = ref(null); // 认证信息
const payInfo = ref(null); // 收款信息
const isLoading = ref(false); // 全局加载状态
const defaultAddress = ref(null); // 默认收货地址
const addressList = ref([]); // 收货地址列表
const installmentInfo = ref({ // 账期付款信息
  period: 30,
  limit: 100000,
  remainingLimit: 80000,
  deadline: '2025-12-31'
});
const creditInfo = ref({ // 授信付款信息
  totalLimit: 200000,
  usedLimit: 50000,
  remainingLimit: 150000,
  expireDate: '2026-12-31'
});

// 合同下载相关
const isDownloading = ref(false); // 下载中状态
const contractFileName = ref(''); // 合同文件名

// TDesign Upload组件绑定值（合同上传）
const files = ref([]);
const tips = ref('上传文件大小在 5M 以内');

// 合同文件上传相关
const uploadRef = ref(null); // 上传容器ref
const isUploading = ref(false); // 上传中状态
const uploadedFiles = ref([]); // 已上传文件列表
const uploadTip = ref(''); // 上传提示信息
const uploadTipType = ref(''); // 提示类型：success/error
// 支持的文件类型
const acceptTypes = ref('.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png');
// 允许的文件大小（5M）
const maxFileSize = ref(5 * 1024 * 1024);

// 付款凭证上传相关
const payVoucherFiles = ref([]);
const payVoucherTips = ref('付款凭证大小在5M以内');
const payVoucherUploadRef = ref(null);
const isPayVoucherUploading = ref(false);
const uploadedPayVoucherFiles = ref([]); // 存储付款凭证上传文件
const payVoucherTip = ref('');
const payVoucherTipType = ref('');

// 收货地址弹窗相关
const showAddressModal = ref(false); // 地址弹窗显示状态
const selectedAddressId = ref(''); // 选中的地址ID

// 企业列表弹窗
const showEnterpriseModal = ref(false)
const enterpriseList = ref([])
const selectedEnterpriseId = ref('')

// 全步骤表单数据
const formData = reactive({
  // 步骤1：下单主体
  subject: {
    type: '',
    isSelf: 'true',
    certId: ''
  },
  // 步骤2：订单合同
  contract: {
    type: 'need', // need/notNeed
    isUpload: 'true',
    attachmentIds: [] // 存储上传文件的ossId
  },
  // 步骤3：收货地址
  address: {
    name: '',
    phone: '',
    detail: '',
    note: '',
    isSaved: 'true',
    addressId: ''
  },
  // 步骤4：付款方式
  pay: {
    type: 'immediate', // immediate/installment/credit
    payVoucherId: null, // 付款凭证ID
    payVoucherName: '' // 付款凭证名称
  },
  // 步骤5：信息确认
  other: {
    invoiceType: 'need',
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

const payOptions = ref([
  { label: '立即付款', value: 'immediate' },
  { label: '账期付款', value: 'installment' },
  { label: '授信付款', value: 'credit' }
]);

const invoiceOptions = ref([
  { label: '需要', value: 'need' },
  { label: '不需要', value: 'notNeed' }
]);

// 订单商品数据（从路由参数解析）
const orderGoods = ref([]);
const totalNum = ref(0); // 商品总数量
const totalAmount = ref(0); // 商品总金额
const payAmount = ref(0); // 结算金额

// 计算属性 - 商品总数、总金额（兼容旧数据）
const totalGoodsCount = computed(() => {
  return orderGoods.value.reduce((sum, item) => sum + item.payNum, 0);
});

const totalGoodsAmount = computed(() => {
  return orderGoods.value.reduce((sum, item) => sum + item.payNum * Number(item.productPrice), 0).toFixed(2);
});

// 计算属性 - 用户认证状态
const userCertified = computed(() => {
  return userStore.userInfo?.certified || 0;
});

const hasCertified = computed(() => {
  return userCertified.value !== 0;
});

const hasCompanyCert = computed(() => {
  return [2, 3].includes(userCertified.value);
});

const hasPersonCert = computed(() => {
  return [1, 3].includes(userCertified.value);
});

// 页面初始化
onMounted(async () => {
  try {
    const [payInfoRes] = await Promise.all([
      orderApi.getPayInfo(),
      getDefaultAddressData(), // 加载默认地址
    ]);
    if (payInfoRes.code === 200) {
      payInfo.value = payInfoRes.data;
    }
    // 设置默认下单主体
    await setDefaultSubjectType();
    // 解析商品详情页传递的参数
    parseOrderParams();
  } catch (error) {
    console.error('初始化数据失败：', error);
    MessagePlugin.error('数据加载失败，请刷新页面重试');
  }
});

// 解析路由中的订单参数
// 提交订单页 - 解析路由参数（修改后）
const parseOrderParams = () => {
  try {
    if (route.query.orderData) {
      // 解码并解析路由参数
      const orderParams = JSON.parse(decodeURIComponent(route.query.orderData));
      
      // 校验关键参数是否存在
      if (!orderParams.productId || !orderParams.skuId) {
        throw new Error('商品/skuID缺失');
      }

      // 构造符合YpOrderDetailDTO的订单商品列表
      const orderDetail = {
        cartId: null, // 立即购买无购物车ID，传null
        productId: Number(orderParams.productId), // 转为数字类型（必需）
        productImage: '1783029971277717506' || orderParams.productImageId || orderParams.productImage, // 优先用图片ID，无则用URL
        productName: orderParams.productName, // 商品名称（必需）
        specType: Number(orderParams.specType) || 0, // 规格类型（0单1多，必需）
        skuId: Number(orderParams.skuId), // SKU ID（必需）
        singleSpec: orderParams.singleSpec || '', // 单规格信息（specType=0时传）
        specJson: orderParams.specJson || '', // 多规格JSON（specType=1时传）
        productPrice: Number(orderParams.salePrice), // 商品单价（必需，转为数字）
        payNum: Number(orderParams.buyNum), // 购买数量（对应buyNum，转为数字，必需）
        totalPrice: Number(orderParams.totalPrice) || (Number(orderParams.salePrice) * Number(orderParams.buyNum)), // 商品总价
      };

      // 赋值到订单商品列表
      orderGoods.value = [orderDetail];
      
      // 计算汇总数据（对应提交订单的总数量/总金额）
      totalNum.value = orderDetail.payNum; // 商品总数量
      totalAmount.value = orderDetail.totalPrice; // 商品总金额
      payAmount.value = orderDetail.totalPrice; // 结算金额（暂时和总金额一致，可加优惠逻辑）
    } else {
      // 无参数时用模拟数据兜底
      orderGoods.value = [
        {
          productId: 1,
          productImage: '/images/product.png',
          productName: 'PPTE耐酸碱玻纤系列滤袋',
          specType: 0,
          skuId: 1001,
          singleSpec: '统一规格',
          productPrice: 899.00,
          payNum: 2,
          totalPrice: 1798.00
        }
      ];
      totalNum.value = 2;
      totalAmount.value = 1798.00;
      payAmount.value = 1798.00;
    }
  } catch (error) {
    console.error('解析订单参数失败：', error);
    MessagePlugin.error('商品信息解析失败，请重新下单');
    // 兜底模拟数据
    orderGoods.value = [
      {
        productId: 1,
        productImage: '/images/product.png',
        productName: 'PPTE耐酸碱玻纤系列滤袋',
        specType: 0,
        skuId: 1001,
        singleSpec: '统一规格',
        productPrice: 899.00,
        payNum: 2,
        totalPrice: 1798.00
      }
    ];
    totalNum.value = 2;
    totalAmount.value = 1798.00;
    payAmount.value = 1798.00;
  }
};
// 获取默认收货地址
const getDefaultAddressData = async () => {
  try {
    const res = await getDefaultAddress();
    if (res.code === 200 && res.data) {
      defaultAddress.value = res.data;
      // 将默认地址填充到表单
      formData.address.name = res.data.realName;
      formData.address.phone = res.data.phone;
      formData.address.detail = `${res.data.province} ${res.data.city} ${res.data.district} ${res.data.street} ${res.data.detail}`;
      formData.address.note = res.data.requirement || '';
      formData.address.addressId = res.data.id;
    }
  } catch (error) {
    console.error('获取默认地址失败：', error);
    MessagePlugin.warning('未获取到默认收货地址');
  }
};

// 获取收货地址列表
const getAddressListData = async () => {
  try {
    const res = await getAddressList();
    if (res.code === 200) {
      addressList.value = res.data;
      // 默认选中第一个地址
      if (addressList.value.length > 0) {
        selectedAddressId.value = addressList.value[0].id;
      }
    }
  } catch (error) {
    console.error('获取地址列表失败：', error);
    MessagePlugin.error('获取收货地址列表失败');
  }
};

// 设置默认下单主体
const setDefaultSubjectType = async () => {
  if (hasCompanyCert.value) {
    formData.subject.type = 'company';
  } else if (hasPersonCert.value) {
    formData.subject.type = 'individual';
  } else {
    formData.subject.type = 'company';
  }
  await getDefaultCertInfo();
};

// 获取默认认证信息
const getDefaultCertInfo = async () => {
  if (!hasCertified.value) {
    certInfo.value = null;
    return;
  }
  try {
    const certType = formData.subject.type === 'company' ? 1 : 0;
    const res = await verifyApi.getDefaultCert({ certType });
    if (res.code === 200 && res.data) {
      const detailRes = await verifyApi.getCertDetail(res.data.id);
      if (detailRes.code === 200) {
        certInfo.value = detailRes.data.cert;
        formData.subject.certId = detailRes.data.cert.id;
      }
    } else {
      certInfo.value = null;
    }
  } catch (error) {
    console.error('获取认证信息失败：', error);
    certInfo.value = null;
  }
};

// 监听下单主体类型变化
watch(
  () => formData.subject.type,
  async () => {
    await getDefaultCertInfo();
  },
  { immediate: true }
);

// 下单主体切换事件
const handleSubjectChange = async (value) => {
  formData.subject.type = value;
  await getDefaultCertInfo();
};

// 展开企业列表弹窗
const toggleExpandEnterprises = async () => {
  try {
    // 获取企业认证列表
    const res = await verifyApi.getCompanyCertList();
    if (res.code === 200) {
      enterpriseList.value = res.data;
      showEnterpriseModal.value = true;
      // 默认选中第一个企业
      if (enterpriseList.value.length > 0) {
        selectedEnterpriseId.value = enterpriseList.value[0].id;
      }
    }
  } catch (error) {
    console.error('获取企业列表失败：', error);
    MessagePlugin.error('获取企业列表失败，请重试');
  }
};

// 确认选择企业
const confirmEnterpriseSelect = async () => {
  if (!selectedEnterpriseId.value) return;
  try {
    // 获取选中企业的详情
    const detailRes = await verifyApi.getCertDetail(selectedEnterpriseId.value);
    if (detailRes.code === 200) {
      certInfo.value = detailRes.data.cert;
      formData.subject.certId = detailRes.data.cert.id;
      showEnterpriseModal.value = false;
    }
  } catch (error) {
    console.error('获取企业详情失败：', error);
    MessagePlugin.error('选择企业失败，请重试');
  }
};

// 新增企业方法
const handleAddEnterprise = () => {
  // 跳转到企业认证页面
  router.push('/certification/company');
};

// 合同类型切换事件
const handleContractTypeChange = (value) => {
  formData.contract.type = value;
};

// 付款方式切换事件
const handlePayTypeChange = (value) => {
  formData.pay.type = value;
};

// 合同下载方法
const handleDownloadContract = async () => {
  try {
    isDownloading.value = true;
    uploadTip.value = '';
    // 调用下载合同接口
    const res = await orderApi.downloadContract();
    if (res.code === 200 && res.data) {
      const { url, originalName, name } = res.data;
      // 保存合同文件名
      contractFileName.value = originalName || name || '合同文件';
      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = contractFileName.value;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // 提示下载成功
      uploadTip.value = `合同《${contractFileName.value}》下载成功`;
      uploadTipType.value = 'success';
    } else {
      uploadTip.value = `下载失败：${res.msg || '接口返回异常'}`;
      uploadTipType.value = 'error';
    }
  } catch (error) {
    console.error('合同下载失败：', error);
    uploadTip.value = `下载失败：${error.message || '网络异常'}`;
    uploadTipType.value = 'error';
  } finally {
    isDownloading.value = false;
    // 3秒后清除提示
    setTimeout(() => {
      uploadTip.value = '';
    }, 3000);
  }
};

// TDesign Upload - 上传前校验
const beforeUpload = (file) => {
  // 获取原生文件对象
  const nativeFile = file.raw || file;
  // 文件大小校验
  if (nativeFile.size > maxFileSize.value) {
    const fileName = file.name || nativeFile.name;
    MessagePlugin.warning(`文件${fileName}超过5M，无法上传`);
    uploadTip.value = `文件${fileName}超过5M，无法上传`;
    uploadTipType.value = 'error';
    setTimeout(() => {
      uploadTip.value = '';
    }, 3000);
    return false;
  }

  // 文件类型校验
  const fileName = (file.name || nativeFile.name).toLowerCase();
  const isAccept = acceptTypes.value
    .split(',')
    .some(type => fileName.endsWith(type.toLowerCase().replace('.', '')));
  if (!isAccept) {
    MessagePlugin.warning(`文件${fileName}类型不支持，仅支持pdf、word、excel、jpg、png`);
    uploadTip.value = `文件${fileName}类型不支持，仅支持pdf、word、excel、jpg、png`;
    uploadTipType.value = 'error';
    setTimeout(() => {
      uploadTip.value = '';
    }, 3000);
    return false;
  }

  return true;
};

// TDesign Upload - 合同自定义上传请求
const customUploadRequest = async (options) => {
  // 第一步：判断参数类型，提取文件列表和回调函数
  let fileList = [];
  let globalOnSuccess, globalOnError;

  // 情况1：参数是单个包装文件对象（多数TDesign版本的传递方式）
  if (options && options.raw && options.status) {
    fileList = [options];
    globalOnSuccess = options.onSuccess;
    globalOnError = options.onError;
  } 
  // 情况2：参数是文件数组（少数版本）
  else if (Array.isArray(options)) {
    fileList = options;
    // 若数组中无回调，从第一个元素取（或组件会单独传递）
    globalOnSuccess = options[0]?.onSuccess;
    globalOnError = options[0]?.onError;
  }

  if (fileList.length === 0) return;

  isUploading.value = true;

  // 多文件上传提示
  if (fileList.length > 1) {
    uploadTip.value = `正在上传${fileList.length}个文件...`;
    uploadTipType.value = '';
  }

  // 遍历包装后的文件对象
  for (const wrappedFile of fileList) {
    // 第二步：获取原生File对象和包装后的信息
    const nativeFile = wrappedFile.raw; // 真实的File对象
    const fileName = wrappedFile.name || nativeFile.name; // 文件名（优先取包装后的name）
    
    try {
      // 单个文件上传提示
      if (fileList.length === 1) {
        uploadTip.value = `正在上传${fileName}...`;
        uploadTipType.value = '';
      }

      // 调用上传接口
      const res = await uploadFile({file: nativeFile});
      if (res.code === 200 && res.data) {
        const { ossId, originalName, name, url } = res.data;
        // 保存上传文件信息（混合原生文件和返回数据）
        const fileInfo = {
          ossId,
          originalName: originalName || name || fileName,
          name,
          url,
          file: nativeFile, // 存储原生文件
          wrappedFile: wrappedFile // 可选：存储包装后的对象
        };
        uploadedFiles.value.push(fileInfo);
        // 更新表单中的附件ID
        formData.contract.attachmentIds.push(ossId);
        
        // 第四步：调用TDesign的成功回调（传递返回数据和包装文件对象）
        if (globalOnSuccess) {
          globalOnSuccess(res.data, wrappedFile);
        }

        // 单个文件上传成功提示
        if (fileList.length === 1) {
          uploadTip.value = `文件${originalName || fileName}上传成功`;
          uploadTipType.value = 'success';
        }
      } else {
        throw new Error(res.msg || '接口返回异常');
      }
    } catch (error) {
      console.error(`文件${fileName}上传失败：`, error);
      // 调用TDesign的失败回调
      if (globalOnError) {
        globalOnError(error, wrappedFile);
      }
      
      // 单个文件上传失败提示
      uploadTip.value = `文件${fileName}上传失败：${error.message || '网络异常'}`;
      uploadTipType.value = 'error';
    }
  }

  // 多文件上传完成后的统一提示
  if (fileList.length > 1) {
    const successCount = uploadedFiles.value.length;
    if (successCount === fileList.length) {
      uploadTip.value = `全部${fileList.length}个文件上传成功`;
      uploadTipType.value = 'success';
    } else if (successCount > 0) {
      uploadTip.value = `仅${successCount}个文件上传成功，其余文件上传失败`;
      uploadTipType.value = 'error';
    } else {
      uploadTip.value = `全部${fileList.length}个文件上传失败`;
      uploadTipType.value = 'error';
    }
  }

  isUploading.value = false;
  // 3秒后清除提示
  setTimeout(() => {
    uploadTip.value = '';
  }, 3000);
};

// 付款凭证自定义上传请求
const customPayVoucherUploadRequest = async (options) => {
  let fileList = [];
  let globalOnSuccess, globalOnError;

  if (options && options.raw && options.status) {
    fileList = [options];
    globalOnSuccess = options.onSuccess;
    globalOnError = options.onError;
  } else if (Array.isArray(options)) {
    fileList = options;
    globalOnSuccess = options[0]?.onSuccess;
    globalOnError = options[0]?.onError;
  }

  if (fileList.length === 0) return;
  isPayVoucherUploading.value = true;

  for (const wrappedFile of fileList) {
    const nativeFile = wrappedFile.raw;
    const fileName = wrappedFile.name || nativeFile.name;
    try {
      payVoucherTip.value = `正在上传${fileName}...`;
      payVoucherTipType.value = '';

      const res = await uploadFile({ file: nativeFile });
      if (res.code === 200 && res.data) {
        const { ossId, originalName, name, url } = res.data;
        const fileInfo = {
          ossId,
          originalName: originalName || name || fileName,
          name,
          url,
          file: nativeFile,
          wrappedFile
        };
        uploadedPayVoucherFiles.value = [fileInfo]; // 单文件覆盖
        formData.pay.payVoucherId = ossId;
        formData.pay.payVoucherName = originalName || fileName;

        if (globalOnSuccess) {
          globalOnSuccess(res.data, wrappedFile);
        }
        payVoucherTip.value = `付款凭证${originalName || fileName}上传成功`;
        payVoucherTipType.value = 'success';
      } else {
        throw new Error(res.msg || '接口返回异常');
      }
    } catch (error) {
      console.error(`付款凭证${fileName}上传失败：`, error);
      if (globalOnError) {
        globalOnError(error, wrappedFile);
      }
      payVoucherTip.value = `付款凭证${fileName}上传失败：${error.message}`;
      payVoucherTipType.value = 'error';
    }
  }

  isPayVoucherUploading.value = false;
  setTimeout(() => {
    payVoucherTip.value = '';
  }, 3000);
};

// TDesign Upload - 合同上传成功回调
const handleUploadSuccess = (response, file) => {
  tips.value = '';
  console.log('文件上传成功：', file.name, response);
};

// 付款凭证上传成功回调
const handlePayVoucherUploadSuccess = (response, file) => {
  console.log('付款凭证上传成功：', file.name, response);
};

// 修复上传失败回调（适配TDesign的包装对象）
const handleUploadFail = (failInfo) => {
  let errorMsg = '';
  // 处理包装后的文件失败信息
  if (failInfo?.file?.raw) {
    // 单个文件失败
    const fileName = failInfo.file.name || failInfo.file.raw.name;
    errorMsg = `文件 ${fileName} 上传失败：${failInfo.error?.message || '未知错误'}`;
    MessagePlugin.error(errorMsg);
  } else if (Array.isArray(failInfo)) {
    // 多文件失败
    failInfo.forEach(item => {
      const fileName = item.file?.name || item.file?.raw?.name;
      MessagePlugin.error(`文件 ${fileName} 上传失败：${item.error?.message || '未知错误'}`);
    });
    errorMsg = '部分文件上传失败，请查看详情';
  } else {
    errorMsg = '文件上传失败：未知错误';
    MessagePlugin.error(errorMsg);
  }
  uploadTip.value = errorMsg;
  uploadTipType.value = 'error';
  setTimeout(() => {
    uploadTip.value = '';
  }, 3000);
};

// 删除已上传合同文件
const deleteFile = (index) => {
  const deletedFile = uploadedFiles.value.splice(index, 1)[0];
  // 从表单中移除对应的ossId
  formData.contract.attachmentIds = formData.contract.attachmentIds.filter(
    id => id !== deletedFile.ossId
  );
  uploadTip.value = `已删除文件${deletedFile.originalName}`;
  uploadTipType.value = 'success';
  setTimeout(() => {
    uploadTip.value = '';
  }, 3000);
};

// 删除付款凭证文件
const deletePayVoucherFile = (index) => {
  const deletedFile = uploadedPayVoucherFiles.value.splice(index, 1)[0];
  if (deletedFile.ossId === formData.pay.payVoucherId) {
    formData.pay.payVoucherId = null;
    formData.pay.payVoucherName = '';
  }
  payVoucherTip.value = `已删除付款凭证${deletedFile.originalName}`;
  payVoucherTipType.value = 'success';
  setTimeout(() => {
    payVoucherTip.value = '';
  }, 3000);
};

// 格式化规格JSON为字符串
const formatSpecJson = (specJson) => {
  try {
    const spec = JSON.parse(specJson);
    return Object.entries(spec).map(([k, v]) => `${k}:${v}`).join('; ');
  } catch (error) {
    return '自定义规格';
  }
};

// 收货地址展开 - 打开地址选择弹窗
const toggleExpandAddresses = async () => {
  await getAddressListData(); // 获取地址列表
  showAddressModal.value = true; // 打开弹窗
};

// 确认选择收货地址
const confirmAddressSelect = () => {
  if (!selectedAddressId.value) return;
  // 查找选中的地址
  const selectedAddress = addressList.value.find(item => item.id === selectedAddressId.value);
  if (selectedAddress) {
    // 更新表单地址信息
    formData.address.name = selectedAddress.realName;
    formData.address.phone = selectedAddress.phone;
    formData.address.detail = `${selectedAddress.province} ${selectedAddress.city} ${selectedAddress.district} ${selectedAddress.street} ${selectedAddress.detail}`;
    formData.address.note = selectedAddress.requirement || '';
    formData.address.addressId = selectedAddress.id;
    // 关闭弹窗
    showAddressModal.value = false;
    // 提示
    MessagePlugin.success('已选择收货地址');
  }
};

// 步骤切换：下一步
const toNextStep = () => {
  // 步骤1校验
  if (currentStep.value === 1) {
    if (!certInfo.value) {
      MessagePlugin.error('请选择有效的下单主体');
      return;
    }
  }
  // 步骤2校验：需要合同时必须上传附件
  if (currentStep.value === 2 && formData.contract.type === 'need' && uploadedFiles.value.length === 0) {
    MessagePlugin.error('选择需要合同后，必须上传盖章后的合同文件');
    return;
  }
  // 步骤3校验
  if (currentStep.value === 3) {
    if (!formData.address.name || !formData.address.phone || !formData.address.detail) {
      MessagePlugin.error('请填写收货地址必填项');
      return;
    }
  }
  // 步骤4校验：立即付款时必须上传付款凭证
  if (currentStep.value === 4 && formData.pay.type === 'immediate' && !formData.pay.payVoucherId) {
    MessagePlugin.error('立即付款需要上传付款凭证');
    return;
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

// 构造订单提交数据（适配新接口规范）
const buildSubmitData = () => {
  // 付款方式映射：0立即付款 1账期付款 2授信额度
  const payTypeMap = { immediate: 0, installment: 1, credit: 2 };
  return {
    certId: formData.subject.certId, // 认证ID
    contractRequired: formData.contract.type === 'need', // 是否需要合同
    contract: formData.contract.attachmentIds.length > 0 ? formData.contract.attachmentIds[0] : null, // 合同ID
    contractName: uploadedFiles.value.length > 0 ? uploadedFiles.value[0].originalName : null, // 合同名称
    addressId: formData.address.addressId, // 收货地址ID
    requirement: formData.address.note, // 特殊要求
    payType: payTypeMap[formData.pay.type], // 付款方式
    payVoucher: formData.pay.payVoucherId, // 付款凭证ID
    payVoucherName: formData.pay.payVoucherName, // 付款凭证名称
    invoiceRequired: formData.other.invoiceType === 'need', // 是否需要发票
    invoiceAmount: formData.other.invoiceType === 'need' ? payAmount.value : null, // 开票金额
    invoiceDetails: formData.other.invoiceInfo, // 开票明细
    invoiceRequirement: formData.other.paymentSummary, // 开票要求
    orderDetailList: orderGoods.value.map(item => ({ // 订单商品列表
      cartId: item.cartId,
      productId: item.productId,
      productImage: item.productImage, // 注意：接口要求为图片ID，需根据实际调整
      productName: item.productName,
      specType: item.specType,
      skuId: item.skuId,
      singleSpec: item.singleSpec,
      specJson: item.specJson,
      productPrice: item.productPrice,
      payNum: item.payNum,
      totalPrice: item.totalPrice
    })),
    totalNum: totalNum.value, // 商品总数量
    totalAmount: totalAmount.value, // 商品总金额
    payAmount: payAmount.value, // 结算金额
    salePerson: formData.other.contractRemark, // 业务员（可根据实际调整）
    orderMessage: formData.other.orderRemark // 订单留言
  };
};

// 提交订单
const submitOrder = async () => {
  try {
    isLoading.value = true;
    const submitData = buildSubmitData();
    const res = await orderApi.submitOrder(submitData);
    if (res.code === 200) {
      MessagePlugin.success('订单提交成功！');
      router.push('/order-list');
    } else {
      MessagePlugin.error('订单提交失败：' + res.msg);
    }
  } catch (error) {
    console.error('提交订单失败：', error);
    MessagePlugin.error('订单提交失败，请重试');
  } finally {
    isLoading.value = false;
  }
};
</script>


<style scoped>
/* 新增收货地址弹窗样式 */
.address-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.address-modal {
  width: 600px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}
.address-item {
  padding: 16px;
  border: 1px solid #ECEEF2;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.address-item.active {
  border-color: #3799AE;
  background: #F1F9FB;
}
.address-name-phone {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}
.address-name {
  font-size: 14px;
  font-weight: 500;
  color: #272727;
}
.address-phone {
  font-size: 14px;
  color: #838486;
}
.address-default {
  font-size: 12px;
  color: #FFFFFF;
  background: #3799AE;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
}
.address-detail {
  font-size: 14px;
  color: #272727;
  margin-bottom: 4px;
}
.address-requirement {
  font-size: 12px;
  color: #838486;
}
.no-address {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: #838486;
}
/* 未认证提示 */
.no-cert-tip {
  background: #FEF3F2;
  border: 1px solid #F72B1C;
  border-radius: 4px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.warning-icon {
  width: 20px;
  height: 20px;
}
.warning-text {
  font-size: 14px;
  color: #F72B1C;
}
.cert-link {
  color: #3799AE;
  text-decoration: underline;
  margin: 0 4px;
}

/* 企业选择弹窗样式 */
.enterprise-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.enterprise-modal {
  width: 500px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ECEEF2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 16px;
  font-weight: 500;
  color: #272727;
  margin: 0;
}
.modal-close {
  border: none;
  background: transparent;
  font-size: 20px;
  color: #838486;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}
.enterprise-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.enterprise-item {
  padding: 12px 16px;
  border: 1px solid #ECEEF2;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.enterprise-item.active {
  border-color: #3799AE;
  background: #F1F9FB;
}
.enterprise-name {
  font-size: 14px;
  font-weight: 500;
  color: #272727;
  margin-bottom: 4px;
}
.enterprise-code {
  font-size: 12px;
  color: #838486;
}
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #ECEEF2;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-confirm {
  height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: 4px;
  background: #4FA2B4;
  color: #FFFFFF;
  cursor: pointer;
}
.btn-confirm:disabled {
  background: #ECEEF2;
  cursor: not-allowed;
}

/* 禁用状态样式 */
.expand-btn:disabled {
  color: #C9CDD4;
  cursor: not-allowed;
}
.btn-next:disabled {
  background: #ECEEF2;
  cursor: not-allowed;
}

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
  font-size: 14px;
  color: #1E293B;
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