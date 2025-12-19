// server/middleware/proxy.ts
import { defineEventHandler, setResponseHeader, createError } from 'h3';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request, Response } from 'http';

// 适配 h3 的 proxy 处理函数
function h3ProxyHandler(event: any, options: any) {
  return new Promise((resolve, reject) => {
    const { req, res } = event.node;
    const proxy = createProxyMiddleware(options);

    // 重写 res.end 方法以支持 Promise
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      originalEnd.apply(res, args);
      resolve(null);
    };

    // 处理 proxy 错误
    proxy(req, res, (err: any) => {
      if (err) {
        reject(err);
      }
    });
  });
}

export default defineEventHandler(async (event) => {
  // 仅在开发环境启用代理
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { req, res } = event.node;
  const url = req.url || '';

  // 只代理 /prod-api 开头的请求
  if (!url.startsWith('/prod-api')) {
    return;
  }

  // 目标后端地址
  const target = 'http://36.139.142.188:17504';

  try {
    // 配置代理选项（核心：处理跨域 + 文件上传）
    await h3ProxyHandler(event, {
      target,
      changeOrigin: true, // 关键：修改请求头的 Host 为目标地址
      pathRewrite: {
        '^/prod-api': '', // 移除 /prod-api 前缀
      },
      // 禁用默认的 bodyParser，避免解析文件流
      parser: false,
      // 处理文件上传的流式传输
      onProxyReq: (proxyReq: any, req: Request) => {
        // 保留原始请求头（尤其是 multipart/form-data 相关）
        if (req.headers['content-type']?.includes('multipart/form-data')) {
          // 移除 content-length 由代理自动计算
          proxyReq.removeHeader('content-length');
        }
        // 传递 Authorization 等关键头
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      // 响应拦截：添加跨域头，转发后端响应头
      onProxyRes: (proxyRes: any, req: Request, res: Response) => {
        // 1. 强制添加跨域允许头（覆盖后端或补充缺失）
        const origin = req.headers.origin || '*';
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Accept,Origin,Range');
        
        // 2. 转发后端的响应头（如 content-type、set-cookie 等）
        Object.keys(proxyRes.headers).forEach((key) => {
          const value = proxyRes.headers[key];
          if (value) {
            res.setHeader(key, Array.isArray(value) ? value.join(',') : value);
          }
        });
      },
      // 超时配置：匹配前端60秒上传超时
      timeout: 60000,
      // 处理跨域预检请求（OPTIONS）
      onError: (err: Error, req: Request, res: Response) => {
        console.error('代理错误：', err);
        // 错误响应也必须加跨域头
        res.writeHead(502, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': req.headers.origin || '*',
          'Access-Control-Allow-Credentials': 'true',
        });
        res.end(JSON.stringify({
          code: 502,
          message: '代理请求失败',
          detail: err.message,
        }));
      },
    });
  } catch (err: any) {
    console.error('代理中间件异常：', err);
    // 兜底添加跨域头
    setResponseHeader(event, 'Access-Control-Allow-Origin', req.headers.origin || '*');
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true');
    throw createError({
      statusCode: 502,
      statusMessage: '代理请求失败',
      data: { detail: err.message },
    });
  }
});