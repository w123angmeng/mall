<template>
	<div class="radio-group-wrapper">
		<div class="radio-group">
			<label class="radio-item" v-for="(option, idx) in options" :key="idx">
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
	groupName: {
		type: String,
		default: ''
	}
});

// 新增：定义change事件，用于向外传递选中值
const emit = defineEmits(['update:modelValue', 'change']);

const radioGroupName = computed(() => {
	return props.groupName || `radio-group-${Math.random().toString(36).slice(2, 10)}`;
});

const handleChange = (e) => {
	const selectedValue = e.target.value;
	// 1. 更新双向绑定值
	emit('update:modelValue', selectedValue);
	// 2. 触发change事件，传递选中值（关键新增）
	emit('change', selectedValue);
};
</script>

<!-- 样式部分保持不变 -->
<style scoped>
/* 原有样式无需修改 */
.radio-group-wrapper {
	display: inline-block;
	border-radius: 4px;
	overflow: hidden;
	min-width: 160px;
}
.radio-group {
	display: flex;
}
.radio-item {
	flex: 1;
	cursor: pointer;
	user-select: none;
	position: relative;
}
.radio-input {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}
.radio-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 80px;
	height: 32px;
	padding: 7px 20px;
	font-size: 14px;
	color: #1E293B;
	background-color: #E1F5F9;
	text-align: center;
	white-space: nowrap;
	line-height: 1.5;
	transition: background-color 0.2s, color 0.2s;
}
.radio-input:checked + .radio-btn {
	background-color: #1DA4B6;
	color: #FFFFFF;
}
.radio-btn:hover:not(.radio-input:checked + .radio-btn) {
	background-color: #D1EBF0;
}
.radio-input:checked + .radio-btn:hover {
	background-color: #1994A5;
}
</style>