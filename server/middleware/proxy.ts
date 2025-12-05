import { defineEventHandler, readBody, setResponseHeader } from 'h3';

export default defineEventHandler(async (event) => {
  // 仅在开发环境启用该本地代理
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { req, res } = event.node;
  const url = req.url || '';

  // 只代理以 /prod-api 开头的请求
  if (!url.startsWith('/prod-api')) {
    return;
  }

  // 目标主机（按需修改）
  const target = 'http://36.139.142.188:17504';

  // 去掉 /prod-api 前缀再拼接目标 URL
  // 例如：/prod-api/yp-resource/... -> /yp-resource/...
  const pathAfterPrefix = url.replace(/^\/prod-api/, '') || '/';
  const targetUrl = `${target}${pathAfterPrefix}`;

  // 请求方法
  const method = (req.method || 'GET').toUpperCase();

  // 读取请求 body（若有）
  let body: any = undefined;
  try {
    // readBody 会在没有 body 时返回 {}，做下保护
    const parsed = await readBody(event);
    if (parsed && Object.keys(parsed).length > 0) {
      body = parsed;
    }
  } catch (e) {
    body = undefined;
  }

  // 复制请求头并移除 host，保留其它头（可按需过滤）
  const headers: Record<string, string> = {};
  Object.entries(req.headers || {}).forEach(([k, v]) => {
    if (!k) return;
    const lower = k.toLowerCase();
    if (lower === 'host') return; // 让 fetch 使用目标 Host
    if (Array.isArray(v)) {
      headers[k] = v.join(',');
    } else if (v !== undefined) {
      headers[k] = String(v);
    }
  });

  // 如果 body 存在且没有 content-type，默认用 application/json
  if (body && !headers['content-type'] && !headers['Content-Type']) {
    headers['content-type'] = 'application/json';
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      // GET/HEAD 不应有 body
      body: ['GET', 'HEAD'].includes(method)
        ? undefined
        : (typeof body === 'string' || body instanceof Uint8Array ? body : JSON.stringify(body)),
      redirect: 'follow',
    };

    const resp = await fetch(targetUrl, fetchOptions);

    // 将后端响应状态原样返回
    res.statusCode = resp.status;

    // 转发关键响应头（至少 content-type）
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    setResponseHeader(event, 'content-type', contentType);

    // 返回响应体：如果是 JSON，解析为对象返回；否则返回文本
    const respText = await resp.text();
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(respText);
      } catch (e) {
        return respText;
      }
    } else {
      return respText;
    }
  } catch (err: any) {
    res.statusCode = 502;
    return {
      error: true,
      message: 'proxy error',
      detail: err?.message || String(err),
    };
  }
});