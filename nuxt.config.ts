// nuxt.config.ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// 1. 插件优先加载（确保 pinia 插件比页面先执行）
	alias: {
	    '~': process.cwd(),
	    '@': process.cwd()
	  },
	plugins: ['~/plugins/pinia.ts'],
  pinia: {
      autoImports: false, // 禁用自动导入，避免版本兼容问题
    },
  // 1. 基础配置
  devtools: { enabled: true }, // 开启Nuxt开发者工具（调试用）
  // 运行时配置：区分客户端和服务端变量
    runtimeConfig: {
      // 私有变量（仅服务端可访问，无public前缀）
      // 会自动从对应.env文件读取PRIVATE_开头的变量
      privateApiKey: process.env.PRIVATE_DEV_API_KEY || process.env.PRIVATE_TEST_API_KEY || process.env.PRIVATE_PROD_API_KEY,
  
      // 公开变量（客户端+服务端可访问，需放在public对象中）
      public: {
        apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/prod-api', // 接口基础地址
        env: process.env.NUXT_PUBLIC_ENV, // 环境标记
        requestTimeout: Number(process.env.NUXT_PUBLIC_REQUEST_TIMEOUT) || 10000, // 超时时间（默认10秒）
      },
    },
	// 开发时推荐使用 vite proxy 避免跨域问题（可选）
	  // 如果你想在开发环境用相对路径请求并由本地 dev server 转发到后端，打开下面 proxy 配置
	  // vite: {
	  //   server: {
	  //     proxy: {
	  //       // 将以 /yp-resource 开头的请求转发到后端，避免浏览器 CORS
	  //       '/prod-api': {
	  //         // target: 'http://36.139.142.121:888',
			//   target: 'https://yicaituan.com.cn',
	  //         changeOrigin: true,
	  //         secure: false,
	  //         // 如果后端路径需要保留 /yp-resource 前缀，则无需 rewrite；否则可以调整
	  //         // rewrite: (path) => path.replace(/^\/yp-resource/, '/yp-resource')
	  //       },
	  //     },
	  //   },
	  // },
  components: {
      dirs: ['~/components/common']
    },
  ssr: true, // 开启SSR（商城SEO核心）
  // 新增端口配置
	server: {
      port: 3001, // 固定端口为 3001
      host: 'localhost'  // 可选：允许局域网其他设备访问（如手机测试）
    },
  fonts: {
      google: false // 禁用 Google 字体，消除警告
  },
  // 2. 全局样式（你的common.css后续放这里）
  css: [
    // 先引入TDesign样式，再引入自定义样式（保证优先级）
    'tdesign-vue-next/es/style/index.css',
    // 预留你的通用样式（后续创建assets/css/common.css后取消注释）
    // '@/assets/css/common.css'
  ],

  // 3. 构建配置（解决TDesign SSR兼容问题）
  build: {
    transpile: ['tdesign-vue-next'],
  },

  // 4. 官方模块配置（之前选的SEO/图片等）
  modules: [
	// '@nuxtseo/kit',
    // 'nuxt-seo-kit',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
	'@tdesign-vue-next/nuxt',
	'@pinia/nuxt',
    // 'vue-schema-org/nuxt'
  ],
  tdesign: {
      prefix: 'T', // 组件前缀，对应模板中的 <t-input> 等
      importStyle: 'scss', // 样式导入方式
      components: ['Input', 'Button', 'Checkbox', 'Loading', 'Message'], // 按需引入组件（可选）
    },
  // 5. SEO基础配置（商城必备）
  seo: {
    siteName: '严牌商城',
    canonicalUrl: 'https://www.yanpai-mall.com', // 替换为你的域名
    trailingSlash: false,
  },

  // 6. 图片优化配置（商城商品图适配）
  image: {
    screens: {
      mobile: 768, // 移动端断点
      pc: 1200,    // PC端断点
    },
    domains: ['picsum.photos'], // 允许加载的图片域名（测试用）
  },

  // 7. 关闭不必要的配置（避冲突）
  components: true, // 恢复Nuxt默认组件自动导入
  vite: {}, // 清空Vite复杂配置（避免resolver报错）
  compatibilityDate: '2025-11-26',
});