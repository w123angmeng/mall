// plugins/pinia.ts
import { defineNuxtPlugin } from '#app'
import { createPinia } from 'pinia' // 手动创建 Pinia 实例

export default defineNuxtPlugin((nuxtApp) => {
  // 核心：手动执行 app.use(pinia)（nuxtApp.vueApp 就是 Vue 应用实例 app）
  const pinia = createPinia()
  nuxtApp.vueApp.use(pinia) // 这就是 Nuxt 中对应的 app.use(pinia)
  // 把 pinia 实例暴露出去，确保全局可用
  nuxtApp.provide('pinia', pinia)
})