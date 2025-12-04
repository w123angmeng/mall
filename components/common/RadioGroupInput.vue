<template>
  <div class="radio-group-single">
    <label 
      class="radio-option"
      v-for="(option, idx) in options"
      :key="idx"
    >
      <!-- 自定义单选框 -->
      <input
        type="radio"
        :name="groupName"
        :value="option.value"
        :checked="modelValue === option.value"
        @change="handleChange(option.value)"
        class="radio-input"
      >
      <span class="radio-text">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 接收参数：选项列表、绑定值、单选组name
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
    required: true
  }
});

// 双向绑定事件
const emit = defineEmits(['update:modelValue']);

// 单选值变化
const handleChange = (value) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
/* 单选组容器 */
.radio-group-single {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

/* 单选项样式（未选中） */
.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 70px;
  height: 30px;
  padding: 8px;
  background: #FFFFFF;
  border: 1px solid #DCDEE2;
  cursor: pointer;
  border-radius: 6px;
}

/* 隐藏原生单选框，自定义样式 */
.radio-input {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 2px;
  background: #F0F2F4;
  border: none;
  cursor: pointer;
}

/* 选中状态：替换为square-checked.png */
.radio-input:checked {
  background: url('@/assets/images/square-checked.png') no-repeat center center;
  background-size: 100% 100%;
}

/* 选中时的文字样式 */
.radio-input:checked + .radio-text {
  color: #272727;
}

/* 选项文字样式 */
.radio-text {
  font-size: 14px;
  color: #6A6B6D;
}
</style>