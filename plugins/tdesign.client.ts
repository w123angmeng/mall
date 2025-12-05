import { defineNuxtPlugin } from '#app';
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

export default defineNuxtPlugin((nuxtApp) => {
  // 在客户端注册 TDesign
  nuxtApp.vueApp.use(TDesign);

  // 尝试从已注册的 Vue app 上读取 message 实例（许多组件库会把 message 挂到 app.config.globalProperties.$message）
  const message = nuxtApp.vueApp.config.globalProperties.$message;

  // 若存在则通过 Nuxt provide 注入，供 useNuxtApp().$message 使用
  if (message) {
    // 兼容 this.$message 的访问
    nuxtApp.vueApp.config.globalProperties.$message = message;
    return {
      provide: {
        message
      }
    };
  }

  // 未获取到 message 时，不抛错，保持容错
  return {};
});