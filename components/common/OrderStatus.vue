<template>
  <!-- 订单状态模块（最终精准对齐版） -->
  <div class="order-status-container">
    <h2 class="status-title">订单状态</h2>
    <!-- 父容器：flex分布，线条与步骤项同级 -->
    <div class="order-step-nav">
      <template v-for="(step, idx) in steps" :key="idx">
        <!-- 步骤项：仅包含图标+文字+日期，不参与线条定位计算 -->
        <div class="step-item">
          <!-- 图标容器：固定尺寸，作为对齐基准 -->
          <div class="step-icon-wrapper">
            <div class="step-icon" :class="{ 'step-completed': isCompleted(idx) }"></div>
          </div>
          <div class="step-name">{{ step.name }}</div>
          <div class="step-date">{{ step.date }}</div>
        </div>
        
        <!-- 分割线：仅在非最后一步显示 -->
        <div 
          class="step-line" 
          v-if="idx < steps.length - 1"
          :class="{ 'line-completed': isLineCompleted(idx) }"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  completedStepIndex: {
    type: Number,
    required: true,
    default: 3
  },
  steps: {
    type: Array,
    required: true,
    default: () => [
      { name: '已付款', date: '2025-10-16' },
      { name: '已下单', date: '2025-10-16' },
      { name: '生产中', date: '2025-10-16' },
      { name: '生产完成', date: '2025-10-16' },
      { name: '已发货', date: '' },
      { name: '已完成', date: '' }
    ]
  }
});

// 判断步骤是否已完成
const isCompleted = (idx) => idx <= props.completedStepIndex;
// 判断分割线是否已完成（前一个步骤已完成则线条变色）
const isLineCompleted = (idx) => idx < props.completedStepIndex;
</script>

<style scoped type="scss">
.order-status-container {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.status-title {
  font-size: 16px;
  font-weight: 500;
  color: #272727;
  margin-bottom: 15px;
}

/* 核心父容器：flex均匀分布，线条和步骤项同级 */
.order-step-nav {
  display: flex;
  width: 100%;
  align-items: flex-start; /* 取消默认对齐，让线条独立定位 */
  padding: 0 150px;
}

/* 步骤项：固定宽度，避免挤压线条 */
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px; /* 固定宽度，确保步骤项不被压缩 */
  position: relative;
  z-index: 1; /* 图标在线条上方，避免覆盖 */
}

/* 图标容器：固定20px尺寸，作为对齐的唯一基准 */
.step-icon-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 状态图标：20px圆形，已完成用指定图片 */
.step-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ECEEF2; /* 未完成灰色 */
}

.step-completed {
  background: url('@/assets/images/step-checked.png') no-repeat center center;
  background-size: 100% 100%; /* 图片填满图标 */
}

/* 步骤文字样式 */
.step-name {
  font-size: 14px;
  color: #272727;
  margin: 8px 0 4px;
  text-align: center;
}

.step-date {
  font-size: 12px;
  color: #838486;
  text-align: center;
}

/* 分割线：精准垂直居中对齐图标（核心修复） */
.step-line {
  /* 基础样式：1px线条，自动填充步骤间空隙 */
  height: 1px;
  flex: 1; /* 关键：确保线条有宽度，不隐藏 */
  background: #ECEEF2; /* 未完成灰色 */
  
  /* 精准对齐逻辑：图标20px → 中心线在10px处；线条1px → 中心线在0.5px处 */
  position: relative;
  top: 10px; /* 线条顶部对齐图标顶部+10px（图标中心线高度） */
  transform: translateY(-50%); /* 线条向上偏移自身50%，实现中心线重合 */
  
  /* 避免线条与图标紧贴，保留小间距 */
  margin: 0 -30px;
}

/* 已完成分割线：蓝色 */
.line-completed {
  background: #1DA4B6;
}
</style>