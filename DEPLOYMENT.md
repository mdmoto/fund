# Cloudflare Worker 部署指南

## 步骤 1: 部署 Solscan 代理 Worker

### 1.1 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或者
npm install wrangler --save-dev
```

### 1.2 登录 Cloudflare

```bash
wrangler login
```

### 1.3 配置 Solscan API Key（必填）

Solscan v2 需要 Bearer Token，使用 Cloudflare Secret 方式保存：

```bash
wrangler secret put SOLSCAN_API_KEY
# 粘贴从 Solscan 获取的 token
```

### 1.4 部署 Worker

在 `realtime-dashboard` 目录下执行：

```bash
wrangler deploy
```

部署成功后，你会看到类似这样的输出：
```
✨  Deployed to https://solscan-proxy.your-account.workers.dev
```

### 1.5 记录 Worker URL

复制部署后的 Worker URL，例如：
- `https://solscan-proxy.your-account.workers.dev`
- 或者自定义域名（如果配置了）

## 步骤 2: 更新前端配置

### 2.1 更新 `index.html` 中的 Worker URL

打开 `index.html`，找到这一行：

```javascript
const SOLSCAN_PROXY_URL = 'https://solscan-proxy.your-account.workers.dev';
```

替换为你的实际 Worker URL。

### 2.2 提交并推送更改

```bash
git add index.html
git commit -m "更新 Worker 代理地址"
git push
```

## 步骤 3: 配置后端 CORS（可选）

如果你的后端 API (`https://shop.maollar.com/buyer/statistics/realtime`) 也需要从 `fund.maollar.com` 访问，需要在后端配置 CORS。

### Spring Boot 配置示例

在 `buyer-api` 的配置类中添加：

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/buyer/statistics/realtime/**")
                .allowedOrigins("https://fund.maollar.com", "https://fund-1oj.pages.dev")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
```

## 步骤 4: 测试

1. 访问 `https://fund-1oj.pages.dev` 或 `https://fund.maollar.com`
2. 打开浏览器开发者工具（F12）
3. 查看 Console 标签，确认没有 CORS 错误
4. 检查 Network 标签，确认 API 请求成功

## 故障排查

### Worker 返回 500 错误

- 检查 Worker 日志：`wrangler tail`
- 确认 Solscan API 是否可访问
- 检查 Worker 代码是否有语法错误

### 前端仍然显示 CORS 错误

- 确认 `SOLSCAN_PROXY_URL` 已正确更新
- 清除浏览器缓存
- 检查 Worker 是否正常部署：访问 `https://your-worker.workers.dev?path=/v2/token/meta&address=9zFnwrEyyNPVgahM5NL4MpUH7iy7L8qNCqRprzj39m9N`

### 后端 API 返回 HTML 而不是 JSON

- 确认后端服务正常运行
- 检查 Nginx/Cloudflare 配置，确保请求正确转发到后端
- 确认 `/buyer/statistics/realtime` 路径在 `ignored.urls` 中

## 自定义域名（可选）

如果你想使用自定义域名（如 `api.fund.maollar.com`），可以在 Cloudflare Dashboard 中配置：

1. 进入 Workers & Pages
2. 选择你的 Worker
3. 进入 Settings > Triggers
4. 添加 Custom Domain

然后在 `index.html` 中使用自定义域名即可。

