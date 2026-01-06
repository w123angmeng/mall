// middleware/auth.global.ts (全局生效，命名带 .global 后缀)
import { useUserStore } from '@/stores/user';
import { useCookie } from '#app';

export default defineNuxtRouteMiddleware((to, from) => {
  // 1. 仅在客户端执行（服务端无需校验 token）
  if (process.server) return;

  // 2. 定义路由白名单（无需 token 即可访问的页面）
  const WHITE_LIST = [
    '/', // 商城首页
    '/login', // 登录页
    '/register', // 注册页
	'/forgot-password', // 忘记密码
    '/select-auth', // 认证选择页
	'/verify-personal',
	'/verify-enterprise',
    '/product/:id', // 商品详情页（示例）
    '/category', // 分类页（示例）
    // 可根据实际需求添加更多白名单路由
  ];

  // 3. 初始化用户 Store 和 token Cookie（兜底）
  const userStore = useUserStore();
  const tokenCookie = useCookie('user_token'); // 兼容 Cookie 存储

  // 4. 校验当前路由是否在白名单中
  const isInWhiteList = WHITE_LIST.some((whiteRoute) => {
    // 处理动态路由匹配（如 /product/:id）
    if (whiteRoute.includes(':')) {
      const whiteRouteRegex = new RegExp(
        `^${whiteRoute.replace(/:\w+/g, '[^/]+')}$`
      );
      return whiteRouteRegex.test(to.path);
    }
    // 普通路由精确匹配
    return to.path === whiteRoute;
  });

  // 5. 白名单页面：直接放行
  if (isInWhiteList) {
    return;
  }

  // 6. 非白名单页面：校验 token 有效性
  const isValidToken = () => {
    // 优先级：Store 中的 token > Cookie 中的 token
    const token = userStore.token || tokenCookie.value;
    
    if (!token) return false; // 无 token 直接无效

    // 可选：校验 token 格式（如 JWT 校验）
    // if (!/^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/.test(token)) return false;

    // 可选：校验 token 过期时间（从 Store 中读取过期时间）
    // if (userStore.tokenExpire && new Date().getTime() > userStore.tokenExpire) {
    //   return false;
    // }

    return !!token; // 基础校验：有 token 即认为有效（严格校验可扩展）
  };

  // 7. token 无效：跳转到商城首页（/）
  if (!isValidToken()) {
    // 清除无效的 token 状态
    userStore.clearUserStorage();
    tokenCookie.value = '';

    // 避免无限重定向（如果已经在首页则不跳转）
    if (to.path !== '/') {
      return navigateTo('/');
    }
  }

  // 8. token 有效：正常放行
  return;
});