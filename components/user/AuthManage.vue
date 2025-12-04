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

			<!-- 个人认证Tab（保持原逻辑） -->
			<div class="tab-content" v-if="activeTab === 'personal'">
				<div class="unauth-state" v-if="authStatus === 'unauth'">
					<img src="/assets/images/unauth-icon.png" alt="未认证" class="unauth-icon" />
					<t-button class="auth-btn" @click="authStatus = ''">去认证</t-button>
				</div>
				<div class="personal-warp" v-else>
					<PersonalAuthForm @submit="handlePersonalSubmit" @cancel="handlePersonalCancel" />
				</div>
			</div>

			<!-- 企业认证Tab（优化后） -->
			<div class="tab-content" v-if="activeTab === 'enterprise'">
				<!-- 企业认证列表 -->
				<div class="enterprise-list" v-if="enterpriseList.length">
					<!-- 企业卡片（严格按尺寸+样式） -->
					<div class="enterprise-item" v-for="(item, idx) in enterpriseList" :key="item.id">
						<!-- 1. 右上角审核状态图片（角标） -->
						<img :src="getStateBadge(item.status)" alt="审核状态" class="status-badge">
						<!-- 2. 卡片头 -->
						<div class="card-header">
							<div class="default-tag" v-if="item.isDefault">默认</div>
							<div class="company-name">{{ item.companyName }}</div>
						</div>
						<!-- 3. 卡片内容区 -->
						<div class="card-content">
							<div class="info-item">
								<span class="info-label">统一信用代码：</span>
								<span class="info-value">{{ item.creditCode }}</span>
							</div>
							<div class="info-item">
								<span class="info-label">注册资本：</span>
								<span class="info-value">{{ item.registerCapital }}万</span>
							</div>
							<div class="info-item">
								<span class="info-label">有效期：</span>
								<span class="info-value">{{ item.validity }}</span>
							</div>
							<div class="info-item">
								<span class="info-label">法人姓名：</span>
								<span class="info-value">{{ item.legalName }}</span>
							</div>
						</div>
						<!-- 4. 分割线 -->
						<div class="card-divider"></div>
						<!-- 5. 底部按钮区（带图标） -->
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
					<!-- 新增企业按钮（严格按尺寸+样式） -->
					<t-button class="add-btn" @click="openEnterpriseDialog(null)">+ 添加新企业</t-button>
				</div>
				<!-- 企业认证空状态（保持原逻辑） -->
				<div class="empty-state" v-else>
					<div class="empty-text">暂无企业认证信息</div>
					<t-button class="add-btn" @click="openEnterpriseDialog(null)">+ 添加新企业</t-button>
				</div>
			</div>
		</div>

		<!-- 企业认证弹窗（保持原逻辑） -->
		<t-dialog v-model:visible="enterpriseDialogVisible" header="企业认证" width="782px">
			<EnterpriseAuthForm :editData="currentEnterprise" @submit="handleEnterpriseSubmit"
				@cancel="enterpriseDialogVisible = false" />
		</t-dialog>
	</div>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		Button,
		Dialog
	} from 'tdesign-vue-next';
	import PersonalAuthForm from '~/components/auth/PersonalAuthForm.vue';
	import EnterpriseAuthForm from '~/components/auth/EnterpriseAuthForm.vue';

	// 认证状态
	const authStatus = ref('unauth');
	// 活跃Tab
	const activeTab = ref('personal');

	// 企业列表数据（保持原逻辑）
	const enterpriseList = ref([{
			id: 1,
			companyName: '公司名称名称信息',
			creditCode: '1234567890',
			registerCapital: '1000',
			validity: '10年',
			legalName: '张三三',
			status: '已认证',
			isDefault: true
		},
		{
			id: 2,
			companyName: '公司名称名称信息',
			creditCode: '1234567890',
			registerCapital: '1000',
			validity: '10年',
			legalName: '张三三',
			status: '审核中',
			isDefault: false
		},
		{
			id: 3,
			companyName: '公司名称名称信息',
			creditCode: '1234567890',
			registerCapital: '1000',
			validity: '10年',
			legalName: '张三三',
			status: '已驳回',
			isDefault: false
		}
	]);

	// 状态角标图片匹配（保持原逻辑）
	const getStateBadge = (status) => {
		switch (status) {
			case '已认证':
				return '/images/status-passed.png';
			case '审核中':
				return '/images/status-pending.png';
			case '已驳回':
				return '/images/status-rejected.png';
			default:
				return '';
		}
	};

	// 企业认证弹窗状态
	const enterpriseDialogVisible = ref(false);
	const currentEnterprise = ref({});

	// 切换Tab（保持原逻辑）
	const switchTab = (tab) => {
		activeTab.value = tab;
	};

	// 个人认证提交（保持原逻辑）
	const handlePersonalSubmit = (data) => {
		console.log('个人认证提交', data);
	};
	const handlePersonalCancel = () => {};

	// 企业认证弹窗（保持原逻辑）
	const openEnterpriseDialog = (data) => {
		currentEnterprise.value = data || {};
		enterpriseDialogVisible.value = true;
	};

	// 企业认证提交（保持原逻辑）
	const handleEnterpriseSubmit = (data) => {
		if (currentEnterprise.value.id) {
			const index = enterpriseList.value.findIndex(item => item.id === currentEnterprise.value.id);
			enterpriseList.value[index] = {
				...data,
				id: currentEnterprise.value.id,
				status: '审核中'
			};
		} else {
			enterpriseList.value.push({
				...data,
				id: Date.now(),
				status: '审核中',
				validity: data.dateRange?.length ? `${data.dateRange[0]}至${data.dateRange[1]}` : '长期有效'
			});
		}
		enterpriseDialogVisible.value = false;
	};

	// 企业列表操作（保持原逻辑）
	const viewEnterprise = (item) => {
		console.log('查看企业', item);
	};
	const editEnterprise = (item) => {
		openEnterpriseDialog(item);
	};
	const deleteEnterprise = (item) => {
		enterpriseList.value = enterpriseList.value.filter(i => i.id !== item.id);
	};
</script>

<style lang="scss" scoped>
	.auth-manage {
		width: 100%;
		min-height: 500px;

		// 个人认证部分样式（保持原逻辑）
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

		// 已认证Tab（保持原逻辑）
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

			// 🔥 核心优化：企业认证列表样式（严格匹配要求）
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
						
						// 通用操作按钮样式
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

				// 新增企业按钮（严格尺寸+样式）
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