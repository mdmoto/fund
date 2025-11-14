#!/bin/bash
# Cloudflare Worker 快速部署脚本

set -e

echo "=========================================="
echo "Cloudflare Worker 部署脚本"
echo "=========================================="
echo ""

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "请先安装: npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI 已安装"
echo ""

# 检查是否已登录
echo "检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  未登录 Cloudflare"
    echo "正在打开登录页面..."
    wrangler login
fi

echo "✅ 已登录 Cloudflare"
echo ""

# 部署 Worker
echo "开始部署 Worker..."
wrangler deploy

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "请复制上面的 Worker URL，然后："
echo "1. 打开 index.html"
echo "2. 找到 SOLSCAN_PROXY_URL 配置"
echo "3. 替换为你的 Worker URL"
echo "4. 提交并推送到 GitHub"
echo ""

