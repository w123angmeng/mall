<template>
  <div class="radio-group-single">
    <label 
      class="radio-option"
      v-for="(option, idx) in options"
      :key="idx"
      :class="{
        'radio-option--readonly': readonly,
        'radio-option--checked': modelValue === option.value
      }"
    >
      <!-- 自定义单选框 -->
      <input
        type="radio"
        :name="groupName"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="readonly"
        @change="handleChange(option.value)"
        class="radio-input"
      >
      <span class="radio-text">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 接收参数：选项列表、绑定值、单选组name、只读状态
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
  },
  readonly: {
    type: Boolean,
    default: false // 新增：只读状态，默认关闭
  }
});

// 双向绑定事件
const emit = defineEmits(['update:modelValue']);

// 单选值变化（只读状态下不触发事件）
const handleChange = (value) => {
  if (props.readonly) return; // 新增：只读时阻止值变更
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
  transition: all 0.2s ease;
}

/* 新增：只读状态下的选项基础样式 */
.radio-option--readonly {
  cursor: not-allowed; /* 鼠标变为不可点击样式 */
}

/* 新增：只读状态下未选中项的样式（置灰区分） */
.radio-option--readonly:not(.radio-option--checked) {
  background: #F9FAFC;
  border-color: #ECEEF2;
}

/* 新增：选中项的高亮样式（统一控制选中视觉） */
.radio-option--checked {
  border-color: #3799AE;
  background: rgba(55, 153, 174, 0.05);
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
  transition: all 0.2s ease;
}

/* 选中状态：替换为square-checked.png */
.radio-input:checked {
  background: url('@/assets/images/square-checked.png') no-repeat center center;
  background-size: 100% 100%;
}

/* 新增：只读状态下的单选框样式 */
.radio-option--readonly .radio-input {
  cursor: not-allowed;
}

/* 新增：只读状态下未选中项的单选框（置灰） */
.radio-option--readonly:not(.radio-option--checked) .radio-input {
  background: #ECEEF2;
}

/* 选中时的文字样式 */
.radio-input:checked + .radio-text,
.radio-option--checked .radio-text { /* 新增：统一选中文字样式 */
  color: #272727;
  font-weight: 500;
}

/* 新增：只读状态下未选中项的文字样式（置灰） */
.radio-option--readonly:not(.radio-option--checked) .radio-text {
  color: #C9CDD4;
}

/* 选项文字样式 */
.radio-text {
  font-size: 14px;
  color: #6A6B6D;
  transition: color 0.2s ease;
}

/* 新增：鼠标悬浮效果（非只读时） */
.radio-option:not(.radio-option--readonly):hover {
  border-color: #3799AE;
  background: rgba(55, 153, 174, 0.03);
}
</style>