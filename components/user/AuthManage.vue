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
						:from="'authManage'"
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
								<span class="info-value">{{ item.longTerm ? '长期有效' : `${item.startDate || ''}至${item.endDate || ''}` }}</span>
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
					<!-- 新增企业按钮 -->
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
				ref="authRef"
				:key="enterpriseForm.id || 'new'"
				:edit-data="formatEditData(enterpriseForm)" 
				:is-submitting="isEnterpriseSubmitting"
				:isPersonalCenter="true"
				@uploadSuccess="handleUploadSuccess"
				@submit="handleChildSubmit"
			/>
			<template #footer>
			    <t-button @click="enterpriseDialogVisible = false">取消</t-button>
			    <t-button theme="primary" @click="submitEnterpriseForm">提交</t-button>
			</template>
		</t-dialog>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { getVerifyApi } from '@/apis/credit';
import PersonalAuthForm from '~/components/auth/PersonalAuthForm.vue';
import EnterpriseAuthForm from '~/components/auth/EnterpriseAuthForm.vue';

// 初始化API实例
const verifyApi = getVerifyApi();

// 认证状态：unauth-未认证 editing-编辑中
const authStatus = ref('unauth');
// 活跃Tab
const activeTab = ref('personal');

// 个人认证表单（字段与子组件完全对齐）
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

// 初始化企业表单默认值（抽离为常量，方便重置）
const DEFAULT_ENTERPRISE_FORM = {
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
	purchaseIntent: '',
	originalId: '',
};

// 企业表单使用ref包裹reactive，确保重置时引用更新
const enterpriseForm = ref(reactive({ ...DEFAULT_ENTERPRISE_FORM }));

// 企业认证表单Ref
const authRef = ref(null);

// 格式化编辑数据（父→子字段映射，兼容接口返回的null/特殊格式）
const formatEditData = (form) => {
	// 处理注册资本格式：去掉多余小数位（如12.0000 → 12）
	const formatCapital = (capital) => {
		if (!capital) return '';
		return parseFloat(capital).toString();
	};

	return {
		id: form.id || '',
		enterpriseName: form.companyName || '',
		registeredCapital: formatCapital(form.registeredCapital) || '',
		socialCreditCode: form.socialCode || '',
		validDate: [form.startDate || '', form.endDate || ''].filter(Boolean),
		isLongTerm: form.longTerm === 1 || form.longTerm === true,
		legalPersonName: form.legalName || '',
		legalPersonId: form.legalNumber || '',
		contactName: form.concatName || '',
		contactPhone: form.concatPhone || '',
		businessName: form.salePerson || '',
		tradeIntention: form.purchaseIntent || '',
		licenseUrl: form.license || ''
	};
};

// 页面挂载时加载数据
onMounted(async () => {
	await fetchPersonalCert();
	await fetchEnterpriseCertList();
});

// 监听Tab切换
watch(activeTab, async (newTab) => {
	if (newTab === 'enterprise') {
		await fetchEnterpriseCertList();
	} else if (newTab === 'personal') {
		await fetchPersonalCert();
	}
});

// 状态角标图片匹配
const getStateBadge = (status) => {
	// 兼容接口返回的数字状态（0=审核中，1=已认证，2=已驳回）
	const statusMap = {
		0: '审核中',
		1: '已认证',
		2: '已驳回',
		'审核中': '审核中',
		'已认证': '已认证',
		'已驳回': '已驳回'
	};
	const statusText = statusMap[status] || '审核中';
	
	switch (statusText) {
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

// 切换Tab
const switchTab = (tab) => {
	activeTab.value = tab;
};

// ========== 个人认证相关逻辑 ==========
const fetchPersonalCert = async () => {
	try {
		const res = await verifyApi.getPersonCert();
		if (res?.data) {
			// 深度拷贝，避免直接修改响应数据
			Object.assign(personalForm, { ...res.data });
			authStatus.value = res.data.id ? 'editing' : 'unauth';
		}
	} catch (error) {
		MessagePlugin.error('获取个人认证信息失败');
		console.error(error);
	}
};

// 核心修复：校验逻辑与子组件字段对齐
const validatePersonalForm = () => {
	if (!personalForm.cardName.trim()) {
		MessagePlugin.error('请输入姓名');
		return false;
	}
	const idCardReg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	if (!idCardReg.test(personalForm.cardNumber.trim())) {
		MessagePlugin.error('请输入有效的18位身份证号');
		return false;
	}
	if (personalForm.cardLongTerm === 0) {
		if (!personalForm.cardStart) {
			MessagePlugin.error('请选择有效期开始日期');
			return false;
		}
		if (!personalForm.cardEnd) {
			MessagePlugin.error('请选择有效期结束日期');
			return false;
		}
		if (new Date(personalForm.cardStart) > new Date(personalForm.cardEnd)) {
			MessagePlugin.error('开始日期不能晚于结束日期');
			return false;
		}
	}
	if (!personalForm.cardFront) {
		MessagePlugin.error('请上传身份证正面照片');
		return false;
	}
	if (!personalForm.cardBack) {
		MessagePlugin.error('请上传身份证背面照片');
		return false;
	}
	return true;
};

// 核心修复：接收子组件传递的对齐字段，并更新到 personalForm
const handlePersonalSubmit = async (submitData) => {
	// 1. 将子组件数据同步到父组件表单
	Object.assign(personalForm, submitData);
	// 2. 执行父组件校验
	if (!validatePersonalForm()) return;

	try {
		isPersonalSubmitting.value = true;
		if (personalForm.id) {
			await verifyApi.updatePersonCert(personalForm);
			MessagePlugin.success('个人认证修改成功，等待审核');
		} else {
			await verifyApi.submitPersonCert(personalForm);
			MessagePlugin.success('个人认证提交成功，等待审核');
		}
		authStatus.value = 'unauth';
		await fetchPersonalCert();
	} catch (error) {
		MessagePlugin.error(error.message || '个人认证提交失败');
		console.error(error);
	} finally {
		isPersonalSubmitting.value = false;
	}
};

const handlePersonalCancel = () => {
	authStatus.value = personalForm.id ? 'editing' : 'unauth';
};

// ========== 企业认证相关逻辑 ==========
const fetchEnterpriseCertList = async () => {
	try {
		isEnterpriseLoading.value = true;
		const res = await verifyApi.getCompanyCertList();
		enterpriseList.value = res?.data || [];
	} catch (error) {
		MessagePlugin.error('获取企业认证列表失败');
		console.error(error);
	} finally {
		isEnterpriseLoading.value = false;
	}
};

const handleUploadSuccess = (data) => {
	if (data.type === 'license') {
		enterpriseForm.value.license = data.ossId;
	}
};

// 接收子组件提交数据（子→父字段映射）
const handleChildSubmit = (childData) => {
	console.log('----childData:', childData)
	enterpriseForm.value.companyName = childData.enterpriseName || '';
	enterpriseForm.value.registeredCapital = childData.registeredCapital || '';
	enterpriseForm.value.socialCode = childData.socialCreditCode || '';
	enterpriseForm.value.longTerm = childData.isLongTerm ? 1 : 0;
	enterpriseForm.value.startDate = childData.validDate?.[0] || '';
	enterpriseForm.value.endDate = childData.validDate?.[1] || '';
	enterpriseForm.value.legalName = childData.legalPersonName || '';
	enterpriseForm.value.legalNumber = childData.legalPersonId || '';
	enterpriseForm.value.concatName = childData.contactName || '';
	enterpriseForm.value.concatPhone = childData.contactPhone || '';
	enterpriseForm.value.salePerson = childData.businessName || '';
	enterpriseForm.value.purchaseIntent = childData.tradeIntention || '';
	enterpriseForm.value.license = childData.originalId || childData.licenseUrl || enterpriseForm.value.license;
};

// 核心修复：重构弹窗打开方法，彻底重置/赋值数据
const openEnterpriseDialog = async (data) => {
	try {
		// 1. 彻底重置表单（重新赋值，更新引用）
		enterpriseForm.value = reactive({ ...DEFAULT_ENTERPRISE_FORM });

		// 2. 如果是编辑/查看，处理数据赋值
		if (data) {
			// 如果是查看操作，先请求详情接口获取完整数据
			let detailData = data;
			if (data.id && !data.companyName) { // 列表项可能字段不全，请求详情
				const res = await verifyApi.getCertDetail(data.id);
				if (res?.data?.cert) {
					detailData = res.data.cert;
				}
			}

			// 3. 兼容接口返回的null值，确保字段有默认值
			Object.assign(enterpriseForm.value, {
				id: detailData.id || '',
				companyName: detailData.companyName || '',
				registeredCapital: detailData.registeredCapital || '',
				socialCode: detailData.socialCode || '',
				longTerm: detailData.longTerm === 0 ? 0 : 1, // 兼容null/undefined
				startDate: detailData.startDate || '',
				endDate: detailData.endDate || '',
				legalName: detailData.legalName || '',
				legalNumber: detailData.legalNumber || '',
				concatName: detailData.concatName || '',
				concatPhone: detailData.concatPhone || '',
				originalId: detailData.originalId || '',
				license: detailData.license || '',
				isDefault: detailData.isDefault || false,
				salePerson: detailData.salePerson || '',
				purchaseIntent: detailData.purchaseIntent || ''
			});
			console.log('-----enterpriseForm.value:', enterpriseForm.value, detailData)
		}

		// 4. 延迟打开弹窗，确保数据赋值完成（避免渲染时机问题）
		setTimeout(() => {
			enterpriseDialogVisible.value = true;
		}, 0);
	} catch (error) {
		MessagePlugin.error('加载企业认证数据失败');
		console.error(error);
	}
};

const submitEnterpriseForm = async () => {
	const isValid = await authRef.value?.handleSubmit();
	if (!isValid) return;

	try {
		isEnterpriseSubmitting.value = true;
		if (enterpriseForm.value.id) {
			await verifyApi.updateCompanyCert(enterpriseForm.value);
			MessagePlugin.success('企业认证修改成功，等待审核');
		} else {
			await verifyApi.submitCompanyCert(enterpriseForm.value);
			MessagePlugin.success('企业认证提交成功，等待审核');
		}
		enterpriseDialogVisible.value = false;
		await fetchEnterpriseCertList();
	} catch (error) {
		MessagePlugin.error(error.message || '企业认证提交失败');
		console.error(error);
	} finally {
		isEnterpriseSubmitting.value = false;
	}
};

// 核心修复：查看企业详情方法（确保获取完整数据）
const viewEnterprise = async (item) => {
	try {
		const res = await verifyApi.getCertDetail(item.id);
		if (res?.data?.cert) {
			await openEnterpriseDialog(res.data.cert);
		} else {
			MessagePlugin.warning('暂无企业认证详情数据');
		}
	} catch (error) {
		MessagePlugin.error('获取企业认证详情失败');
		console.error(error);
	}
};

// 编辑企业（直接传列表项，openEnterpriseDialog会自动请求详情）
const editEnterprise = (item) => {
	openEnterpriseDialog(item);
};

const deleteEnterprise = async (item) => {
	try {
		await verifyApi.deleteCert(item.id);
		MessagePlugin.success('企业认证删除成功');
		await fetchEnterpriseCertList();
	} catch (error) {
		MessagePlugin.error(error.message || '企业认证删除失败');
		console.error(error);
	}
};
</script>

<style lang="scss" scoped>
.auth-manage {
	width: 100%;
	min-height: 500px;
	padding: 20px;
	box-sizing: border-box;

	.loading-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
	}

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

		.enterprise-list {
			display: flex;
			flex-wrap: wrap;
			gap: 20px;
			margin-bottom: 30px;

			.enterprise-item {
				position: relative;
				width: 254px;
				height: 272px;
				border-radius: 4px;
				background: url('@/assets/images/card-bg.png') no-repeat center / cover;
				box-sizing: border-box;
				border: 1px solid #ECEEF2;
				display: flex;
				flex-direction: column;
				overflow: hidden;

				.status-badge {
					position: absolute;
					top: 0;
					right: 0;
					width: 56px;
					height: 56px;
					object-fit: contain;
					z-index: 1;
				}

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

				.card-divider {
					width: 354px;
					height: 1px;
					opacity: 1;
					background: #ECEEF2;
					box-sizing: border-box;
				}

				.card-footer {
					height: 48px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 16px;
					padding: 0 16px;
					background: rgba(255, 255, 255, 0.5);
					
					.operate-btn {
						display: flex;
						align-items: center;
						gap: 4px;
						cursor: pointer;
						transition: all 0.2s ease;
				
						:deep(.t-icon) {
							color: #838486;
							transition: color 0.2s ease;
						}
				
						.btn-text {
							font-size: 14px;
							color: #838486;
							transition: color 0.2s ease;
						}
				
						&:hover {
							cursor: pointer;
						}
					}
				
					.view-btn:hover {
						:deep(.t-icon) {
							color: #3799AE !important;
						}
						.btn-text {
							color: #3799AE !important;
						}
					}
				
					.edit-btn:hover {
						:deep(.t-icon) {
							color: #3799AE !important;
						}
						.btn-text {
							color: #3799AE !important;
						}
					}
				
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