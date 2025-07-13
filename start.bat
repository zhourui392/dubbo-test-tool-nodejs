@echo off
chcp 65001 >nul
title Dubbo测试工具 - Node.js Web版本

echo.
echo ========================================
echo 🔧 Dubbo测试工具 - Node.js Web版本
echo ========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 显示Node.js版本
echo ℹ️  Node.js版本:
node --version
echo.

REM 检查npm是否可用
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到npm
    echo npm应该随Node.js一起安装
    echo.
    pause
    exit /b 1
)

REM 检查是否存在package.json
if not exist "package.json" (
    echo ❌ 错误: 当前目录下未找到package.json文件
    echo 请确保在项目根目录运行此脚本
    echo.
    pause
    exit /b 1
)

REM 检查node_modules是否存在，如果不存在则安装依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        echo.
        pause
        exit /b 1
    )
    echo.
    echo ✅ 依赖安装完成
    echo.
) else (
    echo 📦 依赖已安装，跳过安装步骤
    echo.
)

REM 检查示例数据
if not exist "interfaces.json" (
    if exist "demo-interfaces.json" (
        echo 📋 检测到示例数据，正在复制...
        copy "demo-interfaces.json" "interfaces.json" >nul
        echo ✅ 示例数据已加载
        echo.
    )
)

REM 设置端口（如果未设置）
if "%PORT%"=="" set PORT=3000

echo 🚀 正在启动Dubbo测试工具...
echo 📱 访问地址: http://localhost:%PORT%
echo 🛠️  API端点: http://localhost:%PORT%/api
echo.
echo ⚠️  注意: 请保持此窗口打开以维持服务运行
echo 💡 按 Ctrl+C 可停止服务
echo ========================================
echo.

REM 启动服务
npm start

REM 如果服务意外停止
echo.
echo ⚠️  服务已停止
pause