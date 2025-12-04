<template>
	<div class="radio-group-wrapper">
		<div class="radio-group">
			<label class="radio-item" v-for="(option, idx) in options" :key="idx">
				<!-- 核心：添加统一name属性实现互斥 + 隐藏原生radio -->
				<input 
					type="radio" 
					:value="option.value" 
					:checked="modelValue === option.value" 
					class="radio-input"
					@change="handleChange"
					:name="radioGroupName"
				/>
				<span class="radio-btn">
					{{ option.label }}
				</span>
			</label>
		</div>
	</div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';

// 接收参数：选项列表、绑定值、可选自定义name（不传则自动生成）
const props = defineProps({
	options: {
		type: Array,
		required: true,
		default: () => []
	},
	modelValue: {
		type: [String, Number],
		required: true
	},
	groupName: {  // 可选：自定义单选组name，避免不同组冲突
		type: String,
		default: ''
	}
});

// 双向绑定emit
const emit = defineEmits(['update:modelValue']);

// 生成唯一name（自动生成 + 支持自定义）
const radioGroupName = computed(() => {
	// 自定义name优先，否则生成随机唯一值
	return props.groupName || `radio-group-${Math.random().toString(36).slice(2, 10)}`;
});

// 触发值更新（确保仅选中当前项）
const handleChange = (e) => {
	emit('update:modelValue', e.target.value);
};
</script>

<style scoped>
/* 外层容器：整体圆角+溢出裁剪 */
.radio-group-wrapper {
	display: inline-block;
	border-radius: 4px; /* 截图是大圆角，可同步调整 */
	overflow: hidden;
	min-width: 160px; /* 两个按钮各80px，总宽度至少160px */
}

/* 单选组：横向排列+选项无缝衔接 */
.radio-group {
	display: flex;
}

/* 单选项：均分宽度（适配2个/多个选项） */
.radio-item {
	flex: 1;
	cursor: pointer;
	user-select: none;
	position: relative;
}

/* 隐藏原生单选框（仅保留功能） */
.radio-input {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}

/* 分段按钮样式（未选中） */
.radio-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 80px; /* 放大最小宽度，容纳“不需要”一行显示 */
	height: 32px;
	padding: 7px 20px;
	font-size: 14px;
	color: #1E293B;
	background-color: #E1F5F9;
	text-align: center;
	white-space: nowrap; /* 禁止文字换行（核心修复） */
	line-height: 1.5;
	transition: background-color 0.2s, color 0.2s;
}

/* 选中状态（互斥核心：仅一个可选中） */
.radio-input:checked + .radio-btn {
	background-color: #1DA4B6;
	color: #FFFFFF;
}

/* Hover交互优化 */
.radio-btn:hover:not(.radio-input:checked + .radio-btn) {
	background-color: #D1EBF0;
}
.radio-input:checked + .radio-btn:hover {
	background-color: #1994A5;
}
</style>