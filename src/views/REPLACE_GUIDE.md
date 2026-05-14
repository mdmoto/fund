# Maollar App 美化替换指南

## 替换路径（共 7 个文件）

| 输出文件 | 替换到项目路径 |
|---|---|
| `style.css` | `src/style.css` |
| `LoginView.vue` | `src/views/LoginView.vue` |
| `DashboardView.vue` | `src/views/DashboardView.vue` |
| `ExchangeView.vue` | `src/views/ExchangeView.vue` |
| `MarketView.vue` | `src/views/MarketView.vue` |
| `WalletView.vue` | `src/views/WalletView.vue` |
| `Sidebar.vue` | `src/components/Sidebar.vue` |

---

## 各文件核心改动

### style.css — 全局设计系统重建
- 引入 3 套字体：Syne（标题）/ DM Sans（正文）/ JetBrains Mono（数字/代码）
- 建立完整 CSS 变量体系（背景层次 bg-primary/secondary/card、品牌色 purple/teal/green/red/amber）
- 新增 `.stat-card` hover 时顶部渐变高光线
- 新增 `.mnemonic-grid`、`.info-row`、`.swap-box`、`.step-list` 等语义化组件类
- 新增 `.badge`、`.alert`、`.skeleton`、`.spin` 通用 UI 原语
- 完整工具类（flex/gap/mt/text/font/badge 等）

### LoginView.vue — 登录页重设计
- 新增：点阵 dot grid 背景 + 3个径向光晕（非图片，纯 CSS）
- 新增：入场动画 `fadeUp`（0.5s cubic-bezier）
- 新增：输入框左侧 SVG 图标，focus 时图标变紫色
- 新增：底部 token 信息 pill（显示 MAO 合约地址前8位 + Solana 网络）
- 新增：卡片顶部渐变装饰线（purple → teal）

### DashboardView.vue — 控制台
- 移除所有 inline style，全部换成 CSS 类
- milestone 进度条节点使用 `pulse-teal` 动效
- 统计卡片新增 `up/down` 颜色类
- 资产卡片金额使用渐变文字（text-primary → purple-light）
- 新增空状态 `empty-state` 样式

### ExchangeView.vue — 兑换页
- 移除所有 inline style
- swap 输入框 focus 时边框高亮
- 收款框使用 `badge-green` 风格边框
- 百分比快捷按钮使用 `.btn-outline` / `.btn-teal` 标准类
- 右侧信息面板使用 `.info-row` 统一行高和分隔线

### MarketView.vue — 市场页
- 移除所有 inline style
- 新增 `.tokenomics-grid` 三列布局
- token 信息列表使用 `.token-info-row` 组件类
- 里程碑表格使用 `.data-table` 标准表格样式

### WalletView.vue — 钱包页（改动最大）
**原来 20+ 处 inline style，全部清除**
- 新增三选项卡布局（Generate / Phantom / Recover）
- 选中卡片有顶部彩色高光线 + 阴影
- 面板切换添加 `panel-fade` 过渡动效（translateY + opacity）
- 断开按钮使用独立 `.btn-danger-outline` 类（红色）
- 助记词框使用 `.mnemonic-grid` 标准 4 列布局

### Sidebar.vue
- 新增 Solana Devnet 网络状态 pill（绿色脉冲点）
- 退出登录按钮从 `style=` 覆盖改为独立 `.nav-item-logout` 类
- hover 时退出按钮变红色，图标同步变色
- LanguageSwitcher 有专属 `.lang-switcher-wrap` 包裹间距

---

## 注意事项

1. `style.css` 是全局文件，直接覆盖即可，不需要 import（main.js 里已经有 `import './style.css'`）
2. 所有 Vue 文件的 `<script setup>` 逻辑**完全没有改动**，只改了 template 结构和 style 块
3. Google Fonts 需要网络访问，本地开发如果字体加载慢，可以先注释掉 `@import` 行
4. `WalletView.vue` 新增了第三个 tab（Recover），原来 Recover 是单独一个 card 在底部，现在整合进 tab 系统里，体验更统一
