<template>
  <div class="order-step-nav">
    <!-- 循环生成步骤项 + 间隔线（最后一个步骤无横线） -->
    <template v-for="(step, idx) in steps" :key="idx">
      <div class="step-item">
        <!-- 步骤图标：未选中/已完成/当前选中 -->
        <div class="step-icon" :class="{ 
          'step-completed': currentStep > idx + 1,  // 已完成（之前填写完毕）
          'step-current': currentStep === idx + 1   // 当前选中
        }">
          <span v-if="currentStep <= idx + 1">{{ idx + 1 }}</span>
          <span v-else></span> <!-- 已完成/当前选中时隐藏数字 -->
        </div>
        <div class="step-text">{{ step }}</div>
      </div>
      
      <!-- 间隔线：仅在非最后一个步骤后显示 -->
      <div class="step-line" v-if="idx < steps.length - 1"></div>
    </template>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// 接收参数：当前步骤、步骤列表
const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
    default: 1
  },
  steps: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped type="scss">
.order-step-nav {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  padding: 0 20px;
  /* 关键：外层不设置整体垂直居中，让横线独立定位到圆圈中线 */
  align-items: flex-start;
}

/* 步骤项容器（仅包含图标+文字） */
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0; /* 防止步骤项被挤压 */
  width: 80px; /* 固定宽度，保证文字居中 */
}

/* 基础步骤图标样式（未选中状态） */
.step-icon {
  width: 24px;          
  height: 24px;         
  background: #E2E8F0;  
  color: #94A3B8;       
  font-size: 14px;      
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-weight: 500;
  flex-shrink: 0; /* 图标不收缩 */
  /* 图标相对定位，作为横线垂直参考 */
  position: relative;
}

/* 状态1：已完成（之前填写完毕）- 用指定图片 */
.step-completed {
  background: url('@/assets/images/step-checked.png') no-repeat center center;
  background-size: 100% 100%; /* 图片填满图标容器 */
  color: transparent; /* 隐藏数字 */
}

/* 状态2：当前选中 */
.step-current {
  background: #007B8C; /* 当前选中：背景色 */
  color: #FFFFFF !important;
}

/* 步骤文字 */
.step-text {
  font-size: 12px;
  font-weight: 600;
  color: #838486;
  text-align: center; /* 文字居中，适配固定宽度 */
  line-height: 18px;
}

/* 步骤间横线（核心优化：垂直居中于24px圆圈） */
.step-line {
  width: 120px;         /* 按你的要求调整后的横线宽度 */
  height: 1px;
  border-style: solid;
  border-color: #CBD5E1;
  border-width: 1px 0 0 0; /* 仅上边框形成横线 */
  flex-shrink: 0; /* 横线宽度固定，不收缩 */
  margin: 0 0; /* 横线与步骤项无缝衔接 */
  /* 关键：垂直定位到24px圆圈的中线（24/2=12px） */
  margin-top: 12px; 
  /* 微调：让横线视觉上更居中（可选，根据实际效果调整） */
  transform: translateY(-50%);
}
</style>