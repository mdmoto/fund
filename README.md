# 喵乐商城实时数据展示

这是一个轻量级的实时数据展示页面，无需admin token即可访问商城统计数据和喵币链上信息。

## 功能特性

1. **商城统计数据 / 档位快照**
   - 当前喵币档位（手动配置）
   - 每 1 美金获得的喵币数量
   - 喵币价格（内在价值，来自档位表）
   - 二级市场交易溢价（Dexscreener 价格 ÷ 内在价格）
   - 总销售额（按照 10 万美金单位换算）
   - 基金池总金额 = 销售额 × 10%

2. **喵币 (MEOW) 信息**
   - 总供应量（Solscan）
   - 二级市场价格（Dexscreener）
   - 24小时交易量（Dexscreener）
   - 持仓排行榜 (Top 10)
   - 最近交易记录

## 后端接口

### 新增接口

**路径**: `/buyer/statistics/realtime`

**方法**: `GET`

**认证**: 无需token（已添加到ignored.urls）

**响应示例**:
```json
{
  "result": true,
  "message": "成功",
  "data": {
    "totalOrders": 1234,
    "totalMembers": 5678,
    "totalGoods": 9012,
    "todayOrderNum": 56,
    "todayOrderPrice": 12345.67,
    "totalSalesAmount": 987654.32,
    "totalPaymentOrders": 1000
  }
}
```

### 配置说明

接口已自动添加到 `buyer-api/src/main/resources/application.yml` 的 `ignored.urls` 列表中：

```yaml
ignored:
  urls:
    - /buyer/statistics/realtime/**
```

## 前端页面

### 文件位置

`/Users/adam/Desktop/11111/realtime-dashboard/index.html`

### 配置

在 `index.html` 中修改以下配置：

```javascript
// 后端实时统计接口（需替换为生产地址）
const API_BASE_URL = 'https://shop.maollar.com';

// Solscan 代理（Cloudflare Worker 部署后的地址）
const SOLSCAN_PROXY_URL = 'https://solscan-proxy.mdmoto.workers.dev';

// 喵币地址（已配置）
const MEOW_TOKEN_ADDRESS = '9zFnwrEyyNPVgahM5NL4MpUH7iy7L8qNCqRprzj39m9N';

// 档位快照（默认第 7 档，单位=10万美金）
const tierSnapshot = {
    level: 7,
    salesUnit: 21.0,
    fundUnit: 2.1,
    coinsPerDollar: 125,
    tierCoinTotal: 1000,
    cumulativeCoinTotal: 8000,
    intrinsicPrice: 0.0002625
};
```

### 部署

1. 将 `index.html` 上传到你的 Web 服务器（最终域名：`https://fund.maollar.com`）
2. 确保后端 API 地址可访问，并已允许该域名跨域
3. 如果跨域报错，请在 buyer-api（或 Nginx 代理层）中开放 `Access-Control-Allow-Origin`

### 自动刷新

页面每30秒自动刷新一次数据，也可以点击右下角的"刷新数据"按钮手动刷新。

## 数据来源

- **实时总销售额 / 基金池**：`GET ${API_BASE_URL}/buyer/statistics/realtime`
- **档位快照**：`index.html` 内部的 `tierSnapshot`（默认第 7 档，单位 10 万美金）
- **链上数据**: 暂未开放（持仓、供应等信息将在获取可靠 API Key 后恢复）
- **市场数据（价格、24h成交量、最近交易）**: Dexscreener Public API  
  `https://api.dexscreener.com/latest/dex/tokens/<mint>`

## 注意事项

1. Solscan API可能有请求频率限制，如遇到问题请适当增加刷新间隔
2. 价格数据需要从其他数据源获取（如DEX聚合器API），当前版本显示为"查询中..."
3. 确保后端服务正常运行且数据库连接正常

## 后续优化建议

1. 添加价格数据源（如Jupiter、Birdeye等Solana价格API）
2. 添加图表展示（使用Chart.js或ECharts）
3. 添加WebSocket实时推送
4. 添加数据缓存机制
5. 优化移动端显示

