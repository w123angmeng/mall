<template>
	<div class="auth-manage">
		<!-- 已认证状态（Tab切换） -->
		<div class="auth-tabs">
			<!-- Tab头部 -->
			<div class="tab-header">
				<div class="tab-item" :class="{ active: activeTab === 'personal' }" @click="switchTab('personal')">
					个人认证
				</div>
				<div class="tab-item" :class="{ active: activeTab === 'enterprise' }" @click="switchTab('enterprise')">
					企业认证
				</div>
			</div>

			<!-- 个人认证Tab -->
			<div class="tab-content" v-if="activeTab === 'personal'">
				<div class="unauth-state" v-if="authStatus === 'unauth'">
					<img src="/assets/images/unauth-icon.png" alt="未认证" class="unauth-icon" />
					<t-button class="auth-btn" @click="authStatus = 'editing'">去认证</t-button>
				</div>
				<div class="personal-warp" v-else>
					<PersonalAuthForm 
						:auth-info="personalForm" 
						:is-submitting="isPersonalSubmitting"
						@submit="handlePersonalSubmit" 
						@cancel="handlePersonalCancel" 
					/>
				</div>
			</div>

			<!-- 企业认证Tab -->
			<div class="tab-content" v-if="activeTab === 'enterprise'">
				<!-- 加载状态 -->
				<div v-if="isEnterpriseLoading" class="loading-state">
					<t-loading size="large" />
				</div>
				<!-- 企业认证列表 -->
				<div class="enterprise-list" v-else-if="enterpriseList.length">
					<div class="enterprise-item" v-for="(item, idx) in enterpriseList" :key="item.id">
						<!-- 右上角审核状态图片（角标） -->
						<img :src="getStateBadge(item.status)" alt="审核状态" class="status-badge">
						<!-- 卡片头 -->
						<div class="card-header">
							<div class="default-tag" v-if="item.isDefault">默认</div>
							<div class="company-name">{{ item.companyName }}</div>
						</div>
						<!-- 卡片内容区 -->
						<div class="card-content">
							<div class="info-item">
								<span class="info-label">统一信用代码：</span>
								<span class="info-value">{{ item.socialCode }}</span>
							</div>
							<div class="info-item">
								<span class="info-label">注册资本：</span>
								<span class="info-value">{{ item.registeredCapital }}万</span>
							</div>
							<div class="info-item">
								<span class="info-label">有效期：</span>
								<span class="info-value">{{ item.longTerm ? '长期有效' : `${item.startDate}至${item.endDate}` }}</span>
							</div>
							<div class="info-item">
								<span class="info-label">法人姓名：</span>
								<span class="info-value">{{ item.legalName }}</span>
							</div>
						</div>
						<!-- 分割线 -->
						<div class="card-divider"></div>
						<!-- 底部按钮区（带图标） -->
						<div class="card-footer">
							<!-- 查看按钮 -->
							<span class="operate-btn view-btn" @click="viewEnterprise(item)">
								<t-icon name="article" size="20" />
								<span class="btn-text">查看</span>
							</span>
							<!-- 修改按钮 -->
							<span class="operate-btn edit-btn" @click="editEnterprise(item)">
								<t-icon name="edit" size="20" />
								<span class="btn-text">修改</span>
							</span>
							<!-- 删除按钮 -->
							<span class="operate-btn delete-btn" @click="deleteEnterprise(item)">
								<t-icon name="delete" size="20" />
								<span class="btn-text">删除</span>
							</span>
						</div>
					</div>
					<!-- 新增企业按钮（完全保留原有样式代码） -->
					<t-button class="add-btn" @click="openEnterpriseDialog(null)">+ 添加新企业</t-button>
				</div>
				<!-- 企业认证空状态 -->
				<div class="empty-state" v-else>
					<div class="empty-text">暂无企业认证信息</div>
					<t-button class="add-btn" @click="openEnterpriseDialog(null)">+ 添加新企业</t-button>
				</div>
			</div>
		</div>

		<!-- 企业认证弹窗 -->
		<t-dialog v-model:visible="enterpriseDialogVisible" header="企业认证" width="782px">
			<EnterpriseAuthForm 
				:edit-data="enterpriseForm" 
				:is-submitting="isEnterpriseSubmitting"
				@submit="handleEnterpriseSubmit"
				@cancel="enterpriseDialogVisible = false" 
			/>
		</t-dialog>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { Button, Dialog, Loading, Message, Icon } from 'tdesign-vue-next';
import { getVerifyApi } from '@/apis/credit';
import PersonalAuthForm from '~/components/auth/PersonalAuthForm.vue';
import EnterpriseAuthForm from '~/components/auth/EnterpriseAuthForm.vue';

// 初始化API实例
const verifyApi = getVerifyApi();

// 认证状态：unauth-未认证 editing-编辑中
const authStatus = ref('unauth');
// 活跃Tab
const activeTab = ref('personal');

// 个人认证表单
const personalForm = reactive({
	id: '',
	cardFront: '',
	cardBack: '',
	cardName: '',
	cardNumber: '',
	cardLongTerm: 1,
	cardStart: '',
	cardEnd: '',
	salePerson: '',
	purchaseIntent: ''
});
const isPersonalSubmitting = ref(false);

// 企业认证相关状态
const enterpriseList = ref([]);
const isEnterpriseLoading = ref(false);
const enterpriseDialogVisible = ref(false);
const isEnterpriseSubmitting = ref(false);
const enterpriseForm = reactive({
	id: '',
	companyName: '',
	registeredCapital: '',
	socialCode: '',
	longTerm: 1,
	startDate: '',
	endDate: '',
	legalName: '',
	legalNumber: '',
	concatName: '',
	concatPhone: '',
	license: '',
	isDefault: false,
	salePerson: '',
	purchaseIntent: ''
});

// 页面挂载时加载数据
onMounted(async () => {
	// 加载个人认证信息
	await fetchPersonalCert();
	// 默认加载企业认证列表
	await fetchEnterpriseCertList();
});

// 监听Tab切换，加载对应数据
watch(activeTab, async (newTab) => {
	if (newTab === 'enterprise') {
		await fetchEnterpriseCertList();
	} else if (newTab === 'personal') {
		await fetchPersonalCert();
	}
});

// 状态角标图片匹配（完全保留原有逻辑）
const getStateBadge = (status) => {
	switch (status) {
		case '已认证':
			return '/images/status-passed.png';
		case '审核中':
			return '/images/status-pending.png';
		case '已驳回':
			return '/images/status-rejected.png';
		default:
			return '/images/status-pending.png';
	}
};

// 切换Tab（完全保留原有逻辑）
const switchTab = (tab) => {
	activeTab.value = tab;
};

// ========== 个人认证相关逻辑 ==========
// 获取个人认证信息
const fetchPersonalCert = async () => {
	try {
		const res = await verifyApi.getPersonCert();
		if (res?.data) {
			Object.assign(personalForm, res.data);
			authStatus.value = res.data.id ? 'editing' : 'unauth';
		}
	} catch (error) {
		Message.error('获取个人认证信息失败');
		console.error(error);
	}
};

// 个人认证表单校验
const validatePersonalForm = () => {
	if (!personalForm.cardName) {
		Message.error('请输入姓名');
		return false;
	}
	// 身份证号校验
	const idCardReg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	if (!idCardReg.test(personalForm.cardNumber)) {
		Message.error('请输入有效的18位身份证号');
		return false;
	}
	// 非长期有效时校验日期
	if (personalForm.cardLongTerm === 0) {
		if (!personalForm.cardStart) {
			Message.error('请选择有效期开始日期');
			return false;
		}
		if (!personalForm.cardEnd) {
			Message.error('请选择有效期结束日期');
			return false;
		}
		if (new Date(personalForm.cardStart) > new Date(personalForm.cardEnd)) {
			Message.error('开始日期不能晚于结束日期');
			return false;
		}
	}
	// 身份证图片校验
	if (!personalForm.cardFront) {
		Message.error('请上传身份证正面照片');
		return false;
	}
	if (!personalForm.cardBack) {
		Message.error('请上传身份证背面照片');
		return false;
	}
	return true;
};

// 提交个人认证
const handlePersonalSubmit = async () => {
	if (!validatePersonalForm()) return;

	try {
		isPersonalSubmitting.value = true;
		if (personalForm.id) {
			// 修改个人认证
			await verifyApi.updatePersonCert(personalForm);
			Message.success('个人认证修改成功，等待审核');
		} else {
			// 提交新的个人认证
			await verifyApi.submitPersonCert(personalForm);
			Message.success('个人认证提交成功，等待审核');
		}
		authStatus.value = 'unauth';
		// 重新加载数据
		await fetchPersonalCert();
	} catch (error) {
		Message.error(error.message || '个人认证提交失败');
		console.error(error);
	} finally {
		isPersonalSubmitting.value = false;
	}
};

// 取消个人认证编辑（完全保留原有逻辑）
const handlePersonalCancel = () => {
	authStatus.value = personalForm.id ? 'editing' : 'unauth';
};

// ========== 企业认证相关逻辑 ==========
// 获取企业认证列表
const fetchEnterpriseCertList = async () => {
	try {
		isEnterpriseLoading.value = true;
		const res = await verifyApi.getCompanyCertList();
		enterpriseList.value = res?.data || [];
	} catch (error) {
		Message.error('获取企业认证列表失败');
		console.error(error);
	} finally {
		isEnterpriseLoading.value = false;
	}
};

// 企业认证表单校验
const validateEnterpriseForm = () => {
	if (!enterpriseForm.companyName) {
		Message.error('请输入企业名称');
		return false;
	}
	if (!enterpriseForm.registeredCapital) {
		Message.error('请输入注册资本');
		return false;
	}
	// 统一社会信用代码校验
	const creditReg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
	if (!creditReg.test(enterpriseForm.socialCode)) {
		Message.error('请输入有效的统一社会信用代码');
		return false;
	}
	if (!enterpriseForm.legalName) {
		Message.error('请输入法人姓名');
		return false;
	}
	// 法人身份证号校验
	const idCardReg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	if (!idCardReg.test(enterpriseForm.legalNumber)) {
		Message.error('请输入有效的法人身份证号');
		return false;
	}
	if (!enterpriseForm.concatName) {
		Message.error('请输入联系人姓名');
		return false;
	}
	// 联系人手机号校验
	const phoneReg = /^1[3-9]\d{9}$/;
	if (!phoneReg.test(enterpriseForm.concatPhone)) {
		Message.error('请输入有效的联系人手机号');
		return false;
	}
	// 非长期有效时校验日期
	if (enterpriseForm.longTerm === 0) {
		if (!enterpriseForm.startDate) {
			Message.error('请选择有效期开始日期');
			return false;
		}
		if (!enterpriseForm.endDate) {
			Message.error('请选择有效期结束日期');
			return false;
		}
		if (new Date(enterpriseForm.startDate) > new Date(enterpriseForm.endDate)) {
			Message.error('开始日期不能晚于结束日期');
			return false;
		}
	}
	// 营业执照校验
	if (!enterpriseForm.license) {
		Message.error('请上传营业执照');
		return false;
	}
	return true;
};

// 打开企业认证弹窗（完全保留原有逻辑）
const openEnterpriseDialog = (data) => {
	// 重置表单
	Object.assign(enterpriseForm, {
		id: '',
		companyName: '',
		registeredCapital: '',
		socialCode: '',
		longTerm: 1,
		startDate: '',
		endDate: '',
		legalName: '',
		legalNumber: '',
		concatName: '',
		concatPhone: '',
		license: '',
		isDefault: false,
		salePerson: '',
		purchaseIntent: ''
	});
	// 编辑模式赋值
	if (data) {
		Object.assign(enterpriseForm, data);
	}
	enterpriseDialogVisible.value = true;
};

// 提交企业认证
const handleEnterpriseSubmit = async () => {
	if (!validateEnterpriseForm()) return;

	try {
		isEnterpriseSubmitting.value = true;
		if (enterpriseForm.id) {
			// 修改企业认证
			await verifyApi.updateCompanyCert(enterpriseForm);
			Message.success('企业认证修改成功，等待审核');
		} else {
			// 提交新的企业认证
			await verifyApi.submitCompanyCert(enterpriseForm);
			Message.success('企业认证提交成功，等待审核');
		}
		enterpriseDialogVisible.value = false;
		// 重新加载列表
		await fetchEnterpriseCertList();
	} catch (error) {
		Message.error(error.message || '企业认证提交失败');
		console.error(error);
	} finally {
		isEnterpriseSubmitting.value = false;
	}
};

// 查看企业认证详情
const viewEnterprise = async (item) => {
	try {
		const res = await verifyApi.getCertDetail(item.id);
		if (res?.data?.cert) {
			// 可打开详情弹窗展示完整信息
			console.log('企业认证详情：', res.data);
			// 此处可扩展详情弹窗逻辑
			openEnterpriseDialog(res?.data?.cert);
		}
	} catch (error) {
		Message.error('获取企业认证详情失败');
		console.error(error);
	}
};

// 编辑企业认证（完全保留原有逻辑）
const editEnterprise = (item) => {
	openEnterpriseDialog(item);
};

// 删除企业认证
const deleteEnterprise = async (item) => {
	try {
		await verifyApi.deleteCert(item.id);
		Message.success('企业认证删除成功');
		// 重新加载列表
		await fetchEnterpriseCertList();
	} catch (error) {
		Message.error(error.message || '企业认证删除失败');
		console.error(error);
	}
};
</script>

<style lang="scss" scoped>
	.auth-manage {
		width: 100%;
		min-height: 500px;

		// 加载状态（新增，不影响原有样式）
		.loading-state {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 300px;
		}

		// 个人认证部分样式（完全保留原有代码）
		.personal-warp {
			width: 560px;
			margin: 0 auto;
		}

		.unauth-state {
			text-align: center;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			padding-top: 80px;

			.unauth-icon {
				width: 218px;
				height: 148px;
				margin-bottom: 12px;
			}

			.auth-btn {
				display: block;
				background: #3799AE;
				color: #fff;
				border: none;

				&:hover {
					background: #2d8094;
				}
			}
		}

		// 已认证Tab（完全保留原有样式代码）
		.auth-tabs {
			width: 100%;

			.tab-header {
				display: flex;
				border-bottom: 1px solid #ECEEF2;
				margin-bottom: 20px;

				.tab-item {
					padding: 0 20px;
					height: 40px;
					line-height: 40px;
					font-size: 14px;
					color: #666;
					cursor: pointer;
					position: relative;

					&.active {
						color: #3799AE;

						&::after {
							content: '';
							position: absolute;
							bottom: -1px;
							left: 0;
							width: 100%;
							height: 2px;
							background: #3799AE;
						}
					}

					&:hover {
						color: #3799AE;
					}
				}
			}

			.tab-content {
				width: 100%;
				padding: 0 10px;
			}

			// 🔥 核心优化：企业认证列表样式（严格保留原有代码）
			.enterprise-list {
				display: flex;
				flex-wrap: wrap;
				gap: 20px;
				margin-bottom: 30px;

				// 单个企业卡片（严格尺寸+样式）
				.enterprise-item {
					position: relative;
					width: 254px;
					height: 272px;
					border-radius: 4px;
					// opacity: 0.26;
					background: url('@/assets/images/card-bg.png') no-repeat center / cover;
					box-sizing: border-box;
					border: 1px solid #ECEEF2;
					display: flex;
					flex-direction: column;
					overflow: hidden;

					// 右上角审核状态角标
					.status-badge {
						position: absolute;
						top: 0;
						right: 0;
						width: 56px;
						height: 56px;
						object-fit: contain;
						z-index: 1;
					}

					// 卡片头（严格样式）
					.card-header {
						height: 56px;
						border-radius: 4px 4px 0px 0px;
						opacity: 1;
						background: rgba(255, 255, 255, 0.502);
						box-sizing: border-box;
						border-bottom: 1px solid #ECEEF2;
						display: flex;
						align-items: center;
						padding: 0 16px;

						.default-tag {
							display: inline-block;
							background: #000;
							color: #fff;
							font-size: 12px;
							padding: 2px 8px;
							border-radius: 4px;
							margin-right: 8px;
						}

						.company-name {
							font-size: 18px;
							font-weight: 350;
							line-height: 18px;
							letter-spacing: 0em;
							color: #272727;
						}
					}

					// 卡片内容区
					.card-content {
						flex: 1;
						padding: 16px;
						display: flex;
						flex-direction: column;
						gap: 12px;

						.info-item {
							display: flex;
							align-items: center;

							.info-label {
								color: #838486;
								margin-right: 4px;
							}

							.info-value {
								color: #272727;
							}
						}
					}

					// 分割线（严格尺寸）
					.card-divider {
						width: 354px;
						height: 1px;
						opacity: 1;
						background: #ECEEF2;
						box-sizing: border-box;
					}

					// 底部按钮区（严格高度+带图标）
					.card-footer {
						height: 48px;
						display: flex;
						align-items: center;
						justify-content: space-between;
						gap: 16px;
						padding: 0 16px;
						background: rgba(255, 255, 255, 0.5);
						
						// 通用操作按钮样式（完全保留原有代码）
						.operate-btn {
							display: flex;
							align-items: center;
							gap: 4px; // 图标和文字间距
							cursor: pointer; // 鼠标可点击状态
							transition: all 0.2s ease; // 过渡动画
					
							// 图标默认样式
							:deep(.t-icon) {
								color: #838486; // 默认灰色
								transition: color 0.2s ease;
							}
					
							// 文字默认样式
							.btn-text {
								font-size: 14px;
								color: #838486; // 默认灰色
								transition: color 0.2s ease;
							}
					
							// 鼠标悬浮通用效果
							&:hover {
								// 鼠标悬浮时手型（兜底）
								cursor: pointer;
							}
						}
					
						// 查看按钮 hover 样式（主题色）
						.view-btn:hover {
							:deep(.t-icon) {
								color: #3799AE !important;
							}
							.btn-text {
								color: #3799AE !important;
							}
						}
					
						// 修改按钮 hover 样式（主题色）
						.edit-btn:hover {
							:deep(.t-icon) {
								color: #3799AE !important;
							}
							.btn-text {
								color: #3799AE !important;
							}
						}
					
						// 删除按钮 hover 样式（红色）
						.delete-btn:hover {
							:deep(.t-icon) {
								color: #F53F3F !important;
							}
							.btn-text {
								color: #F53F3F !important;
							}
						}
					}
				}

				// 新增企业按钮（完全保留原有样式代码，无任何修改）
				.add-btn {
					width: 140px;
					height: 32px;
					border-radius: 4px;
					opacity: 1;
					background: #EEF7F9;
					box-sizing: border-box;
					border: 1px solid #93C8D3;
					color: #3799AE !important;
					font-size: 14px;
					padding: 0 !important;

					&:hover {
						background: #e0f0f5 !important;
						border-color: #7ab9c9 !important;
					}
				}
			}

			// 空状态（保持原逻辑）
			.empty-state {
				text-align: center;
				padding: 40px 0;

				.empty-text {
					font-size: 14px;
					color: #999;
					margin-bottom: 20px;
				}
			}
		}
	}
</style>