// plugins/tdesign.ts
import { defineNuxtPlugin } from '#app';
import TDesign from 'tdesign-vue-next'; // 正确包名，无@tencent
// 导入TDesign全局样式（多端适配核心）
import 'tdesign-vue-next/es/style/index.css';
import '@/assets/css/common.css';

export default defineNuxtPlugin((nuxtApp) => {
  // 全局注册所有TDesign组件，无需按需引入（先保证能用）
  nuxtApp.vueApp.use(TDesign);
});