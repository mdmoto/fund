/**
 * Cloudflare Worker - Solscan API 代理
 * 解决 CORS 问题，代理 Solscan v2 API 请求
 */

const SERVICE_CONFIG = {
  solscan: {
    baseUrl: 'https://api.solscan.io',
    needsAuth: true,
  },
  jupiter: {
    baseUrl: 'https://quote-api.jup.ag',
    needsAuth: false,
  },
};

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    
    // 只允许 GET 请求
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    try {
      // 从查询参数获取目标路径
      // 例如: /proxy?path=/v2/token/meta&address=9zFnwrEyyNPVgahM5NL4MpUH7iy7L8qNCqRprzj39m9N
      const service = url.searchParams.get('service') || 'solscan';
      const config = SERVICE_CONFIG[service];
      if (!config) {
        return new Response('Unsupported service', {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }

      const path = url.searchParams.get('path') || '';
      if (!path) {
        return new Response('Missing path parameter', { 
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      let upstreamUrl = `${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
      const passthrough = new URLSearchParams();
      url.searchParams.forEach((value, key) => {
        if (key !== 'path' && key !== 'service') {
          passthrough.set(key, value);
        }
      });
      if (passthrough.toString()) {
        upstreamUrl += `?${passthrough.toString()}`;
      }

      console.log(`[${service}] Proxying to:`, upstreamUrl);

      // 请求上游
      const headers = {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Maollar/1.0)',
      };

      if (service === 'solscan' && env && env.SOLSCAN_API_KEY) {
        headers.Authorization = `Bearer ${env.SOLSCAN_API_KEY}`;
      }

      const response = await fetch(upstreamUrl, {
        method: 'GET',
        headers,
        cf: {
          // Cloudflare 缓存配置
          cacheTtl: 30, // 缓存 30 秒
          cacheEverything: false,
        },
      });

      // 获取响应内容
      const contentType = response.headers.get('content-type') || 'application/json';
      const body = await response.text();

      // 返回响应，添加 CORS 头
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Cache-Control': 'public, max-age=30',
        },
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};

