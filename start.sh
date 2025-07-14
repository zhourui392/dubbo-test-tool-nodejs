#!/bin/bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo -e "🔧 Dubbo测试工具 - Node.js Web版本"
echo -e "========================================${NC}"
echo

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未检测到Node.js${NC}"
    echo "请先安装Node.js: https://nodejs.org/"
    echo
    exit 1
fi

# 显示Node.js版本
echo -e "ℹ️  Node.js版本:"
node --version
echo

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: 未检测到npm${NC}"
    echo "npm应该随Node.js一起安装"
    echo
    exit 1
fi

# 检查是否存在package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 当前目录下未找到package.json文件${NC}"
    echo "请确保在项目根目录运行此脚本"
    echo
    exit 1
fi

# 检查node_modules是否存在，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 首次运行，正在安装依赖...${NC}"
    echo
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 依赖安装失败${NC}"
        echo
        exit 1
    fi
    echo
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
    echo
else
    echo -e "${GREEN}📦 依赖已安装，跳过安装步骤${NC}"
    echo
fi

# 检查示例数据
if [ ! -f "interfaces.json" ]; then
    if [ -f "demo-interfaces.json" ]; then
        echo -e "${YELLOW}📋 检测到示例数据，正在复制...${NC}"
        cp "demo-interfaces.json" "interfaces.json"
        echo -e "${GREEN}✅ 示例数据已加载${NC}"
        echo
    fi
fi

# 设置端口（如果未设置）
if [ -z "$PORT" ]; then
    PORT=3000
fi

echo -e "${BLUE}🎭 启动选项:${NC}"
echo "1. 仅启动Web服务 (需要真实Dubbo服务)"
echo "2. 启动Web服务 + 模拟Dubbo服务 (推荐用于测试)"
echo
read -p "请选择 (1/2) [默认:2]: " choice
choice=${choice:-2}

if [ "$choice" = "1" ]; then
    echo
    echo -e "${GREEN}🚀 正在启动Dubbo测试工具...${NC}"
    echo -e "📱 访问地址: http://localhost:$PORT"
    echo -e "🛠️  API端点: http://localhost:$PORT/api"
    echo
    echo -e "${YELLOW}⚠️  注意: 请确保目标Dubbo服务已启动${NC}"
    echo -e "💡 按 Ctrl+C 可停止服务"
    echo -e "${BLUE}========================================${NC}"
    echo
    npm start
else
    echo
    echo -e "${GREEN}🚀 正在启动Dubbo测试工具 + 模拟服务...${NC}"
    echo -e "📱 访问地址: http://localhost:$PORT"
    echo -e "🛠️  API端点: http://localhost:$PORT/api"
    echo -e "🎭 模拟Dubbo服务: 20880, 20881, 20882"
    echo
    echo -e "${YELLOW}⚠️  注意: 请保持此终端打开以维持服务运行${NC}"
    echo -e "💡 按 Ctrl+C 可停止所有服务"
    echo -e "🎯 模拟服务将返回示例响应数据"
    echo -e "${BLUE}========================================${NC}"
    echo
    
    # 检查是否安装了concurrently
    if ! npm list concurrently &> /dev/null; then
        echo -e "${YELLOW}📦 安装并发运行工具...${NC}"
        npm install concurrently --save-dev
    fi
    
    # 启动Web服务和模拟Dubbo服务
    npm run dev-with-mock
fi

# 如果服务意外停止
echo
echo -e "${YELLOW}⚠️  服务已停止${NC}"